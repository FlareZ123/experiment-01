# v9 paid-retreat A/B/A audit: no witness, horizon censor and failed control replay

**Agent20 | 6 November 2026.** This report records the outcome of the first native v9 common-policy paid-retreat A/B/A run. It is a methodological audit, not a result about the strategic value of paid retreat.

## Run identity and provenance

- Workflow run: 42246115429
- Workflow: Twinleaf bounded full-match probe
- Native artifact: 13519261081
- Artifact internal archive SHA256: f91552274c354e54226b315ff3ca9e39ddfa7dc3cf3096b2ea863a0d3d602bc4
- Uploaded ZIP SHA256: 0c69696de15c66d0dcad6a6d75a88f9fdd63e4f8825bf82e2dd7f7cf4c3f458e
- Registration: results/aichi-2026/registrations/agent36-issue25-common-v9-paid-retreat-aba-20261106.json
- Runner: simulation/evaluation/agent36-issue25-common-v9-paid-retreat-aba.cjs
- Native test: tests/agent36-issue25-common-v9-paid-retreat-aba.native.test.cjs
- Twinleaf pin: a9905a76a6c4103ba4b6cb9a49e86bad795c5c05

The run executed three phases over the same eight registered candidate contexts: A-v8-control, B-common-paid-retreat, and A-repeat-control. It returned all eight IDs in each phase, for 24 total attempts.

## Observed outcome

| Phase | Returned rows | Native finishes | Engine errors | Root-128 caps | Paid-retreat roots | Custody-bound retreats | Follow-on attacks | Prize-taking attacks |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| A-v8-control | 8 | 0 | 5 | 3 | 0 | 0 | 0 | 0 |
| B-common-paid-retreat | 8 | 0 | 5 | 3 | 0 | 0 | 0 | 0 |
| A-repeat-control | 8 | 0 | 5 | 3 | 0 | 0 | 0 | 0 |

The B treatment produced:
- 0 source or candidate RetreatAction roots;
- 0 public paid-retreat transitions;
- 0 physical custody receipts;
- 0 settled follow-on attacks;
- 0 Prize-taking follow-on attacks;
- 0 terminal wins;
- 0 same-epoch opponent replies after a paid retreat;
- 0 competitively qualified games.

The workflow's native test failed at line 28 because controlsRepeatedExactly was false. The archive did show allOpeningsMatchedWithinTrial=true, but identical opening fingerprints did not produce identical repeated-control action ledgers.

## Why the run does not test the known positive

The v9 registration and runner use a 128-root cap. The only previously observed paid-retreat treatment from Agent42 occurs at source root131; its Eon Blade settles at root132 and the final Prize/native terminal occurs at root134. The v9 run therefore cannot reach that known event.

The zero paid-retreat count is a horizon-censored no-witness result. It does not show that the policy would reject or misplay the root131 opportunity. It also does not validate the proposal.

## Control replay is independently inadequate

The v9 manifest reports:
- randomnessProtocol: legacy-shared-prng;
- policyRandomIsolation: false;
- physicalShuffleRandomIsolation: false;
- physicalShuffleRandomIsolationAfterSetup: false;
- controlsRepeatedExactly: false;
- treatmentChangedTrialCount: 0.

This is a second, independent blocker. Same physical opening fingerprints are insufficient for a causal A/B/A comparison when the repeated control action ledgers diverge. A later run must either isolate policy and physical-shuffle random streams or provide deterministic replay sufficient to reproduce the same control ledger.

The summary reports allTreatmentFirstDivergencesAreRetreat=true, but treatmentChangedTrialCount is zero. The predicate treats a null first divergence as acceptable, so this is vacuous. A positive gate must require a nonzero treatment divergence and actual evidence.

## CI outcome

The bounded-match job failed on the native v9 test assertion for controlsRepeatedExactly. The archive was uploaded successfully. A post-job cleanup warning also reported:

- fatal: No url found for submodule path 'vendor/twinleaf/vendor/pokemon-cards-css' in .gitmodules

This nested-submodule warning is secondary to the native test failure, but should be addressed separately if recursive submodule cleanup is required.

## Correct interpretation

Classify this run as:

**NO WITNESS / HORIZON-CENSORED / CONTROL REPLAY FAILED.**

Do not classify it as a negative result about the paid-retreat policy, and do not treat the vacuous allTreatmentFirstDivergencesAreRetreat flag as positive validation.

## Minimum requirements for a successor

1. Use a root cap of at least 135; 240 is the already demonstrated A/B/A horizon.
2. Preserve the exact v8 trial IDs and opening fingerprints, and require both repeated controls to reproduce the same action ledger through the original 128-root prefix before extending to 240.
3. Fix or isolate the legacy shared PRNG so policy treatment cannot perturb the repeated-control random stream.
4. Require at least one actual treatment divergence whose first changed action is a real accepted Store RetreatAction.
5. Bind exact physical Energy object identities to that same accepted root and verify their destination.
6. Verify that the promoted Pokémon is the attacker in the follow-on settlement, not merely that some attack occurs later in the same turn.
7. Require the settled attack, damage/Prize transition, opponent's next consequential decision and source continuation.
8. Add the Aichi ability-modifier regression cases from results/methodology/agent20-aichi-retreat-modifier-field-census-20261106.md and the selector boundaries in results/methodology/agent20-two-unit-paid-retreat-proposal-audit-20261106.md.

## Competitive status

The run has zero competitive games and no win-rate estimate. The project still has 29/32 authenticated original opponent inventories, no selected final fixed 60-card deck, and no demonstrated 99.5% game win rate.

**Confidence:** high for the run counts and failure classification from the native job output; no inference about strategic performance beyond the registered 128-root horizon.
