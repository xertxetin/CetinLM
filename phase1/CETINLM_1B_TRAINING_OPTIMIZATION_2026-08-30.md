# CetinLM-1B — Training Optimization Engineering Log

**Date:** 2026-08-30  
**Status:** Public engineering note  
**Hardware:** NVIDIA GeForce RTX 4070 Ti SUPER 16 GB  
**Project:** CetinLM-1B  
**Training stack:** Custom PyTorch training pipeline, built from scratch

---

## 1. Why this document exists

This note records a real optimization session on the CetinLM-1B pretraining stack.

The goal was simple:

> Increase training throughput and GPU utilization **without changing the model's learning objective or effective tokens per optimizer step**.

The session was intentionally empirical. We changed one major variable at a time, measured throughput, checked VRAM behavior, monitored training loss / gradient norms, and validated the model to make sure the speedup was not hiding a quality regression.

The result was a major improvement in GPU efficiency and training throughput, while keeping the same effective training batch.

---

## 2. Model and training context

Current CetinLM-1B configuration:

| Item | Value |
|---|---:|
| Parameters | 1,048,780,544 (~1.049B) |
| Vocabulary | 65,536 |
| Hidden size | 1,792 |
| Layers | 20 |
| Attention heads | 28 |
| KV heads | 7 |
| Intermediate size | 7,168 |
| Config max context | 4,096 |
| Current train sequence length | 256 |
| Precision | BF16 |
| Optimizer | bitsandbytes AdamW8bit |
| Gradient checkpointing | Enabled |
| Flash Attention | Enabled |
| TF32 | Enabled where applicable |
| Gradient clipping | 1.0 |
| Weight decay | 0.1 |
| LR | 2e-4 peak, cosine decay |
| Initial token target | 1,000,000,000 |

The training loop uses gradient accumulation so that the **effective number of tokens per optimizer step** stays fixed:

```text
BATCH_SIZE × GRAD_ACCUM_STEPS × SEQ_LEN
```

The target was kept at:

```text
8,192 tokens / optimizer step
```

This invariant became the key to safely exploring larger physical batches.

---

## 3. Baseline

Original training configuration:

```python
BATCH_SIZE = 1
GRAD_ACCUM_STEPS = 32
SEQ_LEN = 256
```

Effective tokens per optimizer step:

```text
1 × 32 × 256 = 8,192
```

Observed throughput was roughly:

```text
~1,900–2,100 tok/s
```

GPU utilization was highly variable and often dropped sharply between operations.

Example pattern:

```text
22% → 99% → 75% → 50% → 99% → 45% → ...
```

The training was stable, but the GPU was clearly not being used as efficiently as possible.

---

## 4. Key optimization idea: increase physical batch, reduce accumulation

Instead of changing the effective batch, we redistributed the exact same 32 sequences per optimizer step.

### Experiment A — 2 × 16

```python
BATCH_SIZE = 2
GRAD_ACCUM_STEPS = 16
```

Still:

```text
2 × 16 × 256 = 8,192 tokens / optimizer step
```

Observed throughput:

```text
~3,700–3,870 tok/s
```

This was the first major result.

Compared with the original configuration, throughput increased by roughly **75–90%** depending on the exact baseline sample.

No structural training change was introduced:

- same effective tokens/update
- same sequence length
- same optimizer
- same LR schedule
- same training objective

---

## 5. Validation batch-size bug discovered

When the training batch was changed from `1` to `2`, the validation loader was still using the same `BATCH_SIZE` variable.

That silently changed the validation workload.

Previously:

```text
25 eval batches × batch 1 × 256
= 6,400 validation tokens
```

After the training batch change:

```text
25 eval batches × batch 2 × 256
= 12,800 validation tokens
```

A validation result around:

```text
Val Loss 4.052628
PPL 57.548
```

was therefore **not directly comparable** with previous validation runs.

### Fix

Validation received its own explicit batch size:

```python
BATCH_SIZE = 2
VAL_BATCH_SIZE = 1
GRAD_ACCUM_STEPS = 16
```

And:

```python
train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    ...
)

val_loader = DataLoader(
    val_dataset,
    batch_size=VAL_BATCH_SIZE,
    ...
)
```

This restored historical comparability.

### Lesson

Training and evaluation batch sizes should be separate configuration values even when they initially happen to be equal.

---

## 6. Experiment B — 4 × 8

Next configuration:

```python
BATCH_SIZE = 4
VAL_BATCH_SIZE = 1
GRAD_ACCUM_STEPS = 8
```

Effective tokens/update remained unchanged:

```text
4 × 8 × 256 = 8,192
```

Observed throughput:

```text
~4,700–5,100 tok/s
```

GPU utilization also improved dramatically and became much more stable:

```text
~98–100%
```

Validation:

```text
Step 37,000
Val Loss 3.922671
PPL 50.535
```

Previous best remained around:

```text
Val Loss 3.915522
```

The difference was small and within the normal observed validation fluctuation.

This was strong evidence that the speedup was not coming from a broken training path.

---

## 7. Experiment C — 16 × 2: VRAM limit found

We intentionally tested a more aggressive configuration:

```python
BATCH_SIZE = 16
VAL_BATCH_SIZE = 1
GRAD_ACCUM_STEPS = 2
```

Again:

```text
16 × 2 × 256 = 8,192
```

However, this configuration exceeded practical VRAM limits on the 16 GB card.

Observed behavior:

- VRAM pressure reached the limit
- throughput degraded
- configuration was not viable

This established an upper boundary for the current model / sequence length / activation-checkpointing combination.

### Important lesson

Larger physical batch is only beneficial while it increases hardware efficiency **without pushing the system into memory pressure or allocation instability**.

---

## 8. Experiment D — 8 × 4: current sweet spot

The intermediate configuration:

```python
BATCH_SIZE = 8
VAL_BATCH_SIZE = 1
GRAD_ACCUM_STEPS = 4
```

Effective tokens/update:

```text
8 × 4 × 256 = 8,192
```

Observed VRAM:

```text
~15.4 GB
```

Observed GPU utilization:

```text
~99–100%
```

Observed throughput:

```text
~5,400–5,620 tok/s
```

This became the best practical configuration tested.

Representative log:

```text
Step 0037055 | Tok/s 5,610
Step 0037056 | Tok/s 5,607
Step 0037057 | Tok/s 5,594
Step 0037058 | Tok/s 5,599
Step 0037059 | Tok/s 5,615
```

Validation remained healthy:

```text
Step 37,500
Val Loss 3.922552
PPL 50.529
```

---

## 9. DataLoader experiment: no useful gain on this workload

A separate experiment tested:

```python
NUM_WORKERS = 2
PIN_MEMORY = True
```

with:

```python
persistent_workers=True
prefetch_factor=2
```

### Result

No meaningful throughput improvement was observed.

Throughput remained roughly in the same range as before the DataLoader change.

Additionally, on Windows, interrupting the run with `Ctrl+C` caused worker-process errors such as:

```text
RuntimeError: DataLoader worker exited unexpectedly
```

The model checkpoint itself was not corrupted, but the shutdown path became unnecessarily noisy and less reliable.

### Decision

Reverted to:

```python
NUM_WORKERS = 0
PIN_MEMORY = True
```

For the current memory-mapped dataset and workload, CPU data loading was not the primary bottleneck.

### Lesson

More workers are not automatically faster. Measure first.

---

## 10. Training-loop synchronization cleanup

After the batch optimization, the training loop was inspected for unnecessary CUDA → CPU synchronization.

The original loop performed operations such as:

```python
if not torch.isfinite(loss):
    ...

raw_loss = float(loss.detach().item())
```

inside every microstep.

Calling `.item()` on a CUDA tensor forces the CPU to wait for the relevant GPU work to complete.

With gradient accumulation, this can create repeated synchronization points.

### Build 02 change

Instead of synchronizing every microstep, loss statistics were accumulated on the GPU and transferred to the CPU once per optimizer step.

The same idea was applied to diagnostic handling of gradient norm.

Conceptually:

```python
accumulated_loss = torch.zeros(
    (),
    device=DEVICE,
    dtype=torch.float32,
)

for micro_step in range(GRAD_ACCUM_STEPS):
    ...
    accumulated_loss += loss.detach().float()

    (
        loss / GRAD_ACCUM_STEPS
    ).backward()
```

Then once per optimizer step:

```python
mean_loss = accumulated_loss / GRAD_ACCUM_STEPS
```

The diagnostic values are transferred once, checked for finite values, and logged.

### Result

Throughput became extremely stable around:

```text
~5,600–5,620 tok/s
```

Representative Build 02 output:

```text
5,612
5,616
5,605
5,610
5,619
5,609
5,610
5,611
5,612
```

The improvement was especially visible in **consistency**. Short throughput drops became much less frequent.

---

## 11. Build numbering introduced

To make future experiments easier to track, the training script now uses simple build identifiers.

Current convention:

```text
Build 01
    Stable pre-optimization reference

Build 02
    8×4 physical/accumulation configuration
    separate validation batch
    sync-cleaned training loop
    current stable version
```

Future performance experiments should receive a new build number rather than silently modifying the known-good version.

---

## 12. Evaluation vs checkpoint frequency

Evaluation and checkpointing do not need to happen at the same interval.

Current preferred policy:

```python
EVAL_INTERVAL = 1000
SAVE_INTERVAL = 500
```

Why?

`SAVE_INTERVAL = 500` keeps recovery reasonably safe if the machine crashes or power is lost.

`EVAL_INTERVAL = 1000` avoids running validation twice as often as needed for current trend monitoring.

This optimization does **not** change model learning. It only reduces evaluation overhead.

---

## 13. Validation results after the optimization

Recent comparable validation results:

| Step | Val Loss | PPL |
|---:|---:|---:|
| 37,000 | 3.922671 | 50.535 |
| 37,500 | 3.922552 | 50.529 |
| 38,000 | 3.933035 | 51.062 |
| 39,000 | 3.927871 | 50.799 |

Historical best during this period:

```text
Best Val Loss: 3.915522
```

The values fluctuate slightly, as expected, but there is no sign that the throughput optimization caused a validation collapse.

Training loss and gradient norms also remain in their previous healthy ranges.

---

## 14. Throughput summary

Approximate observed results:

| Configuration | Effective tokens/update | Throughput | Result |
|---|---:|---:|---|
| `1 × 32` | 8,192 | ~1.9–2.1k tok/s | Baseline |
| `2 × 16` | 8,192 | ~3.7–3.9k tok/s | Major improvement |
| `4 × 8` | 8,192 | ~4.7–5.1k tok/s | GPU utilization ~99% |
| `8 × 4` | 8,192 | ~5.4–5.62k tok/s | **Current sweet spot** |
| `16 × 2` | 8,192 | degraded / memory limit | Not viable |

Overall improvement versus the original training setup:

```text
~2,000 tok/s
    ↓
~5,600 tok/s
```

Approximately:

```text
~2.8× throughput
```

on the same GPU and with the same effective tokens per optimizer update.

---

## 15. Current known-good configuration

```python
BATCH_SIZE = 8
VAL_BATCH_SIZE = 1
GRAD_ACCUM_STEPS = 4

SEQ_LEN = 256

NUM_WORKERS = 0
PIN_MEMORY = True

EVAL_INTERVAL = 1000
SAVE_INTERVAL = 500
```

Other important settings remain unchanged:

```text
BF16
Flash Attention
GQA
gradient checkpointing
AdamW8bit
cosine LR
gradient clipping
TF32 where applicable
```

---

## 16. What was deliberately NOT changed

During this optimization pass, the following were intentionally kept stable:

- model architecture
- parameter count
- tokenizer
- dataset
- sequence length
- optimizer type
- learning-rate schedule
- weight decay
- gradient clipping threshold
- effective tokens per optimizer step
- training objective

This is important.

The performance improvements came primarily from **better hardware utilization and lower runtime overhead**, not from weakening the training process.

---

## 17. Next step: profiling instead of guessing

The current GPU utilization is already near 100%.

At this point, random tuning becomes less useful.

The next phase is to profile the training step and identify exactly where time is spent.

A dedicated profiler script has been prepared with the following logical regions:

```text
01_data_fetch_and_h2d
02_forward_checkpointed
03_backward_including_recompute
04_grad_clip
05_optimizer_step
```

The profiling run will:

1. load `last.pt`
2. run a few warmup optimizer steps
3. profile a few optimizer steps
4. export a PyTorch profiler summary
5. export a Chrome trace when available
6. never overwrite `last.pt` or `best.pt`

The goal is to answer questions such as:

```text
How much time is spent in forward?
How much time is spent in backward?
How expensive is checkpoint recomputation?
Is gradient clipping relevant?
Is AdamW8bit a measurable bottleneck?
Are there CPU launch gaps?
Which CUDA kernels dominate the step?
```

This moves optimization from:

> "Maybe this setting is faster."

to:

> "This specific operation consumes X% of the step, so this is the next target."

---

## 18. Possible future low-risk experiments

These should only be tested after profiling.

### Gradient clipping foreach path

Potential experiment:

```python
torch.nn.utils.clip_grad_norm_(
    model.parameters(),
    GRAD_CLIP,
    foreach=True,
)
```

This should preserve clipping semantics, but modern PyTorch may already automatically select the foreach implementation on supported CUDA tensors.

Therefore this should be measured rather than assumed to help.

### Checkpoint RNG-state preservation

Potential experiment:

```python
checkpoint(
    run_block,
    x,
    use_reentrant=False,
    preserve_rng_state=False,
)
```

Activation checkpointing normally saves/restores RNG state.

If the checkpointed Transformer blocks contain no stochastic operations, skipping RNG-state preservation can remove some overhead.

However, this should **not** be enabled until the model implementation is verified to contain no relevant stochastic operations.

`dropout=0.0` is encouraging, but the block implementation should still be inspected before enabling it.

---

## 19. Quality improvements are a separate problem

Runtime optimization and model-quality optimization should not be confused.

The changes in this document mostly improve:

```text
tokens / second
GPU utilization
runtime stability
```

They do not magically improve model intelligence.

For CetinLM-1B, the major future quality levers remain:

- more high-quality pretraining tokens
- better dataset filtering
- stronger deduplication
- document-boundary / EOS verification
- improved Turkish / English data balance
- later longer-context training
- instruction SFT
- chat SFT
- reasoning data
- code data
- preference / alignment stages

The current plan is continued pretraining:

```text
CetinLM-1B v0
1.05B params / 1B total tokens

↓

CetinLM-1B v0.2
1.05B params / 5B total tokens

↓

CetinLM-1B v0.5
1.05B params / 10B total tokens

↓

CetinLM-1B v1
1.05B params / 50B+ total tokens

↓

Instruction / Chat / Reasoning / Code
```

The same checkpoint can continue pretraining. Increasing total training-token exposure does not require resetting the model or starting again from random initialization.

---

## 20. Main engineering lessons

### 1. GPU utilization matters as much as nominal hardware capability

The original GPU was powerful enough, but the workload was not feeding it efficiently.

The largest gain came from changing how work was presented to the GPU.

### 2. Keep the training mathematics constant while profiling performance changes

Holding:

```text
BATCH_SIZE × GRAD_ACCUM_STEPS × SEQ_LEN
```

constant made the batch experiments much easier to reason about.

### 3. Measure validation after performance changes

Throughput alone is not enough.

A speed optimization should be treated as successful only when model behavior and validation remain healthy.

### 4. Bigger batch is not infinitely better

The progression:

```text
1 → 2 → 4 → 8
```

helped.

But:

```text
16
```

crossed the practical VRAM boundary.

Optimization has a hardware-dependent sweet spot.

### 5. More DataLoader workers are not automatically useful

The dataset already used memory-mapped binary shards.

The CPU was not the major bottleneck, so extra worker processes did not improve throughput.

### 6. Small synchronization points can matter

Repeated CUDA → CPU synchronization inside a hot loop can introduce unnecessary stalls even when every individual operation looks harmless.

### 7. Once utilization is near 100%, profile before changing more settings

At this stage the right next tool is a profiler, not random tuning.

---

## 21. Current status

CetinLM-1B training is currently running with:

```text
~1.049B parameters
~32% of the initial 1B-token stage completed
~5.6k tok/s
~99–100% GPU utilization
~15.4 GB VRAM in the 8×4 configuration
```

The training stack has evolved from a functional baseline into a substantially more efficient single-GPU research training pipeline.

The important result is not just the raw speedup.

The optimization process itself became systematic:

```text
hypothesis
↓
single-variable experiment
↓
throughput measurement
↓
VRAM observation
↓
validation
↓
keep or revert
```

That process is reusable for every future CetinLM training stage.

---

## Disclaimer

These numbers are specific to the tested CetinLM model, software stack, GPU, sequence length, optimizer, and dataset pipeline.

They should be treated as an engineering case study, not as universal batch-size recommendations for every language model.

Always profile and validate on the actual workload.
