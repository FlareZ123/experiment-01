# Agent 6: native Tool Jammer PlayCardAction from the actual hand, both seats

**2 November 2026 | pinned genuine Twinleaf Store | 4/4 manually staged native actions | no competitive matches**

## Question and prior gap

All previous Tool Jammer native suppression tests attached a Tool card directly to the opponent Active as a fixture. To verify that the actual Store accepts the Tool from hand, moves the **same physical Tool card** to the Active attachment slot, and then applies its revised ToolEffect behavior, this test uses a genuine native `PlayCardAction` with the previously built default-off research hook.

The *paper* card text, including Active-only application and Tool Jammer exception, is available at [Tool Jammer BST136](https://limitlesstcg.com/cards/bst/136). The pinned `ToolJammer.reduceEffect` is a live implementation no-op for `ToolEffect`; the per-Store reversible [research ToolEffect guard](../../simulation/twinleaf/agent6-tool-jammer-tool-effect-guard.cjs) implements that missing native border without upstream modification. Full [source audit](agent6-pinned-tool-jammer-noop-tooleffect-repair-20261102.md).

## Actual native side effects

The opt-in `runNativePlayedJammerRepair()` branch in [agent6-skyliner-public-suppression-native.cjs](../../simulation/twinleaf/agent6-skyliner-public-suppression-native.cjs) stages a legitimate board, original synthetic prizes and decks, then:

1. Starts with opponent Active Duskull VIV under Path or Iron Thorns ex TWM, one physical `Tool Jammer BST` in the **opponent hand**, none in the attached Active Tool slot.
2. Temporarily assigns `state.activePlayer` to the opponent's physical seat; submits genuine `new PlayCardAction(opponent.id,0,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0})`.
3. Checks native success, that the exact Tool Jammer reference left the hand, entered the selected opponent Active's `tools` array, and was not discarded or stuck behind a prompt.
4. Returns to the original owner's turn for the same staged Latias ex SSP tool/Ability/retreat decision, using the opted-in `withActiveToolJammerToolEffectGuard`. This is a *staged turn-context transfer*, not a naturally played turn boundary.
5. Checks actual `IS_ABILITY_BLOCKED`, actual `CheckRetreatCostEffect` and actual unfunded `RetreatAction` rejection, under both physical source seats.

No tool source payment/discard is fabricated: Tool Jammer's attachment itself is the legitimate hand-to-Active move. Native `TrainerEffect` completes and leaves no unresolved prompt.

## Verified compiled result

[GitHub Actions run 41481441908](https://github.com/FlareZ123/experiment-01/actions/runs/41481441908), [artifact 13159828068](https://github.com/FlareZ123/experiment-01/actions/runs/41481441908/artifacts/13159828068), ZIP SHA256 `58dbcd0c9e9b34e22b2a0a07fad96794c37af12ba2300ece9cdaee903c229a2f`, matches independently downloaded archive. Embedded `agent6-native-play-tool-jammer.json` records `stagedNativeCases=4`, `failedChecks=0`, no prompts left from genuine tool playing. Exact native cases:

| Staged original owner matchup source | Owner seat | Opponent hand before / after | Opponent Active attached Tool after | Actual owner retreat |
| --- | --- | --- | --- | --- |
| Path to the Peak, own Latias+Float Stone, opponent Active Duskull | 0 | Tool Jammer / empty | Tool Jammer | Cost 2, rejected |
| Same | 1 | Tool Jammer / empty | Tool Jammer | Cost 2, rejected |
| Own Latias+Stealthy Hood, opponent Active Thorns+Initialization | 0 | Tool Jammer / empty | Tool Jammer | Cost 2, rejected |
| Same | 1 | Tool Jammer / empty | Tool Jammer | Cost 2, rejected |

For every row the identical physical Tool Jammer card reference moved from its actual hand collection into the opposing Active `tools`; `playError:null`, `attachedToTarget:true`, `inHandAfter:false`, `inEnemyDiscard:false`. Native Ability and retreat checks match the expected suppressed state, and the original owner remains Active with no completed unfunded retreat.

The initial implementation of this extra audit [CI41480946707](https://github.com/FlareZ123/experiment-01/actions/runs/41480946707) failed immediately with a JavaScript temporal-dead-zone assertion, because `opponentToolJammer` was referenced before its declaration. Agent6 code commit `85b58a66` moved the assert after that const, and the new independent run above passes. Preserve this as a test-harness defect corrected before treating outcome evidence as native.

## Qualification limit

The simulated state manually assigns the opponent as current actor and later assigns control back to the original owner. It does not cover the full preceding opponent turn, naturally dealt decks, real opponent resource strategy, a selected bilateral frozen configuration, or game outcomes. The complete staged Hood→Rondo→two Prize→promotion local attack chain is separately archived [here](agent6-hood-rondo-native-prize-promotion-20261102.md) and did not occur in this same native Tool-attachment run. A truly **joined original-source same-root turn-to-turn trace** is still missing. Keep all research guards default-off.

**Aichi Top32 status:** 29/32 original printed 60 lists verified; missing ranks23/25/28; 0 qualified full-paper games, no demonstrated 99.5% win rate and no single validated optimized sixty.
