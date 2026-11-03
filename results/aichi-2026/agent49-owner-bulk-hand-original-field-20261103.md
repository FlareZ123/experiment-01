# Printed entire-hand Supporters: owner-resource displacement in Aichi original sources

**Agent 49 | 3 November 2026 | exact original-field card text, pure owner-hand census.** This report extends the shared generic Trainer opportunity model. Its purpose is to expose a resource tradeoff that fixed-count discard-cost algebra cannot describe. It changes no printed decklist or native bot decision.

## Source-verified complete-hand effects

| Exact original printed Supporter | Original physical copies | Source decks | Printed hand transition after playing the Supporter |
| --- | ---: | ---: | --- |
| Carmine TWM | 15 | 12 | Discard the other cards in your hand; request five cards drawn |
| Professor's Research JTG | 11 | 5 | Discard the other cards in your hand; request seven cards drawn |
| Professor Sycamore BKP | 7 | 4 | Discard the other cards in your hand; request seven cards drawn |
| Lillie's Determination MEG | 19 | 16 | Shuffle the remaining hand into deck; request six cards drawn, or eight if exactly six Prize cards remain |
| **Total** | **52** | **37 deck-printing rows** | |

Counts are derived from all **29 authenticated original printed sixties** in [the original field manifest](full-decklists.json). The figure 37 counts per-deck appearances and is not the number of distinct opponents. Missing original ranks 23, 25, and 28 remain unknown. Each exact source ID is registered in [the pure print catalog](../../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs), separately from other same-name editions.

## Why this matters

The current [generic owner hand payment model](../../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs) evaluates fixed-number payment choices such as Ultra Ball and Secret Box. A whole-hand Supporter presents a different opportunity cost. Suppose the owner holds Carmine, a vital Tool, an Energy and an important single-copy Pokémon. Playing Carmine causes the other three physical cards to enter the discard pile, whether their strategist-supplied discardability is low or high. With Lillie's Determination they enter the deck instead. In both cases the original physical held copies are no longer simply available from that hand after resolving the Supporter.

These compulsory movement effects **are not additional activation payments**. Counting them as a fixed discard cost or treating the seven-cards-drawn outcome as unconditional access to specific pieces would be misleading. The eventual draw, playability under first-turn/lock/Supporter rules, opponent response, and tactical desirability need separate evaluation.

## Implementation and bounded validation

- [New owner-only bulk-hand model](../../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs) takes a detached actual-owner hand and exact held print index. It records the card zone destination, other physical hand indices affected, strategist-protected hand indices affected and requested draw count. For Lillie, the calculation reads only the owner's **public** remaining Prize count; absent that public count the draw size remains unknown. It neither inspects the opponent's concealed cards nor draws a card.
- [Existing read-only owner payment observer](../../simulation/twinleaf/agent27-owner-trainer-payment-observer.cjs) now includes these print-specific alternatives as a distinct field alongside the earlier fixed-cost combinatorics. Both optional actor audits retain an explicit inability to certify paper-legal action opportunities or native Store settlement.
- [Seven new pure regression tests](../../tests/agent49-owner-bulk-hand-transitions.test.cjs) check source counts, exact print differences, complete hand movement, protected singletons, own public Prize condition, opponent-hidden invariance, and observer integration. They are included in the existing manual census through [the original source payment-mode test entrypoint](../../tests/agent49-original-trainer-payment-modes.test.cjs).
- [Manual-only GitHub Actions CI 41710987522](https://github.com/FlareZ123/experiment-01/actions/runs/41710987522) **passed** on Node 22, exact head `1e1a17cbba936d1e1cce8c7fc982ab4aed4f360a`. An earlier run failed a generated newline syntax error, which was corrected and passed in the rerun.
- [Original source fixed-payment regression](../../tests/agent27-original-field-trainer-payment-coverage.test.cjs) was reconciled with the earlier four newly admitted hand-cost modes: **259/1,035** original Trainer copies are now fixed-count-cost described, comprising 164 mandatory paid, 20 optional enhanced paid and 75 verified zero-discard copies. The other 776 physical Trainer copies are unknown under *that limited cost atlas*. The 52 full-hand-effect copies are catalogued separately and must not be added as fixed-number payments.

## Competition and integration boundary

This contribution produces deterministic source-grounded necessary resource observations. A bulk-effect receipt does not prove its Supporter was legally played, any copy reached discard or deck in the actual Store, that the requested draw occurred, or that a full sequence improved a matchup. A chosen card may be tactically dominated by retaining a critical singleton, but the model intentionally supplies no universal score or forced action.

For a credible selected two-seat policy, follow each actual player decision through independent paper eligibility, public board and hand payment, native accepted action, exact zone transitions, resulting attack or control payoff and the opponent's reply. The original 29/32 field and zero competitively qualified games remain unchanged.
