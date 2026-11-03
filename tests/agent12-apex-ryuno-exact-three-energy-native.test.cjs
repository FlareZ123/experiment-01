'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {inspectRyunoGlideDiscard}=
  require('../simulation/twinleaf/apex-mega-dragonite-energy-discard.cjs');

for(const setNumber of ['152','271']){
  test('Apex Dragon copied Ryuno Glide with one Double Dragon and one Basic Grass, ASC '+setNumber,()=>{
    const receipt=inspectRyunoGlideDiscard({setNumber,energyScenario:'exact-apex'});
    assert.equal(receipt.energyScenario,'exact-apex');
    assert.equal(receipt.printedSetNumber,setNumber);
    assert.equal(receipt.printedAttack.name,'Ryuno Glide');
    assert.equal(receipt.printedAttack.damage,330);
    assert.equal(receipt.beforeAttached.length,2);
    assert.equal(receipt.beforeAttached.filter(name=>/Double Dragon Energy/.test(name)).length,1);
    assert.equal(receipt.beforeAttached.filter(name=>/Grass Energy/.test(name)).length,1);
    assert.equal(receipt.oneDdeEffectCompleted,true);
    assert.equal(receipt.discardContainsDoubleDragon,true);
    assert.equal(receipt.afterAttached.length,1);
    assert.match(receipt.afterAttached[0],/Grass Energy/);
    assert.equal(receipt.damage,330);
    assert.equal(receipt.qualifiedForCompetitiveInference,false);
    const energy=receipt.pending.find(p=>p.kind==='ChooseEnergyPrompt');
    assert.ok(energy);
    assert.equal(energy.candidates.find(x=>x.name==='one-Double-Dragon')?.accepted,true);
    console.log(JSON.stringify({
      printing:receipt.printedPayload,
      scenario:receipt.energyScenario,
      before:receipt.beforeAttached,
      after:receipt.afterAttached,
      damage:receipt.damage,
      allNativePrompts:receipt.pending,
      paperGameQualification:false
    }));
  });
}
