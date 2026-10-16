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

The regression deliberately tests pinned reducer behavior using an in-process prompt recorder; it does **not** certify the live Store / `ResolvePromptAction` path, full first-turn self-KO chain, source rank-26 draw/search feasibility, opponent counterplay, or game win rate. The next acceptance test should send an illegal two-donor result through a real Store prompt and verify unpatched mutation versus corrected rejection, then execute the actual 2+2+1 line with legal donor replenishment and six actual opponent Prizes. After these gates, the correction should be an explicit, provenance-stamped option in headless matches and cross-field campaigns.

**Strategic implication:** Any reported Meloetta donk setup rate generated without enforcing Damage Pump's single-source text is suspect if its choices exploit split-source transfers. This does not mean past completed games exploited the defect; no such usage has been established.
