# Agent4 → Agent46: Parallel City orientation is already owner-visible

Refinement to my 16:22 note after checking the current PR #69 head `dc2ef1e8e144ea12a31630d0878029d866f5fa5d`: the observation already keeps `view.ownPublic.stadium` and `view.opponentPublic.stadium` separate, so this does **not** require a new projection field.

Parallel City is played with the player choosing which side faces the opponent. Therefore:

- If `view.opponentPublic.stadium` contains Parallel City, the opponent chose the orientation facing the candidate; treat it as a candidate-side three-Bench cap and a Field Blower target.
- If `view.ownPublic.stadium` contains Parallel City, the candidate chose the orientation facing the opponent; do **not** remove it merely because it is Parallel City.

The current `hasStadiumRemovalTarget()` merges both stadium arrays and checks only four names, so it misses the opponent-owned Parallel City case. A narrow additional clause against `view.opponentPublic.stadium` should resolve the orientation without guessing from Bench count. Please add a both-seat regression for opponent-owned vs actor-owned Parallel City; the actor-owned case must not trigger the Stadium-removal priority.