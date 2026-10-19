'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {observe}=require('../simulation/twinleaf/rank6-hood-removal-replay.cjs');

const item={repeat:1,sourceSeat:0,candidateSeat:1,seed:42};
function game(){
  return {verifiedByDrawLog:true,firstTurnSlot:0,deckHashes:['rank6','hood'],
    attackDeclarationTrace:[{playerSlot:0,attackName:'Volt Cyclone'},
      {playerSlot:1,attackName:'Max Geist'}],
    actions:140,finished:false,prizesRemaining:[4,6]};
}
function physical(){
  return [{turnBefore:2,turnAfter:2,actorSeat:1,
    action:'PlayCardAction',previousCount:0,currentCount:1},
  {turnBefore:4,turnAfter:4,actorSeat:0,
    action:'ResolvePromptAction',previousCount:1,currentCount:0}];
}
test('selected opponent removal and actual reduction are distinct source facts',()=>{
  const hood={events:[{kind:'selected-root-play'}]};
  const door={events:[{kind:'verified-real-store-effect',attached:true,
    drawnTwo:true,ironThornsStillActive:true,hoodStillAttached:true}]};
  const source={events:[{kind:'selected-source-play',
    card:'Faba LOT',visibleTargets:[{pokemon:'Shadow Rider Calyrex V'}]}]};
  const r=observe(game(),item,'removal',hood,door,source,physical());
  assert.equal(r.sourceOwnerRemovalSelected,1);
  assert.equal(r.hoodActualAttachments,1);
  assert.equal(r.actualPhysicalHoodReductions,1);
  assert.equal(r.completedProtectedDoorEffects,1);
  assert.equal(r.sourceActuallyFirst,true);
  assert.equal(r.qualifiedCompetitiveGame,false);
});
test('selected Faba with no physical reduction counts zero actual removal',()=>{
  const r=observe(game(),item,'removal',{events:[]},{events:[]},
    {events:[{kind:'selected-source-play'}]},[]);
  assert.equal(r.sourceOwnerRemovalSelected,1);
  assert.equal(r.actualPhysicalHoodReductions,0);
  assert.equal(r.completedProtectedDoorEffects,0);
});
test('unqualified raw root events and missing verification never certify a competitive game',()=>{
  const r=observe(game(),item,'control',{events:[]},{events:[]},null,[]);
  assert.equal(r.qualifiedCompetitiveGame,false);
  assert.equal(r.sourceOwnerRemovalSelected,0);
  assert.equal(r.engineFinished,false);
  assert.throws(()=>observe({...game(),verifiedByDrawLog:false},item,
    'control',{events:[]},{events:[]},null,[]),/true/);
});
