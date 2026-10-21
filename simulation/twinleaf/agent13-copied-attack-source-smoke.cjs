'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy}=
  require('./newmoon-garbotoxin-blower-autonomy.cjs');
const {withActorOnlyChooseAttack,VERSION}=
  require('./agent13-actor-only-choose-attack.cjs');
/**
 * The archived rank-11 source-dealt seed (selected in earlier research,
 * inadmissible for win-rate estimates) previously demonstrated three legal
 * printed Gengar & Mimikyu Poltergeist copies. Use its exact live Store to
 * test our donor-index-preserving actor-only generic attack choice.
 */
function main(){
  const preferGengarPoltergeist=process.env.AGENT13_COPY_POLTERGEIST_PRIORITY==='true';
  const deck=loadNewMoonCandidate();
  const plan=planAichi({label:deck.id,cards:deck.cards},{
    allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(x=>x.rank===11);
  assert.equal(source?.status,'ready');
  const request={
    deckA:source.cards,deckB:plan.candidate.cards,
    seed:1244180408,maxActions:450,rank11SourceSeat:0,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    capturePoltergeistEffectTrace:true,
    label:'agent13-actor-only-copied-attack-source-original-dev'
  };
  const run=withActorOnlyChooseAttack(()=>
    withNewMoonBlowerAutonomy(1,
      ()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE),
      {lowHandLillieAfterBlower:true}),
    {preferGengarPoltergeist});
  const game=run.result.result;
  const candidateSelections=(game.decisionTrace??[]).filter(row=>
    row.playerSlot===1&&row.attackChoice?.selection).map(row=>({
      rootOrdinal:row.actionOrdinal,turn:row.turnBefore,
      printing:row.attackChoice.selection.printing,
      sourceIndex:row.attackChoice.selection.index,
      attackName:row.attackChoice.selection.attackName
    }));
  const candidateAttackDeclarations=(game.attackDeclarationTrace??[]).filter(x=>
    x.playerSlot===1).map(x=>({
      ordinal:x.actionOrdinal,turn:x.turnBefore,
      attack:x.attackName,resolution:x.resolutionStatus
    }));
  const firstChoiceOrdinal=candidateSelections[0]?.rootOrdinal??null;
  const firstChoicePrefix=(game.rootActionLedger??[]).filter(row=>
    firstChoiceOrdinal!==null&&row.actionOrdinal<firstChoiceOrdinal);
  const prefixDigest=createHash('sha256').update(JSON.stringify(firstChoicePrefix))
    .digest('hex');
  // Referee-only post-attack effect data: NEVER feed hidden Trainer counts
  // back into the acting player's pre-attack copied-attack selector.
  const copiedEffects=(game.poltergeistEffectTrace??[]).filter(row=>
    candidateSelections.some(choice=>choice.rootOrdinal===row.actionOrdinal&&
      choice.attackName==='Poltergeist')).map(row=>({
      actionOrdinal:row.actionOrdinal,turnBefore:row.turnBefore,
      refereeOpposingTrainerCount:row.before?.[0]?.handTrainerCount??null,
      printedBaseDamage:row.assessment?.printedBaseDamage??null,
      assessment:row.assessment??null,
      nativeSteps:(row.steps??[]).map(step=>({
        actionOrdinal:step.actionOrdinal,actionName:step.actionName,
        pendingPrompt:step.pendingPrompt,
        beforePrizes:step.before?.map(s=>s.prizesRemaining),
        afterPrizes:step.after?.map(s=>s.prizesRemaining)
      }))
    }));
  const packet={
    schema:'agent13-actor-only-copied-attack-original-source-v2',
    enginePin:plan.engineRevision,researchSha:process.env.GITHUB_SHA??null,
    sourceRank:11,sourceSeed:1244180408,
    retrospectivelySelected:true,sourceSeat:0,candidateSeat:1,
    attackerPolicyVersion:run.audit.version,
    preferGengarPoltergeist,remainingFallbacksUnqualified:true,
    candidateAndSourceDecksUnchanged:true,
    firstTurnSlot:game.firstTurnSlot,
    sourceLineCompleted:game.rank11AutonomousPolicy?.completeAtDecisionBoundary===true,
    deckHashes:game.deckHashes,
    firstCopyPrecedingRootCount:firstChoicePrefix.length,
    firstCopyPrecedingRootSha256:prefixDigest,
    copiedPoltergeistEffects:copiedEffects,
    decisions:run.audit,
    candidateChoices:candidateSelections,
    declarations:candidateAttackDeclarations,
    sourceRank11ActionsAfterFirstCopy:(game.rootActionLedger??[]).filter(x=>
      x.playerSlot===0&&
      x.turnBefore>(candidateSelections[0]?.turn??Infinity)).slice(0,12),
    nativeActionCount:game.actions,
    prizesRemaining:game.prizesRemaining??null,
    sourceActionLedgerDigest:game.sourceActionLedgerDigest??null,
    finished:game.finished,endReason:game.endReason,winnerSeat:game.winner,
    competitiveQualifiedGames:0,
    caveat:'One retrospective native source-dealt regression. Native opponent decisions and the printed paper game clock remain unqualified.'
  };
  process.stdout.write(JSON.stringify(packet,null,2)+'\n');
  assert.equal(game.firstTurnSlot,0);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(packet.sourceLineCompleted,true);
  assert.equal(run.audit.rejected,0);
  if(preferGengarPoltergeist){
    assert.equal(copiedEffects.length,candidateSelections.filter(x=>
      x.attackName==='Poltergeist').length,
    'Every native copied Poltergeist requires one real Store effect window');
    for(const effect of copiedEffects){
      assert.ok(Number.isInteger(effect.refereeOpposingTrainerCount));
      assert.equal(effect.printedBaseDamage,
        effect.refereeOpposingTrainerCount*50);
    }
  }
  assert.ok(run.audit.accepted>=1,
    'Require at least one genuine Store-accepted actor-only donor Attack');
  return packet;
}
if(require.main===module)main();
module.exports={main};
