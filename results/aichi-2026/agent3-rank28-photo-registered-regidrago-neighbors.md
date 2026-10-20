# Replica provisional full-photo 60 versus nine published Aichi Regidrago 60s

**Agent 3, 20 October 2026. Card-name/count overlap only. The rank-28 source remains unverified.**

## Question

How structurally distinctive is the 60-card photograph independently associated with `レプリカ / @nnaacc5_uec` compared with the **nine fully published** Regidrago registrations? Which exact-source opponent could inform hypotheses for this unverified list without becoming a substitute for it?

## Sources and deterministic comparison

- Input photo inventory: [Agent 1's 38-cell ledger](rank28-replica-pnote-visual-badge-ledger-20261020.md) from [original gallery artifact 12265475896](https://github.com/FlareZ123/experiment-01/actions/runs/39424823375/artifacts/12265475896). The source's **R4C2 is 2 Professor Juniper** as [independently supported by original photo and Japanese artwork](agent3-rank28-photo-supporter-disambiguation.md). Do not use the alternate Agent 48 uncorrected 2× Guzma & Hala entry.
- Reference: [full-decklists.json](full-decklists.json), all 29 published source print/name inventories; filter `archetype === "Regidrago"` (nine lists).
- Normalize only **`Basic Fire Energy`→`Fire Energy`**, **`Basic Grass Energy`→`Grass Energy`** and **`Battle Compressor Team Flare Gear`→`Battle Compressor`**, because the photographic ledger and English registration display use different textual conventions for those three same-named mechanics. **Do not** equate Professor Juniper to Professor's Research or Sycamore, or any other different card name, merely because their effects can be similar.
- For count vectors `p(card)` (photo) and `q(card)` (registered 60), calculate **copy overlap `Σ min(p(card),q(card))`** over the union of names; the number of one-card count substitutions needed to change one 60-card multiset into the other is **`60 − overlap`**. This is a deterministic multiset distance, not an AMR score or a gameplay predictor. Both inventories sum exactly to 60.

| Published Regidrago rank | Copy overlap / 60 | Minimum card-count substitutions |
| --- | ---: | ---: |
| **10** | **53** | **7** |
| 13 | 49 | 11 |
| 21 | 49 | 11 |
| 20 | 48 | 12 |
| 12 | 46 | 14 |
| 27 | 46 | 14 |
| 14 | 45 | 15 |
| 32 | 44 | 16 |
| 18 | 43 | 17 |

## Exact seven substitutions separating the photo from published rank10

| Photo-only additions to rank10 | Rank10-only cards to remove | Copies |
| --- | --- | ---: |
| Noivern ex | Budew | 1 |
| Ultra Ball | Quick Ball | 2 |
| Professor Juniper | Professor's Research | 2 |
| Path to the Peak | Carmine | 1 |
| Fire Energy | Double Dragon Energy | 1 |

All remaining 53 copies agree by normalized card name and quantity. The lone extra Noivern ex potentially changes the copied attack payload options, Ultra Ball increases optional discard-to-search paths at a two-card payment, and replacing Carmine with Path to the Peak changes active tactical options. Such hypotheses require state-specific rules and match testing; the distance itself implies nothing about competitiveness. There is **no demonstrated team/author relationship** between the photographers or proof that the photo is a modification of Haruku Yoshioka's rank10 registration.

## Research implication and hard boundary

Rank10 is a useful **nearest published full-source structural reference** for designing candidate policy regression questions involving this tentative rank28 inventory. Seven distinct card-copy differences still affect prize composition, discarded Dragon attacks, Supporter sequencing and Stadium timing. Never relabel rank10 as the actual rank28 list, use the photo for official registration claims, or count a rank10 result as an independent tested rank28 matchup.

The [Swiss-to-final-place provenance warning](agent3-swiss-place-versus-final-top32-warning.md) and absent precise Japanese print/registration link keep rank28 **provisional**. Verified full-registration coverage stays **29/32** and competitively qualified game count stays **zero**.
