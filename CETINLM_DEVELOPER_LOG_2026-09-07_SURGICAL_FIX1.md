<div align="center">

# Developer Log — Surgical QC FIX1

**CetinLM Project History**  
`2026-09-07` · preserved engineering record

![Status](https://img.shields.io/badge/status-historical-6B7280)
![Project](https://img.shields.io/badge/project-CetinLM-111827)
![Current](https://img.shields.io/badge/current-V62.3-2563EB)

</div>

> [!IMPORTANT]
> **Historical record — not an active training instruction.** This file is retained for auditability and may describe decisions that were later superseded. For the current Base-v1 contract, use the [repository README](../../../README.md), [active checkpoint](../../0_CETINLM_ACTIVE_CHECKPOINT.md), and [final corpus/mix contract](../../0_CETINLM_BASE_V1_FINAL_CORPUS_AND_MIX.md).

---

The first-party surgical QC was audited after its first complete run. Although total retention was high (98.5988%), manual review of the rejected sample found a systematic false-positive class: curated educational entries with constructions like `... öğrenirken Somut örneği ...` were interpreted as semantic stitches solely because a capitalized phrase followed a `-ken/-irken` form without punctuation.

The broad detector is now audit-only. This preserves valid curated material while still surfacing unusual transitions for review. The narrower missing-boundary detector remains a hard reject for clearly malformed joins. No model architecture, tokenizer, training code, wiki cleanup, dedup policy, or external-source decision changed.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
