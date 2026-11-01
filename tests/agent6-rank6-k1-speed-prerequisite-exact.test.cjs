'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  exactPreviousTurnK1Gate,originalRank6Inventory,calculateOriginal
}=require('../scripts/agent6-rank6-k1-speed-prerequisite-exact.cjs');

/** Enumerate individually labeled physical cards without category weights. */
function combinations(cards,count){
  if(count===0)return [[]];
  if(cards.length<count)return [];
  return [
    ...combinations(cards.slice(1),count-1)
      .map(rest=>[cards[0],...rest]),
    ...combinations(cards.slice(1),count)
  ];
}

/** Independent physical-label deal and Prize-first-draw brute enumeration. */
function brute(cards,openingSize,prizeSize){
  const ids=cards.map((_,i)=>i);
  let valid=0n,favorable=0n;
  for(const opening of combinations(ids,openingSize)){
    if(!opening.some(i=>cards[i]==='B'))continue;
    const afterOpening=ids.filter(i=>!opening.includes(i));
    for(const prizes of combinations(afterOpening,prizeSize)){
      const afterPrizes=afterOpening.filter(i=>!prizes.includes(i));
      for(const draw of afterPrizes){
        valid++;
        const seen=[...opening,draw].map(i=>cards[i]);
        const prizeCards=prizes.map(i=>cards[i]);
        const deck=afterPrizes.filter(i=>i!==draw).map(i=>cards[i]);
        if(seen.includes('T')&&seen.includes('D')&&
           !seen.includes('H')&&prizeCards.includes('M')&&
           deck.includes('H')&&deck.includes('S'))
          favorable++;
      }
    }
  }
  return {valid,favorable};
}

test('independent physical-label miniature matches exact combined deal/Prize/draw weights',()=>{
  const cards=['B','B','T','H','M','D','S','O','O'];
  const bruteResult=brute(cards,3,2);
  const analytic=exactPreviousTurnK1Gate({
    basic:2,tag:1,hala:1,thunder:1,dce:1,speed:1,other:2
  },{openingHand:3,prizes:2});
  assert.deepEqual(bruteResult,{valid:2940n,favorable:32n});
  assert.equal(analytic.valid,bruteResult.valid);
  assert.equal(analytic.favorable,bruteResult.favorable);
  assert.deepEqual(analytic.bySeenSpeedDeckCount,{'1':32n});
});

test('second independent tiny example preserves combinatorial equality',()=>{
  const cards=['B','B','B','T','T','H','M','D','S','S','O'];
  const bruteResult=brute(cards,4,2);
  const analytic=exactPreviousTurnK1Gate({
    basic:3,tag:2,hala:1,thunder:1,dce:1,speed:2,other:1
  },{openingHand:4,prizes:2});
  assert.equal(analytic.valid,bruteResult.valid);
  assert.equal(analytic.favorable,bruteResult.favorable);
});

test('original rank6 exact printed physical sixty, favorable count and known opening denominator',()=>{
  assert.deepEqual(originalRank6Inventory(),{
    basic:4,tag:2,hala:2,thunder:1,dce:1,speed:4,other:46
  });
  const r=calculateOriginal();
  assert.equal(r.favorable,'348113824505220');
  assert.equal(r.valid,'166478632771651200');
  assert.ok(Math.abs(100*r.probability-0.20910420677391492)<1e-12);
  assert.equal(Object.values(r.bySeenSpeedDeckCount)
    .reduce((x,n)=>x+BigInt(n),0n),BigInt(r.favorable));
});

test('absence of Tag or searchable Speed makes the exact line impossible',()=>{
  const counts={basic:2,tag:1,hala:1,
    thunder:1,dce:1,speed:1,other:2};
  for(const changed of [
    {...counts,tag:0,other:3},
    {...counts,speed:0,other:3},
    {...counts,hala:0,other:3}
  ])assert.equal(exactPreviousTurnK1Gate(changed,
    {openingHand:3,prizes:2}).favorable,0n);
});
