# Exact original rank-5 last-Bench-slot Mew/Genesect donor: real native copied attack and Fairy Zone KO

**Agent8, 10 November 2026.** Constructed public-state Store fork using all 60 printed source cards unchanged, with actual ordinary owner PlayCardAction attachment and Cross Fusion Strike -> Techno Blast. **Native conditional tactical win demonstrated in both source seat orientations; zero qualified competitive games.** This report separates the staged mechanism from the natural-deal no-activation sample.

## Original printed source and game decision

Original rank-5 Yamato Nakano Mew/Genesect inventory is fixed by `results/aichi-2026/full-decklists.json` and original printed-60 SHA `a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05`. It has 4 Mew V FST, 3 Mew VMAX FST, 4 Genesect V FST, 1 Lillie's Clefairy ex JTG, 4 DCE SUM, 1 Crobat V DAA, 1 Dedenne GX UNB and zero Basic Psychic. The rank-10 original Regidrago V SIT supplies the defending Dragon target, 220 printed HP.

In each of two physical source orientations, stage the exact source 60 with:

- Source Active: Mew V FST evolved into Mew VMAX FST (310 HP); established on previous turn.
- Bench slots 0–3: Mew V, Mew V, Crobat V, Lillie's Clefairy ex. Final slot 4 is open. Clefairy ex's **Fairy Zone** makes the opposing Dragon Pokémon have Psychic Weakness (×2).
- The same source owner's private hand begins `[Mew V FST, Genesect V FST, Double Colorless Energy SUM]`. Its initial draw/prize/deck are physically completed using the remainder of the actual original 60. Opposing Active Regidrago V SIT has 220 HP, zero previous damage, zero Bench. Opponent's entire physical 60 is preserved too.
- The initial detached source-owned observation, card inventories, public board, hand order, stage turn, and active player are exactly equal between control and treatment. No artificial post-setup KO or manual Prize adjustment is injected.

Generic `chooseActorRootIntent` picks the **first** held Basic, redundant Mew V, for final Bench slot. The new default-off `mewGenesectBenchFirst` flag instead chooses critical Genesect V, when no Genesect V is in play. Both are actual legal native `PlayCardAction` Bench actions, and both arms attach actual DCE to the Active through native `PlayCardAction`.

After the resulting full Bench, the control's Cross Fusion Strike genuine `ChooseAttackPrompt` has two Benched Mew V donors and **no Genesect V**. In the treatment the prompt offers Benched Genesect V, whose **Techno Blast (210 damage)** attack object passes native `prompt.validate`, and the Store accepts the real `ResolvePromptAction` to copy Techno Blast. Both native player seats certify the donor-decision mechanism.

With Fairy Zone active, printed Techno Blast damage 210 is doubled by Psychic Weakness against the Dragon target to **420 before any other modifiers**, exceeding the target's 220 HP. Real native Store concludes with the opponent's Active removed, its Bench empty, the source's remaining Prizes **6 -> 4** and native winning seat equal to the source's actual physical seat in both orientations. This is a Store-observed tactical source win in a constructed position, rather than a full naturally dealt competitive game.

## Reproducible native evidence

- Code: `simulation/twinleaf/2026-11/agent8-original-rank5-lastbench-donor-native.cjs`.
- Pinned upstream Twinleaf: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Research adapter only, no upstream modification.
- Successful original two-seat full Store fork, [CI 42735855590](https://github.com/FlareZ123/experiment-01/actions/runs/42735855590).
- Successful two-seat preattack/native winner/prize trace, [CI 42736653297](https://github.com/FlareZ123/experiment-01/actions/runs/42736653297). Each arm had Mew VMAX 310 HP, original opposing Regidrago V SIT printed 220 HP and `[]` original weakness on its card, held DCE, real donor attack damage 210, Fairy Zone present and two source Prize cards taken after attack. The `0` damage counter reported on the postgame opponent Active is because that Pokémon had been Knocked Out and removed from Active, **not** a failed damage resolution.
- A separately staged **Fairy Zone removal ablation**, retaining original printed cards by substituting the source's own Dedenne for Clefairy in the Bench staging, is implemented as `fairyZone:false` in the same file. Native follow-up run status should be attached before any claim of its outcome.

## What can be inferred

1. The final Bench slot is a real consumable resource. A generic "first held Basic" can irrevocably consume the position necessary for Mew VMAX's next real copied attack.
2. Board-context opportunity cost is nonlinear. Genesect V is simultaneously a Fusion Strike System engine and a printed 210-damage attack donor. The copied attack becomes lethal against Dragon Pokémon only in the relevant Fairy Zone public-board state.
3. The realistic option needs actual held Genesect and appropriate evolution/DCE/Bench/attack constraints. More Mew V may be better in other states where Mew is missing, Genesect already exists, Ability lock applies, a donor is inaccessible, or the opponent's target does not justify the line. The implemented source policy chooses missing first role only and retains all native gates. This is a tactical decision helper rather than a proved global optimum.
4. The separate **frozen fresh 16-game** original-rank5 A/B [CI 42734378947](https://github.com/FlareZ123/experiment-01/actions/runs/42734378947) produced **zero** changed genuine Bench roots, all eight source/full physical pairs matched, and the source made 20 attacks in each arm. See [full fresh-game evidence](agent8-original-rank5-mew-genesect-bench-priority-native-v1-20261110.md). Natural collision frequency remains unmeasured, and the constructed fork must never enter that field sample's win numerator.
5. Baseline game was only advanced through attack-menu inspection, not through its alternative copied attack/terminal. No full-treatment-vs-control native winner delta is claimed for the staged fork, although the absent Genesect donor is directly confirmed.

**Qualification:** zero true paper games; zero new evidence that a fixed candidate 60 beats all 32 authentic opponents at 99.5%; 29/32 original inventories currently authenticated, ranks23/25/28 remain unavailable.
