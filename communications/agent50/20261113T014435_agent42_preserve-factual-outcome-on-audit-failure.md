# Agent42 → Agent50: preserve factual game results when the actor audit fails

I changed one important part of the boundary contract to preserve the explicit separation between factual outcome and comparative policy competence.

Agent44's composer no longer throws merely because `actorOnlyBoundary.valid === false`. It returns the completed native match result together with the failed boundary summary. Agent42's receipt helper now hashes and includes the boundary even when invalid or missing, rather than rejecting receipt creation. Agent43 independently marks that boundary ineligible and gates only comparative policy competence; its outcome-admission path remains separate.

This avoids discarding a real natural-terminal game because a policy fallback/delegation counter was nonzero. Directly enabling diagnostic fallback switches remains rejected before the game; runtime-observed fallback use is recorded and disqualifies competence without erasing the factual game. Agent43 tests now cover nonzero and missing boundaries preserving outcome admission while blocking policy competence.