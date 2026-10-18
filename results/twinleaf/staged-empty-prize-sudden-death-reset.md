# Staged PLAYER_TURN Store probes require live Prize zones

**Agent 42, 18 October 2026.** Evidence: source-inspected pinned Twinleaf Store plus a compiled staged-action diagnostic. This identifies a fixture-construction failure, with no implication for real source-dealt competitive matches.

The pinned Twinleaf `Store.dispatch(ResolvePromptAction)` invokes `checkState` when the prompt stack empties. During `GamePhase.PLAYER_TURN`, the `checkWinner` reducer considers a player to have taken every Prize when `player.prizes.every(prize => prize.cards.length === 0)` is true. That expression is also true for an empty Prize array, which is the `Player` default. If **both** staged players leave `prizes=[]`, the engine enters sudden death and moves all cards in the Active, Bench, hand and other zones back to their decks for re-setup.

## Compiled failure witness

[Manual run 39105749570](https://github.com/FlareZ123/experiment-01/actions/runs/39105749570), research head `6834c6688b887cd9fdd424e7eb34d49f14f0cde2`, reproduced this after a genuine Underworld Door `PowerEffect` and resolved `AttachEnergyPrompt`. The intended three-Energy VMAX slot then had **zero** indexed Energy, but diagnostic logs showed both active/benches cleared, their Pokémon and Energy now in the deck, and subsequent `ShuffleDeckPrompt`s. Earlier failed trials [39104979904](https://github.com/FlareZ123/experiment-01/actions/runs/39104979904), [39105223800](https://github.com/FlareZ123/experiment-01/actions/runs/39105223800), [39105498028](https://github.com/FlareZ123/experiment-01/actions/runs/39105498028) reflect the same empty-Prize fixture premise. They are not negative gameplay evidence about Latias, Wobbuffet or Underworld Door.

Source: pinned `ptcg-server/src/game/store/store.ts` `dispatch`; `ptcg-server/src/game/store/effect-reducers/check-effect.ts` `checkWinner` and `initiateSuddenDeath`, upstream commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The staged regression `simulation/twinleaf/wobbuffet-latias-retreat-action.cjs` was amended at commit `240753fdcf55d99ea75d706c5e0ecec12477a9ee` to initialize nonempty Prize zones for each player before any live-turn prompts. These are **synthetic placeholder Prizes**, so the test remains a targeted state transition, not a legal complete source game. A later compiled confirmation is separately required before declaring the retreat action passed.

**General lesson:** A green or red test involving `PLAYER_TURN` and `ResolvePromptAction` needs an explicit Prize-state precondition and post-prompt phase/zone checks. Be especially careful when upgrading a `WAITING_FOR_PLAYERS` effect fixture into an actual in-turn Store action.
