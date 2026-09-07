<div align="center">

# CetinLM Developer Log — 2026-09-07 — Pretraining GO Final

**CetinLM Project History**  
`2026-09-07` · preserved engineering record

![Status](https://img.shields.io/badge/status-historical-6B7280)
![Project](https://img.shields.io/badge/project-CetinLM-111827)
![Current](https://img.shields.io/badge/current-V62.3-2563EB)

</div>

> [!IMPORTANT]
> **Historical record — not an active training instruction.** This file is retained for auditability and may describe decisions that were later superseded. For the current Base-v1 contract, use the [repository README](../../../README.md), [active checkpoint](../../0_CETINLM_ACTIVE_CHECKPOINT.md), and [final corpus/mix contract](../../0_CETINLM_BASE_V1_FINAL_CORPUS_AND_MIX.md).

---

## Milestone class

Release-significant training correctness / reproducibility / runtime qualification freeze.

## Final audit findings

The last release-blocker audit focused only on failure modes capable of wasting a long Base run: packing/loss boundaries, EOS/loop behavior, resume correctness, optimizer precision at warmup LR, validation comparability and long-context continuation identity.

### Optimizer precision qualification

A peak-LR optimizer smoke is insufficient for Base-v1 because the first real optimizer step occurs at a much smaller warmup LR (about `3.93e-7` under default 262,144-token geometry). Persistent BF16 parameters can lose very small updates through rounding. Runtime qualification therefore tests the exact first-step LR and exact candidate `(optimizer backend × persistent parameter dtype × geometry)` on the target CUDA machine.

The source default `bnb8bit + bf16` is now only the first candidate, not an assumption. `torchao8bit + bf16` with stochastic rounding and an FP32-persistent fallback are available qualification paths. The full 1.181B preflight decides actual fit/headroom.

### Runtime qualification lock

Training requires `runtime_qualification_lock.json`. The lock SHA-pins doctor and full-model preflight reports plus GPU, PyTorch/CUDA, optimizer package identity, backend, persistent dtype and geometry. A runtime/package/backend change requires requalification before training.

### Checkpoint ABI v4

Checkpoint v4 makes exact-resume claims fail-closed. Optimizer beta/epsilon/weight-decay/grad-clip, AMP/persistent dtype/backend, seed, data identity, packing identity and Python/NumPy/Torch/CUDA RNG state are explicit invariants. CUDA RNG restore failure is fatal rather than silently ignored.

A serialized end-to-end round-trip regression restores model weights, optimizer state, processed-token counters, sampler cursor and Python/NumPy/Torch RNG state exactly.

### Context continuation correctness

Immutable corpus/tokenizer/mix identity is separated from context-specific packing identity. This makes 2K -> 4K/8K continuation operational without weakening the data lock. Exact resume requires the same packing SHA; intentional context extension may switch to another derived packing over the same immutable documents.

Validation-best state is geometry-specific (`best.pt` for the Base 2K run; `best_seq4096.pt`, etc. later), so losses from different sequence geometries are not compared as if equivalent.

### EOS/generation correctness retained

Document-aware packing and generation contracts remain unchanged and passing: one BOS/one EOS per document, no canonical EOS->EOS, independent first-stop handling per batch row, raw loop/EOS health telemetry, and EOT/EOS separation for future chat post-training.

### Prompt boundary correction

A short Base prompt is `BOS + body`. When a long prompt is left-truncated, the retained suffix is treated as a true mid-document suffix and receives no synthetic BOS. Reserved control IDs remain forbidden in raw Base prompt bodies.

## Final decision

No additional source-level release blocker was found after the above corrections. Base-v1 is frozen. Further foundation changes require measured artifact/GPU failure or a demonstrated correctness bug; speculative architecture churn is explicitly out of scope.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
