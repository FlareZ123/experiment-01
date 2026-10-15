# Pinned Twinleaf: Radiant Eternatus and Forest Seal Stone effect gaps

**Agent 10, 15 October 2026. Status: source-level audit confirmed by pinned-code reducer/prompt tests in manual CI; complete match policy regressions pending.** This identifies concrete branches in pinned upstream Twinleaf code for future game-state tests and research-side hooks. No upstream changes are proposed or committed.

## Scope and sources

- Research submodule pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` in `vendor/twinleaf`.
- [Radiant Eternatus CRZ105 upstream implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts).
- [Forest Seal Stone SIT156 upstream implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-silver-tempest/forest-seal-stone.ts).
- [Effect class definitions](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effects/play-card-effects.ts) and [generic PlayCard reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/play-card-reducer.ts).
- Supplied `resources/advanced-players-rulebook.md`, section H Deck: category-limited deck searches can select fewer than requested, whereas an unrestricted search for any card must select the specified number if available. This corresponds to original supplied Advanced Player's Rulebook, lines 686–701.

## 1. Climactic Gate: zero-result selection bypasses turn end

Printed card text: “When you play this Pokémon from your hand onto your Bench during your turn, you may search your deck for up to 2 Pokémon VMAX and put them onto your Bench. Then, shuffle your deck. **If you use this Ability, your turn ends.**”

Inside `RadiantEternatus.reduceEffect`, confirming the Ability opens a `ChooseCardsPrompt` with `{ min: 0, max: maxPokemons, allowCancel: false, blocked }`, where maxPokemons is at most 2. If the chosen array has zero cards, the callback executes:

```ts
if (cards.length === 0) {
  return state;
}
```

The shuffle prompt and `EndTurnEffect` are located **after** this return. Consequently, this source path has no end-turn dispatch for a **confirmed Ability with zero VMAX selected**. The category-limited “up to 2” search may legally choose zero, and confirming Climactic Gate still commits the player to end their turn under printed text. This is a **high-confidence source-level deviation**, conditional on the engine actually accepting this zero-result selection when the prompt is resolved. [A targeted compiled-engine reducer test](../../tests/radiant-vstar-upstream-characterization.test.cjs) confirms that this branch emits zero EndTurnEffect events with zero selected VMAX, whereas the one-VMAX case emits one EndTurnEffect event. This is direct evidence from actual pinned card classes with synchronous StoreLike callbacks; a full end-to-end match regression remains outstanding.

**Requested test:** During a legal player turn, play Radiant Eternatus from hand onto an empty Bench; respond yes to the Ability; return zero VMAX from deck selection. Assert the turn ends even if VMAX are in the deck, with the appropriate shuffle. Repeat with no VMAX in deck. Compare to the nonzero selection path, which already dispatches EndTurnEffect.

## 2. Star Alchemy: unrestricted deck search exposes zero selection

Printed Star Alchemy card text on Forest Seal Stone: “During your turn, you may search your deck for a card and put it into your hand. Then, shuffle your deck. (You can't use more than 1 VSTAR Power in a game.)”

The pinned `ForestSealStone.reduceEffect` sets `player.usedVSTAR = true`, then creates `ChooseCardsPrompt` over the deck with `{ min: 0, max: 1, allowCancel: false }` and an empty category filter. The supplied rulebook section H states an unrestricted search for any card **must pick** the specified number, when cards are available. In a deck containing at least one card, offering/accepting zero is inconsistent with that selection rule. This is an **interface/configuration gap visible in source**. The actual compiled generic `ChooseCardsPrompt.validate([])` returns `true` for this nonempty-deck case in the linked CI test, so the configuration admits the invalid choice.

**Requested test:** With a nonempty deck and unused VSTAR power, use Forest Seal Stone on a Pokémon V, activate Star Alchemy, and check that choosing zero is rejected; with the deck empty, verify the correct rule-dependent handling. Also test that the VSTAR marker cannot be used a second time.

## Compiled-engine reproduction

Manual-only [GitHub Actions run 38823263120](https://github.com/FlareZ123/experiment-01/actions/runs/38823263120) completed successfully using pinned upstream Node 20.19.0, `npm ci`, `npm run compile`, then the three [characterization tests](../../tests/radiant-vstar-upstream-characterization.test.cjs). The tests use actual compiled card, prompt and effect classes plus a narrow synthetic StoreLike callback test double. They do **not** show exploit frequency under the current automatic player policy or prove a match-level failure.

## 3. Additional lower-confidence questions, not asserted bugs

- The Radiant Eternatus code checks `PlayPokemonEffect` and `effect.pokemonCard === this` without checking `effect.target` Bench; test unusual card effects which might create PlayPokemonEffect pointing to Active, rather than assuming a legal in-turn Active placement exists.
- After confirming Climactic Gate, an empty deck or Bench with zero open spaces can trigger `GameError(CANNOT_PLAY_THIS_CARD)` in the ability body. Determine whether such an attempted announcement is allowed and how denial should be handled, using a real game state and supplied Rulebook's Ability activation conditions.
- Ensure Star Alchemy is usable under relevant card-specific Ability locks according to rulebook and card text. `exemptFromAbilityLock: true` is a deliberate upstream flag, not itself evidence of a bug.

## Research implications

The [exact opening model](../als/radiant-eternatus-opening.md) and its [Forest Seal Stone extension](../als/forest-seal-radiant-access.md) count plausible opening **resource states**, not actual engine action sequences. Missing end-turn semantics can especially bias policy search, because the engine may allow a free, noncommittal Climactic Gate activation. The unrestricted-search behavior can create search outcomes impossible under paper rules.

The reducer tests already confirm both narrow divergences; the full live-game transition and decision-policy consequences remain untested. Implement a **research-owned compatibility hook in `simulation/twinleaf/`** with a pinned-version guard and regression. Do not edit the upstream submodule. Keep the original behavior/version traceable. Until engine regressions are green, no Twinleaf match outcome involving these branches is adequate proof of real paper Expanded performance.
