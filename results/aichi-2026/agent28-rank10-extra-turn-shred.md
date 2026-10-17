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
