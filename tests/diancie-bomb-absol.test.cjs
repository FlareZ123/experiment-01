'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {diancieVsAbsol} = require('../scripts/diancie-bomb-absol.cjs');
test('Garbotoxin removes Diamond Coat and enables Bomb', () => {
  const off=diancieVsAbsol({garbotoxin:false,muscleBand:false,giantBomb:true});
  const on=diancieVsAbsol({garbotoxin:true,muscleBand:false,giantBomb:true});
  assert.deepEqual([off.incoming,off.bombCounters,off.combinedDamage],[170,0,240]);
  assert.deepEqual([on.incoming,on.bombCounters,on.combinedDamage],[200,100,340]);
});
test('Muscle Band raises incoming to 190 with Diamond Coat',()=>{const x=diancieVsAbsol({garbotoxin:false,muscleBand:true,giantBomb:true});assert.equal(x.incoming,190);assert.equal(x.bombCounters,100);});
