# Agent11: Lockbridge Hood allocation — Garbotoxin redundancy, Budew timing, and Klefki counterplay

**Date:** 25 November 2026  
**Evidence class:** printed card-text derivation and exact candidate/opponent-list inventory. No deterministic contract, native game, or matchup result.

## Decision summary

The exact Lockbridge 60 has two Stealthy Hood UNB 186, one Wobbuffet PHF 36, one Latias ex SSP 76, and four Shadow Rider Calyrex VMAX.

- **Against Tool-live Garbotoxin:** a Hood on Shadow Rider VMAX can preserve Underworld Door. A Hood on Wobbuffet is redundant while Garbotoxin remains active: Garbotoxin already suppresses every Pokémon Ability except Garbotoxin, while Bide Barricade only suppresses non-Psychic Pokémon. Since the Aichi Garbodor sources are Psychic, every Bide Barricade target is already suppressed by Garbotoxin (target-set inclusion B ⊆ G). Prefer Hood on one or two VMAX engines, or keep one copy in hand/deck as a reserve; do not spend a Hood on Wobbuffet solely to preserve a redundant lock.
- **Against Budew + Field Blower:** ranks 8 and 22 each have Garbodor, Budew, one Field Blower, and three VS Seeker. Field Blower can discard both attached Hoods before Budew uses zero-cost Itchy Pollen. However, Tools are not Items: one Hood held in hand or left in the deck can be attached/searched during the Item-locked turn. If both Hoods are attached and discarded, the list has no Tool-recovery effect.
- **Against Klefki:** a different allocation can matter. Hood Wobbuffet to protect Bide Barricade and Hood Latias ex to protect Skyliner; Shadow Rider VMAX is not Basic, so Klefki's Basic-only lock does not suppress Underworld Door. Joust can strip the Hood from Active Wobbuffet, while the Hood on Benched Latias remains and may allow a retreat into a powered VMAX. Both Klefki lists also have three Escape Rope, which can force Wobbuffet off Active and end Bide Barricade.
- **Latias retreat:** when no opposing Garbotoxin or Active Klefki suppresses it, Latias ex's Psychic Skyliner is not suppressed by Wobbuffet and gives Basic Wobbuffet free retreat.

These are conditional card-text hypotheses, not demonstrated matchup wins. Lockbridge remains unranked and unqualified.

## Exact candidate and source evidence

[Agent31's exact Lockbridge 60](agent31-lockbridge-shadow-rider-v1.json), blob `907014e330aae8889fe5869a32dfcdf0d876291a`, contains:
- 1 Wobbuffet PHF 36;
- 4 Shadow Rider Calyrex VMAX CRE 75;
- 1 Latias ex SSP 76;
- 2 Stealthy Hood UNB 186;
- 1 Float Stone BKT 137;
- 1 Forest Seal Stone SIT 156;
- 1 Arven, 1 Guzma, 1 Acerola, and 2 VS Seeker.

Relevant printed card text:
- **Stealthy Hood UNB 186:** resources/cards/en/sm10.json, blob `2293c98b7086a4137928be1fa358ccad9209d006`, card sm10-186. Prevents all effects of an opponent's Abilities done to the attached Pokémon and removes existing such effects.
- **Wobbuffet PHF 36:** resources/cards/en/xy4.json, blob `85ab15304b4741c1f5601ee786fc8f3a764326f9`, card xy4-36. Psychic; while Active, Bide Barricade removes Abilities from non-Psychic Pokémon in play, both players' hands, and both discards.
- **Garbodor LTR 68:** resources/cards/en/bw11.json, blob `e4e09d569e76c71943e2399221c9f904b4420096`, card bw11-68. Tool-live Garbotoxin removes Abilities from all Pokémon except Garbotoxin. **Garbodor BKP 57** is also Psychic and has Garbotoxin: resources/cards/en/xy9.json, blob `dcfa9ec1b6b0ff6a0b446114c9d567c598cf71ce`, card xy9-57.
- **Latias ex SSP 76:** resources/cards/en/sv8.json, blob `e57086ffb443650333344e01d2bdada0143601ff`, card sv8-76. Psychic; Skyliner gives Basic Pokémon in play no Retreat Cost.
- **Klefki SVI 96:** resources/cards/en/sv1.json, blob `9ec168ce0ea7bf03fe9f22dd7e447d1eb35c8678`, card sv1-96. Mischievous Lock suppresses Abilities of Basic Pokémon on both sides; Joust costs one Colorless and discards all Pokémon Tools from the opponent's Active Pokémon before damage.
- **Budew ASC 16 / Itchy Pollen** and **Field Blower GRI 125:** exact card IDs and text are documented in [Agent21's Garbotoxin/Wobbuffet report](agent21-garbotoxin-wobbuffet-subsumption-20261125.md).
- The Advanced Player's Manual B-02, resources/manual/EN_advanced_manual-2025-transcription-structured.md, treats Pokémon Tools as a separate Trainer type; a Tool is not an Item even if an older printing includes the word “Item”.

The current PR #69 worker applies Stealthy Hood generically to the target of an opposing Ability-lock source, and its test demonstrates Hood protection against Garbotoxin on Lillie's Clefairy ex. There is no dedicated Wobbuffet/VMAX + Garbotoxin or Klefki/Joust test.

## Garbotoxin: why Hood on Wobbuffet is redundant

Let B be the set of Pokémon targeted by Bide Barricade: all non-Psychic Pokémon. Let G be the set targeted by Tool-live Garbotoxin: all Pokémon except the Garbotoxin source. Each authenticated Aichi Garbodor source is Psychic, so it is not in B. Every non-Psychic Pokémon is in G. Therefore B ⊆ G.

Consequences:
1. Garbotoxin already suppresses every Ability that Bide Barricade would suppress.
2. Bide Barricade does not suppress Garbodor, because the Aichi Garbodor printings are Psychic.
3. A Hood that preserves Bide Barricade on Wobbuffet adds no opponent-Ability suppression while Garbotoxin remains Tool-live.
4. If Garbodor loses its Tool, Garbotoxin's condition ends; Bide Barricade resumes automatically if Wobbuffet is Active. Wobbuffet does not need Hood to reactivate.

The valuable Hood target in this state is Shadow Rider Calyrex VMAX: Garbotoxin suppresses its Underworld Door, and Stealthy Hood can prevent that effect on the attached VMAX. A second Hood may protect a second VMAX, or be held in reserve. A VMAX with Hood cannot also hold Forest Seal Stone, so Star Alchemy is not protected on that same Pokémon.

This is a matchup-specific set-inclusion result. It does not make Wobbuffet generally redundant: against Ability locks that do not already suppress all non-Psychic Abilities, Bide Barricade may add coverage.

## Budew + Field Blower timing in Aichi ranks 8 and 22

Input: results/aichi-2026/full-decklists.json, blob `ae773f6201d7aa69d31914dbfee66f3fba692200` (29 authenticated lists).

| Rank | Garbodor | Budew | Opponent Field Blower | Opponent VS Seeker |
|---:|---:|---:|---:|---:|
| 8 | 2 LTR 68 | 1 | 1 | 3 |
| 11 | 2 BKP 57 | 0 | 0 | 3 |
| 16 | 2 LTR 68 + 1 BKP 57 | 2 | 0 | 3 |
| 22 | 2 BKP 57 | 1 | 1 | 3 |

A legal pressure sequence exists when both Hoods are already attached:

1. The opponent keeps a Tool on Garbodor so Garbotoxin remains active.
2. Before attacking, the opponent plays Field Blower and discards both attached Hoods, leaving Garbodor's Tool in play.
3. The opponent attacks with Budew's zero-cost Itchy Pollen. The candidate's next turn cannot play Item cards from hand.
4. During that locked turn, the candidate cannot use its own Field Blower or Night Stretcher. Knocking out Budew does not erase the current-turn Item restriction.

There is an important defense: Itchy Pollen restricts Items, not all Trainer cards. The manual's B-02 treats Pokémon Tools separately, so Stealthy Hood can still be attached from hand during the Item-locked turn. Arven is a Supporter and can search a Pokémon Tool from the deck during that turn. Therefore:
- If one Hood is attached and the second is held in hand or remains in the deck, the opponent's Field Blower cannot discard the held copy. The candidate can redeploy it during Itchy Pollen and preserve one Underworld Door engine.
- If both Hoods are attached when Field Blower is played, both can be discarded. The exact 60 has no Tool-recovery effect: Arven searches the deck, not the discard pile; Night Stretcher retrieves Pokémon/Basic Energy, not Tools.
- The candidate's own Field Blower is an Item and is unavailable during Itchy Pollen. Each rank-8/rank-22 list has three VS Seeker, so repeated Field Blower recovery is possible later, not guaranteed.
- Arven consumes the Supporter for the turn; it cannot be combined with Guzma on the same turn. If the candidate needs a switch-out, a held Hood plus Float Stone or another live switch route may be preferable to using Arven to search the Hood.

**Practical policy:** against ranks 8/22, do not expose both Hoods to the same Field Blower unless the second engine is worth the risk. Keep one Hood in hand/deck as a replacement where possible. This is card-text/list-derived sequencing, not a played matchup.

## Klefki subgroup: a different Hood allocation

The authenticated Aichi lists at ranks 4 and 17 each contain one Klefki SVI 96. Against an Active Klefki:
- Hood Wobbuffet to prevent Mischievous Lock from suppressing Bide Barricade.
- Hood Latias ex to preserve Skyliner; Wobbuffet and Latias are Psychic, so Wobbuffet's Bide Barricade does not suppress either. Shadow Rider VMAX is not Basic, so Klefki does not suppress Underworld Door.
- With Latias Hooded on the Bench, Wobbuffet (Basic) has no Retreat Cost.

Counterplay:
- If Klefki uses Joust while Wobbuffet is Active, it discards the Hood from Active Wobbuffet before damage. Klefki then suppresses Bide Barricade. The Hood on Benched Latias remains; Skyliner can still let Wobbuffet retreat, after which a powered Shadow Rider VMAX can attack and Knock Out the 70-HP Klefki (Max Geist does 70 with exactly two Psychic Energy total and Dimension Valley, or more with an additional Psychic Energy). Once Klefki leaves play, Bide Barricade is no longer suppressed.
- Both Klefki lists also contain three Escape Rope. Escape Rope forces Wobbuffet off Active and ends Bide Barricade regardless of Hood; it also moves Klefki out and ends Mischievous Lock. This is a symmetric lock-window reset, not a one-sided permanent counter.
- Lockbridge has one Guzma plus two VS Seeker (up to three Guzma accesses) to re-promote Wobbuffet, so the published counts create a switch-resource race rather than proving the lock cannot be maintained.
- The two lists have no Field Blower, Faba, Tool Jammer, Jamming Tower, Tool Scrapper, Startling Megaphone, or Xerosic in their published inventories; Joust is the identified Tool-removal line. Their 12 Energy are Reversal Energy, Counter Energy, and Unit Energy LPM, any of which can pay Joust's one Colorless cost.

Radiant Eternatus is a separate sequencing issue: it is Basic Dragon and is suppressed by both Wobbuffet and Klefki. Climactic Gate must be used before Wobbuffet becomes Active / before Klefki's lock, or Radiant must already be protected before the Ability effect is applied. Attaching Hood after the on-play Gate trigger has already been suppressed does not retroactively trigger Gate.

## Latias ex retreat route when the opposing Ability lock is absent

Latias ex SSP 76 is Psychic, so Wobbuffet's Bide Barricade does not suppress Skyliner. With Latias ex on the Bench and Wobbuffet Active, Wobbuffet (Basic) can retreat for free without Float Stone. This is a non-Item switch-out route during Budew's Item lock and may preserve Float Stone.

This route is unavailable if an opposing Tool-live Garbotoxin suppresses unhooded Latias ex, or if an opposing Active Klefki suppresses Basic Abilities. Against Klefki, a Hood on Latias can preserve Skyliner; against Garbotoxin, a Hood on Latias competes with the more valuable Hood on Shadow Rider VMAX.

## Proposed deterministic tests and limits

If an isolated Lockbridge rules-contract scope is authorized, test:
- Tool-live Garbodor with Wobbuffet unhooded: confirm Garbotoxin already suppresses every non-Psychic Ability that Bide Barricade would suppress.
- Tool removal from the last Garbodor source: confirm Bide Barricade resumes while Wobbuffet is Active, without Hood.
- Hooded Shadow Rider VMAX under Garbotoxin: confirm Underworld Door remains usable; no-Hood control should fail.
- Budew + Field Blower before Itchy Pollen: both Hoods attached versus one Hood held/in deck; confirm Tool attachment and Arven remain available during Item lock, while Item cards do not.
- Klefki with Hooded Wobbuffet/Latias; Joust stripping Active Wobbuffet's Hood; Latias retreat; Escape Rope forcing Wobbuffet off Active.
- Both physical player seats and no-Hood controls.

A separate full-game experiment must establish whether the exact list can assemble the relevant Hoods, Wobbuffet, VMAX, Energy, Stadium, and switch resources on time. No code, test, fixture, game, or matchup simulation was changed or dispatched by this report. Keep Lockbridge unranked and unqualified pending explicit scope authorization and evidence.
