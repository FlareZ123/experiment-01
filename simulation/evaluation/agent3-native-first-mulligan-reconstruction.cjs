'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {seededRandom,deckPermutation}=
  require('../twinleaf/headless.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {frozenRankOneNewMoonCase}=
  require('./agent3-coupled-opening-input-order.cjs');
const {SALTS}=require('./agent26-per-seat-setup-shuffle-streams.cjs');

const VERSION='agent3-actual-native-first-mulligan-reconstruction-v1';
const RECEIPTS=path.resolve(__dirname,
  '../../results/methodology/agent3-source-setup-first-mulligan-48-receipts-20261104.csv');

/**
 * Parse a compact derivative of the archived 144 actual native setup attempts.
 * The original ZIP and exact raw JSON checksums are recorded in the research
 * report; this table contains only nonhidden numeric counters/seed identities.
 *
 * @param {string} input
 * @returns {object[]}
 */
function parseReceipts(input) {
  assert.equal(typeof input,'string');
  const lines=input.trim().split(/\r?\n/);
  const header=['rank','repeat','slot','source_seat','seed',
    'ref_candidate_shuffles','moon_candidate_shuffles',
    'ref_source_shuffles','moon_source_shuffles',
    'ref_source_bonus','moon_source_bonus','source_deal_match'].join(',');
  if(lines.shift()!==header || lines.length!==48)
    throw new TypeError('Expected exact 48-row source-custody register');
  const seen=new Set();
  return lines.map(line=>{
    const columns=line.split(',');
    if(columns.length!==12)throw new TypeError('Malformed native custody receipt');
    const [rank,repeat,slot,sourceSeat,seed,
      referenceShuffles,moonShuffles,sourceRefShuffles,sourceMoonShuffles,
      sourceRefBonus,sourceMoonBonus,sourceDealMatch]=columns;
    const actual={rank:Number(rank),repeat:Number(repeat),slot,
      sourceSeat:Number(sourceSeat),seed:Number(seed),
      referenceShuffles:Number(referenceShuffles),
      moonShuffles:Number(moonShuffles),
      sourceRefShuffles:Number(sourceRefShuffles),
      sourceMoonShuffles:Number(sourceMoonShuffles),
      sourceRefBonus:Number(sourceRefBonus),
      sourceMoonBonus:Number(sourceMoonBonus),
      sourceDealMatch:Number(sourceDealMatch)};
    const key=[actual.rank,actual.repeat,actual.slot].join(':');
    if(![5,6].includes(actual.rank)|| !Number.isSafeInteger(actual.repeat)||
      actual.repeat<0||actual.repeat>=12||
      !['A','B'].includes(actual.slot)||seen.has(key)||
      actual.sourceSeat!==(actual.slot==='A'?1:0)||
      deriveSlotSeeds(20261104,'published-field',actual.rank,actual.repeat)
        [actual.slot]!==actual.seed||
      ![actual.referenceShuffles,actual.moonShuffles,
        actual.sourceRefShuffles,actual.sourceMoonShuffles]
        .every(n=>Number.isSafeInteger(n)&&n>=1)||
      ![actual.sourceRefBonus,actual.sourceMoonBonus]
        .every(n=>Number.isSafeInteger(n)&&n>=0)||
      ![0,1].includes(actual.sourceDealMatch)) {
      throw new TypeError('Invalid, duplicate or false-seeded native custody row');
    }
    seen.add(key);
    return actual;
  });
}

/**
 * Return the exact indices of the first seven source-row cards after the
 * first candidate shuffle in the registered experimental per-seat stream.
 * This is a fresh pure replay of the native hook's Fisher-Yates permutation,
 * not an engine card-hand accessor or a qualified game.
 *
 * @param {number} seed Frozen positive seed from the actual original run.
 * @param {0|1} candidateSeat Native physical candidate seat.
 * @returns {number[]}
 */
function firstCandidateIndices(seed,candidateSeat){
  assert.ok(Number.isSafeInteger(seed)&&seed>0&&seed<=0xffffffff);
  assert.ok(candidateSeat===0||candidateSeat===1);
  const rand=seededRandom((seed^SALTS[candidateSeat])>>>0);
  return deckPermutation(60,rand).slice(0,7);
}

const noBasic=(positions,basicIndices)=>
  !positions.some(index=>basicIndices.includes(index));

/** @returns {object} */
function reconstruct(){
  const observations=parseReceipts(fs.readFileSync(RECEIPTS,'utf8'));
  const trial=frozenRankOneNewMoonCase();
  const reference=trial.historicalReferenceBasicPositions;
  const newMoon=trial.historicalChallengerBasicPositions;
  const referenceSet=new Set(reference);
  const notReference=Array.from({length:60},(_,i)=>i)
    .filter(i=>!referenceSet.has(i));
  const maximum=[...reference,...notReference.slice(0,3)];
  const minimum=notReference.slice(0,17);
  const disagreements=[],disagreementMax=[],disagreementMin=[];
  let matchedNativeFirstShuffleIndicators=0;
  let sourceBonusMismatch=0,observedPhysicalSourceMismatch=0;
  for(const row of observations){
    const indices=firstCandidateIndices(row.seed,1-row.sourceSeat);
    const championMulligan=noBasic(indices,reference);
    const newMoonMulligan=noBasic(indices,newMoon);
    assert.equal(championMulligan,row.referenceShuffles>1,
      'Recorded champion-native first Basic choice disagrees with replay');
    assert.equal(newMoonMulligan,row.moonShuffles>1,
      'Recorded New Moon native first Basic choice disagrees with replay');
    matchedNativeFirstShuffleIndicators+=2;
    if(championMulligan!==newMoonMulligan)
      disagreements.push([row.rank,row.repeat,row.slot].join(':'));
    if(championMulligan!==noBasic(indices,maximum))
      disagreementMax.push([row.rank,row.repeat,row.slot].join(':'));
    if(championMulligan!==noBasic(indices,minimum))
      disagreementMin.push([row.rank,row.repeat,row.slot].join(':'));
    if(row.sourceRefBonus!==row.sourceMoonBonus)sourceBonusMismatch++;
    if(row.sourceDealMatch===0)observedPhysicalSourceMismatch++;
  }
  return {
    version:VERSION,priorNativeRunId:41756953219,
    priorNativeArtifactId:13288243945,
    sourceRanks:[5,6],contexts:observations.length,
    reconstructedNativeFirstShuffleDecisions:matchedNativeFirstShuffleIndicators,
    fullFirstShuffleParityWithNativeCounters:true,
    observedChampionVsMoonFirstMulliganDisagreements:disagreements,
    observedFirstMulliganDisagreementCount:disagreements.length,
    observedSourceBonusDifferenceCount:sourceBonusMismatch,
    observedPhysicalSourceMismatchCount:observedPhysicalSourceMismatch,
    reorderingCounterfactuals:{
      maximalBasicOverlap:{disagreementCount:disagreementMax.length,
        ids:disagreementMax},
      minimalBasicOverlap:{disagreementCount:disagreementMin.length,
        ids:disagreementMin}
    },
    caveat:'Retrospective pure first-shuffle replay on exactly the previously chosen 48 source seeds; both reordered scenarios are counterfactual positions only. No native game, no refitted source bonus, no randomized win rate, and no paper qualification.'
  };
}
module.exports={VERSION,RECEIPTS,parseReceipts,firstCandidateIndices,reconstruct};

if(require.main===module)process.stdout.write(JSON.stringify(reconstruct())+'\n');
