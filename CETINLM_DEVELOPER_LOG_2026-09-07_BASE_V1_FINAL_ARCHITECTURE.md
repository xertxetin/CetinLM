<div align="center">

# CetinLM Developer Log — 2026-09-07 — Base v1 Architecture Lock

**CetinLM Project History**  
`2026-09-07` · preserved engineering record

![Status](https://img.shields.io/badge/status-historical-6B7280)
![Project](https://img.shields.io/badge/project-CetinLM-111827)
![Current](https://img.shields.io/badge/current-V62.3-2563EB)

</div>

> [!IMPORTANT]
> **Historical record — not an active training instruction.** This file is retained for auditability and may describe decisions that were later superseded. For the current Base-v1 contract, use the [repository README](../../../README.md), [active checkpoint](../../0_CETINLM_ACTIVE_CHECKPOINT.md), and [final corpus/mix contract](../../0_CETINLM_BASE_V1_FINAL_CORPUS_AND_MIX.md).

---

## Milestone

Corpus qualification is complete. Development moved from data salvage/filter iteration into the final scratch-model/tokenizer/training implementation.

The design goal is a professional single-GPU path rather than a sequence of disposable small-model pilots. The active hardware is an RTX 4070 Ti SUPER 16GB, so architecture decisions prioritize useful token throughput and stable full-pretraining memory instead of maximizing the parameter-count label.

## Data state

CetinLM Base-v1 is trusted-first:

- 297,354 first-party main rows;
- 19,229 first-party Wiki rows;
- ~19.8K FineWiki TR support rows;
- ~17.6K FineWiki EN support rows.

The semantic surgical pass was deliberately changed to audit-only after human review showed that topic-switch heuristics incorrectly rejected valid cross-concept teaching/reasoning examples. This preserves natural variation and accepts minor imperfections rather than sterilizing the corpus.

Serda/OSCAR-derived salvage, GOLD/DIAMOND, TurkishFineWeb2 and the FineWeb-Edu EN probe are excluded from active Base training.

A final assembler now performs only exact NFC-text cross-source dedup, with first-party priority.

## Model lock

The active profile is `cetinlm_1p18b`:

```text
24 layers
hidden 2048
16 query heads / 4 KV heads
head dim 128
FFN 5632 SwiGLU
Pre-RMSNorm
RoPE theta 500K
48K vocab
1,180,534,784 exact params
```

A `cetinlm_2p01b` future profile is encoded in the same model/config implementation. No second 2B codebase is required.

On CUDA, model parameters and gradients are BF16. This was explicitly corrected during the final audit: FP32 resident parameters under BF16 autocast would waste critical 16GB VRAM. AdamW8bit and activation checkpointing remain the active memory strategy.

## Smart context

The source no longer treats 2K/4K as an architectural wall. RoPE cache storage grows on demand and `max_seq_len=None` is the default. Initial Base training remains at 2048 for throughput; longer-context quality is intended as same-checkpoint continuation.

The implementation is intentionally conservative about RoPE scaling claims. Active code supports unscaled/default and linear scaling. A naive dynamic-NTK mode was not kept because cache-time frequency changes can invalidate consistency with already-rotated cached keys. YaRN/LongRoPE remain future research/evaluation tasks, not check-box features.

## Tokenizer lock

The final tokenizer is 48K Unigram with NFC-only normalization and ByteLevel pretokenizer/decoder. During implementation, the backend was refined from the earlier SentencePiece plan to Hugging Face Tokenizers Unigram+ByteLevel so code, HTML, Markdown, tabs, newlines and repeated spaces have an explicit reversible byte-level path while retaining Unigram segmentation.

Special-token IDs are allocated before Base training, including future chat/tool/search/FIM/document/reasoning slots and 32 generic reserved slots. Base raw pretraining uses only BOS/EOS boundaries.

No 32K/48K/65K tournament remains. Every final frozen source row is presented once to tokenizer training; main is never downsampled to a percentage.

## Token corpus and exposure

Base-v1 writes the unique token corpus once as uint32 shards. A deterministic 0.5% document holdout is validation. Metadata records exact token counts, source mix, hashes and effective passes.

The first exposure target is 10B tokens. The LR curve is defined over a 20B horizon from the first step so a later +10B continuation is a true resume rather than a restarted schedule.

## Full-model preflight

A new full-GPU preflight instantiates the actual 1.18B profile at 48K, casts parameters to BF16, uses seq=2048 + activation checkpointing, performs backward and executes a real AdamW8bit update so optimizer states are allocated. It reports peak allocated/reserved VRAM and writes no checkpoint. This replaces toy-model fit evidence.

## Continuity

Active state is now recorded in:

- `AGENTS.md`;
- `docs/0_CETINLM_ACTIVE_CHECKPOINT.md`;
- `docs/0_CETINLM_BASE_V1_FINAL_ARCHITECTURE.md`;
- `docs/0_CETINLM_CURRENT_STATE.md`;
- `docs/0_CETINLM_SCRATCH_BUILD.md`;
- `docs/0_CETINLM_NEW_CHAT_BOOTSTRAP.md`;
- latest handoff.

Older 50/50 web-bootstrap, tokenizer A/B and toy pilot roadmaps are historical only where they conflict with this dated contract.

## Final packaging audit addendum

- Re-ran modular layout, training-system static contract, first-party surgical regression, wiki/first-party preserve regression and local corpus regression: PASS.
- Re-ran the live model contract: active profile = 1,180,534,784 parameters; no baked context ceiling; KV-cache equivalence, causality and tied embeddings PASS.
- Added `docs/0_CETINLM_POSTTRAINING_COMPATIBILITY_CONTRACT.md` so future Instruct/Chat/Reasoning/Research/Search/Tool/Code/FIM/Safety/Identity compatibility is an explicit project ABI rather than conversational intent.
- Confirmed capability special tokens and 32 reserved future slots are allocated before Base pretraining; Base injects only BOS/EOS.
- Confirmed context extension is guarded: checkpoint continuation may change documented context/RoPE fields only and cannot silently change architecture/vocabulary.
- Final distributable is generated only after fresh SHA256 manifest and ZIP-integrity verification.

---

<!-- CETINLM_HISTORY_FOOTER -->
<div align="center">

<sub>Preserved CetinLM history · Current state lives in <a href="../../../README.md">README.md</a> and <a href="../../0_CETINLM_ACTIVE_CHECKPOINT.md">0_CETINLM_ACTIVE_CHECKPOINT.md</a>.</sub>

</div>
