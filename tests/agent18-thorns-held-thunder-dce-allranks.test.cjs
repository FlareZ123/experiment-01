'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  ORIGINAL_IRON_THORNS_RANKS,groupOriginalSixty,
  directlyHeldThornsResources
}=require('../simulation/evaluation/agent18-thorns-held-thunder-dce-allranks.cjs');
const {heldStadiumEnergyWithoutSupporterConnectors,
  heldStadiumEnergyWithGuzma}=
  require('../simulation/evaluation/agent18-rank6-held-stadium-energy-bypass.cjs');

const EXPECTED={
  6:{
    basic:4,guzma:3,hala:2,tag:2,mail:3,thunder:1,dce:1,
    all:['113129','17776836'],
    solo:['2021','384780'],
    guzmaAll:['1223641','681445380'],
    guzmaSolo:['40721','26549820']
  },
  24:{
    basic:4,guzma:2,hala:2,tag:2,mail:4,thunder:1,dce:3,
    all:['31471673','2044336140'],
    solo:['30401','2413620'],
    guzmaAll:['83399','26549820'],
    guzmaSolo:['86583','32449780']
  },
  29:{
    basic:4,guzma:3,hala:2,tag:2,mail:2,thunder:1,dce:1,
    all:['3615428','511084035'],
    solo:['188','32065'],
    guzmaAll:['4005959','2044336140'],
    guzmaSolo:['991','589996']
  }
};

test('all three source sixties have exactly four Thorns and known printed resource counts',()=>{
  assert.deepEqual([...ORIGINAL_IRON_THORNS_RANKS],[6,24,29]);
  for(const rank of ORIGINAL_IRON_THORNS_RANKS){
    const c=groupOriginalSixty(rank);
    const expected=EXPECTED[rank];
    for(const key of ['basic','guzma','hala','tag','mail','thunder','dce'])
      assert.equal(c[key],expected[key],`rank ${rank} ${key}`);
    assert.equal(Object.keys(EXPECTED[rank]).length,11);
  }
});

test('exact source rank6 result independently matches the older six-category proof',()=>{
  const result=directlyHeldThornsResources(6);
  const older=heldStadiumEnergyWithoutSupporterConnectors();
  assert.equal(result.numerator,older.numerator);
  assert.equal(result.denominator,older.denominator);
  const gust=directlyHeldThornsResources(6,{requireGuzma:true});
  const previousGust=heldStadiumEnergyWithGuzma();
  assert.equal(gust.numerator,previousGust.numerator);
  assert.equal(gust.denominator,previousGust.denominator);
});

test('full multivariate held resource fractions match all 12 exact enumeration anchors',()=>{
  for(const rank of ORIGINAL_IRON_THORNS_RANKS){
    const expected=EXPECTED[rank];
    for(const [type,options] of [
      ['all',{}],
      ['solo',{exactlyOneBasic:true}],
      ['guzmaAll',{requireGuzma:true}],
      ['guzmaSolo',{requireGuzma:true,exactlyOneBasic:true}]
    ]){
      const value=directlyHeldThornsResources(rank,options);
      assert.equal(value.numerator,BigInt(expected[type][0]),`rank ${rank} ${type} numerator`);
      assert.equal(value.denominator,BigInt(expected[type][1]),`rank ${rank} ${type} denominator`);
    }
  }
});

test('source rank24 extra two DCE materially increases direct access under printed opening model',()=>{
  const rank24=directlyHeldThornsResources(24);
  const rank6=directlyHeldThornsResources(6);
  const rank29=directlyHeldThornsResources(29);
  assert.ok(rank24.percentage>rank6.percentage*2);
  assert.ok(rank24.percentage>rank29.percentage*2);
  assert.ok(rank29.percentage>rank6.percentage);
  for(const rank of ORIGINAL_IRON_THORNS_RANKS){
    const plain=directlyHeldThornsResources(rank);
    const solo=directlyHeldThornsResources(rank,{exactlyOneBasic:true});
    const gust=directlyHeldThornsResources(rank,{requireGuzma:true});
    const gustSolo=directlyHeldThornsResources(rank,{requireGuzma:true,exactlyOneBasic:true});
    assert.ok(0<gustSolo.percentage&&
      gustSolo.percentage<solo.percentage&&
      gustSolo.percentage<gust.percentage&&
      gust.percentage<plain.percentage);
  }
});

test('model rejects non-Thorns source ranks without extending unsupported scope',()=>{
  assert.throws(()=>groupOriginalSixty(23));
  assert.throws(()=>directlyHeldThornsResources(1));
});
