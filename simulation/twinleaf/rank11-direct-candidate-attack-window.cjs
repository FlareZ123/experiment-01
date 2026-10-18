'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

/**
 * Historical source-dealt positive-control seeds from the independently
 * archived 128-trial decorrelated rank11 held-Shake screen. Their selection is
 * outcome-conditioned, so results cannot estimate an unconditional win rate.
 */
const WITNESSES = Object.freeze([
  {id:'first-a',seed:1325646358,previousRank11First:true},
  {id:'second-a',seed:1769876458,previousRank11First:false},
  {id:'first-b',seed:3316498962,previousRank11First:true},
  {id:'second-b',seed:2809154458,previousRank11First:false}
]);

const VARIANTS = Object.freeze([
  {id:'champion-reference',deck:'reference',candidatePolicy:'generic'},
  {id:'new-moon-generic',deck:'new-moon',candidatePolicy:'generic'},
  {id:'new-moon-horror-compressor',deck:'new-moon',candidatePolicy:'horror-compressor-v1'}
]);

/** @param {unknown} value @returns {string} */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Read-only authentic-Store result projection. Live declaration logs remain
 * declaration-only, with no inference that copied effects finished.
 * @param {object} game
 * @param {object} audit
 * @returns {object}
 */
function observe(game,audit) {
  const actualSourceFirst = game.firstTurnSlot === 0;
  const witnessTurn = audit.nextTurnLockWitness?.turn ?? null;
  const rows = Array.isArray(game.decisionTrace) ? game.decisionTrace : [];
  const attacks = Array.isArray(game.attackDeclarationTrace) ?
    game.attackDeclarationTrace : [];
  const candidateEarlyDecisions = rows.filter(row =>
    row.playerSlot === 1 &&
    (witnessTurn === null ? row.turnBefore <= 4 :
      row.turnBefore >= witnessTurn && row.turnBefore <= witnessTurn + 2)
  ).slice(0,25);
  const candidateAttackDeclarations = attacks.filter(row =>
    row.playerSlot === 1).map(row => ({
      turnBefore:row.turnBefore,triggerAction:row.triggerAction,
      attackName:row.attackName,logIndex:row.logIndex,
      actionOrdinal:row.actionOrdinal,
      resolutionStatus:row.resolutionStatus,
      promptPendingAfter:row.promptPendingAfter
    }));
  const candidateRootAttacks = (game.attackTrace || []).filter(row =>
    row.seat === 1).map(row => ({
      turn:row.turn,activePokemon:row.activePokemon,
      attack:row.attack
    }));
  return {
    startVerified:game.verifiedByDrawLog === true,
    actualFirstTurnSlot:game.firstTurnSlot,
    actualSourceFirst,
    sourceDirectOpportunityTurn:audit.opportunityTurn,
    sourcePolicyCompleted:audit.completed === true,
    sourcePolicyAborted:audit.aborted,
    sourceRoute:audit.route,
    sourceSelectedTool:audit.selectedTool,
    sourceSelectedActions:audit.actions,
    nextTurnLockWitness:audit.nextTurnLockWitness,
    candidateEarlyDecisions,
    candidateAttackDeclarations,
    candidateRootAttacks,
    candidateAttackDeclarationCount:candidateAttackDeclarations.length,
    candidateDelegatedDeclarationCount:candidateAttackDeclarations.filter(row =>
      row.triggerAction !== 'AttackAction').length,
    engineFinished:game.finished,
    engineWinnerDiagnosticOnly:game.finished ? game.winner : null,
    actions:game.actions,
    turns:game.turns,
    prizesRemaining:game.prizesRemaining,
    engineDeckHashes:game.deckHashes,
    engine:game.engine,
    observedPolicy:game.policy,
    observedAttackDeclarationProtocol:game.attackDeclarationTraceProtocol,
    paperRulesAndPolicyQualified:false
  };
}

/**
 * A fixed 12-arm, retrospective mechanical replay. Every selected seed is
 * retained for every candidate, even if the original source lock disappears.
 * @returns {object}
 */
function run() {
  const {planAichi}=require('../evaluation/aichi-pilot.cjs');
  const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
  const {runMatch}=require('./headless.cjs');
  const {withRank11DirectBoostShake}=require('./rank11-direct-boostshake.cjs');

  const reference=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const newMoon=loadNewMoonCandidate();
  const proposal=planAichi({label:newMoon.id,cards:newMoon.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const rank11=reference.opponents.find(row=>row.rank===11);
  const newMoonRank11=proposal.opponents.find(row=>row.rank===11);
  assert.equal(rank11?.status,'ready');
  assert.equal(newMoonRank11?.status,'ready');
  assert.equal(rank11.cards.length,60);
  assert.deepEqual(rank11.cards,newMoonRank11.cards,
    'Each policy arm must face the exact same resolved rank11 source 60');
  assert.equal(reference.candidate.cards.length,60);
  assert.equal(proposal.candidate.cards.length,60);
  assert.equal(reference.engineRevision,proposal.engineRevision);

  const decks={
    reference:reference.candidate.cards,
    'new-moon':proposal.candidate.cards
  };
  const attempted=[];
  for(const witness of WITNESSES) {
    for(const variant of VARIANTS) {
      const candidate=decks[variant.deck];
      const common={
        deckA:rank11.cards,deckB:candidate,
        seed:witness.seed,
        label:'rank11-direct-response:'+witness.id+':'+variant.id,
        maxActions:220,
        strictPromptValidation:true,
        forestSealSearchCorrection:true,
        battleCompressorPositiveSelectionCorrection:true,
        isolatePolicyRandomness:true,
        captureDecisionTrace:true
      };
      const enhanced=variant.candidatePolicy==='horror-compressor-v1';
      const request=enhanced?{
        ...common,
        newMoonNativeOpeningPivotSeat:1,
        newMoonAttackPayloadCompressorSeat:1,
        newMoonOpeningHorrorHouseSeat:1
      }:common;
      const trial={
        sourceSeedIdentity:witness.id,seed:witness.seed,
        originalRank11ActuallyFirst:witness.previousRank11First,
        candidate:variant.id,
        candidatePolicy:variant.candidatePolicy,
        candidateEngineDeckDigest:digest(candidate),
        sourceEngineDeckDigest:digest(rank11.cards),
        expectedEngine:'twinleafgg/'+reference.engineRevision,
        selectionWarning:'retrospectively selected earlier source-lock witnesses',
        qualifiedForCompetitiveInference:false
      };
      try {
        const played=withRank11DirectBoostShake(0,()=>runMatch(request));
        attempted.push({...trial,status:'engine-observed',
          ...observe(played.result,played.policyAudit)});
      }catch(error){
        attempted.push({...trial,status:'engine-exception',
          error:String(error?.stack||error)});
      }
    }
  }
  assert.equal(attempted.length,WITNESSES.length*VARIANTS.length);
  return {
    schema:'rank11-direct-held-shake-candidate-attack-window-source-v1',
    protocol:'fixed source-authentic retrospective mechanical witnesses',
    sourceRank:11,sourceSeat:0,candidateSeat:1,
    engineRevision:reference.engineRevision,
    referenceCandidatePrintDigest:reference.candidateDigest,
    newMoonCandidatePrintDigest:proposal.candidateDigest,
    sourceManifestDigest:reference.manifestDigest,
    sourceEnglishProxyLegalityVerified:false,
    maximumRootActionsPerArm:220,
    selectedSeeds:WITNESSES,
    variants:VARIANTS,
    attemptedTrials:attempted.length,
    engineExceptions:attempted.filter(t=>t.status==='engine-exception').length,
    observedDirectLocks:attempted.filter(t=>t.sourcePolicyCompleted===true).length,
    observedCandidateDeclarationsAfterAnyLock:attempted.filter(t=>
      t.sourcePolicyCompleted===true && t.candidateAttackDeclarationCount>0).length,
    attempts:attempted,
    qualifiedCompetitiveGames:0,
    warning:'Retrospective seed selection; every arm diagnostic-only. Engine attack declarations do not certify effect resolution, opponent competence, Japanese paper printing legality, paper clock or game win rate.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={WITNESSES,VARIANTS,digest,observe,run};
