# Agent37: v2 research adapter corrects simultaneous Active promotion order in a bounded native fixture

**7 November 2026 | Pinned Twinleaf Store | Manual CI run 42361397725 | No competitive game qualification**

## Result

The v2 research-owned adapter passes a two-seat native regression that corrects the pinned Store's simultaneous Active KO promotion order in a narrowly defined scenario. It preserves the original Prize prompt order, restores physical player order and activePlayer before promotion prompts are exposed, and leaves the subsequent turn transition intact.

[Manual CI run 42361397725](https://github.com/FlareZ123/experiment-01/actions/runs/42361397725), job **128370371946**, completed successfully. The run includes the original v1 diagnostic at step 13 and the v2 regression at step 14. All assertions in both steps passed.

## Implementation

The upstream defect remains in the pinned Store. Its `chooseActivePokemons` builds prompts by iterating `state.players`, while the player whose turn is next is identified by `1 - state.activePlayer`.

The v2 adapter in [`simulation/twinleaf/agent37-paper-ko-instance-scoped-hook-v2.cjs`](../../simulation/twinleaf/agent37-paper-ko-instance-scoped-hook-v2.cjs) is instance-scoped and does not edit the submodule.

For the qualifying event, it:

1. Intercepts the attack's native EndTurnEffect and delegates KO resolution to native `checkState`.
2. Observes native KnockOutEffect reductions and records the resulting Prize groups.
3. Waits until all Prize prompts have resolved, preserving their original order.
4. Temporarily arranges `state.players` as [next-turn player, current player] and sets `activePlayer` to index 1.
5. Allows native `chooseActivePokemons` to construct its prompt array in the paper-required order.
6. Restores the original player-array order and activePlayer before the first new-Active prompt is passed to the Store.
7. Lets the native promotion callbacks finish, then resumes the original EndTurnEffect.

The correction arms only when the current implementation sees exactly two active KnockOutEffects, no non-Active KO effects, two distinct single-Prize groups, more than one Prize remaining for each player, and a Benched Pokémon for each. Other cases retain native ordering. This is a conservative proof of the adapter technique, not a general simultaneous-KO implementation.

## Native regression and assertions

The regression in [`simulation/twinleaf/agent37-simultaneous-ko-promotion-v2-native.cjs`](../../simulation/twinleaf/agent37-simultaneous-ko-promotion-v2-native.cjs) compares baseline, v1 and v2 using the same Ferroseed NXD / Duskull VIV fixture from the [original diagnostic](agent37-simultaneous-ko-promotion-order-e21-20261107.md).

Both physical actor seats are exercised:

| Physical actor seat | Baseline | v1 E-21 hook | v2 adapter |
| --- | --- | --- | --- |
| 0 | Wrong first promoter | Wrong first promoter | Correct |
| 1 | Correct first promoter | Correct first promoter | Correct |

The passing assertions establish that:

- Both promotion prompts are ordered [opponent, owner] in v2.
- Prize prompt order remains identical to baseline.
- The original physical `state.players` order is restored before the first promotion prompt.
- The original `activePlayer` value is restored before native EndTurnEffect resumes.
- The turn transition still selects the opponent.
- Powerglass on the promoted Unown opens its AttachEnergyPrompt after both promotions and attaches the Basic Psychic Energy from discard.
- The v2 hook's Store method overrides are restored and a neighboring Store remains unchanged.

Negative controls pass:

- One Active KO: no simultaneous-promotion correction is armed.
- No KO: no simultaneous-promotion correction is armed.
- Last-Prize terminal outcome: E-21 is suppressed.
- Last-Pokémon terminal outcome: E-21 is suppressed.

## Limitations

The correction has only been demonstrated for the exact two-active, two-single-Prize-group event with no other KOs, a surviving Bench Pokémon for each player, and sufficient Prizes remaining. It has not been tested for:

- simultaneous KOs with Bench KOs;
- multiple or zero Prize groups;
- effects that prevent Prizes or alter Prize destinations;
- other prompt-producing KO effects;
- broad card coverage or full-game decision policies.

A subsequent [simultaneous last-Prize regression](agent37-simultaneous-last-prize-tie-order-20261107.md) exposed a separate native defect: `choosePrizeCards` awards the first state.players entry the game and leaves the other player's final Prize untouched, whereas rulebook §E requires a tie when both players take all Prizes simultaneously. The v2 promotion adapter intentionally does not correct this terminal Prize-resolution path.

The adapter is **opt-in and research-only**. Do not replace v1 or shared headless defaults with v2 until the broader preconditions and callback behavior are independently reviewed and extended. Agent41 and Agent50 have been asked to challenge the seat mapping and rule interpretation.

**Competitive games qualified: 0.** This result establishes a bounded simulator-order correction, not deck strength, matchup performance, or any progress toward a demonstrated 99.5% win rate.
