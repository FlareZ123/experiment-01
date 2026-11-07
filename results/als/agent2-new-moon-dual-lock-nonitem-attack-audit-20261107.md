# New Moon dual-lock response: non-Item attack and search lines

**Agent 2 | 2026-11-07T13:28:25.416Z UTC**

## Question

Does the fixed New Moon Lockbreaker 60 have credible ways to respond to simultaneous Active Iron Thorns ex plus Tool-Garbodor, beyond the two-Item Field Blower / Canceling Cologne package?

This is a card-text and arithmetic audit. It is not a native Store result, a full-game policy result, or matchup evidence.

## Exact-list checks

The candidate at [new-moon-lockbreak-60-candidate.md](new-moon-lockbreak-60-candidate.md) contains:

- Lillie's Clefairy ex sv9-56 ×1
- Sky Field xy6-89 ×2
- Telepathic Psychic Energy me3-88 ×3
- Forest Seal Stone SIT 156 ×1
- Galarian Articuno V ×1
- Trainer's Mail ×2
- Lillie's Determination ×2
- Ace Trainer ×2

The rank-6 Iron Thorns source list in [full-decklists.json](../aichi-2026/full-decklists.json) contains four Iron Thorns ex TWM 77 and no other Pokémon.

Relevant card database entries:
- [Lillie's Clefairy ex](../../resources/cards/en/sv9.json): Full Moon Rondo is a printed attack for [P][C], doing 20 damage plus 20 for each Benched Pokémon on both sides. Its Fairy Zone Ability is separate.
- [Sky Field](../../resources/cards/en/xy6.json): each player may have up to eight Benched Pokémon.
- [Iron Thorns ex](../../resources/cards/en/sv6.json): 230 HP.
- [Telepathic Psychic Energy](../../resources/cards/en/me3.json): its printed attachment effect searches up to two Basic Psychic Pokémon when attached from hand to a Psychic Pokémon; it provides Psychic Energy.

## Full Moon Rondo threshold

With Sky Field active:
- New Moon can have eight Benched Pokémon.
- If the Iron Thorns player has all four copies in play, one Active and three Benched, there are eleven Benched Pokémon total.
- Full Moon Rondo then deals (20 + 20 × 11 = 240), enough to Knock Out 230-HP Iron Thorns ex.
- At ten total Benched Pokémon, it deals (20 + 20 × 10 = 220), which is insufficient.

Iron Thorns Initialization and Garbotoxin suppress Pokémon Abilities. They do not prohibit printed attacks. Clefairy's Fairy Zone Ability is suppressed, while Full Moon Rondo remains available if the Pokémon is Active and has the [P][C] cost paid. Two Psychic Energy cards can satisfy [P][C].

Telepathic Psychic Energy's attachment effect is printed on an Energy card rather than being a Pokémon Ability. It is therefore a plausible way to build the bench while both Ability locks are active. This interaction still needs a native fixture; do not promote the paper inference to a tested engine fact.

### Limitation: pressure, not an immediate permanent lock break

Knocking Out the Active Iron Thorns removes that particular Active Pokémon. If another Iron Thorns is Benched, the opponent may promote it and restore Initialization immediately. Against the exact four-copy source list, the attack may become a multi-KO prize-race plan, requiring up to four Iron Thorns KOs and continued bench/energy access. The opponent's Volt Cyclone damage, the Clefairy ex's survival, Sky Field persistence, and the time required to fill eight Bench slots all matter.

This line avoids needing Canceling Cologne for the first Active Iron Thorns KO, but it does not by itself remove Tool-Garbodor. Field Blower or another route is still needed to remove Garbodor's Tool if the goal is to restore Pokémon Abilities.

## Other printed-attack pressure

- Gengar & Mimikyu-GX's Poltergeist is an attack that does 50 damage per Trainer in the opponent's hand. Five Trainers means 250 damage, enough to KO Iron Thorns ex; this depends on the opponent's hand composition.
- Horror House-GX is also an attack and can prevent the opponent from playing cards from hand during their next turn. It buys time, but does not stop an already-powered attack.
- Trevenant & Dusknoir-GX's attacks are likewise attacks rather than Abilities; they can provide disruption/pressure under Ability suppression, but their exact damage and switch-around consequences should be tested separately.
- Mewtwo & Mew-GX's Perfection is an Ability and remains suppressed. Do not count copied attacks unless a native action trace establishes them.

## Search-access caveat

The 5.3077% direct and 9.7887% Secret Box-assisted figures in [the joint-access report](new-moon-dual-lockbreak-joint-access-20261107.md) are correctly scoped to the stated opening access window and the modeled one-Item Secret Box route. They are not a global upper bound on all ways to access counters in the 60.

Additional routes in the exact list:
- Forest Seal Stone's Star Alchemy searches any one card once. The candidate has Galarian Articuno V to host it. Whether Star Alchemy remains usable under the simultaneous Garbotoxin/Iron Thorns board needs the pending native/paper ruling work.
- Trainer's Mail can find a counter among the top four Trainer cards.
- Lillie's Determination and Ace Trainer are Supporters that can draw into counters; Supporters remain playable under Ability suppression.
- Telepathic Psychic Energy can build the bench through its attachment effect, subject to native validation under both locks.

These routes have different costs and timing. Secret Box's discard cost, top-four uncertainty, Supporter-per-turn limit, VSTAR-power use, and Energy attachment cadence must be modeled rather than collapsed into a single deterministic access percentage.

## Recommended validation

1. Native Store fixture with both locks live, Sky Field active, eight New Moon Benched Pokémon, and three opposing Benched Iron Thorns: resolve Full Moon Rondo and assert 240 damage / Active Iron Thorns KO.
2. Ten-total-Bench negative control: assert 220 damage and no KO.
3. Verify Telepathic Psychic Energy's attachment effect resolves under both locks and that the selected Basic Psychic Pokémon enter the physical Bench.
4. After the first Iron Thorns KO, promote another copy and assert Initialization is live again.
5. Test Forest Seal Stone Star Alchemy under the exact dual-lock board separately from the FSS -> V -> Star Alchemy -> Field Blower/Cologne sequencing branch.
6. Only after staged tests, add a source-dealt policy that decides whether to pursue the Clefairy prize race, Poltergeist, or direct counter access. Measure the actual setup frequency and survival rate.

## Conclusion

The direct 2+2 Item package has a genuine opening-access bottleneck. The fixed 60 also contains non-Ability attack pressure and additional search/draw routes, so the current access calculation does not establish a total structural counter-package failure. Full Moon Rondo provides a precise 11-Benched-Pokémon KO threshold against a 230-HP Iron Thorns, with an important multi-copy promotion caveat. All of these are candidate lines pending native and source-dealt validation.
