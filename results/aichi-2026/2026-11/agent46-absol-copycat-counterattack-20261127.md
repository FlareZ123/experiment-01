# Mega Absol: one-Prize Copycat counterattack with an 80-damage setup

Agent 46 · 2026-11-27 · **Decision: fixed-candidate pilot strategy against ranks 8, 9, 11, 16, 22.** Neither candidate list changes.

Mega Absol ex has 280 HP, Grass Weakness, and Claw of Darkness for 200. Its Darkness damage can immediately KO Shadow Rider VMAX through weakness. Attempting a normal two-hit VMAX race against this attacker is particularly expensive. Both existing candidates instead contain Mimikyu GRI58: Copycat pays PC and reproduces the last non-GX attack used by the opponent, including Claw's 200 damage and hand-discard effect. Garbotoxin cannot turn off an attack.

## Concrete prize-conversion line

Use a two-Prize chip attacker to place **at least 80 damage** on the opposing Mega Absol. Prepare Mimikyu on the Bench with two Basic Psychic (three against a possible Plumeria at ranks 9 and 16), *before* making that attack. If the damaged Mega Absol replies with Claw and KOs the chipper, promote Mimikyu and Copycat Claw to finish it. This exchanges two Prizes for three without needing to play a card from hand after Claw's discard. With three Prizes left and opponent requiring more than two, the reply wins. This is a conditional threat, not a forced win against arbitrary opponent mobility.

| Chipper | Sufficient chip against full HP Absol | Minimum own energy with Dimension Valley |
|---|---|---:|
| Tapu Lele-GX | Energy Drive: total Energy on both Active >=4; one own and three enemy yields exactly 80 | 1 when opponent has >=3 |
| Lillie's Clefairy ex | Full Moon Rondo: >=3 total Benched Pokemon gives >=80 | 1 |
| Latias ex | Eon Blade 200 | 2 |
| Shadow Rider VMAX | Max Geist at least 100 at three total Psychic (but risks three-Prize loss) | 2 attached, at least 3 total |
| Girafarig | Mind Shock 70 only suffices if target already has >=10 damage | 2 |
| Lockbridge Wobbuffet | Psychic Assault makes total damage 2d+10, so >=40 prior damage gives >=90 total | 1 |

Three Basic Psychic are sufficient for the Lele/Clefairy version under Dimension Valley (one chipper + two Mimikyu). In a constructed normal Gate setup, first-turn manual attachment to benched Mimikyu, second-turn one manual attachment to the chipper and one live Underworld Door to Mimikyu produce this allocation. A Hood on VMAX can restore Door under Garbotoxin. Do not use this recipe if the opponent can KO/gust Mimikyu before it is ready. If Dimension Valley isn't present, the chipper requires two (or more for Latias), but the precharged Mimikyu remains payable even if the opponent replaces the Stadium between attacks. Against ranks 9 and 16, reserve an additional attachment to Mimikyu if Plumeria is live; one Supporter can discard at most one Basic Energy.

## Adversarial response classes

- Opponent's same chipped Absol uses Claw and KOs the chipper, with Mimikyu surviving: direct 3-Prize Copycat KO; no search, Supporter, or Tool required. Muscle Band on Absol does not increase copied damage; copied attack uses printed 200.
- Opponent retreats damaged Absol and uses Claw with another: target the damaged one through Guzma if held and legal pivot available (promote a pivot after KO rather than automatically Mimikyu if Guzma will be needed).
- Opponent gusts Mimikyu and KOs it: the prepared counterline fails. All five lists have Guzma plus potential VS Seeker reuse; do not assume the threat is unavoidable. When opponent gust is exhausted, the threat is much stronger.
- Opponent plays Budew/Vikavolt or another attack rather than Claw: Copycat does not automatically have 200 damage; reassess actual last attack and take a different line or continue chipping.
- Opponent uses rank9/rank16 Plumeria before Claw: three preattached Basic Psychic preserve the two-energy response. Basic Psychic is not vulnerable to Enhanced Hammer, and Garbotoxin does not suppress Copycat. Never stake the response solely on a held Energy that Claw can discard.
- Opponent's Terminal Period is a separate attack, not Claw. Do not plan a 200-damage Copycat from Terminal Period. If they used Terminal Period and their own active has exactly six damage counters, the copied effect can KO it, but this is another conditional line, not a reason to deliberately leave the Claw chipper at 60 damage.

Additional rank9 alternative: if its Sableye V used Crazy Claws last turn, the copied attack does 10+60n for n counters on the target, so a Mega Absol with four counters has cumulative 40+250=290 damage, enough for KO if it is Active or legally gusted. This uses Copycat's own PC cost, not DD. If opponent uses Gengar & Mimikyu-GX's Horror House-GX, Copycat cannot copy a GX attack.

## Immediate win takes priority

Before the chip plan, check whether the existing Clefairy can one-shot Absol: 13 combined Benched Pokemon gives 280 Rondo, requiring Sky Field if own+opponent exceed normal capacity. E.g. own eight and opponent five. Opponent four means max 260 and at least 20 prior damage needed; opponent three means max 240 and 40 prior. All five source lists lack an HP-boosting Tool for Absol. If the immediate 3-Prize KO wins, fill Bench only as needed, then attack before the opponent can replace Sky Field. Max Geist needs nine total Psychic for 280. Do not overbench merely for a speculative future Rondo.

The second Clefairy in Hood can serve as another low-cost chipper whereas Lockbridge's one Wobbuffet can participate only after prior chip; this is a real candidate role difference, not a measured rank preference. Wobbuffet does not itself suppress Psychic Garbodor and Mega Absol has no Ability. Temple doesn't turn off the Basic Darkness used by the four Garbodor lists.

Source: exact ranks 8/9/11/16/22 in `results/aichi-2026/full-decklists.json`; MEG86, GRI58/60, JTG56, SSP76, LOT94, PHF36/93, CRE74/75, SSH120, TEU53, UNB186. No source-dealt game, access frequency, frozen-policy patch or scope expansion. Opponent policy should explicitly preserve or spend gust/mobility to defeat this threat rather than blindly accept a favorable exchange.
