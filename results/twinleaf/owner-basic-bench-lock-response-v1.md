# Historical locked-Stadium alternative: owner-hand Basic Bench reply (experimental v1)

**Agent 8, 19 October 2026. Evidence level: pinned source review + 17 deterministic current-source pure tests + prospective-to-this-code historical Store replay queued. No competitive inference.**

## Source interaction and proposed correction

In the real pinned 2026 Aichi rank-6 Iron Thorns versus rank-1 Shadow Rider source arm, seed `2394734225`, the original generic player selected **Thunder Mountain Prism Star** on global turn 3 immediately after actual opponent **Shadow Mist**. The Store correctly rejected that Stadium play. The original owner's recorded exact hand also contained **Iron Thorns ex TWM** as a Basic, with the Active Iron Thorns already in play. See [original root-33 evidence](../aichi-2026/agent6-rank6-shadow-mist-rejected-stadium.md).

Merely changing the vetoed root to Pass can silently remove a legal board-development opportunity. An explicitly **optional** fallback proposes playing one real owner-hand Basic to the first vacant Bench position. It is symmetric when enabled: it applies to whichever player is actually taking the turn, independent of champion/source identity. Its value as a game tactic is unknown: benching a Pokémon can expose a Prize target or consume a needed slot.

The implementation reads only the current player's actual hand and Bench, and the public player-level lock flags. It:
1. Requires that the original actual-owner `PlayCardAction` is already forbidden by the pinned live player-level hand-play veto.
2. Requires `cannotPlayPokemonCards === false` and an empty slot in the owner's existing Bench.
3. Chooses the first Basic by `SuperType.POKEMON` and `Stage.BASIC`; if `cannotPlayPokemonWithAbilities` is active, it skips cards with any `PowerType.ABILITY`.
4. Returns a real `PlayCardAction` targeting `PlayerType.BOTTOM_PLAYER`, `SlotType.BENCH`, the empty index, while leaving the owner's hand and Bench unchanged until Store dispatch.

The helper [visible-lock-basic-bench-response.cjs](../../simulation/twinleaf/visible-lock-basic-bench-response.cjs) uses the current [pinned Twinleaf enums](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/card/card-types.ts) and the exact [PlayCardAction target semantics](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/store/actions/play-card-action.ts). The latter's `BOTTOM_PLAYER` is *relative to the acting player*, irrespective of fixed physical seat.

[Headless](../../simulation/twinleaf/headless.cjs) must receive **both** `enforceVisiblePlayLockBothSeats:true` and `visiblePlayLockBasicBenchFallback:true`. The second input is false by default and fails closed without the symmetric owner guard. Its distinct game-policy provenance is `+LiveLockBasicBenchAlternative-experimental-v1@both`. The original one-seat held-Supporter response and both-seat simple veto retain their existing behavior when this flag is absent.

## Verification state

The new [five deterministic owner-hand and Bench unit cases](../../tests/visible-lock-basic-bench-response.test.cjs) cover the historical locked Stadium → Iron Thorns hand proposal, full Bench and wrong actor, Pokémon play prohibition, ability-bearing Basic skip, and unchanged original when no lock applies. In addition, the earlier [twelve veto tests](../../tests/player-play-lock-veto.test.cjs) cover each Trainer/Energy lock.

Both sets, **17/17 tests**, were executed against the exact current committed CommonJS module contents in an isolated V8 JavaScript harness with `node:test` and `node:assert/strict` reduced to equivalent synchronous assertion functions. All passed. This is a pure behavioral sanity check, **not an actual Node integration run, pinned engine compilation, or Store validation**.

A separate [one-arm source-frozen replay](../../simulation/evaluation/agent8-player-play-lock-basic-reply-replay.cjs) preserves the historical seed, champion and opponent 60s, original rank-6 scripted wrapper and action limits, while enabling the Basic Bench fallback for both actors. The new manually dispatched [CI run 39285468147](https://github.com/FlareZ123/experiment-01/actions/runs/39285468147) compiles pinned Twinleaf, executes both test suites and produces an archived source-deal output (initial state **queued**). Do not claim the proposed Basic reply was accepted until that actual Store run confirms `observedPriorKnownBlockedRoot.alternative` and a corresponding source Basic `PlayCardAction` in its ledger. Any failure must be kept visible.

The older guard-only [CI 39282855122](https://github.com/FlareZ123/experiment-01/actions/runs/39282855122) is a separate historical source test under v2 without this opt-in fallback.

## Exclusions

This is a **new decision policy**, so the fixed historical source arm is intentionally diagnostic and cannot retroactively qualify any outcome or win. A Basic Bench fallback is just one optional action, not necessarily a best play. It does not solve Supporter contention, Energy affordability, all card-specific locks, tactical attack decisions or errors after the corrected root. Additional actual source behavior may fail later. Full-field deck strength remains untested (**29/32** exact original opposing 60s, **0** competitive games).
