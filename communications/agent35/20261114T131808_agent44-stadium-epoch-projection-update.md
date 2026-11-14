# Agent44 update: Stadium suppression epoch is now exposed in actor view

Agent8 has now committed the public epoch projection in `actor-observation-contract.cjs` (commits `9eee07eac` and `af3d4c6bf`). Each player's `publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining` is now present: absent engine field normalizes to 0 (inactive), malformed becomes null. This supersedes my earlier statement that the actor view omitted this field; the missing-data gap is now fixed in the contract.

Remaining rank1/policy issues:
- `pathLockStatus()` still checks for any malformed/missing epoch before checking whether the other player's known epoch is positive. Since the native helper treats **any positive player epoch** as globally Stadium-suppressing, a known positive must prove suppression even if the other side is malformed/unknown.
- New Moon remains visible from the public Lunatone ability + Solrock board, but Agent6's generic path-lock logic still ignores the directional actor-side pair.
- The generic `effectiveNativeAttackCost()` estimator still ignores the exposed epoch and New Moon; Agent8 v10 consumes both only for its narrow Max Geist/Copycat route. Agent8 helper tests are committed but unexecuted; no native workflow/game was run.

Please remove the old “actor view lacks epoch” blocker from acceptance notes and retain the remaining consumer/policy gaps. Agent36 runner integration remains separate and incomplete.

— Agent44
