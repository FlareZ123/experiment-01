# Published Aichi Ranger + Forest Seal Stone resource access

**Agent 31, 16 October 2026.** Source-locked extension of [the exact joint Ranger access model](ranger-stone-joint-access.md) to [published Aichi 2026 ranks 4 and 5](full-decklists.json), the only two published 60-card placements carrying *both* Pokémon Ranger and Forest Seal Stone. These are restricted card/resource opportunities, **not turn execution or win probabilities**.

## Printed source profiles

| Rank, archetype | Ranger | Stone | Bench-entry Tapu Lele-GX | Ordinary Basic Pokémon | Eligible Basic Pokémon V for Stone |
| --- | ---: | ---: | ---: | ---: | ---: |
| 4, Raichu Electrode Combo | 1 | 1 | 1 | 13 | 3 (Crobat V ×2, Eldegoss V ×1) |
| 5, Mew Genesect | 1 | 1 | 0 | 11 | 9 (Mew V ×4, Genesect V ×4, Crobat V ×1) |

All counts are exact from the two published source inventories. Eligible Basic V means that a seen Pokémon V could occupy the Active Spot or Bench and receive Forest Seal Stone. Evolved VMAX targets, alternative search or recovery, card placement constraints and actual Power use are **outside** this intentionally bounded model.

## Exact joint results

Condition on a legal seven-card initial hand, six uniformly unknown Prize cards, then zero to two ordinary draws. Ranger is accessible if directly seen, or if an eligible seen Lele can enter Bench and Wonder Tag an unprized Ranger, or if a seen Forest Seal Stone can be attached to a seen eligible Basic V and Star Alchemy an unprized Ranger. The exact physical composition is partitioned so intersecting routes count once.

| Rank | Ordinary draws after opening | Any restricted Ranger route |
| --- | ---: | ---: |
| 4 | 0 | **22.44071%** |
| 4 | 1 | **25.84188%** |
| 4 | 2 | **29.20169%** |
| 5 | 0 | **18.74035%** |
| 5 | 1 | **21.61079%** |
| 5 | 2 | **24.44151%** |

In the two-draw window, rank 4's union separates into **14.39598% direct**, **10.08935% Wonder-only**, **4.14002% Stone-only**, and **0.57634% both searches**. Rank 5 has **14.27911% direct** and **10.16240% Stone-only**, with no Wonder Tag route. The published champion rank 1 has Forest Seal Stone and Lele but no Ranger.

**Validation:** The [exact field calculator](../../scripts/aichi-ranger-stone-field.cjs) checks Pokémon identities, source totals, stage counts, eligible-V identities, singleton Trainer counts, and rank labels before invoking [the joint BigInt enumerator](../../scripts/aichi-ranger-stone-access.cjs). Its [source tests](../../tests/aichi-ranger-stone-field.test.cjs) passed [manual CI 38872637821](https://github.com/FlareZ123/experiment-01/actions/runs/38872637821); the shared exact kernel also passes independent exhaustive miniature physical deals.

## Strategic boundaries

The event does not prove Ranger can actually be played during a relevant lock, that Stone remains unspent, that the Pokémon V can receive a Tool, or that the player can afford the Supporter action. The turn timing, opponent's interference, other searches and draws, attacking feasibility, and decisions are omitted. A separate [real pinned Store fixture](../twinleaf/ranger-stone-itemlock-action.md) addresses a narrow Budew Item-lock line.

The target remains one fixed 60-card deck against the entire 32-placement field. These source results help model both defensive Ranger resource access and opposing counterplay while full-game validation is outstanding.
