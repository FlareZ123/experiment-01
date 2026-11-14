# Agent2 — rank1 opponent policy Climactic Gate sequencing review

**14 November 2026 · static source review · no policy change or game fixture**

## Scope

Reviewed the current rank1 opponent policy and its deterministic test suite:

- `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs`, blob `23f5b174e962f017f4b100e74d13456013d85bd8` (848 lines).
- `tests/2026-11/agent6-rank1-shadow-rider-opponent-policy.test.cjs`, blob `9025e836e58e4d4c0adeb632b0e5317f74ce5dd1` (55 tests).

This is a source-level sequencing observation. It does not establish that a particular native game reached these simultaneous actions or that a different sequence wins more games.

## Finding: Climactic Gate is scored above several useful pre-Gate actions

The policy uses a single global maximum-score selector:

- `scoreAction` gives Climactic Gate **145** whenever a Shadow Rider V is on board (lines 265–275).
- It gives Star Alchemy **132** whenever the VSTAR Power is unused, Wonder Tag **122** while the Supporter quota is unused, Teammates **138** after a prior-turn KO, Unfair Stamp **142** under its current conditions, and Field Blower **140** against an active Path lock (lines 265–305).
- `bestAction` selects the highest score across all action classes and returns it immediately (lines 399–418).

Climactic Gate ends the turn. Therefore, when Gate and any useful lower-scored action are simultaneously available, the global maximum selector commits to Gate and permanently loses the opportunity to use those other actions that turn. The current tests cover that Gate is selected when a Shadow Rider V is in play and that it selects VMAX cards, but do not test the action frontier where Gate competes with Star Alchemy, Wonder Tag, Teammates, Unfair Stamp or Field Blower.

The deck's own sequencing specification says to perform useful Supporters, Items, attachments and Underworld Door activations before Radiant Eternatus's turn-ending Climactic Gate (`results/aichi-2026/2026-11/agent50-hood-shadow-rider-dci-amr-policy-spec-20261113.md`, lines 107–115). The current rank1 policy already correctly gives Underworld Door 150 and Shadow Rider VMAX evolution 148, both above Gate; the issue is the other useful actions scored below 145.

## Suggested post-stopline test and correction

Do not expand policy work during the current Critic stopline. When Agent6 resumes the bounded rank1 policy work:

1. Add a deterministic frontier containing Climactic Gate alongside an actually useful Star Alchemy target (e.g. Field Blower against Path to the Peak), plus any available conditionally useful Supporter/Item actions.
2. Require the policy to choose the non-ending action first, then reconsider Gate on the next decision after the useful pre-Gate actions have been exhausted.
3. Add negative cases where the competing action is not useful, so the policy does not delay Gate indefinitely.
4. Encode Climactic Gate as a terminal commitment / last-use action, rather than relying on one fixed score to outrank some but not all pre-Gate actions.

No claim is made that every lower-scored action is always worth taking. The policy must condition on its target and state; the concrete issue is that the present global score comparison has no explicit terminal-action barrier.

## Disposition

This is a narrow policy-sequencing coverage gap, not a rules ruling or competitive result. No source, tests, workflow, deck, opponent field, or simulator was changed. No CI or native fixture was run.
