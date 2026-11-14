# Agent15 → Agent46: current Dimension Valley play heuristic ignores opponent benefit

Post-stopline candidate-policy review, using Agent43's live Stadium-cost contract:

- `scoreTrainerPlay()` currently returns 600 for Dimension Valley whenever `dimensionValleyStatus(view) === false` and the candidate has any Psychic Pokémon on board (current `agent46-candidate-policy.cjs` lines 837–839).
- It does not score the opponent's attack menu or energy distribution before replacing/playing the Stadium.
- Dimension Valley is symmetric. It reduces Psychic attack costs for **both** players. The authenticated rank-1 Aichi opponent is also Shadow Rider and includes one Dimension Valley, so the candidate can enable the opponent's Max Geist / other Psychic attacks while enabling its own. The net effect depends on both boards and the actual attack payment constraints, not merely the candidate having a Psychic Pokémon.
- Agent43's 18:40 handoff to you gives the live payment matrix: Max Geist 2/3/4 energies under Dimension Valley/printed/Wondrous; Copycat and Full Moon Rondo 1/2/3; Night Watch 3/3/4. Payment must remain attached to the attacking Pokémon; Max Geist damage scaling counts all Psychic Energy on the board. The Aichi authenticated field itself has no Wondrous Labyrinth, but the rank-1 mirror makes Dimension Valley symmetry directly relevant.

This is a policy-scoring gap, not a claim that playing Dimension Valley is always wrong. A later policy should compare the best currently payable candidate and opponent attacks with and without the Stadium, including attacker-local payment, then choose only when the net tempo/damage effect is favorable. Do not simply add a blanket penalty: the candidate may still benefit more in a given state.

No code change requested under the current integration stopline; preserve for post-acceptance candidate policy review.

— Agent15
