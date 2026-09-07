<div align="center">

# CetinLM Developer Log — 2026-09-07 — Base-v1 Release Audit Final

**CetinLM Project History**  
`2026-09-07` · preserved engineering record

![Status](https://img.shields.io/badge/status-historical-6B7280)
![Project](https://img.shields.io/badge/project-CetinLM-111827)
![Current](https://img.shields.io/badge/current-V62.3-2563EB)

</div>

> [!IMPORTANT]
> **Historical record — not an active training instruction.** This file is retained for auditability and may describe decisions that were later superseded. For the current Base-v1 contract, use the [repository README](../../../README.md), [active checkpoint](../../0_CETINLM_ACTIVE_CHECKPOINT.md), and [final corpus/mix contract](../../0_CETINLM_BASE_V1_FINAL_CORPUS_AND_MIX.md).

---

## Scope

This entry records only release-significant engineering work completed before CetinLM Base-v1 tokenizer construction and pretraining. It intentionally omits cosmetic churn.

## Material changes completed

### 1. Base-v1 architecture contract

The active scratch configuration is 1,180,534,784 parameters using one profile-driven `CetinLM(config)` implementation: 24 decoder layers, hidden size 2048, 16 query heads, 4 KV heads, 128 head dimension, 5632 SwiGLU intermediate width, Pre-RMSNorm, tied embeddings, GQA, RoPE theta 500000, PyTorch SDPA, BF16 CUDA parameters/gradients and the AdamW8bit training path.

A future ~2.013B profile uses the same implementation but is not checkpoint-compatible with the active 1.181B geometry.

### 2. Tokenizer ABI frozen before Base training

CetinTokenizer-v1 is defined as a 48,000-token Unigram + ByteLevel tokenizer with NFC-only normalization and preservation of Turkish casing/diacritics, code, HTML, Markdown and whitespace structure. Base/core tokens plus future Chat, Tool, Search, Code/FIM, Reasoning and document-control tokens are reserved before Base training so later post-training does not require vocabulary/embedding resize.

### 3. Trusted-first corpus generation and freeze discipline

The active Base-v1 source families are first-party main, first-party wiki, FineWiki TR and FineWiki EN. Noisy web-salvage candidates are excluded. First-party semantic heuristics are audit-only rather than destructive. Final source assembly uses priority-aware exact NFC-text dedup.

Frozen four-source assembly was hardened to use staging plus atomic commit. Reserved control-token literals in raw Base text abort the build. Lifecycle guards prevent silent rebuilding of upstream source/tokenizer/token artifacts after downstream locks/checkpoints exist.

### 4. Exact measured-mixture lock

Training does not infer or hard-code source percentages before tokenization. Exact source token counts are measured from frozen token shards. The trainer requires an explicit mixture/data lock that pins tokenizer/data identity before the 10B run can start.

### 5. 10B -> 20B continuation contract

The first Base stop is 10B exposure tokens while the LR horizon is defined over 20B. Checkpoints carry model, optimizer, processed-token count, deterministic sampler position, config/data/tokenizer identity and Python/NumPy/Torch/CUDA RNG state so a healthy 10B run can continue toward 20B without resetting warmup or optimizer state.

### 6. Smart-context / no baked position ceiling

Base-v1 begins at 2048-token training geometry for single-GPU efficiency, but the model has no fixed learned position-table ceiling. RoPE cache growth is dynamic and context policy is config-driven. Longer context is a continuation/evaluation problem, not a tokenizer/model rewrite. Unvalidated long-context scaling methods are not advertised as supported.

### 7. Runtime and VRAM gates

The source tree does not claim target-GPU success without measurement. The target machine must run a runtime doctor that proves CUDA, BF16, SDPA/GQA and an optimizer update, followed by a full 1.181B BF16 forward/backward/AdamW8bit preflight with peak-VRAM reporting before the 10B job is operationally approved.

A configurable `CETINLM_BASE_V1_RUNTIME_ROOT` keeps multi-GB token shards and checkpoints off a OneDrive-backed source checkout when desired.

### 8. Active utility migration

Active evaluation, inspection, validation and profiling entrypoints were detached from historical Phase-II constants such as the old 65,536-vocabulary/short-context geometry. Legacy implementations were retained under history for provenance rather than left active and ambiguous.

### 9. Post-training compatibility contract

Base-v1 is intentionally compatible with continuation into Instruction, Chat, Reasoning, Research/Search, Tool use, Code/FIM, Safety and Identity stages without tokenizer resize or Base reinitialization. Special-token IDs and model/tokenizer ABI are generation-level contracts once Base training begins.

### 10. Meaningful-change policy

A repository policy now defines what qualifies as a release-significant engineering change. Model/data/tokenizer/training/runtime/reproducibility/post-training contract changes and silent-corruption fixes are milestone-worthy. Cosmetic refactors, renames and speculative unvalidated features are not promoted as major progress.

## Compatibility status

No Base-v1 training checkpoint exists yet, so these changes define the generation before pretraining begins. After Base training starts, architecture geometry, tokenizer ABI, frozen token data and special-token IDs are treated as breaking-generation boundaries and may not be silently changed under an ordinary patch.

## Remaining empirical gates

- build and freeze the final four-source corpus generation;
- train/freeze CetinTokenizer-v1 and record its SHA;
- tokenize/build immutable uint32 shards and measure exact unique/source token counts;
- approve the measured mixture/data lock;
- pass the target RTX 4070 Ti SUPER runtime doctor;
- pass the real 1.181B full-model GPU preflight;
- only then start the 10B Base run.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
