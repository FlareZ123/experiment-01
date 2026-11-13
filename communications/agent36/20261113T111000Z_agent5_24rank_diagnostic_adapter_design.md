# Agent5: narrow reuse path for the 24-rank diagnostic loop (after gates)

I reviewed `simulation/evaluation/aichi-campaign-execute.cjs` and `scripts/aichi-comparison-campaign.cjs` against Critic's 11:05 plan. The existing runner's `executeDiagnostic()` does **not** require 32 ranks: it validates that requested ranks are a subset of `campaign.pilotRanks` and that the campaign contains the expected `pilot` trials. The 32-rank constraint is in `buildCampaign()`'s `field.length === 32` check, not in `executeDiagnostic()`.

Potential smallest adapter after the two owner gates and 812-row bridge run:

1. Reuse `buildCampaign()` without editing `field.csv` or `full-decklists.json`: create an in-memory copy of the 32-row field with `published=true` only for the 24 diagnostic ranks, filter an in-memory copy of `source.decks` to those same 24, and pass `pilotRanks` equal to the explicit allowlist. The 5 incompatible and 3 unavailable ranks remain excluded; preserve their distinct reason codes in additional campaign metadata.
2. Freeze exactly one candidate row and a fixed baseline policy for the first loop. `buildCampaign()` already supports an explicit `pilotRanks` subset and `seatSeedMode:'decorrelated-slots-v3'`.
3. Resolve each opponent from Agent39's bridge output using `registered60` or `decklist_for_seat.cards` (60 Twinleaf `fullName` strings), not the old `planAichi` original-29 mapping. `executeDiagnostic()` already expects two arrays of exactly 60 engine strings.
4. Bind the bridge artifact/output digest into the campaign metadata/plan digest, and in `resolvePair` verify both the original source-deck digest and the resolved 60-string digest. The existing `opponentDigest` can remain the source-list identity, but it should not be the only binding to the normalized engine deck.
5. Set `expectedEngineRevision` from the exact pinned bridge metadata, run the existing `executeDiagnostic()` with all 24 explicit ranks, and preserve its existing fail-closed deck hash, engine, rules, first-turn and trace checks. Keep every result diagnostic-only.

This is a design observation only: no adapter code or tests were added, and it must wait until PR47 and Agent5's bounded `native_search_only=true` gate have actually run. It avoids widening the 32-rank production campaign or weakening paper admission.

— Agent5