'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ownerGuzmaMobilityOption,nominalOneEnergyColorless,
  nominalRetreatDeficit}=require('../simulation/twinleaf/agent2-owner-guzma-mobility-frontier.cjs');

const pokemon=(printing,retreatCost,energies,attacks=[])=>({
  printing,energies,attacks,
  printed:{retreatCost:Array.from({length:retreatCost},()=>9)},
  publicRestrictions:{}
});
const fixture=(actorSeat=0)=>({
  actorSeat,decisionKind:'owner-root',globalTurn:16,phase:3,
  ownHand:['Guzma BUS','Water Energy'],
  ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
  ownPublic:{
    active:pokemon('Snorlax PGO',4,['Capture Energy RCL'],[
      {name:'Collapse',cost:[9,9,9,9]}]),
    bench:[null,pokemon('Bunnelby PRC',2,['Capture Energy RCL'],[
      {name:'Burrow',cost:[9]},{name:'Rototiller',cost:[9]}])],
    publicTurnRestrictions:{attackLockTurnsRemaining:0}
  },
  opponentPublic:{
    bench:[
      pokemon('Shadow Rider Calyrex V CRE',2,
        ['Psychic Energy'],[{name:'Shadow Mist',cost:[5]}]),
      pokemon('Dialga-GX UPR',3,[],[{name:'Overclock',cost:[8]}])
    ]
  }
});

test('source-independent hand-to-active rescue finds paid Bunnelby and exposed Dialga',()=>{
  for(const seat of [0,1]){
    const o=ownerGuzmaMobilityOption(fixture(seat));
    assert.equal(o.actorSeat,seat);
    assert.equal(o.handIndex,0);
    assert.equal(o.ownerBenchIndex,1);
    assert.equal(o.opponentBenchIndex,1);
    assert.equal(o.ownerPrinting,'Bunnelby PRC');
    assert.equal(o.opponentPrinting,'Dialga-GX UPR');
    assert.equal(o.activeNominalRetreatDeficit,3);
    assert.equal(o.opponentNominalRetreatDeficit,3);
    assert.equal(o.nominalAttackName,'Burrow');
  }
});

test('do not claim paper eligibility when Supporter quota, Bench or opponent is absent',()=>{
  const cases=[
    o=>{o.ownTurnResources.supporterPlayedTurn=1;},
    o=>{o.ownTurnResources.supporterPlayedTurn=2;},
    o=>{o.ownTurnResources.supporterPlayLocked=true;},
    o=>{o.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;},
    o=>{o.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;},
    o=>{o.ownHand=['Water Energy'];},
    o=>{o.ownPublic.bench=[];},
    o=>{o.opponentPublic.bench=[];},
    o=>{o.decisionKind='owner-prompt';},
    o=>{o.globalTurn=1;},
    o=>{o.ownPublic.active.energies=['Psychic Energy','Psychic Energy',
      'Psychic Energy','Psychic Energy'];},
    o=>{o.ownPublic.active.printed.retreatCost=[];},
    o=>{o.ownPublic.bench[1].energies=[];},
    o=>{o.ownPublic.bench[1].publicRestrictions.cannotAttackNextTurn=true;}
  ];
  for(const modify of cases){
    const view=fixture();modify(view);
    assert.equal(ownerGuzmaMobilityOption(view),null);
  }
});

test('cost scope avoids unsupported complex attack types and respects printed locks',()=>{
  const mon=pokemon('Test',2,['Capture Energy RCL'],[
    {name:'Dark Strike',cost:[6]},
    {name:'Plain',cost:[9]}
  ]);
  assert.equal(nominalOneEnergyColorless(mon)?.attackName,'Plain');
  mon.publicRestrictions.blockedAttackNameNextTurn='Plain';
  assert.equal(nominalOneEnergyColorless(mon),null);
  mon.publicRestrictions.blockedAttackNameNextTurn=null;
  mon.publicRestrictions.cannotUseAttacksNextTurn=['Plain'];
  assert.equal(nominalOneEnergyColorless(mon),null);
  assert.equal(nominalRetreatDeficit(mon),1);
});

test('opponent concealed zones have no effect on owner public plan or input',()=>{
  const x=fixture();const y=fixture();
  x.opponentPrivate={hand:['A'],deck:['B'],prizes:['C']};
  y.opponentPrivate={hand:['Q','R'],deck:[],prizes:['T']};
  assert.deepEqual(ownerGuzmaMobilityOption(x),ownerGuzmaMobilityOption(y));
  const before=JSON.stringify(x);
  ownerGuzmaMobilityOption(x);
  assert.equal(JSON.stringify(x),before);
});
