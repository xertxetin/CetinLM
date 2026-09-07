<div align="center">

# CetinLM Developer Log — Runtime Precision + Checkpoint v4 Final Audit

**CetinLM Project History**  
`2026-09-07` · preserved engineering record

![Status](https://img.shields.io/badge/status-historical-6B7280)
![Project](https://img.shields.io/badge/project-CetinLM-111827)
![Current](https://img.shields.io/badge/current-V62.3-2563EB)

</div>

> [!IMPORTANT]
> **Historical record — not an active training instruction.** This file is retained for auditability and may describe decisions that were later superseded. For the current Base-v1 contract, use the [repository README](../../../README.md), [active checkpoint](../../0_CETINLM_ACTIVE_CHECKPOINT.md), and [final corpus/mix contract](../../0_CETINLM_BASE_V1_FINAL_CORPUS_AND_MIX.md).

---

**Date:** 2026-09-07  
**Milestone class:** release-blocking optimizer numerics / reproducibility

## Problem discovered

The previous full-GPU preflight allocated real optimizer state and updated the final 1.181B model, but it used the optimizer's configured peak LR. The actual Base training scheduler begins much lower because 200M tokens are reserved for warmup. At the default 262,144-token optimizer batch, the first update LR is approximately 3.93e-7.

For persistent BF16 model weights without an FP32 master copy, an update this small can be below one BF16 representable step. A peak-LR update test therefore could pass while early training updates were being rounded away.

TorchAO's optimizer documentation explicitly describes this full-BF16 failure mode and provides stochastic rounding for BF16 parameter writes. bitsandbytes remains a candidate, but its package import or 8-bit-state behavior is not accepted as proof of BF16 tiny-update survival.

## Implementation

### Runtime doctor

The doctor now binds the intended model profile, optimizer backend, persistent parameter dtype, sequence length, microbatch and accumulation geometry. It computes the exact first-step LR from the token scheduler and performs a constant-grid optimizer update probe at that LR.

For BF16, the probe uses identical ~0.02 weights so ordinary nearest rounding cannot be hidden by a broad weight distribution. A minimum measurable changed fraction is required. Failure rejects the backend/dtype tuple.

### Full-model preflight

The final 1,180,540,928-parameter preflight now:

- requires a matching doctor report;
- runs at the same actual first-step LR;
- uses the selected persistent parameter dtype (`bf16` or `fp32`);
- allocates real optimizer state;
- requires nonzero sampled q_proj weight movement;
- still enforces >=0.75 GiB reserved VRAM headroom.

### Runtime qualification lock

`runtime_qualification_lock.json` SHA-pins both physical reports and records:

- GPU identity;
- PyTorch version;
- CUDA runtime;
- optimizer package version;
- optimizer backend;
- persistent parameter dtype;
- seq/microbatch/accumulation geometry;
- first-step LR;
- tiny-update and full-model update statistics.

The trainer refuses to start if the current environment or geometry differs from this lock.

### Persistent parameter fallback

Base-v1 keeps BF16 compute in all qualified modes. Persistent model parameters may be:

- `bf16`: memory-efficient target; requires tiny-update survival;
- `fp32`: precision fallback if the full 16GB preflight fits.

TorchAO8bit uses explicit BF16 stochastic rounding. Native Windows support still must be proven locally; if the native compiled path is unsuitable, WSL/Linux is a legitimate runtime choice rather than weakening the numerical gate.

## Checkpoint ABI v4

Because the runtime contract changed before training began, checkpoint format was bumped from v3 to v4. v4 now explicitly validates:

- beta1/beta2;
- epsilon;
- weight decay;
- grad clip;
- BF16 AMP compute contract;
- optimizer backend;
- persistent parameter dtype;
- training seed;
- CPU/Python/NumPy RNG state;
- CUDA RNG state (restore failure is fatal).

A new CPU synthetic checkpoint round-trip test serializes a real model+optimizer state and proves restoration of model weights, optimizer state, token counters, sampler cursor and Python/NumPy/Torch RNG streams.

## Context continuation correctness

Different sequence geometries no longer share one best-validation baseline. 2K uses canonical `best.pt`; later 4K/8K continuations use `best_seq4096.pt`, `best_seq8192.pt`, etc., and reset the best-loss baseline while retaining `last.pt` as the continuation chain.

## Compatibility

No Base checkpoint existed before this change, so no trained artifact was invalidated. Model architecture, tokenizer ABI, frozen corpus policy, QK-RMSNorm and document-aware packing remain unchanged.


## Final inference-boundary audit

The Base playground/API previously left-truncated long prompts and then re-added BOS. That created a synthetic `BOS -> arbitrary document tail` transition that is not produced by the document-aware training packer. A shared prompt builder now preserves the correct semantics:

- short Base continuation: `BOS + ordinary body`;
- left-truncated continuation: true mid-document suffix, **no synthetic BOS**;
- EOS/PAD/chat/tool/search/FIM/reasoning/control tokens: rejected from raw Base prompt bodies.

The generation regression now verifies both short and truncated prompt boundaries alongside independent per-row first-EOS stop, PAD-after-finish, EOT/EOS stop-set support and pathological-loop detection.

## Final audit conclusion

After this correction, the full release-blocker suite passes for model/QK-Norm, document repacking, EOS/generation, context-packing continuation, runtime qualification contracts, checkpoint-v4 serialization, training observability, frozen-source lifecycle and active CLI entrypoints. No additional source-level Base-v1 blocker is known. Remaining gates are empirical artifact construction and the physical target-GPU qualification; evidence from those gates may still expose a runtime/data issue, but there is no planned foundation redesign.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
