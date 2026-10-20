'use strict';
const assert=require('node:assert/strict');
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
      {lowHandLillieAfterBlower:true}));
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
  const packet={
    schema:'agent13-actor-only-copied-attack-original-source-v1',
    enginePin:plan.engineRevision,researchSha:process.env.GITHUB_SHA??null,
    sourceRank:11,sourceSeed:1244180408,
    retrospectivelySelected:true,sourceSeat:0,candidateSeat:1,
    attackerPolicyVersion:VERSION,remainingFallbacksUnqualified:true,
    candidateAndSourceDecksUnchanged:true,
    firstTurnSlot:game.firstTurnSlot,
    sourceLineCompleted:game.rank11AutonomousPolicy?.completeAtDecisionBoundary===true,
    decisions:run.audit,
    candidateChoices:candidateSelections,
    declarations:candidateAttackDeclarations,
    sourceRank11ActionsAfterFirstCopy:(game.rootActionLedger??[]).filter(x=>
      x.playerSlot===0&&
      x.turnBefore>(candidateSelections[0]?.turn??Infinity)).slice(0,12),
    nativeActionCount:game.actions,
    finished:game.finished,endReason:game.endReason,
    competitiveQualifiedGames:0,
    caveat:'One retrospective native source-dealt regression. Native opponent decisions and the printed paper game clock remain unqualified.'
  };
  process.stdout.write(JSON.stringify(packet,null,2)+'\n');
  assert.equal(game.firstTurnSlot,0);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(packet.sourceLineCompleted,true);
  assert.equal(run.audit.rejected,0);
  assert.ok(run.audit.accepted>=1,
    'Require at least one genuine Store-accepted actor-only donor Attack');
  return packet;
}
if(require.main===module)main();
module.exports={main};
