# Guzma & Hala CEC193: prospective optional-cost bypass affecting five previously uncovered original decks

**Agent 30 | 2 November 2026 | STATIC pinned-engine causal inspection and prospective native regression only. Native payment payoff NOT YET VERIFIED.** This is a hypothesis to test, not a demonstrated illegal Store payout or game result.

## Original paper interaction and field stakes

The original printed **Guzma & Hala CEC 193** Supporter first searches one Stadium. It *optionally* discards **two other cards from hand** so the search may also include a Pokémon Tool and a Special Energy. The full search requires the full two-card payment. Exactly five of the **29 authenticated original Aichi Top32 sixties** contain that original printing, for **13 physical copies**:

| Rank | Archetype | Exact Guzma & Hala copies |
| ---: | --- | ---: |
| 2 | Vileplume control | 4 |
| 6 | Iron Thorns ex | 2 |
| 15 | Vileplume control | 3 |
| 24 | Iron Thorns ex | 2 |
| 29 | Iron Thorns ex | 2 |

Printed identities and quantities were recomputed directly from [full-decklists.json](full-decklists.json). None of these five original ranks contains Ultra Ball MEG 131, Secret Box TWM 163 or Dowsing Machine PLS 128, so they represent five new source-paper-fidelity exposures **if** the suspected native short-payment payout is confirmed.

## Exact source-code path to investigate

Original pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05` uses [`ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/guzma-and-hala.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/08-sun-and-moon/set-cosmic-eclipse/guzma-and-hala.ts). In the optional second branch, the code prompts `ChooseCardsPrompt(CHOOSE_CARD_TO_DISCARD, {min:2,max:2,allowCancel:false})`, then its callback uses `cards = cards || []`, calls `MOVE_CARDS(..., cards)`, and **unconditionally** proceeds to `searchDeck` for one each of Special Energy, Tool and Stadium. No explicit `cards.length === 2` condition exists inside that callback. Before the prompt the helper requires at least two other cards to be present, so this is a potential **payment-reply** defect rather than an inability to detect available hand costs at root.

The pinned [`game/store/store.ts`](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts) `reducePrompt` assigns `prompt.result = action.result` without calling `prompt.validate`. On already-tested Ultra Ball, Secret Box and Dowsing, this permitted invalid actual choices to settle. The same architecture raises an especially strong hypothesis that a zero- or one-card reply could reach the G&H three-category search, although this specific source path is not yet confirmed by a native trace. The local paper rulebook's explicit paid-option dependency controls the conclusion of any future replay.

## Registered prospective native experiment

Created [`simulation/twinleaf/agent30-guzma-hala-optional-payment-native.cjs`](../../simulation/twinleaf/agent30-guzma-hala-optional-payment-native.cjs) and [`tests/agent30-guzma-hala-optional-payment-native.test.cjs`](../../tests/agent30-guzma-hala-optional-payment-native.test.cjs), included as a **manual-only** diagnostic in the already-existing [native-energy-probe suite](../../.github/workflows/aichi-iron-thorns-first-attack.yml). The probe uses real original rank6 physical printings: Iron Thorns ex TWM Active, **Guzma & Hala CEC** in hand, two original source Trainers as candidate payments (**Plumeria BUS** and **Guzma BUS**), and original rank6 eligible search cards **Thunder Mountain Prism Star LOT**, **Handheld Fan TWM**, **Double Colorless Energy SUM** in the live native deck. Two owner physical seats × payment counts 0, 1, 2 yield six prospective conditional Store cases. The chosen Supporter option is the actual native `SelectOptionPrompt` second branch; the target search must actually transfer all three physical card objects before any payoff claim.

The test is intentionally discriminating: prompt min/max, `prompt.validate` result, Store rejection or acceptance, true individual physical hand/discard/deck changes, and remaining native prompts. The two-card paid branch is a necessary positive control. A prompted zero/one-card reply accepted by Store is still insufficient to claim a **free three-card payout** without physically recovered target cards.

**Execution status:** No new CI result is available for this Guzma & Hala prospective fixture. A later manual workflow dispatch attempt for the preceding Dowsing provenance assertion was blocked by host safety checks; no workaround or reroute was attempted. The G&H test has been committed but not run and may fail because of fixture details or engine semantics. Explicitly do not promote it to confirmed status until a successful actual pinned-native both-seat replay and complete verified receipt exist.

## Implications and release condition

A genuine rank6 Guzma & Hala natural ALS (Tag Call → G&H → Special Energy/Tool/Stadium) is central to the Iron Thorns attacking line. A false free Tool+Energy opportunity would inflate source competence and distort candidate comparisons; conversely improper rejection of a legal two-card paid branch could artificially weaken source. Three original Iron Thorns ranks and two Vileplume ranks are enough to justify investigating the *actual* Supporter payment continuation.

All original-source full-field prerequisites remain unchanged: 29/32 exact printed source 60s, zero competitive-qualified games, no promoted fixed 60 and no demonstrated 99.5% field win rate.
