'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseRealOwnerFloatStoneCounter,
  chooseOwnerMarshadowResettingHole}=
  require('../simulation/twinleaf/agent9-v7-floatstone-counterreply.cjs');

/** @returns {object} Opposing actor's own hand and public post-Guzma board. */
function observed(){
  return {decisionKind:'owner-root',globalTurn:6,actorSeat:1,
    ownHand:['Float Stone BKT','Psychic Energy MEE'],
    ownPublic:{
      active:{printing:'Marshadow UNB',tools:[]},
      bench:[{printing:'Tapu Lele-GX GRI',damage:140}],
      publicTurnRestrictions:{toolPlayLocked:false}},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM'}},
    ownTurnResources:{retreatedTurn:0,toolPlayLocked:false}};
}
test('counterline requires real actor-owned Tool and original benched Tapu Lele',()=>{
  const v=observed();
  assert.deepEqual(chooseRealOwnerFloatStoneCounter(v),{
    kind:'attach-floatstone-to-stranded-marshadow',
    handIndex:0,printing:'Float Stone BKT',nextBenchIndex:0});
  const withTool={...v,ownPublic:{...v.ownPublic,
    active:{...v.ownPublic.active,tools:['Float Stone BKT']}}};
  assert.deepEqual(chooseRealOwnerFloatStoneCounter(withTool),{
    kind:'retreat-to-original-tapu-lele',benchIndex:0,
    activePrinting:'Marshadow UNB',
    destinationPrinting:'Tapu Lele-GX GRI'});
  assert.equal(chooseRealOwnerFloatStoneCounter({...v,actorSeat:0}),null);
  assert.equal(chooseRealOwnerFloatStoneCounter({...v,globalTurn:7}),null);
  assert.equal(chooseRealOwnerFloatStoneCounter({...v,ownHand:[]}),null);
  assert.equal(chooseRealOwnerFloatStoneCounter({...v,
    ownPublic:{...v.ownPublic,bench:[]}}),null);
  assert.equal(chooseRealOwnerFloatStoneCounter({...v,
    ownTurnResources:{toolPlayLocked:true,retreatedTurn:0}}),null);
  assert.equal(chooseRealOwnerFloatStoneCounter({...withTool,
    ownTurnResources:{retreatedTurn:6}}),null);
});

test('benched Marshadow optional Resetting Hole needs public Thunder and used retreat',()=>{
  const owner=observed();
  const v={...owner,
    ownPublic:{active:{printing:'Tapu Lele-GX GRI'},
      bench:[{printing:'Marshadow UNB',
        tools:['Float Stone BKT'],abilities:['Resetting Hole']}]},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM'},
      stadium:['Thunder Mountain Prism Star LOT']},
    ownTurnResources:{...owner.ownTurnResources,retreatedTurn:6}};
  assert.deepEqual(chooseOwnerMarshadowResettingHole(v),{
    kind:'remove-thunder-with-benched-marshadow',benchIndex:0,
    printing:'Marshadow UNB'
  });
  assert.equal(chooseOwnerMarshadowResettingHole({...v,
    opponentPublic:{...v.opponentPublic,stadium:[]}}),null);
  assert.equal(chooseOwnerMarshadowResettingHole({...v,
    ownPublic:{...v.ownPublic,bench:[]}}),null);
  assert.equal(chooseOwnerMarshadowResettingHole({...v,
    ownTurnResources:{retreatedTurn:0}}),null);
  assert.equal(chooseOwnerMarshadowResettingHole({...v,
    actorSeat:0}),null);
});
