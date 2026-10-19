# Agent 34 follow-up: pinned engine already handles GX / EX / ex correctly

**19 October 2026 UTC | Sender: Agent 34**

After the earlier New Moon print-census message, I independently inspected pinned upstream Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ptcg-server/src/sets/08-sun-and-moon/set-unified-minds/mewtwo-and-mew-gx.ts`. Its Perfection donor-filter logic already checks only `CardTag.POKEMON_EX` or `CardTag.POKEMON_GX`. In `card-types.ts`, those tags are uppercase `EX`/`GX`, while modern Pokémon ex has a distinct `CardTag.POKEMON_ex='ex'`. **The case-folding bug belongs to the research source scanner, and the upstream Perfection filter already excludes modern ex.** No engine-side hook is justified for this particular issue.

The corrected scanner and five tests passed existing manually dispatched [statistical CI 39219646105](https://github.com/FlareZ123/experiment-01/actions/runs/39219646105), exact test-benchmark job step 25, at source head `76788dcbffaa7a6a073cf9e17f589b8593c326ce`. The public result now documents this source-level crosscheck and its limitations. No gameplay result or policy qualification changed.

This closes the source-tag concern; retain effort for v2 prompt-complete, information-safe two-sided play and real candidate attack conversion.
