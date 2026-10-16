# Joint Pokémon Ranger access: Wonder Tag + Forest Seal Stone

**Agent 31, 16 October 2026.** This calculation extends [the direct/Wonder Tag model](ranger-candidate-early-access.md) with the **Forest Seal Stone → Star Alchemy → Pokémon Ranger** route, using the original unchanged Hood Shield and Temple 60-card challenger inventories. The champion reference has no Pokémon Ranger. The result is an exact restricted *opportunity* measure, not successful Item-lock recovery or a win rate.

## Why this route matters

Each frozen challenger contains **four Shadow Rider Calyrex V**, **one Forest Seal Stone**, **one Tapu Lele-GX**, and **one Pokémon Ranger**. The normal first-turn / early-turn resource window can contain Ranger directly; an eligible Lele can be Benched to use Wonder Tag; or an available Stone can attach to a Pokémon V to use Star Alchemy. Under an attack-origin prohibition on Item *cards* such as Budew's Itchy Pollen, a Pokémon Tool is a separate Trainer type (Advanced Player's Rulebook B-02), so the Stone is a candidate access route even while Item use is forbidden. Whether the attacker can execute and benefit from that route under each *other* applicable lock still requires a real board test.

A naive addition of Wonder Tag and Star Alchemy probabilities double-counts hands containing both enablers. The new model partitions the mutually exclusive outcomes.

## Model

An accepted seven-card opening must contain a Basic. Deal six random Prizes from the remainder, then zero, one or two *ordinary* draws; conditioning on a valid opening uses exchangeability to sample the extra draws ahead of the unknown Prizes. The source-derived disjoint card categories are: Lele, Shadow Rider V, Ranger, Stone, other Basics, other cards.

- **Direct:** Ranger is among the seven plus ordinary draws.
- **Wonder Tag:** Lele has a legal Bench-entry opportunity: it was seen later with an already valid starting Basic; or it was in the opening seven with an *alternative* starting Basic; or there were two opening Lele copies. A singleton Lele forced Active cannot trigger its Bench-entry Ability.
- **Star Alchemy:** Forest Seal Stone and at least one Shadow Rider V are among the cards seen. A V can occupy the Active Spot or Bench; Stone, VSTAR allowance and the Pokémon's Tool slot are assumed usable.
- **Search:** If Ranger was not directly seen, its single physical copy must remain outside the unknown Prizes. Conditional probability of this is (47-d)/(53-d) after d additional ordinary draws.
- **Overlaps:** A hand enabling both searches counts as one successful opportunity.

Exact multivariate hypergeometric counts use BigInt numerator/denominator arithmetic. Three independent miniature-deck *physical-deal* enumeration tests and two invariant tests passed locally on Node 22. Full source-provenance and manual CI validation are separate gates; the combined [manual workflow 38871772651](https://github.com/FlareZ123/experiment-01/actions/runs/38871772651) subsequently passed all source loading, exact-model tests, and artifact upload.

## Exact results

Percentages condition on a valid opening seven. Table columns partition the mutually exclusive pathways.

| Deck | Extra draws | Ranger direct | Wonder only | Stone only | Both search routes | Any route |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Hood | 0 | 11.09540 | 8.26674 | 3.55343 | 0.35117 | **23.26674** |
| Hood | 1 | 12.77284 | 9.20212 | 4.30488 | 0.51326 | **26.79311** |
| Hood | 2 | 14.45029 | 10.04555 | 5.06191 | 0.71161 | **30.26936** |
| Temple | 0 | 11.14888 | 8.35175 | 3.46851 | 0.34278 | **23.31192** |
| Temple | 1 | 12.82531 | 9.29092 | 4.21845 | 0.50341 | **26.83809** |
| Temple | 2 | 14.50175 | 10.13762 | 4.97529 | 0.70064 | **30.31531** |

The prior **direct + Wonder** two-draw probabilities, 25.20745% Hood and 25.34001% Temple, are exactly recovered by **direct + Wonder only + both search routes**. Forest Seal Stone contributes an additional **5.06191** percentage points in Hood and **4.97529** in Temple from Stone-exclusive hands.

If **Wonder Tag alone is suppressed** and Stone is still usable, direct Ranger + Star Alchemy remains **20.22381% Hood** and **20.17769% Temple** after two draws. This last condition is hypothetical rather than an automatically valid assumption for every lock.

## What the model omits

No Item searches, Arven search, mulligan bonus draws, VS Seeker, opponent's actions, lock timing, prior Star Alchemy consumption, Tool attachment conflicts, Bench saturation, alternate strategic uses of Star Alchemy, missing Ranger due to discard/Lost Zone, or Supporter contention are modeled. Crucially, **Arven → Stone → Ranger cannot execute Ranger on the same turn when Arven was already played** under ordinary one-Supporter-per-turn rules. Forest Seal Stone can also be consumed earlier on an entirely different resource, making its mathematical access pathway strategically unrealistic later. The two later cards are deliberately *ordinary draws*, not a representation of a universal first-turn attack-response window.

The model does not automatically show that a playable Ranger removes the relevant persistent lock, or that the player can attack after doing so. It is a constrained resource ceiling useful for designing faithful full-match experiments.

**Reproduction:** [BigInt joint enumerator](../../scripts/aichi-ranger-stone-access.cjs), [independent physical-deal regressions](../../tests/aichi-ranger-stone-access.test.cjs), [source candidate inventories](candidate-hood-shadow-rider.json), [Tool classification in the supplied advanced rulebook](../../resources/advanced-players-rulebook.md), and [Forest Seal Stone printed-power scope](forest-seal-stone-ruling.md).
