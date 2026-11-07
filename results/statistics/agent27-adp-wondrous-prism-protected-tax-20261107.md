# Agent27: Wondrous Labyrinth is an Item-protected opening counter to one-DDE enhanced ADP GX

**7 November 2026.** A conditional, source-grounded paper-card-text opponent Stadium screen. No opening frequency, physical native match, strategy ranking or win-rate inference. The shared goal still has 29/32 authenticated original 60-card name/count inventories, zero competitive games and no selected final 60.

## Exact fixed source 60 and source-specific relevance

The authenticated [2026 Aichi Top32 originals](../aichi-2026/full-decklists.json) at ranks **6, 24 and 29** each contain **4 Iron Thorns ex TWM77 and 1 Wondrous Labyrinth ◇ TEU158**. A Basic-valid opponent begins with an Active Iron Thorns, whose *Initialization* disables non-Future Rule Box Abilities such as ADP candidate Tapu Lele-GX Wonder Tag while active. However, the opponent **does not necessarily begin with Wondrous Labyrinth in play**; its singleton must become an actual, legally played Stadium during the opponent's prior turn. The following result is explicitly **conditional on Wondrous already being active** when fixed ADP goes second.

The [fixed ADP–Thorton–Regidrago v2 60](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json) has **2 ADP TAG TEAM Dragon**, **4 Double Dragon Energy XY6 97**, **2 Viridian Forest TEU156**, **2 Field Blower GRI125**, **3 Guzma & Hala CEC193**, 4 Tag Call, and **7 Basic starting Pokémon**. Its standard first-own-turn *enhanced* Altered Creation-GX plan seeks ADP Active with one DDE attached.

## Printed card/rule interaction

The bundled original English corpus names exact printing IDs `sm9-158` (Wondrous), `sm9-156` (Viridian Forest), `sm2-125` (Field Blower), `sm12-156` (ADP), `sm12-193` (Guzma & Hala) and `xy6-97` (DDE).

1. **Wondrous Labyrinth ◇** increases attacks of non-Fairy Pokémon by one **Colorless** Energy. ADP is **Dragon**, so its printed Altered Creation-GX Energy cost **[Metal]** becomes **[Metal, Colorless]**.
2. ADP's *enhanced* extra-Prize mode requires at least **one extra Water Energy in addition to the attack's own cost**. Thus under active Wondrous the enhanced branch requires **three simultaneously provided Energy units**: Metal, Colorless and extra Water.
3. One **Double Dragon Energy** provides every type but **exactly two Energy at a time** while attached to Dragon ADP. On its own, one DDE meets the **two-unit base GX** under Wondrous yet cannot also supply the **third extra Water** required for its enhanced Prize effect. With no Wondrous, the same one DDE can meet Metal cost plus extra Water.
4. Wondrous Labyrinth **prevents all effects of Item and Supporter cards done to itself**. The two fixed v2 **Field Blower** copies are **Items**; their attempt to discard Wondrous is prevented. An attack or Ability may remove a Prism Star Stadium under other legal conditions. **Guzma & Hala** searches for a Stadium in the deck without targeting the in-play Stadium. Playing a different Stadium such as **Viridian Forest** then replaces Wondrous under the normal Stadium rules; the removed Prism Star goes to the **Lost Zone**, rather than discard. This replacement is allowed even though direct Item/Supporter removal of Wondrous is prevented.
5. Any actual alternative Energy attachment or acceleration that provides a third unit requires independent validation of timing/available source actions. This simple printed two-unit screen assumes **one DDE attached and no other Energy on ADP**. Likewise reaching Viridian in hand through G&H consumes the turn's Supporter, may be Prized, and can compete with reaching DDE/ADP. No complete decision tree or realistic bonus-draw sequencing is asserted.

The attached Advanced Player's Rulebook **I.B-04 Stadiums** explicitly says that a different-name Stadium replaces the old Stadium, and **I.C Energy** allows only one normal hand attachment each turn. Its **I.A-01 Attacks** requires the right amount/types of Energy to announce an attack. Independent published references agree with Wondrous's printed shield: [TCG Codex TEU158](https://tcgcodex.com/card-details/11459/wondrous-labyrinth) and the [Advanced Player's Manual v2.2, Field Blower vs analogous Heat Factory Prism Star ruling](https://asia.pokemon-card.com/ph/wp-content/uploads/sites/6/2022/08/advanced-manual_EN.pdf). The supplied modern rulebook, rather than the old v2.2, is primary for current generic Stadium play. The exact printed card text is the decisive in-deck evidence.

## Conditional paper payoff matrix

| First-own-turn board assumption | One DDE units | Enhanced GX units needed | Result from this screen |
| --- | ---: | ---: | --- |
| No Wondrous | 2 | 2 | Enhanced branch payable |
| Wondrous active, **Field Blower** played | 2 | 3 | **Enhanced branch not payable**; Field Blower does not remove Wondrous |
| Wondrous replaced by Viridian | 2 | 2 | Enhanced branch payable |
| Wondrous remains, an independently proven extra unit already on ADP | 3 | 3 | Enhanced branch *may* be payable, subject to other actual game conditions |

These are **conditional energy-unit truths**, not probabilities of a turn's complete action sequence or games won. The visible Wondrous can still permit an unenhanced Altered Creation-GX attack with one DDE, granting +30 damage but **not** extra Prize cards.

## Exact six-Prize no-Viridian availability event

There are exactly **2 Viridian Forest** and **7 Basic starters** among the fixed 60. Given a **Basic-valid uniformly randomized opening seven**, then six randomly set Prize cards among the other 53, the probability that **both** Viridian copies are simultaneously Prized is

```text
P(both Viridian Prized | valid Basic initial 7)
  = [C(58,7)-C(51,7)]/[C(60,7)-C(53,7)] * C(6,2)/C(53,2)
  = 0.008672995106093177
  = 0.8672995106093177%.
```

The exact integer numerator is `2773484820`, denominator `319783971520`. This physical event implies neither Viridian is initially available in hand/deck for its own replacement line, but **does not** imply that Wondrous was ever played by the opponent or that ADP automatically loses. Other effects, accessibility through later Prize draws, and all strategic responses remain outside this event. The number must not be subtracted indiscriminately from a general field-level paid-opening probability.

## Code, tests, and integration boundary

[Source-grounded read-only CommonJS module](../../simulation/evaluation/agent27-adp-wondrous-source-tax.cjs) verifies each of the original three 60-card source lists, the actual card rules and the fixed ADP v2 quantities, then implements the restricted `conditionalAdpGxUnits` energy-unit screen plus an exact combinatorial Prize event. [10 pure regression tests](../../tests/agent27-adp-wondrous-source-tax.test.cjs) cover printed source provenance, one-DDE enhanced baseline, Wondrous suppression, ineffectual Field Blower, legal replacement, hypothetical extra attachment, type inadequacy without DDE, independently recomputed Prize window, invalid input and no win claim. **10/10 passed under isolated exact-fetched-repository V8 CommonJS source evaluation; normal Node/CI execution has not yet occurred.**

This is closely related to Agent8's earlier [Wondrous original Iron Thorns Volt Cyclone Energy-tax native policy problem](../twinleaf/agent8-wondrous-tax-native-audit-20261030.md), which established the opposite side's Wondrous extra-Colorless cost for **Volt Cyclone**. The present check applies that **known Stadium mechanic to the fixed ADP v2 enhanced GX opening and Field Blower's inability to answer it**. It does not claim discovery of Prism Star's Item protection itself. No new native run, decklist, policy change or workflow was introduced. If evaluating the fixed v2 against any original Thorns source that actually played Wondrous, a competent source-independent bilateral opponent policy should require a real Viridian placement or third Energy supply before counting an enhanced GX bonus-Prize attack. An actual source→opponent reply→source continuation remains the release prerequisite.
