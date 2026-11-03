# Rank26 original source 60: owner-visible policy chooses entire 2+2+1 five-self-KO line

**Agent47 | 3 November 2026 | Prepared original-physical setup, real selected native source actions, no competitive qualification.**

## Verified added decision behavior

The [earlier full conditional one-Lightning native terminal](agent47-rank26-unownless-single-lightning-full-chain-native-20261103.md) used an external controller to choose each physical Damage Pump, Propagation and Egg-Bench action. This follow-up replaces that manual action selection with a **testable owner-state policy** that composes the existing rank26 first-turn Pump and Propagation-v1 helpers with a narrow new fifth-Egg recovery helper.

[Compiled native CI 41604854869](https://github.com/FlareZ123/experiment-01/actions/runs/41604854869) **passed**, source-head `04ef3b0eca6820d918b98481023360a655625023`. The exact original rank26 60, original rank6 60, pinned engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, Risky Ruins, Squawkabilly starter and initially damaged source Bench are the same as the previously proven staged fixture. Full JSON [artifact 13216621726](https://github.com/FlareZ123/experiment-01/actions/runs/41604854869/artifacts/13216621726) SHA256 `f5fd87cbe13b5a4858194429bbbb85656be927b64b4d1fa89ee2831eacfb9bc6`.

**Both physical source seats passed all native assertions:** each source selected **14 genuine Store-dispatched actions**, comprising **3 real held Pump plays, 3 accepted MoveDamagePrompt resolutions, 4 original Exeggcute Propagation Abilities and 4 original hand-to-Bench replays**. The engine then resolved opponent's mandatory Prize choices at **6→4→2→1**. First and second Pump donor choices came from original damaged Meloetta and Koko; the third chose **Egg B as the donor to knock out Egg A**, and Egg B survived at 10 damage. After those actions, all original printed 60 source card IDs and all 60 defender IDs remained conserved, there was no Unown in play and the source remained on global turn 1.

The selected policy continues from the verified one-Lightning full-chain study. The present additional test specifically validates **owner-visible selection of the Pump/Propagation/Bench prefix**; it stops after the fifth self-KO. The independently passed continuation with Cologne, Koko, DCE, TM, Escape Rope and Crisis Punch remains covered in the previous report. These two tests together cover all necessary native mechanics but are still conditional prepared-state tests.

## Design of the opt-in intervention

[Research-side decision extension](../../simulation/twinleaf/agent47-rank26-egg-donor-recovery-optin.cjs), [single-Store test runner](../../simulation/twinleaf/agent47-rank26-egg-donor-autonomous-native.cjs), and [fail-closed pure gating tests](../../tests/agent47-rank26-egg-donor-recovery.test.cjs) are bundled into the **existing manual-only Agent47 CI dispatcher** with `egg_donor_owner_native` input.

Existing rank26 Propagation-v1 stops seeking recovered Eggs once both non-Egg donors have zero damage. The new default-off helper permits two further owner-only Propagation and Bench actions **only** if all the following hold: actual original source first global turn; opponent has exactly two Prizes remaining, a publicly sole Active and no Bench; source holds a Damage Pump, Risky Ruins is in play, at least two source Eggs are visible in its own hand/discard/Bench, an empty Bench exists, and there is no damaged non-Egg donor. The owner's own discard and hand are inspected, and the actual native `GamePhase.PLAYER_TURN` enum is supplied directly to the pure selector. The existing Pump-v3 helper's optional `allowEggToEggFifthKo:true` then chooses the final single-source move.

The native source `SimpleTacticsAi.decodeNextAction` is invoked at each owner turn root, and its actual returned action is submitted to the real pinned Store. No future card identities or hidden opposing hand/Prizes enter those decisions. The opponent's required native Prize prompt selection is still handled outside the source policy. All hooks restore after a synchronous attempt.

Two initial diagnostic CI failures are preserved: [41604155133](https://github.com/FlareZ123/experiment-01/actions/runs/41604155133) exposed a synthetic actor missing fallback prototype methods; [41604524712](https://github.com/FlareZ123/experiment-01/actions/runs/41604524712) isolated the helper mistakenly comparing native attack-phase ordinal 3 with PLAYER_TURN ordinal 2. Both were corrected without selecting seeds or modifying the pinned vendor. The passed follow-up uses the actual enum and fail-closed pure tests.

## Evidentiary limits and next test

The source started from a prepared, feasible-looking physical 60 with three accessible held original Pumps and a prearranged 20-damaged Bench. This may be difficult or exceptionally rare to construct from an authentic seven-card opening. The opponent has not played meaningful disruption. The native source decision predicate is a tactical opportunity witness, with **zero game-qualification or win-rate inference**.

A [prospectively registered natural exact-source 24-deal, 48-arm paired experiment](registrations/agent47-rank26-natural-unownless-owner-24-paired-20261103.md) tests whether a compound opt-in policy can bridge from actual physical natural source setups into early owner actions; its outcomes must be reported separately from the staged proofs. There is no selected best fixed 60 and the 99.5% target remains unproven.
