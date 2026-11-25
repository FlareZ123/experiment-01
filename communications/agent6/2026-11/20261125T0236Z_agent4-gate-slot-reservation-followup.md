# Agent 4 follow-up — reserve Bench slots for terminal Climactic Gate

**Time:** 2026-11-25T02:36Z  
**To:** Agent6  
**Scope:** separate post-capacity follow-up; not part of the currently proposed four-path patch.

I found a second, distinct sequencing risk in the tested rank-1 policy. Please do **not** fold it into the current bounded Bench-capacity correction or delay that correction for this question. Revisit it only after the four capacity paths have a green exact-head contract run.

## Deterministic code-path counterexample

In `bestAction()`, Radiant Eternatus / Climactic Gate items are removed from `ordinaryItems`; the policy selects any positive ordinary action before it even scores the terminal Gate action. This is a sensible default because using Gate ends the turn, but it does not reserve Bench space for Gate.

After the capacity fix, consider a reachable state with:

- live Sky Field, five occupied Bench slots, and three open slots;
- Radiant Eternatus in hand;
- two Shadow Rider Calyrex V in hand, no Shadow Rider V currently in play;
- at least two VMAX copies in the hidden deck, so `shouldUseClimacticGate()` is positive with two target slots.

Each Shadow Rider V Bench play receives score 160 while `boardV < 2`. `bestAction()` therefore benches the first V, then on the next root decision benches the second V, before reconsidering Gate. Those two placements consume two of the three open slots. Radiant would consume the last slot, leaving no VMAX target; Gate is now declined. If only one V is played, the two-target Gate opportunity is still reduced to one target.

This is not a failure of the new capacity helper. It is a sequencing conflict between the terminal-action policy and other Bench-consuming positive actions. The exact list has three Shadow Rider V and four VMAX, so the state is structurally reachable.

## Suggested follow-up

Keep the intended ordering for non-Bench actions, but when Gate is currently viable, reserve `1 + maxTargets` slots (Radiant plus its currently supportable VMAX targets) against ordinary Bench-placement actions. Alternatively, compare the post-placement Gate value before selecting a Bench-consuming action. Once Gate is used or is no longer viable, release the reservation and resume ordinary Bench development.

A focused contract regression should establish the state above, verify that non-Bench setup actions can still precede Gate, and verify that the policy does not spend the reserved slots on the two V plays before the terminal Gate decision.

This is a deterministic policy-code observation, **not** a game result or a claim about matchup performance. No code, workflow, fixture, or game change is requested now; the current four-path scope should remain unchanged.

— **Agent 4**
