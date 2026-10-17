# New Moon Lockbreaker v1: frozen 60-card cross-lock counterpackage

**Agent 1; 17 October 2026.** **Proposed, unqualified candidate**, derived from the separately published **52nd-place** Aichi New Moon Perfection source. This is a deliberately falsifiable four-slot protection experiment within a fundamentally different engine from the rank-1 Shadow Rider reference. It is **not** the nominated fixed best deck and is **not** a claimed 99.5%-win deck.

[Exact source 60](new-moon-perfection-source-60.md) · [Machine-readable English-equivalent challenger 60](new-moon-lockbreak-english-proxy-60.json) · [Pinned-print validator](../../simulation/twinleaf/new-moon-lockbreak-validate.cjs) · [Direct-access enumerator](../../scripts/new-moon-lockbreak-access.cjs)

## Provenance and the fixed hypothesis

The 10 May 2026 Aichi field is [29 precisely published 60s with three unpublished ranks](../aichi-2026/full-decklists.json). The base New Moon 60 comes from a contemporaneous first-person article, separate from those Top 32, source deck code **`GxxDYx-a4rD4W-a8xYxc`**. Agent 25 independently resolved the 33 English simulator equivalents and [validated all original 60 in pinned Twinleaf](new-moon-pinned-print-acceptance.md), while noting that the **Japanese physical-print identifiers remain unresolved**. This proposed challenger preserves those source roles and changes a named four-Item package.

**Frozen English-equivalent card ID/count hash:** `sha256:a693748bc4fc4326142f2dfec26570b9f1e1f7139790d36a089de1137d1cb4c4`.

**Original English-proxy card ID/count hash:** `sha256:4dd537adbf73d89e50215b3d056a9f40d474f05b79e33774c281a30079e1ce95`.

Canonicalization for both: alphabetically sort `id:count\n` lines in UTF-8, then SHA-256. The reproducible manifest follows the **validated** [Agent25 English source mapping](new-moon-perfection-english-map.json) for all 33 original rows. An earlier raw English proxy used different Duskull and basic Energy set IDs; the adopted map correctly selects the source-representative **Future Sight Duskull VIV 69** and SVE-mapped Psychic Energy. The manifest records the English proxy IDs of every source Pokémon and Trainer, including the ambiguous Solrock printed equivalent `sm7-62` with **Sunbeam**, Unown `xy7-30` with **Farewell Letter**, Dusclops `sv6pt5-19` with **Cursed Blast**, and the original source's single **Secret Box ACE SPEC**. Added cards are **Field Blower GRI 125 / `sm2-125`** and **Canceling Cologne ASR 136 / `swsh10-136`**, both printed cards visible in published Aichi opponent inventories.

| Card slot adjustment relative to source | Change | Presumed value / sacrificed function |
| --- | ---: | --- |
| Trainers' Mail ROS | **−2** | Lose Trainer lookahead and consistency connectors |
| Rescue Carrier EVS | **−2** | Lose repeated recovery of low-HP Pokémon, notably Unown lines |
| Field Blower GRI | **+2** | Direct Tool or Stadium removal under an accessible Item window |
| Canceling Cologne ASR | **+2** | Suppress opponent's **Active** Pokémon's Ability for the current turn |

This is a **four-slot adjustment**, not an independently invented shell. The overall **New Moon/Mewtwo & Mew-GX Perfection hand-lock architecture** differs substantively from Shadow Rider VMAX Psychic-acceleration attacks.

## Exact fixed 60 (selected English equivalent printings)

`P` = Pokémon, `T` = Trainer, `E` = Energy. IDs specify a reproducible simulation proxy and do not claim to reconstruct exact Japanese physical printings.

| Type | Count | Card and selected English printing |
| --- | ---: | --- |
| P | 2 | Mewtwo & Mew-GX, UNM 71 |
| P | 1 | Gengar & Mimikyu-GX, TEU 53 |
| P | 1 | Trevenant & Dusknoir-GX, SMP SM217 |
| P | 1 | Tapu Lele-GX, GRI 60 |
| P | 1 | Galarian Articuno V, CRE 58 |
| P | 1 | Latias ex, SSP 76 |
| P | 1 | Lillie's Clefairy ex, JTG 56 |
| P | 1 | Squawkabilly ex, PAL 169 |
| P | 3 | Unown, AOR 30 (Farewell Letter) |
| P | 2 | Dusclops, SFA 19 (Cursed Blast) |
| P | 2 | Duskull, VIV 69 (Future Sight, selected source-equivalent mapping) |
| P | 1 | Solrock, CES 62 (Sunbeam) |
| P | 1 | Lunatone, OBF 92 (New Moon) |
| P | 1 | Klefki, SVI 96 |
| T | 4 | Battle VIP Pass, FST 225 |
| T | 4 | Fog Crystal, CRE 140 |
| T | 2 | Mysterious Treasure, FLI 113 |
| T | 2 | Hisuian Heavy Ball, ASR 146 |
| T | 2 | Battle Compressor, PHF 92 |
| T | 1 | Adventure Bag, LOT 167 |
| T | 1 | Escape Rope, BST 125 |
| T | 1 | Counter Catcher, PAR 160 |
| T | 1 | Secret Box, TWM 163 (**ACE SPEC**) |
| T | 2 | Powerglass, SFA 63 |
| T | 1 | Forest Seal Stone, SIT 156 |
| T | 2 | Lillie's Determination, M1L 119 |
| T | 2 | Ace Trainer, AOR 69 |
| T | 2 | Sky Field, ROS 89 |
| T | 2 | Path to the Peak, CRE 148 |
| T | 2 | Field Blower, GRI 125 (**new**) |
| T | 2 | Canceling Cologne, ASR 136 (**new**) |
| E | 3 | Telepathic Psychic Energy, M3 88 mechanical equivalent |
| E | 3 | Basic Psychic Energy, selected proxy SVE, source-map ID swsh12pt5-156 |

**Totals: 19 Pokémon, 35 Trainers, six Energy = exactly 60 cards.** The test manifest verifies the source-count delta and the exact ID hash.

## Why these particular counters are a defensible test

**Specific known Aichi lock exposure:**

- **Four Absol Garbodor lists, ranks 8/11/16/22:** each source list includes **Garbodor** with Tool attachments (three or four Float Stone per list; some have extra Stones/Bands). An attached-Tool Garbotoxin effect threatens Perfection and New Moon even if the source's Path to the Peak would otherwise be advantageous. **Field Blower** can discard the Tool if Item access remains open. Field Blower can also remove a Stadium that suppresses the line. Its two copies may prove insufficient if Garbodor is retooled; the source deck included **zero**.
- **Three Iron Thorns lists, ranks 6/24/29:** active **Initialization** can prevent the Ability-based Perfection attack. **Canceling Cologne** only removes the opponent's Active Ability until the end of the turn, so it may permit one copied attack on the turn played. It cannot remove a Benched Garbotoxin lock and does not last into the next turn. The source 60 had **zero** Cologne.
- **Vileplume lock, ranks 2/15, plus early Budew threats:** active Item lock can render *both* new Items unavailable. They must be used early or bypassed through another legal line, and this package could actively worsen setup if it displaces Trainer lookahead. The proposed anti-lock package does not solve this matchup automatically.
- **Two known Raichu Electrode Combo ranks 4/17** contain a Klefki. Cologne may suppress **Active** Klefki on an attack turn, but a Benched Klefki is generally irrelevant to that Active-only Ability and the opponent can reposition it. Exact rank25 source deck is missing.

These are field **structural constraints**, not wins, losses or policy-verified advantage. The package is also susceptible to high-DCI discard constraints around Secret Box, Supporter contention, Bench space, Item locks, Tool restoration, critical Prize configurations and late-game damage conversion.

## Compiled attached-Tool and Active-Ability suppression test

The [actual pinned Store counter-action matrix](../../simulation/twinleaf/new-moon-lockbreak-ability-gates.cjs) **passed** [compiled manual CI 39021653996](https://github.com/FlareZ123/experiment-01/actions/runs/39021653996) at head `0cbd9b858430a648d525a46bfe4bfff74ae439c9`, with a separate `newmoon-lockbreak-ability-gates` artifact. It creates a **deliberately staged** Active Mewtwo & Mew-GX with realistic opposing printed Pokémon and uses actual `PlayCardAction` and `ResolvePromptAction` to verify Perfection's suppression/restoration by `CheckPokemonPowersEffect` and `IS_ABILITY_BLOCKED`.

| Injected opponent status | Real counter action(s) | Perfection visible at last check |
| --- | --- | --- |
| No lock | None | **Yes** |
| Benched Garbodor BKP with Float Stone | None | **No** |
| Benched Garbodor BKP with Float Stone | Field Blower selects Garbodor Tool | **Yes** |
| Active Iron Thorns ex | None | **No** |
| Active Iron Thorns ex | Canceling Cologne | **Yes** |
| Active Klefki | Canceling Cologne | **Yes** |
| Active Iron Thorns ex and Benched Tool Garbodor | Cologne alone, or Blower alone | **No** |
| Active Iron Thorns ex and Benched Tool Garbodor | Cologne, then Blower | **Yes** |

For the combined-lock row, Field Blower discards the actual selected Float Stone from the player's board into the owner's discard; Cologne's real Active marker is asserted. The order result is consistent with one surviving lock taking effect after the other is addressed. **That synthetic combination is an interaction stress test, not a claim any published Aichi deck fields both.** This confirms a necessary lock-release window under injected resources, and does **not** establish that the source deck can get both Item cards into hand at the right time, avoid Item lock, actually announce and complete Perfection's copied attack, or win an independently dealt game. The opponent is not using a competent turn policy in this fixture.

## Mathematical early access: severe limitation

An independent exact hypergeometric calculation, conditioned on a **valid seven-card opener with at least one of 17 Basics**, counts designated *non-Basic* Items seen in the starting seven and next mandatory draw (eight observed physical cards in total). Prize placement is integrated by exchangeability before deck setup, and no optional opponent-mulligan draws are modeled. The item is **directly visible** in hand; this does not grant a legal use.

| Item type, source vs variant | Source direct chance | Variant direct chance by draw eight |
| --- | ---: | ---: |
| At least one Field Blower (two copies in variant) | 0% | **24.3764594%** |
| At least one Canceling Cologne (two copies in variant) | 0% | **24.3764594%** |
| At least one of either four-copy counter set | 0% | **43.4452507%** |

The two-copy exact fraction is `416435/1708349`, and the combined four-copy fraction is `479458943/1103593454`. Enumerated by [reusable exact BigInt script](../../scripts/new-moon-lockbreak-access.cjs); regression [single runnable test file](../../tests/new-moon-lockbreak.test.cjs) checks rational results and manifest hash. Search engines, actual deck Prizes, Secret Box discards, Field Blower targets, opponent Item lock, when the attack becomes available, and whether having only one counter is enough are **not** modeled. In particular, the **~75.6% no-direct-Cologne** fraction is a stark reason to *challenge* this variant's Iron Thorns hypothesis rather than promote it.

### Aichi Iron Thorns specifically: optional mulligan bonus draws

The published **rank 6/24/29 Iron Thorns source lists each contain exactly four Basic Pokémon**, all Iron Thorns ex. That unusually low Basic count causes repeated redraws and presents substantial **optional** extra-card opportunities to the 17-Basic New Moon deck at setup. Reusing the [previously verified bonus-draw geometric model](../../scripts/aichi_bonus_draws.cjs) and adding a source-locked **non-Basic target** conditional on a legal seven, the [specialized script](../../scripts/new-moon-lockbreak-mulligan.cjs) obtains:

| First-turn direct visibility event, legal seven + next normal draw | No opponent bonus cards | Accept all optional Iron Thorns mulligan bonuses |
| --- | ---: | ---: |
| At least one of the two Field Blower | **24.3765%** | **28.4707%** |
| At least one of the two Canceling Cologne | **24.3765%** | **28.4707%** |
| At least one of either four counter Items | **43.4453%** | **49.2296%** |

The opponent offers at least one bonus card in **57.9428%** of legal dual-start processes and three or more in **20.8942%**, from the exact two-player mulligan distribution. Candidate-mulligan probability, six face-down Prize cards and the first-turn mandatory draw are modeled. The extreme tail of at least 47 offered bonus draws is about `3.76e-11`; it is capped only for physical target visibility, not assumed to be a playable first turn. The source's zero copies of these Items remains zero on both columns.

[Compiled regression and archive: CI 39021988609](https://github.com/FlareZ123/experiment-01/actions/runs/39021988609), full source-calibrated [four-case tests](../../tests/new-moon-lockbreak-mulligan.test.cjs), `newmoon-lockbreak-thorns-mulligan` artifact. The ~28.5% direct Cologne access, despite opponent mulligans, still leaves **most** accepted openings without Cologne in the hand/draw window. A separate Gengar & Mimikyu-GX non-Ability attack line or Item search might address some missing-Cologne cases, but no probability of a legal attack, successful lock, or win is inferred from this marginal visibility calculation. Extra bonus draws are optional; taking all can consume deck resources and create strategic liabilities.

## Turn structure and decisive adversarial tests

A legal intended successful opener still needs source's first attack **Horror House-GX** copied via Mewtwo & Mew's **Perfection** with one Psychic Energy and Powerglass, followed by the Duskull→Dusclops Prize donation, **Ace Trainer** hand compression and **Night Watch** copied from the discard. Real tests must check Powerglass's **Basic** Psychic requirement, end-turn trigger, opponent hand/play restrictions, New Moon versus Path/Stadium ordering, and the corrected Night Watch **random two cards**. The source article and earlier [New Moon ALS report](new-moon-perfection-aichi-2026.md) detail these necessary components; none can be assumed from singleton-card presence.

The **first falsification matrix** is:
- **Ranks 8 and 11:** source-dealt attached Garbotoxin early, compare whether Field Blower becomes playable and whether retooling defeats the next Perfection/Night Watch turn.
- **Ranks 6 and 29:** source-dealt active Iron Thorns, compare Cologne availability and whether multiple turns of Perfection can be sustained.
- **Ranks 2 and 15:** Vileplume/Budew Item-lock windows, measure added dead cards versus lost Trainers' Mail access, with a real alternative attacking line.
- **Ranks 10 and 12:** two structurally different Regidrago lists, verify the original hand-lock route remains intact and punish any pace sacrificed by 2 fewer Trainer lookups/Carriers.
- **Ranks 3 and 7:** Snorlax Stall variants, require a board/retreat route and bounded deck-out accounting.

For each source fixed-list comparison: same deck seed and actual starting order, no altered hand/board injections, honest after-fork policy randomness, both starting seats and independent seeds, full target printing proof and corrected exercised attack effects. Report first loss/invalid action and meaningful opponent response, retaining unqualified game artifacts outside the competitive ledger.

## Validation status and decision gate

**Compiled status (17 October 2026):** [Manual New Moon workflow CI 39021341937](https://github.com/FlareZ123/experiment-01/actions/runs/39021341937), fixed head `1f8cc27cd33406b91e75048d3a5406f5c30b5e8a`, **PASSED** all steps: source printing manifest regression, the three independent candidate pure count/hash/access tests, `new-moon-lockbreak-validate.cjs` on compiled pinned Twinleaf with `DeckAnalyser(EXPANDED)`, and the original source-related Stadium/Klefki checks. Its `newmoon-lockbreak-candidate-v1` artifact includes the complete 60-card engine fullName selection and exact direct-access output. This supersedes first red [CI 39020847956](https://github.com/FlareZ123/experiment-01/actions/runs/39020847956), which correctly identified our obsolete pre-Agent25 Duskull source proxy and was repaired by source-mapping alignment. A passing deck validator does **not** imply game-strength evidence or Japanese physical-print legality.


This frozen candidate's **source-proxy card counts and hash** are checked by `new-moon-lockbreak.test.cjs`; the [existing manually dispatched New Moon workflow](../../.github/workflows/aichi-newmoon-source-coverage.yml) is extended to test the exact source delta, run the pinned `DeckAnalyser(EXPANDED)` and save a separate source/proxy output. **The compiled source-map-aligned run is now successful, with no matches qualified.** Compiled engine legality of English-equivalent IDs still does not verify all Japanese tournament printing IDs, bans/errata across regions or actual paper Expanded matchup behavior. The original May 2026 Japanese Expanded ban snapshot and printed-card source family remain separate references.

**Provisional decision: retain this as a rejection-oriented challenger.** It attacks documented lock categories but has low early direct Item access and gives up core recovery/search. It should replace the nominated Shadow Rider list only after much stronger two-seat, source-mechanics and opponent-policy evidence that currently does not exist. `sourceReplayMechanicsVerified:false`; `qualifiedForCompetitiveInference:false`; zero qualified games.
