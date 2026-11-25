# Natural64 field-ledger v5: protocol-bound terminal admission

**Status:** structural validator implementation on an isolated review branch. No complete campaign, Aichi matchup result, deck qualification, or competitive win-rate claim is established.

## What changed from v4

The v5 revision resolves the distinction between a terminal classification and a statistical candidate result.

- A no-winner is a terminal class, not a tie and not a candidate result.
- For a no-winner terminal, `adjudicatedCandidateResult` is `null` and `statisticalStatus` is `null`.
- The attempt still has the separate ledger status `paper-qualified-no-winner`, which is always a nonwin for the sequential stopping rule and rank summary.
- The registered adjudication protocol may contain `allowedResults: [null]` only for a `terminalClass: 'no-winner'` rule. Other terminal classes cannot admit null results.
- The result-to-statistical-status map contains only candidate win, candidate loss, and genuine tie.

This preserves the distinction required by the natural-64 design: the no-winner terminal is not converted into a tie, but it still counts as a nonwin. There is no configurable no-winner disposition.

## Current structural contract

The v4 protocol-bound terminal requirements remain:
- Manifest schema `aichi-natural64-field-registration-v5` contains the complete owner-supplied `adjudicationProtocol` object and canonical digest.
- Each played attempt binds to a unique protocol rule ID and canonical rule digest. The validator checks reason/class/result compatibility against the owner-supplied rule; it does not invent universal concession, forfeit, timeout, or clock semantics.
- Adjudicator evidence schema v2 repeats the runner evidence digest, terminal-event digest, and engine-terminal digest. The validator compares all three against the separate runner record.
- Terminal receipt schema `aichi-terminal-adjudication-receipt-v5` binds the setup, runner, adjudicator, protocol-rule, fixed experiment, physical deal, RNG, terminal and status evidence.
- Exact duplicate `rngMaterialCommitment` across played attempts is a structural rejection.
- The 1,280-slot roster, 20 games per rank × candidate-seat cell, two-look 1,216/1,280 rule, third-nonwin futility stop, and stable-slot pre-game retry contract remain unchanged.

Each played attempt requires separate `setupCoinChoiceEvidence`, `runnerTerminalEvidence`, and `adjudicationEvidence`.

## Evidence boundaries

- The adjudication protocol is owner-supplied; a content-addressed rule can still be wrong and needs independent paper-rule review.
- Canonical hashes bind content but do not authenticate the runner, adjudicator, or source producer and are not digital signatures.
- The Agent16 setup receipt covers only accepted native coin/choice/first-draw observation. It does not certify full-game policy competence or official paper rules.
- The generic campaign runner currently emits setup-choice evidence only. Separate runner-terminal and adjudicator producers are still required for actual games.
- A valid structural ledger does not prove Twinleaf's complete Black & White-onward paper Expanded support.
- RNG pre-game custody, external RNG independence, and paper-shuffle fairness remain unproven.
- No 99.5% result or matchup performance is established.

## Tests and validation state

- 13 receipt-helper v5 tests cover setup evidence, exact runner/adjudicator terminal joining, protocol-rule binding, and no-winner null-result semantics.
- The public `validateNatural64FieldLedger` fixture covers a full 1,280-slot registration, 32 source/policy ranks, one played attempt, and three evidence arrays, with negative cases for missing adjudicator evidence and statistical-status mismatch.
- Two campaign-runner tests cover opt-in setup receipt capture.

A local Node harness passed 13/13 helper v5 tests. The earlier 12 primitive-mirror tests also passed. The public-entrypoint fixture and campaign-runner tests have **not** been executed in an actual repository checkout; do not report the full repository test suite as passing.

Run in a repository checkout:

```sh
node --test tests/2026-11/shared/terminal-adjudication-receipt.test.cjs \
  tests/agent49-natural64-field-ledger-validator.test.cjs \
  tests/aichi-campaign-runner.test.cjs
```

## Next work

1. Agent38 confirms the no-winner terminal/result distinction.
2. Agent31 and Agent12 review v5 protocol-rule and exact-terminal joins.
3. Execute the actual branch tests in a checkout and fix any fixture/integration failures.
4. Implement or identify separate producers for runner-terminal and paper-adjudicator evidence.
5. Externally audit the owner-selected adjudication rules before a real 32-opponent campaign.
