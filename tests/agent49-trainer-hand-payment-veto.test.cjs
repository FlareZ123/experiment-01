'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  necessaryTrainerHandPaymentGate,VERSION
} = require('../simulation/twinleaf/agent49-trainer-hand-payment-veto.cjs');

/** @param {string[]} hand */
function view(hand) {
  return Object.freeze({decisionKind:'owner-root',actorSeat:0,
    globalTurn:5,ownHand:Object.freeze([...hand]),
    opponentPublic:Object.freeze({
      handCount:99,hiddenHand:['MUST_NOT_BE_USED']
    })});
}
/** @param {string} printing @param {string} type */
const trainer=(printing,type='Item')=>Object.freeze({
  printing,type,handIndex:0,publicBlocker:null
});

test('exhausted mandatory physical Quick Ball and Secret Box costs veto',()=>{
  assert.match(VERSION,/agent49/);
  for(const [printing,minimum] of [
    ['Quick Ball FST',1],['Ultra Ball MEG',2],
    ['Secret Box TWM',3],['Dowsing Machine PLS',2]
  ]){
    const v=view([printing,...Array.from({length:minimum-1},
      (_,i)=>'Filler '+i)]);
    const r=necessaryTrainerHandPaymentGate(v,trainer(printing));
    assert.equal(r.knownPrintedCost,true);
    assert.equal(r.blocked,true);
    assert.equal(r.reason,'all-known-mandatory-hand-cost-modes-impossible');
    assert.equal(r.modeReceipts[0].physicalOtherCards,minimum-1);
    const w=view([...v.ownHand,'Another']);
    const yes=necessaryTrainerHandPaymentGate(w,trainer(printing));
    assert.equal(yes.blocked,false);
    assert.equal(yes.modeReceipts[0].physicallyAffordable,true);
    assert.equal(yes.paperPlayable,null);
  }
});

test('Plumeria Supporter requires two non-source hand cards',()=>{
  const none=necessaryTrainerHandPaymentGate(
    view(['Plumeria BUS','A']),trainer('Plumeria BUS','Supporter'));
  assert.equal(none.blocked,true);
  assert.equal(none.modeReceipts[0].requiredDiscards,2);
  const allowed=necessaryTrainerHandPaymentGate(
    view(['Plumeria BUS','A','B']),trainer('Plumeria BUS','Supporter'),
    new Set([1,2]));
  assert.equal(allowed.blocked,false);
  assert.equal(allowed.modeReceipts[0].affordablePreservingProtected,false);
  assert.equal(allowed.modeReceipts[0].forcedProtectedSacrifices,2);
});

test('optional enhanced Supporters preserve their zero-payment mode',()=>{
  for(const [printing,cost] of [
    ['Bellelba & Brycen-Man CEC',3],
    ['Cynthia & Caitlin CEC',1],
    ['Guzma & Hala CEC',2]
  ]){
    const r=necessaryTrainerHandPaymentGate(
      view([printing]),trainer(printing,'Supporter'));
    assert.equal(r.blocked,false);
    assert.deepEqual(r.modeReceipts.map(x=>x.requiredDiscards),
      [0,cost]);
    assert.deepEqual(r.modeReceipts.map(x=>x.physicallyAffordable),
      [true,false]);
    assert.equal(r.paperPlayable,null);
  }
});

test('unmodeled source printing stays unknown without false veto',()=>{
  const r=necessaryTrainerHandPaymentGate(
    view(['Unknown Source Item UNK']),trainer('Unknown Source Item UNK'));
  assert.equal(r.knownPrintedCost,false);
  assert.equal(r.blocked,false);
  assert.equal(r.reason,'no-verified-fixed-cardinality-print-cost');
  assert.deepEqual(r.modeReceipts,[]);
});

test('native Tool metadata bridges exact paper Pokémon Tool cost only',()=>{
  const v=view(['Float Stone BKT']);
  const native=necessaryTrainerHandPaymentGate(
    v,trainer('Float Stone BKT','Tool'));
  const paper=necessaryTrainerHandPaymentGate(
    v,trainer('Float Stone BKT','Pokémon Tool'));
  assert.deepEqual(native,paper);
  assert.equal(native.knownPrintedCost,true);
  assert.equal(native.blocked,false);
  assert.equal(native.paperPlayable,null);
  assert.throws(()=>necessaryTrainerHandPaymentGate(
    v,trainer('Float Stone BKT','Item')),
  /Public Trainer class differs/);
});

test('candidate must point to genuine owner hand and correct public type',()=>{
  const v=view(['Plumeria BUS','A','B']);
  assert.throws(()=>necessaryTrainerHandPaymentGate(
    v,trainer('Plumeria BUS','Item')),/Public Trainer class differs/);
  assert.throws(()=>necessaryTrainerHandPaymentGate(v,{
    handIndex:0,printing:'Secret Box TWM',type:'Item'
  }),/Expected values|strictEqual/);
  assert.throws(()=>necessaryTrainerHandPaymentGate(v,{
    handIndex:2,printing:'Plumeria BUS',type:'Supporter'
  }),/Expected values|strictEqual/);
});

test('different opponent hidden values never influence the owner-payment gate',()=>{
  const a=view(['Secret Box TWM','One','Two']);
  const b={...a,opponentPublic:{hiddenHand:['DIFFERENT'],
    handCount:99}};
  const x=necessaryTrainerHandPaymentGate(a,trainer('Secret Box TWM'));
  const y=necessaryTrainerHandPaymentGate(b,trainer('Secret Box TWM'));
  assert.deepEqual(x,y);
  assert.equal(x.blocked,true);
});
