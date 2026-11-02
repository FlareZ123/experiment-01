# Exact rank-5 Quick Ball opening affordability

**Agent 41 | 2 November 2026 | exact combinatorial result; no native game**

The authenticated Aichi rank-5 Yamato Nakano Mew/Genesect sixty (`results/aichi-2026/full-decklists.json`, original printed-60 SHA256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`) contains 30 printing groups, 11 Basic Pokémon, four Quick Ball and four Double Colorless Energy (DCE).

An exact multivariate hypergeometric dynamic program enumerates seven-card physical subsets weighted by combinations within exact printing groups. It conditions on at least one Basic for a valid opening, and tracks Quick Ball, any duplicated non-Quick-Ball printing, DCE duplicates, and duplicates of other printings.

| Class | Exact physical sevens | Share of Basic-valid sevens |
| --- | ---: | ---: |
| All sevens, including invalid no-Basic | 386,206,920 | n/a |
| Basic present | 300,306,336 | 100% |
| Basic and Quick Ball | 113,768,556 | 37.8842% |
| Basic, Quick Ball, any non-Quick-Ball duplicate | 36,941,838 | 12.3014% |
| Basic, Quick Ball, with DCE the only non-Quick-Ball duplicated printing | 4,042,260 | 1.3460% |

Conditional on a Basic-valid opener with Quick Ball and some duplicated non-Quick-Ball printing, **10.9422%** (`4,042,260 / 36,941,838`) have DCE as the **sole duplicated non-Quick-Ball printing**. Other Quick Ball copies can also be held, but the existing root affordability guard excludes them. This demonstrates an upstream weakness in treating duplicate availability as synonymous with cheap discard resources. It does not prove discarding DCE is wrong in any particular game.

Code: `scripts/agent41-rank5-quickball-duplicate-openings.cjs`, verified original source 60. Eight locally passing tests: `tests/agent41-rank5-quickball-duplicate-openings.test.cjs`, including an independent small-deck physical-hand enumeration, grouping sensitivity and binomial conservation. Exact locally tested remote blob SHA1s: script `35d64875260542bfc859afb5516796561c3ce140`, tests `746b9c43c5329a9f2104aa6334a1db4d7b4554bd`.

The model omits mulligan bonus draws, Prize composition, Item locks, Bench constraints, known deck searches, subsequent actions and game policy. The 12.3014% is a structural opening-hand probability; it is **not** a native Quick Ball play frequency. The 10.9422% is **not** a misplay rate.

See `agent41-quickball-owner-transaction-v1-20261102.md` for the independent downstream accepted-root/payment hand-identity gate. No competitive game was run here. **29/32 originals authenticated, 0 qualified games, no demonstrated 99.5% winner.**

## Addendum: DCE in the opening hand and subsequent six Prize cards

Among the 4,042,260 Basic-valid seven-card opening hands whose only duplicated non-Quick-Ball printing is DCE, the precise held-DCE distribution is: **3,858,714 with two DCE**, **181,504 with three**, and **2,042 with four**. For each hand, set six Prize cards uniformly from its remaining 53 physical cards.

There are **92,800,103,104,800** exact seven-hand/six-Prize pairs. At least one DCE is Prized in **19,564,715,682,120 pairs = 21.08264434%**; at least two in **964,292,628,600 pairs = 1.03910728%**. The seventh local test verifies these integers. Prize placement therefore creates further possible Energy-access pressure on this opening family. It still does not prove any particular Quick Ball discard is wrong or count as a simulated game.

## Category-level resource bottleneck

The exact multivariate count now distinguishes whether the eligible non-Quick-Ball duplicate is a Trainer, Pokémon, or Energy. The seven mutually exclusive categories partition all **36,941,838** qualifying Basic-valid openings:

| Duplicated non-Quick-Ball categories in hand | Exact opening sevens |
| --- | ---: |
| Trainer only | 15,145,407 |
| Pokémon only | 15,684,085 |
| Energy only (DCE) | 4,042,260 |
| Trainer and Pokémon | 1,423,926 |
| Trainer and Energy | 246,732 |
| Pokémon and Energy, no Trainer | 393,380 |
| All three categories | 6,048 |

Summing cases with a duplicated Trainer gives **16,822,113 (45.53675%)** of initially duplicate-eligible sevens. **20,119,725 (54.46325%)** have **no duplicated Trainer**; their duplicate rationale depends entirely on Pokémon, DCE, or both. Multiple Basic Pokémon may be meant for Bench setup, while duplicate DCE may be needed for successive attacks. These cards therefore require state-dependent discardability and should not be automatically valued as cheap payment. This measurement does not prove the Trainer duplicates are expendable either.

The updated source `scripts/agent41-rank5-quickball-duplicate-openings.cjs` exposes `openingDuplicateCategories` and eight independent pure tests now pass locally. Exact verified Git blobs: source `3bd19854e035c4943c6f5c3be0455a4521977686`, tests `7a1cbfc1c3911f39213eef03cd0a9a75af64a999`. The original printed source 60, native policy, simulation results and game qualification remain unchanged.
