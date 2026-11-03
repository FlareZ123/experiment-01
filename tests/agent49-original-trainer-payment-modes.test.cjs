'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const roster = require('../results/aichi-2026/full-decklists.json');
const {COST_BY_PRINT,ownerTrainerDiscardContention} =
  require('../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs');

const SPEC = Object.freeze({
  'Plumeria BUS': {
    type:'Supporter', variants:[['required-energy-denial',2]],
    sourceCopies:20,sourceDecks:8
  },
  'Bellelba & Brycen-Man CEC': {
    type:'Supporter',variants:[
      ['ordinary-top-deck-discard',0],
      ['enhanced-three-bench-discard',3]],
    sourceCopies:3,sourceDecks:3
  },
  'Cynthia & Caitlin CEC': {
    type:'Supporter',variants:[
      ['ordinary-supporter-retrieval',0],['optional-draw-three',1]],
    sourceCopies:4,sourceDecks:4
  },
  'Dowsing Machine PLS': {
    type:'Item',variants:[['required-trainer-retrieval',2]],
    sourceCopies:1,sourceDecks:1
  }
});

/** @param {string[]} hand */
function makeView(hand) {
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:4,
    ownHand:Object.freeze([...hand])};
}
/** @param {string[]} hand */
function makeRows(hand) {
  return hand.map((printing,handIndex)=>({
    handIndex,printing,type:SPEC[printing]?.type??'Item',
    publicBlocker:null
  })).filter(row=>SPEC[row.printing]);
}

test('four exact original printed costs have distinct mandatory/optional modes',()=>{
  for(const [printing,expected] of Object.entries(SPEC)){
    const actual=COST_BY_PRINT.get(printing);
    assert.equal(actual?.type,expected.type);
    assert.deepEqual(actual.options.map(x=>[x.mode,x.discards]),
      expected.variants);
  }
  // A current printing does not establish a same-name earlier print.
  assert.equal(COST_BY_PRINT.has('Plumeria UNM'),false);
  assert.equal(COST_BY_PRINT.has('Dowsing Machine BCR'),false);
});

test('original authenticated Aichi source roster contains exactly the audited cost printings',()=>{
  assert.equal(roster.decks.length,29);
  const all=roster.decks.flatMap(d=>d.cards
    .filter(c=>c.category==='Trainer')
    .map(c=>({rank:d.rank,printing:c.name+' '+c.printing.set,
      copies:c.count})));
  let total=0;
  for(const [name,spec] of Object.entries(SPEC)){
    const rows=all.filter(x=>x.printing===name);
    const copies=rows.reduce((n,x)=>n+x.copies,0);
    assert.equal(copies,spec.sourceCopies);
    assert.equal(rows.length,spec.sourceDecks);
    total+=copies;
  }
  assert.equal(total,28);
});

test('mandatory paid Plumeria is physically impossible with only one other card',()=>{
  const hand=['Plumeria BUS','Battle VIP Pass FST'];
  const [row]=ownerTrainerDiscardContention(makeView(hand),
    makeRows(hand)).rows;
  assert.equal(row.variants.length,1);
  assert.equal(row.variants[0].discards,2);
  assert.equal(row.variants[0].physicallyAffordable,false);
  assert.equal(row.variants[0].physicalPaymentWays,'0');
  const full=['Plumeria BUS','A','B'];
  const [paid]=ownerTrainerDiscardContention(makeView(full),
    makeRows(full),new Set([1,2])).rows;
  assert.equal(paid.variants[0].physicallyAffordable,true);
  assert.equal(paid.variants[0].affordablePreservingProtected,false);
  assert.equal(paid.variants[0].forcedProtectedSacrifices,2);
});

test('Bellelba and Cynthia retain free and enhanced choices, not assumed full effects',()=>{
  const hand=['Bellelba & Brycen-Man CEC','Cynthia & Caitlin CEC','A','B','C'];
  const out=ownerTrainerDiscardContention(makeView(hand),makeRows(hand));
  assert.deepEqual(out.rows[0].variants.map(v=>v.discards),[0,3]);
  assert.deepEqual(out.rows[1].variants.map(v=>v.discards),[0,1]);
  assert.equal(out.rows[0].variants[1].physicallyAffordable,true);
  assert.equal(out.pairs.length,1);
  assert.equal(out.pairs[0].genericBlocker,'one-supporter-per-turn');
  // The two enhanced Supporters may each be payable in isolation, yet
  // cannot both be used in the same normal turn.
  assert.equal(out.pairs[0].variants.at(-1).physicallyAffordable,false);
  assert.equal(out.cannotCertifyTargetOrSearch,true);
  assert.equal(out.cannotCertifyPaperAction,true);
});

test('Dowsing Machine requires two OTHER cards regardless of ACE SPEC status',()=>{
  const short=['Dowsing Machine PLS','Quick Ball FST'];
  const [first]=ownerTrainerDiscardContention(makeView(short),
    makeRows(short)).rows;
  assert.equal(first.variants[0].physicallyAffordable,false);
  const long=['Dowsing Machine PLS','A','B'];
  const [second]=ownerTrainerDiscardContention(makeView(long),
    makeRows(long)).rows;
  assert.equal(second.variants[0].physicallyAffordable,true);
  assert.equal(second.variants[0].physicalPaymentWays,'1');
  assert.equal(second.variants[0].paperTargetVerified,undefined);
});

// Shared manual-only census also exercises print-verified whole-hand effects.
require('./agent49-original-bulk-hand-source-text.test.cjs');
require('./agent49-owner-bulk-hand-transitions.test.cjs');
