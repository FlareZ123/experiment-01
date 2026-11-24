# Japanese Extra DDE host-type / attachment-order audit

**Date:** 24 November 2026  
**Author:** Agent43  
**Disposition:** No concrete type-changing candidate found in the available Aichi source field. The existing DDE gate is unchanged.

## Scope and source identity

Audited the ten authenticated DDE-bearing Aichi ranks: **10, 12, 13, 14, 18, 19, 20, 21, 27 and 32**. Deduplicating `(name, printing.set, printing.number)` across those lists yields **79 unique normalized identities**.

- Source: `results/aichi-2026/full-decklists.json`, Git blob `ae773f6201d7aa69d31914dbfee66f3fba692200`.
- Canonical sorted identity digest: `c15c5fde8a67c2eeaffa489bf834496cc86cc150e95b3c41b2896fb6df1e54fe`.
- The source file explicitly says its printing IDs follow Limitless English display where available and that Japanese legality/original printings must be verified separately. These are therefore **not** 79 authenticated physical Japanese print IDs.
- Missing ranks **23, 25 and 28 were excluded**. No inference is made about them.

## Findings

### 1. Double Dragon Energy is Dragon-only in the Japanese printing

The normalized source identity is `Double Dragon Energy — ROS 97`. The official Japanese XY6-B printing is **078/078** (official card record 30933).

The official card-search page's extracted text layer omits the small ruby/furigana term above “Pokémon”. That omission is not a different card rule: the official XY6 product guide explicitly describes Double Dragon Energy as attachable only to Dragon-type Pokémon, and the official card image for a reprint visibly renders 「ドラゴン」 above 「ポケモン」. The official FAQ also confirms that when a Dragon-type Zweilous evolves into a non-Dragon Hydreigon, the attached Double Dragon Energy is discarded.

This agrees with the supplied English `cards/en` record `xy6-97`: attach only to Dragon Pokémon; discard it if it is attached to anything other than a Dragon Pokémon. **No Japanese-only relaxation of the DDE attachment restriction was found.**

Primary Japanese sources:
- Official XY6-B 078/078 card record: https://www.pokemon-card.com/card-search/details.php/card/30933
- Official XY6 product guide describing the Dragon-type restriction: https://www.pokemon-card.com/products/xy/xy6/xy6_000087.html
- Official DDE FAQ, including the Zweilous → non-Dragon Hydreigon discard ruling: https://www.pokemon-card.com/rules/faq/search.php?page=2&regulation=all&sc_group_id=419
- Official card image URL for XY6-B 078/078: https://www.pokemon-card.com/assets/images/card_images/large/XY6-B/030933_E_DABURUDORAGONENERUGI.jpg

### 2. The 79 normalized identities contain no other identified type-changing effect

The supplied English card archive was hashed as `c39af257e60a79a485aad09c7d7723b6afbb42eae1ba74e280b8a3f77581350a`. It contains 20,635 unique card records.

- **73 of 74 non-Basic-Energy identities** match an English card-pool record by exact displayed set/number/name.
- The one non-energy identity absent from that archive is **Battle Compressor — PHF 92**. Its official Japanese XY4 printing is **079/088** (official card record 30550); its text discards up to three cards from the deck and shuffles. It is not a type-changing effect and its absence from this Expanded card archive is not evidence of a Japanese-only mechanic.
- The five Basic Energy entries use generic `MEE` placeholders (Grass, Fire, Lightning, Fighting and Darkness). These are not exact physical-print identifiers and have no effect text that could change a Pokémon's type.

The seven non-energy English-text hits for “type” / “Dragon” in the 79 identities are Regidrago V, Regidrago VSTAR, Crispin, Mysterious Treasure, Double Dragon Energy, Salamence ex and Ho-Oh-EX. None changes a Pokémon's type:
- Regidrago V/VSTAR and Mysterious Treasure refer to Dragon Pokémon or attacks/search targets.
- Crispin selects Basic Energy cards of different types.
- Double Dragon Energy restricts its host to Dragon Pokémon; it does not change the host's type.
- Salamence ex has no type-changing effect.
- Ho-Oh-EX's Rebirth attaches three different types of Basic Energy and Rainbow Burn counts those Energy types; neither changes Ho-Oh's Pokémon type.

The official Japanese Ho-Oh-EX printing **BW5-Brn 009/050** (official card record 27916), corresponding to normalized `DRX 22`, confirms those same Rebirth/Rainbow Burn effects: https://www.pokemon-card.com/card-search/details.php/card/27916

The official Japanese Battle Compressor printing **XY4 079/088** confirms its ordinary deck-discard Item effect: https://www.pokemon-card.com/card-search/details.php/card/30550/

### 3. Opponent-side cross-check

A broad scan of the English card pool for Pokémon identities with type-changing/type-setting text was intersected with all **29 available Aichi lists** and the fixed Hood Shield candidate 60. The only intersection with the candidate-name set in the Aichi lists was Ho-Oh-EX (rank 19), whose Japanese text is described above and does not change Pokémon type. The fixed Hood Shield 60 had no intersection.

The constructed Kecleon PLF 94 transition used by review-only PR #67 is not present in any of the 29 available Aichi lists or the fixed Hood Shield candidate. It remains a useful synthetic transition test, not a known field-card interaction.

## Conclusion and limits

**No concrete own-side or opponent-side effect in the 79 normalized DDE-list identities, the 29 available Aichi lists or the fixed candidate was found that changes a DDE host's Pokémon type during `AttachEnergyEffect` propagation or creates a type-preflight ordering counterexample.** The apparent DDE text discrepancy was a ruby-text extraction omission; the Japanese printed rule is Dragon-only.

This is an identity-level source audit, **not** exact physical-print certification. The Limitless source does not record the actual Japanese printing for each of the 79 identities; those printings remain unresolved rather than inferred. The five generic Basic Energy placeholders are also not exact prints. Ranks 23/25/28 remain outside scope and unknown.

No code, PR, test, workflow, CI run, fixture or DDE gate was changed. This report does not establish full-field ordering equivalence, a matchup, policy competence or competitive performance. Keep the existing DDE gate disposition unchanged.


### Timing classification for the preflight-order question

Agent16's review clarification distinguishes a type state already established before attachment (which the cloned `CheckPokemonTypeEffect` probe can see) from a type change caused **during the same `AttachEnergyEffect` propagation before the DDE reducer's recipient check** (the actual ordering-counterexample category). No type-changing card/ability was found in the 79 DDE-list identities, the 29 available Aichi lists, or the fixed Hood Shield 60, so no same-propagation candidate surfaced. The Kecleon PLF 94 case in PR #67 changes the host's type after a Switch prompt and exercises the later state-check/discard path; it is not evidence of a type change triggered inside the DDE attachment propagation.
