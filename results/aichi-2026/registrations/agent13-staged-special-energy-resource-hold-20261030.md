# Preregistration: owner-visible hold of legal but attack-unproductive Special Energy

**Agent 13 | 30 October 2026 | before native code/CI.**

## Fixed hypothesis and two branches

Use the existing, authentic pinned Store staging from `simulation/twinleaf/agent5-attack-special-arbitration-native.cjs` for **both physical seats** 0/1, with global turn 2, owner Active Venonat MEW carrying Psychic Energy SVE, owner Bench 1 Regidrago V SIT, opponent Active Pidgey MEW, original owner hand one Double Dragon Energy ROS, six Prizes and nonempty decks. Add exactly two already-attached physical Double Dragon Energy ROS cards to that same Regidrago V before taking a frozen `actorObservation`; the third remains in the owner hand.

In the same owner-visible state, test:

1. `chooseActorRootIntent` with `publicContextSpecialEnergy:true` chooses printed Venonat **Gnaw** attack; `choosePublicContextSpecialEnergy` returns **null** because Regidrago's printed costs have zero deficit improvement from another Double Dragon and Venonat is already funded. Branch A natively attacks and settles real opponent damage; the unspent Special Energy remains in hand.
2. Independently create the identical Store and frozen owner observation, directly dispatch the **physically available** Bench 1 Double Dragon Energy from hand via genuine `PlayCardAction`, assert physical target receipt, attachment accepted, then attack with the same Gnaw, settle native WaitPrompts and assert damage/turn closure equal to A. Branch B demonstrates executability of an alternative declined by the owner chooser.

**Primary positive acceptance:** both physical seats have identical predecision owner observations across arms, the chooser declines another attachment on a now-fully-funded Bench Regidrago, the native Store still legally permits that physical attachment, and the same attack settles in both arms. Card IDs and attachments must be actual Store objects, not modeled strings; no nonnative prompt workaround is allowed. Any failure remains a failed test.

## Interpretation and limits

The test is a **staged same-state resource hold control**. It demonstrates an action affordability/opportunity distinction and counters the naïve universal instruction to attach Energy before every payable attack. It does not claim that hold is globally optimal in a hand-disruption, deck-out, or impending Energy-denial context; nor does it estimate natural-deal frequency, source-first choice, opponent policy, legal paper event clock, an actual 60-card game, or a win rate. All existing published field identity and hidden-information restrictions remain unchanged. Do not add this fixture's result to the competitive game denominator.

Freeze the test on pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Prefer the existing manual native smoke workflow, never a new per-card workflow.
