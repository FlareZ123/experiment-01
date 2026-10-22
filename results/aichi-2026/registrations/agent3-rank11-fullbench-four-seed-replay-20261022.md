# Agent 3: registered rank11 original-Store full-Bench Call for Family restoration

**Registered 22 October 2026 UTC, prior to treatment code or native execution.**

## Hypothesis

The original [Agent50 preregistered four seeds](agent50-rank11-four-new-seeds-guzma-energy-20261021.md) were exhaustively archived in [Agent3's failure-inclusive original Store replay](../../aichi-2026/agent3-rank11-failure-inclusive-native-store-20261022.md). Three of eight arms ended on `Trubbish FST / Call for Family` when the source player's Bench contained five Pokémon, throwing `NO_BENCH_SLOTS_AVAILABLE`. The supplied Advanced Player's Rulebook §II.C-11 makes this an attack that resolves without searching the deck, so an isolated paper fidelity hook should suppress precisely those three errors and allow their continuations.

## Frozen intervention

- The same unchanged printed rank11 Absol/Garbodor source 60 and New Moon candidate 60, physical seats source0/candidate1, and four registered seeds **17984023, 1407148205, 2612415444, 2584586627**.
- Original Twinleaf revision **a9905a76a6c4103ba4b6cb9a49e86bad795c5c05**, same Agent50 source-side Marnie/Guzma and staging OFF/ON policy, source-first actual seats as dealt, identical root cap and no tournament clock.
- Start from the [failure-inclusive provenance branch](https://github.com/FlareZ123/experiment-01/tree/agent3-failure-inclusive-source-r11-20261022) pinned at **2deefe83a05a292639d0f1de57fbf84e630333d9**. Retain the unmodified original archive in [CI 39705893257](https://github.com/FlareZ123/experiment-01/actions/runs/39705893257). Frozen control is the original archived eight arms; treatment runs all eight same-policy arms with exactly **`paperFullBenchCallForFamily:true`** on each `executeDevelopment` call. No other engine or policy options change.
- Existing pinned research-owned reversible hook `simulation/twinleaf/agent38-paper-fullbench-callforfamily-hook.cjs`, currently default OFF, must be used unchanged. Its `WAS_ATTACK_USED` guard skips only `Trubbish FST`'s card-reducer search call when `GET_PLAYER_BENCH_SLOTS` is empty. It does not skip the native AttackAction, print eligibility or damage/effect resolution. The underlying vendor remains unchanged.
- Execute via the existing manually dispatched `twinleaf-smoke.yml` workflow on an isolated branch, with `agent50_marnie_native_pair=true`; no new workflow or push trigger.

## Pass/fail gates and unbiased reporting

Preserve **all eight** original prospective attempts, including new failures, aborted and capped games. For each registered seed record control/treatment original source-deal fingerprint parity, native accepted actions before/after the failing root, paper-hook audit skipped-search count, error/terminal status, all resulting source/candidate attacks and public Prizes. Do not equate equal legacy root hashes with identical physical target geometry.

Expected under a scoped correction: the complete unaffected seed1407148205 212-root pair stays identical; seed2584586627 retains its unrelated typed same-target Energy prompt error; seed2612415444 control retains its unrelated spent GX refusal while its treated arm may progress past ordinal50; seed17984023 both arms may progress beyond ordinal178. Divergent accepted roots caused only after full-Bench condition count as conditional mechanism validation. Unexpected earlier divergence, changed source deals or other errors must be reported without cherry-picking or adjustment.

**Evidence class:** mechanical error recovery from existing four unselected development deals, with unqualified two-seat policy and untimed native outcome. The Aichi Top32 99.5% objective is not assessed; **0 competitive-qualified game results** even if corrected arms reach natural terminals.
