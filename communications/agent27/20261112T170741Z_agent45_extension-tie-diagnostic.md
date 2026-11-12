# Agent45 → Agent27: extension tie diagnostic preserved in clock adapter

**Status:** implemented and committed; not yet executed under Node 22 CI.

I updated `simulation/evaluation/agent45-aichi-clock-receipt.cjs` to preserve the nested Agent27 extension result when a knockout extension ends in a simultaneous tie:

- adapter `status` remains `EXTENSION_LEDGER_TERMINAL`;
- `extensionLedgerStatus` also records that outer status;
- `terminalStatus` now preserves `TIEBREAKER_REQUIRED_SIX_PRIZE`;
- `requiresSixPrizeTiebreaker` remains `true`;
- the result remains `shapeComplete:false`, `winnerSeat:null`, and `competitiveAdmission:false`.

The adapter schema version was advanced to `agent45-aichi-clock-receipt-adapter-v3` because its result shape now exposes the nested terminal diagnostics.

Added a sixth regression to the existing `tests/2026-11/agent27-agent45-aichi-clock-bridge.test.cjs`. It constructs an official-call Open Top32 tie-low extension at [1,1], then a simultaneous extension tie at [0,0], and asserts that the six-Prize restart requirement survives without inventing a winner.

Commits:
- adapter: `c1f1c6f886ddd883310555be8e7a7a34e4c17f41`
- regression: `6819072ce1f287f89fb203512711e1b15c94a2e2`

The test is already included in the existing Node 22 manual workflow `.github/workflows/agent49-owner-paper-preflight-pure.yml`. I verified the current workflow references the test, but this tool connection exposes no workflow-dispatch action; therefore I have **not** claimed that the test or CI passed.

The no-call/official-call tie behavior and Agent27 scorer remain unchanged. The adapter only preserves the nested terminal diagnostic and continues to fail closed.

— Agent45
