# Agent 13: exact first Quick Ball prompt donor and the hidden DCE tie-break

**3 November 2026. Exact opening-seven combinatorics and pure-chooser audit; no native game and no qualified win.**

## Question

The canonical default-off owner Quick Ball root in `simulation/twinleaf/agent8-actor-quick-ball-frontier.cjs` accepts a physical hand when it holds Quick Ball plus two copies of some *other non-Quick-Ball exact printing*. This is a coarse affordability test. If the root is selected, the separate `simulation/twinleaf/agent47-actor-hand-discard.cjs` default chooser scores legal one-card discards by whether they erase the final copy of a printing; when multiple duplicate printings are available, it selects the **lexicographically first printing**. This decision policy does not price the opportunity cost of an attack's only Energy type, benchable Pokémon, or later turns.

The [existing Agent41 exact physical-opening census](agent41-rank5-quickball-duplicate-opening-census-20261102.md) established 36,941,838 Basic-valid seven-card hands with Quick Ball and at least one duplicated *non-Quick-Ball* printing. It did not assign the actual subsequent prompt chooser's first paid printing. We extend that same physical population, without claiming that any opener necessarily selects the Item in live play.

The exact source is **Yamato Nakano's authenticated Aichi 2026 rank-5 Mew/Genesect 60**, `results/aichi-2026/full-decklists.json`, printed-60 SHA-256 `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. It contains **11 Basic Pokémon, 4 Quick Ball FST, and 4 Double Colorless Energy SUM as its entire Energy inventory**.

## Exact result

Under the explicitly modeled one-card prompt choice, the 36,941,838 structurally eligible physical opening sevens partition as follows:

| Default first paid donor category | Exact seven-card subsets | Share of duplicate-eligible Basic-valid openers |
|---|---:|---:|
| Pokémon (all stages) | **16,759,103** | **45.36619%** |
| Trainer | **15,530,351** | **42.04001%** |
| Double Colorless Energy | **4,652,384** | **12.59381%** |
| **Total** | **36,941,838** | **100%** |

The DCE outcome has a particularly important subpartition:

- **4,042,260** hands contain DCE as the only duplicated *non-Quick-Ball* exact printing, already counted by Agent41.
- **610,124 additional hands** contain DCE *and* at least one other duplicated non-Quick-Ball printing, yet the existing default chooser still picks DCE under its lexical tie-break. This is **13.11422% of all modeled DCE-first donor hands**. These are genuine alternate-payment opportunities, though the alternative printing may itself be strategically protected.
- Overall, default DCE selection describes **1.54921% of all 300,306,336 Basic-valid physical opening sevens**. This is an opening-hand structural rate, **not** a native Item-use frequency or an observed error probability.

Among the modeled first-donor printing counts, the largest are `Genesect V FST` **7,409,352**, `Mew V FST` **7,164,920**, `Double Colorless Energy SUM` **4,652,384**, `Ultra Ball MEG` **4,042,062**, `Battle VIP Pass FST` **2,442,935**, `Mew VMAX FST` **2,184,831**, and `Trainers' Mail ROS` **2,130,654**. An additional **26,535** opening hands lead the prompt chooser to discard another `Quick Ball FST`: the root gate excludes Quick Ball as *its qualifying duplicate*, but after paying one Quick Ball, at least two held Quick Ball copies can still compete as prompt donors. This is logically consistent with the current code but illustrates why root admission and actual prompt payment are distinct stages.

**Mechanism:** Once a Quick Ball has been removed from the hand, a duplicate remaining printing has zero "last copy erased" penalty in Agent47's chooser. `Double Colorless Energy SUM` sorts before all duplicated source printings except `Battle VIP Pass FST`. A hand with two DCE, two Genesect V and Quick Ball therefore selects DCE even though Genesect is also physically affordable. If it additionally has two Battle VIP Pass, the default lexical choice shifts to Battle VIP Pass. Neither choice is proven better without evaluating Bench needs, Energy attachments, attack timing, matchup and future actions.

## Method and reproducibility

A multivariate-hypergeometric dynamic program processes all **30 exact printing groups** of the original 60, weighted by `C(group copies, copies drawn)`. Each state tracks physical opening size, presence of a Basic, presence of Quick Ball, an eligible duplicate from a non-Quick-Ball printing, and the first lexical duplicate remaining in hand *after spending one Quick Ball*. A Quick Ball printing itself can be eligible as a subsequent prompt donor only when at least three Quick Balls were in the starting seven. It then tallies donor printing and category while conditioning on a Basic-valid opener.

Code: [exact first-donor census](../../scripts/agent13-rank5-quickball-first-paid-donor.cjs), blob `deca9c154410960db2b7571aff15258667633c91`. Pure tests: [five source-level regressions](../../tests/agent13-rank5-quickball-first-paid-donor.test.cjs), blob `d835f8cc9d3c33e4058b25746f6655f866b7a239`. All **5/5** were executed in an isolated JavaScript V8 environment using the exact repository source with mocked filesystem/native dependencies and the authentic retrieved rank-5 card counts; **no Node GitHub Actions run or native pinned-Store execution is claimed**. Tests include comparison to Agent41's independent exact totals, physical-hand enumeration of a small deck invoking the *actual* Agent47 chooser function, reversal-order invariance and an independent closed-form sum that reproduces **4,652,384** without invoking the dynamic program.

The independent DCE check is the sum over hand sizes with **1–4 Quick Balls, 2–4 DCE, 0–1 Battle VIP Pass, at least one Basic among the remaining 11, and the remaining non-Basics among the other 38 cards**. Two Battle VIP Pass would win the lexical donor tie over DCE; no other exact printing earlier than DCE in the original source has more than one copy.

## Limits and immediate use

This is a **policy-structure counterexample**, not proof that discarding DCE is always wrong, nor proof that substituting a different donor improves win rate. It assumes a genuinely selected first Quick Ball root and a complete legal owner-hand one-card discard menu. Real first-root priority, Bench space, Item lock, Prizes, live prompt cards, owner information, search target, actual chosen actor module, attack continuation and opposing counterplay remain unmodeled. It excludes mulligan bonus draws and other opening cards obtained subsequently.

The existing historical rank-5 same-source-deal Quick Ball experiment already observed a **5→0 native copied-attack collapse** in one treatment comparison [Agent13 report](agent13-rank5-vip-quickball-connector-domination-20261103.md), but the current exact opening census cannot attribute that collapse to DCE payment. An effective next test would preregister **the same actual physical source deals**, compare default lexical and explicit DCE-reservation prompt policies while keeping one selected root, and audit *exact physically paid cards, meaningful Basic target, attached DCE after search, settled copied attack and both sides' replies*. One fixed chosen policy must be evaluated under both seats before any competitive inference.

**Global decision status unchanged:** 29/32 authenticated original opposing 60s, ranks 23/25/28 unverified, zero competitively qualified games, no selected final 60 and no demonstrated 99.5% field win rate.
