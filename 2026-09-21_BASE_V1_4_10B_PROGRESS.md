# CetinLM Base-v1 — 4.10B Progress Update

**Date:** 2026-09-21  
**Status:** active Base-v1 pretraining; current public milestone

This note records the public-safe 4.10B Base-v1 milestone. It is additive history and does not replace earlier milestone records.

## Current milestone

- processed tokens: **4.10B+**
- validation loss: **2.555976**
- perplexity: **12.884**
- checkpoint status: **NEW BEST**

Recent held-out trajectory:

| Milestone | Validation loss | PPL |
|---:|---:|---:|
| 3.90B | 2.567553 | 13.034 |
| 3.95B | 2.566619 | 13.022 |
| 4.00B | 2.566363 | 13.018 |
| 4.05B | 2.563374 | 12.980 |
| 4.10B | **2.555976** | **12.884** |

The 3.90B → 4.10B window is a net **-0.011577** validation-loss change over roughly 200M processed tokens. Local validation wobble remains visible rather than being smoothed away.

## EOS boundary snapshot

At 4.10B:

- `P(EOS@end)=0.3592`
- EOS top-1: **42.5%**
- EOS top-5: **77.5%**
- median EOS rank: **2.0**
- after EOS: `P(BOS)=1.0000`, `P(EOS)=0.0000`

Per-dataset validation losses:

- first_party_main: **1.420952**
- first_party_wiki: **2.894437**
- finewiki_tr: **2.276143**
- finewiki_en: **2.068868**
- temiz_oscar: **2.739183**

## Generation-health separation

CetinLM intentionally keeps harsh raw-greedy diagnostics separate from sampled, user-facing mechanical generation health.

At 4.10B, the 25-case raw-greedy stress probe reported:

- EOS stops: **8/25**
- loop triggers: **4/25**
- length limit: **13/25**
- average generated tokens: **63.0**

This is explicitly a diagnostic stress test, not a product-facing loop-rate claim.

At 4.00B, the separate `web-balanced-v1` 1,000-sample run reported:

- EOS stops: **456/1000**
- loop incidents: **0/1000**
- severe loops: **0/1000**
- length limit: **544/1000**
- measured repetition burden: **0.000% (0 / 100,325 generated tokens)**
- average generated tokens: **100.3**

The purpose of publishing both is to avoid hiding raw failure modes while also measuring behavior closer to the web inference path.

## Interpretation boundary

These are measurements from an actively trained raw Base-v1 checkpoint. They are not claims of final assistant quality, benchmark leadership, post-training capability or release readiness.

The active pretraining run remains protected by fail-closed data/runtime/checkpoint qualification and continues under the supervised Base-v1 production entrypoint.
