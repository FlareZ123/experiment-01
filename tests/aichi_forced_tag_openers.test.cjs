'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  choose,exactForcedOpening,directTargetByOneDraw,
  countFrozenInventory,frozenOpeningAudit
}=require('../scripts/aichi_forced_tag_openers.cjs');

/**
 * Exhaust every unordered subset of a small labelled population.
 * @param {string[]} cards
 * @param {number} handSize
 * @returns {{valid:number,forced:number,total:number}}
 */
function exhaustive(cards,handSize){
  let valid=0,forced=0,total=0;
  function recur(start,hand){
    if(hand.length===handSize){
      total++;
      const hasMarked=hand.includes('T');
      const hasOther=hand.includes('B');
      if(hasMarked||hasOther)valid++;
      if(hasMarked&&!hasOther)forced++;
      return;
    }
    for(let i=start;i<=cards.length-(handSize-hand.length);i++)
      recur(i+1,[...hand,cards[i]]);
  }
  recur(0,[]);
  return {valid,forced,total};
}

test('binomial coefficients have the exact small-deck values',()=>{
  assert.equal(choose(8,3),56n);
  assert.equal(choose(8,0),1n);
  assert.equal(choose(8,9),0n);
  assert.equal(choose(60,7),386206920n);
});

test('event fraction agrees with independent exhaustive physical deals',()=>{
  const cards=['T','T','B','B','O','O','O','O'];
  const enumerated=exhaustive(cards,3);
  const exact=exactForcedOpening({
    deckSize:8,openingSize:3,markedBasics:2,otherBasics:2
  });
  const f=exact.forcedMarkedGivenValid;
  const u=exact.unconditionalForcedMarked;
  assert.equal(BigInt(f.numerator)*BigInt(enumerated.valid),
    BigInt(f.denominator)*BigInt(enumerated.forced));
  assert.equal(BigInt(u.numerator)*BigInt(enumerated.total),
    BigInt(u.denominator)*BigInt(enumerated.forced));
});

test('the original seven can force a marked Basic despite extra draws later',()=>{
  const result=exactForcedOpening({
    deckSize:60,openingSize:7,markedBasics:4,otherBasics:13
  });
  assert.equal(result.forcedMarkedGivenValid.numerator,'30667385');
  assert.equal(result.forcedMarkedGivenValid.denominator,'353982806');
  assert.ok(result.forcedMarkedGivenValid.percent>8.66);
  assert.ok(result.forcedMarkedGivenValid.percent<8.67);
});

test('source manifests retain the published count identity and risk split',()=>{
  const a=frozenOpeningAudit();
  assert.deepEqual(a.champion,{deckSize:60,basics:14,tagTeams:1,mewtwo:0,multiPrizeBasics:10});
  assert.deepEqual(a.newMoon,{deckSize:60,basics:17,tagTeams:4,mewtwo:2,multiPrizeBasics:9});
  assert.deepEqual([
    a.championRisk.forcedMarkedGivenValid.numerator,
    a.championRisk.forcedMarkedGivenValid.denominator,
    a.newMoonRisk.forcedMarkedGivenValid.numerator,
    a.newMoonRisk.forcedMarkedGivenValid.denominator,
    a.mewtwoOnly.forcedMarkedGivenValid.numerator,
    a.mewtwoOnly.forcedMarkedGivenValid.denominator
  ],[
    '283843','10081280','30667385','353982806',
    '6577753','176991403'
  ]);
  assert.ok(a.newMoonRisk.forcedMarkedGivenValid.percent >
    3*a.championRisk.forcedMarkedGivenValid.percent);
  assert.equal(a.championMultiPrize.forcedMarkedGivenValid.numerator,'6143');
  assert.equal(a.championMultiPrize.forcedMarkedGivenValid.denominator,'11456');
  assert.equal(a.newMoonMultiPrize.forcedMarkedGivenValid.numerator,'50780223');
  assert.equal(a.newMoonMultiPrize.forcedMarkedGivenValid.denominator,'176991403');
  assert.ok(a.championMultiPrize.forcedMarkedGivenValid.percent >
    a.newMoonMultiPrize.forcedMarkedGivenValid.percent);
});

test('direct non-Basic target in legal seven or one draw matches exhaustive deals',()=>{
  const cards=['B','B','V','V','O','O','O','O'];
  let valid=0,hit=0;
  for(let a=0;a<8;a++)for(let b=a+1;b<8;b++)
    for(let c=b+1;c<8;c++)
      for(let next=0;next<8;next++){
        const indices=[a,b,c];
        if(indices.includes(next))continue;
        if(!indices.some(i=>cards[i]==='B'))continue;
        valid++;
        if(indices.some(i=>cards[i]==='V')||cards[next]==='V')hit++;
      }
  const exact=directTargetByOneDraw({
    deckSize:8,openingSize:3,basics:2,targets:2
  });
  assert.equal(BigInt(hit)*BigInt(exact.denominator),
    BigInt(valid)*BigInt(exact.numerator));
});

test('one fourth Unown for fourth VIP would trade first-turn access for forced-TAG reduction',()=>{
  const oldTag=exactForcedOpening({
    deckSize:60,openingSize:7,markedBasics:4,otherBasics:13
  });
  const editTag=exactForcedOpening({
    deckSize:60,openingSize:7,markedBasics:4,otherBasics:14
  });
  const oldVip=directTargetByOneDraw({
    deckSize:60,openingSize:7,basics:17,targets:4
  });
  const editVip=directTargetByOneDraw({
    deckSize:60,openingSize:7,basics:18,targets:3
  });
  assert.deepEqual([editTag.forcedMarkedGivenValid.numerator,
    editTag.forcedMarkedGivenValid.denominator],['553049','7483929']);
  assert.deepEqual([oldVip.numerator,oldVip.denominator],
    ['479458943','1103593454']);
  assert.deepEqual([editVip.numerator,editVip.denominator],
    ['19265703','55669928']);
  assert.ok(editTag.forcedMarkedGivenValid.percent <
    oldTag.forcedMarkedGivenValid.percent);
  assert.ok(editVip.percent<oldVip.percent);
});

test('invalid or inconsistent grouped populations reject',()=>{
  assert.throws(()=>exactForcedOpening({
    deckSize:10,openingSize:4,markedBasics:7,otherBasics:5
  }));
  assert.throws(()=>countFrozenInventory([
    {name:'Example',count:1,category:'Pokémon'}
  ],new Set()));
});
