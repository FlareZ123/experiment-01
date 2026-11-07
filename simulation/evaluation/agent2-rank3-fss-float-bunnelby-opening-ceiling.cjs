'use strict';

const assert=require('node:assert/strict');
const {choose,analyzeOriginal29}=
  require('./agent2-original29-fss-first-tool-collision.cjs');

const VERSION='agent2-rank3-fss-float-bunnelby-opening-ceiling-v1';
const SCALE=420n;

/** @param {object[]} cards @param {string} name @returns {number} */
function copies(cards,name){
  return cards.filter(card=>card.name===name)
    .reduce((sum,card)=>sum+card.count,0);
}

/**
 * Exact disjoint opening-seven categories from the authenticated original
 * rank-3 source 60. The remaining category may contain other Basics because
 * every event we count explicitly includes Snorlax and Bunnelby.
 * @returns {{names:string[],counts:number[],basicCount:number}}
 */
function sourceCategories(){
  const source=require('../../results/aichi-2026/full-decklists.json');
  const rank3=source.decks.find(deck=>deck.rank===3);
  assert.ok(rank3);
  assert.equal(rank3.cards.reduce((n,card)=>n+card.count,0),60);
  const names=['Forest Seal Stone','Float Stone','Stealthy Hood',
    'Tool Jammer','Snorlax','Bunnelby','Capture Energy','Rotom V'];
  const counts=names.map(name=>copies(rank3.cards,name));
  assert.deepEqual(counts,[1,1,1,1,3,1,3,1],
    'Source inventory changed; audit classification before changing probability');
  const other=60-counts.reduce((a,b)=>a+b,0);
  const rank=analyzeOriginal29().rows.find(row=>row.rank===3);
  assert.equal(rank.basic,11,'The legal opening-hand denominator changed');
  assert.equal(rank.vBasic,1,'The V-Basic exclusion requires rechecking');
  assert.deepEqual(rank.otherToolNames.sort((a,b)=>a[0].localeCompare(b[0])),
    [['Float Stone',1],['Stealthy Hood',1],['Tool Jammer',1]]
      .sort((a,b)=>a[0].localeCompare(b[0])));
  return {names:[...names,'Other'],counts:[...counts,other],
    basicCount:rank.basic};
}

/**
 * Count opening seven-card combinations with uniform random order.
 * When an initial hand holds several Tools, FSS is the first physical Tool
 * with probability 1/(number of held Tools). Each winning event contains
 * two known Basic Pokémon and thus is already a valid opening.
 * @param {number[]} counts Nine disjoint 60-card source categories.
 * @param {{capture?:boolean,excludeRotomV?:boolean,allCapture?:boolean}} mode
 * @returns {bigint} Exact integer numerator scaled by SCALE=420.
 */
function scaledOrderedCount(counts,mode={}){
  assert.equal(counts.length,9);
  assert.equal(counts.reduce((a,b)=>a+b,0),60);
  assert.ok(counts.every(n=>Number.isSafeInteger(n)&&n>=0));
  const held=[];
  let result=0n;
  function visit(index,left,multiplicity){
    if(index===counts.length-1){
      if(left>counts[index])return;
      held.push(left);
      const [stone,float,hood,jammer,snorlax,bunnelby,capture,rotom]=held;
      const matches=stone===1&&float===1&&snorlax>0&&bunnelby===1&&
        (!mode.capture||capture>=1)&&
        (!mode.excludeRotomV||rotom===0)&&
        (!mode.allCapture||capture===counts[6]);
      if(matches){
        const tools=stone+float+hood+jammer;
        assert.ok(tools>0&&SCALE%BigInt(tools)===0n);
        result+=multiplicity*choose(counts[index],left)*
          (SCALE/BigInt(tools));
      }
      held.pop();
      return;
    }
    for(let n=0;n<=Math.min(left,counts[index]);n++){
      held.push(n);
      visit(index+1,left-n,multiplicity*choose(counts[index],n));
      held.pop();
    }
  }
  visit(0,7,1n);
  return result;
}

/** @returns {object} Exact combinatorial opportunities, not native games. */
function analyzeRank3Opening(){
  const {names,counts,basicCount}=sourceCategories();
  const all=choose(60,7);
  const valid=all-choose(60-basicCount,7);
  const conditions=[
    ['bunnelby-coheld',{ }],
    ['capture-at-least-one',{capture:true}],
    ['capture-and-no-opening-rotom-v',{capture:true,excludeRotomV:true}],
    ['all-three-capture-in-opening',{allCapture:true}]
  ];
  const cases=conditions.map(([id,flags])=>{
    const numerator=scaledOrderedCount(counts,flags);
    return {id,scaledNumerator:numerator.toString(),
      scale:SCALE.toString(),
      chanceGivenValidOpening:Number(numerator)/Number(valid*SCALE),
      chanceUnconditional:Number(numerator)/Number(all*SCALE),
      validOpeningsPerOccurrence:Number(valid*SCALE)/Number(numerator)};
  });
  return {version:VERSION,originalRank:3,
    source:'results/aichi-2026/full-decklists.json',
    exactCategories:Object.fromEntries(names.map((name,i)=>[name,counts[i]])),
    basicCount,openingSevenAll:all.toString(),
    openingSevenValid:valid.toString(),
    weighting:'uniform initial 7; FSS earliest among held Tools; no mulligan bonus draws',
    excluded:'Prizes, subsequent draws/search, attachments, tactical policy, paper clock, opponent response, match result',
    cases,qualifiedGames:0};
}

if(require.main===module)process.stdout.write(
  JSON.stringify(analyzeRank3Opening(),null,2)+'\n');
module.exports={VERSION,SCALE,copies,sourceCategories,scaledOrderedCount,
  analyzeRank3Opening};
