<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM" width="250">
</p>

<h1 align="center">CetinLM Public Research Hub</h1>

<p align="center">
  <strong>Independent language-model research · single-GPU Base-v1 pretraining · live multimodal product engineering</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Base--v1-1.18B_params-111111" alt="Base-v1 1.18B parameters">
  <img src="https://img.shields.io/badge/processed_tokens-5.15B-111111" alt="5.15B processed tokens">
  <img src="https://img.shields.io/badge/val_loss-2.496678-111111" alt="Validation loss 2.496678">
  <img src="https://img.shields.io/badge/PPL-12.142-111111" alt="PPL 12.142">
  <img src="https://img.shields.io/badge/status-active_research-111111" alt="Active research">
</p>

---

## Current public checkpoint

<table>
<tr>
<td width="25%" align="center"><strong>5.15B</strong><br><sub>processed tokens</sub></td>
<td width="25%" align="center"><strong>2.496678</strong><br><sub>validation loss</sub></td>
<td width="25%" align="center"><strong>12.142</strong><br><sub>perplexity</sub></td>
<td width="25%" align="center"><strong>NEW BEST</strong><br><sub>checkpoint status</sub></td>
</tr>
</table>

The active Base-v1 run is still pretraining. The latest public milestone is **5.15B processed tokens**, with a new best held-out validation result.

### Latest research update

➡️ **[5.15B Progress — 2026-09-25](./2026-09-25_BASE_V1_5_15B_PROGRESS.md)**

The 5.15B note includes the recent **4.80B → 5.15B** validation trajectory, per-dataset losses, EOS boundary health, RAW GREEDY diagnostics, and the 5.00B **1,000-sample `web-balanced-v1` generation-health run**.

---

## Measured trajectory

| Milestone | Val loss | PPL | Status |
|---:|---:|---:|---|
| 3.15B | 2.623482 | 13.784 | historical milestone |
| 4.10B | 2.555976 | 12.884 | historical milestone |
| 4.80B | 2.513649 | 12.350 | recent window |
| 5.00B | 2.500880 | 12.193 | sampled-health milestone |
| **5.15B** | **2.496678** | **12.142** | **current best** |

Across **4.80B → 5.15B**, held-out loss improved by **0.016971** over roughly **350M processed tokens**. Short-range movement is not hidden; plateau interpretation is based on wider windows rather than a single 50M validation point.

---

## Generation health at 5.00B

The current public sampled-behavior reference uses `web-balanced-v1` over **1,000 generations**:

<table>
<tr>
<td width="25%" align="center"><strong>0.500%</strong><br><sub>loop incidents</sub></td>
<td width="25%" align="center"><strong>0.000%</strong><br><sub>severe loops</sub></td>
<td width="25%" align="center"><strong>0.020%</strong><br><sub>repetition burden</sub></td>
<td width="25%" align="center"><strong>101.6</strong><br><sub>avg generated tokens</sub></td>
</tr>
</table>

RAW GREEDY remains a separate stress diagnostic and must not be read as a product-facing loop rate.

---

## What CetinLM is building

<table>
<tr>
<td width="33%" valign="top"><strong>Base model</strong><br><br>~1.18B-parameter decoder-only language model trained from scratch with a custom 48K tokenizer and frozen qualified corpus.</td>
<td width="33%" valign="top"><strong>Training system</strong><br><br>Fail-closed qualification, checkpoint recovery, document-aware packed attention, structured telemetry, boundary health, and generation diagnostics.</td>
<td width="33%" valign="top"><strong>Live runtime</strong><br><br>Realtime speech, synchronized text/audio presentation, interruption handling, local voice runtime, shared memory, and interactive product research around the protected Base-v1 lineage.</td>
</tr>
</table>

Runtime/product work does **not** change Base-v1 token accounting or silently modify the frozen training lineage.

---

## Public research map

### Progress archive

- [Base-v1 Foundation Freeze — 2026-09-07](./2026-09-07_BASE_V1_FOUNDATION_FREEZE.md)
- [Runtime Engineering Recap — 2026-09-08](./2026-09-08_RUNTIME_ENGINEERING_RECAP.md)
- [34M Progress — 2026-09-09](./2026-09-09_BASE_V1_34M_PROGRESS.md)
- [1.20B Progress — 2026-09-12](./2026-09-12_BASE_V1_1_2B_PROGRESS.md)
- [3.15B Progress — 2026-09-18](./2026-09-18_BASE_V1_3_15B_PROGRESS.md)
- [4.10B Progress — 2026-09-21](./2026-09-21_BASE_V1_4_10B_PROGRESS.md)
- **[5.15B Progress — 2026-09-25](./2026-09-25_BASE_V1_5_15B_PROGRESS.md)**

### Engineering and provenance

- [Technical Overview](./TECHNICAL_OVERVIEW.md)
- [Model Factory](./MODEL_FACTORY.md)
- [Third-Party Data & Runtime Provenance](./THIRD_PARTY_DATA.md)
- [CetinLM V6 Live / Memory / Presence update](../CETINLM_V6_LIVE_MEMORY_PRESENCE_20260924.md)

---

## Third-party runtime notice

CetinLM Live optionally integrates separately licensed speech components. In particular, **Resemble AI Chatterbox Multilingual V3** is used as a Live text-to-speech runtime component and remains subject to its upstream **MIT License**. It is not Base-v1 training data and is not claimed as CetinLM-owned technology.

See:

- [`THIRD_PARTY_DATA.md`](./THIRD_PARTY_DATA.md)
- [`LICENSES/`](./LICENSES/) — public third-party license notices
- [`./LICENSES/CHATTERBOX_MIT.txt`](./LICENSES/CHATTERBOX_MIT.txt)
- [`./LICENSES/FASTER_WHISPER_MIT.txt`](./LICENSES/FASTER_WHISPER_MIT.txt)

---

## Interpretation boundary

CetinLM publishes measured training and generation-health signals without presenting raw Base-v1 as a finished assistant.

Current numbers are **research telemetry**, not claims of:

- final reasoning quality;
- final coding ability;
- benchmark leadership;
- factual reliability;
- safety readiness;
- production release readiness.

Those require later post-training and dedicated evaluation.

---

<p align="center">
  <strong>Build the model. Build the measurement system. Build the runtime. Keep the evidence.</strong>
</p>
