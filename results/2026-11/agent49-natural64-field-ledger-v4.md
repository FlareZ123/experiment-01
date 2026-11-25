# Natural64 field-ledger v4: protocol-bound terminal admission

**Status:** structural validator implementation on an isolated review branch. No complete campaign, Aichi matchup result, deck qualification, or competitive win-rate claim is established.

## What changed from v3

The v4 revision addresses three review findings:

1. **Exact runner/adjudicator terminal join.** Adjudicator evidence schema v2 must repeat the runner evidence digest, terminal-event digest, and engine-terminal digest. The validator compares all three against the separately supplied runner record. Resealing a changed adjudicator record does not let it adjudicate a different engine terminal.
2. **Owner-supplied, content-addressed adjudication semantics.** Manifest schema v4 contains the complete `adjudicationProtocol` object and its canonical `adjudicationProtocolSha256`. Every rule has a unique ID, reason, terminal class, allowed candidate results, and optional clock-mode constraint. Each adjudicator receipt names the selected rule ID and its canonical digest. The validator checks the rule binding; it does not invent universal concession, forfeit, timeout, or clock semantics.
3. **Public entrypoint composition test.** The test suite now includes a synthetic full 1,280-slot registration with all 32 source/policy ranks, one fully evidenced played attempt, and all three evidence arrays. It should return structurally valid but `INCOMPLETE`, because only one of the 1,280 slots has been played. Negative public-entrypoint cases remove adjudicator evidence and mutate the statistical status.

## Stable design and evidence requirements

The v3 slot/retry/stopping design remains:
- 1,280 stable slots, 20 rounds × 64 rank/seat cells.
- 20 scheduled games per rank × candidate-seat stratum.
- The only admitted decision schedule is two-look 1,216/1,280: all-win early pass at 1,216; otherwise continue to 1,280; stop immediately at the third nonwin.
- No-winner is always a distinct nonwin. There is no configurable disposition.
- Pre-game failures are not played games. They may retry only within the preregistered 0–2 retry budget, on the same slot, with a unique attempt ID and explicit link to the immediately preceding failed attempt. The abort-criteria digest is preregistered and echoed by every failure. Exhaustion invalidates the batch.
- Exact duplicate `rngMaterialCommitment` across played attempts is a structural rejection; seed labels are not RNG identity.

Each played attempt requires separate `setupCoinChoiceEvidence`, `runnerTerminalEvidence`, and `adjudicationEvidence`. The v4 terminal receipt binds their digests and the fixed experiment identity, physical deal, setup winner/chooser/first seat, RNG commitment, terminal event, protocol rule, adjudicated result, and status.

The campaign runner has opt-in native setup capture (`captureSetupCoinChoiceReceipt`; CLI `CAMPAIGN_CAPTURE_SETUP_COIN_CHOICE=true`). It emits the Agent16 setup receipt and an attempt/trial/slot-bound canonical wrapper.

## Evidence boundaries

- The full adjudication protocol is owner-supplied. A content-addressed rule can still be wrong; independent paper-rule review is required.
- Canonical hashes bind content but do not authenticate the runner, adjudicator, or source producer and are not digital signatures.
- The Agent16 setup receipt covers only its accepted native coin/choice/first-draw observation. It does not certify full-game policy competence, official paper coin/choice rules, or competitive qualification.
- The generic campaign runner currently emits setup-choice evidence only. Separate runner-terminal and adjudicator producers are still required to populate the other two evidence arrays from actual games.
- A valid structural ledger does not prove Twinleaf's complete Black & White-onward paper Expanded support.
- RNG pre-game custody, external RNG independence, and paper-shuffle fairness remain unproven.
- No 99.5% result or matchup performance is established.

## Tests and validation state

Added or extended:
- `tests/2026-11/shared/terminal-adjudication-receipt.test.cjs` — 13 helper tests, including exact runner/adjudicator terminal joining and protocol-rule binding.
- `tests/agent49-natural64-field-ledger-validator.test.cjs` — public entrypoint fixture plus retry, stopping, RNG, and failure-criteria tests.
- `tests/aichi-campaign-runner.test.cjs` — opt-in setup capture tests.

A local Node harness passed 25 targeted cases: 13 against a local copy of the v4 receipt helper and 12 against a mirror of the exported slot/stopping/RNG primitives. This is **not** a full test run of the repository source. The actual public-entrypoint fixture and campaign-runner tests have been added but not executed in a repository checkout.

Run in a repository checkout:

```sh
node --test tests/2026-11/shared/terminal-adjudication-receipt.test.cjs \
  tests/agent49-natural64-field-ledger-validator.test.cjs \
  tests/aichi-campaign-runner.test.cjs
```

## Next work

1. Agent31 and Agent12 adversarially review the v4 protocol rule and exact-terminal join.
2. Execute the actual branch tests in a checkout and fix any fixture or integration failures.
3. Implement or identify separate producers for runner-terminal and paper-adjudicator evidence; the public fixture alone is not producer integration.
4. Externally audit the owner-selected protocol rules and paper adjudication procedure.
5. Only then use the validator for a real preregistered 32-opponent campaign, preserving matchup-level outcomes and limitations.
