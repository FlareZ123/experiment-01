'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {audit}=require('../simulation/twinleaf/regidrago-dragon-discard-access-audit.cjs');
/** @param {number} turn @param {string[]} cards @param {number} seat */
function sample(turn,cards,seat=1) {
  return {playerSlot:seat,turnBefore:turn,actionOrdinal:turn*10,
    action:'PlayCardAction',card:'Mysterious Treasure',
    decisionHandBefore:{perspectiveSeat:seat,ownHandPrintings:cards}};
}
test('one physical owner with printed Dragon and Item records one window',()=>{
  const trace=[sample(3,['Dragapult ex TWM','Mysterious Treasure FLI']),
    sample(3,['Dragapult ex TWM','Mysterious Treasure FLI']),
    sample(4,['Hisuian Goodra VSTAR LOR','Professor\'s Research JTG'])];
  const x=audit(trace,1);
  assert.deepEqual(x.coPresentItemTurns,[3]);
  assert.deepEqual(x.coPresentSupporterTurns,[4]);
  assert.equal(x.windows.length,2);
});
test('no hidden opponent-hand mixing and Compressor is independent',()=>{
  const trace=[sample(2,['Dragapult ex TWM','Quick Ball FST'],0),
    sample(2,['Dragapult ex TWM','Battle Compressor PHF'],1),
    sample(3,['Battle Compressor PHF'],1),
    sample(3,['Kyurem SFA'])];
  const x=audit(trace,1);
  assert.equal(x.windows.length,3);
  assert.deepEqual(x.coPresentItemTurns,[]);
  assert.equal(x.windows[0].compressor,true);
  assert.deepEqual(x.windows[2].payload,['Kyurem SFA']);
});
