<div align="center">

# CetinLM Developer Log — Training Health Freeze — 2026-09-07

**CetinLM Project History**  
`2026-09-07` · preserved engineering record

![Status](https://img.shields.io/badge/status-historical-6B7280)
![Project](https://img.shields.io/badge/project-CetinLM-111827)
![Current](https://img.shields.io/badge/current-V62.3-2563EB)

</div>

> [!IMPORTANT]
> **Historical record — not an active training instruction.** This file is retained for auditability and may describe decisions that were later superseded. For the current Base-v1 contract, use the [repository README](../../../README.md), [active checkpoint](../../0_CETINLM_ACTIVE_CHECKPOINT.md), and [final corpus/mix contract](../../0_CETINLM_BASE_V1_FINAL_CORPUS_AND_MIX.md).

---

## Why this change exists

A final pretraining review was performed after the QK-RMSNorm architecture freeze. The goal was explicitly not to add experimental model features, but to prevent a long 10B-token job from producing ambiguous or biased evidence.

## Material findings

### 1. Validation selection bias

`evaluate()` recreated an iterator from the beginning of `val_global.bin` and consumed a small fixed number of initial sequences. Because token build writes validation sources contiguously, repeated validation could disproportionately represent the first source.

**Resolution:** token build now records per-source validation token ranges. Training uses fixed corpus-wide windows for the global best-checkpoint metric and fixed per-source windows for diagnostics.

### 2. Step-based operational cadence

`SAVE_INTERVAL=500` and `EVAL_INTERVAL=1000` coupled safety behavior to optimizer-step geometry. Their real wall-clock meaning would change if the 16GB preflight required a different microbatch/accumulation setting.

**Resolution:** cadence is token-based: early eval 10M, regular eval 100M, last/recovery checkpoint 50M.

### 3. Long-run observability

Console loss/LR/grad/tok-s existed but there was no durable machine-readable live state.

**Resolution:** low-overhead optimizer-step telemetry (`training_metrics.jsonl`, atomic `training_status.json`, final summary/failure JSON) plus a simple status CLI. No microstep hooks were introduced.

### 4. BF16 low-bit update visibility

The active 16GB design uses BF16 model weights and a low-bit optimizer. TorchAO documents stochastic rounding specifically to reduce tiny BF16 update loss without an FP32 master-weight copy.

**Resolution:** no backend was silently changed. The existing TorchAO8bit path retains `bf16_stochastic_round=True`; the full real-model preflight now reports sampled BF16 update survival, VRAM and throughput so the target machine can qualify the final backend before checkpoint lock. `bnb8bit` remains the source default until hardware evidence is collected.

### 5. Runtime persistence and disk safety

Runtime doctor/preflight results previously existed only as console text.

**Resolution:** both persist JSON reports in the Base-v1 telemetry directory. Runtime doctor checks free disk (30 GiB hard floor, 60 GiB recommended). Full preflight enforces 0.75 GiB default reserved-VRAM headroom.

## Hot-path performance discipline

- no activation hooks per microstep;
- no full-parameter scans per optimizer step;
- one optimizer-step telemetry boundary only;
- QK-Norm snapshot only during validation;
- fixed validation cost is tiny relative to a 100M-token interval.

## No architecture changes

The 1,180,540,928-parameter QK-RMSNorm Base-v1 geometry, 48K tokenizer ABI, context contract and frozen corpus policy are unchanged. This milestone hardens measurement/recovery around the frozen foundation.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
