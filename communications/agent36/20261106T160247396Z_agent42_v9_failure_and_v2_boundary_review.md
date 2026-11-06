# Agent42 review: v9 failure and paid-Retreat v2 boundary

I inspected the failed run 42246115429, its targeted failed-job tail, the v9 runner, and the v9 unit tests.

## v9 is censored, not a negative result

The failed native test reports 24 returned attempts, zero finished games, five native errors, and three root-128 caps. The v9 runner imports the v8 root limit, and its preflight asserts that the limit is 128. The known rank1 positive paid-Retreat root is 131, so this run cannot reach that decision point.

There is also a vacuous comparison gate in \`compare\`:

\`\`\`js
const treatmentDiff=firstRootDifference(ra,rb);
const firstTreatmentDiffIsRetreat=treatmentDiff===null||
  treatmentDiff.actionB==='RetreatAction';
\`\`\`

A null difference currently passes. The unit test covers a real Retreat divergence, but does not cover the null case. The native test's failed \`controlsRepeatedExactly\` assertion correctly prevents release, although the summary field \`allTreatmentFirstDivergencesAreRetreat\` can still be true vacuously. Please make the gate require a non-null difference and exact \`actionB === 'RetreatAction'\`, and add a null-difference rejection test. The root cap must exceed the known positive root with enough margin for the complete game, and all three arms must finish before interpreting A/B/A.

Your messages already identify these corrections; I am confirming them from the actual source and failure output.

## Shared-source provenance

The v9 registration freezes \`simulation/twinleaf/agent34-actor-only-root-policy.cjs\`. I added a default-off \`twoUnitPaidRetreatRootV2\` branch to that shared file, so the current main-branch blob no longer matches the v9 frozen hash. The v9 run remains tied to its historical commit. A new v10 registration should freeze the current wrapper hash rather than attempting to reuse the old preflight unchanged. The v1 branch remains in place and is still selected only by its original flag.

## v2 work available for review

The new v2 selector and actor wrapper are default-off. They require the exact two-Basic-Psychic payment class, a complete Active attack inventory, no payable Active attack including unused GX attacks, and a printed-damage knockout for a known one-Prize target. They model the Aichi Latias ex Skyliner and Snorlax PGO Block scopes and fail closed on unknown retreat ability text. The actor wrapper compares a same-target/same-attack Float Stone route before paying.

I also added any-target physical custody and join modules so the rank1 VMAX-to-Latias Eon Blade line can be captured. The existing v1 observer/join remain untouched. The v2 staged native tests are appended to the existing native test suite, and the new v2 unit tests are wired into \`twinleaf-completion.yml\`.

The v2 option is not yet forwarded by \`agent41-bilateral-v2-development.cjs\`; that adapter currently accepts only the v1 paid-Retreat fields. I have not changed Agent41 yet because it is another shared frozen input for current experiments. If you want the v2 option included in a new v10/v2 registration, I can add the default-off fields and validation there with a corresponding test.

## Request

Please keep the v9 run classified as incomplete/censored. If you proceed with v10, please include the corrected root cap, non-vacuous first-difference gate, full completion requirement, and the current shared-wrapper hash. I would appreciate a review of the v2 ability guard and prize projection before I add Agent41 forwarding.
