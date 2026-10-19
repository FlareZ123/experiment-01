'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createSetupCompensationObserver}=
  require('../simulation/evaluation/setup-compensation-observer.cjs');

const GamePhase={SETUP:0,DRAW:1,PLAYER_TURN:2};
const GameMessage={WANT_TO_DRAW_CARDS:'want-bonus'};
class ShuffleDeckPrompt {
  constructor(id){this.id=id;}
  getPerspectivePlayerId(){return this.id;}
}
class SelectPrompt {
  constructor(playerId,values=['Draw 0 card(s)','Draw 1 card(s)']) {
    this.playerId=playerId;
    this.message=GameMessage.WANT_TO_DRAW_CARDS;
    this.values=values;
  }
}
function fixture(){
  return {
    phase:GamePhase.SETUP,turn:0,activePlayer:0,
    rules:{firstTurnDrawCard:true},
    players:[
      {id:101,hand:{cards:Array(7).fill({fullName:'Shadow Rider V'})}},
      {id:202,hand:{cards:Array(7).fill({fullName:'Iron Thorns ex'})}}
    ]
  };
}
function make(){return createSetupCompensationObserver({
  GamePhase,ShuffleDeckPrompt,SelectPrompt,GameMessage
});}
function dispatch(observer,state,pending,action,mutate=()=>{}) {
  observer.before(state,pending,action);
  mutate();
  observer.after(state);
}
function initialShuffles(observer,state){
  dispatch(observer,state,new ShuffleDeckPrompt(101),{result:[]});
  dispatch(observer,state,new ShuffleDeckPrompt(202),{result:[]});
}
function end(observer,state,seat=0){
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  observer.before(state,null,{name:'first real action'});
  return observer.result();
}
test('captures a single candidate mulligan and source compensation actually drawn',()=>{
  const observer=make(),state=fixture();
  initialShuffles(observer,state);
  dispatch(observer,state,new ShuffleDeckPrompt(101),{result:[]});
  dispatch(observer,state,new SelectPrompt(202),{result:1},()=>{
    state.players[1].hand.cards.push({fullName:'unknown source bonus card'});
    state.players[1].hand.cards.push({fullName:'ordinary start draw'});
    state.turn=1;
    state.activePlayer=1;
  });
  const result=end(observer,state,1);
  assert.deepEqual(result.mulligans,[1,0]);
  assert.deepEqual(result.bonusOffered,[0,1]);
  assert.deepEqual(result.bonusPromptCount,[0,1]);
  assert.deepEqual(result.bonusSelected,[0,1]);
  assert.deepEqual(result.bonusDrawn,[0,1]);
  assert.equal(result.firstTurnSeat,1);
  assert.equal(result.setupActionsObserved,4);
  assert.ok(!JSON.stringify(result).includes('unknown source bonus card'));
  assert.ok(Object.isFrozen(result.mulligans));
  assert.ok(Object.isFrozen(result));
  // A later game turn cannot mutate the original immutable summary.
  state.turn=7;
  observer.before(state,null,{name:'later'});
  assert.equal(observer.result(),result);
});

test('declining optional bonus records legitimate differing allowance without draw',()=>{
  const observer=make(),state=fixture();
  initialShuffles(observer,state);
  dispatch(observer,state,new ShuffleDeckPrompt(101),{result:[]});
  dispatch(observer,state,new SelectPrompt(202),{result:0});
  const result=end(observer,state);
  assert.deepEqual(result.bonusOffered,[0,1]);
  assert.deepEqual(result.bonusSelected,[0,0]);
  assert.deepEqual(result.bonusDrawn,[0,0]);
  assert.deepEqual(result.mulligans,[1,0]);
});

test('two ordinary legal seven-card hands create no mulligan bonus offer',()=>{
  const observer=make(),state=fixture();
  initialShuffles(observer,state);
  const result=end(observer,state);
  assert.deepEqual(result.mulligans,[0,0]);
  assert.deepEqual(result.bonusOffered,[0,0]);
  assert.deepEqual(result.bonusPromptCount,[0,0]);
  assert.equal(result.setupActionsObserved,2);
});

test('observer rejects unexplained bonus hand changes before a player action',()=>{
  const observer=make(),state=fixture();
  initialShuffles(observer,state);
  dispatch(observer,state,new ShuffleDeckPrompt(101),{result:[]});
  assert.throws(()=>dispatch(observer,state,new SelectPrompt(202),{result:1}),
    /compensation draw does not equal selected number/);
});

test('source/candidate naming does not affect count symmetry',()=>{
  const observer=make(),state=fixture();
  initialShuffles(observer,state);
  dispatch(observer,state,new ShuffleDeckPrompt(202),{result:[]});
  dispatch(observer,state,new SelectPrompt(101),{result:1},()=>{
    state.players[0].hand.cards.push({fullName:'unrevealed'});
  });
  const result=end(observer,state);
  assert.deepEqual(result.mulligans,[0,1]);
  assert.deepEqual(result.bonusOffered,[1,0]);
  assert.deepEqual(result.bonusSelected,[1,0]);
});

test('missing original shuffle and fabricated duplicate bonus reject on finish',()=>{
  const observer=make(),state=fixture();
  dispatch(observer,state,new ShuffleDeckPrompt(101),{result:[]});
  assert.throws(()=>end(observer,state),/Initial setup shuffle missing/);
  const other=make(),s=fixture();
  initialShuffles(other,s);
  dispatch(other,s,new ShuffleDeckPrompt(101),{result:[]});
  const offer=new SelectPrompt(202);
  dispatch(other,s,offer,{result:0});
  dispatch(other,s,offer,{result:0});
  assert.throws(()=>end(other,s),/Unexpected multiple mulligan/);
});

test('rejects malformed bonus options and missing underlying action lifecycle',()=>{
  const observer=make(),state=fixture();
  initialShuffles(observer,state);
  dispatch(observer,state,new ShuffleDeckPrompt(101),{result:[]});
  assert.throws(()=>observer.before(state,
    new SelectPrompt(202,['unexpected']),{result:0}),
    /Unexpected setup bonus option/);
  const other=make(),s=fixture();
  other.before(s,new ShuffleDeckPrompt(101),{result:[]});
  assert.throws(()=>other.before(s,new ShuffleDeckPrompt(202),{result:[]}),
    /Previous setup action/);
});
