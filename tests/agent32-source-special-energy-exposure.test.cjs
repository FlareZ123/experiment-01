'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {SPECIAL_ONLY_ORIGINALS,choose,noEnergyAdditionalDraws,
  sourceSpecialEnergyExposure:energy}=
  require('../simulation/evaluation/agent32-source-special-energy-exposure.cjs');

function close(actual,expected,tolerance=1e-11){
  assert.ok(Math.abs(actual-expected)<tolerance,
    'Expected '+expected+', got '+actual);
}
test('integer combinations and hypergeometric survival are exact here',()=>{
  assert.equal(choose(60,7),386206920);
  assert.equal(choose(6,7),0);
  close(noEnergyAdditionalDraws(8,1),45/53);
  close(noEnergyAdditionalDraws(8,2),(45/53)*(44/52));
  assert.equal(noEnergyAdditionalDraws(8,46),0);
});
test('rank6 first-seven baseline agrees with independent source audit',()=>{
  const baseline=energy({sourceBasics:4,sourceSpecialEnergy:8,
    contenderBasics:60});
  close(baseline.probabilityBonusAtLeastOne,0);
  close(baseline.energyAccessUpper,0.6101129357327705);
  close(baseline.originalSevenEnergyAccess,0.6101129357327705);
  const draw=energy({sourceBasics:4,sourceSpecialEnergy:8,
    contenderBasics:60,ordinaryDraw:1});
  close(draw.energyAccessUpper,0.6689638133580127);
});
test('correct simultaneous failure correction, source rank6 vs 7-Basic pilot',()=>{
  const result=energy({sourceBasics:4,sourceSpecialEnergy:8,
    contenderBasics:7});
  close(result.probabilityBonusAtLeastOne,0.20971010738377938);
  close(result.expectedBonusOffers,0.3490052334976388);
  close(result.energyAccessUpper,0.6289501552879545);
  close(result.originalSevenEnergyAccess,0.6101129357327705);
  assert.ok(result.energyAccessLower>=result.originalSevenEnergyAccess);
  assert.ok(result.censoredTailUpper<1e-18);
});
test('rank6 source access differs against 14-Basic reference',()=>{
  const result=energy({sourceBasics:4,sourceSpecialEnergy:8,
    contenderBasics:14});
  close(result.probabilityBonusAtLeastOne,0.060393062632150364);
  close(result.expectedBonusOffers,0.07010959980469617);
  close(result.energyAccessUpper,0.6141512504629808);
  close(result.originalSevenEnergyAccess,0.6101129357327705);
  close(energy({sourceBasics:4,sourceSpecialEnergy:8,
    contenderBasics:7,ordinaryDraw:1}).energyAccessUpper,0.6852385887454201);
  close(energy({sourceBasics:4,sourceSpecialEnergy:8,
    contenderBasics:14,ordinaryDraw:1}).energyAccessUpper,0.6724570496188382);
});
test('seven authenticated Special-only originals remain distinct inputs',()=>{
  assert.deepEqual(SPECIAL_ONLY_ORIGINALS.map(x=>x.rank),
    [4,5,6,7,17,24,29]);
  const expected=[0.8174710441424986,0.40442138393858773,
    0.6289501552879545,0.4068277325512558,
    0.8174710441424986,0.6289501552879545,0.6289501552879545];
  for(const [i,row] of SPECIAL_ONLY_ORIGINALS.entries()){
    const p=energy({sourceBasics:row.basicPokemon,
      sourceSpecialEnergy:row.specialEnergy,contenderBasics:7});
    close(p.energyAccessUpper,expected[i]);
  }
});
test('physical validity and censorship bounds fail closed',()=>{
  assert.throws(()=>energy({sourceBasics:60,sourceSpecialEnergy:1,
    contenderBasics:7}),RangeError);
  assert.throws(()=>energy({sourceBasics:4,sourceSpecialEnergy:8,
    contenderBasics:7,ordinaryDraw:2}),RangeError);
  for(const row of SPECIAL_ONLY_ORIGINALS){
    const a=energy({sourceBasics:row.basicPokemon,
      sourceSpecialEnergy:row.specialEnergy,contenderBasics:7});
    const b=energy({sourceBasics:row.basicPokemon,
      sourceSpecialEnergy:row.specialEnergy,contenderBasics:14});
    assert.ok(a.energyAccessLower>=b.energyAccessUpper);
    assert.ok(a.energyAccessLower<=a.energyAccessUpper);
  }
});
