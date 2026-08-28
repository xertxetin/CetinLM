# CetinLM — Project Technical Documentation

> **Canonical technical documentation for the CetinLM project.**
>
> This document records the project's identity, current 1B foundation model, tokenizer, training configuration, data sources, evaluation system, development roadmap, model-identity plan, and licensing/disclaimer position.

---

## 1. Project Identity

**Project:** CetinLM  
**Founder:** Mert Çetin  
**Main technology brand:** Me Force Teknoloji  
**Project type:** Independent AI / large language model research and engineering project.

Mert Çetin is a Turkish entrepreneur, musician and producer, publicly known in creative work under the name **XertXetin**.

CetinLM explores how far language-model capability can be pushed while keeping the system comparatively small, efficient and practical to run on accessible hardware.

The central engineering question is:

> **Can useful, capable AI be built without always requiring enormous infrastructure?**

The project therefore emphasizes capability, efficiency, reproducibility, evaluation and practical deployment rather than parameter count alone.

---

## 2. What CetinLM Is

CetinLM is being developed end-to-end rather than being presented simply as an API wrapper around an external model.

The project covers:

- tokenizer development
- multilingual data preparation
- data filtering and deduplication
- model architecture
- model initialization
- base pretraining
- checkpointing
- checkpoint recovery
- evaluation and benchmarking
- instruction tuning
- conversation tuning
- code
- mathematics
- reasoning
- preference optimization
- tools
- web retrieval
- memory
- compression and deployment efficiency

The current foundation model is approximately **1.049 billion parameters**.

The current model is a **base causal language model**, not the final assistant.

```text
Base model
    ≠
Final chat assistant
```

Conversation, instruction following, reasoning behavior and tools are planned as later development stages.

---

## 3. Model Origin

The current foundation run is intended as a **from-scratch pretraining model**.

It is not presented as:

- a Llama fine-tune
- a Mistral fine-tune
- a Qwen fine-tune
- a GPT wrapper
- a LoRA adaptation of an existing base checkpoint

The current foundation model is initialized from the CetinLM model definition and trained on the project's training corpus.

The project retains training configurations, checkpoints, logs and benchmark results so that model origin can be documented independently of the model's own generated answers.

---

## 4. Current 1B Model

### Parameters

```text
1,048,780,544 parameters
```

Approximate label:

```text
1.049B
```

### Model type

```text
Causal language model
```

### Current objective

```text
Causal next-token prediction
```

Conceptually:

```text
previous tokens
      ↓
model
      ↓
probability distribution
      ↓
next token
```

---

## 5. Current Training Configuration

```text
Device:
    CUDA

Precision:
    BF16

Optimizer:
    bitsandbytes AdamW 8-bit

Micro batch:
    1

Gradient accumulation:
    32

Sequence length:
    256

Effective tokens / optimizer step:
    8,192

Training target:
    1,000,000,000 tokens

Validation target:
    10,000,000 tokens

Warmup:
    2,000 steps

Base learning rate:
    0.0002
```

The precise learning-rate schedule and current training state are defined by the training implementation and checkpoint state.

---

## 6. Hardware Philosophy

The current development target is:

```text
NVIDIA GeForce RTX 4070 Ti SUPER
16 GB VRAM
```

The goal is not to define success as using the largest accelerator available.

Instead, the project investigates how much useful capability can be achieved within realistic consumer hardware constraints.

Larger rented or research accelerators may be used for future scaling experiments, but the deployment philosophy remains centered on accessible hardware.

---

## 7. Why 1B?

The 1B model is the first serious foundation scale for establishing a complete, reproducible development loop:

- custom tokenizer
- multilingual corpus
- training system
- checkpointing
- recovery
- evaluation
- consumer-GPU execution
- later post-training

Future models may scale to 3B, 5B or beyond, but parameter count alone is not considered the goal.

Future scaling will be judged by:

- capability
- quality
- VRAM usage
- inference speed
- training cost
- context length
- compression
- quantization
- deployment practicality

---

## 8. Tokenizer

Current tokenizer:

```text
data/cetin_tokenizer_v2.json
```

Vocabulary size:

```text
65,536
```

Tokenizer training uses a multilingual language pool:

```text
English
Turkish
German
French
Spanish
Portuguese
Italian
Dutch
Polish
Russian
Ukrainian
Arabic
Persian
Hindi
Bengali
Urdu
Indonesian
Vietnamese
Thai
Chinese
Japanese
Korean
```

Relative language sampling weights are used during tokenizer training.

**Important:** tokenizer sampling weights are not the same thing as the final 1B pretraining-corpus percentages.

---

## 9. Current Training Corpus

Exact global targets:

```text
Training:   1,000,000,000 tokens
Validation:    10,000,000 tokens
Total:      1,010,000,000 tokens
```

The current corpus is based on two primary public upstream datasets:

```text
FineWeb
C4
```

Project-side processing controls source selection, quotas, tokenization and final binary training shards.

---

## 10. Current Training Distribution

| Language / source | Tokens | Share |
|---|---:|---:|
| English — FineWeb | 400,000,000 | 40% |
| English — C4 | 50,000,000 | 5% |
| Turkish — C4 | 100,000,000 | 10% |
| Spanish — C4 | 50,000,000 | 5% |
| German — C4 | 50,000,000 | 5% |
| French — C4 | 50,000,000 | 5% |
| Russian — C4 | 50,000,000 | 5% |
| Arabic — C4 | 50,000,000 | 5% |
| Chinese — C4 | 50,000,000 | 5% |
| Japanese — C4 | 40,000,000 | 4% |
| Hindi — C4 | 40,000,000 | 4% |
| Persian — C4 | 20,000,000 | 2% |
| Korean — C4 | 20,000,000 | 2% |
| Portuguese — C4 | 10,000,000 | 1% |
| Indonesian — C4 | 10,000,000 | 1% |
| Vietnamese — C4 | 10,000,000 | 1% |
| **TOTAL** | **1,000,000,000** | **100%** |

Therefore:

```text
English total = 45%
    40% FineWeb English
  +  5% C4 English

Turkish = 10%
```

Turkish has a deliberate 10% share in the current corpus because strong Turkish capability is one of the desired project outcomes.

---

## 11. Data Processing

The current pipeline is conceptually:

```text
upstream source
      ↓
cleanup / normalization
      ↓
filtering
      ↓
deduplication
      ↓
language / source selection
      ↓
exact token quota
      ↓
tokenization
      ↓
train / validation split
      ↓
binary token shards
```

Current training data is stored as binary token shards, for example:

```text
tokens_000000.bin
tokens_000001.bin
...
tokens_000019.bin
```

These are optimized for model training rather than human-readable editing.

---

## 12. What the Dataset Looks Like

Upstream text can be represented in JSON/JSONL-style records such as:

```json
{"text":"Türkiye'nin başkenti Ankara'dır.","language":"tr","source":"example"}
```

After tokenization it becomes integer token IDs:

```text
[1204, 883, 4512, 912, 77, ...]
```

The model then consumes token IDs from the binary corpus rather than the original JSON object.

---

## 13. FineWeb

Current project allocation:

```text
400,000,000 English training tokens
```

Upstream dataset:

```text
HuggingFaceFW/fineweb
```

Published dataset license:

```text
Open Data Commons Attribution License (ODC-By) 1.0
```

Source basis:

```text
Common Crawl
```

References:

- https://huggingface.co/datasets/HuggingFaceFW/fineweb
- https://opendatacommons.org/licenses/by/1-0/
- https://commoncrawl.org/terms-of-use

---

## 14. C4

Current project allocation:

```text
600,000,000 tokens
```

distributed across the listed language quotas.

Upstream dataset:

```text
allenai/c4
```

Published dataset license:

```text
ODC-By
```

Source basis:

```text
Common Crawl
```

References:

- https://huggingface.co/datasets/allenai/c4
- https://opendatacommons.org/licenses/by/1-0/
- https://commoncrawl.org/terms-of-use

---

## 15. Important Data-Licensing Clarification

A public dataset/database license does **not automatically mean that every individual item inside a web-derived corpus is free of all possible third-party rights**.

In simplified form:

```text
Dataset / database license
        ≠
automatic clearance of every individual web item
```

Individual material can remain subject to separate rights or terms, including:

- copyright
- privacy / data-protection rights
- personality / publicity rights
- trademark rights
- contractual restrictions
- other third-party rights

Common Crawl also states that crawled material may be subject to separate rights and terms.

CetinLM therefore does not claim blanket ownership or blanket legal clearance over upstream third-party content.

This repository documents the sources and published licensing information used by the project; it is not legal advice.

---

## 16. Project-Side Legal Position

The project uses upstream datasets according to their published licensing information and applicable terms as understood by the project.

The project-side processing does not change ownership of upstream third-party material.

The project does not claim ownership over:

```text
FineWeb
C4
Common Crawl
Hugging Face
third-party source websites
third-party datasets
third-party software libraries
```

Third-party rights remain with their respective licensors/rightsholders.

---

## 17. Project Ownership

Unless a separate file states otherwise, original CetinLM project material is retained by the project.

Current repository position:

```text
All rights reserved.
```

This applies to original project material and does **not** override upstream third-party licenses.

A third-party dataset remains under its own license.

A third-party library remains under its own license.

Third-party names and trademarks remain the property of their respective owners.

---

## 18. Educational / Research Notice

CetinLM is currently developed as an independent research and engineering project intended primarily for:

- education
- experimentation
- research
- reproducible engineering
- model-development learning
- efficiency research

The project does not guarantee:

- factual correctness
- safety
- commercial fitness
- legal compliance for every downstream jurisdiction
- absence of bias
- absence of third-party material in upstream data
- suitability for any particular application

Nothing in this documentation constitutes legal advice.

---

## 19. Downstream User Responsibility

Anyone who uses, modifies, redistributes, hosts, or commercially deploys CetinLM or derived artifacts is responsible for performing their own review of applicable:

```text
dataset licenses
copyright
privacy / data protection
terms of service
trademarks
AI/data regulations
other applicable laws
```

Downstream users must not assume that the existence of a public dataset or model automatically clears every possible right for every intended use.

Commercial publication or redistribution should receive appropriate legal review for the relevant jurisdiction.

---

## 20. Training Checkpoints

Current checkpoint directory:

```text
checkpoints_1b_base/
├── best.pt
└── last.pt
```

`last.pt` represents the latest resumable training state.

`best.pt` records the best validation result observed so far.

The trainer supports recovery from a saved checkpoint, including optimizer state where available.

The recovery path was practically exercised after an unexpected power interruption and successfully continued from the stored state rather than restarting from zero.

---

## 21. Current Training Status

The 1B base model is actively being trained.

Representative recent state from the development run:

```text
Step:             16,500
Processed tokens: 135,168,000
Progress:         13.52%

Validation loss:  4.177340
Validation PPL:   65.192
```

These are intermediate measurements, not final performance claims.

Training progress is judged from the overall trend across checkpoints rather than a single batch.

---

## 22. Training Health Monitoring

The training process is monitored for:

```text
training loss
validation loss
perplexity
gradient norm
learning rate
tokens / second
NaN / Inf
GPU memory
checkpoint integrity
```

Normal training can include batch-to-batch loss variation and occasional gradient spikes. Isolated variation is not automatically interpreted as failure.

---

## 23. Evaluation System

Current evaluator:

```text
src/mertai/training/evaluate_1b.py
```

The evaluator is designed to inspect checkpoints without changing the training state.

Current benchmark layers include:

```text
Validation loss
Perplexity
English cloze
Turkish cloze
Generation smoke tests
Generation repetition metrics
Benchmark history
Comparison against previous benchmark
```

Reports are stored under:

```text
evaluation_1b/
├── benchmark_history.jsonl
├── latest_report.json
└── report_step_XXXXXXXX.txt
```

---

## 24. Benchmark Philosophy

The benchmark exists to measure change over time, catch regressions and create a documented model-development history.

Current cloze probes are diagnostic tests rather than claims of broad intelligence.

The project intends to expand evaluation into:

```text
Language
Knowledge
Turkish
English
Math
Logic
Code
Instruction Following
Conversation
Reasoning
Long Context
Tool Use
Robustness
```

A dedicated Turkish evaluation layer is also planned because many general benchmarks are heavily English-oriented.

---

## 25. Why the Current Base Model Does Not Chat Normally

A common question is why the current model may produce strange output for prompts such as `Hi` or `Hello`.

The answer is that the current model is a base language model trained for next-token prediction.

It has not yet completed the post-training stages that teach assistant behavior.

Therefore current outputs may be:

- repetitive
- incomplete
- poorly formatted as dialogue
- encyclopedic
- inconsistent
- unexpectedly continued text

This is not by itself evidence that the base training has failed.

The intended path is:

```text
Base model
     ↓
Instruction / SFT
     ↓
Conversation
     ↓
Preference optimization
     ↓
Chat behavior
```

---

## 26. Planned Capability Development

The planned capability path is:

```text
BASE
  ↓
Evaluation
  ↓
Instruction
  ↓
Conversation
  ↓
Code
  ↓
Math
  ↓
Reasoning
  ↓
Preference
  ↓
Chat
  ↓
Tools
  ↓
Web
  ↓
Memory
```

The exact order can evolve according to evaluation results.

---

## 27. Instruction / SFT

Instruction training will teach the model to map user requests to useful assistant responses.

Example:

```json
{
  "messages": [
    {"role": "user", "content": "Explain what a neural network is."},
    {"role": "assistant", "content": "A neural network is a machine-learning model made of layers..."}
  ]
}
```

---

## 28. Conversation

Conversation training will target:

- multi-turn interaction
- user/assistant roles
- context tracking
- natural responses
- consistency
- conversational usefulness

---

## 29. Code and Math

Dedicated later training and evaluation will target:

```text
code generation
debugging
refactoring
code explanation
mathematical problem solving
structured calculations
```

---

## 30. Reasoning

Reasoning development is intended to improve:

```text
multi-step problem solving
planning
decomposition
verification
structured reasoning
```

Reasoning quality will be evaluated separately from ordinary text completion.

---

## 31. Preference Optimization

Preference training may improve:

```text
usefulness
correctness
style
consistency
instruction adherence
safe behavior
```

---

## 32. Tools / Web / Memory

The long-term system may integrate:

```text
tool calling
web retrieval
external search
controlled memory
application integrations
```

These capabilities may be implemented at the system level around the model where appropriate.

The base model is not assumed to have live internet access merely because it was trained on web-derived text.

---

## 33. CetinLM Project Identity Dataset

A dedicated project-knowledge dataset is planned for the later instruction/conversation stages.

Its purpose is to make the model accurately describe its own project instead of inventing technical claims.

Planned topics include:

```text
What is CetinLM?
Who founded it?
What is its goal?
What model is currently being developed?
How many parameters does it have?
What tokenizer does it use?
What training data was used?
What hardware is targeted?
How does training work?
What benchmarks exist?
What is the roadmap?
What is the project philosophy?
```

Example:

```json
{
  "messages": [
    {"role": "user", "content": "CetinLM nedir?"},
    {"role": "assistant", "content": "CetinLM, verimli ve erişilebilir donanım üzerinde çalışabilecek yetenekli dil modelleri geliştirmeyi amaçlayan bağımsız bir yapay zeka araştırma ve mühendislik projesidir."}
  ]
}
```

Example:

```json
{
  "messages": [
    {"role": "user", "content": "CetinLM'yi kim kurdu?"},
    {"role": "assistant", "content": "CetinLM'nin kurucusu Mert Çetin'dir."}
  ]
}
```

The project identity corpus should contain only information intended for public project disclosure.

---

## 34. Model Self-Description Principle

CetinLM is intended to answer questions about itself using verified project facts.

For example:

```text
User:
Kaç parametren var?

Assistant:
1,048,780,544 parametreli mevcut bir foundation modelim.
```

The model should also avoid inventing inaccessible runtime facts.

For example, if the model does not receive current server/GPU metadata, it should say that it does not have access to that runtime information rather than guessing.

Design principle:

```text
Known project fact
      ↓
Answer

Unavailable internal/runtime fact
      ↓
Do not guess
```

---

## 35. Model Knowledge vs Project Knowledge

Not every project fact needs to live permanently inside model weights.

The future system may combine:

```text
model knowledge
+
canonical project knowledge
+
runtime information
```

Frequently changing project information may be better stored in a maintained knowledge source than repeatedly baked into the model weights.

---

## 36. Continued Model Improvement

The project's guiding principle is:

> **Improve the existing model instead of repeatedly throwing it away.**

Where appropriate, later high-quality data can be used for continued pretraining or additional post-training.

The project does not intend to create a new model name for every dataset revision.

The main CetinLM model can evolve while:

```text
data
training
evaluation
capabilities
compression
deployment
```

improve over time.

---

## 37. Future Dataset Improvements

A future improved pipeline may introduce stronger:

```text
quality filtering
deduplication
near-duplicate handling
language validation
PII reduction
spam filtering
boilerplate removal
contamination checks
```

Such changes should be introduced carefully and evaluated against the existing baseline.

The current 1B run is intentionally treated as a stable development baseline; major changes are not made casually because they can make results harder to interpret.

---

## 38. Larger Models

After the 1B foundation model is completed and evaluated, larger experiments may be considered:

```text
1B
 ↓
3B
 ↓
5B+
```

A larger model would be a separate model training experiment.

The 1B model remains an important practical baseline and deployment target.

---

## 39. Compression and Efficiency

Long-term efficiency work may include:

```text
quantization
weight compression
architecture optimization
efficient kernels
inference optimization
distillation where justified
```

The project aims to improve memory and inference efficiency without confusing compression with the underlying parameter count.

---

## 40. Accessibility Philosophy

CetinLM is based on a simple direction:

> **Intelligence should not always have to mean enormous.**

The project investigates:

```text
capability per parameter
capability per GB of VRAM
capability per unit of compute
capability per deployment cost
```

The project does not claim that a small model is automatically equivalent to a frontier-scale system.

The goal is to push efficient models as far as practical.

---

## 41. Repository Philosophy

The repository is intended to document actual engineering work rather than only publishing marketing claims.

Important records include:

```text
model configuration
training configuration
tokenizer
data source information
training quotas
training logs
checkpoint history
benchmark results
roadmap
engineering decisions
```

---

## 42. Established Components

Current project components include:

```text
✓ Project identity
✓ Model architecture
✓ ~1B parameter foundation model
✓ 65K tokenizer
✓ Multilingual tokenizer training
✓ Multilingual corpus construction
✓ Token quotas
✓ Binary token shards
✓ BF16 training
✓ 8-bit AdamW optimizer
✓ Checkpointing
✓ Resume support
✓ Validation
✓ Initial benchmark tooling
✓ Benchmark history
✓ Consumer-GPU training target
```

---

## 43. Still In Progress

```text
→ Complete 1B base pretraining
→ Expand benchmark coverage
→ Instruction / SFT
→ Conversation
→ Code
→ Math
→ Reasoning
→ Preference optimization
→ Chat system
→ Tool use
→ Web retrieval
→ Memory
→ Compression / quantization
→ Final deployment evaluation
```

---

## 44. What CetinLM Does Not Claim

CetinLM does not claim:

```text
to be the largest AI model
to outperform every larger model
to have invented transformers
to have invented language-model pretraining
to have invented web-scale datasets
to eliminate all legal/data risks
to eliminate all hallucinations
to possess human-like consciousness
```

The project is an engineering and research effort focused on efficient language-model development.

---

## 45. Public Model-Identity Position

When the later chat model is able to answer questions about its own origin, the intended canonical facts are:

```text
Project:
    CetinLM

Founder:
    Mert Çetin

Current foundation model:
    ~1.049B parameters

Exact parameters:
    1,048,780,544

Tokenizer:
    CetinLM tokenizer

Vocabulary:
    65,536

Current foundation stage:
    Base pretraining

Origin:
    From-scratch foundation-model training

Primary upstream datasets:
    FineWeb + C4

Primary development GPU:
    RTX 4070 Ti SUPER 16 GB
```

These facts should be sourced from project documentation and training records rather than invented by the model.

---

## 46. Final Legal / Safety Disclaimer

This repository is provided for research, education and engineering purposes.

No guarantee is made that any particular downstream use is lawful, safe, accurate or suitable.

Users are responsible for reviewing applicable licenses, copyright, privacy/data protection, terms, trademarks, AI regulations and other laws relevant to their use.

The project does not provide legal advice.

The existence of this document is not a warranty that every downstream use is permitted.

---

## 47. Third-Party Attribution

Third-party datasets and software retain their respective licenses and rights.

Relevant upstream resources include:

```text
FineWeb
C4
Common Crawl
Hugging Face
Open Data Commons
PyTorch
bitsandbytes
CUDA / NVIDIA software components
other project dependencies
```

The project does not claim ownership of third-party trademarks, datasets or software.

Users should consult the original license and terms for each dependency.

---

## 48. Reproducibility

The project aims to preserve enough metadata to answer:

```text
What dataset was used?
Where did it come from?
Which published license/terms apply?
How many tokens were used?
Which language/source quota was used?
Which tokenizer was used?
Which checkpoint was evaluated?
What was the validation result?
What hardware was used?
Which training stage was active?
```

Future dataset manifests should record, where practical:

```text
source
dataset name
revision/version
download date
license
terms URL
upstream URL
processing version
token quota
checksum / manifest
```

---

## 49. Roadmap Summary

```text
Phase 1 — Foundation
    Custom tokenizer
    Multilingual corpus
    1B foundation pretraining
    Validation
    Benchmarking

Phase 2 — Capability
    Instruction
    Conversation
    Code
    Math
    Reasoning
    Preference

Phase 3 — System
    Chat
    Tools
    Web
    Memory

Phase 4 — Efficiency
    Quantization
    Compression
    Inference optimization
    Consumer-GPU deployment
    Larger-model experiments
```

---

## 50. Final Project Statement

CetinLM is an ongoing independent AI research and engineering effort.

It is being built step by step, measured continuously, and documented publicly.

The project does not depend on the assumption that bigger is always better.

It explores a different direction:

> **Build capable AI. Understand every layer. Measure the result. Then make it more efficient.**

**CetinLM — build small, learn deeply, measure everything, push the limits.**

---

## Official References

### FineWeb

https://huggingface.co/datasets/HuggingFaceFW/fineweb

### C4

https://huggingface.co/datasets/allenai/c4

### Open Data Commons ODC-By 1.0

https://opendatacommons.org/licenses/by/1-0/

### Common Crawl Terms of Use

https://commoncrawl.org/terms-of-use
