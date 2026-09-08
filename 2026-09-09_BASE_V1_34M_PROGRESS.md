<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="190px">
</p>

<h1 align="center">Base-v1 — 34M+ Production Token Update</h1>

<p align="center"><strong>2026-09-09 · Training · Active</strong></p>

> The fresh Base-v1 run has crossed **34 million processed tokens** and continues training normally on the single-GPU development platform.

## Snapshot

<table>
<tr>
<td width="25%"><strong>Scale</strong><br>1.18B parameters</td>
<td width="25%"><strong>Tokenizer</strong><br>48K vocabulary</td>
<td width="25%"><strong>Frozen corpus</strong><br>11.39B unique train tokens</td>
<td width="25%"><strong>Context</strong><br>2K base training</td>
</tr>
<tr>
<td><strong>Hardware</strong><br>1× RTX 4070 Ti SUPER 16GB</td>
<td><strong>Progress</strong><br>34M+ processed tokens</td>
<td><strong>Throughput</strong><br>~4.4–4.5K tok/s</td>
<td><strong>Status</strong><br>Stable / finite</td>
</tr>
</table>

---

## What the recent training window looks like

Across the latest shared window — roughly **29.9M to 34.3M processed tokens** — the run remained healthy:

- instantaneous training loss stayed around the low-7 range and continued to make new local lows;
- the loss EMA moved from approximately **7.34 toward 7.32** over that window;
- gradients remained finite;
- runtime safeguards behaved as designed during noisier steps;
- throughput generally remained in the **~4.4–4.5K tok/s** band;
- the learning-rate warmup continued normally;
- checkpoint/run state remained on the qualified production lineage.

This is not enough training to make a capability claim, and we are deliberately not cherry-picking generations as proof of intelligence.

The useful result right now is much simpler:

**the system is learning, staying finite, and behaving like the system we qualified.**

---

## Why 34M matters even though it is early

Thirty-four million tokens is a small fraction of the full run.

But the milestone comes after a concentrated period of systems work:

- fresh Base-v1 qualification;
- a protected non-finite anomaly and exact replay;
- telemetry lineage repair;
- optimizer research;
- batch/memory/checkpoint experiments;
- full GPU profiling;
- attention/loss/caching experiments;
- a final decision to stop tuning and let the proven runtime train.

So this update is less about the number **34M** and more about what survived long enough to reach it.

The current training process is no longer an untested preflight. It is an active production research run with real operational history behind it.

---

## No victory lap yet

We are not claiming:

- benchmark leadership;
- strong instruction following;
- final reasoning quality;
- final coding quality;
- long-context capability beyond the evaluated base regime;
- production safety readiness;
- a finished model.

Base-v1 is still a raw model in early pretraining.

What we can claim is that the underlying research system has become much harder to fool with its own measurements.

That is progress worth keeping.

---

## What happens next

No new runtime experiment is currently justified.

The plan is intentionally boring:

1. keep the active Base-v1 run moving;
2. protect checkpoint continuity;
3. watch training health rather than individual noisy steps;
4. evaluate at the next meaningful milestone;
5. reopen engineering only when evidence gives us a reason.

After weeks of rebuilding, testing and rejecting ideas, **doing nothing to the runtime is now a feature**.

---

## Public disclosure boundary

We publish scale, progress, hardware class, broad throughput, measured outcomes and research methodology.

The exact model/training recipe remains private while Base-v1 is active.

---

<p align="center">
  <a href="./README.md">← Public Research Log</a>
</p>
