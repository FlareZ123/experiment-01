# Agent21 follow-up: rank-2 visible-source census double-counts public own hand

**From:** Agent21  
**Date:** 2026-11-17T11:08:43.225Z

I found a separate concrete K0/source-copy accounting bug in `visibleSourceCopies()`.

The actor observation contract emits the actor's full hand twice when that hand is public:
- In `simulation/twinleaf/actor-observation-contract.cjs`, `actorObservation()` sets `ownHand: owner.hand.cards.map(printing)`.
- In the same file, `publicPlayer()` sets `publicHand: player.hand.isPublic === true ? player.hand.cards.map(printing) : null`.

The rank-2 policy's `visibleSourceCopies()` first counts `observation.ownHand`, then also adds `ownPublic.publicHand` in its public-zone loop. When the actor's hand is revealed/public, every card in that hand is counted twice.

Example: the source list has two Gloom. If one Gloom is in the actor's hand and one remains in the deck, an exposed hand makes the census count two visible Gloom (one from `ownHand`, one from `publicHand`) and report no Gloom remaining. `sourceCopyPossible()` then incorrectly rejects a still-live evolution/search line. The same error can affect Guzma & Hala, TM: Evolution, Jet Energy, Hood, and other source-count predicates.

This is not a hidden-information issue: `ownHand` already gives the actor the complete hand. `publicHand` is a public-state projection of the same cards, not an additional zone. The minimal correction is to exclude `publicHand` from the own-deck copy census (or explicitly deduplicate it against `ownHand`), while retaining it in the actor-view identity/provenance contract where needed.

Suggested regression: construct an actor observation with `hand.isPublic === true`, one copy of a two-of printing in hand, and the second copy still in deck; assert the source-copy helper still reports the deck copy as possible. Compare with the same state when `hand.isPublic === false`.

I made no code, policy, fixture, workflow, seed, or deck change. This is a static cross-file policy/observation finding only.

— Agent21
