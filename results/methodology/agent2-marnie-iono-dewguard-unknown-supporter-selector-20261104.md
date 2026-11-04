# Marnie and Iono owner-observation draw uncertainty correction

**Agent 2 | 4 November 2026.** Scope: a developmental owner-only component correction, without any selected shared policy, native Store settlement, or game result. Follow-up to [Agent49's direct review](../../communications/agent2/20261103T2054Z_agent49_pure_shuffle_chooser_sole-card-dew-guard-offer-risk.md).

## Counterexample

In `simulation/twinleaf/agent2-conservative-shuffle-supporter.cjs` v1, the Marnie/Iono draw estimate assumed a guaranteed draw whenever `opponentPublic.handCount > 0`. Suppose the owner's only hand card is `Iono PAL` and the opponent has one card. Once Iono is played, the owner has zero other hand cards to put on the bottom. An opposing Milotic EVS 38 with **Dew Guard** can prevent the Supporter's hand effect on the opponent. Its wording is on the [official Pokémon Trainers Website](https://asia.pokemon-card.com/sg/card-search/detail/1612/). In that case neither player puts a card on the bottom and Iono's conditional draw fails. The public hand count alone is therefore insufficient to certify positive draw.

Agent49's existing [seven-print bulk-transition observer](../../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs) uses the same unknown branch for this owner-visible situation, independently of the conservative selector.

## Change

Version `agent2-actor-only-conservative-shuffle-supporter-v2-unknown-opponent-return` returns `{ownDraw:null,opponentDraw:null,conditionalDrawTriggered:null,unresolvedReason:'opponent-hand-movement-not-certified'}` when the only owner hand card was the played Marnie/Iono and the opponent has positive public hand count. The offer enumerator withholds that optimistic candidate. If another owner card remains, its movement proves the printed condition. If the opponent publicly has an empty hand and no owner cards remain, the condition is false.

The regression [test file](../../tests/agent2-conservative-shuffle-supporter.test.cjs) now checks uncertain solo Marnie/Iono offers, opponent-private information noninterference, positive owner-hand movement, both-empty hands, Supporter quota, and returned-card draw capacity. This is conservative: an opportunity may actually be good and legally playable when the opponent lacks protection, but public hand count alone does not prove that fact. A future owner-public board-effect resolver could remove this uncertainty precisely.

## Integration significance

For [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25), a genuine root policy must preserve `unknown` and distinguish developmental action offers from certified paper-valid and Store-settled actions. This component remains separate from the frozen common two-seat release. No original Aichi games were scored, and no fixed-60 candidate was promoted. The benchmark remains 29/32 authentic original card-name/count sixties, zero competitively qualified games, and no demonstrated 99.5% field win rate.
