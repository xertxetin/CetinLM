<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="230px">
</p>

<h1 align="center">CetinLM — Public Data Provenance</h1>

<p align="center">
  <strong>Third-party source transparency without publishing the private corpus recipe.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/scope-Base--v1%20provenance-111111" alt="Base-v1 provenance">
  <img src="https://img.shields.io/badge/status-active%20research-111111" alt="Active research">
  <img src="https://img.shields.io/badge/principle-attribution%20%2B%20traceability-111111" alt="Attribution and traceability">
</p>

---

## Why this page exists

CetinLM combines project-created first-party material with qualified third-party language data.

This page documents the **public provenance boundary** for the active Base-v1 research generation: which upstream dataset families are represented, what role they broadly serve, and which upstream license metadata / attribution obligations are relevant.

It intentionally does **not** publish the private corpus recipe. Exact mixture weights, local filtering implementation, source-level token allocation, internal manifests, reconstruction hashes and admission thresholds remain private during active Base-v1 research.

> **Transparency should make the work accountable — not turn the corpus pipeline into a copy-paste recipe.**

---

## Public provenance snapshot

<table>
<tr>
<td width="33%" valign="top"><strong>First-party data</strong><br><br>Project-created material developed specifically for CetinLM and governed separately from third-party dataset licenses.</td>
<td width="33%" valign="top"><strong>FineWiki</strong><br><br>Qualified Turkish and English encyclopedic support derived from the FineWiki / Wikipedia ecosystem.</td>
<td width="33%" valign="top"><strong>Temiz-OSCAR</strong><br><br>Qualified Turkish natural/web-language support derived from the OSCAR family through Temiz-OSCAR.</td>
</tr>
</table>

The frozen Base-v1 corpus contains **11.39B unique training tokens** after the project's final build and cross-source deduplication process. The exact composition of that frozen corpus is intentionally not reproduced here.

---

## Active third-party source families

### FineWiki

**Upstream:** `HuggingFaceFW/finewiki`  
**Public role in CetinLM:** Turkish and English encyclopedic / natural-language support  
**Upstream provenance:** FineWiki with underlying Wikipedia / Wikimedia provenance as described by the upstream dataset card  
**Dataset-card license metadata recorded by the project:** **CC BY-SA 4.0 + GFDL**

CetinLM preserves FineWiki and underlying Wikipedia/Wikimedia attribution in public provenance documentation where applicable.

The project does not claim ownership of FineWiki or underlying Wikipedia/Wikimedia text.

---

### Temiz-OSCAR

**Upstream:** `YigitCahit/temiz-OSCAR`  
**Public role in CetinLM:** qualified Turkish natural/web-language support  
**Upstream family:** OSCAR snapshots, with Temiz-OSCAR described by its dataset card as part of Bella Turca  
**Dataset-card license metadata recorded by the project:** **CC BY-SA 4.0**

CetinLM applies its own qualification and filtering before third-party material can participate in the frozen research corpus. The exact filtering implementation and thresholds are not published here.

Because OSCAR-derived data originates from web-crawled text, upstream dataset-level license metadata does not automatically erase rights or terms that may apply to individual source pages.

The project does not claim ownership of the underlying third-party web content.

---

## First-party material

CetinLM also contains project-created first-party data designed for the research program.

First-party data is **not treated as automatically trustworthy simply because we created it**. It is still subject to the project's own quality, duplication, framing and training-data qualification process before admission to an active generation.

Public documentation intentionally describes first-party material at a high level rather than publishing the internal data-generation recipe or exact source allocation.

---

## Sources evaluated but not retained

The research history includes third-party candidates that were tested or investigated and later excluded from the active Base-v1 generation.

Examples include:

- historical Serda Turkish data candidates;
- TurkishFineWeb2-cleaned investigations;
- a FineWeb-Edu English probe.

Their presence in historical research notes does **not** mean they are active Base-v1 training sources.

This distinction matters: CetinLM keeps rejected experiments for auditability rather than deleting them from history.

---

## The licensing distinction we preserve

Dataset provenance is not the same thing as ownership of every item inside a dataset.

```text
Dataset-card license metadata
              ≠
automatic ownership or clearance
of every underlying third-party item
```

Accordingly, CetinLM public documentation distinguishes among:

- upstream dataset metadata;
- upstream attribution requirements;
- project-created processing / engineering;
- underlying third-party content rights;
- future model-weight licensing.

A source being technically qualified for research does not, by itself, establish legal clearance for every possible downstream use.

Nothing on this page constitutes legal advice.

---

## What CetinLM does not claim

CetinLM does **not** claim that:

- third-party source text becomes project-owned because it entered a training pipeline;
- a dataset-card license automatically resolves every copyright, privacy, trademark, contractual or jurisdiction-specific issue in underlying content;
- source-code or data-pipeline verification is equivalent to legal clearance;
- training-data provenance by itself proves model safety, factuality or downstream suitability;
- public visibility grants unrestricted reuse rights to future CetinLM weights or original project code.

Release-specific licensing will be handled separately when public model artifacts are released.

---

## Public vs. private provenance detail

| Public | Kept private during active Base-v1 research |
|---|---|
| Upstream dataset families | Exact source mixture / weights |
| Broad role of each source family | Source-level token allocation |
| Recorded upstream license metadata | Internal filter implementation |
| Attribution / ownership caveats | Admission thresholds |
| Active vs. rejected source status | Local file layout |
| Frozen corpus scale | Internal manifests / reconstruction hashes |
| High-level qualification philosophy | Full corpus reconstruction recipe |

This boundary lets outside readers understand **what kind of data CetinLM uses and how provenance is treated** without publishing the full private dataset engineering stack.

---

## Provenance policy

For an active research source, the project expects traceability sufficient to answer questions such as:

- What upstream dataset family did this material come from?
- What public license / terms metadata was recorded?
- Is the source active, historical or rejected?
- Was the material subject to project qualification before training?
- Are upstream ownership and attribution boundaries preserved in public documentation?

Internally, CetinLM retains substantially more detailed accounting and reproducibility metadata than is published on this public page.

---

## Project identity

**CetinLM** is an independent language-model research program developed under **Me Force Technology** in Türkiye.

The project is built around a simple idea:

> **Better language models require better evidence — including evidence about where the data came from.**

---

<p align="center">
  <a href="./README.md">← Public Research Log</a>
</p>
