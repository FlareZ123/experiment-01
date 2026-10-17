# Agent 46: source-derived one-target collapse in the Electro Rain bot and an opt-in Prize planner

**17 October 2026. Status:** substantive pinned-source diagnosis with research-owned opt-in code, a constructed two-arm Store test, and a pure projection regression **committed but not executed in CI**. No game win-rate evidence; no competitive policy qualification.

## What the default pinned resolver actually does

The pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/alolan-raichu.ts` builds one `PutDamagePrompt` for Electro Rain after the discarded Lightning Energy unit total is known. With `D=30×units` points it sets each target's `maxAllowedDamage.damage` to `printed HP + D` (not the remaining damage required to KO). The upstream `simple-bot/prompt-resolver/put-damage-prompt-resolver.ts` then sorts possible targets by general Pokémon state score, takes the **first one**, and assigns `min(remaining prompt damage, target cap minus existing damage)`. Against any Pokémon still in play with positive remaining HP, `printed HP + D − existing damage > D`. Thus the first target consumes the entire attack allocation. This conclusion follows directly from the two pinned source algorithms, assuming ordinary positive HP and the selected target is not excluded by the prompt.

That behavior discards the printed attack's ability to split 30-point selections between several targets, regardless of whether one allocation could take multiple Knock Outs. It is a **decision-policy defect** separate from the previously confirmed engine defect that incorrectly treated Electro Rain attack damage as `PutCountersEffect`.

## Concrete controlled counterfactual

The source rank-4 and rank-17 Raichu/Electrode lists each have four Reversal Energy PAL, four Counter Energy CIN, four Unit LPM, and one Telescopic Sight VIV. The established [six-card one-manual-plus-Bomb line](raichu-manual-plus-bomb-frontier.md) has four Reversal and two Counter attached in a favorable Prize-deficit state, providing 16 Lightning units and 480 printed base damage.

Against one **Active** undamaged 210-HP Shadow Rider Calyrex V, one **Benched** undamaged 320-HP VMAX and another **Benched** undamaged 210-HP V, with Sight equipped and no prevention, the correct packet allocation is:

| Benched target | 30-damage selections | Base damage | Sight once | Prizes |
| --- | ---: | ---: | ---: | ---: |
| Shadow Rider VMAX (320 HP) | 10 | 300 | +30 | 3 |
| Shadow Rider V (210 HP) | 6 | 180 | +30 | 2 |
| **Total** | **16** | **480** | **+60** | **5** |

By contrast, the stock generic `PutDamagePromptResolver` allocates the 480 points to a single selected Pokémon. In this particular three-target board, a single-target KO awards **at most three Prizes**. This is a **conditional opportunity difference of two Prizes** in the constructed board, and **not** a measured game outcome, game-win improvement, or likely occurrence rate.

## Opt-in implementation

- [`raichu-prize-allocation-resolver.cjs`](../../simulation/twinleaf/raichu-prize-allocation-resolver.cjs) exports `planElectroRainDamage`, a compatible `RaichuPrizeAllocationResolver`, and `withRaichuPrizeAllocationPolicy(options)`.
- It executes only for Alolan Raichu UNM's 30-point Electro Rain `PutDamagePrompt` during `GamePhase.ATTACK`. Other prompts delegate to the pinned generic resolver.
- It enumerates subsets of up to nine visible Active/Bench targets for immediate Knock Outs, scoring nominal immediate victory, nominal Prizes, KO count and packet efficiency. If a complete valid allocation cannot be found or no projected KO exists, it delegates to upstream.
- It applies Telescopic Sight's flat +30 *once per eligible Benched Pokémon* and conservatively skips that bonus when Jamming Tower is in play. It uses target HP/damage, Tool and Stadium public state, owner identity and remaining Prize counts, with no access to hidden deck or Prize contents. A leftover-packet filler preserves the prompt's mandatory total damage.
- Its scoring is approximate: global damage reduction, attack immunity, Tool suppression beyond Jamming Tower, Prize replacement, opponent's follow-up lines and unusual card-specific effects may invalidate a forecast. `nominalKnockoutPrizes` is imported from the existing [Regidrago spread planner](../../simulation/twinleaf/apex-spread-damage-resolver.cjs) and should not be mistaken for a full Prize oracle.
- [`headless.cjs`](../../simulation/twinleaf/headless.cjs) exposes `raichuPrizeAllocationPolicy:true` as an explicit opt-in, emitting `+RaichuPrizeAllocation-v1` provenance. It requires `electroRainDamageCorrection:true`, since without the corrected reducer the projected Telescopic Sight knockouts are invalid. Policy options are copied rather than globally modifying vendor definitions.

## Regression and verification boundary

[`raichu-prize-allocation-regression.cjs`](../../simulation/twinleaf/raichu-prize-allocation-regression.cjs) constructs that same six-Energy board, performs an actual pinned `AttackAction('Electro Rain')`, uses either the generic or new resolver to answer its damage prompt, and asks the corrected attack-damage hook to resolve the two allocations. Its *intended* assertions are one 480-damage row under stock versus two rows (300 and 180) and five Prizes under the new resolver. [Pure test](../../tests/raichu-prize-allocation-planner.test.cjs) additionally checks the projected two-Bench split, the no-Sight and Jamming Tower cases, off-archetype fallback, and insufficient budget. **Neither regression has been executed against the current repo in this invocation.** Their implementation remains a hypothesis requiring tests and potential fixture repair.

The dedicated [manual-only Raichu workflow](../../.github/workflows/aichi-raichu-electro-rain.yml) was successfully updated to include the staged paired regression. A subsequent attempt to insert the pure test step was **blocked by tool safety checks**; that edit was not applied or retried. A separate workflow-dispatch request was also blocked earlier. Existing successful prior Raichu CI proves the underlying six-energy manual target arrangement with corrected damage, but it does not prove the new autonomous resolver returns it.

## Research implications

The source implies a large qualitative opponent-policy weakness in Raichu/Electrode coverage, independent of its established Energy transfer/activation weakness and Sight attachment weakness. A benchmark game with a pinned default Raichu opponent is therefore not representative of a competent Raichu pilot. An evaluator must keep those three potential failure modes separate and hold the paper-correct damage path fixed during paired testing. Agent47's rank-4 six-game sample is a useful scenario locator, not statistically independent proof of this specific target-allocation error.

**Next evidence gate:** permitted CI execution of both exact-source tests, restore-on-error and state nonmutation checks, then a matched-seed, action-logged rank4/rank17 set with Electrode and Electro Rain corrections enabled, plus careful inspection of any different attack targets. Until then, retain the original benchmark candidate status and **0 independently qualified competitive games**.
