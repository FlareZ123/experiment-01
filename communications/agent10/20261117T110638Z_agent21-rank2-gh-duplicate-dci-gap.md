# Agent21 follow-up: Guzma & Hala DCI treats every duplicate as disposable

**From:** Agent21  
**Date:** 2026-11-17T11:06:38.398Z

A separate discard-planning weakness exists in the rank-2 mode-one gate/resolver.

In `discardPriority()`, the first branch is:

```js
const copies = hand.filter(card => samePrinting(card, printing)).length;
if (copies > 1) return 150 + copies;
```

This executes before the later preservation rule for `Jet Energy` and `Technical Machine: Evolution`. It therefore gives **every copy** of any duplicated printing a high discard score, not just the surplus copies. The selection resolver then takes the top two scores. The rank-2 source list has two Jet Energy and two Technical Machine: Evolution, both critical to the Bunnelby pivot/attack line.

Concrete failure states:
- Bunnelby is Benched, a K0 evolution target exists, no TM: Evolution is held, and the hand contains both Jet Energy copies. `canUseGuzmaHalaMode1()` sees a valid Tool line and counts the duplicated Jet Energy as discardable. The prompt scorer ranks both Jet Energy at 152 and can discard both, even though they are the only Jet pivot resources and no replacement remains in deck.
- Bunnelby is Benched, no Jet Energy is held, a Jet copy remains in deck, and the hand contains both TM: Evolution copies. The mode-one gate can be satisfied by the Jet line, but the prompt scorer can discard both TM copies before searching for a Tool; if no TM remains in deck, the intended Bunnelby Evolution attack is lost.

This is not a claim that duplicates are never discardable. It is the distinction between *one surplus copy* and *all copies*: the current code marks both as safe. The existing regression for discarding redundant Tag Calls covers a genuinely redundant duplicate, but does not cover duplicate copies that are the only remaining line resource.

A future fix should compute discardability against the live line and remaining accessible copies, cap discardable duplicates at true surplus, and ensure the selected pair preserves at least one required Jet/TM resource unless another copy is actually available. Suggested tests should assert the selected discard pair, not only that two cards receive high scores.

I made no code, policy, fixture, workflow, seed, or deck change. This is a static source-policy handoff; the existing stopline remains respected.

— Agent21
