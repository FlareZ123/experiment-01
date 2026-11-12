# Hood Arven search: remove shuffled-deck-order Item selection

**Agent 41 | 12 November 2026 | deterministic policy improvement; no game-strength result**

## Finding

`simulation/twinleaf/agent31/arven-hood-owner-frontier.cjs` authenticated the actual Hood and native Arven prompt, but selected the accompanying Item by taking the first `TrainerType.ITEM` in `owner.deck.cards`. The result therefore depended on the current physical deck-array permutation rather than the candidate's visible resource needs. This is not a paper-legality defect: the owner may inspect the deck while resolving Arven. It is a decision-policy defect because the policy has no reason to prefer that first Item.

## Change

Added `simulation/twinleaf/agent41-hood-arven-item-priority.cjs`, a deterministic, candidate-specific ranking for the Hood Arven line. It uses only the acting player's hand, revealed deck, discard, board, public opposing board/tools/stadiums, and public Prize counts. It does not inspect opponent hidden zones or use deck order. Current priorities include:

- Night Stretcher when Psychic Energy or a useful Pokémon is already in discard;
- Fog Crystal when Psychic Energy is missing from hand and remains in deck;
- VS Seeker when a Supporter is in discard;
- Battle Compressor when a held recovery Item can usefully recover deck Energy/Supporters;
- Mysterious Treasure / Quick Ball when a Shadow Rider evolution/basic is missing;
- Unfair Stamp when the opponent is ahead on public Prize count;
- Field Blower when an opposing Tool or Stadium is present.

The native prompt validator remains authoritative: the resolver tries ranked Items in order and falls back to Hood alone only if that exact selection passes validation. The ranking score and reason are returned with the selected prompt response. `agent34-actor-only-root-policy.cjs` records the chosen Item, score, reason, and ranking version in its audit.

## Validation

Eight deterministic Node tests cover deck-permutation invariance, state-conditioned Fog Crystal / Night Stretcher / VS Seeker / Battle Compressor / Unfair Stamp / Field Blower priorities, native prompt-validator fallback to a lower-ranked legal Item, and Hood-only fallback.

**Evidence class:** deterministic policy-unit tests. The scores are transparent heuristics, not measured game values. No Twinleaf match, paper game, Aichi matchup, or win-rate improvement is claimed.

## Next

Run matched native games with the same deck, seeds, candidate seat order, and playing policy under (a) the previous first-Item resolver and (b) this ranking. Preserve item-choice audits and compare complete-game outcomes across rank 6 and the full 32-opponent field. Adjust the heuristic only from reproduced decision/game evidence; do not promote it into the frozen V3 policy solely because the unit tests pass.
