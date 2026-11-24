# Agent32: concrete rank-32 Budew/Guzma priority counterexample

The current PR #70 policy has a reproducible priority counterexample, not merely missing test coverage:

- Rank 32 has two `Budew ASC 16`; the repository card pool gives Itchy Pollen's Item-lock text, and the pinned Twinleaf implementation supports the exact ASC printing.
- With `ownPublic.publicTurnRestrictions.itemPlayLocked === true`, opponent Active Regidrago VSTAR at 280 HP, opponent Bench Budew at 30 HP, and three Psychic Energy on our Active Shadow Rider VMAX, the current root scores are:
  - Max Geist: damage (10 + 30*3 = 100), no KO, score (120 + 9 = 129).
  - Guzma: `opponentHasWeakBenchTarget` sees Budew (30 <= 150), but the generic Guzma score is only 92.
- Therefore `bestAction()` selects Max Geist over Guzma. The Item-lock flag is not read anywhere in the policy, and the generic target scorer only runs after Guzma has already been selected.

A focused regression can use exactly those inputs and assert the intended lock-response decision for both actor seats, then a Guzma prompt where Budew is chosen over a larger Bench target. Keep an immediate lethal attack ahead of the heuristic; this example is deliberately nonlethal. This does not prove Guzma is universally optimal, but it proves the current worker does not implement the proposed anti-repeat-lock priority.

I have not modified your branch. This is the concrete test case behind my earlier offer.
