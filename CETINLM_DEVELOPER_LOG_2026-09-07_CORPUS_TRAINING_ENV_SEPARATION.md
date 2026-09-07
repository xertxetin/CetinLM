<div align="center">

# CetinLM Developer Log — Corpus/Training Environment Separation

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
**Class:** release-significant environment/reproducibility fix

## Problem

The first operator invocation of `python scripts/project/verify_base_v1_release.py` was correctly run from `.venv-corpus-v54`, a deliberately Torch-free corpus/tokenizer environment. The gate failed before corpus construction because Python package initialization and the static training verifier transitively imported `torch`.

Installing PyTorch into the corpus environment would have hidden the layering bug and weakened the project's dependency-isolation contract.

## Fix

- `mertai.models.cetinlm_1b.__init__` now imports `CetinLM` lazily; model configuration/tokenizer tooling remains importable without PyTorch.
- `verify_training_system.py` is now a Torch-free static contract verifier. It checks architecture parameter math and parses literal training/packing contracts from source without executing the trainer.
- `verify_base_v1_release.py` is Torch-free by default.
- PyTorch/model/checkpoint/runtime tests are available only via explicit `--with-training-runtime` in the later training environment.
- Physical CUDA facts remain runtime-doctor/full-model-preflight/runtime-lock responsibilities.

## Regression proof

The source release gate was executed with a deliberately shadowed `torch` module that raises `ModuleNotFoundError`. Static architecture/training contracts, corpus regressions, atomic frozen-source tests, lifecycle guards, and tokenizer CLI smoke tests all passed without Torch.

## Compatibility

No model geometry, tokenizer ABI, corpus policy, training recipe, checkpoint ABI, or data artifact changed. No corpus/tokenizer operation had started when the bug was discovered, so there is no migration or data recovery requirement.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
