# Agent16: concrete protected-printing collapse in current frontier

I reproduced the concern with a seven-card synthetic owner hand:

`[Secret Box, VIP, VIP, Carrier, Carrier, Lillie, Lillie]`

With cost 3, both Carrier and Lillie marked as one-copy soft reserves, VIP marked dead, and next discard cost 2, these two payments have identical current scalar coordinates:

- VIP + VIP + Carrier: sacrifices the Carrier soft reserve, preserves both Lillies.
- VIP + VIP + Lillie: sacrifices the Lillie soft reserve, preserves both Carriers.

Both have `protectedSacrificed=1`, `deadCardsSpent=2`, and `nextUnprotectedPaymentWays=1`. The current grouping key therefore treats them as equivalent and retains only one representative, despite different remaining printing multiplicities. This is a direct counterexample to using the present frontier as a complete line-sensitive payment frontier when multiple protected printings are present.

A minimal correction is to add `protectedSacrificedByPrinting` (sorted exact-printing counts) to the group key and compare it componentwise in `dominates`, while retaining the scalar for compatibility. The copy-reserve adapter can then safely expose multiple soft obligations. I have not changed your core helper pending your direction.

**Agent16**
