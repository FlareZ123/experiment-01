# Aichi 2026 post-event English print dates and intra-deck card-identity collisions

**Agent 3 | 2 November 2026 | source-provenance audit; no competitive-game claim**

## The English-display chronology anomaly is explained by Japanese pre-event publication

The [29 original deck inventory](../aichi-2026/full-decklists.json) expressly says that source printing IDs follow Limitless **English display** where available, with Japanese original printings requiring separate checking. CL Aichi took place **10 May 2026**. The supplied English card database dates Chaos Rising (`me4`, `CRI`) to **22 May 2026**. A full 29-deck scan found **three rows, five cards** carrying that future English display release:

| Source rank | English proxy | Count | Official Japanese counterpart |
| ---: | --- | ---: | --- |
| 5 Mew/Genesect | Special Red Card CRI82 | 2 | M4 **072/083**, 13 March 2026 |
| 16 Absol/Garbodor | Trubbish CRI56 | 2 | M4 **054/083**, 13 March 2026 |
| 26 Meloetta Donk | Special Red Card CRI82 | 1 | M4 **072/083**, 13 March 2026 |

**Primary official evidence:** Japan's [Ninja Spinner / M4 release announcement](https://www.pokemon-card.com/ex/m4/) states **13 March 2026**. The official Japanese card records [Special Red Card M4 072/083](https://www.pokemon-card.com/card-search/details.php/card/50156/regu/all) and [Trubbish M4 054/083](https://www.pokemon-card.com/card-search/details.php/card/50138/regu/all) establish those exact Japanese identities. The corresponding English effects and card images are documented for [Special Red Card CRI82](https://checkpokemoncard.com/card/me04-082-special-red-card/) and [Trubbish CRI56](https://bulbapedia.bulbagarden.net/wiki/Trubbish_%28Chaos_Rising_56%29). In each pair the key game effect agrees: Special Red Card requires the opponent at three or fewer Prizes and returns their hand to the deck's bottom, then draws three; Trubbish's Acid Spray flips to discard Energy.

**Conclusion:** A validator demanding English display `releaseDate <= eventDate` would falsely reject these three Japanese-source rows. Official Japanese counterparts existed before Aichi. This establishes the **chronology and core effect bridge**, not ownership of an English paper printing at the Japanese event or complete rules/registration authentication. Do not reduce 29/32 original 60-card inventories or label the originals illegal.

## Exact eight same-name printing collisions in the 29 source decks

Programmatic enumeration of the committed manifest yields **238 distinct English card names**, of which precisely **eight names use more than one source `set:number` pair**. Reading supplied exact printed English card data reveals materially different attacks/Abilities:

| Name | Source ranks and printing counts | Mechanically relevant difference |
| --- | --- | --- |
| **Trubbish** | rank8 PAR116 ×2; rank11 FST168 ×2; rank16 CRI56 ×2; rank22 FST168 ×1 **plus** NVI48 ×1 | NVI48 Psychic 60 HP, Garbage Collection; later variants Darkness 70 HP with Suffocating Gas, Call for Family or Acid Spray |
| **Garbodor** | rank8 LTR68 ×2; rank11 BKP57 ×2; rank16 LTR68 ×2 **plus** BKP57 ×1; rank22 BKP57 ×2 | Both Garbotoxin; LTR68 attacks with Sludge Toss, BKP57 attacks with Offensive Bomb and applies Poison/Confusion |
| **Mimikyu** | ranks1,30 GRI58 ×1 each; rank3 PAL97 ×1, rank7 PAL97 ×3 | GRI58 Copycat attack; PAL97 Safeguard Ability and Ghost Eye damage counters |
| **Pidgeotto** | rank2 TEU123 ×2; rank15 TEU123 ×1 **plus** MEW17 ×1 | TEU123 Air Mail Ability; MEW17 has no Ability, uses Flap |
| **Vileplume** | rank2 AOR3 ×2; rank15 AOR3 ×2 **plus** BUS6 ×1 | AOR3 passive Item lock, BUS6 Active-only restriction on opponent Basic attackers |
| **Pidgey** | rank2 MEW16 ×2; rank15 FLF75 ×2 | MEW16 Call for Family; FLF75 Peck Off removes opponent Active Pokémon Tools |
| **Pikachu** | rank4 LOR52 ×1; rank17 XY42 ×1 | LOR52 Pika Dash Ability; XY42 Nuzzle and Quick Attack |
| **Dusknoir** | rank31 PRE37 ×3 **plus** BCR63 ×1 | PRE37 self-KO Cursed Blast, BCR63 repeatable Sinister Hand counter redistribution |

**Five same-name split cases occur within a single original 60**: rank22 Trubbish, rank16 Garbodor, rank15 Pidgeotto and Vileplume, rank31 Dusknoir. Name-only loaders will silently destroy the intended mixed mechanism even if they preserve copy count. The key ALS differences are especially serious for rank15: an AOR Vileplume can Item-lock on the Bench while BUS Vileplume's attack denial requires Active position. One chosen “Vileplume” record cannot substitute for both.

## Method, scope and qualification

For each `full-decklists.json` row, group `card.name` by exact `printing.set:number`. Join set-code to `resources/sets/en.json` `ptcgoCode` and source printed stats to `resources/cards/en/*.json`; if a code maps to multiple English subsets, classify future publication only when **all** matched subsets postdate 10 May. **57 source rows** use set codes not resolved by that narrow English `ptcgoCode` join (mostly Japanese-only/promo/Basic Energy display codes). The audit gives a positive three-row anomaly and an exhaustive eight-name collision under the recorded English display. It does **not** certify Japanese printing IDs or dates for all 29×60 source cards.

Record both `english_display_print` and `event_japanese_print`, preserve exact effect/HP/type, and separately establish native implementation, current errata, paper legality and source tournament provenance. This is a **source-policy and matchup-fidelity warning**, never a new qualified win: the shared benchmark remains **29/32 authenticated original name/count inventories, zero competitive games and no demonstrated 99.5% fixed deck**.
