'use strict';

const assert=require('node:assert/strict');

/**
 * Count possible unordered hands of the specified size, respecting every
 * inventory line's physical copy multiplicity. Treating distinct inventory
 * lines as different card identities is an upper bound when the native
 * `fullName` observer collapses any of those lines.
 * @param {Array<{count:number,name:string}>} cards
 * @param {number} handSize
 * @param {'line'|'name'} identity
 * @returns {bigint}
 */
function countHandMultisets(cards,handSize,identity='line'){
  assert.ok(Array.isArray(cards));
  assert.ok(Number.isSafeInteger(handSize)&&handSize>=0);
  assert.ok(identity==='line'||identity==='name');
  const counts=identity==='name'?(()=>{
    const byName=new Map();
    for(const c of cards){
      assert.ok(typeof c.name==='string'&&c.name);
      assert.ok(Number.isSafeInteger(c.count)&&c.count>=0);
      byName.set(c.name,(byName.get(c.name)??0)+c.count);
    }
    return [...byName.values()];
  })():cards.map(c=>{
    assert.ok(Number.isSafeInteger(c.count)&&c.count>=0);
    return c.count;
  });
  let dp=Array(handSize+1).fill(0n);
  dp[0]=1n;
  for(const count of counts){
    const next=Array(handSize+1).fill(0n);
    for(let size=0;size<=handSize;size++){
      for(let used=0;used<=Math.min(size,count);used++){
        next[size]+=dp[size-used];
      }
    }
    dp=next;
  }
  return dp[handSize];
}

/**
 * Enumerate card-name/count inventory upper bounds for a fixed hand length.
 * This is a small-domain counting result, not a brute-force compromise of
 * any actual game log or an assertion about the size of every later hand.
 * @param {{decks:Array<{rank:number,archetype:string,cards:Array<{count:number,name:string}>}>}} field
 * @param {number} handSize
 */
function auditFieldHandDigestDomain(field,handSize){
  assert.ok(Array.isArray(field?.decks));
  const rows=field.decks.map(deck=>({
    rank:deck.rank,archetype:deck.archetype,
    categoryLineUpperBound:countHandMultisets(deck.cards,handSize,'line').toString(),
    nameOnlyDomain:countHandMultisets(deck.cards,handSize,'name').toString()
  }));
  return {
    schema:'agent16-unkeyed-short-hand-hash-domain-v1',
    handSize,authenticatedInventoryCount:rows.length,
    categoryLineDomainUpperBound:rows.map(r=>BigInt(r.categoryLineUpperBound))
      .reduce((a,b)=>a>b?a:b,0n).toString(),
    rows,competitivelyQualifiedGames:0,
    caveat:'Counts candidate unordered hand identities from published fixed 60s. This is an upper bound on native fullName-multiset preimages if multiple inventory lines share a native identity. It does not identify the private hand of any actual game.'
  };
}

module.exports={countHandMultisets,auditFieldHandDigestDomain};
