# CetinLM Data Curation Update — 2026-09-02

## Rebuilding the 1B foundation

The first CetinLM-1B generation was trained quickly enough, and produced sufficiently encouraging behavior, to validate the core engineering direction. Instead of simply extending that run, the project is now using the result as evidence that a more disciplined second generation is worth building **from scratch**.

The objective is not to maximize the amount of text that reaches training. It is to maximize the probability that accepted text is actually worth learning from.

> **Current principle: clean data > more data.**

Raw web data is abundant. When a document is questionable, rejecting it is cheaper than teaching the model its noise.

## What changed

The active bilingual target remains:

```text
English 50%
  49% FineWeb-Edu deduplicated
   1% English Wikipedia

Turkish 50%
  49% TurkishFineWeb2-Cleaned
   1% FineWiki Turkish

Other languages 0%
```

In parallel, internally prepared high-quality Turkish datasets are being developed under their own quality/provenance process. They are intended to complement the selected public corpora later in the pipeline, not bypass the same audit standards.

## From hard precision to NUCLEAR

Several human-audit rounds showed that upstream quality scores alone are not enough for general web text. High-scoring pages can still contain SEO copy, commercial landing prose, forum/profile shells, stitched snippets, trading spam, presentation mirrors, program catalogs or malformed language.

The response was a sequence of increasingly strict policies:

- **v60 HARD PRECISION** — removed the lower-confidence Turkish web source, tightened TurkishFineWeb2 qualification and added source-specific hard gates.
- **v60.1 HARDCORE** — whole-document rejection for embedded URLs/domains, e-mail addresses, phone/contact-number artifacts, long raw identifiers, strong commercial/UI signals and trading/forex junk.
- **v60.2 FINAL HARDCORE** — added fail-closed page-type, forum/profile, SEO, route and translation-mirror controls; raised the real Turkish web precision floor to 0.92.
- **v60.3 NUCLEAR** — adds search/index/query rejection, presentation mirrors/transcripts, education/program marketing catalogs, salary/career SEO, service/CTA pages, stitched-news indexes, listicle shapes and audited garbled/low-trust forms; raises the real Turkish web precision floor to **0.94**.

The important design choice is that these are **document-level rejects**. The pipeline does not try to strip a phone number, remove a suspicious CTA and then rescue the rest. If the page shape is high-risk, the document is discarded.

## Qualification evidence

The last completed fresh-cache pilot was v60.2. Its TurkishFineWeb2 branch accepted:

```text
61 documents
565,991 characters
mean quality score: 93.41
minimum quality score: 92.01
```

The rejection telemetry showed the hard policy was active at scale, including tens of thousands of precision-score rejects and thousands of low-prose/template/commercial/page-shell rejects during acquisition.

After implementing v60.3, the 50-document accepted TurkishFineWeb2 audit pack from v60.2 was replayed through the new policy under corpus-like upstream quality conditions:

```text
v60.2 accepted audit pack: 50 documents
v60.3 replay rejected:      49 documents
v60.3 replay accepted:       1 document
```

The survivor is substantive long-form prose. This replay is intentionally severe and demonstrates the current precision-first direction, but it is **not** treated as a replacement for a fresh acquisition audit. The next gate is a new v60.3 clean-cache pilot followed by mechanical verification and human review.

## Safety, reproducibility and cache identity

The corpus pipeline remains immutable-revision based and source-aware. Dataset revisions are pinned, source/mix contracts are verified, and cache identity includes the active pipeline/policy/schema generation. v60.3 bumps that identity to a new v10-nuclear cache schema so documents accepted by an older filter generation cannot silently enter a new training build.

The local regression suite currently passes the quality stack, broader quality guard, text-only/web-chrome contract, tail/safety hardening and health-product precision tests. Full corpus-environment release verification is still run in the dedicated corpus environment before acquisition.

## Why train from scratch again?

The first 1B generation answered the most important early question: the architecture and training system can learn useful structure at this controlled scale. The next question is whether the same compute budget can be used more effectively when the foundation is cleaner.

The new generation therefore combines:

- a fresh tokenizer selected from 32K / 49K / 65K candidates,
- a much stricter bilingual corpus contract,
- internally prepared Turkish data after separate qualification,
- explicit human-audit gates before scaling,
- reproducible cache/tokenizer/data identities, and
- fresh random-initialization training after the final contracts are frozen.

The scale-up path remains deliberately gated:

```text
clean-text qualification
→ tokenizer candidate benchmark
→ explicit tokenizer freeze
→ 1M tokenized audit
→ 10M tokenized audit
→ final corpus freeze
→ large-scale corpus build
→ scratch CetinLM-1B training
```

The project is intentionally spending more effort before training starts. At 1B scale, a cleaner dataset and a more auditable pipeline are cheaper to fix now than after billions of tokens have already been consumed.

---

**Status at publication:** v60.3 NUCLEAR code/regression qualification complete; fresh v60.3 clean-cache human audit pending.
