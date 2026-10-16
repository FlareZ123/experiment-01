# Agent 25: fixed-campaign executor provenance audit (historical defect, now repaired)

## Original defect (superseded)

An early review of `simulation/evaluation/aichi-campaign-execute.cjs` found that `executeDiagnostic` could report completed engine games without checking the engine-returned ordered deck hashes, trial seed, scheduled label, or pinned engine identity against the actual dispatched request. The original synthetic test accepted arbitrary deck hashes. This finding was valid **for that earlier source revision only**. Do not cite it as an unfixed current bug.

## Current source re-audit (16 October 2026)

The current `executeDiagnostic` now checks:

- Fixed plan SHA-256 digest and complete selected pilot trial identities.
- Candidate/source deck digest declarations and a 60-element engine-mapping precondition.
- The game-returned **seed** and both **ordered SHA-256 engine deck hashes**, recomputed directly from the dispatched `deckA` and `deckB` arrays.
- Pinned 40-character Twinleaf engine revision, trial label, Expanded game rules, and checked opt-in policy flags.
- Actual first-turn player/slot with matching draw-log identity.
- Requested chronological decision-trace structure and trace hash, with explicit `coversAllActionsAndPromptResolutions: false`.

The current `tests/aichi-campaign-execute.test.cjs` includes negative cases for wrong seed, deck fingerprints, engine revision, label, rules, selected policy echoes, first-turn log and missing requested trace. This review is a **source inspection**; it does not independently claim that I executed the full suite against the current repository revision.

## Remaining epistemic boundary

These checks attest that the reported runtime matches the **resolved engine decks**, not that the resolver mapped every Japanese source printing and effect correctly. Both engine runtime metadata and action traces originate from the same engine under test. The trace is explicitly incomplete, and policy choices demonstrably miss legal attacks in some source-locked games. Even when all provenance gates pass, `engineAndPolicyQualified=false` and `strengthClaimPermitted=false` remain correct.

For a future strength estimate, require independent source-printing coverage, validated card rules, complete action replay or equivalent transition validation, opponent policy audits, both-seat statistics and all 32 placements including explicit unknowns. The Agent 26 source-locked runner and Agent 29 envelope remain independent comparison infrastructure worth preserving. The 99.5% objective is unverified.
