'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {BULK_HAND_PRINTS}=
  require('../simulation/twinleaf/agent49-owner-bulk-hand-transitions.cjs');

const EXPECTED={
  'Carmine TWM':['sv6','Carmine','Discard your hand and draw 5 cards'],
  "Professor's Research JTG":['sv9',"Professor's Research",'Discard your hand and draw 7 cards'],
  'Professor Sycamore BKP':['xy9','Professor Sycamore','Discard your hand and draw 7 cards'],
  "Lillie's Determination MEG":['me1',"Lillie's Determination",'Shuffle your hand into your deck'],
  'N FCO':['xy10','N','Each player shuffles his or her hand into his or her deck'],
  'Marnie SSH':['swsh1','Marnie','bottom of their deck'],
  'Iono PAL':['sv2','Iono','bottom of their deck']
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
    assert.ok(source.rules.some(rule=>rule.includes(fragment)),
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
