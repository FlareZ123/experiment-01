# Agent42: exact-card archive coverage of all 29 authenticated Aichi original 60s

**1 November 2026 | deterministic source-to-archive inventory, no game simulation.** The complete authenticated original source register `results/aichi-2026/full-decklists.json` has **29 decks, 989 count-bearing card rows and 1,740 physical copies**. The repository's supplied `resources/sets/en.json` and `resources/cards/en/*.json` provide the independent English card archive. This census read all **66 source display set codes** in four disjoint alphabetical groups and all 69 mapped archive set files with zero retrieval failures. The source register is unchanged.

For each source row, require the registered set code, collector number and exact name to resolve to one card in an archive set. Normal set codes use exact `ptcgoCode` metadata. Promos with missing `ptcgoCode` use explicit archive set IDs and registered collector-prefix mappings `XYP n -> xyp XY n`, `BWP n -> bwp BW n`, `SMP n -> smp SM n`, without searching for a convenient unrelated card. The source code `SP` is not registered as an English archive set. No inferred printing replaces a missing card.

| Independent archive match class | Original rows | Original copies | Meaning |
| --- | ---: | ---: | --- |
| Exact name, collector number and mapped set | **911** | **1,549** | Strict source printing identity matched one archived card |
| Collector/set match, displayed-name difference | **34** | **57** | Specific archive printing located, but displayed names differ |
| No English archive printing located | **44** | **134** | Unverified by this English archive; cannot assign card text from it |
| **All 29 originals** | **989** | **1,740** | 29 × 60 |

The 57 number-exact/name-different physical copies all have an identifiable same-set same-collector archive record, with four narrow name families: **37 copies** printed as `Battle Compressor` / `Robo Substitute` / `Target Whistle` in source register versus `... Team Flare Gear` in archive (PHF 92/102/106), **12 copies** displayed with `♢` versus archive `◇` (LOT Ditto / Thunder Mountain, TEU Tapu Koko / Wondrous Labyrinth), and **8 copies** source `Unit Energy LPM UPR138` versus archive `Unit Energy LightningPsychicMetal`. Their **collector numbers** uniquely matched in their archive sets; name normalization is documented, not permission to rewrite other source cards indiscriminately.

The 134 copies absent from the English archive consist of:
- **120 Basic Energy copies** in 35 source rows with `MEE` set codes (22 of 29 original decks). This is an *unlisted source printing* rather than evidence that Basic Energy as a game resource cannot be modeled; type-specific correctness must still be checked.
- **14 Trainer copies** in nine original rows: `Palace Book SMP NAN25` **6** copies, `Player's Ceremony SP127` **5**, `Palace Belt BWP153` **3**. No alternative English text or legal implementation is assumed.

These 14 unlisted Trainer copies occur in five exact original field lists: **rank3 Snorlax Stall (1), rank6 Iron Thorns (3), rank7 Snorlax Stall (3), rank24 Iron Thorns (4), rank29 Iron Thorns (3)**. Therefore **all three** original Iron Thorns source 60s that the common bilateral runner uses or plans to use contain at least one Trainer whose source printing this supplied English database cannot resolve. The known rank6 source is the central opponent-policy development benchmark. This is an important **paper-source verification gate** for claims about all printed actions in that matchup, although a particular game need not draw/play those missing cards.

### Reproduction and limits

Four independently evaluated sorted-code partitions yielded strict exact / mismatch / unknown rows and copies:
- Codes AOR–CRI: 219/382 strict, 2/3 mismatch, 0 unknown.
- Codes CRZ–MEW: 223/412 strict, 5/5 mismatch, 35/120 unknown.
- Codes NVI–SCR: 197/371 strict, 20/37 mismatch, 0 unknown.
- Codes SFA–XYP: 272/384 strict, 12/21 mismatch, 4/5 unknown.

The mismatches partition into 57 recoverable displayed-name differences and 9 physically unresolved Trainer copies. Each set file was retrieved by its current GitHub source revision; this was a read-only source census, not a new CI run or live Store trial. If the shared card archive or registered printing list changes, recompute these counts. A code/name/number identity match alone cannot establish Japanese paper legality, card-effect fidelity, Twinleaf implementation support, correct hidden-owner selections, or official timed match results.

**Practical gate:** record `ARCHIVE_EXACT`, `ARCHIVE_NUMBER_MATCH_NAME_ALIAS`, and `ARCHIVE_UNLISTED` on exact source-owned prompt/card events using the registered source-rank SHA; never upgrade a game to universally paper-verified merely because its deck's count of registered cards equals 60. Prioritize the three original Iron Thorns lists' unresolved Trainer printings when their actions appear in a native game.

**Global benchmark status:** 29/32 original 60s authenticated, three source-original full lists still unknown, **zero competitively qualified games**, and no demonstrated 99.5% fixed deck.


## Separate Japanese primary-text follow-up for the 14 English-unlisted Trainers

A missing English archive record is **not the same as missing authentic Japanese card text**, and must not be called a native implementation absence. Independent official Japanese Pokémon card-search pages identify all three printed Trainer effects:

| Original English display | Official original printed identity | Official Japanese wording, concise English interpretation |
| --- | --- | --- |
| `Palace Book SMP NAN25` | [殿堂の書 SM-P promo](https://www.pokemon-card.com/card-search/details.php/card/34382/regu/all) | Playing this Item ends the player's turn and draws three cards |
| `Player's Ceremony SP 127` | [プレイヤーズセレモニー S-P 127](https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY) | Stadium usable once each player's turn: draw two cards, then that player's turn ends |
| `Palace Belt BWP 153` | [殿堂ベルト BW-P 153](https://www.pokemon-card.com/card-search/details.php/card/28213) | Pokémon Tool: while the holder is Active, it draws two instead of one at the start of its turn |

These are **human translations/paraphrases of primary Japanese card text**, not fabricated contents of the English ZIP. The primary Palace Book page confirms the name, card category and effect; the source's `NAN25` is a Limitless normalized promo-number label, so a source-number bridge still needs independent collector-code provenance. Printed effects require rules-era and current errata checks before certification.

Earlier researchers already built distinct engine support: an upstream Palace Book reducer and original pinned Palace Belt behaviour were inspected by Agent1 (see `communications/agent2/2026-10-15T230218Z_agent1_palace-book-staging.md`); Player's Ceremony is a **research-owned reversible hook**, with a compiled staged real-Store two-seat Play + Use + draw2 + turn-end fixture in Agent33's [report](../aichi-2026/agent33-players-ceremony-owner-lastchance-20261030.md), CI 41273271820. The latter is still default off and no original field turn was paper-qualified by that fixture.

Thus the 14-copy figure measures **English archive ingestion gaps**. It does not prove those cards lack all external evidence or are universally unsupported in Twinleaf. For a full benchmark, the remaining separate questions are source-print identity (particularly Palace Book's `NAN25`), Japanese legality, exact active-turn effects, opted-in native hook profile, and source-dealt owner-play reachability.


## Source-controlled repeatable whole-roster census

A reusable CommonJS reader now exists at [`scripts/agent42-original-card-archive-census.cjs`](../../scripts/agent42-original-card-archive-census.cjs), with [`tests/agent42-original-card-archive-census.test.cjs`](../../tests/agent42-original-card-archive-census.test.cjs). It reads the actual checked-in original 29 source 60s, sets metadata and complete original archive JSON directly; counts each physical copy by authenticated source rank and printing number; and emits structured unknowns.

Important safety refinement: the source-to-archive **display-name alias status requires one of four explicitly reviewed name families** (Team Flare Gear suffix for Battle Compressor/Robo Substitute/Target Whistle, `Unit Energy LPM` naming, and the diamond glyph). A collector number with a different unrelated name is now marked **`ARCHIVE_NAME_CONFLICT`**, not automatically treated as an acceptable alias. The current real field census previously observed **zero** such arbitrary name conflicts; that expected zero is pinned in a regression. A wrong collector number remains unlisted.

The committed Node 22 tests assert the entire 911/34/44 row census, 1,549/57/134 copy census, 69 set files and the exact unresolved names, including deliberate unrelated-name and mistaken-number negatives. **The Node 22 tests have not yet been executed by CI in this invocation**. The independent four-batch GitHub-reading census reported above supplies prior computational evidence, but do not describe these newly added tests as passing without a completed runner receipt.


## Reconciliation with the pre-existing source coverage register

**Corrected novelty assessment:** the repository already contained `results/aichi-2026/card-coverage.json` before this investigation. That existing English-archive census reported **923 matched rows / 1,561 matched copies**, **22 differing-name rows / 45 copies**, **39 absent-set rows / 125 copies**, and **5 absent-number rows / 9 copies**. The independent audit in this document recovers the **same underlying physical classification**. Its 911-versus-923 strict matched difference is exactly the **12 one-copy `♢` source records** the older census had already normalized to archive `◇` names before classifying them as matched. Consequently `911+34 = 923+22 = 945` source rows and `1549+57 = 1561+45 = 1606` copies have identifiable matching archive records; **44 rows / 134 copies** remain English-archive unlisted in both censuses.

The absence of the 14 specialized Japanese Trainers and 120 `MEE` Basic Energy source copies was therefore **already known**. The incremental contributions here are an independent reconciliation, the explicit fail-closed finite alias allowlist/collector-name-conflict label, an executable regression with full-source frozen expectations, and verified Japanese primary-text/unnumbered Palace Book provenance. Neither source archive census on its own demonstrates new game strength or repairs the evaluator. Future research should prioritize resolving operational paper-prompt and owner-action gates over re-counting these known archive gaps.
