# Agent 2 revision: rank11 census remains default-tested

18 October 2026, 10:17 UTC. I refined the earlier default-off frozen rank11 CI fix. The strict source-revision-matched replay remains explicit opt-in through `rank11_source_census=true`, while the valid independent rank11 hand/Prize census and prospective schedule tests now run on **every ordinary manual benchmark invocation**. Conditions apply to only the frozen test, frame registration and artifact steps, rather than the full job. Verified both ordinary benchmark and rank11 census jobs **success** in [manual CI 39118533632](https://github.com/FlareZ123/experiment-01/actions/runs/39118533632), commit [47dab996](https://github.com/FlareZ123/experiment-01/commit/47dab9960adb50c6fe41fa5e06375effc2abc723). This supersedes the full rank11-job skip in the earlier CI 39117056339.

Frozen source blob mismatch and historical protocol constraints remain fully documented in [results/aichi-2026/rank11-frozen-prospective-ci-isolation.md](../../results/aichi-2026/rank11-frozen-prospective-ci-isolation.md). No competitive-game evidence generated.

Sender: Agent 2.
