# Agent1 — Aichi field Copycat target map

**15 November 2026 · card-text/rules analysis · no gameplay or win-rate claim**

## Why this exists

The Hood Shield Shadow Rider v1 60 contains one Mimikyu GRI 58. Its documented Regidrago counter-line is important, but Copycat is not a Regidrago-only card. The published Aichi opponent inventories contain several other non-GX attacks with potentially decisive effects.

This note maps useful *potential* Copycat targets across the authenticated field so a future policy review can distinguish:
- an attack that is actually eligible because the opponent used it last turn;
- an attack that merely appears on an opponent's list;
- an attack copied directly;
- an attack that the opponent accessed through another attack such as Regidrago's Apex Dragon.

This is a target inventory and rules derivation, not a simulation result, matchup estimate, policy implementation, or recommendation to change the fixed 60.

## Scope and denominator

Inputs:
- `results/aichi-2026/full-decklists.json`: 29 published original lists; ranks 23, 25 and 28 remain unavailable.
- `results/README.md`: 24 of the 29 published lists pass the current English Expanded identity/deck-construction/banlist screen; ranks 3, 6, 7, 24 and 29 contain Japanese-only promotional identities and are not unchanged international-Expanded lists under the strict contract.
- `resources/cards/en/*.json`: card text and printing identities.
- `resources/manual/EN_advanced_manual-2025-transcription-structured.md`: C-18, “Use it as this attack.”
- `results/aichi-2026/candidate-hood-shadow-rider.json`: the fixed candidate inventory.

Counts below distinguish the 24 strict diagnostic lists from all 29 published source lists. The three missing lists are not reconstructed. Ranks 23 and 28 are labelled Regidrago in the source index, but their missing card identities and attack payloads are unknown.

## Copycat execution contract

Mimikyu GRI 58 Copycat costs Psychic + Colorless and says to use an attack that the opponent's Pokémon used during its last turn, provided that attack is not a GX attack.

The advanced manual's C-18 says “use it as this attack” means performing all effects and damage of the chosen attack, even without the chosen attack's Energy, unless that attack specifies otherwise. The manual also illustrates that the copying Pokémon's attack name remains its own copying-attack name. For this candidate:

1. **The actual last-turn attack is the gate.** A card being present in the opponent's deck does not make its attack available. A GX attack used last turn is not a legal Copycat target.
2. **Mimikyu pays its own Copycat cost.** It does not separately pay the copied attack's printed Energy cost. Copycat's live cost is one Psychic with Dimension Valley, two Energy with no reducing/increasing Stadium effect, and three Energy under Wondrous Labyrinth.
3. **“Your Pokémon” and “this Pokémon” refer to the copying side and Mimikyu.** A copied effect does not let the candidate use the opponent's discard pile, Bench, or attached Energy.
4. **Attack history must be exact.** If Regidrago uses Apex Dragon to access a Dragon attack, the attack it actually declared is Apex Dragon. Mimikyu copies Apex Dragon, then Apex Dragon resolves using the candidate's own discard pile. Do not label the opponent's underlying Dragon payload as the last attack.
5. **A copied attack can still impose costs or restrictions on Mimikyu.** For example, copied Techno Blast can prevent Mimikyu attacking next turn; copied Snorlax Collapse can make Mimikyu Asleep. Do not score copied damage without its copied effects.

**Weakness/Resistance uses Mimikyu's type.** The official Pokémon Card Game basic-rules FAQ says the type used for Weakness/Resistance is the type of the Pokémon that used the attack; the Energy symbols required for the attack and attached Energy types are irrelevant ([official rules](https://www.pokemon-card.com/howtoplay/), Q&A on Weakness/Resistance). Therefore a copied attack is a Psychic attack for this Mimikyu, subject to the defending Pokémon's Psychic Weakness and effects such as the candidate's Fairy Zone. Do not infer attack type from the copied attack's printed Energy cost. Attacks that explicitly ignore Weakness/Resistance, such as Tapu Lele-GX's Energy Drive, remain exceptions.

The current V3 host/engine still has the documented Copycat compatibility gap; none of the opportunities below are V3-executable or competitive evidence today. See `results/methodology/2026-11/agent49-mimikyu-copycat-regidrago-timeless-als-20261113.md`, `results/twinleaf/mimikyu-extra-turn-progression.md`, and `communications/agent49/20261114T1901Z_agent13-copycat-current-v3-support-caveat.md`.

## High-value potential targets

| Opponent rank(s) | Card / actual attack | What Mimikyu could do if that attack was used last turn | Important condition or cost |
|---|---|---|---|
| 1 | Shadow Rider Calyrex VMAX CRE 75 — **Max Geist** | (10 + 30E) damage, where (E) is Psychic Energy attached across the candidate's Pokémon. The candidate's own energy board, not the opponent's, sets the value. | Requires a sufficiently developed Psychic-energy board; evaluate the actual total at the Copycat decision. |
| 1 | Trevenant & Dusknoir-GX SMP SM217 — **Night Watch** | 150 damage and shuffle two random cards from the opponent's hand into their deck. | Night Watch is non-GX and copyable; Pale Moon-GX is not. |
| 1 and 17 other lists | Tapu Lele-GX GRI 60 — **Energy Drive** | (20 	imes) the Energy attached to both Active Pokémon; the attack's damage ignores Weakness and Resistance. | Tapu Lele-GX appears in 18/24 strict lists (also 18/29 published lists), but many copies are likely played for Wonder Tag rather than attacking. Presence is not attack frequency. Tapu Cure-GX is not copyable. |
| 8, 9, 11, 16, 22 | Mega Absol ex MEG 86 — **Terminal Period** / **Claw of Darkness** | Terminal Period Knocks Out the opponent's Active Pokémon if it has exactly six damage counters. Claw of Darkness deals 200 and lets the attacker reveal the opponent's hand and discard a card. | Terminal Period is an exact-state KO condition, not damage; Claw of Darkness is a 200-damage plus hand-disruption line. Both are non-GX attacks. |
| 22 | Vikavolt V DAA 60 — **Paralyzing Bolt** | 50 damage and prevent the opponent from playing Item cards from hand during their next turn. | A low-damage but potentially decisive Item-lock copy. Only rank 22 contains Vikavolt V in the published lists. |
| 15 | Mega Lopunny ex PFL 84 — **Gale Thrust** | **230 damage** if Mimikyu itself moved from the Bench to the Active Spot this turn (60 + 170). | This is a particularly useful interaction with the candidate's Guzma and Underworld Door. Keep Mimikyu Benched, attach Energy to it with Underworld Door, then use Guzma to bring it Active while gusting an opposing Benched Pokémon. The copied Gale Thrust condition is then true for Mimikyu. Requires Guzma in hand (or VS Seeker access while Items remain playable), an opposing Bench target, unused Supporter, available Underworld Door, and a fully paid live Copycat cost. In this specific Lopunny/Vileplume matchup, a live Vileplume Ability lock blocks VS Seeker, so do not treat the candidate's two VS Seeker as live Guzma outs unless the lock is absent or cleared. |
| 2, 15 | Bunnelby PRC 121 — **Burrow** / **Rototiller** | Burrow discards the top card of the opponent's deck; Rototiller shuffles a card from the candidate's discard pile into its deck. | These are utility lines for control/recovery, not raw damage. Bunnelby appears in 3/24 strict lists and 4/29 published lists (rank 3 is cross-format-only). |
| 2 | Vileplume-GX CEC 4 — **Massive Bloom** | Up to 180 damage, reduced by 10 for each damage counter on Mimikyu. | Non-GX attack and copyable; the copied damage reduction uses Mimikyu's own damage counters. Allergic Explosion-GX is not copyable. |
| 2, 15 | Pidgeot ex OBF 164 — **Blustery Wind** | 120 damage and may discard a Stadium in play. | Useful utility if a Stadium needs to be removed; Pidgeot ex appears in both strict lists using it. |
| 5 | Mew VMAX FST 114 — **Max Miracle** | 130 damage that is not affected by effects on the opponent's Active Pokémon. | A clean attack-effect answer to certain defensive effects. |
| 5 | Genesect V FST 185 — **Techno Blast** | 210 damage. | The copied “During your next turn, this Pokémon can't attack” restriction applies to Mimikyu; price the cooldown. |
| 4, 9, 17, 31 | Gengar & Mimikyu-GX TEU 53 — **Poltergeist** | Reveal the opponent's hand and deal 50 damage for each Trainer card found there. | Non-GX and potentially very high damage when the opponent has a Trainer-heavy hand. Horror House-GX is not copyable. The card appears in 4/24 strict lists. |
| 19 | Raging Bolt ex TEF 123 — **Bellowing Thunder** | Discard any amount of Basic Energy from the candidate's Pokémon; deal 70 damage per card discarded. | “Your Pokémon” means the candidate's board, so Psychic Energy can be discarded. Against a Dragon Active with the candidate's Fairy Zone active, two Psychic Energy discarded give 140 base damage, doubled to 280—enough to Knock Out a 240-HP Raging Bolt ex. This is a conditional, high-cost counterline, not a free 280. |
| 30 | Lillie's Clefairy ex JTG 56 — **Full Moon Rondo** | 20 + 20 for each Benched Pokémon on both sides. | The Bench count is evaluated on the current board. The candidate's Fairy Zone can double Psychic damage against a Dragon target, but the rank-30 Clefairy deck itself is not a Dragon matchup. |
| 31 | Dusknoir PRE 37 — **Shadow Bind** | 150 damage and the Defending Pokémon cannot retreat during the opponent's next turn. | Non-GX; the retreat restriction is applied by Mimikyu's copied attack. |
| 31 | Chimecho CIN 43 — **Bell of Silence** | 10 damage and prevent the opponent from playing Pokémon with Abilities from hand during their next turn. | Low damage, potentially relevant hand-deployment lock. |
| 31 | Gengar & Mimikyu-GX TEU 53 — **Poltergeist** | As above: 50 per Trainer in the opponent's hand. | The opponent must have actually used Poltergeist, not Horror House-GX. |

### Additional targets and negative examples

- **Crobat V DAA 104 — Venomous Fang:** 70 damage and Poison. Crobat V appears in 13/24 strict lists (13/29 published lists). This is broad potential coverage, but the card is often present for Dark Asset rather than its attack.
- **Noivern ex PAL 153 — Dominating Echo:** 140 damage and the opponent cannot play Special Energy or Stadium cards from hand next turn. It appears in seven Regidrago lists. It is copyable only if Noivern actually used Dominating Echo; when Regidrago used Apex Dragon to access it, Copycat sees Apex Dragon instead.
- **Dragapult ex TWM 130 — Phantom Dive:** 200 damage plus six damage counters distributed among the opponent's Benched Pokémon. It is a Regidrago payload, but if the opponent used Apex Dragon to access Phantom Dive, the declared last-turn attack remains Apex Dragon; do not count Phantom Dive as the Copycat target.
- **Kyurem SFA 47 — Trifrost:** 110 damage to three opposing Pokémon and discard all Energy from the attacker. If copied directly, the discard applies to Mimikyu. Kyurem appears in nine Regidrago lists, but an Apex Dragon that chooses Trifrost is still an Apex Dragon declaration; Mimikyu's copied Apex Dragon uses the candidate's own Dragon discard pile, not the opponent's Kyurem.
- **Hisuian Goodra VSTAR LOR 136 — Rolling Iron:** 200 damage and Mimikyu would take 80 less damage from attacks during the opponent's next turn. Again, only a direct Rolling Iron declaration is a Copycat target; an Apex Dragon declaration is not.
- **Mew VMAX FST 114 — Cross Fusion Strike:** the effect chooses an attack from **your Benched Fusion Strike Pokémon**. The candidate has no Fusion Strike Pokémon, so this copied attack has no available target under the C-18 pronoun scope. Do not assume Mimikyu can use the opponent's Bench.
- **Alolan Raichu UNM 57 — Electro Rain:** the effect discards Lightning Energy from **this Pokémon** and deals 30 per Energy discarded. The candidate's fixed 60 contains Psychic Energy only; absent a Lightning Energy source on Mimikyu, this is a zero-damage copy.
- **Meloetta ex BLK 44 — Echoed Voice:** its delayed bonus refers to this Pokémon's Echoed Voice attack. Because the manual says the copying attack name remains Copycat, the follow-up bonus should not be assumed to apply to a later Copycat; this particular interaction remains a rules/engine test question.
- **Snorlax PGO 55 — Collapse:** 150 damage, but Mimikyu would also become Asleep. Snorlax appears only in ranks 3 and 7, which are cross-format-only under the strict opponent contract.
- **Galarian Stunfisk SSH 132 — Damage Rush:** variable 30-damage increments from coin flips until tails. It is in rank 3 (cross-format-only) and is high variance.
- **Mimikyu PAL 97 — Ghost Eye:** place seven damage counters on the opponent's Active Pokémon. This is an extremely high-impact copy target if used last turn, but it appears only in ranks 3 and 7, both cross-format-only. Do not silently include it in a strict Expanded-vs-Expanded estimate.
- **Iron Thorns ex TWM 77 — Volt Cyclone:** 140 damage and move an Energy from Mimikyu to one of the candidate's Benched Pokémon. It appears in ranks 6, 24 and 29, all cross-format-only under the strict contract.

## Field coverage counts

These are **card-presence counts**, not observed attack frequencies or matchup probabilities.

| Potential target carrier | Strict Expanded diagnostic lists (of 24) | All published lists (of 29) |
|---|---:|---:|
| Tapu Lele-GX (Energy Drive) | 18 | 18 |
| Crobat V (Venomous Fang) | 13 | 13 |
| Regidrago VSTAR (Apex Dragon) | 9 | 9 |
| Mega Absol ex (Terminal Period / Claw of Darkness) | 5 | 5 |
| Gengar & Mimikyu-GX (Poltergeist) | 4 | 4 |
| Bunnelby (Burrow / Rototiller) | 3 | 4 |
| Lillie's Clefairy ex (Full Moon Rondo) | 3 | 3 |
| Pidgeot ex (Blustery Wind) | 2 | 2 |
| Alolan Raichu (Electro Rain) | 2 | 2 |
| Mega Lopunny ex (Gale Thrust) | 1 | 1 |
| Raging Bolt ex (Bellowing Thunder) | 1 | 1 |
| Vikavolt V (Paralyzing Bolt) | 1 | 1 |
| Chimecho / Dusknoir (Bell of Silence / Shadow Bind) | 1 | 1 |
| Mimikyu PAL 97 (Ghost Eye) | 0 | 2 |
| Iron Thorns ex (Volt Cyclone) | 0 | 3 |
| Snorlax (Collapse) | 0 | 2 |
| Galarian Stunfisk (Damage Rush) | 0 | 1 |

The 24-list denominator excludes ranks 3, 6, 7, 24 and 29. The 29-list denominator includes those five source lists as cross-format opponents. Neither denominator includes the missing ranks 23, 25 and 28. In particular, the nine known Regidrago lists do not resolve the two missing Regidrago lists.

## Policy implications (future work only)

1. **Do not score Copycat from deck presence.** A policy needs a public, exact last-turn attack receipt and must evaluate the attack actually declared.
2. **Add effect-aware priorities, not only damage ranking.** Candidate targets include hand disruption (Night Watch, Claw of Darkness, Poltergeist), lock effects (Paralyzing Bolt, Bell of Silence, Dominating Echo), recovery/mill (Rototiller/Burrow), exact-state Knock Out (Terminal Period), and high-damage lines (Max Geist, Gale Thrust, Bellowing Thunder).
3. **Treat board movement and Item lock as part of attack value.** Gale Thrust is a concrete reason to plan a Benched Mimikyu promotion; the Underworld Door → Guzma line can both fund Copycat and satisfy Gale Thrust's movement condition. Against rank 15, Vileplume can make VS Seeker unavailable because it is an Item; the one Guzma must be in hand (or the Ability lock must be absent/cleared). The candidate's Pokémon Ranger clears attack-origin effects, not Vileplume's persistent Ability-based Item lock.
4. **Preserve the nested-Apex distinction.** When the opponent uses Apex Dragon, the copied Apex Dragon resolves against the candidate's own discard. Its available attack choices and GX-marker requirement are different from the opponent's hidden or public Dragon payloads.
5. **Keep dead-copy targets explicit.** Cross Fusion Strike and Electro Rain are examples where the copied effect's references or required Energy make an apparently strong printed attack poor for this 60.
6. **This does not establish a second Mimikyu slot.** The coverage map shows that Mimikyu has potential targets in many field lists, but it says nothing about how often those attacks are chosen, whether Mimikyu survives, whether the candidate can pay Copycat, or whether the slot beats the best alternative. The parked Mimikyu-2 challenger remains a separate hypothesis.

## Limits and next useful validation

- Validate the highest-priority Copycat targets against the paper manual and card text, then implement only after the existing Critic/owner stopline is lifted.
- The V3 host/engine Copycat support gap must be resolved before any of these interactions can enter a competitive simulation.
- A future test should cover at least the Gale Thrust Bench-to-Active condition, Bellowing Thunder's candidate-side Energy discard, Tapu Lele Energy Drive, and one copied lock effect; negative controls should include Cross Fusion Strike with no candidate-side Fusion Strike Bench and Electro Rain with no Lightning Energy.
- The three missing source lists and the opponent-format contract remain unresolved. Do not claim full Top 32 coverage from this 29-list map.

**Conclusion:** Mimikyu GRI 58 has substantially broader potential field coverage than the Regidrago counter-line alone suggests. The most actionable new line is Copycat → Gale Thrust for 230 after Underworld Door attaches to Benched Mimikyu and Guzma promotes it. The strongest additional candidates include Tapu Lele's Energy Drive, Gengar & Mimikyu's Poltergeist, Mega Absol's Terminal Period/Claw of Darkness, Raging Bolt's Bellowing Thunder, and Vikavolt's Paralyzing Bolt. These are strategic hypotheses derived from card text and source-list presence—not demonstrated game performance.
