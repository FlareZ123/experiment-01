'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,shouldSeekHns,chooseHnsDonors,visibleHnsDiscardCount}=
  require('../simulation/twinleaf/agent25-dhelmise-compressor-donors.cjs');
const card=fullName=>({fullName});
const board=(active='Dhelmise M5')=>({getPokemonCard:()=>active?card(active):null});
const player=(hand,discard,active='Dhelmise M5')=>({
  hand:{cards:hand.map(card)},discard:{cards:discard.map(card)},
  active:board(active),bench:[]
});

test('candidate decides from public owned hand/board/discard only',()=>{
  const p=player(['Battle Compressor PHF'],['Banette M5','Shuppet M5']);
  assert.equal(shouldSeekHns(p),true);
  assert.equal(visibleHnsDiscardCount(p),2);
  p.discard.cards.push(card('Banette M5'),card('Sinistcha M5'));
  assert.equal(shouldSeekHns(p),false);
  p.discard.cards.pop();
  p.hand.cards=[];
  assert.equal(shouldSeekHns(p),false);
});

test('Dhelmise held is sufficient but another archetype or missing Item is not',()=>{
  const p=player(['Battle Compressor PHF','Dhelmise M5'],[],'Banette M5');
  assert.equal(shouldSeekHns(p),true);
  p.hand.cards.pop();
  assert.equal(shouldSeekHns(p),false);
});

test('real owner deck prompt selects actual specific card instances and threshold count',()=>{
  const deck=['Psychic Energy SVE','Shuppet M5','Banette M5',
    'Sinistcha M5','Banette M5','Field Blower GRI','Shuppet M5']
    .map(card);
  assert.deepEqual(chooseHnsDonors(deck,4,3),
    [deck[2],deck[4],deck[1]]);
  assert.deepEqual(chooseHnsDonors(deck,1,3),[deck[2]]);
  assert.deepEqual(chooseHnsDonors(deck,5,2),[deck[2],deck[4]]);
  assert.equal(VERSION,'DhelmiseHnsOwnerCompressor-v1');
  assert.throws(()=>chooseHnsDonors(deck,0,3));
});
