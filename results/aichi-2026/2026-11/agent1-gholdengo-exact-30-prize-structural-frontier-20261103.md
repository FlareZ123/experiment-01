# Newly available prize acquisition by hand size: Gholdengo 30C 108

**Agent 1 | 3 November 2026 | paper Expanded, current card pool | exact 60-card card-zone existence witness | ZERO competitive games, no candidate promotion**

## Question and verification

Is there an *unexplored win condition* that does not depend on dealing knockout damage against the same fixed 32 original Aichi 2026 opposing 60s? A scan of the attached complete card pool found **Gholdengo (30th Celebration / 30C 108, Japanese M6a 087)**. Its Stage 1 Metal `Celebration` costs **one Metal Energy** and reads: **if your hand contains exactly 30 cards, take two Prize cards; if you do, shuffle your hand into your deck**. It requires neither a damaged opponent nor damage calculation, and gives a direct Prize route even against a high-HP opponent. Its 130 HP and Stage 1 evolution requirement are major vulnerabilities.

Verifiable printed sources: [Pokémon official card](https://www.pokemon.com/uk/pokemon-tcg/pokemon-cards/series/30th/108/), [Limitless printing and Expanded / Expanded JP legality](https://limitlesstcg.com/cards/30C/108), and attached `card-list.zip` English `me55-108` / `me55-142`. The September 2026 expansion was released **after** the 10 May 2026 Aichi field event. It is usable for a **current-paper-Expanded deck versus the frozen historical opponents**; it was **not** a legal candidate to play at that earlier event. The research mandate is current paper Expanded Black & White onward; clarify the as-of date before using any retroactive field headline.

**Critical ban check:** The superficially stronger [Unown HAND LOT 91](https://limitlesstcg.com/cards/en/lot/91/formats), which wins immediately at 35 cards in hand, is **banned** in Expanded; it cannot be included as a legal alternative. Its absence from a raw card database would be a dangerous false assumption. Gholdengo itself and [Roxie CEC 205](https://limitlesstcg.com/cards/cec/205), [Exeggcute PLF 4](https://www.pokebeach.com/forums/threads/exeggcute-propagation-question.119787/), [Energy Search Pro SSP 176](https://www.limitlesstcg.com/cards/en/ssp/176), and [Firebreather PFL 89](https://limitlesstcg.com/cards/PFL/89) have affirmative source support. Exeggcute's Propagation can return each discarded physical Exeggcute; the 2013 TPCi FAQ quoted in the ruling thread explicitly permits recursing an Exeggcute after a new discard. This witness only uses each of its two copies once per owner turn.

## One complete illustrative 60-card multiset

This is a **deliberately fragile laboratory multiset, not a recommended final deck**. It is designed to expose a transparent hand-size mechanism and a catastrophic Prize-sensitivity failure. Source printings matter because different Gholdengo and Exeggcute cards share names.

| Category | Exact source card | Count |
| --- | --- | ---: |
| Pokémon | Gimmighoul 30C 81 | 4 |
| Pokémon | Gholdengo 30C 108 | 3 |
| Pokémon | Exeggcute PLF 4, Propagation | 2 |
| Supporter | Firebreather PFL 89 | 4 |
| Supporter | Roxie CEC 205 | 4 |
| Supporter | Arven SVI 166 | 4 |
| Item | VS Seeker PHF 109 | 4 |
| Item | Ultra Ball SVI 196 | 4 |
| Item | Pokégear 3.0 SVI 186 | 3 |
| Item | Professor's Letter BKT 146 | 2 |
| ACE SPEC Item | Energy Search Pro SSP 176 | 1 |
| Item | Switch SVI 194 | 1 |
| Basic Energy | Fire | 15 |
| Basic Energy | Metal | 2 |
| Basic Energy | Grass, Water, Lightning, Psychic, Fighting, Darkness, Fairy | 1 of each, 7 total |
| **Total** | | **60** |

No name violates the four-copy maximum, except Basic Energy which is exempt; exactly one ACE SPEC. The many deliberately inert Energy and Trainer cards in hand are useful as **hand-count ballast** for Celebration. That reframes the usual discard-capability/UDP intuition. However, deck/prize/matchup draw and hand reset risks are severe.

## Deterministic physical-zone execution

The executable minimal CommonJS test is [tests/agent1-gholdengo-thirty-hand-zone-witness.test.cjs](../../../tests/agent1-gholdengo-thirty-hand-zone-witness.test.cjs), committed at [d93bb879](https://github.com/FlareZ123/experiment-01/commit/d93bb879f72a262a5868520da0b866df4842da68). It explicitly tracks each of the **60 physical unique IDs** across deck, hand, six Prize cards, discard, evolution stack and attachments, checking conservation at every successful transition. It enforces Stage 1 evolution no earlier than owner turn 2 and only one Supporter each turn. This is a **selected physical ordering and opponent Passes**, not random games, an artificial no-interaction engine, a competitive opponent policy, or actual Twinleaf Store validation.

A particularly favorable opening seven is exactly **one Gimmighoul, both Exeggcute, three Roxie, and the ACE SPEC Energy Search Pro**. Start Gimmighoul as the *sole* Active, no Bench; six randomly unknown Prizes are artificially selected to all be Fire Energy; arrange the first 21 ensuing normal/Roxie draws to contain no Basic Energy and the very first draw to be Gholdengo. The opponent does not attack. This construction intentionally removes the usual K0 uncertainty by choosing the full deal in advance.

| Owner turn and action | Cards in hand afterward |
| --- | ---: |
| Set Active Gimmighoul from opening 7 | 6 |
| Turn 1: draw one | 7 |
| Turn 1: Roxie discards both Exeggcute, draws six, each Exeggcute propagates back | **12** |
| Turn 2: draw one, then evolve to Gholdengo (legal because Basic was in play before this turn) | 12 |
| Turn 2: same one-Roxie, six-draw, two-Egg recovery action | **17** |
| Turn 3: draw one, repeat Roxie and Egg recovery | **23** |
| Turn 3: Energy Search Pro leaves hand, adds nine distinct Basic Energy types from remaining deck | **31** |
| Turn 3: attach a physically searched Basic Metal Energy from hand to Active Gholdengo | **30** |
| Turn 3: use printed `Celebration` attack, take two actual Prize cards | **32** before shuffle |
| Mandatory `Celebration` hand-into-deck shuffle | **0**; Prize cards now four |

This exactly resolves a **two-Prize effect on turn 3** for one chosen, favorable, paper-plausible physical sequence. There is no opponent setup/attacks and no strategic win; the user-visible 99.5% claim remains wholly unsubstantiated. Gholdengo has only 130 HP and begins with a 60-HP Basic as the *sole* Pokémon, so a real opponent can simply Knock Out the sole Active before evolution and win. Even a completed first Celebration empties its own hand and shuffles its two just-taken Prize cards back into the deck, heavily complicating the second and third Prize events.

## Falsification, Prize collapse, chance of this specific opening

A second witness changes **one Prized Fire** into **one Prized singleton Grass Energy**, holding all other scripted ordering/actions fixed. Energy Search Pro can then access only **eight distinct types**, the hand becomes **29**, `Celebration` takes **zero** Prizes and the attack ends. This is a genuine fragility of the *exact demonstrated sequence*, not proof that every alternate hand-filling line must fail when Grass is Prized. An Ability-suppression counterexample prevents both discarded Exeggcute returning and immediately breaks the same repeated-Roxie script. Other tests enforce Supporter contention and the no-first-turn-evolution condition.

The precise precommitted seven-card composition alone, **ignoring all later selected cards and opponent actions**, has unconditional chance

```text
P(open 1 of 4 Gimmighoul, both of 2 Exeggcute,
  3 of 4 Roxie, 1 of 1 Energy Search Pro)
= C(4,1)*C(2,2)*C(4,3)*C(1,1) / C(60,7)
= 4.142856891326546e-8
```

This is roughly one such exact composition per **24 million** uniform initial seven-card hands. Under that particular opening, all six chosen Prize cards being Fire Energy has additional conditional probability **0.00021801173299508482**; the intentionally selected ensuing non-Energy draws make the full exhibited sequence rarer still. These values measure **one illustrative hand-script event only**, not a win rate, not an upper bound on *all* hand-30 routes, and not a Monte Carlo estimate of the archetype's strength.

## Test and next gates

- [Manual CI 41709978571](https://github.com/FlareZ123/experiment-01/actions/runs/41709978571), head `c99b192895e631611ff8bb300dcfcea61e798a8a`, completed **SUCCESS**: the existing cheap archived bridge audit's pure Node test step passed **44/44**, including five new physical Gholdengo test cases. The separately archived rank17 Compressor digest was also checked, **without** rerunning any new native Pokémon games.
- Integration in existing manual CI: [c99b192](https://github.com/FlareZ123/experiment-01/commit/c99b192895e631611ff8bb300dcfcea61e798a8a). The test is self-contained and has no external libraries or runtime writes.
- This construction is an **existence/counterexample result**, not selected best-60 evidence. It deliberately places most Energy in deck and gives Roxie three Supporter slots in a row, forces an astronomically rare seven and Prize distribution, ignores normal opposition, and includes no Player 2 interaction.
- Falsifiable next research: determine a **realistic hand-30 first-attack frequency** with a competitive 60, unbiased first-turn and full six-Prize sampling, explicit trainer/item/ability locks, faithful Stage 1 timing, damage/KO, the exact card availability and performance of three subsequent Prize acquisitions. An enabled production policy would need an actual paper-legitimate full Store interaction, two-sided opponent play, and all-32 target coverage. A single rare card-zone witness is insufficient to replace the existing candidate decision board.

**Collective objective unchanged:** 29 of the 32 original May 2026 field sixties authenticated (23/25/28 missing), no fixed 60 selected, no competitively qualified games, and no demonstration of the 99.5% target.
