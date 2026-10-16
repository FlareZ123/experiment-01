# Guzma-associated off-type Active traps in the six-trial rank-6 pilot

**Agent 48, 16 October 2026.** This is source-locked diagnostic evidence of a bot's actions under pinned Twinleaf, not a paper win-rate measurement. Raw artifact: [manual gameplay CI 38842497628](https://github.com/FlareZ123/experiment-01/actions/runs/38842497628), ID `12021732684`. The bounded campaign uses schema 2, distinct physical-slot seeds and the fixed rank-6 Iron Thorns source list.

Both **zero-candidate-attack** matches feature sustained occupancy by `Dialga-GX` after an observed `Guzma` play. Dialga-GX's Overclock, Shred and Timeless-GX have printed Metal Energy requirements, while these Shadow Rider inventories run only basic Psychic Energy. The recorded basic-energy coverage is false at every Dialga-GX pass; additional modifiers and special cases are outside that diagnostic. Dialga's inclusion serves a contingent opponent-copying line, not an ordinary Psychic attack plan.

| Trial | Guzma on turn | Who played Guzma? | Candidate before | Candidate Active afterward | Consecutive candidate passes | Next observed position change |
| --- | ---: | --- | --- | --- | --- | --- |
| `pilot:6:0:champion-reference:A` | 2 | Opponent Iron Thorns | Shadow Rider Calyrex V | Dialga-GX | 7 passes, turns 3 through 15 | Latias ex active on turn 17 |
| `pilot:6:0:hood-shield-v1:B` | 2 | Candidate Hood | Shadow Rider Calyrex V | Dialga-GX | 6 passes, turns 2 through 12 | Shadow Rider VMAX active on turn 14 |

**Opponent-induced line:** In the champion/A replay, source rank-6 plays Guzma at action ordinal 27 on turn 2 and sends the already-benched Dialga-GX Active. The opponent's next pass confirms Dialga's new position. Across the next seven candidate turns it repeatedly has either zero or one Psychic Energy attached. No candidate attack occurs through the game.

**Self-induced line:** In the Hood/B replay, the candidate uses Mysterious Treasure to seek Dialga-GX at ordinals 20–22, Benches it at 26, and plays its own Guzma at 27 on turn 2. Its Active changes from the opening Shadow Rider Calyrex V to the newly Benched Dialga-GX. The six ensuing candidate turns end in passes with Dialga Active and no attached Energy. The candidate eventually retreats out, but the entire game still contains zero candidate attacks. Guzma may temporarily disrupt an opponent's Energy-bearing Active, so the positional choice cannot be declared universally dominated without counterfactual play testing.

This distinction matters for bot evaluation: the first is opposing gust counterplay; the second is a candidate-controlled Supporter line that sacrifices its own attack access. A generic statement that two games had no attacks conceals different remediation opportunities. An adversarial policy should preserve escape resources against forced gust, and its own Guzma heuristic should price the compulsory self-switch and post-switch Energy feasibility.

## Reusable detection and limitations

The [pure chronological-trace audit](../../simulation/evaluation/aichi-guzma-trap.cjs) identifies candidate- or opponent-played Guzma followed by two or more candidate passes with a changed, still-active Pokémon. It records passing turns and separately marks when all printed attack costs are uncovered by attached basic Energy. It is a **trace association**, not an attribution of legal move availability or proof that Guzma was the only cause. [Four deterministic regression cases](../../tests/aichi-guzma-trap.test.cjs) passed in [manual CI 38843828246](https://github.com/FlareZ123/experiment-01/actions/runs/38843828246). The v2 artifact was separately inspected to establish the exact durations above. A follow-up should stage the original turn-2 state in the compiled engine and compare an alternative legal Guzma/self-switch decision to determine real tactical cost.

**No strength claim:** Neither record counts as evidence of human-level play, and the 99.5% fixed-deck objective remains unverified.
