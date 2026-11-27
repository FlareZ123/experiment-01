'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const worker = require('../../simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const projection = require('../../simulation/twinleaf/actor-observation-contract.cjs');

const PROFILES = [
  {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
    deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
  {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
    deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
const PSYCHIC = 'Psychic Energy SVE';
const LEGACY = 'Legacy Energy TWM 167';
const FOG = 'Fog Crystal CRE 140';
const TEMPLE = 'Temple of Sinnoh ASR 155';

function pokemon(printing,hp,subtypes,energies=[],attacks=[]) {
  return {printing,name:printing,hp,damage:0,lastPlayedOrEvolvedTurn:0,
    printed:{stage:'BASIC',subtypes,types:['Psychic'],
      retreatCost:[],weakness:[],resistance:[]},
    specialConditions:[],publicRestrictions:{},evolutionPrintings:[],
    energies,tools:[],attacks:attacks.map(([name,damage,cost])=>({
      name,damage,cost,damageCalculation:null,text:null,gxAttack:false,barrage:false
    })),abilities:[],abilityDetails:[],abilitySuppressions:[]};
}
function publicRestrictions() {
  return {gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,
    attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0,
    ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,
    cannotUseGXAttacks:false,pokemonPlayLocked:false,
    abilityPokemonPlayLocked:false,evolutionPlayLocked:false,
    itemPlayLocked:false,supporterPlayLocked:false,stadiumPlayLocked:false,
    toolPlayLocked:false,energyPlayLocked:false,specialEnergyPlayLocked:false,
    stadiumAndToolHaveNoEffectTurnsRemaining:0};
}
function player(active,bench,prizeCount,stadium=[]) {
  return {active,bench:[...bench,...Array(5-bench.length).fill(null)],
    stadium,stadiumDirection:null,discard:[],lostZone:[],resolvingSupporter:[],
    publicHand:null,prizeSlots:[],prizeCount,deckCount:30,handCount:0,
    publicTurnRestrictions:publicRestrictions()};
}
function sample(seat, {legacy=false, used=undefined, temple=false,
  templeSuppressed=false, noBench=false, prizeCount=2}={}) {
  const candidate=pokemon('Shadow Rider Calyrex VMAX CRE 75',320,['V','VMAX'],
    Array(6).fill(PSYCHIC),[['Max Geist','10+',['Colorless','Colorless','Colorless']]]);
  const target=pokemon('Mew ex MEW 151',180,['Basic','ex'],legacy?[LEGACY]:[]);
  const view={actorSeat:seat,globalTurn:3,decisionKind:'owner-root',
    phase:2,pendingPromptType:null,pendingOwnerDeckSearch:false,ownHand:[FOG],
    ownPublic:player(candidate,[],prizeCount,temple?[TEMPLE]:[]),
    opponentPublic:player(target,noBench?[]:[pokemon('Clefairy SVI 81',60,['Basic'])],6),
    ownTurnResources:{supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,
      energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false,
      vstarUsed:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
      evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,
      stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,
      specialEnergyPlayLocked:false},ownerK1:null};
  if(used!==undefined)view.opponentPublic.publicTurnRestrictions.legacyEnergyUsed=used;
  if(templeSuppressed) {
    view.ownPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=1;
    view.opponentPublic.publicTurnRestrictions.stadiumAndToolHaveNoEffectTurnsRemaining=1;
  }
  const request={role:'candidate',seat,observation:view,prompt:null,
    publicEventReceipt:null,
    actionFrontier:{items:[
      {kind:'play-card',token:'fog',actorPrinting:FOG,publicMetadata:{}},
      {kind:'attack',token:'hit',attackName:'Max Geist'},
      {kind:'pass',token:'pass'}]}};
  return {view,request};
}

test('Legacy public marker is protocol-admitted, boolean and optional',()=>{
  const {view}=sample(0,{legacy:true,used:false});
  assert.doesNotThrow(()=>protocol.validatePublicPlayer(view.opponentPublic,false));
  view.opponentPublic.publicTurnRestrictions.legacyEnergyUsed=true;
  assert.doesNotThrow(()=>protocol.validatePublicPlayer(view.opponentPublic,false));
  view.opponentPublic.publicTurnRestrictions.legacyEnergyUsed='false';
  assert.throws(()=>protocol.validatePublicPlayer(view.opponentPublic,false));
  delete view.opponentPublic.publicTurnRestrictions.legacyEnergyUsed;
  assert.doesNotThrow(()=>protocol.validatePublicPlayer(view.opponentPublic,false));
});
test('Actor projection exposes only an actual boolean Legacy use marker',()=>{
  const emptySlot={getPokemonCard(){return null;},cards:[]};
  const cards={cards:[]};
  const playerState={active:emptySlot,bench:[],stadium:{cards:[]},discard:cards,
    lostzone:cards,supporter:cards,hand:{isPublic:false,cards:[]},
    prizes:[],usedGX:false,usedVSTAR:false,legacyEnergyUsed:true,
    ignoreAttackCostCardTypes:[]};
  const withUse=projection.publicPlayer(playerState);
  assert.equal(withUse.publicTurnRestrictions.legacyEnergyUsed,true);
  playerState.legacyEnergyUsed=false;
  assert.equal(projection.publicPlayer(playerState).publicTurnRestrictions.legacyEnergyUsed,false);
  delete playerState.legacyEnergyUsed;
  assert.equal(Object.hasOwn(projection.publicPlayer(playerState).publicTurnRestrictions,
    'legacyEnergyUsed'),false);
});
for (const profile of PROFILES) for(const seat of [0,1]){
  test(profile.profileId+' seat '+seat+' direct attack with Legacy effect differs from consumed/Temple',()=>{
    const run=opts=>{
      const {request}=sample(seat,opts);
      return worker.createPolicy({role:'candidate',seat,policyVersion:worker.POLICY_VERSION,
        config:profile}).decideWithAudit(request);
    };
    const vanilla=run({});
    assert.deepEqual(vanilla.decision,{kind:'select-action',token:'hit'});
    assert.equal(vanilla.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
    for(const opts of [{legacy:true,used:false},{legacy:true},
      {legacy:true,used:false,temple:true,templeSuppressed:true},
      {legacy:true,used:true,prizeCount:3}]){
      const q=run(opts);
      assert.deepEqual(q.decision,{kind:'select-action',token:'fog'});
      assert.equal(q.policyAudit.selectionRuleCode,'ROOT_PLAY_MAX_COMPONENT_SCORE');
    }
    for(const opts of [{legacy:true,used:true},{legacy:true,used:false,temple:true},
      {legacy:true,temple:true},{legacy:true,used:false,noBench:true}]){
      const q=run(opts);
      assert.deepEqual(q.decision,{kind:'select-action',token:'hit'});
      assert.ok(q.policyAudit.selectionRuleCode.startsWith('ROOT_PUBLIC_FINAL_'));
    }
  });
}
