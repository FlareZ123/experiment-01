'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {
  RANDOM_OPPONENT_HAND,resolveExactTextPrinting,
  randomOpponentHandEffects,runInventory
}=require('../scripts/agent12-original-field-random-hand-text-census.cjs');

test('exact rank1 SMP217 Night Watch printed randomness found',()=>{
  const result=runInventory(path.resolve(__dirname,'..'));
  assert.equal(result.sourceDeckCount,29);
  assert.equal(result.originalSourceCards,1740);
  assert.deepEqual(result.missingFullDeckRanks,[23,25,28]);
  const night=result.exactPrintedEffectMatches.filter(x=>
    x.printing==='smp-SM217'&&x.origin==='attack'&&
    x.name==='Trevenant & Dusknoir-GX'&&x.name!==undefined);
  // Attack-name property is also called name; inspect exact text to avoid
  // claiming the Pokémon title from the merged object.
  assert.ok(result.exactPrintedEffectMatches.some(x=>
    x.rank===1&&x.printing==='smp-SM217'&&
    x.origin==='attack'&&
    /2 random cards from your opponent's hand/i.test(x.text)));
  assert.ok(Array.isArray(result.unresolved));
});

test('random opponent hand is distinct from voluntary chosen targeted hand',()=>{
  assert.equal(RANDOM_OPPONENT_HAND.test(
    "Choose a random card from your opponent's hand"),true);
  assert.equal(RANDOM_OPPONENT_HAND.test(
    "Choose a card from your opponent's hand"),false);
  assert.equal(RANDOM_OPPONENT_HAND.test(
    'Draw random cards from your own hand'),false);
});

test('exact printing identity prevents false matching alternate card art',()=>{
  const rows=[{id:'smp-SM217',name:'Trevenant & Dusknoir-GX',
    number:'SM217',attacks:[]}];
  const sets=[{id:'smp',ptcgoCode:'PR-SM'}];
  const entry={name:'Trevenant & Dusknoir-GX',
    printing:{set:'SMP',number:'217'}};
  assert.equal(resolveExactTextPrinting(entry,sets,()=>rows).card.id,
    'smp-SM217');
  assert.equal(resolveExactTextPrinting({...entry,name:'Wrong'},
    sets,()=>rows).status,'unresolved-supplied-print');
});

test('scan matches both attack and ability random-hand rules',()=>{
  const x={rules:["Choose 2 random cards from your opponent's hand."],
    abilities:[{name:'A',text:'Discard a random card from your opponent\'s hand.'}],
    attacks:[{name:'B',text:'This attack does 40 damage.'}]};
  const found=randomOpponentHandEffects(x);
  assert.deepEqual(found.map(f=>f.origin),['rule','ability']);
});
