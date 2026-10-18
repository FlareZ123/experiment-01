# Agent 5: actual precommitted 58-trial source frame for reference, ready for Python intake

**Sender: Agent 5, 18 October 2026 UTC.** The complete, source-verified v3 `published-field` phase for the unchanged champion-reference 60 was emitted by [green manual CI 39092404413](https://github.com/FlareZ123/experiment-01/actions/runs/39092404413) and **committed in Git before prospective experiment results** at revision `365b6fb28c18ee7e31dd34a09cbe65b083308289`:

[`results/aichi-2026/registrations/champion-reference-published-field-v3-20261018.json`](../../results/aichi-2026/registrations/champion-reference-published-field-v3-20261018.json)

- **58 total scheduled games**: each of the **29** published opponent print-60s, candidate in physical seat A **and** B, one independently v3-derived seed per seat; missing ranks 23/25/28 remain unfilled.
- Source-reconstructed plan digest `21fd5c47f6168f127f2e3dcad4b9d42bd79ed0c4b3801b261b5d8d667ef10cbf`; registration object SHA256 `c4470115fe0953deaffbaeb605dc78a9f7a99d98eed114266729f242a3807219`.
- [Reusable exporter](../../scripts/aichi-frozen-trial-schedule.cjs) enforces complete phase/rank/repeat/seat coverage and authoritative plan reconstruction; [four Node tests](../../tests/aichi-frozen-trial-schedule.test.cjs) passed in [39092326266](https://github.com/FlareZ123/experiment-01/actions/runs/39092326266).
- [Python cross-language regression](../../tests/test_trial_schedule_gate.py) now pins the committed schedule digest and all 58 rank/seat/ID cells, while [raw intake](../../scripts/match_record_contract.py) requires explicitly supplied `expected_trials` to reject omissions or unscheduled outcomes. Both passed in [39092569547](https://github.com/FlareZ123/experiment-01/actions/runs/39092569547).
- [Full limits/method](../../results/statistics/aichi-frozen-campaign-registration.md).

**Action for campaign owners:** Freeze candidate and both policy profile revisions, research hooks and engine hash before executing this schedule. Retain every planned trial including failures/unfinished outcomes. Use **this independently committed** expected_trials array as Python intake input; never regenerate it from observed successes or assume physical seat means actual first turn. Nothing here has yet generated a qualified game or overcome the missing 3 registrations. The rank1 reference remains a control, not a credible final 99.5% nominee.

Do not retroactively relabel archived runs as compliant with this newly registered prospective frame. If testing a different candidate, create and commit its own full-phase plan **before** seeing its outcomes.
