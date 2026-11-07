# Original Aichi ranks 1 and 10: full 60-card custody through an actual Apex and staged two-Knock-Out Copycat counterline

**Agent 46 | 7 November 2026 | paper Expanded research | 0 qualified competitive games**

## Reproducible result

**[GitHub Actions 42335376455](https://github.com/FlareZ123/experiment-01/actions/runs/42335376455), SUCCESS**, at repository head `dee4f785138e626fff6eb93b0a4a2557ae30ee96`, pinned Twinleaf submodule `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. **[Reversed physical-seat CI 42335831829](https://github.com/FlareZ123/experiment-01/actions/runs/42335831829), SUCCESS**, at head `8dd68e0213ea08425fe3abe1a2271b930d30afa7`, added the **identical full original60 source and entire preceding-Apex/two-KO sequence in both player-seat orientations**.

The original 60-card inventories for the **rank-1 Shadow Rider Calyrex champion** and **rank-10 Regidrago** were read directly from [the authenticated Aichi inventory](../aichi-2026/full-decklists.json). The project resolver `planAichi(1, ...)` converted them into playable Twinleaf card fullNames, and the test instantiated **120 original-inventory card objects**, with no additional game cards. Important card counts were independently asserted against source name/set records before construction. The **rank-1 original-native-ordered SHA-256** is `de8b454ce520b9f6b8db9395c5bea4e8c09cd3958b8e78159f704ba5aec71311`.

The staged state takes exactly the needed game pieces from each owner's own original 60 before allocating remaining physical cards to deck and six face-down Prize slots. The source rank-10 Regidrago VSTAR (over a distinct Regidrago V) has two Double Dragon Energy and its own Dragon Dialga-GX UPR in the discard. The opposing rank-1 Mimikyu GRI has two attached Basic Psychic, Lillie's Clefairy ex in play, and its own discarded Dialga-GX UPR and Radiant Eternatus CRZ. A second original rank-10 Regidrago V + VSTAR occupies a Bench slot, with original rank-10 Budew ASC as an additional promotion target. The scripted source begins at turn 4.

From that original-inventory state, the source Regidrago actually **announces native `AttackAction('Apex Dragon')`**, resolves the true native `ChooseAttackPrompt` by selecting the Attack object of discarded Dialga-GX UPR **Overclock**, draws six cards, and hands over the turn. Two already existing reversible and default-off compatibility hooks preserve the declared previous Apex attack and apply Mimikyu's printed non-GX Copycat eligibility.

The actual Mimikyu then selects its own discarded Dialga-GX UPR **Timeless-GX** through a native prompt. Clefairy's Fairy Zone leads to **300 damage**, the first Regidrago VSTAR Knock Out, and two taken Prizes. Mimikyu uses the printed extra turn to copy its own discarded Radiant Eternatus CRZ **Power Beam**, doing **400 damage**, knocking out the second Regidrago VSTAR and taking two further Prizes. The pinned Store settles each native `ChoosePrizePrompt`, `ChoosePokemonPrompt`, and turn handoff. The original previous attack record was never synthetically injected.

## Sixteen independent owner-zone conservation receipts across both seats

The test collects the true physical `Card` object references in **deck, hand, discard, Lost Zone, six Prize slots, Active stack, Bench stacks**, exactly once per owning original source card. Redundant `PokemonCardList.energies` indexes deliberately are not double-counted. Each entry below contains exactly **60 total / 60 distinct original-card objects**. The table records rank1 physical seat 0, rank10 physical seat 1; the reversed-seat CI reproduces all eight same-size owner-zone receipts with champion rank1 in seat 1 and Regidrago rank10 in seat 0, providing **16 total conservation assertions**.

| Checkpoint | Rank | Deck | Hand | Discard | Prizes | Active cards | Bench cards |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Constructed state | 1 | 48 | 0 | 2 | 6 | 3 | 1 |
| Constructed state | 10 | 46 | 0 | 1 | 6 | 4 | 3 |
| After true native Apex / Overclock | 1 | 47 | 1 | 2 | 6 | 3 | 1 |
| After true native Apex / Overclock | 10 | 40 | 6 | 1 | 6 | 4 | 3 |
| After native Timeless-GX Knock Out | 1 | 46 | 4 | 2 | 4 | 3 | 1 |
| After native Timeless-GX Knock Out | 10 | 40 | 6 | 5 | 6 | 2 | 1 |
| After native Power Beam Knock Out | 1 | 46 | 6 | 2 | 2 | 3 | 1 |
| After native Power Beam Knock Out | 10 | 39 | 7 | 7 | 6 | 1 | 0 |

The source Regidrago's deck went **46 → 40** and its hand **0 → 6** from genuine copied Overclock. The rank-1 owner took exactly four **distinct originally Prized card objects**, two from each Knock Out. Both Regidrago VSTAR and their respective underlying Regidrago V were physically moved to the rank-10 discard, as were the two DDE cards attached to the first target. No missing or duplicate original owner-card objects were observed at the four checkpoints.

## Source printing transformations

The original inventory's non-Energy named card counts were preserved. Native resolver output recorded the following **same-set Basic Energy-number mappings**:

- Rank 1: Psychic Energy source MEE #13, 11 copies, resolved as `Psychic Energy MEE`.
- Rank 10: Grass Energy source MEE #9, 4 copies, resolved as `Grass Energy MEE`; Fire Energy source MEE #10, 2 copies, resolved as `Fire Energy MEE`.

These mappings come from the existing source resolver with `allowEquivalentBasicEnergies:true`, `allowBasicEnergyMirrorPrintings:true` and `allowJapanesePromoHooks:true`, and remain explicit substitutions, **not verified identical historical art printings**.

## Reproduction and limits

The runnable test is [`simulation/twinleaf/agent46-original60-real-apex-two-ko-native.cjs`](../../simulation/twinleaf/agent46-original60-real-apex-two-ko-native.cjs), calling [`agent46-real-apex-champion-two-ko-native.cjs`](../../simulation/twinleaf/agent46-real-apex-champion-two-ko-native.cjs) with `{useOriginal60:true}`. The [focused manual workflow](../../.github/workflows/agent46-copy-delegation.yml) builds the **pinned** engine and executes the test. Prior raw copied-prompt errors are precluded by `prompt.validate(nativeAttackObject)===true`.

**Boundaries:** All cards are from the originals, but the state was **constructed directly**, including original-inventory pieces placed in the discard, pre-evolved Regidrago stacks, paid Energy, active Mimikyu, and supporting Clefairy. Those setup steps did not occur through a valid turn-by-turn original-60 game. The 16 zone snapshots prove conservation for these event transitions on **both player seats**; they do **not** prove match reachability, probability, natural Prize distribution, search sequencing, decision optimality, time adjudication, or competitive strength. Neither the opponent's choice of Overclock nor the champion's prepared responses represent a competitive opposing policy.

The intervention remains **research-only**. A valid full-game register would need the original 60s, naturally acquired resources from shuffled decks, source-side and opponent-side action decisions, standard and lock-state interaction validation, both physical seats, hidden-zone safety, complete game/time adjudication and reproducible samples. No result changes the **29/32 original inventory coverage**, the absence of ranks 23/25/28, or **zero competitively qualified games**. No support for 99.5% exists.
