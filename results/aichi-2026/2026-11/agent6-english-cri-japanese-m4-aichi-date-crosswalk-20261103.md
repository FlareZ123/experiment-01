# Aichi 2026 printed-card chronology: English CRI display masks earlier Japanese M4 availability

**Agent 6 | 3 November 2026 | original-source printing provenance only | no game evidence**

## Finding

The frozen [29-original-list source roster](../full-decklists.json) includes **five card copies across three source rows and ranks 5, 16 and 26** whose Limitless English-display set is `CRI` (Chaos Rising). The *English* Chaos Rising products were released **22 May 2026**, after the **10 May 2026** Aichi Open League tournament. However, each of these English-display cards is mapped by the card index to a corresponding Japanese original in `M4` (*Ninja Spinner*), whose **13 March 2026** Japanese product release is independently confirmed by [the official Pokémon site](https://www.pokemon-card.com/ex/m4/). Therefore an English-set release date alone would generate a false card-unavailability accusation against these original event lists.

| Source rank/player | Cards in frozen roster | English-display identity | Japanese identity available before Aichi |
| --- | ---: | --- | --- |
| **5, Yamato Nakano** | 2 Special Red Card | [CRI #82](https://limitlesstcg.com/cards/CRI/82) | [M4 #72](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all) |
| **16, Takumi Matsumoto** | 2 Trubbish | [CRI #56](https://limitlesstcg.com/cards/CRI/56) | [M4 #54](https://www.pokemon-card.com/card-search/details.php/card/50138) |
| **26, Hibiki Yamada** | 1 Special Red Card | [CRI #82](https://limitlesstcg.com/cards/CRI/82) | [M4 #72](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all) |

[Limitless's CRI #56 page](https://limitlesstcg.com/cards/CRI/56) explicitly links it to Japanese *Ninja Spinner* #54 and names the rank-16 Aichi Garbodor player. The Japanese official #54 records Darkness-type Basic Trubbish, **70 HP**, illustrator Souichirou Gunjima and its *Acid Spray* attack. Limitless's corresponding CRI page has the same illustrator, basic type, HP, attack damage and effect. This makes the printing match substantially stronger than a same-name assumption. The [official M4 #72 Special Red Card](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all) and its [CRI #82](https://limitlesstcg.com/cards/CRI/82) index link likewise align on the printed restriction requiring the opponent to have three or fewer Prize cards.

The previously documented **rank-5/rank-26 Special Red Card** discrepancy was identified by Agent 4 in [the prospective selected-v3 report](agent4-selected-v3-paper-funded-prospective-48-native-20261103.md); the added **rank-16 2× Trubbish CRI #56 → M4 #54** counterpart is the useful extension.

## Reproducibility and scope

The [machine-readable three-row crosswalk](agent6-cri-m4-japanese-pre-event-crosswalk-20261103.json) holds the frozen roster source rank/name/quantity, both printing identifiers, publication dates, and source URLs. This is a **non-mutating audit**. It neither replaces the English-display `CRI` identifiers in `full-decklists.json` nor silently remaps Twinleaf card IDs. Any native implementation or engine equivalence check still needs the exact card semantics, original Japanese-format bans, and supported native printing identity separately verified.

**No conclusion about the physical card language each player actually brought is made.** Japanese set availability by date is established; actual event-day paper legality and each player's physical printing are separate evidentiary questions. This crosswalk adds **zero new authenticated opponent 60-card lists**, no selected policy change, and zero qualified games. The Aichi coverage remains 29/32.

## Caution for future source normalizers

When an event predates a displayed English expansion, examine its explicitly linked Japanese printings before declaring the card historically unavailable. Record both printings, both dates and the exact index correspondence. Do not blanket-map all of `CRI` to `M4` since different English release sets may combine multiple Japanese products. A card-level crosswalk is the proper unit of provenance.

