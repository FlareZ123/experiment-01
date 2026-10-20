'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose, countName, REGIDRAGO_RANKS} =
  require('./aichi-regidrago-latias-prize.cjs');

/** @param {bigint} a @param {bigint} b @returns {bigint} */
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

/**
 * Two mutually exclusive, restricted first-draw Dragapult-to-discard routes.
 * A: Dragapult is among the opening seven/first draw alongside at least one
 * Quick Ball or Mysterious Treasure. The card is available as its discard cost.
 * B: Dragapult is neither in the opening nor first draw, is absent from the six
 * Prizes, and a Battle Compressor is among those eight cards.
 *
 * This assumes one singleton non-Basic Dragon and disjoint Basic, searcher,
 * compressor, and other categories. Prize cards are set between hand and draw.
 * Every opening-seven configuration must contain a Basic. No action costs,
 * turn order, alternative discard/search routes, lock, or opponent is modeled.
 *
 * @param {{size?:number,opening?:number,prizes?:number,basics:number,
 *   searchers:number,compressors:number}} input
 * @returns {{handDiscard:object,deckCompressor:object,either:object}}
 */
function dragapultOpeningAccess(input) {
  const {size=60,opening=7,prizes=6,basics,searchers,compressors}=input;
  if (![size,opening,prizes,basics,searchers,compressors]
    .every(Number.isSafeInteger) || opening<1 || prizes<0 ||
    size<=opening+prizes || basics<1 || searchers<0 || compressors<0 ||
    basics+searchers+compressors+1>size) {
    throw new RangeError('Invalid disjoint source-card categories');
  }
  const nonPrizeRemaining=size-opening-1;
  const unprizedDeckRemaining=nonPrizeRemaining-prizes;
  const counts=[basics,1,searchers,compressors,
    size-basics-1-searchers-compressors];
  const valid=choose(size,opening)-choose(size-basics,opening);
  const denominator=valid*BigInt(size-opening)*BigInt(nonPrizeRemaining);
  let total=0n, hand=0n, compressor=0n;
  for(let b=1;b<=Math.min(basics,opening);b++)
    for(let d=0;d<=1;d++)
      for(let s=0;s<=Math.min(searchers,opening-b-d);s++)
        for(let c=0;c<=Math.min(compressors,opening-b-d-s);c++) {
          const rest=opening-b-d-s-c;
          if(rest<0||rest>counts[4])continue;
          const drawn=[b,d,s,c,rest];
          const ways=drawn.reduce((p,n,i)=>p*choose(counts[i],n),1n);
          for(let next=0;next<counts.length;next++) {
            const remaining=counts[next]-drawn[next];
            if(remaining<=0)continue;
            const weight=ways*BigInt(remaining);
            total+=weight*BigInt(nonPrizeRemaining);
            const seenDragon=d+(next===1?1:0);
            const seenSearcher=s+(next===2?1:0);
            const seenCompressor=c+(next===3?1:0);
            if(seenDragon===1 && seenSearcher>0)
              hand+=weight*BigInt(nonPrizeRemaining);
            else if(seenDragon===0 && seenCompressor>0)
              compressor+=weight*BigInt(unprizedDeckRemaining);
          }
        }
  assert.equal(total,denominator,'Opening/draw partition normalization failed');
  /** @param {bigint} numerator @returns {object} */
  function format(numerator) {
    const div=gcd(numerator,denominator);
    return {
      numerator:(numerator/div).toString(),
      denominator:(denominator/div).toString(),
      probability:Number(numerator)/Number(denominator),
      percent:100*Number(numerator)/Number(denominator)
    };
  }
  return {handDiscard:format(hand),deckCompressor:format(compressor),
    either:format(hand+compressor)};
}

/**
 * Read Basic-stage counts from the existing audited source-printing file.
 * @param {{decks:object[]}} manifest Aichi exact 60-card inventory.
 * @param {{decks:object[]}} openingAudit Printed Basic count audit.
 * @returns {{rows:object[],means:object}}
 */
function nineRankDragapultCensus(manifest,openingAudit) {
  assert.ok(Array.isArray(manifest?.decks) &&
    Array.isArray(openingAudit?.decks));
  const rows=REGIDRAGO_RANKS.map(rank=>{
    const source=manifest.decks.find(x=>x.rank===rank);
    const opening=openingAudit.decks.find(x=>x.rank===rank);
    assert.ok(source && opening && opening.unresolved_pokemon?.length===0 &&
      Number.isSafeInteger(opening.basic_count_known),
    'Missing rank or unresolved Basic printing at rank '+rank);
    assert.equal(source.cards.reduce((sum,row)=>sum+row.count,0),60);
    const basics=opening.basic_count_known;
    const dragapult=countName(source.cards,'Dragapult ex');
    const treasure=countName(source.cards,'Mysterious Treasure');
    const quick=countName(source.cards,'Quick Ball');
    const compressor=countName(source.cards,'Battle Compressor');
    assert.equal(dragapult,1,'Expected singleton Dragapult at rank '+rank);
    assert.ok(treasure>0 && quick>0,'Missing expected one-card Ball route');
    const values=dragapultOpeningAccess({
      basics,searchers:treasure+quick,compressors:compressor
    });
    const treasureOnly=dragapultOpeningAccess({
      basics,searchers:treasure,compressors:compressor
    }).handDiscard;
    return {rank,basics,dragapult,treasure,quick,compressor,
      treasureOnly, ...values};
  });
  const mean=key=>rows.reduce((sum,row)=>sum+row[key].percent,0)/rows.length;
  return {rows,means:{
    treasureOnly:mean('treasureOnly'),
    handDiscard:mean('handDiscard'),
    deckCompressor:mean('deckCompressor'),
    either:mean('either')
  },interpretation:'Restricted legal-opening-eight card-location opportunities, not turn execution, matchup strength, or game win rate'};
}

if(require.main===module){
  const manifest=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/full-decklists.json'),'utf8'));
  const opening=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/aichi-2026/opening-hand-audit.json'),'utf8'));
  process.stdout.write(JSON.stringify(nineRankDragapultCensus(manifest,opening),null,2)+'\n');
}
module.exports={dragapultOpeningAccess,nineRankDragapultCensus};
