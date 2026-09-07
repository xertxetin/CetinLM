<div align="center">

# CetinLM Developer Log — Temiz-OSCAR Preserve Lane

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

Added a source-specific preserve-first external Turkish lane for Temiz-OSCAR without changing the existing first-party, wiki, ELITE, GOLD or DIAMOND filters. The lane rejects high-confidence adult/escort promotion, gambling acquisition, sales/listing, affiliate/SEO/CTA, contact/link-shell and forum/navigation spam while preserving informational/scientific/news/technical/cultural prose.

The filter uses multi-process CPU classification, disk-backed exact SHA-256 dedup, deterministic audit reservoirs, optional conservative near-dedup, and can read both normal JSONL and the earlier 100K probe accidentally written with literal `\n` separators.

`THIRD_PARTY_DATA.md` is now the centralized provenance/attribution register. Temiz-OSCAR remains candidate-only until full audit, exact token accounting and provenance/license review are frozen.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
