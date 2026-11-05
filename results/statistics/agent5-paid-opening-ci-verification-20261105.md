# Agent 5: corrected CI verification of paid ADP source tests (5 November 2026)

**Scope:** CI provenance and reproducibility status for fixed-60 ADP–Thorton–Regidrago v2 analytical opening models. This is *not* a native Twinleaf game, source-vs-candidate policy trial, matchup rate, tournament strength, or final-deck nomination.

## Verified execution

The existing manually dispatched **Aichi benchmark statistical tests** workflow [run 42070601918](https://github.com/FlareZ123/experiment-01/actions/runs/42070601918) completed **successfully** at 2026-11-05T17:10:42Z on immutable development head `119ed6da5735210b5906ebdc8e44a5edeba01323`. The run used workflow_dispatch on `main`; `test-benchmark` job 127397150636 completed successfully at 17:10:41Z, and `rank11-source-census` job 127397150364 completed successfully. The other twelve listed optional native or census jobs were skipped according to the run's job list. This run validates only the configured workflow lanes, not unrun native games.

The immediately earlier [run 42068151247](https://github.com/FlareZ123/experiment-01/actions/runs/42068151247), pinned at `9ec999aca0220bb49a39bb13eaf3ec6289eaafbd`, **failed**. Its failed-job tail directly shows the historical Agent5 import error `Cannot find module './agent5-adp-paid-opening.cjs'` in `tests/agent5-adp-paid-opening.test.cjs`, followed by the separate historical moving-policy audit pin error. Agent10 repaired three relocated Agent5 test imports without changing the source model or assertions, and documented that repair in `communications/agent5/20261105T1703Z_agent10_fix_adp_module_imports_ci.md`. The successful later run supersedes the earlier failure **only for the corrected workflow revision**, not for either earlier immutable snapshot.

## Evidence interpretation

The linked [physical setup and payment enumeration](agent5-adp-setup-policy-paid-physical-20261105.md) remains an exact finite-source opening-event calculation conditional on a Basic-valid seven-card opening and going second. Its reported percentages measure paid first-eight *opportunity* with explicitly limited card effects and hypothetical DCI discard rules. The model omits live two-seat adversarial decisions, actual native prompt and Store settlement, Crobat V draw, opponent lock and the 25-minute paper match clock. Passing CI demonstrates source/tests run under the pinned workflow revision; it gives **no** competitive win-rate evidence.

Do not aggregate runs 42068151247 and 42070601918 as a single uninterrupted test condition, relabel an earlier failing snapshot as green, or spend new native budget merely to recreate this now-successful source regression. The shared decision index remains at **29/32 authenticated original opponent name/count inventories, zero qualified competitive games and no final fixed 60**.
