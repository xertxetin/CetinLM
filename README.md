<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="270px">
</p>

<h1 align="center">CetinLM</h1>

<p align="center">
  <strong>From-scratch Turkish-first language model research.</strong><br>
  Clean data. Efficient architecture. Reproducible training. Measured engineering.
</p>

<p align="center">
  <img alt="Parameters" src="https://img.shields.io/badge/parameters-1.18B-111827">
  <img alt="Tokenizer" src="https://img.shields.io/badge/tokenizer-48K-111827">
  <img alt="Context" src="https://img.shields.io/badge/initial_context-2K-111827">
  <img alt="Candidate corpus" src="https://img.shields.io/badge/candidate_corpus-11.47B_tokens-0F766E">
  <img alt="Training" src="https://img.shields.io/badge/pretraining-preparing-B45309">
</p>

---

## What is CetinLM?

CetinLM is an independent decoder-only Transformer project built from scratch with Turkish as its primary language and English as a complementary knowledge source.

It is **not** a wrapper, fine-tune, or continued-pretraining experiment on another pretrained model. The model architecture, tokenizer, corpus pipeline, document packing, checkpoint/resume system, and training stack are developed together as one auditable research system.

The objective is not to maximize parameter count or scrape the largest possible corpus. The objective is to make each parameter, token, and unit of compute carry as much useful signal as possible.

> **Build from first principles. Train on what matters. Measure everything. Scale what works.**

## Model

| Component | Specification |
|---|---:|
| Parameters | **1,180,540,928** |
| Architecture | Decoder-only Transformer |
| Layers | **24** |
| Hidden size | **2,048** |
| Attention | Grouped-Query Attention |
| Query / KV heads | **16 / 4** |
| Head dimension | **128** |
| Feed-forward | **5,632 · SwiGLU** |
| Normalization | Pre-RMSNorm + QK-RMSNorm |
| Position encoding | RoPE · theta **500,000** |
| Embedding / LM head | Tied |
| Dropout | **0.0** during pretraining |
| Initial training context | **2,048 tokens** |

The architecture is not bound to a learned positional-embedding table. Longer-context capability will only be claimed after it is explicitly trained and evaluated.

## CetinTokenizer

CetinLM uses a frozen **48,000-piece** tokenizer designed for efficient Turkish processing while retaining robust coverage for English, code, Markdown, HTML, punctuation, whitespace, tabs, and newlines.

- Unigram tokenizer
- ByteLevel pre-tokenization / decoding
- NFC normalization
- Turkish casing and diacritics preserved
- fixed core special-token ABI
- reserved capability/control tokens for later stages

| Token | ID |
|---|---:|
| `<pad>` | 0 |
| `<unk>` | 1 |
| `<bos>` | 2 |
| `<eos>` | 3 |

**Frozen tokenizer SHA-256**

```text
56821c324d9c9af41359ed1fabcbe9cc7c5b2592276377b9b185442e843106ed
```

## Data

The current candidate pool contains **21,648,490 documents** and **11,467,177,822 exact training tokens** before global cross-source exact deduplication.

| Corpus | Documents | Exact training tokens |
|---|---:|---:|
| **CetinLM Core Corpus** · first-party | 297,354 | 27,965,241 |
| **CetinLM Knowledge Corpus** · first-party | 19,229 | 28,785,197 |
| FineWiki Turkish | 629,762 | 412,296,403 |
| FineWiki English | 400,000 | 718,391,936 |
| Filtered Temiz-OSCAR | 20,302,145 | 10,279,739,045 |
| **Total** | **21,648,490** | **11,467,177,822** |

**CetinLM Core Corpus** is the project's primary first-party curated corpus. **CetinLM Knowledge Corpus** is the project's first-party knowledge / encyclopedic corpus. These public names do not change the internal source identifiers used by the reproducible data pipeline.

Counts were measured with the frozen CetinTokenizer and include document boundary tokens. Final train/validation totals are published only after the immutable cross-source build completes.

### Coverage before repetition

CetinLM does not force every source into an artificial equal percentage. Sources differ by orders of magnitude; naive equality would require excessive repetition of small corpora while discarding large amounts of unique text.

The training mixer therefore follows a **full-coverage-first** policy:

- every retained source receives at least one complete coverage pass by the full horizon;
- **CetinLM Core Corpus** receives the strongest controlled replay;
- **Temiz-OSCAR** remains the broad natural-language and knowledge backbone;
- the first-party knowledge corpus and FineWiki sources provide supporting encyclopedic coverage;
- replay is bounded and measured after deduplication to reduce memorization pressure.

Current nominal replay targets are approximately **6×** for the Core Corpus, **1.8×** for Temiz-OSCAR, and **1.15×** for each knowledge/wiki source. The Core Corpus also has a hard anti-memorization exposure cap.

## Training

CetinLM is designed as one continuous **20B-token** pretraining run with a major checkpoint at **10B processed tokens**.

The second half is a true continuation, not a restarted run: optimizer state, learning-rate schedule, RNG state, processed-token progress, packing cursor, and sample-plan identity continue from the checkpoint.

| Setting | Planned value |
|---|---:|
| First major checkpoint | **10B processed tokens** |
| Full training horizon | **20B processed tokens** |
| Sequence length | **2,048** |
| Microbatch | **1** |
| Gradient accumulation | **128** |
| Effective tokens / update | **262,144** |
| CUDA compute | **BF16** |
| Activation checkpointing | Enabled |
| Peak learning rate | **3e-4** |
| Minimum learning rate | **3e-5** |
| Warmup | **200M processed tokens** |

Canonical documents are encoded as exactly **`BOS + body + EOS`**. Document-aware packing preserves clean **`EOS → BOS`** boundaries, and exact resume restores the state needed to continue without silently restarting the dataset or scheduler.

## Hardware philosophy

CetinLM is deliberately developed under a tight local-compute constraint so inefficient design choices become visible instead of being hidden by larger hardware.

| Hardware | Development platform |
|---|---|
| GPU | **NVIDIA GeForce RTX 4070 Ti SUPER** |
| VRAM | **16 GB** |
| System RAM | **64 GB** |

Accessible hardware is a research constraint, not the long-term identity of the model family. The goal is to learn which architecture, data, packing, optimizer, and runtime decisions genuinely improve **capability per unit of compute** before larger scale hides inefficiency.

Long training is allowed to start only after the real full model passes target-GPU runtime qualification.

## Model family

CetinLM is designed as a **model family**, not one checkpoint overloaded with every behavior.

```text
CetinLM Base
   │
   ├── CetinLM Instruct
   ├── CetinLM Chat
   ├── CetinLM Reasoning
   └── CetinLM Code
```

| Planned model | Primary role |
|---|---|
| **CetinLM Base** | General pretrained language and knowledge foundation |
| **CetinLM Instruct** | Instruction following and task completion |
| **CetinLM Chat** | Natural assistant behavior and dialogue |
| **CetinLM Reasoning** | Structured and verified problem solving |
| **CetinLM Code** | Programming, debugging and code reasoning specialization |

The stages are intentionally separated. Base pretraining builds broad representations; later checkpoints specialize behavior without forcing instruction-following, conversation, reasoning, and coding objectives into one undifferentiated training stage.

> **One foundation. Multiple capability-focused descendants.**

## Measure first

CetinLM follows a simple engineering loop:

```text
OBSERVE → MEASURE → FORM A HYPOTHESIS → A/B TEST → KEEP WHAT WINS → DOCUMENT THE RESULT
```

This applies to architecture, tokenization, data quality, source mixing, GPU memory, throughput, training stability, and evaluation. A theoretical optimization is not treated as an improvement until it wins on the actual system.

## Evaluation philosophy

CetinLM keeps separate questions separate:

```text
Does the model know it?
        ≠
Can the model reason through it?
        ≠
Can the model present it usefully?
```

Evaluation is intended to combine validation loss/perplexity, fixed Turkish and English probes, target-rank diagnostics, capability-specific tests, mathematics/reasoning evaluation, code tests, controlled generation, repetition/degeneration checks, and checkpoint-to-checkpoint comparisons.

A base checkpoint will not be judged as if it were already an instruction-tuned chat model.

## Reliability by design

Long pretraining runs are expensive, so silent failure modes are treated as engineering bugs rather than acceptable risk.

- deterministic source ordering and source identities;
- global exact dedup with explicit source priority;
- clean BOS/EOS document boundaries;
- reserved-control-token rejection in raw base text;
- deterministic source-aware packing;
- bounded replay rather than uncontrolled looping;
- exact checkpoint resume including optimizer, RNG and packing position;
- EOS-aware generation and independent per-row stopping;
- explicit repetition/loop health monitoring;
- fail-closed data and runtime qualification gates.

## Current status

CetinLM is in the **final immutable corpus-build and pretraining-qualification stage**.

The architecture and 48K tokenizer are frozen. The five-source candidate pool has been measured and source-pinned, and the parallel final data build is in progress. **No pretrained CetinLM checkpoint, benchmark score, or capability result is claimed yet.**

When real checkpoints exist, this README will be updated with measured training curves, evaluations, runtime observations, and released artifacts.

## Data provenance

CetinLM combines project-created first-party corpora with qualified third-party natural-language sources. Third-party content remains subject to its original licenses, attribution requirements, copyright, privacy, and other applicable rights.

Detailed source provenance and dataset-license metadata are maintained in [`THIRD_PARTY_DATA.md`](../../../THIRD_PARTY_DATA.md).

The repository does not currently declare a repository-wide code/model license. No redistribution permission should be inferred from this README alone.

## Project links

| Resource | Link |
|---|---|
| Website | https://cetinlm.meforcetechnology.com |
| Hugging Face | https://huggingface.co/meforce |
| GitHub | https://github.com/xertxetin/CetinLM |

CetinLM is independently developed under **Me Force Technology** as a language-model research and engineering project originating in Türkiye.

---

<p align="center">
  <strong>Higher-value data · Efficient architecture · Measured training · Reproducible engineering</strong><br><br>
  <strong>Build from first principles. Train on what matters. Measure everything. Scale what works.</strong>
</p>

<sub>Technical release snapshot: V62.3 · internal profile <code>cetinlm_1p18b</code> · pretrained weights not yet released.</sub>
