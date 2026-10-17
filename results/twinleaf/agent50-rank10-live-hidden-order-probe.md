# Agent 50: authentic rank-10 decision, detached hidden-order contrast

**17 October 2026. Evidence status:** research hook and three pure controls committed. Pinned Store execution and source-result interpretation are pending the manual workflow. This is an exploratory information-access sensitivity test, not a qualified game result.

## Narrow question

Does the currently configured generic Twinleaf policy select a different action at one genuine, published 60-card source-dealt rank-10 Regidrago versus rank-1 Shadow Rider state if its own remaining deck's *unseen physical order* changes?

The existing compiled synthetic rank-10 60-card inventory fixture showed a hidden-order-dependent `PassTurnAction` versus `PlayCardAction` choice at a constructed turn-four board. That finding does not show exposure in an actual game. This source-dealt probe tests a stronger context but is still not an observation-equivalent-policy certification.

## Frozen source and procedure

- Reuse the exact rank-10 source deal from `results/aichi-2026/qualification-packets/rank-10/README.md`: rank-10 Regidrago opponent in engine seat A, rank-1 Shadow Rider champion in physical seat B (the actual first player), v3 seed `4246551499`, pilot repeat 0.
- Preserve every `runMatch` option and 60-card printing ID used by the existing real root-decision graph mutation audit; finish the game ordinarily once without probe and once with probe.
- Intercept only the first candidate root decision at global turn 27, seat B, without substituting any action. Construct two independent full-State clones via pinned `deepClone` without a Card ignore list, preceded by the existing vendor-shape preflight and followed by source-prototype normalization.
- Evaluate the standard policy on each detached world, keeping all public zones and owned hand equal and reversing only the acting player's remaining deck order in the counterfactual. Each world has a fresh bot and an identical independently seeded policy-random stream. The root source graph fingerprint before/after and the entire uninstrumented/instrumented `runMatch` summaries must match.
- Record only bot action identities, the unknown-zone card count, and digest, without dumping hidden identities into the report.

Files: [source probe](../../simulation/twinleaf/rank10-hidden-order-live-probe.cjs), [pure regressions](../../tests/rank10-hidden-order-live-probe.test.cjs), [existing manual CI](../../.github/workflows/twinleaf-hidden-information.yml).

## Limits

K1 deck-membership knowledge is not proven for the specific observed root and legitimately remembered top-of-deck information is not audited. Therefore, even if choices differ, the result is first an **actual source-State deck-order sensitivity** demonstration requiring an independent observation equivalence check before calling it an unfair clairvoyance violation. Conversely, equal choices in two orders cannot establish information-set safety across all possible orders, actions or policy randomness.

The source state's clone preflight may correctly fail closed. A failed assertion should be recorded and attributed, rather than bypassed. This experiment cannot establish strong decision policy, source card correctness, opponent competence, matchup strength or the proposed 99.5% target.
