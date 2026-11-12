# Direct Gengar & Mimikyu-GX Horror House line under Ability lock

**Status:** exact card-access calculation and rules-derived tactical hypothesis. No Twinleaf game was run, and this is not a win-rate result. It extends the open question in [the New Moon Lockbreaker 60-card candidate](new-moon-lockbreak-60-candidate.md), which already noted that Gengar & Mimikyu-GX might provide a non-Ability attack line when Cologne is unavailable.

## Tactical line

The current 60 contains one **Gengar & Mimikyu-GX** (SM9 53), two **Powerglass** (SFA 63), six Psychic Energy (three Basic Psychic and three Telepathic Psychic), four Fog Crystal, two Battle Compressor, two Mysterious Treasure, and one Escape Rope.

The card-pool text gives Gengar & Mimikyu-GX's **Horror House-GX** a cost of one Psychic Energy. It is a printed attack, not an Ability. Its primary effect prevents the opponent from playing cards from hand during their next turn. If Gengar has an additional Psychic Energy attached at attack time, both players also draw until they have seven cards.

This creates a real alternative to trying to restore Mewtwo & Mew-GX's Perfection immediately:

1. Start Gengar & Mimikyu-GX Active, attach one Psychic Energy, and use Horror House-GX.
2. The opponent cannot play cards from hand next turn. They can still attack and use Abilities already in play; this is a tempo window, not a complete lock.
3. If Powerglass is attached to the Active Gengar and a **Basic** Psychic Energy is in the discard pile at end of turn, Powerglass can attach it. Gengar then has the two Psychic Energy needed for Poltergeist on the following turn.
4. Use that window to establish or recover the remaining board plan, including Field Blower/Cologne if Mewtwo's Ability is still suppressed.

Iron Thorns ex (SV6 77) and Garbodor (XY9 57)'s Garbotoxin suppress Pokémon Abilities; they do not suppress a printed attack. Powerglass is a Trainer Tool effect rather than a Pokémon Ability. Therefore the Gengar attack, and an already-attached Powerglass end-of-turn effect, are not disabled merely by those Ability locks. The line does **not** remove the lock, and the opponent may still attack or use effects already in play.

Important timing: if Gengar attacks with only the one Psychic Energy required, a Powerglass attachment that occurs *after* the attack does not retroactively satisfy Horror House-GX's extra-Energy draw clause. To obtain that draw effect, the extra Psychic Energy must already be attached when the attack is declared. The GX attack is once per game, so using it with Gengar consumes the same once-per-game GX attack that Mewtwo & Mew-GX might otherwise copy.

## Exact opening-access calculation

I added a reproducible exact combinatorial model:

- [Calculator](../../scripts/agent2-gengar-horror-house-access.cjs)
- [Six regression tests](../../tests/2026-11/agent2-gengar-horror-house-access.test.cjs)

The Node test suite was executed locally: **6/6 passed**. The model uses the exact candidate counts: 1 Gengar, 6 Psychic Energy, 4 Fog Crystal, 16 other Basic Pokémon, and 33 other cards. It explicitly samples six Prize cards, a seven-card opening hand, and one or two ordered draws without replacement. Results are conditioned on a legal opening seven. Gengar must be in the opening seven so it can be selected as the starting Active; the model does not search for Gengar or switch a later-drawn Gengar Active.

| Access event | Items playable (Ability-lock case) | Item lock active |
|---|---:|---:|
| Gengar in legal opening seven | 12.7287% | 12.7287% |
| By first draw: one Psychic Energy in hand/draw, or Fog Crystal finds one | **9.5237%** | **6.9774%** |
| By second draw: same condition over two draws | **10.1400%** | **7.6411%** |

Exact fractions are preserved by the script:

- Gengar in legal opening seven: 1,185,723 / 9,315,337
- First draw, Items playable: 18,625,942,657 / 195,575,500,315
- First draw, Item lock: 12,349,477 / 176,991,403
- Second draw, Items playable: 80,851,039,904 / 797,346,270,515
- Second draw, Item lock: 13,524,007 / 176,991,403

The Item-lock case does not count Fog Crystal because it is an Item. The Ability-lock case allows Fog Crystal to search a Psychic Energy card if at least one remains outside the Prizes. The two-draw cases represent access by the player's second turn.

These are **hand-access scenario rates**, not probabilities of completing the attack in a real game. The calculation excludes searching Gengar with Fog Crystal/Mysterious Treasure, switching a later-drawn Gengar Active with Escape Rope, Powerglass access, the Basic Energy discard setup, mulligan bonuses, competing attachment choices, opponent disruption, and whether Gengar survives. Those exclusions and assumptions act in different directions, so the rates should not be described as strict bounds on actual attack frequency. They are also not directly comparable to the prior report's Cologne-access percentage because the events differ.

## Strategic implication

The line is already present in the candidate 60; it requires no card change to test. It is a **complementary bypass** for the specific case where Mewtwo & Mew's Ability is suppressed, not a demonstrated replacement for Cologne or Field Blower. The opening-active subcase is modest (about 9.5% by the first draw when Items remain playable), but it can buy a turn without first assembling both lock-removal cards. Search-and-switch paths may add access, while disruption and competing setup priorities may reduce successful execution.

Do not cut Cologne based on this calculation alone. First test the actual line and compare the complete decision tree against the current dual-counter package.

## Required Twinleaf validation

Add a focused integration scenario using the exact candidate list and pinned engine revision:

1. Put Gengar & Mimikyu-GX Active with one Psychic Energy; put Powerglass on it and a Basic Psychic Energy in discard.
2. Put Iron Thorns ex Active and Garbodor with a Pokémon Tool attached on the opponent's field.
3. Verify Gengar can declare Horror House-GX despite Ability suppression, the opponent's next-turn hand-play restriction is recorded, and Powerglass attaches the Basic Psychic Energy at end of turn.
4. Verify Gengar can legally declare Poltergeist on the following turn with two Psychic Energy, subject to the opponent's hand and normal game state.
5. Repeat with an Item lock. The attack should still work if Gengar and the Energy are already in place; Fog Crystal/Powerglass cannot be newly played through the Item lock, although an already-attached Powerglass should still resolve its end-of-turn Tool effect.
6. Test the extra-Energy draw clause separately: it applies only when the extra Psychic Energy is attached before Horror House-GX resolves.

This test validates a specific tactical interaction. It does not establish that the line wins the matchup, that the policy chooses it correctly, or that the 60-card deck is competitive across the field.
