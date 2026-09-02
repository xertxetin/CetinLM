# CetinLM — Phase-II Corpus Specification

**Document type:** Internal engineering specification / public-safe research design  
**Status:** Draft v1 — ready for implementation  
**Date:** 2026-08-31  
**Model continuation:** CetinLM-1B-Base Phase-I → Phase-II continued pretraining  
**Phase-I selected baseline:** `best.pt` @ step 122,000 / 999,424,000 processed tokens  
**Phase-I trainer best validation loss:** 3.380473  
**Phase-I independent benchmark validation loss:** 3.380097  
**Phase-I independent benchmark PPL:** 29.374

---

# 0. Executive Decision

Phase-II will **continue from the Phase-I best checkpoint**.

It will **not** restart the model from random initialization.

The first Phase-II corpus build will target approximately:

```text
+1.0B usable training tokens
```

which creates the first cumulative research gate around:

```text
~2B total model training tokens
```

Phase-II data must be materially better than Phase-I data.

The main goals are:

1. eliminate known document-boundary defects;
2. improve data quality and deduplication;
3. make English and Turkish first-class languages;
4. retain useful multilingual coverage;
5. preserve longer documents for future dynamic-context training;
6. introduce stronger provenance and corpus statistics;
7. reduce repetition-heavy and low-information text;
8. create validation sets that measure English, Turkish and multilingual quality separately;
9. add benchmark-contamination controls;
10. block training automatically if corpus invariants fail.

---

# 1. Non-Negotiable Rule

**No Phase-II training starts merely because enough tokens exist.**

Training starts only after the corpus passes the Phase-II acceptance gates defined in this document.

The pipeline must prefer:

```text
less data + higher quality + measurable provenance
```

over:

```text
more tokens + unknown quality
```

---

# 2. Phase-I Lessons That Directly Affect Phase-II

Phase-I succeeded as a complete training-system experiment, but exposed several data limitations.

Confirmed findings:

```text
1B Phase-I train tokens
10M held-out validation tokens
22-language corpus
custom 65,536-token tokenizer
English + Turkish elevated importance
```

Observed issues:

```text
<eos><eos><bos>
```

appeared repeatedly at document boundaries.

Raw generation also showed:

- strong phrase repetition;
- sentence-level loops;
- weak stopping behavior;
- domain drift;
- occasional language drift;
- weak factual reliability;
- weak arithmetic;
- English/Turkish capability present but uneven;
- heavy web-continuation behavior.

Phase-II corpus work must address the parts of these problems that are data-driven.

It must **not** assume every problem is caused by data.

Some limitations belong to:

- model scale,
- token budget,
- sequence length,
- decoding,
- later instruction tuning,
- later preference/chat training.

---

# 3. Corpus Target

## 3.1 First Phase-II gate

Initial usable-token target:

```text
1,000,000,000 Phase-II tokens
```

This is a target after:

- normalization,
- filtering,
- deduplication,
- language verification,
- boundary construction,
- tokenizer encoding,
- final corpus audits.

Raw source volume must therefore be larger than 1B tokens.

---

## 3.2 Do not force exact raw-source ratios

The corpus builder should work from target ranges rather than blindly filling fixed percentages.

If a language/source bucket cannot meet the quality bar, the pipeline must:

```text
underfill the bucket
```

rather than:

```text
lower quality until quota is reached
```

---

# 4. Phase-II Data Composition Strategy

The recommended starting structure is:

```text
85% ± 5% fresh / newly prepared higher-quality material
15% ± 5% selective Phase-I replay
```

This is an initial engineering target, not a permanent law.

Allowed range:

```text
Fresh/new material : 80–90%
Replay             : 10–20%
```

Replay must be selective.

Do **not** simply concatenate random Phase-I shards.

---

# 5. Why Replay Exists

Selective replay can help preserve:

- general-language coverage;
- multilingual breadth;
- common syntax and world knowledge;
- distributions already learned successfully in Phase-I.

Replay is **not** intended to reproduce known Phase-I defects.

Replay candidates must pass the Phase-II cleaning pipeline.

If a Phase-I document contains:

- duplicated boundaries,
- obvious duplication,
- broken text,
- excessive boilerplate,
- malformed encoding,
- spam,
- repeated navigation,
- low-information templates,

it should not be replayed merely because the model saw it before.

---

# 6. Language Strategy

English and Turkish become **first-class languages** in Phase-II.

Recommended starting token-share ranges:

| Language group | Target range |
|---|---:|
| English | **35–45%** |
| Turkish | **20–30%** |
| Other 20 languages combined | **30–40%** |

A strong initial working point is:

```text
English : 40%
Turkish : 25%
Others  : 35%
```

This is a corpus-construction target.

The exact final mixture must be reported from **actual tokenized counts**, not source-document counts.

---

# 7. Other-Language Coverage

The following Phase-I languages should remain represented:

```text
de  German
fr  French
es  Spanish
pt  Portuguese
it  Italian
nl  Dutch
pl  Polish
ru  Russian
uk  Ukrainian
ar  Arabic
fa  Persian
hi  Hindi
bn  Bengali
ur  Urdu
id  Indonesian
vi  Vietnamese
th  Thai
zh  Chinese
ja  Japanese
ko  Korean
```

Do not spread the remaining multilingual allocation uniformly without evidence.

Actual weights should account for:

- data quality,
- corpus size,
- tokenizer efficiency,
- script coverage,
- duplication levels,
- downstream research value.

---

# 8. Minimum Language-Floor Principle

A language should not remain nominally “supported” while receiving effectively zero usable Phase-II data.

For every retained language, record:

```text
documents
characters
raw tokens
final CetinLM tokens
percentage of corpus
average document length
median document length
dedup removal rate
quality-filter removal rate
```

If a language is too small to remain meaningful, document that fact explicitly.

---

# 9. Turkish Quality Standard

Turkish data quality is a major Phase-II priority.

Turkish must not consist primarily of:

- machine-translated English;
- SEO pages;
- broken scraped news templates;
- keyword spam;
- repeated ecommerce descriptions;
- duplicated press releases;
- forum signatures;
- navigation text;
- malformed UTF-8;
- auto-generated summaries;
- low-quality content farms.

Preferred Turkish sources should increase representation of:

- native Turkish prose;
- high-quality journalism;
- technical writing;
- educational material;
- essays;
- explanatory content;
- scientific/engineering material;
- natural discussion;
- long-form writing;
- documentation;
- public-domain / appropriately usable literature where applicable;
- high-quality question/answer style text where licensing permits;
- culturally native Turkish text.

---

# 10. Turkish Linguistic Coverage

Phase-II Turkish data should deliberately contain:

- rich suffix chains;
- inflectional morphology;
- derivational morphology;
- agglutinative constructions;
- case marking;
- possessive forms;
- tense/aspect/mood variation;
- formal and informal registers;
- quotations;
- punctuation;
- proper nouns;
- Turkish diacritics;
- code-switching with English where naturally occurring.

Specific forms should not be artificially synthesized solely to satisfy a checklist.

The goal is **natural coverage**, not grammar-table memorization.

---

# 11. English Quality Standard

English remains the main general-purpose research language.

English Phase-II data should prioritize:

- high-information prose;
- technical writing;
- educational material;
- scientific explanations;
- software/documentation text;
- strong long-form coherence;
- encyclopedic knowledge;
- natural conversational prose;
- high-quality reasoning-like exposition;
- mathematics and quantitative explanations where naturally represented.

Avoid overloading the corpus with:

- generic SEO text;
- repeated marketing copy;
- boilerplate;
- scraped navigation;
- autogenerated text;
- near-identical news syndication;
- duplicated code documentation.

---

# 12. Domain Mix

Language mix and domain mix are separate dimensions.

Recommended domain categories:

```text
general knowledge
technical / engineering
science
software / computing
mathematics
education
high-quality web prose
news / current-affairs archives
culture / humanities
long-form prose
natural discussion
reference / documentation
```

No single web domain or content template should dominate.

---

# 13. Quality Tiers

Every document should receive a quality tier or score.

Recommended tiers:

## Tier A — preferred

Examples:

- clean educational prose;
- coherent technical documentation;
- strong scientific text;
- carefully edited articles;
- high-quality native Turkish;
- high-quality English;
- long coherent documents;
- structured reference material.

Target:

```text
60–70% of final tokens
```

---

## Tier B — acceptable

Examples:

- ordinary clean web text;
- good forum/discussion text;
- moderate-quality journalism;
- useful reference pages;
- less polished but coherent material.

Target:

```text
25–35% of final tokens
```

---

## Tier C — limited diversity bucket

Examples:

- noisier but still useful text;
- niche domains;
- unusual styles;
- short clean fragments.

Maximum target:

```text
<= 10%
```

Tier C must never become a dumping ground for failed quality filters.

---

# 14. Hard-Reject Content

Reject documents containing severe examples of:

```text
empty text
near-empty text
binary garbage
HTML/JS/CSS remnants dominating text
navigation-only pages
cookie banners
repeated legal footers
repeated menu items
link farms
keyword stuffing
character corruption
broken Unicode
extreme symbol noise
extreme repeated lines
extreme repeated phrases
machine-generated template spam
mass duplicated product descriptions
scraper errors
placeholder pages
error pages
login pages
CAPTCHA pages
```

---

# 15. Repetition Filtering

Because Phase-I generation showed strong repetition, Phase-II must explicitly measure source repetition.

Per-document metrics should include:

```text
duplicate-line ratio
duplicate-paragraph ratio
repeated n-gram ratio
unique-token ratio
character entropy
top repeated substring count
```

Documents with pathological repetition should be rejected.

Example:

```text
"verileri, verileri, verileri, verileri..."
```

or:

```text
same sentence
same sentence
same sentence
same sentence
```

should not survive ordinary quality filtering.

---

# 16. Boilerplate Removal

Before document-level deduplication, remove boilerplate where possible.

Examples:

```text
site navigation
headers
footers
cookie notices
share buttons
related-content lists
copyright footer repetition
author widgets
newsletter prompts
social media menus
breadcrumb trails
```

Boilerplate left intact creates false duplication and teaches low-value repeated structures.

---

# 17. Unicode Normalization

Use one documented Unicode normalization policy.

Recommended starting point:

```text
NFC
```

Do not blindly remove legitimate language-specific characters.

Preserve:

```text
Turkish İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü
Arabic/Persian script
Cyrillic
Devanagari
Bengali
Thai
CJK
Korean
Japanese kana
```

Reject or repair invalid Unicode before tokenization.

---

# 18. Mojibake Detection

Phase-II should explicitly detect likely mojibake.

Examples:

```text
TÃ¼rkiye
baÅŸkenti
Ã¶ÄŸrenme
```

Important:

The tokenizer's internal debug display can show byte-level forms that resemble mojibake while decoded output remains correct.

Therefore mojibake detection must operate on the **source Unicode text before tokenizer encoding**, not tokenizer token-string debug output.

---

# 19. Whitespace Normalization

Normalize pathological whitespace while preserving meaningful document structure.

Recommended:

```text
CRLF -> LF internally
trim trailing spaces
collapse excessive blank lines
limit extreme repeated spaces
preserve paragraph boundaries
preserve code indentation in code blocks
```

Do not flatten every document to one line.

Long-context training benefits from meaningful structure.

---

# 20. Document Boundary Contract

Every document must have exactly one canonical boundary representation.

Phase-I showed:

```text
<eos><eos><bos>
```

Phase-II must forbid this.

Recommended logical packing:

```text
<bos>
DOCUMENT
<eos>
<bos>
NEXT DOCUMENT
<eos>
```

Equivalent flat token stream:

```text
<bos> doc_1 <eos> <bos> doc_2 <eos> <bos> doc_3 <eos>
```

Forbidden:

```text
<eos><eos><bos>
<bos><bos>
<eos><eos>
```

unless an explicit future experiment intentionally changes the convention.

---

# 21. Root-Cause Requirement for Double EOS

Do not merely run a final replacement:

```text
<eos><eos><bos> -> <eos><bos>
```

and declare victory.

The pipeline must identify which layer inserted the duplicate EOS.

Possible causes:

```text
source formatter adds EOS
+
packer adds EOS
```

or:

```text
tokenizer wrapper adds EOS
+
dataset writer adds EOS
```

The root cause must be removed.

A cleanup pass may remain as a final invariant guard, but not as the primary fix.

---

# 22. Boundary Invariants

Before final shards are accepted:

```text
double_eos_count == 0
double_bos_count == 0
eos_eos_bos_count == 0
bos_bos_count == 0
```

Also report:

```text
document_count
BOS count
EOS count
BOS/EOS ratio
tokens/document
median tokens/document
p90 tokens/document
p95 tokens/document
p99 tokens/document
```

For the canonical format, BOS and EOS counts should be approximately equal.

---

# 23. Long-Document Preservation

Phase-II should not destroy long documents merely because Phase-I trained at sequence length 256.

Store the cleaned corpus at document level before sequence packing.

Recommended persistent source artifact:

```text
one record = one cleaned document
```

with metadata.

Then create training views for:

```text
256
512
1024
2048
4096
```

without rerunning the entire web-cleaning pipeline.

---

# 24. Long-Document Splitting

Documents longer than the model's usable maximum should be split using structure-aware rules.

Prefer boundaries such as:

```text
section
heading
paragraph
sentence
```

Avoid arbitrary character cuts where possible.

Do not insert fake document EOS boundaries inside every arbitrary chunk unless the chunk is intentionally treated as a standalone document.

---

# 25. Short Documents

Very short documents can be useful but should not dominate.

Track:

```text
<32 tokens
32–63
64–127
128–255
256–511
512–1023
1024–2047
2048–4095
4096+
```

A corpus dominated by tiny fragments increases boundary frequency and can reduce long-form learning.

---

# 26. Document-Length Goal

Phase-II should deliberately improve length diversity compared with Phase-I.

The corpus should contain enough long documents to support:

```text
512
1024
2048
4096
```

training buckets.

Do not define success merely as:

```text
"we have some 4096-token documents"
```

Report the actual token mass available in each length bucket.

---

# 27. Exact Deduplication

Exact deduplication happens first.

Create a canonical normalized document string.

Hash it with a stable hash such as:

```text
SHA-256
```

Reject repeated canonical documents.

Store:

```text
document_hash
source
language
original_id
```

for traceability.

---

# 28. Near-Deduplication

Exact hashes do not catch:

- copied articles with minor edits;
- syndicated news;
- repeated documentation versions;
- template variations;
- whitespace/punctuation changes.

Phase-II therefore requires near-deduplication.

Implementation may use:

```text
MinHash
LSH
n-gram similarity
SimHash
```

or another measured technique.

The chosen threshold must be recorded.

---

# 29. Cross-Source Deduplication

Deduplication must operate across sources.

Do not only dedup:

```text
source A against source A
```

while allowing the same document from:

```text
source A
source B
source C
```

to survive three times.

---

# 30. Cross-Language Duplication

Do not remove genuine translations merely because semantic meaning matches.

However, machine-generated multilingual mirrors should be flagged.

Record likely translated duplicates separately.

This is particularly important for Turkish:

```text
native Turkish
```

must not be drowned by:

```text
translated English replicas
```

---

# 31. Phase-I Replay Deduplication

Replay data must be checked against fresh Phase-II data.

If a fresh higher-quality copy exists:

```text
keep fresh copy
drop replay duplicate
```

This prevents wasting the token budget on duplicate information.

---

# 32. Language Identification

Every document must receive:

```text
language
language confidence
```

Do not infer language solely from source domain or URL.

Mixed-language documents should be allowed when natural, but flagged.

Examples:

```text
Turkish prose + English code identifiers
English technical text + code
Turkish discussion + English product names
```

should not automatically be rejected.

---

# 33. Language Drift Detection

The Phase-I playground showed short Turkish prompts occasionally drifting into unrelated languages.

Phase-II should therefore quantify multilingual mixing in documents.

Useful metadata:

```text
primary_language
secondary_language
language_purity
script_distribution
```

Do not force 100% purity.

Natural multilingual text exists.

The goal is to detect accidental scraping mixtures.

---

# 34. Source Provenance

Each document should retain at least:

```text
source_name
source_type
source_document_id
source_url_or_identifier_if_available
retrieval/build date
language
license/provenance note if known
cleaning version
quality score
document hash
```

Public releases may expose only appropriate metadata.

Internal provenance should be richer.

---

# 35. Licensing / Rights Metadata

Do not claim:

```text
"the dataset license automatically clears all underlying web content"
```

For every source class, document:

```text
source terms
dataset license if applicable
known restrictions
unknowns
```

The corpus manifest should distinguish:

```text
source-license metadata
```

from:

```text
rights in individual underlying content
```

---

# 36. Benchmark Contamination

Before training, build a contamination reference set containing benchmark prompts/questions where licensing and benchmark rules permit analysis.

Check corpus overlap against planned evaluation material.

At minimum record contamination risk for future tasks such as:

```text
ARC
HellaSwag
PIQA
WinoGrande
MMLU-style tasks
OpenBookQA
GSM8K
Belebele
custom CetinLM diagnostic probes
```

Do not silently remove everything based on one short matching phrase.

Use thresholds and manual inspection for suspicious matches.

---

# 37. Hold-Out Validation Design

Phase-II should no longer rely on one undifferentiated validation stream alone.

Create separate validation sets.

Recommended:

```text
val_global
val_en
val_tr
val_multilingual
val_long
```

Optional later:

```text
val_technical
val_code
val_math
```

---

# 38. Validation Isolation

Validation documents must be removed from training.

Near duplicates of validation documents must also be removed from training.

Split:

```text
before final token-shard generation
```

not after accidental duplicates are already packed.

---

# 39. Validation Size

Recommended starting targets:

```text
global       10M tokens
English       5M tokens
Turkish       5M tokens
multilingual  5M tokens
long-context  5M tokens
```

These sets may overlap conceptually in source categories but should have clearly defined evaluation purposes.

If storage or evaluation cost becomes excessive, size can be adjusted while maintaining stable longitudinal sets.

Once frozen, validation sets should remain unchanged across Phase-II checkpoints unless versioned deliberately.

---

# 40. Native Turkish Validation

Turkish validation must be biased toward high-quality native Turkish rather than machine-translated benchmark-style prose.

Include:

- general prose;
- technical Turkish;
- natural morphology;
- long sentences;
- conversational text;
- factual exposition;
- varied domains.

---

# 41. English Validation

English validation should contain:

- general knowledge prose;
- technical content;
- long-form text;
- ordinary web language;
- factual explanations.

Avoid designing the set to artificially favor the training mixture.

---

# 42. Long-Context Validation

Create document-contiguous validation samples for:

```text
512
1024
2048
4096
```

This will allow the project to measure whether dynamic-context training actually improves longer-context loss rather than merely functioning without OOM.

---

# 43. Corpus Record Schema

Recommended intermediate JSONL-like logical schema:

```json
{
  "id": "stable-document-id",
  "source": "source-name",
  "source_type": "web|docs|news|book|forum|reference|other",
  "language": "tr",
  "language_confidence": 0.99,
  "quality_score": 0.92,
  "quality_tier": "A",
  "text": "clean document text",
  "sha256": "document-content-hash",
  "char_count": 12345,
  "word_count": 2100,
  "token_count": 2870,
  "is_replay": false,
  "cleaning_version": "phase2-v1"
}
```

The exact serialization format can change.

The logical fields should remain available.

---

# 44. Do Not Tokenize Too Early

Preferred pipeline:

```text
raw
↓
extract text
↓
normalize
↓
language ID
↓
quality filter
↓
boilerplate removal
↓
exact dedup
↓
near dedup
↓
validation split
↓
document statistics
↓
tokenize
↓
token-level statistics
↓
pack/shard
↓
binary invariant audit
```

Tokenizing before major cleaning makes debugging and provenance harder.

---

# 45. Tokenizer Policy

Phase-II initially keeps the existing CetinLM tokenizer:

```text
vocab = 65,536
```

Changing the tokenizer after Phase-I would break direct continued-pretraining compatibility unless embeddings and token mappings are deliberately migrated.

Therefore:

> **Do not retrain/replace the tokenizer for the first Phase-II continuation experiment.**

Tokenizer replacement is a separate research branch, not a silent corpus change.

---

# 46. Tokenizer Efficiency Report

Before accepting the corpus, measure tokenization efficiency by language.

For each language:

```text
characters/token
bytes/token
tokens/document
tokens/word where meaningful
```

Compare especially:

```text
English
Turkish
```

Large unexpected shifts can reveal data-quality problems.

---

# 47. Special-Token Audit

After tokenization, count:

```text
PAD
UNK
BOS
EOS
```

Expected:

```text
PAD in packed pretraining stream ≈ zero
UNK should be extremely low / investigated
BOS ≈ document count
EOS ≈ document count
double EOS = zero
double BOS = zero
```

Any unexplained spike blocks release.

---

# 48. Unknown Token Audit

If `<unk>` appears meaningfully often:

```text
STOP
```

Inspect:

- encoding,
- tokenizer invocation,
- unsupported normalization,
- malformed source text.

Do not accept a large unknown-token count.

---

# 49. Binary Shard Format

Keep Phase-I-compatible binary token storage unless the trainer is deliberately changed.

Current format:

```text
np.uint32
```

Recommended Phase-II directory:

```text
data/
└── phase2/
    ├── train/
    │   ├── tokens_000000.bin
    │   ├── tokens_000001.bin
    │   └── ...
    ├── val_global/
    │   └── val.bin
    ├── val_en/
    │   └── val.bin
    ├── val_tr/
    │   └── val.bin
    ├── val_multilingual/
    │   └── val.bin
    ├── val_long/
    │   └── ...
    ├── manifests/
    ├── stats/
    └── audits/
```

Exact repo naming can be adjusted before implementation.

---

# 50. Shard Size

Phase-I used:

```text
50,000,000 tokens / shard
```

This remains a reasonable baseline.

For 1B Phase-II tokens:

```text
20 × 50M
```

is operationally simple.

However, dynamic-length training may later benefit from document-aware index files rather than treating all binary shards as anonymous flat streams.

---

# 51. Required Corpus Manifest

Every final build receives:

```text
corpus_manifest.json
```

or equivalent.

Required fields:

```text
build_id
build_date
tokenizer_sha256
cleaning_version
dedup_version
total_documents
total_tokens
fresh_tokens
replay_tokens
language_token_counts
language_percentages
source_token_counts
quality_tier_counts
length_bucket_counts
BOS_count
EOS_count
UNK_count
double_EOS_count
double_BOS_count
validation_hashes
shard_hashes
```

---

# 52. Shard Hashes

Every final `.bin` shard should have a SHA-256 hash.

Example manifest entry:

```text
tokens_000000.bin
tokens=50,000,000
sha256=...
```

This provides:

- reproducibility;
- corruption detection;
- safe backup verification;
- exact corpus identity.

---

# 53. Dataset Build ID

Use an immutable build identifier.

Example:

```text
cetinlm-phase2-corpus-v1
```

If any final-token content changes:

```text
v2
```

Create a new build.

Do not silently overwrite a corpus while keeping the same build identity.

---

# 54. Source-Level Statistics

For each source:

```text
raw documents
accepted documents
rejected documents
raw characters
clean characters
final tokens
acceptance rate
exact duplicate removal
near duplicate removal
language distribution
quality distribution
```

This allows us to discover which sources are expensive but low-value.

---

# 55. Rejection Reason Statistics

Every filter should increment an explicit reason.

Examples:

```text
empty
too_short
too_repetitive
bad_unicode
wrong_language
low_quality
boilerplate
exact_duplicate
near_duplicate
contamination
spam
template
```

Do not simply count:

```text
rejected = N
```

without knowing why.

---

# 56. Data Quality Sampling

Automated filters are necessary but insufficient.

Before finalization, manually inspect random samples from:

```text
English Tier A
English Tier B
Turkish Tier A
Turkish Tier B
each retained language
long documents
short documents
highest quality scores
lowest accepted quality scores
replay bucket
fresh bucket
```

Save representative examples in an internal audit report.

---

# 57. Turkish Manual Audit

At least one manual Turkish audit should specifically check:

```text
native phrasing
suffix integrity
encoding
sentence completeness
headline/body separation
news boilerplate
translated-English feel
repetition
SEO spam
punctuation
```

---

# 58. English Manual Audit

Check:

```text
coherence
boilerplate
AI/generated-looking spam
template duplication
SEO content
broken extraction
technical correctness where obvious
```

---

# 59. Dynamic-Context Readiness

The corpus must be able to expose document-length buckets.

Required tokenized-document metadata:

```text
token_length
document_id
language
quality_tier
source
```

Training should later be able to sample documents into:

```text
<=256
257–512
513–1024
1025–2048
2049–4096
```

without reconstructing the corpus from scratch.

---

# 60. Packing Rule

Do not pad every short document independently to the sequence length.

Use packing where appropriate.

But packing must respect document boundaries.

A packed sequence may contain:

```text
<bos> doc_A <eos> <bos> doc_B <eos>
```

as long as boundaries are explicit and causal attention remains standard.

---

# 61. No Boundary Loss

Packing must not silently erase document transitions.

Forbidden conceptual packing:

```text
end of document A immediately concatenated with start of B
```

without an EOS/BOS boundary.

---

# 62. Replay Selection Policy

Candidate Phase-I replay documents should be ranked by:

```text
quality
uniqueness
language value
domain value
document coherence
length
```

Prefer replay that provides:

- useful general language;
- multilingual preservation;
- strong English/Turkish material;
- long clean documents.

---

# 63. Replay Exclusion Policy

Do not replay known bad patterns merely for retention.

Exclude:

```text
duplicate EOS artifacts
spam-heavy samples
extreme repetition
broken extraction
language-mixed garbage
low-quality boilerplate
```

---

# 64. Fresh Data Priority

When choosing between:

```text
old medium-quality replay
```

and:

```text
new high-quality material
```

prefer new high-quality material unless replay has a measured retention purpose.

---

# 65. Quality Weighting During Sampling

Phase-II may later use weighted sampling.

Candidate principle:

```text
Tier A > Tier B > Tier C
```

However, do not implement complicated weighting before the static corpus itself is clean.

First build:

```text
good corpus
```

then experiment with:

```text
sampling policy
```

---

# 66. Source Dominance Cap

No single source should silently dominate the corpus.

Before finalizing, generate a table:

```text
top 20 sources by token share
```

Investigate any source with unusually high share.

A hard numerical cap may be added once actual source distributions are known.

---

# 67. Host / Domain Dominance

For web-derived data, also measure:

```text
tokens per host/domain
```

A dataset can look multi-source while actually being dominated by a few websites.

---

# 68. News Deduplication

News is especially vulnerable to syndicated duplication.

Phase-II must aggressively near-dedup:

```text
wire copies
press releases
headline variants
regional mirrors
```

High duplicate news volume wastes tokens and may amplify repeated phrasing.

---

# 69. Code

Code can be present in Phase-II general pretraining, but CetinLM-1B-Code is a separate later specialization track.

General Phase-II should include enough code to support technical competence without allowing code to overwhelm natural-language objectives.

Track code separately from ordinary English.

---

# 70. Math

Include high-quality mathematical exposition and worked examples where legally/provenance appropriate.

Avoid flooding the corpus with:

```text
low-quality generated arithmetic templates
```

The current Phase-I `2 + 2` diagnostic shows a learned signal but not reliable arithmetic.

Better data can help, but robust reasoning should not be assumed to emerge from simple repetition.

---

# 71. Synthetic Data Policy

Synthetic data is not automatically forbidden.

But Phase-II v1 should not depend heavily on synthetic text without:

- source/model provenance;
- quality checks;
- deduplication;
- contamination analysis;
- clear separation in manifests.

Synthetic material must have its own source category.

Do not mix it invisibly with natural corpus data.

---

# 72. AI-Generated Web Content

Modern web corpora increasingly contain AI-generated text.

We may not be able to identify all of it.

The pipeline should detect obvious low-quality generated patterns where possible.

Do not claim perfect AI-text removal.

Record the limitation.

---

# 73. Personal / Sensitive Data

The corpus builder should exclude clearly inappropriate personal-data dumps and obviously sensitive private information.

Avoid training on accidentally exposed credentials or secrets.

Pattern filters should flag examples such as:

```text
API keys
private keys
password dumps
credential lists
```

---

# 74. Secrets Scanner

Before finalization, scan text for high-confidence secret patterns.

Examples:

```text
private key blocks
common cloud credential formats
access tokens
password dump structures
```

Flag for removal/review.

---

# 75. PII Handling

Public-web text may contain names and ordinary public information.

The project should still avoid deliberately collecting high-risk personal datasets.

The purpose of Phase-II is language-model research, not personal-data aggregation.

---

# 76. Corpus Build Pipeline — Canonical Order

The Phase-II build should follow this order:

```text
01 RAW INGEST
02 SOURCE METADATA
03 TEXT EXTRACTION
04 UNICODE NORMALIZATION
05 STRUCTURE CLEANING
06 BOILERPLATE REMOVAL
07 LANGUAGE IDENTIFICATION
08 QUALITY SCORING
09 HARD FILTERS
10 EXACT DEDUP
11 NEAR DEDUP
12 REPLAY/FRESH MERGE
13 CROSS-BUCKET DEDUP
14 CONTAMINATION CHECK
15 TRAIN/VALIDATION SPLIT
16 MANUAL QA SAMPLE
17 TOKENIZATION
18 SPECIAL-TOKEN BOUNDARIES
19 TOKEN-LEVEL AUDIT
20 SHARD GENERATION
21 SHARD HASHING
22 FINAL MANIFEST
23 ACCEPTANCE GATES
24 FREEZE BUILD
```

---

# 77. Stage Artifacts

Recommended intermediate directories:

```text
data_phase2_work/
├── 00_raw/
├── 01_extracted/
├── 02_normalized/
├── 03_filtered/
├── 04_deduped/
├── 05_split/
├── 06_tokenized_docs/
├── 07_shards/
├── reports/
└── manifests/
```

Intermediate files may be deleted after a verified final build if storage requires it, but manifests and audit reports should remain.

---

# 78. Pipeline Determinism

Where possible, corpus build steps should be deterministic given:

```text
input data
config
seed
pipeline version
```

Record random seeds for sampling and validation selection.

---

# 79. Configuration File

Avoid hardcoding corpus policy throughout multiple scripts.

Create one Phase-II corpus config.

Example:

```yaml
build_id: cetinlm-phase2-corpus-v1
token_target: 1000000000

language_targets:
  en: 0.40
  tr: 0.25
  other: 0.35

replay:
  target: 0.15

boundaries:
  bos: 2
  eos: 3
  forbid_double_eos: true

shard_tokens: 50000000
```

Exact format can be YAML, TOML or JSON.

---

# 80. Version Every Transform

Record versions for:

```text
extractor
normalizer
language ID
quality filter
dedup
tokenizer
sharder
audit suite
```

If a bug changes the output, increment the relevant build version.

---

# 81. Phase-II Corpus Test Suite

Create an automated corpus test command.

Desired behavior:

```text
python ...audit_phase2_corpus...
```

It should return:

```text
exit code 0 = PASS
non-zero     = FAIL
```

Training scripts should refuse to run against a corpus build marked FAIL.

---

# 82. Hard Acceptance Gates

The following conditions are mandatory.

## Gate A — Token count

```text
usable final train tokens >= planned minimum
```

For Phase-II v1:

```text
~1B tokens
```

Small deterministic sharding overshoot/undershoot policies must be documented.

---

## Gate B — Token range

Every token ID:

```text
0 <= token_id < 65536
```

---

## Gate C — Double EOS

```text
<eos><eos> count == 0
```

unless a deliberately documented exception exists.

For Phase-II v1:

```text
no exception
```

---

## Gate D — Double BOS

```text
<bos><bos> count == 0
```

---

## Gate E — Unknown token

`<unk>` frequency must be near-zero and explained.

Unexpected non-trivial `<unk>`:

```text
FAIL
```

---

## Gate F — Validation isolation

Exact and near-duplicate overlap between training and validation must be below the defined tolerance.

Unexpected overlap:

```text
FAIL
```

---

## Gate G — Manifest complete

No training without:

```text
corpus_manifest
shard hashes
language stats
source stats
quality stats
boundary stats
```

---

## Gate H — Turkish quality audit

Manual Turkish sample review:

```text
PASS
```

---

## Gate I — English quality audit

Manual English sample review:

```text
PASS
```

---

## Gate J — Shard integrity

All shard:

```text
size % 4 == 0
```

for uint32 storage.

All SHA-256 hashes must match after final copy.

---

# 83. Warning Gates

These do not automatically fail the build but require review.

Examples:

```text
one source > expected token share
one language strongly under target
abnormal EOS frequency by shard
abnormal document-length distribution
large Tier C share
large replay share
unusual tokenizer efficiency
near-dedup removal unexpectedly low
near-dedup removal unexpectedly high
```

---

# 84. Required Final Reports

Before Phase-II training:

```text
PHASE2_CORPUS_MANIFEST.json
PHASE2_CORPUS_STATS.md
PHASE2_LANGUAGE_REPORT.csv
PHASE2_SOURCE_REPORT.csv
PHASE2_LENGTH_REPORT.csv
PHASE2_DEDUP_REPORT.md
PHASE2_BOUNDARY_AUDIT.txt
PHASE2_CONTAMINATION_REPORT.md
PHASE2_MANUAL_QA.md
PHASE2_SHARD_HASHES.txt
```

Names may change slightly.

The information must exist.

---

# 85. Required English/Turkish Summary

The final corpus report must explicitly contain:

```text
EN token count
EN percentage
TR token count
TR percentage
TR native/source breakdown where known
EN average doc length
TR average doc length
EN tokenizer efficiency
TR tokenizer efficiency
EN validation size
TR validation size
```

---

# 86. Before/After Cleaning Report

For each major source group report:

```text
raw size
after extraction
after quality filters
after exact dedup
after near dedup
after contamination filtering
final token count
```

This tells us where data disappears and whether filters are too aggressive.

---

# 87. Dedup Sanity Sampling

After near-dedup:

- sample retained neighbor pairs close to threshold;
- sample removed pairs close to threshold;
- manually verify the threshold is reasonable.

Do not trust the similarity threshold blindly.

---

# 88. Validation Freeze

Once Phase-II validation files are approved:

```text
hash them
freeze them
do not regenerate every run
```

This is necessary for meaningful longitudinal comparisons.

---

# 89. Baseline Comparison

Before Phase-II training begins, record the Phase-I model on all new validation sets.

This gives:

```text
Phase-I checkpoint
evaluated on Phase-II validation
```

Then Phase-II gains can be measured against the same fixed sets.

Without this baseline, later improvements cannot be attributed cleanly.

---

# 90. Important: New Validation Distribution

If Phase-II validation comes from cleaner/harder data, its absolute loss may differ significantly from Phase-I val loss.

Therefore do **not** compare:

```text
Phase-I old val = 3.38
```

directly against:

```text
new Phase-II validation loss
```

unless the dataset is identical.

Instead maintain both:

```text
legacy Phase-I val
new Phase-II val
```

during transition.

---

# 91. Legacy Validation Retention

Keep the original Phase-I 10M validation set.

During early Phase-II, periodically evaluate:

```text
legacy_val
phase2_global_val
phase2_en_val
phase2_tr_val
```

This helps detect catastrophic regression.

---

# 92. Forgetting / Retention Monitoring

Selective replay should be evaluated by retention.

If Phase-II improves new corpus loss while severely degrading Phase-I validation or multilingual probes, investigate:

- replay fraction;
- language mixture;
- learning rate;
- domain shift.

Do not assume more-quality data cannot cause forgetting.

---

# 93. Phase-II First Training Gate

Corpus v1 should support the first continuation gate:

```text
~1B additional tokens
```

After that:

```text
evaluate
do not automatically continue
```

If marginal gains remain strong:

```text
prepare next corpus / next gate
```

---

# 94. Corpus Expansion Beyond 2B Cumulative

Future gates:

```text
3B
4B
5B
```

should not mean blindly repeating the same Phase-II corpus.

Prefer:

- new high-quality data;
- refreshed sources;
- controlled replay;
- targeted weaknesses.

---

# 95. Targeted Data Must Remain Pretraining-Like

Do not turn continued pretraining into disguised SFT.

Phase-II corpus may enrich:

```text
technical Turkish
math explanations
code
science
high-quality dialogue-like natural text
```

but should remain primarily a base-model pretraining corpus.

Instruction/response pairs belong to later post-training unless a deliberate research experiment says otherwise.

---

# 96. Assistant Behavior

Do not judge Phase-II corpus success solely by:

```text
"naber" -> friendly answer
```

That behavior belongs mainly to instruction/chat tuning.

Phase-II success should first appear in:

```text
lower held-out loss
better language consistency
better continuation quality
stronger factual signals
less pathological repetition
better EN/TR validation
better long-context modeling
```

---

# 97. Repetition Target

Phase-II should establish automatic generation-degeneration metrics.

Examples:

```text
repeated 3-gram rate
repeated 4-gram rate
unique generated token ratio
longest repeated substring
EOS rate
loop detection
```

Evaluate the same frozen prompt set on:

```text
Phase-I baseline
Phase-II checkpoints
```

---

# 98. Language-Stability Target

Create short continuation probes for:

```text
English prompt -> English continuation
Turkish prompt -> Turkish continuation
German prompt -> German continuation
...
```

Measure language retention/drift statistically.

The `naber -> Hindi` anecdote is useful evidence, but Phase-II needs a reproducible metric.

---

# 99. Turkish Semantic Probes

Expand beyond:

```text
Türkiye'nin başkenti -> Ankara
```

Use multiple domains and paraphrases.

Examples of categories:

```text
geography
science
technology
common knowledge
semantic opposites
definitions
morphology
sentence completion
```

Do not optimize the training corpus against exact probe text.

---

# 100. Data Leakage Rule for Internal Diagnostics

Frozen diagnostic prompts should be treated like evaluation items.

Where practical:

```text
search for exact / near matches in corpus
```

Record any overlap.

Do not intentionally seed their answers into training.

---

# 101. Recommended Phase-II Working Tree

Proposed repository layout:

```text
scripts/
└── data_phase2/
    ├── ingest/
    ├── clean/
    ├── language/
    ├── quality/
    ├── dedup/
    ├── split/
    ├── tokenize/
    ├── shard/
    └── audit/

configs/
└── phase2_corpus_v1.yaml

data/
└── phase2/
    ├── train/
    ├── val_global/
    ├── val_en/
    ├── val_tr/
    ├── val_multilingual/
    ├── val_long/
    ├── manifests/
    ├── stats/
    └── audits/
```

Do not create every folder blindly if the existing repo already has a better convention.

Integrate with current structure deliberately.

---

# 102. Implementation Rule

Each data-stage script should be independently resumable where practical.

Avoid one 20-hour monolithic script where a crash at 99% requires starting from zero.

Preferred:

```text
stage output -> verified artifact -> next stage
```

---

# 103. Logging

Every stage logs:

```text
input count
output count
rejected count
elapsed time
configuration
seed
error count
```

For filtering stages:

```text
rejection reasons
```

---

# 104. Error Policy

Malformed individual documents should generally:

```text
log + reject + continue
```

Critical systemic failures should:

```text
stop the build
```

Examples of critical failure:

```text
tokenizer mismatch
all language IDs failing
output token IDs outside vocab
manifest corruption
zero accepted Turkish
double EOS after finalization
```

---

# 105. Tokenizer Identity

Before tokenization, calculate and record SHA-256 of:

```text
data/cetin_tokenizer_v2.json
```

The Phase-II manifest must bind the corpus to the exact tokenizer bytes used.

---

# 106. Checkpoint / Corpus Compatibility

Record:

```text
Phase-I checkpoint SHA-256
Phase-II tokenizer SHA-256
Phase-II corpus build ID
```

together before training.

This creates an exact experiment identity.

---

# 107. Phase-II Experiment Identity

Example:

```text
experiment:
  model_start: CetinLM-1B-Phase-I-best
  checkpoint_sha256: 83E4...
  tokenizer_build: cetin_tokenizer_v2
  corpus_build: cetinlm-phase2-corpus-v1
  trainer_build: phase2-dynamic-v1
```

---

# 108. Do Not Modify Phase-I Artifacts

Phase-II scripts must not overwrite:

```text
checkpoints_1b_base/best.pt
checkpoints_1b_base/last.pt
```

Use a new checkpoint directory.

Recommended:

```text
checkpoints_1b_phase2/
```

Exact naming can be finalized with the trainer spec.

---

# 109. Public Research Transparency

Public Phase-II reporting should include:

- final corpus token count;
- language distribution;
- high-level source categories;
- dedup statistics;
- boundary correction;
- validation design;
- known limitations.

Do not expose sensitive operational metadata unnecessarily.

---

# 110. What Must Be Fixed Before We Train

Minimum fixes:

```text
[ ] identify double-EOS root cause
[ ] eliminate <eos><eos><bos>
[ ] build fresh document-level pipeline
[ ] add exact dedup
[ ] add near dedup
[ ] add source provenance
[ ] add language token statistics
[ ] enforce EN/TR target ranges
[ ] add native Turkish quality audit
[ ] preserve long documents
[ ] freeze new validation sets
[ ] keep legacy Phase-I validation
[ ] add contamination check
[ ] add shard hashes
[ ] add corpus manifest
[ ] add hard invariant test suite
```

---

# 111. Phase-II Corpus Acceptance Checklist

## Identity

```text
[ ] build ID assigned
[ ] tokenizer hash recorded
[ ] Phase-I start checkpoint hash recorded
[ ] pipeline/config version recorded
```

## Data quality

```text
[ ] extraction clean
[ ] Unicode audit PASS
[ ] mojibake audit PASS
[ ] repetition filter PASS
[ ] boilerplate sampling PASS
[ ] manual EN review PASS
[ ] manual TR review PASS
```

## Dedup

```text
[ ] exact dedup complete
[ ] near dedup complete
[ ] cross-source dedup complete
[ ] replay-vs-fresh dedup complete
[ ] dedup sample review complete
```

## Languages

```text
[ ] English token share reported
[ ] Turkish token share reported
[ ] other-language shares reported
[ ] Turkish native-quality review PASS
[ ] language-drift/source-mixing audit PASS
```

## Boundaries

```text
[ ] BOS count reported
[ ] EOS count reported
[ ] double BOS = 0
[ ] double EOS = 0
[ ] <eos><eos><bos> = 0
[ ] boundary samples manually inspected
```

## Validation

```text
[ ] legacy Phase-I val retained
[ ] Phase-II global val frozen
[ ] English val frozen
[ ] Turkish val frozen
[ ] multilingual val frozen
[ ] long-context val frozen
[ ] train/val duplicate audit PASS
[ ] validation hashes recorded
```

## Tokenization

```text
[ ] vocab range PASS
[ ] UNK audit PASS
[ ] EN tokenizer efficiency reported
[ ] TR tokenizer efficiency reported
[ ] other-language efficiency sampled
```

## Shards

```text
[ ] target token count reached
[ ] uint32 integrity PASS
[ ] shard sizes PASS
[ ] shard hashes written
[ ] manifest complete
```

## Final gate

```text
[ ] PHASE-II CORPUS STATUS = APPROVED
```

Only then may the trainer consume the corpus.

---

# 112. Recommended Immediate Implementation Order

Do the work in this order:

```text
1. Locate Phase-I data-prep/tokenization scripts.
2. Find the exact location that inserts BOS/EOS.
3. Reproduce <eos><eos><bos> on a tiny sample.
4. Fix the root cause.
5. Write boundary unit tests.
6. Define the Phase-II document record schema.
7. Implement normalization + language ID + quality filtering.
8. Implement exact dedup.
9. Implement near dedup.
10. Add EN/TR and source statistics.
11. Add train/validation split.
12. Add tokenizer stage using existing tokenizer.
13. Preserve per-document token lengths.
14. Build small 1–10M token Phase-II pilot corpus.
15. Run all audits.
16. Manually inspect EN/TR samples.
17. Only then scale corpus build toward 1B tokens.
```

---

# 113. Pilot Corpus Rule

Do **not** discover pipeline bugs after creating 1B tokens.

First build:

```text
1M tokens
```

then:

```text
10M tokens
```

Only after both pass:

```text
full ~1B build
```

---

# 114. Pilot Tests

The 1M/10M pilot must verify:

```text
documents decode correctly
language stats make sense
Turkish diacritics survive
no duplicated EOS
token IDs valid
no unexpected UNK
dedup works
long-document metadata survives
validation exclusion works
shard loader reads output
```

---

# 115. Trainer Smoke Test Before Full Phase-II

After the corpus pipeline is frozen, the future Phase-II trainer should first run a tiny smoke experiment.

Example objective:

```text
few hundred optimizer updates
```

Verify:

```text
checkpoint loads
loss finite
gradient finite
dynamic lengths work
resume works
validation works
VRAM safe
throughput measured
```

Then discard the smoke-training artifacts if necessary.

The frozen Phase-I checkpoint remains untouched.

---

# 116. Decision on Exact Phase-II Mix

The working initial target is:

```text
English 40%
Turkish 25%
Other languages 35%

Fresh 85%
Replay 15%
```

But this is **not locked until source inventory is measured**.

Final mix should be approved only after seeing:

```text
available quality tokens
dedup rate
language quality
document-length distribution
source concentration
```

---

# 117. Phase-II Success Criteria at the Corpus Level

The corpus itself is considered a success if it is:

```text
cleaner
less duplicated
better documented
boundary-correct
EN/TR stronger
multilingual still meaningful
long-context ready
validation-safe
reproducible
hashable
auditable
```

before any training result exists.

---

# 118. Phase-II Research Hypothesis

The Phase-II corpus experiment tests:

> Whether continued pretraining on a cleaner, better-deduplicated, better-instrumented, EN/TR-strengthened and long-context-ready corpus can produce greater capability per additional training token than simply repeating the Phase-I data pipeline.

That hypothesis should remain falsifiable.

If the model fails to improve efficiently:

```text
measure why
```

rather than assuming more tokens are always the answer.

---

# 119. Final Corpus Contract

A Phase-II corpus build is valid only when the following statement is true:

> Every final token can be traced to a documented corpus build, the token IDs are compatible with the frozen CetinLM tokenizer, document boundaries follow one canonical BOS/EOS convention, train/validation separation has been audited, English and Turkish composition is explicitly measured, deduplication has been applied across sources and replay data, shard hashes are frozen, and all hard acceptance gates pass.

---

# 120. Next Engineering Artifact

After this corpus specification, the next document/code task is:

```text
PHASE-II DATA PIPELINE IMPLEMENTATION PLAN
```

with concrete repo-level components for:

```text
raw ingest
cleaning
language ID
quality scoring
dedup
split
tokenization
sharding
audit
```

The first code task should be:

> **Find and fix the Phase-I double-EOS insertion point, then create an automated boundary test.**

---

# Phase-II Corpus Specification — Short Operational Card

```text
START MODEL
  CetinLM-1B Phase-I best
  SHA256:
  83E4EA87674F27EF2235AFE891537F67912C0B299BBC6F330980DD44F454073B

TOKENIZER
  Cetin tokenizer v2
  vocab = 65,536
  KEEP tokenizer unchanged for first Phase-II continuation

TARGET
  ~1B additional usable tokens
  first cumulative gate ~2B

STARTING LANGUAGE MIX
  EN 40%
  TR 25%
  OTHER 35%

STARTING DATA ORIGIN MIX
  NEW/HIGHER-QUALITY 85%
  SELECTIVE REPLAY    15%

MANDATORY FIX
  <eos><eos><bos> -> root cause removed
  double EOS final count = 0

MANDATORY DATA WORK
  quality filters
  exact dedup
  near dedup
  cross-source dedup
  replay-vs-new dedup
  provenance
  language stats
  source stats
  document-length stats
  contamination audit
  validation isolation
  shard SHA-256

VALIDATION
  keep legacy Phase-I val
  add Phase-II global
  add English
  add Turkish
  add multilingual
  add long-context

LONG CONTEXT
  preserve document-level lengths
  support future buckets:
  256 / 512 / 1024 / 2048 / 4096

BUILD POLICY
  1M pilot
  -> audit
  10M pilot
  -> audit
  full ~1B
  -> freeze

TRAINING POLICY
  NO TRAINING until corpus status = APPROVED
```

---

**End of specification.**
