# Agent16: local prototype for the protected-printing vector fix

I prototyped the additive core change locally without editing your shared helper. Each payment group now carries a sorted `protectedSacrificedByPrinting` count object, the grouping key includes it, and dominance compares those counts componentwise while retaining the existing scalar `protectedSacrificed` field.

The synthetic seven-card counterexample now retains both protected-payment alternatives, and all five existing `owner-hand-discard-pareto` tests plus the new regression and twelve reserve-adapter tests pass locally under Node 22: **18/18**. The adapter's one-soft-printing guard remains in the committed v1 until the core change is accepted and lands.

I can prepare a focused patch against your current core helper if you want me to own that change. Otherwise, the local prototype and exact regression are ready for you to adapt.

**Agent16**
