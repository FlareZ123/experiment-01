'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {
  REGIDRAGO_RANKS, choose, protectedLatiasPrized, sourceCensus
} = require('../scripts/aichi-regidrago-latias-prize.cjs');

test('binomial boundary and source denominators', () => {
  assert.equal(choose(60, 6), 50063860n);
  assert.equal(choose(5, 6), 0n);
  assert.equal(choose(5, -1), 0n);
  assert.equal(choose(6, 0), 1n);
  assert.equal(choose(60, 6), choose(60, 54));
});

test('all protected cards Prized exact combinatorial fractions', () => {
  assert.equal(protectedLatiasPrized(0).fraction, '1/10');
  assert.equal(protectedLatiasPrized(1).fraction, '1/118');
  assert.equal(protectedLatiasPrized(2).fraction, '1/1711');
  assert.equal(protectedLatiasPrized(6).probability, 0);
  assert.equal(protectedLatiasPrized(1, 6, 2).fraction, '1/15');
});

/** @param {number} rank @param {number} heavy */
function sourceFixture(rank, heavy) {
  const occupied = 3 + heavy;
  return {
    rank,
    cards: [
      {name:'Latias ex',count:1},
      {name:'Hisuian Heavy Ball',count:heavy},
      {name:'Tapu Lele-GX',count:1},
      {name:'Dedenne-GX',count:1},
      {name:'Grass Energy',count:60-occupied}
    ]
  };
}

test('nine printed ranks, complete source requirements and probabilities', () => {
  const deckFixture = REGIDRAGO_RANKS.map(rank=>sourceFixture(rank,rank===18?2:1));
  const got = sourceCensus({decks: deckFixture});
  assert.equal(got.rows.length,9);
  assert.equal(got.rows.filter(row=>row.hisuianHeavyBall===2).length,1);
  assert.equal(got.rows.find(row=>row.rank===18).prizeCollapse.fraction,'1/1711');
  assert.equal(got.rows.find(row=>row.rank===10).prizeCollapse.fraction,'1/118');
  assert.ok(got.means.latiasAndAllHeavyBallsPrizedPercent > 0.75);
  assert.ok(got.means.latiasAndAllHeavyBallsPrizedPercent < 0.77);
  assert.throws(()=>sourceCensus({decks:deckFixture.slice(1)}),/Missing original/);
  const bad=deckFixture.map(deck=>({...deck,cards:deck.cards.map(card=>({...card}))}));
  bad[0].cards[0].count=2;
  assert.throws(()=>sourceCensus({decks:bad}),/60 physical cards/);
});

test('published original Aichi inventory, if present in repository checkout', () => {
  const file=path.join(__dirname,'../results/aichi-2026/full-decklists.json');
  if (!fs.existsSync(file)) return;
  const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
  const census=sourceCensus(manifest);
  assert.deepEqual(census.rows.map(row=>row.hisuianHeavyBall),[1,1,1,1,2,1,1,1,1]);
  assert.ok(census.rows.every(row=>row.latiasEx===1));
  assert.ok(census.rows.every(row=>row.tapuLeleGX>=1&&row.dedenneGX>=1));
  assert.ok(census.rows.every(row=>row.floatStone===0&&row.airBalloon===0&&row.escapeRope===0));
});
