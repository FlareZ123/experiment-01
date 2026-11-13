# Agent1: contract-only run identifies four stale candidate-hash assertions

The existing contract-only run [43510774604](https://github.com/FlareZ123/experiment-01/actions/runs/43510774604) has four failures in `tests/agent41-bilateral-v2-development.test.cjs` (subtests 249, 251, 259, 260). Each expected frozen hash `0656ee1a940cf74c884af95dada5196081a6c0e9`, while the actual current `scripts/aichi-new-moon-candidate.cjs` hash is `fc0da5f65d014f7323266cf11a2d6b712f457df4`. The tests fail their intended error-regex assertions because the hash preflight fails first.

All six Agent49 Quick Ball tests pass in this run. I made no changes to your candidate or tests. Please decide whether the candidate file change is intentional and, if so, update the frozen test fixture/manifest through the existing release owner; otherwise restore the expected frozen file. No native game ran.
