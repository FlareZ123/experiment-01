# Aichi Top32: Stadium coverage in the 29 complete lists

**Status:** static source-list audit only. It does not establish which Stadium was active in a game.

## Question

Which high-impact Expanded Stadiums identified by the Agent42 census occur in the 29 authenticated Aichi Open League 2026 Top32 lists, and which parts of the Hood candidate policy must account for them?

## Source and method

- Field source: `results/aichi-2026/full-decklists.json` (29 complete 60-card lists).
- Stadium effect taxonomy: `scripts/agent42-expanded-stadium-effect-census.py` and Agent42's review at `results/aichi-2026/2026-11/agent42-source-field-stadium-weakness-census-20261114.md`.
- Exact printing IDs/counts are taken from the source decklist registry. This report is a decklist occurrence scan, not an in-game Stadium-frequency estimate.

## Stadiums found

| Stadium | Rank(s) and source counts | Policy-relevant effect |
|---|---|---|
| Sky Field ROS 89 | #1 ×2; #4 ×3; #5 ×2; #14 ×1; #18 ×3; #19 ×3; #30 ×3 | Bench capacity changes. Full Moon Rondo uses the **actual combined Bench count**, not the maximum capacity. |
| Dimension Valley PHF 93 | #1 ×1 | Reduces Psychic Pokémon attack costs by one Colorless. Relevant to Max Geist, Copycat and Full Moon Rondo. |
| Temple of Sinnoh ASR 155 | #3 ×1; #8 ×2; #11 ×2; #16 ×2; #22 ×2 | Special Energy provides only Colorless while active. It can remove Psychic units from Telepathic or other Special Psychic Energy for Max Geist scaling and can change attack payability. |
| Wondrous Labyrinth ◇ TEU 158 | #6 ×1; #24 ×1; #29 ×1 | Adds one Colorless to attacks of non-Fairy Pokémon. Candidate Psychic attackers are non-Fairy; this can make Max Geist, Copycat and Rondo more expensive. |

No Pokémon League Headquarters printing appears in the 29 complete lists. Agent42's wider Expanded Stadium census identifies it as a +Colorless cost modifier for Basic Pokémon; it remains relevant to Mimikyu Copycat / Clefairy Rondo in the broader Expanded pool and must not be treated as absent from all possible field variants.

The other high-impact Stadiums in the Agent42 census do not appear in these 29 lists. The three missing ranks 23, 25 and 28 may add further Stadiums.

## Candidate-policy implications

1. **Use the current Stadium, not the deck's Stadium counts.** The source lists show what each player can play, not what is in play at a given decision.
2. **Sky Field:** compute Full Moon Rondo from the actual `ownPublic.bench.length + opponentPublic.bench.length`. Do not use the default five-Bench cap or Sky Field's eight-Bench capacity as if all slots were occupied.
3. **Dimension Valley:** use the Stadium-aware public attack-cost evaluator. Max Geist's three-Colorless cost becomes two; Psychic+Colorless attacks can also become cheaper.
4. **Wondrous Labyrinth:** add the Colorless cost for non-Fairy attackers or fail closed. It affects candidate Psychic attackers; it is not a harmless Stadium.
5. **Temple of Sinnoh:** Special Energy units must be evaluated under the Stadium. The current `energyUnits` helper documents that it does not itself apply global Special-Energy suppression; do not count Telepathic Psychic Energy as Psychic while Temple is active.
6. **Pokémon League Headquarters:** even though it is absent from the 29 lists, it is Expanded-legal and adds one Colorless to Basic Pokémon attacks; Mimikyu Copycat and Clefairy Rondo are affected, Shadow Rider VMAX Max Geist is not.
7. **Unknown Stadium:** the owner-visible policy should abstain from damage/payability claims if an unmodeled Stadium can change attack cost, damage, Weakness, Retreat, or Prize conversion.

## Limitations

- Only 29/32 source lists are complete. Missing ranks 23, 25 and 28 remain unknown.
- The event is Japanese Extra and the 32-field is not uniformly paper-Expanded-legal; existing scope audit identifies ranks 3, 6, 7, 24 and 29 as Extra-only incompatible.
- Stadium counts in decklists do not establish that a Stadium was drawn, played, or active in any observed game.

## Reproduction

Parse `results/aichi-2026/full-decklists.json` and match the exact Stadium names/printings above. Compare with `scripts/agent42-expanded-stadium-effect-census.py`; do not infer active Stadium state from deck composition.
