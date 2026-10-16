# Agent 48: independent-slot diagnostic plan integrity

**16 October 2026. Research infrastructure and provenance improvement.** No deck-strength or matchup win-rate inference is made.

## Problem verified

The shared campaign generator already supported `independent-slots-v2`, assigning different seeds to the A and B engine-slot executions of each rank/repeat. The bounded diagnostic consumer in `simulation/evaluation/aichi-campaign-execute.cjs` rejected any schema version other than 1, preventing a v2 campaign from being run through the newer three-candidate diagnostic path. It also accepted the presence of a stored `planDigest` without recomputing its SHA-256 from the metadata and trial schedule; a modified seed or trial row could therefore reach the engine under an unchanged plan label.

The source-locked campaign runner is a separate implementation and already reconstructs its schedule from fixed inventories. Its checks are preserved and are not superseded here.

## Changes

The diagnostic executor now accepts v1 and v2 and checks that the explicit seed protocol matches the schema. Before calling a deck resolver or game engine, it verifies the hash of `{ metadata, trials }` and the selected pilot trials' source candidate digest, trial ID, repeat index, physical engine slot and formula-derived seed. Any discrepancy rejects the entire request. This is a provenance gate. It cannot establish card legality, engine behavior, correct decision policy or meaningful win rate.

The result records both `campaignSchemaVersion` and `seedProtocol`. The default for direct script execution remains the archival `paired-slots-v1`; the new optional `AICHI_DIAGNOSTIC_SEED_PROTOCOL=independent-slots-v2` selects the upgraded schedule. The manual bounded-engine workflow explicitly selects v2 for its rank-6 three-candidate diagnostic. The original v1 digest and historical observations remain unchanged.

For v2, the rank/repeat/slot seed assignments are:

- slot A: `seedBase + 100000 + 1024 × rank + 2 × repeat`;
- slot B: slot A seed plus 1.

For a given physical slot, all three candidates retain the same assigned seed. Different slots receive different seeds. Distinct deterministic seeds address the known exact-mirror replay alias in v1 but do not by themselves prove strong adversarial play, independence of all simulated outcomes, or physical-randomness coupling across divergent action histories.

## Verification and limits

The dedicated [four-test v2 suite](../../tests/aichi-campaign-seed-v2.test.cjs) checks the six rank-6 scheduled trials, cross-candidate seed matching, rejection of unmodified-digest tampering, rejection of inconsistent rehashed seeds, and version/protocol mismatch. The existing [diagnostic regression](../../tests/aichi-campaign-execute.test.cjs) was updated to expect earlier tampering rejection. All tests in the [manual statistical CI run 38842388341](https://github.com/FlareZ123/experiment-01/actions/runs/38842388341) passed.

**Remaining test:** compile and execute a real rank-6 v2 bounded diagnostic through the manual gameplay workflow, and preserve the artifact's reported seed protocol and trial seeds. Even if all six engine games finish, they remain exploratory policy diagnostics only. The frozen three-candidate schedule does not certify the 99.5% objective, and three Aichi ranked opponent lists are still unpublished.
