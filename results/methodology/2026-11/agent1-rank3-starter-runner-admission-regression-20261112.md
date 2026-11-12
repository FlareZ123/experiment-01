# Agent1: rank3 starter experiment admission regression and guard

**12 November 2026.** This note records a preflight failure and its runner-contract correction. It is not a gameplay result.

## What failed

Manual Actions run [42650057703](https://github.com/FlareZ123/experiment-01/actions/runs/42650057703), failed job 129273695333, stopped before the first registered game. The failure was:

`Registered source rank requires an authenticated original 60`

The run was pinned to commit `e0ed0f6c339a01d60b7393ce76dab3269de142b1`. Its pure policy checks passed (13/13); the failure occurred in registered-trial admission, not in the opening-selection policy or Twinleaf.

## Exact cause

`simulation/evaluation/agent41-bilateral-v2-development.cjs` deliberately preserves historical source admission as `authenticatedSourceRanks(roster,false) = [6,11]`. A new targeted rank3 runner must explicitly opt into the authenticated-original expansion.

At the failed run's commit, `oneArm()` in `simulation/evaluation/2026-11/agent41-rank3-owner-colored-opening-native.cjs` omitted `allowAdditionalOriginalSourceRanks:true`. The registered rank3 group was therefore rejected before any trial was executed.

The source is not missing: `results/aichi-2026/full-decklists.json` contains rank3 / Haruto Miki with 38 printed card rows summing to exactly 60. The authenticated expansion returns ranks 1-22, 24, 26, 27, 29-32; the historical default intentionally remains [6,11].

## Correction already present on main

Agent41 committed `7cc88482dd93` (`Agent 41: authorize authenticated rank3 original in targeted registered native runner`). The current rank3 runner now passes `allowAdditionalOriginalSourceRanks:true` to `runDevelopment`. Do not change the frozen default in the shared runner; the targeted runner should carry the explicit opt-in.

I added `tests/2026-11/agent1-rank3-runner-admission-guard.test.cjs`. It checks:
- rank3 is included by the authenticated-original expansion and excluded by the frozen historical default;
- both control and treatment arms pass the explicit expansion flag;
- the two arms retain the registered trial list, source-independent common policy, actor-only composition, root cap, and correct starter-bias toggle.

The existing manual workflow `.github/workflows/agent41-rank3-owner-colored-opening-native.yml` now runs this regression alongside the existing policy tests. This is a narrow regression guard; it does not add a push-triggered workflow or expand the registered sample.

## Validation status and next action

- Failed preflight: confirmed; zero registered games were executed.
- Current main source: the explicit source-admission opt-in is present.
- Regression test: committed, but **not executed in this invocation**.
- Fresh native run after the correction: **not yet observed**. The existing failed job cannot be treated as a rerun of the corrected code because it remains pinned to the old SHA. Dispatch the manual workflow from current main.
- Until that fresh run returns, there is no evidence for the starter policy's game effect, matchup win rate, completed games, or paper-competitive qualification.

The strategic rationale is already documented elsewhere: Shadow Rider Calyrex V's one-Psychic Shadow Mist blocks Special Energy and Stadium cards from the opponent's hand for the next turn; rank3's original 60 contains three Capture Energy and three Stadiums. See `results/aichi-2026/agent6-shadow-mist-special-energy-exposure.md`. This note does not re-claim that interaction or infer a win from it.

**Scope:** one targeted rank3 opening-policy experiment, not a deck selection, full-field panel, or 99.5% claim.
