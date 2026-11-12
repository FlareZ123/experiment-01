# Budew Ranger is a proven native escape but not a shared owner-policy root

**Agent 6 | 12 November 2026 | policy-integration finding, not matchup evidence**

## Finding

The current Hood Shield Shadow Rider candidate contains **one Pokémon Ranger STS 104 and 18 Item copies**, plus Forest Seal Stone and Tapu Lele-GX as possible access routes. Fourteen of the 29 currently authenticated Aichi Top 32 lists contain Budew ASC 16. The three unavailable lists (23, 25 and 28) remain unknown.

The interaction is not an open rules question. The existing native Store regression `tests/agent30-ranger-budew-item-native.test.cjs` already verifies, in both physical seats, a real Budew Itchy Pollen attack, an actually rejected Item, a genuine Pokémon Ranger play, and a subsequent Fog Crystal search. Its negative controls establish that Vileplume AOR's Ability lock remains and Active Stoutland BCR prevents Ranger itself. The staged Forest Seal Stone route is separately covered by `simulation/twinleaf/ranger-stone-itemlock-action.cjs`. These are action-feasibility tests, not full-game results.

The shared actor-only root `simulation/twinleaf/agent34-actor-only-root-policy.cjs` currently exposes only the development option `rangerPaidGxResponse`, which is specifically for an already announced paid-GX effect. It has no corresponding Budew Item-lock response. Existing Ranger fixtures prove the action can work; they do not show that either player policy selects it.

## Concrete policy gap

The current `actorObservation` contains the acting player's Item-lock flag, Supporter quota/lock, own hand, and public board. It does not expose the source of the active player-level lock or the opponent's last attack attribution. The pinned Twinleaf state does retain that public event as `state.playerLastAttack[playerId] = { attack, sourceCard }`.

The offline serializer `simulation/twinleaf/2026-11/agent43-full-state-diagnostic.cjs` already captures `playerLastAttack` through `engineExtraFields`, and player-level effect fields such as `playLocksTurnsRemaining` through `extraStateFields`. The actual runner should preserve these fields in the private/offline pre/post trace; there is no need to duplicate them in the serializer.

A policy-facing feature, if enabled, should expose only a detached public summary (for example, opponent last attack name and source printing) and a derived eligibility bit. It must not pass the offline full-state object into either policy.

## Required fail-closed decision gate

A default-off, owner-only candidate root such as `rangerBudewItemLock` should require all of the following:

1. The acting player is currently Item-locked, with a positive remaining play-lock duration.
2. The opponent's publicly known last attack is Budew's **Itchy Pollen**.
3. The actor holds Pokémon Ranger STS, has not used a Supporter this turn, and is not prevented from playing Supporters.
4. At least one Item in the actor's hand would become immediately usable after Ranger.
5. Ranger would not erase another active attack effect on either player or any Pokémon. The pinned implementation of `Player.removeAttackEffectsFromPlayerAndPokemon()` clears **all** attack effects on both players and their Pokémon, not just the Item lock; a safe policy must account for that collateral cost.
6. A continuing Ability lock is not still present. Conservatively decline while Vileplume AOR is in play; Ranger does not remove its Ability. Also decline while Active Stoutland BCR prevents the Supporter Ranger itself.

Searching Ranger through Forest Seal Stone or Tapu Lele is a separate candidate line. The existing staged access fixtures can be reused, but they do not establish natural full-game policy timing.

## Handoff and acceptance

- **Agent41:** integrate the default-off root into the candidate-specific bilateral policy, then compare the candidate policy with and without it. Reuse the existing native Ranger regression as the interaction acceptance baseline; add a policy-selection test rather than repeating the same native card-interaction test.
- **Agent36 / Agent43:** preserve `playerLastAttack` and the attack-effect state in the actual offline full-state trace. Keep that trace separate from policy input.
- **Policy evaluation:** test both seats and the Vileplume/Stoutland negatives. Record the action, immediate Item payoff, Supporter opportunity cost, and any attack effects that would be erased. Do not infer a win from a successful Ranger line.

## Evidence boundary

This is a code-path audit and a synthesis of existing pinned-Store tests. No complete game, naturally occurring Ranger access frequency, matchup result, candidate improvement, or competitive qualification is established. The benchmark remains 29/32 authenticated lists, zero qualified competitive games, and no demonstrated 99.5% win rate.
