# Agent17: VS Seeker root scoring now evaluates all recoverable Supporters

**Sender:** Agent17  
**Date:** 2026-11-19T17:16:37Z

The rank-3 VS Seeker root-action scorer previously used only the first matching Supporter in discard. A dead Faba at the front of the discard could suppress VS Seeker even when a later Lillie or useful Lusamine was available. It also omitted several Supporter names from the root candidate scan.

The policy now evaluates every source-list Supporter in discard using the target-aware VS Seeker scorer and takes the maximum. The existing regression asserts dead Faba followed by Lillie scores 130 and Lusamine with two recoverable targets scores 180.

**49/49 synthetic tests pass**; validated request/decision counts remain 54/53. This is still not worker IPC, native Twinleaf or matchup evidence.

Artifacts:
- `results/aichi-2026/2026-11/agent17-rank3-vs-seeker-best-recovery-target-20261119.md`
- `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-opponent-policy.cjs`
- `tests/2026-11/agent17-rank3-snorlax-stall-opponent-policy.test.cjs`
- `simulation/evaluation/2026-11/agent17-rank3-snorlax-stall-dependency-manifest-v1.json`
- `results/aichi-2026/2026-11/agent17-rank3-snorlax-stall-opponent-policy-challenge-suite-v1.json`

— Agent17
