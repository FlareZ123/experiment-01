'use strict';
// Fixed Hood Mimikyu Copycat -> opposing Regidrago Apex Dragon -> our own
// discarded Dialga-GX UPR100 Timeless-GX: extra turn is tactical value,
// not dependent on a live Fairy Zone. Radiant Eternatus in discard supplies
// a competing Power Beam 200 prompt choice. Worker-source developmental
// decisions only; no native nested-prompt or game verification.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const M='Mimikyu GRI 58',D='Dialga-GX UPR 100',
  R='Radiant Eternatus CRZ 105',E='Psychic Energy MEE 13';
const card=(printing,extra={})=>({
  printing,name:printing,hp:70,damage:0,abilities:[],abilitySuppressions:[],
  energies:[],tools:[],attacks:[],printed:{
    types:['Psychic'],subtypes:['Basic'],retreatCost:['Colorless'],
    weakness:[],resistance:[]},...extra
});
const attack=(token,name,cardPrinting)=>({
  kind:'attack',token,label:name,
  publicMetadata:{sourceAttack:name,sourceCardFullName:cardPrinting}
});
function fixture(seat,{fairy=false,remaining=280,prizes=2,gxUsed=false,
  hasDialga=true}={}){
  const owner=card(M,{energies:[E,E],attacks:[{name:'Copycat',
    cost:['Psychic','Colorless'],damage:0}]});
  const clefairy=card("Lillie's Clefairy ex JTG 56",{
    abilities:['Fairy Zone'],
    abilitySuppressions:[{abilityName:'Fairy Zone',suppressed:false}],
    printed:{types:['Psychic'],subtypes:['Basic','ex'],
      retreatCost:['Colorless'],weakness:[],resistance:[]}});
  const view={actorSeat:seat,decisionKind:'owner-prompt',globalTurn:8,
    ownHand:[],ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{active:owner,bench:fairy?[clefairy]:[],
      stadium:[],discard:hasDialga?[D,R]:[R],lostZone:[],
      deckCount:26,handCount:0,prizeCount:prizes,
      publicTurnRestrictions:{gxUsed,vstarUsed:false}},
    opponentPublic:{active:card('Regidrago VSTAR SIT 136',{
      hp:280,damage:280-remaining,
      printed:{types:['Dragon'],subtypes:['VSTAR','V'],
        retreatCost:['Colorless'],weakness:[],resistance:[]}}),
      bench:[],stadium:[],discard:[],lostZone:[],deckCount:24,
      publicTurnRestrictions:{gxUsed:false}}};
  const prompt={schema:'aichi-owner-prompt-projection-v3',actingSeat:seat,
    promptType:'ChooseAttackPrompt',description:'CHOOSE_ATTACK',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:M,effectName:'Apex Dragon'},
    publicMetadata:{selectionType:'attack'},choices:[
      attack('power','Power Beam',R),attack('timeless','Timeless-GX',D)]};
  const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
  return {policy,request:{role:'candidate',seat,observation:view,
    prompt,actionFrontier:{schema:'aichi-action-frontier-v1',items:[]},
    publicEventReceipt:null}};
}
for(const seat of [0,1]){
  test('copies extra-turn Timeless-GX even without Fairy Zone, seat='+seat,()=>{
    const {policy,request}=fixture(seat);
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'timeless'});
  });
  test('retains Timeless-GX advantage when Fairy Zone is live, seat='+seat,()=>{
    const {policy,request}=fixture(seat,{fairy:true});
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'timeless'});
  });
  test('spent GX cannot choose Timeless-GX, seat='+seat,()=>{
    const {policy,request}=fixture(seat,{gxUsed:true});
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'power'});
  });
  test('missing Dialga in discard excludes Timeless-GX, seat='+seat,()=>{
    const {policy,request}=fixture(seat,{hasDialga:false});
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'power'});
  });
  test('Power Beam instant final Prize beats nonlethal Timeless, seat='+seat,()=>{
    const {policy,request}=fixture(seat,{remaining:180,prizes:1});
    assert.deepEqual(policy.decide(request),{kind:'select-choice',token:'power'});
  });
}
