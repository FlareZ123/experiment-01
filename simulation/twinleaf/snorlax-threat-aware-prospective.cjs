'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch} = require('./headless.cjs');
const {
  summarize, digest, firstRootDifference
} = require('./snorlax-bench-preservation-prospective.cjs');

// Frozen before inspecting *any* of these source-deal outcomes.
const SOURCE_RANKS = Object.freeze([3, 7]);
const SEED_BASE = 2026102125;
const REPEATS = 6;
const ACTION_CAP = 100;
const ENGINE_SHA = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ARMS = Object.freeze([
  Object.freeze({id:'ordinary',preserve:false,publicEnergy:false}),
  Object.freeze({id:'unconditional',preserve:true,publicEnergy:false}),
  Object.freeze({id:'public-energy',preserve:true,publicEnergy:true})
]);

/** @returns {{rank:number,sourceSeat:0|1,repeat:number,seed:number}[]} */
function schedule() {
  const rows = [];
  for (const rank of SOURCE_RANKS) {
    for (const sourceSeat of [0,1]) {
      for (let repeat=0;repeat<REPEATS;repeat++) {
        const seeds=deriveSlotSeeds(SEED_BASE,'pilot',rank,repeat);
        rows.push({
          rank,sourceSeat,repeat,
          seed:seeds[sourceSeat===0?'B':'A']
        });
      }
    }
  }
  return rows;
}

/**
 * @param {object} original Summary of native ordinary-Bench arm.
 * @param {object} alternate Summary of native alternate arm.
 * @returns {object} Paired public-root contrast, absent failures marked null.
 */
function compareArms(original,alternate) {
  if(!original?.ok || !alternate?.ok) return {
    bothReturned:false,
    sameObservedFirstTurnBoard:null,
    sameNativeRootLedger:null,
    firstPublicRootDifference:null
  };
  return {
    bothReturned:true,
    sameObservedFirstTurnBoard:JSON.stringify(original.sourceFirstTurnBoard)===
      JSON.stringify(alternate.sourceFirstTurnBoard),
    sameNativeRootLedger:original.rootActionSHA256===alternate.rootActionSHA256,
    firstPublicRootDifference:firstRootDifference(
      original.rootActionLedger,alternate.rootActionLedger)
  };
}

/** @returns {object} Every immutable source-deal and three causal-policy arms. */
function run() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.engineRevision,ENGINE_SHA);
  assert.equal(plan.candidate.cards.length,60);
  const rows=[];
  for(const trial of schedule()) {
    const source=plan.opponents.find(o=>o.rank===trial.rank);
    assert.equal(source?.status,'ready');
    assert.equal(source.cards.length,60);
    const deckA=trial.sourceSeat===0?source.cards:plan.candidate.cards;
    const deckB=trial.sourceSeat===1?source.cards:plan.candidate.cards;
    const expectedDeckHashes=[digest(deckA),digest(deckB)];
    const arms={};
    for(const arm of ARMS) {
      try {
        const game=runMatch({
          deckA,deckB,seed:trial.seed,maxActions:ACTION_CAP,
          isolatePolicyRandomness:true,
          strictPromptValidation:true,
          captureDecisionTrace:true,
          captureStartingBoard:true,
          captureFinalPublicBoard:true,
          snorlaxRetreatStartCorrection:true,
          snorlaxSoloOpeningSeat:trial.sourceSeat,
          snorlaxSoloDeclineOptionalBench:true,
          snorlaxSoloPreserveBench:arm.preserve,
          snorlaxSoloThreatAwareBench:arm.publicEnergy,
          label:'rank'+trial.rank+'-solo-source-'+arm.id
        });
        assert.deepEqual(game.deckHashes,expectedDeckHashes);
        arms[arm.id]={ok:true,...summarize(game,trial.sourceSeat)};
      } catch(error) {
        arms[arm.id]={
          ok:false,error:String(error?.stack||error),
          competitiveGameQualified:false
        };
      }
    }
    rows.push({
      ...trial,expectedDeckHashes,arms,
      comparisons:{
        unconditionalVersusOrdinary:compareArms(
          arms.ordinary,arms.unconditional),
        publicEnergyVersusOrdinary:compareArms(
          arms.ordinary,arms['public-energy']),
        publicEnergyVersusUnconditional:compareArms(
          arms.unconditional,arms['public-energy'])
      },
      competitiveGameQualified:false
    });
  }
  return {
    schema:'agent19-source-snorlax-public-energy-threat-paired-v1',
    scope:'Owner-visible Energy as conservative source backup trigger; unqualified bot outcomes',
    sourceRanks:SOURCE_RANKS,
    candidateRank:1,
    seedBase:SEED_BASE,
    seedDerivation:'decorrelated-slots-v3',
    repeats:REPEATS,
    actionCap:ACTION_CAP,
    policyArms:ARMS,
    engineRevision:ENGINE_SHA,
    fieldManifestDigest:plan.manifestDigest,
    challengerDeckDigest:plan.candidateDigest,
    physicalDealDesigns:rows.length,
    boundedAttempts:rows.length*ARMS.length,
    qualifiedCompetitiveGames:0,
    rows
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={schedule,compareArms,run,ARMS};
