'use strict';

const assert = require('node:assert/strict');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');

const SOURCE_RANK = 3;
const SOURCE_SEAT = 1;
const SEED = 81979068;

/**
 * Retrospectively chosen root-setup regression: compare the historical
 * repeated solo choice with legal optional-Bench decline on the same deal.
 * Neither branch enters competitive sample denominators.
 * @returns {object} Exact source-dealt two-arm mechanical record.
 */
function run() {
  const plan = planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.engineRevision,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const source = plan.opponents.find(o=>o.rank===SOURCE_RANK);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  const deckA=plan.candidate.cards;
  const deckB=source.cards;
  const arms=[];
  for(const {declineOptionalBench,preserveBench} of [
    {declineOptionalBench:false,preserveBench:false},
    {declineOptionalBench:true,preserveBench:false},
    {declineOptionalBench:true,preserveBench:true}
  ]) {
    try {
      const game=runMatch({
        deckA,deckB,seed:SEED,maxActions:40,
        isolatePolicyRandomness:true,
        strictPromptValidation:true,
        captureStartingBoard:true,captureDecisionTrace:true,
        snorlaxSoloOpeningSeat:SOURCE_SEAT,
        snorlaxSoloPreserveBench:preserveBench,
        snorlaxSoloDeclineOptionalBench:declineOptionalBench,
        label:'snorlax-optional-bench-'+declineOptionalBench
      });
      arms.push({
        declineOptionalBench,preserveBench,ok:true,
        startingPromptEvents:game.snorlaxSoloOpeningEvents,
        rootSetupSelections:game.rootSoloSetupSelections,
        sourceRootActions:(game.rootActionLedger??[])
          .filter(row=>row.playerSlot===SOURCE_SEAT &&
            row.pendingPrompt===null).slice(0,18),
        sourcePlayedCards:game.cardsPlayedBySeat?.[SOURCE_SEAT]??null,
        firstTurnBoard:game.initialBoardAtFirstTurn,
        actualFirstTurnSlot:game.firstTurnSlot,
        verifiedByDrawLog:game.verifiedByDrawLog,
        actions:game.actions,finished:game.finished,
        error:null,competitiveGameQualified:false
      });
    }catch(error){
      arms.push({declineOptionalBench,preserveBench,ok:false,
        error:String(error?.stack||error),competitiveGameQualified:false});
    }
  }
  return {
    schema:'snorlax-retrospective-optional-bench-and-turn-hold-v2',
    provenance:'Known post hoc rank-3 source start prompt IDs 5 and 12; mechanical regression only',
    engineRevision:plan.engineRevision,rank:SOURCE_RANK,
    sourceSeat:SOURCE_SEAT,seed:SEED,
    registeredFieldDigest:plan.manifestDigest,
    sourceDeckSize:deckB.length,candidateDeckSize:deckA.length,
    qualifiedCompetitiveGames:0,arms
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
