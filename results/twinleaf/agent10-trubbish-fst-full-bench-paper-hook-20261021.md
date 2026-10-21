# Agent 10: FST Trubbish full-Bench attack reducer compatibility

**21 October 2026 | Narrow paper-rule/engine discrepancy and reversible research hook.** This is a blocker correction for the genuine rank-11 historical policy error; it is **not** a competitive result.

## Reproduction and exact source mechanism

[Agent 39's real rank-11 E1R1 development arm](../aichi-2026/agent39-natural-evolution-paid-retreat-factorial-20261021.md) aborted at source seat A root246, turn48, when Trubbish FST 168 attempted its printed **Call for Family** with five occupied Bench slots. A read-only rereun identified the rejected attack and [native failure](https://github.com/FlareZ123/experiment-01/actions/runs/39554951972); the aborted game was at public remaining Prizes [6,3]. No final outcome was established.

The supplied Advanced Player's Rulebook, Section I/II **C-11** (p.31, immediately following the Call for Family style examples), specifies that a search-to-Bench **attack** with a full Bench ends without searching the deck. The pinned [Trubbish FST implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/trubbish.ts) uses `SEARCH_YOUR_DECK_FOR_POKEMON_AND_PUT_ONTO_BENCH`. In pinned [prefabs.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/prefabs.ts), this helper unconditionally invokes `BLOCK_IF_NO_SLOTS`, which throws `NO_BENCH_SLOTS_AVAILABLE`. The prefab is suitable for some Trainer/Ability contexts but does not implement this attack's required full-Bench no-op.

## Native turn-continuation source audit

In the same pinned engine, [`player-turn-reducer.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/player-turn-reducer.ts) translates the actor's `AttackAction` into `UseAttackEffect`. [`game-effect.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/game-effect.ts) runs `useAttack`: after legal attack-cost checking, it enters `GamePhase.ATTACK`, invokes `store.reduceEffect(state, attackEffect)`, then proceeds through attack animation, damage and `AfterAttackEffect` handling, finally scheduling `EndTurnEffect` in the non-Barrage branch. Thus suppressing **only** Trubbish's illegal full-Bench search in its printed attack reducer allows the engine to *attempt* the ordinary attack continuation. This is a source-level control-flow trace and not proof that the real Store fully settles without another exception or timing problem. The original rank-11 aborted branch remains a genuine unresolved game until a full native replay.

## Published-Aichi field exposure and independent native contrast

The supplied English card pool was screened for printings with attack text of the form *search deck, then put Pokémon onto Bench*. I compared those **165 broad text-pattern candidates** with the printing IDs in the repository's [29 published source 60s](../aichi-2026/full-decklists.json). Three ranks matched this textual screen, which is **not an exhaustive simulator implementation census**:

| Published rank | Exact printed card | Copies in source 60 | Native code behavior on full Bench |
| --- | --- | ---: | --- |
| 2, Vileplume Control | Pidgey MEW 16, Call for Family | 2 | [Pinned bespoke reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-pokemon-151/pidgey.ts) sets `max=Math.min(openSlots,2)` and directly returns State when `max===0`; **paper-correct** for this condition |
| 11, Absol/Garbodor | Trubbish FST 168, Call for Family | 2 | Unconditional generic prefab call reaches `BLOCK_IF_NO_SLOTS`; **paper discrepancy** |
| 22, Absol/Garbodor | Trubbish FST 168, Call for Family | 1 | Same printed class and risk as rank 11 |

The rank-2 Pidgey behavior is a useful *positive implementation control*: it shows that the exact paper full-Bench termination is already represented correctly in one pinned native reducer. It avoids generalizing Trubbish's fault to every search-to-Bench attack. I extended the existing pinned-class regression to assert that a genuine Pidgey `AttackEffect` with five occupied Bench slots returns the unchanged State without prompting. The Pidgey test is **source-reviewed, not yet executed against compiled Twinleaf**. No additional opponent lists were discovered, and exact coverage remains 29/32.

## Implementation and verification level

[Research-owned reversible hook](../../simulation/twinleaf/agent10-trubbish-fst-full-bench-paper-hook.cjs) intercepts only genuine `AttackEffect` class instances whose `attack` is **the first printed attack of a pinned FST Trubbish instance**, while the attacking player's full Bench has no empty native slots. It returns the unchanged game State, suppressing only the forbidden search; the native engine continues the ordinary attack/turn resolution. Every other reducer call delegates to the original native implementation. `finally` restores the original prototype even when execution fails. Audit counters count reducer calls, **not** physical matches or legitimate game outcomes.

- [Pure behavior/restoration regressions](../../tests/agent10-trubbish-fst-full-bench-paper-hook.test.cjs) cover full Bench, open slot, second attack, unrelated effect and exception restoration.
- [Native pinned-class regression](../../tests/agent10-pinned-trubbish-fst-full-bench-paper-hook.test.cjs) creates genuine `Trubbish`, `Player`, `PokemonCardList`, `AttackEffect` and a complete five-slot Bench, checking that the unmodified reducer throws while the scoped wrapper terminates without requesting a search.
- Existing manual-only [Twinleaf smoke workflow](../../.github/workflows/twinleaf-smoke.yml) now includes the two regressions after native compile. No per-commit or additional workflow was created.
- Local Node syntax checking and a minimal dependency-injected full-Bench/prototype-restore smoke test passed on 21 October 2026. These are **not** equivalent to the pinned native class regression or a completed game.
- The attempt to dispatch the existing manual workflow through the connected GitHub Actions action was explicitly **blocked by the tool**, so there is **no claimed compiled CI pass** for this change. The fixture and hook are ready for another authorized manual execution.

## Next decision gate

An authorized caretaker should run the existing manual smoke test, inspect a real native Store trace if successful, then version a minimal **opt-in** around the already registered E1R1 rank-11 source-deal arm. Maintain all policy flags, exact cards, seat, seed, prior source roots and the earlier E1R1 error as baseline. The corrected source turn must have the same legal attack declaration, skip deck search, pass through genuine attack resolution and allow the next actor to decide. If downstream engine actions differ, keep both branches. This is a specific paper-fidelity test, not permission to count an engine terminal as a match win.

**Benchmark status:** 29/32 exact opposing source 60s, zero qualified competitive games, 99.5% target unverified. 
