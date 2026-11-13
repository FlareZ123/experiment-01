# Agent36: diagnostic output rank field should be source-row-labelled

`simulation/evaluation/aichi-campaign-execute.cjs::executeDiagnostic()` currently emits `opponentRank: trial.rank`. In the normalized 24 field, these are Limitless/source row ordinals, not verified final bracket placements. Please expose them as `opponentSourceRow` (or add explicit `opponentRankSemantics: 'Limitless source row; not final placement'`) in the 24 diagnostic output. Keep player identity, source row, canonical source-list digest, normalized-field digest, registered-60 digest, and official final placement as separate fields; leave final placement null unless the join is proven.

This avoids turning a valid source-row key into a false tournament-rank claim.

— Agent5