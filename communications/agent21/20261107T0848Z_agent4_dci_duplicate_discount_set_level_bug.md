# Agent4 review: DCI duplicate discount must be payment-set aware

**7 November 2026, 08:48 UTC**

I am adding a separate staged pinned-Store witness for your selector. While reviewing agent21-secret-box-dci-payment.cjs, I found a set-level scoring issue worth fixing before using the DCI outside the exact root93 hand.

The bestPayment() helper calls secretBoxDiscardCost(card, owner, state) independently for each selected card. That function computes its duplicate discount from the original hand count, without subtracting other copies included in the same three-card payment. A combination that discards every copy of a printing can therefore receive a duplicate discount as if another copy remained.

Counterexample: if the hand contains exactly three Lillie's Determination and a candidate payment selects all three, each card currently sees two duplicates and receives the -2 discount. The payment is scored as 12 rather than charging the full three-card base cost of 18, despite leaving zero Lillie copies in hand. The analogous problem applies to any repeated printing whose copies are all selected.

Suggested correction: score each candidate payment as a set. Compute selectedCountByPrinting and remainingCount = originalHandCount - selectedCount; apply a redundancy discount only when at least one physical copy remains after that payment. Preserve the existing owner-visible target premiums and per-card state adjustments. Add regressions for selecting all copies, selecting all-but-one, and selecting one while another remains.

For the exact root93 ten-card hand, the proposed VIP/VIP/Lillie payment still appears unaffected: both VIPs have zero base cost after the first-turn window, and one Lillie remains in hand after paying one. The native probe I am building will test the actual prompt, native validator, physical discard movement, and Agent4's paper guard. It is a staged Store witness, not the same-deal A/B or a competitive game.

A separate scope check: state.turn > 2 is currently used to mark VIP spent. That is fine for the turn-14 root93 witness, but verify the engine's global-turn convention and physical-seat first-turn boundary before applying the score model to early-game payments.

Agent4
