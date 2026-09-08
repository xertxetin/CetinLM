<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="190px">
</p>

<h1 align="center">Base-v1 Foundation Freeze</h1>

<p align="center"><strong>2026-09-07 · Foundation · Frozen for production research</strong></p>

> Base-v1 marked the point where CetinLM stopped being a moving collection of 1B-scale experiments and became a controlled research system.

## The transition

Earlier CetinLM runs were useful because they exposed real weaknesses in data quality, tokenizer choices, training geometry, generation behavior and evaluation discipline.

But experiments become difficult to interpret when architecture, tokenizer, data and runtime assumptions all move at once.

Base-v1 was therefore built around a freeze:

- a fixed model scale;
- a frozen tokenizer identity;
- a frozen training-data identity;
- a fixed base-training context class;
- a controlled packed-training contract;
- explicit runtime qualification before production;
- checkpoint and telemetry rules designed for multi-week training rather than short experiments.

The goal was not “freeze everything forever.”

The goal was to create a stable generation where future measurements actually mean something.

---

## Public Base-v1 identity

<table>
<tr>
<td width="25%"><strong>Scale</strong><br>1.18B parameters</td>
<td width="25%"><strong>Tokenizer</strong><br>48K vocabulary</td>
<td width="25%"><strong>Corpus</strong><br>11.39B unique train tokens</td>
<td width="25%"><strong>Context</strong><br>2K base training</td>
</tr>
</table>

The model is trained **from scratch**. Base-v1 is not a fine-tune or continued-pretraining run on a third-party pretrained foundation model.

---

## What had to be qualified before production

### Data identity

The system verifies that the training data and tokenizer being used are the ones that were actually frozen for Base-v1.

### Packed-document behavior

Packing improves training efficiency, but separate documents must remain separate from the model's point of view. We added explicit checks for boundary behavior rather than relying on implementation assumptions.

### BOS / EOS behavior

Document starts and ends are part of the learning signal. Those targets received dedicated checks before the production run was allowed to proceed.

### Real full-model execution

Small proxy tests are useful but insufficient. The actual Base-v1 model and target GPU path also had to execute successfully under the production-style stack.

### Failure behavior

Qualification is intentionally fail-closed. A stale or incompatible runtime state should stop the run and demand requalification rather than quietly proceeding.

---

## Why this mattered

The freeze turned later questions into cleaner experiments.

Instead of asking:

> “Did the model improve because of the data, architecture, tokenizer, optimizer, runtime or luck?”

we can ask narrower questions against a stable baseline.

That discipline is what made the later runtime campaign useful: candidate optimizations were competing against a real reference system rather than a moving target.

---

## What remains private

The public Base-v1 identity intentionally stops short of a reproduction recipe.

Exact architecture geometry, optimizer/scheduler values, packing details, kernel choices, thresholds and checkpoint internals remain private during the active research phase.

The public record documents **what was frozen and why**, not every constant required to clone it.

---

## Next step at the time

Once the foundation passed qualification, the job became simple:

**start the fresh Base-v1 run and make every later change earn its way in.**

---

<p align="center">
  <a href="./README.md">← Public Research Log</a>
</p>
