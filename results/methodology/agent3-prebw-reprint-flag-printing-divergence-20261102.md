# Legacy printed effects inside the English `Expanded: Legal` flag: a reproducible warning

**Agent 3 | 2 November 2026 | static-data audit, no match outcome**

## Why this matters

The repo's complete card database is an **all-era source catalog**. A card's per-record `legalities.expanded = Legal` is not, by itself, proof that its **particular old printing and old effect** may be played in a Black & White-onward paper Expanded match. That distinction directly matters when translating source-deck photos into executable lists and when an optimizer chooses among exact printed IDs.

The [Play! Pokémon Tournament Rules Handbook, December 4, 2024, §5.4.1.3](https://media.pocketmonsters.net/pdf/play-pokemon-tournament-rules-handbook-2024-12-04-en.pdf#page=36) states that an earlier printing is usable through a later legal reprint when the **name is identical and the card text is functionally identical**, with Copycat as a positive example and pre/post Rainbow Energy damage-versus-counters as a negative example. This 2024 handbook is explanatory source support, not certification of the specific Aichi Japanese-event ruling or any current erratum. [Pokémon's official 2025 rotation announcement](https://www.pokemon.com/uk/pokemon-news/2025-pokemon-tcg-standard-format-rotation-announcement) explicitly describes the Expanded starting point as Black & White onward.

## Deterministic snapshot census

Using only the supplied `resources/sets/en.json` and `resources/cards/en/*.json` (same copies in the provided ZIP), classify legacy set **series** `Base, Gym, Neo, E-Card, EX, Diamond & Pearl, Platinum, HeartGold & SoulSilver, POP`. This deliberately excludes miscellaneous `Other` and **Black & White promotional releases**, which should not be rejected merely because their recorded release date precedes the first BW booster set.

Of that carefully defined old-series group, **233 individual printing records** still have `legalities.expanded === "Legal"`:

| Recorded supertype | Count |
| --- | ---: |
| Energy | **102** (90 explicitly `Basic`, 12 `Special`) |
| Trainer | **123** |
| Pokémon | **8** |
| **Total** | **233** |

This is a **candidate manual-review population**, not 233 illegal cards. Basic Energy and many functionally identical legal reprints are legitimate exceptions; card-level legality may be inherited by name and can include sanctioned older copies. A difference in literal printed wording alone is also not proof of different gameplay, as the handbook's Copycat example illustrates.

The reproducible [single-file CJS test](../../tests/agent3-legacy-print-fidelity-sft.cjs) reads only repository resources and checks snapshot counts and original printed effect texts. It passed locally under Node 22 against the supplied 176 card JSON files. A committed GitHub-hosted CI execution has **not** been claimed.

## Four strong counterexamples to unexamined exact-ID substitution

Each of these **old and new records shares the English name** and is independently flagged Expanded Legal by the supplied data. Their recorded printed effects materially differ, exceeding normal formatting or reminder-text variation.

| English name | Older printed ID and rule | Modern printed ID and rule |
| --- | --- | --- |
| **Quick Ball** | `dp2-114` (Mysterious Treasures): reveals the deck until the first Pokémon is found, then adds it to hand | `swsh8-237` (Fusion Strike): discards an additional hand card to search specifically for a **Basic Pokémon** |
| **Super Rod** | `neo1-103` (Neo Genesis): coin flip returns one eligible Pokémon card to hand, with the category depending on heads/tails | `sv2-188` (Paldea Evolved): shuffles up to three Pokémon or Basic Energy cards from discard into deck |
| **Great Ball** | `ex16-77` (EX Power Keepers): searches deck for a Basic non-ex Pokémon and **Benches it** | `sv2-183` (Paldea Evolved): examines top seven cards to add a Pokémon to **hand** |
| **Rare Candy** | `ex2-88` (EX Sandstorm): allows a Basic to evolve with a Stage 1 or Stage 2 card | `sv1-191` (Scarlet & Violet): only skips to Stage 2, with explicit first-turn / played-this-turn prohibitions |

The **printed Quick Ball ambiguity is present in the [provisional rank-28 Replica deck photo](../aichi-2026/agent3-rank28-replica-source-print-mechanisms-20261102.md)**. The screenshot appears modern, but lacks legible set identifier. A source engine accidentally loading `dp2-114` would create cards and resources without the proper hand-discard cost and could search an Evolution card, changing opponent line competence. Likewise, injecting old Great Ball's to-Bench effect or Neo Super Rod's return-to-hand would fabricate entirely different lines.

## Recommended admission and engine boundary

1. Identify each candidate by **`{set id, number, card text version}`** plus source-art provenance whenever possible, rather than by English name alone.
2. Separate *database marked Expanded*, *in-scope original BW onward printing*, *allowed earlier printing by equivalent legal reprint*, *current ban/errata*, and *Japanese Aichi original tournament provenance* as distinct predicates.
3. Treat a pre-BW source record with different operative printed text as **requires paper equivalence review**. Do not silently simulate its historic effect under modern reprint legality, or assume all 233 are illegal.
4. In a registered native experiment, record selected printed-ID identities and the actual **implemented effect**. The card pool and engine implementation are separate things; neither field alone establishes a legal physical move.

The SFT independently asserts the four old/new `Expanded Legal` flags, distinct printed rule strings, original legacy series, and rank28 key Pokémon signatures (Noivern PAL246, Marshadow UNB81, Wobbuffet RC11, Kyurem SFA47). Text inequality is a **screening signal**; game-functional equivalence and errata remain judged separately.

**Research status remains 29/32 authenticated original opponent sixties, zero qualified games and no proven 99.5% fixed 60.**
