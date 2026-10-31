'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {collectOwnerPlumeriaPaymentMenu: menu} =
  require('../simulation/twinleaf/agent4-plumeria-payment-menu.cjs');

function view(hand=['Plumeria BUS','Crushing Hammer POR','Enhanced Hammer TWM',
  'Guzma BUS'],turn=3){
  return {decisionKind:'owner-root',globalTurn:turn,ownHand:hand,
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{resolvingSupporter:[],
      publicTurnRestrictions:{supporterPlayLocked:false}},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM',
      energies:['Speed Lightning Energy RCL','Speed Lightning Energy RCL']},
      bench:[null,{printing:'Regidrago V SIT',energies:[
        'Double Dragon Energy ROS']} ]},
    opponentHiddenHand:['unknown'],opponentHiddenPrizes:['unknown']};
}

test('exact original physical payment indices remain distinguishable',()=>{
  const x=menu(view());
  assert.equal(x.offers.length,1);
  assert.equal(x.offers[0].handIndex,0);
  assert.equal(x.totalPaymentPairs,3);
  assert.deepEqual(x.offers[0].paymentPairs.map(p=>p.handIndices),
    [[1,2],[1,3],[2,3]]);
  assert.equal(x.offers[0].nativeDispatchImplemented,false);
  assert.equal(x.nativePlayability,'unverified');
});

test('two physical equal-printing opponent Energy targets are retained',()=>{
  const x=menu(view());
  assert.deepEqual(x.targets.map(t=>[t.slot,t.index,t.energyIndex]),
    [['active',0,0],['active',0,1],['bench',1,0]]);
  assert.deepEqual(x.targets.map(t=>t.energyPrinting),[
    'Speed Lightning Energy RCL','Speed Lightning Energy RCL',
    'Double Dragon Energy ROS']);
});

test('all card payment combinations exclude only the Plumeria being played',()=>{
  const x=menu(view(['Plumeria BUS','Plumeria BUS','Guzma BUS']));
  assert.equal(x.offers.length,2);
  assert.deepEqual(x.offers.map(o=>o.paymentPairs),[
    [{handIndices:[1,2],printings:['Plumeria BUS','Guzma BUS']}],
    [{handIndices:[0,2],printings:['Plumeria BUS','Guzma BUS']}]
  ]);
});

test('no third physical hand card means no affordable two-card payment',()=>{
  const x=menu(view(['Plumeria BUS','Guzma BUS']));
  assert.equal(x.reason,'insufficient-other-hand-cards');
  assert.equal(x.offers.length,0);
});

test('real paper Supporter quota and lock boundaries suppress the offer',()=>{
  assert.equal(menu(view(undefined,1)).reason,
    'paper-first-player-supporter-restricted');
  const a=view();a.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(menu(a).reason,'supporter-quota-or-lock');
  const b=view();b.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(menu(b).reason,'supporter-quota-or-lock');
  const c=view();c.ownPublic.resolvingSupporter=['Guzma BUS'];
  assert.equal(menu(c).reason,'supporter-quota-or-lock');
});

test('unattached opponent yields zero target options',()=>{
  const v=view();v.opponentPublic.active.energies=[];
  v.opponentPublic.bench[1].energies=[];
  assert.equal(menu(v).reason,'no-public-energy-denial-target');
});

test('opponent hidden identities never alter independent payment menu',()=>{
  const a=view(),b=view();
  b.opponentHiddenHand=['Lusamine CIN','Secret Box'];
  b.opponentHiddenPrizes=['Double Dragon Energy ROS'];
  assert.deepEqual(menu(a),menu(b));
});

test('detached actor-owned observation is read-only',()=>{
  const v=view();
  const before=structuredClone(v);
  menu(v);
  assert.deepEqual(v,before);
});

test('up to 60 physical cards are enumerable without target Cartesian expansion',()=>{
  const hand=['Plumeria BUS',...Array(59).fill('Psychic Energy MEE')];
  const x=menu(view(hand));
  assert.equal(x.totalPaymentPairs,1711);
  assert.equal(x.targets.length,3);
  assert.equal(x.offers[0].paymentPairs.length,1711);
});
