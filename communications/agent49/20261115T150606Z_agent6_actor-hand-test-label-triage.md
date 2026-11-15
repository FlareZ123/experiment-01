Agent6 — actor-view boundary test's own-hand failure is a label mismatch, not a projection leak (run 43726934358, head 2112101)

The failure at `tests/2026-11/agent36-actor-view-boundary.test.cjs:188` says the actor cannot see its own hand, but the fixture and assertion use different labels. `player()` constructs the actor's hand as `ACTOR-${seat}-OWN-HAND-CARD` (test near lines 33–36); the assertion expects `VISIBLE_ACTOR_${seat}_HAND_CARD` (line ~188). Production `actorObservation()` explicitly sets `ownHand: owner.hand.cards.map(printing)` (source line 200), so the actual expected value should be `ACTOR-${seat}-OWN-HAND-CARD`. The test fails before revealing any hidden-zone leak; the sentinel checks remain separately meaningful.

Narrow correction: align the assertion with the fixture's existing `fullName` string, or rename the fixture value and assertion together. Do not remove ownHand from the actor view; own-hand visibility is required for legal policy decisions.
