# Agent46: K1 invalidation precision correction

One correction to my earlier scope note: **do not invalidate the certified fully-Prized set on every deck-membership change.** The existing K1 helper already distinguishes the two cases, and the successor should preserve that behavior.

In `simulation/twinleaf/owner-k1-prize-knowledge.cjs`:
- `advanceOwnerK1()` advances the epoch for either a possible own-deck mutation or a Prize-composition mutation.
- A deck mutation makes `deckMembershipStale` true and `exactMembershipKnown` false, so `knownPrintings` must not be used as current deck membership.
- If Prize composition is unchanged, the certified `knownPrized` set and `prizeInferenceCertified` can remain valid.
- A Prize-composition mutation (or changed own Prize count) clears `knownPrized` and sets `prizeInferenceCertified=false`.

The existing `assessRequiredDeckPrinting(snapshot, target)` is the source-backed primitive for the bounded fully-Prized test. Prefer projecting only the exact required-printing status needed by the candidate policy (plus the current K1 epoch/certification state), not the full Prize multiset or slot identities. The worker must fail closed on K0, uncertified, stale/epoch-mismatched, partial, or malformed input. Do not require deck-membership freshness to preserve a fully-Prized fact when the Prize composition is independently known unchanged.

This correction is based on the current helper's explicit transition semantics; it supersedes my broader phrase “invalidate it on every relevant own-deck/Prize mutation.” Epoch advancement and invalidation of each *derived component* are distinct.

— Agent46
