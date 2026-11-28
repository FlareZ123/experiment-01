'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {actorObservation}=require('../../simulation/twinleaf/actor-observation-contract.cjs');
const {projectNativeAction}=require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

// This is a real actorObservation -> real native action projector -> candidate
// worker source chain on constructed native-shaped State objects. It is NOT
// a compiled pinned-Twinleaf Store or a resolved match.
const E='Psychic Energy MEE 13';
function c(fullName,extra={}){
  return {fullName,name:fullName,hp:200,cardType:['PSYCHIC'],
    stage:'BASIC',subtypes:['Basic'],attacks:[],powers:[],
    retreat:[],weakness:[],resistance:[],...extra};
}
function slot(card){
  return {cards:card?[card]:[],getPokemonCard:()=>card??null,damage:0,
    energies:{cards:[]},tools:[],specialConditions:[],pokemonPlayedTurn:1};
}
function player(id,owner,recipientType='PSYCHIC'){
  const active=owner?c('Shadow Rider Calyrex VMAX CRE',{
    stage:'VMAX',subtypes:['VMAX'],powers:[{name:'Underworld Door'}]}):
    c('Mimikyu GRI');
  const bench=owner?c('Shadow Rider Calyrex V CRE',
    {cardType:[recipientType]}):null;
  return {id,active:slot(active),bench:[slot(bench),
    slot(null),slot(null),slot(null),slot(null)],
    hand:{cards:owner?[c(E)]:[]},deck:{cards:Array(30).fill(c(E))},
    prizes:Array(6).fill(null).map(()=>({cards:[c(E)]})),
    discard:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    supporter:{cards:[]},stadiumAndToolHaveNoEffectTurnsRemaining:0,
    supporterTurn:0,energyPlayedTurn:0,stadiumPlayedTurn:0,
    usedGX:false,usedVSTAR:false};
}
const minimalNative={PlayerType:{BOTTOM_PLAYER:'BOTTOM_PLAYER',
  TOP_PLAYER:'TOP_PLAYER'},SlotType:{ACTIVE:'ACTIVE',BENCH:'BENCH'}};
function root(seat,recipientType){
  const state={players:[player(100,seat===0,recipientType),
    player(200,seat===1,recipientType)],activePlayer:seat,
    turn:4,phase:5,prompts:[]};
  const view=actorObservation(state,seat);
  const action=projectNativeAction({type:'USE_ABILITY_ACTION',
    name:'Underworld Door',target:{
      player:'BOTTOM_PLAYER',slot:'ACTIVE',index:0}},
    state,seat,minimalNative,'door');
  assert.ok(action);
  const frontier={schema:protocol.FRONTIER_SCHEMA,items:[action,
    {kind:'pass',token:'pass'}]};
  const worker=createPolicy({role:'candidate',seat,
    policyVersion:POLICY_VERSION,config:{}});
  protocol.validateFrontier(frontier);
  const decision=worker.decide({role:'candidate',seat,observation:view,
    prompt:null,publicEventReceipt:null,actionFrontier:frontier});
  return {view,action,decision};
}
for(const seat of [0,1]){
  test('actorObservation native PSYCHIC bench admits Underworld Door root seat '+seat,()=>{
    const {view,action,decision}=root(seat,'PSYCHIC');
    assert.deepEqual(view.ownPublic.bench[0].printed.types,['PSYCHIC']);
    assert.deepEqual(action.publicMetadata,{abilityName:'Underworld Door',
      sourceZone:'active',sourceSeat:'actor',sourceIndex:0});
    assert.deepEqual(decision,{kind:'select-action',token:'door'});
  });
  test('actorObservation native METAL bench rejects Door despite offer seat '+seat,()=>{
    const {view,decision}=root(seat,'METAL');
    assert.deepEqual(view.ownPublic.bench[0].printed.types,['METAL']);
    assert.deepEqual(decision,{kind:'select-action',token:'pass'});
  });
}

function retreatDecision(seat,paidPsychic){
  const state={players:[player(100,seat===0),player(200,seat===1)],
    activePlayer:seat,turn:5,phase:5,prompts:[]};
  const owner=state.players[seat];
  owner.active=slot(c('Mimikyu GRI',{hp:70,attacks:[
    {name:'Copycat',cost:['PSYCHIC','COLORLESS'],damage:''}]}));
  owner.active.tools=[c('Float Stone BKT')];
  const target=paidPsychic?c('Shadow Rider Calyrex VMAX CRE',{
    stage:'VMAX',subtypes:['VMAX'],attacks:[
      {name:'Max Geist',cost:['COLORLESS','COLORLESS','COLORLESS'],
        damage:'10+'}]}):c('Dialga-GX UPR',{
    cardType:['METAL'],attacks:[{name:'Timeless-GX',
      cost:['METAL','METAL','METAL','COLORLESS','COLORLESS'],
      damage:'150',gxAttack:true}]});
  owner.bench[0]=slot(target);
  owner.bench[0].energies.cards=Array(paidPsychic?3:5).fill(null).map(()=>c(E));
  const view=actorObservation(state,seat);
  const action=projectNativeAction({type:'RETREAT_ACTION',benchIndex:0},
    state,seat,minimalNative,'retreat');
  assert.ok(action);
  const frontier={schema:protocol.FRONTIER_SCHEMA,items:[action,
    {kind:'pass',token:'pass'}]};
  const worker=createPolicy({role:'candidate',seat,
    policyVersion:POLICY_VERSION,config:{}});
  const decision=worker.decide({role:'candidate',seat,observation:view,
    prompt:null,publicEventReceipt:null,actionFrontier:frontier});
  return {view,action,decision};
}
for(const seat of [0,1]){
  test('native enum cost allows funded Shadow Rider retreat target seat '+seat,()=>{
    const {view,action,decision}=retreatDecision(seat,true);
    assert.deepEqual(view.ownPublic.bench[0].attacks[0].cost,
      ['COLORLESS','COLORLESS','COLORLESS']);
    assert.deepEqual(action.publicMetadata.targetIndex,0);
    assert.deepEqual(decision,{kind:'select-action',token:'retreat'});
  });
  test('native enum Metal cost rejects 5 Psychic paid Dialga seat '+seat,()=>{
    const {view,decision}=retreatDecision(seat,false);
    assert.deepEqual(view.ownPublic.bench[0].attacks[0].cost,
      ['METAL','METAL','METAL','COLORLESS','COLORLESS']);
    assert.deepEqual(decision,{kind:'select-action',token:'pass'});
  });
}

for(const seat of [0,1]) {
  test('Jamming Tower prevents fake free Float Stone retreat seat '+seat,()=>{
    const state={players:[player(100,seat===0),player(200,seat===1)],
      activePlayer:seat,turn:5,phase:5,prompts:[]};
    const owner=state.players[seat];
    owner.active=slot(c('Mimikyu GRI',{hp:70,retreat:['COLORLESS'],
      attacks:[{name:'Copycat',cost:['PSYCHIC','COLORLESS'],damage:''}]}));
    owner.active.tools=[c('Float Stone BKT')];
    owner.active.energies.cards=[c(E)]; // Paid native retreat can be offered.
    owner.bench[0]=slot(c('Shadow Rider Calyrex VMAX CRE',{
      stage:'VMAX',subtypes:['VMAX'],attacks:[
        {name:'Max Geist',cost:['COLORLESS','COLORLESS','COLORLESS'],
          damage:'10+'}]}));
    owner.bench[0].energies.cards=Array(3).fill(null).map(()=>c(E));
    state.players[1-seat].stadium.cards=[c('Jamming Tower TWM')];
    const view=actorObservation(state,seat);
    const retreat=projectNativeAction({type:'RETREAT_ACTION',benchIndex:0},
        state,seat,minimalNative,'retreat');
    const frontier={schema:protocol.FRONTIER_SCHEMA,
      items:[retreat,{kind:'pass',token:'pass'}]};
    const worker=createPolicy({role:'candidate',seat,
      policyVersion:POLICY_VERSION,config:{}});
    const got=worker.decide({role:'candidate',seat,observation:view,
      prompt:null,publicEventReceipt:null,actionFrontier:frontier});
    assert.deepEqual(view.opponentPublic.stadium,['Jamming Tower TWM']);
    assert.deepEqual(view.ownPublic.active.printed.retreatCost,['COLORLESS']);
    assert.deepEqual(got,{kind:'select-action',token:'pass'});
  });
}

for(const seat of [0,1]) {
  test('opposing Active Tool Jammer suppresses Float Stone retreat seat '+seat,()=>{
    const state={players:[player(100,seat===0),player(200,seat===1)],
      activePlayer:seat,turn:5,phase:5,prompts:[]};
    const owner=state.players[seat];
    owner.active=slot(c('Mimikyu GRI',{hp:70,retreat:['COLORLESS'],
      attacks:[{name:'Copycat',cost:['PSYCHIC','COLORLESS'],damage:''}]}));
    owner.active.tools=[c('Float Stone BKT')];
    owner.active.energies.cards=[c(E)];
    owner.bench[0]=slot(c('Shadow Rider Calyrex VMAX CRE',{
      stage:'VMAX',subtypes:['VMAX'],attacks:[
        {name:'Max Geist',cost:['COLORLESS','COLORLESS','COLORLESS'],
          damage:'10+'}]}));
    owner.bench[0].energies.cards=Array(3).fill(null).map(()=>c(E));
    state.players[1-seat].active.tools=[c('Tool Jammer BST')];
    const view=actorObservation(state,seat);
    const retreat=projectNativeAction({type:'RETREAT_ACTION',benchIndex:0},
      state,seat,minimalNative,'retreat');
    const frontier={schema:protocol.FRONTIER_SCHEMA,
      items:[retreat,{kind:'pass',token:'pass'}]};
    const worker=createPolicy({role:'candidate',seat,
      policyVersion:POLICY_VERSION,config:{}});
    const got=worker.decide({role:'candidate',seat,observation:view,
      prompt:null,publicEventReceipt:null,actionFrontier:frontier});
    assert.deepEqual(view.opponentPublic.active.tools,['Tool Jammer BST']);
    assert.deepEqual(got,{kind:'select-action',token:'pass'});
  });
}

function forestSealDecision(seat,mode,lock='jammer') {
  const state={players:[player(100,seat===0),player(200,seat===1)],
    activePlayer:seat,turn:5,phase:5,prompts:[]};
  const owner=state.players[seat];
  owner.active=slot(c('Mimikyu GRI',{hp:70,attacks:[]}));
  owner.bench[0]=slot(c('Shadow Rider Calyrex V CRE'));
  if(lock==='jammer')state.players[1-seat].active.tools=[c('Tool Jammer BST')];
  if(lock==='tower')state.players[1-seat].stadium.cards=[c('Jamming Tower TWM')];
  const activeTool=(mode==='activePlay'||mode==='activeStar');
  if(activeTool)owner.active=slot(c('Shadow Rider Calyrex V CRE'));
  const sourceZone=activeTool?'ACTIVE':'BENCH';
  const sourceSlot=activeTool?owner.active:owner.bench[0];
  let action;
  if(mode==='play'||mode==='activePlay') {
    owner.hand.cards=[c('Forest Seal Stone SIT 156')];
    action=projectNativeAction({type:'PLAY_CARD_ACTION',handIndex:0,
      target:{player:'BOTTOM_PLAYER',slot:sourceZone,index:0}},
      state,seat,minimalNative,'stone');
  } else {
    owner.hand.cards=[];
    sourceSlot.tools=[c('Forest Seal Stone SIT 156')];
    action=projectNativeAction({type:'USE_ABILITY_ACTION',
      name:'Star Alchemy',target:{player:'BOTTOM_PLAYER',
        slot:sourceZone,index:0}},
      state,seat,minimalNative,'star');
  }
  assert.ok(action);
  const view=actorObservation(state,seat);
  const frontier={schema:protocol.FRONTIER_SCHEMA,
    items:[action,{kind:'pass',token:'pass'}]};
  const worker=createPolicy({role:'candidate',seat,
    policyVersion:POLICY_VERSION,config:{}});
  const result=worker.decide({role:'candidate',seat,
    observation:view,prompt:null,publicEventReceipt:null,actionFrontier:frontier});
  return {view,action,result};
}
for(const seat of [0,1]){
  for(const [mode,actionToken] of [['play','stone'],['star','star']]){
    test('opposing Tool Jammer does not suppress Benched Forest Seal '+mode+' seat '+seat,()=>{
      const {action,result}=forestSealDecision(seat,mode,'jammer');
      assert.deepEqual(action.publicMetadata[mode==='play'?'targetZone':'sourceZone'],'bench');
      assert.deepEqual(result,{kind:'select-action',token:actionToken});
    });
    test('Jamming Tower does suppress Benched Forest Seal '+mode+' seat '+seat,()=>{
      const {result}=forestSealDecision(seat,mode,'tower');
      assert.deepEqual(result,{kind:'select-action',token:'pass'});
    });
  }
  for(const mode of ['activePlay','activeStar']){
    test('opposing Tool Jammer still suppresses Active Stone '+mode+' seat '+seat,()=>{
      const {result}=forestSealDecision(seat,mode,'jammer');
      assert.deepEqual(result,{kind:'select-action',token:'pass'});
    });
  }
}
