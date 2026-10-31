'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {prizeAwareTwoTargetWindow,run}=
  require('../scripts/agent9-vip-two-search-prize.cjs');

/** Exhaustively enumerate physical opening, Prize and ordinary draw choices. */
function exhaustive(cards){
  let denominator=0,first=0,second=0;
  for(let a=0;a<10;a++)for(let b=a+1;b<10;b++)for(let c=b+1;c<10;c++){
    const opening=[a,b,c],hand=opening.map(i=>cards[i]);
    const basicCount=hand.filter(x=>x==='C'||x==='O').length;
    if(basicCount===0)continue;
    const initialCrobat=hand.filter(x=>x==='C').length;
    const heldCrobat=initialCrobat-(hand.includes('O')?0:1);
    const heldVip=hand.filter(x=>x==='V').length;
    const other=cards.map((_,i)=>i).filter(i=>!opening.includes(i));
    for(let p=0;p<other.length;p++)for(let q=p+1;q<other.length;q++){
      const prizes=[other[p],other[q]];
      const remain=other.filter(i=>!prizes.includes(i));
      const remainingBasics=remain.filter(i=>cards[i]==='C'||cards[i]==='O').length;
      denominator++;
      if(heldCrobat>=1&&heldVip>=1&&basicCount<=4&&remainingBasics>=2)first++;
      for(const i of remain){
        const nextC=heldCrobat+(cards[i]==='C'?1:0);
        const nextVip=heldVip+(cards[i]==='V'?1:0);
        const afterBasic=remainingBasics-(cards[i]==='C'||cards[i]==='O'?1:0);
        if(nextC>=1&&nextVip>=1&&afterBasic>=2&&
           basicCount<=(heldCrobat>=1?4:3))second++;
      }
    }
  }
  return {denominator,first,second};
}

for(const cards of [
  ['C','O','O','V','V','X','X','X','X','X'],
  ['C','C','O','V','V','X','X','X','X','X']
]){
  test('Prize-constrained two-search exact count matches independent physical enumeration',()=>{
    const K=cards.filter(x=>x==='C').length;
    const b=cards.filter(x=>x==='C'||x==='O').length;
    const v=cards.filter(x=>x==='V').length;
    const expected=exhaustive(cards);
    const actual=prizeAwareTwoTargetWindow({basicCount:b,vipCount:v,
      crobatCount:K,total:10,opening:3,prizes:2});
    assert.equal(actual.goingFirst.denominator,BigInt(expected.denominator));
    assert.equal(actual.goingFirst.numerator,BigInt(expected.first));
    assert.equal(actual.goingSecond.denominator,BigInt(expected.denominator*5));
    assert.equal(actual.goingSecond.numerator,BigInt(expected.second));
  });
}

test('original nine-source printed metadata retained and prize effect precisely bounded',()=>{
  const result=run();
  assert.equal(result.originalSourceCount,9);
  assert.equal(result.competitiveQualifiedGames,0);
  const rank11=result.rows.find(x=>x.rank===11);
  assert.equal(rank11.goingFirstPercent,'3.3928604307');
  assert.equal(rank11.goingSecondPercent,'4.5191600547');
  const rank8=result.rows.find(x=>x.rank===8);
  assert.equal(rank8.prizeFailureVersusBenchOnlySecondPercentagePoints,
    '0.000004466666');
  assert.equal(result.rows.find(x=>x.rank===4)
    .prizeFailureVersusBenchOnlyFirstPercentagePoints,'0.000000000000');
});
