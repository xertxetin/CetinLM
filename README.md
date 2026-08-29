# CetinLM — Efficient Large Language Model

<p align="left">
<img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinJS Logo" width="450px">
</p>

CetinLM is an independent large language model research and engineering project focused on one practical question:

> How capable can a modern language model become while remaining small, efficient, and realistically runnable on accessible hardware?

The project is built end-to-end: tokenizer, dataset engineering, model architecture, pretraining, checkpointing, evaluation, instruction tuning, conversation, code, reasoning, and eventually tools/web/memory.

## Current status

**Active stage: Base / foundation-model pretraining**

Current 1B run:

| Component | Configuration |
|---|---:|
| Parameters | 1,048,780,544 |
| Approx. size | 1.049B |
| Vocabulary | 65,536 |
| Training target | 1,000,000,000 tokens |
| Validation | 10,000,000 tokens |
| Sequence length | 256 |
| Micro-batch | 1 |
| Gradient accumulation | 32 |
| Effective tokens / step | 8,192 |
| Precision | BF16 |
| Optimizer | bitsandbytes AdamW 8-bit |
| Target hardware | RTX 4070 Ti SUPER 16 GB |
| Objective | Causal next-token prediction |

The current model is a **base language model**, not a finished chat assistant. Conversation, instruction following, code, reasoning and tool use are planned as later stages.

## Development roadmap

```text
Base Pretraining
       ↓
Evaluation
       ↓
Instruction / SFT
       ↓
Conversation
       ↓
Code
       ↓
Math
       ↓
Reasoning
       ↓
Preference Optimization
       ↓
Chat
       ↓
Tools / Web / Memory
       ↓
Final Evaluation
       ↓
Compression / Efficient Deployment
```

Each major stage is intended to have its own evaluation suite.

## Current training corpus

The current corpus contains exactly:

```text
Training:   1,000,000,000 tokens
Validation:    10,000,000 tokens
Total:      1,010,000,000 tokens
```

### Training quotas

| Source | Train tokens | Share |
|---|---:|---:|
| FineWeb English | 400,000,000 | 40% |
| C4 English | 50,000,000 | 5% |
| C4 Turkish | 100,000,000 | 10% |
| C4 Spanish | 50,000,000 | 5% |
| C4 German | 50,000,000 | 5% |
| C4 French | 50,000,000 | 5% |
| C4 Russian | 50,000,000 | 5% |
| C4 Arabic | 50,000,000 | 5% |
| C4 Chinese | 50,000,000 | 5% |
| C4 Japanese | 40,000,000 | 4% |
| C4 Hindi | 40,000,000 | 4% |
| C4 Persian | 20,000,000 | 2% |
| C4 Korean | 20,000,000 | 2% |
| C4 Portuguese | 10,000,000 | 1% |
| C4 Indonesian | 10,000,000 | 1% |
| C4 Vietnamese | 10,000,000 | 1% |
| **TOTAL** | **1,000,000,000** | **100%** |

Validation uses the same proportions and totals 10,000,000 tokens.

## Dataset pipeline

The project uses a controlled data pipeline rather than feeding raw downloads directly into training:

```text
Upstream datasets
       ↓
Source selection
       ↓
Filtering / quality checks
       ↓
Deduplication
       ↓
Language/source quota control
       ↓
CetinLM tokenizer
       ↓
Exact token accounting
       ↓
Train / validation split
       ↓
Sharded binary token files
       ↓
Integrity checks
```

The current build completed with exact global totals:

```text
Train:       1,000,000,000
Validation:     10,000,000
Total:       1,010,000,000
```

## Tokenizer

Current tokenizer:

```text
data/cetin_tokenizer_v2.json
```

Vocabulary:

```text
65,536 tokens
```

The tokenizer is treated as a core model component because multilingual token efficiency affects context usage, training cost and inference cost.

## Evaluation

Current evaluator:

```text
src/mertai/training/evaluate_1b.py
```

Current evaluation layers:

```text
Validation Loss
Perplexity
English cloze probes
Turkish cloze probes
Deterministic generation smoke tests
```

Reports are stored under:

```text
evaluation_1b/
├── benchmark_history.jsonl
├── latest_report.json
└── report_step_XXXXXXXX.txt
```

The purpose is to track the same model throughout training instead of judging only the final checkpoint.

### Important benchmark note

The current English/Turkish cloze tests are early diagnostic smoke tests, not claims of general model intelligence. A serious benchmark suite will be expanded for:

```text
Language
Knowledge
Turkish
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

## Training reliability

The trainer maintains:

```text
checkpoints_1b_base/
├── best.pt
└── last.pt
```

`last.pt` is used for recovery and `best.pt` tracks the best validation result.

Resume support includes optimizer state. The system has already been exercised after an unexpected power interruption and successfully resumed from a saved checkpoint rather than restarting from zero.

## Hardware philosophy

The current development target is intentionally:

```text
RTX 4070 Ti SUPER
16 GB VRAM
```

The project is not primarily about building a model that requires datacenter hardware to run.

The research question is:

> How much useful capability can be achieved while remaining practical on hardware people can realistically access?

Larger rented accelerators may be used for future scaling experiments, but the deployment goal remains efficiency and accessibility.

## Scaling philosophy

Future model sizes may include:

```text
1B
 ↓
2B / 3B
 ↓
larger experiments
```

A larger parameter count is not automatically considered better.

Future versions will be evaluated on:

- capability
- quality
- VRAM usage
- inference speed
- training cost
- context length
- compression
- quantization
- deployment practicality

## Planned post-training

### Instruction / SFT
Teach the model to follow explicit user instructions.

### Conversation
Teach multi-turn dialogue, context tracking and consistent assistant behavior.

### Code
Teach code generation, debugging, explanation and refactoring.

### Math
Teach arithmetic and structured mathematical problem solving.

### Reasoning
Teach multi-step problem solving, planning, decomposition and verification.

### Preference optimization
Improve usefulness, correctness, style and consistency.

### Tools / Web / Memory
Later system-level capabilities may include tool calling, web retrieval, controlled memory and application integrations.

These are future stages. The current base model should not be treated as already having them.

# Data sources and licensing

## Important legal notice

CetinLM uses upstream datasets that are publicly distributed under their own licenses and terms. This repository does **not** claim that every individual item contained in a crawled dataset is free of all copyright, privacy, contractual, trademark, personality or other rights.

**This README is documentation, not legal advice.**

For commercial publication, model distribution, hosted services, dataset redistribution or other high-impact use, users should obtain qualified legal advice for their jurisdiction.

### FineWeb

Current project allocation:

```text
400,000,000 training tokens
```

Upstream dataset:

- `HuggingFaceFW/fineweb`
- License shown by the dataset: **Open Data Commons Attribution License (ODC-By) v1.0**
- Source basis: Common Crawl

References:

- https://huggingface.co/datasets/HuggingFaceFW/fineweb
- https://opendatacommons.org/licenses/by/1-0/
- https://commoncrawl.org/terms-of-use

FineWeb's published dataset documentation describes it as cleaned/deduplicated English web data derived from Common Crawl and identifies ODC-By 1.0 as the dataset license.

### C4

Current project allocations:

```text
English       50,000,000
Turkish      100,000,000
Spanish       50,000,000
German        50,000,000
French        50,000,000
Russian       50,000,000
Arabic        50,000,000
Chinese       50,000,000
Japanese      40,000,000
Hindi         40,000,000
Persian       20,000,000
Korean        20,000,000
Portuguese    10,000,000
Indonesian    10,000,000
Vietnamese    10,000,000
```

Upstream dataset:

- `allenai/c4`
- License shown by the dataset: **ODC-By**
- Source basis: Common Crawl

References:

- https://huggingface.co/datasets/allenai/c4
- https://opendatacommons.org/licenses/by/1-0/
- https://commoncrawl.org/terms-of-use

C4's published metadata identifies it as multilingual and licensed under ODC-By.

## Why the distinction matters

ODC-By grants rights over the licensed database subject to its conditions, but the ODC-By text explicitly notes that individual contents may be subject to separate rights, including copyright, privacy/data protection, personality, contract, patent and trademark rights.

Common Crawl likewise states that crawled content may be subject to separate terms and third-party rights, and requires users to comply with applicable law and respect third-party rights.

Therefore:

```text
Upstream dataset license
        ≠
Automatic clearance of every individual web item
```

CetinLM does not represent otherwise.

## Project ownership

Unless a separate file states otherwise:

```text
Original CetinLM source code
Original CetinLM documentation
Original project configuration
Original project-created evaluation code
Original project-created research material

© CetinLM project
All rights reserved.
```

This does **not** relicense or claim ownership of third-party datasets, software, trademarks, websites or other upstream material.

Upstream rights remain with their respective licensors/rightsholders.

## Downstream users

Anyone using, redistributing, hosting, or integrating CetinLM-derived artifacts is responsible for their own compliance with applicable:

- dataset licenses
- attribution requirements
- copyright
- privacy/data protection
- publicity/personality rights
- trademarks
- contractual terms
- local AI/data regulations

Users should independently review the licenses and terms that apply to their intended use.

## Educational / research notice

CetinLM is currently developed primarily for:

- education
- research
- experimentation
- reproducible engineering
- model-development learning
- efficiency research

No guarantee is made regarding:

- factual correctness
- safety
- legal compliance of downstream use
- commercial fitness
- absence of bias
- absence of unwanted or third-party material in upstream data
- suitability for any particular application

The project authors do not assume responsibility for downstream use or for violations caused by a user's deployment, modification, redistribution, or generated content.

Nothing in this repository constitutes legal advice.

## Third-party attribution

CetinLM may use third-party datasets, libraries and services.

The project does not claim ownership over:

```text
FineWeb
C4
Common Crawl
Hugging Face
Open Data Commons
Third-party source websites
Third-party libraries
```

All third-party names and trademarks remain the property of their respective owners.

# Reproducibility and provenance

The project aims to keep enough metadata to answer:

```text
What dataset was used?
Where did it come from?
Under which license/terms?
How many tokens were used?
Which language/source quota was used?
Which tokenizer was used?
Which checkpoint was evaluated?
What was the validation result?
Which hardware was used?
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

# Current project milestone

The first serious foundation run is intended to establish a reproducible 1B-scale baseline on consumer hardware.

The project will then use measured results to decide how much further capability can be gained through better data, post-training, architecture, compression and scaling.

# Philosophy

CetinLM is not based on the claim that large AI models are bad.

The project is based on a different question:

> Can we get a large amount of useful intelligence without always requiring enormous hardware?

As model size grows, memory, cost and deployment complexity can grow with it.

We are exploring the other direction:

```text
Better data
      +
Better training
      +
Better architecture
      +
Better post-training
      +
Better compression
      =
More capability per unit of hardware
```

The objective is not to make the biggest model possible.

The objective is to make the most capable model we can **within a real-world hardware constraint**.

# Final note

CetinLM is a work in progress.

Numbers in this document describe the current development state and are not final performance claims.

The project intentionally documents intermediate checkpoints, benchmark results, failures, dataset provenance and engineering decisions so that progress can be measured rather than assumed.

**Build small. Learn deeply. Measure everything. Push the limits.**
