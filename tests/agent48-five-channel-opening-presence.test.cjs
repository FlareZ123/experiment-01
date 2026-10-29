'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const {choose}=require('../scripts/aichi_opening_audit.cjs');
const {PRINTED_CHANNELS,conditionalOpeningPresence,
  openingExposureRows,toMarkdown}=
  require('../scripts/agent48-five-channel-opening-presence.cjs');

const base=path.resolve(__dirname,'..','results','aichi-2026');
const sources=JSON.parse(fs.readFileSync(
  path.join(base,'full-decklists.json'),'utf8'));
const openings=JSON.parse(fs.readFileSync(
  path.join(base,'opening-hand-audit.json'),'utf8'));

test('the five source channels are explicit and distinct',()=>{
  assert.deepEqual(PRINTED_CHANNELS,[
    'Guzma','VS Seeker','Battle Compressor',
    "Lillie's Determination",'Battle VIP Pass'
  ]);
  assert.equal(new Set(PRINTED_CHANNELS).size,5);
});

test('independent hypergeometric summation agrees on all physical sixties',()=>{
  for(const deck of openingExposureRows(sources,openings)){
    const b=deck.basics,selected=deck.selected;
    const denominator=choose(60,7)-choose(60-b,7);
    let noSelectedValid=0;
    for(let heldBasic=1;heldBasic<=7;heldBasic++){
      noSelectedValid+=choose(b,heldBasic)*
        choose(60-b-selected,7-heldBasic);
    }
    assert.ok(Math.abs(deck.p7-(1-noSelectedValid/denominator))<1e-12);
    const independentEight=1-(noSelectedValid/denominator)*
      (53-selected)/53;
    assert.ok(Math.abs(deck.p8-independentEight)<1e-12);
    assert.ok(deck.p8>=deck.p7);
  }
});

test('complete original-source census and recomputable selected examples',()=>{
  const rows=openingExposureRows(sources,openings);
  assert.equal(rows.length,29);
  assert.equal(rows.reduce((sum,row)=>sum+row.selected,0),201);
  assert.ok(rows.every(row=>row.selected>0));
  assert.equal(rows.find(row=>row.rank===6).basics,4);
  assert.equal(rows.find(row=>row.rank===11).selected,7);
  assert.ok(Math.abs(rows.find(row=>row.rank===1).p8-
    0.6379876887)<1e-8);
  assert.ok(Math.abs(rows.find(row=>row.rank===13).p8-
    0.8066267795)<1e-8);
  const average=rows.reduce((sum,row)=>sum+row.p8,0)/rows.length;
  assert.ok(Math.abs(average-0.6085252270)<1e-9);
  assert.ok(toMarkdown(rows).includes('201'));
});

test('zero-copy and invalid-count cases are explicit',()=>{
  assert.equal(conditionalOpeningPresence(14,0,8),0);
  assert.throws(()=>conditionalOpeningPresence(0,7,8));
  assert.throws(()=>conditionalOpeningPresence(14,47,8));
  assert.throws(()=>conditionalOpeningPresence(14,7,9));
});

test('modified source card counts fail closed before exposure calculation',()=>{
  const modified=JSON.parse(JSON.stringify(sources));
  modified.decks[0].cards[0].count++;
  assert.throws(()=>openingExposureRows(modified,openings),/61/);
});
