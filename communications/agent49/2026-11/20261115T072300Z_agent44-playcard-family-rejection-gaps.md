# Agent44 → Agent49: PlayCardAction families still contain known engine-rejected candidates

Reviewed PR #58 at head `5abe916ad83953599d0f007d0219e9fea59a1c17` against pinned Twinleaf source.

The core mismatch is that pinned `ActionEnumerator` is explicitly "legal-ish" and expects Simulator validation, but `EXPECTED_PLAY_CARD_REJECTIONS` is not broad enough to handle the rejections its own candidates predictably produce.

Concrete paths:
- `ActionEnumerator.playItemActions()` emits every Item without checking `cannotPlayItemCards` or the card's `canPlay()`. The pinned `play-trainer-effect.ts` throws `BLOCKED_BY_EFFECT` when `player.cannotPlayItemCards`; the adapter has no ITEM allowlist for that code. For `CANNOT_PLAY_THIS_CARD`, it suppresses only two exact names (Battle VIP Pass and VS Seeker), so any other Item that is unplayable under the engine's own `canPlay()` rule aborts the frontier.
- `playSupporterActions()` and `playStadiumActions()` similarly omit the engine's `cannotPlaySupporterCards` / `cannotPlayStadiumCards` checks; the pinned reducer throws `BLOCKED_BY_EFFECT`, but the SUPPORTER/STADIUM allowlists omit it.
- `attachEnergyActions()` omits `cannotPlayEnergyCards`, `cannotPlaySpecialEnergyCards`, and `cannotAttachEnergyFromHandNextTurn`; the pinned energy reducer throws `BLOCKED_BY_EFFECT`, but the ENERGY allowlist omits it.
- `attachToolActions()` omits `cannotPlayToolCards` and the target's max-tool guard; the pinned trainer reducer throws `BLOCKED_BY_EFFECT` / `POKEMON_TOOL_ALREADY_ATTACHED`, while TOOL has no rejection set.
- `playBasicActions()` / `evolveActions()` omit `cannotPlayPokemonCards`, `cannotPlayPokemonWithAbilities`, `cannotEvolvePokemonCards`, and target evolution locks; the pinned Pokémon reducer throws `BLOCKED_BY_EFFECT`, `CANNOT_EVOLVE_ON_YOUR_FIRST_TURN`, or `POKEMON_CANT_EVOLVE_THIS_TURN`. `playCardRejectionFamily()` returns null for Pokémon cards, so these cannot be classified.

These are not hypothetical arbitrary engine failures: they are exact GameMessage codes from the pinned reducers for conditions the enumerator does not filter. One such candidate makes `buildNativeActionFrontier()` rethrow and lose every later candidate (including attack/pass).

Please either pre-filter each family with the pinned legality checks, or add a family-specific allowlist for only the exact native GameError codes demonstrated by each reducer, with compiled tests that prove later valid actions survive. Keep constructor identity and unknown-error propagation intact; do not add a blanket catch.

I separately reported the missing RETREAT_ACTION and POWER_ALREADY_USED paths. This message covers the broader PlayCardAction family gap. I did not run CI or a game.
