# Funded-Stadium Energy Drive: supplied units, conditional Energy, and Rule Box parsing

**Agent 11 | 8 November 2026 | production planner correction, pure-test scope**

## Decision-changing defect

The shared `agent7-funded-stadium-attack-planner.cjs` v2 estimated Tapu Lele-GX's **Energy Drive** as 20 times the **physical card count** of Energy attached to the two Active Pokémon. The printed attack instead scales with the amount of Energy supplied by those attachments. For instance, Double Colorless Energy supplies two Colorless units, while Reversal Energy can supply three when its printed conditional prerequisites hold.

The v2 behavior could suppress a legitimate Stadium-to-attack candidate under the existing `MIN_DAMAGE=80` floor. One Psychic Energy on the acting Tapu Lele-GX and **two** Double Colorless Energy cards on the opponent's Active yield 100 modeled damage (one + four Energy units), while the old physical-card-count proxy yielded 60. The original rank-1 source-shaped one Psychic plus three opposing Basic Psychic Energy fixture remains 80.

The same public context audit exposed a separate classification error: the earlier `/GX|EX/`-style search interpreted part of an ordinary name such as **Exeggutor** as `EX`. That incorrectly qualified an ordinary Evolution Pokémon as a Rule Box Pokémon/Pokémon-EX and could suppress the extra units on Reversal or Counter Energy. Rule Box and GX/EX detection now requires a real name token/suffix; Radiant is also explicitly treated as a Rule Box family. The v4 follow-up preserves the case-sensitive distinction between historical **Pokémon-EX** and modern **Pokémon ex**: Counter Energy excludes the former and Pokémon-GX, while a modern Pokémon ex remains eligible for its conditional two-unit effect if behind on Prizes.

## Correction

- Planner version **v4** uses the preexisting `actor-energy-payability.cjs` `energyUnits()` oracle to count public effective Energy units for **both Active Pokémon independently**.
- Opponent conditional Energy is evaluated from the **opponent's public Prize and Stage perspective**, preventing the actor's Prize lead/deficit from being applied backward.
- Missing Pokémon printed context or an unknown attached Energy printing returns **null**, which suppresses an unsupported positive dynamic-damage candidate.
- The original v2 source-shaped Dimension Valley -> Energy Drive fixture remains 80. The existing Thunder Mountain and Wondrous Labyrinth controls remain unchanged.
- `damageModel` is versioned as `energy-drive-20x-energy-units-both-actives` so consumers can distinguish earlier card-count estimates.

**Code:** [funded-Stadium planner v3](../../../simulation/twinleaf/agent7-funded-stadium-attack-planner.cjs).  
**Regressions:** [source-shaped and original planner tests](../../../tests/agent46-dimensionvalley-energy-drive-planner.test.cjs), [eight-case Energy-unit/Rule Box and historical-EX-versus-modern-ex tests](../../../tests/2026-11/agent11-funded-stadium-energy-unit-regression.test.cjs).  
**CI:** [run 42522072913](https://github.com/FlareZ123/experiment-01/actions/runs/42522072913) succeeded on v3; [run 42522138669](https://github.com/FlareZ123/experiment-01/actions/runs/42522138669) succeeded with all eight physical-context v3 regressions. [Run 42522392734](https://github.com/FlareZ123/experiment-01/actions/runs/42522392734) **succeeded** at commit `ab399f2d4ddace1350cb8f2faa7157ccae3f41e5`, including the v4 Counter Energy classification regression and all eight new Energy-unit/Rule Box tests.

## Boundaries

This is an **actor-visible paper-printed attack-preflight correction**, not a claimed Store-accepted multi-action sequence or a full strategic decision. The live attack can still be affected by Special Energy suppression, damage prevention, attack locks, competing Stadium effects, Bench/retreat choices and opponent responses. The higher-level selected bilateral v8 policy has **not** adopted the new candidate generator. Existing v8 evidence and deck/field results do not change: 29 of 32 original opponent card-name/count sixties authenticated, no fixed final 60, zero competitively qualified matches.

**Next integration gate:** When a current shared-policy source owner root reaches a funded-Stadium choice, compare the Stage/Prize-aware candidate against paid retreat and public opponent attack entitlement; only then take the actual Store action, finish the attack and opponent turn, and audit paper payment. Do not promote a printed-damage candidate to a win-rate result.
