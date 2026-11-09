'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {chooseSentinelPostGustJet} =
  require('../../simulation/twinleaf/2026-11/agent20-sentinel-postgust-jet.cjs');

function view() {
  return {
    decisionKind:'owner-root', actorSeat:0, globalTurn:4,
    ownHand:['Jet Energy PAL','Guzma BUS'],
    ownPublic:{
      active:{printing:'Vileplume AOR',energies:[],tools:[]},
      bench:[null,{printing:'Bunnelby PRC',energies:['Jet Energy PAL']}],
      publicTurnRestrictions:{energyPlayLocked:false,
        specialEnergyPlayLocked:false}
    },
    ownTurnResources:{energyPlayedTurn:2,
      energyPlayLocked:false,specialEnergyPlayLocked:false}
  };
}

test('owner-held second Jet switches out gusted Vileplume',()=>{
  assert.deepEqual(chooseSentinelPostGustJet(view()),{
    kind:'attach-jet-to-escape-item-lock',handIndex:0,benchIndex:1,
    printing:'Jet Energy PAL',targetPrinting:'Bunnelby PRC'
  });
});

test('once-per-turn attachment already spent prevents second attachment',()=>{
  const x=view();x.ownTurnResources.energyPlayedTurn=4;
  assert.equal(chooseSentinelPostGustJet(x),null);
});

test('both player-wide Energy locks veto proposal',()=>{
  for(const key of ['energyPlayLocked','specialEnergyPlayLocked']){
    const r=view();r.ownTurnResources[key]=true;
    assert.equal(chooseSentinelPostGustJet(r),null);
    const p=view();p.ownPublic.publicTurnRestrictions[key]=true;
    assert.equal(chooseSentinelPostGustJet(p),null);
  }
});

test('missing owner Jet or funded Bench, wrong Active veto action',()=>{
  const noJet=view();noJet.ownHand=['Guzma BUS'];
  assert.equal(chooseSentinelPostGustJet(noJet),null);
  const noEnergy=view();noEnergy.ownPublic.bench[1].energies=[];
  assert.equal(chooseSentinelPostGustJet(noEnergy),null);
  const noBench=view();noBench.ownPublic.bench=[];
  assert.equal(chooseSentinelPostGustJet(noBench),null);
  const other=view();other.ownPublic.active.printing='Bunnelby PRC';
  assert.equal(chooseSentinelPostGustJet(other),null);
});

test('Temple of Sinnoh makes attached Jet lose its switch effect',()=>{
  const owned=view();owned.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(chooseSentinelPostGustJet(owned),null);
  const opposing=view();opposing.opponentPublic={
    stadium:['Temple of Sinnoh ASR']
  };
  assert.equal(chooseSentinelPostGustJet(opposing),null);
  const irrelevant=view();irrelevant.ownPublic.stadium=['Artazon PAL'];
  assert.equal(chooseSentinelPostGustJet(irrelevant)?.kind,
    'attach-jet-to-escape-item-lock');
});

test('no proposal outside authenticated owner root',()=>{
  const x=view();x.decisionKind='owner-prompt';
  assert.equal(chooseSentinelPostGustJet(x),null);
  assert.equal(chooseSentinelPostGustJet(null),null);
});
