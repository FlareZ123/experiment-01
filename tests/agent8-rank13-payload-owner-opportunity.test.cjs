'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {SOURCE_DRAGONS,observeRank13PayloadOwnerOpportunity}=
  require('../simulation/twinleaf/agent8-rank13-payload-owner-opportunity.cjs');
function actor(overrides={}){
  return {globalTurn:6,decisionKind:'owner-root',
    ownHand:['Battle Compressor PHF','Dragapult ex TWM'],
    ownPublic:{active:{printing:'Regidrago VSTAR SIT'},bench:[],discard:[]},
    ownTurnResources:{itemPlayLocked:false,supporterPlayLocked:false},
    ...overrides};
}
test('recognizes held Compressor and missing public Dragon with Regidrago present',()=>{
  const r=observeRank13PayloadOwnerOpportunity(actor());
  assert.equal(r.heldCompressorWhilePayloadMissing,true);
  assert.equal(r.handCounts.battleCompressor,1);
  assert.deepEqual(r.heldDragonPrintings,['Dragapult ex TWM']);
  assert.equal(r.regidragoVstarActive,true);
  assert.equal(r.sourceOwnerOnly,true);
});
test('public Dragon payload removes the missing-payload flag',()=>{
  const ownPublic={active:{printing:'Regidrago V SIT'},bench:[],
    discard:['Noivern ex PAL']};
  const r=observeRank13PayloadOwnerOpportunity(actor({ownPublic}));
  assert.equal(r.heldCompressorWhilePayloadMissing,false);
  assert.deepEqual(r.eligiblePublicDragonDiscard,['Noivern ex PAL']);
});
test('Item lock and unresolved prompt cannot become a legal root',()=>{
  const locked=actor({ownTurnResources:{itemPlayLocked:true,
    supporterPlayLocked:false}});
  assert.equal(observeRank13PayloadOwnerOpportunity(locked)
    .heldCompressorWhilePayloadMissing,false);
  assert.equal(observeRank13PayloadOwnerOpportunity(
    actor({decisionKind:'owner-prompt'}))
    .heldCompressorWhilePayloadMissing,false);
});
test('does not promote held Compressor without a Regidrago board',()=>{
  const ownPublic={active:{printing:'Budew ASC'},bench:[],discard:[]};
  assert.equal(observeRank13PayloadOwnerOpportunity(actor({ownPublic}))
    .heldCompressorWhilePayloadMissing,false);
});
test('only exact source Dragon printings are counted',()=>{
  assert.equal(SOURCE_DRAGONS.size,7);
  const r=observeRank13PayloadOwnerOpportunity(actor({
    ownHand:['Battle Compressor PHF','Latias ex SSP',
      'Dragapult ex TWM','Dragapult ex TWM']
  }));
  assert.deepEqual(r.heldDragonPrintings,
    ['Dragapult ex TWM','Dragapult ex TWM']);
});
