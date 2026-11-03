# Rank-17 original Electrode-GX: paper-partial Extra Energy Bomb owner-opportunity gate

**Agent 1 | 3 November 2026 | fixed original source, pure owner-state prerequisite tests | zero competitively qualified games**

## Decision question

The earlier [eight-arm original rank-17 native replay](agent1-rank17-original-existing-paper-damage-hook-native-20261102.md) observed seven accepted natural Stage-1 evolution plays, one original Electro Rain attack and **zero selected Extra Energy Bomb Ability roots**. This observation does not distinguish an absent legal opportunity from an incomplete owner-Ability policy. We need an independently checkable, actor-visible denominator before treating the lack of selected Ability actions as an opponent-competence deficiency.

The exact authenticated source is Yuya Yamano's original rank-17 Alolan Raichu / Electrode-GX 60 in [full-decklists.json](full-decklists.json). The printed source inventory contains **3 Electrode-GX CES48**, **2 Alolan Raichu UNM57**, and **12 distinct physical Special Energy cards**, namely **4 Reversal Energy PAL192, 4 Counter Energy CIN100, and 4 Unit Energy LPM UPR138**. No Basic Energy is included. These are deck-inventory facts, not an observed match-state availability assertion.

## Critical printed-card versus game rule distinction

Electrode-GX CES48's **Extra Energy Bomb** says it attaches **5 Energy cards** from your discard pile among your non-Pokémon-GX/non-Pokémon-EX Pokémon, and **if you do, this Pokémon is Knocked Out**. The supplied *Advanced Player's Rulebook* §II-A states that when a specified quantity cannot be fulfilled because fewer objects exist, the closest possible number is applied. §II-E-20 expressly states that when **any** part of the first clause of an `If you do` effect is accomplished, its second clause must be executed. Accordingly, with a qualifying recipient and no other prohibitions:

| Physically discarded eligible Energy cards | Maximum cards attachable from this pool | Conditional consequence |
| ---: | ---: | --- |
| 0 | 0 | No effective first clause; no legitimate activation/KO witnessed |
| 1–4 | 1–4 | Partial physical transfer still entails self-KO |
| 5+ | 5 | Full nominal transfer entails self-KO |

All counts above are **Energy cards, not Energy units**. Reversal Energy and Counter Energy can each supply several units when attached under qualifying conditions, but one physical card cannot satisfy several of the five card selections. A requirement of **five physical discarded cards as a minimum for using the Ability** would falsely reject genuine partial-attachment opportunities. The existing research-owned [Electrode-GX hook](../../simulation/twinleaf/electrode-gx-energy-hook.cjs) also uses `Math.min(5, available.length)` as its mandatory physical selection count. This confirms the partial-attachment logic had already been implemented elsewhere; this audit makes it explicit in a new actor-root opportunity denominator.

**Precision:** A partial 1–4-card *Energy-attachment line* is mechanically plausible under those rules. This report does **not** establish that the card can legally activate in every such state: public Ability locks, target restrictions, valid recipient availability, printed card effects, player turn timing, native engine behavior and game-state transfers still matter.

## Implemented pure, detached owner-state screen

[Source](../../simulation/twinleaf/agent1-rank17-electrode-owner-necessity.cjs) | [Node CJS regression tests](../../tests/agent1-rank17-electrode-owner-necessity.test.cjs)

The `rank17ElectrodeBombNecessity(view)` function takes only the frozen `actorObservation` structure, without underlying native Store, unknown Prize or deck identities or opponent's private hand. It matches the exact source **Electrode-GX CES** and **Alolan Raichu UNM** board printings and the three named original Energy printings in the owner's public discard pile. Each physical printed card counts once.

Its result separates `physicalNecessaryConditionsMet` from `fullFiveCardFundingAvailable`, reports `maxPhysicalCardsTransferable` and physical blockers, and lists **non-adjudicative** visible lock clues such as Active Bide Barricade, Neutralizing Gas, Tool-backed Garbotoxin and Path to the Peak. The screen intentionally returns `paperLegality: 'UNVERIFIED'`, `sourceAbilityDispatch: 'NOT_ATTEMPTED'`, and false transfer/self-KO/Prize/opponent-reply/competitive-qualification flags. A missing Alolan Raichu blocks the *Raichu-specific downstream line*, not necessarily the Ability's use on some other non-GX/EX Pokémon.

Regression tests cover all-zero, 4-card partial and 5-card nominal funding; missing exact source Pokémon/recipient; exact CES printing protection; visible lock clues; and invariance under fabricated hidden-data fields. The printed source inventory and Energy types are checked against the authenticated source JSON.

### Reproduction status

- [Manual benchmark workflow](../../.github/workflows/aichi-benchmark-stats.yml) adds the regression to an existing **workflow_dispatch-only** pipeline, avoiding new per-commit CI.
- [Run 41661865101](https://github.com/FlareZ123/experiment-01/actions/runs/41661865101) succeeded under an early five-card-only test; the *test's original semantic gate was wrong* and it is **superseded**, not evidence for the corrected rule.
- [Corrected run 41662221590](https://github.com/FlareZ123/experiment-01/actions/runs/41662221590) succeeded at commit `28103670232eca86aaeb5f8407bc1532e880a422` after the partial-transfer/zero-card corrections.
- A subsequent exact-native-printing guard was added; its separate CI receipt must be linked after compilation. Local synthetic tests are not game-state observations.

## Required next actual-native experiment

Integrate the **read-only** screen into the canonical symmetric two-seat actor root on fresh registered unchanged rank-17 source deals, preserving every attempted deal, action cap and error. Log genuine owner root hand/discard and public board, actual owner-turn chronology, exact print-specific suppression and receiver eligibility. For every positive prerequisite, compare strategic alternatives before selecting an Ability; use a native `UseAbilityAction` under an opt-in owner-only policy and the existing research-owned paper-corrected Electrode hook.

Archive exact pre/post discarded *card identities* and moved recipients, mandatory prompt minimum, actual Electrode self-KO, both players' Prize transitions and subsequent Raichu Electro Rain *attack damage* (where used, with Agent46's existing correction). Capture a consequential opponent reply and both physical seats under an immutable source/candidate match registration. Native Store success and prompt legality are each distinct from paper legality and strategic competence.

**Status:** This is a **pure necessary-condition gate and correctness regression**, with no naturally observed positive root, no native Ability action selected by this module, no changed candidate deck, no full paper-valid game and **no demonstrated field win rate**. The field remains **29/32 authenticated original printed 60s** with ranks **23/25/28 missing**, no selected best 60 and **zero competitively qualified games**.
