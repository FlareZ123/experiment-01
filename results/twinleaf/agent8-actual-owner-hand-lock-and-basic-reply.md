# Actual owner-hand play locks and a meaningful Store-accepted Basic reply

**Agent 8, 19 October 2026 UTC. Evidence class:** compiled, retrospectively selected, genuine pinned-Twinleaf Store interaction plus pure action-guard regressions. No prospective opponent cohort, no strength-qualified game.

## Research question

The canonical bilateral-v2 preparation requires an identical final-action legality guard for both physical actors. Does the adapter guard match the native Player's printed attack-origin hand-play restrictions for Pokémon, Ability-bearing Pokémon and evolutions, and can a source turn with a blocked Item or Stadium produce a legal owner-visible Basic Bench alternative instead of automatically passing?

## Current source and intervention

- Pinned Twinleaf commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Source-of-truth native Player flags: `ptcg-server/src/game/store/state/player.ts` has `cannotPlayPokemonCards`, `cannotPlayPokemonWithAbilities`, `cannotEvolvePokemonCards` alongside the existing Trainer and Energy locks.
- Native `playPokemonReducer` rejects global Pokémon play and Ability-bearing cards immediately. Valid evolution in a nonempty target slot rejects `cannotEvolvePokemonCards`. The native Stage enum includes VMAX, VSTAR, Mega, BREAK and LV.X, which the shared live guard now includes in its evolution category.
- Research adapter: `simulation/twinleaf/player-play-lock-veto.cjs`, with matching category enum values provided by the real output modules in `simulation/twinleaf/headless.cjs`.
- Root boundary now passes the *same complete category map* to the optional owner-hand Basic Bench fallback (`simulation/twinleaf/visible-lock-basic-bench-response.cjs`), fixing the prior case where an Item lock triggered the main veto but an incomplete enum map prevented that Basic fallback from recognizing the same lock.
- An independent reversible `withPlayerPlayLockVeto` bot proposal hook now uses the same full native lock categories, while retaining owner and seat gating and `finally` restoration.
- Unit tests: `tests/player-play-lock-veto.test.cjs` (including legacy-call behavior), `tests/visible-lock-basic-bench-response.test.cjs`. Additional real engine parity tests: `tests/player-play-lock-veto-store.test.cjs` (native Player, pinned card instances, and `playPokemonReducer`). **Compiled manual CI [39343203091](https://github.com/FlareZ123/experiment-01/actions/runs/39343203091) succeeded with all 27 focused regressions passing**, including three native Store tests: full Pokémon hand lock, Ability-bearing Wobbuffet PHF lock, and Gloom AOR to Vileplume AOR evolution lock. It independently reproduced the real root-33 alternative and retains zero qualified games.

## Authentic historical action

The frozen original source-locked trial is `6:2:A:champion-reference`, seed `2394734225`, Aichi rank-6 Iron Thorns source seat B (1), rank-1 champion candidate seat A (0), real source cards unchanged. The opponent had used `Shadow Mist` to prohibit the source's Stadium play. The pre-guard source historically proposed `Thunder Mountain Prism Star LOT` at global turn 3, root ordinal 33, where Store rejected `BLOCKED_BY_EFFECT`.

The new opt-in historical replay `simulation/evaluation/agent8-player-play-lock-basic-reply-replay.cjs` preserved both exact printed 60s, source seed, source attack wrapper and 260-root cap. It invoked `enforceVisiblePlayLockBothSeats:true` and `visiblePlayLockBasicBenchFallback:true`.

**Verified compiled CI [39342793196](https://github.com/FlareZ123/experiment-01/actions/runs/39342793196) succeeded.** The live root 33 proposed forbidden `Thunder Mountain Prism Star LOT`, whose player-level `stadium-lock` veto instead selected `BasicBench:Iron Thorns ex TWM`. The actual next root ledger reports a **Store-accepted** `PlayCardAction` placing Iron Thorns ex at ordinal 33, global turn 3, source seat 1. Source later played an additional Iron Thorns ex at root 97, turn 9. Only **one** denied owner-hand play occurred in this replay. The game reached **260** root actions and stopped under the cap, without a qualified terminal competitive result.

CI 39342793196 compiled the upstream pinned simulator, passed **24** focused unit tests for the historical policy test job, ran the actual game and uploaded raw retrospective JSON as artifact `12228874682` (10-day retention). An earlier CI [39342453784](https://github.com/FlareZ123/experiment-01/actions/runs/39342453784) passed the previous 23 unit regressions but failed in the game runner due a pre-existing local variable named `root` shadowing its earlier path binding. Renaming that later `root` to `rootActions` repaired the runner and made the compiled replay possible.

## Interpretation and qualification boundary

This is an existence proof that a genuine previously rejected opponent-policy root can continue with a meaningful Basic instead of automatically passing. The best default action is **not** established: the fallback always selects the first hand Basic into the first empty Bench slot, so it may consume valuable Bench space or lose a matchup. It remains opt-in, and its use must be logged. It does not repair the generic bot's hidden-state leakage, prospective setup competence or the 25-minute paper-clock model.

The native Store tests have now passed in compiled CI 39343203091. Broader common-policy integration, live full-game information-set parity and all-card fidelity remain unqualified; the final guard does not certify every printed mechanic. Run a paired game-policy study only after the canonical caretaker confirms owner-observation parity and appropriate next-turn attack/opponent reply coverage.

**Benchmark unchanged:** 29 of 32 exact Aichi source lists obtained; **zero competitively qualified games**; no validated 99.5% win rate and no newly justified candidate ranking.
