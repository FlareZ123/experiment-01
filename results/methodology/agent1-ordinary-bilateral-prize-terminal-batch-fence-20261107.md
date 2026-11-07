# Agent 1: ordinary terminal bilateral Prize changes require batch-level adjudication

**7 November 2026.** Conservative classifier evidence-quality change, following actual compiled pinned Store counterexample inspection. This is neither a corrected game-engine outcome nor a competitive win-rate update.

## The observed problem

The uploaded **Advanced Player's Rulebook v3.4**, I.E, specifies simultaneous outcomes. Two players taking their last Prize cards as part of the same unresolved resolution produce a **tie**. The earlier shared `simulation/evaluation/terminal-cause-evidence.cjs` added a 16-case post-transition paper result table, but a post-transition public snapshot is **insufficient** to know whether the engine prematurely finished before fulfilling the second player's KO Prize entitlement.

The original Agent24 [pinned ordinary simultaneous KO fixture](https://github.com/FlareZ123/experiment-01/commit/3391a5e532b83adb23dab14007766e2e085af3b0) is a particularly clear counterexample. It uses genuine original rank11/rank20 physical 60s and actual Store KO reduction, but stages **four owned Prize cards moved to each player's hand and simultaneous lethal Active damage inside the same Store dispatch**. The independent full-batch projection records **two initial Prize cards remaining for each player**, two authentic 2-Prize KO entitlements, and a projected **both-player last-Prize tie**. The pinned engine instead awards the first claimant and reports physical **seat0 winner**, with after-reducer Prize state `[0,2]`. This is a **synthetic developer fixture**, not a paper-legal match, and cannot itself establish the frequency of such transitions in gameplay.

My independent `tests/agent1-terminal-ordinary-double-ko-admission.native.test.cjs` retains the actual `headless.cjs` public terminal transition for that existing fixture, without changing Agent24's reducer staging. Initial [compiled native CI 42338534744](https://github.com/FlareZ123/experiment-01/actions/runs/42338534744), pinned checkout `78619bc46af932cc9f53d07ea0fcd23bb0f02d0c`, reported:

| Public/native field | Actual recorded value |
| --- | --- |
| Tiebreaker flag, before and after | **false / false** (ordinary epoch) |
| Public Prize counts, before dispatch | **[6,6]** |
| Public Prize counts, after dispatch | **[0,2]** |
| Public in-play Pokémon counts, before / after | **[2,1] / [1,1]** |
| Native winner | **seat0** |
| Prior basic-table classifier | `observed-sufficient-conditions` with `winner-took-final-prize` |
| Independently projected fully settled simultaneous KO outcome | `SIMULTANEOUS_TIE` |
| Paper game qualified | **false** |

**Interpretation must preserve chronology:** The public *before dispatch* snapshot was captured before the artificially staged four Prize moves and lethal damage in the intercepted dispatch. Therefore its `6→0` and `6→2` Prize changes **combine artificial preparation and actual native KO effects**. The unqualified prior classifier label is an example of a *public-snapshot-only false admission from a staged intervention*, not a measured naturally occurring game error rate. Agent24's independent native KO entitlements establish the potential premature native resolution; the current public terminal snapshot does not expose those entitlements.

## Narrow improved conservative gate

A public `FINISHED` transition in a **verified ordinary (non-tiebreaker) epoch** now first checks the supplied **paper table** for a directly visible tie or opposite basic result. If a tie or opposite result is already visible, `paper-basic-result-conflict` remains authoritative. If the after snapshot does not directly refute the native winner, the classifier checks whether **both physical players' Prize counts decrease inside the same recorded terminal dispatch**:

`after.players[0].prizesRemaining < before.players[0].prizesRemaining && after.players[1].prizesRemaining < before.players[1].prizesRemaining`.

If yes, the new **`bilateral-prize-settlement-unverified`** disposition retains the native engine winner for auditing, emits **no sufficient paper winner condition**, and increments `bilateralPrizeUnverified` inside `engineTerminals` and `unresolvedTerminals`. It **cannot declare the game a tie** because the public snapshot does not include all card-level Prize entitlements and their resolution order; non-KO Prize effects and special card text may also apply. Even a genuine correctly settled bilateral Prize award requires independent paper adjudication before promoting a winner.

The shared classifier continues to distinguish the [native sudden-death epoch](agent1-terminal-tiebreaker-epoch-admission-20261107.md), where the full tiebreaker Prize batch and strict remaining-Prize comparison are required regardless of whether the two Prize totals in the public snapshot move.

**Important limitation:** This gate detects recorded **bilateral Prize changes** and directly visible basic ties. An engine ending prematurely **before the opponent's first Prize card is moved** may not trigger this detector. Such outcomes still need proper native KO-batch instrumentation, independent rules, and competent full matches. Thus the revised classifier produces narrower evidence claims, without asserting complete game-outcome fidelity.

## Tests and reproducibility

- Modified `simulation/evaluation/terminal-cause-evidence.cjs` (new category and summary count), preserving the basic simultaneous 16-case truth table's priority.
- Extended `tests/terminal-cause-evidence.test.cjs` with two synthetic regression tests: bilateral Prize loss cannot certify observed winner; both players visibly at zero Prizes remains an explicit paper tie.
- Updated `tests/agent1-terminal-ordinary-double-ko-admission.native.test.cjs` to assert native source-source staged transition is quarantined.
- Kept the separate [real native replay epoch SFT](agent1-real-native-replay-terminal-epoch-admission-20261107.md) to confirm true-positive `suddenDeath` before/after Store flags.
- Manually dispatched `.github/workflows/agent1-issue25-baseline-sham-v9-native.yml` with **two** opt-in jobs: (i) same original 24-game v15 native A/B/A, with both original and new classifier unit regressions, and (ii) the two compiled staged original-60 native admission fixtures. [CI 42338829136](https://github.com/FlareZ123/experiment-01/actions/runs/42338829136) was **pending** when this note was initially created; no pass claim is made until the exact run finishes and the logs are read.

**Status remains 29/32 original source inventories, zero competitively paper-qualified games, no selected final fixed 60, no demonstrated 99.5% win rate.**
