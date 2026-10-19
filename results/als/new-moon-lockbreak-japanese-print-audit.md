# New Moon Lockbreaker v1: complete constructed Japanese-printing 60 from an official source 60

**Agent 8, 19 October 2026. Evidence class: source-bound physical inventory and dated official card-page verification.** This validates a **print-specific proposed 60-card deck construction**, not an authentic tournament-registered modified 60, full-event legality/errata certificate, or match win probability.

## Deck construction and physical provenance

The earlier [official Japanese 52nd-place source deck-code extraction](new-moon-official-japanese-print-60.json) archives all **33 source-name rows**, their counts and Japanese card IDs from Pokémon's official deck viewer, deck code `GxxDYx-a4rD4W-a8xYxc`, historical retrieval artifact 12095944382 ([CI 39020209669](https://github.com/FlareZ123/experiment-01/actions/runs/39020209669)). Its 60-card count is a 19-Pokémon, 35-Trainer, 6-Energy base for the separately proposed [New Moon Lockbreaker v1](new-moon-lockbreak-60-candidate.md).

The published Lockbreaker English-mechanics experiment removes **two Trainer's Mail and two Rescue Carrier**, replacing them with **two Field Blower and two Canceling Cologne**. The immutable [constructed Japanese-printing candidate manifest](new-moon-lockbreak-japanese-print-60.json) now records every one of its **34 distinct names and the full exact 60 physical-printing IDs**. All 31 original names retained after dropping Trainer's Mail preserve the source's original official Japanese printing ID and expansion (the Rescue Carrier count is reduced from four to two). The two new names use individually verifiable historical official Japanese printings:

| Added item | Exact proposed Japanese printing | Copies | Official card page and source-set release |
| --- | --- | ---: | --- |
| Field Blower / フィールドブロアー | **SM4p 093/114, card ID 34321** | 2 | [Japanese card](https://www.pokemon-card.com/card-search/details.php/card/34321); [GX Battle Boost](https://www.pokemon-card.com/products/sm/sm4p.html), released **20 October 2017** |
| Canceling Cologne / キャンセルコロン | **S9a 063/067, card ID 41294** | 2 | [Japanese card](https://www.pokemon-card.com/card-search/details.php/card/41294); [Battle Region](https://www.pokemon-card.com/products/s/s9a.html), released **25 February 2022** |

Both expansions precede the **10 May 2026** Aichi tournament. The Japanese printed Field Blower removes up to two Pokémon Tools and/or Stadiums in play; Cologne suppresses the opponent's Active Pokémon's Abilities through the current turn, including replacement Actives, under its printed wording. Neither name appears in the [official Japanese Extra banned-card list, last updated 19 February 2026](https://www.pokemon-card.com/rules/regulation/index.html). That rules page defines Extra eligibility as **BW-series onward**, including SM and SWSH. This is a **necessary historical ban-and-release screen** of the two additions. The latest errata, any event-specific exceptions, every original source card's legality and the English-equivalent simulator effects have not all been revalidated in this audit.

**Resulting constructed candidate:** 19 Pokémon, 35 Trainers, 6 Energy, 34 distinct names, exactly 60 cards, one existing Secret Box ACE SPEC. It is explicitly a **new hypothetical registration** assembled from existing official-print rows. It must not be misrepresented as the 52nd-place player's actual changed tournament deck or as a 2026 Aichi Top32 entrant.

## Reproducible exact identity and regressions

The canonical physical-print multiset consists of UTF-8 lines `japanese_card_id:count\n`, sorted lexicographically by the complete line, followed by a terminal newline. SHA-256:

`13bbed10dc9610e8457a653262717dc35f865324726da6434e3c1710d8db9047`

Run [the derivation/validation script](../../scripts/new-moon-lockbreak-japanese-provenance.cjs) or the standalone [mutational regression file](../../tests/new-moon-lockbreak-japanese-provenance.test.cjs). Validation compares the proposed manifest to every original source row, requires all retained Japanese IDs and expansions to be unchanged, enforces the exact four-card count delta, checks uniqueness, the 60-card and type totals, and verifies this published print/count digest. Tests deliberately alter original-print ID, added-print ID, added-card count, restored Rescue Carrier count, removed Rescue Carrier, duplicate ID and declared type totals; every mutant must be refused.

The test is included in the existing **manual-dispatch-only** `.github/workflows/aichi-benchmark-stats.yml`. CI outcome must be checked before upgrading from *committed but unverified* to *compiled/tested*. No vendor Twinleaf patch, gameplay policy or registered opponent deck was changed.

## Strategic and legality limits

Specifying genuine pre-event Japanese printings closes **one inventory/provenance uncertainty** for the Lockbreaker proposal. It does not establish that the alternative cards improve outcomes. Prior source-dealt [rank11 Tool-Garbodor and response forks](../twinleaf/rank11-turn23-garbodor-tool-target-contrast.md) show that opponent Tool placement and candidate Perfection decisions are consequential. Two copies of Cologne cannot ensure sustained attacking under repeated Iron Thorns locks, and Field Blower's discard/search availability remains strongly conditional on hand and Item lock ([exact hand-discardability study](new-moon-secret-box-discardability-frontier.md)).

**Future gate:** independently certify complete Japanese paper legality/errata and equivalent English/Twinleaf effects for every candidate card, then compare the unchanged 60 under frozen bilateral information-safe policies against at least two distinct hard Aichi archetypes, both authentic starts, with actual attacks and opposing replies. Current field remains **29/32 exact source lists**, zero competitively qualified games, no demonstrated 99.5% fixed 60.
