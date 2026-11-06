'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {main}=require('../simulation/evaluation/agent27-adp-original29-four-bonus-bounds.cjs');
test('29 authenticated original Basic counts reproduce full-field mechanical bounds',()=>{
 const r=main();
 assert.equal(r.originals,29);
 assert.deepEqual(r.missing,[23,25,28]);
 const masses=[r.massNoBonus,...r.massOneThroughFour,r.massFivePlus];
 assert.ok(Math.abs(masses.reduce((s,v)=>s+v,0)-1)<1e-12);
 const expected=[.8560551267989686,.09759562939962946,.025437328450054572,
   .009636887153935065,.004756416137394165,.006518612060018227];
 expected.forEach((v,i)=>assert.ok(Math.abs(v-masses[i])<1e-12,'mass '+i));
 const targets={mechanical:[.3885817046773794,.3916710205726219],
  dragons:[.20927680420755032,.21339782844046867],
  dragonsEnergy:[.27803831907070353,.2814840055738256],
  dragonsEnergyCompressor:[.3132401066183005,.31648717884760225]};
 for(const [p,[lo,hi]] of Object.entries(targets)){
  assert.ok(Math.abs(r.axes[p].lower-lo)<1e-12,p+' lower');
  assert.ok(Math.abs(r.axes[p].upper-hi)<1e-12,p+' upper');
  assert.ok(r.axes[p].lower<=r.axes[p].upper);
 }
 assert.equal(r.qualifiedGames,0);
});
