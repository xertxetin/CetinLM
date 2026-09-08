<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="270px">
</p>

<h1 align="center">CetinLM — Public Research Log</h1>

<p align="center">
  <strong>From-scratch language-model research. Built in public, without publishing the private blueprint.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Base--v1-active%20pretraining-111111" alt="Base-v1 active pretraining">
  <img src="https://img.shields.io/badge/scale-1.18B-111111" alt="1.18B parameters">
  <img src="https://img.shields.io/badge/tokenizer-48K-111111" alt="48K tokenizer">
  <img src="https://img.shields.io/badge/frozen%20train%20tokens-11.39B-111111" alt="11.39B frozen training tokens">
  <img src="https://img.shields.io/badge/hardware-1%C3%97%2016GB%20GPU-111111" alt="Single 16GB GPU">
</p>

<p align="center">
  <a href="https://cetinlm.meforcetechnology.com">Website</a> ·
  <a href="https://github.com/xertxetin/CetinLM">GitHub</a> ·
  <a href="https://huggingface.co/meforce">Hugging Face</a>
</p>

---

## What this is

This directory is the **public engineering history of CetinLM**, an independent language-model research program developed under **Me Force Technology** in Türkiye.

It is not a marketing changelog and it is not a reproduction manual.

We publish the parts that make the work verifiable and interesting — milestones, measurements, failures, system decisions, training progress and lessons — while keeping the exact implementation recipe private during active Base-v1 research.

> **Public by default for outcomes. Private by default for the blueprint.**

---

## Live research snapshot

<table>
<tr>
<td width="25%"><strong>Model scale</strong><br>1.18B parameters</td>
<td width="25%"><strong>Tokenizer</strong><br>48K vocabulary</td>
<td width="25%"><strong>Frozen corpus</strong><br>11.39B unique train tokens</td>
<td width="25%"><strong>Context</strong><br>2K base-training context</td>
</tr>
<tr>
<td><strong>Origin</strong><br>Trained from scratch</td>
<td><strong>Hardware</strong><br>1× RTX 4070 Ti SUPER 16GB</td>
<td><strong>Current run</strong><br>34M+ processed tokens</td>
<td><strong>Observed speed</strong><br>~4.4–4.5K tok/s</td>
</tr>
</table>

The current Base-v1 run is still early. These numbers describe an **active research system**, not a finished model or a benchmark claim.

---

## The last few weeks, compressed

A few weeks ago, CetinLM was still moving from exploratory 1B-scale experiments toward a production-grade Base-v1 training system.

Since then we have:

- rebuilt and frozen the active tokenizer/data contracts;
- moved to a new 1.18B Base-v1 generation and started again from scratch;
- qualified packed-document isolation instead of assuming it was correct;
- audited BOS/EOS behavior and real packed boundaries;
- built fail-closed startup and runtime guards;
- launched fresh Base-v1 production training;
- caught a non-finite gradient event **before** an optimizer update and replayed the exact next step from checkpoint;
- fixed an observability bug where an older abandoned run could contaminate scheduling state;
- tested multiple optimizer, memory, batch, checkpointing, attention and loss-path ideas;
- rejected several optimizations that looked good on paper or in microbenchmarks but lost on the actual training path;
- retained one runtime/memory improvement because it survived production use;
- profiled the real GPU workload to stop guessing about bottlenecks;
- returned to a deliberately boring production configuration once the experiments stopped producing real wins;
- continued the fresh run past **34M processed tokens** with stable finite training.

That is the point of this archive: not to pretend every experiment worked, but to show that the system became stronger because bad ideas were allowed to lose.

---

## Research principles

<table>
<tr>
<td width="33%" valign="top"><strong>Measure before merging</strong><br><br>A theoretical speedup, elegant kernel or new optimizer idea is not an improvement until it wins on the real system.</td>
<td width="33%" valign="top"><strong>Fail closed</strong><br><br>Data, runtime and training anomalies should stop the run before they silently damage state.</td>
<td width="33%" valign="top"><strong>Keep negative results</strong><br><br>A rejected experiment still reduces uncertainty. We keep the evidence instead of rewriting history.</td>
</tr>
<tr>
<td valign="top"><strong>Separate signals</strong><br><br>Loss, generation quality, reasoning, safety and throughput answer different questions. One metric does not stand in for all of them.</td>
<td valign="top"><strong>Prefer end-to-end evidence</strong><br><br>A fast isolated kernel can still produce a slower training system. Final decisions are made on realistic trajectories.</td>
<td valign="top"><strong>Protect the active run</strong><br><br>Training progress is more valuable than endless knob-tuning. Once a configuration is qualified, changes need evidence.</td>
</tr>
</table>

```text
OBSERVE → MEASURE → HYPOTHESIZE → A/B TEST → KEEP WHAT SURVIVES → DOCUMENT
```

---

## What has been proven so far

| Area | Public result | Status |
|---|---|:---:|
| Data / tokenizer identity | Active Base-v1 data and tokenizer contracts are frozen and validated before training | ✅ |
| Packed-document behavior | Cross-document leakage is explicitly tested rather than assumed | ✅ |
| Full-model execution | The real Base-v1 training path is qualified on the target GPU | ✅ |
| Checkpoint recovery | Production state can be protected and replayed after an anomaly | ✅ |
| Runtime observability | Training telemetry is tied to the active run lineage | ✅ |
| Optimizer research | A custom optimizer-control experiment failed to beat the baseline and was rejected | ❌ kept as evidence |
| Throughput experiments | Multiple seemingly attractive runtime changes failed realistic tests | ❌ kept as evidence |
| Memory/runtime improvement | One execution optimization survived real production use | ✅ retained |
| GPU profiling | The active workload was measured directly instead of optimized from intuition | ✅ |
| Base-v1 production | Fresh-scratch run is active and has passed 34M processed tokens | 🟢 active |

---

## Public research timeline

### 2026-09-09 · Base-v1 passes 34M production tokens

The fresh Base-v1 run passed **34 million processed tokens** while remaining finite and stable under the active runtime safeguards.

Recent public observations show:

- loss continuing to move downward through the early run;
- gradients remaining finite;
- throughput holding around **4.4–4.5K tokens/s** on the single 16GB GPU;
- no reason to reopen the recently closed performance campaign.

[Read the full progress note →](./2026-09-09_BASE_V1_34M_PROGRESS.md)

---

### 2026-09-08 · Runtime engineering campaign: closed

We spent a focused cycle attacking the real training runtime from several directions: memory pressure, batch geometry, checkpointing, attention execution, loss execution, caching and kernel behavior.

The most important outcome was not a giant speedup.

It was learning which apparent wins **did not survive realistic training**.

[Read the runtime engineering recap →](./2026-09-08_RUNTIME_ENGINEERING_RECAP.md)

---

### 2026-09-07 · Base-v1 foundation frozen

Before production, the project moved from an exploratory model into a controlled Base-v1 generation with a frozen tokenizer, frozen corpus identity, fixed model scale and explicit qualification gates.

That freeze matters because experiments become interpretable only when the system underneath them stops moving.

[Read the Base-v1 foundation note →](./2026-09-07_BASE_V1_FOUNDATION_FREEZE.md)

---

## A few things we deliberately rejected

Some of the most valuable work never became a feature.

### A custom optimizer-control idea

It was mathematically valid and interesting enough to test. Controlled comparisons did not show a quality win over the baseline, so it was rejected.

### Bigger physical batches

On paper, larger batches could reduce overhead. On the real target system, the memory/runtime tradeoff was worse. Rejected.

### Less activation recomputation

Reducing checkpointing sounded like an obvious speed path. The real geometry did not reward it. Rejected.

### Autocast/cache reuse

A plausible way to reduce repeated cast/copy work. No meaningful production speedup, with numerical concerns. Rejected.

### Fused loss execution

A promising way to collapse work around the output projection and loss. It did not produce a useful real win in this environment. Rejected.

### Alternate attention backend

A short benchmark looked significantly faster. A more realistic same-state optimizer trajectory later became dramatically slower. Rejected.

That last result is one of the reasons this archive exists:

> **microbenchmark speed is not production speed.**

---

## The anomaly we did not ignore

Early in the fresh run, a non-finite gradient appeared.

The training guard stopped the update before optimizer state could be corrupted. We then replayed the exact next step from the saved checkpoint with deeper diagnostics. The failure did not reproduce and the replay remained finite.

We did not “fix” the issue by weakening the guard, skipping the batch or pretending it did not happen.

We kept the protection, kept the evidence, resumed from clean state, and watched the run continue normally.

That is the kind of boring systems work that rarely fits in a launch post but matters enormously in a multi-week training job.

---

## Why a single 16GB GPU matters to the research

The point is **not** that large clusters are unnecessary.

The point is that constrained hardware makes inefficiency visible.

When there is nowhere to hide:

- memory residency matters;
- recomputation matters;
- kernel choice matters;
- data movement matters;
- checkpoint semantics matter;
- a few percent of throughput matters;
- bad experimental methodology becomes expensive very quickly.

The 16GB development platform is therefore a pressure test for engineering discipline, not the long-term ceiling of the CetinLM project.

---

## What we publish — and what we do not

<table>
<tr>
<th>Public</th>
<th>Private during active Base-v1 research</th>
</tr>
<tr>
<td valign="top">

- model scale
- tokenizer scale
- corpus scale
- training context class
- hardware class
- broad throughput observations
- milestones
- qualitative system design principles
- experiment categories
- KEEP / REJECT outcomes
- public limitations
- release status

</td>
<td valign="top">

- exact architecture geometry
- exact normalization configuration
- exact positional constants
- optimizer recipe and scheduling constants
- batch/update recipe
- internal corpus mixture
- packing internals
- kernel/backend configuration details
- qualification thresholds
- low-level checkpoint implementation details
- implementation-specific recovery logic

</td>
</tr>
</table>

This boundary is intentional. We want the research to be visible and indexable without turning an active private implementation into a copy-paste blueprint.

---

## Current status

```text
CetinLM Base-v1
├── from-scratch foundation       ✅
├── tokenizer/data freeze         ✅
├── fail-closed qualification     ✅
├── fresh production launch       ✅
├── runtime optimization cycle    ✅ closed
├── 34M+ production tokens        ✅
├── next milestone evaluation     ⏳
├── base-model evaluation         ⏳
├── post-training                 later
└── public weights                not released
```

The current job is intentionally simple now:

> **Stop redesigning the engine. Let it train. Measure the next real milestone.**

---

## Data provenance

Training-data transparency is part of the public research surface too. We publish the active third-party source families, their broad roles, recorded upstream license metadata and rights/attribution caveats — while keeping the exact corpus recipe private during active Base-v1 research.

[Read the public data-provenance register →](./THIRD_PARTY_DATA.md)

---

## Public notes

| Date | Entry | What it covers |
|---|---|---|
| 2026-09-09 | [Base-v1 34M+ Production Update](./2026-09-09_BASE_V1_34M_PROGRESS.md) | Early-run stability, throughput, current focus |
| 2026-09-08 | [Runtime Engineering Recap](./2026-09-08_RUNTIME_ENGINEERING_RECAP.md) | Performance campaign, negative results, production decision |
| Reference | [Public Data Provenance](./THIRD_PARTY_DATA.md) | Active third-party source families, upstream license metadata, attribution and disclosure boundary |
| 2026-09-07 | [Base-v1 Foundation Freeze](./2026-09-07_BASE_V1_FOUNDATION_FREEZE.md) | Transition from exploratory work to a frozen Base-v1 research system |

More public notes will be added only when something meaningful changes. Cosmetic churn is not a research milestone.

---

## Identity

**CetinLM** is developed independently under **Me Force Technology**.

The research originates in **Türkiye** and is aimed at a broader question than one 1B model:

> How much capability, reliability and efficiency can disciplined language-model engineering extract before “just use more scale” becomes the default answer?

Base-v1 is the first serious instrument for answering that question.

---

<p align="center">
  <strong>Build from first principles. Measure everything. Keep what survives.</strong>
</p>
