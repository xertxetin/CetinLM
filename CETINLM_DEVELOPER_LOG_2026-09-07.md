<div align="center">

# CetinLM Developer Log — 2026-09-07

**CetinLM Project History**  
`2026-09-07` · preserved engineering record

![Status](https://img.shields.io/badge/status-historical-6B7280)
![Project](https://img.shields.io/badge/project-CetinLM-111827)
![Current](https://img.shields.io/badge/current-V62.3-2563EB)

</div>

> [!IMPORTANT]
> **Historical record — not an active training instruction.** This file is retained for auditability and may describe decisions that were later superseded. For the current Base-v1 contract, use the [repository README](../../../README.md), [active checkpoint](../../0_CETINLM_ACTIVE_CHECKPOINT.md), and [final corpus/mix contract](../../0_CETINLM_BASE_V1_FINAL_CORPUS_AND_MIX.md).

---

## Corpus qualification milestone

CetinLM's Base-data work reached a preserve-first first-party qualification milestone. The project intentionally narrowed third-party natural-data support instead of maximizing web-corpus volume.

Current external support candidates retained for the active pass are Turkish and English FineWiki subsets after structure-aware Wiki cleaning. Uncontrolled web-derived candidates that did not meet manual content-audit expectations were excluded from the active training set.

The first-party corpus now uses two explicit quality lanes:

- **Main:** preserve valid short text, natural dialogue, code, HTML/markup and varied registers; remove high-confidence corruption and duplicate material.
- **Wiki:** preserve encyclopedic prose, Markdown headings and useful lists/tables while repairing high-confidence conversion residue and removing terminal navigation/reference chrome.

A final conservative "surgical" second pass was added after human sampling revealed occasional generated-topic stitching and small Wiki conversion remnants. The pass intentionally prioritizes retention: only narrow missing-boundary patterns are hard-rejected, while less certain topic shifts are surfaced for review.

The surgical implementation is multiprocessing for CPU-heavy row analysis while deterministic first-wins exact/near dedup remains ordered in the parent process.

This milestone changes no model architecture or training hyperparameters. The next engineering phase is corpus freeze, tokenizer measurement/freeze, exact token accounting, tokenized shard generation and training-system canaries.


## Preserve-first semantic audit correction (FIX2)

A second human audit of rejected first-party rows showed that even the narrower missing-boundary semantic heuristic could reject intentionally constructed educational examples. CetinLM therefore finalized a stricter preserve-first rule: semantic/topic heuristics are audit signals, not deletion rules, for curated first-party `main`. Structural corruption and dedup remain handled by the earlier deterministic preserve-first QC; Wiki cleanup continues to repair only high-confidence conversion residue. This keeps human-authored/AI-curated distributional diversity intact while retaining review visibility.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
