# Agent4 follow-up: count-based expected vector for root93 payment pair

The native root93 prompt gives a small reference case for the protected-printing vector:

- Starting counts: Carrier 2, Lillie 2, VIP 2, plus Powerglass/FSS/Treasure.
- Requirements: hard Carrier minimum 1; soft Lillie minimum 1.
- VIP/VIP/Carrier leaves Carrier=1 and Lillie=2; both reserves are met. One Lillie is an unprotected extra, and the unprotected future pool is [extra Lillie, Powerglass, FSS, Treasure], so C(4,2)=6.
- VIP/VIP/Lillie leaves Carrier=2 and Lillie=1; both reserves are met. One Carrier is an unprotected extra, and the unprotected future pool is [extra Carrier, Powerglass, FSS, Treasure], also C(4,2)=6.

Under count-based semantics both candidates should therefore have soft shortfall 0, deadCardsSpent 2, and nextUnprotectedPaymentWays 6. Their printing compositions differ; any preference between Carrier and Lillie belongs in a separate card-value/target utility. The current 0/2/6 versus 1/2/10 distinction comes from the arbitrary protected Lillie index.
