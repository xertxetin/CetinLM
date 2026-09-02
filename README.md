# CetinLM

**CetinLM** is a from-scratch language-model research project focused on building a small but useful Turkish/English model through better data, verification, tokenizer design, training discipline, and efficient single-GPU engineering.

> **Active generation — 2026-09-02**  
> The next CetinLM-1B base is a **fresh scratch model**. The completed Phase-I run is retained only as a historical research baseline. The current generation does not continue pretraining from Phase-I weights or tokenizer.

## Current direction

The project has moved away from a "collect as much web text as possible" strategy.

The active principle is:

> **Every token should earn its place.**

The new corpus is designed around **capability density, factual risk, diversity, and practical usefulness** rather than raw size alone. Large noisy web sources are treated as optional background data; controlled first-party datasets are intended to carry much of the useful Turkish training signal.

The target model should learn not only fluent Turkish/English prose, but useful capabilities such as:

- everyday Turkish and common knowledge;
- practical comparison and decision support;
- mathematics and quantitative reasoning;
- code and algorithms;
- core science;
- technical knowledge;
- Turkish culture and daily life;
- language, grammar, and writing variety.

This is still **base pretraining**, not instruction tuning. The corpus is written to teach concepts, relationships, procedures, and useful reasoning patterns before later post-training.

## Data philosophy

CetinLM now follows a **trusted-first, precision-first** data strategy.

```text
controlled / first-party data
        ↓
source-family validation
        ↓
fast fail-closed cleaning
        ↓
exact + near dedup / diversity checks
        ↓
clean text cache
        ↓
tokenizer A/B
        ↓
measured source mixer
        ↓
1M → 10M qualification gates
        ↓
final corpus
        ↓
fresh scratch training
```

The goal is not a theoretically perfect corpus. The goal is a corpus with a very high signal-to-noise ratio, low systematic error, useful topic coverage, and known provenance.

### Natural-data lane

The active **remote natural-data bootstrap** is currently:

| Source | Share of remote bootstrap | Purpose |
|---|---:|---|
| FineWeb-Edu Dedup (EN) | 30% | high-quality English educational/general prose |
| English Wikipedia | 5% | English reference/background language |
| Turkish FineWiki | 65% | Turkish natural/reference-language anchor |

This is **not the intended final corpus mixture**. It is a fast trusted bootstrap used while controlled first-party datasets are being qualified.

TurkishFineWeb2 is disabled from active acquisition. Its precision-first filters remain in the repository for regression and possible future use, but the source was too low-yield for the current billion-scale workflow.

### v61.2 final-floor policy

The current natural-data filter is **v61.2 FINAL-FLOOR**.

For Turkish FineWiki, a document cannot enter the clean cache with a final quality score below **75/100**. The check is applied on the already-computed score and adds no second text pass, no LLM judge, and no expensive regex stage. A second invariant at cache-row creation prevents accidental bypass.

The latest 300K-character qualification audit observed:

- EN FineWeb-Edu accepted quality: average **88.12**, minimum **85.97**;
- TR FineWiki accepted quality: average **84.09**, minimum **75.02**;
- **59** Turkish FineWiki documents rejected by the v61.2 final score floor in that run.

The filter is intentionally kept fast. Expensive source-specific validation belongs only where the factual risk justifies it.

## First-party corpus strategy

Controlled Turkish datasets are being developed as separate capability families instead of one undifferentiated synthetic dump. Current/planned families include:

```text
Turkish general / everyday utility
Turkish research / grounded knowledge
Turkish culture + daily life
Youth / practical knowledge base
Mathematics
Code + algorithms
Core science
Technical knowledge
Language / grammar / writing diversity
User-curated Wikipedia-derived Turkish prose
```

State/checkpoint JSON files used by generators are never training data.

First-party data does **not** bypass filtering. It enters through a local qualification path with exact/near deduplication, repetition/template checks, language checks, diversity checks, provenance hashes, and source-family-specific validation.

### Factual-risk policy

Different source families are validated differently.

- **Math:** strict verification. Deterministic answers should be checked with Python/SymPy or equivalent methods.
- **Science / technical:** stronger factual checks for high-risk claims and systematic errors.
- **General / youth / culture / language:** prioritize coherence, naturalness, diversity, and removal of obvious/systematic errors without destroying useful data through unnecessary over-filtering.
- **Raw web:** remains the most aggressively filtered lane because source quality is least controlled.

A planned mathematics extension is **Verified Math Reasoning**: machine-verifiable problem generation with `problem → reasoning → answer → check`, plus contrastive `wrong solution → error → correct solution` examples. This complements conceptual Math Knowledge data; it does not replace it.

## Model architecture

The active CetinLM-1B transformer body remains:

| Component | Configuration |
|---|---:|
| Transformer layers | 20 |
| Hidden size | 1,792 |
| Query heads | 28 |
| KV heads | 7 |
| Head dimension | 64 |
| MLP | SwiGLU, 7,168 intermediate |
| Normalization | Pre-RMSNorm |
| Position encoding | RoPE |
| Attention | GQA / SDPA |
| Embeddings | tied input/output |
| Bias / dropout | none |
| Maximum configured context | 4,096 |

The architecture is intentionally stable while data and tokenizer qualification are in progress.

## Tokenizer

The Phase-I tokenizer is historical only. The active generation trains a fresh ByteLevel BPE tokenizer after the clean text cache is audited.

Candidates:

```text
32,768
49,152
65,536
```

Contract:

- NFC normalization;
- complete byte alphabet;
- PAD=0, UNK=1, BOS=2, EOS=3;
- deterministic held-out benchmark;
- EN/TR fertility and compression measurement;
- round-trip / UNK correctness;
- explicit SHA-pinned freeze only after measured A/B results.

No vocabulary size is considered final before this gate.

## Qualification order

```text
verify release / immutable source revisions
→ build tokenizer-independent clean cache
→ verify + human-audit clean cache
→ qualify first-party capability datasets
→ train 32K / 48K / 65K tokenizer candidates
→ benchmark on unseen holdout
→ explicitly freeze tokenizer by SHA
→ build 1M-token pilot + human audit
→ build 10M-token scale gate + human audit
→ freeze source / cleaning / tokenizer contracts
→ build measured final corpus
→ deep data verification
→ GPU/context profile + destructive canary/resume test
→ fresh scratch CetinLM-1B training
→ evaluation
→ later post-training / assistant alignment
```

The final token count and exact source mixture are deliberately **not frozen yet**. They will be chosen from measured clean-data volume, tokenizer efficiency, diversity, and capability coverage rather than from a pre-committed number.

## Why the strategy changed

Phase-I proved that the architecture and training stack can produce real language-model behavior at controlled 1B scale, but it also exposed a core limitation: **generic corpus volume does not automatically produce a useful small model**.

For a 1B model, spending a large fraction of the token budget on low-value encyclopedia tails, random web pages, template-heavy content, or weakly relevant facts can crowd out knowledge and procedures users actually ask about.

The new generation therefore optimizes for:

```text
quality × usefulness × diversity × verifiability
```

rather than:

```text
raw token count
```

This is the central research question of the current CetinLM generation.

## Repository layout

The repository is modular and portable. Its directory name is not part of the runtime contract.

```text
src/mertai/models/cetinlm_1b/       model + training stack
src/mertai/corpus/bilingual/        active corpus pipeline
docs/                               state, runbooks, handoffs, public docs
scripts/evaluation/                  evaluation tools
scripts/profiling/                   systems profiling
scripts/project/                     layout / handoff utilities
```

For operational commands, use:

- `docs/0_CETINLM_CURRENT_STATE.md`
- `docs/0_CETINLM_SCRATCH_BUILD.md`
- `docs/0_CETINLM_ACTIVE_CHECKPOINT.md`

Historical Phase-I and older corpus documents are retained under `docs/history/` for provenance and should not override current state.

## Phase-I status

Phase-I is complete and preserved as a historical baseline. It is **not** the initialization point for the active generation.

Key historical facts:

| Item | Phase-I result |
|---|---:|
| Parameters | 1,048,780,544 |
| Processed tokens | 1,000,005,632 |
| Final step | 122,071 |
| Best checkpoint | step 122,000 |
| Training hardware | 1× RTX 4070 Ti SUPER 16 GB |
| Precision | BF16 |

Detailed Phase-I reports remain under `docs/history/github/`.

## Status

**Current stage:** corpus engineering and tokenizer qualification for the fresh scratch generation.

Weights for the new generation do not exist yet. No claim is made that CetinLM is currently a finished assistant. Public results will be updated only after measured gates are completed.
