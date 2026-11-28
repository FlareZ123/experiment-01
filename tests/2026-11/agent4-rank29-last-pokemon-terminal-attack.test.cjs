'use strict';

// Original Aichi rank29 Iron Thorns policy: paper game ends when all opposing
// Pokémon are Knocked Out, even if their Prize count would not be exhausted.
// Rank29 actually includes 4 Plumeria and rank1 contains Shadow Rider V.
// Scope: exact actor-visible decision; not a native Store or a win-rate claim.
const test=require('node:test');
const assert=require('node:assert/strict');
const {POLICY_VERSION,createPolicy,scoreAction}=
  require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');
function request(seat,bench=[],extra={}) {
  const active={
    printing:'Shadow Rider Calyrex V CRE 74',hp:210,damage:80,
    tools:extra.protection?['Eviolite NVI 91']:[],
    energies:['Psychic Energy CRE 232'],
    printed:{stage:'BASIC',types:['Psychic'],
      weakness:[{type:'Darkness',value:2}],resistance:[]}
  };
  const own={
    active:{printing:'Iron Thorns ex TWM 77',hp:230,damage:0,
      energies:['Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136'],tools:[]},
    bench:[{printing:'Iron Thorns ex TWM 77',hp:230,damage:0,energies:[],tools:[]}],
    prizeCount:extra.ownPrizes??6,deckCount:10,stadium:[],discard:[],
    publicTurnRestrictions:{}
  };
  const observation={
    actorSeat:seat,globalTurn:12,
    ownHand:['Plumeria BUS 120','Crushing Hammer POR 71',
      'Crushing Hammer POR 71','Guzma & Hala CEC 193'],
    ownPublic:own,
    opponentPublic:{active,bench,prizeCount:2,deckCount:12,stadium:[],
      discard:[],publicTurnRestrictions:{}},
    ownTurnResources:{supporterPlayedTurn:0}
  };
  const items=[
    {kind:'attack',token:'attack',actorPrinting:'Iron Thorns ex TWM 77',
      attackName:'Volt Cyclone',publicMetadata:{attackCostPayable:true}},
    {kind:'play-card',token:'plumeria',actorPrinting:'Plumeria BUS 120',
      publicMetadata:{cardType:'supporter'}},
    {kind:'pass',token:'pass'}
  ];
  return {role:'opponent',seat,prompt:null,observation,actionFrontier:{items}};
}
for(const seat of [0,1]){
  const policy=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}});
  test('seat '+seat+': sole 2-Prize opponent with six Prize cards left gives immediate game win',()=>{
    const req=request(seat);
    assert.equal(scoreAction(req.actionFrontier.items[0],req),1000);
    assert.equal(scoreAction(req.actionFrontier.items[1],req),190);
    assert.deepEqual(policy.decide(req),{kind:'select-action',token:'attack'});
  });
  test('seat '+seat+': live opponent Bench denies false game-ending claim',()=>{
    const req=request(seat,[{printing:'Budew ASC 16',hp:30,damage:0,
      energies:[],tools:[]}]);
    assert.equal(scoreAction(req.actionFrontier.items[0],req),180);
    assert.equal(scoreAction(req.actionFrontier.items[1],req),190);
    assert.deepEqual(policy.decide(req),{kind:'select-action',token:'plumeria'});
  });
  test('seat '+seat+': absent OHKO or known protection does not manufacture a terminal',()=>{
    const req=request(seat,[],{protection:true});
    assert.ok(scoreAction(req.actionFrontier.items[0],req)<1000);
    const unprotected=request(seat);
    unprotected.observation.opponentPublic.active.damage=0;
    assert.ok(scoreAction(unprotected.actionFrontier.items[0],unprotected)<1000);
  });
  test('seat '+seat+': final Prize win remains prioritized when Bench not empty',()=>{
    const req=request(seat,[{printing:'Budew ASC 16',hp:30,damage:0,
      energies:[],tools:[]}],{ownPrizes:2});
    assert.equal(scoreAction(req.actionFrontier.items[0],req),1000);
    assert.deepEqual(policy.decide(req),{kind:'select-action',token:'attack'});
  });
}
