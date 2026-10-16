# Agent 32: rank-6 missed Stadium-to-attack counterfactual

**16 October 2026.** Paper-rules tactical line reconstructed from one recorded pre-pass state. Engine action acceptance and resulting game outcome **unverified**.

## Source state

Successful [Aichi six-game diagnostic CI 38842936054](https://github.com/FlareZ123/experiment-01/actions/runs/38842936054), artifact 12022625370, trial `pilot:6:0:hood-shield-v1:B`, global turn **21**, opponent seat **0**, pass ordinal **187**.

- Active Iron Thorns ex, zero damage, Tool Palace Belt; Energy attached: Spiky (Colorless), Capture (Colorless), Speed Lightning (Lightning).
- Three Benched Iron Thorns ex, making the `Volt Cyclone` Energy-movement target available.
- Wondrous Labyrinth Prism Star in play adds one Colorless to attacks of non-Fairy Pokémon; Iron Thorns ex's [Lightning, Colorless, Colorless] attack costs **four** units at the saved pass state. Only three attached, so the immediate attack cannot be paid.
- The opponent's **visible decision hand** includes `Thunder Mountain Prism Star LOT`.
- The only recorded turn-21 actions before passing are attaching Speed Lightning Energy, playing Team Flare Grunt, and resolving its discard prompt. No Stadium was played on turn 21. The candidate's immediately preceding turn 20 ends in `PassTurnAction`, so no just-used Shadow Mist attack is present in that trace.

## Counterfactual under printed paper rules

1. **Play Thunder Mountain Prism Star** from hand, replacing Wondrous Labyrinth. Different-named Stadium replacement is allowed once per turn. Wondrous Labyrinth protects itself from Item/Supporter effects, not replacement by a Stadium.
2. Thunder Mountain makes Lightning Pokémon attacks cost one Lightning less. Iron Thorns ex's `Volt Cyclone` [Lightning, Colorless, Colorless] is reduced to [Colorless, Colorless], which three attached Energy units easily pay.
3. **Attack with Volt Cyclone**, printed **140 damage**, moving one attached Energy to any of the three Benched Iron Thorns ex. The visible opposing Active is undamaged Shadow Rider Calyrex VMAX with Stealthy Hood.

This provides a plausible paper-legal, attack-producing line on a turn the generic policy instead passed. The prior [Special Energy cost audit](agent32-iron-thorns-special-energy-pass-screen.md) correctly identified the immediate Stadium-modified shortage; it did not account for the playable Stadium *in the hand* that can resolve the shortage.

## Qualification / requested regression

The chronological trace is deliberately incomplete. Before calling this a confirmed **engine-accepted missed attack**, replay the pinned Store state with the identical hand and public board, both Stadiums, active Tool and prior-turn restriction state. Record whether `PlayCardAction(Thunder Mountain)` is accepted and whether `AttackAction(Volt Cyclone)` resolves 140 damage plus one Energy transfer. Compare against the original pass and a control with Thunder Mountain absent.

Source card texts from supplied JSON: `sm8-191` Thunder Mountain, `sm9-158` Wondrous Labyrinth, `sv6-77` Iron Thorns ex, `sv9-159` Spiky, `swsh2-171` Capture and `swsh2-173` Speed Lightning. This is a **tactical policy counterexample candidate**, not a deck ranking, game-win result or 99.5% claim.

## Additional sequence check and opportunity cost

The same trace records `PlayCardAction Wondrous Labyrinth Prism Star` by opponent seat 0 at **turn 7, action 60**, well before turn 21. The rank-6 frozen deck has exactly one Wondrous Labyrinth and one Thunder Mountain. No later Stadium action through ordinal 187 is recorded, strengthening the inference that the once-per-turn Stadium play remains unused on turn 21. This remains a partial trace rather than an omniscient engine log.

Replacing Wondrous also gives up its ongoing extra-Colorless attack tax against the opponent's non-Fairy Pokémon. The proposed line establishes **action reachability**, while strategic superiority would require a counterfactual opponent response and subsequent turns. The opponent might rationally preserve the lock instead of dealing 140 damage immediately, so describe this as a missed *available action sequence*, not as a demonstrated bot misplay or win-rate gain.
