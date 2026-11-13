# Aichi ranks 8–16: Expanded card-pool and banned-identity screen

**Agent 39 · 13 November 2026 · nine authenticated source inventories · no game evidence**

## Result

Ranks **8–16** each contain exactly 60 cards (540 copies total). On the repository's frozen source inventory and supplied English card pool, all nine pass a **card-pool / banned-identity screen**:

- 479/540 copies match an English card-pool entry by the source set/number/name.
- 10/540 copies are the same Trainer represented by the source shorthand Battle Compressor PHF 92; the card-pool match is Battle Compressor Team Flare Gear XY4 92.
- 51/540 copies are MEE-coded Basic Energy placeholders (not special Energy or distinct mechanics); a paper Expanded normalization must choose an actual legal Basic Energy printing.
- No Japanese-only promo identity appears in these nine lists.
- All nine also pass deck-construction checks: exactly 60 cards, no non-Basic card above four copies, exactly one ACE SPEC, no duplicate copy of a Prism Star identity, and at most one Radiant Pokémon (zero in this slice).
- No exact international Expanded-banned printing appears in the slice. Agent 3's independent overlay of the current official 49-printing ban list found zero exact hits across all 29 source lists. Eight officially banned printings have stale `expanded: Legal` flags in the bundled card snapshot, but none appears in these nine lists; do not use the snapshot flag alone as the ban gate.
- The only Japanese-banned-name candidates in the slice are Unown AOR 30 and Marshadow UNB 81. Their exact card texts are not the banned variants: AOR 30 has Farewell Letter, not DAMAGE/HAND; UNB 81 has Resetting Hole, not Let Loose.

This is a **normalized card-pool pass**, not proof of the exact physical Japanese print each player used. I also produced [machine-readable normalized inputs for ranks 8–16](agent39-ranks8-16-expanded-normalized-inputs-20261113.json): each source 60 is retained alongside a derived 60-card English-print representation, with only Basic Energy placeholder and Battle Compressor alias normalization. Every derived list remains 60 cards (540 total); the file explicitly marks physical source prints unresolved and `admitted_to_verified_field: false`. Keep the physical-source-print status open and do not promote these nine to the verified opponent denominator solely on this report.

## Per-rank accounting

| Rank | Player | Archetype | Matched copies | Battle Compressor alias copies | Basic Energy placeholder copies | Japanese banned-name candidate |
|---:|---|---|---:|---:|---:|---|
| 8 | Yusuke Kobayashi | Absol / Garbodor | 51 | 2 | 7 | — |
| 9 | Shun Ito | Absol / Electrode | 57 | 1 | 2 | Unown AOR 30 ×4 — Farewell Letter |
| 10 | Haruku Yoshioka | Regidrago | 53 | 1 | 6 | Marshadow UNB 81 ×1 — Resetting Hole |
| 11 | Wataru Yano | Absol / Garbodor | 52 | 0 | 8 | — |
| 12 | Risa Sato | Regidrago | 54 | 0 | 6 | Marshadow UNB 81 ×1 — Resetting Hole |
| 13 | Hiromu Sasaki | Regidrago | 51 | 2 | 7 | — |
| 14 | Manaya Asano | Regidrago | 53 | 1 | 6 | Marshadow UNB 81 ×1 — Resetting Hole |
| 15 | Ryotaro Nozawa | Lopunny / Vileplume | 58 | 0 | 2 | — |
| 16 | Takumi Matsumoto | Absol / Garbodor | 50 | 3 | 7 | — |
| **Total** |  | **9 × 60** | **479** | **10** | **51** | **7 non-banned candidate copies** |

Accounting source: results/aichi-2026/full-decklists.json and results/aichi-2026/card-coverage.json. Every row sums to 60 copies. The three columns sum to 540.

## Deck-construction checks

| Rank | Pokémon / Trainer / Energy | ACE SPEC | Prism Star | Radiant Pokémon | Maximum copies of any non-Basic card |
|---:|---:|---|---|---:|---:|
| 8 | 12 / 41 / 7 | Secret Box ×1 | Tapu Koko ♢ ×1 (card-pool label ◇) | 0 | 4 |
| 9 | 15 / 38 / 7 | Secret Box ×1 | 0 | 0 | 4 |
| 10 | 20 / 30 / 10 | Prime Catcher ×1 | 0 | 0 | 4 |
| 11 | 13 / 39 / 8 | Secret Box ×1 | 0 | 0 | 4 |
| 12 | 20 / 30 / 10 | Megaton Blower ×1 | 0 | 0 | 4 |
| 13 | 17 / 33 / 10 | Megaton Blower ×1 | 0 | 0 | 4 |
| 14 | 21 / 29 / 10 | Megaton Blower ×1 | 0 | 0 | 4 |
| 15 | 25 / 28 / 7 | Grand Tree ×1 | 0 | 0 | 4 |
| 16 | 14 / 39 / 7 | Secret Box ×1 | 0 | 0 | 4 |

Basic Energy is exempt from the four-copy rule; Special Energy is not. Counts are summed by card identity across different printings, so rank 15's three Vileplume and rank 16's three Garbodor are counted together across their distinct prints. Rank 8 is the only deck in this slice with a Prism Star, Tapu Koko ◇ ×1. No Radiant Pokémon appears in ranks 8–16.

## Card-specific resolution

### Alias and generic Energy

- Battle Compressor PHF 92 resolves to English card-pool ID xy4-92, Battle Compressor Team Flare Gear. This is a naming normalization, not a card substitution; its English Expanded legality is Legal.
- MEE 9/10/12/15 rows in this slice are Basic Grass/Fire/Lightning/Darkness Energy placeholders. They do not identify a unique functional printing. For a normalized English paper list, replace each placeholder with a legal Basic Energy of the same type and record the chosen print explicitly. Do not claim that MEE is an authenticated physical printing.

### Japanese ban-list collisions are different card identities

- Rank 9 uses Unown AOR 30 ×4. The supplied card pool gives it the Farewell Letter Ability. The Japanese banned Unown identities are the DAMAGE and HAND variants; this AOR print is not either one.
- Ranks 10, 12 and 14 use Marshadow UNB 81 ×1 each. The supplied card pool gives it Resetting Hole. The Japanese banned Marshadow identity is the Let Loose Ability; UNB 81 is not that card.
- No other Japanese banned-name candidate appears in ranks 8–16. Rank 31's Duskull PRE 35 is outside this slice; do not generalize the above result to it without its own print/text check.

### Date and same-name print distinctions

- Rank 16 contains Trubbish CRI 56 ×2, whose English Chaos Rising release was after the Aichi event. Agent 6's card-level crosswalk maps it to Japanese M4 #54 (Ninja Spinner), released 13 March 2026, before the 10 May event; the Japanese and English entries align on Basic Darkness type, 70 HP, illustrator and Acid Spray text. See [Agent 6's CRI–M4 crosswalk](agent6-english-cri-japanese-m4-aichi-date-crosswalk-20261103.md) and the [official M4 card page](https://www.pokemon-card.com/card-search/details.php/card/50138).
- Karen XYP 177 occurs in ranks 8, 15 and 16. The new [XYP Japanese-print crosswalk](agent39-xyp-japanese-print-crosswalk-20261113.md) maps it to pre-event Japanese 256/XY-P with matching effect.
- Rank 15 retains Vileplume AOR 3 ×2 and Vileplume BUS 6 ×1 as distinct source printings. Their different printed Abilities must not be collapsed by name; see [field printing mechanics audit](../field-printing-mechanics-audit.md).
- Rank 16 retains Garbodor LTR 68 ×2 and BKP 57 ×1 as distinct source printings. Preserve their different attacks even though both carry Garbotoxin.

## Method and evidence boundary

1. Read each 60-card inventory from the frozen roster and join every source row to card-coverage status by rank.
2. Resolve only the known PHF 92 Battle Compressor alias to XY4 92; preserve all other source set/number identities.
3. Compare exact English source printings with the current official international Expanded banned-printing list. Agent 3's 13 November overlay covers 27 banned identities / 49 exact printings and finds zero exact hits across all 29 Aichi source lists. Eight officially banned printings have stale `expanded: Legal` flags in the bundled snapshot (Duskull CEC 83; four Flapple prints; three Medicham V prints), so the card-pool flag alone is not a sufficient ban gate.
4. Separately compare card names that collide with Japanese banned identities against the actual Ability/attack on the exact source English print. Only Unown AOR 30 and Marshadow UNB 81 occur in this slice, and neither has the banned Ability.
5. Resolve the only post-event English-display row in this slice (Trubbish CRI 56) against its pre-event Japanese M4 counterpart. Resolve the XYP promo chronology separately through official Japanese card pages.

Inputs and prior evidence:
- results/aichi-2026/full-decklists.json
- results/aichi-2026/card-coverage.json
- results/aichi-2026/2026-11/agent39-ranks8-16-expanded-normalized-inputs-20261113.json
- results/legality/japan-expanded-aichi-2026.json
- results/aichi-2026/japanese-legality.md
- results/methodology/2026-11/agent7-expanded-vs-aichi-field-legality-audit-20261112.md
- results/aichi-2026/2026-11/agent3-expanded-banlist-snapshot-discrepancy-20261113.md
- results/aichi-2026/2026-11/agent6-english-cri-japanese-m4-aichi-date-crosswalk-20261103.md
- results/aichi-2026/2026-11/agent39-xyp-japanese-print-crosswalk-20261113.md

## Reproducibility

Three focused Node tests now cover the normalized ranks 8–16 inputs, the nine-row XYP Japanese-print crosswalk, and deck-construction rules across all 24 identity-screened lists. They are wired into `.github/workflows/aichi-card-audit.yml`. That workflow is manual and was **not dispatched in this invocation**, so the new test execution remains pending; the findings above are based on direct source/card-pool analysis and the linked per-rank reports.

## Disposition

Ranks 8–16 pass the **English card-pool / banned-identity screen** and can be represented as Expanded-legal 60s after the explicit Basic Energy and alias normalizations above. This reduces the unreviewed card-pool slice, but does not certify the original physical Japanese printings or the event's complete format.

Keep these nine in a separate **screen-passed, physical-print unresolved** state. Do not label the Aichi Top 32 as an Expanded-legal field: the five separately identified Japanese-only-promo lists remain incompatible, and ranks 23, 25 and 28 remain unavailable. The full-field 99.5% objective is still untested.
