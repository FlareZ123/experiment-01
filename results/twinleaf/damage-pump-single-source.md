# Pinned Twinleaf Damage Pump accepts two different damage sources

**Agent 4, 16 October 2026.** Source-checked card semantic defect, reproduced in the pinned Twinleaf card reducer. This report establishes a constrained reducer regression and reversible test fix. **No full-game Aichi win rates or successful donk frequencies are inferred.**

## Printed rule and Aichi relevance

The published Aichi rank-26 Meloetta Donk deck includes **four Damage Pump LOR 156**. Its text is: "Move up to 2 damage counters from **1 of your Pokémon** to your other Pokémon in any way you like." The phrase **1 of your Pokémon** fixes the source of both counters. The advanced player's rulebook section C-08 distinguishes moving damage counters from damage and requires legal target selection.

The human-documented 2+2+1 self-KO Exeggcute route uses Risky Ruins to set damaged counters on Benched Pokémon, then Damage Pump to finish the Exeggcute KOs. An overly permissive Damage Pump can allow a pair of distinct one-counter donors to jointly finish two Exeggcute, creating lines unavailable under the actual card text. Whether a competent agent would choose one is a separate question.

## Exact pinned-engine cause

Pinned Git submodule: `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, path `vendor/twinleaf`.

The upstream card handler `ptcg-server/src/sets/09-sword-and-shield/set-lost-origin/damage-pump.ts` builds a `MoveDamagePrompt` with options `min:1, max:2, allowCancel:false, blockedFrom:[], blockedTo:[]`, omitting `singleSourceTarget`. The prompt in `ptcg-server/src/game/store/prompts/move-damage-prompt.ts` defaults that constraint to `false`. Its validation therefore permits multiple source targets. The Damage Pump callback then independently resolves each transfer against its own `StateUtils.getTarget` source, instead of preserving one selected source. Separately, the pinned Store's `reducePrompt` does not call `validate` as a mandatory enforcement step. A UI-only constraint would therefore be insufficient.

The source reducer also permits a transfer from a Pokémon back onto itself and can consume a result specifying more individual counters than the selected source has. The adapter guards these cases, too. They are independently invalid under the same printed text and intended two-counter transfer effect.

## Reproducible experiment

- [Five Node regression cases](../../tests/damage_pump_source_contract.test.cjs) construct actual pinned Card, Player, State, MoveDamagePrompt and TrainerEffect instances, using a prompt recorder to isolate the card reducer from UI validation. The fixture has a 20-damaged Unown, 20-damaged Squawkabilly ex, and 20-damaged Exeggcute.
- Unpatched `Damage Pump LOR` accepts one transfer from each donor to the same Exeggcute. Both donors drop to 10 damage; Exeggcute rises from 20 to 40 damage (its printed HP is 30). This demonstrates the source-splitting bug in the reducer; the prompt-recorder test does not run Knock Out resolution.
- [Reversible research-owned adapter](../../simulation/twinleaf/damage-pump-single-source-hook.cjs) marks `singleSourceTarget=true` and validates both transfers inside the card reducer's registered callback before mutating any damage. It rejects multiple donors, source-equals-destination and insufficient source damage, while retaining legal two-transfer cases from one source.
- The hook restores the original `DamagePump.prototype.reduceEffect` and does not edit the vendor submodule. It is currently **opt-in**. Installing the hook is not equivalent to validating every possible card-effect interaction or enabling it in `runMatch`.
- [Manual-only CI workflow](../../.github/workflows/aichi-damage-pump-fidelity.yml), [run 38863392451](https://github.com/FlareZ123/experiment-01/actions/runs/38863392451): pinned submodule checkout, npm ci, TypeScript engine compile, **5 tests passed, 0 failed**. The run used repository head `683281d4bc03ae0048bc9ed7a15d3dfafafd470e` and the submodule pin above.

## Limitations and next gate

The original reducer-only five-test suite now has a second independent [live Store dispatch suite](../../tests/damage_pump_store_dispatch.test.cjs). It builds a real pinned Store with two players and six occupied Prizes each, registers a real Damage Pump prompt, and resolves it with `ResolvePromptAction`. Unpatched dispatch accepts the illicit split, reducing two donor Pokémon from 20 damage each to 10 each and raising an Exeggcute from zero to 20. With the hook enabled, the same dispatch throws `INVALID_PROMPT_RESULT` before mutating damage; a legal double transfer from one donor succeeds. The [second manual CI run 38863903201](https://github.com/FlareZ123/experiment-01/actions/runs/38863903201) passed **8/8 tests**, including all three Store-dispatch checks. This closes the specifically identified real Store prompt-validation gap.

A separate [headless wrapper](../../simulation/twinleaf/damage-pump-corrected-match.cjs) now installs and restores the research hook across `runMatch`, adding explicit `damagePumpSingleSourceCorrection: true` and the policy suffix `DamagePumpSingleSource-v1`. A [bounded integration smoke suite](../../tests/damage_pump_corrected_match.test.cjs) passes the wrapper through the real `runMatch` path, asserts metadata and restoration after both success and an invalid request. [Manual CI run 38864384276](https://github.com/FlareZ123/experiment-01/actions/runs/38864384276) passed 10/10 total tests.

The companion [live Meloetta self-KO fixture](../../tests/meloetta_damage_pump_two_prizes.test.cjs) now plays Exeggcute from hand into Risky Ruins, legally moves one donor's two counters onto both eggs, and confirms the first **two** opposing Prize cards through real Store knockout resolution. An extended same-turn test exercises **2 + 2 + 1** self-KOs with two real Exeggcute cycling through discard, repeated `UseAbilityAction('Propagation')`, re-Benching under the Stadium, and three valid Damage Pump uses from three distinct donors, one donor per Pump. Opposing Prize cards decrease **6 → 4 → 2 → 1**, with no premature game end. [Manual CI run 38865151837](https://github.com/FlareZ123/experiment-01/actions/runs/38865151837) passed **12/12 tests** across isolated reducers, Store dispatch, wrapper smoke and the full staged five-self-KO progression. This demonstrates executable prepared-board legality of the Prize-enabling subline.

**Remaining limits:** The first-turn five-KO Prize-enabling route has been reproduced from a staged board with available cards and donors. The fixture does not establish how often the 60-card rank-26 deck assembles that state, the final Crisis Punch attack, actual game victory, donor access from realistic hands, competent policy choices or opponent counterplay. Future experiments should finish a legal first-player attack on the resulting one-Prize defender and demonstrate realistic seeded setup and responses before interpreting matchup results.

**Strategic implication:** Any reported Meloetta donk setup rate generated without enforcing Damage Pump's single-source text is suspect if its choices exploit split-source transfers. This does not mean past completed games exploited the defect; no such usage has been established.
