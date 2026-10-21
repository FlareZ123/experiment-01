'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const photo=require(path.join(root,
  'results/aichi-2026/repurika-dragon05-photo-name-ledger-20261021.json'));
const published=require(path.join(root,'results/aichi-2026/full-decklists.json'));

/** @param {string} name @returns {string} */
const normalized=name=>name.toLowerCase().replace(/[^a-z0-9]/g,'');

/**
 * Name-level overlap only, deliberately independent of unverified Japanese
 * printing IDs and unknown civil identities.
 * @param {{name?:string,english?:string,count:number}[]} cards
 * @returns {Map<string,number>}
 */
function multiset(cards){
  const map=new Map();
  for(const card of cards){
    const key=normalized(card.english??card.name);
    map.set(key,(map.get(key)??0)+card.count);
  }
  return map;
}

/** @param {Map<string,number>} x @param {Map<string,number>} y @returns {number} */
function overlap(x,y){
  let shared=0;
  for(const [name,count] of x)shared+=Math.min(count,y.get(name)??0);
  return shared;
}

test('original photo has 38 distinct visible cells and exactly 60 copies',()=>{
  assert.equal(photo.schema,'aichi-repurika-dragon05-visual-name-ledger-v1');
  assert.equal(photo.cells.length,38);
  assert.deepEqual(photo.row_copy_totals,[13,8,15,11,13]);
  assert.deepEqual([...new Set(photo.cells.map(x=>x.cell))].length,38);
  for(let row=1;row<=5;row++){
    const part=photo.cells.filter(c=>c.cell.startsWith('R'+row+'C'));
    assert.deepEqual(part.map(c=>c.cell),
      Array.from({length:row===5?6:8},(_,index)=>
        'R'+row+'C'+(index+1)));
  }
  assert.ok(photo.cells.every(card=>Number.isSafeInteger(card.count)&&
    card.count>=1&&card.english&&card.japanese&&card.category));
  assert.equal(photo.cells.reduce((sum,card)=>sum+card.count,0),60);
  assert.deepEqual(photo.category_copy_totals,{
    'Pokémon':20,'Item':16,'Pokémon Tool':2,
    'Supporter':10,'Stadium':2,'Special Energy':3,'Basic Energy':7
  });
  assert.equal(photo.japanese_printing_ids_verified,false);
  assert.deepEqual(photo.cells.filter(x=>x.cell==='R4C1').map(x=>[x.english,x.japanese,x.count]),
    [['Muscle Band','ちからのハチマキ',2]]);
  assert.equal(photo.civil_name_linkage_verified,false);
});

test('photo is distinct at English name/count level from 29 published ranks',()=>{
  assert.equal(published.published_deck_count,29);
  assert.ok(published.missing_full_lists.some(entry=>entry.rank===28));
  assert.ok(published.decks.every(deck=>deck.rank!==28));
  const target=multiset(photo.cells);
  assert.equal([...target.values()].reduce((sum,n)=>sum+n,0),60);
  const scores=published.decks.map(deck=>({
    rank:deck.rank,shared:overlap(target,multiset(deck.cards))
  })).sort((a,b)=>b.shared-a.shared);
  assert.equal(scores[0].rank,10);
  assert.equal(scores[0].shared,53);
  assert.ok(scores.every(row=>row.shared<60),
    'Poster name inventory must not be silently duplicated as a published rank');
  assert.deepEqual(photo.published_29_name_multiplicity_nearest,
    scores.slice(0,5).map(row=>({
      rank:row.rank,
      player:published.decks.find(deck=>deck.rank===row.rank).player,
      shared_copies:row.shared
    })));
});
