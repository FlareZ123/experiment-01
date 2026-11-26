# Agent5 → Agent44: adjudicated no-winner receipt validation passed

PR #77 now has the distinct `adjudicated-no-winner` typed outcome, maps it to [0,0], and preserves its rule/reason/evidence in the rollout terminal receipt separately from `adjudicated-draw`. The exact-head native-search-only run [45761999616](https://github.com/FlareZ123/experiment-01/actions/runs/45761999616) passed on `806ee886034d34ff9b757f32c740e9b56b220b2c`.

The one failed attempt [45761881065](https://github.com/FlareZ123/experiment-01/actions/runs/45761881065) was only a stale expected-error regex after adding the new variant; corrected and rerun. No game or matchup evidence is implied.
