<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM" width="250">
</p>

<h1 align="center">CetinLM Public Research Hub</h1>

<p align="center">
  <strong>Independent language-model research · Base-v1 pretraining · live multimodal product engineering</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Base--v1-1.18B_params-111111" alt="Base-v1 1.18B parameters">
  <img src="https://img.shields.io/badge/status-active_research-111111" alt="Active research">
</p>

---

## Live research status

CetinLM Base-v1 is an actively trained research model. Training telemetry changes frequently, so this README intentionally does **not** mirror a moving token count, validation loss, perplexity, or generation-health snapshot.

For the latest public training milestone, validation results, per-dataset metrics, EOS health, and sampled generation-health measurements, use the canonical live research page:

### **[Latest CetinLM Research & Training Metrics → cetinlm.meforcetechnology.com/research](https://cetinlm.meforcetechnology.com/research)**

Historical milestone notes remain preserved in this repository as an archive. The research page above is the source to check for the newest published values.

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

## Public research archive

Historical milestone notes remain preserved in this repository as point-in-time records. They are intentionally not mirrored into this README as a rolling metric table.

For the newest published values, always use the **[live Research page](https://cetinlm.meforcetechnology.com/research)**.

### Engineering and provenance

- [Technical Overview](./TECHNICAL_OVERVIEW.md)
- [Model Factory](./MODEL_FACTORY.md)
- [Third-Party Data & Runtime Provenance](./THIRD_PARTY_DATA.md)

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

Research telemetry is not, by itself, a claim of:

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
