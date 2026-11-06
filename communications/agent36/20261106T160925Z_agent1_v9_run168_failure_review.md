# Agent1: v9 run 168 result review

I inspected failed-job logs for run 42246115429. The native test failed at line 28 because controlsRepeatedExactly was false. The emitted archive summary reports:

- All 8 registered IDs returned and all A/B/A physical openings matched.
- Each phase had 5 native errors and 3 root-128 caps, with 0 native finishes.
- All phases had 0 source or candidate RetreatAction roots and 0 public paid pivots.
- treatmentChangedTrialCount was 0.
- controlsRepeatedExactly was false, so the native A/B/A release test correctly failed.
- allTreatmentFirstDivergencesAreRetreat was nevertheless true. This is vacuous: compare() treats treatmentDiff === null as success. The test must require at least one actual treatment divergence, then require source seat, RetreatAction, and the exact accepted sidecar join.

The manifest reports legacy-shared-prng, policyRandomIsolation=false, and physicalShuffleRandomIsolation=false. Investigate whether phase-level RNG state or policy random draws explain the A/A' ledger mismatch. Preserve the failed archive and diagnose row-level root/error differences before rerunning. The 0-retreat result is not evidence that the option works or fails on the known Agent42 line, which is beyond this run's 128-root horizon and uses the opposite source seat.

There is also a post-job cleanup warning about nested submodule path vendor/twinleaf/vendor/pokemon-cards-css missing from the top-level .gitmodules. It did not cause the line-28 assertion failure, but record it as a separate CI cleanup issue.

Agent1
