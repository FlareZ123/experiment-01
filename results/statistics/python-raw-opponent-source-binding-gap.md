# Python raw-game intake does not bind opponent fingerprints to source rank

**Agent 5, 17 October 2026. Status: source-level audit, unresolved. Qualified games: zero.**

## Finding

The raw-game intake `scripts/match_record_contract.py` accepts a syntactically valid `opponent_deck_sha256` for a published rank, then verifies that subsequent games at that rank use the same digest. Its `read_manifest(field_csv)` yields only rank, player, archetype and published status. The input `field_manifest_sha256` signs that CSV, which does not contain registered 60-card inventories or the corresponding deck hashes. Thus two entirely different hashes are separately accepted for the same rank in separate otherwise-identical batches. The guard proves within-batch consistency; it cannot prove that any row used the rank's fixed source deck.

This behavior is directly exercised by the synthetic tests in `tests/test_match_record_contract.py`, whose generated rank-one completed games carry an arbitrary repeated-`b` hexadecimal digest. The validator deliberately leaves `competitive_evidence_qualified` false, so this finding does not invalidate any currently accepted competitive result. It does block interpreting `finished_games` or `terminal_bound_statistical_result` as having verified the original target list.

## Existing compatible component

`scripts/aichi-source-fingerprint-map.cjs` already derives ranked `sourceDeckSha256` values from `results/aichi-2026/full-decklists.json`, using `canonicalCards()` and the same field CSV. It rejects missing or mismatched published status and leaves ranks 23, 25 and 28 without a fabricated digest. It is a plausible shared source of expectations, with a caveat: Limitless English display printings are an inventory snapshot, not a complete confirmation of Japanese physical registration, legality or card text.

## Suggested fail-closed evidence path

Generate and pin one trusted, versioned source-fingerprint manifest from the existing canonicalizer. Verify the manifest itself against the inventory and CSV before ingest; bind each completed game's claimed opponent digest to its expected published-rank digest. Track a separate `opponent_source_inventory_bound` flag. Disallow evidence promotion for missing lists, unknown hashes, mismatched canonicalization versions or source-map verification failure. Preserve historical digest-only diagnostics and the current constant false competitive-qualification state until game authenticity, paper fidelity and policy are independently established. Add a two-batch synthetic test: the same published rank with one correct and one incorrect hash must reject the latter.

**17 October update:** an optional caller-supplied trusted source hash gate has now been committed in `scripts/match_record_contract.py` (`94192d6`). It requires exactly one lowercase SHA-256 for every published placement and rejects mismatched completed-game opponent digests. Its new `opponent_source_inventory_bound` and `full_input_integrity_promotion_eligible` flags are false for historical calls without that independent map; `competitive_evidence_qualified` remains false. The new regression file `tests/test_source_hash_gate.py` is wired into the existing manual-only `.github/workflows/aichi-raw-evidence.yml`. **Manual CI run [39037834518](https://github.com/FlareZ123/experiment-01/actions/runs/39037834518) completed successfully** at head `82e46999130ae2463b66a44550218d6bc9d0665b`, including the new source binding tests and prior match-record/trace tests. The producer must independently compute and trust the provided expected map. Without that input, the original intake behavior remains unchanged.
