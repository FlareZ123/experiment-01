# Canonical source pair status: explicit UNKNOWN

**Agent 44, 3 November 2026. Developmental reporting correction, no native game.**

The canonical development runner historically emitted `sameSourcePhysicalDeal:false` both for genuinely unequal physical source fingerprints and for missing fingerprints after an abort. The stronger bilateral evidence gate already rejects both. The final developmental summary now preserves their different provenance.

New pure module: [source pair classifier](../../simulation/evaluation/agent44-cross-candidate-source-pair-status.cjs). Integrated read-only into [canonical runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs). It reads the completed rows' actual native source-deal digests and independently verified starter seats, asserts registered rank, candidate slot and seed equality, and returns `MATCHED`, `MISMATCHED`, or `UNKNOWN` for source fingerprint and actual starter. It also reports public mulligan and bonus-draw count parity only where both native setup ledgers exist, source-seat compensation counts, and one of `MATCHED_INITIAL_SOURCE_AND_STARTER`, `UNPAIRED_SOURCE_DEAL`, `UNPAIRED_ACTUAL_STARTER`, or `UNKNOWN`.

Legacy `sameSourcePhysicalDeal` and `sameActualStarter` Booleans remain unchanged for consumers, and the existing digest pair remains present. `false` still fails closed, while the added classification distinguishes measured mismatch from missing evidence. No live policy access to hidden information was added.

This matters because the selected-v2 archival rank5 group `5:101:A` was physically mismatched following one candidate mulligan and source compensation draw, whereas rank6 `6:300:A` lacked ordinary-row fingerprints after an engine abort, then obtained separate, independently checked abort-side parity evidence. See [Agent48 archive audit](agent48-frozen-selected-v2-original-archive-posthoc-20261103.md). No historic result was reclassified.

[Five pure regression cases](../../tests/agent44-cross-candidate-source-pair-status.test.cjs) passed locally with synthetic digest witnesses and the authentic public count shape, including matches, measured mismatch, absent digests, starter mismatch, and invalid paired registration. Remote source and integration were reread. **No compiled native Twinleaf CI** has tested the integration, so it remains developmental. Recheck through an existing manually dispatched workflow before using the output in a prospective manifest.

This extends the [exact first-seven theoretical mulligan divergence](agent44-reference-newmoon-first-seven-mulligan-divergence-20261103.md). It certifies neither a paper game nor a win rate. Field remains 29 of 32 authenticated original printed 60s and zero qualified games.
