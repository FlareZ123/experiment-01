# Agent12 Natural64 outcome/adjudication admission correction

**Status:** bounded implementation branch only; not merged, not admitted, and not a campaign result.

## Corrected contract

- `paper-qualified-no-winner` is a completed played nonwin only when the adjudicator binds a Top32 dual-Defeat ruling for physical seats 0 and 1, exact `Defeat` penalties, and a non-empty judge reference. Ambiguous played terminals invalidate the batch; they are not no-winner outcomes.
- Candidate/opponent forfeit and concession retain their narrow explicit mappings. A single candidate-side Defeat maps to candidate loss; a single opponent-side Defeat maps to candidate win, but only with exact Top32 stage, physical seat, penalty, and judge-ruling evidence. A generic illegal-action observation is not a game loss. Player-specific timeouts are not Aichi Top32 paper outcomes.
- The shared helper rejects timeout classes and applies the same Defeat evidence rules as the Natural64 entrypoint. Adjudication must occur at or after runner-terminal evidence capture.
- Played attempts, terminal receipts, runner/adjudicator evidence, and setup evidence use closed key allowlists so unknown properties cannot carry hidden-zone payloads through the public validator. Pre-game attempts reject nested setup/terminal/RNG evidence and unbound policy-registration/attestation hashes.
- Invalid ledgers expose only raw attempt diagnostics. Qualified win/loss/tie/no-winner counts, rank summaries, observed rate, and stopping disposition are null/non-evaluable when any structural or receipt join fails.
- The `aichi-top32-event-clock` mode is explicitly non-admitting in this v1 because the validator does not bind the distinct natural-draw, official time-call/final-turn, Prize-count, extension, and tiebreaker evidence. This does **not** select a clock-free estimand; the owner must explicitly decide whether the benchmark target is clock-free or requires a later event-clock-complete validator. The clock-free mode remains an explicit manifest value, not an inferred default.

## Structural limits and evidence

This is a structural-admission validator only. Hashes do not authenticate the source producer, runner, adjudicator, physical paper record, external entropy, or fair shuffle. It does not establish paper legality, policy competence, matchup strength, or a 99.5% win rate. The 128-cell equal-start sensitivity panel remains separate and non-poolable.

## Test status

The authored suites are intended to run with:

    node --test tests/2026-11/shared/terminal-adjudication-receipt.test.cjs tests/2026-11/agent12-natural64-field-ledger-validator.test.cjs

They were **not executed in this environment**: the repository is not mounted in the local shell and outbound DNS to GitHub is unavailable. No Actions workflow was dispatched or changed. The branch remains unadmitted until the exact two suites run successfully in a repository checkout and Agent50/Agent47 confirm the final exact SHA.
