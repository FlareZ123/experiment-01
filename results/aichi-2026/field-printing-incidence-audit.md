# Print-aware field-incidence audit (Agent 30)

**18 October 2026.** Source: [29 public Aichi 2026 Top 32 full decklists](full-decklists.json), rank-specific imported printing identities. The remaining exact source lists for ranks **23, 25 and 28** are unavailable here. This analysis is a census of **list inclusion**, not gameplay, causal counterplay, win rates or simulated performance.

## Two different questions

A *deck-incidence* count asks how many different published decks contain a card **name**. A *mechanics/Ability* analysis must instead retain **printing identity**, because printings sharing a Pokémon name can have different text. Counting every JSON card record as another deck silently double-counts a name when a single deck uses multiple printings.

The published 29 decks contain **five duplicate-name-within-deck groups**:

| Rank | Name | Copies | Printing split |
| ---: | --- | ---: | --- |
| 15 | Pidgeotto | 2 | TEU 123 ×1; MEW 17 ×1 |
| 15 | Vileplume | 3 | AOR 3 ×2; BUS 6 ×1 |
| 16 | Garbodor | 3 | LTR 68 ×2; BKP 57 ×1 |
| 22 | Trubbish | 2 | FST 168 ×1; NVI 48 ×1 |
| 31 | Dusknoir | 4 | PRE 37 ×3; BCR 63 ×1 |

Thus a naïve number-of-records count would wrongly report **five** decks containing Garbodor instead of **four**, and three Vileplume decks instead of two. The printing distinction is useful evidence. [Direct card-text inspection](field-printing-mechanics-audit.md) confirms **both LTR and BKP Garbodor have the same Garbotoxin Ability**, although their attacks differ. The AOR and BUS Vileplume printings provide substantially different locks. Preserve printings when evaluating their Abilities or attacks.

## Field incidence under correct unique-deck counting

| Card name | Decks of known 29 | Total physical copies |
| --- | ---: | ---: |
| Guzma | 25 | 48 |
| VS Seeker | 23 | 59 |
| Quick Ball | 21 | 72 |
| Budew | 14 | 19 |
| Field Blower | 9 | 11 |
| Temple of Sinnoh | 5 | 9 |
| Mega Absol ex | 5 | 10 |
| Garbodor | 4 | 9 |
| Trubbish | 4 | 8 |
| Vileplume | 2 | 5 |
| Iron Thorns ex | 3 | 12 |

The denominators are **the 29 available source inventories**. We are **not** estimating the fraction of the entire 32-deck field for names in the three missing lists. In particular, these numbers indicate a broad exposure to *potential* gust/search/tool disruption; they say nothing about actual action availability, Supporter contention, locked turns, bench constraints, attack choices, or strong policies.

## Executable consistency gate

[scripts/aichi-source-incidence.cjs](../../scripts/aichi-source-incidence.cjs) computes unique-rank incidence, raw physical counts and all mixed-printing names. [tests/aichi-source-incidence.test.cjs](../../tests/aichi-source-incidence.test.cjs) asserts the entire published field consists of distinct 60-card ranks; checks the known exact counts; and uses a synthetic two-deck sample to demonstrate the multi-printing collision. This is a source-file guard only. It cannot validate card legality, paper text equivalence, the missing 3 lists, or opponent competence.

**Impact on fixed-60 research:** a candidate's matchup tests should include representative gust and active-lock exposure and compare *precise printings* when replaying effects. Avoid attributing individual-card strength directly from frequency; a shared card name may be a mixture of strategically different printings. **Qualified competitive games remain zero.**
