'use strict';
// The 60's real Regidrago counterline requires promoting funded Mimikyu to
// Active before Copycat can choose prior Apex Dragon. Pinned native RetreatEffect
// automatically discards identically providing Basic Psychic Energy when paying
// its Colorless retreat, so no undocumented ChooseEnergyPrompt is needed.
// This suite tests decisions after legal native action enumeration (not Store).
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const P='Psychic Energy MEE 13',M='Mimikyu GRI 58',
  D='Dialga-GX UPR 100',R='Regidrago VSTAR SIT 136',
  S='Shadow Rider Calyrex VMAX CRE 75';
function mon(printing,{energy=0,hp=210,damage=0,
  type='Psychic',subtypes=['Basic'],retreat=1,attacks=[]}={}){
  return {printing,name:printing,hp,damage,tools:[],attacks,
    energies:Array(energy).fill(P),abilities:[],abilitySuppressions:[],
    specialConditions:[],publicRestrictions:{cannotAttackNextTurn:false},
    printed:{types:[type],subtypes,retreatCost:Array(retreat).fill('Colorless'),
      weakness:[],resistance:[]}};
}
const copycat={name:'Copycat',cost:['Psychic','Colorless'],damage:0};
const maxGeist={name:'Max Geist',cost:['Colorless','Colorless','Colorless'],
  damage:10,damageCalculation:'+',
  text:'This attack does 30 more damage for each Psychic Energy attached to all of your Pokémon.'};
function fixture(seat,{donor=true,priorApex=true,usedGX=false,activeEnergy=2,
  mimikyuEnergy=2,remaining=280}={}){
  const active=mon(S,{energy:activeEnergy,hp:320,retreat:2,
    subtypes:['V','VMAX'],attacks:[maxGeist]});
  const mimikyu=mon(M,{energy:mimikyuEnergy,hp:70,attacks:[copycat]});
  const target=mon(R,{hp:280,damage:280-remaining,type:'Dragon',
    subtypes:['V','VSTAR']});
  const view={actorSeat:seat,decisionKind:'owner-root',globalTurn:6,
    ownHand:[],ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:0},
    ownPublic:{active,bench:[mimikyu],discard:donor?[D]:[],stadium:[],
      lostZone:[],handCount:0,deckCount:20,prizeCount:3,
      publicTurnRestrictions:{gxUsed:usedGX,attackLockTurnsRemaining:0,
        stadiumAndToolHaveNoEffectTurnsRemaining:0}},
    opponentPublic:{active:target,bench:[],stadium:[],discard:[],lostZone:[],
      deckCount:22,prizeCount:4,
      publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:0}}};
  const frontier={schema:'aichi-action-frontier-v1',items:[
    {token:'retreat',kind:'retreat',actorPrinting:S,targetPrinting:M,
      publicMetadata:{benchIndex:0,targetSeat:'actor',targetZone:'bench',
        targetIndex:0,isOwnerVisible:true}},
    {token:'pass',kind:'pass'}
  ]};
  const choice={turn:5,sourcePrinting:R,attackName:'Apex Dragon',
    gxAttack:false,copycatAttack:false};
  const receipt={actorSeat:seat,turn:6,opponentLastTurnTurn:5,
    opponentCopycatChoices:priorApex?[choice]:[],
    mimikyuCopycatCompatible:false};
  const policy=createPolicy({role:'candidate',seat,
    policyVersion:POLICY_VERSION,config:{}});
  return {policy,view,request:{role:'candidate',seat,observation:view,
    actionFrontier:frontier,prompt:null,publicEventReceipt:receipt}};
}
for(const seat of [0,1]){
  test('two-Psychic paid Retreat promotes ready Mimikyu vs previous Apex, seat='+seat,()=>{
    const {policy,request}=fixture(seat);
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'retreat'});
  });
  test('no Dialga discard, GX spent, missing Apex, unfunded Mimikyu veto, seat='+seat,()=>{
    for(const opts of [
      {donor:false},{usedGX:true},{priorApex:false},{mimikyuEnergy:1}
    ]){
      const {policy,request}=fixture(seat,opts);
      assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    }
  });
  test('synthesized illegal paid Retreat underfunded Active veto, seat='+seat,()=>{
    const {policy,request}=fixture(seat,{activeEnergy:1});
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
  });
  test('native-enumerated zero-retreat Float Stone variant also promotes, seat='+seat,()=>{
    const {policy,request,view}=fixture(seat,{activeEnergy:0});
    view.ownPublic.active.tools=['Float Stone BKT 137'];
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'retreat'});
  });
  test('current Active immediate final-Prize KO outranks speculative extra turn, seat='+seat,()=>{
    const {policy,request,view}=fixture(seat,{activeEnergy:3,remaining:70});
    view.ownPublic.prizeCount=2;
    request.actionFrontier.items.unshift({token:'attack',kind:'attack',
      actorPrinting:S,attackName:'Max Geist'});
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'attack'});
  });
}
