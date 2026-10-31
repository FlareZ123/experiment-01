'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {RANK11_BASIC_NAMES,expectedPrizeCompositionBits,run}=
  require('../scripts/agent9-rank11-k0-prize-entropy.cjs');

function choose(n,k){
  if(k<0||k>n)return 0;
  let t=1;
  for(let i=1;i<=Math.min(k,n-k);i++)t=t*(n-i+1)/i;
  return t;
}

test('original printed rank11 after mandatory first draw yields exact K0 information',()=>{
  const x=run();
  assert.equal(x.originalSourceRank,11);
  assert.equal(x.totalCards,60);
  assert.equal(x.basicCards,11);
  assert.equal(x.uniquePrintings,26);
  assert.ok(Math.abs(x.unknownPrizeMultisetEntropyBits-
    17.140890302970163)<1e-10);
  assert.ok(Math.abs(x.physicalLabelEntropyBits-
    24.27912935007164)<1e-10);
  assert.equal(x.includesMandatoryFirstTurnDraw,true);
  assert.equal(x.requiresNoEarlierDeckSearch,true);
  assert.equal(x.competitiveWinRateQualified,false);
});

test('independent exhaustive two-Prize toy reproduces entropy of count vectors',()=>{
  const rows=[
    {name:'A',count:3},{name:'B',count:2},
    {name:'X',count:2},{name:'Y',count:3}
  ];
  const basic=new Set(['A','B']);
  const labels=rows.flatMap((r,i)=>Array(r.count).fill(i));
  const expected=expectedPrizeCompositionBits(rows,basic,{
    opening:3,prizes:2
  });
  const initialCount=rows.map(r=>r.count);
  let sum=0,cases=0;
  for(let i=0;i<10;i++)for(let j=i+1;j<10;j++){
    for(let k=j+1;k<10;k++){
      const hand=[i,j,k];
      if(!hand.some(x=>basic.has(rows[labels[x]].name)))continue;
      const afterHand=Array.from({length:10},(_,a)=>a)
        .filter(a=>!hand.includes(a));
      for(let p=0;p<afterHand.length;p++)for(let q=p+1;q<afterHand.length;q++){
        const prize=[afterHand[p],afterHand[q]];
        for(const drawn of afterHand.filter(x=>!prize.includes(x))){
          const remaining=initialCount.slice();
          const prizeCount=initialCount.map(()=>0);
          for(const h of [...hand,drawn])remaining[labels[h]]--;
          for(const pi of prize)prizeCount[labels[pi]]++;
          let surprisal=Math.log2(choose(6,2));
          for(let idx=0;idx<rows.length;idx++){
            surprisal-=Math.log2(choose(remaining[idx],prizeCount[idx]));
          }
          sum+=surprisal;
          cases++;
        }
      }
    }
  }
  assert.ok(cases>1000);
  assert.ok(Math.abs(sum/cases-expected.unknownPrizeMultisetEntropyBits)
    <1e-10);
});

test('identically printed cards have zero incremental positional value',()=>{
  const all=[
    {name:'A',count:6},{name:'X',count:4}
  ];
  const basic=new Set(['A']);
  const result=expectedPrizeCompositionBits(all,basic,{
    opening:3,prizes:2
  });
  assert.ok(result.unknownPrizeMultisetEntropyBits>=0);
  assert.ok(result.unknownPrizeMultisetEntropyBits<
    result.physicalLabelEntropyBits);
  const shuffled=expectedPrizeCompositionBits(all.slice().reverse(),basic,{
    opening:3,prizes:2
  });
  assert.ok(Math.abs(result.unknownPrizeMultisetEntropyBits-
    shuffled.unknownPrizeMultisetEntropyBits)<1e-12);
});
