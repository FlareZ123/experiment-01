# Regidrago VSTAR damage threshold: Shadow Rider Max Geist + Fairy Zone

**Agent 11 · 25 November 2026**

## Finding

The registered Hood Shield Shadow Rider v1 has a deterministic, non-Copycat damage route against Regidrago VSTAR: Shadow Rider Calyrex VMAX's Max Geist reaches a one-hit Knock Out at **five Psychic Energy attached across the candidate's Pokémon** while Lillie's Clefairy ex's Fairy Zone is active.

This is a card-text calculation and a candidate-list observation, **not** a demonstrated matchup result or a win-rate estimate.

## Source facts

The registered 60-card list is `results/aichi-2026/candidate-hood-shadow-rider.json`. Relevant counts:

- Shadow Rider Calyrex V ×4 and Shadow Rider Calyrex VMAX ×4.
- Lillie's Clefairy ex JTG 56 ×2.
- Basic Psychic Energy ×11.
- Dimension Valley ×1 and Sky Field ×1.

The pinned local card pool provides the following card text:

- `resources/cards/en/swsh12.json`: Regidrago VSTAR SIT 136 is a 280-HP Dragon Pokémon.
- `resources/cards/en/swsh6.json`: Shadow Rider Calyrex VMAX CRE 75 has Max Geist, which does (10 + 30E) damage, where (E) is the number of Psychic Energy attached to **all of your Pokémon**. Its Underworld Door Ability can once during your turn attach a Psychic Energy from hand to one of your Benched Psychic Pokémon, then draw 2 cards.
- `resources/cards/en/sv9.json`: Lillie's Clefairy ex JTG 56 has Fairy Zone: the Weakness of each opponent's Dragon Pokémon in play becomes Psychic, with Weakness applied at ×2.

The formula uses the candidate's own attached Psychic Energy count; the copied/printed Energy cost of Max Geist does not determine its damage.

## Derivation

Let (E) be the total Psychic Energy attached to all candidate Pokémon.

With Fairy Zone active against Regidrago VSTAR:

[
D(E)=2(10+30E)
]

| Psychic Energy attached (E) | Max Geist before Weakness | Effective damage with Fairy Zone | Result vs 280 HP |
|---:|---:|---:|---|
| 3 | 100 | 200 | Short |
| 4 | 130 | 260 | Short |
| **5** | **160** | **320** | **Knock Out** |
| 6 | 190 | 380 | Knock Out |

Therefore the minimum integer threshold is:

[
2(10+30E)ge 280
quadLongrightarrowquad
Ege leftlceilrac{130}{30}ightceil=5
]

Without Fairy Zone, the threshold is nine Psychic Energy: (10+30(8)=250), while (10+30(9)=280). Fairy Zone therefore reduces the damage threshold from nine to five attached Psychic Energy.

A +30 HP effect raises Regidrago to 310, which is still within the 320 damage at (E=5). HP increases above 40, damage reduction, or Weakness prevention can change the threshold; this report does not assume those effects are absent in every list or board state.

## Energy-acceleration ceiling (not a setup probability)

Each Shadow Rider Calyrex VMAX in play has its own Underworld Door use for the turn. If (n) VMAX are in play and their Abilities are usable, the candidate can attach up to (n) Psychic Energy from hand through Underworld Door during the turn, plus its normal manual attachment. With four VMAX in play, that is a theoretical ceiling of five attachments in one turn, provided five Psychic Energy are available in hand. The attack's damage counts Energy attached to all candidate Pokémon, so the Underworld Door attachments need not all land on the eventual attacker.

Dimension Valley can reduce the attack cost of a Psychic Pokémon by one Colorless Energy; this affects the ability to declare Max Geist, not its damage formula. The candidate's Sky Field increases Bench capacity, but the full four-VMAX board still requires a substantial setup and evolution sequence.

## Interpretation and limitations

This line is independent of the single Mimikyu and single Dialga-GX UPR 100 required for the separate Mimikyu Copycat → Apex Dragon → Timeless-GX hypothesis. It therefore offers a second possible Regidrago answer when one of those single-copy pieces is Prized. It is **not** independent of Fairy Zone remaining active, Shadow Rider's Energy acceleration being usable, and the candidate assembling a large Psychic Energy board.

The exact field-pressure report `results/aichi-2026/2026-11/agent17-hood-shield-field-pressure-risk-20261117.md` identifies Tool removal, Tool suppression, and Energy denial across the Aichi field. Those pressures can disrupt Stealthy Hood protection, Underworld Door, or the five-Energy threshold. The actual probability of assembling five Energy before the opponent's decisive turn remains unmeasured.

This calculation should be included in later Regidrago matchup modeling alongside the Copycat/Apex line, not treated as proof that the matchup is favorable. No simulator game, fixture, matchup sample, or deck change was performed. The fixed 60-card list is unchanged.


## Prize-only availability (not a matchup probability)

For two copies of Lillie's Clefairy ex in a 60-card deck with six Prizes, the probability that **both** copies are Prized is:

[
P(	ext{both Prized})=rac{6}{60}cdotrac{5}{59}
=rac{1}{118}approx0.8475%.
]

**Correction (Agent31, 2026-11-25):** This is the probability that both Clefairy copies are Prized, not the probability Fairy Zone is inaccessible. The registered list also contains one Hisuian Heavy Ball ASR 146, which can recover one Basic Pokémon from Prizes. Hard Prize-only denial of Fairy Zone requires both Clefairy copies and Heavy Ball all Prized. The raw six-Prize-subset probability is **0.058445%**; conditioned on a legal seven-card opening for this 14-Basic list, it is **0.056203%** (63813/113540416), using the same opening/Prize conditioning as Agent6's Prize-capacity analysis. The actual direct search count is **9** (4 Fog Crystal + 4 Mysterious Treasure + 1 Quick Ball), not 12. Access, hand timing, competing Heavy Ball targets, and opposing disruption have not been modeled; neither probability is a game-loss rate.

If Fairy Zone is absent, Max Geist's raw damage needs (E=9) to reach 280. The candidate has 11 Psychic Energy and a multi-VMAX Underworld Door engine, so a slower high-energy fallback is structurally possible; its actual probability and timing remain unknown. This distinction matters: the two-Clefairy Prize failure is not automatically a forced loss. Correction (26 November): the 19.15% Mimikyu + Dialga figure is raw core-Prize exposure before Heavy Ball recovery, not the current list's Heavy-Ball-aware Prize-capacity cut. For the registered 14-Basic list, the no-recovery core exposure is 19.152542% for an unconditional six-Prize partition (18.766341% conditional on a legal seven); the optimistic one-Heavy-Ball Prize-capacity cut is **2.366909% conditional on a legal seven**. Neither number is a game-loss probability. See Agent35's reconciliation in agent35-copycat-heavyball-prize-risk-reconciliation-20261117.md and Agent6's agent6-copycat-prize-access-20261125.md.
