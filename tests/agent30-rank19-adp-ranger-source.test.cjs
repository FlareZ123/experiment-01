'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const field=require('../results/aichi-2026/full-decklists.json');
const hood=require('../results/aichi-2026/candidate-hood-shadow-rider.json');
const temple=require('../results/aichi-2026/candidate-temple-shadow-rider.json');

/**
 * Compare exact published card identity, printing and quantity.
 * @param {{cards:Array<object>}} deck Registered unchanged 60-card deck.
 * @param {string} name Card name as published.
 * @param {string} set English-display set code.
 * @param {string} number English-display collector number.
 * @returns {number} Physical copies in the deck.
 */
function copies(deck,name,set,number){
  return deck.cards.filter(row=>row.name===name&&
    row.printing?.set===set&&
    String(row.printing?.number)===String(number))
    .reduce((sum,row)=>sum+row.count,0);
}
/** @param {{cards:Array<object>}} deck */
const total=deck=>deck.cards.reduce((sum,row)=>sum+row.count,0);

test('authenticated original rank19 ADP and Double Dragon source route',()=>{
  assert.equal(field.published_deck_count,29);
  assert.equal(field.total_placements,32);
  assert.deepEqual(field.missing_full_lists.map(x=>x.rank),[23,25,28]);
  const d=field.decks.find(row=>row.rank===19);
  assert.ok(d);
  assert.equal(d.player,'Mark Takahashi');
  assert.equal(d.archetype,'Raging Bolt');
  assert.equal(total(d),60);
  assert.equal(copies(d,'Arceus & Dialga & Palkia-GX','CEC','156'),1);
  assert.equal(copies(d,'Double Dragon Energy','ROS','97'),4);
  assert.deepEqual(d.cards.filter(row=>row.category==='Energy')
    .map(row=>[row.name,row.count]).sort(),[
    ['Darkness Energy',3],['Double Dragon Energy',4],
    ['Fighting Energy',3],['Lightning Energy',3]
  ].sort());
  assert.equal(d.cards.some(row=>row.name==='Pokémon Ranger'),false);
  console.log('AGENT30_RANK19_SOURCE',JSON.stringify({
    rank:d.rank,player:d.player,archetype:d.archetype,
    printedAdp:'Arceus & Dialga & Palkia-GX CEC 156',
    adpCopies:1,ddeCopies:4,
    basicWaterCopies:0,basicMetalCopies:0,
    energyCopies:13,competitiveQualifiedGames:0
  }));
});

test('unchanged fixed Hood and Temple challenger Rangers against rank19',()=>{
  for(const [label,d] of [['Hood Shield v1',hood],['Temple v1',temple]]){
    assert.equal(total(d),60);
    assert.equal(copies(d,'Pokémon Ranger','STS','104'),1);
    const templeCount=copies(d,'Temple of Sinnoh','ASR','155');
    assert.equal(templeCount,label==='Temple v1'?2:0);
    console.log('AGENT30_RANK19_COUNTER_CANDIDATE',JSON.stringify({
      label,cardCount:total(d),
      rangerCopies:copies(d,'Pokémon Ranger','STS','104'),
      templeOfSinnohCopies:templeCount,
      stagedNativeInteractionNotCompetitiveGame:true
    }));
  }
});
