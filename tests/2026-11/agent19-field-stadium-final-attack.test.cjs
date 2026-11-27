'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const worker = require('../../simulation/evaluation/2026-11/agent46-two-profile-candidate-policy.cjs');

const PROFILES = [
  {schema:'agent46-candidate-profile-v1',profileId:'hood-shield-shadow-rider-v1',
    deckSha256:'1cc3d2080b40c7a9e0c61297439ba5d1ae34f9211ba9b24fcffffb2786a3e924'},
  {schema:'agent46-candidate-profile-v1',profileId:'lockbridge-shadow-rider-v1',
    deckSha256:'011cb8481b473c8566935d6835fc9a2a5762e4f09349f23c8284ec19b0cac642'}
];
const PSY='Psychic Energy SVE';
const FOG='Fog Crystal CRE 140';
const STADIUMS=[
  'Path to the Peak CRE 148',
  'Parallel City BKT 145',
  'Silent Lab PRC 140'
];
const UNKNOWN='Jamming Tower TWM 153';

function mon(printing,hp,types,subtypes,energies=[],attacks=[],damage=0,abilities=[]) {
  return {printing,name:printing,hp,damage,lastPlayedOrEvolvedTurn:0,
    printed:{stage:'BASIC',types,subtypes,retreatCost:[],weakness:[],resistance:[]},
    energies,tools:[],attacks:attacks.map(([name,damage,cost])=>
      ({name,damage,cost,damageCalculation:null,text:null,gxAttack:false,barrage:false})),
    abilities,abilityDetails:abilities.map(name=>({name,powerType:'ABILITY',text:null})),
    abilitySuppressions:abilities.map(abilityName=>({abilityName,suppressed:null,reasonCode:null,sourcePrinting:null})),
    specialConditions:[],publicRestrictions:{}};
}
function publicPlayer(active,bench,prizes,stadium=[]) {
  return {active,bench:[...bench,...Array(5-bench.length).fill(null)],stadium,
    stadiumDirection:null,discard:[],lostZone:[],prizeCount:prizes,deckCount:30,
    publicTurnRestrictions:{stadiumAndToolHaveNoEffectTurnsRemaining:0}};
}
function setup(seat,{stadium='',damage=120,prizeCount=2,
  attackerTypes=['Psychic'],oppBench=true,fairyZone=false}={}) {
  // Real Aichi opponent family: Regidrago VSTAR 280 HP, attack-copy engine.
  // Five Psychic Energy: Max Geist = 160 without Fairy Zone; 120 pre-damage
  // leaves exactly 160 HP. Opponent Bench prevents a board-empty shortcut.
  const active=mon('Shadow Rider Calyrex VMAX CRE 75',320,attackerTypes,['VMAX','V'],
    Array(5).fill(PSY),[['Max Geist','10+',['Colorless','Colorless','Colorless']]]);
  const target=mon('Regidrago VSTAR SIT 136',280,['Dragon'],['VSTAR'],[],[],damage,['Legacy Star']);
  const bench=mon('Regidrago V SIT 135',220,['Dragon'],['V']);
  const clefairy=mon("Lillie's Clefairy ex JTG 56",190,['Psychic'],['Basic','ex'],[],[],0,['Fairy Zone']);
  const view={actorSeat:seat,decisionKind:'owner-root',phase:2,globalTurn:4,
    ownHand:[FOG],ownPublic:publicPlayer(active,fairyZone?[clefairy]:[],prizeCount,stadium?[stadium]:[]),
    opponentPublic:publicPlayer(target,oppBench?[bench]:[],6),ownTurnResources:{
      supporterPlayedTurn:0,retreatedTurn:0,energyPlayedTurn:false,
      stadiumPlayedTurn:false}};
  return {role:'candidate',seat,observation:view,prompt:null,publicEventReceipt:null,
    actionFrontier:{items:[
      {token:'fog',kind:'play-card',actorPrinting:FOG,publicMetadata:{}},
      {token:'hit',kind:'attack',attackName:'Max Geist'},
      {token:'pass',kind:'pass'}
    ]}};
}
for(const profile of PROFILES)for(const seat of [0,1]){
  test(profile.profileId+' seat '+seat+' field-relevant Stadiums cannot postpone final Psychic KO',()=>{
    const policy=worker.createPolicy({role:'candidate',seat,
      policyVersion:worker.POLICY_VERSION,config:profile});
    const choose=opts=>policy.decideWithAudit(setup(seat,opts));
    const base=choose({});
    assert.deepEqual(base.decision,{kind:'select-action',token:'hit'});
    assert.equal(base.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
    for(const stadium of STADIUMS){
      const clear=choose({stadium});
      assert.deepEqual(clear.decision,{kind:'select-action',token:'hit'});
      assert.equal(clear.policyAudit.selectionRuleCode,'ROOT_PUBLIC_FINAL_PRIZE_ATTACK');
      const short=choose({stadium,damage:110});
      assert.deepEqual(short.decision,{kind:'select-action',token:'fog'});
      assert.equal(short.policyAudit.selectionRuleCode,'ROOT_PLAY_MAX_COMPONENT_SCORE');
      const tooManyPrizes=choose({stadium,prizeCount:3});
      assert.deepEqual(tooManyPrizes.decision,{kind:'select-action',token:'fog'});
    }
    // A real positive/negative ability-contention counterfactual: Fairy Zone
    // doubles Psychic damage to a Dragon only when its Basic ex holder is live.
    // Path and Silent Lab suppress that holder; Parallel City does not.
    const fairyBase=choose({fairyZone:true,damage:0});
    assert.deepEqual(fairyBase.decision,{kind:'select-action',token:'hit'});
    for(const stadium of STADIUMS){
      const got=choose({stadium,fairyZone:true,damage:0});
      assert.deepEqual(got.decision,{kind:'select-action',token:
        stadium.includes('Parallel City')?'hit':'fog'});
    }
    const unknown=choose({stadium:UNKNOWN});
    assert.deepEqual(unknown.decision,{kind:'select-action',token:'fog'});
    assert.equal(unknown.policyAudit.selectionRuleCode,'ROOT_PLAY_MAX_COMPONENT_SCORE');
    // Parallel City's potential type-based attack penalty is deliberately
    // not certified on a dual-type/non-Psychic attacker.
    const ambiguous=choose({stadium:'Parallel City BKT 145',attackerTypes:['Psychic','Fire']});
    assert.deepEqual(ambiguous.decision,{kind:'select-action',token:'fog'});
  });
}
