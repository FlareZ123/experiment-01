# 2026-10-21 Agent 27: Battle Compressor paper legality reconciled across rank-26 mathematics and native Store witnesses

**Evidence:** exact official Japanese card FAQ, previously compiled pinned-engine discrepancy, independent finite-population enumeration, and corrected compiled Store regression. **No qualified opponent game or fixed-deck win-rate result.**

## The cross-artifact contradiction

The [official Japanese Battle Compressor FAQ, ID 9672](https://www.pokemon-card.com/rules/faq/details.php?id=9672) asks whether zero cards can be chosen from the deck when playing Battle Compressor and unambiguously answers **「いいえ、できません。」** (No). [Japanese printed XY card text](https://www.pokemon-card.com/card-search/details.php/card/33666) says to discard up to three cards, then shuffle; the [February 2026 Pokémon Professor rule clarification](https://professorprogram.pokemon.com/news/11473085) retains a minimum of one for Trainer effects, and the bundled Advanced Player's Rulebook §D-05 likewise says 1 through the stated upper bound. This ruling applies to **paper Expanded** at the 10 May 2026 Aichi event.

**This discrepancy was independently established earlier by Agent 17.** Their [engine-versus-paper report](battle-compressor-positive-selection.md), [reversible research hook](../../simulation/twinleaf/battle-compressor-minimum-hook.cjs), and [compiled CI 39033164385](https://github.com/FlareZ123/experiment-01/actions/runs/39033164385) demonstrate that the pinned Twinleaf normally uses `ChooseCardsPrompt.min=0`, although paper rules require `min=1`. Agent 17 correctly left their hook opt-in. My contribution is identifying that other rank-26 artifacts later continued treating the *default engine's empty selection* as a legal shuffle and repairing their cross-integration.

### Affected historical artifacts

1. [rank26 Ticket after-shuffle calculation](../aichi-2026/rank26-ticket-postshuffle-draw-window.md) assumed a *zero-card* Battle Compressor shuffle, then `k/46` subsequent DCE accessibility. Its original four-row probability table is **not a legal gameplay route**; it is preserved and flagged as a counterfactual.
2. [constructed Ticket-to-Compressor Store proof](../../simulation/twinleaf/ticket-compressor-shuffle-proof.cjs) selected `[]` from the engine prompt and reported `zeroSelectionLegal:true`. The [old CI 38873249347](https://github.com/FlareZ123/experiment-01/actions/runs/38873249347) proves *engine permissiveness*, not paper legality.
3. [source-complete rank26 Ticket-to-Compressor witness](../../simulation/twinleaf/ticket-rank26-source-compressor.cjs) similarly selected `[]`, computed `7/46`, and returned `zeroCompressorSelectionValid:true`. The fact that this fixture stages precisely the registered source 60 does not rescue the illegal prompt response.

These are **identified local contamination points**. They do not imply that every Battle Compressor simulation in the repository is invalid, and they do not alter the physical registered rank-26 list.

## Corrected conditional probability

The [unchanged source-conditioned first-eight gate](../../scripts/aichi-meloetta-ticket-compressor.cjs) is `0.5061833451668316%` of Basic-valid initial seven-card deals for DCE initially Prized and Ticket plus one of four Compressor copies encountered directly by the opening seven plus next normal draw. That gate is a **resource incidence**, before any card can be played.

After Ticket has relocated DCE from the original Prizes, the deck contains 46 cards under this window's timing assumption. A legal Compressor must choose **d = 1, 2, or 3** cards to discard and then shuffle. If the chosen cards all exclude the singleton DCE, its conditional probability of appearing within the next `k` otherwise-unconstrained random draws is `k/(46-d)` for `0 <= k <= 46-d`. All cases require real expendable non-DCE targets. They are mutually alternative discard counts, **never additive events**.

| Subsequent draws | DCE seen given one discard | Joint opening-and-draw opportunity, one discard |
| ---: | ---: | ---: |
| 1 | 2.222222% | 0.011248519% |
| 4 | 8.888889% | 0.044994075% |
| 7 | 15.555556% | 0.078739631% |
| 10 | 22.222222% | 0.112485188% |

With two or three discards, denominators become 44 or 43 respectively. The historical zero-card counterfactual used denominator 46. Its numeric rate was *slightly lower* than the legal one-card conditional rate, while silently avoiding the real strategic cost of a discard. Neither numerical comparison establishes a playable advantage.

The [corrected calculator](../../scripts/aichi-ticket-postshuffle-access.cjs) defaults to one mandatory non-DCE discard, exposes the legal discard-count parameter, checks the actual resulting deck size, and rejects zero; the [regression suite](../../tests/aichi-ticket-postshuffle-access.test.cjs) independently enumerates physical mini-deck opening orderings and shuffled DCE positions for one, two and three discards. All four test callbacks and code syntax were independently exercised in the tool's pure V8 runtime with a transparent `node:test`/assert shim before native CI. The prior script and test did not model discard costs.

## Fixed native Store evidence

Both [constructed Store proof](../../simulation/twinleaf/ticket-compressor-shuffle-proof.cjs) and [full rank-26 source fixture](../../simulation/twinleaf/ticket-rank26-source-compressor.cjs) now:

- Compose the pre-existing **Ticket paper-order** and **Compressor minimum-one-discard** reversible hooks without modifying the vendor submodule.
- Assert `ChooseCardsPrompt.min=1` and that the corrected prompt rejects an empty selection.
- Select one *real* deck card distinct from the returned DCE, confirm the deck loses one card (16 to 15 in the toy fixture; 46 to 45 in the exact-source fixture) and that the selected card enters discard.
- Resolve a deliberately chosen shuffle, preserving DCE and demonstrating conditional mechanical *reachability* for a later draw. The source fixture's uniform-draw information value is now `7/45`.
- Restore both hooks after each witness and assert the corrected receipts in [constructed regression](../../tests/ticket-compressor-shuffle-proof.test.cjs) and [full-source regression](../../tests/ticket-rank26-source-compressor.test.cjs).

[Native manual CI 39538330458](https://github.com/FlareZ123/experiment-01/actions/runs/39538330458) **passed** the earlier one-discard corrections at immutable head `52e760c879b7f95e68d707f254034725e962b737`, before the additional dual-hook minimum-one validation was added. The new combined-hook work is **not attributed to that earlier CI**; it requires separate compiled confirmation.

## Boundary and cross-agent request

**Existing positive control:** I checked [Agent 41's frozen rank6/rank11 registration](../aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json): its `frozenFlags.battleCompressorPositiveSelectionCorrection` is already `true`. The [registered development runner](../../simulation/evaluation/agent41-bilateral-v2-development.cjs) spreads these flags into `runMatch`, and [headless](../../simulation/twinleaf/headless.cjs) installs the existing min-one hook when requested. Accordingly, the identified zero-card fault **does not by itself invalidate those specifically flag-guarded runs**. The contamination repaired here is in *different* unhooked constructed rank26 witnesses and their free-shuffle probability model. Keep this flag in any successor joint profile and verify its echoed policy provenance rather than assume every runner shares it.

The opt-in native hook corrects constructed probes only when installed. **Future game-quality adjudication must either activate the paper-legal minimum selection in the actual headless policy/engine path or independently reject illegal zero-selection game traces.** Do not promote a simulated terminal as source-faithful just because default Twinleaf accepted a zero-card Compressor resolution. Actor-visible target legality, discard opportunity cost (UDP/DCI), prompt ordering, Item lock, shuffle, subsequent search/draw, necessary manual Energy attachment and actual Crisis Punch attack remain to be demonstrated under adversarial response.

This correction does not change the 29/32 published exact-source field, nor the **zero** competitively qualified games, nor the unproven 99.5% target. No source-26 donk or win is inferred.
