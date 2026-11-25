# Agent11: Stealthy Hood may preserve Lockbridge's Wobbuffet/Underworld Door under Garbotoxin

**Date:** 25 November 2026  
**Evidence class:** printed card-text derivation, exact candidate-list inventory, and opponent-list inventory. No native game or matchup result.

## Finding

The current Budew/Garbodor stratification treats Tool-live Garbotoxin as suppressing Wobbuffet's Bide Barricade and Shadow Rider Calyrex VMAX's Underworld Door. That is true when those Pokémon are unprotected. It is not necessarily true for the exact Lockbridge 60: the list contains **two Stealthy Hood UNB 186**, and Stealthy Hood prevents the effects of an opponent's Abilities done to the Pokémon it is attached to, removing existing effects as well.

A conditional two-Hood line may preserve both:
- attach one Stealthy Hood to Wobbuffet PHF 36, protecting Bide Barricade from the opponent's Garbotoxin;
- attach the other to a Shadow Rider Calyrex VMAX, protecting Underworld Door from the same Garbotoxin;
- both Wobbuffet and Shadow Rider VMAX are Psychic, so Wobbuffet's Bide Barricade does not suppress the VMAX;
- Garbotoxin remains active and continues suppressing unhooded Pokémon. This does not remove Garbodor or turn off Garbotoxin globally.

This qualifies, but does not invalidate, the subgroup result in [Agent46's Budew lock-source stratification](agent46-budew-locksource-stratification-20261125.md): the Garbodor subgroup loses Wobbuffet and Underworld Door **without Hood protection**. The Hooded state needs its own deterministic contract and later full-game test.

## Exact card and list evidence

### Lockbridge candidate

[Agent31's exact Lockbridge 60](agent31-lockbridge-shadow-rider-v1.json), blob `907014e330aae8889fe5869a32dfcdf0d876291a`, contains:
- 1 Wobbuffet PHF 36;
- 4 Shadow Rider Calyrex VMAX CRE 75;
- 1 Latias ex SSP 76;
- 2 Stealthy Hood UNB 186;
- 1 Float Stone BKT 137;
- 1 Forest Seal Stone SIT 156;
- 1 Guzma BUS 115 and 1 Acerola BUS 112.

### Printed card text

- Stealthy Hood UNB 186, `resources/cards/en/sm10.json`, blob `2293c98b7086a4137928be1fa358ccad9209d006`, card `sm10-186`: “Prevent all effects of your opponent's Abilities done to the Pokémon this card is attached to. Remove any such existing effects.”
- Garbodor LTR 68, `resources/cards/en/bw11.json`, blob `e4e09d569e76c71943e2399221c9f904b4420096`, card `bw11-68`: if this Pokémon has a Pokémon Tool attached, each Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities except Garbotoxin.
- Wobbuffet PHF 36 is Psychic. Bide Barricade exempts Psychic Pokémon and affects non-Psychic Pokémon on both players' sides while Wobbuffet is Active.
- Shadow Rider Calyrex VMAX CRE 75 is Psychic. Its Underworld Door therefore survives Wobbuffet's own Bide Barricade.
- Latias ex SSP 76 is Psychic and its Skyliner grants no Retreat Cost to Basic Pokémon in play. However, if Garbotoxin is active and Latias ex is unhooded, Garbotoxin suppresses Skyliner; the earlier Latias retreat route is not available in this specific state.

The exact PR #69 candidate worker already applies Stealthy Hood generically to the target of an opposing Ability-lock source before resolving the source's scope, and its current test proves Hood protection against Garbotoxin on Lillie's Clefairy ex. There is no dedicated Wobbuffet/VMAX + Garbotoxin test yet. Therefore the line is a card-text and implementation-derived hypothesis, not an observed game.

## Opponent field: four published Garbodor lists

Input: `results/aichi-2026/full-decklists.json`, blob `ae773f6201d7aa69d31914dbfee66f3fba692200` (29 authenticated lists).

| Rank | Garbodor | Budew | Opponent Field Blower | Float Stone |
|---:|---:|---:|---:|---:|
| 8 | 2 LTR 68 | 1 | 1 | 4 |
| 11 | 2 BKP 57 | 0 | 0 | 3 |
| 16 | 2 LTR 68 + 1 BKP 57 | 2 | 0 | 4 |
| 22 | 2 BKP 57 | 1 | 1 | 4 |

The four lists contain no Faba, Tool Jammer, Jamming Tower, Tool Scrapper, Startling Megaphone, or Xerosic in the published inventories. Ranks 8 and 22 each have one Field Blower, which can discard both Hoods in a single play if both are attached. Ranks 11 and 16 have no listed Field Blower; rank 16 is the three-Garbodor / two-Budew subgroup. This is inventory, not a claim that the opponent cannot draw or use other interaction.

## Conditional sequence and costs

A possible non-Item response to Budew plus Tool-live Garbodor:

1. Have Wobbuffet Active with Stealthy Hood attached; have a Benched Shadow Rider VMAX with the second Stealthy Hood and two Psychic Energy.
2. Because Hood prevents Garbotoxin's effects on those two Pokémon, Bide Barricade and Underworld Door remain active. Use Underworld Door to attach a Psychic Energy from hand to a Benched Psychic Pokémon and draw two.
3. Play Dimension Valley if needed; it is a Stadium, not an Item. Max Geist costs two Colorless after Dimension Valley, so the two Psychic Energy on the attacking VMAX can pay the cost. The Door attachment also counts for Max Geist damage, giving 100 damage if three Psychic Energy are attached across the candidate's Pokémon (70 if exactly two total).
4. Move Wobbuffet out with the list's Guzma (Supporter), or Acerola if Wobbuffet is damaged; both are playable during Itchy Pollen's Item lock. This is conditional on the Supporter and a legal switch/target state. Latias ex's free-retreat Ability is not available if it remains unhooded under Garbotoxin.
5. Attack with Shadow Rider VMAX. Knocking Out Budew does not clear the current-turn Item lock; a second Budew can reapply Itchy Pollen on a later turn.

The two Hoods consume both Tool slots on Wobbuffet and one VMAX:
- Hooded Wobbuffet cannot also hold Float Stone.
- Hooded VMAX cannot also hold Forest Seal Stone, so Star Alchemy is not protected on that Pokémon.
- Latias ex remains unhooded and loses Skyliner under Garbotoxin.
- The line depends on access to both Hoods and a Supporter-based way to move Wobbuffet out; it is not an unconditional answer.

## Counterplay and test requirements

- An opponent Field Blower can discard both Hoods at once. This is present in ranks 8 and 22, but not in ranks 11 and 16.
- Tool Jammer or Jamming Tower would also disable the Hoods if present; neither appears in these four published lists.
- Test both physical player seats, Hood on Wobbuffet only, Hood on VMAX only, both Hoods, neither Hood, opponent Field Blower removing both, and the three-Garbodor source case.
- Assert that Garbotoxin remains active globally, but its effect is prevented on each Hooded target; Bide Barricade and Underworld Door remain usable only when their respective Pokémon are protected.
- Include a Supporter switch-out case and a no-switch-resource control. Do not use Latias ex Skyliner as a retreat route while Garbotoxin is active unless Latias itself is also protected.
- A separate full-game experiment must establish whether the exact list can assemble both Hoods, Wobbuffet, VMAX, Energy, Stadium, and a Supporter on time against the relevant Budew/Garbodor lists.

## Disposition

This is a **conditional strategic hypothesis** that materially qualifies the three Garbodor Budew lists. It does not establish a matchup win rate, prove the Lockbridge list beats Garbodor, change the fixed 60, or authorize code/test/fixture/game work. Keep Lockbridge unranked and unqualified until the deterministic interaction and full-game reachability are tested under the normal authorization gates.

## Independent Latias ex retreat route when the opposing Ability lock is absent

The same Lockbridge 60 contains one Latias ex SSP 76. Its Psychic-type Skyliner says “Your Basic Pokémon in play have no Retreat Cost.” Wobbuffet PHF 36 is Basic and Psychic. Therefore, with Latias ex on the Bench and Wobbuffet Active, Bide Barricade does not suppress Skyliner, and Wobbuffet can retreat for free without Float Stone. This is a second non-Item switch-out route during Budew's Item lock and may preserve the list's one Float Stone for other Pokémon.

This route is unavailable when an opposing Tool-live Garbotoxin suppresses the unhooded Latias ex, or when an opposing Active Klefki suppresses Basic Abilities. In the two-Hood Garbotoxin line above, Hood is allocated to Wobbuffet and Shadow Rider VMAX, so Latias remains unprotected; use a Supporter switch-out (Guzma, or Acerola if Wobbuffet is damaged) or another live route instead. This is a card-text derivation, not a game result.
