'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {groupedOpeningPrizeAccess}=require(
  './agent47-grouped-basic-prize-access.cjs');
const {openingPrizeAccessibility}=require(
  './agent47-three-basic-heavyball-prize-model.cjs');

const close=(actual,expected,label='')=>assert.ok(
  Math.abs(actual-expected)<1e-12,
  label+' expected '+expected+' got '+actual
);
const get=(coreCopies,heavyBalls,otherBasicCount=11)=>
  groupedOpeningPrizeAccess({
    coreCopies,heavyBalls,otherBasicCount,
    deckSize:60,openingHand:7,prizeCount:6
  });

for(const n of [0,1,2,3,4]){
  test('singleton model exact parity for '+n+' Heavy Balls',()=>{
    const old=openingPrizeAccessibility({
      deckSize:60,handSize:7,prizeCount:6,basicCount:14,
      criticalBasics:3,heavyBalls:n
    });
    const next=get([1,1,1],n);
    close(next.unrecoverablePrizeOnly,old.prizeOnlyUnrecoverable);
    close(next.validOpeningRate,old.validOpeningRate);
    close(next.anyCoreGroupFullyPrized,old.atLeastOneCriticalPrized);
    for(let k=0;k<=3;k++)
      close(next.exactMissingGroupCounts[k],old.exactCriticalPrized[k]);
  });
}

test('replacing one non-Basic with second Heavy Ball lowers Prize-only tail',()=>{
  const one=get([1,1,1],1);
  const two=get([1,1,1],2);
  close(one.unrecoverablePrizeOnly,0.04495153241630377);
  close(two.unrecoverablePrizeOnly,0.005219322476844076);
  close(one.unrecoverablePrizeOnly-two.unrecoverablePrizeOnly,
    0.0397322099394597);
  close(one.validOpeningRate,two.validOpeningRate);
});

test('replacing a non-Basic with second Mimikyu lowers tail to 2.527317%',()=>{
  const one=get([1,1,1],1);
  const secondMimikyu=get([2,1,1],1);
  close(secondMimikyu.unrecoverablePrizeOnly,0.025273170227448422);
  close(one.unrecoverablePrizeOnly-secondMimikyu.unrecoverablePrizeOnly,
    0.01967836218885535);
  assert.equal(secondMimikyu.basicCount,15);
  assert.ok(secondMimikyu.validOpeningRate>one.validOpeningRate);
});

test('second Dialga equals second Mimikyu on Prize geometry only',()=>{
  const m=get([2,1,1],1);
  const d=get([1,2,1],1);
  close(m.unrecoverablePrizeOnly,d.unrecoverablePrizeOnly);
  close(m.validOpeningRate,d.validOpeningRate);
  close(m.anyCoreGroupFullyPrized,d.anyCoreGroupFullyPrized);
  assert.deepEqual(m.exactMissingGroupCounts,d.exactMissingGroupCounts);
});

test('second Heavy Ball improves Prize access more than duplicate one core',()=>{
  const base=get([1,1,1],1);
  const duplicate=get([2,1,1],1);
  const secondBall=get([1,1,1],2);
  const deltaDup=base.unrecoverablePrizeOnly-
    duplicate.unrecoverablePrizeOnly;
  const deltaBall=base.unrecoverablePrizeOnly-
    secondBall.unrecoverablePrizeOnly;
  assert.ok(deltaBall>deltaDup);
  close(deltaBall-deltaDup,0.02005384775060435);
});

test('one duplicate + second Ball reduces further but costs two slots',()=>{
  const secondBall=get([1,1,1],2);
  const both=get([2,1,1],2);
  close(both.unrecoverablePrizeOnly,0.0023678295129152494);
  assert.ok(both.unrecoverablePrizeOnly<
    secondBall.unrecoverablePrizeOnly);
  assert.ok(both.unrecoverablePrizeOnly<
    get([2,1,1],1).unrecoverablePrizeOnly);
});

test('critical group partition conditional on valid opening sums to 1',()=>{
  for(const groups of [[1,1,1],[2,1,1],[1,2,1],[3,1,1]]){
    for(const balls of [0,1,2,3]){
      const x=get(groups,balls);
      close(x.exactMissingGroupCounts.reduce((a,b)=>a+b,0),1);
      assert.ok(x.unrecoverablePrizeOnly>=0&&
        x.unrecoverablePrizeOnly<=1);
      close(Number(BigInt(x.numerator))/Number(BigInt(x.denominator)),
        x.unrecoverablePrizeOnly);
    }
  }
});

test('no Heavy Ball failure equals any critical group fully Prized',()=>{
  for(const groups of [[1,1,1],[2,1,1],[1,2,1],[2,2,1]]){
    const x=get(groups,0);
    close(x.unrecoverablePrizeOnly,x.anyCoreGroupFullyPrized);
  }
});

test('extra ordinary Basic changes mulligan conditioning',()=>{
  const a=get([1,1,1],1,11);
  const b=get([1,1,1],1,12);
  assert.equal(a.basicCount,14);
  assert.equal(b.basicCount,15);
  assert.ok(b.validOpeningRate>a.validOpeningRate);
  assert.ok(Math.abs(a.unrecoverablePrizeOnly-
    b.unrecoverablePrizeOnly)>1e-7);
});

test('reject negative, zero core, oversized decks, and missing groups',()=>{
  assert.throws(()=>get([],1),/CORE_GROUPS_REQUIRED/);
  assert.throws(()=>get([0,1],1),/CORE_GROUP_EMPTY/);
  assert.throws(()=>get([1,1],-1),/INVALID_heavyBalls/);
  assert.throws(()=>get([2,1,1],60),/DECK_COMPOSITION_INVALID/);
  assert.throws(()=>groupedOpeningPrizeAccess({
    coreCopies:[1],otherBasicCount:0,heavyBalls:0,
    deckSize:12,openingHand:7,prizeCount:6
  }),/DECK_COMPOSITION_INVALID/);
});

test('do not use grouped mathematics to override Radiant one-copy rule',()=>{
  // This probability model can perform hypothetical copy-count arithmetic.
  // It is NOT a legality checker; a proposed [1,1,2] Radiant Eternatus
  // deck violates the Radiant Pokémon Rule and must not be recommended.
  const hypothetical=get([1,1,2],1);
  close(hypothetical.unrecoverablePrizeOnly,get([2,1,1],1).unrecoverablePrizeOnly);
  assert.equal(hypothetical.basicCount,15);
});
