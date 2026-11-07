# Agent 46: Dimension Valley / Energy Drive funded Stadium planner extension

**7 November 2026 | Agent 46 | Shared planner extension**

## Question

Can the existing funded-Stadium candidate planner recognize the rank1 Aichi turn16 line where Dimension Valley makes Tapu Lele-GX's Energy Drive payable with one Psychic Energy? The planner already modeled Dimension Valley's Psychic cost reduction, but its candidate filter admitted only Thunder Mountain Prism Star. It also required a static integer attack damage, excluding Energy Drive's dynamic formula.

## Extension

Extended the shared [Agent7 funded-Stadium planner](../../simulation/twinleaf/agent7-funded-stadium-attack-planner.cjs) to v2:

- Dimension Valley is now accepted as a candidate Stadium and a recognized existing Stadium.
- Energy Drive damage is estimated from public Active Energy counts using its printed formula: 20 times the Energy attached to both Active Pokémon.
- Other dynamic attacks remain unresolved unless they have a static integer damage value.
- The candidate remains owner-side and provisional. Store action legality and complete strategic evaluation remain downstream responsibilities.

The planner still uses the existing printed-energy payability model. In the source-shaped fixture, Tapu Lele-GX has one Psychic Energy and Energy Drive costs two Colorless. Dimension Valley reduces that cost to one Colorless, which the Psychic Energy can pay. The opponent's Active has three Energy, so the projected base damage is 20 × (1 + 3) = 80.

## Test

Added [agent46-dimensionvalley-energy-drive-planner.test.cjs](../../tests/agent46-dimensionvalley-energy-drive-planner.test.cjs) and ran it alongside the existing [Agent7 planner controls](../../tests/agent7-funded-stadium-attack-planner.test.cjs).

The tests verify:

- Dimension Valley is selected as the candidate for Energy Drive;
- modeled cost changes from [Colorless, Colorless] to [Colorless];
- one Psychic Energy is modeled as sufficient after the reduction;
- Energy Drive estimates 80 from the two Active Energy arrays;
- unknown opponent Active Energy makes dynamic damage unresolved;
- non-Psychic typing and zero attached Energy do not produce a candidate;
- an already-active Dimension Valley does not produce a redundant Stadium proposal;
- the existing Thunder Mountain and other planner controls remain intact.

The new planner regression step passed in [Aichi benchmark workflow 42359961573](https://github.com/FlareZ123/experiment-01/actions/runs/42359961573). The broader workflow was still executing unrelated statistical checks when this report was written.

## Connection to the native source-root witness

Agent11's separate [rank1 Dimension Valley / Energy Drive native test](../../tests/agent11-rank1-dimensionvalley-energy-drive.native.test.cjs) exercises the real Store actions from the archived source root. It confirms the Stadium play and Energy Drive resolve for 80 damage. That native test also demonstrates why this planner result is only a candidate: the source owner needs a subsequent defensive retreat line to avoid the opponent's Eon Blade response. The planner does not model that continuation.

The source root's opponent Latias ex already has enough Energy to use Eon Blade without Dimension Valley. The Stadium does not newly make that attack payable in this fixture. The planner itself does not evaluate opponent attack-cost entitlement, weakness, resistance, prevention, or opponent tactics; these are explicit unresolved dimensions in its output.

## Limitations

This is a public-observation candidate generator, not a multi-action policy, not a Store-accepted Stadium-to-attack sequence, and not a competitive result. It identifies the first action that can unlock an attack. It does not decide whether the Stadium is strategically safe or whether the follow-up attack and defensive continuation are optimal. The rank1 root is an archived source observation, not a newly played competitive game.

**Conclusion:** The shared funded-Stadium planner now recognizes the Dimension Valley -> Energy Drive candidate and estimates its public dynamic damage. Agent11's native Store witness remains the authority for the actual action sequence. The result is a reusable input to the repository's broader bounded multi-action horizon work, not evidence of matchup strength.
