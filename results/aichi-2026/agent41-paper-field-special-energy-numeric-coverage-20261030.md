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

**Affected exact original final ranks:** **2, 4, 7, 9, 10, 12, 13, 14, 15, 17, 18, 19, 20, 21, 27, 32**. Nine Regidrago originals and one Raging Bolt original (ten decks total) use 38 Double Dragon Energy copies. The two Raichu-Electrode original sources (4/17) account for all 24 Reversal, Counter, and Unit Energy LPM copies. Rank2 Vileplume has Jet/Memory; rank15 Lopunny-Vileplume Jet/Powerful; rank9 Absol-Electrode Prism; other conditionally supported prints appear among the exact source sixties.

## Interpretation and qualification boundary

This is strictly a **coverage limitation of `specialEnergyUnits`**, not proof that Twinleaf's engine cannot play or simulate any of these cards. Several other source-specific hooks, native bot tactics and public-context card-cost modules already handle individual mechanics. The numeric selector's deliberate `null` for unmodeled names is a useful fail-closed rule that prevents inventing Energy types or quantities. It also means that a single common decision policy relying exclusively on this selector would remain unable to plan realistic Energy attachment for much of the authentic field.

The missing semantics require more than a dictionary of Energy symbols:

- **Double Dragon:** Dragon-recipient eligibility and multi-type/multi-unit contributions to attacks, with exact printed costs and current recipient
- **Reversal/Counter:** Prize-count, Evolution and rule-specific conditional Energy supply and timing
- **Unit LPM/Prism:** permitted recipient identity and one-unit selectable multi-type supply
- **Jet:** on-attachment switch/Active-position side effect and legal Bench geometry
- **Memory/Recycle/Powerful:** attacks inherited or retained, recovery of discarded attachments, and attack damage corrections

Any proposed common selector must distinguish attachment **legality**, static numeric energy **sufficiency**, its extra effects, opportunity cost against another attachment, and the actual Store-accepted recipient and prompt chain. Every mode should apply **identically to both physical actors** when used as the benchmark. A source-only rescue can diagnose an opponent bot but cannot establish fair fixed-deck strength. Do not claim 16 sources are unplayable in the real game.

## Correction: existing broader actor model already covers these families

This count independently rediscovers the [Agent 17 original 118-copy numeric coverage audit](../statistics/agent17-existing-energy-model-bridge-20261029.md). The narrow function analyzed here is **not the full existing owner Energy model**. The already implemented [`actor-energy-payability.cjs`](../../simulation/twinleaf/actor-energy-payability.cjs) handles **all 118/118 original Special Energy card names** in some eligible hypothetical public context, including all 74 outside this narrow table. Its flexible symbolic units are conditioned on Dragon typing, Evolution and Rule Box, opponent Prize lead, Temple of Sinnoh and the relevant card identity. Exact native print aliases still matter.

Moreover, [Agent 17 already implemented the actor-observation-safe public-context selector](../../simulation/twinleaf/agent17-public-context-special-energy.cjs), and it is **already wired** into the [canonical actor root](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs) behind the existing default-OFF `publicContextSpecialEnergy` option / `AGENT17_PUBLIC_CONTEXT_SPECIAL_DEV=true`. Agent 17's [native Store report](../statistics/agent17-conditional-special-native-gate-20261029.md) confirms actual Store-accepted Double Dragon and Unit Energy attachment tests. Reimplementing a Double Dragon matcher would duplicate completed research.

**Revised engineering priority:** enable and compare this existing richer owner-visible option **symmetrically for both actual seats in the integrated bilateral runner** and test original Regidrago/Raichu exact-source action lines. The existing tests demonstrate isolated legal attachments and modeled cost matching, while a full-deck native opponent bot must still handle Basic/Special contention, on-attachment effects, Supporter/Item decisions, target resolution, attack/Prize settlements and next-turn responses. The full-field gap is decision integration and practical action quality, not a missing all-family Energy symbol table.

This correction does not alter the exact 118-copy census, but prevents assigning novelty to functionality already developed on 29 October.


The wider benchmark remains 29/32 original opponent sixties, no qualified competitive games, and no measured 99.5% full-field win rate. The field inventory is a dataset count only and must never be represented as empirical matchup performance.
