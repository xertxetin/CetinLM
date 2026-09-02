# CetinLM-1B — SDPA Backend & Profiler Optimization Study

**Date:** 2026-08-30  
**Project:** CetinLM  
**Scope:** Single-GPU training performance investigation  
**Hardware:** NVIDIA GeForce RTX 4070 Ti SUPER 16 GB  
**Software:** PyTorch 2.11.0 + CUDA 12.8 + cuDNN 9.19  
**Training configuration:** Batch 8 × Gradient Accumulation 4 × Sequence Length 256 = 8,192 tokens / optimizer step

---

## 1. Why this experiment was run

After reaching a stable single-GPU training configuration at roughly **5.6K tokens/s** in normal training, the next question was whether there were still hidden bottlenecks inside the training step.

Instead of making speculative code changes, we profiled the real training workload and then tested each promising optimization candidate using controlled A/B experiments.

The goal was simple:

> Improve throughput without changing the effective batch size, optimizer, learning-rate schedule, model architecture, training data, or checkpoint state.

The experiment also had a strict rollback rule:

> If an optimization did not produce a measurable throughput gain while preserving numerically healthy loss and gradient behavior, it would not be merged into the main training build.

---

## 2. Baseline

The known-good training configuration was:

| Setting | Value |
|---|---:|
| Model parameters | ~1.049B |
| Batch size | 8 |
| Gradient accumulation | 4 |
| Sequence length | 256 |
| Effective tokens / optimizer step | 8,192 |
| Precision | BF16 |
| Optimizer | AdamW8bit |
| Attention | PyTorch SDPA, native GQA |
| Query heads | 28 |
| KV heads | 7 |
| Gradient checkpointing | Enabled |
| Normal training throughput | ~5.6K tokens/s |

The model was trained from the same checkpoint for all controlled backend experiments.

At the time of profiling:

- Checkpoint step: **42,138**
- Processed tokens: **345,194,496**
- Best validation loss: **3.866541**

---

## 3. Profiler results

Two profiler runs were performed.

### P01

Main profiler observations:

| Operation | Observation |
|---|---:|
| `aten::mm` | ~47.5% self CUDA |
| `aten::_scaled_dot_product_attention_math` | 480 calls |
| `aten::copy_` | 24,135 calls |
| `aten::mul` | 14,283 calls |
| `aten::add_` | 5,274 calls |
| AdamW8bit optimizer | ~3.4% self CUDA |
| Gradient clipping | ~1.3% self CUDA |
| DataLoader | negligible |

The most interesting signal was:

```text
aten::_scaled_dot_product_attention_math
```

The model was configured with GQA and a `use_flash_attention=True` flag, but the profiler showed that all training attention calls were using the **Math SDPA backend**.

The call count was also internally consistent:

```text
20 transformer layers
× 4 microsteps
× 3 profiled optimizer steps
× 2 (forward + checkpoint recompute)
= 480 attention calls
```

This strongly indicated that the math backend was being used for every attention invocation.

### P02

A second profiler run was used to validate the first result.

It reproduced the same core counts:

- `aten::_scaled_dot_product_attention_math`: **480 calls**
- `aten::copy_`: **24,135 calls**
- `aten::mm`: **6,756 calls**

This confirmed that the P01 result was not a profiler artifact.

---

## 4. Important implementation finding

The model configuration contained:

```python
use_flash_attention=True
```

However, the attention implementation did not explicitly consume this flag to force a specific backend.

Instead, it called:

```python
torch.nn.functional.scaled_dot_product_attention(...)
```

with native GQA:

```python
enable_gqa=True
```

Therefore the real behavior was:

```text
Model requests SDPA
        ↓
PyTorch selects an available backend
        ↓
Math backend is selected
```

So the configuration flag itself did not guarantee that Flash Attention was actually active.

---

## 5. SDPA backend capability diagnostic

A dedicated backend diagnostic was run using the model's real attention geometry:

```text
Batch: 8
Q heads: 28
KV heads: 7
Sequence length: 256
Head dimension: 64
Precision: BF16
```

Results:

| Backend | 28Q / 28KV | Native 28Q / 7KV GQA |
|---|---|---|
| Flash Attention | FAIL | FAIL |
| Efficient Attention | PASS | FAIL |
| cuDNN Attention | PASS | PASS |
| Math | PASS | PASS |

The environment reported:

```text
Flash built: False
```

Therefore native Flash Attention was not available in this PyTorch build.

This immediately ruled out simply "turning on Flash Attention".

cuDNN Attention, however, successfully supported the real native GQA shape, so it became the first A/B candidate.

---

# 6. Controlled training A/B experiments

Every experiment used the same principles:

- same checkpoint
- same optimizer state
- same learning rate
- same model weights
- same batch size
- same gradient accumulation
- same sequence length
- same effective 8,192 tokens / step
- deterministic batch ordering
- no checkpoint writes
- multiple warmup steps before measurement

Loss and gradient values were also compared to detect numerical instability.

---

## 6.1 AB01 — Math SDPA vs cuDNN SDPA

### Math SDPA

```text
Throughput : 4,827 tok/s
Step time  : 1.6970 s
Mean loss  : 3.91499
Mean grad  : 2.16337
Peak alloc : 13.21 GB
```

### cuDNN SDPA

```text
Throughput : 1,519 tok/s
Step time  : 5.3933 s
Mean loss  : 3.91501
Mean grad  : 2.16324
Peak alloc : 13.23 GB
```

### Result

```text
Speed ratio     : 0.315x
Performance     : -68.54%
Loss delta      : +0.000017
Gradient delta  : -0.000131
```

### Decision

**Rejected.**

The cuDNN backend was numerically healthy but dramatically slower for this exact model shape and training configuration.

---

## 6.2 AB02 — Math SDPA FP32 reductions vs BF16 reductions

The profiler showed a large number of `copy_`, `to`, and `_to_copy` operations.

A hypothesis was tested: allowing BF16 reductions inside Math SDPA might reduce some conversion overhead.

### Current Math behavior

```text
Throughput : 5,303 tok/s
Step time  : 1.5449 s
Mean loss  : 3.91499
Mean grad  : 2.16337
Peak alloc : 13.21 GB
```

### BF16 Math reductions enabled

```text
Throughput : 2,928 tok/s
Step time  : 2.7982 s
Mean loss  : 3.91488
Mean grad  : 2.16316
Peak alloc : 13.23 GB
```

### Result

```text
Speed ratio     : 0.552x
Performance     : -44.79%
Loss delta      : -0.000110
Gradient delta  : -0.000209
Peak alloc delta: +0.024 GB
```

### Decision

**Rejected.**

Allowing BF16 reductions significantly reduced performance on this GPU / PyTorch / tensor-shape combination.

The default precision behavior remains enabled.

---

## 6.3 AB03 — Native Math GQA vs Efficient Attention with explicit KV expansion

Efficient Attention did not support native 28Q / 7KV GQA in this environment.

However, it did support a 28Q / 28KV shape.

A controlled experiment explicitly expanded the 7 KV heads to 28 using `repeat_interleave`, then disabled native GQA and forced the Efficient Attention backend.

### Math + native GQA

```text
Throughput : 4,226 tok/s
Step time  : 1.9384 s
Mean loss  : 3.91499
Mean grad  : 2.16337
Peak alloc : 13.21 GB
```

### Efficient Attention + explicit KV expansion

```text
Throughput : 2,187 tok/s
Step time  : 3.7451 s
Mean loss  : 3.91505
Mean grad  : 2.16341
Peak alloc : 13.25 GB
```

### Result

```text
Speed ratio     : 0.518x
Performance     : -48.24%
Loss delta      : +0.000055
Gradient delta  : +0.000036
Peak alloc delta: +0.035 GB
```

### Decision

**Rejected.**

The cost of explicit KV expansion plus the backend behavior made this path much slower than native Math GQA.

---

# 7. Final backend ranking

For this exact environment:

| Candidate | Result |
|---|---|
| Native Math SDPA + GQA | **WINNER** |
| Flash Attention | Unavailable in current build |
| cuDNN native GQA | -68.54% |
| Math with BF16 reductions | -44.79% |
| Efficient + expanded KV | -48.24% |

The initially suspicious Math SDPA backend turned out to be the **best available implementation for this workload**.

---

# 8. What the profiler ruled out

The experiment also prevented time from being wasted on several low-value targets.

### Data loading

DataLoader CPU time was negligible.

Conclusion:

> Increasing DataLoader workers is not a meaningful optimization target for this workload.

### Optimizer

AdamW8bit represented only a small fraction of total CUDA time.

Conclusion:

> Changing the optimizer purely for speed is not justified by the profile.

### Gradient clipping

Gradient clipping was also a relatively small part of the step.

Profiler output showed foreach operations already being used.

Conclusion:

> Explicitly forcing `foreach=True` is unlikely to provide meaningful gains.

### Host-to-device transfer

The data pipeline did not appear to be starving the GPU.

Conclusion:

> Complex CUDA prefetch logic is not currently justified.

---

# 9. Remaining major optimization target

After eliminating attention backend alternatives, the clearest remaining candidate is:

## Activation checkpoint recomputation

Every transformer block is activation-checkpointed.

During backward, checkpointed transformer blocks are recomputed, which explains the doubled attention call count:

```text
240 normal forward attention calls
+
240 recompute attention calls
=
480 total
```

This is a real compute cost, but it is also what allows the current batch size to fit within 16 GB VRAM.

Therefore the next optimization study, if needed, should not blindly disable checkpointing.

A safer future experiment would compare:

```text
Current:
Batch 8 × Grad Accum 4
Full block checkpointing

versus

Candidate:
Batch 4 × Grad Accum 8
Selective / partial activation checkpointing
```

Both configurations would preserve:

```text
8,192 effective tokens / optimizer step
```

The question would be whether reduced recomputation can compensate for the smaller microbatch.

This experiment was intentionally **not** performed during the current study.

---

# 10. Final engineering decision

No changes were made to the main training configuration.

The known-good configuration remains:

```text
Batch size       : 8
Gradient accum   : 4
Sequence length  : 256
Effective tokens : 8,192 / optimizer step
Precision        : BF16
Attention        : PyTorch Math SDPA
GQA              : Native 28Q / 7KV
Optimizer        : AdamW8bit
Checkpointing    : Full transformer-block checkpointing
```

Normal training continues at approximately:

```text
~5.6K tokens/s
```

The benchmark scripts report lower absolute throughput because they intentionally add synchronization, backend forcing, model reloads, and controlled experimental overhead.

The important metric in those tests is the **relative A/B difference**, not direct comparison against the normal training loop.

---

# 11. Why a "no change" result is still valuable

Performance engineering is not only about finding faster code.

A strong experiment can also prove that an apparently suspicious implementation is already the best available choice.

Before this study, the following questions were open:

- Is Flash Attention actually active?
- Is Math SDPA an accidental slow fallback?
- Would cuDNN Attention be faster?
- Would Efficient Attention be faster?
- Would lower-precision Math reductions improve throughput?
- Is data loading the bottleneck?
- Is optimizer overhead significant?

After the study, all of those questions have concrete answers.

The result is not "nothing changed."

The result is:

> The current attention path survived multiple controlled alternatives and is now empirically validated as the best available backend for the present hardware and software stack.

That makes the main training configuration more trustworthy and reduces future optimization guesswork.

---

# 12. Engineering principle

This study reinforced a useful rule for CetinLM development:

> **Profile first. Hypothesize second. A/B test third. Merge only if the measurement wins.**

A theoretically faster kernel is not necessarily faster for every GPU, sequence length, batch size, GQA layout, operating system, or PyTorch build.

Real measurements decide.

---

## Experiment summary

```text
Profiler
    ↓
Math SDPA discovered
    ↓
Backend capability diagnostic
    ↓
Flash unavailable
    ↓
cuDNN tested        → rejected
    ↓
BF16 reductions     → rejected
    ↓
Efficient + KV copy → rejected
    ↓
Native Math GQA retained
```

**Final status:** Main training continues unchanged.
