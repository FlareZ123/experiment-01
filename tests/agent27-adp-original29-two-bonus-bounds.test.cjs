'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {main}=require('../simulation/evaluation/agent27-adp-original29-two-bonus-bounds.cjs');
const near=(x,y)=>assert.ok(Math.abs(x-y)<1e-10,`Got ${x}, expected ${y}`);
test('source exact two-bonus field bounds with three-plus tail',()=>{
 const x=main();assert.equal(x.originals,29);
 assert.deepEqual(x.missing,[23,25,28]);
 near(x.probabilityExactlyTwo,0.02543732845005458);
 near(x.probabilityThreePlus,0.02091191535134745);
 near(x.axes.mechanical.lower,0.38748659586950895);
 near(x.axes.mechanical.upper,0.39880208743818624);
 near(x.axes.dragons.lower,0.20789076610058344);
 near(x.axes.dragonsEnergyCompressor.upper,0.32406840240582363);
});
