'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {Iono}=require('../vendor/twinleaf/ptcg-server/output/sets/10-scarlet-and-violet/set-paldea-evolved/iono');
const {Marnie}=require('../vendor/twinleaf/ptcg-server/output/sets/09-sword-and-shield/set-sword-and-shield/marnie');

/** @param {object} card @param {number} deckCount @param {number} opposingHandCount @param {number} extra */
function pinnedCanPlay(card,deckCount,opposingHandCount,extra=0){
  const cards=count=>Array.from({length:count},()=>({name:'Other'}));
  const owner={id:1,supporterTurn:0,hand:{cards:[card,...cards(extra)]},
    deck:{cards:cards(deckCount)}};
  const opponent={id:2,hand:{cards:cards(opposingHandCount)}};
  return card.canPlay(null,{players:[owner,opponent]},owner);
}
for(const [name,Card] of [['Iono',Iono],['Marnie',Marnie]]){
  test(name+' pinned opening gate before shuffle',()=>{
    const card=new Card();
    assert.match(card.text,/If either player put any cards/);
    assert.equal(pinnedCanPlay(card,0,1),false);
    assert.equal(pinnedCanPlay(card,1,1),true);
    assert.equal(pinnedCanPlay(card,0,1,1),true);
    assert.equal(pinnedCanPlay(card,1,0),false);
  });
}
