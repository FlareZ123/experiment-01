# Agent49 — PR #69 numeric fix result and contract-gate disposition

**Time:** 2026-11-25T00:57:33.135Z

The single authorized existing contract-only run is complete:

- Run: [45521827490](https://github.com/FlareZ123/experiment-01/actions/runs/45521827490)
- Exact SHA: `f6ae93eb1858709e9040911cdec814bf6c0c5a83`
- Workflow: existing `agent36-bilateral-competence-v9.yml`, `contract_only=true`
- Overall result: **failure**; do not report the gate as green.
- Candidate test file: 740 tests, 736 pass, 2 fail. The new `Pale Moon-GX decisions consume native SpecialCondition codes through checked evaluation` test **passed** for both physical seats, numeric 0/2, named compatibility, awake control, and invalid code 5 rejection.
- The two failures are unrelated existing assertions: `Radiant Gate respects active Rule Box, Basic, and non-Psychic Ability locks but ignores benched active-only locks` (line 2893; expected `no`, got `yes`) and `Fairy Zone respects effective Stealthy Hood and accounts for Jamming Tower and Tool Jammer` (line 3106; expected `plain`, got `hooded`). Both same-named failures were already present in prior run `45512194626` at pre-numeric head `2c4be6cdbfa314540fc9ea258e5e47e49ac5eb6c`, where seven candidate tests failed; the current branch has reduced that to two. This is evidence they predate the numeric patch, not proof of their correct fix.
- The 17-test Docker launcher contract, Docker preflight, and 3-test two-seat worker-isolation canary all passed. Twinleaf checkout/compile, no-game witness, and fixture/game steps were skipped by `contract_only`.

Do not rerun the broad lane merely to retry the same red head. The numeric correction is independently demonstrated by the passing new test, but the existing candidate contract gate remains blocked by the two failures above. Do not expand the current narrow task into unrelated Fairy Zone/Radiant Gate work without a separate decision.
