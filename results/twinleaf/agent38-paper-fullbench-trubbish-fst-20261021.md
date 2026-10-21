# Pinned Twinleaf Trubbish FST full-Bench attack rule defect and reversible paper C-11 correction

**Agent 38, 21 October 2026. Status: real pinned reducer reproduced and corrected; full-game validation pending.** This is a research-side engine fidelity repair, not a fixed-deck comparison or win-rate measurement.

## Original genuine Store failure

Agent39's immutable same-checkout four-cell natural evolution (E) versus paid retreat (R) experiment ([report](../aichi-2026/agent39-natural-evolution-paid-retreat-factorial-20261021.md)) observed **E1/R1** champion fixed 60 against rank11 Mega Absol/Garbodor source, initial seed **623585882**, actual candidate-first seat B, native error on source Action ordinal **246**, global turn **48**: `NO_BENCH_SLOTS_AVAILABLE`. Public source Active was **Trubbish FST 168** using its printed `Call for Family` attack, with all five source Bench slots occupied. Candidate already had **three Prizes taken** in that interrupted branch. The frozen baseline archive is [CI 39552367029](https://github.com/FlareZ123/experiment-01/actions/runs/39552367029). It is an interrupted development game, not a source win or candidate loss.

The supplied Advanced Player's Rulebook **C-11** (Putting Basic Pokémon onto Bench) specifically states: when a full Bench prevents an attack from putting Pokémon there, **the attack ends without placing a Pokémon, before deck search**. C-11 separately disallows an analogous Trainer/Ability in a full-Bench state. The distinction is strategically important: declaring a nondamaging printed attack remains a legal way to end the turn, and an otherwise complete game must not be aborted.

## Exact pinned source cause

Twinleaf upstream pinned SHA `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

1. `ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/trubbish.ts`: `Trubbish FST`, attack 0 `Call for Family` damage 0, calls `SEARCH_YOUR_DECK_FOR_POKEMON_AND_PUT_ONTO_BENCH(store,state,effect.player,{stage:Stage.BASIC},{min:0,max:1})` in the native `AttackEffect` reducer.
2. `ptcg-server/src/game/store/prefabs/prefabs.ts`: the helper calls `GET_PLAYER_BENCH_SLOTS(player)` and then unconditional `BLOCK_IF_NO_SLOTS(slots)`, which throws `GameError(GameMessage.NO_BENCH_SLOTS_AVAILABLE)` when Bench is full.
3. Thus this printed attack is rejected inside its effect reducer, rather than ending after its valid declaration. No other card implementation or paper mechanic was assumed in deriving this defect.

## Research-owned correction and independent test

- `simulation/twinleaf/agent38-paper-fullbench-callforfamily-hook.cjs`: reversible prototype wrapper around **only** pinned full-name `Trubbish FST` and its matching first printed `Call for Family` attack. The original native `WAS_ATTACK_USED` guard verifies the exact attack object; native `GET_PLAYER_BENCH_SLOTS` checks public Bench occupancy. On full Bench, the wrapper returns the same `state` from this one card reducer without attempting search. Native Store still controls attack end and turn transition. Open Bench, other printed attacks and all other effects delegate to the original reducer. Fails closed if printing, reducer class, attack name or damage changes. Installs and restores with `finally`; reports `skippedSearches`.
- `tests/agent38-paper-fullbench-callforfamily-hook.test.cjs`: seven pure tests for full/open Bench, attack and other effects, exception restoration, mismatching print, duplicate installation.
- `tests/agent38-trubbish-fst-fullbench-native.test.cjs`: actually loads the compiled pinned `Trubbish FST`, constructs an actual `AttackEffect`, observes native `NO_BENCH_SLOTS_AVAILABLE` before correction, observes unchanged state and skip count with correction, and observes the original native error again after restoration.
- **Compiled CI verification:** [manual run 39561306855](https://github.com/FlareZ123/experiment-01/actions/runs/39561306855), immutable checkout `54936687891a0a2c00ce8209bd30938147d23711`, compiled Twinleaf successfully and **8/8 targeted new tests passed**. Overall workflow **failed later** in an unrelated pre-existing setup fingerprint smoke test `tests/headless-initial-source-deal-smoke.test.cjs:33`, TypeError dereferencing null `headless.cjs:942` (17/18 old smoke tests passed). Do not label the whole workflow green or conflate this old failure with the new hook tests.

Canonical `simulation/evaluation/agent41-bilateral-v2-development.cjs` on main provides default-off `AGENT38_PAPER_FULLBENCH_TRUBBISH_DEV=true` both-seat wrapper; per-arm audit `paperFullBenchCallForFamilyAudit` and separate version label preserve historical default behavior. This opt-in does **not** certify engine semantics outside the one printed attack.

## Live fixed-deck replay protocol

To test the failing E1/R1 native turn, use Agent39's preserved paid-retreat branch, unchanged seed 623585882 and complete frozen 60s with natural evolution ON, paid retreat ON, **actor-level full-Bench attack filter OFF**, and the native reducer correction ON. The parallel actor-public filter from Agent39's `agent39-fullbench-nativeloop-20261021` branch is strategically useful, but it skips announcing the attack, so it cannot independently certify the engine's ability to settle a legally announced full-Bench attack.

I created isolated experimental branch `agent38-native-fullbench-e1r1-20261021`, branched from Agent39's frozen `fb9c44598fe9a2b9f36ef0936c35a891f04e5ada` policy branch. It contains the exact hook, an optional workflow input `native_fullbench_paper` (default OFF), actor paid retreat and natural evolution enabled, and branch-local corrections to Agent39's six failing pure test fixtures (catalog argument order and real pass-intent shape). Source cards and candidate cards are unmodified. Same native Store decision prefix, original source-deal digest, actual root246 attack choice, return turn, physical Prizes and terminal outcome **must** be independently audited; merely avoiding a throw does not prove same-state counterfactual or competitive strength.

The full Aichi Top32 field remains **29/32** independently verified exact source 60s. **Zero games are qualified for competitive win-rate inference**. The target of **99.5%** is unverified.
