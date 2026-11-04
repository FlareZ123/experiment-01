# Marnie and Iono owner-observation draw uncertainty correction

**Agent 2 | 4 November 2026.** Scope: a developmental owner-only component correction, without any selected shared policy, native Store settlement, or game result. Follow-up to [Agent49's direct review](../../communications/agent2/20261103T2054Z_agent49_pure_shuffle_chooser_sole-card-dew-guard-offer-risk.md).

## Counterexample

In `simulation/twinleaf/agent2-conservative-shuffle-supporter.cjs` v1, the Marnie/Iono draw estimate assumed a guaranteed draw whenever `opponentPublic.handCount > 0`. Suppose the owner's only hand card is `Iono PAL` and the opponent has one card. Once Iono is played, the owner has zero other hand cards to put on the bottom. An opposing Milotic EVS 38 with **Dew Guard** can prevent the Supporter's hand effect on the opponent. Its wording is on the [official Pokémon Trainers Website](https://asia.pokemon-card.com/sg/card-search/detail/1612/). In that case neither player puts a card on the bottom and Iono's conditional draw fails. The public hand count alone is therefore insufficient to certify positive draw.

Agent49's existing [seven-print bulk-transition observer](../../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs) uses the same unknown branch for this owner-visible situation, independently of the conservative selector.

## Change

Version `agent2-actor-only-conservative-shuffle-supporter-v2-unknown-opponent-return` returns `{ownDraw:null,opponentDraw:null,conditionalDrawTriggered:null,unresolvedReason:'opponent-hand-movement-not-certified'}` when the only owner hand card was the played Marnie/Iono and the opponent has positive public hand count. The offer enumerator withholds that optimistic candidate. If another owner card remains, its movement proves the printed condition. If the opponent publicly has an empty hand and no owner cards remain, the condition is false.

The regression [test file](../../tests/agent2-conservative-shuffle-supporter.test.cjs) now checks uncertain solo Marnie/Iono offers, opponent-private information noninterference, positive owner-hand movement, both-empty hands, Supporter quota, and returned-card draw capacity. The existing lightweight, manually dispatched [global field QA run 41773860552](https://github.com/FlareZ123/experiment-01/actions/runs/41773860552) **completed successfully**, pinned to research commit `280197a6c8adbdd629bc50acbb66e71fc56b2df6`; it executed the updated test suite as an explicit CI step. This is conservative: an opportunity may actually be good and legally playable when the opponent lacks protection, but public hand count alone does not prove that fact. A future owner-public board-effect resolver could remove this uncertainty precisely.

## Integration significance

For [Issue #25](https://github.com/FlareZ123/experiment-01/issues/25), a genuine root policy must preserve `unknown` and distinguish developmental action offers from certified paper-valid and Store-settled actions. This component remains separate from the frozen common two-seat release. No original Aichi games were scored, and no fixed-60 candidate was promoted. The benchmark remains 29/32 authentic original card-name/count sixties, zero competitively qualified games, and no demonstrated 99.5% field win rate.

## Follow-up: partial opposing draws are legal and may be tactically decisive (13:19 UTC)

**New source-level negative case in the prior v2 eligibility screen.** The same conservative enumerator also rejected a held Marnie or Iono whenever its *opponent's printed draw request* exceeded `opponentPublic.deckCount + opponentPublic.handCount`. This mistakenly treated the opponent's available cards as a card-play prerequisite. The supplied Advanced Player's Rulebook, section II.A, says a specified number that cannot be fulfilled is resolved using the closest possible number. Marnie SSH (`swsh1-169`) requests that the owner draw five and the opponent draw four after an actual bottom-of-deck hand movement; Iono PAL (`sv2-185`) requests each player's remaining Prize count after the same trigger. Neither text requires the opponent to own enough cards to complete the requested draw.

A physical owner holding Marnie plus another card guarantees that *at least one card* moves. If the opponent publicly has **zero cards in both hand and deck**, the opponent legitimately draws **zero**, while a sufficiently stocked owner may draw five. A bot that rejects this action solely because the opponent cannot draw four could discard a meaningful late-game denial opportunity. The opponent's exact hand content remains concealed.

Version `agent2-actor-only-conservative-shuffle-supporter-v3-partial-opponent-draw` removes the opposing full-request-capacity veto. It keeps the printed draw request in `drawEstimate.opponentDraw`, and computes a deliberately conservative **upper bound** on available opposing draws as `min(printedRequest, opponentPublic.deckCount + opponentPublic.handCount)`. The second term is only an upper bound because public hand protection may stop some cards returning. Owner deck capacity, positive owner movement, normal turn/Supporter restrictions and the existing heuristic score floor remain unchanged.

| Owner hand and Supporter | Opponent public hand/deck | Printed opponent request | Public opponent maximum draw | Resulting conservative score |
| --- | --- | ---: | ---: | ---: |
| Marnie + one other | 0 / 0 | 4 | 0 | 3, offer retained |
| Iono + one other, owner 6 Prizes | 0 / 1, opponent 2 Prizes | 2 | 1 | 3, offer retained |
| Iono + one other, owner 6 Prizes | 1 / 0, opponent 2 Prizes | 2 | 1 | 4, offer retained |
| Marnie + one other | 0 / 1 | 4 | 1 | 2, filtered by unchanged score threshold |

The [same regression file](../../tests/agent2-conservative-shuffle-supporter.test.cjs) now asserts the first three outcomes, owner-view immutability and invariance to inaccessible opposing hand identities. Code committed in `42b25ce85d65d1bf8cdaf254c620bfa0009490e9`; tests committed in `6df31445c4fb7237c0513e6b963f3d33a1752c15`. **Verification boundary:** both remotely committed files were reconstructed byte-for-byte in the local test runtime, with matching Git blob SHA-1s `a470e784ccc9494c2e5488a7fbf32df6511bcff3` (source) and `ce9edbebd692719342ca9437bf67d85bde92f163` (test). Node.js **22.16.0** executed the exact reconstructed test suite with **14 passed, zero failed**; the independent numeric cases were also checked in Python. No new GitHub Actions manual run or native Twinleaf game was executed. These offers remain heuristic actions, not a selected native policy, paper-legal Store action certificate, opponent deck-out proof, or competitive win.
