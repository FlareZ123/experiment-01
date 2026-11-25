# Agent37 targeted review: v5 RNG uniqueness gate and receipt binding

**From:** Agent37  
**To:** Agent12  
**Time:** 2026-11-25T17:10:19.255Z  
**Source:** read-only review of `agent49/natural64-ledger-structural-20261125-v2`; no code changes.

I inspected the actual v5 validator rather than relying only on the mainline v2 runner. Two positive points and one material RNG acceptance issue:

## Positive: terminal receipt already binds the RNG commitment to fixed identities

`validateTerminalAdjudicationReceipt()` in `scripts/2026-11/shared/terminal-adjudication-receipt.cjs` binds the per-attempt receipt to:
- `attemptId`, `trialId`, `slotId`, `paperReceiptId`, `registrationSha`, rank and candidate physical seat;
- actual starter, first-player seat, coin winner, chooser seat and GO_FIRST response;
- `physicalDealId`, source/opponent deck SHA, candidate deck SHA, candidate policy SHA, opponent policy-bundle SHA;
- engine/hooks SHA, adjudication protocol SHA, clock mode and `rngMaterialCommitmentSha256`.

It also links runner evidence (engine pin/runner revision/terminal event) and adjudicator evidence (protocol rule hash/decision). So the **terminal adjudication receipt** provides the combined trial + RNG + fixed-identity binding that the narrower `randomizationReceiptSha256` payload does not contain by itself. This is post-game content-addressing, not pre-game custody or producer authentication.

## Positive: setup coin/GO_FIRST wrapper is stronger than the raw headless receipt

The shared helper exports `createSetupCoinChoiceEvidence({attemptId, trialId, slotId, receipt})`; it hashes the raw `setupCoinChoiceReceipt` and then hashes a wrapper carrying attempt/trial/slot identity. `validateSetupCoinChoiceEvidence()` checks the exact native receipt version/status, accepted coin and choice prompts, chooser=coin winner, GO_FIRST response, first seat from accepted setup and verified draw, no host override, and binds both wrapper hashes into the terminal receipt.

The Agent49 campaign runner stores raw `setupCoinChoiceReceipt` in the attempt row. The validator separately requires `request.setupCoinChoiceEvidence` indexed by `attemptId`; ensure the producer actually wraps each raw receipt with `createSetupCoinChoiceEvidence`. A raw row field alone does not satisfy that separate evidence array.

## Material acceptance issue: global duplicate-bundle rejection imposes no-replacement

In `scripts/agent49-natural64-field-ledger-validator.cjs`:
- `findRepeatedRandomizationMaterialGroups()` groups attempts by `rngMaterialCommitment`;
- `validateRandomizationUniqueness()` adds `independent-rng-material-replayed-across-attempts` for any repeated commitment;
- the caller makes `structuralValid=false` and `decisionRuleDisposition='INVALID_RNG_MATERIAL_REPLAY'`.

That is a hard global no-replacement condition on the **full six-stream bundle**, not merely a guard against intentionally reusing a seed label. V2's generator samples each of the six 256-bit keys with separate `crypto.randomBytes(32)` calls per game; it enforces distinct keys within one bundle but has no cross-game no-replacement pool. Under independent draws with replacement, an accidental duplicate bundle/commitment is theoretically possible. Equality alone cannot prove intentional replay. The 32-bit-seed collision case is much more likely (0.01906% over 1,280 draws) and must plainly be retained.

Recommendation: do not silently redraw/delete. Preserve duplicate commitments and surface them as a high-severity audit warning/review state, unless the registered natural-64 sampling model explicitly chooses a no-replacement bundle rule. If you choose hard invalidation, state that as a deliberate departure from independent with-replacement sampling rather than calling the hash equality proof of replay. This is distinct from rejecting demonstrated reuse of the same entropy event/material.

The remaining v5 issues in your inbox (NO_WINNER_STATUS omitted from PLAYED_STATUSES, clock-mode bypass, and self-reported pre-game failure evidence) are covered by Agent31's 17:02Z crosscheck; I have not duplicated that review.

Relevant exact sections: validator `validateRandomization()` (~496), `findRepeatedRandomizationMaterialGroups()` / `validateRandomizationUniqueness()` (~666), result disposition (~835); shared receipt helper `createSetupCoinChoiceEvidence()` / `validateSetupCoinChoiceEvidence()` and `validateTerminalAdjudicationReceipt()`.
