'use strict';
// Original fixed Hood Shield 60 has one Pokemon Ranger STS104 and many Items.
// Pinned PRE4 Budew Itchy Pollen puts Item lock on the opponent *player* by
// an ATTACK, unlike Vileplume's Ability lock. Ranger can clear the former
// without an Item; native action frontier must first offer legal Supporter.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=
  require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const R='Pokémon Ranger STS 104',F='Fog Crystal CRE 140',
  B='Budew PRE 4';
function pokemon(printing){
  return {printing,name:printing,hp:70,damage:0,attacks:[],
    abilities:[],energies:[],tools:[],
    printed:{types:['Psychic'],subtypes:['Basic'],
      retreatCost:['Colorless'],weakness:[],resistance:[]}};
}
function req(seat,{locked=true,hasItem=true,source=B,
  prior='Itchy Pollen',supporterPlayed=0,history=true}={}){
  const ownHand=hasItem?[R,F]:[R];
  const view={actorSeat:seat,globalTurn:4,decisionKind:'owner-root',
    ownHand,ownTurnResources:{supporterPlayedTurn:supporterPlayed},
    ownPublic:{active:pokemon('Shadow Rider Calyrex V CRE 74'),
      bench:[],discard:[],stadium:[],lostZone:[],handCount:ownHand.length,
      deckCount:27,prizeCount:4,publicTurnRestrictions:{
        itemPlayLocked:locked,supporterPlayLocked:false,gxUsed:false}},
    opponentPublic:{active:pokemon(B),bench:[],discard:[],stadium:[],
      lostZone:[],deckCount:25,prizeCount:4,publicTurnRestrictions:{}}};
  const receipt=history?{actorSeat:seat,turn:4,opponentLastTurnTurn:3,
    opponentLastTurnAttacks:[{turn:3,sourcePrinting:source,
      attackName:prior,gxAttack:false,copycatAttack:false}]}:
      {actorSeat:seat,turn:4,opponentLastTurnTurn:null,
        opponentLastTurnAttacks:null};
  const frontier={schema:'aichi-action-frontier-v1',items:[
    {token:'ranger',kind:'play-card',actorPrinting:R,
      publicMetadata:{cardType:'trainer'}},
    {token:'pass',kind:'pass'}]};
  const policy=createPolicy({role:'candidate',seat,
    policyVersion:POLICY_VERSION,config:{}});
  return {policy,request:{role:'candidate',seat,observation:view,
    prompt:null,publicEventReceipt:receipt,actionFrontier:frontier}};
}
for(const seat of [0,1]){
  test('authentic Budew Itchy Pollen plus held Item: Ranger opens Item line seat '+seat,()=>{
    const {policy,request}=req(seat);
    assert.deepEqual(policy.decide(request),
      {kind:'select-action',token:'ranger'});
  });
  test('Vileplume Irritating Pollen persists when Ranger clears Budew attack seat '+seat,()=>{
    const {policy,request}=req(seat);
    const vileplume=pokemon('Vileplume AOR 3');
    vileplume.abilities=['Irritating Pollen'];
    vileplume.abilitySuppressions=[{abilityName:'Irritating Pollen',
      suppressed:false,reasonCode:null,sourcePrinting:null}];
    request.observation.opponentPublic.bench=[vileplume];
    assert.deepEqual(policy.decide(request),
      {kind:'select-action',token:'pass'});
    // Known-suppressed Vileplume cannot maintain Item lock; Itchy Pollen
    // remains a valid attack-based reason to use Ranger.
    vileplume.abilitySuppressions[0].suppressed=true;
    assert.deepEqual(policy.decide(request),
      {kind:'select-action',token:'ranger'});
  });
  test('unknown lock origin, no live Item, stale source, or no lock: pass seat '+seat,()=>{
    for(const opts of [
      {history:false},{hasItem:false},{source:'Vileplume AOR 3'},
      {prior:'Block'},{locked:false},{supporterPlayed:1}
    ]){
      const {policy,request}=req(seat,opts);
      assert.deepEqual(policy.decide(request),
        {kind:'select-action',token:'pass'});
    }
  });
}
