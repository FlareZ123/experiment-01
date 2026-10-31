'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {compareOwnerEnergyDenialSupporters:compare}=
  require('../simulation/twinleaf/agent4-supporter-energy-denial-contest.cjs');

function root(hand=['Plumeria BUS','Team Flare Grunt XY','Crushing Hammer POR','Guzma BUS']){
  return {decisionKind:'owner-root',globalTurn:3,ownHand:hand,
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{resolvingSupporter:[],
      publicTurnRestrictions:{supporterPlayLocked:false}},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM',
      energies:['Speed Lightning Energy RCL']},
    bench:[null,{printing:'Regidrago V SIT',
      energies:['Double Dragon Energy ROS']}]},
    hiddenOpponentHand:['unknown']};
}

test('one opposing Active target overlaps and one Bench target is Plumeria-only',()=>{
  const x=compare(root());
  assert.equal(x.flare.length,1);
  assert.equal(x.plumeriaOffers,1);
  assert.equal(x.sharedActiveEnergyTargets.length,1);
  assert.equal(x.plumeriaExclusiveBenchEnergyTargets.length,1);
  assert.equal(x.supporterQuotaContended,true);
  assert.equal(x.bothNativePlayabilitiesUnverified,true);
  assert.equal(x.policyActionChosen,false);
});

test('physical two-card Plumeria payment can consume its competing Supporter',()=>{
  const x=compare(root());
  assert.equal(x.plumeriaPhysicalPaymentPairs,3);
  assert.equal(x.plumeriaPairsConsumingFlare,2);
  assert.equal(x.plumeriaPairsPreservingFlare,1);
});

test('with only three hand cards every Plumeria payment must consume Flare',()=>{
  const x=compare(root(['Plumeria BUS','Team Flare Grunt XY','Crushing Hammer POR']));
  assert.equal(x.plumeriaPhysicalPaymentPairs,1);
  assert.equal(x.plumeriaPairsConsumingFlare,1);
  assert.equal(x.plumeriaPairsPreservingFlare,0);
});

test('Team Flare remains available with no held Plumeria',()=>{
  const x=compare(root(['Team Flare Grunt XY']));
  assert.equal(x.flare.length,1);
  assert.equal(x.plumeriaOffers,0);
  assert.equal(x.supporterQuotaContended,false);
});

test('Plumeria Bench target survives lack of held Team Flare',()=>{
  const x=compare(root(['Plumeria BUS','Crushing Hammer POR','Guzma BUS']));
  assert.equal(x.flare.length,0);
  assert.equal(x.plumeriaOffers,1);
  assert.equal(x.sharedActiveEnergyTargets.length,0);
  assert.equal(x.plumeriaExclusiveBenchEnergyTargets.length,1);
  assert.equal(x.supporterQuotaContended,false);
});

test('supporter restriction and quota exclude both competing proposals',()=>{
  const a=root();a.globalTurn=1;
  assert.equal(compare(a).flare.length,0);
  assert.equal(compare(a).plumeriaOffers,0);
  const b=root();b.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(compare(b).flare.length,0);
  assert.equal(compare(b).plumeriaOffers,0);
});

test('duplicate attached Active Energy are distinct physical target ordinals',()=>{
  const v=root();v.opponentPublic.active.energies=[
    'Speed Lightning Energy RCL','Speed Lightning Energy RCL'];
  const x=compare(v);
  assert.deepEqual(x.sharedActiveEnergyTargets.map(t=>t.energyIndex),[0,1]);
  assert.equal(x.flare[0].publicTargets.length,2);
});

test('bench-only opposing Energy denies Team Flare target, keeps Plumeria',()=>{
  const v=root();v.opponentPublic.active.energies=[];
  const x=compare(v);
  assert.equal(x.flare.length,0);
  assert.equal(x.plumeriaOffers,1);
  assert.equal(x.sharedActiveEnergyTargets.length,0);
  assert.equal(x.plumeriaExclusiveBenchEnergyTargets.length,1);
});

test('two physical Plumeria copies yield separately payable alternative pairs',()=>{
  const x=compare(root(['Plumeria BUS','Plumeria BUS',
    'Team Flare Grunt XY','Crushing Hammer POR']));
  assert.equal(x.plumeriaOffers,2);
  assert.equal(x.plumeriaPhysicalPaymentPairs,6);
  assert.equal(x.plumeriaPairsConsumingFlare,4);
  assert.equal(x.plumeriaPairsPreservingFlare,2);
});

test('single Flare with too few other hand cards cannot fund Plumeria',()=>{
  const x=compare(root(['Plumeria BUS','Team Flare Grunt XY']));
  assert.equal(x.flare.length,1);
  assert.equal(x.plumeriaOffers,0);
  assert.equal(x.plumeriaPhysicalPaymentPairs,0);
});

test('opponent concealed zone differences cannot change source decision frontier',()=>{
  const a=root(),b=root();
  b.hiddenOpponentHand=['Lost Vacuum','Secret Box','Marnie'];
  assert.deepEqual(compare(a),compare(b));
});

test('comparison does not mutate actor root',()=>{
  const r=root(),snapshot=structuredClone(r);
  compare(r);assert.deepEqual(r,snapshot);
});
