'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy}=
  require('./newmoon-garbotoxin-blower-autonomy.cjs');
const {withRank11Turn49HandBurn}=
  require('./rank11-turn49-handburn-counterfactual.cjs');

const SOURCE_SEAT=0;
const CANDIDATE_SEAT=1;
const SEED=1244180408;

/** @param {object} game @returns {object} */
function summarize(game) {
  const last=game.decisionTrace.filter(x=>x.turnBefore>=48).map(row=>({
    root:row.actionOrdinal,turn:row.turnBefore,seat:row.playerSlot,
    action:row.action,card:row.card??null,attack:row.attack??null,
    copiedAttack:row.attackChoice?.selection?.attackName??null,
    ownHand:row.playerSlot===SOURCE_SEAT && row.turnBefore===49 ?
      row.decisionHandBefore?.ownHandPrintings??null : null,
    prizesAfter:row.prizesAfter
  }));
  const effects=(game.poltergeistEffectTrace||[]).map(row=>({
    root:row.actionOrdinal,turn:row.turnBefore,
    printedBaseDamage:row.assessment?.printedBaseDamage??null,
    sourceTrainerCount:row.before?.[SOURCE_SEAT]?.handTrainerCount??null,
    sourceRemainingPrizesBefore:row.before?.[SOURCE_SEAT]?.prizesRemaining??null
  }));
  return {
    finished:game.finished,winner:game.winner,prizesRemaining:game.prizesRemaining,
    actions:game.actions,turns:game.turns,endReason:game.endReason,
    terminalTransition:game.terminalTransition??null,
    sourceOpeningCompleted:game.rank11AutonomousPolicy?.completeAtDecisionBoundary===true,
    sourceDecisionTail:last,
    copiedPoltergeistEffectWindows:effects,
    candidateRealStoreAttackDeclarations:(game.attackDeclarationTrace||[])
      .filter(row=>row.playerSlot===CANDIDATE_SEAT && row.turnBefore>=48)
      .map(row=>({
        root:row.actionOrdinal,turn:row.turnBefore,
        attack:row.attackName,status:row.resolutionStatus
      })),
    lateRootLedger:game.rootActionLedger.filter(row=>row.turnBefore>=48)
  };
}

/** @returns {object} */
function run() {
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(row=>row.rank===11);
  assert.equal(source?.status,'ready');
  const request={
    deckA:source.cards,deckB:plan.candidate.cards,
    seed:SEED,maxActions:450,
    rank11SourceSeat:SOURCE_SEAT,
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    capturePoltergeistEffectTrace:true,
    label:'retrospective-rank11-source-handburn-counterfactual'
  };
  const execute=()=>withNewMoonBlowerAutonomy(CANDIDATE_SEAT,
    ()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE),
    {lowHandLillieAfterBlower:true});
  const baseline=execute().result;
  const counterfactual=withRank11Turn49HandBurn(SOURCE_SEAT,execute);
  const branch=counterfactual.result.result;
  const replay=execute().result;
  for(const game of [baseline,branch,replay]) {
    assert.equal(game.firstTurnSlot,SOURCE_SEAT);
    assert.equal(game.verifiedByDrawLog,true);
    assert.equal(game.rank11AutonomousPolicy?.completeAtDecisionBoundary,true);
    assert.deepEqual(game.deckHashes,baseline.deckHashes);
  }
  const serialize=game=>JSON.stringify({
    rootActionLedger:game.rootActionLedger,
    decisionTrace:game.decisionTrace,
    effectTrace:game.poltergeistEffectTrace,
    terminalTransition:game.terminalTransition,
    winner:game.winner,prizesRemaining:game.prizesRemaining
  });
  assert.equal(serialize(replay),serialize(baseline),
    'Source policy restoration changed complete baseline Store replay');
  const prefix=game=>game.rootActionLedger.filter(row=>row.turnBefore<49);
  assert.deepEqual(prefix(branch),prefix(baseline),
    'Counterfactual changed game actions before the source turn49 decision');
  assert.equal(counterfactual.policyAudit.sourceTurnSeen,true,
    'The source-opponent turn49 decision did not occur as expected');
  const baselineHand=baseline.decisionTrace.find(row=>
    row.playerSlot===SOURCE_SEAT && row.turnBefore===49 &&
    row.action==='PlayCardAction' && row.card==='Darkness Energy')
    ?.decisionHandBefore?.ownHandPrintings;
  assert.equal(baselineHand?.filter(name=>name==='Quick Ball FST').length,3,
    'Authentic 3-Quick-Ball source hand premise changed');
  assert.equal(baselineHand?.filter(name=>[
    'Boost Shake EVS','VS Seeker PHF','Carmine TWM'].includes(name)).length,4,
    'Authentic Trainer discard choices changed');
  const rootDigest=game=>crypto.createHash('sha256')
    .update(JSON.stringify(game.rootActionLedger)).digest('hex');
  return {
    schema:'rank11-turn49-Quick-Ball-Store-counterfactual-v1',
    targetScope:'source-dealt retrospective mechanical and policy sensitivity only',
    sourceRank:11,sourceSeed:SEED,
    sourceSeat:SOURCE_SEAT,candidateSeat:CANDIDATE_SEAT,
    sourceOriginalPrintDeckHash:baseline.deckHashes[0],
    candidateOriginalProxyDeckHash:baseline.deckHashes[1],
    engineRevision:plan.engineRevision,
    baselineHash:rootDigest(baseline),
    branchHash:rootDigest(branch),
    originalReplayRestored:true,
    beforeSourceTurn49RootActionsIdentical:true,
    originalSourceTurn49OwnHand:baselineHand,
    sourcePolicyCounterfactual:counterfactual.policyAudit,
    baseline:summarize(baseline),
    altered:summarize(branch),
    competitiveGamesQualified:0,
    qualification:'Single retrospectively selected seed and opt-in amended opponent policy; source and candidate policy not competitively qualified, no tournament clock or full paper-rules audit'
  };
}

if(require.main===module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,summarize};
