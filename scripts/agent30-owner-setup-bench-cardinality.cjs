'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {choose,sourceBasicPrintingIndex}=
  require('./agent18-original-source-supporter-opening.cjs');

const VERSION='agent30-issue25-original29-single-vs-greedy-setup-v1';

/**
 * Exact, initial seven only; conditioned on >=1 genuine printed Basic.
 * Single-Basic chooser leaves all remaining Basics in hand.
 * Greedy native chooser selects first Basic Active and up to five Bench Basics.
 * This is a policy CARDINALITY contrast, not game strength or a native trace.
 * @param {number} b Number of genuine printed Basic Pokemon in a 60-card deck.
 * @returns {object} Exact raw integer numerators/denominator and probabilities.
 */
function openingCardinality(b){
  assert.ok(Number.isSafeInteger(b)&&b>=1&&b<=60);
  const valid=choose(60,7)-choose(60-b,7);
  assert.ok(valid>0n);
  let changed=0n,atLeastThree=0n,greedyBenchTotal=0n;
  const byBasicCopies=[];
  for(let held=1;held<=Math.min(7,b);held++){
    const hands=choose(b,held)*choose(60-b,7-held);
    const additionalBenched=Math.min(held-1,5);
    if(held>=2)changed+=hands;
    if(held>=3)atLeastThree+=hands;
    greedyBenchTotal+=BigInt(additionalBenched)*hands;
    byBasicCopies.push({
      openingBasicCopies:held,validOpeningHands:String(hands),
      selectedBySingleBasic:1,
      selectedByGreedy:Math.min(held,6),
      additionalBenched
    });
  }
  assert.equal(byBasicCopies.reduce((sum,row)=>
    sum+BigInt(row.validOpeningHands),0n),valid);
  return {
    totalBasicCopies:b,condition:'initial-seven contains at least one Basic',
    eligibleValidOpeningHands:String(valid),
    differentPhysicalStartingBoardsNumerator:String(changed),
    differentPhysicalStartingBoardsDenominator:String(valid),
    differentPhysicalStartingBoardsProbability:Number(changed)/Number(valid),
    threeOrMoreBasicsProbability:Number(atLeastThree)/Number(valid),
    expectedAdditionalGreedyBenchNumerator:String(greedyBenchTotal),
    expectedAdditionalGreedyBenchDenominator:String(valid),
    expectedAdditionalGreedyBench:Number(greedyBenchTotal)/Number(valid),
    byBasicCopies
  };
}

/**
 * Read independently authenticated original printed stages from existing
 * source-of-truth classifiers without guessing missing ranks 23/25/28.
 * @param {string} [root] Repository root.
 * @returns {object} Source-locked paper opening geometry.
 */
function fromRepository(root=path.resolve(__dirname,'..')){
  const sourceFile=path.join(root,'results/aichi-2026/full-decklists.json');
  const sourceBytes=fs.readFileSync(sourceFile);
  const source=JSON.parse(sourceBytes.toString('utf8'));
  assert.equal(source.decks.length,29);
  assert.deepEqual(source.missing_full_lists.map(x=>x.rank)
    .sort((a,b)=>a-b),[23,25,28]);
  const slots=source.decks.flatMap(deck=>
    deck.cards.filter(card=>card.category==='Pokémon'));
  const stages=sourceBasicPrintingIndex(root,slots);
  const rows=source.decks.map(deck=>{
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    const b=deck.cards.filter(card=>card.category==='Pokémon')
      .reduce((n,card)=>{
        const key=JSON.stringify([card.printing.set,
          String(card.printing.number),card.name]);
        assert.ok(stages.has(key),'Unknown historical Basic stage '+key);
        return n+(stages.get(key)?card.count:0);
      },0);
    return {rank:deck.rank,archetype:deck.archetype,...openingCardinality(b)};
  }).sort((a,b)=>a.rank-b.rank);
  const mean=key=>rows.reduce((s,row)=>s+row[key],0)/rows.length;
  return {
    version:VERSION,
    sourceRosterSha256:createHash('sha256').update(sourceBytes).digest('hex'),
    originalSourceDecks:29,
    missingOriginalRanks:[23,25,28],
    equalOriginalMeanPhysicalBoardDifferenceProbability:
      mean('differentPhysicalStartingBoardsProbability'),
    equalOriginalMeanAdditionalGreedyBench:
      mean('expectedAdditionalGreedyBench'),
    minPhysicalDifferenceProbability:Math.min(...rows.map(row=>
      row.differentPhysicalStartingBoardsProbability)),
    maxPhysicalDifferenceProbability:Math.max(...rows.map(row=>
      row.differentPhysicalStartingBoardsProbability)),
    rows,
    interpretation:{
      chooserA:'one eligible Basic from opener becomes Active; no other opener Basic is placed',
      chooserB:'first eligible Basic becomes Active; up to five more opener Basics placed on Bench',
      strictScope:'Fixed uniform 7-card initial hand conditional at least one printed Basic; unobserved later mulligan bonus draws and setup-tag non-Basics excluded',
      missingMechanics:'No strategic Active ranking, opening Ability/lock effects, Bench resource cost, opponent response, paper payout, native Store matching, or game outcomes',
      qualifiedCompetitiveGames:0
    }
  };
}

if(require.main===module)process.stdout.write(
  JSON.stringify(fromRepository(),null,2)+'\n');

module.exports={VERSION,openingCardinality,fromRepository};
