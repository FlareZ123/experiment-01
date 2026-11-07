# Aichi 2026 original-source chronology: five post-event English proxy copies with pre-event Japanese counterparts

**Agent 44 | 7 November 2026 | source inventory and card-printing provenance audit | zero native games**

## Finding

The Aichi Open League Top 32 event took place **10 May 2026**. The repository's 29 authenticated *name/count* source inventories include three rows whose selected **English** print IDs come from *Mega Evolution: Chaos Rising* (`CRI`), officially released **22 May 2026**. These are anachronistic *English representative print IDs*. The corresponding *Japanese Ninja Spinner* (`M4`) cards were available from **13 March 2026**, before the event. The chronology check is therefore an evidence requirement on **print annotations and simulator proxy normalization**, and does **not** establish illegal tournament decks or different names/counts.

| Original rank | English archive annotation | Quantity | Pre-event Japanese counterpart | Evidence |
| ---: | --- | ---: | --- | --- |
| 5, Yamato Nakano Mew Genesect | Special Red Card, `CRI 82` | 2 | `M4 072/083` | [Official JP card](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all), [JP source deck 60](https://www.pokemon-card.com/deck/result.html/deckID/fFVFwv-Wlj8nQ-bvfdkk), [international crosswalk](https://limitlesstcg.com/cards/CRI/82) |
| 16, Takumi Matsumoto Absol Garbodor | Trubbish, `CRI 56` | 2 | `M4 054/083` | [Official JP card](https://www.pokemon-card.com/card-search/details.php/card/50138), [JP source deck 60 explicitly showing M4 054](https://www.pokemon-card.com/deck/result.html/deckID/Lgnng9-OKq2xZ-gQNLgH/), [international crosswalk](https://limitlesstcg.com/cards/CRI/56) |
| 26, Hibiki Yamada Meloetta Donk | Special Red Card, `CRI 82` | 1 | `M4 072/083` | [Official JP card](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all), [JP source deck 60](https://www.pokemon-card.com/deck/confirm.html/deckID/c88Jc8-6Ev9Uu-cYcYKG/) |

Source release chronology:
- [Pokémon Japan's Ninja Spinner product page](https://www.pokemon-card.com/ex/m4/) gives **13 March 2026**.
- [The Pokémon Company's international Chaos Rising announcement](https://www.pokemon.com/us/news/the-pokemon-tcg-mega-evolution-chaos-rising-expansion-arrives-on-may-22-2026) and [release announcement](https://press.pokemon.com/en/MEDIA-ALERT-Mega-Greninja-Faces-Off-with-Mega-Floette-in-the-Pokemon-T) confirm **22 May 2026**.
- [Limitless CL Aichi source page](https://limitlesstcg.com/tournaments/566/decklists) gives **10 May 2026**, and independently lists the same counts for ranks 5, 16 and 26.

**The Japanese product and actual card entries provide positive pre-event availability evidence.** The rank-16 saved Japanese deck visibly specifies `M4 054/083 ×2`, resolving that card's source printing more strongly than an inferred set lookup. The rank-5 and rank-26 Japanese saved decks identify Special Red Card by name and quantity; their public text does not establish an exact personal artwork or numbered printing. `M4 072/083` is a dated, source-relevant eligible counterpart, **not a claim that the player physically held that particular copy**. These saved decks are external 60-card records; absent contemporaneous registration evidence, do not silently promote their existence into independent confirmation of every physical card used on May 10.

## Reproducible full-roster audit

- Inputs: [original 29-name/count source inventories](full-decklists.json) and [English set metadata](../../resources/sets/en.json).
- Implementation: [source chronology audit](../../simulation/evaluation/agent44-source-set-chronology-audit.cjs), [unit tests](../../tests/agent44-source-set-chronology-audit.test.cjs).
- Logic: match a source `printing.set` against the English `ptcgoCode` to obtain a single dated expansion; compare that release date to the event date; leave unresolved codes or ambiguous matches unclassified, with no fabricated date or original printing.
- Independent GitHub-backed direct source scan returned **29 original source decks, 3 post-event English expansion rows, 5 copies, ranks [5,16,26]**. The script's two synthetic local Node v22 tests passed; a third full-repository regression was committed and **has not been certified through CI**. No native tournament game was played.
- The audit also encountered **57 source rows with an unrecognized English expansion code** (including promotion and energy codes not represented in `ptcgoCode`), which it explicitly labels unresolved. This is a *row count*, not a finding of 57 illegal or future cards. Duplicate-set-code ambiguities are likewise unresolved.

This extends [Agent17's separate 4 November Basic Energy artwork audit](agent17-postevent-basic-energy-printings-20261104.md), which identified **120 post-event MEE art copies across 35 entries in 22 source ranks**. The two findings are on distinct nonoverlapping card rows, so the combined **known chronology-flagged annotation count is 125 physical copies in 38 rows, across 23 of the 29 known source ranks**. Rank 5 is newly affected by an annotation chronology finding; ranks 16 and 26 were already affected by Agent17's Basic Energy audit. The combined number is a lower-bound census of *identified anachronistic representative labels*, not an estimate of illegal card inclusion.

## Game-semantics boundary and follow-up

The `CRI 56` English proxy and `M4 054` Japanese counterpart both describe Darkness-type Basic Trubbish, 70 HP, Acid Spray for 10 and a coin-flip chance to discard an opponent's attached Energy, with the same retreat/Weakness structure. The international-to-Japanese printing mapping is corroborated by Limitless. This supports an **explicit source-language normalization candidate**, subject to the independent paper rule and native card implementation checks.

The Japanese `M4 072` Special Red Card and English `CRI 82` both require the opponent to have three or fewer remaining Prize cards and manipulate the opponent's hand to the deck bottom before a three-card draw. The printed English wording has an explicit if-cards-were-moved condition that the Japanese text phrases as “then draw 3.” The [official Pokémon Japan FAQ](https://www.pokemon-card.com/rules/faq/search.php?freeword=%E3%82%B9%E3%83%9A%E3%82%B7%E3%83%A3%E3%83%AB%E3%83%AC%E3%83%83%E3%83%89%E3%82%AB%E3%83%BC%E3%83%89&regulation_faq_main_item1=all) **expressly prohibits playing this Item against an opponent with an empty hand**. This named-card ruling is now settled. The pinned native SpecialRedCard implementation does not check the opponent's empty hand in its `canPlay` or `reduceEffect` gate, giving a specific source-level suspected paper-vs-engine mismatch; native Store acceptance still requires a fixture. See [Agent44's official FAQ and pinned-source audit](../rules/agent44-special-red-card-empty-hand-official-faq-pinned-source-audit-20261107.md).

The practical protocol is to preserve the original name/count rosters and their current English source-transcription SHA values, attach an **explicit** `originalJapaneseCard` / `englishRepresentative` mapping for these three rows, record the representative card used in a particular Twinleaf run, and separately verify effect equivalence. Do not silently modify the 29-source raw dataset or existing physical-deal fingerprints. The three missing ranks **23, 25 and 28** remain unauthenticated.

**No paper-qualified competitive games, fixed nominated 60, or 99.5% win-rate result have been established.** This contribution corrects provenance and prioritizes a small printed-effect fidelity check within the common bilateral policy, without introducing any new CI workflow or candidate deck.
