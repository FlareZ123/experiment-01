'use strict';
// Exact Hood 60: one Psychic in hand, live Underworld Door and a playable
// manual Active attachment. A guaranteed paper Max Geist KO can be lost when
// Door consumes the only hand Energy and attaches it to a Benched Psychic.
// Developmental policy decision test: no native Store or simulated game.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const E='Psychic Energy MEE 13';
function mon(printing,{energy=0,attacks=[],hp=200,damage=0,stage='BASIC',abilities=[]}={}) {
  return {printing,hp,damage,attacks,abilities,energies:Array(energy).fill(E),
    tools:[],abilitySuppressions:[],printed:{subtypes:[stage],
      types:['Psychic'],retreatCost:[],weakness:[],resistance:[]}};
}
function request(seat,kind) {
  const active=mon('Shadow Rider Calyrex VMAX CRE 75',{
    energy:kind==='alreadyPaid'?3:2,stage:'VMAX',abilities:['Underworld Door'],
    hp:320,attacks:[{name:'Max Geist',cost:['Colorless','Colorless','Colorless'],
      damage:'10+',text:'This attack does 30 more damage for each Psychic Energy attached to all of your Pokémon.'}]
  });
  const opponent=kind==='nonlethal'?mon('Shadow Rider Calyrex VMAX CRE 75',{hp:320}):
    mon('Mimikyu GRI 58',{hp:70});
  const own={active,bench:[mon('Shadow Rider Calyrex V CRE 74',{hp:210})],
    stadium:[],deckCount:20,handCount:1,discard:[],lostZone:[],
    publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0,
      attackLockTurnsRemaining:kind==='attackLocked'?1:0}};
  const enemy={active:opponent,bench:[],stadium:[],deckCount:20,
    publicTurnRestrictions:{gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0}};
  let items=[
    {token:'door',kind:'use-ability',actorPrinting:active.printing,
      publicMetadata:{abilityName:'Underworld Door',sourceSeat:'actor',sourceZone:'active'}},
    {token:'active',kind:'play-card',actorPrinting:E,targetPrinting:active.printing,
      publicMetadata:{targetSeat:'actor',targetZone:'active',targetIndex:0}},
    {token:'bench',kind:'play-card',actorPrinting:E,
      targetPrinting:'Shadow Rider Calyrex V CRE 74',
      publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}},
    {token:'pass',kind:'pass'}
  ];
  if(kind==='onlyDoor')items=items.filter(item=>item.token!=='active');
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,globalTurn:6,decisionKind:'owner-root',
      ownHand:[E],ownTurnResources:{supporterPlayedTurn:0},ownPublic:own,
      opponentPublic:enemy},
    actionFrontier:{schema:'aichi-action-frontier-v1',items}};
}
for(const seat of [0,1])for(const [kind,want] of [
  ['lethal','active'],
  ['nonlethal','door'],
  ['attackLocked','door'],
  ['onlyDoor','door'],
  ['alreadyPaid','door']
])test('original Hood Underworld single-Energy fork '+kind+' seat '+seat,()=>{
  const req=request(seat,kind);
  const policy=createPolicy({role:'candidate',seat,policyVersion:POLICY_VERSION,config:{}});
  const output=policy.decideWithAudit(req);
  assert.deepEqual(output.decision,{kind:'select-action',token:want});
  assert.deepEqual(output.policyAudit.selectedTokens,[want]);
  assert.deepEqual(output.policyAudit.evaluations.map(row=>row.token),
    req.actionFrontier.items.map(row=>row.token));
});
