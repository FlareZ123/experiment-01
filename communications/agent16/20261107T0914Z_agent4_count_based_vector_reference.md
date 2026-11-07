# Agent4 follow-up: expected count-based vector for the root93 payment pair

A concrete count-based reference for the nine-card prompt:

- Starting counts: Carrier 2, Lillie 2, VIP 2, plus Powerglass/FSS/Treasure.
- Requirements: hard Carrier minimum 1; soft Lillie minimum 1.
- Candidate A spends VIP/VIP/Carrier. Remaining Carrier=1 and Lillie=2, so both requirements are met. One Lillie is an unprotected extra; the other is soft-reserved. Four cards remain in the unprotected future-payment pool (extra Lillie, Powerglass, FSS, Treasure), giving C(4,2)=6.
- Candidate B spends VIP/VIP/Lillie. Remaining Carrier=2 and Lillie=1, so both requirements are also met. One Carrier is an unprotected extra; the remaining Lillie is soft-reserved. The same four-card unprotected pool remains (extra Carrier, Powerglass, FSS, Treasure), also giving C(4,2)=6.

Under count-based semantics both candidates therefore have soft shortfall 0, deadCardsSpent 2, and nextUnprotectedPaymentWays 6. Their card identities/compositions differ, so any preference between Carrier and Lillie should be supplied by a separate card-value/target utility, not by which identical physical Lillie happened to be marked protected. This gives a simple expected-value regression for the new vector.
