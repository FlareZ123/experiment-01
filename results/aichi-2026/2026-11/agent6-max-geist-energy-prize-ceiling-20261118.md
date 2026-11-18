# Max Geist's 11-Energy VMAX breakpoint versus the fixed 11-Energy list

**Agent 6 · 18 November 2026**

## Finding

Shadow Rider Calyrex VMAX's Max Geist does (10+30m) damage, where (m) is the number of Psychic Energy attached to all of the attacking player's Pokémon. Against an undamaged 320-HP Shadow Rider VMAX with no other modifiers:

- 10 Psychic Energy attached: 310 damage, not a knockout.
- 11 Psychic Energy attached: 340 damage, a full-HP knockout.

The fixed Hood Shield Shadow Rider v1 list contains exactly 11 Psychic Energy and 14 Basic Pokémon. The published 60 includes **Raihan**, which attaches a Basic Energy from the discard pile, and **Night Stretcher**, which returns a Basic Energy from the discard pile to hand. Neither retrieves a Prized Energy. If even one of the 11 Energy is Prized, at most 10 remain outside Prizes at setup; consequently, the initial non-Prized Energy pool cannot support 340-damage Max Geist until a Prized Energy is actually taken (or another effect changes damage/available Energy). Normal Prize-taking can later recover a Prized Energy; this analysis does not model when that happens. Discard recycling does not change the initial outside-Prize count. This is an initial-availability ceiling, not a prediction of when the Energy will be drawn or attached.

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

def p_at_least_k_outside_prizes(n_energy, k_required, basics=14, deck=60,
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
            max_prized_energy = n_energy - k_required

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
    print(f">=11 outside, n={n}: {p_at_least_k_outside_prizes(n, 11):.10f}")
for n in (12, 13):
    print(f">=12 outside, n={n}: {p_at_least_k_outside_prizes(n, 12):.10f}")
```

Expected rounded output:

```text
11 0.2766102925
12 0.6522274220
13 0.8888900903
```

## Field exposure caveat

I matched the exact Pokémon printings in the 29 published opponent lists in [`full-decklists.json`](../full-decklists.json) to the supplied English card pool. The 320+ HP Pokémon are not all equivalent Max Geist targets:

- **Rank 1:** Shadow Rider Calyrex VMAX (CRE 75), 320 HP, Psychic type.
- **Rank 15:** Mega Lopunny ex (PFL 84), 330 HP, Colorless type.
- **Regidrago ranks 10, 12, 13, 14, 18, 20, 21, 27 and 32:** Dragon toolbox Pokémon including Dragapult ex (TWM 130, 320 HP), Salamence ex (JTG 114, 320 HP), and Mega Dragonite ex (ASC 152, 370 HP).
- **Rank 5:** Mew VMAX (FST 114), 310 HP; **rank 18:** Mega Kangaskhan ex (MEG 104), 300 HP.

The candidate's Lillie's Clefairy ex has Fairy Zone, which gives opposing Dragon Pokémon Psychic Weakness ×2. Against Dragon targets, Max Geist therefore deals `20 + 60E`: `E=5` reaches 320 damage and `E=6` reaches 380. The 11-Energy non-Dragon breakpoint is not needed against those Dragon toolbox Pokémon while Fairy Zone is active. Those cards may also be used as Regidrago discard-pile attack sources rather than played as Active targets. The direct 11-Energy / 320+ non-Dragon breakpoint is principally relevant to **rank 1 and rank 15** among the 29 published lists, plus Regidrago states where Fairy Zone is unavailable. The three missing opponent lists (ranks 23, 25 and 28) remain unclassified.

Mega Dragonite ex at 370 HP would require 12 attached Psychic Energy for a non-weakness 370-damage Max Geist; the current 11-Energy list cannot reach that threshold. For the same valid-opening-conditioned Prize-only model, the probability of retaining at least 12 Energy outside Prizes is **24.2463%** with 12 copies and **60.9198%** with 13 copies. With Fairy Zone active, the Dragon weakness again changes the calculation and only 6 attached Psychic Energy are needed for 370 damage.

Exact card-text checks: [Shadow Rider Calyrex VMAX / Max Geist](../../../resources/cards/en/swsh6.json), [Dragapult ex](../../../resources/cards/en/sv6.json), [Salamence ex](../../../resources/cards/en/sv9.json), [Mega Dragonite ex and Lillie's Clefairy ex](../../../resources/cards/en/me2pt5.json), [Mega Lopunny ex](../../../resources/cards/en/me2.json), [Mew VMAX](../../../resources/cards/en/swsh8.json), [Mega Kangaskhan ex and Night Stretcher](../../../resources/cards/en/me1.json), and [Raihan](../../../resources/cards/en/swsh7.json).

## Strategic interpretation and limitations

1. This is an initial Prize-only availability ceiling. It does not estimate whether the Energy are drawn and attached by the relevant Max Geist turn, whether the attacking Pokémon has the three-Colorless attack cost paid, or when a Prized Energy is later taken through ordinary Prize-taking.
2. It does not model Energy discarded for search costs, the timing or availability of discard recovery (the list includes Raihan and Night Stretcher), previous attacks, damage modifiers, opponent disruption, or game outcomes. Neither discard-recovery card retrieves a Prized Energy; ordinary Prize-taking can do so later, but its timing is not modeled.
3. It conditions on the candidate's valid opening hand. It does not simulate the opponent's paired mulligan or bonus draws; those draws do not alter the candidate's six Prize cards.
4. A 12th Psychic Energy is therefore a high-priority challenger to evaluate against the second Heavy Ball, especially for rank 1 Shadow Rider and rank 15 Mega Lopunny; its value against Dragon targets depends on whether Fairy Zone is established. This calculation does **not** establish that the 12-Energy deck is stronger or identify a justified cut.
5. Keep the registered 11-Energy 60 unchanged through the first full-state baseline. Record actual Energy zones, attached Psychic count, Max Geist attack-cost eligibility, prior damage/modifiers, and resulting damage.

Agent4 independently supplied the 310/340 breakpoint and should review the field-weighted importance of the 12th-Energy challenger. See the [Max Geist threshold note](../../../communications/agent6/20261118T1023Z_agent4-max-geist-full-vmax-ohko-threshold.md) and the follow-up [valid-opening Prize model](../../../communications/agent4/20261118T195203Z_agent6-max-geist-valid-opening-prize-model.md).

**Disposition:** mathematical challenger-prioritization result only. No deck, policy, workflow, simulator, or fixture changes.


## One-slot challenger comparator: 12th Psychic Energy versus second Hisuian Heavy Ball

This appendix quantifies the *Prize-access* side of the unresolved one-slot question without changing the registered 11-Energy list. It is not a matchup or win-rate model.

### Exact deck partition

The fixed 60 contains 14 Basic Pokémon, 11 Psychic Energy, one Hisuian Heavy Ball, and 34 other cards. Of the 14 Basics, eight are singletons (Tapu Lele-GX, Trevenant & Dusknoir-GX, Latias ex, Dialga-GX, Mimikyu, Girafarig, Marshadow, Radiant Eternatus); two are Lillie's Clefairy ex; four are Shadow Rider Calyrex V. The VMAX cards are not Basics.

Compare two hypothetical one-slot challengers, each retaining 14 Basics and 60 cards:

- **Energy challenger:** 12 Psychic Energy, one Heavy Ball, 33 other cards.
- **Heavy Ball challenger:** 11 Psychic Energy, two Heavy Balls, 33 other cards.

The Energy challenger retains the baseline Heavy Ball count; the Heavy Ball challenger retains the baseline Energy count.

### Prize-rescue results

All figures condition on a valid seven-card opening (at least one Basic), then deal six initial Prize cards from the remaining 53. A card in this initial Prize set may later be taken normally; the model does not simulate Prize-taking order or timing. “Seen by turn 2” means opening hand plus only the natural draws through the candidate's second turn: one draw when going first, two when going second. Opponent mulligan bonuses, Supporter draws, Underworld Door draws, Arven searches, Tapu Lele-GX, and other search lines are deliberately excluded from this direct-access measure.

| Conditional probability | One Heavy Ball | Two Heavy Balls |
|---|---:|---:|
| Every Heavy Ball copy is Prized | 10.0647% | 0.8584% |
| At least one of the eight singleton Basics is Prized | 58.5005% | 58.5005% |
| At least two singleton Basics are Prized | 17.1382% | 17.1382% |
| At least one Heavy Ball seen by candidate turn 2, going first | 12.7728% | 24.1158% |
| At least one Heavy Ball seen by candidate turn 2, going second | 14.4503% | 27.0344% |
| Heavy Ball seen by turn 2 **and** at least one singleton Basic Prized, going first | 7.5440% | 14.2354% |
| Heavy Ball seen by turn 2 **and** at least one singleton Basic Prized, going second | 8.5373% | 15.9612% |
| All Heavy Ball copies Prized **and** at least one singleton Basic Prized | 5.2629% | 0.3863% |
| At least one singleton Basic Prized and at least one Heavy Ball outside Prizes | 53.2376% | 58.1142% |

With two copies, the chance of seeing both Heavy Balls naturally by turn 2 *and* having at least two singleton Basics in Prizes is only 0.2566% going first / 0.3355% going second. That is a deliberately narrow natural-draw lower bound, not the full second-copy value.

### Interpretation

- The 12th Energy raises the existing Prize-only probability of retaining at least 11 Energy outside Prizes from **27.6610% to 65.2227%** (+37.5617 percentage points). It directly improves the *possible* unmodified 340-damage Max Geist ceiling against a 320-HP non-weak target; it does not prove those Energy can be drawn and attached in time.
- The second Heavy Ball reduces the probability that every copy is trapped in Prizes from **10.0647% to 0.8584%**. The chance of at least one singleton Basic being Prized while at least one Heavy Ball remains outside Prizes rises from **53.2376% to 58.1142%**; this is a not-prize-locked opportunity, not a guarantee that Arven or a natural draw accesses it. It also increases natural-draw access by turn 2, and increases the joint chance of a Heavy Ball being seen while a singleton Basic is Prized.
- This broad singleton/availability model is **not** the targeted Copycat → Apex → Timeless core min-cut. The existing 1-Mimikyu / 1-Dialga-GX / 1-Heavy-Ball model gives a **2.366909%** optimistic Prize-zone capacity cut with one Heavy Ball and **0.219492%** with two, conditional on a valid opening and assuming an unprized Heavy Ball is accessible and usable. Heavy Ball is an Item, so Vileplume AOR3/Budew Item lock can invalidate that optimistic assumption. See [Agent35's exact reconciliation](agent35-copycat-heavyball-prize-risk-reconciliation-20261117.md); keep the two estimands separate.
- The Heavy Ball access figures are conservative for actual play: Arven can search one Item and one Pokémon Tool, and the candidate has Arven plus two VS Seeker. The calculation does not model Arven/VS Seeker access, the competing value of the Tool search, Supporter contention, or which singleton is strategically necessary in a given matchup. If a Heavy Ball remains in the deck, Arven may find it; if all copies are Prized, it cannot. The identity of the card cut to add either challenger is unspecified; the model treats all remaining non-Basic/non-Energy/non-Heavy-Ball cards as exchangeable and therefore assigns no tactical value or cost to that cut.
- The eight-singleton Prize event is an *opportunity* for recovery, not proof that a particular one-of is needed. A Prized singleton only matters if its role is required in that game. Conversely, a second Heavy Ball can recover a second Basic from Prizes only when both copies become accessible and two recoveries are actually useful.
- These are different estimands: the Energy calculation measures a damage-ceiling prerequisite; the Heavy Ball calculation measures access to Prize recovery. The percentage-point changes are not directly comparable and must not be interpreted as relative win-rate gains.

### Reproduction

The following standard-library Python enumerates valid opening compositions, Prize compositions, and natural draws. The eight singleton Basics are separated from the other six Basics; all other non-Energy/non-Heavy-Ball cards are exchangeable for this calculation.

~~~python
from math import comb

def heavy_ball_prize_model(energy, heavy_balls, draws,
                           deck=60, basics=14, singletons=8,
                           opening=7, prizes=6):
    other = deck - basics - energy - heavy_balls
    prize_den = comb(deck - opening, prizes)
    draw_den = comb(deck - opening - prizes, draws)
    valid_openings = 0
    totals = {
        "all_heavy_balls_prized": 0.0,
        "heavy_ball_seen": 0.0,
        "singleton_prized_ge1": 0.0,
        "singleton_prized_ge2": 0.0,
        "heavy_seen_and_singleton_prized": 0.0,
        "two_heavy_seen_and_two_singletons_prized": 0.0,
        "all_heavy_prized_and_singleton_prized": 0.0,
    }

    # Opening categories: singleton Basics, other Basics, Energy,
    # Heavy Ball, and all remaining cards.
    for s0 in range(min(singletons, opening) + 1):
        for b0 in range(min(basics - singletons, opening - s0) + 1):
            for e0 in range(min(energy, opening - s0 - b0) + 1):
                for h0 in range(min(heavy_balls, opening - s0 - b0 - e0) + 1):
                    o0 = opening - s0 - b0 - e0 - h0
                    if not 0 <= o0 <= other or s0 + b0 == 0:
                        continue

                    opening_ways = (
                        comb(singletons, s0)
                        * comb(basics - singletons, b0)
                        * comb(energy, e0)
                        * comb(heavy_balls, h0)
                        * comb(other, o0)
                    )
                    valid_openings += opening_ways

                    remaining = [
                        singletons - s0,
                        basics - singletons - b0,
                        energy - e0,
                        heavy_balls - h0,
                        other - o0,
                    ]

                    for ks in range(min(remaining[0], prizes) + 1):
                        for kb in range(min(remaining[1], prizes - ks) + 1):
                            for ke in range(min(remaining[2], prizes - ks - kb) + 1):
                                for kh in range(min(remaining[3], prizes - ks - kb - ke) + 1):
                                    ko = prizes - ks - kb - ke - kh
                                    if not 0 <= ko <= remaining[4]:
                                        continue

                                    prize_ways = (
                                        comb(remaining[0], ks)
                                        * comb(remaining[1], kb)
                                        * comb(remaining[2], ke)
                                        * comb(remaining[3], kh)
                                        * comb(remaining[4], ko)
                                    )
                                    p_prizes = prize_ways / prize_den
                                    heavy_after_prizes = remaining[3] - kh
                                    non_heavy_after_prizes = (
                                        deck - opening - prizes - heavy_after_prizes
                                    )

                                    def p_seen_at_least(total):
                                        need = max(0, total - h0)
                                        return sum(
                                            comb(heavy_after_prizes, j)
                                            * comb(non_heavy_after_prizes, draws - j)
                                            for j in range(need, min(heavy_after_prizes, draws) + 1)
                                            if 0 <= draws - j <= non_heavy_after_prizes
                                        ) / draw_den

                                    weight = opening_ways * p_prizes
                                    p_h1 = p_seen_at_least(1)
                                    p_h2 = p_seen_at_least(2)

                                    if kh == heavy_balls:
                                        totals["all_heavy_balls_prized"] += weight
                                    totals["heavy_ball_seen"] += weight * p_h1

                                    if ks >= 1:
                                        totals["singleton_prized_ge1"] += weight
                                        totals["heavy_seen_and_singleton_prized"] += weight * p_h1
                                        if kh == heavy_balls:
                                            totals["all_heavy_prized_and_singleton_prized"] += weight

                                    if ks >= 2:
                                        totals["singleton_prized_ge2"] += weight
                                        totals["two_heavy_seen_and_two_singletons_prized"] += weight * p_h2

    return {key: value / valid_openings for key, value in totals.items()}

for copies in (1, 2):
    for draws, seat in ((1, "going first"), (2, "going second")):
        print(copies, seat, heavy_ball_prize_model(11, copies, draws))
~~~

**Disposition:** this narrows the prize-access tradeoff but does not select a cut. Keep the registered 11-Energy / one-Heavy-Ball 60 unchanged through the first accepted natural-terminal baseline; compare the challengers only afterward under the same frozen opponent field and decision policy.
