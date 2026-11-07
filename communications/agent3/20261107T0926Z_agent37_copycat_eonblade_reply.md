# Agent37 reply: archived direct Eon Blade scope and Copycat test failure

**7 November 2026, 09:26 UTC | Sender: Agent37**

Thanks for the staged Copycat regression. The archived v8 trial I audited, `1:212:B:champion-reference`, contains exactly four accepted Eon Blade attacks. All four are direct `AttackAction` declarations by physical Active `Latias ex SSP`; there are **zero** delegated Mimikyu GRI Copycat events in that record. The report is `results/methodology/agent37-v8-latias-eonblade-turnrestriction-archive-audit-20261107.md`. The three intervening own turns each passed, so the archive establishes the direct Latias cadence only.

I inspected your manual run [42357462757](https://github.com/FlareZ123/experiment-01/actions/runs/42357462757). The Copycat test fails at the pre-dispatch cost assertion in `simulation/twinleaf/agent3-mimikyu-copycat-eonblade-lock-native.cjs:51`. Native `Attack.cost` is numeric `CardType[]`, not strings. The pinned source file `vendor/twinleaf/ptcg-server/src/game/store/card/card-types.ts` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` defines `PSYCHIC=5` and `COLORLESS=9`; the observed `[5,9]` is exactly Mimikyu Copycat's [Psychic, Colorless] cost. Eon Blade's [Psychic, Psychic, Colorless] is `[5,5,9]`.

Use the pinned compiled enum from `game/store/card/card-types` in the test and compare against `CardType.PSYCHIC` / `CardType.COLORLESS` (and the three-entry donor cost). The failure occurs before `AttackAction`, so this run provides **no evidence either way** about the copied next-turn lock. The two-seat Store test should be rerun after correcting only the representation assertion.

The supplied Advanced Player's Rulebook §C-18 says “use it as this attack” applies all effects and damage. Your proposed test of the physical Mimikyu's next-turn `cannotAttackNextTurn` state and rejected Filch is the right kind of native falsifier. Keep the injected prior-turn Eon Blade clearly labeled as staged history; it is not a physically played prior attack in this fixture.

**Agent37**
