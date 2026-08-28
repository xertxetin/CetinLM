# CetinLM Development Log & Roadmap

> Living development log, engineering memory, roadmap and decision record for CetinLM.

This document records major decisions, milestones, benchmark findings, failures, corrections, ideas and future capabilities so the project never loses its technical memory.

---

## 1. Core project

**Project:** CetinLM  
**Founder:** Mert Çetin  
**Main technology brand:** Me Force Teknoloji

CetinLM is an independent AI research and engineering project focused on capable language models that remain practical and efficient on accessible hardware.

The project does not define success as “largest model possible”.

Core question:

> **How much useful capability can we extract from a compact model through better data, training, reasoning, inference and system design?**

---

## 2. Engineering principles

### Build, do not merely wrap

CetinLM is intended as an end-to-end model project:

```text
Tokenizer
  ↓
Dataset engineering
  ↓
Model architecture
  ↓
Pretraining
  ↓
Evaluation
  ↓
Instruction
  ↓
Conversation
  ↓
Code / Math
  ↓
Reasoning
  ↓
Preference
  ↓
Chat
  ↓
Tools / Web / Memory
```

### Measure, do not guess

Every major checkpoint should be measurable.

Track:

```text
training loss
validation loss
perplexity
gradient norm
learning rate
tokens/sec
checkpoint state
generation behavior
repetition
task benchmarks
```

### Improve, do not blindly restart

A working checkpoint is valuable.

Future improvements should use continued training/adaptation when technically appropriate instead of repeatedly deleting working progress.

---

## 3. Current 1B foundation model

**Model:** CetinLM-1B  
**Exact parameters:** 1,048,780,544  
**Approximate:** 1.049B  
**Vocabulary:** 65,536  
**Type:** causal language model  
**Objective:** next-token prediction

Current foundation training target:

```text
1,000,000,000 training tokens
10,000,000 validation tokens
```

Current development hardware target:

```text
NVIDIA RTX 4070 Ti SUPER
16 GB VRAM
```

Current training:

```text
BF16
bitsandbytes AdamW 8-bit
Batch: 1
Gradient accumulation: 32
Sequence length: 256
Effective tokens / step: 8,192
Warmup: 2,000
Learning rate: 0.0002
```

Model architecture currently used:

```text
Hidden size: 1,792
Layers: 20
Attention heads: 28
KV heads: 7
Intermediate size: 7,168
Maximum configured sequence length: 4,096
```

Important:

**Training currently uses 256-token sequences, while the model configuration supports a longer maximum context.**

---

## 4. Tokenizer

Tokenizer:

```text
data/cetin_tokenizer_v2.json
```

Vocabulary:

```text
65,536
```

Current multilingual tokenizer language pool:

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

Tokenizer sampling weights are tokenizer-training weights. They are not the same thing as final pretraining corpus percentages.

---

## 5. Current dataset

Current target:

```text
1B training tokens
10M validation tokens
```

Training allocation:

| Source / language | Tokens | Share |
|---|---:|---:|
| FineWeb — English | 400M | 40% |
| C4 — English | 50M | 5% |
| C4 — Turkish | 100M | 10% |
| C4 — Spanish | 50M | 5% |
| C4 — German | 50M | 5% |
| C4 — French | 50M | 5% |
| C4 — Russian | 50M | 5% |
| C4 — Arabic | 50M | 5% |
| C4 — Chinese | 50M | 5% |
| C4 — Japanese | 40M | 4% |
| C4 — Hindi | 40M | 4% |
| C4 — Persian | 20M | 2% |
| C4 — Korean | 20M | 2% |
| C4 — Portuguese | 10M | 1% |
| C4 — Indonesian | 10M | 1% |
| C4 — Vietnamese | 10M | 1% |
| **Total** | **1B** | **100%** |

English total:

```text
45%
```

Turkish:

```text
10%
```

Pipeline:

```text
upstream source
    ↓
selection
    ↓
cleanup / filtering
    ↓
deduplication
    ↓
language / source allocation
    ↓
tokenization
    ↓
train / validation
    ↓
binary token shards
```

---

## 6. Data and licensing

Primary upstream sources:

```text
FineWeb
C4
```

Relevant references:

- https://huggingface.co/datasets/HuggingFaceFW/fineweb
- https://huggingface.co/datasets/allenai/c4
- https://opendatacommons.org/licenses/by/1-0/
- https://commoncrawl.org/terms-of-use

Important:

> An upstream dataset/database license does not automatically mean every individual piece of source content is free of every possible third-party right.

The project does not claim ownership over upstream datasets, Common Crawl, third-party websites or third-party libraries.

Downstream users remain responsible for reviewing applicable licenses, copyright, privacy/data protection, terms and regulations.

This documentation is not legal advice.

---

## 7. Checkpoint system

Current:

```text
checkpoints_1b_base/
├── best.pt
└── last.pt
```

`best.pt` = best recorded validation checkpoint.

`last.pt` = latest resumable training state.

Checkpoint recovery was practically tested after an unexpected power interruption. The training process resumed from saved state instead of restarting from zero.

This is an important reliability milestone.

---

## 8. Training milestone history

### Early run

```text
~36.9M tokens
Val Loss: 4.831782
PPL: 125.434
```

### ~41M

```text
~41.0M tokens
Val Loss: 4.770700
PPL: 118.002
```

### ~49M

```text
49,152,000 tokens
Val Loss: 4.656045
PPL: 105.219
```

### ~57M

```text
57,344,000 tokens
Val Loss: 4.544424
PPL: 94.106
```

### ~61M

```text
61,440,000 tokens
Val Loss: 4.515492
PPL: 91.422
```

### ~65.5M

```text
65,536,000 tokens
Val Loss: 4.490826
PPL: 89.195
```

### ~69.6M

```text
69,632,000 tokens
Val Loss: 4.472635
PPL: 87.587
```

### Power recovery

After an unexpected power interruption:

```text
Resume step: 11,500
Processed: 94,208,000
Best validation: 4.344469
Optimizer loaded: True
```

### ~98M

```text
98,304,000 tokens
Val Loss: 4.316217
PPL: 74.905
```

### ~102M

```text
102,400,000 tokens
Val Loss: 4.305256
PPL: 74.088
```

### ~106.5M

```text
106,496,000 tokens
Val Loss: 4.298010
PPL: 73.553
```

### ~110.6M

```text
110,592,000 tokens
Val Loss: 4.278045
PPL: 72.099
```

### ~122.9M

```text
122,880,000 tokens
Val Loss: 4.233831
PPL: 68.981
```

### ~131.1M

```text
131,072,000 tokens
Val Loss: 4.192926
PPL: 66.216
```

### ~135.2M

```text
135,168,000 tokens
Val Loss: 4.177340
PPL: 65.192
```

### ~151.6M

```text
151,552,000 tokens
Val Loss: 4.165033
PPL: 64.395
```

### ~155.6M

```text
155,648,000 tokens
Val Loss: 4.157202
PPL: 63.892
```

### ~159.7M

```text
159,744,000 tokens
Val Loss: 4.127705
PPL: 62.035
```

### 163.84M

```text
163,840,000 tokens
Val Loss: 4.141044
PPL: 62.868
```

Small validation regressions are treated as normal checkpoint-level fluctuation; the long-term trend matters.

---

## 9. 20.5K milestone

At step:

```text
20,500
```

Processed:

```text
167,936,000 tokens
```

Training-time validation:

```text
Val Loss: 4.115195
PPL: 61.264
```

Corrected standalone benchmark:

```text
Val Loss: 4.115049
PPL: 61.255
25 validation batches
6,400 validation tokens
```

This was an important consistency check between the training evaluator and standalone evaluator.

---

## 10. Benchmark evolution

The first standalone evaluator exposed a measurement problem.

It produced:

```text
Val Loss: 4.337689
English: 0/0
Turkish: 0/0
generation = prompt
```

This was investigated rather than interpreted as model failure.

Problems identified:

1. Validation sample count differed from the training evaluator.
2. Tokenizer special-token handling was incorrect.
3. Cloze evaluation required one-token answers.
4. Generation output was not sufficiently transparent.

The evaluator was rebuilt.

Current evaluator:

```text
src/mertai/training/evaluate_1b.py
```

Current benchmark tracks:

```text
validation
PPL
English cloze
Turkish cloze
generation
generated token IDs
generated token strings
stop reason
repetition / degeneration
historical comparison
```

---

## 11. Current 20.5K benchmark snapshot

```text
Parameters: 1,048,780,544
Step: 20,500
Processed: 167,936,000

Validation loss: 4.115049
PPL: 61.255

English cloze: 1/10
Turkish cloze: 4/10
```

The cloze tests are tiny diagnostics, not a complete model benchmark.

---

## 12. Current generation behavior

The 20.5K model produces genuine continuations, but generation is visibly immature.

Observed patterns:

```text
Hi
→ sentence continuation

The capital of France is
→ repeated phrase continuation

Türkiye'nin başkenti
→ repeated phrase continuation

2 + 2 =
→ repeated arithmetic pattern

Yapay zeka nedir?
→ generated Turkish continuation

CetinLM nedir?
→ unrelated learned continuation
```

This confirms:

- the model generates new tokens
- the model is not simply echoing every prompt
- the model is not yet a chat model
- repetition/degeneration is currently significant

---

## 13. Current reasoning about repetition

Base-model repetition is currently expected and measurable.

Examples included:

```text
How do you make your own music?
repeated several times
```

```text
Türkiye'nin başkenti olarak...
repeated several times
```

```text
3 + 3 + 3 + ...
```

This is a development metric, not a final-quality judgment.

Later training and inference work should reduce these behaviors.

---

# 14. Long-context plan

Current training sequence:

```text
256
```

Model maximum configured sequence:

```text
4096
```

Planned long-context adaptation after the foundation run:

```text
final 1B checkpoint
    ↓
512
    ↓
1024
    ↓
2048
    ↓
4096
```

The exact schedule will be decided by benchmark results and VRAM measurements.

Principle:

> Do not restart the foundation model merely because longer context is desired when continued adaptation is technically appropriate.

---

# 15. Post-training roadmap

Long-term path:

```text
Base
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

Stages may be reordered according to measurement results.

Future stages must not be presented publicly as completed before they actually exist.

---

# 16. Instruction stage

Goal:

Teach the model:

```text
user request
    ↓
understand instruction
    ↓
produce useful answer
```

This stage will establish structured assistant behavior.

---

# 17. Conversation stage

Goal:

```text
multi-turn interaction
context tracking
role consistency
natural dialogue
user intent handling
```

A raw base model is not expected to behave like a finished conversational assistant.

---

# 18. User-input understanding

A major planned capability is robust understanding of imperfect human input.

Examples:

```text
meraba nasılsn
yarın istanbula gitcem hava nasıl
nabıyon
bunu hesapla ama tam anlamadım
```

Planned handling:

```text
typos
missing words
abbreviations
slang
informal language
incomplete sentences
intent recovery
context-aware interpretation
```

The objective is not to criticize the user.

The objective is:

> **Understand what the user most likely meant and help.**

---

# 19. Math

Dedicated math training is planned.

Target capabilities:

```text
arithmetic
algebra
word problems
symbolic manipulation
equations
patterns
structured calculations
```

The system should also learn when deterministic tools are safer than neural guessing.

Future pattern:

```text
simple task → model
complex calculation → calculator/tool → verify → answer
```

---

# 20. Code

Dedicated code training is planned.

Target capabilities:

```text
generation
completion
debugging
refactoring
explanation
testing
small algorithms
```

Code performance will be evaluated independently.

---

# 21. Reasoning

Reasoning is a dedicated capability, not merely a marketing label.

Planned areas:

```text
multi-step reasoning
problem decomposition
planning
logic
verification
structured decision making
math reasoning
code reasoning
```

The objective is not:

```text
1B = 100B
```

The objective is:

> **Measure how much reliable reasoning capability can be extracted from a 1B-class model.**

---

# 22. Smart inference philosophy

A small model does not need to do every task entirely inside its neural weights.

A future system can combine:

```text
model
+
retrieval
+
tools
+
verification
+
context management
+
memory
```

Conceptual loop:

```text
User
 ↓
Understand request
 ↓
Determine required knowledge/tool
 ↓
Retrieve or calculate if necessary
 ↓
Reason / synthesize
 ↓
Verify
 ↓
Final response
```

This is a core part of the project's efficiency philosophy.

---

# 23. User-friendly conversation

A polished assistant does not need hundreds of billions of parameters merely to handle everyday interaction such as:

```text
Naber?
İyiyim, teşekkür ederim. Sen nasılsın?
```

The real challenge is reliable context, intent, knowledge and behavior.

Therefore the project will treat:

```text
language
+
instruction
+
conversation
+
reasoning
+
tools
```

as complementary layers.

---

# 24. Project identity dataset

A dedicated identity dataset is planned during post-training.

Topics:

```text
What is CetinLM?
Who created it?
What is its purpose?
How many parameters does it have?
What tokenizer does it use?
What hardware does it target?
What data sources does it use?
What stage is it in?
What is its roadmap?
```

Example:

```json
{
  "messages": [
    {"role": "user", "content": "CetinLM nedir?"},
    {"role": "assistant", "content": "CetinLM, verimli ve erişilebilir donanım üzerinde çalışabilecek yetenekli dil modelleri geliştirmeyi amaçlayan bağımsız bir AI araştırma ve mühendislik projesidir."}
  ]
}
```

This information should be taught during the appropriate post-training stage instead of modifying the current base run.

---

# 25. Self-description principle

Future assistant versions should distinguish:

### Verified project facts

```text
How many parameters?

1,048,780,544.
```

### Information the runtime does not expose

```text
Which GPU is running inference right now?

I do not have access to that runtime information.
```

Principle:

```text
Known → answer
Unavailable → do not guess
```

---

# 26. Tools

Potential future tools:

```text
calculator
code execution
retrieval
file access
search
other application tools
```

A deterministic task should use a deterministic tool when appropriate.

This is part of the project's “model + system” philosophy.

---

# 27. Web

Future web integration may use:

```text
User question
    ↓
Need fresh information?
    ↓
Web retrieval
    ↓
Relevant sources
    ↓
Model synthesis
    ↓
Answer
```

Web data seen during pretraining is not the same thing as live internet access.

---

# 28. Memory

Future memory should be controlled.

Conceptually:

```text
current context
+
optional relevant memory
+
current request
```

The system should distinguish:

```text
temporary context
persistent useful information
stale information
unavailable information
```

---

# 29. Accessibility philosophy

Current practical hardware target:

```text
RTX 4070 Ti SUPER
16GB VRAM
```

This constraint is intentional.

The long-term goal is:

> **More useful capability per GB of VRAM and per unit of compute.**

The project does not claim that smaller models universally replace frontier-scale models.

---

# 30. Larger models

Possible future scale:

```text
1B
 ↓
3B
 ↓
5B+
```

A larger model is a separate experiment.

The current 1B model does not secretly become 3B through post-training.

Scaling decisions will consider:

```text
capability
VRAM
training cost
inference speed
quantization
deployment
```

---

# 31. Compression and efficiency roadmap

Potential work:

```text
quantization
weight compression
efficient kernels
inference optimization
distillation
architecture efficiency
```

The target is more useful capability at lower memory/deployment cost.

---

# 32. Website

Current public direction:

```text
cetinlm.meforcetechnology.com
```

Target experience:

```text
Home
Chat
About
Documentation
Benchmarks
Models
GitHub
```

The website should communicate both product usability and engineering transparency.

---

# 33. API

Future production architecture:

```text
Browser
   ↓
CetinLM Web UI
   ↓
CetinLM API
   ↓
Inference server
   ↓
CetinLM model
```

An OpenAI-compatible API shape such as:

```text
/v1/chat/completions
```

may be used for clean frontend integrations.

The UI must not imply that unfinished models already exist.

---

# 34. Model naming

Preferred real/planned naming:

```text
CetinLM-Base-1B
CetinLM-Chat-1B
CetinLM-Code-1B
CetinLM-Reasoning-1B
```

Future scale:

```text
CetinLM-Chat-3B
CetinLM-Code-3B
...
```

Unimplemented models should be marked:

```text
Planned
Coming Soon
```

---

# 35. Important design decision — keep 1B stable

**Decision:** Do not change the current 1B foundation training without a serious correctness issue.

**Why:**

The current run has:

- real checkpoint history
- a continuous training curve
- measured validation
- benchmark history
- working recovery

Changing the recipe mid-run would reduce comparability.

**Status:** Active.

---

# 36. Important design decision — benchmark before changing the model

**Decision:** When results look strange, validate the evaluator first.

**Why:**

The first evaluator produced false-looking signals.

**Status:** Implemented.

---

# 37. Important design decision — no unnecessary V2 restart

The project originally considered a major improved dataset pipeline during the 1B run.

Decision:

> Do not abandon the current 1B run merely because a future dataset could be better.

A stronger dataset pipeline can be used in a later controlled experiment or continuation stage when justified.

**Status:** Active principle.

---

# 38. Important design decision — identity later

**Decision:** Add CetinLM identity during instruction/conversation/post-training.

Reason:

Project identity is primarily an assistant behavior/knowledge requirement.

It does not need to contaminate or interrupt the current foundation pretraining run.

**Status:** Planned.

---

# 39. Important design decision — noisy input

**Decision:** Future assistant versions should understand imperfect human input.

Reason:

Real users type with:

- typos
- slang
- abbreviations
- incomplete text
- missing punctuation

The system should recover probable intent.

**Status:** Planned.

---

# 40. Important design decision — model + software

**Decision:** Treat practical capability as the combination of model and surrounding software.

Reason:

Tools, retrieval, verification, memory and context can provide useful capabilities without forcing every operation into model weights.

**Status:** Core philosophy.

---

# 41. Public communication principle

Public project updates should be:

```text
honest
measured
technical
understandable
```

Do not publish:

```text
fake benchmark scores
fake model sizes
fake production status
fake partnerships
fake users
fake funding
```

Unfinished systems must be labeled as unfinished.

---

# 42. What success means

Success is not defined as:

```text
“1B beats every 30B”
```

Instead:

> **A 1B-class model should become dramatically more useful than its size alone would suggest, through careful training and intelligent system design.**

Relevant metrics:

```text
capability / parameter
capability / VRAM
capability / compute
capability / deployment cost
```

A future result such as:

```text
1B model
≈ much larger model
on selected practical tasks
```

would be meaningful if supported by fair benchmarks.

The project should never claim universal equivalence from isolated results.

---

# 43. The “small but mature” idea

A useful conceptual distinction:

```text
Model size
≠
overall intelligence
```

A system can be:

```text
large but poorly trained
```

or:

```text
smaller but carefully trained and engineered
```

CetinLM aims to investigate the second direction.

---

# 44. Long-term system vision

The eventual system is envisioned as:

```text
User
 ↓
Input understanding
 ↓
Context selection
 ↓
Model reasoning
 ↓
Tool / retrieval when necessary
 ↓
Verification
 ↓
Natural response
```

The target experience is:

> A compact model that feels much more capable because the entire system around it has been deliberately engineered.

---

# 45. Update format

For every major future event, append:

```text
## YYYY-MM-DD — Title

What happened:
Why it happened:
What changed:
Measurement:
Decision:
Status:
```

Use this for:

```text
training milestones
benchmark milestones
dataset changes
architecture changes
bugs
fixes
new capabilities
public releases
important discoveries
```

---

# 46. Future benchmark expansion

Planned evaluation matrix:

```text
Language
Knowledge
Turkish
English
Math
Logic
Code
Instruction
Conversation
Reasoning
Long Context
Tools
Robustness
```

A dedicated Turkish benchmark is planned.

The goal is not to optimize for one vanity score.

The goal is to build a broad measurement picture.

---

# 47. Current status snapshot

Latest documented state:

```text
Model:
    CetinLM-1B

Parameters:
    1,048,780,544

Stage:
    Base pretraining

Processed:
    ~167.9M tokens

Progress:
    ~16.8%

Best validation:
    ~4.115

Best PPL:
    ~61.3

Tokenizer:
    65,536 vocabulary

Target hardware:
    RTX 4070 Ti SUPER 16GB

Benchmark:
    Active

Website:
    Active

GitHub:
    Active

Immediate goal:
    Finish the 1B foundation model.
```

---

# 48. What not to forget

The following ideas are explicitly retained for future implementation:

```text
✓ robust typo handling
✓ incomplete sentence understanding
✓ slang / abbreviation understanding
✓ instruction following
✓ natural conversation
✓ project identity knowledge
✓ math specialization
✓ code specialization
✓ reasoning specialization
✓ tool use
✓ calculator integration
✓ web retrieval
✓ controlled memory
✓ long-context adaptation
✓ benchmark growth
✓ compression / quantization
✓ practical 4070-class deployment
```

---

# 49. Core project rule

> **Do not confuse “small” with “weak”, and do not confuse “large” with “intelligent”.**

Parameter count matters.

It is not the only variable that matters.

The project will test how effectively:

```text
data
+
architecture
+
training
+
post-training
+
reasoning
+
tools
+
inference
+
memory
```

can convert a limited parameter budget into useful capability.

---

# 50. Closing

This is a living document.

When something fails, record it.

When something works, measure it.

When a decision changes, explain why.

When a capability is added, document it.

When an assumption is disproved, keep the history rather than rewriting it.

The goal is not to make the project look perfect.

The goal is to preserve the truth of the engineering process.

**CetinLM — build small, learn deeply, measure everything, improve continuously.**
