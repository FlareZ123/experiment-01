'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {firstTurnEnergyTripletBarrier,rank6SourceFirstTurnTriplet} =
  require('../scripts/aichi-rank6-firstturn-energy-triplet.cjs');

/** Independent physical-deal enumeration, no analytic combinations. */
function brute(options) {
  const {deckSize:N,basicCount:B,handSize:h,prizeCount:p}=options;
  const cards=[...Array.from({length:B},(_,i)=>'Basic'+i),
    'D','M','G',...Array.from({length:N-B-3},(_,i)=>'Other'+i)];
  assert.equal(cards.length,N);
  const ids=Array.from({length:N},(_,i)=>i);
  /** @param {number[]} arr @param {number} k @param {number} from @param {number[]} chosen */
  function* combinations(arr,k,from=0,chosen=[]) {
    if(k===0){yield chosen;return;}
    for(let i=from;i<=arr.length-k;i++){
      yield* combinations(arr,k-1,i+1,[...chosen,arr[i]]);
    }
  }
  const sums={total:0n,pair:0n,triple:0n,atLeastTwo:0n};
  for(const hand of combinations(ids,h)) {
    const inHand=new Set(hand);
    if(!hand.some(i=>cards[i].startsWith('Basic')))continue;
    const rem=ids.filter(i=>!inHand.has(i));
    for(const prize of combinations(rem,p)){
      sums.total++;
      const s=new Set(prize.map(i=>cards[i]));
      if(s.has('D')&&s.has('M'))sums.pair++;
      const n=Number(s.has('D'))+Number(s.has('M'))+Number(s.has('G'));
      if(n===3)sums.triple++;
      if(n>=2)sums.atLeastTwo++;
    }
  }
  return sums;
}

test('every hand/Prize deal in three miniature decks agrees with triplet formula',()=>{
  for(const options of [
    {deckSize:9,basicCount:2,handSize:2,prizeCount:3},
    {deckSize:11,basicCount:3,handSize:3,prizeCount:4},
    {deckSize:13,basicCount:4,handSize:3,prizeCount:5}
  ]){
    const r=firstTurnEnergyTripletBarrier(options),e=brute(options);
    for(const [x,y] of [
      ['pair','designatedPairPrized'],
      ['triple','allThreePrized'],
      ['atLeastTwo','atLeastTwoPrized']
    ]){
      assert.equal(r[y].physicalDeals,e[x].toString(),x);
      assert.equal(r[y].totalDeals,e.total.toString(),x);
    }
  }
});

test('registered rank6 exact source exhibits 2.493% first-turn triplet collapse',()=>{
  const r=rank6SourceFirstTurnTriplet(
    require('node:path').resolve(__dirname,'..'));
  assert.equal(r.atLeastTwoPrized.physicalDeals,'88321557906400');
  assert.equal(r.atLeastTwoPrized.totalDeals,'3542098569609600');
  assert.equal(r.designatedPairPrized.physicalDeals,'30881024647200');
  assert.equal(r.allThreePrized.physicalDeals,'2160758017600');
  assert.ok(Math.abs(r.atLeastTwoPrized.percent-2.4934810867257866)<1e-12);
  assert.ok(Math.abs(r.firstTurnVoltCycloneAvailabilityCeilingPercent-
    97.5065189132742)<1e-12);
});

test('invalid Prize or Basic dimensions must be rejected',()=>{
  assert.throws(()=>firstTurnEnergyTripletBarrier({
    deckSize:10,basicCount:2,handSize:3,prizeCount:2}),RangeError);
  assert.throws(()=>firstTurnEnergyTripletBarrier({
    deckSize:10,basicCount:8,handSize:3,prizeCount:4}),RangeError);
});
