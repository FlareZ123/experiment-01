'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  POLICY_VERSION, createPolicy, energyActionScore
} = require('../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');

const MEGA = 'Mega Lopunny ex PFL 84';
const FAN = 'Fan Rotom SCR 118';
const DCE = 'Double Colorless Energy SUM 136';
const CARD = name => ({printing:name,hp:320,damage:0,energies:[],tools:[],printed:{stage:'STAGE_1'}});
const energyAction=(token,zone,index,printing=MEGA,seat='actor')=>({
  token,kind:'play-card',actorPrinting:DCE,targetPrinting:printing,
  publicMetadata: {
    targetSeat:seat,targetZone:zone,
    ...(zone==='bench'?{targetIndex:index}:{}),
    isOwnerVisible:true
  }
});
function makeRequest(seat, active, bench, items) {
  return {
    role:'opponent',seat,prompt:null,
    observation:{
      actorSeat:seat,globalTurn:6,ownHand:[DCE],
      ownPublic:{active,bench,stadium:[],prizeCount:3},
      opponentPublic:{
        active:{printing:'Shadow Rider Calyrex VMAX CRE 75',hp:320,damage:0,
          printed:{stage:'STAGE_1'}},bench:[],stadium:[],prizeCount:3
      }
    },
    actionFrontier:{items}
  };
}
const decision = request => createPolicy({
  role:'opponent',seat:request.seat,policyVersion:POLICY_VERSION,config:{}
}).decide(request);

for(const seat of [0,1]) {
  test('seat '+seat+': target Benched unfunded Mega not identically printed paid Active',()=>{
    const active=CARD(MEGA);
    active.energies=[DCE];
    const bench=CARD(MEGA);
    const items=[
      energyAction('attach-active','active'),
      energyAction('attach-bench','bench',0)
    ];
    const request=makeRequest(seat,active,[bench],items);
    assert.equal(energyActionScore(items[0],request.observation),0);
    assert.equal(energyActionScore(items[1],request.observation),158);
    assert.deepEqual(decision(request),{kind:'select-action',token:'attach-bench'});
  });

  test('seat '+seat+': target Active unfunded Mega not identically printed paid Bench',()=>{
    const active=CARD(MEGA),bench=CARD(MEGA);
    bench.energies=[DCE];
    const items=[
      energyAction('attach-bench','bench',0),
      energyAction('attach-active','active')
    ];
    const request=makeRequest(seat,active,[bench],items);
    assert.deepEqual(decision(request),{kind:'select-action',token:'attach-active'});
  });

  test('seat '+seat+': two Benched Mega printings preserve true bench-index identity',()=>{
    const active=CARD(FAN),paid=CARD(MEGA),unpaid=CARD(MEGA);
    paid.energies=[DCE];
    const items=[
      energyAction('bench-0','bench',0),
      energyAction('bench-1','bench',1)
    ];
    const request=makeRequest(seat,active,[paid,unpaid],items);
    assert.deepEqual(decision(request),{kind:'select-action',token:'bench-1'});
  });

  test('seat '+seat+': ambiguous name-only target cannot impersonate a physical slot',()=>{
    const active=CARD(MEGA),bench=CARD(MEGA);
    active.energies=[DCE];
    const items=[{kind:'play-card',token:'unnamed-slot',actorPrinting:DCE,targetPrinting:MEGA}];
    const request=makeRequest(seat,active,[bench],items);
    assert.equal(energyActionScore(items[0],request.observation),0);
    assert.deepEqual(decision(request),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
  });

  test('seat '+seat+': opponent-owned or mismatched target metadata cannot earn a score',()=>{
    const active=CARD(MEGA),bench=CARD(MEGA);
    const wrongSeat=energyAction('wrong-seat','bench',0,MEGA,'opponent');
    const wrongPrinting=energyAction('wrong-printing','bench',0,FAN);
    const outOfRange=energyAction('out-of-range','bench',8,MEGA);
    const items=[wrongSeat,wrongPrinting,outOfRange];
    const request=makeRequest(seat,active,[bench],items);
    for(const item of items) assert.equal(energyActionScore(item,request.observation),0);
    assert.deepEqual(decision(request),{kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
  });

  test('seat '+seat+': name-only fallback retains unique visible printing compatibility',()=>{
    const active=CARD(FAN),bench=CARD(MEGA);
    const item={kind:'play-card',token:'unique',actorPrinting:DCE,targetPrinting:MEGA};
    const request=makeRequest(seat,active,[bench],[item]);
    assert.equal(energyActionScore(item,request.observation),158);
    assert.deepEqual(decision(request),{kind:'select-action',token:'unique'});
  });
}

for(const seat of [0,1]) {
  test('seat '+seat+': retreat must promote funded bench index, not first identical Mega',()=>{
    const active=CARD(FAN),unpaid=CARD(MEGA),paid=CARD(MEGA);
    paid.energies=[DCE];
    const actions=[
      {kind:'retreat',token:'unpaid',targetPrinting:MEGA,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0,benchIndex:0}},
      {kind:'retreat',token:'paid',targetPrinting:MEGA,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:1,benchIndex:1}}
    ];
    assert.deepEqual(decision(makeRequest(seat,active,[unpaid,paid],actions)),
      {kind:'select-action',token:'paid'});
  });

  test('seat '+seat+': Float Stone must attach to Active, not identically printed Bench',()=>{
    const active=CARD(MEGA),paid=CARD(MEGA);
    paid.energies=[DCE];
    const stone='Float Stone BKT 137';
    const actions=[
      {kind:'play-card',token:'to-bench',actorPrinting:stone,targetPrinting:MEGA,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}},
      {kind:'play-card',token:'to-active',actorPrinting:stone,targetPrinting:MEGA,
        publicMetadata:{targetSeat:'actor',targetZone:'active'}}
    ];
    assert.deepEqual(decision(makeRequest(seat,active,[paid],actions)),
      {kind:'select-action',token:'to-active'});
  });

  test('seat '+seat+': contradictory physical retreat indexes cannot impersonate funded slot',()=>{
    const active=CARD(FAN),paid=CARD(MEGA);
    paid.energies=[DCE];
    const actions=[
      {kind:'retreat',token:'contradictory',targetPrinting:MEGA,
        publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0,benchIndex:1}}
    ];
    assert.deepEqual(decision(makeRequest(seat,active,[paid],actions)),
      {kind:'abstain',reasonCode:'NO_SUPPORTED_ROOT_ACTION'});
  });

  test('seat '+seat+': unique Bench printing supports legacy name-only retreat',()=>{
    const active=CARD(FAN),paid=CARD(MEGA);
    paid.energies=[DCE];
    const action={kind:'retreat',token:'only-mega',targetPrinting:MEGA};
    assert.deepEqual(decision(makeRequest(seat,active,[paid],[action])),
      {kind:'select-action',token:'only-mega'});
  });
}
