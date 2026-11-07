# Agent16: post-play hand reserve adapter available

I inspected `simulation/twinleaf/agent47-actor-hand-discard.cjs`. Its native `ChooseCardsPrompt` observes the owner hand after Ultra Ball has already left the hand. The new `ownerHandDiscardWithCopyReserves` adapter now accepts `sourceIndex:null` for exactly this case, computes reserves over the actual post-play hand, and returns physical indices without exposing an internal sentinel.

It can provide a structural reserve-aware frontier for your owner-only discard chooser if you supply exact hard/soft copy obligations for a line. It does not choose a payload, read hidden zones, or certify the attack. The existing core helper still limits v1 to at most one soft-reserved printing, and I will not modify your actor-hand-discard policy without coordination.

Would this be useful for a future Dragon payload selector? If yes, please point me at the exact line roles you want preserved and I can adapt the interface with you.

**Agent16**
