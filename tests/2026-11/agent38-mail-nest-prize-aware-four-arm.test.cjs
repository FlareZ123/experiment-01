'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,REG,nestContinuation,changedSelections} =
  require('../../simulation/evaluation/agent38-mail-nest-prize-aware-four-arm.cjs');
const {firstDivergence} =
  require('../../simulation/evaluation/agent38-v8-owner-mail-pass-four-arm.cjs');

test('frozen native 4-arm treatment isolates prize-aware chooser',()=>{
  assert.equal(VERSION,REG.schema);
  assert.equal(REG.status,'FROZEN_BEFORE_EXECUTION');
  assert.equal(REG.originalTrials.length,4);
  assert.deepEqual(new Set(REG.seeds),new Set([2404595552,948758444]));
  assert.equal(REG.nativeRootCap,260);
  assert.deepEqual(Object.keys(REG.control),Object.keys(REG.treatment));
  for(const key of Object.keys(REG.control)){
    if(key==='preferSinglePrizeNestBasic')continue;
    assert.deepEqual(REG.control[key],REG.treatment[key]);
  }
  assert.equal(REG.control.preferSinglePrizeNestBasic,false);
  assert.equal(REG.treatment.preferSinglePrizeNestBasic,true);
});

test('compares exact-turn physical Basic substitutions with printed prize hints',()=>{
  const a=[
    {seat:0,turnBefore:2,selectedPokemonPrinting:'Articuno-GX CES'},
    {seat:0,turnBefore:27,selectedPokemonPrinting:'Galarian Stunfisk SSH'}
  ];
  const b=[
    {...a[0],selectedPokemonPrinting:'Bunnelby PRC'},
    {...a[1]}
  ];
  const changed=changedSelections(a,b);
  assert.equal(changed.length,1);
  assert.equal(changed[0].oldLikelyMultiPrize,true);
  assert.equal(changed[0].newLikelyMultiPrize,false);
  assert.deepEqual(changedSelections(a,a),[]);
  assert.deepEqual(changedSelections(a,[{...b[0],turnBefore:3}]),[]);
});

test('post-Nest continuation needs a genuine later opponent and own action',()=>{
  const event={seat:0,turnBefore:2,
    selectedPokemonPrinting:'Bunnelby PRC'};
  const tape=[
    {ordinal:10,seat:0,turn:2,action:'PlayCardAction',
      ownerMailAfterPassAction:true,
      previouslyMailSelectedTrainerPlayed:false},
    {ordinal:14,seat:0,turn:2,action:'PlayCardAction',
      ownerMailAfterPassAction:false,
      previouslyMailSelectedTrainerPlayed:true},
    {ordinal:15,seat:1,turn:3,action:'ResolvePromptAction'},
    {ordinal:19,seat:1,turn:3,action:'AttackAction'},
    {ordinal:20,seat:0,turn:4,action:'PassTurnAction'},
    {ordinal:22,seat:0,turn:4,action:'PlayCardAction'}
  ];
  assert.deepEqual(nestContinuation(event,tape),{
    playedSelectedTrainerRoot:14,opponentRoot:19,
    nextOwnerRoot:22,fullContinuation:true
  });
  assert.equal(nestContinuation(event,tape.slice(0,4)).fullContinuation,false);
  assert.equal(nestContinuation(event,tape.slice(0,1)).fullContinuation,false);
});

test('first accepted root divergence detects a physically changed Nest selection',()=>{
  const prefix={trialId:'3:213:B:champion-reference',
    ordinal:23,seat:0,turn:2,action:'ResolvePromptAction',
    promptId:'search-nest',responseType:'array'};
  const base=[
    {ordinal:22,seat:0,turn:2,action:'PlayCardAction'},
    {...prefix,ownerNestBasicSelection:{
      trialId:prefix.trialId,seat:0,turnBefore:2,
      selectedPokemonPrinting:'Articuno-GX CES',source:'mail'}},
    {ordinal:24,seat:0,turn:2,action:'PassTurnAction'}
  ];
  const changed=base.map(x=>({...x}));
  changed[1].ownerNestBasicSelection={
    ...base[1].ownerNestBasicSelection,
    selectedPokemonPrinting:'Bunnelby PRC'
  };
  const first=firstDivergence(base,changed);
  assert.equal(first.index,1);
  assert.equal(first.control.action,first.treatment.action);
  assert.equal(first.control.ownerNestBasicSelection.selectedPokemonPrinting,
    'Articuno-GX CES');
  assert.equal(first.treatment.ownerNestBasicSelection.selectedPokemonPrinting,
    'Bunnelby PRC');
  assert.equal(firstDivergence(base,base),null);
  assert.equal(firstDivergence(
    [{...prefix,ownerNestBasicSelection:null}],
    [{...prefix,ownerNestBasicSelection:null}]),null);
});
