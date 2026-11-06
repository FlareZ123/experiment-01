'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  ORIGINAL_IRON_THORNS_RANKS,groupOriginalSixty,
  directlyHeldThornsResources,allAttackResourcesPrized
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

test('held Thunder and at least one DCE regardless of connector overlap has a distinct broader rate',()=>{
  for(const [rank,n,d] of [
    [6,13697n,1071455n],
    [24,722693n,20649860n],
    [29,13697n,1071455n]
  ]){
    const disjoint=directlyHeldThornsResources(rank);
    const broad=directlyHeldThornsResources(rank,{allowConnectors:true});
    assert.equal(broad.numerator,n);
    assert.equal(broad.denominator,d);
    assert.ok(broad.percentage>disjoint.percentage);
    assert.equal(broad.allowConnectors,true);
    assert.equal(disjoint.allowConnectors,false);
  }
  assert.equal(
    directlyHeldThornsResources(6,{allowConnectors:true}).numerator,
    13697n
  );
});

test('K0: all physically printed DCE copies prized after a Basic-valid initial seven',()=>{
  for(const [rank,n,d] of [
    [6,79029n,779240n],
    [24,2353n,3857238n],
    [29,79029n,779240n]
  ]){
    const row=allAttackResourcesPrized(rank,'dce');
    assert.equal(row.numerator,n);
    assert.equal(row.denominator,d);
    assert.equal(row.copies,rank===24?3:1);
  }
});

test('the singleton Thunder Mountain has the same opening Prize exposure in all three source sixties',()=>{
  for(const rank of ORIGINAL_IRON_THORNS_RANKS){
    const row=allAttackResourcesPrized(rank,'thunder');
    assert.equal(row.numerator,79029n);
    assert.equal(row.denominator,779240n);
    assert.equal(row.copies,1);
  }
});

test('joint Thunder and all DCE Prized event is rarer in rank24',()=>{
  const r6=allAttackResourcesPrized(6,'both');
  const r24=allAttackResourcesPrized(24,'both');
  const r29=allAttackResourcesPrized(29,'both');
  assert.equal(r6.numerator,7473n);
  assert.equal(r6.denominator,857164n);
  assert.equal(r29.numerator,r6.numerator);
  assert.equal(r29.denominator,r6.denominator);
  assert.equal(r24.numerator,11101n);
  assert.equal(r24.denominator,340722690n);
  assert.ok(r24.percentage<r6.percentage);
  assert.throws(()=>allAttackResourcesPrized(6,'invalid'));
});

test('optional single opponent-mulligan compensation draw has exact distinct nine-card counts',()=>{
  const CASES={
    6:{
      narrow:[11239157n,1540659120n],
      solo:[14147n,2501070n],
      gust:[256151617n,106305479280n],
      gustSolo:[30401n,15688530n],
      broad:[145267n,8571640n]
    },
    24:{
      narrow:[32640635n,1932826896n],
      solo:[2233721n,172573830n],
      gust:[1711277n,420179760n],
      gustSolo:[6169639n,1898312130n],
      broad:[372530779n,8177344560n]
    },
    29:{
      narrow:[159659n,19258239n],
      solo:[8084n,1250535n],
      gust:[19061771n,7087031952n],
      gustSolo:[62522n,28762305n],
      broad:[145267n,8571640n]
    }
  };
  for(const rank of ORIGINAL_IRON_THORNS_RANKS){
    for(const [type,options] of [
      ['narrow',{}],['solo',{exactlyOneBasic:true}],
      ['gust',{requireGuzma:true}],
      ['gustSolo',{requireGuzma:true,exactlyOneBasic:true}],
      ['broad',{allowConnectors:true}]
    ]){
      const p=directlyHeldThornsResources(rank,{...options,bonusDraws:1});
      const [n,d]=CASES[rank][type];
      assert.equal(p.numerator,n,`rank ${rank} ${type} compensated numerator`);
      assert.equal(p.denominator,d,`rank ${rank} ${type} compensated denominator`);
      assert.equal(p.bonusDraws,1);
      assert.ok(p.percentage>0);
    }
    assert.ok(directlyHeldThornsResources(rank,{bonusDraws:1}).percentage>
      directlyHeldThornsResources(rank).percentage);
  }
  assert.throws(()=>directlyHeldThornsResources(6,{bonusDraws:2}));
});
