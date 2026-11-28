'use strict';
// Conservative owner-root terminal-draw fallback for the fixed-60 Hood
// candidate. In particular, Tropical Beach is usable by both players even
// when the opponent originally played it into the shared Stadium zone.
// This is a pure actor-policy unit boundary: no native Store/fixture/game.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createPolicy,POLICY_VERSION}=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');

const BEACH='Tropical Beach BWP 50';
function caseFor(seat,{handCount=0,deckCount=30,owner='opponent',
  actionPrinting=BEACH,stadiumEffectLive=true,extraActions=[]}={}){
  const stadium=owner==='actor'?[BEACH]:owner==='opponent'?[BEACH]:[];
  const oppStadium=owner==='opponent'?[BEACH]:[];
  const card={printing:'Shadow Rider Calyrex V CRE 74',name:'Shadow Rider Calyrex V',
    hp:210,damage:0,energies:[],attacks:[],tools:[],abilities:[]};
  const target={printing:'Snorlax PGO 55',name:'Snorlax',hp:150,
    damage:0,energies:[],attacks:[],tools:[],abilities:[]};
  const observation={
    actorSeat:seat,decisionKind:'owner-root',
    ownHand:Array.from({length:handCount},(_,i)=>'Psychic Energy CRE '+(232+i)),
    ownTurnResources:{supporterPlayedTurn:0},
    ownPublic:{active:card,bench:[],stadium,discard:[],lostZone:[],
      deckCount,handCount,publicTurnRestrictions:{}},
    opponentPublic:{active:target,bench:[],stadium:oppStadium,
      discard:[],lostZone:[],deckCount:25}
  };
  const actionFrontier={schema:'aichi-action-frontier-v1',items:[
    ...extraActions,
    {token:'beach',kind:'use-stadium',
      actorPrinting:actionPrinting,
      publicMetadata:{stadiumEffectLive,
        stadiumPrinting:actionPrinting}},
    {token:'pass',kind:'pass'}
  ]};
  const request={role:'candidate',seat,observation,prompt:null,
    publicEventReceipt:null,actionFrontier};
  const policy=createPolicy({role:'candidate',seat,
    policyVersion:POLICY_VERSION,config:{}});
  return {policy,request};
}
for(const seat of [0,1]){
  for(const owner of ['actor','opponent']){
    test('Aichi Beach terminal draw legal, owner='+owner+' seat='+seat,()=>{
      const {policy,request}=caseFor(seat,{owner});
      const out=policy.decideWithAudit(request);
      assert.deepEqual(out.decision,{kind:'select-action',token:'beach'});
      assert.equal(out.policyAudit.selectionRuleCode,
        'ROOT_TERMINAL_BEACH_DRAW_FALLBACK');
      const row=out.policyAudit.evaluations.find(x=>x.token==='beach');
      assert.equal(row.status,'rule-selected');
      assert.equal(row.reasonCode,'BEACH_AFTER_OTHER_ACTIONS');
    });
  }
  test('candidate develops a positive Fog Crystal play BEFORE terminal Beach, seat='+seat,()=>{
    const {policy,request}=caseFor(seat,{
      extraActions:[{token:'fog',kind:'play-card',
        actorPrinting:'Fog Crystal CRE 140',publicMetadata:{cardType:'trainer'}}]});
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'fog'});
  });
  test('six cards in hand does not burn a turn on 1-card draw, seat='+seat,()=>{
    const {policy,request}=caseFor(seat,{handCount:6});
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
  });
  test('insufficient deck buffer vetoes draw-to-seven, seat='+seat,()=>{
    const {policy,request}=caseFor(seat,{deckCount:8});
    assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    const safe=caseFor(seat,{deckCount:9});
    assert.deepEqual(safe.policy.decide(safe.request),
      {kind:'select-action',token:'beach'});
  });
  for(const change of [
    {owner:'none'},
    {actionPrinting:'Tropical Beach BWP'},
    {actionPrinting:'Tropical Beach BWP 28'},
    {stadiumEffectLive:false}
  ]){
    test('unknown/unobserved/disabled Beach fails closed seat='+seat+' case='+JSON.stringify(change),()=>{
      const {policy,request}=caseFor(seat,change);
      assert.deepEqual(policy.decide(request),{kind:'select-action',token:'pass'});
    });
  }
}
