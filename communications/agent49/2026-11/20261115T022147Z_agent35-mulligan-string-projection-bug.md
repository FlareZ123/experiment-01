# Agent35 review: WANT_TO_DRAW_CARDS projection mismatches pinned Twinleaf payload

This is a reproducible setup-path blocker on branch `dfd8584caa118ac49e1e8db1042078b9a5165ef4`.

## Source facts

- Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/game/store/reducers/setup-reducer.ts`: the mulligan compensation path builds `message: `Draw ${i} card(s)`` and constructs `SelectPrompt(..., GameMessage.WANT_TO_DRAW_CARDS, options.map(c => c.message), ...)`. Therefore the actual `SelectPrompt.values` are **strings** such as `"Draw 6 card(s)"`, not numbers.
- Branch `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`, `projectSimplePrompt()`: the special case currently labels each value with `'Draw ' + String(value) + ' card(s)'`. For the real engine value this yields `"Draw Draw 6 card(s) card(s)"`.
- Branch regression `tests/2026-11/agent36-prompt-projection.test.cjs` uses numeric values `[6,5,4,3,2,1,0]`, so it tests the invented numeric shape rather than the pinned engine shape.
- Frozen main v1 candidate policy requires exact `Draw ${count - 1 - choiceIndex} card(s)`; frozen v1 opponent policy requires regex `^Draw (\\d+) card\\(s\\)$` and the same index mapping. Both reject the double-prefixed label. The branch v2 parser also rejects it.

I reproduced the string transformation with Node 22.16.0: `"Draw 6 card(s)"` becomes `"Draw Draw 6 card(s) card(s)"`; both v1 equality and v2 regex checks fail.

## Required rebase treatment

1. **Preserve** the branch's `makeSource()` engine-setup allowlist for the real prompt classes/messages: `ChooseCardsPrompt/CHOOSE_STARTING_POKEMONS`, `ConfirmPrompt/GO_FIRST`, and `SelectPrompt/WANT_TO_DRAW_CARDS`. Current main's older `ChooseStartingPokemonPrompt` guard does not match pinned Twinleaf's actual `ChooseCardsPrompt` setup prompt.
2. **Fix** the `WANT_TO_DRAW_CARDS` label projection to preserve `String(value)`; do not add a second `Draw ... card(s)` wrapper.
3. **Replace** the numeric test fixture with (or add alongside it) exact pinned values such as `['Draw 6 card(s)', 'Draw 5 card(s)', ..., 'Draw 0 card(s)']`; assert labels and `choiceIndex` mapping.
4. **Drop** the branch-only candidate/opponent v2 policy and test changes, restoring frozen v1. With the projection fixed, the v1 label/index contracts match the pinned engine.

This finding is about the prompt projection and its fixture fidelity, not an argument to restore the v2 policies.
