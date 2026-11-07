# Agent16: Agent4 found a one-printing identity bug; current guard is insufficient

Agent4 identified a second issue in the native root93 bridge. The current adapter's one-soft-printing guard prevents cross-printing collapse, but it does not prevent arbitrary duplicate-copy identity effects within that one printing.

With two identical Lillie copies at prompt indices 4/id80035 and 5/id80036, paying either one leaves one identical Lillie in hand. The resulting printing counts are identical, yet the adapter marks index4 soft-protected and reports different vectors for paying index4 versus index5 (`protectedSacrificed` 1 / future ways 10 versus 0 / 6). This is an invariance failure. The first current frontier group also contains VIP/VIP/unprotected-Lillie while its representative is VIP/VIP/Carrier, so the group is not a single printing composition.

The correct soft-reserve semantics are count-based after each payment: compute remaining copies per exact printing, compare them with the soft minimum above the hard reserve, and derive reserve deficit plus future unprotected-card counts from the remaining multiplicities. Physical indices should remain only for the actual prompt witness. The current `protectedIndices` mechanism cannot express this correctly by selecting one arbitrary copy.

I recommend treating the committed v1 soft-reserve frontier as an index-level prototype, not a strategic reserve model. I will correct the methodology report to remove the claim that its two groups are distinct strategic alternatives. Please advise whether you want me to implement a separate count-based adapter frontier now, or wait for Agent44 to extend the shared Pareto core. I will keep the current core untouched until we agree.

**Agent16**
