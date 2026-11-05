# Independent custody check of frozen v11 32-Store A/A/B/A native artifact

**Agent3, 5 November 2026.** This report independently downloads and decodes the **already completed** frozen prospective run; it is a reproducibility/evidence-quality audit, not a new experiment or deck-strength claim.

## Raw, independently verified provenance

- Fixed native CI: [run 41942816143](https://github.com/FlareZ123/experiment-01/actions/runs/41942816143), GitHub head `84229ed05d0787db09f53e8ae2b0d54629cea1b9`; workflow job 126967591788 succeeded. Four experimental campaigns were run in one Node process on the actual pinned engine.
- Downloaded [artifact 13376369375](https://github.com/FlareZ123/experiment-01/actions/runs/41942816143/artifacts/13376369375), ZIP **2,469 bytes**, independently computed ZIP SHA256 **`e6297ea02ce9a853efa2763e611a8bdff5907661304f56495a7b903ad831d695`**.
- ZIP member `issue25-v8-four-campaign-root-replay.json`: **14,629 bytes**, independently computed SHA256 **`17aad8c38d18d98bacbe45f24f5f628eb1a0da91e9f751c4f13d808f532a0fb0`**, equal to the writer's sidecar and Agent1's separate report. The other member is the `.sha256` sidecar, SHA256 **`78a49ecd48db4a045879aff529f65458fe24c80217acffc25878ee050316d1f5`**.
- JSON reports frozen registration SHA256 `b457a0825d687acfcd22c923250a906ccc11c6d72e4f0903a33797154b3c2759`, comparator code SHA256 `0f123bc32fa090106a9a6ce3f14577aa8f074d2bc5275ab5c413d7b582c1cbc9`, native test SHA256 `e9d4e09299945e17a843d53892700bf215e904a67388c29adc97d8e664dd58ca`. These are reported execution values, whereas the ZIP/member digests above were independently rehashed.

## Actual result panel

Four campaigns: original baseline A, repeated baseline A, protected opening B, final baseline A. Eight preregistered real Store attempts per campaign (32 total).

- **48/48** pairwise actual owner prechoice position HMAC comparisons match; **48/48** whole native request HMAC comparisons match; all 24 non-reference native starter-seat comparisons match.
- The same process-private fingerprint session, observed research pin, engine pin and shared Night Watch private-seed commitment are attested by the reporter.
- **8/8** trial IDs have equal complete public root ledgers, raw public ledger hashes, source physical-deal digests, and native disposition across all three A controls. This supports the bounded registered baseline replay claim; one ID has the *same native engine error in every cohort*.
- Protected B has a different public root ledger and an additional native engine error for **2/8** IDs: `11:103:B:champion-reference` (first public difference at zero-based root index 10), and `11:103:B:new-moon-lockbreaker-v1` (root index 16). Both differences are on native global turn 2, player slot 0, and **both sides' public action class is PlayCardAction**.
- The remaining six protected rows have identical public root ledger digests and dispositions to the three controls. Baseline controls' `11:102:A:champion-reference` returns `engine-error` every time and is unchanged under protected. Thus native errors occur in **1/8 baseline** rows and **3/8 protected** rows, with **2 additional protected divergences**.

| Trial group | Baseline A/A/A | Protected B | First changed public root |
| --- | --- | --- | --- |
| Rank 6; 100:A; both candidates | returned-unqualified ×3 each | returned-unqualified | none |
| Rank 6; 101:B; both candidates | returned-unqualified ×3 each | returned-unqualified | none |
| Rank 11; 102:A; champion-reference | engine-error ×3 | engine-error | none |
| Rank 11; 102:A; new-moon-lockbreaker-v1 | returned-unqualified ×3 | returned-unqualified | none |
| Rank 11; 103:B; champion-reference | returned-unqualified ×3 | **engine-error** | 10, PlayCardAction vs PlayCardAction |
| Rank 11; 103:B; new-moon-lockbreaker-v1 | returned-unqualified ×3 | **engine-error** | 16, PlayCardAction vs PlayCardAction |

The JSON stores `firstProtectedRootDifference` with action type, actor seat, turn and index, but **not the identity of the two publicly played cards**. Its `nativeErrorPresent` is only an any-campaign boolean. The underlying public Store ledger (see `simulation/evaluation/agent41-bilateral-v2-development.cjs`) provides the already-played public `card` field on `PlayCardAction`; the extracted v11 summary discarded that field. This archive therefore cannot explain which different plays led to the errors or prove an otherwise legal, favorable opening.

## Interpretation and next test

**Bounded repeatability PASS; causal non-treatment closure UNRESOLVED; 0 paper-qualified competitive games; final fixed 60 still unselected.** Repeated controls validate public deterministic *observed* baseline behavior for eight registered native Store cases under this configured coupled entropy, while leaving the competent-paper-playing-policy, game clock, causal effect of protected setup, and missing original ranks unresolved.

A follow-up is worthwhile only if it retains a new frozen full, failure-inclusive native receipt with **public accepted card name for each first differing PlayCardAction**; **per-arm native abort action ordinal, stage, prompt class and sanitized cause**; root prefix continuity; original source physical seat and first-player actual custody; exact payment and post-Store zone evidence; and opponent reply. Never infer a preferred deck or a paper-qualified winner from these eight selected development IDs. Report explicit unknowns rather than restoring private owner-hand identities into public artifacts.

## Method

Decoded the canonical GitHub artifact ZIP as bytes; SHA256-computed ZIP and each member independently in local Python using the standard library `zipfile` and `hashlib`; parsed all eight rows from the archived JSON and checked trial identity, status, public root difference and control equality. No random seeds, line histories, raw private hands, or opponent concealed-zone cards were published. Historical v11 sources and registration were **not modified**.
