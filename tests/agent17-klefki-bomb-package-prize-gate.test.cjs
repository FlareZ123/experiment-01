'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../scripts/aichi-champion-critical-prize-collapse.cjs');
const {physicalPrizeGate,sourcePrizeGate}=
  require('../scripts/agent17-klefki-bomb-package-prize-gate.cjs');

test('independent miniature physical six-category enumeration agrees with generic prize gate',()=>{
  const counts=[1,1,1,1,1,1,1,2,2,1],other=0,prizeSize=2;
  const category=counts.flatMap((count,index)=>Array(count).fill(index));
  let independentlyFavorable=0n;
  for(let a=0;a<category.length;a++){
    for(let b=a+1;b<category.length;b++){
      const survive=counts.slice();
      survive[category[a]]--;
      survive[category[b]]--;
      const hasEvolutionBases=
        (survive[0]>0&&survive[2]>0)||
        (survive[3]>0&&(survive[0]>0||survive[2]>0));
      const okay=hasEvolutionBases&&survive[1]>0&&
        survive[4]>0&&survive[5]>0&&survive[6]>0&&
        survive[7]>=2&&survive[8]>=2&&survive[9]>0;
      if(okay)independentlyFavorable++;
    }
  }
  const got=physicalPrizeGate(counts,other,prizeSize);
  assert.equal(got.all,choose(category.length,prizeSize));
  assert.equal(got.favorable,independentlyFavorable);
});

test('original rank4 exact initial-Klefki and UTurn/Sky/330-Energy Prize custody gate',()=>{
  const got=sourcePrizeGate(4);
  assert.equal(got.stadiumName,'Sky Field');
  assert.equal(got.validOpeningHands,323315421n);
  assert.equal(got.prizeSubsetsGivenStartingKlefki,45057474n);
  assert.equal(got.favorablePrizeSubsetsGivenStartingKlefki,39438613n);
  assert.equal(got.probabilityFractionJoint,'39438613/323315421');
  assert.ok(Math.abs(
    got.probabilityStartingKlefkiAndExactPackageUnprizedGivenValidInitialSeven-
    0.12198184942128079)<1e-12);
});

test('original rank17 exact initial-Klefki and UTurn/PokéStop/330-Energy Prize custody gate',()=>{
  const got=sourcePrizeGate(17);
  assert.equal(got.stadiumName,'PokéStop');
  assert.equal(got.validOpeningHands,323315421n);
  assert.equal(got.prizeSubsetsGivenStartingKlefki,45057474n);
  assert.equal(got.favorablePrizeSubsetsGivenStartingKlefki,35345392n);
  assert.equal(got.probabilityFractionJoint,'35345392/323315421');
  assert.ok(Math.abs(
    got.probabilityStartingKlefkiAndExactPackageUnprizedGivenValidInitialSeven-
    0.10932170167039451)<1e-12);
});

test('direct-option denominator is conditioned on the actual thirteen Basic originals',()=>{
  for(const rank of [4,17]){
    const got=sourcePrizeGate(rank);
    const valid=choose(60,7)-choose(47,7);
    assert.equal(got.validOpeningHands,valid);
    assert.ok(Math.abs(got.probabilityKlefkiInValidInitialSeven-
      Number(choose(59,6))/Number(valid))<1e-14);
    assert.ok(got.probabilityExactPackageUnprizedGivenStartingKlefki<1);
  }
  assert.throws(()=>sourcePrizeGate(25));
  assert.throws(()=>physicalPrizeGate([1,2],0,6));
});
