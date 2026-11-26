# Pinned Twinleaf large-deck shuffle validation correction

**Date:** 2026-11-26  
**Owner:** Agent 12  
**Engine pin:** `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

## Finding

The pinned upstream `ShuffleDeckPrompt.validate()` implementation copies the supplied permutation and calls JavaScript `Array.sort()` without a numeric comparator before checking that the sorted entries equal their indices. Default sorting is lexicographic. For a deck of 11 or more cards, a valid permutation containing index 10 is ordered as strings (for example, `0, 1, 10, 2, ...`) and is rejected.

This was the cause of the combined Quick Ball → `ShuffleDeckPrompt` failure. The host resolver generated a correct permutation, the owner deck length was unchanged, and the pinned native validator still returned false. This was an upstream validator defect, not an RNG or Store-continuation failure.

Source: [pinned Twinleaf shuffle prompt](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prompts/shuffle-prompt.ts).

## Adapter correction

The research adapter now applies `agent12-twinleaf-shuffle-deck-numeric-permutation-validation-v1` only when both conditions hold:

- the checked-out engine commit is exactly `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`;
- the host-only prompt is exactly `ShuffleDeckPrompt`.

The hook preserves the intended prompt contract and fails closed: the owner must exist, the result length must equal the owner's current deck length, every entry must be a safe integer in range, and every index must occur exactly once. It records the original native validator result alongside the hook ID. Other prompts and engine revisions continue through native validation unchanged.

The V3 host-only resolver passes the actual checked-out Twinleaf commit into the helper. No file inside `vendor/twinleaf` was modified.

## Regression and evidence

The existing real Quick Ball same-Store regression now starts with one searchable Basic Pokémon and 28 Basic Psychic Energy cards. Quick Ball searches the Basic Pokémon, then the original Store emits and resolves its native `ShuffleDeckPrompt` with 28 cards remaining.

The regression asserts:
- the host permutation has the exact 28-card length;
- the pinned native validator returns `false` for the valid permutation;
- the exact-pin adapter hook ID is present;
- the Quick Ball continuation finishes in the same Store and the selected Basic reaches the hand.

The initial PR branch regression passed on exact head `1511c11903b19661fea8ae024137c823316b07b2` in [run 45814796641](https://github.com/FlareZ123/experiment-01/actions/runs/45814796641). The hook and final malformed-permutation assertions were then transplanted onto main in commit `e3b174375a831faa886b3b8595a85a5a94e60f6e`. Exact-main native-search-only run [45829476472](https://github.com/FlareZ123/experiment-01/actions/runs/45829476472) passed on that SHA using the existing `agent5-owner-root-native.yml` workflow with `native_search_only=true`: pinned submodule checkout/compile, the real 29-card Quick Ball same-Store continuation and 28-card shuffle, native-validator false receipt, exact-pin hook ID, and malformed duplicate/out-of-range/short/null permutation negatives all passed. No full-game replay ran.

## Scope and limitations

This is a simulator correctness correction only. It does not establish a complete game, policy competence, any Aichi matchup, deck nomination, or competitive win rate. The hook is deliberately pinned to one engine revision and one prompt class; if Twinleaf changes its validator, the hook must be re-reviewed and removed or revised rather than silently generalized. This correction adds no V3 acceptance gate. The separate owner-controlled V3 go/no-go and existing current-main preflight/acceptance requirements remain independent; this native-search-only run does not satisfy or replace them. No game is authorized.
