<div align="center">

# CetinLM Developer Log — Document Packing / EOS / Loop Stop Freeze

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
**Milestone class:** release-significant data-loader, generation correctness, reproducibility and model-health instrumentation

## Problem statement

A previous 1B experiment had practical generation defects: extra EOS behavior, failure to stop at the intended point, and repetitive loops. The Base-v1 audit also found that the current shared generation engine stopped a batch only when all rows emitted EOS in the same step, and the active root chat playground was still tied to historical Phase-I geometry. Separately, fixed 2048-token chunk boundaries caused repeated corpus passes to reuse the same sequence neighborhoods.

These are not cosmetic issues; they can waste a multi-billion-token run or misdiagnose model quality.

## Material changes

### Indexed immutable documents

Base train data is now one immutable document store (`documents.bin/.idx/.source.bin`) rather than fixed training chunks. Validation also stores document offsets/source IDs.

### Strict Base boundary grammar

Every document is required to have exactly one leading BOS and one terminal EOS, with no internal BOS/EOS or other reserved control IDs. Packed document boundaries are EOS -> BOS. Consecutive EOS is rejected.

### Deterministic epoch-aware repacking

Added `training/document_packing.py` with persistent document/sample/shuffle indexes. Every packing epoch deterministically reshuffles document order while retaining reproducibility. The 20B schedule horizon is covered without writing a duplicate 20B token file.

### Exact packing resume

Checkpoint version moved to v3. Packing seed, packing-plan SHA, epoch and sample cursor are checkpoint state. Save refuses a processed-token/cursor mismatch. DataLoader workers remain zero until consumed-cursor accounting is implemented, preventing prefetch from corrupting exact-resume position.

### Generation first-stop correction

Rewrote the shared generation engine so batch rows finish independently on the first stop token. Finished rows are PAD-filled in later rectangular columns and never receive duplicate EOS/random continuation. Added pathological suffix-cycle detection as an optional safety stop.

### Raw health vs safe decoding

Balanced Base playground can use conservative repetition controls. Raw mode remains penalty-free/guard-free so model quality is inspectable rather than hidden. Periodic training health uses raw greedy generation to report EOS/loop/max-length behavior.

### Held-out EOS health

Validation now measures P(EOS) at real held-out document ends and P(BOS)/P(EOS) after EOS across all source lanes. Periodic raw generation health begins at 100M tokens and repeats every 500M.

### Base playground/API migration

The stale historical Phase-I chat path was replaced by a Base-v1 continuation playground using checkpoint config, the 48K tokenizer identity and the shared generator. API runtime was migrated to Base-v1 paths/context/BF16 semantics and the same stop/repetition helpers.

Raw Base prompts are BOS + ordinary body, never prompt EOS, and all reserved special-token IDs are rejected from the body.

### Future SFT stop semantics

Named role/EOT IDs are part of tokenizer ABI. Future Chat SFT reserves `<|end_of_turn|>` for turn stop while EOS remains sample/document end. The shared generator already accepts multiple stop IDs, preventing a future need to overload EOS for every assistant turn.

## Verification

Added/updated:

- `test_document_packing_contract.py`
- `test_generation_stop_contract.py`
- `test_training_observability_contract.py`
- `verify_training_system.py`
- `verify_data.py --deep`
- `evaluate_base_generation_health.py`

Synthetic contracts verify deterministic packing bytes, per-epoch full document coverage, changing document order, EOS->BOS boundaries, no EOS-EOS, exact cursor resume, independent batch stopping, one generated EOS per EOS-finished row, loop detection, raw loop visibility and future EOT/EOS stop-set support.

## Architecture compatibility

No decoder architecture, parameter geometry, QK-RMSNorm, RoPE, tokenizer vocabulary size or 10B/20B scheduler contract changed. This is a pretraining data-loader/generation correctness freeze.

## Remaining empirical gates

Real corpus/tokenizer artifacts do not yet exist in the packaging environment. Target GPU runtime/VRAM and actual model EOS/loop rates remain measured gates, not claimed results.

## Final continuation audit addendum

A release audit found that the first document-aware implementation accidentally made `training_data_lock.json` include the initial packing identity. That was safe for the 2K run but contradicted the intended non-breaking 2K→4K/8K continuation path: a changed sequence length necessarily needs a different `sample_index/shuffle_index` geometry.

Resolution:

- training-data lock v2 freezes immutable tokenizer/document/validation/mix identity separately from packing;
- active checkpoint `data_contract` still pins its exact packing SHA;
- exact resume refuses a different packing plan;
- `--context-extension` may accept a different packing SHA only when all immutable identities and the same mixture-lock SHA match;
- added `build_context_packing.py` to derive later sequence geometries from the locked documents;
- added `test_context_packing_continuation_contract.py` for packing-only compatibility and immutable drift rejection;
- fixed throughput timer contamination from validation/checkpoint I/O.

This is a real future-proofing fix, not a model-architecture change.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
