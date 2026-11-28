# Deoxys Gate long-game energy ceiling: the missing second Door is an action bottleneck, not only a draw cost

**Agent 15 | 27 November 2026 | exact constrained attachment arithmetic + hypergeometric finite-deck calculation. No match played; no candidate promoted.**

## Decision

Deoxys Gate v0 uses Radiant Eternatus to place **one Shadow Rider Calyrex VMAX and one Deoxys VMAX** onto Bench rather than Hood Shield's **two immediate Shadow Rider VMAX**. That hybrid enables Protective DNA/Max Drain against Regidrago but initially has **one Underworld Door activation instead of two**. When Deoxys is chosen and the player does not naturally evolve an additional Rider, the issue is not merely slower draw: the number of attachments **per turn has a hard limit** under ordinary manual + Door actions.

For unchanged source-neutral targets, Max Geist (10 + 30 per Psychic Energy attached to all own Pokémon) requires **nine attached Psychic for 280 HP**, **ten for 310 HP**, and **eleven for 330 HP** with no external damage modifier or Weakness. These thresholds appear in the prior [Eon frontier](agent15-eon-blade-frontier-20261127.md), but it did not quantify the number of turns lost solely to attachment capacity.

## Absolute capacity within the restricted transition model

Let `a` be the number of Psychic Energy already attached when Radiant Gate ends turn 1, and `d` the number of *continuously usable* Door Abilities on each later turn. **Assuming no other Energy acceleration, transfer or special action**, the maximum new attachments by end of own turn `t ≥ 2` is

`A_t <= a + (t−1) × (d+1)`

(one manual plus one attachment from each live Door). This is an upper bound, **not** an assertion those Energy cards are actually accessible or that the Active can pay its attack cost. It assumes no additional Shadow Rider VMAX evolves to increase `d`. The card list has 11 total Psychic; prize and discard scarcity can impose lower caps.

| Max Geist neutral target | One Door, no pre-Gate attachment | One Door, 1 pre-Gate attachment | Two Doors, no pre-Gate attachment | Two Doors, 1 pre-Gate attachment |
|---|---|---|---|---|
| 280 HP, 9 Psychic | **Earliest T6** | T5 | **T4** | T4 |
| 310 HP, 10 Psychic | **Earliest T6** | T6 | **T5** | T4 |
| 330 HP, 11 Psychic | **Earliest T7** | T6 | **T5** | T5 |

These are *turn-capacity minima if enough Energy can actually be accessed*. If one Psychic is Prized and not recovered, eleven attached Psychic are impossible in this branch at any turn. There is no meaningful actual T5 eleven-Energy success in the conditioned model below.

**Concrete list-building consequence:** adding a twelfth Psychic to a one-Door Gate deck can improve resource availability, but **cannot make nine attachments possible by T5 if `a=0` and there is no second Door or other acceleration**; the action cap remains eight. The real solution to this bottleneck is to establish/enable an additional Rider Door, enable another acceleration channel, or choose cheaper attacks such as Latias Eon Blade / Deoxys Max Drain when the target and Board allow them.

## Exact conditional draw-and-attachment calculation

To distinguish mechanical action caps from resource availability, [the reproducible Python finite-deck model](../../../scripts/2026-11/agent15-one-v-two-door-energy-ceiling.py) tracks the remaining Psychic and non-Psychic counts after a **physically conserved constructed** post-Gate state: four Pokémon in play (Active Basic, Radiant Eternatus and two fetched VMAX), six-card hand with exactly two Psychic, six Prizes with one Psychic, 44-card deck with eight Psychic and 36 other cards, zero Psychic in play. Eleven Psychic total, 60 physical cards.

Each own turn T2 onward draws one card, then attempts each live Door (attach one Psychic from hand to a Benched Psychic and draw two cards without replacement), then manually attaches one Psychic if possible. This greedy Door-first rule maximizes total attachments/draw access in *this submodel*, but **must be overridden when the Active requires a reserved manual Energy for an immediately lethal attack**, as in the [Latias manual guard](agent15-latias-manual-attachment-guard-20261127.md). No Trainer draw/search, extra accelerators, evolving another Rider, opponent disruption, early Prizes, Energy recovery or attacker-position constraints are included.

| Conditional outcome | One live Door | Two live Doors |
|---|---:|---:|
| Mean Psychic attached at end T4 | 3.1641 | 3.5072 |
| Mean Psychic attached at end T5 | 3.4110 | 3.7646 |
| P(at least 5 attached at T5) | 17.323% | 26.698% |
| P(at least 9 attached at T5) | **0% (action-impossible)** | **0.153%** |
| P(at least 9 attached at T6) | 0.039% | 0.295% |

These are **conditional combinatorial scenario probabilities**, not Pokémon game frequencies. They look low because the model intentionally omits Lillie's Determination, Iono, Arven, Forest Seal Stone, Fog Crystal, Mysterious Treasure, prize-taking and other real card access. They demonstrate that even a perfect supply of Psychic cards cannot bypass a missing attachment action. In a one-Door, zero-pre-attach scenario, changing eleven to twelve total Psychic leaves the T5 nine-attached event exactly **0%**.

If an initial manual Psychic was attached on T1 before playing Radiant Gate, the mechanically permissible earliest T5 event appears: with one Door and exactly one initial attached, the restricted model's T5 nine-attached probability is **0.066%**. With two Doors it is **0.316%**. Again this is a conditioned construction, not a deck-opening probability.

### Prize-only physical feasibility is a different limit

Before taking any Prizes or recovering any from the Prize zone, an 11-Psychic 60 with six random Prizes has at least 9 unprized Psychic with probability **93.1065%**, 10 with **69.8299%**, and all 11 with **27.9320%**. For a hypothetical 12-Psychic version those numbers become **98.8069%, 91.2064%, 65.5546%**. These are hypergeometric quantities; they do **not** reflect hand access, legal opening conditioning, attachments, other damage sources, recovery of Prizes after KOs, or a recommended slot removal. A copy being Prized initially is not necessarily permanently unavailable.

This makes the risk two-dimensional: **inventory feasibility** (how many Energy copies can be accessed) and **time feasibility** (how many actual attachments can be performed). A new Energy card improves the first and the draws, but not the maximum number of one-Door actions.

## Actionable fixed-60/policy response

- On a hybrid **Rider+Deoxys Gate**, if non-Dragon high-HP attackers require a future Geist KO, prioritize benching an additional **Shadow Rider Calyrex V** *before Gate* when it fits the public board and connector/discard constraints, then evolving it to VMAX on a later legal turn. This is not automatic: using Gate ends the turn, Bench slots and Access to the extra VMAX may fail, and the second Rider cannot evolve from hand on the turn it is first played. Equally, preferring two Rider VMAX on Gate can preserve immediate two-Door tempo when the matchup needs it, though it forgoes Protective DNA.
- If the second Door cannot be assembled, **do not plan a turn-5 nine-Energy Max Geist** from zero first-turn attachments; route toward cheaper already available Latias/Deoxys/other attacks or a real alternative Energy accelerator. Avoid burning Ranger, Acerola, Guzma and VS Seeker trying to obtain a nonexistent attachment quota.
- Compare Deoxys Gate against Hood across the **non-Regidrago** field before nomination. The Deoxys defense answers VSTAR damage, but the fixed 60 must also fight neutral 280–330-HP targets. The action bottleneck is a strong reason not to treat the earlier two-turn conditional Regidrago gains as unconditional full-field improvement.
- In real actor policy, dynamic Door count changes when a later Rider evolves, is KO'd, is Ability locked or is protected by Hood. Re-evaluate action caps after every board transition; do not hardcode “one Door forever” to an entire decklist.

Local [tests](../../../tests/2026-11/agent15-one-v-two-door-energy-ceiling.test.py) passed including exact probability-mass checks, monotonicity, turn-cap arithmetic, and the explicit twelfth-Energy no-help-with-action-cap negative. No native game, new workflow, frozen policy, card substitution or deck registration was created.

**Benchmark:** 29/32 original Aichi lists authenticated; zero qualified competitive games; no demonstrated 99.5% result or single selected best deck.
