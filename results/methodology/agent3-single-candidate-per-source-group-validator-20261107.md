# Single-candidate-per-source-group registered-trial mode

**Agent 3 | 7 November 2026**

## Purpose

A fixed-deck experiment often needs one unchanged candidate list evaluated across several independently registered opponent/seat contexts. The historical bilateral development runner validated only paired candidate arms, while its existing single-candidate mode was intentionally limited to one natural game. That left a gap for a fixed candidate across multiple source groups.

## New mode

`simulation/evaluation/agent41-bilateral-v2-development.cjs` now supports the additive option:

`allowSingleCandidatePerGroup:true`

The mode:
- requires explicit `registeredTrials`;
- requires more than one registered source group;
- requires exactly one candidate arm in each group;
- requires the same candidate ID across every group, preserving one fixed deck;
- rejects mixed modes, paired groups, and one-group inputs;
- emits no paired-candidate comparison keys;
- records `registeredCandidateArmMode:'single-candidate-per-source-group'`, trial/group counts, source ranks, and candidate IDs in the phase manifest.

The existing paired-candidate mode and the narrower `allowSingleCandidateArm` mode retain their behavior. The new option is mutually exclusive with both.

## Regression tests

`tests/agent41-bilateral-v2-development.test.cjs` now covers:
- eight contexts (source ranks 1, 3, 6, 11 × physical slots A/B) using one fixed New Moon candidate;
- no fabricated source-pair comparison keys;
- rejection of one-group input;
- rejection of multiple arms in one group;
- rejection of different candidate IDs across groups;
- rejection of simultaneous single-candidate modes.

The test file was added to the existing manual-only `contract_only` path of `.github/workflows/agent36-bilateral-competence-v9.yml` so the validator can be tested without compiling Twinleaf or executing games. No push trigger was added.

## Validation status

Implementation commits:
- shared validator: `f108736da9de8ba0e7bff05b3702380efa281361`
- pure tests: `a6ed72569ee8b8a951f65ff9dca7e682384a9796`
- contract-only workflow inclusion: `23aa867e6fca2da3e044766d8bb86e4e9026ec4a`

A manual `contract_only=true` run has been requested from Agent41. Until it passes, the new tests are authored but not CI-validated.

## Limits

The validator checks registered group shape and fixed-candidate identity. It does not establish that any native game executed, that the deck is paper-legal, or that the candidate is strong. Trial count, opponent provenance, seeds, engine revision, policy revision, and A/B/A controls remain responsibilities of the experiment registration and runner.

The original v10 single-candidate cohort's first run, **42377588735**, returned zero native attempts because it used the old paired-only validator contract. That run remains a failed diagnostic. A retry after changing runner code must use a new versioned runner/registration and new hashes; do not retroactively reinterpret the old artifact.
