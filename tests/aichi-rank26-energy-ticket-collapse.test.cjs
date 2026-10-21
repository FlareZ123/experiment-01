'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {energyTicketCollapse, sourceRank26EnergyCollapse} =
  require('../scripts/aichi-rank26-energy-ticket-collapse.cjs');

/**
 * Independent physical-card hand/Prize enumeration. No use of model formulas.
 * Each Lightning copy is a distinct physical card although both have one name.
 * @param {{deckSize:number,basicCount:number,handSize:number,prizeCount:number}} o
 */
function enumeratePhysical(o) {
  const {deckSize:N,basicCount:B,handSize:h,prizeCount:p} = o;
  const cards = ['M', ...Array.from({length:B-1},(_,i)=>'O'+i),
    'D','T','R','L1','L2',...Array.from({length:N-B-5},(_,i)=>'X'+i)];
  assert.equal(cards.length,N);
  const ids = Array.from({length:N},(_,i)=>i);
  /** @param {number[]} arr @param {number} k @param {number} start @param {number[]} prefix */
  function* combinations(arr,k,start=0,prefix=[]) {
    if (k===0) {
      yield prefix;
      return;
    }
    for (let i=start; i<=arr.length-k; i++) {
      yield* combinations(arr,k-1,i+1,[...prefix,arr[i]]);
    }
  }
  const count={total:0n,a:0n,b:0n,c:0n,ab:0n,ac:0n,bc:0n,abc:0n,union:0n,old:0n,increment:0n};
  for (const hand of combinations(ids,h)) {
    const handNames=hand.map(i=>cards[i]);
    if (!handNames.some(n=>n==='M'||n.startsWith('O'))) continue;
    const handIsForcedM = handNames.includes('M') &&
      !handNames.some(n=>n.startsWith('O'));
    const handSet = new Set(hand);
    const remaining=ids.filter(i=>!handSet.has(i));
    for (const prize of combinations(remaining,p)) {
      const prizeNames=new Set(prize.map(i=>cards[i]));
      const a=prizeNames.has('D') && prizeNames.has('T');
      const b=handIsForcedM && prizeNames.has('R') && prizeNames.has('T');
      const c=prizeNames.has('T') && prizeNames.has('L1') && prizeNames.has('L2');
      count.total++;
      if (a) count.a++;
      if (b) count.b++;
      if (c) count.c++;
      if (a&&b) count.ab++;
      if (a&&c) count.ac++;
      if (b&&c) count.bc++;
      if (a&&b&&c) count.abc++;
      if (a||b) count.old++;
      if (a||b||c) count.union++;
      if (c&&!a&&!b) count.increment++;
    }
  }
  return count;
}

test('enumerated physical opening/prize partitions reproduce all seven event intersections', () => {
  for (const options of [
    {deckSize:12,basicCount:2,handSize:2,prizeCount:5},
    {deckSize:13,basicCount:3,handSize:3,prizeCount:5},
    {deckSize:14,basicCount:4,handSize:4,prizeCount:5}
  ]) {
    const observed=enumeratePhysical(options);
    const model=energyTicketCollapse(options);
    for (const [name,field] of [
      ['a','eventA_DceTicketPrized'],['b','eventB_ForcedMeloettaRopeTicketPrized'],
      ['c','eventC_TicketBothLightningPrized'],['ab','pairAB'],
      ['ac','pairAC'],['bc','pairBC'],['abc','tripleABC'],
      ['old','priorTwoEventUnion'],['increment','newDisjointIncrement'],
      ['union','threeEventUnion']
    ]) {
      assert.equal(model[field].favorableDeals,observed[name].toString(),name);
      assert.equal(model[field].totalDeals,observed.total.toString(),name);
    }
  }
});

test('registered 60 source extends the original bound with positive disjoint increment', () => {
  const r=sourceRank26EnergyCollapse(require('node:path').resolve(__dirname,'..'));
  assert.equal(r.threeEventUnion.favorableDeals,'68000605095108');
  assert.equal(r.threeEventUnion.totalDeals,'7175999693903040');
  assert.equal(r.newDisjointIncrement.favorableDeals,'4056843143808');
  assert.ok(Math.abs(r.threeEventUnion.percent-0.9476115941432314)<1e-12);
  assert.ok(Math.abs(r.firstTurnCrisisAvailabilityCeilingPercent-
    99.05238840585677)<1e-12);
});

test('invalid input cannot silently count fewer than five Prize slots', () => {
  assert.throws(() => energyTicketCollapse({deckSize:14,basicCount:4,
    handSize:4,prizeCount:4}),RangeError);
  assert.throws(() => energyTicketCollapse({deckSize:14,basicCount:11,
    handSize:4,prizeCount:5}),RangeError);
});
