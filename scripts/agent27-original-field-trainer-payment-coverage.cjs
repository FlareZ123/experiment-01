'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {COST_BY_PRINT,VERSION:FRONTIER_VERSION}=
  require('../simulation/twinleaf/agent27-owner-trainer-discard-contention.cjs');

const VERSION='agent27-original-field-trainer-hand-cost-coverage-v1';
const DEFAULT_ROSTER=path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json');

/**
 * Classify only exact source printings supported by the checked cost catalog.
 * This is a printed-hand-cost classification, not paper-playability, target
 * availability, native compatibility, or game-performance certification.
 * @param {object} manifest Original Aichi registered source decks.
 */
function auditOriginalTrainerPayments(manifest){
  assert.ok(Array.isArray(manifest?.decks));
  const seenRanks=new Set();
  const sourceRows=[],prints=new Map();
  let totalTrainerCopies=0,coveredCopies=0;
  const modeTotals={mandatoryDiscard:0,optionalEnhancedDiscard:0,
    knownNoDiscard:0,unknownPayment:0};
  const modes=spec=>{
    if(!spec)return 'unknownPayment';
    if(spec.options.every(o=>o.discards===0))return 'knownNoDiscard';
    if(spec.options.every(o=>o.discards>0))return 'mandatoryDiscard';
    return 'optionalEnhancedDiscard';
  };
  for(const deck of manifest.decks){
    assert.ok(Number.isSafeInteger(deck.rank)&&deck.rank>=1&&deck.rank<=32);
    assert.ok(!seenRanks.has(deck.rank));
    seenRanks.add(deck.rank);
    assert.ok(Array.isArray(deck.cards));
    const totalCards=deck.cards.reduce((sum,card)=>{
      assert.ok(Number.isSafeInteger(card.count)&&card.count>=1);
      return sum+card.count;
    },0);
    assert.equal(totalCards,60,'Every admitted original 60 must be complete');
    const byMode={mandatoryDiscard:0,optionalEnhancedDiscard:0,
      knownNoDiscard:0,unknownPayment:0};
    for(const card of deck.cards){
      if(card.category!=='Trainer')continue;
      assert.ok(typeof card.printing?.set==='string');
      const printing=card.name+' '+card.printing.set;
      const mode=modes(COST_BY_PRINT.get(printing));
      totalTrainerCopies+=card.count;
      byMode[mode]+=card.count;
      modeTotals[mode]+=card.count;
      if(mode!=='unknownPayment')coveredCopies+=card.count;
      const summary=prints.get(printing)??{
        printing,name:card.name,mode,copies:0,ranks:[]
      };
      assert.equal(summary.mode,mode,'Same printing has one cost classification');
      summary.copies+=card.count;
      if(!summary.ranks.includes(deck.rank))summary.ranks.push(deck.rank);
      prints.set(printing,summary);
    }
    sourceRows.push({rank:deck.rank,archetype:deck.archetype,
      trainerCopies:Object.values(byMode).reduce((a,b)=>a+b,0),
      ...byMode});
  }
  sourceRows.sort((a,b)=>a.rank-b.rank);
  const printingRows=[...prints.values()].sort((a,b)=>
    b.copies-a.copies||a.printing.localeCompare(b.printing));
  assert.equal(Object.values(modeTotals).reduce((a,b)=>a+b,0),
    totalTrainerCopies);
  assert.equal(totalTrainerCopies-coveredCopies,
    modeTotals.unknownPayment);
  return {
    version:VERSION,frontierVersion:FRONTIER_VERSION,
    originalSourceDecks:sourceRows.length,
    missingOriginalRanks:manifest.missing_full_lists.map(x=>x.rank)
      .sort((a,b)=>a-b),
    totalTrainerCopies,coveredCopies,
    coveragePercent:100*coveredCopies/totalTrainerCopies,
    modeTotals,sourceRows,printingRows,
    qualifiedPaperPlays:0,qualifiedCompetitiveGames:0,
    scope:'Print-specific hand-discard cost visibility only; other card conditions unresolved'
  };
}

/** @param {string} filePath Existing authenticated original field manifest. */
function loadAudit(filePath=DEFAULT_ROSTER){
  const bytes=fs.readFileSync(filePath);
  const output=auditOriginalTrainerPayments(JSON.parse(bytes.toString('utf8')));
  return {...output,
    sourceManifestSha256:createHash('sha256').update(bytes).digest('hex')};
}

if(require.main===module){
  const x=loadAudit();
  process.stdout.write(JSON.stringify(x,null,2)+'\n');
}
module.exports={VERSION,DEFAULT_ROSTER,auditOriginalTrainerPayments,loadAudit};
