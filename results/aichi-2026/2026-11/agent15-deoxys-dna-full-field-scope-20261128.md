# Full-field gatekeeping for Deoxys Gate: Protective DNA only directly applies to the VSTAR quarter of the known field

**Agent 15 | 28 November 2026 | exact source-list inventory partition + conditional Energy-action capacity. Not a win-rate estimate or a deck nomination.**

## Central discovery

Our Deoxys Gate v0 challenger uses Radiant Eternatus's Climactic Gate to fetch **Shadow Rider Calyrex VMAX + Deoxys VMAX** instead of the Hood Shield plan's **two Shadow Rider Calyrex VMAX**. Deoxys has a powerful, specific effect: its **Protective DNA** makes **all of your Pokémon take 30 less damage from attacks by the opponent's Pokémon VSTAR** (after Weakness and Resistance). The earlier Regidrago constructions are attractive because their Regidrago VSTAR copies Dragon attacks and still counts as a VSTAR attacker. But an unqualified full-field recommendation would overfit to those VSTAR matchups.

The supplied Aichi published source inventories establish a hard, simple limitation on this Ability's **direct defensive effect**:

| Aichi 2026 Top32 source-list group | Count | Exact ranks |
|---|---:|---|
| Authenticated decks containing any Pokémon VSTAR | **9** | 10, 12, 13, 14, 18, 20, 21, 27, 32 |
| Authenticated decks containing **no** Pokémon VSTAR | **20** | 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 15, 16, 17, 19, 22, 24, 26, 29, 30, 31 |
| Published source lists missing | **3** | 23, 25, 28 |

All **nine** VSTAR-bearing source lists are **Regidrago** lists. Every one of the other **20 published sixties** lacks a VSTAR printing entirely. This is **9/29 = 31.03%** of authenticated ranks with a potential VSTAR damage source, not a 31% encounter probability. Even if all three missing ranks contained VSTAR attackers, at least **20/32 (62.5%)** of the mandated Top32 would have no VSTAR printed in their authenticated 60. The additional unknown cards and the absence of validated games prevent assigning matchup win probabilities.

**Direct implication:** Protective DNA cannot reduce attack damage from a Pokémon that is not VSTAR, regardless of whether it is a Pokémon ex, Pokémon-GX or VMAX. Against a published list with no VSTAR, and absent an extraordinary effect producing an otherwise unlisted VSTAR, that particular defensive Ability cannot trigger.

This does **not** make Deoxys VMAX generally useless in those matchups: its 330 HP, Max Drain's 160 damage and 30 healing, its Psychic typing, Prize geometry and use as a backup attacker may still have value. It also does not guarantee DNA matters against Regidrago: the source must attack with a VSTAR, DNA must not be Ability-locked, and attack damage rather than damage counters must be involved.

## What hybrid Gate gives up outside its protection scope

The [one-Door action-ceiling analysis](agent15-one-door-attachment-action-ceiling-20261127.md) established a complementary cost: fetching **one** Rider VMAX with Deoxys yields only **one immediate Underworld Door**, whereas fetching **two** Riders yields up to **two**. Each usable Door can attach one Psychic from hand to a Benched Psychic and draw two cards. When both Riders are otherwise legal, the second is a *real attachment-and-draw resource*, not just a redundant attacker.

In a **restricted state where the hybrid establishes no additional Rider Door** and has no other Energy accelerators, the maximum attached Psychic by end of own turn `t` is

`A_t ≤ a + (t−1) × (d+1)`,

where `a` is the number attached by the end of the first turn and `d` the number of live Doors on each later turn. From `a=0`, one Door gives a turn-five capacity at most **8 Psychic**, while two Doors allow up to **12**, subject to actual deck availability. Shadow Rider Max Geist at neutral damage uses `10 + 30×(number of your Psychic Energy in play)`; to one-hit 280HP requires9, 310HP10 and 330HP11. Thus, with no extra Rider/acceleration and no damage modifiers, one-Door T5 **cannot** one-hit a fresh neutral 280+ HP attacker regardless of hand draw volume.

[Actor-only T1→T2 restoration](agent15-actor-only-second-door-discard-policy-20261128.md) supplies a real possible repair: establish an extra Rider V before Gate and evolve it on T2. That line is neither guaranteed nor free; it competes for search, discard, Bench, Tool/Supporter and evolution timing. A candidate that casually fetches Deoxys cannot assume the second Door automatically comes back.

## Source retaliation limits the narrow upside

The [Counter Catcher Clefairy analysis](agent15-aichi-counter-catcher-fairy-zone-collapse-20261128.md) is an additional caution within the nine VSTAR matchups: ranks12,14,21,32 physically include Counter Catcher+Muscle Band+Dragapult ex, allowing a conditional source `Counter Catcher → Clefairy ex → copied Band Phantom Dive` that KOs the 190HP Fairy Zone host exactly through DNA (200+20−30=190). That removes the Psychic weakness powering Deoxys's 320 Max Drain KOs until Clefairy is restored. Ranks14,21,32 also have a Rolling Iron payload to add80 damage reduction, requiring still more repair. Deoxys is not an unconditional Regidrago auto-win; the defensive gain must be tested against source best replies and Fairy Zone recovery.

## Candidate decision and implementation rules

Treat the Gate pair as a **state- and matchup-dependent choice**, not as a simple always-Deoxys deck upgrade:

1. **If a non-VSTAR opponent and no live Deoxys-specific attacking/healing purpose exists**, favor considering two Rider VMAX for the second Door when both are physically available and payable. Under those stated assumptions the extra Door offers an additional attachment+draw option and Protective DNA has no direct target. This is conditional, not global dominance: HP, Bench and other effects may alter the decision.
2. **If a VSTAR source is active or plausibly approaching**, evaluate DNA's exact potential damage reduction, source gust access, Clefairy survivability, realistic Deoxys Max Drain funding, and the risk of giving up the second Door in all later turns. Don't convert a conditional 30-point mitigation into an untested matchup-win claim.
3. **If the second Rider V can be established before Climactic Gate**, preserve a reachable VMAX evolution connector for T2 when that restores the second Door without sacrificing a stronger present-turn attack. The actor-only K0 model now supplies reproducible search and discard decision tests.
4. **Against Ability/Item/Supporter lock**, recompute which abilities and connectors actually function. DNA may be suppressed, the extra Door may also be suppressed, or a needed Clefairy repair route may be unavailable.
5. **Evaluate all 32 ranks**, not only the nine Regidrago opponents. The 20 confirmed non-VSTAR cases should be major validation cases for tempo and damage, not a footnote to the more visually interesting VSTAR counterattacks.

## Evidence and limits

The simple [reproducible VSTAR inventory scan](../../../scripts/2026-11/agent15-vstar-field-coverage.py) reads only the authenticated `results/aichi-2026/full-decklists.json` and checks printed VSTAR names. A matching [regression](../../../tests/2026-11/agent15-vstar-field-coverage.test.py) asserts 29/32 inventory coverage, exactly nine VSTAR-bearing ranks, exactly 20 VSTAR-free ranks, and the three missing source ranks. The same partition was independently executed against current repository source contents using the GitHub-connected runtime. No guess about missing sixties is introduced.

The attack/ability/energy constraints come from the supplied English card corpus and Advanced Player's Rulebook; this is not a native game, head-to-head test or a validation of opponent policy. The Aichi benchmark remains **zero qualified competitive matchup outcomes**, no proven 99.5%, and no selected best 60.

**Research priority:** Before promoting Deoxys Gate, demonstrate that its net gain against the nine published VSTAR lists outweighs its possible second-Door/neutral-damage losses against at least the 20 published non-VSTAR lists, under identical whole-game decision policies and all source responses. Until that evidence exists, **keep the existing leading Hood Shield fixed 60 as the public baseline**, not a prematurely promoted hybrid.
