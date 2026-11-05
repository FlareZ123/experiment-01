'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditSkylinerPostpivotPass} =
  require('../scripts/agent17-skyliner-postpivot-pass-hand-bound.cjs');

function manifest() {
  return {decks:[{
    rank:3,category_counts:{'Pokémon':11,Trainer:44,Energy:5},
    cards:[
      {category:'Pokémon',name:'Snorlax',printing:{set:'PGO'},count:8},
      {category:'Pokémon',name:'Girafarig',printing:{set:'LOT'},count:1},
      {category:'Pokémon',name:'Mimikyu',printing:{set:'PAL'},count:2},
      {category:'Energy',name:'Water Energy',printing:{set:'MEE'},count:5},
      {category:'Trainer',name:'Arven',printing:{set:'OBF'},count:44}
    ]
  }]};
}

function archive() {
  const turns=[59,61,63,65,67];
  const positions={59:27,61:20,67:21};
  const printings={
    59:'Water Energy MEE',61:'Girafarig LOT',67:'Mimikyu PAL'};
  const ledger=[];
  const events=[];
  for (const turn of turns) {
    const base=turn*10;
    if (positions[turn] !== undefined) {
      ledger.push({actionOrdinal:base,turnBefore:turn,playerSlot:0,
        action:'PlayCardAction'});
      events.push({rootActionOrdinal:base,playerSlot:0,storeAccepted:true,
        action:'PlayCardAction',declared:{
          ownerHandPrinting:printings[turn],handIndex:positions[turn]}});
    }
    ledger.push({actionOrdinal:base+1,turnBefore:turn,
      playerSlot:0,action:'PassTurnAction'});
  }
  return {rawArms:[{seed:3792360798,rank3Seat:0,rank1Seat:1,
    mode:'bilateral-skyliner-free-retreat',status:'native-terminal',
    id:'3792360798:0:skyliner-free-pivot',winner:1,
    rootActionLedger:ledger,nativeAcceptedTargetSidecar:{
      rootOrdinalLinked:true,events}}]};
}

test('three accepted hand indices prove exact conservative category bounds',
  () => {
    const result=auditSkylinerPostpivotPass(archive(),manifest());
    assert.deepEqual(result.passReplies.map(r => r.minimumTrainersAtPass),
      [12,5,null,null,6]);
    assert.equal(result.certifiedMinimumTrainerTurns,3);
    assert.equal(result.actualTrainerPlayabilityCertified,false);
  });

test('unaccepted play and ambiguous intervening action fail closed',() => {
  const a=archive();
  a.rawArms[0].nativeAcceptedTargetSidecar.events[0].storeAccepted=false;
  assert.throws(()=>auditSkylinerPostpivotPass(a,manifest()),/Unaccepted/);
  a.rawArms[0].nativeAcceptedTargetSidecar.events[0].storeAccepted=true;
  a.rawArms[0].rootActionLedger.push({
    actionOrdinal:590.5,turnBefore:59,playerSlot:0,
    action:'ResolvePromptAction'});
  assert.throws(()=>auditSkylinerPostpivotPass(a,manifest()),
    /immediate hand cardinality/);
});

test('no owner-hand witness cannot be described as zero Trainer options',() => {
  const a=archive();
  a.rawArms[0].rootActionLedger =
    a.rawArms[0].rootActionLedger.filter(row=>row.action!=='PlayCardAction');
  const result=auditSkylinerPostpivotPass(a,manifest());
  assert.deepEqual(result.passReplies.map(r=>r.minimumTrainersAtPass),
    [null,null,null,null,null]);
  assert.equal(result.certifiedMinimumTrainerTurns,0);
});
