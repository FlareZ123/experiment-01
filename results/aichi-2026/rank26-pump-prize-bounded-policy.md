# Rank-26 Damage Pump: one-counter recovery and opponent-Prize-bounded self-KOs

**Agent 4, 18 October 2026.** Result class: corrected candidate decision logic, pure regression tests, and compiled **source-card-conserved staged Store effects**. This is **not** a natural-source opening, finished game, player-policy qualification, or win-rate evidence.

## Problem and bounded correction

The previously registered `rank26-autonomous-cologne-pump-v2` shared profile delegates Damage Pump decisions to `simulation/twinleaf/rank26-exeggcute-pump-policy.cjs`. Its original helper `exeggcutePumpMoves` counted two ready Exeggcute and demanded a single donor with 20 damage. It returned no move if only one transferable 10-damage counter existed, although the printed Item permits a legal single-counter move and one Exeggcute at 20/30 damage can be Knocked Out with that counter.

More critically, a two-Exeggcute plan that awards the opponent both remaining Prize cards would immediately lose the game. The corrected helper accepts the **public count** of occupied opposing Prize slots, not hidden Prize identities. Its priorities are:

- Select two ready, 20-damage Exeggcute only when one non-Exeggcute Benched donor has at least 20 damage **and** the opponent still has at least three Prizes.
- Otherwise select one ready Exeggcute when any non-Exeggcute Benched donor has at least 10 damage and the opponent has at least two Prizes.
- Do not select another deliberate self-KO when the opponent has one or zero Prizes left.

The policy retains the original first-source-turn guard, excludes opponent seats and turns, and yields to the registered held-Canceling-Cologne first action. Its helper depends on the public Bench, its owner's own hand and the **number** of opponent's remaining Prizes. It does not inspect hidden Prize identities or either deck.

**Boundary:** This safeguard applies to the selected opt-in Damage Pump tactic. On states where it returns no action, the generic Simple Bot remains responsible for all other moves, including any separately selected Item. It has not been shown to prevent all other game-losing actions or to know when self-KO is strategically worthwhile.

## Reproduced validation

| Gate | Evidence | Outcome |
| --- | --- | --- |
| Single-counter donor, no combined two-donor inference | [eight decision regressions](../../tests/rank26-exeggcute-pump-policy.test.cjs) | Pass |
| Two self-KOs with six opposing Prizes | [source-card-conserved staged Store](../../simulation/twinleaf/rank26-pump-source-conserved-fixture.cjs) | Pass in both physical seats |
| Fifth self-KO with two opposing Prizes | Same fixture, four earlier awarded Prizes staged into opponent's hand | Pass in both physical seats; one Prize remains |
| Printed-source conservation and exact root prompts | Same fixture; checks 60 distinct physical instances, `PlayCardAction`, `MoveDamagePrompt`, `ResolvePromptAction`, `ChoosePrizePrompt` and discard/Bench/donor damage | Pass |
| Combined pinned workflow | [manual Actions run 39125086795](https://github.com/FlareZ123/experiment-01/actions/runs/39125086795), research head `0706d503d2f3d561cad0714a6737ba2d90efea5f` | Success |

The shared fixture had been **dormant behind an opt-in workflow switch**. Enabling it unconditionally in the already manual-only workflow exposed a stale `Dedenne-GX UNB` hardcode, whose identifier was absent from the resolved rank-26 60; this caused [CI 39124466343](https://github.com/FlareZ123/experiment-01/actions/runs/39124466343) to fail. A speculative dynamic Dedenne-GX prefix also failed in [CI 39124846928](https://github.com/FlareZ123/experiment-01/actions/runs/39124846928). These were **test-construction errors**, not demonstrations of a Damage Pump engine rule failure. The final fixture instead uses actual source `Bunnelby PRC` as its non-Darkness third donor, conserves each 60-card source inventory, and passed in [CI 39125086795](https://github.com/FlareZ123/experiment-01/actions/runs/39125086795). These historical failures are retained for provenance.

## What has not been established

The source-registered Meloetta deck's winning line uses five self-KOs, returning Exeggcute through Propagation, recovering Prize pressure and converting to an actual `Technical Machine: Crisis Punch` attack. This experiment starts with both damaged Exeggcute and a prepared damaged Bench, a Risky Ruins Stadium, an exact source Item already in hand and an artificially specified remaining Prize count. It does **not** independently establish how those pieces were obtained through legal first-turn actions, whether a source-dealt policy would choose them, whether the final attack is charged, whether the defending deck can respond competently, or a terminal result. The four fixture arms are tests of the same controlled state, **not four independent games**.

Future tests should combine authentic source-dealt first-turn setup, automatic source-visible Propagation/re-Benching, legal Damage Pump actions, Koko Energy acceleration, Tool attack declaration/resolution, and an autonomous opposing answer without promoting a staged success to a game win. The larger Aichi target remains **29 of 32 published full 60s, zero independently qualified competitive games, no target-qualified nominee**.
