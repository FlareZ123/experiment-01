'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {countFloetteTurn1Routes}=
  require('../scripts/mega-floette-turn1-connectors.cjs');

test('Source-defined ideal category route counts are exact and disjoint',()=>{
  const r=countFloetteTurn1Routes();
  assert.equal(r.directInHand.fraction,'594821801/4515961725');
  assert.equal(r.floetteInDeckViaSearch.fraction,'3230009209/6523055825');
  assert.equal(r.prizedFloetteViaHeavyBall.fraction,'3387202/301064115');
  assert.equal(r.total.fraction,'37463270684/58707502425');
  const sum=r.directInHand.probability+
    r.floetteInDeckViaSearch.probability+
    r.prizedFloetteViaHeavyBall.probability;
  assert.ok(Math.abs(sum-r.total.probability)<1e-12);
  assert.ok(r.total.probability>0.63&&r.total.probability<0.65);
});

test('Independent shuffled physical cards and six actual Prizes converge',()=>{
  let seed=20261018;
  const random=()=>{
    seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
    return(seed>>>0)/4294967296;
  };
  const base=[
    ...Array(1).fill('F'),...Array(14).fill('B'),
    ...Array(11).fill('E'),...Array(4).fill('G'),
    ...Array(4).fill('M'),...Array(1).fill('Q'),
    ...Array(1).fill('H'),...Array(24).fill('O')
  ];
  let eligible=0,success=0;
  const occurrences=(array,name)=>array.filter(x=>x===name).length;
  for(let trial=0;trial<100000;trial++){
    const deck=base.slice();
    for(let i=59;i>0;i--){
      const j=Math.floor(random()*(i+1));
      [deck[i],deck[j]]=[deck[j],deck[i]];
    }
    if(!deck.slice(0,7).some(c=>c==='F'||c==='B'))continue;
    eligible++;
    const hand=[...deck.slice(0,7),deck[13]];
    const prizes=deck.slice(7,13);
    const [f,e,g,m,q,h]=['F','E','G','M','Q','H']
      .map(c=>occurrences(hand,c));
    const floettePrized=prizes.includes('F');
    const fromHand=f>0&&(e>0||g>0);
    const fromDeck=f===0&&!floettePrized&&(g>0||m>0||q>0)&&
      (e>0||g>=2||(g>=1&&(m+q)>0));
    const fromPrizes=f===0&&floettePrized&&h>0&&(e>0||g>0);
    if(fromHand||fromDeck||fromPrizes)success++;
  }
  const exact=countFloetteTurn1Routes().total.probability;
  assert.ok(Math.abs(success/eligible-exact)<0.012,
    'Physical six-Prize shuffle must agree with combinatorial model');
  console.log(JSON.stringify({
    physicalShuffles:100000,validOpenings:eligible,
    success,observed:success/eligible,exact
  }));
});
