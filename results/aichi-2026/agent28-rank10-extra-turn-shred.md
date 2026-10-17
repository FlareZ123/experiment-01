# Agent 28: authentic rank-10 turn-28 Copycat / Shred knockout window

**17 October 2026 UTC. Evidence class:** archived full source-deal observation plus card-text conditional damage arithmetic. **No counterfactual action is yet engine-validated; zero competitively qualified games.**

## Frozen source provenance

- Source: exact Aichi rank-1 Shadow Rider Calyrex against rank-10 Regidrago, candidate physical **B** and actually first, `pilot:10:0:champion-reference:B`, seed **4246551499**, `decorrelated-slots-v3`. The source setup policy is the opt-in documented turn-27 Mimikyu/Apex/Timeless fork, with both full 60-card inventories unchanged.
- Pinned engine: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The downloaded authentic root dispatch artifact [12054148170 from manual run 38919894636](https://github.com/FlareZ123/experiment-01/actions/runs/38919894636) has extracted JSON SHA-256 `5659ce48b677ad506f5642e436eea60604ac533eef8f3802bd516fa322f66a1b`. Review `alternate.fullLiveDispatchTrace` and `alternate.result.copycatTurnStartEvidence`; the original [rank-10 working packet](qualification-packets/rank-10/README.md) preserves the remaining replay and policy limitations.
- The archive itself has a verified **235/235 action-input transport** milestone at that revision. This is not whole-Store equivalence or competitive-policymaking certification; subsequent wider graph replay gates were red on 17 October.

## Source-grounded missed action opportunity

The alternate source branch performs the previously investigated `Mimikyu / Copycat -> Regidrago's Apex Dragon -> discarded Dialga-GX UPR's Timeless-GX` on global turn **27**. The real `ChooseAttackPrompt` resolves Timeless-GX at Store dispatch **208**. This creates the candidate's genuine immediate extra turn **28**, with GX already spent.

At the archived beginning of turn 28, the candidate has **Mimikyu GRI Active with two Basic Psychic Energy** (MEE printings), **Dialga-GX UPR in its own discard**, `usedGX:true`, and the prior opponent attack record `Regidrago VSTAR SIT / Apex Dragon` with `gx:false`. Opposing Active Regidrago VSTAR has **210 damage on printed 280 HP**. The candidate and opponent have **4 and 3 Prizes remaining**, respectively.

The direct card-text line worth dispatching from this genuine decision state is:

`Mimikyu Copycat (Psychic + Colorless) -> enemy's last Apex Dragon -> own discarded Dragon Dialga-GX UPR's ordinary Shred (80)`.

Under normal attack-copy rules, Copycat pays its printed two-Energy cost; the delegated Shred cost is not separately payable. **80 added damage to 210 exceeds Regidrago VSTAR's 280 HP by 10**, conditionally taking **two Prizes**. Shred ignores effects on the opposing Active. Consuming Timeless-GX on the previous turn does not itself prevent using the *non-GX* Shred attack. These are card-text/rule inferences, and source-state effect interactions beyond the archived public snapshot remain an explicit untested risk.

The actual branch instead performs `Iono` (dispatch **212**), resolves its prompts (213–214), **retreats Mimikyu to Latias ex** (215), and **passes** (216), leaving the damaging Copycat line unused. On opposing global turn **29**, Regidrago attacks with Apex Dragon, choosing Koraidon ex's Kaiser Tackle at dispatch **220**, and knocks out Latias ex for two Prizes. The archived bot eventually loses. That continuation shows high practical importance of investigating the alternative while **not** proving the alternative would win.

## Concrete follow-up experiment and falsifiers

The new [staged pinned-Store regression](../../simulation/twinleaf/mimikyu-extra-turn-shred-action.cjs) dispatches `AttackAction('Copycat')`, selects Shred through the real `ChooseAttackPrompt`, uses the spent-GX marker, and asserts 290 damage and the two-Prize Knock Out from the observed 210 starting damage. It also tests a nonlethal 190-damage baseline and asserts no recycled bonus turn. The existing **manual-only** [Mimikyu source workflow](../../.github/workflows/mimikyu-rank10-pair.yml) has an added regression step, but a workflow-dispatch attempt was **blocked by the available Actions interface**, so this new code must be treated as **not yet runtime-verified**.

The decisive next test should replace the **source-dealt turn-28** Retreat or Pass with a legal Copycat/ChooseAttackPrompt selecting Shred, preserving the authentic initial hands, deck and Prize order, source prefixes, corrected copy-history hooks, and opponent decisions. Verify actual KO/Prize prompts and Regidrago's response in the **same source deal**, then test the other physical seat and independent seeds. Check (1) the prompt includes Dialga despite a spent GX, (2) source pre-fork identity/noninterference, (3) full-Store mechanic replay, (4) preserved opponent continuation/policy competence, and (5) real event legality and locks. **No numeric win-rate claim** follows even if the one-deal fork is favorable.

## Status

**Action opportunity: source-observed. Counterfactual rule execution: pending. Competitively qualified game wins: zero.** Maintain `sourceReplayMechanicsVerified:false` and `qualifiedForCompetitiveInference:false` for the rank-10 packet until the independent gates pass.

## Source-fork implementation checkpoint

A subsequent [opt-in turn-28 tactical policy](../../simulation/twinleaf/mimikyu-extra-turn-shred-policy.cjs) is guarded by the source turn number, active Mimikyu, spent GX marker, two attached Energy including Psychic, the preceding opponent's ordinary Apex Dragon, own discarded Dialga-GX, and opposing active Regidrago VSTAR already within 80 damage of being Knocked Out. Its injection precedes the default Retreat tactic, while leaving all non-target decisions to existing tactics. Pinned upstream `SimpleTacticsAi` was source-checked: its tactic and prompt resolver loops continue after `undefined`, so the new resolver yields on unrelated prompts, including the turn-27 Timeless-GX choice.

[The authentic source-fork harness](../../simulation/twinleaf/rank10-extra-turn-shred-fork.cjs) runs the unchanged turn-27 setup control, the Shred-on-turn-28 variant, then the unchanged control again. It checks the same initial physical seed and deck hashes, byte-identical control before and after the alternate, identical candidate-observed state at the beginning of turn 28, an actual turn-28 Mimikyu Copycat attack, and an observed two-Prize pickup after the alternate. It fails rather than reporting success if any of these conditions is unfulfilled. [Pure predicate controls](../../tests/mimikyu-extra-turn-shred-policy.test.cjs) and [archive-window controls](../../tests/aichi-rank10-shred-window.test.cjs) are included in the same existing manually dispatched workflow.

**Execution status remains unverified:** the code and CI steps were committed, but the workflow has not successfully been triggered in this invocation. Do not mistake a source-checked policy interface or static assertions for an executed Store continuation. If the compiled job fails, preserve the first error and the exact test head as falsifying evidence rather than removing the gate for a green badge.

## Additional public-board pressure after the conditional KO

The same independently parsed turn-28 snapshot shows **zero attached Energy across all five opposing Benched Pokémon**: Latias ex (200 damage), a second Regidrago VSTAR (zero damage), Tapu Lele-GX, Wobbuffet and Regidrago V. The only observed opponent Energy at that moment is on the already-damaged Active Regidrago VSTAR. An actual Shred KO would thus remove the only currently Energy-powered opposing Pokémon, subject to replacement Pokémon, next-draw, attachment, attack acceleration and other available actions. This materially strengthens the *hypothesis* that the missed attack matters, while the response after the hypothetical KO remains unobserved. The archive does not prove the opponent would fail to recover.
