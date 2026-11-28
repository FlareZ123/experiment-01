'use strict';
/**
 * Fixed Hood 60 / original rank-10 Regidrago V printing.
 * A manual Psychic Energy can change Max Geist from a two-hit attack to
 * an immediate Knock Out while its native attack root is already offered.
 *
 * Pure actor-view and strict-protocol test. NOT a Twinleaf Store game,
 * and no defensive damage-prevention effects or unknown targets modeled.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const E='Psychic Energy MEE 13';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const MARSHADOW='Marshadow UNB 81';
const REGIDRAGO='Regidrago V SIT 135';
function card(printing,energyCount,hp,types,attacks=[],abilities=[]) {
  return {printing,hp,damage:0,printed:{
    stage:'Basic',types,subtypes:[],weakness:[],resistance:[],
    retreatCost:[]},
    energies:Array(energyCount).fill(E),tools:[],abilities,
    abilitySuppressions:[],attacks};
}
const maxGeist=[{name:'Max Geist',
  cost:['Colorless','Colorless','Colorless'],damage:'10+'}];
function publicZone(active,bench) {
  return {active,bench,stadium:[],discard:[],lostZone:[],
    resolvingSupporter:[],deckCount:26,handCount:1,
    publicTurnRestrictions:{
      gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0
    }};
}
function request(seat,{defenderHp=220,activeEnergy=3,
  benchEnergy=3,defenderAbilities=[],stadium=null,
  offerAttack=true,offerAttach=true}={}) {
  const own=publicZone(card(VMAX,activeEnergy,320,
    ['Psychic'],maxGeist,['Underworld Door']),
    [card(MARSHADOW,benchEnergy,80,['Psychic'])]);
  const opponent=publicZone(card(REGIDRAGO,0,defenderHp,
    ['Dragon'],[],defenderAbilities),[]);
  if(stadium)own.stadium.push(stadium);
  const items=[];
  if(offerAttach)items.push({token:'attach-to-active',kind:'play-card',
    actorPrinting:E,targetPrinting:VMAX,
    publicMetadata:{targetSeat:'actor',targetZone:'active',targetIndex:0}});
  if(offerAttack)items.push({token:'max-geist',kind:'attack',
    attackName:'Max Geist'});
  items.push({token:'pass',kind:'pass'});
  return {role:'candidate',seat,publicEventReceipt:null,prompt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownHand:offerAttach?[E]:[],ownPublic:own,opponentPublic:opponent,
      ownTurnResources:{supporterPlayedTurn:0}},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items}
  };
}
function decide(request) {
  const {seat}=request;
  return policy.createPolicy({role:'candidate',seat,
    policyVersion:policy.POLICY_VERSION,config:{}})
    .decideWithAudit(request);
}
for(const seat of [0,1]){
  for(const [label,options,want] of [
    ['190 before 220 after crosses Regidrago V exact HP',{},
      'attach-to-active'],
    ['post-attachment 220 is a lethal Max Geist',
      {activeEnergy:4,offerAttach:false},'max-geist'],
    ['already lethal Max Geist does not waste a turn',
      {defenderHp:190},'max-geist'],
    ['post-attachment 220 does not KO 280 HP',
      {defenderHp:280},'max-geist'],
    ['ability-bearing target cannot claim guaranteed KO',
      {defenderAbilities:['Safeguard']},'max-geist'],
    ['unknown Stadium state prevents projected certainty',
      {stadium:'Path to the Peak CRE 148'},'max-geist'],
    ['must have actual legal native attack root',
      {offerAttack:false},'pass']
  ]){
    test('Max Geist 30-damage exact one-turn KO '+label+' seat '+seat,()=>{
      const req=request(seat,options);
      const result=decide(req);
      assert.deepEqual(result.decision,
        {kind:'select-action',token:want});
      protocol.validateDecision(result.decision,null,
        new Set(req.actionFrontier.items.map(item=>item.token)));
      protocol.validatePolicyAudit(result.policyAudit,req,
        result.decision,policy.POLICY_VERSION);
    });
  }
}
