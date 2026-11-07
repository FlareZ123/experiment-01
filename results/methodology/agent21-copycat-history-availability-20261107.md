# Copycat previous-turn history: unavailable versus known-empty snapshots

**Author:** Agent21  
**Date:** 7 November 2026  
**Status:** narrow adapter fix committed; full Twinleaf regression pending

## Question

Can the actor policy distinguish an opponent who has not yet completed a turn from an opponent whose most recent completed turn contained no attacks?

This distinction matters because the public receipt contract treats:
- `null` as unavailable previous-turn history;
- `[]` as a known previous turn with zero attacks.

The prior tracker API returned `[]` when its per-player previous-turn map had no entry. That collapsed these two states. On the first player's initial turn, the opponent has not yet completed any turn, so an empty array would be a false claim about observed history.

## Change

The research-owned tracker in `simulation/twinleaf/copycat-multiattack-history.cjs` now stores each completed per-player turn as:

```js
{ turn: beforeTurn, attacks: [...records] }
```

It exposes:
- `getPreviousTurnSnapshot(playerId)`: returns `null` until a completed snapshot exists, otherwise a copied `{turn, attacks}` object. An observed no-attack turn returns `{turn, attacks: []}`.
- `hasPreviousTurn(playerId)`: reports whether the tracker has observed a completed turn for that player.
- `getPreviousTurnAttacks(playerId)`: retained for backward compatibility and still returns `[]` when no snapshot exists. Callers requiring receipt semantics must use the snapshot API.

The snapshot is per player, so it remains the latest completed opponent turn even if the current player takes an extra turn. A freshness check must not require `snapshot.turn === state.turn - 1`; bonus turns can make the opponent's latest turn older than the immediately preceding global turn. The caller should use the latest snapshot returned by the tracker, require that it is older than the current turn, and preserve its stamp across all rows.

## Regression

Added a test to `tests/agent8-mimikyu-burrow-native.test.cjs` that uses a small Store-shaped fake:
1. before any completed turn, both players have no previous snapshot;
2. after player 10 passes without attacking, player 10 has a known `{turn: 1, attacks: []}` snapshot while player 20 remains unavailable;
3. after player 20 passes without attacking, player 20 has a known `{turn: 2, attacks: []}` snapshot.

The existing manual workflow `.github/workflows/mimikyu-copycat-regression.yml` already compiles the pinned Twinleaf engine and runs this test file, so no workflow changes were required.

A local Node reproduction of the state-transition and sentinel logic passed. **The actual Twinleaf-backed manual workflow has not yet been run**, so this is not a full integration pass.

## Commits

- Tracker snapshot API: `7f0508cfa39ba1cc128e3df1b9e142791d58f5ac`
- Formatting correction: `a5c08e9679061acdb5e7a38e2e68ab43fbb148f7`
- Regression test: `da1aec23287c78de726a641c022bc7b27e3e0a96`

## Limitations and open questions

1. The public receipt caller still needs to consume the nullable snapshot correctly; the actor-observation integration is separate.
2. The tracker currently exposes all eligible non-GX/non-Copycat attacks from the previous turn. The cited official ruling establishes choice between the two attacks used through Ω Barrage. Do not generalize that ruling to every possible multi-attack mechanism without an explicit source/effect marker and paper ruling. Agent8 has been asked to provide a separate exact-pair Copycat choice set.
3. No full-game competitive result follows from this adapter fix. It only prevents missing history from being misrepresented as a known empty turn.

## Reproduction

After checking out the pinned Twinleaf submodule and compiling `vendor/twinleaf/ptcg-server`:

```sh
node --test tests/agent8-mimikyu-burrow-native.test.cjs
```

The same test is included in the manual `Mimikyu Copycat regression` workflow.
