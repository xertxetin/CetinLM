<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM" width="250">
</p>

<h1 align="center">CetinLM Public Research Hub</h1>

<p align="center">
  <strong>Independent language-model research · from tokenizer and data to training, evaluation and realtime interaction</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Base--v1-1.18B_params-111111" alt="Base-v1 1.18B parameters">
  <img src="https://img.shields.io/badge/tokenizer-CetinTokenizer--v1_48K-111111" alt="CetinTokenizer-v1 48K">
  <img src="https://img.shields.io/badge/context-2K-111111" alt="2K training context">
  <img src="https://img.shields.io/badge/status-active_research-111111" alt="Active research">
</p>

<p align="center">
  <a href="https://cetinlm.meforcetechnology.com/research"><strong>→ Latest training metrics, validation history and research telemetry</strong></a>
</p>

---

## Live research, one canonical source

CetinLM is under active pretraining, so processed-token counts, validation loss, perplexity and generation-health measurements continue to move.

Rather than rewriting the same changing numbers across multiple public surfaces, the **current research state is maintained on the CetinLM Research page**:

### **[cetinlm.meforcetechnology.com/research](https://cetinlm.meforcetechnology.com/research)**

This repository remains the durable public research archive: architecture context, dated milestones, provenance notes, historical measurements and engineering documentation stay here. The website is the canonical surface for the **latest** training values.

---

## Public reference snapshot — 5.15B

The following values are intentionally preserved as a dated research snapshot rather than treated as permanently current metrics.

<table>
<tr>
<td width="25%" align="center"><strong>5.15B</strong><br><sub>processed tokens</sub></td>
<td width="25%" align="center"><strong>2.496678</strong><br><sub>validation loss</sub></td>
<td width="25%" align="center"><strong>12.142</strong><br><sub>perplexity</sub></td>
<td width="25%" align="center"><strong>NEW BEST</strong><br><sub>checkpoint status at snapshot</sub></td>
</tr>
</table>

### Reference trajectory

| Milestone | Val loss | PPL | Note |
|---:|---:|---:|---|
| 3.15B | 2.623482 | 13.784 | historical milestone |
| 4.10B | 2.555976 | 12.884 | historical milestone |
| 4.80B | 2.513649 | 12.350 | reference window |
| 5.00B | 2.500880 | 12.193 | sampled-health milestone |
| **5.15B** | **2.496678** | **12.142** | **archived snapshot** |

Across the archived **4.80B → 5.15B** window, held-out validation loss moved from **2.513649 → 2.496678** while the run continued to set new best checkpoints.

➡️ **[Read the dated 5.15B progress note](./2026-09-25_BASE_V1_5_15B_PROGRESS.md)**

For everything after this snapshot, use the **[live Research page](https://cetinlm.meforcetechnology.com/research)**.

---

## Generation health reference

At the 5.00B checkpoint, a separate **1,000-generation** `web-balanced-v1` sampled-behavior run recorded:

<table>
<tr>
<td width="25%" align="center"><strong>0.500%</strong><br><sub>loop incidents</sub></td>
<td width="25%" align="center"><strong>0.000%</strong><br><sub>severe loops</sub></td>
<td width="25%" align="center"><strong>0.020%</strong><br><sub>repetition burden</sub></td>
<td width="25%" align="center"><strong>101.6</strong><br><sub>avg generated tokens</sub></td>
</tr>
</table>

The 25-case **RAW GREEDY STRESS PROBE** is deliberately harsher and remains a diagnostic stress test. It must not be interpreted as a user-facing loop-rate estimate.

Latest sampled-behavior measurements are published with the current training telemetry on the **[Research page](https://cetinlm.meforcetechnology.com/research)**.

---

## What CetinLM is building

<table>
<tr>
<td width="33%" valign="top"><strong>Base model</strong><br><br>~1.18B-parameter decoder-only language model trained from scratch with a custom 48K tokenizer and a frozen qualified corpus.</td>
<td width="33%" valign="top"><strong>Training & evaluation</strong><br><br>Checkpoint recovery, structured validation telemetry, dataset-level tracking, EOS-boundary health and separate generation diagnostics.</td>
<td width="33%" valign="top"><strong>Live runtime</strong><br><br>Realtime speech, synchronized text/audio interaction, interruption handling, local voice processing and persistent interaction research around the protected Base-v1 lineage.</td>
</tr>
</table>

Runtime and product work do **not** alter Base-v1 token accounting or silently rewrite the frozen training lineage.

---

## Base-v1 at a glance

| Property | Public reference |
|---|---|
| Model family | CetinLM Base-v1 |
| Architecture | Decoder-only language model |
| Parameters | ~1.18B |
| Tokenizer | CetinTokenizer-v1 |
| Vocabulary | 48K |
| Active training context | 2K |
| Frozen corpus size | ~11.39B unique training tokens |
| Training status | Active pretraining research |

**Processed tokens are training exposure, not unique corpus size.** The latest exposure count belongs on the live Research page rather than being duplicated here.

---

## Public research map

### Milestone archive

- [Base-v1 Foundation Freeze — 2026-09-07](./2026-09-07_BASE_V1_FOUNDATION_FREEZE.md)
- [Runtime Engineering Recap — 2026-09-08](./2026-09-08_RUNTIME_ENGINEERING_RECAP.md)
- [34M Progress — 2026-09-09](./2026-09-09_BASE_V1_34M_PROGRESS.md)
- [1.20B Progress — 2026-09-12](./2026-09-12_BASE_V1_1_2B_PROGRESS.md)
- [3.15B Progress — 2026-09-18](./2026-09-18_BASE_V1_3_15B_PROGRESS.md)
- [4.10B Progress — 2026-09-21](./2026-09-21_BASE_V1_4_10B_PROGRESS.md)
- [5.15B Progress — 2026-09-25](./2026-09-25_BASE_V1_5_15B_PROGRESS.md)

### Engineering & provenance

- [Technical Overview](./TECHNICAL_OVERVIEW.md)
- [Model Factory](./MODEL_FACTORY.md)
- [Third-Party Data & Runtime Provenance](./THIRD_PARTY_DATA.md)
- [Third-Party License Notices](./LICENSES/)

---

## Third-party runtime notice

CetinLM Live optionally integrates separately licensed speech components. **Resemble AI Chatterbox Multilingual V3** is used as a Live text-to-speech runtime component and remains subject to its upstream **MIT License**. It is not Base-v1 training data and is not claimed as CetinLM-owned technology.

Public notices:

- [`THIRD_PARTY_DATA.md`](./THIRD_PARTY_DATA.md)
- [`LICENSES/`](./LICENSES/)
- [`LICENSES/CHATTERBOX_MIT.txt`](./LICENSES/CHATTERBOX_MIT.txt)
- [`LICENSES/FASTER_WHISPER_MIT.txt`](./LICENSES/FASTER_WHISPER_MIT.txt)

---

## Interpretation boundary

CetinLM publishes measured training and generation-health signals without presenting the raw Base-v1 checkpoint as a finished assistant.

Pretraining telemetry is not, by itself, a claim of final instruction following, reasoning, coding, factual reliability, safety readiness or benchmark leadership. Those require post-training and dedicated evaluation.

---

<p align="center">
  <strong>Build the model. Measure it honestly. Keep the history. Let the live research page carry the moving numbers.</strong>
</p>
