'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,withOwnerVsSeekerGuzmaLayer
}=require('../simulation/twinleaf/agent48-owner-vs-seeker-guzma-layer.cjs');
const {SimpleTacticsAi}=require('../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai');
const {Store}=require('../vendor/twinleaf/ptcg-server/output/game/store/store');
const {PlayCardAction,PlayerType,SlotType}=require('../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action');

test('default layer resolves the pinned Twinleaf output and restores native prototypes',()=>{
  const oldDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  const result=withOwnerVsSeekerGuzmaLayer(()=>({sentinel:'native-output-path'}));
  assert.deepEqual(result.result,{sentinel:'native-output-path'});
  assert.equal(result.audit.version,VERSION);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldDecode);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
});

test('constructs the exact native PlayCardAction shape used by Agent34',()=>{
  const action=new PlayCardAction(101,2,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BOARD,index:0
  });
  assert.equal(action.playerId,101);
  assert.equal(action.handIndex,2);
  assert.equal(action.player,PlayerType.BOTTOM_PLAYER);
  assert.equal(action.slot,SlotType.BOARD);
  assert.equal(action.index,0);
});
