# Agent 42: four-cell pre-outcome intake now binds the exact registered 60s

**21 October 2026. Evidence:** source-code review, eight pure synthetic regressions, and the existing [manual Aichi statistical CI run 39529860567](https://github.com/FlareZ123/experiment-01/actions/runs/39529860567), **success** on commit `68d22519b02a40f55b1cab3a75e4b99969a2036a`. No source-dealt matches were executed or qualified.

## Defect and significance

The former [paired four-cell accrual](../../scripts/aichi-paired-four-cell-accrual.cjs) v1 froze a candidate *name*, opponent *rank*, physical seat and seed, then checked actual first-turn evidence and an opaque full source-position digest. It did **not** bind either candidate ID to a content hash of its full 60-printing list. A caller could retain `champion` or `newmoon` while silently changing the associated list. Identical source initial positions would not detect such a candidate-roster substitution. The same observation protocol also omitted an explicit rank-to-source-deck hash attestation.

This is a prospective evidence-integrity risk, not a demonstrated violation in an existing match archive. It matters because any claimed fixed-60 Aichi win rate is invalid if the candidate 60 changes within the sample.

## Repair and tests

`accruePairedFourCells` now requires schema `aichi-fourcell-paired-start-plan-v2` and maps `candidateDeckHashes` and `sourceDeckHashes`. Every registered candidate ID and rank must have one lowercase SHA-256 hash. Each observed arm must echo **both** `candidateDeckSha256` and `sourceDeckSha256`; mismatches or missing hashes set the original pair's reason to `unverified-setup`, retain it in the census, and block later accrual. The result includes the frozen hash maps and is labeled `aichi-fourcell-paired-start-accrual-v2`. Former v1 input is deliberately rejected to avoid a false certification from incomplete provenance.

Existing native runner `simulation/twinleaf/headless.cjs` computes deck digest as `sha256(JSON.stringify(deck))` where the deck is an ordered 60-element array of printing identifiers. Future native emitters should use this identical construction, capture the actual `deckHashes` from each original Store arm, and compare them to the externally recorded plan. Do not hash normalized card names alone or silently reorder a deck after registration.

Two additional [pure tests](../../tests/aichi-paired-four-cell-accrual.test.cjs) prove that a swapped candidate digest, altered source digest and missing arm digest cannot pass selection even when the source physical-deal digest and first-draw evidence agree. They also reject incomplete, malformed or unlabeled roster-hash registrations. Eight tests now pass; the full existing manual statistical workflow also succeeded without changing a per-push CI trigger.

## Hard limits and next integration

- This module is still an **outcome-blind plan validator**, not an executed Store-setup emitter. Its input JSON remains caller-supplied, so a dishonest or buggy caller could fabricate the hashes. The precommit status string alone proves no external preregistration.
- The source physical-deal digest remains essential for paired-state comparability. Equal 60 hashes alone do not imply equal shuffled source positions, mulligan history, actual starts or favorable outcomes.
- The aligned subset remains conditioned on matching source positions. The original unconditional attempt ledger must retain all mismatches, aborts and unselected pairs when measuring actual game performance.
- Agent 44/41 canonical integration should maintain one profile's hash manifest and attach actual original-Store `deckHashes` plus setup observer evidence before later using this v2 planning helper. Keep all other qualification vetoes and the paper-clock limit.

**Benchmark status unchanged:** 29/32 exact source lists available; zero independently competitive-qualified games; no demonstrated 99.5% single fixed 60.
