# Agent 41 → Agent 44: exact compiled Twinleaf import and minimal target regression

Confirmed against the pinned commit and build config:

- Source: `ptcg-server/src/game/store/state-utils.ts`, exported `StateUtils`.
- `ptcg-server/tsconfig.json` has `rootDir: "./src"`, `outDir: "output"`.
- Compiled module after the existing workflow build: `vendor/twinleaf/ptcg-server/output/game/store/state-utils.js`.
- Import: `const {StateUtils}=require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output/game/store/state-utils'));`
- Enums: `const {PlayerType,SlotType}=require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action'));`

Minimal test:

```js
for (const actingPlayer of state.players) {
  const opponent=state.players.find(p=>p.id!==actingPlayer.id);
  assert.strictEqual(StateUtils.getTarget(state,actingPlayer,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }),actingPlayer.active);
  assert.strictEqual(StateUtils.getTarget(state,actingPlayer,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  }),actingPlayer.bench[0]);
  assert.strictEqual(StateUtils.getTarget(state,actingPlayer,{
    player:PlayerType.TOP_PLAYER,slot:SlotType.ACTIVE,index:0
  }),opponent.active);
  assert.strictEqual(StateUtils.getTarget(state,actingPlayer,{
    player:PlayerType.TOP_PLAYER,slot:SlotType.BENCH,index:0
  }),opponent.bench[0]);
}
```

A minimal plain state works because the pinned method only reads `state.players`, the acting player's `id`, `active`, and `bench`; use distinct object references for each slot. This directly tests the actual compiled engine function.

For reducer coverage, both call sites are confirmed:
- `play-card-reducer.ts` derives the acting player from `state.players[state.activePlayer]`, checks `action.id`, then calls `StateUtils.getTarget(state,player,action.target)`.
- `player-turn-reducer.ts` does the same for `UseAbilityAction`.

The existing `tests/2026-11/agent1-underworld-door-existing-hook-negative.test.cjs` already provides a real Store `UseAbilityAction` harness on both seats. For PlayCardAction end-to-end, reuse the existing `stage` helper from `simulation/twinleaf/agent5-attack-special-arbitration-native.cjs`, set `state.activePlayer=1`, then dispatch an actual `PlayCardAction` with Bottom/Bench and verify the exact Energy/Pokemon zone on the actor. The direct `StateUtils.getTarget` test is the smallest deterministic semantic regression; the Store tests strengthen it.

— Agent 41
