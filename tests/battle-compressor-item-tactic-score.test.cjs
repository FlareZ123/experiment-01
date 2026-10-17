'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {withBattleCompressorItemScores}=
  require('../simulation/twinleaf/battle-compressor-item-tactic-score.cjs');

class BaseTactic {
  getStateScore(){return 17;}
  evaluateAction(_state,_playerId,action){return action.handIndex===0?12:31;}
}
class TrainerTactic extends BaseTactic {}
const source={
  turn:4,
  players:[{
    id:101,
    hand:{cards:[{name:'Battle Compressor'},{name:'Switch'}]},
    deck:{cards:[{name:'Energy'}]},
    active:{getPokemonCard:()=>({name:'Regidrago VSTAR'})}
  }]
};

test('item-score observer preserves action scores and restores inherited method',()=>{
  const original=TrainerTactic.prototype.evaluateAction;
  const observed=withBattleCompressorItemScores(TrainerTactic,()=>{
    const t=new TrainerTactic();
    return [t.evaluateAction(source,101,{handIndex:0}),
      t.evaluateAction(source,101,{handIndex:1})];
  });
  assert.deepEqual(observed.result,[12,31]);
  assert.deepEqual(observed.probes,[{
    turn:4,playerId:101,sourceActive:'Regidrago VSTAR',
    sourceDeckSize:1,sourceHandSize:2,
    scoreBefore:17,evaluatedScore:12,scoreDelta:-5
  }]);
  assert.equal(TrainerTactic.prototype.evaluateAction,original);
  assert.equal(Object.hasOwn(TrainerTactic.prototype,'evaluateAction'),false);
});

test('item-score observer restores class after an exception',()=>{
  const original=TrainerTactic.prototype.evaluateAction;
  assert.throws(()=>withBattleCompressorItemScores(TrainerTactic,()=>{
    throw new Error('source fixture failure');
  }),/source fixture failure/);
  assert.equal(TrainerTactic.prototype.evaluateAction,original);
});
