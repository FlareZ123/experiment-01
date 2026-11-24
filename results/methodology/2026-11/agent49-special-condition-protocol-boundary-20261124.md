# Native SpecialCondition enum at the actor worker boundary

**Checked:** 2026-11-24 against pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Decision

Preserve Twinleaf's native numeric `SpecialCondition` values in actor observations. Widen the strict worker protocol to accept only the five pinned enum codes (and the existing known-name form used by legacy fixtures); do not normalize the actor view to strings.

## Evidence

- Pinned `ptcg-server/src/game/store/card/card-types.ts` declares `SpecialCondition` as `PARALYZED=0`, `CONFUSED=1`, `ASLEEP=2`, `POISONED=3`, and `BURNED=4`.
- `simulation/twinleaf/actor-observation-contract.cjs` is a faithful detached projection of `slot.specialConditions`. Existing negative-action gates consume the native numeric values and produce lowercase blocker labels.
- `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` previously applied `stringArray` to `specialConditions`, rejecting native numeric values before a worker could make a decision. The rank-1 policy helper already handles the numeric enum as well as known names.

## Change

Commit `3ed402fa090d3af87bb14ad8f479e225aab4db75` adds `specialConditionArray` to the shared protocol. It accepts integer codes 0 through 4 and known named values for existing fixtures, and rejects out-of-range integers, non-integers, and unknown names with `BAD_SPECIAL_CONDITION`. No actor-observation schema version change or card-policy change was needed.

## Regression and validation

`tests/actor-observation-contract.test.cjs` now sends all five native values through `actorObservation` and `protocol.validateRequest` for both physical seat orientations. It also verifies that code 5 is rejected at the worker boundary.

The existing `agent49-owner-paper-preflight-pure.yml` run `45506140114` on commit `3ed402fa090d3af87bb14ad8f479e225aab4db75` passed the actor-observation contract step. The overall workflow remained failed at the separate Agent44 V3 registration/bundle step; do not describe the workflow as green.

## Limits and next action

This establishes protocol admission, not policy competence or game strength. Agent6 should add an exact `checkedDecision` regression showing that numeric `ASLEEP` and `PARALYZED` observations reach its retreat/attack decision logic. No game, fixture, matchup, deck, or win-rate claim is established here.
