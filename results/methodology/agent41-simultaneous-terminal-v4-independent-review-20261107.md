# Agent41 independent review: simultaneous-terminal v4

**Date:** 7 November 2026  
**Reviewer:** Agent41  
**Disposition:** Accepted as bounded native mechanics evidence; not approved for shared-policy integration or competitive qualification.

## Reviewed revision and reproducibility

- Successful workflow: [42413075016](https://github.com/FlareZ123/experiment-01/actions/runs/42413075016)
- Research head: `2826462cfd41bf56169a9a7eb2b80d794d49ce6b`
- Twinleaf pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- Artifact: `13590536576`, `agent37-simultaneous-terminal-v3-v4-native-42413075016.zip`
- Artifact SHA-256 independently recomputed: `01baec92a972f95242e0e8143d30f32dd78468f6ee3d592db688711cf1a5b63e` (matches the Actions artifact digest)
- V4 adapter blob: `b155a98d33bf5bf4bdd065d77c19dd094f94a7fe`
- V4 runner blob: `4e9cb48ecfdb04e8298d82c4a45221f6dae6aada`

The Actions run completed successfully. Checkout, pinned-submodule verification, compilation, syntax checks, v3 regression, v4 regression, both JSON assertion steps, and artifact preservation all passed. The v4 adapter and runner blobs at the successful run commit are byte-identical to current main.

I downloaded and parsed the artifact independently. The v4 JSON contains 24 unique rows: three Prize profiles × two physical seats × four promotion-availability states. All 24 rows report exact expected Prize deltas, all 24 capture the original native winner log, and all 24 restore the Store methods and preserve neighboring-Store isolation.

| Measure | Verified result |
|---|---:|
| Rows | 24 |
| Exact Prize-group transfers | 24/24 |
| §E draws | 8 |
| Owner wins | 8 |
| Opponent wins | 8 |
| Native winner corrections | 10 |
| Original native winner logs | 24/24 |
| Store restoration | 24/24 |
| Manual second-group transfers | 20 |
| Native second-group transfers | 4 |
| Competitively qualified games | 0 |

## Rulebook and sequencing review

The uploaded Advanced Player's Rulebook specifies that both players take the Prize cards earned from simultaneous Knock Outs (§D step 4), followed by the next-turn player's promotion first (§D step 5). Section §E then resolves simultaneous loss conditions using both players' remaining Prizes and promotion availability.

The shared `resolveRulebookETerminalOutcome` helper matches the §E table for the 16 Boolean combinations of Prize exhaustion and promotion availability. Its pure test covers all 16 states and checks perspective-swap symmetry.

The v4 sequencing is correct for the tested pinned-engine fixture:

1. It records the two actual Active `KnockOutEffect` groups and their recipients, counts, and destinations.
2. If the first processed Prize group already exhausts that player's Prizes, it completes the other group through the real `TAKE_SPECIFIC_PRIZES` path before terminal adjudication.
3. If the first group is nonterminal and the second group is the terminal group, it leaves the second native `DrawPrizesEffect` to run.
4. It verifies the per-player `prizesTakenThisTurn` deltas, captures the original native winner log, then applies the §E outcome to the settled state and rewrites the terminal log when required.

The 20 manual-transfer and four native-transfer rows exercise both paths. Both physical seat orientations and all four promotion-availability states are represented. The exact transfer deltas show no omitted or duplicate Prize transfer in these 24 transactions.

## Prize-selection scope

The fixture's Prize cards are all identical `Psychic Energy MEE` cards. Selecting the first available Prize cards therefore does not change the card identity or final hand composition in this fixture. This supports the bounded transfer-count and terminal-outcome assertions.

It does not validate an owner policy for choosing among different Prize cards, trigger interactions from heterogeneous Prize contents, or the exact hand composition of a real match. The report's deterministic first-N limitation is appropriate and should remain explicit.

## Findings and integration blockers

1. **No duplicate transfer was observed in the 24-row pinned fixture.** However, `processedPrizePlayerIds` is not a general duplicate-effect suppression guard: the wrapper calls `originalReduce` before consulting that set. The tested native sequence does not re-dispatch the manually completed group after the first terminal Prize group. A future engine revision or altered queue path could expose a duplicate. Before integration, add an exact per-transaction settlement/idempotency guard or a native duplicate-queue negative test that proves a repeated group cannot transfer twice. Do not treat the audit field `nativeDuplicatePrizeEffectSuppressed: 0` as a suppression receipt; it remains zero in the current implementation.
2. **Require a caller-visible fail-closed release gate.** If a candidate is recognized but the second transfer, destination, or winner-log receipt is missing, the adapter can return the native terminal result with an incomplete audit rather than throwing. The current runner rejects such a row, which is sufficient for this bounded CI result. Any future caller must reject the match unless every required receipt is true; preferably make the adapter itself fail closed for an armed candidate that reaches terminal without both exact hand transfers and a captured native log.
3. **Keep destination/prevention handling outside the accepted scope.** The 24 rows use ordinary hand destinations and no prevention. Add positive and negative tests for replacement Prize destinations, prevention, and destination changes before any integration.
4. **Keep other KO and terminal shapes outside the accepted scope.** The fixture does not cover non-Active KOs, extra KO effects, simultaneous no-Pokémon cases outside these Active-KO rows, deck-out, sudden-death handling, interrupted effect queues, or heterogeneous Prize-trigger effects. The candidate predicates narrow the current adapter, but broader negative tests are still needed before promotion.
5. **Promotion is represented by Bench Pokémon presence.** The fixture does not model promotion prohibitions or effects that alter the legality of a particular promotion choice.
6. **The fixture is not a paper-legal Aichi game.** It uses English Twinleaf card definitions, `Format.EXPANDED`, staged state, and no complete 60-card deck, Japanese print admission, event clock, or shared opponent policy.

## Recommendation

Retain the 24-row result as a valid, reproducible, bounded native Store-mechanics regression for the declared two-Active-KO / two-hand-Prize-group scope. Keep v4 opt-in, default-off, and unintegrated. Preserve v3 unchanged. Do not use this result as evidence of complete paper-game fidelity, Japanese Extra legality, matchup strength, or a deck win rate.

No new CI run is warranted for this review: the successful artifact and exact source revision were independently verified. The next v4 work should be limited to the duplicate/fail-closed and destination negative controls required before any future integration.
