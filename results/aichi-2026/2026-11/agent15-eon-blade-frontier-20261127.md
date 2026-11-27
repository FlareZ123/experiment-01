# Eon Blade before another deck slot: attack frontier and Deoxys Gate stress correction

**Agent15 | 2026-11-27 | conditional paper-rule/card-text reasoning and executed public-state reachability, not matchup results.**

## Decision

Keep the exact Hood Shield reference and Deoxys Gate v0 challenger unchanged. Before comparing them, broaden the attacking policy in both to include **Latias ex (SSP76) Eon Blade**, not just Max Geist, Max Drain and Full Moon Rondo. The previous [restricted Gate counterattack model](agent15-deoxys-gate-counterattack-20261127.md) explicitly omitted other attacks; its numerical comparisons are still valid for its restricted policies, but may overstate the advantage of an alternative VMAX when both lists already carry a two-Prize attacker with a higher fixed damage attack. Do not use the old results to nominate a deck or change the frozen profile.

### Five-rank solution to Rolling Iron

Source ranks 10, 14, 18, 21 and 32 contain Hisuian Goodra VSTAR LOR136, giving their Regidrago VSTAR a potential 200 damage / 80 damage-reduction attack. All nine authenticated Drago ranks carry Muscle Band and Dialga-GX. Ranks 12,13,14,20,21,27,32 have Noivern ex PAL153; ranks 14,20,32 have Mega Dragonite ex ASC152. These are card-presence counts, not attack frequencies; missing ranks 23 and 28 are also labeled Drago but their exact inventories remain unavailable.

At 280 fresh HP on a Dragon Regidrago VSTAR, with Fairy Zone enabled and Rolling Iron applying:

- Max Drain (PCC): 160 × 2 − 80 = 240, **not** a KO.
- Eon Blade (PPC): 200 × 2 − 80 = 320, **KO**, taking two Prizes without consuming the Supporter. Valley reduces both attacks to two Energy, which can be Psychic. Latias is a two-Prize attacker, not three.
- Max Geist (CCC): requires **six** Psychic Energy across own Pokémon (380−80=300), compared to five without Rolling Iron.
- Full Moon Rondo (PC): needs **eight** total Benched Pokémon (360−80=280), compared to six without Rolling Iron.
- Pokémon Ranger removes the attack effect and permits the ordinary five-Energy Geist / six-Bench Rondo / 320 Drain thresholds, but consumes the Supporter for this turn. A successful gust or forced retreat also changes/removes the relevant Active effect; do not count Guzma as free if another Supporter is needed.
- Muscle Band +20 would let Max Drain hit exactly 280 through Rolling Iron; Choice Belt +30 would hit 300 against the VSTAR. Both consume a Tool slot and a deck slot and neither is proposed as a swap here: Eon Blade already exists. Revisit only if observed game traces show that a Tool-based bypass beats the Latias/Ranger line.

**Execute the cheaper same-list line when actually available.** If Latias begins our turn Active with one Psychic Energy and Valley in play, manually attach one and attack. Door can then fund the Bench; it cannot attach to Active Latias. If Latias is Benched and uncharged, one Rider Door plus manual attachment can fund Eon Blade under Valley. With Skyliner enabled, a Basic pivot retreats for free. This permits Deoxys to remain on the Bench protecting the whole board. If Latias starts Active uncharged, don't pretend one Door plus manual can fund it in place. If Valley is absent, an uncharged Benched Latias needs three attachments (e.g. two Doors and manual). If Eon Blade's next-turn attack restriction applies, switch to a different ready attacker or clear the effect by real movement to the Bench; merely declaring another attack is illegal. Covert Flight blocks damage from Basic attackers, including Latias; use a VMAX attack or a legal Ranger line in that state. Fairy Zone must be live, not merely on the list.

## Executed exact attachment/retreat frontier

[Python source](agent15-eon-blade-frontier-20261127.py), local executed Git blob 26cef0e84694005e75ed2aeb3781013b5d43a8b7. Standard library; run directly with Python 3. Thirteen intentionally selected public-state cases, each searched exhaustively under the limited action model: one manual attachment, once per available Rider Door (only to Benched Psychic, never Radiant Eternatus), one real retreat, fixed held Psychic Energy, fixed Bench and target protection. No new Energy is drawn by this abstraction (Door's mandatory draw is assumed possible but not used as a resource). No Trainer, search, KO, ordinary evolution, new Bench placement, Stadium change, opponent response or tool. All shown Pokémon are alive and required Abilities enabled; no deck-access or state frequency claim. The prior model had a much broader setup/recovery action space but a narrower attack set. These are witness cases, not a re-run of its 6,927-opening sample.

| Conditional state | KO without Eon | KO with Eon | Best Eon damage |
|---|---|---|---:|
| Hood, Active Latias 1P, two Doors, held 3P, Valley, Rolling Iron | none | Eon | 320 |
| Gate, Active Latias 1P, one Door, held 2P, Valley, Rolling Iron | none | Eon | 320 |
| Hood, Basic Trev pivot, Latias Bench 0P, two Doors, held 3P, Valley | none | Eon | 320 |
| Gate, same pivot, one Door, held 2P, Valley | none | Eon | 320 |
| Gate, Active Latias 0P, held 2P, Valley | none | none | unavailable |
| Hood, Active Latias 0P, held 3P, Valley | none | none | unavailable |
| Gate, uncharged Benched Latias, one Door, no Valley, held 2P | none | none | unavailable |
| Hood, uncharged Benched Latias, two Doors, no Valley, held 3P | none | Eon | 320 |
| Gate, Covert Flight, not Rolling Iron | Drain | Drain | 0 |
| Hood, Covert Flight, not Rolling Iron | none | none | 0 |
| Gate, Active Latias already restricted by Eon Blade | none | none | unavailable |
| Hood, no Clefairy/Fairy Zone, Rolling Iron | none | none | 120 |
| Gate, wide board, no attack protection | Drain, Rondo | Drain, Eon, Rondo | 400 |

Nine explicit reachability/damage assertions and three further damage assertions passed locally. The five positive cases are not independent or representative samples. Their value is constructive: there are physically payable same-list OHKO routes missing from the former policy, including one where the second Door is decisive without Valley. In the funded Hood case, attach manually to Active Latias and use both Doors to fund a Benched Rider, preserving four total attached Psychic Energy before the attack. In Gate's funded case, only three total are possible with its one Door, but Eon still kills. In the Gate Trev pivot case, Door to Benched Latias, manual to Latias and free retreat from Trev. These sequences assume no opposing interruption before attacking.

## Muscle Band and consecutive-attack correction

All nine authenticated Regidrago lists include one or two Muscle Bands. Their presence does not mean a Band is attached in a given game. The previous Phantom Dive / Trifrost comparison used no damage modifier. For the same neutral Active target, no pre-existing damage, no other effects, a VSTAR attacker copying the payload:

| Source action | No Band, no DNA | No Band, DNA live | Band, no DNA | Band, DNA live |
|---|---:|---:|---:|---:|
| Phantom Dive | 200 | 170 | 220 | 190 |
| Timeless-GX | 150 | 120 | 170 | 140 |
| Ryuno Glide | 330 | 300 | 350 | 320 |
| Trifrost (Active target) | 110 | 80 | 130 | 100 |
| Timeless then Phantom, same Active | 350 | 290 | 390 | 330 |

This changes real decisions. **190 HP Clefairy is KO'd by Band Phantom even with DNA**, whereas healthy 210 HP Latias/Rider V survive 190 if DNA remains active. Without DNA both are KO'd by 220. DNA and 330 HP let Deoxys itself survive Band Ryuno Glide at 10 HP, where a healthy 320 HP Rider VMAX is KO'd exactly; this applies only to the three authenticated Mega Dragonite payload ranks. But **Band Timeless + Band Phantom reaches 330 through DNA**, KO'ing either VMAX if the opponent can execute the consecutive attack line against that same Active and no other effects intervene. No between-turn healing by Max Drain occurs during this opponent-controlled extra-turn sequence. Phantom's six Bench counters remain outside DNA reduction. Band affects damage to the Active, not Trifrost's Benched targets. All these are conditional arithmetic, not a claim the opponent always has both payloads, Energy, GX marker or uninterrupted turns. Observe the public discard, GX-use marker and attached Tool, rather than selecting a line based on hidden access or the archetype name alone. Girafarig Get Lost can remove two public discarded payloads when a no-KO attack is worth its tempo; it is not automatic and cannot remove a payload still in hidden zones. In the two-Dialga lists (12,27), one discarded copy removed does not exhaust the entire inventory.

## Long-game cost: Energy ceiling, not an opening proxy

The two proposed 60s each contain eleven Basic Psychic Energy. With no attack immunity, no other damage modifiers and fresh target HP, the exact attack requirements are:

| Target (source ranks) | Geist total Psychic | Rondo total Bench | Drain damage | Eon damage |
|---|---:|---:|---:|---:|
| Regidrago 280, Fairy Zone | 5 | 6 | 320 | 400 |
| Regidrago 280, Fairy Zone + Rolling Iron | 6 | 8 | 240 | 320 |
| Mega Absol 280 (8,9,11,16,22) | 9 | 13 | 160 | 200 |
| Mew VMAX 310 (5) | 10 | 15 | 160 | 200 |
| Iron Thorns 230 (6,24,29) | 8 | 11 | 160 | 200 |
| Mega Lopunny 330 (15) | 11 | 16 | 160 | 200 |
| Raging Bolt 240, Fairy Zone (19) | 4 | 5 | 320 | 400 |
| Raging Bolt 240, no Fairy Zone | 8 | 11 | 160 | 200 |
| Meloetta 200 (26) | 7 | 9 | 160 | 200 |
| Alolan Raichu 110 (4,17) | 4 | 5 | 160 | 200 |

These are thresholds on physical board state, not setup probabilities. Normal five-Bench cap on both sides permits at most 10 combined; >10 requires a live expanded Bench arrangement, and may be impossible if a source Sudowoodo or Parallel City limits it. Sky Field and Dimension Valley cannot be active simultaneously. Max Geist also requires the actual Active to pay its attack cost; Eon/Drain must pay PPC/PCC, and neither bypasses attack immunity. Against neutral high-HP opponents Deoxys does not replace Geist's scaling. Mega Absol's Darkness attack threatens both VMAX via weakness; DNA does not reduce damage from a non-VSTAR. Alolan Raichu's Electro Rain is also non-VSTAR, so the proposed mitigation has no effect there.

For a neutral 280 target, at least 9/11 Energy must be in play for unmodified Geist; 310 needs 10/11; 330 needs 11/11. If two Energy become unavailable (e.g. Prized or discarded with no reachable recovery), 310 and 330 are unreachable by raw Geist this turn, irrespective of how many Doors are present. Three unavailable preclude 280 too. After a two-Energy VMAX KO from a fully charged eleven-Energy board, recovering one brings the ceiling to 10, not 11; Night Stretcher and KO-triggered Raihan are finite and conditional, not permanent extra copies. The actual objective is to retain reachable future Energy and attack tempo, not maximize attachments to the current attacker. Fund only the attack/retreat requirement on exposed three-Prize hosts unless additional Energy is needed for an explicit line; allocate surplus to a live second attacker or less exposed recipient. Gust risk makes Bench allocation conditional, and no placement is globally safe. A two-Door opening provides up to one extra attachment and two extra draws per turn compared with the hybrid, while both Doors remain enabled and supplied with Energy; no new draw or KO frequency is implied.

## Next executable decision

When authorized, extend the existing conditional model's attack selection to compare Latias versus Rondo, Geist, Drain and other legally paid alternatives from the **same** public state, including source Band, Rolling Iron, Covert Flight and consecutive attacks as separate scenarios. Explicitly report cases where the cheaper two-Prize attacker preserves a three-Prize engine/mitigation host. Only after that evaluate actual longer games and the remaining non-Drago opponents; don't use 13 constructed states as empirical matchup observations. No frozen 60, policies, simulator, workflow, source inventory, CI or game registration changed; no game executed. Stage A and V3 owner gates remain untouched. The field is 29/32 authenticated, not complete; no qualified matchups, no final fixed 60, no established 99.5%.
