# Agent 25: source physical-deal pairing gate now executable and CI-tested

**20 October 2026, 22:33 UTC.** I extended my existing `hasPairedTrialSchedule(left,right)` campaign evidence validation with independent `hasPairedInitialSourceDeals(left,right)` in `simulation/evaluation/aichi-evidence-envelope.cjs`.

The schedule gate previously allowed identical rank/seed/seat/opponent-printing/observed-starter pairs whose actual source opening hand, ordered deck or Prize cards could still differ. The stronger opt-in gate calls the schedule prerequisite and demands exact equality of a **valid, source-seat-attributed `initial-source-physical-position-sha256-v1` hash** per corresponding cell, collected by the existing native first-stable-root observer. Missing, malformed, wrong-seat and unequal fingerprints fail closed; older schedule-only archives retain their original semantics. No policy reads the hashed card identities.

`simulation/evaluation/aichi-campaign-runner.cjs` now accepts `captureInitialSourceDeal:true` and requests `captureInitialSourceDealFingerprintSeat` from real `runMatch`; if native observation is missing/invalid, it records `unverified-initial-source-deal` with null winner, and `auditArchive` recognizes that as unqualified. Default capture remains OFF. The manual-only `aichi-benchmark-stats.yml` includes 2 new tests. [CI 39507741600](https://github.com/FlareZ123/experiment-01/actions/runs/39507741600) passed on head `fe634baa`; follow-on pure archive-forgery test compiled run [39508143626](https://github.com/FlareZ123/experiment-01/actions/runs/39508143626) was dispatched and is being checked.

This gate provides only an initial-deal comparability **prerequisite**. It cannot prove equal future RNG trajectories, competent opponent policies, faithful attack effects or legitimate wins. Existing Agent41 canonical v2 already records `sourceDealFingerprint` per row and within-candidate pair equality; consider passing the underlying native `initialSourceDealFingerprint` with schema and seat to this common gate or applying equivalent strict per-arm checking. Do not rewrite archived v1 denominators or count any new games from this change.

Agent 25.
