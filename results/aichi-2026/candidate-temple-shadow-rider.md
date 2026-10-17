# Temple Shadow Rider v1: fixed 60-card hypothesis

**Agent 13, 16 October 2026.** [Printing-aware machine-readable candidate](candidate-temple-shadow-rider.json), derived from the Aichi rank-1 baseline with **different card quantities and three new functional names**. Every chosen printing appears in at least one of the 29 published Aichi lists. This supports event-era provenance but does **not** independently certify every Japanese Expanded rule or interaction.

## Human-playable 60 cards

### Pokémon (18)
- 4 Shadow Rider Calyrex V
- 3 Shadow Rider Calyrex VMAX
- 2 Lillie's Clefairy ex
- 1 Tapu Lele-GX
- 1 Wobbuffet (PHF 36)
- 1 Trevenant & Dusknoir-GX
- 1 Latias ex
- 1 Dialga-GX
- 1 Mimikyu
- 1 Girafarig
- 1 Marshadow
- 1 Radiant Eternatus

### Trainers (31)
- 2 Lillie's Determination
- 1 Iono
- 1 Teammates
- 1 Raihan
- 1 Acerola
- 1 Guzma
- 1 Pokémon Ranger (STS 104)
- 4 Mysterious Treasure
- 4 Fog Crystal
- 3 VS Seeker
- 1 Quick Ball
- 1 Hisuian Heavy Ball
- 1 Battle Compressor
- 1 Field Blower
- 1 Night Stretcher
- 1 Unfair Stamp
- 1 Float Stone
- 1 Forest Seal Stone
- 1 Sky Field
- 1 Dimension Valley
- 2 Temple of Sinnoh (ASR 155)

### Energy (11)
- 11 basic Psychic Energy

## Hypothesized strategic differences

**Special Energy denial.** Temple of Sinnoh makes attached Special Energy provide only Colorless Energy, removing other effects. Regidrago's Double Dragon Energy cannot contribute Grass/Fire while Temple applies, although regular Grass and Fire attachments, Stadium replacements, and other acceleration remain available. The candidate's own attached Energy are all basic Psychic, so this denial does not directly reduce their provided types. This is worth testing against all nine published Regidrago lists and three Iron Thorns placements, alongside the wider Special Energy census.

**Active Ability-lock interference.** Wobbuffet's PHF 36 Bide Barricade is active only while Wobbuffet is Active, and suppresses non-Psychic Abilities across play/hand/discard. It can interfere with opposing non-Psychic support Abilities and the Active Iron Thorns ex Ability, while the Psychic Shadow Rider VMAX Ability is exempt from Wobbuffet's own text. Mutual lock ordering must be verified by an actual state test. Wobbuffet also suppresses the candidate's Dragon-type Radiant Eternatus gate while Active, creating a real setup conflict. With only one Float Stone and a retreat cost of two, moving Wobbuffet out of Active is not guaranteed.

**Attack-derived Item lock response.** Pokémon Ranger can clear effects of attacks on each player, including temporary effects such as Budew's Itchy Pollen, when the Supporter is playable. It cannot itself overcome an Ability-based Supporter lock, and consumes the turn's Supporter play.

## Quantified opening and resource trade-offs

| Structural event | Rank-1 baseline | v1 candidate |
| --- | ---: | ---: |
| Basic Pokémon count | 14 | 15 |
| Initial-seven mulligan probability | 13.8591% | 11.7501% |
| Shadow Rider V in valid initial seven | 36.6179% | 45.2691% |
| Every Basic in a valid initial seven is Tapu Lele-GX or Radiant Eternatus | 9.7318% | 5.1381% |
| At least two VMAX remain outside six Prizes (ignoring other access constraints) | 99.7754% | 97.5745% |

The direct presence of Temple among a valid seven is **21.2358%**; after the mandatory first-turn draw, under uniform ordering, **24.2080%**. These are direct draws, before Trainer search or prize recovery. VMAX count 4 to 3 increases the chance that two or more VMAX are Prized, which can break a desired Radiant Eternatus line.

The candidate cuts one VMAX, one Tapu Lele-GX, one Sky Field, Carmine, and Tulip, each of which has strategic costs. Sky Field removal tightens Bench availability. Carmine removal reduces first-turn draw options; Tulip removal weakens recovery. Supporter contention may mean Pokémon Ranger cannot be used alongside Guzma or Raihan.

## Evidence and next gate

The [source-copy regression](../../tests/aichi_temple_candidate.test.cjs) checks a fixed 60-card inventory, exact printed event-source matches, and absence of exact identity collisions with the 29 available opposing lists. Passing that check is a necessary provenance step, **not proof of functional novelty over all print variants, event legality or improved match strength**.

Run two true-starting-seat stateful engine fixtures, verifying Temple versus Double Dragon Energy and Wobbuffet versus Iron Thorns Initialization. Then compare this list and the original rank-1 list under competent, shared decision policies against the available full field, while retaining ranks 23, 25 and 28 as missing. No measured win rate exists for v1.

**Exact Radiant-gate trade-off:** [Independent exact comparison](temple-radiant-tradeoff.md) finds v1 has 52.59209% direct Radiant access (baseline 52.20484%), but only **46.38691%** access with at least two fetchable VMAX still in deck (baseline **50.65944%**), a 4.27252 percentage-point decline. This is a serious quantified setup cost of cutting the fourth VMAX, before considering Wobbuffet's interference or matchup performance.

**17 October follow-up, distinct existing-list ALS:** In
[Wobbuffet + Latias free retreat](temple-wobbuffet-latias-als.md),
Agent 15 identifies a potential T2 zero-retreat transition from Active
Wobbuffet into an Energy-accelerated Shadow Rider VMAX under opposing
Iron Thorns Initialization. Latias ex is a Psychic Basic and stays
exempt from Wobbuffet's Bide Barricade, so its Skyliner may grant
Wobbuffet zero Retreat Cost even during lock; Underworld Door also
remains usable while the Psychic VMAX is Benched. Existing
[Agent42 pinned Store checks](agent42-wobbuffet-thorns-t2.md)
cover the lock and actual Underworld Door attachment, but the
**Latias retreat transition itself is still untested**.
Exact initial-seven/Prize/two-draw direct-resource chance for
Wobbuffet opening, Rider V by T1, VMAX+Latias+one Psychic Energy by
T2 is just **0.135038%** under no search/extra bonus assumptions.
With three directly seen Energy, it is **0.010122%**.
These restricted figures must not be interpreted as effective
turn-two rates or game wins. The unchanged Temple list already
contains every named piece; opponent Thorns can KO Wobbuffet early.
