# Field-wide printed Basic Pokémon census and optional mulligan compensation

**Agent 31 | 30 October 2026 | Exact original-source arithmetic.** This extends the [four-Basic detailed derivation](agent31-four-basic-mulligan-race-20261030.md) to every other recoverable 2026 Aichi Open Top 32 list. No engine games are reclassified, no optimization result or win-rate estimate is asserted.

## Exact 29-source roster and stage audit

The versioned original [published 60-card manifest](full-decklists.json) has **29 complete physical-printing decklists**. The missing **ranks 23, 25 and 28** are excluded, rather than assigned an archetype-average Basic count. The reference rank-1 Shadow Rider list contains **14 Basics**.

The [reusable fail-closed census](../../scripts/aichi-field-mulligan-census.cjs) classifies all **102 unique printed Pokémon** appearing in those 29 lists against the provided English card pool: **26 Evolution printings and 76 Basic printings**. An independent Python inspection of the bundled card JSON verified the printed Stage/Basic subtypes for all **99 ordinary set printings**. The three promotional source printings without ordinary set-code mappings (SMP-217, XYP-49, XYP-67) are original Basic Pokémon. Each list's category totals must equal 60, and any new Pokémon printing is rejected rather than automatically classified as Basic.

The published rank-1 60 is held fixed. The 28 other complete original-source opponents fall into these exact Basic-count groups:

| Opponent's Basic cards in original 60 | Published opponent ranks | Rank-1 chance to be offered at least one bonus card | Rank-1 average optional bonus cards offered |
| ---: | --- | ---: | ---: |
| **4** | **6, 24, 29** | **56.42343%** | **1.41235** |
| 10 | 8 | 23.10679% | 0.31168 |
| 11 | 3, 5, 9, 11, 13, 16 | 19.76895% | 0.25424 |
| 12 | 7, 22, 26 | 16.86817% | 0.20842 |
| 13 | 4, 17, 32 | 14.35143% | 0.17143 |
| 14 | 2, 14, 15, 20, 21 | 12.17212% | 0.14130 |
| 15 | 10, 12, 27, 31 | 10.28918% | 0.11659 |
| 16 | 18, 19, 30 | 8.66633% | 0.09621 |

The calculation follows the simultaneous mulligan procedure in the supplied Advanced Player's Rulebook, Section I.G steps 5–7. A both-invalid pair of opening hands is reshuffled jointly and does not itself grant a bonus. With only one invalid player, the other player holds their initial hand while the invalid player repeatedly redraws. A *bonus* is an allowance the opponent can accept or decline.

## Equal-rank-weighted opportunity decomposition

Under an artificial uniform weighting of the **28 covered, nonmirror** source 60s, before either player makes a mulligan-bonus choice:

- The rank-1 champion is offered at least one extra card in **19.02378374%** of setups; the source opponent is offered at least one in **11.22254895%**.
- The champion's mean number offered is **0.30982909 cards per setup**.
- The three four-Basic Iron Thorns decks supply **0.15132349 of those 0.30982909 mean cards**, or **48.84095626% of all expected champion bonus cards** across this restricted 28-source comparison, despite comprising **3/28** of these opponent entries.
- Excluding ranks 6, 24 and 29, the chance the champion is offered a bonus against a uniformly selected one of the remaining 25 sources is **14.53582598%**.

Those averages depend on the explicitly artificial opponent weighting. They exclude the three missing lists and should not be labeled the Top 32 field average. They measure offers before any owner chooses cards, not what a match player actually drew or used. They are inappropriate as victory probabilities.

## Implication for canonical bilateral-game qualification

The shared native headless engine **already supports** the read-only `captureSetupCompensation` observer in [headless.cjs](../../simulation/twinleaf/headless.cjs) and [setup-compensation-observer.cjs](../../simulation/evaluation/setup-compensation-observer.cjs), including per-seat redraw counts, offered and selected options and physical hand-size changes. This is useful preexisting infrastructure, and no duplicate observer was created in this investigation.

**Next executable policy question:** Does the canonical [bilateral v2 development runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) actually enable and retain that record in its 32-arm archives? At the time of this investigation the runner's source-registered requests showed `captureInitialFullPhysicalDeal:true` but did **not** request `captureSetupCompensation`. Therefore historical root/deal fingerprints alone should not be assumed to certify chosen bonus counts or the actual opening-hand compensation policy. Capture and compare genuine Store-generated offers and accepted draws alongside first-turn owner-state and control-pressure evidence before attributing an opening asymmetry to a deck improvement. Any added telemetry needs paired noninterference tests.

The source's **passive Initialization lock** may make extra cards less usable, and some retrieved Basics may be placed during setup rather than played onto the Bench during the owner's turn, affecting entry-Ability timing. The calculations do not model either effect. The current two-player policy gate, official match clock, and paper-legal effect validation remain open. **29/32 exact source 60s; zero competitively qualified games; no demonstrated 99.5% fixed deck.**

## Reproducibility

- [Exact two-player race and prize-marginal evaluator](../../scripts/aichi-setup-mulligan-race.cjs).
- [Source-locked printed-stage census](../../scripts/aichi-field-mulligan-census.cjs).
- [Seven opening-race unit tests](../../tests/aichi-setup-mulligan-race.test.cjs), locally **7/7 green**.
- [Seven field-census regressions](../../tests/aichi-field-mulligan-census.test.cjs), committed for native Node testing; **compiled CI status not yet established**.
- Original full 29-source manifest `results/aichi-2026/full-decklists.json`, three missing ranks explicit.

This work is a structural setup-economy analysis; the current fixed-60 ranking remains unresolved.
