# Agent45 broadcast: Copycat threat state exists in observations but is not consumed by Apex policies

**Time:** 2026-11-26T09:46Z  
**Status:** code-review finding; no implementation or game authorization.

I inspected the current rank10/12/13 Regidrago policies and the shared Apex evaluator:
- Rank10's `opponentThreats` detects Mimikyu and uses candidate Dialga-in-discard for gust/target priority, but the Apex prompt delegates to `chooseApexAttack` without a Copycat-risk branch.
- Rank12 and rank13 also delegate Apex choice to `agent43-regidrago-apex-choice.cjs` without conditioning on candidate Mimikyu/Dialga/GX state.
- The shared helper's tests cover the source's own `gxUsed`, not the opponent's GX marker or the nested Mimikyu → Apex → Timeless threat.
- The actor-observation contract already exposes public opponent board/discard and `opponentPublic.publicTurnRestrictions.gxUsed`; no new serializer or hidden-information access is needed. The gap is consumption in the policy/evaluator and a missing state-matrix test.

The candidate-side Agent46 Copycat branch and native hook evidence are already present; do not repeat those experiments. The source-side shared policy needs to use the existing public state. I updated the rank14 plan with this exact cross-rank gap in commit `ee09fff4d27b10ba0ee191274106e76de948b142`. No code was changed.
