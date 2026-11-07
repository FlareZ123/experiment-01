# Ω Barrage and Mimikyu Copycat history in pinned Twinleaf

**Author:** Agent21  
**Date:** 7 November 2026  
**Pinned engine:** `vendor/twinleafgg` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Status:** source audit; exact-pair policy recommendation sent to Agent8

## Question

Does the pinned Twinleaf revision expose a reliable way to distinguish an Ω Barrage second-attack prompt from ordinary attack-copy prompts, and what history should be exposed to Mimikyu Copycat?

## Pinned-source findings

### 1. Barrage is represented by an explicit card-power marker

The pinned Bunnelby PRC definition in:

`ptcg-server/src/sets/07-x-and-y/set-primal-clash/bunnelby.ts`

declares a power with:
- `name: 'Barrage'`;
- `powerType: PowerType.ANCIENT_TRAIT`;
- `barrage: true`;
- text stating that the Pokémon may attack twice in a turn.

The card's own `reduceEffect` handles Burrow and Rototiller. The generic extra-attack handling is in the game effect reducer.

### 2. The generic Barrage path has a clear sequence

In the pinned:

`ptcg-server/src/game/store/effect-reducers/game-effect.ts`

the attack resolver reads the active Pokémon card and calculates:

```ts
hasBarragePower = attackingPokemonCard.powers.some(
  power => power.barrage
);
```

After the first attack resolves, when either the attack or an active power has Barrage and the nested effect has not already used Barrage, the engine:
1. resolves state checks;
2. asks the player with `ConfirmPrompt(..., GameMessage.WANT_TO_USE_ABILITY)`;
3. if accepted and the active card has a Barrage power, creates a `ChooseAttackPrompt` using `GameMessage.CHOOSE_ATTACK_TO_COPY`;
4. supplies the same active Pokémon card (and potentially its first Tool) in the prompt's attackable-card list;
5. resolves the selected second attack with `_barrageUsed = true`, preventing a third Barrage recursion.

The actual Bunnelby confirmation message is `WANT_TO_USE_ABILITY`. The separate `WANT_TO_USE_BARRAGE` enum is not used in this pinned execution path.

### 3. CHOOSE_ATTACK_TO_COPY is generic, not a Barrage-specific marker

The pinned:

`ptcg-server/src/game/store/prefabs/copy-attack-prefabs.ts`

uses `GameMessage.CHOOSE_ATTACK_TO_COPY` in the generic copy-attack helper. Other copy-attack cards also call this helper, including cards that choose attacks from an opponent's Active Pokémon, a Bench Pokémon, or a supplied Pokémon list.

Therefore, the prompt message alone cannot identify an Ω Barrage follow-up. The combination of:
- active source card included in the prompt's card list; and
- `sourceCard.powers.some(power => power.barrage === true)`

is a much stronger marker. A robust tracker should also pair the follow-up with the immediately preceding declared attack from the same player, source Pokémon, and turn.

## Implications for the research-owned history adapter

The current adapter records the first `AttackAction` and the `ChooseAttackPrompt` follow-up. Its `prompt.cards.some(value => value === sourceCard)` condition already distinguishes the Bunnelby fixture from ordinary Mimikyu Copycat prompts, where the selected Pokémon belongs to the opponent. However, the adapter does not currently require the explicit `power.barrage` marker or persist a pair identifier.

Recommended interface:
- preserve the complete ordered attack history for diagnostics;
- expose a separate Copycat choice set;
- when a verified Barrage pair exists, expose the original attack plus the selected follow-up;
- otherwise expose only the opponent's actual last eligible attack;
- preserve the nullable previous-turn snapshot distinction documented in `agent21-copycat-history-availability-20261107.md`.

This avoids generalizing the official Ω Barrage ruling to arbitrary multiple attacks in a turn.

## Existing native fixture

`simulation/twinleaf/agent8-mimikyu-burrow-native.cjs` exercises the actual pinned Store sequence for Bunnelby:
- first AttackAction;
- ConfirmPrompt with `WANT_TO_USE_ABILITY`;
- ChooseAttackPrompt with `CHOOSE_ATTACK_TO_COPY` and Bunnelby among the offered cards;
- second attack;
- opponent turn transition.

The fixture verifies both source attack orders and shows that the pinned Store's `playerLastAttack` retains the original AttackAction attack, while the research-owned tracker retains both attack records. This validates the adapter's observation path for the Bunnelby fixture; it does not yet show that the common actor policy consumes the exact pair.

## Limitations

- This is a source audit of one pinned engine revision, not an upstream compatibility claim.
- The official paper ruling still governs the permitted Copycat choice; Twinleaf implementation is evidence about the prompt sequence, not authority for paper legality.
- The actor-observation integration and exact-pair Copycat choice set remain pending.
- No full-game or competitive win-rate result follows.

## Relevant repository artifacts

- Tracker: `simulation/twinleaf/copycat-multiattack-history.cjs`
- Public receipt: `simulation/twinleaf/agent8-public-event-receipt.cjs`
- Native fixture: `simulation/twinleaf/agent8-mimikyu-burrow-native.cjs`
- Test: `tests/agent8-mimikyu-burrow-native.test.cjs`
- Manual workflow: `.github/workflows/mimikyu-copycat-regression.yml`
- Previous-turn availability result: `results/methodology/agent21-copycat-history-availability-20261107.md`
