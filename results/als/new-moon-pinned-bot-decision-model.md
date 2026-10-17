# Agent 13: why upstream generic Twinleaf tactics cannot qualify New Moon's first lock attack

**17 October 2026, Agent 13.** Evidence class: inspected **exact pinned Twinleaf upstream commit** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` and compared it to repeated source-dealt trace observations. These are software-policy findings, not claims about Pokémon legality or game-win strength. **Upstream code remains unchanged.**

## The actual decision pipeline at the pinned revision

- [SimpleTacticsAi](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics-ai.ts) enumerates configured tactics in order. It picks the first `useTactic` result accepted by `isValidAction`; if none qualifies it dispatches `PassTurnAction`. Unrecognized prompts are resolved as `null`.
- [UseAbilityTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/use-ability-tactic.ts) considers `UseAbilityAction` on in-play Pokémon with `useWhenInPlay` and chooses only when resulting projected **immediate state score strictly exceeds baseline**.
- [SimpleTactic.evaluateAction](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/simple-tactics.ts) simulates a candidate action and resolves all pending prompts with generic resolvers before taking the new state score. Hence it is incorrect to assume Perfection always receives zero score *merely because it creates a prompt*. Its copied-attack choice and downstream actions do influence that evaluation.
- The pinned [ChooseAttackPromptResolver](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/prompt-resolver/choose-attack-prompt-resolver.ts) collects unblocked attacks and sorts them by **`b.damage - a.damage`** and then by longer Energy cost. It returns the first. It contains no special treatment for `Horror House-GX` (zero damage), hand-lock timing, whether `Night Watch` is attack-ready on that turn, or the intended Dusclops/Ace Trainer line. Printed damage is not a calibrated reward for a turn of opponent hand suppression; arithmetic on nonnumeric damage strings is also not a reliable universal attack ranking.
- The pinned [AttackTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/attack-tactic.ts) evaluates each **Active printed attack** by a state score and picks one only if its score beats an attack-bonus-adjusted threshold. A native `Gengar & Mimikyu-GX` opener is therefore not guaranteed to declare its zero-damage Horror House under this policy.
- [StateScore](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/state-score/state-score.ts) sums hand, player, opponent, Active, Bench, Energy, Damage, Tools and Special Condition subscores. It has no dedicated explicit term for a turn of opponent prohibited hand plays, delayed GX hand-compression synergy, opponent next-turn legal-action set, or opponent optimal response. Some indirect correlation through immediate subscores is possible, so this is a **representation gap**, rather than proof the resolver never selects Horror House in any state.

## Corroborating authentic deal evidence

The manually dispatched [same-seed source/Lockbreaker paired source diagnostic CI 39024907658](https://github.com/FlareZ123/experiment-01/actions/runs/39024907658) was instrumented to distinguish direct attacks from Perfection:
- **Zero** candidate direct `AttackAction` and **zero** `UseAbilityAction('Perfection')` across eight rank6/rank8 source-dealt games.
- One `Reconstitute` Ability occurred in the eighth arm; **176 `PassTurnAction` decisions** were recorded in total.
- **Zero** Field Blower or Cologne plays were recorded in each arm.
- All eight source games **started the candidate first**, despite the published New Moon pilot's stated desire to go second to attack on the earliest turn.

The stronger synthesis is that these specific complete source-deal samples **failed to exercise the attack, choice, lockbreak, and preferred opening-turn channels the deck was designed to use**. It does not establish how often meaningful legal attacks were available or that the default policy always fails; a source-state affordance audit is still necessary. The [full policy-exposure gate](new-moon-lockbreak-policy-exposure-gate.md) describes that qualification standard.

## Narrow research-side policy patch worth testing

Implement as a **separately identified opt-in research adapter** outside `vendor/twinleaf`, scoped to New Moon candidate actions only:

1. On a candidate going-second first attack turn, if the Active is native `Gengar & Mimikyu-GX`, GX is unused and a real `AttackAction('Horror House-GX')` is legal, prioritize that action before the default damage-score attack tactic. Preserve a refusal path if the move is forbidden or no legal Energy is attached.
2. If Active is `Mewtwo & Mew-GX`, `Perfection` is actually unblocked, GX is unused, the `Gengar & Mimikyu-GX` payload is on the Bench or in discard, and its printed GX attack is legal on real prompts, explicitly choose that payload's `Horror House-GX` instead of the generic highest-raw-damage copied attack. Account for getting attacker into Active before first attack.
3. Later, where Dusclops self-KO makes Ace Trainer legal and a three-Psychic copied `Night Watch` is available, prioritize the right conditionally sequenced hand compression. Do not blindly use `Horror House` on every turn or assume the opponent has no response.
4. Log every offer/denial with paper-relevant cause (attached Energy, GX flag, Ability lock, Item restriction, Bench/discard payload, Stadium, opponent visible Active) and compare to original generic bot **on the identical source deal and actual first-turn stratum**.
5. Validate the actual pinned Store `PlayCardAction`/Ability/attack reducers and opponent next-turn actions. Repeated wins or losses from the unqualified generic bot cannot be promoted as strength evidence.

This proposal is conditional and **unimplemented** here. A smaller [native-Gengar Store action probe](../../simulation/twinleaf/new-moon-native-gengar-action.cjs) is authored but not compiled or verified; no derived win-rate claim is warranted.
