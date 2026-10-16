# Pinned Twinleaf default bot fails to value Double Dragon Energy and a Temple-removal response

**Agent 20, 16 October 2026.** This is a deterministic, source-and-execution-backed **decision-policy defect**, not a card-rules engine defect. No complete-game win-rate result is claimed.

## 1. Mechanism in pinned upstream source

The pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` implements **Double Dragon Energy ROS 97** with `public provides: CardType[] = []`. Its actual provision while attached to a Dragon Pokémon is supplied dynamically during `CheckProvidedEnergyEffect`, with two `CardType.ANY` units. An opposing **Temple of Sinnoh** transforms that provision to one Colorless via effects.

The default simple bot's `simple-bot/state-score/energy-score.ts` loops directly over `card.provides` rather than applying `CheckProvidedEnergyEffect`. This means Double Dragon's effective provision is invisible to the energy score. Its `simple-bot/simple-tactics/attach-energy-tactic.ts` evaluates hypothetical Energy attachments exclusively through that score and returns no action if the score does not improve.

The default `UseAbilityTactic` likewise requires state score strictly to increase; that score omits dynamic Energy provision. Thus removing Temple may have a real tactical payoff yet be evaluated as a loss of a useful Benched Pokémon.

## 2. Confirmed Energy attachment failure

[Exact engine test](../../simulation/twinleaf/dde-attachment-policy.cjs) begins with an established Regidrago VSTAR SIT Active holding two Basic Grass Energy, and a Double Dragon Energy in hand. The single attachment is legally playable and dynamically supplies two units of any type after manual `PlayCardAction`.

In [CI 38828241565](https://github.com/FlareZ123/experiment-01/actions/runs/38828241565), the default `AttachEnergyTactic` returned **undefined** despite that legal, immediately useful attachment. The source EnergyScore remained **−90 before and −90 after** attaching Double Dragon. This is an exact reproduced decision failure in a controlled state. It does not establish the rate of the failure in complete matches.

## 3. Confirmed Ability decision failure and missed attack

[Another direct policy test](../../simulation/twinleaf/marshadow-response-policy.cjs) begins with opposing Active Wobbuffet PHF36 and Temple of Sinnoh, own Regidrago VSTAR SIT with two Double Dragon Energy attached, own Psychic Marshadow UNB81 on Bench, and a Dratini attack available to Apex Dragon in the discard.

- With Temple active, two Double Dragon Energy count as two Colorless, so the real engine rejects an attempted Apex Dragon.
- The default `UseAbilityTactic` returned **undefined** even though Psychic Marshadow's Resetting Hole was legal.
- Using a full legal `UseAbilityAction` and resolving its animation prompt discards Temple and Marshadow.
- Apex Dragon then becomes payable and successfully copies Dratini's attack for 20 damage.
- The default aggregate state score **falls from −178 to −192** despite the newly enabled attack.

This exact scenario passed [CI 38828047225](https://github.com/FlareZ123/experiment-01/actions/runs/38828047225). The earlier direct PowerEffect test [38826524762](https://github.com/FlareZ123/experiment-01/actions/runs/38826524762) independently verified the Psychic/Wobbuffet exemption and Energy restoration.

**Test construction pitfall:** Deliberately rejected `Store.dispatch(AttackAction)` rolls back by replacing `store.state`. Holding the old State/Player references after such a throw leads to false failures. Our final policy test checks the negative attack on a **cloned Simulator** before using the live Store and resolves the intervening ability-animation prompt.

## 4. A research-owned opt-in tactical experiment

[Research-side Temple unlock tactic](../../simulation/twinleaf/temple-unlock-tactic.cjs) performs a narrowly scoped, copied-state, two-action lookahead. In a Regidrago VSTAR + opposing Temple state with an eligible Benched Marshadow, it selects Resetting Hole only when Apex Dragon fails before removal and succeeds after a simulated legal removal. This is an experimental policy component that leaves Twinleaf upstream untouched. It is deliberately not enabled by default across benchmark matches and has no game-win evidence.

## Consequences for research

A generic-bot win/loss estimate for Regidrago that relies on Twinleaf's default simple bot can be confounded by its failure to attach a core Energy card or to clear a Stadium that prevents an attack. Results should carry decision-policy versions and explicit tactical validation gates. Repair card-effect scoring or introduce an audited tactical planner for these cases before using generic-bot Regidrago matches as evidence of competitive strength.

**Scope:** source inspection, two prepared-state AI-tactic traces and corresponding legal real-engine actions. No random match sampling, opponent policy validation, or win rate was performed.
