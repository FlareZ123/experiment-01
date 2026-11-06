/** Independent physical-slot combinatorial regression for the source-level certificate. */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {forcedStarterEscapePrize,CHAMPION_SPEC}=require('./agent35-snorlax-forced-active-guzma-prize.cjs');

/** @param {number} size @param {number} count @returns {number[][]} */
function subsets(size,count) {
  const all=[];
  function walk(start,chosen) {
    if(chosen.length===count){all.push(chosen.slice());return;}
    for(let i=start;i<=size-(count-chosen.length);i++){
      chosen.push(i);walk(i+1,chosen);chosen.pop();
    }
  }
  walk(0,[]);
  return all;
}

test('miniature exhaustively enumerates actual hand then Prize combinations',()=>{
  // Two trap Basics T, two other Basics O, singleton nonbasic Guzma G,
  // and seven inert nonbasics F. 12 physical copies, hand4, Prizes2.
  const cards=['T','T','O','O','G',...Array(7).fill('F')];
  let valid=0,forced=0,joint=0,total=0;
  for(const hand of subsets(cards.length,4)) {
    const held=hand.map(i=>cards[i]);
    if(!held.some(t=>t==='T'||t==='O'))continue;
    const eligible=held.some(t=>t==='T')&&!held.includes('O');
    const remainder=cards.flatMap((_,i)=>hand.includes(i)?[]:[i]);
    for(const prizedIndices of subsets(remainder.length,2)) {
      total++;
      valid++;
      if(eligible)forced++;
      if(eligible&&prizedIndices.some(j=>cards[remainder[j]]==='G'))joint++;
    }
  }
  const exact=forcedStarterEscapePrize({
    deckSize:12,basicCount:4,restrictedBasicCount:2,openingSize:4,prizeCount:2
  });
  assert.ok(total>0&&valid>0&&forced>0&&joint>0);
  const [fn,fd]=[BigInt(exact.forcedAmongValid.numerator),
    BigInt(exact.forcedAmongValid.denominator)];
  const [jn,jd]=[BigInt(exact.jointAmongValid.numerator),
    BigInt(exact.jointAmongValid.denominator)];
  assert.equal(BigInt(forced)*fd,BigInt(valid)*fn);
  assert.equal(BigInt(joint)*jd,BigInt(valid)*jn);
  console.log('Miniature physical-slot proof',JSON.stringify({valid,forced,joint}));
});

test('published champion exact sixty physical conditional fractions',()=>{
  const actual=forcedStarterEscapePrize(CHAMPION_SPEC);
  assert.deepEqual(actual.forcedAmongValid,{
    numerator:'6923',denominator:'114560'
  });
  assert.deepEqual(actual.jointAmongValid,{
    numerator:'1591989',denominator:'267153920'
  });
  assert.deepEqual(actual.singletonEscapePrizedGivenForced,{
    numerator:'5289',denominator:'53636'
  });
});

test('contradictory physical opening size or card pool throws',()=>{
  assert.throws(()=>forcedStarterEscapePrize({
    deckSize:10,basicCount:12,restrictedBasicCount:2,openingSize:7,prizeCount:6
  }));
  assert.throws(()=>forcedStarterEscapePrize({
    deckSize:10,basicCount:10,restrictedBasicCount:2,openingSize:3,prizeCount:1
  }));
});
