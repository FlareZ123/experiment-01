# Agent 21: first-person Top32 Itoko official saved-deck Japanese print 60, exact rank-27 name-inventory match

**21 October 2026. Evidence category: publicly accessible official saved-deck print IDs and a strict inventory comparison.** This analysis investigates source provenance, not a new qualified opponent registration, game simulation, competitive win, or identification of a person's legal name.

## Original sources and capture method

Agent 49 identified a public first-person Aichi Open League 2026 Top32 participant report by **いとこ / @itoko_pokemon**, with a published Japanese Pokémon deck-code string **`ySpy2S-Ey5WAe-RX3Rpp`**. The source account describes a 7–1 qualifying record and a first-round Top32 elimination, without a verified legal name or final ranked placement: [original article](https://note.com/itoko_/n/n0758eccdf029), [Agent 49's conservative initial attribution record](../../communications/agent3/20261020T1606Z_agent49_rank23_public_unassigned_source.md).

The directly linked [official saved-deck viewer](https://www.pokemon-card.com/deck/confirm.html/deckID/ySpy2S-Ey5WAe-RX3Rpp/) was retrieved with a strictly bounded, source-allowlisted program [`scripts/aichi_public_top32_deck_code.py`](../../scripts/aichi_public_top32_deck_code.py). It extracts all eight official deck-section hidden inputs, intersects each card identifier with the server-rendered `PCGDECK.searchItemName` and `searchItemCardPict` dictionaries, preserves Japanese printing card IDs/sets and card counts, rejects duplicated printing identifiers and absent section/60-count evidence, and writes locked, atomic source captures. Its five [offline parser regressions](../../tests/test_aichi_public_top32_deck_code.py) test fail-closed behavior. Both parser and actual source retrieval completed successfully in [manual, opt-in GitHub Actions run **39521742767**](https://github.com/FlareZ123/experiment-01/actions/runs/39521742767).

### Exact archive evidence

- Workflow artifact **[12310554878](https://github.com/FlareZ123/experiment-01/actions/runs/39521742767/artifacts/12310554878)**: original `itoko-official-viewer.html` and `itoko-japanese-printed60.json`.
- Archived ZIP SHA-256 **`ac5aa9ddd5f6b9de4cbb229180cb528ded447012f515fcdc1c88982a0b0c94e5`**, independently rehashed from downloaded artifact.
- Original saved-viewer HTML SHA-256 **`171125d4ec175adc90b4684b61201ae27c05fe711277465c5b1d2f86a53c5c1d`**, independently rehashed from raw extracted HTML.
- Official viewer result: **37 distinct Japanese printing IDs, 60 physical copies**, in **20 Pokémon, 30 Trainers, 10 Energy**. The original source remains a saved-deck export. Its printing identity is authentic *for the saved list*, whereas the list's actual submitted event registration is **not** independently authenticated.
- Full machine-readable [37-print bilingual crosswalk and conservative evidence status](itoko-public-official-saveddeck-japanese-print60-unassigned-20261021.json) preserves `japanese_card_id`, `japanese_set`, `japanese_name`, English mechanical card-name translation, quantity, and official viewer section for every item. This crosswalk is based on names and known English correspondences; the saved printing may differ from a published English reference printing.

## Independent field-inventory reconciliation

After obtaining the official Japanese entries, I matched each Japanese name to its known English card name and grouped `name -> sum(quantity)` across all 37 rows. The comparator is the existing [29-source published Aichi field manifest](full-decklists.json), which displays an English printing for each reference card. The grouped physical-copy comparison metric is

`shared(A,B) = Σ_card-name min(copies_A, copies_B)`.

| Published Regidrago rank | Published entrant | Shared name-level card copies |
| ---: | --- | ---: |
| **27** | **Yuya Nagatsuma** | **60 / 60** |
| 12 | Risa Sato | 54 / 60 |
| 20 | Satoru Imamura | 50 / 60 |
| 21 | Shun Nakajima | 49 / 60 |
| 14 | Manaya Asano | 48 / 60 |

The complete original source **matches all 37 rank-27 printed list card names and their quantities exactly**, with **zero swaps** by this name-inventory metric. Especially distinguishing entries include **2 Dialga-GX**, **1 Eldegoss V**, **1 Prime Catcher ACE SPEC**, **1 Net Ball**, **2 Professor Sycamore**, **1 Echoing Horn**, **2 Muscle Band**, and **4 Double Dragon Energy**. All are present at the same multiplicities in rank-27 Yuya Nagatsuma. This precise match is much stronger evidence of source inventory affinity than the generic Regidrago archetype label.

There are several possible explanations. The same person may publish under a screen name and register under a legal name, or one entrant may publish a list shared by a separate competitor. The public article and official saved-deck export do **not** directly resolve **@itoko_pokemon → Yuya Nagatsuma**, and the exact 60-match alone cannot establish identity or which list was event-registered. The rank-27 60 is already in the reference manifest, so this source does not justify adding another independently authenticated ranked 60.

## Crosscheck with the other unassigned photographed source

A different first-person post, Natsumegu `@yamatodaisuki`, has an independently recovered original **38-grid/60-card** photo. The [Agent21 photo transcription](agent21-natsumegu-photo-name-parity-20261021.md) matches published **rank21 Shun Nakajima** by all 60 English name/count slots. The Itoko saved-deck export matches **rank27 Yuya Nagatsuma** by all 60 name/count slots. This demonstrates that the two recent unassigned source leads represent **two different exact English-name sixty-card inventories**, each also appearing among **already published** competitors.

Neither fact establishes the civil identities or official finish ranks of the posters. Another nearby source, [Replica's photographed 60](rank28-replica-visual-transcription-audit-20261020.md), self-reports Swiss place 28 and has 53 strict name-copy overlap with published rank10, but its registration still awaits independent final-identity and printing corroboration.

## Boundaries and disposition

- **Official viewer provenance:** source deck code and 37 Japanese printed IDs are real saved-list data; first-person article authorship and exact Aichi registration relationship require separate evidence.
- **Paper legality:** a saved list and its English-named mechanical counterpart need printing/errata/region-specific legality verification before being used as a fully qualified Japanese paper Expanded simulator source. This work alone does not establish legality of each printing or full-rule correctness.
- **Comparison:** name-level duplicate of rank27 can help test whether two publicly disseminated lists are mechanically comparable, but may not be counted as another *independent opponent* nor a newly recovered rank23 list without proper identity binding.
- **Field decision:** the unchanged certified field remains **29/32 exact published opponent source 60s**, missing **23 Yuki Ueno, 25 Kazuki Kumegawa and 28 Jo Kato**. No official rank assignment was added to the manifest. There are **zero competitively qualified two-player game wins/losses** for a fixed candidate and no demonstrated 99.5% deck.
- **Compute hygiene:** one opt-in job on existing manual `aichi-deck-ingest.yml` only, with no on-push workflow. Preserve this archival result and pursue player-identity evidence or the canonical bilateral game-policy critical path rather than repeat successful captures of the same code.

### Reproducing the 60-name comparison

The full [bilingual crosswalk JSON](itoko-public-official-saveddeck-japanese-print60-unassigned-20261021.json) contains 37 unique Japanese IDs, each with official Japanese `japanese_set` and card count; sum to 60 and regroup `english_name` by quantity. In [`full-decklists.json`](full-decklists.json) filter `rank === 27`, group `name` by `count`, and compare the maps key-by-key. Verify that the 37 Japanese source print identities are maintained independently of rank27's English proxy printing IDs; no guessed print-ID equality is needed for name-parity.
