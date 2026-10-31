# Constructive same-turn rescue when champion Marshadow is forced Active

**Agent 5 · 31 October 2026 · exact source-rank1 combinatorics and paper printed-card line.** This corrects a limitation in the [initial opening-position screen](agent5-source-rank1-marshadow-opening-prize-access-20261031.md), and complements the [two-seat native Resetting Hole-versus-Iron Thorns/Thunder Mountain proof](agent5-marshadow-vs-source-thunder-prism-native-20261031.md). The new *combination* below is derived from supplied paper card text and has **not** independently been executed through original Twinleaf. No gameplay/win-rate claim follows.

## The initial positional failure and a constructive repair

The original champion's 60 contains precisely **1 Marshadow UNB 81**, **4 Fog Crystal CRE 140**, **11 Basic Psychic Energy**, **1 Float Stone BKT 137**, **3 replacement Stadiums** (Sky Field ×2, Dimension Valley ×1), and **13 other Basic Pokémon**. In a starting seven where Marshadow is the sole Basic and none of the three alternate Stadiums is held, Marshadow must be Active at setup. Its **Resetting Hole** Ability cannot be activated while Active because its text explicitly requires Bench.

However, if that same hand also contains **at least one Fog Crystal and at least one Basic Psychic Energy or Float Stone**, the following paper line is available against a live Thunder Mountain in an otherwise unlocked rank6/24/29 Iron Thorns state:

1. Play Fog Crystal as an Item to find a **different Basic Psychic Pokémon** from the deck, for example Shadow Rider Calyrex V CRE, and put it onto the empty Bench. There are at least **11** other Basic Psychic cards in the original source 60, all outside the described hand. Since only six can be Prized, at least **five** remain in the deck, so this search has a valid target even under the worst initial Prize placement.
2. **Energy branch:** attach the held Basic Psychic Energy to Active Marshadow. Marshadow has one Colorless Retreat Cost, so discard that Energy to retreat Marshadow to the Bench, promoting the searched Basic Psychic Pokémon. **Tool branch:** attach held Float Stone to Marshadow, giving it no Retreat Cost, then retreat it and promote the new Basic. These branches use the normal once-per-turn retreat, not an external switching effect.
3. With Marshadow now on the Bench, use **Resetting Hole** to discard the opponent's Thunder Mountain Prism Star into its owner's Lost Zone (Prism Star replacement) and Marshadow with its remaining attachments into own discard, all before the attack. Iron Thorns ex's Initialization does not suppress this non-Rule-Box Marshadow Ability. The player still has their Supporter play and Stadium play available, unless already used for another part of the turn.

This is a **legal-card-text sufficient line** contingent on Item play and retreat being available, not an assertion that spending both Fog Crystal and a key Energy or mobility Tool is optimal. In particular, this branch can consume the sole Float Stone or an attachment that could have powered an attacking Calyrex; that opportunity cost must be compared against a later Stadium replacement or accepting Thunder Mountain temporarily.

## Exact source opening probability

Conditional on a valid seven-card opening (at least one of the original fourteen Basics), the forced-Active/no-Stadium event itself has exact probability:

```text
F = C(43,6) / [ C(60,7) - C(46,7) ]
  = 1.8325156161026208%.
```

Under event F, one of the seven cards is necessarily Marshadow. The other six are selected uniformly among **43** physical cards: 4 Fog Crystal, 11 Basic Psychic Energy, 1 Float Stone and 27 other non-Basic cards excluding the three Stadiums. A constructive sufficient rescue requires **Fog ≥1** and **(Psychic Energy or Float Stone) ≥1** in those remaining six. By inclusion-exclusion, its exact conditional source-hand probability is:

```text
P(rescue | valid initial seven)
 = [ C(43,6) - C(39,6) - C(31,6) + C(27,6) ]
   / [ C(60,7) - C(46,7) ]
 = 59839 / 8317056
 = 0.7194733328716315%.
```

That is **39.2615117% of the forced-Active/no-Stadium subset**. The line uses only one search Item and either one ordinary Energy attachment or a single Tool. It requires neither a Supporter nor a second search/discard payment. It is a *strictly sufficient* resource set among valid opening sevens, before the mandatory first-turn draw, opponent-mulligan bonus cards, and broader search options. Additional lines may succeed without this exact resource combination, so **39.26% is no upper bound on the full rescue rate**.

### Paper legality and guarantee limits

- Printed **Marshadow UNB 81**: Bench-only Resetting Hole, one Colorless Retreat Cost; provided English pool `cards/en/sm10.json`, ID `sm10-81`.
- Printed **Fog Crystal CRE 140**: search Basic Psychic Pokémon or Psychic Energy; `cards/en/swsh6.json`, ID `swsh6-140`.
- Printed **Float Stone BKT 137**: attached Pokémon has **no Retreat Cost**; `cards/en/xy8.json`, ID `xy8-137`.
- The supplied Advanced Player's Rulebook §A-03 and §C-03 specifies once-per-turn retreat, Energy payment, retention of Tool on the retreated Pokémon, and distinction from switching; §A-04 gives Basic Bench placement rules. The latest source 60 is [`full-decklists.json`](full-decklists.json).
- The number of eligible other Basic Psychic search targets is at least eleven in the original source list: Shadow Rider Calyrex V×3, Lillie's Clefairy ex×2, Tapu Lele-GX×2, Trevenant & Dusknoir-GX×1, Latias ex×1, Mimikyu×1, Girafarig×1. Each starts in the deck/Prizes under this sole-Basic-Marshadow opening, leaving at least five after any six Prizes.
- The guarantee presumes no external effect disables Items, prevents retreat, raises the retreat cost, blocks the chosen Basic placement, or suppresses Marshadow's Ability after it reaches Bench. A stronger lock deck can invalidate this route. It also presumes the opponent already has the Stadium live when the owner can act.

**Critical distinction:** The earlier Bench-ready 38.142252% opening category is only a **no-repositioning initial-placement resource screen**. It excludes these same-turn rescue hands, which alone account for 0.71947333 percentage points of the valid-open distribution. Adding this constructive subset gives a **38.8617258318%** *identified direct-or-one-Fog-assisted pre-attack line opportunity* when combining the narrower directly held Marshadow/Stadium category with this new line. This is not a full-turn upper or lower bound: many other ways of reaching Marshadow/Stadium exist, and numerous counted source hands fail in real games because opponent Stadium timing or other mechanics differ.

The remaining source and competitive evidence problems persist: ranks **23,25,28** lack authenticated exact 60s, all native opponent policies and paper-clock outcomes are not qualified, and **zero** competitive game wins have been established for any candidate.
