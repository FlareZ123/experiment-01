# Natural64 field-ledger v3: structural admission contract

**Status:** implementation and review branch only. No Aichi Top 32 run, deck qualification, or competitive win-rate result is established.

## Scope

This contract is the research-side admission layer for a preregistered 60-card Expanded candidate tested against the complete 32-deck Aichi Open League 2026 field. It is deliberately not a playing policy, a game-rules authority, or evidence that Twinleaf is paper-complete.

The validator accepts only manifest schema `aichi-natural64-field-registration-v3` and terminal receipt schema `aichi-terminal-adjudication-receipt-v3`.

## Registered design

- Exactly 1,280 stable slots, ordered by `sequenceIndex`, grouped into 20 rounds of 64 cells.
- Every round contains each of the 32 opponent ranks once at each candidate physical seat.
- Exactly 20 scheduled games per rank × candidate-seat stratum.
- The only admitted decision schedule is the preregistered two-look rule: an all-win early pass at 1,216 played games, otherwise continue to 1,280; stop immediately at the third nonwin.
- Candidate wins, candidate losses, genuine ties, and no-winner terminals are separate statuses. **No-winner is always a nonwin**; there is no configurable no-winner disposition.
- Pre-game failures are not played games. A failed slot may retry only within its preregistered budget (0–2 retries), with a unique attempt ID and an explicit link to the immediately preceding failed attempt. The slot itself and its sequence position do not change. Skipping a retry, retrying a played terminal, or exhausting the budget invalidates the ledger.
- The abort criteria are committed by `preGameFailureCriteriaSha256`; each pre-game failure must echo that digest and supply a failure-evidence digest.

## Evidence binding

Every played attempt requires three separate evidence collections:

1. `setupCoinChoiceEvidence`: an attempt/trial/slot-bound wrapper around the complete Agent16 native accepted-setup receipt, including its canonical receipt digest. The validator checks the exact receipt version, accepted coin and choice prompts, event order, coin winner, choice owner, selected first seat, verified first draw, and the attempt's corresponding fields. A host override is rejected.
2. `runnerTerminalEvidence`: a separate runner record binding the attempt and slot to the engine terminal digest, terminal-event digest, pinned engine, runner revision, and capture time.
3. `adjudicationEvidence`: a separate adjudicator record binding the attempt and slot to the registered adjudication protocol, clock mode, adjudicator identity, terminal class, reason, result, timestamp, and attestation digest.

The terminal receipt binds all three evidence digests, the fixed deck/policy/engine/opponent identities, the physical deal, RNG-material commitment, setup winner/chooser/first-seat fields, adjudicated result, and ledger status. Receipt, terminal-event, and evidence replay within the ledger is rejected.

The campaign runner now has an opt-in `captureSetupCoinChoiceReceipt` option (CLI: `CAMPAIGN_CAPTURE_SETUP_COIN_CHOICE=true`). It preserves the native setup receipt and emits the attempt-bound wrapper. The underlying Agent16 capture remains read-only and does not expose cards to the policy.

## RNG admission

The validator checks the registered independent-stream protocol and each attempt's material commitment. Reuse of an exact `rngMaterialCommitment` across played attempts is a structural rejection, not a warning or a threshold-only caveat. Human-readable seed labels are not treated as evidence of RNG independence.

The validator still explicitly reports that pre-game RNG custody, external RNG independence, and paper-shuffle fairness are **not proven**.

## What this does not establish

- Content-addressed digests do not authenticate a producer or constitute a verified digital signature.
- Runner and adjudicator records are structurally bound, not independently authenticated.
- The Agent16 setup receipt proves only its limited accepted native setup/first-draw observation; it does not certify full-game policy competence, official paper coin/choice rules, or competitive qualification.
- A valid ledger does not prove that Twinleaf implements every relevant paper Expanded card or rule.
- No candidate deck has been shown to reach 99.5%, and no matchup result against any of the 32 opponents is established by this work.

## Tests and current validation state

The branch adds:
- `tests/2026-11/shared/terminal-adjudication-receipt.test.cjs`
- `tests/agent49-natural64-field-ledger-validator.test.cjs`
- two opt-in capture tests in `tests/aichi-campaign-runner.test.cjs`

A local Node harness passed 23 targeted cases against a local copy of the receipt helper and a mirror of the exported slot/stopping/RNG primitives. This was **not** an end-to-end run of the repository's full validator or campaign-runner test suite. The new runner tests have not yet been executed in a repository checkout. Do not report the full suite as passing.

Recommended repository test command after checkout:

```sh
node --test tests/2026-11/shared/terminal-adjudication-receipt.test.cjs \
  tests/agent49-natural64-field-ledger-validator.test.cjs \
  tests/aichi-campaign-runner.test.cjs
```

## Next work

1. Have Agent31 adversarially review setup receipt mapping, independent evidence boundaries, no-winner classification, and RNG replay rejection.
2. Execute the repository tests against the actual branch source, then add one valid end-to-end manifest/attempt fixture and negative mutations.
3. Build a natural64 request/adapter that emits the v3 manifest and all three evidence arrays without losing the fixed slot/attempt identity.
4. Keep all 32 matchup outcomes, simulator limitations, and the distinction between structural admission and competitive performance visible.
