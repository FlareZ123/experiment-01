# Apex Alchemy Muk axis: physical opening geometry, a selected native turn, and counterplay that changes with Prizes and Bench

**Agent43 synthesis, 3 November 2026 | fixed candidate v0 unchanged | developmental evidence only**

## What the Muk axis actually accomplishes

Apex Alchemy v0 is a proposed fixed 60, digest `21846db95f88d5d5abc6ee3876b3522732092e27ca5e7485948f354d8468a769`. Its Alolan Grimer SUM → Alolan Muk SUM plan uses Boost Shake EVS to establish Power of Alchemy, suppressing Basic Pokémon Abilities and potentially taking away opposing Iron Thorns ex's active Initialization or rank26 Meloetta's discard-pile Exeggcute Propagation. This axis is **real as a rules interaction** under verified positions. Whether the full 60 can exploit it effectively across the original 32 opponents is **not established**.

Three independent kinds of evidence now exist, and their boundaries matter.

### 1. Opening access and physical placement

Exact, no-full-game multivariate hypergeometric screens over the unchanged 60 and six inaccessible Prizes show:

| Candidate starting event, conditional on Basic-valid initial 7 | Result | What it does *not* prove |
| --- | ---: | --- |
| Old Grimer-only species seven with direct Muk+Shake | 2.96579301% | Incorrectly counted two Grimer as forced Active |
| Exactly one physical Grimer Basic in opening seven and no other Basic; direct Muk+Shake | 2.79392909% | Still contains eighth-drawn second Grimer |
| Eighth-drawn second Grimer capable of Benching, included in row above | 0.04775254 percentage points | No guarantee the Grimer gets placed |
| First eight have no natural second Grimer, direct Muk+Shake | **2.74617656%** | Search Item can still obtain second Grimer; other moves exist |
| Subset of previous row with held Quick Ball/Treasure and second Grimer+Muk unprized | **1.55785122 pp** | Discard cost and playable search unverified |
| Initial seven have exactly one Grimer plus exactly one other Basic, eighth non-Basic, direct unprized Muk and Shake | **2.86515221%** | Only a one-Benched-Grimer opportunity, with other state constraints |

Independently verified Fraction and first-eight-composition enumerations agree; see [physical opening geometry correction](agent43-muk-firsteight-bench-grimer-geometry-correction-20261103.md) and [source rank26 opening joint](agent43-rank26-rope-cologne-benched-muk-native-20261103.md). None of these rows measures the entire Bench Muk setup chance once searches, mulligan bonuses, opponent actions, and actor decisions are present. In particular the historical function `candidateForcedActiveMuk()` is a species-only classifier, **not forced Active Muk**.

### 2. Genuine selected first-turn native transition, with known engine correction

The owner-held Shake Root and native K1 continuation have now been executed as a **selected actor action** rather than merely moving cards into state by hand. Starting from a staged Active Regidrago V, Benched Grimer, held Shake and unprized Muk, an owner-K0 policy plays Shake, the native owner deck prompt selects Muk in K1, Bench evolution prompt picks Grimer, native shuffle resolves, Shake is discarded, the turn ends. Iron Thorns Initialization disappears from the actual opposing power check. Both seats passed in [native 3/3 CI 41723682711](https://github.com/FlareZ123/experiment-01/actions/runs/41723682711); all audits have zero pending prompts and no hidden opponent identities read. Full [selected native report](agent43-selected-bench-muk-owner-policy-numeric-shuffle-20261103.md).

A serious pinned Twinleaf defect required repair in the research adapter. The original `ShuffleDeckPrompt.validate` rejects all legal full permutations of decks with 11+ cards due JavaScript string sorting; staged 12-card search initially failed on both seats. **Agent33 had already discovered, documented and native-verified this problem on 2 November**, with an existing reversible hook [here](../twinleaf/agent33-shuffle-native-numeric-validation-20261102.md). Agent43's initially duplicated correction has since been replaced by an adapter delegating to Agent33's maintained implementation. The selected root audit and card movement remain developmental, not gameplay wins.

### 3. Original rank26 can answer the lock conditionally

The original printed rank26 60 has one Escape Rope, one Counter Catcher and one Canceling Cologne. In pinned native actual Store staged encounters, both seats confirmed:

| Public target/control state | Specific source line and result |
| --- | --- |
| Sole opposing Benched Muk, source has Rope+Cologne | Source plays Rope; **opponent forced** to promote Muk; source pays Cologne; discard Egg Propagation becomes usable |
| Muk plus another opposing Bench, source has Rope+Cologne | **Opponent chooses other Bench**; Muk stays Benched and still blocks Egg despite paid Cologne |
| Muk plus another opposing Bench, source has Catcher+Cologne and source has more Prizes remaining | Source **chooses Muk directly** via Catcher, then Cologne; Egg becomes usable |
| Muk plus another opposing Bench, equal 6–6 Prizes | Catcher is **currently ineligible**; its native `canPlay` throws `CANNOT_PLAY_THIS_CARD`; never submit known-invalid action |

All 21 real staged cases including prior baseline passed [native CI 41721108710](https://github.com/FlareZ123/experiment-01/actions/runs/41721108710), draft PR22. This is genuine paid Item movement and target choice in staged boards, still **zero natural game outcomes**.

**Critical temporal exception:** Original rank26 can, in a printed-card existence line documented by Agent2, change 6–6 to source6/opponent5 during the same response turn using Risky Ruins, Bench Unown+Exeggcute, and Damage Pump to self-KO its 30-HP Egg. Thus Catcher cannot be treated as permanently blocked merely because a turn begins at 6–6. Full self-KO paid-native execution and source action selection remain untested. See [rank26 printed parity counterexample](agent2-rank26-catcher-prize-parity-20261103.md).

Exact source-rank26 holding the singleton Rope+Cologne directly in its first eight, conditional Basic-valid starting seven, is 1.40293663%; that excludes Mail/Pad/search/draw and is **not the total source counterplay probability**. The owner-visible [generic Trainer-coupled Muk target-control frontier](agent43-muk-owner-visible-gust-frontier-20261103.md) conditions on the live Prize state and Benched choice, preserves each held physical Item and the Cologne competition, and makes no gameplay-winning assertion. Two live Muk mean disabling one can leave another's Ability active.

## Why this changes deck optimization

Simple scores such as “has Muk”, “can search Shake”, and “can find Cologne” are insufficient. The candidate's correct first-turn **physical Bench placement** matters; rank26's **opponent-selected versus owner-selected promotion** matters; the source's **current and potentially changing Prize state** matters; maintaining a **second Muk** changes the payoff of a single Cologne, at extra Bench/resource expense. Exact search costs and who chooses each action are necessary to compare alternatives.

The same source setup may make one tactic dominant early and expose it later. Rank6 initial resource-screen collision is a mere conjunction, not a Knock Out, and rank26 source's printed self-KO route is a potential line with unverified access. These mechanics warrant **a competitive owner-root planner** comparing paid options and resulting owner/opponent continuations on the same physical deals.

## Correct next experimental unit

Execute two-sided fixed-60 v0 vs original rank26 and rank6 using an owner-knowledge-safe root policy that can (i) put starting Basics on the right Bench before Shake, (ii) pay actual ShuffleDeck and Item costs with Agent33's pinned compatibility hook, (iii) compare Shake against alternative Trainer setup on the same physical owner hand, (iv) let the opponent choose its Rope promotion, and (v) select or reject same-turn self-KO/Catcher/Cologne based on real resources and ensuing attacks. Report full 60 identities, random seeds, chosen actions, matchup start seats, paper opportunity denominators, policy provenance, aborts/caps and the opponent's actual reply. The official paper timed match standard must govern win certification.

**Final status:** 29/32 authenticated opponent printed lists, missing 23/25/28; no final named best 60, zero competitively qualified games and no credible 99.5% estimate. This synthesis documents *which mechanics are established* and *what consequential experiment is still missing*, with links to reproducible underlying source.
