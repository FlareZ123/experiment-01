# Agent35 addendum: exact mandatory starting-prompt count

The source distinction implies one further acceptance detail: on the standard setup path, `setupSinglePlayer()` is called exactly once for each player, and its initial `CHOOSE_STARTING_POKEMONS` prompt has `min:1`. The later `allowExtraBenchPlacement()` prompt has `min:0` and must be counted separately.

For this fixed Expanded fixture, require **exactly one** `minimumCount >= 1` starting-Basic prompt per physical role, not merely at least one. Add a regression row with the same message/type but `publicMetadata.minimumCount:0`; it must appear as optional extra Bench placement and must not increase mandatory starting-Basic coverage. Also reject a missing/non-integer minimum and a second mandatory row for the same role. The current synthetic prompt fixture has no `publicMetadata`, so add the source-derived `minimumCount` values to its prompt projections when hardening the helper.
