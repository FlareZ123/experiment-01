# Agent 41: paper Aichi 29-source Special Energy semantic coverage gap

**30 October 2026 | Exact-published original 60s | Deterministic card-name census, not an engine failure census.**

## Question

Our newly native-validated **symmetric** common-policy Special Energy root uses `simulation/twinleaf/agent3-special-energy-frontier.cjs::specialEnergyUnits` to convert a small set of held exact-print cards into numeric printed attack-cost units. How much of the **authenticated original Aichi Top32 field** has Special Energy outside those narrow semantics?

## Reproducible method

From `results/aichi-2026/full-decklists.json`, read every one of the **29** authenticated original 60-card decks. For each `category:'Energy'` record, classify the nine conventional named Basic Energy names as Basic, then compare every remaining Special Energy `name` against the exact-print numeric vocabulary in `specialEnergyUnits`. Normalize the decklist's public English **Telepathic Psychic Energy (POR 88)** to the engine's already supported `Telepath [P] Energy M3` (same chosen proxy in the original source imports). Sum **copies**, not unique card-name rows, without imputing ranks23/25/28.

### Census

| Metric | Exact count |
| --- | ---: |
| Original published opponent decks | **29** |
| Opponent decks with at least one Special Energy card | **24** |
| All Special Energy card copies | **118** |
| Copies within this numeric selector vocabulary, including Telepath proxy | **44** |
| Copies outside this numeric selector vocabulary | **74** |
| Decks with at least one outside-vocabulary Special | **16 / 29** |

Outside the narrow numeric selector:

| Special Energy | Original card copies |
| --- | ---: |
| Double Dragon Energy | **38** |
| Reversal Energy | **8** |
| Counter Energy | **8** |
| Unit Energy LPM | **8** |
| Jet Energy | **5** |
| Prism Energy | **4** |
| Memory Energy | **1** |
| Recycle Energy | **1** |
| Powerful Colorless Energy | **1** |
| **Total** | **74** |

**Affected exact original final ranks:** **2, 4, 7, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20, 21, 27, 32**. Nine Regidrago/Raging-Bolt original variants use 38 Double Dragon Energy copies. The two Raichu-Electrode original sources (4/17) account for all 24 Reversal, Counter, and Unit Energy LPM copies. Rank2 Vileplume has Jet/Memory; rank15 Lopunny-Vileplume Jet/Powerful; rank9 Absol-Electrode Prism; other conditionally supported prints appear among the exact source sixties.

## Interpretation and qualification boundary

This is strictly a **coverage limitation of `specialEnergyUnits`**, not proof that Twinleaf's engine cannot play or simulate any of these cards. Several other source-specific hooks, native bot tactics and public-context card-cost modules already handle individual mechanics. The numeric selector's deliberate `null` for unmodeled names is a useful fail-closed rule that prevents inventing Energy types or quantities. It also means that a single common decision policy relying exclusively on this selector would remain unable to plan realistic Energy attachment for much of the authentic field.

The missing semantics require more than a dictionary of Energy symbols:

- **Double Dragon:** Dragon-recipient eligibility and multi-type/multi-unit contributions to attacks, with exact printed costs and current recipient
- **Reversal/Counter:** Prize-count, Evolution and rule-specific conditional Energy supply and timing
- **Unit LPM/Prism:** permitted recipient identity and one-unit selectable multi-type supply
- **Jet:** on-attachment switch/Active-position side effect and legal Bench geometry
- **Memory/Recycle/Powerful:** attacks inherited or retained, recovery of discarded attachments, and attack damage corrections

Any proposed common selector must distinguish attachment **legality**, static numeric energy **sufficiency**, its extra effects, opportunity cost against another attachment, and the actual Store-accepted recipient and prompt chain. Every mode should apply **identically to both physical actors** when used as the benchmark. A source-only rescue can diagnose an opponent bot but cannot establish fair fixed-deck strength. Do not claim 16 sources are unplayable in the real game.

## Immediate scientific priority

Keep the already-compiled native rank6 both-seat symmetric Energy root as a regression, then develop **a real actor-observation-safe Double Dragon recipient/cost planner** with an authentic original Regidrago 60 and a physically native accepted attach-to-attack witness. This one card category covers **38 of the 74** outside-vocabulary copies; it is the most concentrated missing numeric channel in this exactly published opponent field. Reversal/Counter/Unit Energy conditionality and Jet switching are separate test families with different state predicates.

The wider benchmark remains 29/32 original opponent sixties, no qualified competitive games, and no measured 99.5% full-field win rate. The field inventory is a dataset count only and must never be represented as empirical matchup performance.
