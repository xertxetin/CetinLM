<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="230px">
</p>

<h1 align="center">Base-v1 at 1.20B Processed Tokens</h1>

<p align="center">
  <strong>From 34M to 1.20B: the experiment is no longer asking whether the system can train.</strong><br>
  It is asking how far a carefully engineered ~1.18B model can keep learning.
</p>

---

## Milestone

On **2026-09-12**, the active CetinLM Base-v1 run crossed **1.20B processed tokens** on a single RTX 4070 Ti SUPER 16GB.

At the 1.20B validation milestone:

```text
Validation loss : 2.898241
Perplexity      : 18.142
Status          : NEW BEST
```

This is a raw Base model in pretraining. The metric describes held-out next-token prediction performance; it is not an instruction-following or assistant-quality claim.

---

## The recent trajectory

| Processed tokens | Validation loss | Perplexity |
|---:|---:|---:|
| 900M | 3.003240 | 20.151 |
| 950M | 2.978740 | 19.663 |
| 1.00B | 2.953662 | 19.176 |
| 1.05B | 2.941982 | 18.953 |
| 1.10B | 2.923830 | 18.612 |
| 1.15B | 2.909436 | 18.346 |
| **1.20B** | **2.898241** | **18.142** |

Across this 300M-token window, validation loss fell by about **0.105** and perplexity fell by roughly **10%**.

The important observation is not one unusually good checkpoint. It is that the held-out trend continued across consecutive milestones.

---

## Broad-source learning remains visible

At 1.20B, the public validation families remained broadly healthy:

```text
first_party_main   1.752964
first_party_wiki   3.213158
finewiki_tr        2.547455
finewiki_en        2.386224
temiz_oscar        3.015784
```

No single source-family number is treated as a complete capability score. The value of the split view is that it makes it harder for one easy source to hide a broader regression.

---

## Boundary health

Document-boundary behavior remained healthy at the milestone.

The project separately monitors teacher-forced document-ending behavior and raw free generation because those measurements answer different questions. A Base model can improve held-out prediction while still showing noisy or repetitive greedy completion behavior early in training.

That distinction is intentional:

```text
held-out prediction quality
            ≠
raw greedy generation behavior
            ≠
post-trained assistant quality
```

---

## Checkpoint runtime hardening

Recent production work also targeted a practical problem: GPU memory pressure around checkpoint saves.

After a narrowly scoped save-path cleanup was introduced, repeated production checkpoints showed a large drop in reserved GPU memory immediately after save completion, followed by normal finite training steps.

This is encouraging operational evidence, but the project does not convert a handful of successful cycles into a universal claim. The change remains under observation across the long run.

The broader rule is unchanged:

> **Do not weaken the guard because a failure is inconvenient. Fix the system around the guard.**

---

## What changed since the 34M note

At 34M, the public question was whether the newly qualified runtime could survive real production use.

At 1.20B, we now have evidence of:

- sustained multi-week Base-v1 training;
- repeated exact checkpoint/resume use;
- stable single-GPU throughput in the ~4.4–4.5K tok/s range;
- continuing held-out improvement across consecutive milestones;
- broad validation-family learning;
- runtime failures being treated as engineering evidence rather than silently skipped;
- a growing post-training and operations architecture around the Base run.

The experiment has moved from **“can this system run?”** toward **“how much capability can this system extract?”**

---

## What this still does not prove

The milestone does not establish:

- final assistant quality;
- final reasoning/coding performance;
- benchmark leadership;
- production safety readiness;
- long-context capability beyond the trained/evaluated Base regime;
- that every runtime anomaly has been permanently eliminated.

Those questions belong to later checkpoints, explicit evaluation and staged post-training.

---

## Next

Base-v1 continues.

The current research plan treats large token targets as **decision gates**, not sacred finish lines. If later held-out measurements show that the model is still learning efficiently, continued Base training remains an experimental option. If marginal gains flatten, compute can move to post-training and other capability work.

The number is not the goal.

**Understanding why another token is—or is not—worth spending is the goal.**

---

<p align="center">
  <a href="./README.md">← Public Research Log</a> ·
  <a href="./MODEL_FACTORY.md">Model Factory →</a>
</p>
