'use strict';
/*
 * Developmental source-backed policy regression only. No pinned-Store
 * dispatch, competitive game, source-inventory substitution, or V3 admission.
 *
 * Tested together: Agent47's printed Prize categories, Agent10's forced
 * post-Guzma attacker, and the pinned numeric Stage.BASIC / PR94 bridge stage
 * on the existing fixed-60 candidate worker.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const ENERGY = 'Psychic Energy MEE 13';
const VMAX = 'Shadow Rider Calyrex VMAX CRE 75';
const LATIAS = 'Latias ex SSP 76';
function mon(printing, {hp=300,damage=0,energy=0,attack=null,stage='BASIC',
  tools=[],abilities=[],suppressed=[]} = {}) {
  return {printing,hp,damage,energies:Array(energy).fill(ENERGY),
    tools,attacks:attack?[attack]:[],abilities,
    abilitySuppressions:suppressed,
    printed:{stage,subtypes:[],types:['Psychic'],retreatCost:[],
      weakness:[],resistance:[]}};
}
const geist = {name:'Max Geist',cost:['Colorless','Colorless','Colorless'],
  damage:'10+'};
const eon = {name:'Eon Blade',cost:['Psychic','Psychic','Colorless'],
  damage:'200'};
const rider = () => mon(VMAX,{hp:320,energy:3,attack:geist,stage:'VMAX'});
const latias = energy => mon(LATIAS,{hp:210,energy,attack:eon});
function player(active,bench=[]) {
  return {active,bench,stadium:[],discard:[],lostZone:[],
    resolvingSupporter:[],deckCount:30,handCount:1,prizeCount:6,
    publicTurnRestrictions:{gxUsed:false,
      stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function agent(seat) {
  return policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}});
}
function root(seat, ownActive, ownBench, enemyBench) {
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownHand:['Guzma BUS 115'],
      ownPublic:player(ownActive,ownBench),
      opponentPublic:player(mon('Iron Thorns ex TWM 77',{hp:230}),
        enemyBench),
      ownTurnResources:{supporterPlayedTurn:0}},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
      {token:'guzma',kind:'play-card',actorPrinting:'Guzma BUS 115',
        publicMetadata:{cardType:'supporter'}},
      {token:'pass',kind:'pass'}]}};
}
function opponentGust(seat,ownBench,targets) {
  const r=root(seat,latias(0),ownBench,targets);
  const observation={...r.observation,decisionKind:'owner-prompt',
    pendingPromptType:'ChoosePokemonPrompt'};
  const prompt={schema:protocol.PROMPT_SCHEMA,
    actingSeat:seat,promptType:'ChoosePokemonPrompt',
    description:'CHOOSE_POKEMON_TO_SWITCH',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting:'Guzma BUS 115',effectName:'Guzma'},
    publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,
      allowCancel:false,isSecret:false},
    choices:targets.map((slot,i)=>({
      token:'target-'+i,kind:'pokemon',printing:slot.printing,
      label:'Opponent bench '+(i+1)+': '+slot.printing,
      publicMetadata:{ownerSeat:'opponent',isOwnerVisible:true,
        targetZone:'bench',benchIndex:i,slotIndex:i,selectionIndex:i,
        selectedCount:1}}))};
  return {...r,prompt,observation,actionFrontier:{
    schema:protocol.FRONTIER_SCHEMA,items:[]}};
}
function skylinerRoot(seat,stage,tools=[]) {
  const active=mon('Mimikyu GRI 58',{hp:70,stage,tools});
  const sky=mon(LATIAS,{hp:210,energy:3,attack:eon,stage:2,
    abilities:['Skyliner'],suppressed:[
      {abilityName:'Skyliner',suppressed:false}]});
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',ownHand:[],
      ownPublic:player(active,[sky]),
      opponentPublic:player(mon('Iron Thorns ex TWM 77',{
        hp:230,damage:150})),ownTurnResources:{supporterPlayedTurn:0}},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
      {token:'retreat',kind:'retreat',targetPrinting:sky.printing,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',
          benchIndex:0,isOwnerVisible:true}},
      {token:'pass',kind:'pass'}]}};
}
function check(agentInstance,request,expected) {
  const got=agentInstance.decideWithAudit(request);
  assert.deepEqual(got.decision,expected);
  if(request.prompt) {
    protocol.validatePrompt(request.prompt,request.seat);
    protocol.validateDecision(got.decision,request.prompt,new Set());
  }
  protocol.validatePolicyAudit(got.policyAudit,request,got.decision,
    policy.POLICY_VERSION);
  return got;
}
for(const seat of [0,1]) {
  const worker=agent(seat);
  test('seat '+seat+' paid forced Bench successor permits Guzma root',()=>{
    const mega=mon('Mega Lucario ex MEG 87',{hp:340,damage:300});
    check(worker,root(seat,latias(0),[rider()],[mega]),
      {kind:'select-action',token:'guzma'});
  });
  test('seat '+seat+' pre-switch Active-only KO cannot justify Guzma root',()=>{
    const mega=mon('Mega Lucario ex MEG 87',{hp:340,damage:300});
    const empty=mon('Mimikyu GRI 58',{hp:70});
    check(worker,root(seat,latias(3),[empty],[mega]),
      {kind:'select-action',token:'pass'});
  });
  test('seat '+seat+' empty Bench keeps paid Active on legal gust',()=>{
    const mega=mon('Mega Lucario ex MEG 87',{hp:340,damage:300});
    check(worker,root(seat,latias(3),[],[mega]),
      {kind:'select-action',token:'guzma'});
  });
  test('seat '+seat+' Mega ex vs VMAX equally 3-Prize: easier KO wins',()=>{
    const mega=mon('Mega Lucario ex MEG 87',{hp:340,damage:300});
    const vmax=mon('Shadow Rider Calyrex VMAX CRE 75',{
      hp:320,damage:220,stage:'VMAX'});
    const r=opponentGust(seat,[rider()],[mega,vmax]);
    const got=check(worker,r,
      {kind:'select-choices',tokens:['target-0']});
    const [x,y]=got.policyAudit.evaluations;
    assert.equal(x.score-y.score,60);
  });
  test('seat '+seat+' VSTAR 2-Prize outranks easier ordinary 1-Prize KO',()=>{
    const star=mon('Regidrago VSTAR SIT 136',{
      hp:280,damage:240,stage:'VSTAR'});
    const basic=mon('Mimikyu GRI 58',{hp:70,damage:50,stage:2});
    const got=check(worker,opponentGust(seat,[rider()],[star,basic]),
      {kind:'select-choices',tokens:['target-0']});
    assert.equal(got.policyAudit.evaluations[0].score-
      got.policyAudit.evaluations[1].score,1680);
  });
  for(const [stage,label,expected] of [
    [2,'pinned Stage.BASIC numeric 2','retreat'],
    ['BASIC','PR94 canonical Stage.BASIC','retreat'],
    [3,'pinned Stage.STAGE_1 numeric 3','pass'],
    ['STAGE_1','PR94 canonical Stage.STAGE_1','pass'],
    [null,'unknown stage fail-closed','pass']
  ]) {
    test('seat '+seat+' Skyliner '+label+' with absent subtypes',()=>{
      check(worker,skylinerRoot(seat,stage),
        {kind:'select-action',token:expected});
    });
  }
  test('seat '+seat+' Float Stone distinguishes non-Basic stage',()=>{
    check(worker,skylinerRoot(seat,3,['Float Stone BKT 137']),
      {kind:'select-action',token:'retreat'});
  });
}
