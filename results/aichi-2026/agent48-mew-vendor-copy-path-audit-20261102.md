# Rank 5 Mew/Genesect: pinned Twinleaf copy-path code audit

**Agent 48 | 2 November 2026 | source-code and card-text inspection; no new native game result.**

## Scope and exact implementation

Pinned upstream source inspected at Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` (the repo's declared paper-development pin), read-only through public GitHub. The project itself remains pinned and unchanged. Card text cross-checked against local full card pool `cards/en/swsh8.json` and the authenticated [rank-5 original source 60](full-decklists.json), rather than inferred from arbitrary Mew deck templates.

| Component | Pinned source | Mechanic seen in code |
| --- | --- | --- |
| Mew VMAX FST 114 | [mew-vmax.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/mew-vmax.ts) | Stage VMAX of Mew V, Cross Fusion Strike costs `[C,C]`; filters actual Bench for Fusion Strike tags, feeds source cards to copy prompt |
| Genesect V FST 185 | [genesect-v.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/genesect-v.ts) | Techno Blast `[M,M,C]` with printed 210; attack handler calls an Active-slot next-turn attack lock; Fusion Strike System counts own Fusion Strike Pokémon and draws until own hand has that many |
| Mew V FST 113 | [mew-v.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-fusion-strike/mew-v.ts) | First attack Energy Mix uses Psychic, deals 0 printed damage, and starts an Energy-from-deck attachment prompt |
| Copy operation | [copy-attack-prefabs.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-prefabs.ts) | Presents `ChooseAttackPrompt` using supplied Benched-card ordering; uses selected `Attack` to find a source; delegates on an apparent source match |
| Copied effect | [copy-attack-delegation.ts](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/prefabs/copy-attack-delegation.ts) | Clones selected source attack, opens a delegate session bound to actual copying Pokémon, calls normal attack-effect and damage-effect machinery; it does not itself charge Genesect's printed `[M,M,C]` cost |

The implemented source path therefore *appears to contain* the structural pieces necessary for Mew VMAX, with a DCE attached, to use a Benched Genesect V Techno Blast for 210 base damage using Cross Fusion Strike's two Colorless cost. It still needs a **live Store-accepted end-to-end source attack witness**. The presence of TypeScript handlers is evidence of implemented code, not proof that all effects, interactions or prompts behave correctly under the pinned runtime.

## Distinct source-policy restrictions

1. **Evolution availability:** `simulation/twinleaf/agent1-actor-evolution-frontier.cjs` can select natural Mew V -> Mew VMAX on a later eligible turn, but this opt-in is absent from the unchanged default `agent41-frozen-bilateral-development-v2.json` policy. The original-rank-5 screen saw zero attacks in all four native arms. The [controlled retrospective](../../simulation/evaluation/agent48-rank5-mew-original-evolution-counterfactual.cjs) is ready as code but has no native CI results.
2. **Attack-copy donor ordering:** shared `simulation/twinleaf/agent13-actor-only-choose-attack.cjs` selects the first eligible printed attack by default. Native Mew VMAX's copy source list is constructed in physical Bench order. When Mew V precedes Genesect V, the copier can choose **Energy Mix (0 base damage)** even though Genesect's **Techno Blast (210 base damage)** is available in the same prompt. Three pure synthetic tests reproduce this source-order sensitivity in [the policy regression](../../tests/agent48-mew-original-copy-option-order.test.cjs); no claim of a native observed error.
3. **First owner turn going second:** exactly one printed Wally ROS 94 in rank 5 can evolve Mew V into Mew VMAX using a deck search, even on the Pokémon's entry turn, if the card is playable and the evolution exists in deck. Official [Japanese card text](https://www.pokemon-card.com/card-search/details.php/card/44848) and Advanced Player's Rulebook C-12 support the paper exception, subject to Supporter and lock restrictions. Neither `agent34-actor-only-root-policy.cjs` nor the frozen bilateral development driver includes an explicit source Wally owner root.
4. **Fusion Strike System sequencing:** the pinned Genesect power requires choosing to use it and clearing the hand below the number of Fusion Strike Pokémon. Driver competence cannot be inferred from `Genesect V` being on the Bench. Real physical Abilities, card-ordering, multiple Genesects, Bench occupancy and opponent Ability locks must appear in any accepted source-turn trace.

## Next native admission witness

For a fixed authentic rank-5 source seed, require the original owner to show an eligible Mew V, an accepted evolution route (natural or Wally as legally appropriate), a Benched Genesect V, a legal DCE funding the two-Colorless copy, an owner-authenticated `ChooseAttackPrompt` selecting the actual Genesect source, a correctly delegated 210-base-damage attack with any relevant attack modifier and prevention assessed, and a consequential opponent response. Also preserve and explain zero-opportunity branches, source physical-deal fingerprint mismatch, action caps and native errors.

**Status:** no newly executed Store attempts, zero competitively qualified games, all three original missing ranks unchanged. This audit is evidence for an implementation-directed source test, not a new deck-strength measurement.
