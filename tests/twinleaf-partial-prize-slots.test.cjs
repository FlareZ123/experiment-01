'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {selectUnobservedPrizeSlots}=
  require('../simulation/twinleaf/partial-prize-slots.cjs');
const {evaluateDetachedDeckSamples}=
  require('../simulation/twinleaf/detached-deck-sampling.cjs');

const random=seed=>{let x=seed>>>0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}};
const permutation=(n,rng)=>{const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const settings={seed:20261017,samples:12,random,permutation,
  isCard:c=>Object.hasOwn(c,'fullName'),
  sampleUnknownPrizes:true,prizeObservationLedgerComplete:true,
  observedPrizeSlots:[{prizeIndex:0,cardIndex:0,fullName:'D'}]};
const card=(name,id)=>({fullName:name,id});
function source(prizeB=false) {
  return {turn:1,players:[{id:1,
    deck:{cards:prizeB?[card('A',1),card('E',5),card('C',3)]:
      [card('A',1),card('B',2),card('C',3)]},
    prizes:[{cards:[card('D',4)]},
      {cards:[prizeB?card('B',2):card('E',5)]}]}]};
}
const sample=(s,options=settings,evaluator=p=>Number(
  p.players[0].deck.cards[1].fullName==='B'))=>
  evaluateDetachedDeckSamples(s,1,{},0,evaluator,null,structuredClone,options);

test('known Prize stays fixed; only unknown slots join sampling',()=>{
  const s=source();
  const slots=selectUnobservedPrizeSlots(s.players[0].prizes,settings.observedPrizeSlots);
  assert.deepEqual(slots.map(x=>[x.prizeIndex,x.cardIndex,x.card.fullName]),
    [[1,0,'E']]);
  let seen=0;
  sample(s,settings,p=>{
    assert.equal(p.players[0].prizes[0].cards[0].fullName,'D');
    seen++;
    return 0;
  });
  assert.equal(seen,settings.samples);
});

test('partially observed, K0-identical physical partitions have equal scores',()=>{
  const a=source(),b=source(true);
  const beforeA=structuredClone(a),beforeB=structuredClone(b);
  assert.equal(sample(a),sample(b));
  assert.deepEqual(a,beforeA);
  assert.deepEqual(b,beforeB);
});

test('exhaustive conditional finite-population partition gives one-third',()=>{
  const permutations=[];
  for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)
    if(new Set([a,b,c]).size===3)permutations.push([a,b,c]);
  let index=0,prized=0;
  const options={...settings,samples:6,permutation:n=>{
    assert.equal(n,3);return permutations[index++]},random:()=>()=>0};
  const average=sample(source(),options,p=>{
    if(p.players[0].prizes[1].cards[0].fullName==='B')prized++;
    return Number(p.players[0].deck.cards[1].fullName==='B');
  });
  assert.equal(average,1/3);
  assert.equal(prized,2);
});

test('mismatched positional memory and duplicate observations fail closed',()=>{
  const a=source();
  assert.throws(()=>sample(a,{...settings,
    observedPrizeSlots:[{prizeIndex:0,cardIndex:0,fullName:'E'}]}),
    /disagrees with physical slot/);
  assert.throws(()=>sample(a,{...settings,
    observedPrizeSlots:[...settings.observedPrizeSlots,
      ...settings.observedPrizeSlots]}),/Duplicate observed Prize slot/);
  assert.throws(()=>sample(a,{...settings,
    observedPrizeSlots:[{prizeIndex:9,cardIndex:0,fullName:'D'}]}),
    /disagrees with physical slot/);
});

test('partial ledger must be verified and cannot also claim no Prize observations',()=>{
  const a=source();
  assert.throws(()=>sample(a,{...settings,
    prizeObservationLedgerComplete:false}),/verified complete observation ledger/);
  assert.throws(()=>sample(a,{...settings,
    prizesUnobservedVerified:true}),/verified complete observation ledger/);
  assert.throws(()=>sample(a,{...settings,sampleUnknownPrizes:false}),
    /require Prize-inclusive sampling/);
});

test('empty ledger retains legacy fully-unobserved Prize behavior',()=>{
  const a=source();
  const legacy={...settings,observedPrizeSlots:[],
    prizeObservationLedgerComplete:false,prizesUnobservedVerified:true};
  const value=sample(a,legacy);
  assert.ok(Number.isFinite(value));
});
