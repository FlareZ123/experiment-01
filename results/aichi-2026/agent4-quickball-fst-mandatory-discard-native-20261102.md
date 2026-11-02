# Quick Ball FST mandatory discard: original native Store correction

**Agent 4, 2 November 2026. Compiled prepared-board evidence only; no competitive-qualified games.**

## Printed contract and provenance

The supplied card database Quick Ball FST (swsh8-237) requires discarding one OTHER hand card before searching the owner's deck for up to one Basic Pokémon. A mandatory discard choice must be distinguished from the optional own-deck Basic search.

Native Twinleaf submodule pinned at a9905a76a6c4103ba4b6cb9a49e86bad795c5c05. The fixture uses actual Quick Ball FST, Dedenne GX UNB, Psychic Energy SVE and Grass Energy MEE source printing objects. Other setup cards and board are prepared fillers, not an original rank-5 full 60 or naturally dealt game.

**Green full compiled manual CI [41427279797](https://github.com/FlareZ123/experiment-01/actions/runs/41427279797)** at exact checkout 3c92588fea12b30f5aa29c7f677de4405ff2ddb8: all four new tests passed, including original Store physical owner seats 0 and 1. Fixture: [simulation/twinleaf/agent4-quickball-mandatory-payment-native.cjs](../../simulation/twinleaf/agent4-quickball-mandatory-payment-native.cjs); tests: [tests/agent4-quickball-paper-payment-native.test.cjs](../../tests/agent4-quickball-paper-payment-native.test.cjs); reversible default-off guard: [simulation/twinleaf/agent4-quick-ball-paper-payment-hook.cjs](../../simulation/twinleaf/agent4-quick-ball-paper-payment-hook.cjs). Existing manual workflow reused, no automatic CI.

## Real physical Store observations

1. With only Quick Ball in owner hand, native Store rejects PlayCardAction as CANNOT_PLAY_THIS_CARD on both physical seats. Guard separately vetoes at root with explicit reason, no mutation.
2. With Quick Ball plus one other hand card (Psychic Energy), native Store automatically discards the Energy at the PlayCard root and then offers its CHOOSE_CARD_TO_HAND from the owner's physical deck. This optional search has min=0, max=1. Both selecting zero Basic cards and selecting Dedenne GX are legal and successfully resolved with the V2 guard, both seats. The original unguarded zero-search result and V2 guarded result are physically identical.
3. With Quick Ball plus two other hand cards (Psychic Energy and Grass Energy), native Store offers CHOOSE_CARD_TO_DISCARD, min=1/max=1, both cards physically in owner hand. Native prompt.validate(empty selection) returns FALSE, yet the ACTUAL original Store accepts ResolvePromptAction with empty selection on both physical seats. The Item enters discard, neither Energy is discarded and no Basic is searched. **This is an accepted paper-illegal payment** although it produced no Basic search benefit. The guard rejects before Store dispatch, keeping both Energy and Quick Ball in hand and the payment prompt pending. The positive one-Psychic payment physically discards exactly that Energy, searches Dedenne GX into hand and settles all later prompts on both seats.

The source-printed V2 guard checks only mandatory payment prompts with message CHOOSE_CARD_TO_DISCARD and exact physically offered owner-hand membership. It ignores CHOOSE_CARD_TO_HAND, avoiding the serious false positive found in earlier experiments.

## Corrected earlier false inference

Diagnostic CI [41425590309](https://github.com/FlareZ123/experiment-01/actions/runs/41425590309), [41426037640](https://github.com/FlareZ123/experiment-01/actions/runs/41426037640), and [41426552266](https://github.com/FlareZ123/experiment-01/actions/runs/41426552266) initially misclassified the zero-minimum OPTIONAL SEARCH as a zero-minimum PAYMENT. The physical-zone trace exposed that error, so the earlier test and guard were corrected. This false start must not be used as separate evidence for the actual payment defect. The real payment prompt is min=1, and the vendor Store bypasses native prompt validation on an empty reply.

## Competitive relevance and limits

[Agent9's original-rank-5 Quick Ball chains](agent9-rank5-quickball-native-payment-search-chain-20261102.md) separately show that a root heuristic requiring at least one repeated hand printing can still cause the eventual player-selected payment to discard a valuable singleton Secret Box. This is a policy decision-quality problem distinct from compulsory paper payment legality. A future two-seat canonical release should verify the physical chosen payment and then compare downstream setup, evolution, attacks and opponent replies under a truly common owner-only policy. Integrating this standalone hook would first require a live-Store-only interception boundary so cloned speculative policy Stores are not changed.

This is a staged real Store rules-fidelity proof, **not** a candidate winner, full original-rank-5 game, or rate estimate. Shared field unchanged: 29/32 authenticated original opponent 60s, zero competitively qualified games, no demonstrated 99.5% fixed 60.
