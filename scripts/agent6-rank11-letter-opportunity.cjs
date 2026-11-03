'use strict';
const assert = require('node:assert/strict');

/** @param {number} n @param {number} k @returns {bigint} */
function choose(n,k) {
  if (!Number.isSafeInteger(n)||!Number.isSafeInteger(k))
    throw new TypeError('Expected safe integers');
  if (k<0||k>n) return 0n;
  let out=1n;
  for(let i=1;i<=Math.min(k,n-k);i++)
    out=out*BigInt(n-i+1)/BigInt(i);
  return out;
}

/**
 * Conditional legal-seven probability of zero target Energy and at least
 * one search Item after d subsequent random draws, after Prize placement.
 * The Basic, Energy and search Item inventories must be disjoint.
 * @param {{n:number,b:number,e:number,l:number,h:number,p:number,d:number}} x
 */
function energyStarvedWithLetter(x) {
  const {n,b,e,l,h,p,d}=x;
  for(const value of Object.values(x))
    assert.ok(Number.isSafeInteger(value)&&value>=0);
  assert.ok(b>=1&&h>=1&&b+e+l<=n&&h+p+d<=n);
  const legal=choose(n,h)-choose(n-b,h);
  assert.ok(legal>0n);
  const noE=choose(n-e,h)-choose(n-e-b,h);
  const noEL=choose(n-e-l,h)-choose(n-e-l-b,h);
  const numerator=noE*choose(n-e-h,d)-noEL*choose(n-e-l-h,d);
  const denominator=legal*choose(n-h,d);
  assert.ok(denominator>0n&&numerator>=0n&&numerator<=denominator);
  return {
    numerator:String(numerator),denominator:String(denominator),
    probability:Number(numerator)/Number(denominator),
    minimumEnergyRemainingInDeck:Math.max(0,e-p),
    qualifiedCompetitiveGames:0
  };
}

/**
 * Validate every premise against the authentic published rank-11 printed 60
 * and independent opening-Basic count before calculating.
 */
function rank11Report() {
  const field=require('../results/aichi-2026/full-decklists.json');
  const audit=require('../results/aichi-2026/opening-hand-audit.json');
  const deck=field.decks.find(d=>d.rank===11);
  const basic=audit.decks.find(d=>d.rank===11);
  assert.equal(deck?.player,'Wataru Yano');
  assert.equal(basic?.basic_count_known,11);
  assert.equal(basic?.unresolved_pokemon.length,0);
  assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
  const energy=deck.cards.filter(c=>c.category==='Energy');
  const letter=deck.cards.filter(c=>c.name==="Professor's Letter");
  assert.equal(energy.length,1);
  assert.equal(energy[0].name,'Darkness Energy');
  assert.equal(energy[0].count,8);
  assert.equal(letter.length,1);
  assert.equal(letter[0].count,4);
  assert.equal(letter[0].printing.set,'BKT');
  assert.equal(letter[0].printing.number,'146');
  return {rank:11,player:deck.player,
    ...energyStarvedWithLetter({n:60,b:11,e:8,l:4,h:7,p:6,d:1})};
}
module.exports={choose,energyStarvedWithLetter,rank11Report};
