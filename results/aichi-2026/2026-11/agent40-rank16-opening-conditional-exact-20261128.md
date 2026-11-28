# Rank16 opening-access calibration: early Budew is a minority of legal seven-card hands

**Result class:** exact fixed-deck hypergeometric calculation on original Aichi rank16 source 60 (not a game, policy success, or native simulation). The 29-printing source is loaded from the corresponding rank16 policy's `SOURCE_INVENTORY`, not retyped into the calculator.

Run `node simulation/evaluation/2026-11/agent40-rank16-opening-lines-exact.cjs`; asserts in `tests/2026-11/agent40-rank16-opening-lines-exact.test.cjs`. All event counts are exact BigInt inclusion-exclusion and conditioned on a legal initial seven-card hand with at least one Basic.

| Event from opening seven | Favorable legal hands | Conditional probability |
|---|---:|---:|
| Any initial Basic (denominator) | 300,306,336 / 386,206,920 | 77.7579% raw |
| At least one Budew | 85,532,832 | **28.4819%** |
| Budew and Trubbish | 16,776,144 | 5.5863% |
| Budew, Trubbish and Float Stone | 5,275,304 | 1.7566% |
| **No Budew**, with Trubbish + Float Stone + either Quick Ball or Battle VIP Pass | 11,644,920 | **3.8777%** |
| **No Budew**, with any other Basic + Float Stone + Quick Ball or Battle VIP Pass | 39,740,253 | **13.2332%** |
| Union of opening Budew and the previous other-Basic/Float/search resources | 125,273,085 | **41.7151%** |

These *resource-presence events* are not statements that Item lock is actually established. They do not account for protected hand-card discard costs, Prize-card sequestration after the first seven, opponent disruption, first-turn action sequencing, remaining Bench and Tool slots, retreat locks, search availability, or how Item-locking attacks are announced. Other access lines via Ultra Ball, Secret Box, Trainer's Mail or later draws lie outside these events; therefore the 41.7% union is **not** a full-deck setup ceiling.

## Implementation decision changed

A rigid starting rule that only chooses Budew if initially visible can use the direct opening in only 28.5% of legal hands. In the additional 3.88% event with Trubbish + Float + Quick/VIP and no initial Budew, there is a distinct *possible* ALS:

`Trubbish Active -> Float Stone on Trubbish -> Basic search Budew onto Bench -> free retreat into Budew -> Itchy Pollen -> next-turn Garbodor evolves on already equipped Trubbish`.

This puts the Tool on a Pokémon which can become Garbodor, rather than consuming it on Mega Absol. The rank16 worker now:
- chooses Trubbish as its initial Active ahead of Mega when no Budew but Float + Quick/VIP are actor-visible;
- prefers Budew as the search target when a Float-enabled early pivot is available;
- prefers Float Stone on the current Active and the legal retreat into Budew before its first Item-locking attack;
- permits a last-Darkness Quick Ball discard in this urgent turn-one lock line, but otherwise preserves the manual attachment to an unfunded Mega.

A 2-seat synthetic 6-decision transition regression runs all these stages through the existing actor-only decision interface, while independent tests cover lack of mobility, Tool suppression, protected hands and lack of an available legal search path. **Neither the multistep synthetic example nor the exact opening math demonstrates the line's native legality or its match-win benefit.** A native owner-approved replay remains necessary for admission.
