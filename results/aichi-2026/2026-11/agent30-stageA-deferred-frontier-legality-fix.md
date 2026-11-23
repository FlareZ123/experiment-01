# Stage-A native action-frontier legality defects and source-scoped repairs (2026-11-23)

**Scope.** Frozen two-seat Agent36 V3 fixture, candidate = Hood Shield Shadow Rider, opponent = authenticated Aichi rank-1 Shadow Rider list. Engine pinned to Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; all runs remain fixture-only (engine Expanded vs source Japanese Extra format unverified), not competitively qualified win-rate evidence. No deck, policy identity, seed registration, seat assignment, or vendor-engine code was altered in these repairs.

## Mechanism

The pinned Twinleaf `ActionEnumerator` proposes a **superset** of playable actions. The research-side `buildNativeActionFrontier` attempts every candidate on a cloned `Simulator`, then removes only codebook-recognized native `GameError` rejections. This strategy can fail in two distinct ways:

1. **Immediate native rejection not in action-family codebook.** Passive Dimension Valley is still enumerated for `USE_STADIUM_ACTION`; `UseStadiumEffect` raises `CANNOT_USE_STADIUM`. The adapter previously threw instead of dropping that candidate and the entire root frontier aborted. Resolved by adding only `CANNOT_USE_STADIUM` to `USE_STADIUM_ACTION` expected native GameError values, with a regression requiring another legal root to remain available.
2. **Deferred rejection after cloned dispatch.** Pinned `Shadow Rider Calyrex VMAX CRE` may be enumerated to use `Underworld Door` even without a Bench Pokémon or Basic Psychic Energy in hand. The native reducer raises `CANNOT_USE_POWER` only when a queued game-effect continuation executes at a later `WaitPrompt`; cloned root dispatch alone did not reject the action. Added an exact-source, actor-owned, clone-local preflight for those two conditions, retaining native validation for every nonmatching action/source. Regression tests no Bench, no Basic Psychic Energy, ready resources, unrelated source, and unchanged live Store.

A third related class is conditionally playable Items. `Unfair Stamp TWM 165`, `Field Blower GRI 125`, `Night Stretcher SFA 61` have pinned native `canPlay` guards that `ActionEnumerator` does not always apply; playing an unusable card can throw `CANNOT_PLAY_THIS_CARD`, which intentionally remains fatal for generic Items. The adapter now consults `canPlay` *only* for these exact source printings (alongside pre-existing Battle VIP Pass and VS Seeker), removing explicit false and deferring true/undefined to native clone validation. Generic Items and arbitrary JS exceptions remain fail-closed.

## Physical evidence and gate record

| Stage-A run | Candidate seat 0 | Candidate seat 1 |
|---|---|---|
| [45257814477](https://github.com/FlareZ123/experiment-01/actions/runs/45257814477) | Native root failed after Dimension Valley, 23 actions / turn5, 18-char error | Root failed at turn2, 11 actions, 21-char error |
| [45263456205](https://github.com/FlareZ123/experiment-01/actions/runs/45263456205) | Turn15 / 63 actions, then opponent abstained on Underworld Door `AttachEnergyPrompt` | Same 21-char root error at turn2 |
| [45266383646](https://github.com/FlareZ123/experiment-01/actions/runs/45266383646) | Turn15 / 63 actions; now Underworld prompt policy-audit assertion, 85-char `ERR_ASSERTION` | Passed turn2; reached turn4 / 21 actions, then a deferred `WaitPrompt` failure with 16-char error following Underworld Door on Bench-empty actor |

The source-specific `CANNOT_USE_POWER` explanation of the last 16-char failure is supported by native card source and the public Bench-empty snapshot; the printed error length alone does not prove exact error identity. Likewise the turn2 21-char fix cannot be assigned uniquely to one of the scoped Items from sanitized evidence; the disappearance of the failure demonstrates an effective *combined* repair, not which specific Item was held.

As of this report, accepted branch `agent49/integrated-main-acceptance-33747ed-20261121` has patch `ce45d2c2` and test `d54ba785`; exact-head contract-only run [45268245068](https://github.com/FlareZ123/experiment-01/actions/runs/45268245068) passed. Main contains matching patch `6faa4a50`, test `d1203999`, contract [45267631915](https://github.com/FlareZ123/experiment-01/actions/runs/45267631915) passed. A native no-game witness and fresh registered fixture remain necessary after any future accepted-branch SHA change.

## Unresolved

- On the opponent's `AttachEnergyPrompt` at turn15, new decision did not abstain but failed with 85-char assertion in `prompt-resolver-decode`. Exact matching assertion in `agent36-v3-runner.cjs` is `registered candidate/opponent policy must return a validated per-decision policyAudit`, after `session.decide` and before the cloned prompt dispatcher. The policy source's `decideWithAudit` is intended to return a nonnull audit for all decisions; a persistent Docker worker regression for both seats is being added by Agent49. Do not mask absent audits or substitute in-process decisions.
- No physical terminal winner and no competitive results have been established. After fixing prompt audit and deferred native power use, resume the **same registered two-seat fixture** under exact-head gates; only later evaluate rank1 tactical competence, then the rest of Top32.

**Relevant code/tests:** `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs`, `tests/2026-11/agent36-native-action-frontier.test.cjs`, `simulation/evaluation/2026-11/agent36-prompt-projection.cjs`, and `simulation/evaluation/2026-11/agent6-rank1-shadow-rider-opponent-policy.cjs`.
