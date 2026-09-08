# CetinLM Developer Log — 2026-09-08

## Base-v1 pretraining qualification, shadow forensics and production freeze

**Status:** production release gate approved for a fresh Base-v1 start.

This log records the final engineering work performed before the first production training run of the frozen CetinLM Base-v1 generation. It intentionally separates implementation correctness from model-quality observations so that later checkpoints can be interpreted against a reproducible baseline.

---

## 1. Frozen Base-v1 contract

No final qualification work changed the frozen Base-v1 architecture, tokenizer identity or corpus identity.

```text
Parameters              1,180,540,928
Layers                  24
Hidden                  2,048
Attention               16Q / 4KV GQA
Head dimension          128
FFN                     5,632 SwiGLU
Normalization           Pre-RMSNorm + head-wise QK-RMSNorm
RoPE theta              500,000
Tokenizer               CetinTokenizer-v1 / 48,000
Tokenizer SHA-256       56821c324d9c9af41359ed1fabcbe9cc7c5b2592276377b9b185442e843106ed
Initial context          2,048
```

Frozen data accounting:

```text
Training documents      21,532,847
Validation documents    108,165
Unique train tokens     11,391,183,502
Validation tokens       57,697,909
Packing seq             2,048
20B packing samples     9,766,649
```

---

## 2. Document-isolated packed attention

Base-v1 keeps the efficiency of packed 2K sequences while preventing cross-document information flow inside a packed sample.

The final qualification checked:

- causal block-mask algebra,
- cross-document invariance under isolation,
- a deliberately unmasked control that must show cross-document influence,
- real production packing boundaries,
- EOS targets and BOS-after-EOS targets,
- a tiny EOS-overfit test.

Final measured qualification included:

```text
isolated cross-document max abs diff   0.0
unmasked control max abs diff          ~0.2885
real packed samples checked            7
inter-document boundaries checked      31
tiny terminal EOS top-1 rate           1.0
tiny terminal EOS probability mean     1.0
```

The selected production backend is dense document-isolated PyTorch SDPA. The optional variable-length path was not selected on the target build because the required Flash-Attention build support was unavailable. Dense mode passed the correctness and hardware qualification and is the explicit production path.

---

## 3. Optimizer / precision qualification

Earlier precision experiments showed that persistent BF16 parameters could lose very small early-warmup updates through rounding. Base-v1 therefore qualifies **FP32 persistent parameters + BF16 autocast compute + bitsandbytes AdamW8bit**.

The final production rules also keep the tied token embedding / LM-head parameter at **weight decay = 0**.

A deterministic proxy compared the selected AdamW8bit path with FP32 AdamW and passed the release tolerance. The full 1.1805B target-GPU step then passed forward, backward, gradient measurement and optimizer update.

Representative final numbers:

```text
optimizer proxy FP32 final loss     2.290344
optimizer proxy bnb8 final loss     2.306152
relative final-loss difference      ~0.00690
full-model step loss                11.199249
pre-clip gradient norm              ~11.137
```

---

## 4. Target-GPU qualification

Final release qualification on the target 16GB GPU selected dense document-isolated attention.

Representative benchmark snapshot:

```text
causal-control throughput       ~5.31K tok/s
dense isolated throughput       ~4.68K tok/s
dense/causal ratio              ~0.88
peak allocated VRAM             ~9.24 GiB
peak reserved VRAM              ~10.92 GiB
total VRAM                      ~15.99 GiB
```

The slower dense isolated path was accepted because it is the qualified correctness-preserving backend on this build. An unqualified faster backend is not silently substituted into production.

---

## 5. Shadow pretraining rehearsal

A ~111M-parameter structurally equivalent shadow model was trained with the same data/target/optimizer concepts as a lower-cost systems rehearsal.

Observed learning signals improved with exposure:

```text
~10M tokens
validation loss                ~9.6311
terminal EOS probability       ~0.000116
terminal EOS median rank       22
post-EOS BOS probability       ~0.000070

~50M tokens
validation loss                ~7.2789
terminal EOS probability       ~0.0229
terminal EOS median rank       4
post-EOS BOS probability       ~0.913

~100M tokens
validation loss                ~5.9923
terminal EOS probability       ~0.0462
terminal EOS median rank       3
post-EOS BOS probability       ~0.963
```

The rehearsal therefore demonstrated learning and target acquisition, but raw greedy decoding remained highly repetitive at this very early exposure.

---

## 6. Non-finite-gradient incident and tooling hardening

One diagnostic shadow rerun produced a non-finite-gradient stop before the first scheduled milestone checkpoint. Static inspection established that checkpoint serialization had not run at the failure point, so checkpoint writing was not blamed without evidence.

The shadow tooling was hardened with:

- read-only pre-clip per-parameter gradient auditing,
- first-bad-gradient reporting,
- robust FP64 norm aggregation,
- preserved deterministic execution ordering,
- milestone shadow checkpoints and resume support.

The next run reproduced the known-good early trajectory and successfully wrote the 10M checkpoint. No production-training math was changed because a reproducible production-math defect had not been established.

---

## 7. Ctrl+C and diagnostic import bugs

Two tooling defects were fixed during the investigation:

1. an imported training-module SIGINT handler set a stop flag that the shadow runner did not consume, causing repeated Ctrl+C banners while training continued;
2. a standalone forensic script depended on a repository-package import path that was not valid when invoked directly on Windows.

The fixes were limited to shadow/diagnostic tooling. Production model/data/optimizer semantics were not changed by these repairs.

---

## 8. Greedy repetition forensics

The initial loop detector was intentionally strict, so a deeper forensic tool was added to inspect the actual repeated cycles rather than relying only on a binary loop rate.

At the saved ~10M shadow checkpoint, the dominant raw-greedy failure was not merely a detector false positive: many generations entered true one-token fixed points such as repeated `.` or repeated whitespace for the full rollout.

Example form:

```text
................................
```

or repeated whitespace.

This established that the repetition was real raw-greedy behavior at that checkpoint.

---

## 9. KV-cache differential test

Because persistent one-token repetition can also be caused by an inference implementation error, cached generation was compared directly against uncached full-forward greedy generation on identical prompts.

Result:

```text
first argmax divergence       none in tested rollouts
FULL greedy                   same repeated token sequence
CACHE greedy                  same repeated token sequence
```

Small floating-point logit differences were observed after the first cached step, but the greedy argmax token remained identical. The tested repetition therefore was **not explained by KV-cache token divergence**.

This was an important separation: model/raw-decoding behavior should not be “fixed” by changing a cache implementation that reproduces the uncached argmax path.

---

## 10. Release-gate correction

The investigation exposed a policy problem rather than a frozen Base-v1 training-math defect.

Deterministic correctness properties — masking, target construction, data identity, optimizer behavior, full-model updates, checkpoint contracts — can be fail-closed hard gates.

Very-early raw greedy text quality is different. It is useful telemetry, but it should not be silently promoted into a deterministic implementation-correctness invariant. In particular, a raw scratch model at very low token exposure can have poor mode-seeking greedy behavior even while validation and target probabilities improve.

The final release gate therefore separates:

```text
HARD GATES
- validation learning trend
- EOS learning trend
- EOS rank non-regression
- strong BOS-after-EOS learning
- data / mask / optimizer / runtime qualification

ADVISORY TELEMETRY
- raw greedy EOS top-1
- raw greedy repetition / max-length behavior
```

This does **not** hide repetition. It preserves the metric and its decoded forensic evidence while preventing an early generation-quality heuristic from being mislabeled as proof of an implementation failure.

---

## 11. Final production approval

On 2026-09-08 the final document-attention/full-model qualification passed and a SHA-bound shadow release approval was created.

Release state:

```text
FULL CETINLM PRETRAINING QUALIFICATION    PASS
selected attention backend                dense
SHADOW PRETRAINING RELEASE APPROVAL       APPROVED
fresh Base-v1 production pretraining      READY
```

No architecture, tokenizer, corpus, packing, objective, optimizer schedule or Base-v1 runtime recipe was changed by the final approval itself.

---

## 12. What happens next

The next experiment is no longer another pretraining design patch.

It is the real fresh Base-v1 production run.

The run will be observed through validation, gradient/optimizer health, throughput/VRAM, EOS/BOS diagnostics, exact checkpoints and raw generation telemetry. Changes to the frozen recipe require a new measured blocker rather than preference or speculation.

Older experimental checkpoints remain archived for historical comparison; they are not production initialization state for this fresh Base-v1 generation.

---

**Research rule:** observe → measure → form a hypothesis → A/B test → keep what wins → document the result.
