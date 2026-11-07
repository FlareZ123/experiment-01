# Agent36 v10 single-candidate cohort: registration contract failure

**Date:** 2026-11-07  
**Status:** Rejected before native execution; no game evidence

## Intended experiment

The frozen registration `results/aichi-2026/registrations/agent36-issue25-common-v10-fresh-aba-260root-20261107.json` specified eight fresh New Moon-only contexts across Aichi source ranks 1, 3, 6 and 11, both original-source physical seats per rank, with A/B/A VIP-after-Pass phases and a 260-root development cap.

## What happened

GitHub Actions run `42377588735` (head `d157ebf13c0ae68d983a6a07ff396cd2b2b8a642`) completed with workflow conclusion `success`, but the runner returned **zero native rows in all three phases**. The artifact `agent36-common-v10-fresh-aba-42377588735` (ID `13575833266`) contains the diagnostic archive; its JSON sidecar SHA-256 is `298e9f8525cd9f417d1f2522f00b16ff41376616baee6008a82a7d2082aaa559`.

Each phase A, B and A2 reports:
- `thrownCode: ERR_ASSERTION`;
- `rawDecoderExecuted: false`;
- `nativeAttempts: 0`;
- `rawDevelopment: null`;
- validation expected the candidate IDs `champion-reference` and `new-moon-lockbreaker-v1`, while this registration supplied only `new-moon-lockbreaker-v1`.

The adapter's registered-trial contract requires paired candidate arms. The workflow's zero-row return was previously treated as a successful process exit. This is an execution-validation defect in the runner integration, not a game result and not evidence about either deck.

## Corrective design

Preserve this failed registration and artifact unchanged. The replacement registration is `results/aichi-2026/registrations/agent36-issue25-common-v10b-paired-fresh-aba-260root-20261107.json`: four source-rank/seat groups, each paired across both required candidate IDs, for eight contexts total. Source ranks 1 and 6 use candidateSlot A; ranks 3 and 11 use B, balancing the original-source seat across the cohort. Each candidate pair shares the same group seed.

The replacement runner `simulation/evaluation/agent36-issue25-common-v10b-paired-fresh-aba.cjs` now asserts that the adapter reports no `thrownCode`, every registered trial returns one native row, all A/B/A physical opening fingerprints match, and A2 exactly reproduces A. Any missing native rows or failed control reproducibility now fails the workflow. The corresponding tests are in `tests/agent36-issue25-common-v10b-paired-fresh-aba.test.cjs`.

## Interpretation

The v10 run contributes **zero** matchup observations, terminals, wins, losses, attack-settlement observations, or win-rate evidence. Do not include it in deck comparisons or aggregate statistics. The v10b cohort must pass its fail-closed checks before any game-level interpretation begins.
