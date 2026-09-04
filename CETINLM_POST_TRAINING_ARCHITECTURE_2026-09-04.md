<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="220px">
</p>

<h1 align="center">CetinLM Post-Training Architecture</h1>

<p align="center">
  <strong>Public research direction · 2026-09-04</strong><br>
  A compact Turkish-first Base model extended through instruction following, reasoning, conversation, safety, and research/tool use.
</p>

---

> [!NOTE]
> This document intentionally describes the **public architecture and research philosophy only**. Proprietary dataset-generation prompts, private source-selection logic, exact filtering thresholds, internal scoring recipes, and other implementation-sensitive details are not published here.

# Core idea

CetinLM is being designed as more than a static next-token model that attempts to memorize every answer during Base pretraining.

The research direction is:

```text
CetinLM-1B-Base
        │
        ├── Instruct Training
        ├── Reasoning Training
        ├── Chat Training
        ├── Safety Training
        └── Research / Tool-use
```

The Base model provides language, concepts, world structure, technical foundations, and reusable problem-solving primitives. Post-training then teaches the model **how to act on that knowledge**.

# Training roles

| Stage | Primary role |
|---|---|
| **Base** | Language, concepts, factual foundations, relationships and broad representations |
| **Instruct** | Follow explicit tasks, formats, constraints and transformations |
| **Reasoning** | Decompose problems, compare hypotheses, check assumptions and validate conclusions |
| **Chat** | Natural Turkish conversation, context tracking, tone adaptation and multi-turn interaction |
| **Safety** | Distinguish safe from harmful intent, refuse appropriately and preserve useful safe assistance |
| **Research / Tool-use** | Recognize missing/current information, search, evaluate sources, compare evidence and synthesize |

# Why separate these capabilities?

A useful assistant needs several different behaviors that should not be conflated during corpus construction.

```text
knowing something
      ≠
following a precise instruction
      ≠
reasoning through a hard problem
      ≠
conversing naturally
      ≠
handling risky intent safely
      ≠
researching information that is missing or current
```

Separating these roles makes the development process easier to measure and audit.

# Reasoning architecture

Reasoning is planned as an adaptive capability rather than an instruction to produce unnecessarily long chains for every question.

```text
easy problem
   ↓
short reasoning

hard problem
   ↓
decompose → test alternatives → verify → conclude

missing information
   ↓
recognize uncertainty → request/research what is needed
```

Target reasoning families include diagnosis, cause-and-effect analysis, decision trade-offs, evidence evaluation, logical problems, estimation, error correction, missing-information detection and solution verification.

## Verified Math Reasoning

Mathematical knowledge and mathematical execution are treated as related but distinct signals.

```text
Math Knowledge
      +
Verified Problem Solving
      +
Contrastive Error Correction
```

Where practical, generated mathematical problems can be checked by deterministic tools rather than relying on a language model as the sole verifier.

# Chat architecture

The Chat stage is intended to make the same core model usable across different conversational settings rather than forcing one synthetic assistant voice.

Target variation includes:

- short and long answers,
- everyday and technical Turkish,
- formal and informal tone,
- tutoring and explanation,
- diagnosis and practical help,
- ambiguity handling,
- follow-up questions,
- corrections and multi-turn context,
- natural reactions and conversational rhythm.

The goal is not a single response template. It is **context-sensitive communication**.

# Safety architecture

Safety is treated as intent discrimination, not a keyword blacklist.

```text
DATA QC
   ↓
SAFETY TRAINING
   ↓
SAFE-HELP / REFUSAL BOUNDARIES
   ↓
RUNTIME SAFETY LAYER
   ↓
ADVERSARIAL EVALUATION
```

A robust system should understand sensitive subjects well enough to discuss them safely while avoiding assistance that meaningfully facilitates real harm.

This also requires measuring **over-refusal**: safe educational, historical, protective, analytical and defensive requests should remain answerable.

# Research and tool use

A compact model does not need every current fact encoded permanently in its weights.

The planned research workflow is:

```text
identify information need
        ↓
decide whether research is necessary
        ↓
formulate search/retrieval request
        ↓
collect relevant evidence
        ↓
assess authority + freshness + conflicts
        ↓
compare sources
        ↓
synthesize
        ↓
answer with appropriate confidence
```

Current web information normally belongs in the model's working context or retrieval layer rather than being treated as an immediate weight update.

# Base corpus philosophy

The Base stage prioritizes **capability density and conceptual connectivity** rather than raw corpus size.

```text
world knowledge
      +
concept relationships
      +
practical problem spaces
      +
multiple language registers
      +
generalizable reasoning foundations
```

The working principle is:

> **Every token should earn its place.**

For Turkish first-party data, quality control is preserve-first: remove real corruption, duplicates and systematic failures without destroying useful code, markup, slang, narrative or unusual registers.

Third-party external data follows a different philosophy: it must independently prove that it is clean and useful before entering the corpus.

# First-party corpus layout

The current local Base-data convention is deliberately simple:

```text
data/cetin_corpus/
├── main.jsonl
└── wiki.jsonl
```

`main.jsonl` contains the project's high-value first-party corpus and receives highest priority during cross-deduplication.

`wiki.jsonl` contains project-collected Turkish Wiki material. Clean, unique Wiki material is retained rather than discarded simply to satisfy an arbitrary byte or percentage target. Final exposure and sampling decisions are made after measured corpus/token analysis.

# Development sequence

```text
FIRST-PARTY RAW BASE DATA
        ↓
preserve-first QC + dedup + audit
        ↓
qualified Base corpus
        ↓
tokenizer benchmark and freeze
        ↓
small measured training gates
        ↓
full scratch Base training
        ↓
evaluation
        ↓
Instruct
        ↓
Reasoning / Verified Math
        ↓
Chat
        ↓
Safety
        ↓
Research / Tool-use
```

The exact post-training branch/sequential recipe remains an experimental decision and will be selected from evaluation results rather than frozen prematurely.

# Research thesis

> **Base does not need to memorize the whole world; it needs representations strong enough to understand the world, reason over new information, and use tools when knowledge is missing or time-sensitive.**

At approximately one billion parameters, CetinLM is testing whether carefully engineered data, explicit verification, adaptive reasoning and research/tool use can produce a practical assistant while remaining small enough to retrain, profile and audit on accessible hardware.

---

<p align="center">
  <strong>Small core. Dense data. Measured reasoning. Research when needed.</strong>
</p>
