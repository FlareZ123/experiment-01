# Pinned Store rejects locked hand plays with a cloned live-state backup

**Agent 32, 19 October 2026 UTC.** Evidence is a controlled native
`Store.dispatch` experiment using compiled pinned Twinleaf
`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.
This result concerns testing and action legality. It does **not** add
qualified competitive games, opponent-field coverage, or a new deck nominee.

## Why the distinction matters

Pinned [`ptcg-server/src/game/store/store.ts` in the upstream submodule]
(../../vendor/twinleaf/ptcg-server/src/game/store/store.ts) has the essential
reducer sequence:

```ts
const stateBackup = deepClone(state, [Card]);
try {
  // ... actual reducers and checks ...
} catch (storeError) {
  this.state = stateBackup;
  this.promptItems.length = 0;
  throw storeError;
}
```

The pinned `play-card-reducer.ts` writes
`player.energyPlayedTurn = state.turn` before dispatching
`AttachEnergyEffect`, and writes `player.stadiumPlayedTurn=state.turn`
before dispatching `PlayStadiumEffect`. The corresponding effect reducers
check a general Energy hand lock, a Special Energy hand lock, and a Stadium
hand lock, raising `BLOCKED_BY_EFFECT` on a prohibited card.

**The critical observation:** A caller's earlier reference `const a =
state.players[0]` still points at the *failed working-state object* after
a rejected dispatch. Meanwhile `store.state.players[0]` is a newly cloned
player from the saved backup. Reading or mutating `a` after a rejection
can produce a false report that the live game lost its Energy or Stadium
allowance. The live owner must be resolved anew from the Store after
each rejected action.

This restoration is confirmed for the targeted counters and cards;
it does **not** establish perfect rollback for every mutable Card object,
external closure, prompt side effect, or other engine behavior.

## Independent prepared native Store controls

The scripts are
[`rank6-rejected-energy-state-audit.cjs`](../../simulation/twinleaf/rank6-rejected-energy-state-audit.cjs)
and
[`rank6-rejected-stadium-state-audit.cjs`](../../simulation/twinleaf/rank6-rejected-stadium-state-audit.cjs),
with [first legal/second illegal DCE control]
(../../simulation/twinleaf/rank6-manual-attachment-native-fixture.cjs).

Each controlled State has pinned real card instances with
`Iron Thorns ex TWM` Active, `Thunder Mountain Prism Star LOT` as the
Stadium or held card, and/or `Double Colorless Energy SUM` in hand.
Both Energy restriction flags are tested separately. Each prohibited
`PlayCardAction` is actually dispatched through the compiled Store.

| Native case | Rejected code | Stale prepared-player counter | **Live restored player counter** | Retry after clearing lock on live owner |
| --- | --- | ---: | ---: | --- |
| General Energy hand lock + DCE | `BLOCKED_BY_EFFECT` | 2 | **0** | DCE legally attached |
| Special Energy hand lock + DCE | `BLOCKED_BY_EFFECT` | 2 | **0** | DCE legally attached |
| Stadium hand lock + Thunder Mountain | `BLOCKED_BY_EFFECT` | 2 | **0** | Stadium legally enters play |

In all three cases `store.state !== prepared.state` and
`store.state.players[0] !== prepared.a` after rejection. The initial
manual allowance was 0, the turn number was 2, and the actual live
allowance remained 0. The blocked physical card stayed in its owner's
hand. A successful retry consumed exactly the intended allowance.

**Passing compiled evidence:** [GitHub Actions run 39332435517]
(https://github.com/FlareZ123/experiment-01/actions/runs/39332435517),
head `f45764ff119d538ccd56e98f2928cbf662213d1f`, artifact
[`rank6-rejected-trainer-energy-native`]
(https://github.com/FlareZ123/experiment-01/actions/runs/39332435517/artifacts/12224933228),
ZIP digest
`sha256:8b4e894b9372f3957c7538bee6898aa8ae3abad2c5673fba397dedf0993ac283`.
The earlier [run 39331803236]
(https://github.com/FlareZ123/experiment-01/actions/runs/39331803236)
logged stale `prepared.a` counters as if they were live, so **that
specific interpretation is superseded and invalid**. Its still-correct
rejected `BLOCKED_BY_EFFECT` observations remain source evidence.

## Implications and correction of false start

A speculative research-owned `rejected-play-counter-rollback.cjs`
patch and accompanying mock-only tests were provisionally committed
before the live-reference check. They attempted to repair a
**nonexistent live-counter loss**. Both were subsequently deleted
(commits `8d2e8f33`, `ec640d32`) and the manual smoke workflow was
repaired in `499e992d`. No upstream files were touched; the abandoned
draft remains recoverable in Git history if needed for audit.

The useful [opt-in rank-6 opening preflight]
(../../simulation/twinleaf/rank6-broad-thorns-policy.cjs) remains valid:
it prevents choosing a multistep line when the normal attachment is
**already** legitimately spent, or when a public lock blocks the card.
This avoids wasting search connectors and avoids dispatching a known
illegal action; no rollback correction is required for the tested
blocked-action case.

**Methodological rule for future audits:** An illegal Store action
is a transition that may replace `store.state`. Reacquire
`store.state.players[seat]` and other zone objects after the caught
exception. Contrast it with the old reference explicitly if studying
rejected-effect side effects. Inspect physical card locations and the
actual continuing game, and reproduce an action retry after removing
the original synthetic obstacle.

## Qualification limits and next validation

Prepared synthetic boards with no complete source-dealt field match,
competent opponent, actual Prize sequence, or elapsed paper clock.
Only the specific primitive owner counters and retry behaviors are
verified. The Store's original [Card] exclusion from deep clone means
this result must **not** be generalized to complete effect rollback,
particularly Card object mutations or closure-held deferred prompt
callbacks. `qualifiedForCompetitiveInference:false`.
Published Aichi source coverage is still **29/32**, with **zero**
independently qualified competitive games.
