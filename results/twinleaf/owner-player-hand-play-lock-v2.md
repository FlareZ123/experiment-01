# Twinleaf owner-visible final hand-play lock dispatch guard, v2

**Agent 8, 19 October 2026. Evidence type: pinned-code correspondence and new source-unit regression, with manual compiled CI pending.** This is mechanical-action admissibility research, with zero independently qualified competitive games.

## Problem and source-backed scope

The historical Aichi rank-6 Iron Thorns source arm `6:2:A:champion-reference` (seed `2394734225`) proposed Thunder Mountain Prism Star on global turn 3 despite the previous actual Shadow Rider V **Shadow Mist** attack; pinned Store returned `BLOCKED_BY_EFFECT` on root action 33. The source action and acting hand were recorded in [the first failure audit](../aichi-2026/agent6-rank6-shadow-mist-rejected-stadium.md). The Advanced Player's Rulebook C-19 treats “cannot play cards from hand” as an effect on the **player**, persisting across a Pokémon switch. This reproduces one illegal decision, not a win.

Pinned `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` declares live player flags in [player.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/state/player.ts): `cannotPlayItemCards`, `cannotPlaySupporterCards`, `cannotPlayStadiumCards`, `cannotPlayToolCards`, `cannotPlayEnergyCards` and `cannotPlaySpecialEnergyCards`. Pinned [card-types.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/card/card-types.ts) maps `TrainerType.ITEM`, `SUPPORTER`, `STADIUM`, `TOOL` separately and `EnergyType.BASIC` versus `SPECIAL`. Both are exact vendor sources rather than inferred API names.

## Implementation boundary

A preexisting [owner-hand veto](../../simulation/twinleaf/player-play-lock-veto.cjs) only checked Stadium and Special Energy. This extension now checks all six listed restriction flags by comparing the **real PlayCardAction actor ID** against the owner, taking the exact card from `owner.hand.cards[action.handIndex]` and examining its pinned supertype/subtype. General Energy lock is checked first, with Special Energy lock next. Calls that omit the three newly optional Trainer-subtype enum values retain their former limited semantics.

The opt-in real-root [headless](../../simulation/twinleaf/headless.cjs) option `enforceVisiblePlayLockBothSeats:true` passes the actual pinned enum values to the veto and selects the live active actor. Its provenance version increments to `+LivePlayLockDispatchVeto-v2@both`. Neither default headless behavior nor the registered 60s are changed. A single-seat historical mode remains for regression. Actor hand and public player flags are the entire input; no concealed opponent resources or speculative game outcomes are consulted.

The current fallback after a veto is normally **PassTurnAction**; only an independently configured, already legal Supporter path exists in older historical single-seat experiments. This can preserve engine execution while missing other real legal actions, and a Pass cannot automatically count as an adequate tactical answer.

**Explicit exclusions:** Pokémon hand-play locks (`cannotPlayPokemonCards`, `cannotPlayPokemonWithAbilities`) and evolution-specific flags are separate pinned engine features. The current guard does not model them. It also does not certify normal attachment limits, Trainer once-per-turn limits, Item target validity, full actual printed card effects, information-set-correct policy, or match strength.

## Tests, reproducibility and decision

[Four new pure test cases](../../tests/player-play-lock-veto.test.cjs) cover Item/Supporter/Tool category independence, Energy precedence, wrong-actor and unrelated-category proposals, and old adapter callers. Previously existing tests check Stadium and Special Energy, which must remain unchanged. Source commits: `46ae03febf3c6aeda1c6c30279ce0e9bec7372b2`, `68cc7b205c54335e44c8d8e7b76611cc35fa1325`, `8b4dd212b6bc940e5e46bbb91fb58f2d562e1ccf`.

Targeted manual workflow `aichi-source-locked-campaign.yml` with `agent41_crossrank_trial=true`, `trial_ids=agent8-player-lock-veto` was dispatched as [run 39282855122](https://github.com/FlareZ123/experiment-01/actions/runs/39282855122). **At initial publication the run is queued; there is no passing compiled-test claim.** This specific replay reuses a retrospectively known failing seed and is a regression, never prospective win evidence. Inspect the actual run conclusion and test logs before integrating the v2 provenance label into new common bilateral games.

A handoff to the [Agent41 bilateral integration owner](../../communications/agent41/20261019T160839Z_agent8_owner_hand_play_lock_v2.md) provides the exact interface and warns about source-policy Pass fallback. Only a separate fixed-policy, start-balanced, information-safe prospective opponent comparison could inform the target 99.5% win rate. Field source coverage remains **29/32**, with **zero** qualified games.
