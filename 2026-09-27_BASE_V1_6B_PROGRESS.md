<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM" width="230">
</p>

<h1 align="center">CetinLM Base-v1 — 6.00B Progress</h1>

<p align="center">
  <strong>Single-GPU pretraining · 6 billion processed tokens · new best validation checkpoint · 2026-09-27</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/processed_tokens-6.00B-111111" alt="6.00B processed tokens">
  <img src="https://img.shields.io/badge/val_loss-2.461529-111111" alt="Validation loss 2.461529">
  <img src="https://img.shields.io/badge/PPL-11.723-111111" alt="Perplexity 11.723">
  <img src="https://img.shields.io/badge/checkpoint-NEW_BEST-111111" alt="New best checkpoint">
</p>

---

## Milestone snapshot

| Signal | 6.00B result |
|---|---:|
| Processed tokens | **6,000,000,000** |
| Validation loss | **2.461529** |
| Perplexity | **11.723** |
| Checkpoint | **NEW BEST** |
| `P(EOS@end)` | **0.4241** |
| EOS top-1 | **47.5%** |
| EOS top-5 | **75.0%** |
| Median EOS rank | **2.0** |
| After EOS `P(BOS)` | **1.0000** |
| After EOS `P(EOS)` | **0.0000** |

CetinLM Base-v1 remains a raw pretrained base model. No instruction tuning, assistant SFT, reasoning SFT, RLHF, or other post-training stage is represented by these numbers.

---

## Progress since the 5.15B public snapshot

| Milestone | Validation loss | PPL |
|---:|---:|---:|
| 5.15B | 2.496678 | 12.142 |
| 5.20B | 2.493657 | 12.105 |
| 5.25B | 2.491108 | 12.075 |
| 5.30B | 2.492968 | 12.097 |
| 5.35B | 2.488474 | 12.043 |
| 5.40B | 2.486824 | 12.023 |
| 5.45B | 2.485931 | 12.012 |
| 5.50B | 2.483149 | 11.979 |
| 5.55B | 2.476842 | 11.904 |
| 5.60B | 2.476152 | 11.895 |
| 5.65B | 2.474312 | 11.874 |
| 5.70B | 2.469720 | 11.819 |
| 5.75B | 2.469821 | 11.820 |
| 5.80B | 2.466892 | 11.786 |
| 5.85B | 2.466171 | 11.777 |
| 5.90B | 2.465040 | 11.764 |
| 5.95B | 2.462849 | 11.738 |
| **6.00B** | **2.461529** | **11.723** |

Across the **5.15B → 6.00B** interval, validation loss moved from **2.496678 → 2.461529** and perplexity from **12.142 → 11.723** over **850M additional processed tokens**.

For broader context, the 4.80B checkpoint measured **2.513649 / 12.350**. At 6.00B the same held-out validation protocol reports **2.461529 / 11.723**.

---

## Per-dataset validation @ 6.00B

| Held-out family | Loss |
|---|---:|
| `first_party_main` | **1.357446** |
| `first_party_wiki` | **2.829624** |
| `finewiki_tr` | **2.210919** |
| `finewiki_en` | **2.002110** |
| `temiz_oscar` | **2.682178** |

The split view is retained because the global average alone can hide source-family movement.

---

## RAW GREEDY stress probe

At 6.00B, the fixed 25-case raw-greedy diagnostic reported:

- EOS stops: **10/25**
- loop triggers: **7/25**
- length limit: **8/25**
- average generated tokens: **61.6**

> **Important:** RAW GREEDY is a diagnostic stress test. It is intentionally harsh and is **not** a user-facing loop-rate claim.

---

## 6.00B sampled generation health

The 6.00B milestone includes a larger **1,000-generation** sampled behavior run using the current `web-balanced-v1` policy:

```text
n=1000 · T=0.80 · p=0.92 · k=50 · repetition penalty=1.08 · ngram=4
```

| Mechanical generation-health signal | Result |
|---|---:|
| EOS stops | **435 / 1000** |
| Loop incidents | **3 / 1000 (0.300%)** |
| Severe loops | **0 / 1000 (0.000%)** |
| Length limit | **562 / 1000** |
| Repetition burden | **0.012%** |
| Repeated / generated tokens | **12 / 102,698** |
| Average generated tokens | **102.7** |

This sampled run is reported separately from RAW GREEDY because the two probes serve different purposes: RAW GREEDY stresses the raw checkpoint, while sampled behavior estimates mechanical generation health under the web-facing generation policy.

For reference, the earlier 5.00B `n=1000` run measured **5/1000 loop incidents (0.500%)**, **0 severe loops**, and **0.020% repetition burden** under the same named sampling policy.

---

## EOS boundary health

At 6.00B:

- `P(EOS@end)=0.4241`
- top-1 EOS: **47.5%**
- top-5 EOS: **75.0%**
- median EOS rank: **2.0**
- post-boundary transition: `P(BOS)=1.0000`, `P(EOS)=0.0000`

Boundary health and free-generation stopping remain separate diagnostics because they measure different behaviors.

---

## Runtime context

The active Base-v1 line remains the same protected ~1.18B-parameter architecture and frozen tokenizer/data lineage used throughout this training run.

CetinLM Live, memory, speech, UI, and other product/runtime work are separate from Base-v1 processed-token accounting and do not alter these pretraining measurements.

---

## Public interpretation boundary

The 6.00B checkpoint records continued held-out improvement and a new best validation checkpoint while the larger sampled generation-health run remains mechanically clean under the reported policy.

These results describe the pretrained base model only. They do not represent final assistant behavior, post-training quality, reasoning benchmarks, coding benchmarks, safety evaluation, or leaderboard claims.

---

## Continuing research

This file closes the standalone **6.00B public milestone snapshot**.

Future checkpoints will continue to be recorded, but the most current and more detailed training metrics, validation history, generation-health measurements, and research updates are maintained on the live Research page:

<p align="center">
  <strong><a href="https://cetinlm.meforcetechnology.com/research">Latest CetinLM Research & Training Metrics →</a></strong>
</p>

For the latest numbers, use the Research page as the current source of truth. Historical milestone files in this repository remain preserved as dated public records.

---

<p align="center">
  <a href="./README.md">← Public Research Hub</a> ·
  <a href="./TECHNICAL_OVERVIEW.md">Technical Overview</a> ·
  <a href="./THIRD_PARTY_DATA.md">Data & Third-Party Provenance</a> ·
  <a href="https://cetinlm.meforcetechnology.com/research">Live Research</a>
</p>
