# CetinLM-1B Mid-Run Evaluation: 573M Tokens, Diagnostics, EOS Audit, and Training Decision

**Date:** 2026-08-30  
**Project:** CetinLM  
**Model:** CetinLM-1B Base  
**Parameters:** 1,048,780,544  
**Training milestone:** Step 70,000 / 573,440,000 tokens  
**Hardware:** Single NVIDIA RTX 4070 Ti SUPER 16 GB

---

## 1. Why This Checkpoint Was Evaluated

CetinLM-1B is currently in raw base pretraining.

At step 70,000, the run crossed 573M processed tokens and produced a new validation best. Rather than changing the training configuration based only on generation samples, we paused the run and evaluated the checkpoint from several angles:

1. validation loss and perplexity,
2. fixed next-token scientific diagnostics,
3. the existing Base Benchmark v4,
4. generation degeneration behavior,
5. EOS/document-boundary integrity in the binary training shards.

The goal was simple:

> Determine whether the model is learning normally, whether the observed repetition/EOS behavior points to a training bug, and whether the current run should be changed or continued.

---

## 2. Training State at Step 70K

At step 70,000:

| Metric | Value |
|---|---:|
| Processed tokens | 573,440,000 |
| Training target progress | 57.34% |
| Validation loss | **3.650751** |
| Perplexity | **38.504** |
| Learning rate | ~9.14e-5 |
| Throughput | ~5,600 tok/s |
| Parameters | 1.049B |

Recent validation progression:

| Step | Tokens | Val Loss | PPL |
|---:|---:|---:|---:|
| 63K | 516.1M | 3.693981 | 40.205 |
| 67K | 548.9M | 3.677402 | 39.544 |
| 69K | 565.2M | 3.667538 | 39.155 |
| 70K | 573.4M | **3.650751** | **38.504** |

The important observation is that the model did not merely fluctuate around a plateau. It continued to establish new validation lows.

The current run therefore shows no evidence of training collapse or stalled learning.

---

## 3. Scientific Diagnostic: Internal Distribution Is Becoming Sharper

A fixed next-token diagnostic set is used to measure whether expected semantic targets move upward in the model's probability distribution over training.

The same prompts were previously evaluated around step 33.5K.

### Target-rank comparison

| Probe | Earlier Rank | Step 70K Rank | Result |
|---|---:|---:|---|
| `The capital of France is` → `Paris` | ~211 | **2** | Major improvement |
| `Paris is the capital of` → `France` | 2 | **2** | Strong and stable |
| `The opposite of hot is` → `cold` | 13 | **3** | Major improvement |
| `Water freezes at` → `0` | 17 | **13** | Improvement |
| `2 + 2 =` → `4` | 5 | **4** | Small improvement |
| `Türkiye'nin başkenti` → `Ankara` | 6 | **1** | Major improvement |
| `Ankara, Türkiye'nin` → `başkenti` | ~10 | **36** | Regression on this phrasing |

Aggregate score:

| Metric | Earlier | Step 70K |
|---|---:|---:|
| Target Top-1 | 0/7 | **1/7** |
| Target Top-5 | 2/7 | **5/7** |
| Target Top-20 | 6/7 | **6/7** |

This is one of the clearest signs of progress observed so far.

The model already had weak semantic signal for many targets earlier in training. By step 70K, several targets had moved from weak visibility into the top few model choices.

The most dramatic example:

```text
The capital of France is
```

The target `Paris` moved from roughly rank **211** to rank **2**.

Likewise:

```text
Türkiye'nin başkenti
```

now assigns `Ankara` rank **1**.

This is stronger evidence of learning than generation quality alone because it directly examines the model's next-token probability distribution.

---

## 4. Base Benchmark v4

The existing Base Benchmark v4 was also run on the step-70K best checkpoint.

Results:

| Metric | Step 70K |
|---|---:|
| Validation loss | 3.651050 |
| Perplexity | 38.515 |
| English cloze | 1/10 |
| Turkish cloze | 3/10 |

Compared with the previous recorded benchmark:

```text
Val Loss Δ : -0.264498
PPL Δ      : -11.661
```

The cloze scores remain noisy and small because the benchmark contains only ten items per language and uses exact-match style scoring.

This creates an important distinction:

> The model's probability distribution can improve substantially even when a tiny exact-match cloze score does not move monotonically.

The scientific diagnostic currently gives a more informative view of internal semantic progress.

---

## 5. Generation Quality: Better Knowledge, Still a Raw Base Model

Generation samples show a mixed but expected picture.

Example:

```text
Prompt:
The capital of France is

Greedy:
The capital of France is the city of Paris.
The city of Paris is the city of Paris...
```

The model now retrieves the correct fact, but greedy decoding still amplifies repetitive continuation patterns.

Other examples include:

```text
Python is a program that is used to create a program...
```

and:

```text
Bir dil modeli, bir dil modeli, bir dil modeli...
```

The Turkish prompt:

```text
Yapay zeka nedir?
```

can also be repeated rather than answered.

These behaviors are not currently treated as evidence of a broken training run.

CetinLM-1B at this stage is a raw next-token base model. It has not yet received instruction tuning, chat SFT, preference optimization, or reasoning-oriented post-training.

A base model does not inherently interpret:

```text
Yapay zeka nedir?
```

as:

> "The user asked a question, therefore I should answer it."

It predicts likely continuations of the token stream it was trained on.

Greedy decoding also has a known tendency to amplify repetition once the model enters a locally high-probability loop.

The current evidence therefore suggests:

- semantic knowledge is improving,
- sequence-level generation is still undertrained,
- repetition remains visible,
- instruction-following behavior should not yet be expected.

---

## 6. EOS Concern: Audit Before Changing the Run

One concern raised by generation behavior was whether the model had learned document endings correctly.

The training dataset consists of pre-tokenized `.bin` shards. During training, the dataset loader slices the token stream into fixed 256-token sequences.

The trainer itself does **not** inject EOS tokens at document boundaries.

Therefore, EOS behavior depends on the data-preparation pipeline having written correct boundary tokens into the shards.

To verify this rather than speculate, an EOS/boundary audit was run over the entire 1B-token training corpus and the validation set.

---

## 7. EOS Boundary Audit Results

Tokenizer special IDs:

```text
<pad> = 0
<unk> = 1
<bos> = 2
<eos> = 3
```

Full training corpus:

```text
Total tokens : 1,000,000,000
Total EOS    : 1,884,722
EOS / 1M    : 1884.72
Tokens / EOS: 530.6
```

Validation set:

```text
Val tokens  : 10,000,000
Val EOS     : 18,952
Val EOS /1M : 1895.20
```

The training and validation EOS rates are very close:

```text
Train: 1884.72 EOS / 1M tokens
Val:   1895.20 EOS / 1M tokens
```

This strongly argues against an EOS-missing or validation-distribution bug.

### Boundary samples

Actual decoded boundary windows showed structures such as:

```text
... pursuit of happiness.<eos><eos><bos>Taking Play Seriously...
```

and:

```text
... children play less.<eos><eos><bos>How do you get HIV?...
```

This confirms that EOS tokens occur at real document boundaries.

---

## 8. One Data-Preparation Issue Was Found: Double EOS

The audit revealed a consistent-looking boundary pattern:

```text
<eos><eos><bos>
```

The preferred representation for the next corpus build is:

```text
<eos><bos>
```

This means the current dataset appears to contain a redundant second EOS at many document boundaries.

### Severity assessment

This is considered a **technical debt item, not a critical training failure**.

Reasons:

- EOS is present at the correct semantic boundary.
- Train and validation EOS statistics are well aligned.
- Validation loss continues improving.
- Scientific target ranks show substantial semantic progress.
- The redundant EOS tokens are a very small fraction of the full corpus.
- Changing the tokenized corpus halfway through the current run would introduce a new data distribution mid-experiment.

The current 1B-token v0 run will therefore remain unchanged.

The double-EOS source will be fixed in the next corpus-builder version.

Future dataset builds should also enforce automated boundary invariants so this class of issue fails during data generation rather than being discovered later.

Planned checks include:

```text
double-EOS count
EOS/BOS boundary correctness
special-token frequency
document count
tokens per document
broken/missing document boundaries
```

---

## 9. EOS Diagnostic Methodology Also Needs Improvement

A separate finding is that simply inspecting the EOS rank immediately after an unfinished prompt is not a valid measure of whether a model knows when to stop.

For example:

```text
The capital of France is
```

should not necessarily assign high probability to EOS, because the sentence itself is incomplete.

A more meaningful future diagnostic is:

```text
The capital of France is Paris.
                                ^
                       evaluate EOS here
```

Even better, EOS behavior should be evaluated teacher-forced on real document-ending positions from held-out data.

Therefore, low EOS ranks from incomplete diagnostic prompts should not be interpreted as proof that the model has failed to learn stopping behavior.

---

## 10. What We Did Not Change

Despite finding areas for improvement, no architecture or optimizer changes were made.

The stable training configuration remains the baseline.

No attempt was made to "fix" generation by:

- changing learning rate,
- changing optimizer,
- changing attention backend,
- adding repetition penalties to training,
- modifying checkpoints,
- rewriting the current token shards,
- introducing instruction data halfway through base pretraining.

The reasoning is simple:

> Do not change a healthy training run to solve behavior that belongs to a later training stage or to a future data-builder revision.

---

## 11. Decision

The step-70K checkpoint passed the mid-run health check.

### Evidence supporting continuation

- validation reached a new best,
- perplexity continued to fall,
- throughput remained stable,
- target-token semantic ranks improved substantially,
- no NaN/Inf or collapse behavior was observed,
- EOS tokens are present in the corpus,
- EOS boundaries correspond to real document boundaries,
- validation and training EOS frequency are closely aligned.

### Current decision

**Continue the existing 1B-token run unchanged.**

The next major intervention point remains the completion of the 1B-token v0 milestone.

---

## 12. Post-1B Training Plan

The next continued-pretraining stage will not simply increase every training sequence to 4096 tokens.

The planned trainer will use document-length-aware training.

Conceptually:

```text
short documents   -> 256 / 512
medium documents  -> 1024 / 2048
long documents    -> 4096
```

with:

- length bucketing,
- EOS-aware sequence packing,
- token-budgeted batches,
- dynamic micro-batch sizing,
- minimal padding,
- guaranteed exposure to long-context examples.

Example:

```text
180-token document  -> 256 bucket
430-token document  -> 512 bucket
900-token document  -> 1024 bucket
1700-token document -> 2048 bucket
3500-token document -> 4096 bucket
```

Short documents should not pay the compute cost of a 4096-token attention window when they do not need it.

The goal is to let the model learn long context while spending compute approximately where the data actually requires it.

---

## 13. Continued-Pretraining Milestones

Rather than treating 5B total training tokens as one opaque run, continued pretraining will be evaluated in controlled 1B-token milestones.

Planned structure:

```text
1B total -> freeze + benchmark
2B total -> freeze + benchmark
3B total -> freeze + benchmark
4B total -> freeze + benchmark
5B total -> comprehensive evaluation
```

This allows data mix, context distribution, and training behavior to be inspected before committing another billion tokens.

The model does not restart at each milestone.

The same model continues training, while milestones act as controlled evaluation gates.

---

## 14. Main Lesson From This Session

Several visible generation problems initially looked like they might justify intervention.

Instead of changing the run immediately, each hypothesis was separated and tested.

The result:

- repetition is still present,
- instruction behavior is not yet learned,
- one phrasing probe regressed,
- EOS boundary data is fundamentally intact,
- a redundant double-EOS issue was identified for the next corpus build,
- the actual model distribution is improving strongly,
- validation continues to improve.

The engineering lesson is:

> A strange generation sample is a reason to investigate, not automatically a reason to change training.

For CetinLM-1B, the evidence at 573M tokens supports continuing the current experiment.

---

## Current Status

```text
CetinLM-1B Base
1.0488B parameters
573.44M processed tokens
Step 70,000
Val loss: 3.650751
PPL: 38.504
Single RTX 4070 Ti SUPER
Status: training continues
```

The run remains unchanged.

Measure first. Change only when the evidence supports it.
