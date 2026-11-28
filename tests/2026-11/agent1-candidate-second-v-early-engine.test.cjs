'use strict';
/*
 * Fixed Hood 60: 4 Shadow Rider V CRE74 + 4 VMAX CRE75.
 * An already-established V (including the evolved VMAX) must not suppress
 * the second Basic V root; two engines unlock a second future Underworld Door.
 * True native offers are assumed. This is not a played native game.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const policy=require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol=require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const V='Shadow Rider Calyrex V CRE 74';
const VMAX='Shadow Rider Calyrex VMAX CRE 75';
const E='Psychic Energy MEE 13';
const poke=id=>({
  printing:id,hp:210,damage:0,
  printed:{stage:'Basic',types:['Psychic'],subtypes:['Basic'],
    weakness:[],resistance:[],retreatCost:[]},
  energies:[],tools:[],abilities:[],abilitySuppressions:[],attacks:[]
});
const board=(active,bench)=>({
  active:poke(active),bench:bench.map(poke),stadium:[],discard:[],
  lostZone:[],resolvingSupporter:[],deckCount:30,handCount:1,
  publicTurnRestrictions:{
    gxUsed:false,stadiumAndToolHaveNoEffectTurnsRemaining:0
  }
});
function request(seat,{name,active,bench=[],opponent='Shadow Rider Calyrex VMAX CRE 75',
  compete=false}){
  const actions=[{token:'bench-second-v',kind:'play-card',actorPrinting:V,
    publicMetadata:{targetSeat:'actor',targetZone:'bench'}}];
  if(compete)actions.push({token:'bench-mimikyu',kind:'play-card',
    actorPrinting:'Mimikyu GRI 58',
    publicMetadata:{targetSeat:'actor',targetZone:'bench'}});
  actions.push({token:'pass',kind:'pass'});
  return {role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{actorSeat:seat,decisionKind:'owner-root',
      ownHand:compete?[V,'Mimikyu GRI 58']:[V],
      ownPublic:board(active,bench),opponentPublic:board(opponent,[]),
      ownTurnResources:{supporterPlayedTurn:0}},
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:actions}
  };
}
const cases=[
  {name:'initial Basic V required',active:'Mimikyu GRI 58',
    want:'bench-second-v'},
  {name:'one Basic V Active requires backup',active:V,
    want:'bench-second-v'},
  {name:'one VMAX Active requires next engine',active:VMAX,
    want:'bench-second-v'},
  {name:'one VMAX with a filler Bench still wants next engine',
    active:VMAX,bench:['Marshadow UNB 81'],want:'bench-second-v'},
  {name:'two engine slots already enough',active:VMAX,bench:[V],
    want:'pass'},
  {name:'preserve last ordinary Bench position',active:VMAX,
    bench:Array(4).fill('Marshadow UNB 81'),want:'pass'},
  {name:'matchup Mimikyu outranks second V',active:V,compete:true,
    opponent:'Regidrago VSTAR SIT 136',want:'bench-mimikyu'}
];
for(const seat of [0,1])for(const example of cases)
  test(example.name+' seat '+seat,()=>{
    const req=request(seat,example);
    const result=policy.createPolicy({role:'candidate',seat,
      policyVersion:policy.POLICY_VERSION,config:{}})
      .decideWithAudit(req);
    assert.deepEqual(result.decision,{kind:'select-action',
      token:example.want});
    protocol.validateDecision(result.decision,null,
      new Set(req.actionFrontier.items.map(x=>x.token)));
    protocol.validatePolicyAudit(result.policyAudit,req,result.decision,
      policy.POLICY_VERSION);
  });
