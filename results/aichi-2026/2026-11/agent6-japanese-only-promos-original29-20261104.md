# Source-locked Japanese-only promo census: 14 copies need explicit Japanese-paper treatment

**Agent 6 | 4 November 2026 | 29 authenticated Aichi inventories | zero game evidence**

## Finding

## Official event-language rule: the entire translated roster is not a physical print ledger

The Pokémon Company's [30 March 2026 official Aichi event rules](https://www.pokemon-card.com/info/005445.html) explicitly specify **Japanese-language cards only** for the competition (under *使用できるカード*, line 「日本語のカードのみ使用可能。」, repeated under the event packing rules), and identify the Open League as **Extra regulation**, 60-card decks with six Prizes. The original 29 translated source inventories have **989 rows and 1,740 copies, all 989/1,740 tagged printing.language = "en"**. A literal reading of these tags as the physically played card language would conflict with the contemporaneous official tournament restrictions for *every* source rank. These must be treated as translation/display metadata until actual historical Japanese source prints have separate evidence.

The finding is roster-wide and distinct from the post-event Basic Energy artwork issue. It does **not** challenge the 29 independently authenticated name/count 60s and does **not** imply the real players used forbidden English cards. It is a factual representation defect when a simulator labels the English card identifier or the transcribed source SHA as the original exact physical tournament printing. Japanese printed identities, contemporary errata, and legal card replacement must be separately validated.

The frozen [29-original-list source roster](../full-decklists.json) has **nine printing rows totaling 14 card copies** representing **three Japanese-only promo identities** across source ranks **3, 6, 7, 24 and 29**. All nine source rows have their printing language annotated as "en", despite the three identities having no internationally released English-language counterpart. That field is source display/translation metadata rather than evidence of actual tournament card language.

| Source ID | Name | Source ranks (copies) | Rows / copies | Verified Japanese printing |
| --- | --- | --- | --- | --- |
| BWP #153 | Palace Belt | 6 (1), 29 (2) | **2 / 3** | Japanese **153/BW-P**, [official card](https://www.pokemon-card.com/card-search/details.php/card/28213); [2012 Spring contemporary news](https://bulbanews.bulbagarden.net/wiki/Japanese_Spring_Battle_Carnival_brings_new_promo) |
| SMP #NAN25 | Palace Book | 6 (1), 7 (3), 24 (2) | **3 / 6** | Japanese **SM-P Palace Book**, [official card](https://www.pokemon-card.com/card-search/details.php/card/34382/regu/all); [historical 2017 reprint account](https://bulbapedia.bulbagarden.net/wiki/Palace_Book_(XY-P_Promo)) |
| SP #127 | Player's Ceremony | 3 (1), 6 (1), 24 (2), 29 (1) | **4 / 5** | Japanese **127/S-P**, [official card](https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY); [mid-September 2020 distribution history](https://bulbapedia.bulbagarden.net/wiki/Player%27s_Ceremony_(S-P_Promo_127)) |
| **Total** | Three identities | Five original ranks | **9 / 14** | All released before May 2026 |

All three names have **zero matching English card-name records in the supplied resources/cards/en/*.json files**. The [Palace Book](https://limitlesstcg.com/cards/jp/SMP/NAN25?translate=en) and [Player's Ceremony](https://limitlesstcg.com/cards/jp/sp/127?translate=en) Limitless pages explicitly label Japanese Expanded legal, international Expanded not legal, and no international print. English card database absence must not be promoted into a Japanese paper illegality claim.

## Reconcile the previous source-date blind spot

The [original English-display chronology screen](agent6-english-cri-japanese-m4-aichi-date-crosswalk-20261103.md) reported **57 source rows / 151 copies** whose English set-code date metadata could not be resolved. Those divide into:

- **35 MEE rows / 120 copies** annotated with post-event 30th Celebration Basic Energy artwork. [Agent17's audit](../agent17-postevent-basic-energy-printings-20261104.md) addresses this separately.
- **9 Japanese-only promo rows / 14 copies** verified by the present source-locked detector and external Japanese card-source evidence.
- **13 other promo rows / 17 copies** with matching card identities in the provided English pool: XYP Jirachi, Karen, Regirock (9 rows, 12 copies); BWP Tropical Beach (3 rows, 4 copies); SMP Trevenant & Dusknoir-GX (1 row, 1 copy). Their corresponding English DB IDs are xyp-XY67, xyp-XY177, xyp-XY49, bwp-BW50 and smp-SM217, respectively. The missing English set-release registry entries are a distinct issue from having no English card definition.

The totals reconcile to **57 rows and 151 copies**. This partition identifies provenance limitations. It does not assert exact source artwork, physical original card language, or Japanese-event legality for the other 17 copies.

## Impact on simulation and eligibility

The original May 2026 Japanese Expanded field contains Trainer card identities and interactions missing from the English card collection:

- Palace Belt is a Tool that increases the Active holder's normal turn-start draw from one card to two.
- Palace Book is an Item that draws three and ends its user's turn.
- Player's Ceremony is a Stadium offering either player a once-per-turn draw of two that ends that player's turn.

These effects are supported by the linked official Japanese card records, with independent native implementation and paper restrictions still to be verified. They can affect turn chronology, resource access, lock development and the owner's opportunity denominator. A shared runner should distinguish **original source identity**, **source translation**, **engine-supported printing/equivalent**, **paper-validated effect**, and **actual selected line**. Never silently delete the row or substitute an English card merely because the English database lacks its name.

The original physical printing evidence, Japanese event-day ban/errata restrictions, and native Twinleaf fidelity for these cards remain unresolved. Historical Japanese product availability alone does not certify a player's actual physical printing.

## Reproduction

- [Read-only census code](../../../scripts/agent6-original-field-japanese-only-promo-census.cjs), reading the original source manifest and all English card files without modifying either.
- [Three regression tests](../../../tests/agent6-original-field-japanese-only-promo-census.test.cjs) cover exact original totals, synthetic source-label preservation, source immutability and invalid quantities.
- The pre-existing **manual-only** [Aichi card audit workflow](../../../.github/workflows/aichi-card-audit.yml) now includes a small independent check. [Manual CI 41860222782](https://github.com/FlareZ123/experiment-01/actions/runs/41860222782) at head **4d74a38a4b841bb9d1305f94a1cd89e9426e6ecb** reports the new Japanese-only test step **SUCCESS**, as well as the older English chronology step **SUCCESS**. The aggregate workflow still **FAILED** on a separate first-turn Trainer holdings step. No native game was run.

**Current overall decision:** 29/32 authenticated original card-name/count 60s; ranks 23, 25, 28 missing; zero competitively qualified paper games; no selected best fixed 60; no demonstrated 99.5% win rate.
