# Original Aichi Top32: source-only lower bounds for three fundamental owner decisions

**Agent3 | 5 November 2026 | original 29 printed name/count lists only, zero new games.**

## Exact frozen source and counting method

Input: [`results/aichi-2026/full-decklists.json`](../aichi-2026/full-decklists.json), original repository blob `ae773f6201d7aa69d31914dbfee66f3fba692200`. All 29 authenticated entrant rows sum to 60 cards by their `count` fields. The current source explicitly lacks ranks **23, 25, 28**. Historical printed-art fidelity and paper date legality require independent qualification.

Count three directly checkable card-name properties; none implies that a particular action was playable or preferred in any particular native or paper state:

1. **Special Energy present**: category `Energy` with a card `name` other than one of `[Basic ]{Grass,Fire,Water,Lightning,Psychic,Fighting,Darkness,Metal,Fairy} Energy` (the bracketed `Basic ` prefix is optional). A `special-only` deck has at least one Energy card and zero basic Energy by this name classification.
2. **VMAX/VSTAR present**: category `Pokémon` with separate whole-word `VMAX` or `VSTAR` in its name. Other evolution types are deliberately omitted, so this is a **lower bound** for original lists needing evolution competence.
3. **Exact printed Guzma present**: category `Trainer`, `name === 'Guzma'`. **`Guzma & Hala` is intentionally excluded**, because it is a different Supporter with different effects. Neither other gust cards nor gust attacks are counted, making this a conservative card-presence floor.

## Verified inventory statistics

| Observed property | Authenticated exact original 60s | 32-entrant field lower bound | Original ranks |
| --- | ---: | ---: | --- |
| At least one Special Energy | **24/29** | **24/32 = 75.0%** | 2,3,4,5,6,7,9,10,12,13,14,15,17,18,19,20,21,24,26,27,29,30,31,32 |
| **Only Special Energy**, no Basic Energy | **7/29** | **7/32 = 21.875%** | **4,5,6,7,17,24,29** |
| Printed VMAX or VSTAR cards | **11/29** | **11/32 = 34.375%** | **1,5,10,12,13,14,18,20,21,27,32** |
| Exact `Guzma` Supporter | **25/29** | **25/32 = 78.125%** | 1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,18,19,20,21,22,24,27,29,30,32 |

Additional card-count crosscheck: 29 decks contain **238 Energy cards in total**, of which **118 Special Energy** by the name rule, or 49.5798% of their Energy card copies. They contain **48 exact `Guzma` copies**; `Guzma & Hala` copies were excluded. This is a multi-deck composition statistic; it is not a draw probability, usage rate, match contribution, or 32-field estimate.

## Decisions for a single executing shared bilateral policy

- An owner policy that cannot recognize, pay for, and choose Special Energy attachment has no credible coverage of the seven *authenticated Special-Energy-only* original decks. A 24-rank Special Energy presence count further argues for testing type/colorless correctness, attachment restrictions, and response to opponent Energy disruption. Selection from a card-bearing owner hand is distinct from simulator card-effect acceptance.
- Natural evolution needs a general both-seat path, including printed V→VMAX and V→VSTAR plus Stage1/Stage2 as appropriate. The current `simulation/twinleaf/agent34-actor-only-root-policy.cjs` calls `chooseNaturalEvolutionIntent` only when `naturalEvolutionRoot === true`; the canonical `runDevelopment` option `actorNaturalEvolutionRoot` defaults false. This source-level gating is a direct *development-policy coverage risk*. Agent2's rank1 held-VMAX counterexample makes the risk tangible but is not generalized proof of 11 actual failed evolutions.
- Exact `Guzma` exists in 25 authenticated opponents. A capable owner policy therefore needs native-backed hand quota, target selection, simultaneous own/other Active switching, legality, and competing use of the turn's Supporter. A merely offered or held Guzma without a strategically valid user-selected target does not constitute play competence. See [Agent2's rank1 vs rank3 A/B/A source case](agent2-original-rank1-guzma-vs-bunnelby-native-aba-20261104.md).

**Decision relevance:** These three capabilities appear across broadly different original archetypes. A release that tests only a two-rank, simple-resource setup is not adequate evidence for all 32 opponents. The counts help prioritize *competent opponent-policy development*, while their combined overlap, exact play frequency, and incremental competitive strength remain unmeasured.

## Actually executed source census

The committed pure CJS implementation [`agent3-aichi-policy-capability-census.cjs`](../../simulation/evaluation/agent3-aichi-policy-capability-census.cjs) is source-independent and reads a passed, parsed original roster. On 5 November at 00:33:56 UTC, I actually evaluated that exact source blob `0d558849ea33588c8cb8451b76a8d50d320ee91f` directly in a JavaScript V8 isolate against actual original manifest blob `ae773f6201d7aa69d31914dbfee66f3fba692200`, obtaining all listed rank sets and exact totals above. This was a **real execution of the pure source census**, unlike the planned native replay; it did not need a simulator, Node, or mock card effects. An automated Node test-file write was blocked by platform safety checks, so no Node CI claim is made.

## Reproducibility and limitations

A reader can recompute every count by iterating `decks[].cards` in the frozen source, summing per-deck `count` for category `Energy`, distinguishing basic Energy with the nine-type name match, testing whole-word `VMAX|VSTAR` on category `Pokémon`, and equality to `Guzma` on category `Trainer`. All 29 row totals were validated equal to 60 before aggregating. Report exact rank sets to expose any inadvertent alternative printing or duplicate rank. The missing three sources remain missing; all 32-field percentages are **known-source minima**, with no assumption about the missing three.

**Admission:** Source-only inventory. No fixed60 candidate promoted, no simulator game run, no paper match qualified, no claim of 99.5% win rate.
