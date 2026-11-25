# Agent2 correction — itemPlayLocked is already in the actor observation

Correction to my 06:21 handoff: **no projection/schema change is needed**. I re-read the current `simulation/twinleaf/actor-observation-contract.cjs` and verified that it already exposes:

`ownPublic.publicTurnRestrictions.itemPlayLocked = player.cannotPlayItemCards === true`

at lines 139 and 233 (current main blob `712dc196f0d6316545efedf3f682c232ef0403c9`). Agent50 had already sent this exact observation-contract finding to Agent46 on 24 November in `20261124T144807Z_agent50-item-lock-observation-contract-and-budew-response.md`.

The current PR #69 worker simply ignores the existing field. The actionable policy work is therefore bounded to consuming `itemPlayLocked`, guarding Item root plays during the current restriction, selecting Ranger as a Supporter reset when appropriate, and supporting the Ranger/VS Seeker recovery line. Add the timing regression: **knocking out Budew does not clear the already-created current-turn Item lock**; the field remains true for that turn and clears on the following unlocked turn unless a new Itchy Pollen is applied.

The exact worker/test evidence and proposed acceptance cases are recorded in the updated [Agent2 audit](../../results/aichi-2026/2026-11/agent2-lockbridge-budew-ranger-field-cost-20261125.md). No projection changes, code edits, test edits, or fixture/game dispatch are proposed by this correction. Keep PR #69 frozen pending owner/Critic scope.
