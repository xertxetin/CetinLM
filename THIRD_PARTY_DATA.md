# CetinLM Third-Party Data Provenance and License Register

**Updated:** 2026-09-07  
**Scope:** Base-v1 pretraining source provenance. This is an engineering/provenance record, not legal advice.

This file records third-party sources that were evaluated for CetinLM, including active sources and rejected/inactive candidates. Historical entries are retained; they are not removed merely because a source is no longer active.

## Final active Base-v1 third-party sources

### FineWiki — Turkish FULL

- Upstream dataset: `HuggingFaceFW/finewiki`, Turkish (`tr`) configuration.
- Local role: Turkish encyclopedic support.
- Local file: `data/external_raw/finewiki_tr_full.jsonl`.
- Local framing: top-level JSON objects separated by literal `\\n`; parsed read-only, never repaired in place.
- Exact local accounting with frozen CetinTokenizer-v1:
  - documents: **629,762**
  - characters: **1,645,099,439**
  - body tokens: **411,036,879**
  - BOS+EOS: **1,259,524**
  - exact training tokens: **412,296,403**
- Status: **ACTIVE final Base-v1 source**.
- Upstream license metadata verified 2026-09-07: dataset card lists **CC BY-SA 4.0** and **GFDL**; the processed FineWiki dataset card should be preserved with attribution when redistributing derived data/model documentation.
- Attribution/provenance to preserve publicly: HuggingFaceFW FineWiki and underlying Wikipedia/Wikimedia provenance as described by the upstream card.

### FineWiki — English 400K controlled subset

- Upstream dataset: `HuggingFaceFW/finewiki`, English (`en`) configuration.
- Local role: controlled English encyclopedic support; intentionally not the full multi-million-row EN set.
- Local file: `data/external_raw/finewiki_en_400k/finewiki_en_400k.jsonl`.
- Local framing: same literal-`\\n` JSON-object stream; parsed read-only.
- Exact local accounting:
  - documents: **400,000**
  - characters: **2,715,597,558**
  - body tokens: **717,591,936**
  - BOS+EOS: **800,000**
  - exact training tokens: **718,391,936**
- Status: **ACTIVE final Base-v1 source**.
- License/provenance: same FineWiki dataset-card license metadata (**CC BY-SA 4.0 + GFDL**) and Wikipedia/Wikimedia attribution obligations described upstream.

### Temiz-OSCAR — filtered FULL preserve lane

- Dataset page: `YigitCahit/temiz-OSCAR`.
- Upstream source family recorded by its dataset card: OSCAR-2019, OSCAR-2109, OSCAR-2201 and OSCAR-2301; the card describes Temiz-OSCAR as part of Bella Turca.
- Dataset-card license metadata verified 2026-09-07: **CC BY-SA 4.0**.
- Raw upstream size/card accounting: **23,739,767 documents** across four snapshots.
- Local role: large cleaned Turkish natural/web knowledge backbone.
- Local accepted file: `data/external_filtered/temiz_oscar_full/accepted.jsonl`.
- Local preserve-first filter result:
  - raw rows: **23,739,767**
  - accepted: **20,302,145**
  - rejected: **3,437,622**
  - acceptance: **85.5196%**
  - exact duplicates removed during local lane: **3,285,666**
  - accepted characters: **47,709,094,190**
- Exact frozen-tokenizer accounting of accepted corpus:
  - body tokens: **10,239,134,755**
  - BOS+EOS: **40,604,290**
  - exact training tokens: **10,279,739,045**
- Local rejection policy was intentionally conservative: high-confidence adult/escort promotion, gambling acquisition, sales/listings/affiliate/SEO/CTA/contact/link-shell garbage, pathological repetition/mojibake and exact duplicates; informational/news/technical/natural prose was preserved where possible.
- Status: **ACTIVE final Base-v1 source**, superseding the earlier probe/audit-only status.
- Important rights caveat: OSCAR-derived data consists of web-crawled text. Dataset-level license metadata does not erase possible rights/terms attached to individual upstream web pages. Public release documentation should preserve dataset attribution and avoid claiming ownership of third-party source text.
- Citation/provenance: preserve the Temiz-OSCAR/Bella Turca citation supplied by the dataset card in public dataset/model documentation.

## First-party sources (not third-party licenses)

These are listed here only so the final corpus register is complete. Their ownership/provenance is project-controlled rather than inherited from the third-party datasets above.

- `first_party_main`: 297,354 docs / 27,965,241 exact pre-dedup training tokens.
- `first_party_wiki`: 19,229 docs / 28,785,197 exact pre-dedup training tokens.

## Final active five-source pre-dedup accounting

| Source | Documents | Exact training tokens |
|---|---:|---:|
| first_party_main | 297,354 | 27,965,241 |
| first_party_wiki | 19,229 | 28,785,197 |
| FineWiki TR FULL | 629,762 | 412,296,403 |
| FineWiki EN 400K | 400,000 | 718,391,936 |
| filtered Temiz-OSCAR FULL | 20,302,145 | 10,279,739,045 |
| **TOTAL** | **21,648,490** | **11,467,177,822** |

These are pre-cross-source-dedup numbers. Final unique train/validation statistics are generated only by the immutable Base-v1 build.

## Final dedup/admission policy

Global exact dedup during Base-v1 build uses `SHA256(NFC(text))`. Duplicate winner order:

1. first-party main
2. first-party own wiki
3. FineWiki TR
4. FineWiki EN
5. Temiz-OSCAR

Near/semantic dedup is audit-only in this generation. The final source manifest SHA-pins the exact local bytes and accounting reports before token build.

## Rejected / inactive third-party candidates

### Serda Turkish raw-text / GOLD / DIAMOND salvage

- Status: **INACTIVE / excluded from final Base-v1**.
- Reason: contamination/quality review and final source selection favored the cleaner exact-accounted five-source set.
- Historical filters/reports remain in the repository for auditability.

### TurkishFineWeb2-cleaned

- Status: **INACTIVE / excluded from final Base-v1**.
- Historical investigation remains documented.

### FineWeb-Edu English probe

- Status: **INACTIVE / excluded from final Base-v1**.
- It is not silently reintroduced by the final mixer.

## Release rule

A source is training-active only if all of the following are true:

1. provenance/license information is recorded here;
2. local bytes are available and read-only;
3. exact frozen-tokenizer accounting report is PASS;
4. final source manifest pins source/report SHA-256;
5. global exact dedup/build verification passes;
6. source appears in the final post-dedup metadata and explicit `training_data_lock.json`.

README/model-card language must distinguish dataset-card license metadata from ownership of underlying third-party text and must not claim that source-code verification equals legal clearance or trained-model capability.
