<div align="center">

# CetinLM Developer Log — Base-v1 QK-RMSNorm Architecture Freeze

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
**Milestone class:** release-significant model architecture / training stability

## Change

Added independent per-head Q/K RMS normalization to every Base-v1 attention layer.

Implementation order:

```text
q_proj -> reshape [B,H,T,D] -> q_norm(D) -> RoPE
k_proj -> reshape [B,KV,T,D] -> k_norm(D) -> RoPE
v_proj -> reshape [B,KV,T,D] ----------------> attention
```

- `D = head_dim = 128`
- epsilon = `1e-6`
- V remains unnormalized
- QK-Norm is enabled by default in the active model config
- the setting is checkpoint architecture state and is not part of allowed context-only drift

## Parameter impact

QK-RMSNorm adds `2 * 128 = 256` parameters/layer. Across 24 layers this is exactly **6,144** parameters.

```text
before: 1,180,534,784
final : 1,180,540,928
```

The future 2.01B profile becomes 2,013,091,328 parameters at 48K.

## Verification added

`python scripts/project/test_qk_norm_contract.py`

The test verifies:

- active QK-Norm flag;
- exact head-dimension norm shapes;
- identity initialization;
- exact parameter delta/count;
- finite forward loss;
- finite backward gradients into Q/K norm parameters.

The existing model contract continues to verify KV-cache equivalence, causal isolation, tied embeddings and no baked context ceiling with QK-Norm active.

## Engineering rationale

This was accepted because it is a low-overhead stability mechanism used by modern Qwen3 and Gemma 3 attention stacks. It materially affects pretraining stability while adding negligible model size and no KV-cache width. It therefore qualifies under the project's meaningful-change policy.

## Freeze decision

This is the **last planned architecture change before Base-v1 tokenizer/data construction and target-GPU preflight**. Architecture novelty is now closed except for correctness blockers or evidence strong enough to declare a new Base generation.

Future work should target measured capability gain through data, token exposure, context continuation, SFT, reasoning, research/search/tools, code/FIM, preference/RL stages, safety and identity rather than repeatedly mutating the Base decoder.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
