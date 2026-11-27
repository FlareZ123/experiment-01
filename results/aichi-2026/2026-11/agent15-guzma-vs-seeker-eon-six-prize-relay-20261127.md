# A third six-Prize Latias route: Guzma → VS Seeker → Guzma

**Agent 15 | 27 November 2026 | new conditional attack-policy solution, not a full game, matchup win-rate estimate, policy admission, or deck nomination.**

## The concrete line

Both the unchanged Hood Shield Shadow Rider and Deoxys Gate v0 candidates already play **Latias ex SSP 76**, **Lillie's Clefairy ex JTG 56**, **Dimension Valley**, **Guzma BUS 115**, **two VS Seeker PHF 109**, and **Shadow Rider Calyrex VMAX**. The previous [Eon relay](agent15-eon-relay-20261127.md) used **Acerola A2** to reset and heal Latias, then **Pokémon Ranger A3** to clear Eon Blade's next-turn restriction. A different line uses existing Guzma and one VS Seeker to clear that restriction **twice** without returning any attached Energy to hand, provided the source presents two successive valuable Bench targets and replies weakly enough.

For a constructed public field, source Regidrago has one 280-HP VSTAR Active (A1 target), a second 280-HP VSTAR and **two 220-HP Regidrago V Basic** in play/available to promote; Noivern ex's Covert Flight attack is already accessible in the source discard through Apex Dragon. This requires four total Regidrago V physical cards and two VSTAR Evolution cards, and is possible in card counts but **not an assertion that a competent source exposes the board**. The candidate has a healthy 210-HP Active Latias carrying two Psychic Energy, a live Fairy Zone/Dimension Valley, a live Skyliner Ability and a surviving Basic Clefairy as the retreat pivot. Guzma is accessible on A2; a playable VS Seeker can retrieve it from discard on A3. No own retreat has been used on those turns.

| Attack turn | Exact actions | New Prizes |
|---|---|---:|
| **A1** | Eon Blade on first Active Regidrago VSTAR, 200 × 2 Psychic Weakness = 400; Latias receives its next-turn attack restriction | 2 |
| Source reply 1 | Second VSTAR uses Apex Dragon to copy **Covert Flight**; with Muscle Band its 70 damage becomes 90, then Deoxys VMAX Protective DNA reduces it to 60 (or remains 90 in Hood without DNA) | 0 |
| **A2** | **Guzma** the first Benched Regidrago V (220 HP) Active; Guzma switches our Active Latias to Bench and promotes Clefairy. Moving Latias to Bench clears Eon's attack effect. **Retreat Clefairy for zero** using Latias's still-live Skyliner, promote the already funded Latias; Eon KOs Regidrago V | 2 |
| Source reply 2 | Surviving Regidrago VSTAR is again Active and copies **Covert Flight**, with the same stipulated Band/DNA conditions | 0 |
| **A3** | Play **VS Seeker** to recover the discarded Guzma, use Guzma on the other Benched Regidrago V, switch Latias to Bench, promote and freely retreat Clefairy to Latias. Eon KOs the third two-Prize Dragon | 2 |

Under the explicitly stipulated sequence, Latias stays at **two attached Psychic Energy throughout** and the candidate takes six Prizes. With two Band-boosted Covert replies, its remaining HP is **90 with Protective DNA** (60 + 60 damage) or **30 without DNA** (90 + 90); it survives both. There is no Acerola, Ranger, second Guzma copy, recovery of Energy, or more than one Supporter/retreat in any turn. Guzma also removes the source Active's previous Covert protection when that Active is switched to Bench; the fresh chosen target is not itself protected by the old effect.

A more defensive source can avoid, disrupt, or break this exact line. The value is a **specific actor-visible response to an overextended Dragon Bench and a low-damage Covert reply**, not a prediction of source policy.

## Field relevance from the authenticated 29 original lists

The supplied [29/32 published source inventories](../full-decklists.json) have the following exact Regidrago V / Regidrago VSTAR / Noivern ex physical counts:

| Rank | Regidrago V | Regidrago VSTAR | Noivern ex | Four-V + Noivern line possible by inventory? |
|---:|---:|---:|---:|---|
| 10 | 4 | 3 | 0 | No Covert source |
| 12 | 4 | 3 | 1 | **Yes** |
| 13 | 4 | 3 | 1 | **Yes** |
| 14 | 4 | 3 | 1 | **Yes** |
| 18 | 3 | 3 | 0 | No |
| 20 | 4 | 3 | 1 | **Yes** |
| 21 | 3 | 3 | 1 | Insufficient V for this four-V board |
| 27 | 4 | 3 | 1 | **Yes** |
| 32 | 4 | 3 | 1 | **Yes** |

Thus **six authenticated ranks** contain the necessary card counts for this *particular* source-board construction. That is only physical-card capacity, not opening probability, Prize feasibility, optimal source strategy, discard access, or matchup success. Missing source ranks 23/28 are also labeled Regidrago but their sixties remain unavailable. The source may sensibly avoid benching all four V or may evolve those exposed V before they are gusted; the existence of the line gives it a potential reason to do so.

## Executed branch checker and failure cases

[Conditional state-machine source](../../../scripts/2026-11/agent15-guzma-eon-relay.cjs) and [local Node tests](../../../tests/2026-11/agent15-guzma-eon-relay.test.cjs) passed **15 assertions** (including two positive DNA/no-DNA branches and negatives for loss of Valley, Fairy Zone, Skyliner, Guzma, VS Seeker, Item access, the two Benched two-Prize targets, first/second Phantom reply, Ryuno, and pre-damage). Test locally with:

```bash
node tests/2026-11/agent15-guzma-eon-relay.test.cjs
```

The checker holds the source target identities and action sequence fixed, explicitly tracks Latias HP and its two Energy, current Eon cooldown, two distinct Supporter turns, one voluntary retreat on each Guzma turn, and Prize totals. It is **not** a simulation of a native game, does not establish full card-printing rule fidelity, and has no source-opponent policy choosing replies; the positive branch is a constructed tactical witness.

The line fails if the opponent replies with stronger attacks: two Band Phantom Dive hits through DNA are 190 each, so Latias is KO'd by the second; even a first Phantom hit then a second Covert hit KOs a previously fresh Latias. Source gust, Bench-counter KO of Clefairy, Ability lock, Stadium replacement, Item lock preventing VS Seeker, no available two-Prize target on the chosen turns, or unavailable/Prized singleton Guzma also invalidate the line. No normal-switch Item is present in the current candidate, so the double-Guzma sequence is not a free movement resource. If the source promotes an exposed Regidrago V and funds Dragon Laser instead of replaying Covert, it can also create a lethal second reply.

## Practical candidate policy change

**Do not automatically spend Guzma as generic gust or both VS Seeker early in a Dragon matchup.** After Eon takes two Prizes and the source reveals Covert Flight, calculate whether an opponent Bench target worth two Prizes is unprotected and whether the Basic-pivot Guzma bounce is payable. When a second such target is already visible, retaining at least one VS Seeker supports a second Eon without consuming Acerola or Ranger. Conversely, against Phantom Dive/Ryuno or when the source protects its Bench, route toward the prior Acerola/Ranger or VMAX alternatives rather than forcing this relay.

Use only public opponents and actor-visible own hand/board/K1-certified resource knowledge. Any worker integration belongs in the approved successor policy's existing decision logic, not frozen Stage-A, and requires separate review. No decklist, Twinleaf, workflow, fixture, or game was changed.

**Benchmark:** Still no qualified competitive Aichi games; the final single fixed 60 remains unselected, and the 99.5% target is unproven.
