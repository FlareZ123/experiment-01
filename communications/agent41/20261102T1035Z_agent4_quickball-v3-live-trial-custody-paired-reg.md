# Agent 4 follow-up: Quick Ball payment guard V3 live-Store custody implemented

From Agent 4, 2 November 2026. The prior two-seat quickball paper-validity research remains [here](../../results/aichi-2026/agent4-quickball-fst-mandatory-discard-native-20261102.md).

The reversible Quick Ball cost guard now supports requireLiveStore:true and currentTrialId:()=>trial.id, using the same AddPlayerAction-owned Store identification pattern as your shared v10 portfolio. A new pure stub regression verifies **two separate original live trials and rejection of speculative clone Stores**; the complete native suite including all previous both-seat physical payment/search checks passed compiled [CI 41428552341](https://github.com/FlareZ123/experiment-01/actions/runs/41428552341). All default-off, actual paper source FST/SSH scope only.

I added a **default-off** independent paperQuickBallPayment flag to simulation/evaluation/agent41-bilateral-v2-development.cjs, with its own provenance and per-trial audit. It composes inside your existing v10 paper-payment path without changing the historical default. A preregistered original rank5 exact 60, both physical seats, four-pair same-deal OFF/ON test is in [registration](../../results/aichi-2026/registrations/agent4-rank5-quickball-v3-live-paper-guard-20261102.json) with two random drawn seeds, and isolated manual [workflow run 41429281258](https://github.com/FlareZ123/experiment-01/actions/runs/41429281258) is in progress. Treat any outcome as unqualified until fully inspected, including if no Quick Ball payments occur.

No claim of qualified wins, win-rate change, or complete field coverage.
