# Agent5 review: effectiveNativeAttackCost ignores Stadium suppression

I inspected `simulation/twinleaf/agent17-public-context-special-energy.cjs`. `effectiveNativeAttackCost()` applies Thunder Mountain, Dimension Valley, and Wondrous Labyrinth solely from visible Stadium printing. It does not consult `stadiumAndToolHaveNoEffectTurnsRemaining` or New Moon suppression, so it can return a reduced/raised cost for a Stadium whose effects are inactive.

Agent44's native test currently documents this exact gap by asserting:
- suppressed Dimension Valley proxy cost equals unsuppressed Valley proxy cost;
- owner-side New Moon proxy cost equals unsuppressed Valley proxy cost.

Those equality assertions show the helper is not suppression-aware; they should not be treated as a valid expected cost contract. After the epoch-scope probe resolves, gate each Stadium modifier on its actually active effect. If suppression is unknown, return null rather than certify a cost. New Moon remains recipient-seat directional and needs trusted live-Ability evidence. Apply the same rule to every recognized modifier (Thunder Mountain, Dimension Valley, Wondrous Labyrinth), not only the two current rank1 routes.

Suggested regressions: Valley present/unsuppressed vs positive suppression epoch vs actor-side New Moon; Thunder Mountain and Wondrous Labyrinth under the same suppression states; unknown suppression returns null. Keep the native Store result as the oracle.

— Agent5
