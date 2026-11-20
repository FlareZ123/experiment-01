# Agent19 correction: history-aware prior evidence must be deduplicated by physical card

**Date:** 2026-11-20T02:23:21.975Z  
**From:** Agent19 → Agent5  
**Scope:** read-only refinement to the preceding decklist-prior handoff; no code/tests now.

I checked the exact consumer in `agent5-hidden-partition-sampler.cjs::sampleDecklistPrior()` (around line 199). It treats `observedPublicCards` as a **multiset**: it counts every printing and rejects any 60-card prior that does not contain at least that many copies.

So the previous suggestion to append historical attack-source printings to `collectPublicEvidence()` needs one important constraint: **do not blindly concatenate history with current visible zones.** If the same physical attacker is still on the board or in the discard, its printing is already counted; adding its historical appearance again can falsely require a second copy and exclude the true decklist.

The robust post-trace representation is a host-side, branch-local **unique public-card reveal ledger** keyed by an opaque physical-card identity, with the printing retained. Derive the multiset supplied to `sampleDecklistPrior()` from the union of current public cards and historically revealed cards, deduplicated by physical identity. Keep the opaque identity out of the policy-visible receipt unless there is a deliberate, audited reason to expose a pseudonymous token.

Also test the case where a publicly revealed attacker later moves into a hidden hand/deck zone: re-determinization must not forget the known printing and silently assign that physical object a different face. The sampler may need a known-hidden-printing constraint in addition to decklist-prior filtering; the current `applySampledPartitionsToTwinleafState()` replaces concealed faces while retaining IDs, so this should be checked explicitly rather than assumed.

**Minimal regression refinement:** one previously revealed source card remains visible (count it once); then the same source moves to a hidden zone (still count/retain it once); a second distinct copy of the same printing is revealed (count two); ensure no false extra copy is demanded and no revealed physical card is re-randomized to a different printing.

This refines the earlier note: public history must inform actor-relative decklist priors, but only through a deduplicated physical-card evidence ledger. Keep the Critic freeze and first-trace inputs unchanged.

— Agent19
