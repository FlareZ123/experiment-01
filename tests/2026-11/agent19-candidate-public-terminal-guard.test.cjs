'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const worker=require('../../simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs');

const profiles=[
 {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
  deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
 {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
  deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
const PSYCHIC='Psychic Energy SVE';
const FOG='Fog Crystal CRE';
function pkmn(printing,hp,stage,subtypes,types,energies=[],attacks=[],abilities=[]){
 return {printing,name:printing,hp,damage:0,lastPlayedOrEvolvedTurn:0,
  printed:{stage,subtypes,types,retreatCost:[],weakness:[],resistance:[]},
  specialConditions:[],publicRestrictions:{
   cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
   blockedAttackNameNextTurn:null,blockedAttackNameUntilLeavesActive:null,
   onlyAllowedAttackNameNextTurn:null,attackCostIncreaseNextTurn:0,
   attackCostIncreaseWhileActive:0,cannotRetreat:false,
   cannotRetreatNextTurn:false,cannotRetreatWhileActive:false,
   cannotEvolveNextTurn:false
  },evolutionPrintings:[],energies,tools:[],
  attacks:attacks.map(([name,damage,cost])=>({
   name,damage,cost,damageCalculation:null,text:null,gxAttack:false,barrage:false
  })),abilities,
  abilityDetails:abilities.map(name=>({name,powerType:'ABILITY',text:null})),
  abilitySuppressions:abilities.map(abilityName=>({
   abilityName,suppressed:false,reasonCode:null,sourcePrinting:null
  }))
 };
}
function player(active,bench,prizeCount,handCount){
 return {active,bench:[...bench,...Array(5-bench.length).fill(null)],
  stadium:[],discard:[],lostZone:[],resolvingSupporter:[],publicHand:null,
  prizeSlots:[],prizeCount,deckCount:30,handCount,
  publicTurnRestrictions:{
   gxUsed:false,vstarUsed:false,attackLockTurnsRemaining:0,
   attackMaxEnergy:null,attackMaxEnergyTurnsRemaining:0,
   ignoreAttackCostCardTypes:[],ignoreAttackCostTurnsRemaining:0,
   cannotUseGXAttacks:false,pokemonPlayLocked:false,
   abilityPokemonPlayLocked:false,evolutionPlayLocked:false,itemPlayLocked:false,
   supporterPlayLocked:false,stadiumPlayLocked:false,toolPlayLocked:false,
   energyPlayLocked:false,specialEnergyPlayLocked:false,
   stadiumAndToolHaveNoEffectTurnsRemaining:0
  }};
}
function request(seat,flags={}){
 const active=pkmn('Shadow Rider Calyrex VMAX CRE',320,'VMAX',['VMAX','V'],
  ['Psychic'],Array(8).fill(PSYCHIC),
  [['Max Geist','10+',['Colorless','Colorless','Colorless']]],
  ['Underworld Door']);
 const defender=pkmn('Alolan Vulpix VSTAR SIT',240,'VSTAR',['VSTAR','V'],
  ['Water'],[],[['Snow Mirage','160',['Water','Colorless','Colorless']]]);
 const backup=pkmn('Alolan Vulpix V SIT',190,'BASIC',['Basic','V'],['Water']);
 for(const [who,key,value] of [
   ['attacker','outgoingTerminalUncertain',flags.ownOutgoing],
   ['attacker','incomingTerminalUncertain',flags.ownIncoming],
   ['defender','incomingTerminalUncertain',flags.oppIncoming],
   ['defender','outgoingTerminalUncertain',flags.oppOutgoing]
 ]){
   if(value!==undefined)(who==='attacker'?active:defender).publicRestrictions[key]=value;
 }
 const view={actorSeat:seat,globalTurn:3,phase:2,decisionKind:'owner-root',
  pendingPromptType:null,pendingOwnerDeckSearch:false,ownHand:[FOG],
  ownPublic:player(active,[],2,1),
  opponentPublic:player(defender,[backup],6,5),
  ownTurnResources:{
   supporterPlayedTurn:0,retreatedTurn:0,extraTurnActive:false,
   energyPlayedTurn:false,stadiumPlayedTurn:false,stadiumUsedTurn:false,
   vstarUsed:false,pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
   evolutionPlayLocked:false,itemPlayLocked:false,supporterPlayLocked:false,
   stadiumPlayLocked:false,toolPlayLocked:false,energyPlayLocked:false,
   specialEnergyPlayLocked:false},
  ownerK1:null};
 return {role:'candidate',seat,observation:view,prompt:null,publicEventReceipt:null,
  actionFrontier:{items:[
   {kind:'play-card',token:'fog',actorPrinting:FOG,publicMetadata:{}},
   {kind:'attack',token:'hit',attackName:'Max Geist'},
   {kind:'pass',token:'pass'}
  ]}};
}
for(const profile of profiles)for(const seat of [0,1]){
 test('candidate terminal certificate obeys public effect direction '+profile.profileId+' seat '+seat,()=>{
  const policy=worker.createPolicy({role:'candidate',seat,
   policyVersion:worker.POLICY_VERSION,config:profile});
  const choose=flags=>policy.decideWithAudit(request(seat,flags));
  const unprotected=choose({});
  assert.deepEqual(unprotected.decision,{kind:'select-action',token:'hit'});
  assert.equal(unprotected.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');

  // Snow Mirage's pinned public PREVENT_DAMAGE sourceHasAbility is exposed
  // by the host as an incoming terminal uncertainty on the defender.
  const snowMirage=choose({oppIncoming:true});
  assert.deepEqual(snowMirage.decision,{kind:'select-action',token:'fog'});
  assert.notEqual(snowMirage.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');

  // An unmodeled current outgoing attack modifier also removes certainty.
  const attackerModification=choose({ownOutgoing:true});
  assert.deepEqual(attackerModification.decision,{kind:'select-action',token:'fog'});
  assert.notEqual(attackerModification.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');

  // Orthogonal effects do not suppress the immediate win certificate.
  for(const flags of [
   {ownIncoming:true},{oppOutgoing:true},{ownIncoming:true,oppOutgoing:true},
   {ownOutgoing:false,oppIncoming:false}
  ]){
   const safe=choose(flags);
   assert.deepEqual(safe.decision,{kind:'select-action',token:'hit'});
   assert.equal(safe.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
  }
 });
}
