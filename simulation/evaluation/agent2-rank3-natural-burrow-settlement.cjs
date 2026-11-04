'use strict';

const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {runOne}=require('./agent2-rank3-original-fss-float-census.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');

const VERSION='agent2-rank3-original-natural-burrow-selected-trace-v1';
const SEED=290134;
const SOURCE_SEAT=0;
const EXPECTED_FULL_DEAL=
  'e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb';
const EXPECTED_SOURCE_DEAL=
  'ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a';
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * A single pre-existing source deal is replayed with strictly observational
 * public attack transition collection. This does not select a new policy.
 * @returns {object} Failure-inclusive one-deal native evidence.
 */
function run(){
  initializeCards();
  const cards=originals();
  const trial={
    candidateSeat:1,sourceSeat:SOURCE_SEAT,seed:SEED,
    id:'rank3-fresh-1-290134'
  };
  const baseline=runOne(trial,cards);
  const request={
    deckA:cards.source,
    deckB:cards.candidate,
    seed:SEED,
    maxActions:260,
    label:'agent2-natural-rank3-burrow-source-paid-audit',
    strictPromptValidation:true,
    mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialFullPhysicalDeal:true,
    captureInitialSourceDealFingerprintSeat:SOURCE_SEAT,
    captureDecisionTrace:true,
    capturePublicAttackTransitions:true,
    captureNativeAbortEvidence:true,
    captureFinalPublicBoard:true
  };
  const old=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(()=>
        withSameTargetAttachEnergySelection(()=>
          runMatch(request)).result,{
          root:work=>withActorOnlyRootPolicy(work,{
            publicContextSpecialEnergy:true,specialEnergyRoot:true
          })
        },{ownerSingleSearch:true,genericFallbackAttribution:true})
    );
    const game=guarded.result.result;
    const fullDeal=game.initialFullPhysicalDealFingerprint?.digestSha256??null;
    const sourceDeal=game.initialSourceDealFingerprint?.digestSha256??null;
    const paperBurrowDeclarations=(game.attackDeclarationTrace??[])
      .filter(row=>row.playerSlot===SOURCE_SEAT&&row.attackName==='Burrow');
    const burrowTransitions=(game.publicAttackTransitions??[])
      .filter(row=>row.triggerPlayerSlot===SOURCE_SEAT&&
        row.declarations?.some(d=>d.attackName==='Burrow'));
    const ownerReplies=(game.rootActionLedger??[]).filter(row=>
      row.turnBefore>=20&&row.turnBefore<=27);
    const controls={
      sourceRank:3,referenceRank:1,
      frozenSeed:SEED,sourceSeat:SOURCE_SEAT,
      baselineFullDeal:baseline.fullInitialDealSha256??null,
      traceFullDeal:fullDeal,
      baselineSourceDeal:baseline.sourceInitialDealSha256??null,
      traceSourceDeal:sourceDeal,
      exactFrozenFullDeal:fullDeal===EXPECTED_FULL_DEAL,
      exactFrozenSourceDeal:sourceDeal===EXPECTED_SOURCE_DEAL,
      baselineAndTraceFullDealMatch:
        fullDeal!==null&&fullDeal===baseline.fullInitialDealSha256,
      baselineAndTraceSourceDealMatch:
        sourceDeal!==null&&sourceDeal===baseline.sourceInitialDealSha256,
      baselineAndTraceOutcomeMatch:
        baseline.status==='native-terminal'&&game.finished&&
        baseline.nativeWinner===game.winner&&
        baseline.nativeActions===game.actions,
      baselineWinner:baseline.nativeWinner??null,
      baselineActions:baseline.nativeActions??null,
      traceWinner:game.winner,
      traceActions:game.actions,
      gameTerminal:game.finished
    };
    return {
      schema:VERSION,sourceOriginal60Sha256:digest(cards.source),
      referenceOriginal60Sha256:digest(cards.candidate),
      pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      controls,
      controlsPass:
        controls.exactFrozenFullDeal&&controls.exactFrozenSourceDeal&&
        controls.baselineAndTraceFullDealMatch&&
        controls.baselineAndTraceSourceDealMatch&&
        controls.baselineAndTraceOutcomeMatch,
      burrowDeclarationCount:paperBurrowDeclarations.length,
      burrowTransitionCount:burrowTransitions.length,
      burrowDeclarations:paperBurrowDeclarations,
      burrowPublicTransitions:burrowTransitions,
      actualRootLedgerTurns20to27:ownerReplies,
      terminalTransition:game.terminalTransition??null,
      finalPublicBoard:game.finalPublicBoard??null,
      engineEndReason:game.endReason??null,
      competitiveQualifiedGames:0,
      note:'Owner source attack receipts only. Attack log and public transition verify native Store steps, not paper-rule fidelity, independent skill or timed-match wins.'
    };
  }finally{
    for(const [name,value] of old){
      if(value===undefined)delete process.env[name];
      else process.env[name]=value;
    }
  }
}
if(require.main===module){
  try{
    const evidence=run();
    process.stdout.write(JSON.stringify(evidence,null,2)+'\n');
    if(!evidence.controlsPass||evidence.burrowDeclarationCount===0)
      process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({
      schema:VERSION,status:'native-error',
      error:String(error?.stack??error).slice(0,3000),
      competitiveQualifiedGames:0
    },null,2)+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,SEED,SOURCE_SEAT,run};
