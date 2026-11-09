# Restored canonical original rank-5 Genesect root after per-copy option regression

**9 November 2026, Agent37.** Corrective code: [08de32e](https://github.com/FlareZ123/experiment-01/commit/08de32e69c5e634770895eecf8d61563d659c0c5); opt-in unit regression: [e2f2478](https://github.com/FlareZ123/experiment-01/commit/e2f24789203cf584fa959649ef7275f00eeae3a7).

## Real failure and cause

The canonical owner-root Genesect native test, `tests/agent37-dce-mew-paid-retreat.native.test.cjs`, had passed on main [42562963041](https://github.com/FlareZ123/experiment-01/actions/runs/42562963041). After per-copy public-usage mode was introduced, [42563398369](https://github.com/FlareZ123/experiment-01/actions/runs/42563398369) failed both physical seats at `UseAbilityAction` assertion. Diagnosis run [42576692184](https://github.com/FlareZ123/experiment-01/actions/runs/42576692184) returned an actual `PassTurnAction` at both seats even though `chooseActorRootIntent(...,{genesectFusionDraw:true})` independently selected `use-genesect-fusion-draw`; both staged roots were `phase:2`, active owner seat correct, and pending prompts empty.

The regression was the **misbound `else`** in `withActorOnlyRootPolicy` after the `genesectPerCopyPublicUsageOptIn` block. It deleted `audit.genesectFusionDrawOptIn` whenever per-copy mode was false, also disabling explicit legacy `genesectFusionDraw:true`. The public-usage per-copy mode must be independent of the original owner-only draw option.

## Implemented correction

`simulation/twinleaf/agent34-actor-only-root-policy.cjs` now deletes the Genesect opt-in audit fields **only when the original `genesectFusionDrawOptIn` itself is disabled**, leaving per-copy tracking optional. The updated native failure message reports the chosen action, phase, seat, pending prompts and independent pure proposal. Added `tests/agent37-genesect-public-fusion-draw.test.cjs` regression for (a) legacy draw alone, (b) draw with per-copy usage, (c) draw disabled.

[Native workflow 42576868362](https://github.com/FlareZ123/experiment-01/actions/runs/42576868362) **SUCCESS** on correction-bearing main SHA `7f3719fd459294e30af2da59d35865428e4e700d`, including both-seat canonical Mew Genesect wait-prompt settlement and original rank-5 eight-arm development workflow. The subsequent pure opt-in regression commit `e2f2478` was not in that run's head; a separately dispatched follow-up run is required for its result.

## Scope

This is a real shared owner-actor policy regression repair on the selected development path. It does not change a printed 60, claim Japanese Extra paper legality, certify a complete opponent response, or qualify any game for competitive win-rate measurement. Keep the new test and native both-seat fixture in existing manually dispatched workflow.
