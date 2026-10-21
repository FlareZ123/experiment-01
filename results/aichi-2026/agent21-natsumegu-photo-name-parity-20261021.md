# Agent 21: Natsumegu independent photographed sixty and rank-21 name-level duplicate

**21 October 2026 | Evidence class: independent primary-photo transcription plus exact source-inventory comparison.** This is a source provenance and field coverage finding. No simulation, win rate, registered-identity finding, or printed-card equivalence is claimed.

## Question and input identity

Agent 6 independently established that the standalone image `dragon-04.png` really occurs as the attached grid inside the first-person post screenshot `dragon-03.png` attributed to **なつめぐ / @yamatodaisuki**. The post reports **Swiss qualifier 16th**, with a first-round Top-32 elimination loss. See [Agent 6's audited original-post/image bridge](agent6-natsumegu-photo-complete60-unassigned-20261020.md). This poster's legal tournament registration name has **not** been authenticated.

I separately inspected all 38 visually badged cells in the original grid **before** comparing the readout with the official published field manifest. Original [May 2026 gallery](https://note.com/nayuta_poke/n/n7e3d0552090b) and [standalone source image](https://assets.st-note.com/img/1778498023-e8KQGOJTRPIDjqX3Cwf6UY5H.png?width=1200), preserved at [archived artifact 12265475896](https://github.com/FlareZ123/experiment-01/actions/runs/39424823375/artifacts/12265475896). Archived image SHA-256: `bbfc196a6297d515692cc00ed4530541e3eb3be7c0afb4bd459dfa585fb650f7`. The [complete 38-cell coordinate-preserving JSON ledger](natsumegu-independent-photo-name-ledger-20261021.json) records the original positions, quantities and explicit unverified-printing status.

## Visual transcription

The four photographed rows contain **10 + 10 + 10 + 8 = 38 distinct cells**. Their badge sums are **14 + 18 + 12 + 16 = 60**. Each name below was read from the standalone card-grid image. Japanese printing collector IDs remain unverified.

| Photo row | Names and photographed quantities | Row copies |
| --- | --- | ---: |
| **1** | 3 Regidrago V; 3 Regidrago VSTAR; 1 Dialga-GX; 1 Noivern ex; 1 Hisuian Goodra VSTAR; 1 Koraidon ex; 1 Kyurem; 1 Dragapult ex; 1 Dedenne-GX; 1 Crobat V | **14** |
| **2** | 1 Squawkabilly ex; 1 Tapu Lele-GX; 1 Marshadow; 1 Budew; 1 Latias ex; 1 Wobbuffet; 1 Battle Compressor; 3 VS Seeker; 4 Mysterious Treasure; 4 Quick Ball | **18** |
| **3** | 1 Hisuian Heavy Ball; 1 Ultra Ball; 1 Super Rod; 1 Counter Catcher; 1 Megaton Blower (ACE SPEC); 1 Muscle Band (Tool); 2 Guzma; 1 N; 2 Professor's Research; 1 Marnie | **12** |
| **4** | 1 Raihan; 2 Crispin; 1 Lillie's Determination; 1 Parallel City; 1 Path to the Peak; 4 Grass Energy; 3 Fire Energy; 3 Double Dragon Energy | **16** |

Independent card-class census: **20 Pokémon, 17 Items, 1 Pokémon Tool, 10 Supporters, 2 Stadiums, 7 Basic Energy, 3 Special Energy**. Visual caution: the image's gold Stadium is **Path to the Peak**, the other Stadium is **Parallel City**, and the ACE SPEC is **Megaton Blower**. The reporter's screenshot supports names and counts much better than microscopic Japanese printing IDs.

## Exact comparison against the published Aichi field

Comparator: [canonical 29-list source manifest](full-decklists.json), original published lists from [Limitless Aichi tournament 566](https://limitlesstcg.com/tournaments/566), using the **card name and physical copy count**. For each pair of 60-card inventories, `shared = Σ_name min(photoCopies(name), publishedCopies(name))`.

| Published finalist's rank | Published player | Matching physical slots by name |
| ---: | --- | ---: |
| **21** | **Shun Nakajima**, Regidrago | **60 / 60** |
| 14 | Manaya Asano, Regidrago | 51 / 60 |
| 12 | Risa Sato, Regidrago | 50 / 60 |
| 10 | Haruku Yoshioka, Regidrago | 49 / 60 |
| 13 | Hiromu Sasaki, Regidrago | 49 / 60 |

All **38 names and their multiplicities** in the new photographic ledger equal **all 38 names and multiplicities** in rank-21 Shun Nakajima's published 60, with **zero name-level additions or removals**. The independent photo is therefore **a duplicate of an already available opponent list at name-inventory resolution**. This precise equality is substantially more informative than a loose common-archetype resemblance.

**Attribution limit:** The equal inventories do *not* establish that @yamatodaisuki is Shun Nakajima, that one person posted another player's 60, or that photo printing IDs are the same. Two competitors can register identical inventories, and Swiss qualifier **16th** does not correspond directly to a final published **21st** rank. The name match is neither proof nor disproof of either player's legal civil name. A verified participant identity or registered deck code is required for any official rank mapping.

## Research implications and next test

1. **Do not import this photo as missing rank 23 or rank 28.** It is demonstrably identical by names to published rank 21 and unassigned by legal name. Repeating its inventory as a newly recovered official target would silently double-count an opponent and distort field-weighted results.
2. **Do not infer functional equality solely from name identity.** Published rank-21 printing identities are English display entries; the photographed Japanese physical set/number remains unverified, and distinct printings of Pokémon such as Wobbuffet or Kyurem can produce materially different attacks or Abilities.
3. If a direct identity bridge later establishes the poster's official final rank, cross-check registered print-specific legality and source authenticity, record whether another entrant registered the same name-level 60, and then update the field manifest through a separate reviewed action.

The authoritative current benchmark status is still **29 of 32 exact published opponent 60s**, missing ranks **23, 25 and 28**. There are **zero competitively qualified game results** and no demonstrated 99.5% fixed deck. This result is provenance evidence, not a reason to advance any deck candidate.

## Reproduction

Load `natsumegu-independent-photo-name-ledger-20261021.json`, verify the 38 cell coordinates are unique, sum its four row totals and all quantities to 60, then group photographed copies by exact English card name. Load `full-decklists.json`, isolate `rank === 21`, independently sum its card rows into the same name-count map, and compare every key and multiplicity. The committed machine ledger records image SHA, original photo URL, artwork uncertainties, and audit provenance. See also [Agent 6's independent source-image linkage](agent6-natsumegu-photo-complete60-unassigned-20261020.md) for why the standalone grid belongs to the poster.
