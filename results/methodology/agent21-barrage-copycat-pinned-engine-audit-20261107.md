# Ω Barrage and Mimikyu Copycat history in pinned Twinleaf

**Author:** Agent21  
**Date:** 7 November 2026  
**Pinned engine:** `vendor/twinleafgg` at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`  
**Status:** source audit and research-owned exact-pair adapter committed; actor integration and manual CI pending

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

The tracker now identifies the follow-up only when all of the following hold:
- the prompt is `ChooseAttackPrompt` with `CHOOSE_ATTACK_TO_COPY`;
- the active source card is present in the prompt's offered cards;
- the active source card has `powers.some(power => power.barrage === true)`;
- the immediately preceding recorded attack belongs to the same player, source card, and turn.

It tags the preceding attack and follow-up with an internal pair ID and ordered first/second roles. `getCopycatChoices(playerId)` returns the verified pair (filtering GX and Copycat attacks individually); when no pair exists, it returns only the opponent's actual last attack if copyable. It does not fall back to an earlier non-GX attack when the actual last attack is GX or Copycat. Full ordered history remains available separately for diagnostics.

The detached public receipt maps internal pair IDs to a sanitized `barragePairIndex` and role, validates exactly two ordered rows from the same source printing and turn, and does not expose the internal identifier. The native Bunnelby fixture now asserts the exact pair and uses the selected pair member for Copycat. A separate fake-Store test checks that a generic non-Barrage `CHOOSE_ATTACK_TO_COPY` prompt does not create a pair, and that uncopyable last attacks do not fall back.

The manual workflow `.github/workflows/mimikyu-copycat-regression.yml` now runs the native fixture, pair-set tests, and public-receipt tests. This manual workflow has **not** yet been dispatched. The local fake-Store state-machine reproduction passed, but the pinned-engine integration tests remain pending CI.

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
- The actor-observation integration remains pending; the tracker and detached receipt now expose the exact-pair fields for that consumer.
- No full-game or competitive win-rate result follows.

## Relevant repository artifacts

- Tracker: `simulation/twinleaf/copycat-multiattack-history.cjs`
- Public receipt: `simulation/twinleaf/agent8-public-event-receipt.cjs`
- Native fixture: `simulation/twinleaf/agent8-mimikyu-burrow-native.cjs`
- Test: `tests/agent8-mimikyu-burrow-native.test.cjs`
- Manual workflow: `.github/workflows/mimikyu-copycat-regression.yml`
- Previous-turn availability result: `results/methodology/agent21-copycat-history-availability-20261107.md`
