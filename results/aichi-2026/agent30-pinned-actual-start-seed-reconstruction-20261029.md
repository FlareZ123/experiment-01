# Agent 30: the reported actual-start imbalance is exactly reproducible from registered seeds

**29 October 2026 | evidence class: pinned source-code derivation + full 16-seed pure reconstruction | game-competence qualification remains zero.**

## Discovery

The [29 October independently seeded 32-arm scout](agent41-prospective-canonical-scout-native-20261029.md) reported 26/32 source-first actual starts. All eight independent candidate-seat-B seeds started the source first. That imbalance appeared to demand an engine coin-flip investigation before any new balanced trial.

The frozen runner supplies an exact explanation: the research [headless wrapper](../../simulation/twinleaf/headless.cjs) calls its seeded xorshift32 RNG for the setup `CoinFlipPrompt`, returning `random() < 0.5`. The [pinned upstream setup reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts) next asks the coin winner the `GO_FIRST` `ConfirmPrompt`. The pinned [ConfirmPromptResolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/confirm-prompt-resolver.ts) unconditionally answers **false**, meaning **the coin winner chooses to go second**. Consequently, the coin loser takes the first actual turn, regardless of which physical seat holds the candidate.

The wrapper's initial xorshift32 draw is:
```js
let state=seed>>>0;
if(state===0)state=0x9e3779b9;
state^=state<<13;
state^=state>>>17;
state^=state<<5;
const firstDraw=(state>>>0)/0x100000000;
const coinWinner=firstDraw<0.5?'A':'B';
const actualStarter=coinWinner==='A'?'B':'A';
```

This is a **pinned setup-specific predictor**, requiring the coin flip to consume the first random draw and both bots to use the current default ConfirmPrompt behavior. Changes to seed consumption, initial setup, custom player options or vendor revision invalidate it until tested anew.

## Reproduced four source-rank/seat cells

The registered `agent41-prospective-canonical-32-20261029.json` has exactly 16 distinct random seeds: four for each rank and physical candidate seat. The table counts **source-first independent seed groups**, with two candidate inventories per group:

| Source rank | Candidate seat | Seeds | Predicted source-first | Native report source-first |
| ---: | :---: | ---: | ---: | ---: |
| 6 | A | 4 | **3** | **3** |
| 6 | B | 4 | **4** | **4** |
| 11 | A | 4 | **2** | **2** |
| 11 | B | 4 | **4** | **4** |
| **All** | | **16** | **13** | **13** |

Thus the 26/32 outcome is exactly **two times thirteen source-first seed groups**. Candidate-seat B contains eight seeds whose *first random draw* makes B the coin winner; its bot picks second, and source A starts. The skew is explained by the already-registered sample and fixed default player choice. It does **not** prove nonrandom coin flipping or a systematic first-player advantage. It also does **not** imply per-seed identical whole-board deals when swapping the candidate sixty.

The [pure independent-seed classifier](../../simulation/evaluation/agent30-pinned-starter-strata.cjs) and [four Node regression tests](../../tests/agent30-pinned-starter-strata.test.cjs) reproduce the cell counts, distinguish actual starter from physical seat, and reject duplicate seed groups. This calculation is source-grounded; these new tests are not yet claimed to have passed compiled native CI. The historical scout's **actual observed turns** remain authoritative if they disagree with any forecast.

## Prospective design correction

The meaningful fix is **preregistered stratification before running any game**. For a desired cell defined by source rank, physical candidate seat and actual first player, generate independent CSPRNG seeds and accept only those whose pinned first-coin sample predicts that start. Commit the accepted seeds, draw order, rejected-start-only seed counts, frozen 60s and policy/engine fingerprints before executing the cohort. The selection criterion concerns only an exogenous pregame coin/seat result and is independent of game outcomes, so it does not involve retrospective favorable-deal cherry-picking. Report source-first and candidate-first separately; if claiming field-wide performance, weight those strata by the intended real-play starting-turn distribution rather than an arbitrary balanced sample.

**Do not force the initial turn midgame, alter the current benchmark's frozen plan or promote a rebalanced collection of the old results.** Once the code changes, repeat a native first-turn observer control and verify the `GO_FIRST` prompt semantics. A new cohort should preserve failed attempts and caps and test genuinely competent source strategies. The starting-seat correction removes one experimental-design ambiguity while leaving the main source-policy and clock blockers unsolved.

**Current competitive evidence remains unchanged:** 29/32 exact original opponents; 0 competitive-qualified games; no validated 99.5% fixed 60.
