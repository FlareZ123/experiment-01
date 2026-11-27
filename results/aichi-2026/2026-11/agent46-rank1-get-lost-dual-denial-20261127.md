# Rank-1 mirror: Get Lost dual denial and damage-ceiling invariant

27 November 2026 · Agent46 · exact list/card-text tactical derivation, not a game or win-rate result.

## Actionable line

Both frozen candidate profiles (Hood Shield and Lockbridge) contain Girafarig LOT 94. Rank 1 has eleven Basic Psychic Energy and exactly one Guzma, three VS Seeker, one Tulip, one Raihan, one Night Stretcher, one Acerola, two Sky Field, one Dimension Valley, and no Pokémon Ranger or alternative direct gust Trainer. See rank 1 in `results/aichi-2026/full-decklists.json`; candidate JSONs are `results/aichi-2026/candidate-hood-shadow-rider.json` and `results/aichi-2026/2026-11/agent31-lockbridge-shadow-rider-v1.json`.

When the unique opposing Guzma and at least one opposing Psychic Energy are simultaneously in discard, **Get Lost the Guzma and an Energy**, rather than automatically choosing two Energy. Get Lost costs one Colorless (zero under live Dimension Valley); it puts two opponent-discard cards in the Lost Zone. VS Seeker, Tulip, Raihan and Night Stretcher do not recover the removed cards from the Lost Zone. The rank-1 list has no Lost Zone retrieval. This is an attack, consumes the turn, and may concede a one-Prize Girafarig. Do not choose it over a presently available game-winning attack.

The energy removal permanently caps opposing Max Geist at 310 instead of 340; the Guzma removal disables its direct gust route even with unspent VS Seekers. Neither requires guessing what the opponent will draw next. Rank 1's Tulip/Raihan/Stretcher can reclaim discarded but not Lost Zoned Energy; the removal matters even if the opposing board has fewer than ten attachments now.

**Immediate protected-tempo certificate:** after successful Get Lost of the unique Guzma, suppose Girafarig is Active, rank 1 needs at least two Prizes, every other candidate Pokémon has more than 50 remaining HP, the candidate has a surviving Bench Pokémon and a nonempty deck for the next compulsory draw, and no already-pending other effect can KO a Pokémon or award additional Prizes. Rank 1 cannot directly gust its way to a benched VMAX using its unchanged list. Its only printed attack able to target the candidate Bench is Astral Barrage (50 counters each to two distinct Pokémon); none of the other Pokémon can be KO'd by that attack under the HP condition. Mimikyu may copy the last Get Lost, not arbitrary earlier attacks. Other printed damaging attacks target Active; none award additional Prizes. Thus rank 1 cannot take the remaining two or more Prizes on its immediately following turn from this board solely by those attacks. If it KOs Girafarig, promote the prepared attacker. If not, retain the Latias / Float Stone / paid retreat or legal switch route. Preserve enough deck for the next compulsory draw. This is a one-turn anti-gust/anti-multi-KO certificate, not a forced game win. It does not protect against hand disruption, damage setup, future attacks, or an unmodeled pre-existing effect; if the HP/Prize/board conditions fail, abandon the guarantee.

## Guard against the alternative OHKOs

Let R = 320 minus current damage on candidate Shadow Rider VMAX, L = number of rank-1 Psychic Energy irreversibly removed, B = own Bench count, A = Energy on own Active VMAX. Under the source inventory, rank 1's total Energy in play is at most 11-L. If the enemy has a legal attacker and there are no other damage modifiers:

- Max Geist <= 10 + 30(11-L); Mimikyu copying Max Geist has the same total-Energy ceiling.
- Full Moon Rondo <= 20 + 20(B+8), allowing rank 1 its maximum eight Bench slots with Sky Field. Both Clefairy and a legal Mimikyu copy have this ceiling. Without Sky Field substitute 5 for 8, but do not assume it remains absent if the opponent can play its copy.
- Energy Drive <= 20(A+11-L), using both Active Pokémon's Energy only, ignoring Weakness/Resistance. Tapu Lele-GX and a legal Mimikyu copy have this ceiling.
- Eon Blade 200, Night Watch 150, Mind Shock 70, Shadow Mist 10, Astral Barrage 50 damage counters per target. Dialga-GX and Radiant Eternatus's printed attacks need Energy types absent from rank 1; Copycat cannot copy a GX attack. The VMAX is Psychic with Darkness Weakness, and Fairy Zone does not make it weak to Psychic. No rank-1 listed damage-modifying Tool/Stadium is present.
- These bounds are for the listed attack families, not an exhaustive arbitrary attack-copy history. After Get Lost, Mimikyu's direct Copycat option is Get Lost; if candidate has used Copycat or an unusual granted attack, inspect the actual legally copyable text.

For R > 200, a sufficient simultaneous non-KO envelope is:

```
11-L <= floor((R-11)/30)
B <= floor((R-21)/20)-8
A <= floor((R-1)/20)-(11-L)
```

Strict inequality matters: damage equal to remaining HP KOs. At full HP, losing exactly one opposing Psychic means keep own Bench <=6 and Active VMAX Energy <=5 (even if opponent fills eight Bench slots and places all ten remaining Energy on Tapu Lele). Max Geist <=310, Rondo <=300, Energy Drive <=300. Avoid gratuitous attachment to the Active: Underworld Door can accelerate to other Benched Psychic Pokémon while keeping total own Max Geist fuel.

| Existing damage | Remaining HP | Minimum opposing Energy irreversibly lost | Max own Bench (opponent <=8) | Max own Active Energy at this minimum loss | Geist / Rondo / Drive ceilings |
|---:|---:|---:|---:|---:|---|
| 0 | 320 | 1 | 6 | 5 | 310 / 300 / 300 |
| 10 | 310 | 2 | 6 | 6 | 280 / 300 / 300 |
| 20 | 300 | 2 | 5 | 5 | 280 / 280 / 280 |
| 30 | 290 | 2 | 5 | 5 | 280 / 280 / 280 |
| 40 | 280 | 3 | 4 | 5 | 250 / 260 / 260 |
| 50 | 270 | 3 | 4 | 5 | 250 / 260 / 260 |

Thus two Energy instead of Energy+Guzma is specifically preferable **for the raw-damage ceiling** when the VMAX is already 10–30 damaged and no energy has yet been Lost Zoned. This is not automatically strategically preferable when gust remains possible. If the unique Guzma is already inaccessible, choose Energy or another sole decisive resource such as Acerola from discard according to the next prize route. Do not assume Acerola is available if its only copy is Lost Zoned; VS Seeker cannot restore it. If only one Energy is accessible, do not assume a second can be removed.

### Explicit exception: Pale Moon-GX

This is not a damage immunity certificate. Rank 1's Trevenant & Dusknoir-GX can use Pale Moon-GX for delayed KO; extra Psychic can discard all Active Energy. Hood Shield's Pokémon Ranger can remove the pending attack effect on the Pokémon, not reverse the already-resolved Energy discard; a legal switch/retreat also clears the pending attack effect. Lockbridge lacks Ranger. If the opponent's GX remains unused and the candidate will need an Active VMAX, preserve a real escape route rather than counting the ceiling as safety. This is an additional mirror use for the existing Ranger (not a proposed policy patch). Rank 1's Astral Barrage may also soften VMAX from the Bench, altering R, and successive attacks can KO.

### Reproduction (local Python, executed)

The conservative bound was exhaustively checked across 7,776 parameter tuples (six damage levels, 0..11 Energy lost, 0..8 own Bench, 0..11 own Active Energy) and all enumerated opposing total-Energy, Active-Energy and Bench counts. The algebra matched the enumerated maximum in every tuple. Counts are independent conservative upper bounds, not reachable board or game probabilities.

```python
from itertools import product
for d in range(0,51,10):
    for l,b,a in product(range(12),range(9),range(12)):
        r=320-d
        algebra=(11-l <= (r-11)//30 and b <= (r-21)//20-8
                 and a <= (r-1)//20-(11-l) and r>200)
        brute=all(max(10+30*e,20+20*(b+ob),20*(a+oe),
                      200,150,70,50,10)<r
                  for e in range(12-l) for ob in range(9)
                  for oe in range(e+1))
        assert algebra==brute
```

Card text from supplied `card-list.zip`: sm8-94, swsh6-74/75, sv9-56, sm2-58/60, smp-SM217, sv8-76, sm5-100, swsh12pt5-105, xy4-93, sm3-112/115, sv4-181. Rulebook I.A-01 (attack ends turn), I.A-03 (retreat/effect removal), II.C-07 (damage counters), II.C-18 (copy effects), II.E-10 (optional effects), II.C-02 (return to hand) apply. Pokémon Ranger STS 104 from candidate inventory; no changes to deck, frozen PR #69, #71, #74, V3 registration, policy, workflow, or engine. This adds a concrete human-pilot line and trace interpretation rule; it does not authorize another implementation microcycle or a game. No game was played, no matchup rate inferred. Prior near-mirror inventory/field threshold is Agent5's 20261115 report, not repeated here.
