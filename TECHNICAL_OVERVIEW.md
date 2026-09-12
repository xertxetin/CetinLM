# CetinLM — Technical Overview

CetinLM is more than a single model checkpoint.

It is an independent language-model development stack built to create, train, measure, recover, and inspect models from scratch.

The current Base-v1 generation is a ~1.18B-parameter decoder-only language model built around a custom tokenizer, curated training data, a dedicated training engine, structured validation, persistent telemetry, checkpoint recovery, and generation diagnostics.

This page describes the public engineering surface of the project.

The exact reproduction blueprint remains private.

---

## Current Base-v1 status

Base-v1 is in active pretraining and has passed **1.2B processed tokens**. Recent public milestones show continuing held-out improvement while production throughput remains in the broad **~4.4–4.5K tok/s** range on the target single-16GB-GPU system.

These are training-system observations, not final assistant-quality claims.

---

## Model

CetinLM Base-v1 is a decoder-only language model trained from scratch.

Public characteristics:

- ~1.18B parameters
- 48K custom tokenizer
- 2K base-training context
- no pretrained foundation model underneath
- built as part of the CetinLM model-development stack

The architecture is developed as part of the CetinLM project, while reproduction-critical geometry and implementation details are intentionally not published.

---

## Data System

The Base-v1 training corpus contains approximately **11.39B unique frozen training tokens**.

The data system combines:

- first-party data
- qualified third-party natural-language datasets
- deterministic validation data
- provenance tracking
- controlled dataset freezing
- indexed training documents

The public project documents data provenance and high-level source families.

Exact mixture ratios, source weights, filtering thresholds, packing details, and reconstruction information remain private.

---

## Tokenizer

CetinLM uses its own **48K tokenizer** built for the current model generation.

Tokenizer development is part of the same model-building pipeline rather than an external preprocessing step disconnected from training.

The tokenizer, corpus, model, and evaluation system are treated as parts of one connected system.

---

## Training Engine

CetinLM uses a dedicated PyTorch-based training stack designed around constrained hardware.

The engine includes:

- mixed-precision training
- memory-aware optimization
- gradient accumulation
- gradient clipping
- activation checkpointing
- checkpoint recovery
- deterministic training-state restoration
- model-health monitoring
- structured telemetry

The goal is not simply to make a model fit into memory.

The system is designed to remain measurable, recoverable, and stable while training under real hardware constraints.

---

## Memory Engineering

Base-v1 has been engineered to train on a single **NVIDIA RTX 4070 Ti SUPER with 16GB VRAM**.

A major part of CetinLM engineering has focused on reducing unnecessary GPU residency and understanding where memory is actually required during each stage of training.

Under normal production conditions, the system sustains roughly **4.4–4.5K tokens per second** on this single consumer GPU.

The exact memory-management implementation remains private.

---

## Document-Aware Training

Training documents are packed efficiently while preserving document boundaries.

The system prevents unrelated packed documents from incorrectly sharing contextual information during training.

This behavior is qualified before production training is allowed to proceed.

---

## Checkpointing and Recovery

CetinLM maintains separate checkpoint roles for:

- latest recoverable training state
- best validated model state

A valid training resume restores the state required to continue the run rather than simply reloading model weights.

The recovery path is designed so an interruption does not automatically turn into a lost training run.

---

## Telemetry

Training produces persistent structured telemetry.

Tracked signals include:

- training loss
- moving-average loss
- learning-rate state
- gradient behavior
- throughput
- processed tokens
- CUDA memory behavior
- validation results
- checkpoint events
- model-generation health

The principle is simple:

**If the system changes, the project should be able to show what changed.**

---

## Deterministic Validation

Base-v1 is evaluated at regular token milestones using a fixed validation process.

Validation is measured globally and across multiple data families.

The project does not treat a single training-loss number as sufficient evidence of model health.

---

## Boundary Health

CetinLM explicitly measures how the model handles document boundaries.

This includes signals such as:

- EOS probability at real document endings
- EOS ranking
- top-k boundary behavior
- post-EOS transition behavior

This is kept separate from free-generation stopping behavior because the two measurements answer different questions.

---

## Generation Health

Raw model generation is tested independently from validation loss.

The public diagnostic system tracks high-level behaviors including:

- repetition loops
- EOS stopping
- maximum-length termination
- generation length
- degeneration trends across checkpoints

These measurements are diagnostic rather than standalone capability scores.

They make it possible to distinguish between a model that is merely improving numerically and one whose generation behavior is also changing over time.

---

## Checkpoint Laboratory

CetinLM includes a dedicated checkpoint-analysis environment for inspecting raw pretrained models.

The laboratory can examine areas such as:

- repetition behavior
- loop onset
- token diversity
- EOS behavior
- probability distributions
- expected-token ranking
- fixed Turkish and English probes
- checkpoint-to-checkpoint behavioral changes

The goal is to inspect what a checkpoint actually knows and how its behavior changes during training rather than relying only on a few generated samples.

---

## Raw Model Interaction

Base checkpoints can also be queried manually.

This is intentionally treated as **raw base-model completion**, not as chat or instruction following.

Base pretraining and later post-training behavior are treated as separate stages of model development. The current post-training direction is staged capability acquisition followed by consolidation into **one unified CetinLM lineage**, rather than treating each stage as an unrelated final product.

---

## Fail-Closed Qualification

Critical training assumptions are qualified before production use.

If an important data, model, attention, packing, boundary, or recovery contract fails, the intended behavior is to stop rather than silently continue.

CetinLM follows a simple rule:

**A broken experiment should fail loudly.**

---

## Profiling and Benchmarking

Performance changes are measured before being accepted.

The project has tested multiple approaches across areas such as:

- runtime execution
- memory behavior
- attention execution
- loss computation
- activation checkpointing
- batch geometry
- optimizer-state handling

Some experiments improved the system.

Others were rejected.

Negative results are retained as engineering knowledge.

**Microbenchmark speed is not production speed.**

---

## Project Memory

CetinLM is also being structured for increasingly agent-assisted development.

The repository maintains:

- explicit project state
- engineering history
- source-of-truth documentation
- development instructions
- experiment outcomes
- patch history
- controlled boundaries for automated work

The long-term idea is to build a **technical memory around the model**.

Future AI systems should be able to understand not only the code, but also why the project reached its current state.

This does not mean autonomous self-improvement exists today.

It means the project is being deliberately prepared for that direction.

---

## Public vs. Private

### Public

- major model characteristics
- research outcomes
- validation methodology
- behavioral trends
- failed experiments
- data provenance
- engineering history
- high-level system design

### Private

- exact architecture recipe
- exact optimization configuration
- precise corpus mixture
- internal qualification thresholds
- implementation-specific memory strategies
- low-level recovery internals
- reproduction-critical training details

**Public by default for outcomes. Private by default for the blueprint.**

---

## What CetinLM Is Becoming

The important result is not one checkpoint or one metric.

It is that the tokenizer, data system, training engine, recovery system, validation stack, telemetry, diagnostics, and project memory are designed to work together as one model-development platform.

CetinLM is no longer just a model being trained.

**It is a system capable of building models.**
