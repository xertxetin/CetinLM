<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="220px">
</p>

<h1 align="center">CetinLM Developer Log</h1>

<p align="center">
  <strong>2026-09-02 · New Scratch Generation / Corpus Architecture Redesign</strong><br>
  From web-volume-first pretraining to a capability-dense Turkish/English research corpus.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/generation-fresh%20scratch-111111" alt="Fresh scratch">
  <img src="https://img.shields.io/badge/data-capability%20centric-111111" alt="Capability centric">
  <img src="https://img.shields.io/badge/TR%20target-65%25-111111" alt="Turkish 65%">
  <img src="https://img.shields.io/badge/EN%20target-35%25-111111" alt="English 35%">
  <img src="https://img.shields.io/badge/filter-v61.2%20FINAL--FLOOR-111111" alt="v61.2">
  <img src="https://img.shields.io/badge/tokenizer-A%2FB%20pending-111111" alt="Tokenizer A/B">
</p>

---

> [!IMPORTANT]
> **CetinLM has entered a new scratch-generation phase.**
>
> Phase-I remains preserved as research history and a comparison baseline. The active model is not a continuation of the Phase-I checkpoint and does not inherit its tokenizer by default.

# What changed today

The project direction was simplified around one question:

> **How much useful capability can a compact ~1B model learn when the corpus is designed for signal density instead of raw web volume?**

The previous generation proved that the architecture, training loop, checkpointing, diagnostics, profiling, and single-GPU workflow can operate end-to-end. The new generation keeps that engineering discipline but changes the data strategy substantially.

```text
OLD EMPHASIS                         NEW EMPHASIS
────────────                         ────────────
more generic text                    more useful text
web volume                           capability density
one broad quality policy             family-specific validation
fixed tokenizer assumption           tokenizer A/B + measured freeze
continued-pretraining path            fresh-scratch training
source quantity                      signal / diversity / usefulness
```

---

# Active CetinLM-1B body

The transformer body remains the current stable baseline while corpus and tokenizer qualification are completed.

| Component | Current design |
|---|---:|
| Model scale | **~1.05B parameters** |
| Transformer layers | **20** |
| Hidden size | **1,792** |
| Query heads | **28** |
| KV heads | **7** |
| Head dimension | **64** |
| MLP | **SwiGLU · 7,168** |
| Normalization | **Pre-RMSNorm** |
| Attention | **GQA / SDPA** |
| Position encoding | **RoPE** |
| Input/output embeddings | **Tied** |
| Bias / dropout | **None / 0.0** |
| Maximum configured context | **4,096** |
| Training direction | **Fresh scratch** |

```text
Token IDs
   │
   ▼
┌────────────────────────┐
│     Token Embedding    │
│      vocab → 1792      │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────────────────────────┐
│           20 Transformer Blocks            │
│                                            │
│  RMSNorm → GQA Attention → Residual        │
│           28Q / 7KV / RoPE                 │
│                                            │
│  RMSNorm → SwiGLU 1792→7168→1792 → Residual│
└───────────────────┬────────────────────────┘
                    │
                    ▼
               tied LM head
                    │
                    ▼
             next-token logits
```

---

# Corpus architecture

The new corpus is designed around **capability families**. Turkish is intentionally emphasized because CetinLM is being built to become much stronger at practical Turkish while retaining high-quality English coverage.

```text
CetinLM training corpus
│
├── Turkish target lane — 65%
│   │
│   ├── First-party curated TR
│   │   ├── TR Base
│   │   ├── TR Research
│   │   ├── TR Turkish Pulse
│   │   └── TR Youth Base
│   │
│   ├── Capability-focused TR
│   │   ├── TR Mathematics
│   │   ├── TR Code
│   │   ├── TR Science
│   │   ├── TR Technical
│   │   ├── Everyday Utility / Common Knowledge
│   │   └── Language / Grammar / Writing Diversity
│   │
│   └── Natural TR
│       ├── wiki_train_tr.jsonl
│       ├── FineWiki TR
│       └── NUCLEAR-filtered FineWeb TR
│
└── English target lane — 35%
    └── High-quality EN
        ├── FineWeb-Edu Dedup
        ├── English Wikipedia
        └── additional qualified EN sources
```

> [!NOTE]
> **65% TR / 35% EN is the current target direction, not a promise that every raw source will be force-oversampled to hit a ratio.** Final family weights are frozen only after qualified token counts, diversity, and tokenizer efficiency are measured.

### First-party Turkish families

| Family | Primary role | Current treatment |
|---|---|---|
| **TR Base** | broad Turkish concepts and natural explanatory prose | active first-party lane |
| **TR Research** | grounded technical/scientific/current knowledge | active first-party lane |
| **TR Turkish Pulse** | culture, daily life, interests, music/pop culture | active first-party lane |
| **TR Youth Base** | practical life, learning, technology, communication, finance | active first-party lane |
| **TR Mathematics** | concepts + quantitative foundations | generator being improved |
| **TR Code** | programming + algorithms | planned capability lane |
| **TR Science** | core science | planned capability lane |
| **TR Technical** | devices, systems, engineering, practical technology | planned capability lane |
| **Everyday Utility** | common knowledge + real user questions | planned high-priority lane |

The design principle is simple:

> **A token that teaches a useful concept, procedure, relationship, or language pattern is worth more to a compact model than a token that only increases corpus size.**

---

# Natural-data filter: v61.2 FINAL-FLOOR

The natural-data pipeline reached the current speed/precision target today and is frozen as the baseline instead of being made progressively slower.

### Active remote bootstrap

| Source | Temporary bootstrap share | Role |
|---|---:|---|
| **FineWeb-Edu Dedup (EN)** | **30%** | high-quality English educational/general text |
| **English Wikipedia** | **5%** | English reference/natural-language anchor |
| **FineWiki TR** | **65%** | Turkish natural/reference anchor |

This remote bootstrap is **not the final corpus mix**. First-party Turkish datasets are expected to replace a substantial part of the Turkish lane after qualification.

TurkishFineWeb2 is **not active in the v61.2 remote acquisition contract**. Its NUCLEAR/Tail-Seal filters are retained so selected Natural TR material can be gated later if it is worth the throughput cost.

### Latest qualification audit

| Source | Docs/cache snapshot | Avg accepted score | Min accepted score |
|---|---:|---:|---:|
| **EN FineWeb-Edu** | 30 sampled | **88.12** | **85.97** |
| **EN Wikipedia** | 50 sampled | **84.23** | **68.96** |
| **TR FineWiki** | 50 sampled | **84.09** | **75.02** |

The v61.2 final invariant rejected **59 TR FineWiki documents** below the final score floor in that qualification run.

```text
TR FineWiki candidate
        │
        ▼
existing quality pipeline
        │
        ▼
final quality_score
        │
        ├── < 75.0 ───────► REJECT
        │
        └── ≥ 75.0 ───────► cache-row safety check
                                  │
                                  ▼
                              CLEAN CACHE
```

No second LLM judge, no second full-text scan, and no expensive new regex cascade were added. **Speed remains a design constraint.**

---

# First-party qualification philosophy

Controlled data does not bypass filtering, but it does not need to be treated like unknown raw web garbage either.

```text
first-party JSONL
      │
      ├─ exclude state_*.json / generator state
      ├─ schema + UTF-8 + language checks
      ├─ obvious corruption / leakage checks
      ├─ exact + near duplicate control
      ├─ template / opening / ending concentration
      ├─ n-gram + paragraph repetition
      ├─ topic + length diversity
      └─ family-specific validation
              │
              ▼
        qualified corpus lane
```

The target is **high signal-to-noise and low systematic error**, not the impossible claim that every sentence in a large pretraining corpus is perfect.

---

# Mathematics: split knowledge from reasoning

The mathematics work produced an important design decision today: conceptual math prose and actual problem-solving should not be treated as the same training signal.

```text
TR Mathematics
│
├── Math Knowledge
│   ├─ definitions
│   ├─ notation
│   ├─ conceptual relationships
│   └─ worked explanations
│
├── Verified Math Reasoning   ← next major math milestone
│   ├─ generated problem
│   ├─ intermediate reasoning
│   ├─ answer
│   └─ Python / SymPy verification where possible
│
└── Contrastive Math
    ├─ wrong solution
    ├─ identify the error
    ├─ corrected solution
    └─ deterministic check
```

> [!IMPORTANT]
> **Verified Math Reasoning is an explicit project milestone.** It is not being left as an informal idea to be rediscovered later.

This is intended to teach both **mathematical language** and **mathematical execution**.

---

# Tokenizer qualification

The new generation does not blindly inherit the historical tokenizer.

| Candidate | Vocabulary | Status |
|---|---:|---|
| A | **32,768** | benchmark candidate |
| B | **49,152** | benchmark candidate |
| C | **65,536** | benchmark candidate |

All use ByteLevel BPE, NFC normalization, complete byte coverage, and fixed special-token IDs.

```text
clean tokenizer-independent corpus
              │
              ▼
      ┌───────┼────────┐
      ▼       ▼        ▼
    32K      48K      65K
      │       │        │
      └───────┼────────┘
              ▼
 TR/EN fertility + compression
 round-trip + UNK + embedding cost
              │
              ▼
        measured winner
              │
              ▼
          SHA freeze
```

No vocabulary size is final until the benchmark selects it.

---

# Current build philosophy

```text
QUALITY
  ↑
  │      capability density
  │      source control
  │      deterministic verification where useful
  │      human audit at scale gates
  │
  └──────────────────────────────────────────► THROUGHPUT
          cheap fail-closed gates
          no unnecessary second passes
          no low-yield source bottlenecks
```

The rule is:

> **Be aggressive about rejection, conservative about expensive computation.**

A questionable document can be discarded. Pipeline throughput should not be sacrificed to rescue marginal data.

---

# Roadmap from here

```text
v61.2 natural-data baseline ───────────────┐
                                           │
first-party TR datasets ───────────────────┤
                                           ▼
                             corpus assembler / qualification
                                           │
           ┌───────────────────────────────┼──────────────────────────────┐
           ▼                               ▼                              ▼
  Math / Reasoning                  Code / Algorithms              Science / Technical
           │                               │                              │
           └───────────────────────────────┼──────────────────────────────┘
                                           ▼
                                 diversity + dedup audit
                                           │
                                           ▼
                                tokenizer 32K/48K/65K A/B
                                           │
                                           ▼
                                      tokenizer freeze
                                           │
                                           ▼
                                      1M-token gate
                                           │
                                           ▼
                                     10M-token gate
                                           │
                                           ▼
                                  final corpus contract
                                           │
                                           ▼
                                 fresh-scratch CetinLM-1B
                                           │
                                           ▼
                                  evaluation / post-training
```

### Decisions already frozen

| Decision | State |
|---|---|
| Fresh-scratch CetinLM-1B direction | **FROZEN** |
| Phase-I role | **Historical baseline / archive** |
| v61.2 natural filter | **FROZEN BASELINE** |
| Precision-first / trusted-first philosophy | **FROZEN** |
| First-party capability-centric corpus | **ACTIVE** |
| Final tokenizer size | **NOT FROZEN — benchmark first** |
| Exact final family ratios | **NOT FROZEN — measure first** |
| Verified Math Reasoning | **NEXT MATH MILESTONE** |

---

# Research thesis for the new generation

> **A compact language model should not have to memorize the entire noisy web before it can answer useful questions.**

The active CetinLM generation tests whether better source control, stronger Turkish data, task-dense capability families, selective deterministic verification, and measured tokenizer design can extract substantially more useful capability from the same model scale.

Phase-I documents remain available under [`phase1/`](./phase1/) for provenance and historical comparison. They do not override the active design described here.

---

<p align="center">
  <strong>Better tokens. Better capability. Measure before scaling.</strong>
</p>
