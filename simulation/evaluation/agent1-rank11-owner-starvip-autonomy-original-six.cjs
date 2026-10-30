'use strict';

const assert=require('node:assert/strict');
const {sha256,verifyFrame}=
  require('../twinleaf/agent32-rank11-six-star-vip-k1-native.cjs');
const {withOwnerOranguruStarVipPlan,VERSION}=
  require('../twinleaf/agent1-owner-oranguru-starvip-native.cjs');
const frame=require('../../results/aichi-2026/registrations/agent32-rank11-six-k0-star-vip-native-20261030.json');

/**
 * Test a card/resource-conditioned actor-visible plan's native action
 * execution, independently from the old fixed-stage source script.
 * Same six already preselected original rank11 source K0 physical deals.
 * No rank/seed check is inside the actual actor policy or offer.
 */
function run(){
  verifyFrame();
  const {runMatch}=require('../twinleaf/headless.cjs');
  const {resolvedPrintedDecks}=
    require('./rank11-conditional-k0-screen-run.cjs');
  const decks=resolvedPrintedDecks();
  assert.equal(decks.engineRevision,frame.engineRevision);
  const rows=[];
  for(const entry of frame.selectedExactK0){
    try{
      const selected=withOwnerOranguruStarVipPlan(()=>
        runMatch({...decks,seed:entry.seed,
          label:'rank11-conditional-K0-screen-v1:'+entry.index,
          maxActions:200,captureDecisionTrace:true,strictPromptValidation:true,
          forestSealSearchCorrection:true,
          battleCompressorPositiveSelectionCorrection:true,
          isolatePolicyRandomness:true}),{
            chooseOffer:(view,offer)=>{
              assert.equal(view.decisionKind,'owner-root');
              assert.equal(offer.eligible,true);
              return true;
            }
          });
      const game=selected.result;
      const audit=selected.audit;
      const first=audit.originalOwnK0AtOffer?.find(row=>row.seat===0);
      assert.ok(first,'Missing first genuine original source offer K0 root');
      assert.equal(first.turn,1);
      const firstHandSha=first.handSha256;
      assert.equal(firstHandSha,entry.sourceFirstOwnerHandSha256,
        'Original initial source owner physical K0 hand changed');
      assert.deepEqual(first.bench,entry.sourceBenchAtK0,
        'Original source K0 Bench must match preregistration');
      assert.equal(game.firstTurnSlot,0);
      assert.equal(game.verifiedByDrawLog,true);
      rows.push({index:entry.index,seed:entry.seed,
        originalSourceHandSha256:firstHandSha,
        status:'original-K0-verified-native-autonomous-plan',
        sourcePlanAudit:audit,
        gameFinished:game.finished===true,
        resultRootCount:game.rootActionLedger?.length??null,
        gameWinnerForCompetitiveUse:null,
        qualifiedCompetitiveGame:false});
    }catch(error){
      rows.push({index:entry.index,seed:entry.seed,status:'blocked',
        error:String(error?.stack??error).slice(0,1500),
        nativeDiagnostic:error?.agent1OwnerPlanDiagnostic??null,
        qualifiedCompetitiveGame:false});
    }
  }
  const passed=rows.filter(r=>r.status.startsWith('original-K0-verified'));
  return {schema:'agent1-original-six-native-card-conditioned-source-plan-v1',
    planVersion:VERSION,engineRevision:frame.engineRevision,
    frameSha256:frame.frameSha256,
    attempted:rows.length,originalK0Matched:passed.length,
    totalOwnerOffers:passed.reduce((n,r)=>n+r.sourcePlanAudit.opportunities,0),
    chosen:passed.reduce((n,r)=>n+r.sourcePlanAudit.plansChosen,0),
    nativeAccepted:passed.reduce((n,r)=>n+r.sourcePlanAudit.nativeAccepted,0),
    ownerPromptAccepted:passed.reduce((n,r)=>n+r.sourcePlanAudit.ownerPromptAccepted,0),
    equippedGarbodorSourceReturn:passed.reduce((n,r)=>
      n+r.sourcePlanAudit.completedEquippedGarbodor,0),
    blocked:rows.length-passed.length,rows,
    competitiveQualifiedGames:0,
    note:'Actor-visible first-root opportunity chosen by explicit experimental callback, native prompt/action progression, same retrospective six source deals. No competing action valuation, competent opposing policy, paper-equivalent game, or win-rate inference.'};
}
if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  if(r.blocked>0){
    process.stderr.write('AGENT1_AUTONOMY_BLOCKERS '+JSON.stringify(r.rows.map(x=>({index:x.index,status:x.status,error:x.error,sourcePlanAudit:x.sourcePlanAudit?{chosen:x.sourcePlanAudit.plansChosen,accepted:x.sourcePlanAudit.nativeAccepted,aborts:x.sourcePlanAudit.abortReasons,events:x.sourcePlanAudit.events.slice(0,14)}:null,nativeDiagnostic:x.nativeDiagnostic??null})))+'\n');
    process.exitCode=1;
  }
}
module.exports={run};
