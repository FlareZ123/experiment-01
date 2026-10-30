'use strict';
const assert=require('node:assert/strict');
const {countBasics,EVOLUTIONS}=require('./aichi-field-mulligan-census.cjs');
const {revealedMulliganSignature}=
  require('./aichi-mulligan-public-reveal.cjs');
const {openingProbabilities} = require('./aichi-opening-basics.cjs');

/**
 * Uniform-prior Bayesian learning from exclusively paper-public invalid
 * seven-card opening information, over only the 29 source-verified 60s.
 * Missing rank 23/25/28 compositions are excluded, never imputed.
 *
 * An event is either:
 * {kind:'namedRevealed',name:'Speed Lightning Energy'}
 * {kind:'namedNotRevealed',name:'Speed Lightning Energy'}
 * {kind:'atLeastFailedHands',count:1}
 * {kind:'exactlyFailedHands',count:1}
 *
 * @param {{decks:Array<object>,missing_full_lists:Array<object>}} manifest
 * @param {object} event
 * @param {number[]} [targetRanks] Group of source ranks to classify.
 * @returns {object}
 */
function publicMulliganPosterior(manifest,event,targetRanks=[6,24,29]){
  assert.equal(manifest.decks.length,29,
    'Posterior only covers 29 exact published source decklists');
  assert.deepEqual(manifest.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b),
    [23,25,28]);
  assert.ok(Array.isArray(targetRanks)&&targetRanks.length>0);
  assert.ok(targetRanks.every(x=>Number.isSafeInteger(x)));
  assert.equal(new Set(targetRanks).size,targetRanks.length,
    'Duplicate target rank in public-evidence classification group');
  assert.ok(event&&typeof event==='object');
  const isNamed=event.kind==='namedRevealed' ||
    event.kind==='namedNotRevealed';
  const isCount=event.kind==='atLeastFailedHands' ||
    event.kind==='exactlyFailedHands';
  assert.ok(isNamed||isCount,'Unsupported public event');
  if(isNamed)assert.ok(typeof event.name==='string'&&event.name.length>0);
  if(isCount)assert.ok(Number.isSafeInteger(event.count)&&event.count>=0);

  const sourceRanks=new Set(manifest.decks.map(x=>x.rank));
  assert.equal(sourceRanks.size,29,'Duplicate rank in exact source universe');
  for(const rank of targetRanks)
    assert.ok(sourceRanks.has(rank),'Unknown target rank '+rank);

  const group=new Set(targetRanks);
  const byRank=manifest.decks.map(deck=>{
    const basic=countBasics(deck);
    const q=openingProbabilities(basic,60,7).initialMulliganProbability;
    const chosen= isNamed ? deck.cards.filter(card=>
      card.name===event.name&&(card.category!=='Pokémon'||
        EVOLUTIONS.has(card.printing.set+'-'+card.printing.number)))
      .reduce((sum,card)=>sum+card.count,0) : 0;
    const shown=isNamed ?
      revealedMulliganSignature({basics:basic,namedNonBasics:chosen})
        .anyNamedRevealedBeforeValid:null;
    let likelihood;
    if(event.kind==='namedRevealed')likelihood=shown;
    if(event.kind==='namedNotRevealed')likelihood=1-shown;
    if(event.kind==='atLeastFailedHands')likelihood=q**event.count;
    if(event.kind==='exactlyFailedHands')
      likelihood=q**event.count*(1-q);
    assert.ok(likelihood>=0&&likelihood<=1&&Number.isFinite(likelihood));
    return {rank:deck.rank,basics:basic,
      group:group.has(deck.rank),likelihood};
  }).sort((a,b)=>a.rank-b.rank);
  const total=byRank.reduce((s,row)=>s+row.likelihood,0);
  assert.ok(total>0,'Impossible public observation in known 29-source field');
  const target=byRank.filter(x=>x.group)
    .reduce((s,row)=>s+row.likelihood,0);
  return {
    schema:'known-29-source-public-mulligan-posterior-v1',
    prior:'equal weight per exact recovered original 60',
    knownRanks:byRank.length,missingRanks:[23,25,28],
    groupRanks:[...targetRanks].sort((a,b)=>a-b),
    event,
    groupPrior:targetRanks.length/byRank.length,
    eventProbabilityKnownField:total/byRank.length,
    groupPosterior:target/total,
    byRank,
    onlyActuallyPublicInvalidSevenEvidence:true,
    unknownThreeSourceDecksExcluded:true,
    inferenceNotWinRate:true
  };
}

module.exports={publicMulliganPosterior};
