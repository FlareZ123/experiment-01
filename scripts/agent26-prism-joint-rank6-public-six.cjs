'use strict';
const assert=require('node:assert/strict');
const {choose}=require('./aichi-opening-basics.cjs');
const {maximumLegalHistoryLikelihood}=
  require('./agent26-prism-joint-mulligan-envelope.cjs');
const {unknownHistoryUpper}=
  require('./agent26-openworld-mulligan-source-envelope.cjs');

const VERSION='agent26-prism-joint-rank6-public-six-v1';
const D=Number(choose(60,7));
const ACTIVE_FACTOR=1-Number(choose(56,7))/D;
const RANKS=[6,24,29];

/**
 * Recompute the original-source Rank-6 posterior interval for every archived
 * public full failed-seven and observed face-up Iron Thorns ex.
 * No original deck, seat or physical outcome is changed.
 * @param {object} manifest Authenticated 29-source printed 60s.
 * @param {object} receipts Six original native source-rank6 setup records.
 * @returns {object}
 */
function strictRank6PublicReceipts(manifest,receipts){
  assert.equal(manifest.decks.length,29);
  assert.deepEqual(manifest.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);
  assert.equal(receipts.actualSourceRank,6);
  assert.equal(receipts.rows.length,6);
  const sources=RANKS.map(rank=>{
    const deck=manifest.decks.find(x=>x.rank===rank);
    assert.ok(deck);
    const pokemon=deck.cards.filter(x=>x.category==='Pokémon');
    assert.equal(pokemon.length,1);
    assert.equal(pokemon[0].name,'Iron Thorns ex');
    assert.equal(pokemon[0].count,4);
    return {rank,counts:Object.fromEntries(deck.cards.map(x=>[x.name,x.count]))};
  });
  assert.deepEqual(manifest.decks.filter(d=>d.cards.some(c=>
    c.category==='Pokémon'&&c.name==='Iron Thorns ex'))
    .map(x=>x.rank).sort((a,b)=>a-b),RANKS);

  const rows=receipts.rows.map(row=>{
    const hands=row.firstPublicHand?[row.firstPublicHand]:[];
    assert.equal(row.sourceMulligans,hands.length);
    const named=new Map();
    for(const name of hands[0]??[])named.set(name,(named.get(name)??0)+1);
    const known=sources.map(({rank,counts})=>{
      let numerator=1;
      for(const [name,m] of named)numerator*=
        Number(choose(counts[name]??0,m));
      return {rank,likelihood:ACTIVE_FACTOR*numerator/
        (hands.length?D:1)};
    });
    const sumKnown=known.reduce((s,x)=>s+x.likelihood,0);
    assert.ok(sumKnown>0);
    const rank6=known[0].likelihood;
    const oldMissing=unknownHistoryUpper(hands)*ACTIVE_FACTOR;
    const strict=maximumLegalHistoryLikelihood(hands,{maxActiveCopies:4});
    assert.ok(strict.probabilityUpper<=oldMissing*(1+1e-12));
    const prismNames=[...named.keys()].filter(x=>/[♢◇]$/u.test(x));
    return {
      seed:row.seed,candidateSeat:row.candidateSeat,
      exposedFailedSevens:hands.length,prismNames,
      oldMissingSingleSourceUpper:oldMissing,
      strictMissingSingleSourceUpper:strict.probabilityUpper,
      oldRank6Lower:rank6/(sumKnown+3*oldMissing),
      strictRank6Lower:rank6/(sumKnown+3*strict.probabilityUpper),
      rank6ConditionalOn29:rank6/sumKnown,
      ownerOnlyPublicOpeningEvidence:true,
      competitiveGameQualified:false
    };
  });
  return {
    version:VERSION,sourceRank:6,sourceRanksWithForcedActive:RANKS,
    missingRanks:[23,25,28],rows,
    sourceRun:receipts.ci.runId,originalNativeAttemptCount:rows.length,
    newGames:0,competitiveQualifiedGames:0
  };
}
if(require.main===module){
  const manifest=require('../results/aichi-2026/full-decklists.json');
  const receipts=require('../results/statistics/agent26-real-native-source6-public-mulligan-six.json');
  process.stdout.write(JSON.stringify(
    strictRank6PublicReceipts(manifest,receipts),null,2)+'\n');
}
module.exports={VERSION,strictRank6PublicReceipts};
