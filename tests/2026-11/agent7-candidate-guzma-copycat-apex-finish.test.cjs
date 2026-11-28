'use strict';
// Specific original Hood Shield interaction: Guzma swaps our Active out AFTER
// gusting their Bench. A paid Mimikyu with prior Regidrago Apex Dragon
// can Copycat -> discarded Dialga-GX Timeless-GX, delivering 150 Psychic
// printed damage plus an extra turn. This is a paired Bench/Bench choice,
// not a damage-0 Copycat. Only native legal root/prompt tokens are selected.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const M='Mimikyu GRI 58',D='Dialga-GX UPR 100',G='Guzma BUS 115',
  R='Regidrago VSTAR SIT 136',E='Psychic Energy MEE 13';
function mon(printing,{hp=210,damage=0,type='Psychic',energy=0,attacks=[],
  subtypes=['Basic']}={}){
  return {printing,name:printing,hp,damage,energies:Array(energy).fill(E),
    tools:[],abilities:[],abilitySuppressions:[],attacks,
    printed:{types:[type],subtypes,retreatCost:['Colorless'],
      weakness:[],resistance:[]}};
}
function choose(token,printing,owner,index){
  return {token,kind:'pokemon',printing,
    label:(owner==='actor'?'Your ':'Opponent ')+'bench '+(index+1)+': '+printing,
    publicMetadata:{ownerSeat:owner,targetZone:'bench',
      benchIndex:index,isOwnerVisible:true,selectedCount:1}};
}
function fixture(seat,{priorApex=true,gxUsed=false,energy=2,hasDialga=true}={}){
  const ownActive=mon('Shadow Rider Calyrex V CRE 74');
  const mimikyu=mon(M,{hp:70,energy,attacks:[{
    name:'Copycat',cost:['Psychic','Colorless'],damage:0}]});
  const ownBench=[mimikyu,mon('Shadow Rider Calyrex V CRE 74')];
  const foe=mon(R,{hp:280,type:'Dragon',subtypes:['V','VSTAR']});
  const enemyBench=[mon('Mew ex MEW 151',{hp:180,damage:30,
    subtypes:['Basic','ex']}),mon('Mega Absol ex ME1 86',{
      hp:280,type:'Darkness',subtypes:['Basic','MEGA','ex']})];
  const view={actorSeat:seat,globalTurn:6,decisionKind:'owner-root',ownHand:[G],
    ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{active:ownActive,bench:ownBench,
      discard:hasDialga?[D]:[],stadium:[],deckCount:24,handCount:1,
      prizeCount:3,publicTurnRestrictions:{gxUsed}},
    opponentPublic:{active:foe,bench:enemyBench,stadium:[],discard:[],
      deckCount:22,prizeCount:4,publicTurnRestrictions:{gxUsed:false}}};
  const event={turn:5,sourcePrinting:R,attackName:'Apex Dragon',
    gxAttack:false,copycatAttack:false};
  const receipt={actorSeat:seat,turn:6,opponentLastTurnTurn:5,
    opponentCopycatChoices:priorApex?[event]:[],
    mimikyuCopycatCompatible:false};
  const request={role:'candidate',seat,observation:view,
    publicEventReceipt:receipt,prompt:null,
    actionFrontier:{schema:'aichi-action-frontier-v1',items:[
      {kind:'play-card',token:'guzma',actorPrinting:G,
        publicMetadata:{cardType:'trainer'}},
      {kind:'pass',token:'pass'}]}};
  const policy=createPolicy({role:'candidate',seat,
    policyVersion:POLICY_VERSION,config:{}});
  return {policy,request,view};
}
function putPrompt(request,owner,choices){
  request.observation.decisionKind='owner-prompt';
  request.prompt={schema:'aichi-owner-prompt-projection-v3',
    actingSeat:request.seat,promptType:'ChoosePokemonPrompt',
    description:'CHOOSE_POKEMON',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:G,effectName:'Guzma'},
    publicMetadata:{selectionType:'pokemon',
      minimumCount:1,maximumCount:1,allowCancel:false},
    choices};
}
for(const seat of [0,1]){
  test('Guzma root recognizes funded Mimikyu Copycat potential 150 KO, seat='+seat,()=>{
    const {policy,request}=fixture(seat);
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'guzma'});
  });
  test('Guzma first gust chooses reachable 150-remaining ex, seat='+seat,()=>{
    const {policy,request}=fixture(seat);
    putPrompt(request,'opponent',[
      choose('tank','Mega Absol ex ME1 86','opponent',1),
      choose('mew','Mew ex MEW 151','opponent',0)]);
    assert.deepEqual(policy.decide(request),{kind:'select-choices',tokens:['mew']});
  });
  test('Guzma second switch promotes paid Mimikyu after native gust, seat='+seat,()=>{
    const {policy,request,view}=fixture(seat);
    view.opponentPublic.active=view.opponentPublic.bench[0];
    putPrompt(request,'actor',[
      choose('v','Shadow Rider Calyrex V CRE 74','actor',1),
      choose('mimikyu',M,'actor',0)]);
    assert.deepEqual(policy.decide(request),{kind:'select-choices',tokens:['mimikyu']});
  });
  test('Guzma root abstains without valid prior Apex, GX or donor, seat='+seat,()=>{
    for(const opts of [
      {priorApex:false},{gxUsed:true},{energy:1},{hasDialga:false}
    ]){
      const {policy,request}=fixture(seat,opts);
      assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    }
  });
}
