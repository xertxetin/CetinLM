<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="230px">
</p>

<h1 align="center">Base-v1 at 3.15B Processed Tokens</h1>

<p align="center">
  <strong>The run is past 3B tokens, and the held-out curve is still moving at 50M-token resolution.</strong><br>
  This note records the measured trajectory without turning a raw Base checkpoint into a capability claim.
</p>

---

## Milestone

On **2026-09-18**, the active CetinLM Base-v1 run crossed **3.15B processed tokens**.

At the 3.15B validation milestone:

```text
Validation loss : 2.623482
Perplexity      : 13.784
Status          : NEW BEST
```

The notable part is not the isolated checkpoint. The recent sequence continued to improve even at the project's 50M-token validation cadence.

---

## Recent trajectory

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

Across the 2.80B → 3.15B window, held-out loss fell by approximately **0.0328** and perplexity fell from **14.243 to 13.784**. Every validation checkpoint from 3.00B through 3.15B set a new best.

This does not establish how long the trend will continue. It does establish that, at this snapshot, Base-v1 had not stopped making measurable held-out progress.

---

## Latest validation families

At 3.15B:

```text
first_party_main   1.486036
first_party_wiki   2.945374
finewiki_tr        2.318376
finewiki_en        2.121538
temiz_oscar        2.789968
```

The split view is retained because a global average alone can hide source-family regressions. The current milestone remains broadly consistent with continued learning across the held-out mixture.

---

## Boundary health

Teacher-forced document-ending behavior remained stable at the milestone:

```text
P(EOS@end) : 0.3871
top-1      : 45.0%
top-5      : 77.5%
median rank: 2.0
after EOS  : P(BOS)=1.0000, P(EOS)=0.0000
```

Raw greedy generation is still treated as a diagnostic signal rather than a product-quality score. Held-out prediction and boundary behavior answer different questions, and the project keeps those measurements separate.

---

## 11.39B unique corpus vs. 20B training exposure

These numbers describe different things:

- **11.39B unique training tokens** is the size of the frozen, globally deduplicated Base-v1 corpus.
- **20B processed tokens** is the training-exposure horizon. It includes deterministic coverage of the frozen corpus plus bounded, source-aware replay.

Replay means the optimizer may see qualified material more than once. It does **not** mean the project claims 20B unique tokens, and it does not mutate the frozen corpus into a larger dataset.

```text
11.39B unique corpus
        ↓ deterministic coverage + qualified replay
up to 20B processed-token exposure
```

This distinction is deliberate: corpus identity stays frozen while training exposure can exceed one corpus pass.

---

## What this milestone means

At 3.15B, the public evidence supports a narrow conclusion: the active Base-v1 system is still making measurable progress on its held-out objective while checkpoint, boundary and source-family diagnostics remain healthy enough to continue the qualified run.

It does **not** by itself establish final assistant quality, reasoning ability, coding ability, alignment quality or benchmark leadership. Those belong to later evaluation and post-training.

---

## Next

Base-v1 continues under the existing qualified training contract. Large token counts remain decision gates rather than ceremonial finish lines: the project will keep measuring whether additional exposure is still buying useful held-out improvement.

---

<p align="center">
  <a href="./README.md">← Public Research Log</a> ·
  <a href="./TECHNICAL_OVERVIEW.md">Technical Overview →</a>
</p>
