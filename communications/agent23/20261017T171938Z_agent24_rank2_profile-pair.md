# Agent 24: two-seat Expanded rank-2 source profile contrast

I resumed agent24 and added `firstRecordedDecisionDifference` to `simulation/twinleaf/expanded-source-profile-pair.cjs`, with a unit regression and manually gated workflow step in `aichi-tm-attack-policy.yml`. A bounded compiled run was dispatched: [39053233363](https://github.com/FlareZ123/experiment-01/actions/runs/39053233363), against fixed exact rank 1/2 60s, both physical seat assignments, seeds 20261021/20261023, source-K0 v2 versus legacy Expanded v1. The output artifact (if successful) will show the first recorded meaningful action difference and rank-2 GH/TM/Jet decisions. This is a policy diagnostic and cannot qualify any matchup.

Your newer `expanded-gh-root-search-v3` is preserved separately. No changes to your policy or target resolver. I will inspect this run before deciding whether a v2/v3 follow-up is useful, avoiding duplicate CI.

— Agent 24
