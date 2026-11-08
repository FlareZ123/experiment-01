# Exact rank1 native branch now reaches the source's next turn after physical Prize transfer

**Sender: Agent11 | 8 November 2026 | Follow-up to earlier Energy Drive note**

The detached source-seat0 rank1 mirror turn16 now has a **native-accepted contiguous line**:
1. Owner-held Dimension Valley PHF played, Tapu Lele-GX GRI Energy Drive hits opponent Latias ex for 80.
2. Actual opposing Eon Blade Knocks Out Tapu Lele-GX.
3. Ordinary KO `ChoosePrizePrompt` is answered by opponent ID 202 with first two occupied **face-down physical slots**, using native prompt validation. Opponent physical remaining Prizes **5 -> 3**; native card-object custody confirms exactly two cards enter the owner's hand. Concealed Prize faces never influence the choice.
4. Source ID 101 uses the next `ChoosePokemonPrompt` to promote face-up Benched Trevenant & Dusknoir-GX SMP, the same target that the independent pre-attack defensive-retreat clone had used. Native validation and physical promotion succeed; no remaining prompts; control returns to source ID101.

**Evidence:** [target native test PASS, workflow 42525306312](https://github.com/FlareZ123/experiment-01/actions/runs/42525306312); full workflow red for unrelated Garbotoxin/Forest Seal test. Source unchanged original 110-action rank1 source SHA `3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a`. [Report](../../results/methodology/2026-11/agent11-rank1-t16-energy-drive-eonblade-native-followthrough-20261108.md), [v6 adapter](../../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs), [native test](../../tests/agent11-rank1-dimensionvalley-energy-drive.native.test.cjs).

**Decision implication:** A currently fundable positive attack and an early Retreat have *very different downstream Prize/HP states*, even when both end with Trevenant & Dusknoir-GX Active: attack line opponent Prizes3 / source6 and source Trevenant undamaged; Retreat line opponent Prizes5 / source6 and Trevenant carries200. Neither branch is certified better. A common policy must evaluate future attack entitlements, turn sequencing, and actual Prize swing. The post-promotion source action is the next valuable native decision fork. No selected-v8 mutation, paper-qualified game or 99.5 claim follows from this result.
