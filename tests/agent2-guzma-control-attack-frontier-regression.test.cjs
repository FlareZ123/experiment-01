'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseHeldGuzmaMobility,eligibleDamagingAttack}=
  require('../simulation/twinleaf/agent2-held-guzma-mobility-frontier.cjs');
const {ownerGuzmaMobilityOption}=
  require('../simulation/twinleaf/agent2-owner-guzma-mobility-frontier.cjs');

const catalog={
  basicEnergies:new Set(['Water Energy']),
  basicEnergyTypes:{Water:2},
  colorlessEnergyType:9,
  specialConditions:{}
};
const pokemon=(printing,retreat,energies,attacks)=>({
  printing,energies,attacks,
  printed:{retreatCost:Array(retreat).fill(9)},
  publicRestrictions:{}
});
const fixture=activeEnergy=>({
  actorSeat:0,globalTurn:16,phase:3,decisionKind:'owner-root',
  ownHand:['Guzma BUS'],
  ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
  ownPublic:{
    active:pokemon('Snorlax PGO',4,[activeEnergy],[
      {name:'Collapse',cost:[9,9,9,9],damage:150}]),
    bench:[pokemon('Bunnelby PRC',2,['Water Energy'],[
      {name:'Burrow',cost:[9],damage:null,
        text:"Discard the top card of your opponent's deck."},
      {name:'Rototiller',cost:[9],damage:null,
        text:'Shuffle a card from your discard pile into your deck.'}])],
    publicTurnRestrictions:{
      supporterPlayLocked:false,attackLockTurnsRemaining:0}
  },
  opponentPublic:{bench:[pokemon('Dialga-GX UPR',3,[],[
    {name:'Overclock',cost:[8],damage:null}])]}
});

test('actual source Capture Energy vetoes preexisting damage-only mobility frontier',()=>{
  const owner=fixture('Capture Energy RCL');
  assert.equal(chooseHeldGuzmaMobility(owner,catalog),null);
  const rescue=ownerGuzmaMobilityOption(owner);
  assert.equal(rescue.ownerPrinting,'Bunnelby PRC');
  assert.equal(rescue.nominalAttackName,'Burrow');
});

test('even basic-energy Active cannot activate old mobility for non-damaging Burrow',()=>{
  const owner=fixture('Water Energy');
  const burrow=owner.ownPublic.bench[0].attacks[0];
  assert.equal(eligibleDamagingAttack(owner.ownPublic.bench[0],burrow,catalog),false);
  assert.equal(chooseHeldGuzmaMobility(owner,catalog),null);
  assert.equal(ownerGuzmaMobilityOption(owner).nominalAttackName,'Burrow');
});

test('new nominal control line respects printed Supporter quota and Bench presence',()=>{
  const a=fixture('Capture Energy RCL');
  a.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(ownerGuzmaMobilityOption(a),null);
  const b=fixture('Capture Energy RCL');
  b.opponentPublic.bench=[];
  assert.equal(ownerGuzmaMobilityOption(b),null);
});
