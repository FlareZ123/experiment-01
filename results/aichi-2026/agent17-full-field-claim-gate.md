# Source-bound full Aichi claim gate (Agent 17, 19 October 2026)

**Evidence class:** An exact roster-fingerprint precondition for the *final* 32-opponent 99.5% statistical assessment. This work adds **zero competitive games**, changes no candidate list, and makes no claim of competitive strength.

## Missing boundary in earlier numerical evaluator

The existing `scripts/aichi-anytime-field-evidence.cjs` correctly requires 64 rank/actual-start cells in each round, consistent deck/policy hashes across rounds, actual first-draw alignment, and unique game IDs/seeds. Those are essential numerical and internally reported provenance checks. They do not by themselves prove that the 32 named opponent SHA256 strings correspond to the actual tournament registrations. A hypothetical 64-cell fixture using invented per-rank hashes can pass the numerical tests. The evaluator's own comments appropriately warn that it cannot authenticate games or certify source registration.

The repository already has `scripts/aichi-source-fingerprint-map.cjs`, which reuses the campaign's *name/count/set/number/language* canonicalization to fingerprint the authoritative source registry. As of this report it has **29 published exact lists and lacks ranks 23, 25 and 28**. The fixed-deck objective requires all **32** registrations.

## New opt-in full-field claim intake

`scripts/aichi-full-field-claim-gate.cjs` now exposes:

- `assertFullFieldSourceBinding(rounds,fieldMap,candidateDigest)`: fail closed if a supposedly complete source map does not contain exactly one validated fingerprint for every rank 1..32, or if any game record claims an opponent/candidate fingerprint different from the frozen map. It is only an internal consistency check of a caller-supplied map.
- `assessRepositoryFullFieldClaim(rounds,candidateCards,options)`: load the repository's **actual** `full-decklists.json` and `field.csv`, construct the printing-aware rank map, reject an incomplete roster *before* invoking any win-rate arithmetic, canonicalize the supplied fixed 60-card candidate, bind every game to the right printed opponent and unchanged candidate, then delegate to completed winner-binding and Agent 37's new **correlation-robust 64-cell round-level e-process** in `scripts/aichi-correlated-round-evidence.cjs`. Within-round outcomes may be arbitrarily dependent; the anytime test requires the **conditional expected round-average win rate** under its null to be no greater than 0.995 for every prospective round. A successful numerical score would still require independent proof of actual policy competence, source execution, legal effects, clock, sequential design and sample validity before a competitive claim.

The low-level `assessSourceBoundRounds` evaluator enables reproducible **synthetic** full-32 testing of the same source-bound winner and correlated-statistics path, while the repository-anchored public entry refuses missing true lists. Ten all-winning synthetic 64-cell rounds must **not** cross the 99.5% claim boundary under arbitrary within-round dependence, unlike the previously independent-game model. This is a safer statistical assumption, with the round-level conditional-mean hypothesis still requiring real study design.

The new wrapper is intentionally separate from the 29-source exploratory pilot. It prevents partial-field or substituted-deck evidence from being presented as a verified 32-opponent result while keeping predeclared 29-source experiments available for diagnosis.

`tests/aichi-full-field-claim-gate.test.cjs` covers a synthetic complete fingerprint map, missing and duplicate ranks, altered opponent or candidate digests, and the real repository's current incompleteness. The fake complete map is deliberately **only a validation fixture**; no constructed deck enters the actual benchmark. A second regression explicitly tests that 640 synthetic wins from ten potentially perfectly correlated rounds remain insufficient and that an inverted terminal winner is rejected.

## Reproducibility

- Source: [claim gate](../../scripts/aichi-full-field-claim-gate.cjs), [targeted tests](../../tests/aichi-full-field-claim-gate.test.cjs), [canonical rank digests](../../scripts/aichi-source-fingerprint-map.cjs).
- Integrated into the existing inexpensive **manual-only** `.github/workflows/aichi-benchmark-stats.yml`.
- [Manual CI 39187823240](https://github.com/FlareZ123/experiment-01/actions/runs/39187823240) **passed**, head `0d1e49d0c87abfad4b82c77e48691548d36d01ab`, after commit `3117b9d`.

**Current outcome:** The full-field claim intake correctly refuses an Aichi 2026 Top-32 statistical result while ranks **23, 25, 28** lack an exact public 60-card source. A future source discovery should first be validated and committed with provenance; only then can this wrapper compare all 32 source fingerprints to frozen game records. The 99.5% target remains entirely unproven.
