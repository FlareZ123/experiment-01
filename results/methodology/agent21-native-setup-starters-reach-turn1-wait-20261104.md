# Actual native setup progression: owner Basic selection reaches turn 1 DRAW

**Agent 21 | 4 November 2026 | development-policy qualification evidence only.** Extension of [GO_FIRST to owner setup selection](agent21-native-owner-go-first-to-starter-boundary-20261104.md). Source rank 5, both real source-seat configurations, historical registered original candidate pairs. No selected field-wide policy or competitively qualified game.

## Native and code provenance

- Reused manually dispatched workflow [run 41767318381](https://github.com/FlareZ123/experiment-01/actions/runs/41767318381), **SUCCESS**, checkout `1f954e66fa2f865cd577b422f68c4b8c88fff59d`, [artifact 13292714173](https://github.com/FlareZ123/experiment-01/actions/runs/41767318381/artifacts/13292714173), pinned vendor `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
- Actual archived JSON SHA-256 `9deff4ea6ad6cb0e6d4200ba384f82960f88cbd5e68c666dd753bdc63c1f149e`, fixed rank-5 registration and physical printed inventories protected by historical preflight.
- [Owner-only initial Basic choice](../../simulation/twinleaf/agent21-owner-setup-starting-basics.cjs) and [unit controls](../../tests/agent21-owner-setup-starting-basics.test.cjs) implement the pinned [`CHOOSE_STARTING_POKEMONS` setup](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/reducers/setup-reducer.ts) on an exact owner hand. The passed [`ChooseCardsPrompt` native validation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/choose-cards-prompt.ts) validates the selected object list before the adapter returns a real `ResolvePromptAction`. Only printed Basic or `PLAY_DURING_SETUP` tagged cards from the acting owner's hand are selected.
- The developmental starter preference is first eligible Active, all additional eligible owner-hand Basics on Bench up to 5. It is mechanically simple and not optimized. The actor handler does not inspect the opposing hand, deck or Prizes. The inherited native scorer remains strictly quarantined.

## Observed native boundary progression

| Original rank-5 source seat | Native owner GO_FIRST completions observed | Native owner starting-Basic choices observed | Next blocked raw-State bot call |
| --- | --- | --- | --- |
| 1, registered group `5:0:A` | 2 on seat 0, answering GO_FIRST false | 4 choices across **both** acting seats; per first pair: seat 0 picks 1 Basic, seat 1 picks 3 Basics | Seat 1, **turn 1**, `phase:8` DRAW, pending `WaitPrompt` |
| 0, registered group `5:0:B` | 2 on seat 1, answering GO_FIRST false | 4 choices across **both** acting seats; observed selected counts 2/1 then 2/2 | Seat 0, **turn 1**, `phase:8` DRAW, pending `WaitPrompt` |

The original native decoder is reported as **never executed**. Each group was interrupted by the typed `OWNER_INFORMATION_NATIVE_FALLBACK_QUARANTINED` once the simulation reached the draw animation/wait boundary, and reported two attempted blocked native decoder calls. As before, repeated decisions in each registered group are continuation/retry attempts and should not be counted as independent randomized games.

This is a **real progress witness**: owner-observation decisions on both physical seats allow the native engine to move from its setup `ConfirmPrompt`, through player-hand `ChooseCardsPrompt` for starting Pokémon, and reach its first turn's DRAW-phase transition. It is narrower than a paper-rule-complete setup certification; this audit lacks a full starter/Prize physical receipt and original player deal fingerprint and does not test strategic opener optimality.

## Next bounded interface

At the same pinned Twinleaf revision, [`initNextTurn`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/effect-reducers/game-phase-effect.ts) inserts a `WaitPrompt` with no message and `showVisual:false` as an animation/transition barrier before `GamePhase.PLAYER_TURN`; base [`Prompt.validate`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/prompt.ts) allows a null result. The native generic bot's fallback also returns `ResolvePromptAction(prompt.id,null)` for unknown prompts. An owner-only handler restricted to the exact nonvisual, message-free turn transition can acknowledge this wait without accessing hidden card state; such a handler needs separate native validation before advancing the policy boundary.

**Release status remains blocked:** zero qualified games, 29/32 original source inventories, no competitive release, no 99.5% evidence. Tactical owner root choice, paper payment, full hidden-information noninterference, opponent play and official clock are still unproven.
