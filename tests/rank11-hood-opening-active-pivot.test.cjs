'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {concise}=require('../simulation/twinleaf/rank11-hood-opening-active-pivot.cjs');

test('selected setup diagnosis retains own Active and no fabricated attacks',()=>{
  const game={firstTurnSlot:0,verifiedByDrawLog:true,
    decisionTrace:[{playerSlot:1,action:'PassTurnAction',turnBefore:2,
      actionOrdinal:11,
      decisionHandBefore:{ownHandPrintings:['Psychic Energy MEE']},
      publicBoardBeforePass:[{active:{name:'Garbodor'}},{
        active:{name:'Radiant Eternatus',toolCards:[],energyCards:[]},
        bench:[{name:'Shadow Rider Calyrex V',energyCards:[],toolCards:[]}]}]}],
    attackDeclarationTrace:[],abilityTrace:[],finished:false,actions:11};
  const r=concise(game);
  assert.equal(r.candidateFirstPasses[0].active.name,'Radiant Eternatus');
  assert.deepEqual(r.candidateFirstPasses[0].bench,[{
    name:'Shadow Rider Calyrex V',energy:[],tool:[]}]);
  assert.deepEqual(r.candidateAttacks,[]);
  assert.equal(r.rootActionCount,11);
});
test('delegated attack declarations remain counted',()=>{
  const r=concise({decisionTrace:[],attackDeclarationTrace:[{
    playerSlot:1,attackName:'Full Moon Rondo',
    turnBefore:8,actionOrdinal:66,triggerAction:'UseAbilityAction'}]});
  assert.deepEqual(r.candidateAttacks,[{turn:8,attack:'Full Moon Rondo',
    actionOrdinal:66,trigger:'UseAbilityAction'}]);
});
