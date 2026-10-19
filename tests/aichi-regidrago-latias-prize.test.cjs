'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const {
  REGIDRAGO_RANKS, choose, protectedLatiasPrized, sourceCensus,
  directOpeningPrizeRescue, sourceDirectRescueCensus
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


/**
 * Independent exhaustive ordered deals with indistinguishable category
 * labels to verify the exact first-draw reduction on tiny cases.
 * @param {string[]} cards
 * @param {number} opening
 * @param {number} prizes
 */
function bruteFirstDraw(cards,opening,prizes) {
  let valid=0,success=0;
  /** @param {string[]} dealt @param {string[]} left */
  function visit(dealt,left) {
    if(dealt.length===opening+prizes+1) {
      const hand=dealt.slice(0,opening);
      if(!hand.some(x=>x==='L'||x==='B'))return;
      valid++;
      const prize=dealt.slice(opening,opening+prizes);
      if(prize.includes('L') &&
         (hand.includes('H')||dealt[opening+prizes]==='H'))success++;
      return;
    }
    for(let i=0;i<left.length;i++)
      visit([...dealt,left[i]],left.filter((_,j)=>j!==i));
  }
  visit([],cards);
  return success/valid;
}

test('direct rescue first-draw math matches tiny exhaustive ordered-deal enumerator',()=>{
  for(const [cards,h] of [
    [['L','B','B','H','N','N','N','N'],1],
    [['L','B','B','H','H','N','N','N'],2]
  ]) {
    const actual=directOpeningPrizeRescue({
      size:8,opening:2,prizes:2,basics:3,heavyBalls:h
    }).probability;
    const expected=bruteFirstDraw(cards,2,2);
    assert.ok(Math.abs(actual-expected)<1e-14,
      'Exact first-draw model must equal independent brute '+expected);
  }
});

test('rank Basic audits and original source multiplicities drive direct rescue',()=>{
  const decks=REGIDRAGO_RANKS.map(rank=>sourceFixture(rank,rank===18?2:1));
  const audited={decks:REGIDRAGO_RANKS.map(rank=>({
    rank,basic_count_known:rank===18?16:15,unresolved_pokemon:[]
  }))};
  const out=sourceDirectRescueCensus({decks},audited);
  assert.equal(out.rows.length,9);
  assert.ok(out.rows.find(x=>x.rank===18).percent>2);
  assert.ok(out.rows.find(x=>x.rank===10).percent>1);
  assert.throws(()=>sourceDirectRescueCensus({decks},{decks:[]}),/Unknown Basic/);
});

test('original full source Basic audit verifies all first-draw figures',()=>{
  const a=path.join(__dirname,'../results/aichi-2026/full-decklists.json');
  const b=path.join(__dirname,'../results/aichi-2026/opening-hand-audit.json');
  if(!fs.existsSync(a)||!fs.existsSync(b))return;
  const rows=sourceDirectRescueCensus(
    JSON.parse(fs.readFileSync(a,'utf8')),
    JSON.parse(fs.readFileSync(b,'utf8'))).rows;
  assert.deepEqual(rows.map(x=>x.basics),[15,15,11,14,16,14,14,15,13]);
  assert.ok(rows.every(x=>x.percent>1.22&&x.percent<2.43));
});
