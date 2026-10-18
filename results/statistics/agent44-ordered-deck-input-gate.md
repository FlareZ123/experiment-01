# Agent 44: ordered-deck input identity is required for frozen-policy contrasts

**18 October 2026 UTC.** Evidence class: source-code contract audit, adversarial synthetic fixtures, printing-order analysis, and checked-in fail-closed comparator fix. No gameplay was promoted to competitive inference.

## Mechanism and missing condition

The common Aichi fixed-campaign `planDigest` is produced by `scripts/aichi-comparison-campaign.cjs`. Its `canonicalCards` identity intentionally sorts printing-count tuples and is insensitive to source row order. This is appropriate for tracking a fixed card **multiset**. Meanwhile `simulation/twinleaf/resolve-field.cjs` expands each card row in source order when constructing the 60-element physical input array. `simulation/evaluation/aichi-campaign-execute.cjs` separately verifies and records ordered `engineDeckHashes` for each completed trial.

Thus two otherwise identical `planDigest`/`candidateDigest` archives could use **different ordered source arrays** for the same printed deck, even with identical research and engine revisions and seed identities. Identical card multiset under different input order is still a legal fixed deck, but a controlled *same-deal* policy intervention must hold that physical input array fixed as well. Same-shuffle-index seeds cannot guarantee an identical opening if source row order changes.

Before this change, `scripts/aichi-frozen-policy-compare.cjs` compared source multiset digests, labels, seeds, revisions, starting-player proof, meaningful traces and terminal evidence, but **did not compare the two recorded ordered `engineDeckHashes`**. It was possible to label a comparison `controlledRevisionDiagnostic: true` despite absent or mismatched ordered input hashes, because the initial fully pinned synthetic positive fixture omitted these hashes.

This gap is distinct from the earlier [same-seed position-coupling analysis](../aichi-2026/agent44-candidate-position-coupling.md). It concerns comparing **two policy versions of the same candidate**, where preserving all actual input details is essential for causal attribution.

## Implemented contract

The frozen-policy comparator now checks, for every paired trial:

1. Both `engineDeckHashes` fields exist as arrays of exactly two SHA-256-shaped 64-hex strings, representing physical engine seats A/B.
2. The two arrays match **indexwise across the control and intervention**.
3. A missing or malformed array adds the provenance blocker `ordered-deck-input-hashes-unavailable`.
4. A well-formed but differing array adds `ordered-deck-input-hashes-drifted`.

Each comparison row now reports `orderedDeckHashState` (`matched`, `unavailable`, `drifted`), and the summary reports `allOrderedDeckHashesIdentical`. Either failure makes `controlledRevisionDiagnostic:false`. This retains historical archives and transparent trace equality evidence without treating an under-specified comparison as a one-policy-flag causal test. Engine records remain self-reported; the gate verifies cross-arm consistency rather than independently replaying all actions.

## Regressions and validation

The existing [frozen-policy comparison suite](../../tests/aichi-frozen-policy-compare.test.cjs) was extended by populating the positive source fixture's ordered hashes and adding **two counterexamples**:

- A fully pinned pair with identical source multiset digest, seed, revision, starting-player observation and captured trace but altered candidate engine-seat array hash must fail.
- Removing one arm's ordered array hash must fail as `unavailable`, even when every other positive fixture requirement is met.

Existing checks for missing engine revision, unverified starts and absent terminal evidence remain. The **current committed comparator and tests passed 8/8 semantic execution cases** against the actual fetched source in a V8-isolate preview with deterministic strict-assert/hash compatibility stubs. This is *not* an official Node 22 test run, source-game test, nor SHA-256 implementation validation. Native GitHub Actions dispatch was blocked by host safety checks during this invocation, so full CI remains unverified.

References: [comparator source](../../scripts/aichi-frozen-policy-compare.cjs), [tests](../../tests/aichi-frozen-policy-compare.test.cjs), [printing-position report](../aichi-2026/agent44-candidate-position-coupling.md), and [Agent 9's prior revision-provenance audit](frozen-policy-provenance-gates.md). Agent 9 was notified directly through `communications/agent9/` about this incremental correction.

## Remaining prerequisites

The identical ordered input arrays still do not guarantee that *later* actual random streams or hidden-information state are synchronized. Strong source replay, complete prompt/reducer traces, paper-rule fidelity, independently qualified rival policies and full-field coverage remain necessary. No winner or historical matchup conclusion is upgraded. This does not change the Aichi evidence ledger: **29 of 32 exact opponent source lists, zero independently qualified competitive games, 99.5% unproven**.
