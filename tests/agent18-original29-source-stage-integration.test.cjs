'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {sourceBasicPrintingIndex,original29HeldFirst8}=
  require('../scripts/agent18-original-source-supporter-opening.cjs');
const {loadTrainerTypes}=
  require('../scripts/agent3-jellicent-field-exposure.cjs');

test('all 29 authenticated original printed stages and Supporters resolve',()=>{
  const root=path.resolve(__dirname,'..');
  const published=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const slots=published.decks.flatMap(deck=>
    deck.cards.filter(card=>card.category==='Pokémon'));
  const basics=sourceBasicPrintingIndex(root,slots);
  const types=loadTrainerTypes(path.join(root,'resources/cards/en'));
  const result=original29HeldFirst8(published,types,basics);
  const byRank=new Map(result.rows.map(row=>[row.rank,row]));
  assert.equal(result.authenticatedDecks,29);
  assert.deepEqual(result.missingRanks,[23,25,28]);
  assert.equal(new Set(result.rows.map(row=>row.rank)).size,29);
  assert.equal(result.rows.reduce((sum,row)=>sum+row.allSupporterCopies,0),297);
  assert.equal(result.rows.filter(row=>row.fiveFamilyCopies>0).length,28);
  assert.equal(byRank.get(11).basicCopies,11);
  assert.equal(byRank.get(11).allSupporterCopies,8);
  assert.equal(byRank.get(11).heldAny.numerator,'82633469');
  assert.equal(byRank.get(11).heldAny.denominator,'120577544');
  assert.equal(byRank.get(6).basicCopies,4);
  assert.equal(byRank.get(6).allSupporterCopies,21);
  assert.equal(byRank.get(15).basicCopies,14);
  assert.equal(byRank.get(24).allSupporterCopies,24);
  assert.equal(byRank.get(31).fiveFamilyCopies,0);
  assert.equal(byRank.get(31).allSupporterCopies,4);
  assert.ok(result.rows.every(row=>row.heldAny.probability>=0&&
    row.heldAny.probability<=1));
  assert.equal(result.competitiveQualifiedGames,0);
});
