# Rank-10 Pale Moon-GX source-trajectory exposure ledger

**Agent 1, 17 October 2026.** This ledger distinguishes a source-A printed-card rules failure from two separately replayed source-B trajectories. No row is qualified for competitive win-rate inference. The full field remains 29/32 printed opposing lists and zero qualified games.

## Source and audited scope

- Published [Aichi rank-1 Shadow Rider and rank-10 Regidrago 60s](../../full-decklists.json) are the exact fixed source inventories for both physical-seat studies.
- Pinned Twinleaf commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both studies run research-owned, opt-in hooks; their hook sets and root-action policies are **different**, and their game paths must never be merged.
- Trevenant & Dusknoir-GX SMP SM217: `Pale Moon-GX` places a delayed Knock Out on the Defending Pokémon at the end of the next opponent turn. Supplied Advanced Player's Rulebook v3.4 A-03 states that an Active Pokémon loses attack effects when it retreats to the Bench.
- The [source-specific read-only observer](../../../../simulation/twinleaf/pale-moon-queue-audit.cjs) captures actual first-`AddPlayerAction` Store root dispatches only, matching KO queue entries by attack name and exact target-reference position. It classifies `exercised-failing` when that effect remains queued after the target moves from Active to Bench, `exercised-cleared` for an observed removed queue, `unresolved` for an unexplained Benched queue, and `not-exercised` when no triggering interaction is observed. A full source replay is still a diagnostic of one finite trajectory.

## Exact exposure evidence

| Source experiment | Physical candidate seat / actual opening | Fixed source seed | Root action / queue evidence | Exposure label |
| --- | --- | --- | --- | --- |
| Champion vs rank10 **B, unchanged control** | Candidate B, actually first | `4246551499` | **350/350** replayed source root Store inputs and v2 graph checkpoints; **0** root dispatches with pending `Pale Moon-GX` KO, **0** observed Active-to-Bench trigger exits | **not-exercised** |
| Champion vs rank10 **B, Copycat alternate** | Candidate B, actually first | `4246551499` | **235/235** replayed source root Store inputs and v2 graph checkpoints; **0** pending KO dispatches and **0** trigger exits | **not-exercised** |
| Champion vs rank10 **A, experimental turn-five Koraidon retreat** | Candidate A, actually second | `3162592764` | Raw root Store carried pending `Pale Moon-GX` `knock_out` targeting Benched Koraidon after its actual `RetreatAction`; correcting Active-exit cleanup removed **1** root queued effect | **exercised-failing** in raw engine |

**B-source verification:** [compiled manual CI 39002339016](https://github.com/FlareZ123/experiment-01/actions/runs/39002339016), immutable head `30b978b91e402ea56368f41c8a397fe4e61ba8f0`, passed its complete replay acceptance after fresh-process action reconstruction. The resulting [fresh-process input-replay artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39002339016/artifacts/12089004483) records `paleMoonExposure.status: "not-exercised"` and `queueObservedDispatches: 0` for **each** arm, with `rootDispatches` equal to 350 and 235. The v2 `Store` own-data graph comparison is exact at those 585 source dispatch boundaries. The immutable [source-branch dispatch artifact](https://github.com/FlareZ123/experiment-01/actions/runs/39002339016/artifacts/12089866799) has GitHub-reported archive SHA-256 `383b1562920d010ee23a2106639f6580f1956fcc4debe804f1da78703ca42a30`; the fresh-process replay artifact ZIP SHA-256 is `1edd05e29a2f0446ca9e8e45f6c222517d7ee3f390b25ef7657228e1e1b1491d`. The observer made no source action-choice change. This evidence demonstrates non-exposure **only in these two source replays**.

**A-source contrast:** [compiled manual CI 38990149556](https://github.com/FlareZ123/experiment-01/actions/runs/38990149556), immutable head `2576e15b`, [original and corrected source report](../../rank10-pale-moon-source-rule-discrepancy.md). On a different physical-seat seed and action trajectory, the raw pending KO survives the actual Koraidon retreat and resolves at turn end. With the reversible corrective hook, terminal champion/Regidrago Prizes remaining differed **4/0 → 2/1**. Regidrago won both single-deal branches. This cannot invalidate the distinct unexposed B-source transcript, and the correction is not certified across other delayed effects.

## Decision gate

These findings remove one specific **exercised Pale Moon-GX Active-exit failure** from the two archived champion-B replay paths while retaining the confirmed **red** paper-rule discrepancy for source-A affected games. B-source `sourceInputTransportComplete: true` and `v2StoreDataGraphReplayComplete: true` apply only to the accepted archived actions. Both-game `sourceReplayMechanicsVerified: false` and `qualifiedForCompetitiveInference: false` remain unchanged because closure-captured state, game-rule fidelity outside the observed interaction, information-set fairness, strategic competence of both players and independent field/seat replication have not been accepted.

**No qualified game or win-rate estimate is added.** Next: compare Agent 17's independent classification against this observer on the same immutable B archive and test policy choices under corrected source-A delayed-effect handling before interpreting any winner or score difference.
