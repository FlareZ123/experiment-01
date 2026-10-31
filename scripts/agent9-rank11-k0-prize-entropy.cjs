'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {choose}=require('./agent9-crobat-vip-cohold.cjs');

const VERSION='agent9-rank11-k0-first-draw-prize-multiset-entropy-v1';
const RANK11_BASIC_NAMES=new Set([
  'Mega Absol ex','Trubbish','Oranguru V','Latias ex',
  'Tapu Lele-GX','Crobat V','Squawkabilly ex'
]);

/** Exact BigInt combinations converted to safe numeric probability units. */
function c(n,k){return Number(choose(n,k))}

/**
 * Mean Shannon entropy of unseen Prize PRINTING MULTISET at first own root
 * after the mandatory opening draw, conditional on a Basic-valid initial 7.
 * The six Prize positions remain unknown after deck search; this computes
 * printing composition only, not position entropy or gameplay utility.
 *
 * @param {object[]} cards Original complete physical printing quantities.
 * @param {Set<string>} basicNames Audited actual Basic printing names.
 * @param {{opening?:number,prizes?:number}} [options]
 * @returns {object}
 */
function expectedPrizeCompositionBits(cards,basicNames,options={}){
  const opening=options.opening??7,prizes=options.prizes??6;
  assert.ok(Array.isArray(cards)&&cards.length>0);
  const total=cards.reduce((sum,row)=>sum+row.count,0);
  assert.ok(Number.isSafeInteger(opening)&&opening>=1&&
    Number.isSafeInteger(prizes)&&prizes>=1&&
    total-opening-1-prizes>=0);
  const B=cards.filter(row=>basicNames.has(row.name))
    .reduce((sum,row)=>sum+row.count,0);
  assert.ok(B>0);
  const valid=c(total,opening)-c(total-B,opening);
  const afterSeven=total-opening,unknown=afterSeven-1;
  const physicalMax=Math.log2(c(unknown,prizes));
  let duplicateReduction=0;
  const expectedLogWays=n=>{
    let subtotal=0;
    for(let k=0;k<=Math.min(n,prizes);k++){
      const copies=c(n,k);
      if(copies<=1)continue;
      subtotal+=(copies*c(unknown-n,prizes-k)/
        c(unknown,prizes))*Math.log2(copies);
    }
    return subtotal;
  };
  for(const row of cards){
    const n=row.count;
    let rowExpected=0;
    for(let h=0;h<=Math.min(n,opening);h++){
      const handWeight=basicNames.has(row.name)?
        (h===0?c(total-n,opening)-c(total-B,opening):
          c(n,h)*c(total-n,opening-h)):
        c(n,h)*(c(total-n,opening-h)-
          c(total-B-n,opening-h));
      if(handWeight<=0)continue;
      const remaining=n-h;
      const nextSame=remaining/afterSeven;
      rowExpected+=handWeight/valid*(
        nextSame*expectedLogWays(remaining-1)+
        (1-nextSame)*expectedLogWays(remaining));
    }
    duplicateReduction+=rowExpected;
  }
  return {physicalLabelEntropyBits:physicalMax,
    unknownPrizeMultisetEntropyBits:physicalMax-duplicateReduction,
    duplicatePrintingReductionBits:duplicateReduction,
    totalCards:total,basicCards:B,uniquePrintings:cards.length,
    opening,prizes,includesMandatoryFirstTurnDraw:true,
    requiresNoEarlierDeckSearch:true,competitiveWinRateQualified:false};
}

function run(root=path.resolve(__dirname,'..')){
  const source=require(path.join(root,
    'results/aichi-2026/full-decklists.json'));
  const rank11=source.decks.find(row=>row.rank===11);
  assert.ok(rank11);
  const result=expectedPrizeCompositionBits(rank11.cards,RANK11_BASIC_NAMES);
  assert.equal(result.totalCards,60);
  assert.equal(result.basicCards,11);
  assert.equal(result.uniquePrintings,26);
  return {version:VERSION,originalSourceRank:11,...result};
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,RANK11_BASIC_NAMES,expectedPrizeCompositionBits,run};
