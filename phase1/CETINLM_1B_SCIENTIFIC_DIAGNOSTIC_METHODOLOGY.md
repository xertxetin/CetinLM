# CetinLM-1B — Diagnosing an Undertrained Language Model Beyond Generation Quality

**Project:** CetinLM-1B  
**Tool:** `inspect_predictions_1b.py`  
**Diagnostic:** CetinLM-1B Scientific Diagnostic Benchmark v1  
**Status:** Public engineering / research note

---

## 1. The problem

During early pretraining, CetinLM-1B produced generations that looked obviously weak.

Typical symptoms included:

- repeating the same phrase
- failing simple factual questions
- continuing until `max_new_tokens`
- selecting plausible but incorrect next tokens
- behaving differently when the same fact was phrased in another way
- controlled sampling reducing loops but not fixing factual reliability

A normal reaction would be:

> "The model is broken."

But that conclusion is too strong.

A raw pretrained language model can be learning useful internal probability structure long before its free-form generations become convincing.

The central question became:

> **How can we tell whether the model is genuinely learning, even when its generated text still looks bad?**

A conventional generation benchmark was not enough.

That led to the creation of:

```text
inspect_predictions_1b.py
```

The purpose of this tool is not to make the model look better.

Its purpose is to inspect the model's **next-token probability distribution directly**.

---

## 2. Why generation alone is a poor early-training diagnostic

Autoregressive generation is a chain reaction.

At every step:

```text
prompt
↓
next-token distribution
↓
one token is selected
↓
that token becomes part of the next prompt
↓
another distribution is produced
↓
repeat
```

A slightly wrong early choice can push the entire continuation into a bad trajectory.

For example, consider:

```text
The capital of France is
```

Suppose the model internally assigns:

```text
"the"     12%
"a"        5%
"located"  2%
"Paris"    0.05%
...
```

A greedy decoder selects `"the"`.

The generation may then become nonsense.

But this does not tell us whether `"Paris"` is:

```text
rank 2
rank 20
rank 200
rank 20,000
```

Those situations represent very different learning states.

A generated sentence collapses the entire probability distribution into a single path.

For debugging pretraining, we wanted to inspect the distribution itself.

---

## 3. The diagnostic idea

For a small fixed set of prompts, the tool asks:

1. What are the model's Top-20 next-token predictions?
2. Where does the expected target token rank?
3. What probability does the target receive?
4. Where does `<eos>` rank?
5. What happens under greedy decoding?
6. What happens under controlled sampling?
7. Are failures caused mostly by decoding, or is the learned distribution itself still weak?

This turns a subjective question:

> "Does this generation look intelligent?"

into a more measurable question:

> "How much probability mass is the model assigning to the correct continuation?"

---

## 4. Fixed diagnostic cases

The initial diagnostic uses deliberately simple relationships:

```text
"The capital of France is"   → " Paris"
"Paris is the capital of"    → " France"
"The opposite of hot is"     → " cold"
"Water freezes at"           → " 0"
"2 + 2 ="                    → " 4"
"Türkiye'nin başkenti"       → " Ankara"
"Ankara, Türkiye'nin"        → " başkenti"
```

These cases are not intended to be a serious general intelligence benchmark.

They are probes.

They test whether basic semantic/factual relations are beginning to appear in the model's local next-token distribution.

The prompts also intentionally include related facts with different surface forms.

This matters because:

```text
"The capital of France is" → Paris
```

and:

```text
"Paris is the capital of" → France
```

encode the same underlying relationship from opposite directions.

If one is learned strongly and the other weakly, the model has acquired some signal but has not generalized the relation robustly yet.

---

## 5. Target-token rank

For each prompt, the diagnostic encodes the expected target and looks at its first token.

It then calculates:

```text
target rank =
number of vocabulary tokens with higher probability
+ 1
```

Interpretation used by the diagnostic:

```text
Rank 1–5
    strong learned signal

Rank 6–20
    visible but weaker learned signal

Rank >20
    target is not strongly learned yet
```

This ranking is much more informative than a binary correct/incorrect result.

Imagine two models:

```text
Model A:
correct token rank = 2

Model B:
correct token rank = 12,000
```

Greedy decoding may fail in both cases.

But Model A is extremely close to producing the correct answer.

Model B is not.

A normal generation benchmark reports both as:

```text
wrong
```

The diagnostic exposes the difference.

---

## 6. Top-20 probability inspection

The tool prints the 20 most likely next tokens together with:

```text
rank
token id
probability
decoded token
raw tokenizer representation
```

Example conceptual output:

```text
 1. p=0.48  " the"
 2. p=0.02  " France"   <-- TARGET
 3. p=...
```

This lets us inspect the shape of the model's uncertainty.

Questions we can answer include:

- Is the correct answer already near the top?
- Is one generic token dominating the distribution?
- Are several semantically plausible tokens competing?
- Is the target completely absent?
- Is the probability distribution still too flat?

This is especially useful during early pretraining, when knowledge may exist as a weak signal before it becomes the most probable continuation.

---

## 7. The first important result

At an early CetinLM-1B checkpoint around step 33,500, the diagnostic produced the following summary:

```text
Target Top-1 : 0 / 7
Target Top-5 : 2 / 7
Target Top-20: 6 / 7
```

If we looked only at free-form generation, the model appeared much worse than this.

But the distribution-level diagnostic revealed that **six of seven expected targets were already present in the Top-20 next-token candidates**.

That was an important distinction:

> The model was not simply emitting random noise.

It had already learned a number of real semantic associations, but those associations were often not yet dominant enough to win the next-token competition.

---

## 8. Examples from the diagnostic

### Paris relation

Prompt:

```text
Paris is the capital of
```

Expected:

```text
France
```

Observed:

```text
Target rank: 2
Target probability: ~0.022
Top prediction: " the"
```

This is a strong signal.

The model knew the relation well enough to place `France` at rank 2, but another generic continuation still had much higher probability.

A normal greedy generation reports a failure.

The diagnostic says:

> The relation is largely present, but the probability distribution is not sharp enough.

---

### France capital

Prompt:

```text
The capital of France is
```

Expected:

```text
Paris
```

Observed:

```text
Target rank: ~211
Target probability: ~0.0005
```

This is much weaker.

The interesting part is the contrast with:

```text
Paris is the capital of → France
```

The reverse relation was rank 2, while this phrasing put `Paris` much lower.

This showed that the model had not yet learned a stable, phrasing-independent representation of the fact.

That is much more useful information than simply saying:

```text
capital question: wrong
```

---

### Simple arithmetic

Prompt:

```text
2 + 2 =
```

Expected:

```text
4
```

Observed:

```text
Target rank: 5
Target probability: ~0.036
```

The model still generated unreliable arithmetic, but `4` was already one of its five strongest next-token candidates.

Again:

```text
generation quality != absence of learned signal
```

---

### Türkiye'nin başkenti

Prompt:

```text
Türkiye'nin başkenti
```

Expected:

```text
Ankara
```

Observed:

```text
Target rank: 6
Target probability: ~0.014
```

The top prediction was:

```text
İstanbul
```

This was a useful diagnostic result.

The correct answer was not missing.

It was already close to the top, but the model still assigned slightly more probability to a strongly associated but incorrect city.

That suggests continued training can potentially sharpen the distinction.

---

### Opposite of hot

Prompt:

```text
The opposite of hot is
```

Expected:

```text
cold
```

Observed:

```text
Target rank: 13
```

The semantic relation was visible, but weak.

This fits the same overall picture:

```text
real signal
+
undertrained distribution
```

rather than:

```text
completely broken model
```

---

## 9. EOS became a separate diagnostic

Another recurring symptom was that generated text almost always stopped because of:

```text
max_new_tokens
```

instead of naturally selecting:

```text
<eos>
```

So the diagnostic also measures:

```text
EOS rank
EOS probability
```

Observed EOS ranks were often very low in priority, roughly in the hundreds to over a thousand depending on the prompt.

Examples included ranks approximately in the range:

```text
240 → 1017
```

This created a new engineering question:

> Is the model merely undertrained, or are document boundaries / EOS tokens underrepresented or mishandled in the data pipeline?

That question would have been easy to miss if we only inspected generated text.

The diagnostic turned a vague symptom:

```text
"the model never stops"
```

into a concrete measurable signal:

```text
EOS consistently has very low probability
```

This suggests future checks such as:

- verify `<eos>` insertion between documents
- measure EOS frequency in tokenized shards
- inspect whether sequence chunking drops document boundaries
- measure percentage of training sequences containing EOS
- check whether concatenation creates unrealistic cross-document transitions

---

## 10. Greedy vs controlled decoding

The diagnostic does not only inspect ranks.

It also performs two short generation runs.

### Greedy

```text
temperature = 0
top_p = 1
top_k = disabled
repetition penalty = 1.0
```

This is intentionally harsh.

The highest-probability token always wins.

It is useful for historical comparability and for exposing whether the distribution itself is sharply correct.

### Controlled sampling

The initial controlled configuration uses approximately:

```text
temperature = 0.7
top_p = 0.9
top_k = 50
repetition penalty = 1.12
```

The purpose is not to hide model weakness.

It is an A/B diagnostic.

We ask:

> Does a more reasonable decoder dramatically improve the result?

---

## 11. What the decoding A/B test taught us

Controlled decoding reduced some exact repetition loops.

That confirmed that greedy decoding was amplifying certain degeneracies.

However, controlled sampling **did not suddenly turn the model into a reliable factual/chat model**.

That distinction was extremely valuable.

If controlled decoding had transformed the outputs completely, the main bottleneck would have been inference policy.

Instead, the result was closer to:

```text
controlled decoding:
    less repetitive
    somewhat more diverse
    still unreliable
```

Combined with target ranks, this suggested:

> Decoding is part of the visible problem, but the main limitation is still the learned probability distribution itself.

In other words:

```text
do not use decoding tricks to hide undertraining
```

---

## 12. Why we kept the original benchmark

CetinLM also has a simpler generation/cloze benchmark.

We deliberately did **not** replace it with this diagnostic.

The two tools answer different questions.

### Historical benchmark

Useful for:

```text
checkpoint-to-checkpoint comparability
generation behavior
simple accuracy trends
```

It should remain stable over time.

Changing its decoding settings would destroy historical comparability.

### Scientific diagnostic

Useful for:

```text
probability-distribution inspection
target rank tracking
EOS investigation
decoding A/B experiments
failure analysis
```

The diagnostic can evolve independently.

This separation prevents us from changing a benchmark every time the model exposes a new problem.

---

## 13. Why this matters for small / early-stage LMs

Early language models often live in an awkward region:

```text
loss is improving
PPL is improving
some semantic structure exists
but generations still look terrible
```

It is very easy to make one of two mistakes.

### Mistake 1 — declare the model broken too early

A bad generation can hide useful probability structure.

If the correct target is rank 2 or rank 6, the model is in a very different state from one where the target is rank 40,000.

### Mistake 2 — overinterpret weak signals

The opposite mistake is also possible.

Seeing the correct answer in the Top-20 does **not** mean the model is already good.

Rank 13 is still rank 13.

If the model cannot consistently put the correct continuation near rank 1 across different phrasings, it is not yet reliable.

The diagnostic helps us stay between these two extremes.

---

## 14. The key mental model

We started treating training as a probability-ranking process rather than only a text-generation process.

For a known continuation:

```text
training progress
≈
correct target moving upward in the distribution
```

Conceptually:

```text
Checkpoint A:
Ankara rank 400

Checkpoint B:
Ankara rank 80

Checkpoint C:
Ankara rank 20

Checkpoint D:
Ankara rank 6

Checkpoint E:
Ankara rank 2

Checkpoint F:
Ankara rank 1
```

Generation may remain ugly for much of that journey.

But target-rank movement can reveal that learning is progressing.

---

## 15. Planned longitudinal use

The diagnostic is most useful when the **same prompts are repeated at multiple checkpoints**.

For CetinLM-1B, useful milestones include:

```text
50K
75K
100K
122K / initial 1B-token completion
```

Instead of asking only:

```text
"Does it talk better now?"
```

we can track:

```text
Paris       #211 → ?
France        #2 → ?
cold         #13 → ?
0            #17 → ?
4             #5 → ?
Ankara        #6 → ?
başkenti     ~#10 → ?
EOS         #240–1000+ → ?
```

This gives us a miniature learning curve for individual semantic relations.

---

## 16. What would count as real improvement?

For a future checkpoint, evidence of improvement would include:

### Target ranks moving upward

Example:

```text
Paris:
211 → 80 → 20 → 5
```

### Target probabilities increasing

Example:

```text
Ankara:
0.014 → 0.03 → 0.08
```

### Better consistency across paraphrases

Example:

```text
Paris is the capital of → France
The capital of France is → Paris
France's capital is → Paris
```

All should eventually become strong.

### EOS becoming plausible

EOS should not remain buried hundreds or thousands of ranks below normal tokens forever.

### Greedy and controlled outputs converging

A mature distribution should rely less on decoding tricks.

If greedy output and controlled output both become sensible, the underlying model has become stronger.

---

## 17. What would count as a warning sign?

The diagnostic can also expose real failures.

Potential warning patterns:

### Validation improves but target ranks do not

Could indicate that the model is mostly getting better at frequent local statistics rather than the tested semantic relationships.

### Target ranks improve only for one exact wording

Could indicate memorization or weak generalization.

### Controlled decoding improves dramatically but greedy stays pathological

Could indicate an overly flat / poorly calibrated distribution.

### EOS remains extremely weak

Could justify investigating document-boundary preprocessing.

### Repetition remains severe while ranks remain poor

This points more strongly toward:

```text
more pretraining
better data
deduplication
better document boundaries
```

rather than inference tricks.

---

## 18. Tokenizer debug output caveat

Raw tokenizer token strings may sometimes look corrupted when printed directly.

For example, byte-level or encoding-oriented internal representations can appear visually strange.

That does not automatically mean the tokenizer itself is broken.

The important distinction is:

```text
raw token representation
vs
decoded final text
```

If final decoding correctly reconstructs Turkish characters, strange internal token strings should not immediately be interpreted as tokenizer corruption.

This was another reason the diagnostic prints both:

```text
decoded token
raw token representation
```

---

## 19. What `inspect_predictions_1b.py` actually measures

For every test case, the tool records:

```text
prompt
target text
target token ids
target first-token probability
target first-token rank
whether target is in Top-20
Top-20 candidate tokens
candidate probabilities
EOS rank
EOS probability
greedy generation
controlled generation
stop reason
```

It then reports aggregate counts:

```text
Target Top-1
Target Top-5
Target Top-20
```

The results are also saved as JSON so they can be compared programmatically across checkpoints.

Example naming pattern:

```text
evaluation_1b/
    scientific_diagnostic_step_00033500.json
    scientific_diagnostic_latest.json
```

This makes the diagnostic useful both interactively and as a future regression dataset.

---

## 20. Design principle: diagnostics should explain failure

A benchmark that returns:

```text
score = 3 / 10
```

is useful.

But when training something from scratch, it is often not enough.

We also want to know:

```text
Why was it wrong?
How wrong was it?
Was the correct answer close?
Was decoding responsible?
Was EOS unlikely?
Did a paraphrase change the relationship completely?
```

The purpose of this diagnostic is therefore not simply scoring.

It is **failure decomposition**.

---

## 21. What we learned about CetinLM-1B

At the tested early checkpoint, the evidence supported the following interpretation:

### The model was learning

Reasons:

- validation loss had been decreasing
- perplexity had been decreasing
- 6/7 expected targets appeared in Top-20
- several correct answers were already near the top
- related semantic continuations appeared in the distribution

### The model was still substantially undertrained

Reasons:

- Target Top-1 was 0/7
- the same relation could be strong in one phrasing and weak in another
- free-form generation remained repetitive
- controlled decoding did not fix factual reliability
- EOS probabilities were weak
- simple factual/math continuations were often not rank 1

Therefore the most defensible conclusion was neither:

```text
"The model is broken."
```

nor:

```text
"The model is already good; decoding is the only issue."
```

It was:

> **The model contains real learned semantic signal, but the probability distribution is still immature and insufficiently sharp. More pretraining and data-quality work remain the primary path forward.**

---

## 22. Why this diagnostic is useful beyond CetinLM

The same approach can be applied to almost any language model trained from scratch.

Instead of relying only on generated samples:

1. choose a fixed set of simple expected continuations
2. inspect full next-token probabilities
3. record target ranks
4. monitor those ranks over checkpoints
5. compare greedy and sampled decoding
6. inspect EOS behavior
7. keep a stable benchmark separate from experimental diagnostics

This is especially useful for:

- small language models
- early checkpoints
- low-resource training
- custom architectures
- tokenizer debugging
- continual pretraining experiments
- diagnosing repetition
- determining whether training or decoding is the main bottleneck

---

## 23. Current workflow

The CetinLM evaluation workflow now conceptually looks like:

```text
TRAIN
↓
validation loss / perplexity
↓
stable benchmark
↓
scientific next-token diagnostic
↓
target-rank comparison
↓
generation A/B
↓
data / training / decoding decision
```

Different tools answer different questions.

That is much stronger than judging the entire model from a handful of chat prompts.

---

## 24. Future improvements to the diagnostic

Possible future extensions include:

### Multi-token target scoring

The current version primarily tracks the **first target token**.

A future version can calculate:

```text
log P(target sequence | prompt)
```

for the complete target.

This would make multi-token answers easier to compare.

### Paraphrase groups

Instead of isolated prompts:

```text
fact: France → Paris

templates:
- The capital of France is
- France's capital is
- What city is the capital of France?
- Paris is the capital of
```

We could measure relation consistency across forms.

### Rank history

Automatically compare:

```text
step 33,500
step 50,000
step 75,000
step 100,000
```

and generate a rank progression table.

### EOS dataset audit integration

If EOS remains consistently weak, the evaluation tool could be paired with a data-pipeline audit that measures EOS frequency and document-boundary statistics.

### Larger diagnostic suite

The current seven prompts are probes, not a benchmark of general capability.

Future categories could include:

```text
factual relations
basic arithmetic
semantic opposites
syntax
Turkish morphology
English grammar
simple reasoning
code tokens
EOS / stopping behavior
```

The important rule would remain:

> Keep a fixed core set so historical comparisons remain meaningful.

---

## 25. Main engineering lesson

The most important lesson from building `inspect_predictions_1b.py` was this:

> **A language model can look much worse in generation than it looks inside its probability distribution.**

But the reverse warning is equally important:

> **A correct token appearing somewhere in Top-20 is evidence of learning, not evidence of reliability.**

The useful information lies in the trajectory:

```text
probability
rank
consistency
EOS behavior
generation behavior
validation trend
```

taken together.

That gives us a much more scientific way to answer:

```text
Is the model learning?
Is it merely undertrained?
Is decoding amplifying the problem?
Is there a data-boundary issue?
Is a fact present but weak?
```

That was the reason this diagnostic was built.

---

## 26. Reproducibility note

The diagnostic intentionally fixes the controlled-sampling seed before each controlled generation.

This makes comparisons between checkpoints more interpretable.

The script also loads the project's actual tokenizer and the same CetinLM-1B architecture used by training.

The goal is to minimize hidden differences between:

```text
training model
diagnostic model
runtime model
```

---

## 27. Final takeaway

A weak early checkpoint should not be evaluated with a single question:

```text
"Does it chat well?"
```

A more useful set of questions is:

```text
Is validation improving?

Where is the correct token ranked?

How much probability does it receive?

Does the same relation survive paraphrasing?

Is EOS being learned?

Does better decoding help?

Do target ranks improve checkpoint by checkpoint?
```

For CetinLM-1B, that shift turned an ambiguous observation—

```text
"The output repeats and looks bad."
```

—into a measurable diagnosis:

```text
The model is learning real relations,
but many correct continuations are not yet dominant.
The model remains undertrained,
and decoding only explains part of the visible failure.
```

That is a much better foundation for deciding what to optimize next.
