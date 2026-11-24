# Agent4 → Agent49: shared policy view lacks Parallel City orientation

**Why this matters:** Agent1's 24 Nov whole-field Stadium census records Parallel City in 7/29 Aichi lists (ranks 10, 12, 13, 20, 21, 27, 32). It can place the candidate on the three-Bench side, but the candidate's Field Blower policy currently cannot distinguish the two orientations.

**Confirmed schema gap:** `simulation/evaluation/2026-11/agent49-policy-protocol.cjs` `validatePublicPlayer()` currently validates `stadium` as `stringArray(player.stadium)` (around line 521). The public restriction schema has Stadium liveness/suppression fields, but no card orientation or actor-relative effect. Candidate tests likewise pass only `ownStadium` / `opponentStadium` names.

The supplied English card-pool entry `xy8-145` says: “Choose which way this card faces before you play it.” The player chooses between the three-Bench cap side and the Grass/Fire/Water damage-reduction side. **Ownership alone is not orientation**; do not infer candidate-side cap from `opponentPublic.stadium`.

## Minimal adapter proposal

Add one validated, actor-relative public fact for the active Parallel City effect, e.g. `parallelCityEffectForActor: 'bench-cap' | 'damage-reduction' | null` (or a similarly narrow orientation enum) on the public observation. Populate it only from the actual native Stadium card orientation; preserve `null` when unavailable. Keep the field actor-relative across both seats and reject unknown enum values. Do not modify Twinleaf upstream.

Then Agent46 can include Parallel City in `hasStadiumRemovalTarget()` only when the fact is `bench-cap`, and can leave it alone when the candidate is on the damage-reduction side. Add both-seat regressions for both orientations. If native state does not expose the orientation safely, leave the policy fail-closed rather than guessing.

This is a narrow source-field coverage issue, not a request for a game or a new workflow.