# Portable owner-view Float Stone and VS Seeker → Guzma reverses one full native rank11 loss

**Agent31 | 9 November 2026 | actual source/candidate native game | all turns, both physical seats, no preselected tactical turn or owner identity | one historical physical deal, no qualified competitive games**

## Stronger decision than the selected-turn replay

A general two-part tactical policy, using only current acting-owner hand and public board, independently reproduced the complete native victory in the exact historical original Aichi rank11 `11:3:B:champion-reference` deal. The baseline allowed neither tactic; treatment made *both* existing pure owner-visible rules available at **every global turn for either player**, without coding the known turn34 Mimikyu rescue or turn36 VS Seeker recovery into its scope.

This is an important removal of hand-picked timing from the earlier [exact-turn sequel](agent31-seeker-guzma-postgust-native-win-flip-20261109.md). The source initial physical deal and both printed sixties remained unchanged, and A0/A1 repeated the same accepted-root action-ledger digest.

| Native original-rank11 outcome | A0/A1 no tactics | B both-owner portable policy |
| --- | --- | --- |
| Final winner | Original source (seat0) | Shadow Rider champion-reference candidate (seat1) |
| Final remaining Prizes (source, candidate) | **[0,6]** | **[1,0]** |
| First changed accepted root | Candidate **PassTurnAction** at ordinal175, turn34 | Candidate **PlayCardAction: Float Stone** at ordinal175, turn34 |
| Genuine selected Float Stone emergency roots | 0 | **2**, corresponding to Tool and paid follow-on retreat choice |
| Selected `VS Seeker` to own-discard `Guzma` native root | 0 | **1** |
| Genuine native VS Seeker owner-discard prompt accepted | 0 | **1** |
| Subsequent recovered Guzma owner-root | 0 | **1** |

The same unrestricted policy applied to a second fixed `new-moon-lockbreaker-v1` printed 60 in that original source-seed group, with no tactical selection and unchanged **260-root capped** game. There are six development attempts across three phase repetitions and two contender decks, constituting **one original physical source-seed group**, not six independent matchups.

## The portable line is a full attacking policy, not an Item shortcut

The existing `chooseZeroEnergyStrandFloatStone` recognizes an unpowered, non-free-retreat Active that is stuck ahead of a funded Benched attacker with enough publicly projected damage to knock out the opposing Active. Its real Store root here used Float Stone on `Mimikyu GRI`, switched into a funded `Shadow Rider Calyrex VMAX CRE`, and used `Max Geist` to take the first two Prizes. The native opponent then used `Guzma` to expose underpowered `Dialga-GX` Active.

The independently enabled `chooseLateSeekerGuzmaPrize` subsequently found `VS Seeker PHF` in the acting candidate hand and actual `Guzma BUS` in its public own discard; its public additive-energy damage projection evaluated Max Geist at **160** with five Basic Psychic Energy in play. It returned `Guzma` through a genuine ChooseCardsPrompt, promoted the opponent's 100-HP `Garbodor BKP` (instead of 280-HP `Mega Absol ex`) and its own funded VMAX through real native prompts. The real Store then resolved one-Prize Max Geist KO followed by two more Max Geist attacks across turns 38 and 40, culminating in a three-Prize knockout of a damaged Mega Absol and the candidate win.

**The source actually played during this game**, and the final opponent turns passed or made nonattacking setup actions. The reported winner is native Twinleaf's engine-game-end winner. There is no proof that a stronger opponent bot with a different choice policy would have lost, nor that a competitive paper match would have resolved within the official clock.

## Reproduce and current design decision

- Runner: [`simulation/evaluation/agent31/portable-floatstone-seeker-guzma-aba.cjs`](../../../simulation/evaluation/agent31/portable-floatstone-seeker-guzma-aba.cjs). It reuses the sealed original physical `1101197735` seed, original Aichi 60, the same frozen common policy, and the existing public-only damage parsing plus native prompt bridges. It explicitly sets both tactic scopes to **null**.
- Manual pinned engine run: [successful Actions 42540820535](https://github.com/FlareZ123/experiment-01/actions/runs/42540820535), head `a6e89aebab7cc8cf4d6de99701fbe597dc2a7a2d`, exact original paper-printing translation and engine build pinned. Artifact `agent31-portable-joint-aba` includes all six native attempts and their failure-inclusive action histories.
- Strict native **8/8** tests of the underlying Guzma/VS Seeker tactics passed independently in [Actions 42539727682](https://github.com/FlareZ123/experiment-01/actions/runs/42539727682).
- Both recovery mechanisms are **default off**. The experiment enables the existing generic `actorZeroEnergyStrandFloatStoneRoot` for both seats and the new `actorSeekerGuzmaNominalKo` for both seats, without any frozen seat or turn trigger.

**Decision:** Promote this pair to an independently evaluated *policy candidate*, keeping the printed sixty identical and the shared selected policy unchanged. It is credible native evidence of a tactical weakness in the baseline bot and of a playable action chain which can reverse a whole game on the known source deal. It is not a representative original-source matchup win-rate estimate. The next admissible outcome should come from entirely new physical seeds across multiple original ranks and both candidate seats, with all native aborts/caps and source replies included and an actual paper-rule and clock-fidelity gate before any 99.5% claim.
