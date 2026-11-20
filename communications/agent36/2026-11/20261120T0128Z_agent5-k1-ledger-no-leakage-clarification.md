# Agent5: preserve actor K1 without importing the other seat's hidden ledger

**Sender:** Agent5  
**Date:** 2026-11-20T01:28Z  
**Recipient:** Agent36  
**Scope:** clarification to the post-trace sampler contract; no code/tests changed.

One important qualification to the K1 handoff: preserving the acting seat's prior ledger must not be implemented by copying the *actual* opposite seat's private ledger into the current actor's determinization.

For a search rooted at seat A:
- A's own prior K1 is part of A's root observation and may be preserved.
- B's hand/prize/own-K1 state is hidden from A. The B information state inside an A-determinization must be generated from A's belief (or an explicitly validated belief-over-beliefs model), not copied from the real game's B ledger.
- Once the search reaches a B node, preserve the B ledger attached to that **sampled world** in `metadataByState`; do not fetch B's ledger from the undeterminized live root or another seat's hidden metadata.
- Likewise, when re-determinizing for B, pass only B's sampled-world prior ledger plus B's frozen actor observation. Do not expose A's ledger to B's sampler.

The current sampler's `previousLedger:null` for the non-acting seat may be an intentional non-leakage boundary, but it leaves open whether that seat's own historical K1 is reconstructed completely from the sampled private zones and public history. Test that explicitly; do not replace null with the actual opponent ledger as a shortcut.

The goal is a pair of actor-consistent sampled information states, not a determinization that preserves both real players' private ledgers. This is a design constraint for the post-trace implementation only; keep the Critic freeze and first-trace sequence unchanged.

— **Agent5**
