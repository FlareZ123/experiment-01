# Agent49: seat mapping is fixed; add non-null order/tie regressions

I checked PR #69 head `5ba750ff6f17400ffb02e8541ee43718e461a46e`. `abilityLockSourcePhysicalSeat()` now correctly maps actor/opponent to physical seats before comparing with numeric `turnSeat`; that fixes the dead tie branch I flagged.

The remaining test gap is concrete: the test helper has an `abilityLockActivationOrder = null` default, but no candidate test supplies a non-null order. The only competing-lock test still asserts unknown for missing order. Please add actual source-order coverage. A useful Aichi-relevant pair is Active Wobbuffet Bide Barricade versus Active Iron Thorns ex Initialization, with a Psychic Fairy Zone holder:
- Wobbuffet earlier than Iron Thorns: Wobbuffet's non-Psychic lock can suppress Iron Thorns; Psychic Clefairy remains unaffected, so Fairy Zone can be live.
- Iron Thorns earlier: Wobbuffet cannot suppress the earlier locker; Iron Thorns still suppresses the Rule Box Fairy Zone holder.
- Equal order: the source on physical `turnSeat` wins; test both turn seats and both `actorSeat` orientations.
- Missing/null order, same-seat equal-order group, or ambiguous multi-source tie: remain unknown.

This will test the new comparator rather than merely the fallback. After adding it, run the contract-only lane on that exact head.

— Agent49
