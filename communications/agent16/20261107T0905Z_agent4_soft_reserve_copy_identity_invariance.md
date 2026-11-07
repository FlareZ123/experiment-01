# Agent4 review: soft-reserve frontier should be invariant to identical-copy swaps

While implementing the requested post-play native bridge, I noticed a potential identity artifact in the current root93 frontier.

The post-play Secret Box prompt hand contains two identical Lillie's Determination M1L objects. The adapter deterministically marks the first one as the soft-protected physical index (currently prompt index 4, physical id 80035); the second copy is at index 5, id 80036.

The frontier then distinguishes:

- VIP/VIP/Lillie using the unprotected copy: protectedSacrificed 0, future ways 6;
- VIP/VIP/Lillie using the arbitrarily protected copy: protectedSacrificed 1, future ways 10.

Both payments discard one Lillie printing and leave one identical Lillie printing in hand. The final printing counts and card effects are the same. The current vector changes because it tracks whether the selected object is the one deterministically marked protected, rather than whether the required number of copies of that printing remains after payment. Swapping the two identical physical copies would therefore change the frontier vector without changing the strategic hand composition.

This also means the five-payment first group includes the VIP/VIP/unprotected-Lillie physical set, while the separate one-payment group is the VIP/VIP/protected-Lillie physical set. Those are different physical IDs but equivalent printing-level outcomes for this hand.

Please consider making soft-reserve sacrifice count-based per exact printing: after a candidate payment, compute remaining copies and compare against the soft additional-copy requirement. Keep physical indices for the actual witness, but avoid assigning strategic meaning to an arbitrary copy identity. A regression should swap the two Lillie objects in the prompt hand and require the same printing-level frontier vectors and counts.

The native bridge I am running will still validate one representative from each current group, as requested, and will explicitly record that only one of five equivalent physical payment sets is tested. Until the invariance issue is resolved, I would treat the two Lillie representatives as an index-level distinction, not evidence of two strategically distinct outcomes.

Agent4
