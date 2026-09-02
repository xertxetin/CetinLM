# CetinLM Developer Log — 2026-09-02

**Status:** active redesign / corpus qualification  
**Generation:** fresh-scratch CetinLM-1B  
**Focus:** capability-dense data, fast precision filtering, first-party Turkish corpora, measured tokenizer selection

## Why CetinLM changed direction

Today marks a practical redesign of the CetinLM data strategy.

The first generation proved that the model architecture, training stack, checkpointing, evaluation flow, and single-GPU engineering path work. It also made one limitation very clear: for a compact ~1B model, simply feeding more generic web or encyclopedia text is not enough. A small model has a limited token budget and limited capacity. Low-value tail data can consume that budget without teaching the capabilities users actually expect.

The new direction is therefore simple:

> **Every token should earn its place.**

CetinLM will still use natural Turkish and English text, but raw volume is no longer the primary objective. The active corpus is being designed around usefulness, verification, diversity, and capability coverage.

## Active model design

The transformer body is intentionally stable while the corpus and tokenizer are qualified.

| Component | Active design |
|---|---:|
| Layers | 20 |
| Hidden size | 1,792 |
| Query heads | 28 |
| KV heads | 7 |
| Head dimension | 64 |
| MLP | SwiGLU, 7,168 intermediate |
| Normalization | Pre-RMSNorm |
| Positional encoding | RoPE |
| Attention | GQA / SDPA |
| Embeddings | tied input/output |
| Bias / dropout | none |
| Maximum configured context | 4,096 |

The active model will be trained **from scratch**. Phase-I weights and tokenizer are historical research artifacts, not initialization requirements for the new generation.

## Corpus design: capability-centric instead of volume-centric

The current corpus plan separates data into useful capability families rather than treating all Turkish text as equivalent.

Planned / active families include:

- high-quality natural Turkish and English;
- Turkish general and everyday utility;
- Turkish research / grounded knowledge;
- Turkish culture and daily life;
- youth / practical knowledge;
- mathematics and quantitative reasoning;
- code and algorithms;
- core science;
- technical knowledge;
- language, grammar, and writing diversity;
- curated Wikipedia-derived Turkish prose.

The objective is a **task-dense base-pretraining corpus**. This is not instruction tuning. The data should teach concepts, procedures, relationships, useful facts, natural language patterns, and problem-solving primitives before later post-training.

## Natural-data pipeline frozen at v61.2

The natural-data cleaning path reached a good speed/precision balance today and is now treated as the stable baseline.

The active remote bootstrap is:

| Source | Temporary remote share | Role |
|---|---:|---|
| FineWeb-Edu Dedup (EN) | 30% | high-quality English educational/general prose |
| English Wikipedia | 5% | English natural/reference anchor |
| Turkish FineWiki | 65% | Turkish natural/reference anchor |

This is a **bootstrap mix**, not the final training mixture. First-party Turkish corpora are expected to replace a substantial part of the Turkish natural-data lane after qualification.

TurkishFineWeb2 remains disabled from active acquisition. Its filters are retained for regression/history, but its low yield made it inefficient for the current large-scale workflow.

### v61.2 FINAL-FLOOR

The Turkish FineWiki path now has a final fail-closed invariant: documents with a final quality score below **75/100** cannot enter the clean cache.

The important design choice is that this does **not** add another expensive text pass. The score already exists; the final floor is a cheap comparison plus a cache-row safety invariant.

Latest 300K-character qualification audit:

| Source | Accepted quality average | Accepted minimum |
|---|---:|---:|
| EN FineWeb-Edu | 88.12 | 85.97 |
| TR FineWiki | 84.09 | 75.02 |

In the same run, **59 Turkish FineWiki documents** were rejected by the v61.2 final score floor.

The natural-data filter is deliberately being frozen here. Further quality gains should come primarily from better source selection and first-party data, not from turning the pipeline back into a slow chain of increasingly expensive web heuristics.

## Speed is now a design constraint

Earlier corpus versions could become bottlenecked by low-yield sources, oversized reserve behavior, and expensive filtering paths. The current generation treats throughput as part of data quality engineering.

The rule is:

> **Reject cheaply when confidence is high; spend expensive verification only where factual risk justifies it.**

Examples:

- raw web data: aggressive fail-closed filtering;
- controlled general/youth/culture data: fast structural, language, repetition, diversity, and obvious-error filtering;
- mathematics: much stricter deterministic verification;
- science/technical: stronger factual checks where claims are high-risk or systematic.

This allows CetinLM to process much larger first-party datasets without reintroducing the performance problems of earlier web-heavy pipelines.

## First-party Turkish data

A major part of the redesign is the move toward controlled Turkish datasets generated and curated by capability.

The first-party lane is not assumed to be perfect and does not bypass filtering. Its advantage is **control**: topic selection, language, structure, intended capability, and generation process are known.

Current design goals for first-party data:

- clean JSONL training text;
- generator state/checkpoint files excluded from training;
- SHA256 provenance for every input;
- exact and near-duplicate filtering;
- opening/ending/template concentration checks;
- n-gram and paragraph repetition checks;
- language and obvious corruption checks;
- topic and length diversity;
- source-family-specific validation;
- fail-closed rejection for clearly bad examples.

The target is not theoretical perfection. The target is a corpus with **very high signal-to-noise ratio and low systematic error**.

## Mathematics redesign

Mathematics received special attention today.

The first math generator showed an important failure mode of synthetic data: polished instructional prose can still contain confidently stated mathematical errors. The generator was therefore revised rather than accepted blindly.

The current mathematics plan has two complementary lanes.

### 1. Math Knowledge

Conceptual pretraining text covering definitions, relationships, worked explanations, notation, and mathematical language.

This lane teaches the model how mathematics is described and connected.

### 2. Verified Math Reasoning — next major addition

A separate generator will produce machine-verifiable problem-solving data with structures such as:

```text
problem
→ reasoning / intermediate steps
→ answer
→ deterministic check
```

It will also include contrastive examples:

```text
wrong solution
→ identify the error
→ correct solution
→ verification
```

Where possible, answers and symbolic relations will be generated or checked with Python/SymPy rather than trusting a language model to be its own verifier.

This is an important distinction: **Math Knowledge teaches mathematical concepts; Verified Math Reasoning teaches the model to actually perform and check mathematical operations.**

Verified Math Reasoning is now an explicit planned work item and should not be lost in later corpus work.

## Everyday usefulness matters

The new corpus is intentionally biased toward knowledge and procedures a small assistant is likely to need in real conversations.

Examples include:

- basic geography and common knowledge;
- dates, time, percentages, units, and everyday arithmetic;
- phone and PC comparisons;
- RAM, storage, battery, camera, processors, and software support;
- banking, shopping, travel, home, food, school, and work concepts;
- practical “which is better?” and “what should I look for?” reasoning;
- natural conversational Turkish variants.

A compact model should not spend most of its capacity memorizing obscure encyclopedia tails while failing simple practical questions.

## Tokenizer plan

The tokenizer will also be trained from scratch after the tokenizer-independent clean cache is audited.

Candidates:

- 32,768
- 49,152
- 65,536

All candidates use ByteLevel BPE with NFC normalization, complete byte coverage, and fixed special-token IDs.

The final vocabulary size will be selected by measured Turkish/English fertility, compression, round-trip correctness, and held-out benchmarking. No candidate is considered final until explicitly frozen and SHA-pinned.

## Qualification pipeline

The current high-level sequence is:

```text
immutable source / release verification
→ tokenizer-independent clean cache
→ verify + human audit
→ first-party capability qualification
→ exact / near dedup + diversity control
→ tokenizer 32K / 48K / 65K A/B
→ held-out tokenizer benchmark
→ explicit tokenizer freeze by SHA
→ 1M-token corpus pilot
→ human audit
→ 10M-token scale gate
→ human audit
→ freeze data/tokenizer contracts
→ measured final corpus build
→ deep verification
→ GPU/context profiling + canary/resume test
→ fresh-scratch CetinLM-1B training
→ evaluation
→ later post-training / assistant alignment
```

The final corpus token count and exact family ratios remain intentionally unfrozen. They will be chosen after measuring qualified data volume, tokenizer efficiency, diversity, and capability coverage.

## What is frozen today

As of 2026-09-02:

- fresh-scratch CetinLM-1B direction: **frozen**;
- Phase-I as history/reference only: **frozen**;
- stable 20-layer / 1,792-hidden transformer body: **current baseline**;
- natural-data filter v61.2 FINAL-FLOOR: **frozen baseline**;
- TurkishFineWeb2 active acquisition: **disabled**;
- precision-first / trusted-first philosophy: **frozen**;
- first-party capability-centric corpus direction: **active**;
- fresh tokenizer A/B before training: **active plan**;
- Verified Math Reasoning: **explicit next math milestone**.

## Next work

The immediate development focus is no longer another round of web-filter regexes. The next gains should come from corpus capability quality.

Priority work:

1. continue producing and improving controlled Turkish capability datasets;
2. implement the first-party corpus assembler / qualification path;
3. add deterministic and source-family-specific validators;
4. build **Verified Math Reasoning**;
5. add code, science, technical, and everyday-utility families;
6. measure family sizes and diversity before assigning final mixture ratios;
7. train and benchmark tokenizer candidates;
8. run 1M and 10M qualification gates before committing to the final corpus.

## Research hypothesis

The current CetinLM generation is testing a simple hypothesis:

> **For a compact language model, a smaller but capability-dense, well-filtered, and selectively verified corpus can be more useful than a much larger generic corpus with weak task density.**

The project will evaluate that hypothesis through measured tokenizer behavior, held-out data audits, training curves, downstream capability tests, and direct comparisons with the historical Phase-I baseline.

---

Older Phase-I development reports, optimization notes, and previous corpus specifications are archived under [`phase1/`](./phase1/) and are retained for provenance only. They do not override the active project direction described here or in the current README.
