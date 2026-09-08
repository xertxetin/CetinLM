<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="190px">
</p>

<h1 align="center">Base-v1 Runtime Engineering Recap</h1>

<p align="center"><strong>2026-09-08 · Systems / Performance · Campaign closed</strong></p>

> **Question:** Can the active Base-v1 training system be made materially faster or safer without weakening its numerical, checkpoint or training contracts?

## Executive result

We tested a broad set of runtime ideas against the real Base-v1 path.

**One execution optimization survived production use. Most alternatives did not.**

The campaign is closed for now. The active run stays on the proven production path instead of accumulating speculative complexity.

---

## Why we opened the campaign

A single 16GB GPU leaves little room for accidental inefficiency. Once Base-v1 was running reliably, the next obvious question was whether memory pressure or execution overhead was leaving meaningful throughput on the table.

We deliberately avoided changing model intent or data semantics. The target was the **execution layer**: make the same training job cheaper or faster, or reject the idea.

---

## What we investigated

<table>
<tr>
<td width="33%" valign="top"><strong>Memory / residency</strong><br><br>Whether state that is idle during most of an update needs to remain on the GPU.</td>
<td width="33%" valign="top"><strong>Batch geometry</strong><br><br>Whether fewer, larger physical batches could reduce overhead on the target GPU.</td>
<td width="33%" valign="top"><strong>Checkpointing</strong><br><br>Whether recomputing less could trade spare memory for more speed.</td>
</tr>
<tr>
<td valign="top"><strong>Attention execution</strong><br><br>Whether alternate backend choices actually improve the complete training path.</td>
<td valign="top"><strong>Loss execution</strong><br><br>Whether fusing output/loss work could remove meaningful overhead.</td>
<td valign="top"><strong>Cast / cache behavior</strong><br><br>Whether repeated mixed-precision conversion work could be reused safely.</td>
</tr>
</table>

We also profiled the real GPU workload to understand where time was actually going before opening more branches.

---

## What survived

A memory/residency optimization reduced GPU pressure while remaining compatible with the active training and checkpoint workflow.

It was retained because it passed the only test that matters: **real production behavior**.

The public log intentionally does not disclose its exact implementation.

---

## What failed

### Larger physical batches

The expected reduction in launch/accumulation overhead did not compensate for the memory/runtime behavior of the real Base-v1 geometry.

**Decision: REJECT.**

### Reduced activation checkpointing

Using more memory to recompute less looked attractive. On the target system, the end-to-end result did not win.

**Decision: REJECT.**

### Mixed batch-density scheduling

Trying to mix geometries inherited the memory cost of the larger path without producing enough throughput benefit.

**Decision: REJECT.**

### Autocast/cache reuse

The hypothesis was straightforward: if some weights are unchanged across accumulation microsteps, perhaps repeated conversion/copy work could be reduced.

The measured result did not produce a useful speedup and raised numerical concerns.

**Decision: REJECT.**

### Fused loss path

A fused output/loss candidate was tested because the output side of a language model is expensive enough to deserve scrutiny.

It did not deliver a meaningful production advantage in the current environment.

**Decision: REJECT.**

### Alternate attention backend

This was the most deceptive result of the campaign.

A short benchmark initially looked materially faster. Instead of promoting it, we ran stronger repeatability checks and then a same-state optimizer trajectory.

Under the more realistic test, the candidate became **substantially slower** than the baseline.

**Decision: REJECT.**

---

## What the profiler changed

The profiler showed that the healthy production path was fundamentally **GPU compute / kernel bound**, with matrix multiplication / linear work and attention taking most of the runtime.

That mattered because it killed several weak hypotheses:

- the main problem was not the DataLoader;
- the healthy run was not dominated by shared-memory spill;
- blindly moving work to the CPU was not a free win;
- not every visible copy operation was worth engineering around.

The profiler did not hand us a magic optimization.

It did something more useful: it told us where **not** to waste another week.

---

## The core lesson

> **Microbenchmark speed is not production speed.**

A kernel can win a narrow timing loop and lose the full training trajectory once recomputation, gradients, optimizer work, synchronization and memory behavior are included.

That is why CetinLM promotes optimizations in stages:

```text
idea
  ↓
controlled benchmark
  ↓
numerical / repeatability checks
  ↓
realistic trajectory
  ↓
production observation
  ↓
KEEP or REJECT
```

The standard is deliberately annoying.

That annoyance is cheaper than corrupting a multi-week run.

---

## Final production decision

At the end of the campaign:

- the proven baseline remained the baseline;
- one memory/runtime improvement was retained;
- the rest of the tested candidates were archived as negative results;
- further speed work was paused.

The next improvement should come from a real bottleneck or model-health need, not from boredom with a working training loop.

---

## Public disclosure boundary

This note publishes experiment categories, outcomes and engineering lessons.

It intentionally omits exact internal geometry, optimizer scheduling, kernel configuration, thresholds and implementation details while Base-v1 remains active research.

---

<p align="center">
  <a href="./README.md">← Public Research Log</a>
</p>
