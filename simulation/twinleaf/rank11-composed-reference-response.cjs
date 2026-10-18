'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {RANK11_K1_HYBRID_PROFILE,runWithResearchProfile}=
  require('./policy-profiles.cjs');

const CASES=[
  {seed:1325646358,sourceSeat:0,label:'A-direct-source-first'},
  {seed:1769876458,sourceSeat:0,label:'A-direct-source-second'},
  {seed:4188921502,sourceSeat:1,label:'B-direct-source-first'},
  {seed:1050426099,sourceSeat:1,label:'B-direct-source-second'},
  {seed:1244180408,sourceSeat:0,label:'A-original-vstar-source-first'}
];

/**
 * Bounded headless reference counterplay trace. Attack declarations are
 * reported as actual Store log observations, but no competency, clock or
 * printing-wide rules certification is implied.
 * @returns {object}
 */
function run(){
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank11=plan.opponents.find(deck=>deck.rank===11);
  assert.equal(rank11?.status,'ready');
  const records=[];
  for(const c of CASES){
    const candidateSeat=1-c.sourceSeat;
    const game=runWithResearchProfile({
      deckA:c.sourceSeat===0?rank11.cards:plan.candidate.cards,
      deckB:c.sourceSeat===1?rank11.cards:plan.candidate.cards,
      rank11SourceSeat:c.sourceSeat,seed:c.seed,maxActions:450,
      strictPromptValidation:true,
      forestSealSearchCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      isolatePolicyRandomness:true,
      captureDecisionTrace:true
    },RANK11_K1_HYBRID_PROFILE);
    const lock=game.rank11DirectPolicy?.completed===true ||
      game.rank11AutonomousPolicy?.completeAtDecisionBoundary===true;
    assert.equal(lock,true,'Previously source-proven lock route lost: '+c.label);
    records.push({
      ...c,candidateSeat,actualFirstTurnSlot:game.firstTurnSlot,
      sourceActuallyFirst:game.firstTurnSlot===c.sourceSeat,
      sourceDirectPolicy:game.rank11DirectPolicy,
      sourceVstarPolicy:game.rank11AutonomousPolicy,
      actions:game.actions,turns:game.turns,engineFinished:game.finished,
      engineWinner:game.winner,terminalTransition:game.terminalTransition,
      sourceCardLedger:game.cardsPlayedBySeat?.[c.sourceSeat],
      candidateCardLedger:game.cardsPlayedBySeat?.[candidateSeat],
      sourceAbilityAttempts:game.abilityTrace.filter(x=>x.seat===c.sourceSeat),
      candidateAbilityAttempts:game.abilityTrace.filter(x=>x.seat===candidateSeat),
      sourceAttackDeclarations:game.attackDeclarationTrace?.filter(x=>
        x.playerSlot===c.sourceSeat)??null,
      candidateAttackDeclarations:game.attackDeclarationTrace?.filter(x=>
        x.playerSlot===candidateSeat)??null,
      candidateFirstResponseActions:(game.decisionTrace||[]).filter(x=>
        x.playerSlot===candidateSeat &&
        x.turnBefore>=(game.rank11DirectPolicy?.nextTurnLockWitness?.turn ||
          game.rank11AutonomousPolicy?.nextTurnLockWitness?.turn || 0)).slice(0,20),
      candidateFinalPublicBoard:game.finalState?.[candidateSeat],
      sourceFinalPublicBoard:game.finalState?.[c.sourceSeat],
      qualifiedForCompetitiveInference:false
    });
  }
  return {
    study:'rank11 genuine source lock versus frozen rank1 unqualified candidate response',
    policy:RANK11_K1_HYBRID_PROFILE,
    sourceRank:11,candidateReferenceRank:1,
    engine:plan.engineRevision,sourceManifest:plan.manifestDigest,
    frozenCases:CASES,records,qualifiedForCompetitiveInference:false,
    caution:'This is full-length headless-bot diagnostic under a 450-action cap. Any engine winner is NOT a qualified competitive outcome.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
