<p align="center">
  <img src="https://raw.githubusercontent.com/xertxetin/CetinLM/refs/heads/main/docs/cetinlm-logo-lq.png" alt="CetinLM Logo" width="230px">
</p>

<h1 align="center">CetinLM — The Model Factory</h1>

<p align="center">
  <strong>We are not only building a language model.</strong><br>
  We are building the machinery required to build language models.
</p>

---

## The checkpoint is an output

A model checkpoint is easy to point at because it is a single file.

The research system that produced it is harder to see.

CetinLM treats that invisible system as the real engineering object:

```text
CORPUS DESIGN
    ↓
DATA QUALIFICATION
    ↓
TOKENIZER
    ↓
PACKING / BOUNDARIES
    ↓
TRAINING RUNTIME
    ↓
FAIL-CLOSED GUARDS
    ↓
CHECKPOINT / RECOVERY
    ↓
VALIDATION / DIAGNOSTICS
    ↓
POST-TRAINING
    ↓
TOOLS / MEMORY / SERVING
```

> **The checkpoint is an output. The system that produces it is the research.**

---

## Why build the whole stack?

Using an existing pretrained model is the right choice for many products.

CetinLM asks a different question:

> What do we learn when we control and measure the entire path from source text to trained model behavior?

That means the project has to understand more than a `train.py` loop.

It has to understand:

- what entered the corpus and why;
- how the tokenizer represents it;
- how documents become training samples;
- what assumptions the attention path makes;
- where memory is actually spent;
- what a checkpoint must preserve to resume correctly;
- which metric answers which question;
- which optimization really wins end-to-end;
- how later post-training changes behavior without erasing earlier capability.

This is slower than treating every subsystem as a black box.

It also produces a different kind of knowledge.

---

## Constraint as a microscope

Base-v1 is trained on a single 16GB consumer GPU.

That is not a claim that datacenters are unnecessary. Large-scale research still requires large-scale compute.

The constraint is useful because it makes waste visible.

```text
limited VRAM
   → memory residency becomes obvious
limited throughput
   → data movement becomes expensive
long training horizon
   → checkpoint reliability matters
one machine
   → every bad engineering decision is harder to hide
```

At larger scale, waste can sometimes be masked by buying more hardware.

At small scale, the system has to explain itself.

---

## Negative results are part of the product

CetinLM does not treat every experiment as a feature request that must eventually ship.

A candidate optimization can be mathematically elegant, faster in isolation, or fashionable—and still lose in the real system.

The project deliberately keeps those losses.

```text
IDEA
 ↓
CONTROLLED TEST
 ↓
REAL TRAJECTORY
 ↓
WIN? ── yes ──→ qualify / retain
  │
  no
  ↓
archive the evidence
```

A rejected experiment is not wasted work if it removes uncertainty.

---

## One model, staged learning

Base pretraining is only the first major stage.

The current direction is to accumulate capabilities through staged post-training while preserving one unified model lineage:

```text
BASE
 ↓
INSTRUCTION
 ↓
CHAT + SOCIAL
 ↓
REASONING + MATH
 ↓
CODE
 ↓
TRUTHFULNESS + SAFETY + PREFERENCE
 ↓
TOOLS + SEARCH + MEMORY
 ↓
UNIFIED CONSOLIDATION / REPLAY
 ↓
ONE CETINLM
```

The stages are separated so regressions are attributable—not because the end goal is a pile of unrelated specialist models.

Each stage should prove that it can add capability without casually destroying what came before.

---

## Measurement is part of architecture

CetinLM separates measurements that are often collapsed into one vague idea of “model quality.”

```text
Does held-out prediction improve?
            ≠
Does raw greedy generation look clean?
            ≠
Can it follow instructions?
            ≠
Can it reason reliably?
            ≠
Can it behave safely and truthfully?
```

Those are related questions, not identical ones.

A useful model factory therefore needs more than one benchmark and more than one screenshot.

---

## Recoverability is a capability of the training system

Long training runs fail in the real world.

Drivers fail. Processes crash. Machines restart. Storage stalls. Numerical anomalies appear.

CetinLM treats recovery as part of model engineering rather than an afterthought.

The objective is not to make failures invisible. The objective is to make them **observable, bounded and recoverable without silently corrupting the experiment**.

That is why the project prefers fail-closed behavior over “just keep going” when critical invariants break.

---

## Public research, private blueprint

CetinLM publishes enough to make its engineering direction and measured outcomes understandable:

- broad model scale;
- corpus scale;
- training milestones;
- hardware class;
- validation trends;
- experiment outcomes;
- provenance boundaries;
- high-level architecture of the research system.

The reproduction-critical blueprint remains private during active research.

That boundary is deliberate. Openness should make the work accountable without requiring every active research advantage to be published as a copy-paste recipe.

---

## The larger thesis

CetinLM is not based on the claim that compute does not matter.

It is based on a simpler claim:

> **Compute and engineering multiply each other.**

Better hardware cannot make bad data good.

More tokens cannot repair a broken measurement system.

A larger cluster cannot tell you whether an optimization actually helped if the experiment was poorly controlled.

Scale matters.

So does knowing what you are scaling.

---

<p align="center">
  <strong>We are not only building a language model. We are building the machinery required to build language models.</strong>
</p>

<p align="center">
  <a href="./README.md">← Public Research Log</a> ·
  <a href="./TECHNICAL_OVERVIEW.md">Technical Overview →</a>
</p>
