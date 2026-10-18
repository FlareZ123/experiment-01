'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withRank11DirectBoostShake}=require('./rank11-direct-boostshake.cjs');
const {withRank11AutonomousOpener}=require('./rank11-autonomous-opener.cjs');
const {withDirectNightWatchRandomChoice}=
  require('./night-watch-random-choice-audit.cjs');

const SEED=2809154458;
/**
 * Reproduce source-selected full-60 rank11 and rank1 source-dealt Night Watch
 * win branch, holding opening seed, both opponent policies and decks fixed.
 * Compare the original concealed-hand score-driven selection against the
 * opt-in independent-seed random selection required by paper card text.
 * @returns {object} Mechanistic sensitivity contrast, no qualified wins.
 */
function run(){
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank11=plan.opponents.find(x=>x.rank===11);
  assert.equal(rank11?.status,'ready');
  const rows=[];
  for(const randomPaperChoice of [false,true]){
    try{
      const audited=withDirectNightWatchRandomChoice(SEED,randomPaperChoice,()=>
        withRank11DirectBoostShake(0,()=>withRank11AutonomousOpener(
          0,()=>runMatch({
            deckA:rank11.cards,deckB:plan.candidate.cards,seed:SEED,
            label:randomPaperChoice ?
              'rank11-reference-nightwatch-uniform-random-v1' :
              'rank11-reference-nightwatch-stock-scored-v1',
            maxActions:160,strictPromptValidation:true,
            forestSealSearchCorrection:true,
            battleCompressorPositiveSelectionCorrection:true,
            isolatePolicyRandomness:true,
            captureDecisionTrace:true,capturePhysicalZoneIntegrity:true
          }),
          {allowSecondGlobalTurn:true,version:'rank11-vstar-own-first-v2-composed'}
        )));
      const coupled=audited.result;
      const game=coupled.result.result;
      rows.push({
        seed:SEED,version:audited.policy,randomPaperChoice,
        sourceActualFirst:game.firstTurnSlot===0,
        engineWinner:game.winner,engineFinished:game.finished,
        rootActions:game.actions,
        sourceLockAtFirstCandidateBoundary:coupled.policyAudit.nextTurnLockWitness,
        sourceDirectCompleted:coupled.policyAudit.completed,
        candidatePrintedAttackDeclarations:game.attackDeclarationTrace
          .filter(e=>e.playerSlot===1)
          .map(e=>({turn:e.turnAfter,attack:e.attackName,ordinal:e.actionOrdinal})),
        opponentPrintedAttackDeclarations:game.attackDeclarationTrace
          .filter(e=>e.playerSlot===0)
          .map(e=>({turn:e.turnAfter,attack:e.attackName,ordinal:e.actionOrdinal})),
        choices:audited.choices,
        physicalZoneIntegrity:game.physicalZoneIntegrity,
        qualifiedForCompetitiveInference:false
      });
    }catch(error){
      rows.push({randomPaperChoice,error:String(error?.stack||error),
        qualifiedForCompetitiveInference:false});
    }
  }
  return {
    study:'Night Watch physical random subset versus source hidden-hand bot score',
    seed:SEED,sourceRank:11,referenceRank:1,
    engine:plan.engineRevision,sourceDigest:plan.manifestDigest,
    referenceDigest:plan.candidateDigest,
    causalScope:'One exploratory source-dealt seed and divergent downstream RNG game path',
    rows,qualifiedForCompetitiveInference:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,SEED};
