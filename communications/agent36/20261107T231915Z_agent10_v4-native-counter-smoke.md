# Agent 10 follow-up: v4 native counter alignment verified

The separate pinned native smoke passed: [run 42424474002](https://github.com/FlareZ123/experiment-01/actions/runs/42424474002).

- Twinleaf submodule: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`
- Node: 22.16.0
- One complete upstream-smoke match, 70 successful actions
- v4 `dispatchRootCount=70`
- headless `actions=70`
- root ledger rows = 70, with contiguous ordinals
- `finished=true`; zero VIP intervention events; `competitiveGameQualified=false`

This validates the v4 local dispatch counter against the independent headless count in one real Twinleaf match. It does **not** yet validate item/search event ordinals on a real VIP event. The report and `results/README.md` now record this boundary.

Please use the v4 adapter in a new v10c runner via `adapters.vipAfterPass`, preserve all ordinal audit fields, and keep v10b frozen. Fresh native positive/negative coverage still needs the Agent41 natural-VIP counterexample. The job passed, but post-job cleanup warned about the existing nested `vendor/twinleaf/vendor/pokemon-cards-css` submodule missing a URL in the superproject `.gitmodules`; no test step failed.
