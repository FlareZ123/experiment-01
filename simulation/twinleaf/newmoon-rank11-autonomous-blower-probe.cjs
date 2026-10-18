'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy}=
  require('./newmoon-garbotoxin-blower-autonomy.cjs');

const SEED=1244180408;
const SOURCE_SEAT=0;
const CANDIDATE_SEAT=1;

/** @param {object} game */
function summary(game) {
  const candidateTurns=game.decisionTrace.filter(row =>
    row.playerSlot===CANDIDATE_SEAT);
  const sourceResponses=game.decisionTrace.filter(row =>
    row.playerSlot===SOURCE_SEAT && row.turnBefore>=3 &&
    row.turnBefore<=5 && (row.action==='PlayCardAction' ||
      row.action==='PassTurnAction')).map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      action:row.action,card:row.card??null
    }));
  return {
    actualFirstTurn:game.firstTurnSlot,
    firstDrawValidated:game.verifiedByDrawLog,
    sourceOpener:game.rank11AutonomousPolicy,
    actions:game.actions,turns:game.turns,
    finished:game.finished,winner:game.winner,
    prizesRemaining:game.prizesRemaining,
    candidateAttacks:game.attackTrace.filter(row=>row.seat===CANDIDATE_SEAT)
      .map(row=>({turn:row.turn,attack:row.attack})),
    candidateLilliePlays:candidateTurns.filter(row=>
      row.action==='PlayCardAction' && row.card==="Lillie's Determination")
      .map(row=>({ordinal:row.actionOrdinal,turn:row.turnBefore,
        hand:row.decisionHandBefore?.ownHandPrintings??null})),
    candidateFieldBlowerPlays:candidateTurns.filter(row=>
      row.action==='PlayCardAction' && row.card==='Field Blower')
      .map(row=>({ordinal:row.actionOrdinal,turn:row.turnBefore,
        hand:row.decisionHandBefore?.ownHandPrintings??null})),
    candidateAbilityCalls:candidateTurns.filter(row=>
      row.action==='UseAbilityAction').map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      ability:row.ability??null
    })),
    candidateFirstTurnDecisions:candidateTurns.filter(row=>
      row.turnBefore===2).slice(0,15).map(row=>({
      ordinal:row.actionOrdinal,action:row.action,card:row.card??null,
      selected:row.cardSelection?.selectedCards??null,
      lastPassBoard:row.action==='PassTurnAction'?
        row.publicBoardBeforePass??null:null
    })),
    sourceNextTurns:sourceResponses
  };
}

function run() {
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(row=>row.rank===11);
  assert.equal(opponent?.status,'ready');
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(opponent.cards.length,60);
  const request={
    deckA:opponent.cards,deckB:plan.candidate.cards,
    seed:SEED,maxActions:450,
    rank11SourceSeat:SOURCE_SEAT,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    label:'newmoon-rank11-unqualified-autonomous-Blower-v1'
  };
  const play=()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  const baseline=play();
  const adapted=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,play);
  const followup=withNewMoonBlowerAutonomy(CANDIDATE_SEAT,play,
    {lowHandLillieAfterBlower:true});
  const restored=play();
  const after=adapted.result;
  const afterSupporter=followup.result;
  for (const game of [baseline,after,afterSupporter,restored]) {
    assert.equal(game.firstTurnSlot,SOURCE_SEAT);
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(game.rank11AutonomousPolicy?.completeAtDecisionBoundary,true);
  }
  assert.deepEqual(baseline.deckHashes,after.deckHashes);
  assert.deepEqual(baseline.deckHashes,afterSupporter.deckHashes);
  assert.deepEqual(baseline.deckHashes,restored.deckHashes);
  assert.deepEqual(baseline.decisionTrace,restored.decisionTrace,
    'Candidate automatic-policy wrapper must restore raw generic decision trace');
  const sourceOpening=game=>game.decisionTrace.filter(row=>row.turnBefore<=1);
  assert.deepEqual(sourceOpening(baseline),sourceOpening(after),
    'Source first-turn real actions must be unchanged');
  assert.deepEqual(sourceOpening(baseline),sourceOpening(afterSupporter),
    'Lillie follow-up must leave actual source opening untouched');
  assert.equal(adapted.policyAudit.opportunitySelections,1,
    'Seed-independent candidate policy should recognize one real held Item');
  assert.equal(adapted.policyAudit.confirmedToolRemovals,1,
    'Live candidate own-prompt target must remove public Garbodor Tool');
  assert.equal(summary(baseline).candidateFieldBlowerPlays.length,0);
  assert.equal(summary(after).candidateFieldBlowerPlays.length,1);
  assert.equal(followup.policyAudit.opportunitySelections,1);
  assert.equal(followup.policyAudit.confirmedToolRemovals,1);
  assert.equal(followup.policyAudit.lowHandLillieSelections,1,
    'Source hand still held a playable Lillie after using the lock answer');
  assert.equal(summary(afterSupporter).candidateLilliePlays.length,1,
    'Live pinned Store must record the automatically chosen Supporter');
  return {
    schema:'rank11-garbotoxin-newmoon-autonomous-Field-Blower-exam-v1',
    sourceRank:11,sourceSeed:SEED,sourceSeat:SOURCE_SEAT,
    candidateSeat:CANDIDATE_SEAT,
    fixedCandidate:candidate.id,candidateProxyIdCountHash:candidate.proxyIdCountHash,
    engineRevision:plan.engineRevision,
    deckHashes:baseline.deckHashes,
    policyAdapter:'newmoon-garbotoxin-blower-autonomous-v1',
    candidatePolicyAudit:adapted.policyAudit,
    baseline:summary(baseline),automatic:summary(after),
    automaticWithLowHandLillie:summary(afterSupporter),
    lowHandFollowupAudit:followup.policyAudit,
    restorationVerified:true,sourceOpeningIdentical:true,
    qualification:'Source-dealt single-case policy regression; no independent held-out seeds or qualified competitive games',
    competitiveGamesQualified:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,summary};
