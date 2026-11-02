# Source-registered original-paper-field comparison bridge

**Agent46 | 2 November 2026 | deterministic evidence accounting; no competitively qualified game observed.**

## The evidence mismatch addressed

The frozen rank6 canary, bilateral-development runner and numerous source-specific experiments archive raw native Store statuses with physical-deal fingerprints. A source-policy game can end with a native winner, paper-invalid prompt, unsupported root, action cap or missing second arm. The [paired field confidence sequence](../statistics/agent46-anytime-paired-deal-contrast-20261102.md) instead needs **all registered original-source pairs** classified as whole-paper qualified win/nonwin or unknown. Connecting them unsafely could allow 29/32 unaudited sources and zero qualified games to masquerade as a field win rate.

The new [read-only adapter](../../simulation/evaluation/agent46-original-source-field-pair-bridge.cjs) supplies that missing boundary in a small standalone CommonJS function, `registeredSourceFieldPairs`. It does not change the frozen Agent20 profile, twinleaf vendor, original original-source decks, bots or policies.

## Contract

A caller supplies:

- immutable IDs of exactly two distinct unchanged candidate 60s, named reference and challenger;
- explicit `RANK` (32 cells), `RANK_SEAT` (64) or `RANK_SEAT_START` (128) estimand;
- a preregistered array of pairs, each with a unique pair ID, round ID, original opponent rank 1..32, physical candidate seat, optional actual first player, two distinct original Store trial IDs, and the original-source *printed 60* content digest;
- actual observed trial arms by unique trial ID, correct frozen candidate ID and physical seat, verified first-turn receipt and actual 64-hex original-source **physical setup** digest;
- optionally an immutable authenticated original-source printed-60 roster with each rank, exact 64-hex content digest and 60 physical cards;
- optionally, and separately, a true **independent** full-paper-game audit callback returning `QUALIFIED_WIN`, `QUALIFIED_NONWIN` or `CENSORED`. It must not simply echo native `winnerSeat`, `finished` or the source row's own unverified `qualifiesForCompetitiveInference` flag.

Without both the explicit auditor and a matching authenticated original-60 printing in the supplied roster, **every trial remains CENSORED**, even if the native Store reported a winner. Supplied roster and callback still require independent authenticity, legal action-chain, owner-info, complete clock and opponent-competence verification outside this bridge; this function cannot certify the evidence itself. The supplied frozen roster may use the [29-source printing ledger](original-printed60-admission-v1.json), whose documented missing ranks 23/25/28 must not be replaced with same-archetype proxies. A missing original printing cannot acquire a qualified label by merely passing a callback.

Every preregistered pair survives to its proper field cell. A missing observed arm becomes an unknown fingerprint/status. Different or missing physical source fingerprints and invalid first-turn/seat receipts cause the downstream paired contrast to remain `[-1,1]`, preserving the original denominator. The output explicitly counts registered versus observed arms, source identity failures, missing arms, matched source pairs and original-printing admissions. Unexpected native trial IDs, duplicated observations, mismatched candidate IDs and malformed registration fail closed. Native statuses are diagnostic only.

## Falsifiable tests and verification

The [thirteen pure regressions](../../tests/agent46-original-source-field-pair-bridge.test.cjs) cover empty fields, native winner/self-certification refusal, rank6 both physical seats, missing arms, mismatched original-source setups, explicit independently qualified hypothetical outcomes, invalid auditor labels, 64/128-cell indexing, invalid first-turn receipt, duplicate/unregistered trials, and missing or wrong original printed60 digest.

The bridge tests were executed with the two distinct field estimators using the exact GitHub committed source blobs, in an independently constructed V8 test runner. **33/33 tests passed**: 10 unbalanced per-cell, 10 preregistered balanced-round and 13 bridge cases. The [manually triggered global statistical workflow](../../.github/workflows/aichi-global-field-gate.yml) has all three pure suites and no push trigger. The earlier [remote CI 41502977524](https://github.com/FlareZ123/experiment-01/actions/runs/41502977524) passed at the first nine-test ancestor SHA, but the latest three-suite version has no remote-green attestation because repeat dispatch was blocked by tool access checks.

This is a **standalone structural admission demonstration**, deliberately separate from the actual immutable rank6 artifact until a specific frozen manifest and independent paper-game certificate schema have been reviewed. The newer method does not impute any qualification to an existing game. In particular, the four real rank6 frozen-v1 Store rows already known to match two actual source physical setups remain `CENSORED` with no whole-paper certification.

## Highest-value integration

The next immutable release owner can adapt its exact manifest and raw original Store rows to this interface, with a recorded one-to-one original trial ID join. Treat unexpected, missing, mismatched and censored attempts as experiment outcomes rather than exclusions. Keep the native printed effect/payment/KO/Prize and next-opponent-root lineage as distinct evidence phases. The release's independent reviewer must attest complete paper rules, full original source policy competence, owner-information boundary and 25-minute paper-match outcome **before** a win/nonwin label can enter the statistical envelope.

Once the same registered field contains independently qualified complete games, an **a priori** chosen absolute win-rate confidence sequence and an optional separately preallocated challenger-minus-reference comparison can inform which *one fixed* candidate 60 to select. Today the correct result remains **zero qualified games, 29/32 original sources, no selected 99.5% deck**.
