# Agent 29: Rank-31 Dusknoir/Chimecho Grand Tree direct-opening opportunity

**Scope:** 16 October 2026. Source is the published rank-31 list (Yuhi Yokoyama) in [full-decklists.json](full-decklists.json), whose card printing rows were cross-checked against the bundled English card snapshot. This is an exact probability model of a narrowly specified **resource opportunity**, not a T2 attack, self-KO, completed lock, or game-winning line.

## Printed mechanism

The rank-31 list contains 3 Duskull (PRE 35), 3 Dusclops (PRE 36), 3 Dusknoir (PRE 37), one older Dusknoir (BCR 63), and one Grand Tree ACE SPEC (SCR 136). The two Dusknoir printings are strategically distinct:

- PRE 37 **Cursed Blast** places 13 damage counters on one opposing Pokémon, then Knocks Out the user's Dusknoir.
- BCR 63 **Sinister Hand** can repeatedly move an opponent's existing damage counters between that opponent's Pokémon. It does not supply the PRE damage or self-KO.
- Dusclops PRE 36 **Cursed Blast** places five damage counters and Knocks Out itself.
- Grand Tree evolves an eligible Basic through a Stage 1 and then a Stage 2 from the deck, subject to normal turn-in-play restrictions, and is available to both players.
- Chimecho CIN 43 **Bell of Silence** applies an opponent-player restriction on playing Pokémon with Abilities from hand next turn.
- The deck also has Koffing CEC 76 and four Roxie, enabling damage-counter placement after Roxie's draw effect under printed conditions, plus three Telepathic Psychic Energy (POR 88) that can Bench Basic Psychic Pokémon when attached from hand. These are separate access and sequencing channels.

The list has **15 Basic Pokémon**, including three Duskull, and 12 other Basics. It has 38 cards outside the grouped Duskull/other Basics/PRE Dusclops/PRE Dusknoir/Grand Tree categories.

## Exact event and method

The [enumerator](../../scripts/aichi-dusknoir-grand-tree-opening.cjs) tracks the genuine setup partition: initial seven-card hand, six face-down Prizes, first turn's single draw, second turn's single draw, and the final 45-card searchable deck. The event is the conjunction of:

1. At least one Basic in the original seven (a non-mulligan opener).
2. At least one Duskull in the original seven or first-turn draw, so it could have entered play before T2.
3. Grand Tree directly in hand by the second-turn draw, without any search effect.
4. At least one PRE Dusclops and one PRE Dusknoir still **in the deck** after both draws and the unknown Prizes, so Grand Tree can find both.

An exact multivariate hypergeometric calculation separates Grand Tree's location in the initial hand, first draw, and second draw. It enumerates original-hand category counts and the first draw where applicable; inclusion-exclusion then computes Stage 1/Stage 2 survival among 45 searchable cards. All six Prize cards are allowed to land anywhere. The [regression suite](../../tests/aichi-dusknoir-grand-tree-opening.test.cjs) checks the fixed source printing and compares the exact results to independent seeded 60-card Fisher-Yates samples.

| Grand Tree location | Unconditional probability contribution |
| --- | ---: |
| Initial seven | 3.564321% |
| Player's first turn draw | 0.523575% |
| Player's second turn draw | 0.577175% |
| **Total joint event** | **4.665071%** |

A 15-Basic deck has a valid initial seven with probability **88.249921%**, so the resource event occurs with probability **5.286204% conditioned on a valid opener**. This is before any accepted opponent mulligan bonus draws.

## Interpretation and limitations

The estimate is deliberately restricted to direct draws, so it excludes Fog Crystal, Buddy-Buddy Poffin, Quick Ball, Telepathic Psychic Energy and any other Basic-search path to establish Duskull. It also excludes Stadium Nav, PokéStop and other draw/search routes to Grand Tree, along with recovery, Stadium replacement, Grand Tree use by the opponent, Ability suppression, Benching constraints, Supporter contention, deck search knowledge and subsequent self-KO Prize consequences.

Grand Tree can accelerate the PRE line from a prepared Duskull without pre-drawing Stage 1 or Stage 2, but **the 5.286204% event does not measure how often the deck can realistically evolve on turn two**. Future models should add search chains and actual evolving Basic access, then evaluate a qualified opposing lock-response policy under correctly implemented abilities.

This is one genuinely different archetype in the Aichi field and deserves representation in the comparative pilot, even though the benchmark runner's generic bot policy remains unqualified.
