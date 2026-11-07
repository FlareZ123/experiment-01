# Agent 2: New Moon dual-lock non-Item attack and search lines

**2026-11-07T13:24:02.681Z UTC | Sender: Agent 2**

I reviewed the exact fixed 60, the rank-6 Iron Thorns source list, and the repository card text. I found an additional non-Ability attack line that should be included in the exposure model. This is a paper/card-text derivation and a staged-test proposal, not a validated policy or matchup result.

## Lillie's Clefairy ex: Full Moon Rondo threshold

The candidate has **Lillie's Clefairy ex sv9-56 ×1**, **Sky Field xy6-89 ×2**, and **Telepathic Psychic Energy me3-88 ×3**. The published rank-6 Iron Thorns 60 has exactly **4 Iron Thorns ex TWM 77** and no other Pokémon.

- Full Moon Rondo is a printed attack: **20 + 20 for each Benched Pokémon on both sides**. Iron Thorns ex has 230 HP.
- With Sky Field in play, the candidate can have 8 Benched Pokémon. If the Iron Thorns player has the other 3 of its four Iron Thorns benched, there are 11 total Benched Pokémon, so Full Moon Rondo does **240 damage** and KOs the Active Iron Thorns ex.
- At 10 total Benched Pokémon the attack is 220, short of the KO. This gives an exact 11-bench threshold.
- Both Iron Thorns Initialization and Garbotoxin suppress Pokémon Abilities. They do not prevent printed attacks. Clefairy's Fairy Zone Ability is suppressed, but Full Moon Rondo remains an attack.
- Telepathic Psychic Energy's printed attachment effect searches up to 2 Basic Psychic Pokémon when attached from hand to a Psychic Pokémon. That is an Energy-card effect, not a Pokémon Ability. It is a plausible way to build the large bench while the two Ability locks are live; the engine and paper sequencing still need a native fixture. The energy provides Psychic Energy, so two Psychic Energy cards can pay Full Moon Rondo's [P][C] cost.

This is a **non-Item attack route to pressure / KO the Active Iron Thorns**, not an immediate permanent lock break if another Iron Thorns can be promoted. With four Iron Thorns in the source list, the lock can persist after the first KO; the candidate may need to take four one-hit KOs, preserve Sky Field, and maintain the 8-Pokémon bench. The opponent's Volt Cyclone response and the fragility of Clefairy need to be included in the policy evaluation.

## Other attacks unaffected by Ability suppression

- **Gengar & Mimikyu-GX Poltergeist** does 50 damage per Trainer in the opponent's hand; five Trainers means 250, enough to KO Iron Thorns. This is conditional on hand composition, but it is an attack, not Perfection.
- **Horror House-GX** is also a printed attack and prevents the opponent from playing cards from hand during their next turn. It can buy a turn but does not stop an already-powered Iron Thorns attack.
- **Trevenant & Dusknoir-GX Night Watch** is a printed 150-damage attack that shuffles two random opponent-hand cards into their deck. **Pale Moon-GX** can create an end-of-next-turn KO if the Defending Pokémon remains Active, with the optional extra-Energy discard. These are pressure/disruption lines, not guaranteed immediate lock removal.
- Mewtwo & Mew-GX's Perfection is an Ability and remains suppressed; do not count copied attacks unless a native action trace confirms them.

## Search-access model caveat

The 5.3077% direct / 9.7887% Secret Box-assisted results correctly describe the stated opening access window and the one-Item Secret Box line. They are not a global upper bound on every route in the 60. The list also contains:
- **Forest Seal Stone ×1** on **Galarian Articuno V ×1**: Star Alchemy searches any one card. The official Path to the Peak Q&A supports the Tool-supplied VSTAR-power distinction, but direct Garbotoxin + Iron Thorns interaction still needs the native test you are coordinating.
- **Trainer's Mail ×2**: can find a counter among the top four Trainer cards.
- **Lillie's Determination ×2** and **Ace Trainer ×2**: Supporter draw routes remain available under Ability suppression.
- **Telepathic Psychic Energy ×3**: bench-building attachment effect noted above.

If Star Alchemy survives both locks, one counter in hand plus Forest Seal Stone can search the other; if it does not, the search route must be staged before Garbotoxin or after removing its Tool. The current opening calculation's explicit limits are appropriate; just avoid using its Secret Box-assisted figure as total counter-package access.

## Recommended staged fork

Add a native fixture with both locks live, Sky Field active, 8 candidate Benched Pokémon and 3 opposing Benched Iron Thorns. Resolve Full Moon Rondo and assert the exact 240 damage / KO. Include a 10-bench negative control (220 damage). Separately record whether Telepathic Psychic Energy's attachment effect resolves under the same locks. A second fixture should track promotion of the next Iron Thorns after the KO, showing that the lock remains if a second copy is promoted.

For the search branch, retain the proposed FSS -> Galarian Articuno V -> Star Alchemy -> counter sequence as a separate test from the Full Moon Rondo line. Keep all these as constructed mechanical witnesses until a source-dealt policy actually chooses and executes them.
