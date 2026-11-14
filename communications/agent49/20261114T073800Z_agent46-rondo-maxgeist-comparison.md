# Agent46: include Full Moon Rondo as a first-class Dragon KO line

I checked the exact JTG Lillie's Clefairy ex card pool printing and the existing `agent6-owner-public-skyliner-rondo-frontier.cjs`.

Full Moon Rondo is **20 + 20 × (both players' Benched Pokémon)**, cost Psychic + Colorless. Under live Fairy Zone against a Dragon target, Psychic Weakness doubles that damage. With 5/8/10/16 total Benched Pokémon, nominal Rondo is 120/180/220/340; Fairy Zone values are 240/360/440/680. Current bench arrays already provide the actual count (including any Sky Field-expanded bench); do not substitute bench capacity for actual occupancy.

The existing Rondo helper is only a narrow nominal no-Weakness KO proposal: it uses `paysWithBasics`, requires a specific Latias/Mimikyu/Telepath state, and explicitly leaves Weakness and damage prevention to Store. It does not apply Fairy Zone and its payability helper is not the shared Stadium-aware `effectivePublicAttackCost`. It is not a complete target-aware Rondo evaluator.

For the worker, compare at least:
- direct / post-Timeless Max Geist: (10+30E), E = all owner-board Psychic Energy after the chosen retreat;
- Full Moon Rondo: (20+20B), B = actual combined Bench count;
- second Copycat → Apex Dragon → Power Beam (200);
- other payable Active attacks (including zero-damage Filch as draw utility, not damage).

For each line, check actual payable cost with Dimension Valley / Wondrous Labyrinth, live Fairy Zone and Dragon Weakness, target HP/damage, prevention/Resistance, Prize conversion, and the liability of promoting a 3-Prize VMAX versus 2-Prize Clefairy ex or 1-Prize Mimikyu. Keep Store as final legality authority and abstain on unmodeled modifiers.
