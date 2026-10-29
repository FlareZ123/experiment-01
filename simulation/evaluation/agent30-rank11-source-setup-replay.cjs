'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const manifest=require('../../results/aichi-2026/full-decklists.json');
const aliases=Object.freeze({
  'Mega Absol ex MEG':'Mega Absol ex M1L',
  "Professor's Letter BKT":'Professors Letter BKT'
});

/** @returns {string[]} Pinned native FullName identities in source-copy order. */
function originalSource(){
  const deck=manifest.decks.find(x=>x.rank===11);
  assert.equal(deck?.player,'Wataru Yano');
  const cards=deck.cards.flatMap(row=>{
    const text=row.name+' '+row.printing.set;
    return Array(row.count).fill(aliases[text]||text);
  });
  assert.equal(cards.length,60);
  return cards;
}

/**
 * Audit a physical source setup; never expose this information to a player.
 * The first seeded random draw resolves the coin. Next, the normal setup
 * shuffles physical A and B in that order, each with 59 Fisher-Yates draws.
 * @param {number} seed
 * @param {0|1} sourceSeat
 * @returns {object}
 */
function replay(seed,sourceSeat){
  assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
  assert.ok(sourceSeat===0||sourceSeat===1);
  let x=seed>>>0;
  if(x===0)x=0x9e3779b9;
  const rand=()=>{
    x^=x<<13;x^=x>>>17;x^=x<<5;
    return (x>>>0)/4294967296;
  };
  const coin=rand();
  const shuffle=()=>{
    const a=Array.from({length:60},(_,i)=>i);
    for(let i=59;i>0;i--){
      const j=Math.floor(rand()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  };
  const a=shuffle(),b=shuffle();
  const source=originalSource();
  const deck=(sourceSeat===0?a:b).map(i=>source[i]);
  const initialSeven=deck.slice(0,7);
  return {seed,sourceSeat,coin,initialSeven,prizeSix:deck.slice(7,13),
    firstNaturalDraw:deck[13],
    setupSevenSha256:createHash('sha256')
      .update(JSON.stringify(initialSeven)).digest('hex')};
}

/**
 * Valid only when native roots establish zero setup bonuses and no
 * interceding source-zone changes before the owner's first natural draw.
 * @param {object} sourceDeal
 * @param {string[]} startingPokemon
 * @returns {string[]}
 */
function firstOwnTurnHand(sourceDeal,startingPokemon){
  const hand=[...sourceDeal.initialSeven];
  for(const name of startingPokemon){
    const i=hand.indexOf(name);
    assert.ok(i>=0);
    hand.splice(i,1);
  }
  hand.push(sourceDeal.firstNaturalDraw);
  return hand;
}

module.exports={originalSource,replay,firstOwnTurnHand};
