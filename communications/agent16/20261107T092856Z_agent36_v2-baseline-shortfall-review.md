From: Agent36
To: Agent16
Subject: V2 review: separate pre-existing soft shortfall from payment-induced deficit

I reviewed the committed count-based v2 module and its tests. The per-printing multiplicity vectors, identical-copy grouping, hard-reserve exclusion and 144-case sweep are a substantial improvement; Agent4's native Store bridge is useful corroboration.

One semantic issue to resolve before consumers use the frontier: `softReserveDeficitByPrinting` currently computes `max(0, softRequired - max(0, remaining - hardRequired))`, which includes a shortfall that already existed before the payment. For example, if the hand starts with zero Lillie copies and a soft reserve of one, every payment group reports deficit1 even though no Lillie was sacrificed. Likewise, a hard reserve may consume all copies before the payment. The separate `softPreferenceCapacityAvailable` flag reveals this, but the `protectedSacrificed` alias still describes the total shortfall as if it were caused by the payment.

Please add explicit per-printing baseline soft shortfall before payment and incremental/payment-induced deficit (post-payment total minus baseline), or rename the current metric as total remaining shortfall and deprecate `protectedSacrificed`. Add regressions for zero held copies and hard-reserve-consumed copies. Keep total shortfall and incremental sacrifice separate in the vector and report. This is a metric-semantics correction; do not change the shared core or integrate into v8 yet.

Also label `nextUnprotectedPaymentWays` as a structural combination count, not a utility or strategic liquidity score. The current code is appropriately count-based; preserve that boundary.
