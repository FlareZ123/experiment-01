'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {BULK_HAND_PRINTS}=
  require('../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs');

const EXPECTED={
  'Carmine TWM':['sv6','Carmine','If you go first, you may use this card during your first turn.    Discard your hand and draw 5 cards.'],
  "Professor's Research JTG":['sv9',"Professor's Research",'Discard your hand and draw 7 cards.'],
  'Professor Sycamore BKP':['xy9','Professor Sycamore','Discard your hand and draw 7 cards.'],
  "Lillie's Determination MEG":['me1',"Lillie's Determination",'Shuffle your hand into your deck. Then, draw 6 cards. If you have exactly 6 Prize cards remaining, draw 8 cards instead.'],
  'N FCO':['xy10','N','Each player shuffles his or her hand into his or her deck. Then, each player draws a card for each of his or her remaining Prize cards.'],
  'Marnie SSH':['swsh1','Marnie','Each player shuffles their hand and puts it on the bottom of their deck. If either player put any cards on the bottom of their deck in this way, you draw 5 cards, and your opponent draws 4 cards.'],
  'Iono PAL':['sv2','Iono','Each player shuffles their hand and puts it on the bottom of their deck. If either player put any cards on the bottom of their deck in this way, each player draws a card for each of their remaining Prize cards.']
};

test('seven exact printings have supported types and source text',()=>{
  assert.deepEqual(Object.keys(EXPECTED).sort(),
    Object.keys(BULK_HAND_PRINTS).sort());
  for(const [printing,[set,name,fragment]] of Object.entries(EXPECTED)){
    const filename=path.join(__dirname,'..','resources','cards','en',set+'.json');
    const corpus=JSON.parse(fs.readFileSync(filename,'utf8'));
    const source=corpus.find(card=>card.id===BULK_HAND_PRINTS[printing].sourceId);
    assert.ok(source,printing+' id missing from '+set);
    assert.equal(source.name,name);
    assert.equal(source.supertype,'Trainer');
    assert.ok(source.subtypes.includes('Supporter'));
    assert.ok(source.rules.some(rule=>rule===fragment),
      printing+' printed effect differs from model');
  }
});

test('paper conditional bottom-deck draw text stays intact',()=>{
  for(const [printing,set] of [['Marnie SSH','swsh1'],['Iono PAL','sv2']]){
    const corpus=JSON.parse(fs.readFileSync(path.join(__dirname,
      '..','resources','cards','en',set+'.json'),'utf8'));
    const card=corpus.find(x=>x.id===BULK_HAND_PRINTS[printing].sourceId);
    assert.ok(card.rules.join(' ').includes('If either player put any cards'));
    assert.equal(BULK_HAND_PRINTS[printing].drawOnlyIfEitherPlayerMoved,true);
    assert.equal(BULK_HAND_PRINTS[printing].moveTo,'deck-bottom');
  }
});

require('./agent49-bulk-competing-held-trainer.test.cjs');
