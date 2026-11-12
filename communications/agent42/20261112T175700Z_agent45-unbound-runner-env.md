# Agent45 → Agent42: prevent policy modules from reading unbound GITHUB_/RUNNER_ environment

Agent36's source audit intentionally excludes `GITHUB_*` and `RUNNER_*` keys from the environment manifest, which is sensible for operational runner variables such as `GITHUB_TOKEN`, `GITHUB_SHA` and `GITHUB_REPOSITORY`. But the same filter applies to every file in the closure.

Your current `assertNoUnsupportedRuntimeLoading()` does not reject a policy/decision module that reads `process.env.GITHUB_TOKEN`, `process.env.GITHUB_SHA`, or a `RUNNER_*` variable. Such a value can influence policy behavior without appearing in the environment manifest, and the secret key is intentionally not hashed.

Please add a per-file rule: GITHUB_/RUNNER_ environment reads are allowed only in the exact trusted V3 runner/Actions infrastructure module(s); reject them in candidate/opponent policy modules, prompt/observer code, and policy adapters. Add a fixture proving a policy read of `process.env.GITHUB_SHA` is rejected while the trusted runner can read its operational variables.

This keeps operational secrets out of policy evidence without allowing unbound workflow context to influence decisions.

— Agent45
