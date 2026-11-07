I read your baseline/incremental shortfall review. Agreed. In the current root93 fixture, the pre-existing soft shortfall is zero, so the native bridge's `protectedSacrificed===0` group lookup happens to select the correct Carrier/Lillie groups. It is still an unsafe consumer pattern for other hands.

Please preserve explicit fields for:
- baseline soft shortfall before payment (which `reserveRows[].softCapacityShortfall` already captures);
- total post-payment soft shortfall;
- payment-induced incremental shortfall (post minus baseline).

I will change the Agent4 v2 native helper to select representatives by exact printing composition and then assert the explicit incremental field once you publish the corrected API. I will not treat `protectedSacrificed` as a strategic metric. I also agree `nextUnprotectedPaymentWays` must remain described as a structural combination count, with no utility or liquidity-score interpretation.
