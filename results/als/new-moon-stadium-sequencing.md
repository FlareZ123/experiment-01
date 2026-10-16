# New Moon versus Silent Lab: official ordering contract and Aichi source exposure

**Agent 3, 16 October 2026.** Applies to the [52nd-place New Moon Perfection 60-card candidate](new-moon-perfection-source-60.md). Card-text and official Q&A finding with source-list census. **No completed game or win-rate inference.**

## Exact card mechanics and primary rulings

- New Moon Lunatone (`OBF 92 / sv3-92`) says: “If you have Solrock in play, prevent all effects of any Stadium done to your Pokémon in play.”
- Silent Lab (`PRC 140 / xy5-140`) says each Basic Pokémon in play, each player's hand and each player's discard pile has no Abilities.
- Path to the Peak (`CRE 148 / swsh6-148`) says Pokémon with a Rule Box in play have no Abilities.
- Mewtwo & Mew-GX (`UNM 71 / sm11-71`) has Perfection, enabling use of attacks of Pokémon-GX or Pokémon-EX on its Bench or in the discard pile when Perfection is working.

**The official Japanese Pokémon Card Game Q&A explicitly resolves New Moon against Silent Lab in both orders:**

1. **Silent Lab is already in play**, Solrock is in play, and Lunatone with New Moon is newly Benched: **New Moon does not function**. The pre-existing Lab removes the Ability before New Moon can block the Stadium's effects.
2. **New Moon is already functioning**, and then Silent Lab is played: **New Moon is not lost**. The protection prevents Silent Lab from removing that Ability from Lunatone and, by extension, protects its player's other in-play Pokémon.
3. **Path to the Peak** with an already-functioning New Moon: the official Q&A confirms that Radiant Greninja may use Concealed Cards despite Path's Rule Box suppression. The card text extends the same relevant protection to a player's in-play Mewtwo & Mew-GX.

Primary links:
- [Official Japanese Silent Lab Q&A search](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B5%E3%82%A4%E3%83%AC%E3%83%B3%E3%83%88%E3%83%A9%E3%83%9C&regulation_header_search_item1=all), first two entries: two distinct orders, respectively `いいえ、はたらきません` and `いいえ、なくなりません`.
- [Official Japanese New Moon / Path question collection](https://www.pokemon-card.com/rules/faq/search.php?sc_group_id=875): Concealed Cards is permitted under New Moon protection.
- [Attached Advanced Player's Rulebook](../../resources/) gives priority to card text over basic rules and says “can't” effects otherwise take priority, so do not replace this explicit matchup-specific official answer with a generic always-on Ability-suppression rule.

### Interpretation boundaries

**Ordering is strategically meaningful.** In the source list, only one New Moon Lunatone and one Solrock are present. A simulation policy should evaluate whether both can become established before an opponent's Silent Lab, and whether it can answer a pre-established Silent Lab with a Stadium replacement. The source list has 2 Sky Field and 2 Path to the Peak, though their accessibility and actual effectiveness under other locks need testing.

The official ruling directly covers Lunatone plus Solrock; it does not prove that this 52nd-place candidate consistently achieves that board, that other Ability locks such as Garbotoxin are neutralized, or that every Timing/Ability-state implementation of Twinleaf is correct. Mewtwo & Mew-GX's attack use still demands Energy and valid attack sources. When interpreting a simulator, stage both acquisition orders and test Perfection itself before drawing matchup conclusions.

## Source-locked Aichi Top32 exposure

A census of the [29 exact published 60-card field entries](../aichi-2026/full-decklists.json) finds **five Silent Lab copies across four ranks**:

| Published rank | Deck | Silent Lab | Path to the Peak |
|---:|---|---:|---:|
| 9 | Absol Electrode | 2 | 1 |
| 13 | Regidrago | 1 | 0 |
| 15 | Lopunny Vileplume | 1 | 1 |
| 32 | Regidrago | 1 | 0 |

Other Path to the Peak opponents have ranks **5, 12, 20, 21, 27**, each with copies listed in the canonical source. Overall Path to the Peak appears in **seven published decks**, with a total of **eight copies** (ranks 5:2, 9/12/15/20/21/27:1 each). Four of 29 published lists contain Silent Lab; no inference is justified for unavailable ranks **23, 25, 28**.

The mechanical test priority is rank **9** and rank **15**, each of which carries both Stadiums. Both may test the difference between early suppression and a later failed suppression attempt. These are *presence counts*, not probabilities of playing a Stadium on time.

## Separate Stadium target domain: Bench limits survive New Moon

The [pilot's first-person rules section](https://ottopoke.hatenablog.com/entry/2026/05/13/183822) explicitly states that a functioning New Moon still permits an **eight-Pokémon Bench under Sky Field** and still forces a **three-Pokémon Bench under Parallel City**. These effects constrain the player's Bench capacity and are distinct from effects directed at their Pokémon; New Moon protects only the latter. This is a pilot-reported ruling supported by that targeting distinction, rather than an independently reproduced Store action.

A new exact-name census of the same 29 published 60s finds **Parallel City in ranks 10, 12, 13, 20, 21, 27, 32**, one copy each. The candidate itself has **two Sky Field** Stadiums; the seven Parallel City opponent inventories may contest its Bench occupancy even when Sunbeam Solrock and New Moon Lunatone are active. **A simple simulator rule that removes all Stadium effects whenever New Moon functions is unsound.** Stage a genuinely expanded Bench with a live protected Lunatone and inspect capacity immediately after each Stadium change, including the owner's choice of which excess Pokémon to discard.

## Required two-order regression

Use the same Solrock, Lunatone, Rule Box Pokémon and Stadium printing in each staged state. Establish that Lab-first Lunatone retains no functioning New Moon; then establish that New-Moon-first Lab does not remove it. Test Path with New Moon and an exposed Rule Box Ability. Repeat after Stadium replacement, Solrock removal and Pokémon moving zones. Record state snapshots, real action order, simulated engine status, and controlled paper-rule expectation. Do not credit a candidate with wins on the basis of an inferred suppression immunity.
