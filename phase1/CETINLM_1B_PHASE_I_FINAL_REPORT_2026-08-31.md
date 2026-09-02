# CetinLM-1B — Phase-I Final Training & Evaluation Report

**Status:** Phase-I complete  
**Date:** 2026-08-31  
**Model:** CetinLM-1B-Base  
**Project:** CetinLM / Me Force Technology  
**Training:** From-scratch causal pretraining  
**Hardware:** Single NVIDIA RTX 4070 Ti SUPER 16 GB  
**Audience:** Public research log / GitHub

---

## Abstract

CetinLM-1B Phase-I base pretraining is complete.

The run processed **1,000,005,632 training tokens** with a **1,048,780,544-parameter** decoder-only Transformer trained from random initialization. No pretrained foundation-model checkpoint was used as the starting point.

The selected Phase-I best checkpoint was recorded at **step 122,000**, after **999,424,000 processed tokens**, with a trainer validation loss of **3.380473**. A standalone Benchmark v4 run measured **3.380097 validation loss** and **29.374 perplexity**, closely matching the trainer-side result.

Validation continued to improve late in training, including new best checkpoints near the end of the 1B-token budget. Small longitudinal semantic diagnostics also improved, while raw generation continued to show the expected limitations of an unaligned base model: repetition, weak stopping behavior, factual unreliability, arithmetic failure, and lack of assistant-style response behavior.

The Phase-I corpus audit also confirmed a known document-boundary issue: repeated sequences of the form:

```text
<eos><eos><bos>
```

This does not invalidate the Phase-I run, but it is now a documented data-pipeline issue to correct before continued pretraining.

Phase-I therefore closes with two simultaneous conclusions:

1. **The CetinLM training stack successfully completed a stable 1B-token, 1B-parameter-class from-scratch pretraining run on a single 16 GB consumer GPU.**
2. **The model is a research baseline, not a finished assistant.** Better data, longer-context continued pretraining, broader evaluation, and later post-training remain necessary.

---

# 1. Phase-I Objective

Phase-I was not intended to produce a finished chat product.

It was the first full-system experiment for the CetinLM research program:

> **Build from first principles. Measure everything. Scale what works.**

The central research question is:

> **How much useful capability can disciplined architecture, data, training systems, diagnostics, post-training and inference engineering extract from every parameter, training token and unit of compute before scale becomes the default answer?**

CetinLM-1B should therefore be interpreted as the first research instrument in that program rather than the final product.

---

# 2. From-Scratch Definition

CetinLM-1B was trained without using pretrained model weights as its foundation.

The project uses standard low-level ML frameworks and established research building blocks, but the model configuration, tokenizer, training system, checkpoints, and causal pretraining run are independently engineered.

A precise public description is:

> **A from-scratch, independently engineered language model trained without pretrained weights.**

This does not mean reimplementing CUDA, PyTorch, operating systems, or GPU hardware. It means CetinLM is not derived from an existing pretrained foundation-model checkpoint.

---

# 3. Model Architecture

| Component | Value |
|---|---:|
| Parameters | **1,048,780,544** |
| Trainable parameters | **1,048,780,544** |
| Vocabulary | **65,536** |
| Hidden size | **1,792** |
| Layers | **20** |
| Query heads | **28** |
| KV heads | **7** |
| Head dimension | **64** |
| Intermediate size | **7,168** |
| Configured maximum context | **4,096** |
| Phase-I train sequence length | **256** |
| Dropout | **0.0** |
| RoPE theta | **10,000** |
| Attention | **Grouped-Query Attention (GQA)** |
| Positional encoding | **RoPE** |
| MLP | **SwiGLU** |
| Normalization | **Pre-norm** |
| Embeddings | **Tied input/output embeddings** |
| Architecture family | **Decoder-only causal Transformer** |

A configured 4,096-token maximum context should not be confused with a model already trained across that full context length. Phase-I intentionally trained at sequence length **256**.

---

# 4. Tokenizer and Language Coverage

CetinLM uses a custom tokenizer with **65,536 tokens**.

Special token IDs:

| Token | ID |
|---|---:|
| `<pad>` | 0 |
| `<unk>` | 1 |
| `<bos>` | 2 |
| `<eos>` | 3 |

Phase-I covered 22 languages:

```text
English, Turkish, German, French, Spanish, Portuguese, Italian, Dutch,
Polish, Russian, Ukrainian, Arabic, Persian, Hindi, Bengali, Urdu,
Indonesian, Vietnamese, Thai, Chinese, Japanese, Korean
```

English and Turkish received elevated importance in the mixture. Coverage does not imply equal capability across all languages.

---

# 5. Phase-I Dataset

Training corpus:

```text
1,000,000,000 token IDs
20 shards × 50,000,000 tokens
np.uint32 binary streams
```

Validation corpus:

```text
10,000,000 token IDs
np.uint32 binary stream
```

Current training layout:

```text
data/
├── 1b/
│   ├── tokens_000000.bin
│   ├── tokens_000001.bin
│   ├── ...
│   └── tokens_000019.bin
└── 1b_val/
    └── val.bin
```

---

# 6. Stable Phase-I Training Configuration

| Setting | Value |
|---|---:|
| Micro-batch size | **8** |
| Gradient accumulation | **4** |
| Sequence length | **256** |
| Effective tokens/update | **8,192** |
| Validation batch size | **1** |
| Precision | **BF16** |
| Optimizer | **bitsandbytes AdamW8bit** |
| Adam betas | **0.9 / 0.95** |
| Weight decay | **0.1** |
| Gradient clipping | **1.0** |
| Peak LR | **2e-4** |
| Minimum LR | **2e-5** |
| Warmup | **2,000 steps** |
| Schedule | **Cosine decay** |
| Gradient checkpointing | **Per Transformer block** |
| DataLoader workers | **0** |
| Pin memory | **Enabled** |
| Eval interval | **1,000 steps** |
| Save interval | **500 steps** |

Local backend experiments established native PyTorch Math SDPA with native GQA as the fastest tested attention path in the actual Phase-I Windows / PyTorch / RTX 4070 Ti SUPER environment. Alternative SDPA paths were not adopted after controlled A/B tests.

---

# 7. Training Completion

The final terminal status was:

```text
CETINLM-1B BASE TRAINING COMPLETE
Processed tokens : 1,000,005,632
Best val loss    : 3.380473
```

Final optimizer step:

```text
122,071
```

The planned 1B-token target was exceeded by only:

```text
5,632 tokens
```

This is a normal consequence of the fixed **8,192 tokens per optimizer update** geometry.

The selected best checkpoint was:

```text
step             : 122,000
processed tokens : 999,424,000
best val loss    : 3.380473
```

The final 71 optimizer updates are represented in `last.pt`, but no scheduled validation occurred after step 122,000. Therefore `best.pt` remains the evidence-backed selected checkpoint for Phase-I.

---

# 8. Checkpoint Integrity

The Phase-I checkpoints were backed up before further experimentation.

## `best.pt`

```text
SHA256
83E4EA87674F27EF2235AFE891537F67912C0B299BBC6F330980DD44F454073B
```

## `last.pt`

```text
SHA256
E432BF66A7E635EBEF0EA141E63C28D4C4A3705446B8DF5B9BB2F598FABA8923
```

PowerShell verification:

```powershell
Get-FileHash checkpoints_1b_base\best.pt -Algorithm SHA256
Get-FileHash checkpoints_1b_base\last.pt -Algorithm SHA256
```

These hashes provide byte-for-byte identity checks for archived copies.

---

# 9. Selected Validation Trajectory

| Step | Processed tokens | Val Loss | PPL / note |
|---:|---:|---:|---|
| 58K | ~475M | 3.753456 | 42.668 |
| 60K | ~492M | 3.711722 | — |
| 70K | ~573M | 3.650751 | 38.504 |
| 80K | 655.360M | 3.572668 | 35.611 |
| 90K | ~737M | 3.497958 | 33.048 |
| 97K | 794.624M | 3.474024 | 32.266 |
| 99K | 811.008M | 3.467906 | 32.070 |
| 114K | 933.888M | 3.399315 | 29.944 |
| 115K | 942.080M | 3.393643 | 29.774 |
| 116K | 950.272M | 3.393769 | 29.778 |
| 117K | 958.464M | 3.394800 | 29.809 |
| 118K | 966.656M | 3.395450 | 29.828 |
| 119K | 974.848M | 3.389917 | 29.663 |
| 120K | 983.040M | 3.384159 | 29.493 |
| **122K** | **999.424M** | **3.380473** | **Phase-I best** |

Late-run sequence:

```text
115K  3.393643
116K  3.393769
117K  3.394800
118K  3.395450
119K  3.389917
120K  3.384159
122K  3.380473
```

The temporary flattening between 115K and 118K was not a stable plateau. New bests followed at 119K, 120K and 122K.

This matters because the Phase-I budget ended while held-out validation was still capable of improving.

---

# 10. Final Benchmark v4

Command:

```bash
python src\mertai\training\evaluate_1b.py --checkpoint best
```

Loaded checkpoint metadata:

```text
Parameters : 1,048,780,544
Step       : 122,000
Processed  : 999,424,000
Best val   : 3.380473
```

Standalone validation:

```text
Val Loss   : 3.380097
PPL        : 29.374
Val batches: 25
Val tokens : 6,400
```

Trainer versus standalone benchmark:

```text
Trainer best     3.380473
Benchmark result 3.380097
Difference       0.000376
```

The close agreement is a useful consistency check between training-time validation and the standalone benchmark path.

The benchmark also reported:

```text
VS PREVIOUS
Val Loss Δ : -0.192463
PPL Δ      : -6.234
```

This represents a substantial improvement relative to the previous stored benchmark.

---

# 11. English and Turkish Cloze Snapshot

Final Benchmark v4:

```text
English cloze : 2/10
Turkish cloze : 2/10
```

These tests are deliberately treated as small diagnostics rather than authoritative capability scores. With only ten items, one answer changes the displayed accuracy by ten percentage points.

A larger EN/TR suite is required before making strong claims about language quality.

---

# 12. Final Scientific Diagnostic

Command:

```bash
python scripts\evaluation\inspect_predictions_1b.py
```

Final summary:

```text
Target Top-1  : 1/7
Target Top-5  : 5/7
Target Top-20 : 7/7
```

Longitudinal comparison:

| Checkpoint | Top-1 | Top-5 | Top-20 |
|---|---:|---:|---:|
| ~70K / 573M | 1/7 | 5/7 | 6/7 |
| 80K / 655M | 1/7 | 4/7 | 5/7 |
| **122K / 999M** | **1/7** | **5/7** | **7/7** |

This seven-item probe is much too small to be interpreted as a general benchmark. Its value is longitudinal: the exact same probes reveal whether specific learned signals strengthen, weaken, or remain absent.

---

# 13. Diagnostic Findings

## France → Paris

```text
Prompt : The capital of France is
Target : Paris
Rank   : 3
p      : 0.038095
```

Greedy generation reached the correct fact:

```text
The capital of France is the city of Paris...
```

The continuation later became repetitive, but the relation itself is clearly represented.

## Paris → France

```text
Prompt : Paris is the capital of
Target : France
Rank   : 2
p      : 0.098069
```

The model also generated:

```text
Paris is the capital of the French Republic.
```

This is a strong learned semantic signal in this probe.

## Opposite of hot → cold

```text
Target rank : 2
p           : 0.076638
```

Greedy decoding nevertheless selected `hot`. This demonstrates the difference between a correct concept being present in the distribution and greedy decoding selecting the desired answer.

## Water freezes at → 0

The target appeared inside the final Top-20 distribution.

The current diagnostic output contains a presentation inconsistency: the printed target-rank line and the displayed ordered Top-20 list disagree on the exact rank. Therefore this report intentionally makes only the supported claim:

> **The target is visible within Top-20 at the Phase-I endpoint.**

Diagnostic v2 should fix this reporting bug.

## 2 + 2 → 4

```text
Target rank : 3
p           : 0.046206
```

At the 80K diagnostic the correct token was rank 5.

This is an improved learned signal, but it is **not evidence of robust arithmetic capability**. Greedy generation still produced invalid arithmetic sequences.

## Türkiye → Ankara

```text
Target rank : 1
p           : 0.252631
```

The relation remains strongly represented.

## Ankara → başkenti

Final:

```text
Target rank : 18
p           : 0.004717
```

At 80K the reverse relation had been much weaker, around rank 124.

Moving from roughly rank 124 to Top-20 is one of the clearest improvements in the tiny diagnostic set. It suggests that the relationship became more visible in the model distribution rather than existing only in the most common forward phrase.

---

# 14. Raw Generation Interpretation

The final checkpoint is a **base language model**, not an instruction-tuned assistant.

That distinction is obvious in the generation smoke test.

Examples include:

### Correct fact followed by degeneration

```text
The capital of France is the city of Paris...
```

### Linguistically plausible but technically incorrect continuation

```text
A neural network is a network of neurons that are connected to the brain.
```

### Repetitive Turkish continuation

```text
Bir bilgisayar programı yazmak için,
bir bilgisayar programı yazmak için,
...
```

### Project-identity loop

```text
CetinLM nedir?
CetinLM nedir?
CetinLM nedir?
...
```

### Arithmetic failure

```text
2 + 2 = 2 + 3 + 4 = ...
```

The correct interpretation is:

> **The model has learned language structure and some semantic/factual relationships, but has not yet learned reliable assistant behavior, strong stopping behavior, robust factual selection, or general reasoning.**

That is compatible with the goals of a raw Phase-I base checkpoint.

---

# 15. Repetition and Decoding

Controlled decoding often reduced obvious repetition relative to greedy generation, but did not reliably repair factual errors or missing knowledge.

The evidence therefore supports:

> **Decoding can amplify or suppress degeneration, but decoding cannot create knowledge the model has not learned.**

The repetition problem should not be assigned to one cause without experiments. Plausible contributors include:

- raw base-model continuation behavior,
- duplicate/repetitive web patterns,
- imperfect document boundaries,
- short Phase-I context length,
- lack of instruction/post-training,
- decoding configuration,
- limited total pretraining budget.

Phase-II should measure these factors rather than assuming a single fix.

---

# 16. EOS / Document-Boundary Audit

Command:

```bash
python scripts\evaluation\audit_eos_boundaries.py
```

Training summary:

```text
Total tokens : 1,000,000,000
Total EOS    : 1,884,722
EOS / 1M    : 1,884.72
Tokens / EOS: 530.6
```

Validation:

```text
Val tokens   : 10,000,000
Val EOS      : 18,952
Val EOS / 1M : 1,895.20
```

EOS tokens are present and sample windows place them at natural document boundaries.

However, sampled boundaries repeatedly show:

```text
<eos><eos><bos>
```

Example form:

```text
... pursuit of happiness.<eos><eos><bos>Taking Play Seriously ...
```

This confirms a real Phase-I data-preparation issue.

The Phase-I corpus will not be retroactively changed. Instead, the next corpus build should identify the layer responsible for duplicate EOS insertion and enforce one canonical document-boundary convention.

---

# 17. EOS Distribution Across Shards

EOS frequency varies significantly across shards.

Examples:

```text
tokens_000008.bin : 3724.64 EOS / 1M
tokens_000017.bin :  722.00 EOS / 1M
```

This does not automatically mean corruption. It may reflect different source mixtures or document-length distributions.

However, future corpus tooling should make the cause observable by recording:

- source composition,
- language composition,
- document counts,
- document-length distributions,
- boundary statistics,
- duplication statistics.

---

# 18. Tokenizer Debug Representation

Some diagnostic token strings appear as byte-level internal forms such as:

```text
TÃ¼rkiye
baÅŁkenti
```

The decoded model output itself renders correctly as:

```text
Türkiye
başkenti
```

Therefore the raw internal token-string representation should not be interpreted by itself as evidence of corrupted Turkish text.

Future tokenizer diagnostics should display both internal token representation and clean Unicode decode.

---

# 19. Training Stability

The run remained stable through completion.

Typical late-run behavior:

```text
Throughput : ~5.6K tokens/s
Gradient   : roughly around 3 before clipping
LR         : converged to 2.0e-5 minimum
```

No sustained NaN/Inf failure occurred and there was no late-stage training collapse.

An earlier isolated CUDA illegal-memory-access event did not reproduce after resume and did not prevent successful completion.

---

# 20. Final GPU Memory Snapshot

Training completion reported:

```text
CUDA VRAM          : 15.99 GB
CUDA allocated     : 5.99 GB
CUDA reserved      : 14.68 GB
CUDA max allocated : 13.21 GB
CUDA max reserved  : 14.68 GB
```

These values describe the final Phase-I configuration and allocator state. They should not be interpreted as universal memory requirements for every training or inference configuration.

---

# 21. What Phase-I Demonstrated

Phase-I demonstrated that the CetinLM stack can:

- train a 1.049B-parameter Transformer from random initialization,
- run the stable training configuration on a single 16 GB consumer GPU,
- process a 1B-token corpus end to end,
- train in BF16,
- use 8-bit AdamW optimizer state,
- use gradient checkpointing,
- checkpoint and resume safely,
- preserve best and last model states,
- validate independently,
- maintain stable throughput,
- expose longitudinal semantic learning signals,
- complete the planned token budget without late-stage collapse.

This is the primary systems result of Phase-I.

---

# 22. What Phase-I Did Not Demonstrate

Phase-I does **not** establish that CetinLM-1B is:

- a production-ready assistant,
- competitive with frontier models,
- state of the art among 1B-class models,
- a reliable factual QA system,
- a strong reasoning model,
- a strong arithmetic model,
- equally capable in all 22 languages,
- fully trained for 4,096-token context,
- free from benchmark contamination.

Those claims require broader standardized evaluation.

The project deliberately separates measured evidence from future goals.

---

# 23. Known Phase-I Limitations

## 23.1 Repetition

Raw greedy generation frequently loops at phrase or sentence level.

## 23.2 EOS boundary duplication

The corpus contains repeated:

```text
<eos><eos><bos>
```

boundaries.

## 23.3 Short training context

Phase-I trained at:

```text
256 tokens
```

while the architecture is configured for a maximum of 4,096.

## 23.4 Limited training-token budget

A 1B-class model trained on approximately 1B tokens is intentionally early in its scaling curve relative to many modern public language models.

## 23.5 Small custom diagnostic suites

The seven-item semantic diagnostic and 10-item EN/TR cloze tests are useful for longitudinal tracking, not broad capability claims.

## 23.6 Assistant behavior is untrained

The model has not yet undergone instruction tuning or chat alignment.

## 23.7 Data-quality instrumentation needs expansion

Future datasets should expose richer provenance, source composition, deduplication, contamination, language, document-length and boundary statistics.

---

# 24. Phase-II Research Direction

Phase-II is planned as **continued pretraining from the learned Phase-I weights**, not a restart from random initialization.

Exact schedules should be decided from measurements rather than fixed in advance.

## 24.1 Corpus work

- build a fresh, cleaner corpus,
- strengthen deduplication,
- fix duplicate EOS boundaries,
- preserve source/provenance metadata,
- measure source and language composition,
- measure document-length distributions,
- audit benchmark contamination,
- selectively replay useful general data instead of blindly repeating Phase-I.

## 24.2 English and Turkish as first-class languages

Future evaluation should separately measure:

- English validation,
- Turkish validation,
- EN/TR performance gaps,
- Turkish morphology and suffix handling,
- technical Turkish,
- natural conversational Turkish,
- long-form coherence,
- paired EN/TR semantic tests,
- code-switching behavior.

## 24.3 Dynamic context length

Move beyond fixed 256-token training toward measured buckets such as:

```text
256
512
1024
2048
4096
```

Longer context should use token-budget-aware micro-batching rather than assuming the Phase-I batch size remains safe.

## 24.4 Continued-pretraining gates

Candidate cumulative research gates:

```text
2B
3B
4B
5B tokens
```

These are evaluation gates, not automatic promises.

At every gate, the decision should be:

> **Is the marginal capability gain worth the additional data and compute?**

---

# 25. Diagnostic v2

The current diagnostic should be expanded with:

- multiple paraphrases per fact,
- contrastive correct/incorrect choices,
- multi-token answer log-probability,
- broader English and Turkish groups,
- math groups,
- factual groups,
- semantic relation groups,
- Turkish morphology probes,
- repetition metrics,
- EOS/stopping metrics,
- deterministic seeds,
- corrected target-rank reporting.

The desired distinction is:

```text
knowledge absent
```

versus:

```text
knowledge present but decoding loses
```

versus:

```text
knowledge present only in one memorized phrasing
```

---

# 26. Standardized External Comparison

CetinLM should later be compared with similarly sized public **base** models under a common evaluation harness and, where possible, common hardware.

Comparisons should separate:

## Quality

- standardized LM benchmarks,
- English quality,
- Turkish quality,
- factual probes,
- reasoning probes.

## Efficiency

- parameter count,
- observed training tokens,
- training throughput,
- inference throughput,
- latency,
- peak VRAM,
- GPU-hours where known,
- quality per unit compute.

A central future visualization should be:

> **quality versus training tokens / compute**

rather than only:

> **quality versus parameter count**

Reported token-level perplexity from models using different tokenizers should not be treated as directly comparable without normalization.

---

# 27. Public Interpretation

The evidence does **not** support saying:

> CetinLM is already better than larger models.

A strong defensible statement is:

> **CetinLM-1B successfully completed a 1B-token from-scratch Phase-I pretraining run on a single RTX 4070 Ti SUPER, with stable training, continued late-stage held-out improvement, and measurable growth in small longitudinal semantic diagnostics.**

And:

> **Phase-I closes as a validated research baseline, not as the final CetinLM product.**

---

# 28. Phase-I Status Card

```text
Model                  CetinLM-1B-Base
Parameters             1,048,780,544
Initialization         Random / from scratch
Training target        1,000,000,000 tokens
Training processed     1,000,005,632 tokens
Final optimizer step   122,071
Best checkpoint step   122,000
Best checkpoint tokens 999,424,000
Trainer best val       3.380473
Benchmark val          3.380097
Benchmark PPL          29.374
English cloze          2/10
Turkish cloze          2/10
Diagnostic Top-1       1/7
Diagnostic Top-5       5/7
Diagnostic Top-20      7/7
Phase-I train seq      256
Configured max seq     4096
Hardware               RTX 4070 Ti SUPER 16 GB
Status                 COMPLETE
```

---

# 29. Evaluation Commands

Final benchmark:

```bash
python src\mertai\training\evaluate_1b.py --checkpoint best
```

Scientific diagnostic:

```bash
python scripts\evaluation\inspect_predictions_1b.py
```

EOS / boundary audit:

```bash
python scripts\evaluation\audit_eos_boundaries.py
```

Checkpoint hash verification:

```powershell
Get-FileHash checkpoints_1b_base\best.pt -Algorithm SHA256
Get-FileHash checkpoints_1b_base\last.pt -Algorithm SHA256
```

---

# 30. Phase-I Closure Checklist

Completed:

- [x] 1B-token target reached
- [x] best checkpoint saved
- [x] last checkpoint saved
- [x] checkpoint backups created
- [x] SHA-256 fingerprints recorded
- [x] final Benchmark v4 run
- [x] final scientific diagnostic run
- [x] EOS/data-boundary audit run
- [x] final validation trajectory reviewed
- [x] known limitations documented

Next:

- [ ] freeze/tag Phase-I artifacts
- [ ] commit this report
- [ ] preserve final benchmark JSON/TXT outputs
- [ ] preserve final diagnostic JSON
- [ ] preserve EOS audit output
- [ ] create a Phase-I Git tag/release if desired
- [ ] build Phase-II data pipeline
- [ ] add strict corpus invariants
- [ ] implement Diagnostic v2
- [ ] benchmark dynamic-length training safely
- [ ] begin continued pretraining only after the new pipeline is validated

---

# 31. Closing

Phase-I began as a systems question:

> Can an independent 1B-class language-model stack be engineered, trained, measured, checkpointed and completed from scratch on a single 16 GB consumer GPU?

The answer is now:

**Yes.**

The more difficult research questions begin here:

- How much more capability can the same parameter budget absorb?
- Which gains come from better data rather than simply more data?
- How much does longer-context continued pretraining change the model?
- How strong can English and Turkish become while preserving multilingual coverage?
- Which bottlenecks are architectural, which are data-driven, and which belong to post-training?
- How much capability can be extracted per token and per unit of compute before parameter scaling becomes the correct next move?

Those questions define Phase-II.

> **CetinLM-1B is not the final product. It is the first instrument in the laboratory.**

> **Compute is not the experiment. Engineering is.**

> **Scale should amplify good engineering, not replace it.**

---

## Appendix A — Checkpoint Hashes

```text
best.pt
SHA256
83E4EA87674F27EF2235AFE891537F67912C0B299BBC6F330980DD44F454073B

last.pt
SHA256
E432BF66A7E635EBEF0EA141E63C28D4C4A3705446B8DF5B9BB2F598FABA8923
```

---

## Appendix B — Late-Run Validation Sequence

```text
114K  3.399315
115K  3.393643
116K  3.393769
117K  3.394800
118K  3.395450
119K  3.389917
120K  3.384159
122K  3.380473  ← Phase-I best
```

This sequence is retained because it demonstrates why a short apparent plateau should not be treated as convergence without a longer observation window.

---

## Appendix C — Final Benchmark Snapshot

```text
CETINLM-1B BASE BENCHMARK v4

Parameters : 1,048,780,544
Step       : 122,000
Processed  : 999,424,000
Best val   : 3.380473

Val Loss   : 3.380097
PPL        : 29.374
Val batches: 25
Val tokens : 6,400

English cloze : 2/10
Turkish cloze : 2/10
```

---

## Appendix D — Final Scientific Diagnostic Snapshot

```text
Target Top-1  : 1/7
Target Top-5  : 5/7
Target Top-20 : 7/7
```

Selected signals:

```text
France → Paris       Top-5
Paris → France       Top-5
hot → cold           Top-5
water → 0            Top-20
2 + 2 → 4            Top-5
Türkiye → Ankara     Top-1
Ankara → başkenti    Top-20
```

---

## Appendix E — Corpus Boundary Snapshot

```text
Train tokens : 1,000,000,000
Train EOS    : 1,884,722
EOS / 1M     : 1,884.72
Tokens / EOS : 530.6

Val tokens   : 10,000,000
Val EOS      : 18,952
Val EOS / 1M : 1,895.20
```

Observed repeated boundary:

```text
<eos><eos><bos>
```

Phase-II action:

```text
Identify the source of duplicated EOS insertion.
Define one canonical document-boundary convention.
Add automated corpus invariants before training begins.
```

---

**End of CetinLM-1B Phase-I Final Training & Evaluation Report**
