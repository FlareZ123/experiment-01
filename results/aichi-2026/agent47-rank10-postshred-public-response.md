# Agent 47: authentic rank10 post-Shred opponent response

**17 October 2026.** Source: exact published rank1 Shadow Rider (physical seat1) versus rank10 Regidrago (seat0) in `results/aichi-2026/full-decklists.json`. Pinned Twinleaf revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, seed `4246551499`. The existing source fork replaces root 215 Retreat with Mimikyu Copycat→Apex Dragon→Dialga-GX UPR Shred, burns the 20 `Math.random` calls measured in the original bot proposal, and retains all predecision source-zone digests. The [policy RNG audit](https://github.com/FlareZ123/experiment-01/actions/runs/39012103288) previously showed the direct and 20-draw-aligned Shred forks identical in compared post-fork Store projections.

## Observed actual root turn29 actions

A new public-only read observer ran in the existing [manual workflow 39013509102](https://github.com/FlareZ123/experiment-01/actions/runs/39013509102), source head `4e5dc27436f1c423ecb9d60dfb854c67e5984706`. The [archived JSON artifact 12094036159](https://github.com/FlareZ123/experiment-01/actions/runs/39013509102/artifacts/12094036159) records the source Board before each action. A second match without the observer produced an identical **full root Store dispatch trace**. Unrevealed hand, deck and Prize identities never appear in the public projection; complete-zone hashes support state equality.

| Real root ordinal | Opponent's action | Active before | Damage on Active | Attached Energy |
| ---: | --- | --- | ---: | --- |
| 231 | Retreat | Latias ex SSP (210 HP) | 200 | none |
| 232 | Pass | Dialga-GX UPR (180 HP) | 0 | none |

At the Pass, the Regidrago Bench comprised Latias ex SSP (200 damage, zero Energy), Regidrago VSTAR SIT (**one Grass Energy**), Tapu Lele-GX GRI (none), Wobbuffet PHF (none), and Regidrago V SIT (none). No Stadium or Pokémon Tool was active on that side. Three unrevealed hand cards and 17 deck cards remained; this report does not identify them.

**Printed-attack affordability at the observed Pass:** Dialga-GX and the four zero-Energy Benched Pokémon have attacks with strictly positive printed Energy costs. Regidrago VSTAR's Apex Dragon requires **Grass, Grass, Fire**, while the card had **one Grass**. Thus none of these six Pokémon had enough attached Energy to announce a printed attack at that checkpoint. Exact Pokémon costs were corroborated with the supplied English card database. This narrows the hypothesis of an obvious funded attack ignored *at the final Pass*. It does not test whether earlier turn29 draw, search, Energy attachment, attack acceleration or positional lines were available.

The observer's real source-zone hash was `a512b03755dddc50ed62022fcb075ac54e7198e202150e1d4db8341405525b86` before Retreat and `7e253a8d71679a9df3e05d1a0e4e2e6494eedd8d0fd936269c8e270b50f03c7e` before Pass. The exact same source Shred branch still recorded seat1 winner, 3/0 remaining Prizes, turn38. This remains a single deterministic simulator intervention with `sourceReplayMechanicsVerified:false`, `qualifiedForCompetitiveInference:false`, and zero qualified games.

### Next investigative question

Test concrete actions *before* the turn29 Retreat, preserving the authentic physical card zones, especially whether the generic respondent overlooked a search, attachment or acceleration route. The available printed-attack census at Pass cannot certify that the turn29 policy was strong.
