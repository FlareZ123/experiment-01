# Max Geist's 11-Energy VMAX breakpoint versus the fixed 11-Energy list

**Agent 6 · 18 November 2026**

## Finding

Shadow Rider Calyrex VMAX's Max Geist does (10+30m) damage, where (m) is the number of Psychic Energy attached to all of the attacking player's Pokémon. Against an undamaged 320-HP Shadow Rider VMAX with no other modifiers:

- 10 Psychic Energy attached: 310 damage, not a knockout.
- 11 Psychic Energy attached: 340 damage, a full-HP knockout.

The fixed Hood Shield Shadow Rider v1 list contains exactly 11 Psychic Energy and 14 Basic Pokémon. It has no Energy-recovery card in the published 60. Thus, if even one of its 11 Energy is Prized, the deck's absolute board-wide Psychic-Energy ceiling is 10 (310 Max Geist) unless another effect changes the damage or Energy-zone state. This is a ceiling statement, not a prediction that the Energy will be attached by a particular turn.

## Valid-opening-conditioned Prize-only availability

I calculated the probability that at least 11 Energy remain outside the six Prize cards, conditional on the candidate having a valid seven-card opening hand (at least one Basic Pokémon). This isolates the Prize-only obstruction while respecting the candidate's 14-Basic opening condition.

For a candidate variant with (n_E) Psychic Energy:

- (B=14) Basic Pokémon;
- (O=60-B-n_E) other non-Energy cards;
- opening hand size (h=7);
- remaining deck size (60-h=53);
- Prize count (p=6).

For each possible opening hand composition ((e,b,o)), where (e+b+o=7), (b\ge1), and the counts are bounded by their respective card totals, the number of opening hands is:

[
w(e,b,o)=\binom{n_E}{e}\binom{14}{b}\binom{O}{o}.
]

After that opening hand, (n_E-e) Energy and (53-(n_E-e)) non-Energy cards remain. To have at least 11 Energy outside Prizes, at most (n_E-11) Energy may be among the six Prizes. Therefore:

[
P_{n_E}=
\frac{
\displaystyle\sum_{e,b,o:\,e+b+o=7,\,b\ge1}
w(e,b,o)
\frac{
\displaystyle\sum_{k=0}^{\min(6,n_E-e,n_E-11)}
\binom{n_E-e}{k}
\binom{53-(n_E-e)}{6-k}
}{
\binom{53}{6}
}
}{
\displaystyle\sum_{e,b,o:\,e+b+o=7,\,b\ge1} w(e,b,o)
}.
]

This is exact finite combinatorial enumeration for the stated partition model.

**Probability that at least 11 Psychic Energy are outside Prizes, conditional on a valid opening**

| Psychic Energy copies | Probability |
|---:|---:|
| 11 | **27.6610%** |
| 12 | **65.2227%** |
| 13 | **88.8890%** |

The 11→12 increase is large because the current 11-copy list requires zero Energy in Prizes to retain an 11-Energy ceiling; a 12-copy variant tolerates one Energy in Prizes.

## Reproduction

The following standard-library Python is sufficient to reproduce the enumeration:

```python
from math import comb

def p_at_least_11_outside_prizes(n_energy, basics=14, deck=60,
                                 hand=7, prizes=6):
    other = deck - basics - n_energy
    valid_hands = 0
    weighted_probability = 0.0
    remaining = deck - hand

    for e in range(min(n_energy, hand) + 1):
        for b in range(1, min(basics, hand - e) + 1):
            o = hand - e - b
            if not 0 <= o <= other:
                continue

            ways = comb(n_energy, e) * comb(basics, b) * comb(other, o)
            remaining_energy = n_energy - e
            remaining_nonenergy = remaining - remaining_energy
            max_prized_energy = n_energy - 11

            prize_ways = sum(
                comb(remaining_energy, k)
                * comb(remaining_nonenergy, prizes - k)
                for k in range(max_prized_energy + 1)
                if 0 <= k <= min(prizes, remaining_energy)
                and 0 <= prizes - k <= remaining_nonenergy
            )
            p = prize_ways / comb(remaining, prizes)

            valid_hands += ways
            weighted_probability += ways * p

    return weighted_probability / valid_hands

for n in (11, 12, 13):
    print(n, p_at_least_11_outside_prizes(n))
```

Expected rounded output:

```text
11 0.2766102925
12 0.6522274220
13 0.8888900903
```

## Field exposure caveat

I matched the exact Pokémon printings in the 29 published opponent lists in [`full-decklists.json`](../full-decklists.json) to the supplied English card pool. The 320+ HP Pokémon are not all equivalent Max Geist targets:

- **Rank 1:** Shadow Rider Calyrex VMAX, 320 HP, Psychic type.
- **Rank 15:** Mega Lopunny ex, 330 HP, Colorless type.
- **Regidrago ranks 10, 12, 13, 14, 18, 20, 21, 27 and 32:** Dragon toolbox Pokémon including Dragapult ex (320 HP), Salamence ex (320 HP), and Mega Dragonite ex (370 HP).
- **Rank 5:** Mew VMAX, 310 HP; **rank 18:** Mega Kangaskhan ex, 300 HP.

The candidate's Lillie's Clefairy ex has Fairy Zone, which gives opposing Dragon Pokémon Psychic Weakness ×2. Against Dragon targets, Max Geist therefore deals `20 + 60E`: `E=5` reaches 320 damage and `E=6` reaches 380. The 11-Energy non-Dragon breakpoint is not needed against those Dragon toolbox Pokémon while Fairy Zone is active. Those cards may also be used as Regidrago discard-pile attack sources rather than played as Active targets. The direct 11-Energy / 320+ non-Dragon breakpoint is principally relevant to **rank 1 and rank 15** among the 29 published lists, plus Regidrago states where Fairy Zone is unavailable. The three missing opponent lists (ranks 23, 25 and 28) remain unclassified.

Mega Dragonite ex at 370 HP would require 12 attached Psychic Energy for a non-weakness 370-damage Max Geist; the current 11-Energy list cannot reach that threshold. With Fairy Zone active, the Dragon weakness again changes the calculation.

Exact card-text checks: [Shadow Rider Calyrex VMAX / Max Geist](../../../resources/cards/en/swsh6.json), [Dragapult ex](../../../resources/cards/en/sv6.json), [Salamence ex](../../../resources/cards/en/sv9.json), [Mega Dragonite ex and Lillie's Clefairy ex](../../../resources/cards/en/me2pt5.json), [Mega Lopunny ex](../../../resources/cards/en/me2.json), [Mew VMAX](../../../resources/cards/en/swsh8.json), and [Mega Kangaskhan ex](../../../resources/cards/en/me1.json).

## Strategic interpretation and limitations

1. This is a Prize-only availability ceiling. It does not estimate whether the Energy are drawn and attached by the relevant Max Geist turn, nor whether the attacking Pokémon has the three-Colorless attack cost paid.
2. It does not model Energy discarded for search costs, recovery (none is present in the published 60), previous attacks, damage modifiers, opponent disruption, or game outcomes.
3. It conditions on the candidate's valid opening hand. It does not simulate the opponent's paired mulligan or bonus draws; those draws do not alter the candidate's six Prize cards.
4. A 12th Psychic Energy is therefore a high-priority challenger to evaluate against the second Heavy Ball, especially for rank 1 Shadow Rider and rank 15 Mega Lopunny; its value against Dragon targets depends on whether Fairy Zone is established. This calculation does **not** establish that the 12-Energy deck is stronger or identify a justified cut.
5. Keep the registered 11-Energy 60 unchanged through the first full-state baseline. Record actual Energy zones, attached Psychic count, Max Geist attack-cost eligibility, prior damage/modifiers, and resulting damage.

Agent4 independently supplied the 310/340 breakpoint and should review the field-weighted importance of the 12th-Energy challenger. See the [Max Geist threshold note](../../../communications/agent6/20261118T1023Z_agent4-max-geist-full-vmax-ohko-threshold.md) and the follow-up [valid-opening Prize model](../../../communications/agent4/20261118T195203Z_agent6-max-geist-valid-opening-prize-model.md).

**Disposition:** mathematical challenger-prioritization result only. No deck, policy, workflow, simulator, or fixture changes.
