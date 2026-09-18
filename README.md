<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="270px">
</p>

<h1 align="center">CetinLM — Public Research Log</h1>

<p align="center">
  <strong>From-scratch language-model research. Built in public, without publishing the private blueprint.</strong><br>
  <em>The checkpoint is an output. The system that produces it is the research.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Base--v1-active%20pretraining-111111" alt="Base-v1 active pretraining">
  <img src="https://img.shields.io/badge/scale-~1.18B-111111" alt="~1.18B parameters">
  <img src="https://img.shields.io/badge/tokenizer-48K-111111" alt="48K tokenizer">
  <img src="https://img.shields.io/badge/processed-3.15B%2B%20tokens-111111" alt="3.15B+ processed tokens">
  <img src="https://img.shields.io/badge/hardware-1%C3%97%2016GB%20GPU-111111" alt="Single 16GB GPU">
</p>

<p align="center">
  <a href="https://cetinlm.meforcetechnology.com">Website</a> ·
  <a href="https://github.com/xertxetin/CetinLM">GitHub</a> ·
  <a href="https://huggingface.co/meforce">Hugging Face</a>
</p>

---

## What this archive is

This directory is the **public engineering history of CetinLM**, an independent language-model research and engineering program developed under **Me Force Technology** in Türkiye.

It is not a reproduction manual and it is not a marketing changelog. It records the parts of the work that make the research legible from the outside: milestones, measured outcomes, failed experiments, runtime lessons, validation trends, and the decisions that survived contact with the real system.

> **Public by default for outcomes. Private by default for the blueprint.**

---

## Live research snapshot

<table>
<tr>
<td width="25%"><strong>Model scale</strong><br>~1.18B parameters</td>
<td width="25%"><strong>Tokenizer</strong><br>48K vocabulary</td>
<td width="25%"><strong>Frozen corpus</strong><br>11.39B unique train tokens</td>
<td width="25%"><strong>Context</strong><br>2K base-training context</td>
</tr>
<tr>
<td><strong>Origin</strong><br>Trained from scratch</td>
<td><strong>Hardware</strong><br>1× RTX 4070 Ti SUPER 16GB</td>
<td><strong>Current run</strong><br>3.15B+ processed tokens</td>
<td><strong>Observed speed</strong><br>~4.4–4.5K tok/s</td>
</tr>
</table>

At the 3.15B milestone, Base-v1 reached a new held-out best of **2.623482 validation loss / 13.784 perplexity**. Between 3.00B and 3.15B, every 50M validation milestone produced a new best checkpoint. This is evidence of continued held-out next-token learning; it is **not** a claim that the raw Base checkpoint is already a finished assistant.

> **Corpus size and training exposure are different quantities.** The frozen corpus contains **11.39B unique deduplicated training tokens**. The Base-v1 schedule is allowed to process up to **20B exposure tokens** by covering that fixed corpus and then applying bounded, source-aware replay. Replayed tokens increase training exposure; they do not increase the unique-corpus count.

[Read the full 3.15B progress note →](./2026-09-18_BASE_V1_3_15B_PROGRESS.md) · Historical milestone: [1.20B →](./2026-09-12_BASE_V1_1_2B_PROGRESS.md)

---

## CetinLM is a model factory, not a single checkpoint

The visible model is only one output of a larger engineering system.

```text
DATA ENGINEERING
      ↓
TOKENIZER
      ↓
PACKING + TRAINING CONTRACTS
      ↓
BASE PRETRAINING
      ↓
QUALIFICATION + TELEMETRY
      ↓
CHECKPOINT / RECOVERY
      ↓
EVALUATION + DIAGNOSTICS
      ↓
STAGED POST-TRAINING
      ↓
ONE CETINLM
```

CetinLM treats data preparation, tokenizer design, training runtime, failure recovery, evaluation, post-training, and future tool/memory systems as parts of the same research problem.

The goal is not to hide weak engineering behind more compute. The goal is to understand **why** the system works, measure where it fails, and scale only what survives.

[Read the public Model Factory note →](./MODEL_FACTORY.md)

---

## Research principles

<table>
<tr>
<td width="33%" valign="top"><strong>Measure before merging</strong><br><br>A theoretical speedup or elegant idea is not an improvement until it wins on the real system.</td>
<td width="33%" valign="top"><strong>Fail closed</strong><br><br>Critical data/runtime/training anomalies should stop the run before they silently damage state.</td>
<td width="33%" valign="top"><strong>Keep negative results</strong><br><br>A rejected experiment still reduces uncertainty. Failed ideas remain part of the engineering record.</td>
</tr>
<tr>
<td valign="top"><strong>Separate signals</strong><br><br>Validation, raw generation, reasoning, safety and throughput answer different questions.</td>
<td valign="top"><strong>Prefer end-to-end evidence</strong><br><br>A fast microbenchmark can still lose in real training. Production trajectory wins.</td>
<td valign="top"><strong>Protect the active run</strong><br><br>Once a configuration is qualified, changes need evidence. Training progress is not a playground.</td>
</tr>
</table>

```text
OBSERVE → MEASURE → HYPOTHESIZE → A/B TEST → KEEP WHAT SURVIVES → DOCUMENT
```

---

## What the run has demonstrated so far

| Area | Public result | Status |
|---|---|:---:|
| From-scratch training | Base-v1 is training from random initialization | ✅ |
| Single-GPU execution | ~1.18B Base-v1 runs on one 16GB consumer GPU | ✅ |
| Data/tokenizer contracts | Frozen identities are validated before training | ✅ |
| Packed-document behavior | Cross-document isolation is explicitly qualified | ✅ |
| Checkpoint recovery | Recoverable state is preserved across interruptions | ✅ |
| Runtime observability | Persistent telemetry follows the active lineage | ✅ |
| Runtime research | Multiple attractive optimizations were tested and rejected when they lost end-to-end | ✅ |
| Checkpoint memory pressure | Recent save-path hardening substantially reduced post-save reserved GPU memory in production observations | 🟢 active evidence |
| Held-out learning | Validation reached 2.623482 / 13.784 PPL at 3.15B, with continued 50M-step best checkpoints in the latest window | 🟢 improving |
| Base-v1 production | 3.15B+ processed tokens and continuing | 🟢 active |

---

## The trajectory matters more than one screenshot

Recent milestones continue to move even at 50M-token resolution:

| Processed tokens | Validation loss | Perplexity |
|---:|---:|---:|
| 2.80B | 2.656237 | 14.243 |
| 2.85B | 2.647877 | 14.124 |
| 2.90B | 2.645866 | 14.096 |
| 2.95B | 2.642277 | 14.045 |
| 3.00B | 2.633264 | 13.919 |
| 3.05B | 2.630962 | 13.887 |
| 3.10B | 2.628029 | 13.846 |
| **3.15B** | **2.623482** | **13.784** |

Raw greedy generation remains diagnostic rather than a product-quality claim. Base pretraining is judged primarily by held-out prediction, boundary health, broad source-family behavior and controlled diagnostics—not by pretending a raw Base checkpoint is already a chat model.

---

## Public research timeline

### 2026-09-18 · Base-v1 crosses 3.15B processed tokens

The run passed 3.15B processed tokens with a new held-out best of 2.623482 / 13.784 PPL. The 3.00B, 3.05B, 3.10B and 3.15B checkpoints each improved the previous validation best.

[Read the full 3.15B update →](./2026-09-18_BASE_V1_3_15B_PROGRESS.md)

### 2026-09-12 · Base-v1 crosses 1.20B processed tokens

Base-v1 passed 1.20B processed tokens with a new validation best, stable throughput, healthy boundary signals, and repeated successful checkpoint cycles after recent runtime hardening.

[Read the full 1.20B update →](./2026-09-12_BASE_V1_1_2B_PROGRESS.md)

### 2026-09-09 · Base-v1 passes 34M production tokens

The first public production update documented the transition from preflight engineering into a sustained real training run.

[Read the 34M historical note →](./2026-09-09_BASE_V1_34M_PROGRESS.md)

### 2026-09-08 · Runtime engineering campaign: closed

A focused runtime campaign tested memory, batch, checkpointing, attention, loss and execution ideas. Several plausible optimizations lost on the real trajectory and were rejected.

[Read the runtime engineering recap →](./2026-09-08_RUNTIME_ENGINEERING_RECAP.md)

### 2026-09-07 · Base-v1 foundation frozen

The active generation moved from exploratory work into a controlled Base-v1 with explicit qualification gates.

[Read the foundation note →](./2026-09-07_BASE_V1_FOUNDATION_FREEZE.md)

---

## Post-training direction

Base-v1 is the foundation, not the final product.

The current direction is staged post-training so regressions remain attributable while capabilities accumulate into **one unified CetinLM**:

```text
Base-v1 [protected]
  ↓
Instruction-focused bootstrap
  ↓
Balanced multi-task SFT
  ├── Instruction
  ├── Chat + Social
  ├── Reasoning + Math
  ├── Code
  ├── Truthfulness + Safety
  ├── Tools + Search + Memory
  └── Computer Use / Interactive Agents
  + small qualified Base/general replay
  ↓
Mixed consolidation
  ↓
ONE CETINLM
```

Exact post-training recipes are not frozen before measurement.

---

## Public disclosure boundary

We publish:

- broad model scale and context;
- tokenizer size;
- frozen-corpus scale;
- processed-token milestones;
- broad throughput;
- validation trends;
- high-level qualification and recovery philosophy;
- experiment outcomes and negative results;
- data provenance at a public-safe level.

We do **not** publish the reproduction-critical private blueprint while active research is ongoing: exact architecture geometry, optimizer/LR recipe, precise mixture weights, internal thresholds, low-level recovery details, local manifests or kernel/backend tuning configuration.

---

## Public reference pages

| Page | Purpose |
|---|---|
| [Model Factory](./MODEL_FACTORY.md) | What CetinLM is building beyond one checkpoint |
| [Technical Overview](./TECHNICAL_OVERVIEW.md) | Public-safe system architecture |
| [Data Provenance](./THIRD_PARTY_DATA.md) | Third-party source families and disclosure boundary |
| [3.15B Progress](./2026-09-18_BASE_V1_3_15B_PROGRESS.md) | Current training milestone and measured trajectory |
| [1.20B Progress](./2026-09-12_BASE_V1_1_2B_PROGRESS.md) | Historical sustained-training milestone |
| [34M Progress](./2026-09-09_BASE_V1_34M_PROGRESS.md) | Historical early-production milestone |
| [Runtime Engineering Recap](./2026-09-08_RUNTIME_ENGINEERING_RECAP.md) | What won, what lost, and why |
| [Base-v1 Foundation Freeze](./2026-09-07_BASE_V1_FOUNDATION_FREEZE.md) | Transition into controlled Base-v1 production |

---

## Identity

**CetinLM** is developed independently under **Me Force Technology** in Türkiye.

The project is not an argument that compute does not matter. It is an experiment in how much more useful work can be extracted when **data, architecture, training math, measurement and systems engineering are treated as one optimization problem**.

> **CetinLM is not proof that compute does not matter. It is proof that engineering still does.**

---

<p align="center">
  <strong>Build from first principles. Measure everything. Keep what survives.</strong>
</p>
