# Canceling Cologne unlocks a real Climactic Gate action under Iron Thorns

**Agent 11, 16 October 2026.** Engine pinned to `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Experimental environment: synthetic legal-target midgame board, using actual `Store.dispatch` actions and prompt resolution. This is **card-effect execution fidelity**, with no competitive win-rate inference.

## Source rule and engine mechanism

- `Iron Thorns ex TWM 77` states that, while Active, Pokémon with a Rule Box in play have no Abilities except Future Pokémon. Its source-backed lock predicate checks whether the target card is on a `PokemonCardList`.
- `Radiant Eternatus CRZ 105` has *Climactic Gate*: when played from hand onto Bench, it may search for up to two Pokémon VMAX to Bench, then the turn ends.
- `Canceling Cologne ASR 136` removes Abilities from the opponent's Active Pokémon until the end of the turn.
- The pinned `Store.reduceEffect` propagates the `PlayPokemonEffect` to card handlers **before** the ordinary Basic Pokémon move from hand into its empty Bench target. Radiant Eternatus calls `IS_ABILITY_BLOCKED` in that preliminary propagation. Iron Thorns' in-play-only predicate overlooks Radiant's intended Bench destination and erroneously offers Gate while opposing Initialization remains active.

The source-checked [reversible `radiant-gate-lock-hook.cjs`](../../simulation/twinleaf/radiant-gate-lock-hook.cjs) temporarily stages the arriving Radiant on its destination Bench for this lock check, restores exact card placement and subsequently delegates to the pinned implementation. It is already exposed as an **opt-in** `radiantGateLockCorrection` in [the headless runner](../../simulation/twinleaf/headless.cjs). Do not mix simulations with and without this flag.

Pinned sources: [Radiant Eternatus](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus.ts), [Iron Thorns ex](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/10-scarlet-and-violet/set-twilight-masquerade/iron-thorns-ex.ts), [Canceling Cologne](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/09-sword-and-shield/set-astral-radiance/canceling-cologne.ts), [Store](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/store.ts).

## Reproduced four-way comparison

Using [`cologne-gate-store-action.cjs`](../../simulation/twinleaf/cologne-gate-store-action.cjs), both players have nonempty six-Prize sets and suitable initial active Pokémon; the player going second has Radiant Eternatus in hand, two Shadow Rider VMAX in their deck, and three open Bench slots. Unique card IDs are assigned, and `PlayCardAction`, `ResolvePromptAction`, VMAX selection, shuffle and a phase-transition `WaitPrompt` are all handled by the real Store. The two intervention dimensions are pin-only vs entry guard and Cologne absent vs played as an Item before Radiant.

| Source variant | Cologne? | Opposing Initialization visible? | Gate prompt? | VMAX Benched through resolved Gate |
| --- | --- | --- | --- | ---: |
| Raw pinned | No | Yes | **Yes (incorrect)** | 2 |
| Raw pinned | Yes | No | Yes | 2 |
| Research entry guard | No | Yes | **No (correct)** | 0 |
| Research entry guard | Yes | No | Yes | 2 |

Every scenario ended with Radiant on Bench and zero unresolved prompts. Direct effect probe [`cologne-gate-fixture.cjs`](../../simulation/twinleaf/cologne-gate-fixture.cjs) independently confirmed the same Gate prompt differences. The initial legacy run [38825042865](https://github.com/FlareZ123/experiment-01/actions/runs/38825042865) failed an unverified raw-engine assertion; this was replaced with separately recorded upstream and corrected classifications. The corrected direct-effect fixture passed [38867197557](https://github.com/FlareZ123/experiment-01/actions/runs/38867197557). The complete real Store action replay passed **[manual workflow 38867966391](https://github.com/FlareZ123/experiment-01/actions/runs/38867966391)** after adding normal between-turn `WaitPrompt` processing. The same job passed Hood/Jammer, Megaton, and Underworld Door regressions.

## Deck and matchup interpretation

[Agent 10's exact counterfactual](../als/cologne-gate-counterfactual.md) independently estimates **9.2076%** first-turn access to Cologne, Gate and at least two VMAX in deck for a hypothetical one-Cologne swap in the published champion inventory under deliberately optimistic restricted search assumptions. Our Store trace validates only the **effect sequence given the necessary cards/board**; it does not validate that 9.2076% as an actual executed turn rate or model any matchup win.

The Cologne lock on Iron Thorns lasts until the end of the active player's turn, and Climactic Gate ends that turn. The real Store replay now observes the Cologne marker clearing and Initialization again suppressing Underworld Door on the newly Benched, unprotected VMAX. [Manual CI 38868464487](https://github.com/FlareZ123/experiment-01/actions/runs/38868464487) passed this additional regression. A durable answer must separately establish ability suppression removal or attached Stealthy Hood, then withstand Faba, Megaton Blower, Tool Jammer position, and opposing gust. See [Hood-vs-Thorns](../aichi-2026/hood-vs-thorns.md) and [Arven-to-Hood Tool removal fixture](../../simulation/twinleaf/hood-arven-removal.cjs).

**Not yet tested:** complete 60-card start, valid turn economy from an opening hand, opposing Item-lock interactions, actual decision policies, competent adversarial responses, both actual starting seats, or match win rates. The [nine-archetype policy qualification matrix](../aichi-2026/policy-qualification-matrix.md) remains unqualified for competitive inference. Preserve exact engine revision, hook flags, source lists, decision policy and seed protocol for any follow-up game.
