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

## 21 October native settled setup-only execution

The protocol now has a read-only bridge from **real pinned Twinleaf Store setup** to the v2 preregistration inputs:

- `simulation/evaluation/aichi-setup-only-capture.cjs` optionally reports `firstTurnEvidence` from the actual first `PLAYER_TURN` root and original `LOG_PLAYER_DRAWS_CARD`; it continues to stop before any normal player action. Its opt-in source fingerprint still includes the complete ordered physical source positions.
- `simulation/evaluation/agent42-registered-setup-native-bridge.cjs` checks SHA-256 of the **ordered original resolved engine printing IDs** against the frozen rank and candidate maps *before* running either setup. Each Store capture verifies complete 60-copy opening multiset conservation, settled first-turn ID/name/draw-log agreement and ordered source-deal fingerprint. A failed/missing proof is retained as unverified and blocks subsequent registered accrual.
- `simulation/evaluation/agent42-native-fourcell-setup-smoke.cjs` fixes in version-controlled source a bounded schedule against authentic rank **6 Iron Thorns** and **11 Absol/Garbodor**, both physical candidate seats, **champion-reference** and **new-moon-lockbreaker-v1** unchanged. It runs source setup only, with no game policy decision or winner recorded. The in-process roster hashes are mechanically reproducible from the source checkout, but this smoke **does not establish an independently timestamped external preregistration**.

**Compiled result:** [manual pinned Store CI run 39531694443](https://github.com/FlareZ123/experiment-01/actions/runs/39531694443), source head `775659ace8ed53f33954a12bf113b5d934ec9b5b`, completed **success**, with 14/14 relevant pure tests passing. The actual native execution reported:

| Published source rank | Candidate seat 0 actual starter | Candidate seat 1 actual starter | Settled native paired setup matches |
| --- | --- | --- | ---: |
| 6, Iron Thorns | Source first | Candidate first | 2 of 2 |
| 11, Absol Garbodor | Candidate first | Source first | 2 of 2 |
| **Total** | | | **4 of 4** |

All **eight** original-Store arm setups were verified before any normal turn decision. All four comparison pairs reported identical complete ordered source-position digests across the champion/New Moon arms, identical actual first-player identities and matching resolved roster hashes. No attempted pair was unverified or excluded. The original first-player strata are **two occupied cells per source rank out of the required four**. Neither rank satisfies a complete four-cell quota; this remains an intentionally small mechanical compatibility smoke.

The entire bounded receipt archive is preserved as [GitHub Actions artifact 12315761766](https://github.com/FlareZ123/experiment-01/actions/runs/39531694443/artifacts/12315761766), ZIP SHA-256 `ebd18bc0676a0128ed436442acb86578552bfaa75789d5b62ab6443d6fa6e64a`, artifact size **2029 bytes**. Those bytes have **not** been independently downloaded and rehashed here; the digest and dimensions are the GitHub Actions uploader's recorded attestation. The bounded native summary was retrieved from the corresponding job logs.

**Limits:** The printable engine-ID hashes identify the *resolved English/mechanical proxy lists and their input order*, and do not independently authenticate the precise original Japanese physical printings, ban/errata legality or tournament registration. Both pilot candidates are represented by only four fixed pair seeds; source first-player/physical seat and rank are not randomized into full balanced four-cell strata. Equal initial source positions do not certify comparable future RNG trajectories. There are zero completed or competitively qualified matches. The canonical bilateral game runner, player policies and paper clock were not modified by this probe. Use this emitter only as a pregame attestation service for Agent44's canonical profile after genuine external plan freezing.
