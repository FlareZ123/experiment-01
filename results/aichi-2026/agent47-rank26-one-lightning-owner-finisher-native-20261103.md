# Rank26 owner-visible first-turn one-Lightning Meloetta finishing decisions, both native seats

**Agent47 | 3 November 2026 | staged conditional Store proof, zero qualified games**

## Result

[Manual compiled CI 41606369063](https://github.com/FlareZ123/experiment-01/actions/runs/41606369063) reached a **passed** source-finisher native step in both seats, using pinned Twinleaf `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, original rank26 Meloetta source 60 and original rank6 Iron Thorns 60. [Raw first-turn source finisher artifact 13217331100](https://github.com/FlareZ123/experiment-01/actions/runs/41606369063/artifacts/13217331100), SHA256 `767d4b8e2671227c419a5bc7cd9b729aa3e06ba21cab8068b9209e78f6c9bc72`.

The native `SimpleTacticsAi.decodeNextAction` with source-only opt-in [finisher helper](../../simulation/twinleaf/agent47-rank26-conditional-finisher-policy.cjs) and [existing one-Lightning Cologne policy](../../simulation/twinleaf/rank26-cologne-opener.cjs) **actually selects source Store actions**, in the following order after the existing published source setup's Meloetta/Koko Bench:

1. Play one original held Canceling Cologne against the original rank6 Active Iron Thorns ex's Ability lock, using existing owner-visible Cologne guard.
2. Select Koko Prism Star's original Dance of the Ancients Ability and **pay its native AttachEnergyPrompt with exactly one original Basic Lightning**, moving it from source discard onto Benched Meloetta.
3. Perform the actual original Double Colorless Energy manual attachment, original Technical Machine: Crisis Punch Tool attachment, held original Escape Rope play and source ChoosePokemonPrompt selection to promote Meloetta.
4. Declare a genuine first-global-turn native `AttackAction('Crisis Punch')`. After neutral WaitPrompt resolution, the native sole Iron Thorns Active is Knocked Out and `GamePhase.FINISHED` reports the source seat as winner.

The policy's seven deliberate owner actions are audited as `use-koko-one-lightning`, `one-lightning-koko-prompt`, `attach-original-dce`, `attach-original-tool`, `escape-rope-promote`, `promote-meloetta`, and `firstturn-crisis-punch`. The source's physical original 60 and defender's original 60 are identity-conserved before and after the actual native end. The research-owned source policy reads **only visible own hand/discard/attached Energy/Tools and public board/Prize count**; native decisions are dispatched into the real Store.

## Independent clean manual rerun after workflow gate correction

[Manual CI 41607406033](https://github.com/FlareZ123/experiment-01/actions/runs/41607406033), triggered **after** per-input `if` conditions were repaired, **passed the owner-finisher step in both source seats**, with **all other rank26 native experiments and strict-physical60 steps correctly skipped**. [Clean isolated raw artifact 13217870348](https://github.com/FlareZ123/experiment-01/actions/runs/41607406033/artifacts/13217870348), SHA256 `f44114eae948ec85b22dd34c46bfed24fed5a8b3dc858b7dbbe77cd034df1fd6`. This validates that the exact opt-in manual gate now executes only the designated native source finisher, and independently reproduces the same terminal claims.

## Setup and limitations

The [two-seat native test runner](../../simulation/twinleaf/agent47-rank26-isolated-owner-finisher-native.cjs) intentionally starts at a **synthetic terminal window**, with a Squawkabilly Active and MEL/Koko/Eggs Benched under Risky Ruins. It takes five original opponent Prizes from their exact printed Prize zones into their own hand, leaving them at exactly one Prize, *without* reconstructing preceding Knock Outs. It also relocates source-owned original Cologne, DCE, TM, Rope and one Lightning from source owner reserve zones into source hand/discard. The input state is declared synthetic, and never treated as an authentic initially shuffled root.

The separate [owner-selected five-self-KO native test](agent47-rank26-eggd-2plus2plus1-owner-selected-native-20261103.md) establishes real source policy's preceding three Pump and four Propagation/four Bench actions from its own prepared root. The [complete continuing native full-chain manually selected proof](agent47-rank26-unownless-single-lightning-full-chain-native-20261103.md) establishes the actual total five-KO then one-Lightning Crisis terminal with no lost card identities. These studies cover different dimensions and **should not be substituted for a single naturally played, opponent-competent full game**.

The intended paper source-turn sequence is therefore both **mechanically executable** and has separately tested, source-visible action selection at the two high-impact windows. It has zero measured genuine starting-hand acquisition probability, zero opponent policy competence, and **zero competitively qualified wins**. The Aichi Top32 target remains open (29/32 authenticated opposing original sixties, no selected best fixed 60, no 99.5% evidence).

**CI note:** This native-finisher run was launched before a correction to the shared manual workflow's overbroad `if` expressions; it also ran an unrelated natural cohort step. The single native-finisher step and artifact are independently isolated above. Later dispatches use the corrected, individual per-input gates.
