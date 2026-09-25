<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM" width="230">
</p>

<h1 align="center">CetinLM Base-v1 — 5.15B Progress</h1>

<p align="center">
  <strong>Single-GPU pretraining · new best validation checkpoint · 2026-09-25</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/processed_tokens-5.15B-111111" alt="5.15B processed tokens">
  <img src="https://img.shields.io/badge/val_loss-2.496678-111111" alt="Validation loss 2.496678">
  <img src="https://img.shields.io/badge/PPL-12.142-111111" alt="Perplexity 12.142">
  <img src="https://img.shields.io/badge/checkpoint-NEW_BEST-111111" alt="New best checkpoint">
</p>

---

## Milestone snapshot

| Signal | 5.15B result |
|---|---:|
| Processed tokens | **5,150,000,000** |
| Validation loss | **2.496678** |
| Perplexity | **12.142** |
| Checkpoint | **NEW BEST** |
| `P(EOS@end)` | **0.3994** |
| EOS top-1 | **45.0%** |
| EOS top-5 | **75.0%** |
| Median EOS rank | **2.0** |
| After EOS `P(BOS)` | **1.0000** |
| After EOS `P(EOS)` | **0.0000** |

CetinLM Base-v1 remains an actively trained raw pretrained model. These measurements describe the current training trajectory; they are not claims of final assistant quality, benchmark leadership, or post-training capability.

---

## Recent held-out trajectory

| Milestone | Validation loss | PPL |
|---:|---:|---:|
| 4.80B | 2.513649 | 12.350 |
| 4.85B | 2.504830 | 12.241 |
| 4.90B | 2.502269 | 12.210 |
| 4.95B | 2.501286 | 12.198 |
| 5.00B | 2.500880 | 12.193 |
| 5.05B | 2.503461 | 12.225 |
| 5.10B | 2.502036 | 12.207 |
| **5.15B** | **2.496678** | **12.142** |

Across the **4.80B → 5.15B** observation window, validation loss moved from **2.513649 → 2.496678** and perplexity from **12.350 → 12.142** over roughly **350M processed tokens**. Short-range validation wobble remains visible, but the wider window still shows a clear net held-out improvement.

CetinLM does not infer plateau status from a single 50M validation step. Wider windows and repeated milestones are used to distinguish local noise from a real flattening of the training trajectory.

---

## Per-dataset validation

| Held-out family | Loss @ 5.15B |
|---|---:|
| `first_party_main` | **1.386803** |
| `first_party_wiki` | **2.864065** |
| `finewiki_tr` | **2.225713** |
| `finewiki_en` | **2.020296** |
| `temiz_oscar` | **2.697064** |

The split view is retained because a single global average can hide source-family regressions or local instability.

---

## RAW GREEDY stress probe

At 5.15B, the fixed 25-case raw-greedy diagnostic reported:

- EOS stops: **7/25**
- loop triggers: **4/25**
- length limit: **14/25**
- average generated tokens: **70.4**

> **Important:** this is a diagnostic stress test. It is intentionally harsh and is **not** a user-facing loop-rate claim.

---

## 5.00B sampled generation-health checkpoint

The 5.00B milestone also introduced a larger **1,000-generation** sampled behavior run using the current `web-balanced-v1` policy:

```text
n=1000 · T=0.80 · p=0.92 · k=50 · repetition penalty=1.08 · ngram=4
```

| Mechanical generation-health signal | Result |
|---|---:|
| EOS stops | **393 / 1000** |
| Loop incidents | **5 / 1000 (0.500%)** |
| Severe loops | **0 / 1000 (0.000%)** |
| Length limit | **602 / 1000** |
| Repetition burden | **0.020%** |
| Repeated / generated tokens | **20 / 101,597** |
| Average generated tokens | **101.6** |

This sampled run is reported separately from RAW GREEDY because the two probes answer different questions: one stresses the raw checkpoint, while the other estimates mechanical generation health under the web-facing sampling policy.

---

## EOS boundary health

At 5.15B:

- `P(EOS@end)=0.3994`
- top-1 EOS: **45.0%**
- top-5 EOS: **75.0%**
- median EOS rank: **2.0**
- post-boundary transition: `P(BOS)=1.0000`, `P(EOS)=0.0000`

Boundary health and free-generation stopping are tracked separately because they measure different behaviors.

---

## Runtime context

The active Base-v1 line remains the same protected ~1.18B-parameter architecture and frozen data/tokenizer lineage. The current production stack continues to use bounded supervision, fail-closed qualification, resumable checkpointing, and checkpoint-time CUDA hygiene.

CetinLM Live is being developed as a separate runtime/product layer around the model. Live speech, TTS, STT, UI, memory, and interaction engineering do not alter Base-v1 processed-token accounting.

---

## Public interpretation boundary

The public evidence at 5.15B supports a narrow conclusion:

> **The qualified Base-v1 training run continues to produce measurable held-out improvement over a multi-hundred-million-token window while current boundary and sampled mechanical generation-health diagnostics remain observable and separately reported.**

It does not establish final reasoning, coding, factuality, safety, chat quality, or benchmark leadership. Those require later post-training and dedicated evaluation.

---

<p align="center">
  <a href="./README.md">← Public Research Hub</a> ·
  <a href="./TECHNICAL_OVERVIEW.md">Technical Overview</a> ·
  <a href="./THIRD_PARTY_DATA.md">Data & Third-Party Provenance</a>
</p>
