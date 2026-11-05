# Both-seat Tool Jammer paper effect: synchronous Store-wide hook and pinned native check

**Agent 6 | 5 November 2026 | pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` | 0 qualified games**

## Exact finding

The existing per-Store [Agent6 ToolEffect guard](../../../simulation/twinleaf/agent6-tool-jammer-tool-effect-guard.cjs) had already shown that the pinned native Store fails to suppress opposing Active Float Stone BKT when the other Active carries Tool Jammer BST, and that a reversible native ToolEffect repair can recover the printed rule. The prior [eight-arm same-staged-root counterfactual](../agent6-tool-jammer-held-vs-played-rank30-float-native-eight-20261102.md) showed causal local attack consequences, including real opponent hand-to-Active PlayCardAction and turn transition.

**New capability:** [`withBilateralActiveToolJammerPaperGuard`](../../../simulation/twinleaf/agent6-bilateral-tool-jammer-paper-guard.cjs) patches the pinned Store **prototype**, rather than a manually supplied owner/Store pair. One synchronous wrapper is therefore usable around a headless match that creates a Store internally. The same paper rule applies regardless of physical player seat. It restores the original descriptor even when the child execution throws. No Twinleaf/vendor files were modified and no shared benchmark policy selects this hook by default.

The hook intercepts only genuine `ToolEffect` queries concerning a Tool actually attached to the acting owner's Active, with a genuine opposing Active `Tool Jammer BST`. It excludes `Tool Jammer` itself and consults the native `IS_TOOL_BLOCKED` for an already-suppressed opposing Jammer. The native `IS_TOOL_BLOCKED` already interprets a thrown ToolEffect probe as a suppressed Tool, which is the pinned Store contract used by `Jamming Tower`.

The [pinned upstream Tool Jammer reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-battle-styles/tool-jammer.ts) has only a commented-out `TrainerEffect` branch and no current ToolEffect rule. The [pinned native checker](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/prefabs.ts) uses the catch-to-block contract. These are source-code observations about this vendor revision, not a universal verdict about all Tools.

## Both-seat regression evidence

- **GitHub Actions manual run:** [41958363928](https://github.com/FlareZ123/experiment-01/actions/runs/41958363928), head `5322bcf7aba6b0b7951a86533a1d4bc23b05416e`.
- **Pure test:** [six fixture regressions](../../../tests/agent6-bilateral-tool-jammer-paper-guard.test.cjs) passed in the existing rank30 manual workflow, including both seats, absent/Benched/opposing blocked Tool, opponent private-zone nonaccess, nested checker behavior, and exact restoration on exception.
- **Compiled native test:** [single runner](../../../simulation/twinleaf/agent6-bilateral-tool-jammer-native.cjs) passed its separately named workflow step in the real pinned Store. **Ten of ten mechanically staged native cases, zero failed checks.**
- **Complete native ZIP:** [artifact 13384665093](https://github.com/FlareZ123/experiment-01/actions/runs/41958363928/artifacts/13384665093), independently downloaded and decoded; ZIP SHA-256 **`79c968057bedbc9dd5ff6912b824a093fd40682447e872a94f710b837270623e`**, matching GitHub's published artifact digest. JSON member `agent6-bilateral-tool-jammer-native.json`.

| Exact synthetic native board mode | Seats tested | Native cost | ToolEffect blocks per seat | Outcome |
| --- | --- | ---: | ---: | --- |
| Path to the Peak + Float Stone + opposing Active Tool Jammer, genuinely played from hand, opponent turn ended natively | 0, 1 | 2 | 2 | Unfunded retreat rejected |
| Opposing Active Iron Thorns ex + Float Stone + its Tool Jammer, genuinely played from hand, opponent turn ended natively | 0, 1 | 2 | 2 | Unfunded retreat rejected |
| Path to the Peak + Float Stone, no opposing Jammer | 0, 1 | 0 | 0 | Free retreat accepted |
| Path to the Peak + Float Stone, opposing **Benched** Jammer | 0, 1 | 0 | 0 | Free retreat accepted |
| Opposing Active Iron Thorns + Tool Jammer + Jamming Tower | 0, 1 | 2 | 0 | Tool suppression comes from the Stadium; opposing Jammer itself is disabled |

These counts are distinct **native Store ToolEffect probes**, not random games or independent naturally dealt card opportunities. The four actually played-Jammer cases physically execute an opponent Tool PlayCardAction and native turn handoff within a **manually staged** board. All ten cases return an explicit `competitiveQualified:false`.

The same workflow also retains an **intentionally failing legacy unpatched counterexample** to demonstrate the pinned default bug. Its overall `failure` is compatible with the individually passed new pure and native steps. Read step-level evidence rather than the aggregate workflow status.

## 5 November v2 physical-owner follow-up: 48 archived native checks

**Completed follow-up:** [manual CI 41961498956](https://github.com/FlareZ123/experiment-01/actions/runs/41961498956), pinned checkout `8756f396cf00448573d387ff3774701bfaf7988b`, pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Existing rank30 workflow steps 9, 19 and 20 **succeeded**, including all seven pure fixture tests and the complete compiled native runner; the unrelated legacy Skyliner suppression step 21 **failed**, making the overall workflow red. Interpret the exact step outcome rather than the aggregate status.

**Independently downloaded native artifact:** [13385279503](https://github.com/FlareZ123/experiment-01/actions/runs/41961498956/artifacts/13385279503), ZIP SHA-256 `45192b9aa9147deb602c40df0b51f8bd584ffab4ff60012c5de5f403d270cb8b` (matches GitHub's workflow digest). Member `agent6-bilateral-tool-jammer-native.json`; wrapper version `agent6-bilateral-active-tool-jammer-paper-guard-v2-physical-owner`. Full registered record contains **36 native retreat/board attempts plus 12 native Tool-family effect attempts**, no recorded attempt errors, zero failed checks and zero competitive games. This extends the earlier ten-case v1 report above, which remains historical evidence.

| Tested native effect | Both physical seats | Observed outcome |
| --- | --- | --- |
| Float Stone / Air Balloon with opposing Active Tool Jammer | Yes | True unfunded retreat rejected with actual cost 2; corresponding no-Jammer and Benched-Jammer controls give cost 0 and accepted retreats |
| Stealthy Hood with opposing Active Iron Thorns + Tool Jammer | Yes | Tested owner Ability/retreat guard sees printed cost 2; Jamming Tower control disables this hook's Jammer-specific blocks |
| Fighting Fury Belt with opposing Active Tool Jammer | Yes | Staged native HP check passes; this is not a fully settled damage/Knock Out line |
| Muscle Band on attacking Active against opposing Active Tool Jammer | Yes | Uncorrected/pinned native deals 40 in reducer check; corrected ToolEffect gate gives 20, the same as without the bonus |
| Handheld Fan on defending Active against opposing Active Tool Jammer | Yes | Uncorrected native creates an `AttachEnergyPrompt`; v2 guard prevents that prompt, registering one physically foreign `effect.player` per seat |

**Ownership defect addressed:** The actual pinned Handheld Fan reducer constructs its ToolEffect with the **attacker** as `effect.player`, even though the defending Active owns the Tool. A guard that trusts that value would fail to suppress the Fan. The v2 adapter identifies the physical Tool owner by checking both players' attached Active Tools, then determines the opposing Active Jammer. Both owner seats are witnessed in the actual native archive, with one corrected foreign-player ToolEffect interception per seat.

**Limitations:** Each of the 12 Tool-family cases is a native reducer/effect observation with `noFullNativeAttackSettlement:true`. The 36 board attempts are staged, and only a subset includes a genuine opponent Tool PlayCardAction and native turn transition. No complete naturally dealt Aichi game or consequential winner is implied, and native acceptance alone cannot certify paper-valid actions. The hook remains default-off and **not selected in Issue #25's shared executing bilateral policy**. The next test is integrated owner-visible original-source play, with direct source-deal fingerprint, payment, opponent reply, and failure-inclusive archive.

---

## Scope and impact on the shared objective

This is a concrete, prospectively tested, both-seat **mechanics adapter** suitable for evaluation by the [Issue #25 shared integration steward](https://github.com/FlareZ123/experiment-01/issues/25). It has not been selected in the executing shared source/opponent profile. It does not certify Tools whose reducers bypass native `IS_TOOL_BLOCKED`, and its accounting does not validate a complete paper game. No actual Aichi source opening was shuffled for these stage fixtures, no original opponent chose the Tool tactically, and the official paper time limit was not exercised.

**Suggested integration gate:** keep this wrapper versioned and default-off; check source-original rank6/24/29 Tool Jammer against rank30 Float Stone only under owner-visible real turns, both player seats, with registered nonencounters, paper payments, genuine opponent replies and full physical deal fingerprints. Preserve the no-Jammer and Jamming Tower controls and do not claim a game win on a successful local retreat veto.

**Decision remains:** 29/32 authenticated original name/count sixties (ranks23/25/28 unavailable), no selected best fixed60, zero competitively qualified original-field games and no evidence of 99.5% win rate.
