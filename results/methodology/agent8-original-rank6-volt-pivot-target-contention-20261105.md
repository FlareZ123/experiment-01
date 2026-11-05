# Agent 8: original rank6 Volt Cyclone's next-turn Guzma mobility and forced opponent gust

**5 November 2026 | printed-card and actual public-board analysis; hypothetical next-turn actions, no new native battle.**

## Concrete research question and authentic inputs

Aichi original rank6 **Kazuma Kashi Iron Thorns ex** in [real v10 CI 42106359764](https://github.com/FlareZ123/experiment-01/actions/runs/42106359764) executed two genuine original-source printed turn2 Volt Cyclone attacks, each dealing 140 and taking zero Prizes, then paid mandatory movement of its **single Double Colorless Energy (DCE)** from Active Iron Thorns ex onto its own Benched Iron Thorns ex. Both opposing actual turn3 replies were witnessed. Agent36 documented the immediate source reattack shortfall. Here the next question is: **could the source promote the newly powered Bench to attack turn4, and what opponent-target cost must it pay?**

Printed source rank6 [authenticated exact 60](../aichi-2026/full-decklists.json): 4 Iron Thorns ex TWM 77, 3 Guzma BUS 115, 1 DCE SUM 136, 1 Thunder Mountain Prism Star LOT 191, 2 Guzma & Hala CEC 193, 2 Tag Call CEC 206. There is no ordinary Switch or Escape Rope in this exact source.

## Physical constraints and card text

- Iron Thorns ex TWM 77 is a **230 HP** Basic with **four Colorless Retreat Cost** and `Volt Cyclone`: 140 damage for **Lightning + two Colorless**, then move an Energy to own Bench. `Initialization` suppresses non-Future Rule-Box Pokémon Abilities while this Iron Thorns remains Active. Verified locally in uploaded complete card pool `cards/en/sv6.json` printing `sv6-77`.
- Thunder Mountain Prism Star LOT 191 reduces an attack used by a Lightning Pokémon by **one Lightning Energy**. One DCE provides **two Colorless**, exactly enough for Thunder-reduced Volt. The pinned native v10 after-attack source board physically has **zero Energy on Active**, exactly **one DCE on Benched Iron Thorns**, Thunder still in play and zero Prize changes.
- Ordinary retreat costs **four Energy** for Active Iron Thorns, impossible from zero Energy even with a single ordinary one-unit Energy attachment next turn. Guzma BUS 115 reads: `Switch 1 of your opponent's Benched Pokémon with their Active Pokémon. If you do, switch your Active Pokémon with 1 of your Benched Pokémon.` Thus a payable **Guzma** would promote the powered Bench without retreating, but must also **gust an eligible opposing Bench**, spending the once-per-turn Supporter action. Both actual opposing boards have eligible Benches.
- The archived native source never actually declared Guzma on its next turn. **Owner hand, Guzma Prize/discard status, native acceptance, opponent future effects and strategic preference are unknown.** The following is a printed-mechanics counterfactual, not observed gameplay.

## Two source-stamped actual boards, different hypothetical pivot payoff

| Genuine v10 source attack public board | Counterfactual source Guzma pivot on turn4 | Conditional paper payoff |
| --- | --- | --- |
| Against **champion-reference**: opponent Active **Latias ex** SV8 76 (**210 HP with 140 damage**), lone opponent Bench **Dialga-GX** UPR 100 (**180 HP, zero damage**) | Guzma must move wounded Latias to Bench and promote Dialga. Then own DCE-Benched Iron Thorns can be promoted and use Thunder-reduced Volt on the new Active Dialga | With no further modifiers, **140/180** leaves Dialga on 40 HP, **no immediate Prize**. The original 70-HP-remaining Latias moves off Active, preventing the same attack's immediate two-hit KO target. |
| Against **new-moon-lockbreaker-v1**: opponent Active **Mewtwo & Mew-GX** UNM 71 (**270 HP with 140 damage**); Bench **Unown** AOR 30 and **Duskull** VIV 69, both **60 HP**, zero damage | Source chooses Unown or Duskull as opposing Guzma target while promoting own DCE-backed Thorns | With no protection or damage modifiers, **140** would KO the promoted **60-HP single-Prize Basic**, awarding **one Prize**, while original injured Mewtwo & Mew-GX moves to Bench. |

The Unown AOR 30 has `Farewell Letter`: its owner can voluntarily discard it from Bench to draw, without a Knock Out. Being a non-Rule-Box Pokémon, its Ability is unaffected by Iron Thorns ex's own `Initialization` alone. Thus a competent opponent can sometimes preempt the cheap Guzma target by removing Unown, depending on the turn and any other locks. Both Unown and Duskull English proxy printings are explicitly recorded in [the frozen New Moon proxy](../als/new-moon-lockbreak-english-proxy-60.json). The two real source initial deals differ because the two candidate sixties differ; cross-candidate opening equality is **not** presumed.

**Strategic finding:** the connector from Guzma to own Active mobility has a coupled, mandatory **opposing-target change**. In one actual public board it sacrifices access to an already 140-damaged 210-HP Active while producing no KO. In the other it can potentially produce a 1-Prize KO. Treating this as a cost-free Switch edge would significantly misprice the move. It also competes with any other Supporter chosen to establish Energy or disrupt the opponent that turn. These statements describe **possible outcomes under specified conditions**, not a Guzma play the native bot actually performed.

## Exact marginal natural Guzma access, distinct from the specific v10 state

From exact original rank6 counts, the seven-card starting hand must contain one of four Basic Iron Thorns. After six uniformly random Prize cards, the going-second source draws one card on global turn2 and another on global turn4. Ignore all other draw/search and discard. The two natural draws remain an exchangeable random sample of the 53 cards after the opening hand, even though six were first set as Prizes.

Under this deliberately narrow model,

`P(Guzma in first nine naturally seen cards | at least one Basic in initial seven) = 1 - [C(57,9)/C(60,9)] * [1-C(53,7)/C(57,7)] / [1-C(56,7)/C(60,7)]`

`= 804101 / 2204136 = 36.481460309164226%.`

The first-eight-card counterpart is exactly `1257173 / 3857238 = 32.592570124011017%`. Calculations were independently executed in Python using `math.comb` and exact `fractions.Fraction`. The reusable [integer BigInt evaluator](../../simulation/evaluation/agent8-rank6-direct-guzma-pivot-proxy.cjs) loads and verifies rank6's real original 60; its five [exact regression tests](../../tests/agent8-rank6-direct-guzma-pivot-proxy.test.cjs) are committed but **not yet run in compiled repository CI**.

**Critical boundary:** 36.48% measures **naturally having seen a printed Guzma** under a generic legal opener. It does **not** condition on the narrowly seeded v10 G&H, DCE, Thunder and second-Bench attack state. It does not certify the Guzma remains held, the Supporter is permitted, the opponent still has the required Bench, or that other Item/Supporter search and discard paths exist. Multiplying it by prior source-attack access probabilities would double-count dependent physical resource variables and be mathematically unjustified.

## Recommended next rigorous test

If pursued, prospectively register a genuine owner-visible **paid Guzma pivot** compared with preserving the original Active and attaching normally, holding original source and opponent 60s, physical seed, both seats, accepted root prefix and sufficiently long fixed global-turn horizon unchanged. Preserve every rejection and cap. Record the real held Guzma or VS Seeker-to-Guzma, printed gust target and Supporter gate, exact physical DCE custody, continued Thunder cost, actual settled damage/Prizes, and meaningful opposing decision. Do not retrofit a win or a strong-play claim from the previously archived v10 branch.

**Status unchanged:** 29/32 authenticated original source 60s, no selected best fixed 60, zero competitively qualified games, and no demonstrated 99.5% field win rate.

**22:20 UTC verification addendum:** Exact committed BigInt CJS and five committed test source bytes were fetched from GitHub and executed in an isolated V8 harness, with read-only mocking of Node fs/path that returned the genuine GitHub original 60 from results/aichi-2026/full-decklists.json. **5/5 pure tests passed**, including literal rank6 player/4 Basic/3 Guzma assertions and exact reduced fraction checks. This was not the native Node test runner, official CI or a Pokémon game test.
