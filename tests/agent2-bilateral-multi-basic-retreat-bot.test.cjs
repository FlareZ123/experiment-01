'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withBilateralMultiBasicPaidRetreat}=require(
  '../simulation/twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs');

class PassTurnAction{constructor(clientId){this.clientId=clientId;}}
class RetreatAction{
  constructor(clientId,benchIndex){
    this.clientId=clientId;this.benchIndex=benchIndex;
  }
}
class SimpleTacticsAi{
  decodeNextAction(state){
    return new PassTurnAction(state.players[state.activePlayer].id);
  }
}
const catalog={};
const allIntent={kind:'paid-retreat',benchIndex:2,retreatCostUnits:3};
const view=()=>({decisionKind:'owner-root',globalTurn:33,
  ownPublic:{active:{printing:'Public Active'},deckCount:12},
  opponentPublic:{active:{printing:'Public Opponent'},deckCount:30}});

/** @param {()=>any} work @param {()=>any|null} choose */
function run(work,choose=()=>allIntent){
  return withBilateralMultiBasicPaidRetreat(work,{
    SimpleTacticsAi,RetreatAction,catalog,observe:view,choose});
}

test('both physical seats choose identical owner-only typed retreat',()=>{
  const state={turn:33,activePlayer:0,players:[
    {id:'zero',hand:{cards:['secret0']}},
    {id:'one',hand:{cards:['secret1']}}],prompts:[]};
  const ai=new SimpleTacticsAi(),actions=[];
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const r=run(()=>{
    for(const seat of [0,1]){
      state.activePlayer=seat;
      actions.push(ai.decodeNextAction(state));
    }
  });
  assert.deepEqual(r.audit.chosenTypedRetreatsBySeat,[1,1]);
  assert.deepEqual(r.audit.originalPassesBySeat,[1,1]);
  assert.deepEqual(actions.map(a=>a.constructor.name),
    ['RetreatAction','RetreatAction']);
  assert.deepEqual(actions.map(a=>a.clientId),['zero','one']);
  assert.deepEqual(actions.map(a=>a.benchIndex),[2,2]);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,original);
});

test('no owner nominal offer keeps Pass and internal actions untouched',()=>{
  const state={turn:33,activePlayer:0,players:[{id:'zero'},
    {id:'one'}],prompts:[]},ai=new SimpleTacticsAi();
  const r=run(()=>ai.decodeNextAction(state),()=>null);
  assert.equal(r.result.constructor.name,'PassTurnAction');
  assert.deepEqual(r.audit.chosenTypedRetreatsBySeat,[0,0]);
});

test('different concealed opponent hand does not affect selected action',()=>{
  function one(hidden){
    const state={turn:33,activePlayer:0,players:[
      {id:'zero'},{id:'one',hiddenHand:hidden}],prompts:[]};
    return run(()=>new SimpleTacticsAi().decodeNextAction(state)).result;
  }
  const a=one('hidden alpha'),b=one('hidden beta');
  assert.equal(a.constructor.name,b.constructor.name);
  assert.equal(a.clientId,b.clientId);
  assert.equal(a.benchIndex,b.benchIndex);
});

test('first-turn Pass is observable only with diagnostic opt-in and remains Pass',()=>{
  const state={turn:1,activePlayer:0,players:[{id:'zero'},
    {id:'one'}],prompts:[]};
  const observed=[];
  const result=withBilateralMultiBasicPaidRetreat(
    ()=>new SimpleTacticsAi().decodeNextAction(state),{
      SimpleTacticsAi,RetreatAction,catalog,
      observe:state=>({globalTurn:state.turn}),
      observeFirstTurnPassOnly:true,
      choose:v=>{observed.push(v.globalTurn);return allIntent;}
    });
  assert.equal(result.result.constructor.name,'PassTurnAction');
  assert.deepEqual(observed,[1]);
  assert.deepEqual(result.audit.originalPassesBySeat,[1,0]);
  assert.deepEqual(result.audit.chosenTypedRetreatsBySeat,[0,0]);
});
