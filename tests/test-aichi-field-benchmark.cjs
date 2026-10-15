'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { winProbabilityLowerBound, buildPlan, resolveDeck, exactPrintingIndex, evaluatePlan } =
  require('../simulation/evaluation/field-benchmark.cjs');

/** @param {number} rank */
function deck(rank) {
  return { rank, player: 'P' + rank, archetype: 'test',
    cards: [{ name: 'Psychic Energy', count: 60,
      printing: { set: 'TEST', number: '001' } }] };
}
const manifest = { source: 'test-only', decks: [deck(1), deck(2)] };
const pool = [{ name: 'Psychic Energy', set: 'TEST', setNumber: '1',
  fullName: 'Psychic Energy TEST 1' }];

test('one-sided exact lower bound and requisite perfect trials', () => {
  assert.equal(winProbabilityLowerBound(0, 30), 0);
  assert.equal(winProbabilityLowerBound(0, 0), null);
  assert.ok(winProbabilityLowerBound(597, 597) < .995);
  assert.ok(winProbabilityLowerBound(598, 598) > .995);
  assert.ok(Math.abs(winProbabilityLowerBound(1, 2) -
    (1 - Math.sqrt(.95))) < 1e-12);
  assert.throws(() => winProbabilityLowerBound(2, 1));
});

test('strict printing resolution and full 60-card input', () => {
  assert.equal(resolveDeck(deck(1), exactPrintingIndex(pool)).cards.length, 60);
  assert.equal(resolveDeck(deck(1), new Map()).unresolved[0].reason,
    'missing-exact-printing');
  assert.equal(resolveDeck(deck(1), exactPrintingIndex([...pool, ...pool]))
    .unresolved[0].reason, 'ambiguous-exact-printing');
  assert.throws(() => resolveDeck({rank: 1,
    cards: [{...deck(1).cards[0],count: 59}]},exactPrintingIndex(pool)));
});

test('32 ranks and missing cards are never dropped', () => {
  const plan = buildPlan(manifest,pool,1);
  assert.equal(plan.opponents.length,32);
  assert.equal(plan.opponents[2].status,'missing-published-list');
  const blocked = evaluatePlan(buildPlan(manifest,[],1),{
    gamesPerSeat:1,runMatch:()=>{throw new Error('must not run');}
  });
  assert.ok(blocked.opponents.every(r=>r.attempted===0));
  assert.equal(blocked.opponents[0].status,'candidate-unresolved');
});

test('balanced seats and reproducible trials', () => {
  const plan=buildPlan(manifest,pool,1);
  const run=()=>evaluatePlan(plan,{gamesPerSeat:2,seedBase:43,
    runMatch:()=>({finished:true,winner:0})});
  const first=run();
  assert.deepEqual(first,run());
  assert.equal(first.opponents[0].wins,2);
  assert.equal(first.opponents[0].losses,2);
  assert.equal(first.opponents[0].attempted,4);
  assert.equal(first.opponents[0].status,'simulated');
});

test('draw, incomplete match and exception are accounted',()=>{
  const plan=buildPlan(manifest,pool,1);
  let n=0;
  const result=evaluatePlan(plan,{gamesPerSeat:2,runMatch:()=>{
    n+=1;
    if(n===1)return {finished:true,winner:3};
    if(n===2)return {finished:false,winner:-1};
    if(n===3)throw new Error('test failure');
    return {finished:true,winner:1};
  }});
  const row=result.opponents[0];
  assert.equal(row.draws,1);
  assert.equal(row.unfinished,1);
  assert.equal(row.errors.length,1);
  assert.equal(row.completed,2);
  assert.equal(row.status,'incomplete');
  assert.equal(row.lower95,null);
});