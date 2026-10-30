'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {reportCoverage}=require('../twinleaf/card-coverage.cjs');
const {publicCatalog}=
  require('../twinleaf/agent43-guzma-prompt-continuation.cjs');

const VERSION='agent49-first-seven-regidrago-treasure-donor-v1';

/**
 * Evaluate an exact binomial coefficient for integers up to 60.
 * @param {number} n @param {number} k @returns {number}
 */
function choose(n,k){
  if(!Number.isSafeInteger(n)||!Number.isSafeInteger(k)||
     n<0||k<0||k>n)return 0;
  let result=1;
  for(let i=1;i<=Math.min(k,n-k);i++)
    result=result*(n-i+1)/i;
  return Math.round(result);
}

/**
 * Unconditional probability in the first seven sampled physical cards that
 * each of three disjoint source-card categories is present at least once.
 * Hypergeometric inclusion/exclusion is exact; no replacement or independence
 * assumptions. This does not model actions, Prize position, or later draws.
 * @param {number} total @param {number} draws @param {number[]} groups
 */
function intersectionProbability(total,draws,groups){
  assert.equal(groups.length,3);
  assert.ok(groups.every(x=>Number.isSafeInteger(x)&&x>=0));
  assert.ok(groups.reduce((a,b)=>a+b,0)<=total);
  const denominator=choose(total,draws);
  let favorable=0;
  for(let mask=0;mask<8;mask++){
    let excluded=0,parity=0;
    for(let j=0;j<3;j++)if(mask&(1<<j)){
      excluded+=groups[j];parity++;
    }
    favorable+=(parity%2?-1:1)*choose(total-excluded,draws);
  }
  assert.ok(favorable>=0&&favorable<=denominator);
  return {favorable,totalWays:denominator,
    probability:favorable/denominator};
}

/**
 * Census of strict original published sixty copies. No source card category
 * is inferred from a partial name: native original exact printed catalog
 * identity supplies the Dragon and Basic classifications.
 */
function main(){
  const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  initializeCards();
  const catalog=publicCatalog();
  const native=reportCoverage(manifest).decks;
  const byRank=new Map(native.map(d=>[d.rank,d]));
  const rows=[];
  for(const source of manifest.decks.filter(d=>d.archetype==='Regidrago')){
    const coverage=byRank.get(source.rank);
    let treasure=0,regidrago=0,donors=0,basics=0;
    const donorRows=[];
    for(const card of source.cards){
      const candidate=coverage.rows.find(r=>r.name===card.name&&
        String(r.requested.set).toUpperCase()===
          String(card.printing.set).toUpperCase()&&
        String(r.requested.number)===String(card.printing.number));
      assert.ok(candidate,'No coverage for source rank '+source.rank);
      if(candidate.status==='exact'||candidate.status==='exact-alias'){
        assert.equal(candidate.exact.length,1);
        const id=candidate.exact[0].fullName;
        if(catalog.basics.has(id))basics+=card.count;
        if(card.name==='Mysterious Treasure')treasure+=card.count;
        if(card.name==='Regidrago V')regidrago+=card.count;
        if(catalog.dragonPokemonPrintings.has(id)&&
          card.name!=='Regidrago V'&&card.name!=='Regidrago VSTAR'){
          donors+=card.count;
          donorRows.push({name:card.name,printing:id,copies:card.count});
        }
      }else{
        assert.ok(card.name.endsWith(' Energy'),
          'Unexpected original Pokémon/Item print gap '+card.name);
      }
    }
    const numerator=intersectionProbability(60,7,
      [treasure,regidrago,donors]);
    const validOpeners=1-choose(60-basics,7)/choose(60,7);
    assert.ok(validOpeners>0);
    rows.push({rank:source.rank,sourcePlayer:source.player,
      originalCopies:{treasure,regidrago,dragonDonors:donors,
        basicPokemon:basics},
      originalDragonDonors:donorRows,
      firstSeven:{
        allThreeUnconditional:numerator.probability,
        allThreeAmongValidBasicOpeners:
          numerator.probability/validOpeners,
        validBasicOpeningHandProbability:validOpeners,
        favorableHands:numerator.favorable,
        allPhysicalSevenHands:numerator.totalWays
      },
      sourceProof:'original frozen 60, native exact printing type census',
      derivedOnly:true});
  }
  const result={schema:VERSION,n:rows.length,
    printedSourceCoverage:29,
    fullOpposingFieldCovered:false,
    firstSevenDrawsOnly:true,
    opponentBonusDrawsIgnored:true,
    postOpeningAccessUnmodeled:true,
    tacticalDiscardConditional:false,
    gameOutcomeEvidence:false,
    rows};
  process.stdout.write('AGENT49_TREASURE_OPENERS '+
    JSON.stringify(result)+'\n');
  return result;
}
if(require.main===module)main();
module.exports={VERSION,choose,intersectionProbability,main};
