'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {fixedFrame,observe}=
  require('../simulation/twinleaf/rank6-hood-prospective-exposure.cjs');

test('frozen rank6 frame has 16 distinct physical deals and both source seats',()=>{
  const frame=fixedFrame();
  assert.equal(frame.length,16);
  assert.deepEqual(frame,fixedFrame());
  assert.equal(new Set(frame.map(row=>row.seed)).size,16);
  assert.equal(frame.filter(row=>row.sourceSeat===0).length,8);
  assert.equal(frame.filter(row=>row.sourceSeat===1).length,8);
  assert.ok(frame.every(row=>row.sourceSeat+row.candidateSeat===1));
});
/** @returns {object} Minimal root-observed source outcome. */
function fixture(){
  return {verifiedByDrawLog:true,firstTurnSlot:0,deckHashes:['source','hood'],
    attackDeclarationTrace:[{playerSlot:1,attackName:'Max Geist'},
      {playerSlot:0,attackName:'Volt Cyclone'}],
    finished:false,actions:140,prizesRemaining:[6,4]};
}
const item={repeat:1,sourceSeat:0,candidateSeat:1,seed:101};
test('actual physical Hood and accepted attached-and-drawn Door remain separate',()=>{
  const hood={events:[{kind:'selected-root-play',
    target:{slot:'BENCH',index:0,pokemon:'Shadow Rider Calyrex V CRE'},
    opponentActive:'Iron Thorns ex TWM'}]};
  const door={selected:true,events:[
    {kind:'selected-live-ability'},
    {kind:'verified-real-store-effect',attached:true,drawnTwo:true,
      hoodStillAttached:true,ironThornsStillActive:true}]};
  const attachments=[{turn:2,newTools:[{slot:'BENCH',index:0,
    pokemon:'Shadow Rider Calyrex V CRE',tool:'Stealthy Hood UNB'}]}];
  const result=observe(fixture(),item,'hood',hood,door,attachments);
  assert.equal(result.selectedHoodActions,1);
  assert.equal(result.matchingSelectedHoodAttachments,1);
  assert.equal(result.verifiedProtectedDoorEffects,1);
  assert.equal(result.candidateAttackDeclarations,1);
  assert.equal(result.opponentAttackDeclarations,1);
  assert.equal(result.engineTerminal,false);
  assert.equal(result.qualifiedCompetitiveGame,false);
});
test('selected action without actual physical Tool or full effect cannot qualify',()=>{
  const hood={events:[{kind:'selected-root-play',
    target:{slot:'BENCH',index:0,pokemon:'Shadow Rider Calyrex V CRE'},
    opponentActive:'Iron Thorns ex TWM'}]};
  const door={selected:true,events:[{kind:'verified-real-store-effect',
    attached:true,drawnTwo:true,ironThornsStillActive:false,
    hoodStillAttached:true}]};
  const x=observe(fixture(),item,'hood',hood,door,[]);
  assert.equal(x.selectedHoodActions,1);
  assert.equal(x.matchingSelectedHoodAttachments,0);
  assert.equal(x.verifiedProtectedDoorEffects,0);
  assert.equal(x.qualifiedCompetitiveGame,false);
});
test('reference arm maintains no fabricated Hood actions',()=>{
  const x=observe(fixture(),item,'champion',null,null,[]);
  assert.equal(x.selectedHoodActions,0);
  assert.equal(x.selectedProtectedDoor,false);
  assert.equal(x.verifiedProtectedDoorEffects,0);
});
test('missing verified first-turn draw log fails source certification',()=>{
  assert.throws(()=>observe({...fixture(),verifiedByDrawLog:false},
    item,'hood',null,null,[]),/Source true-start draw log missing/);
});
