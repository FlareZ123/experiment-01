'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch}=require('./headless.cjs');

const SOURCE_RANKS=Object.freeze([3,7]);
const REPEATS=3;
const SEED_BASE=2026101807;
const MAX_ACTIONS=150;
const permissions={
  allowEquivalentBasicEnergies:true,
  allowBasicEnergyMirrorPrintings:true,
  allowJapanesePromoHooks:true
};

/** @returns {object[]} Outcome-blind, source-rank and physical-seat-paired plan. */
function schedule() {
  const rows=[];
  for(const rank of SOURCE_RANKS){
    for(const sourceSeat of [0,1]){
      for(let repeat=0;repeat<REPEATS;repeat++){
        const seed=deriveSlotSeeds(SEED_BASE,'pilot',rank,repeat)[
          sourceSeat===0?'B':'A'];
        rows.push({rank,sourceSeat,repeat,seed});
      }
    }
  }
  return rows;
}

/**
 * Preserve original-root selection, declared attack and visible terminal,
 * with any missing or failed stage flagged explicitly.
 * @param {object} game Actual source-dealt pinned headless result.
 * @param {0|1} sourceSeat Physical opponent seat.
 * @returns {object}
 */
function summarizeGame(game,sourceSeat){
  const events=game.snorlaxSoloOpeningEvents??null;
  return {
    actualFirstSlot:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    opponentOpeningEvents:events,
    opponentSoloOpportunities:events?.filter(e=>e.sawSnorlax).length??null,
    opponentSoloSelections:events?.filter(e=>e.appliedSoloSnorlax).length??null,
    attackDeclarations:(game.attackDeclarationTrace??[]).map(e=>({
      actionOrdinal:e.actionOrdinal,playerSlot:e.playerSlot,
      attackName:e.attackName,resolutionStatus:e.resolutionStatus
    })),
    firstRootActions:(game.rootActionLedger??[]).slice(0,12).map(e=>({
      actionOrdinal:e.actionOrdinal,turnBefore:e.turnBefore,
      playerSlot:e.playerSlot,action:e.action
    })),
    sourceActionCounts:game.actionsBySeat?.[sourceSeat]??null,
    challengerActionCounts:game.actionsBySeat?.[1-sourceSeat]??null,
    finished:game.finished,engineWinner:game.winner,
    rootActionCount:game.actions,turn:game.turns,endReason:game.endReason,
    prizesRemaining:game.prizesRemaining,
    deckHashes:game.deckHashes,
    rules:game.rules,
    competitiveGameQualified:false
  };
}

/** @returns {object} All precommitted source deals and their no-opportunity cases. */
function run(){
  const plan=planAichi(1,permissions);
  assert.equal(plan.engineRevision,
    'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(plan.candidate.cards.length,60);
  const rows=[];
  for(const trial of schedule()){
    const opponent=plan.opponents.find(x=>x.rank===trial.rank);
    assert.equal(opponent?.status,'ready');
    assert.equal(opponent.cards.length,60);
    const arms={};
    for(const policy of ['default','solo-Snorlax']){
      const deckA=trial.sourceSeat===0?opponent.cards:plan.candidate.cards;
      const deckB=trial.sourceSeat===1?opponent.cards:plan.candidate.cards;
      const request={
        deckA,deckB,seed:trial.seed,maxActions:MAX_ACTIONS,
        isolatePolicyRandomness:true,strictPromptValidation:true,
        captureDecisionTrace:true,snorlaxRetreatStartCorrection:true,
        ...(policy==='solo-Snorlax'?
          {snorlaxSoloOpeningSeat:trial.sourceSeat}:{}),
        label:'rank'+trial.rank+'-Snorlax-source-'+policy
      };
      try{
        const game=runMatch(request);
        assert.deepEqual(game.deckHashes, [
          require('node:crypto').createHash('sha256').update(JSON.stringify(deckA)).digest('hex'),
          require('node:crypto').createHash('sha256').update(JSON.stringify(deckB)).digest('hex')
        ]);
        arms[policy]={ok:true,...summarizeGame(game,trial.sourceSeat)};
      }catch(error){
        arms[policy]={ok:false,error:String(error?.stack||error),
          competitiveGameQualified:false};
      }
    }
    rows.push({...trial,arms,competitiveGameQualified:false});
  }
  return {
    schema:'source-dealt-rank3-rank7-solo-Snorlax-setup-v1',
    scope:'Original printed 60s; source-only initial Active/Bench selection, generic-bot continuation. Mechanical diagnostic, no win-rate inference.',
    seedBase:SEED_BASE,seedProtocol:'decorrelated-slots-v3',
    sourceRanks:SOURCE_RANKS,repeats:REPEATS,
    fieldManifestDigest:plan.manifestDigest,
    sourcePlayerLabels:SOURCE_RANKS.map(rank=>({
      rank,player:plan.opponents.find(o=>o.rank===rank)?.player
    })),
    candidateDigest:plan.candidateDigest,
    engineRevision:plan.engineRevision,
    maxActions:MAX_ACTIONS,
    qualifiedCompetitiveGames:0,rows
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={schedule,summarizeGame,run};
