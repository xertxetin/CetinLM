<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="270px">
</p>

<h1 align="center">CetinLM Public Engineering History</h1>

<p align="center">
  <strong>Architecture, data, training systems, failed experiments and release gates — documented as they happened.</strong>
</p>

---

# Current public snapshot — 2026-09-08

CetinLM Base-v1 is a **fresh-scratch Turkish-first decoder-only language model**. The active production profile is now frozen and approved for fresh pretraining.

| Item | Current Base-v1 state |
|---|---:|
| Parameters | **1,180,540,928** |
| Layers | 24 |
| Hidden size | 2,048 |
| Attention | 16Q / 4KV GQA |
| Head dimension | 128 |
| FFN | 5,632 SwiGLU |
| Normalization | Pre-RMSNorm + head-wise QK-RMSNorm |
| RoPE theta | 500,000 |
| Tokenizer | CetinTokenizer-v1 · 48,000 |
| Initial context | 2,048 |
| Unique train tokens | **11,391,183,502** |
| Validation tokens | **57,697,909** |
| First milestone | 10B processed tokens |
| Full scheduler horizon | 20B processed tokens |
| Production runtime | FP32 persistent params + BF16 compute + AdamW8bit |
| Qualified attention backend | dense document-isolated SDPA |
| Production status | **READY FOR FRESH START** |

Tokenizer SHA-256:

```text
56821c324d9c9af41359ed1fabcbe9cc7c5b2592276377b9b185442e843106ed
```

# What changed since the older public documents?

Older files in this directory describe real historical experiments, but they do **not** override the current Base-v1 freeze.

The current generation differs materially from the earlier 20-layer / 1,792-hidden / 65K-tokenizer Phase-I-era design. Base-v1 now uses the 24-layer 1.1805B architecture above, a frozen 48K tokenizer, document-isolated packed attention, an immutable indexed corpus and an exact 10B→20B continuation-aware training plan.

The active source set is also frozen. It includes the project-created Core and Knowledge corpora, FineWiki TR/EN and filtered Temiz-OSCAR. Historical corpus targets such as a simple 65% Turkish / 35% English split are not the active Base-v1 training contract.

# 2026-09-08 release milestone

The final pretraining qualification verified:

- immutable data/tokenizer/mix identity,
- document-isolated causal masking,
- zero cross-document influence,
- real packed-document boundaries,
- EOS→BOS target construction,
- EOS learnability on a controlled tiny task,
- embedding/LM-head weight decay = 0,
- AdamW8bit vs FP32 AdamW proxy behavior,
- real 1.1805B forward/backward/update on the target GPU,
- checkpoint/resume and release-lock semantics.

A shadow pretraining rehearsal was used to inspect early learning dynamics before committing the much more expensive production run. Its raw greedy generations showed short-token repetition at very low training exposure. Follow-up diagnostics compared cached and uncached full-forward generation and found matching greedy token choices, ruling out KV-cache divergence as the cause of that behavior.

The release policy was therefore clarified: deterministic implementation/correctness invariants remain **hard gates**, while very-early raw greedy generation is retained as **telemetry** rather than being treated as proof that the training implementation is broken.

See:

- [`CETINLM_DEVELOPER_LOG_2026-09-08_PRETRAINING_QUALIFICATION_AND_PRODUCTION_FREEZE.md`](./CETINLM_DEVELOPER_LOG_2026-09-08_PRETRAINING_QUALIFICATION_AND_PRODUCTION_FREEZE.md)

# Historical structure

```text
docs/history/github/
├── README.md
├── CETINLM_DEVELOPER_LOG_2026-09-08_PRETRAINING_QUALIFICATION_AND_PRODUCTION_FREEZE.md
├── CETINLM_DEVELOPER_LOG_2026-09-07_*.md
├── CETINLM_DEVELOPER_LOG_2026-09-02.md
└── phase1/
    └── historical Phase-I training / evaluation / profiler documents
```

Historical documents are intentionally preserved rather than rewritten. They show how the system changed and which experiments were rejected.

# Research rule

```text
OBSERVE → MEASURE → HYPOTHESIS → A/B TEST → KEEP WHAT WINS → DOCUMENT
```

The public history is meant to preserve that process, including negative results. A lower loss is not automatically a capability claim, a compelling generation is not a benchmark, and a theoretically attractive optimization is not accepted until it survives the project's correctness and target-hardware measurements.

---

<p align="center">
  <strong>CetinLM Base-v1: frozen, qualified, and ready for the first real production run.</strong>
</p>
