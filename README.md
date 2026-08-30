<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="250px">
</p>

<h1 align="center">CetinLM</h1>

<p align="center">
  <strong>From-scratch language model research and engineering.</strong><br>
  Architecture, tokenizer, data, training systems, diagnostics, post-training and inference — treated as one system.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/research-from%20scratch-111111" alt="From scratch">
  <img src="https://img.shields.io/badge/architecture-decoder%20Transformer-111111" alt="Decoder Transformer">
  <img src="https://img.shields.io/badge/attention-GQA-111111" alt="GQA">
  <img src="https://img.shields.io/badge/position-RoPE-111111" alt="RoPE">
  <img src="https://img.shields.io/badge/precision-BF16-111111" alt="BF16">
  <img src="https://img.shields.io/badge/research-public%20engineering-111111" alt="Public engineering">
</p>

---

> **CetinLM is not a wrapper around an existing model.**
>
> It is an independent research program for understanding how capable, efficient language models can be engineered from first principles — and which parts of that methodology deserve to be scaled.

## The research question

The project starts from a simple idea:

> **How much useful capability can be extracted from every parameter, training token and unit of compute before scale becomes the default answer?**

CetinLM is deliberately built end-to-end so that cause and effect remain visible.

```text
Data
  ↓
Tokenizer
  ↓
Corpus engineering
  ↓
Model architecture
  ↓
Pretraining
  ↓
Scientific diagnostics
  ↓
Systems profiling
  ↓
Continued pretraining
  ↓
Instruction / Chat / Reasoning / Code
  ↓
Inference engineering
  ↓
Tools / Applications
```

The goal is not to optimize one isolated checkpoint.

The goal is to develop a **model-building methodology**.

---

# CetinLM-1B: the first research instrument

The first serious research platform is **CetinLM-1B Base**.

It is intentionally large enough for meaningful language-model behavior to emerge, while remaining small enough that the entire stack can still be profiled, audited, measured and changed experimentally.

### Reference architecture

| Component | CetinLM-1B |
|---|---:|
| Parameters | **1,048,780,544** |
| Vocabulary | **65,536** |
| Hidden size | **1,792** |
| Transformer layers | **20** |
| Query heads | **28** |
| KV heads | **7** |
| Attention | **Grouped-Query Attention (GQA)** |
| Head dimension | **64** |
| MLP intermediate size | **7,168** |
| Position encoding | **RoPE** |
| RoPE theta | **10,000** |
| Configured max sequence length | **4,096** |
| Dropout | **0.0** |
| Bias | **False** |
| Input/output embeddings | **Tied** |
| Objective | **Causal next-token prediction** |

### Architecture sketch

```text
token ids
   │
   ▼
┌──────────────────────┐
│   Token Embedding    │
│  65,536 → 1,792      │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│          20 Transformer Blocks          │
│                                         │
│   Pre-Norm                              │
│      ↓                                  │
│   GQA Attention                         │
│   28 Q heads / 7 KV heads / RoPE        │
│      ↓                                  │
│   Residual                              │
│      ↓                                  │
│   Pre-Norm                              │
│      ↓                                  │
│   SwiGLU MLP                            │
│   1,792 → 7,168 → 1,792                 │
│      ↓                                  │
│   Residual                              │
└──────────────────┬──────────────────────┘
                   │
                   ▼
              tied LM head
                   │
                   ▼
            next-token logits
```

CetinLM-1B is a **base language model**, not a finished chat assistant.

Instruction following, conversation, reasoning, code specialization, preference optimization and tool use are separate research stages.

---

# Why 1B?

The 1B scale is not the destination.

It is the laboratory.

```text
small enough to inspect deeply
          +
large enough for real LM behavior
          +
affordable enough for repeated experiments
          =
controlled research scale
```

This lets us ask questions that become expensive or opaque at much larger scales:

- Which batch geometry actually improves throughput?
- Which attention backend wins on the real model?
- Is a profiler hotspot worth changing?
- Are document boundaries correct?
- Is the model learning a concept even when greedy generation still looks poor?
- Does a proposed optimization change the training math?
- Which improvements survive measurement?

If a methodology survives at 1B, the next question is how well it scales.

---

# Full-stack engineering

CetinLM treats model development as one connected engineering problem.

```text
┌───────────────────────────────────────────────────────┐
│                     CETINLM STACK                     │
├───────────────────────────────────────────────────────┤
│                                                       │
│  Source data                                          │
│      ↓                                                │
│  Filtering / dedup / quotas                           │
│      ↓                                                │
│  Custom multilingual tokenizer                        │
│      ↓                                                │
│  Exact token accounting + binary shards               │
│      ↓                                                │
│  Decoder-only Transformer / GQA / RoPE / SwiGLU       │
│      ↓                                                │
│  BF16 training / AdamW8bit / checkpointing            │
│      ↓                                                │
│  Validation + target-rank diagnostics                 │
│      ↓                                                │
│  Kernel profiling + controlled A/B testing            │
│      ↓                                                │
│  Continued pretraining + context research             │
│      ↓                                                │
│  SFT / Chat / Reasoning / Code                        │
│      ↓                                                │
│  KV cache / quantization / serving                    │
│                                                       │
└───────────────────────────────────────────────────────┘
```

No single component is treated as a magic trick.

---

# Training systems philosophy

The reference 1B run is designed around a strict rule:

> **Preserve the optimization objective. Improve the machine around it.**

The stable training geometry uses:

```text
micro-batch            8
gradient accumulation  4
sequence length      256
────────────────────────
effective tokens/update = 8,192
```

Core training techniques include:

- BF16 mixed precision,
- AdamW 8-bit optimizer,
- gradient checkpointing,
- gradient clipping,
- cosine learning-rate decay with warmup,
- best/last checkpoint recovery,
- deterministic evaluation snapshots,
- exact token accounting,
- single-GPU profiling.

The project has already shown that the same effective token update can behave very differently depending on how work is presented to the GPU.

That is why throughput changes are benchmarked rather than assumed.

---

# Measure first

CetinLM follows a simple research loop:

```text
OBSERVE
   ↓
MEASURE
   ↓
FORM A HYPOTHESIS
   ↓
A/B TEST
   ↓
KEEP ONLY WHAT WINS
   ↓
DOCUMENT THE RESULT
```

Examples of questions already investigated include:

- batch size vs. gradient accumulation,
- GPU utilization under fixed effective token budgets,
- activation-checkpointing cost,
- SDPA backend behavior,
- native GQA vs. expanded KV paths,
- BF16 reduction behavior,
- validation methodology,
- next-token semantic target ranks,
- EOS/document-boundary integrity.

Negative results are kept.

A theoretically attractive optimization that loses on the real system is still a useful experiment.

---

# Scientific diagnostics

CetinLM is not evaluated only by looking at generated text.

A raw base model can contain useful learned structure before it knows how to behave like an assistant.

For that reason, the project separates:

```text
"Does the model know something?"
             from
"Does the model present it well?"
```

Evaluation layers include:

- validation loss,
- perplexity,
- fixed English/Turkish probes,
- next-token target ranks,
- controlled generation tests,
- degeneration/repetition observations,
- checkpoint-to-checkpoint comparisons.

A target moving from rank 200 to rank 2 is meaningful research evidence even if greedy decoding still produces a repetitive continuation.

The same fixed diagnostics are repeated across milestones so progress can be measured instead of guessed.

---

# Data engineering

The Phase-I foundation corpus is built through a controlled pipeline rather than feeding raw downloads directly into training.

```text
Upstream datasets
       ↓
Source selection
       ↓
Filtering / quality checks
       ↓
Deduplication
       ↓
Language / source quota control
       ↓
CetinLM tokenizer
       ↓
Exact token accounting
       ↓
Train / validation split
       ↓
Sharded binary token files
       ↓
Integrity audits
```

The initial foundation build contains:

```text
Training   : 1,000,000,000 tokens
Validation :    10,000,000 tokens
```

Major upstream sources for the initial build include **FineWeb** and **C4**.

English and Turkish receive elevated representation, while the tokenizer and corpus include broader multilingual coverage.

The corpus pipeline is treated as part of the model architecture: token efficiency, document boundaries, language mixture and data quality directly affect compute efficiency and learning behavior.

---

# Tokenizer

CetinLM uses a custom multilingual tokenizer with:

```text
Vocabulary: 65,536 tokens
```

The tokenizer is not treated as a replaceable preprocessing detail.

Its design affects:

- multilingual token efficiency,
- effective context usage,
- training cost,
- inference cost,
- representation quality,
- future long-context behavior.

Supported training languages currently include:

`en, tr, de, fr, es, pt, it, nl, pl, ru, uk, ar, fa, hi, bn, ur, id, vi, th, zh, ja, ko`

Coverage does not imply equal capability in every language.

---

# Context research

CetinLM-1B is configured for a maximum sequence length of 4,096 tokens, but the initial base-pretraining run intentionally uses 256-token training sequences.

```text
configured context ≠ trained context
```

Long-context capability will be trained explicitly.

The planned continued-pretraining system uses document-length-aware buckets:

```text
short documents   → 256 / 512
medium documents  → 1024 / 2048
long documents    → 4096
```

with:

- length bucketing,
- EOS-aware packing,
- token-budgeted batches,
- dynamic micro-batch sizing,
- minimal padding,
- controlled long-context exposure.

The objective is to learn long context **without forcing every short document to pay the compute cost of the largest window**.

---

# Research roadmap

```text
CetinLM-1B Base
       │
       ▼
Foundation pretraining
       │
       ▼
Freeze + comprehensive evaluation
       │
       ▼
Continued pretraining
       │
       ├─ controlled token milestones
       └─ dynamic 256 → 4096 context training
       │
       ▼
Instruction SFT
       │
       ▼
Conversation / Chat
       │
       ├─ stronger Turkish / English
       ├─ identity / knowledge
       └─ preference optimization
       │
       ▼
Reasoning / Math
       │
       ▼
Code
       │
       ▼
Inference engineering
       │
       ├─ KV cache
       ├─ quantization
       ├─ memory optimization
       └─ serving
       │
       ▼
Tools / Web / Memory / Applications
```

Each stage is evaluated independently.

A capability is not claimed merely because it appears later in the roadmap.

---

# Model family

CetinLM is intended to evolve as a model family rather than one overloaded checkpoint.

Planned release naming follows the capability of the weights:

```text
CetinLM-1B-Base
CetinLM-1B-Instruct
CetinLM-1B-Chat
CetinLM-1B-Reasoning
CetinLM-1B-Code
```

Future parameter scales may be explored only when the research evidence justifies them.

The method scales first.

Then the model does.

---

# Hardware philosophy

Accessible hardware is a **research constraint**, not the final identity of the project.

The first 1B training platform uses:

```text
NVIDIA RTX 4070 Ti SUPER
16 GB VRAM
```

This makes inefficiency difficult to hide.

Memory pressure, recompute cost, kernel choice, data movement and batch geometry all become measurable engineering problems.

The long-term question is not:

> “Can CetinLM remain a home-GPU model forever?”

It is:

> **“What can we learn when efficiency is mandatory — and what happens when that engineering discipline is later given more scale?”**

---

# Research logs

The main README intentionally avoids becoming a live scoreboard.

Checkpoint metrics, benchmark snapshots, experiments and discoveries are published as **dated research artifacts** instead.

Example:

- [CetinLM-1B Mid-Run Evaluation — 573M Tokens](./CETINLM_1B_MIDRUN_EVALUATION_573M_2026-08-30.md)

This keeps the project front page stable while preserving the history of the research program.

---

# Data sources and licensing

CetinLM uses third-party upstream datasets under their respective licenses and terms.

Initial foundation sources include:

- [FineWeb](https://huggingface.co/datasets/HuggingFaceFW/fineweb)
- [C4](https://huggingface.co/datasets/allenai/c4)
- [Common Crawl](https://commoncrawl.org/)

The project does **not** claim ownership over upstream datasets or third-party content.

A dataset-level license does not automatically guarantee that every individual web item is free of all separate copyright, privacy, contractual, trademark or other rights.

Detailed provenance and release-specific licensing information will accompany public model/data artifacts where applicable.

Nothing in this repository constitutes legal advice.

---

# Project ownership

Unless a separate file states otherwise, original CetinLM source code, documentation, project configuration, evaluation tooling and project-created research material remain the work of the CetinLM project / Me Force Technology.

Third-party datasets, software, services, names and trademarks remain with their respective owners and licensors.

A dedicated model-weight license will be selected for released checkpoints.

---

# Project links

| Resource | Link |
|---|---|
| **Website** | https://cetinlm.meforcetechnology.com |
| **Hugging Face** | https://huggingface.co/meforce |
| **Repository** | https://github.com/xertxetin/CetinLM |

CetinLM is developed independently under **Me Force Technology** as a globally oriented language-model research program. The project originated in Türkiye and is documented publicly from its early research stages.

---

# Philosophy

```text
Better data
      +
Better training
      +
Better architecture
      +
Better diagnostics
      +
Better post-training
      +
Better inference
      =
More capability per unit of compute
```

CetinLM is not based on the claim that large models are unnecessary.

It is based on the belief that **scale should amplify good engineering, not replace it**.

We do not treat:

```text
parameter count        as intelligence
configured context     as trained context
one generation         as a benchmark
a profiler suspicion   as a result
a theoretical speedup  as a measured speedup
```

We measure.

We keep what survives measurement.

We document what does not.

---

<p align="center">
  <strong>Build from first principles. Measure everything. Scale what works.</strong>
</p>
