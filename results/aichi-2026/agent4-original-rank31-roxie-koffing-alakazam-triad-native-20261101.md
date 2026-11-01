# Original rank-31 Roxie → Koffing → Radiant Alakazam: native two-Prize paper-invariant failure

**Date:** 1 November 2026. **Agent:** 4. **Scope:** a staged, original-printed, genuine Twinleaf Store turn; **not** an original source opening, a tournament game, a legal deck improvement, or any game-win observation.

## Original-source relevance and printed contract

The authenticated published rank-31 Yuhi Yokoyama Dusknoir/Chimecho 60 in [full-decklists.json](full-decklists.json) includes **4 Roxie CEC 205, 3 Koffing CEC 76, and 1 Radiant Alakazam SIT 59**. These are verified printing-specific source counts, not inferred proxy cards. The supplied card-pool records `sm12-205`, `sm12-76`, and `swsh12-59` establish the printed effects:

- Roxie may discard up to two non-EX/non-GX Pokémon from the owner's hand and draw three cards for each discarded.
- Koffing's optional **Blow-Away Bomb**, when discarded by Roxie, places one 10-damage counter on each opposing Pokémon after Roxie resolves.
- Radiant Alakazam's **Painful Spoons** moves up to two damage counters **from one opponent's Pokémon to another**. Two separate source Pokémon are never permitted by that text.

The prepared opponent contains three physically distinct Shadow Rider Calyrex V. Active and Bench 0 start undamaged; Bench 1 starts with 180 damage on a 210-HP two-Prize V. The original printed owner Pokémon, Roxie and Koffing are real card instances inside a genuine pinned Store at turn 3. The owner has seven real Psychic Energy cards in deck and six Prize cards. This is a **conditional board** deliberately chosen to expose the rule failure, not a sampled source game.

## Actual native action sequence and paired consequence

1. The owner plays **Roxie CEC** through actual `PlayCardAction`. A genuine `ChooseCardsPrompt` selects the physical Koffing. Original `ChooseCardsPrompt.validate` returns **false** with `options.blocked=[0]` in this hand order even though the card is a paper-permitted Koffing; the original `Store.dispatch(ResolvePromptAction)` nevertheless consumes the card. A separate native test confirms the validator's answer changes when the two starting hand cards are reversed, while Store settlement succeeds in both orders. The `blocked` mismatch and Store bypass are separate user-interface/engine contract defects.
2. A narrow **research-owned opt-in compatibility hook** is needed for the pinned Roxie reducer's separate `DiscardCardsEffect.type` omission. Without it, the native Store's auto-log attempts `undefined.startsWith` and aborts. With this scoped fix, Roxie's printed draw-three and the optional Koffing confirmation physically resolve; the opponent's three Pokémon then have **[10, 10, 190]** damage, respectively.
3. The owner uses genuine `UseAbilityAction('Painful Spoons')` and settles the real animation `WaitPrompt`. The original `MoveDamagePrompt` accepts two transfers **Active → Bench 1** and **Bench 0 → Bench 1**. They have two distinct physical sources, contrary to the printed `from 1` contract. The original native Store moves both and knocks out the damaged Shadow Rider V; the owner then settles the real `ChoosePrizePrompt` and takes **two physical Prize cards**.
4. Repeat the **same prepared printing, positions and starting damage** with the reversible `withPaperPainfulSpoonsSingleSource` opt-in boundary. It rejects the same invalid two-source reply **before board mutation**, leaving the 190-damage victim in play and **zero Prizes taken**. The native Ability prompt remains pending.

The two branches differ only by whether the original Painful Spoons prompt is guarded; the Roxie type compatibility hook applies to both. Their observable **2-Prize versus 0-Prize** divergence is a conditional engine-semantic defect, not a measured tournament outcome. A genuine legal one-source movement can still be chosen, given an available source with sufficient counters.

## Reproducible evidence

- Registration frozen before trial: [rank-31 triad registration](registrations/agent4-rank31-roxie-koffing-painful-spoons-20261101.json).
- Runnable research-side staged Store: [native triad](../../simulation/twinleaf/agent4-rank31-roxie-koffing-spoons-native.cjs).
- Native assertions: [triad tests](../../tests/agent4-rank31-roxie-koffing-spoons-native.test.cjs); additionally [Radiant Alakazam movement test](../../tests/agent4-rank31-alakazam-movesource-native.test.cjs).
- Research-owned reversible hooks: [Roxie compatibility](../../simulation/twinleaf/agent4-roxie-original-effect-type-hook.cjs) and [Painful Spoons paper-source preflight](../../simulation/twinleaf/agent4-painful-spoons-single-source-hook.cjs).
- Pinned Twinleaf submodule revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Source code on vendor remains untouched.
- **Compiled manual [CI 41352531300](https://github.com/FlareZ123/experiment-01/actions/runs/41352531300): SUCCESS; all three rank-31 triad tests passed**, as did other manual job steps. Earlier [CI 41327220516](https://github.com/FlareZ123/experiment-01/actions/runs/41327220516) reproduces the prior native `undefined.startsWith` failure before the scoped compatibility correction was fully exercised. Neither run executes a source-dealt full match.

## Release implication

This exact source printing family is present in the 29 authenticated original Aichi opposing 60s. A full-match claim involving rank 31 cannot simply inherit official paper fidelity from the unguarded native Store. The first fully integrated common two-seat paper-prompt boundary should either cover both the original Roxie effect construction and the Painful Spoons source-identity constraint, or fail closed with explicit unverified/invalid classification. A prompt's own `validate` success is insufficient when the Store can settle different replies.

**Evidence limit:** one deliberately prepared board, one source-owned card combination, no observed natural opening exposure, no measured source matchup or game winner, no qualified competitive games and no established 99.5% single fixed 60. Original rank-31 source list/printing authentication does not establish accessibility of the exact turn.

## Related prior work

The isolated Radiant proof and its conditional two-Prize counterexample preceded this triad in [rank-31 Radiant Alakazam native paper single-source](agent4-rank31-radiant-alakazam-native-paper-single-source-20261101.md). This report adds actual original Roxie + Koffing production of both source counters and actual printed Roxie draw, plus the independent Roxie prompt/Store validation mismatch.
