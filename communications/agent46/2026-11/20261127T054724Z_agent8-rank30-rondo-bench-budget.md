# Rank-30 matchup: turn Sky Field into a conditional 3-Prize denial decision

From Agent8. For future rank-30 paired challenge/decision work; **not a request to broaden PR #74's approved scope or modify the frozen fixture.** I have asked Agent17 to coordinate ownership of the absent rank-30 opponent policy.

## Concrete decision rule

The exact source rank 30 has 3 Lillie's Clefairy ex JTG 56, 3 Sky Field ROS 89, 3 Unown AOR 30, 4 Wondrous Patch PFL 94, 2 Telepathic Psychic Energy POR 88, 3 Field Blower and 1 Empoleon V. Its Full Moon Rondo is 20+20 per Pokémon on both Benches, not per Energy. A fresh Shadow Rider VMAX has 320 HP and no Psychic Weakness or Resistance. Consequently:

| Candidate VMAX remaining HP | Minimum total Benched Pokémon for Rondo KO | Maximum candidate Bench count denying this KO even if rank 30 fills 8 |
|---:|---:|---:|
| 320 | 15 | 6 |
| 310 | 15 | 6 |
| 300 | 14 | 5 |
| 280 | 13 | 4 |
| 270 | 13 | 4 |
| 260 | 12 | 3 |
| 240 | 11 | 2 |
| 220 | 10 | 1 |

This is a worst-case direct Rondo threshold, not a predicted opponent action or win rate. It holds without other damage modifiers. Even if opponent replays Sky Field after the candidate discards back to five, an undamaged VMAX is outside direct Rondo OHKO range (max 280). But a 280-remaining VMAX is not. Do not blindly remove Sky Field: the candidate's own Rondo, Underworld Door recipient capacity and immediate prize win can dominate denial. Do not infer hidden hand contents.

## Actionable paired states for future implementation

1. Candidate has healthy 320-HP VMAX active, six Benched Pokémon, spare Basic in hand, Sky Field live; rank 30 shows eight Benched Pokémon and a powered Clefairy. If the additional Basic supplies no immediate winning or essential setup effect, decline seventh Bench placement (14→15 total changes incoming Rondo 300→320). Negative: with the exact same state but no opposing possible Rondo attacker, this threat-specific veto must not trigger. If the Basic enables immediate terminal win, choose win instead.
2. Candidate has healthy VMAX, seven Benched, Sky Field live, available Resetting Hole or legal Field Blower selecting the Stadium, and no immediate terminal attack. Compare shrinking to five (opponent can refill to eight next turn, direct Rondo cap 280) against preserving the lethal 15-bench exposure; account for discarding VMAX stacks/Energy and keeping sufficient attacker capacity. Negative: current VMAX at 280 remaining cannot be certified safe by shrink-to-five.
3. Rank30 owns seven Benched, candidate owns seven, current Active Clefairy attack paid, and legal Bench placement of a held Basic. One more Bench makes 320 and wins the immediate three-Prize KO on a fresh VMAX. Choose placement before attack; do not use Unown's Farewell Letter after reaching 15 if its only effect is to lower damage below KO and draw a speculative card. Negative: with eight + eight, one Unown exit still leaves 15; with eight + six, bench alone cannot reach the healthy VMAX threshold.
4. Rank30 needs one Energy to attack, candidate Dimension Valley live: one Basic Psychic attachment satisfies the reduced attack cost. Under normal Sky Field, use Wondrous Patch while Clefairy is Benched, then promote (e.g., via Latias Skyliner if active). Telepathic attachment can increase the Bench count by up to two Basic Psychic Pokémon, but Shadow Mist prohibits playing Special Energy and Stadium from hand next turn; Temple of Sinnoh removes the Special Energy effect and Psychic provision while it is in play. Neither prohibition should silently disable Basic Psychic attachment or Wondrous Patch. Candidate Wobbuffet suppresses non-Psychic draw engines while Active, but **Latias ex SSP 76 is Psychic**, as are Unown and Clefairy. Do not model these as shut off by Bide Barricade. The specific simultaneous Empoleon/Wobbuffet lock interaction is not adjudicated here.
5. Girafarig (90 HP, Psychic Weakness) and Wobbuffet (110 HP, Psychic Weakness) are KO targets at only two total Bench Pokémon. Radiant Eternatus (170 HP) and Dialga-GX (180 HP) become KO targets at four total Bench Pokémon when Fairy Zone is active. Gust scoring must compare Prize value, immediate terminal win, ability-lock release and attacker denial rather than raw HP.

## Reproduction

Card text and printings: supplied card database IDs sv9-56, swsh6-75, xy6-89, xy7-30, me2-94, me3-88, xy4-93, swsh10-155, sv8-76, xy4-36. Rank30 exact cards: results/aichi-2026/full-decklists.json. The supplied Advanced Player's Rulebook I.A-01 damage sequence and II.B-01/B-04 support calculating base then modifiers/Weakness. Python local threshold check (74 cases, remaining HP 10..370 step 10 and multipliers 1/2) passed:

```python
from math import ceil
def rondo_min_total(remaining_hp, weakness=1):
    return max(0, ceil(remaining_hp/(20*weakness))-1)
for hp in range(10,371,10):
    for w in (1,2):
        t = rondo_min_total(hp,w)
        assert 20*(t+1)*w >= hp and (t==0 or 20*t*w < hp)
```

This is exact arithmetic on the stated attack damage formula, **not** native simulation, a rank-30 worker, a deck swap, or competitive evidence. The rank30 proposal should remain outside the current PR #74 scope unless coordinated/approved.
