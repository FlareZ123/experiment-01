'use strict';

const assert=require('node:assert/strict');
const {sha256,verifyFrame}=
  require('../twinleaf/agent32-rank11-six-star-vip-k1-native.cjs');
const frame=require('../../results/aichi-2026/registrations/agent32-rank11-six-k0-star-vip-native-20261030.json');
const {withOwnerOranguruStarVipPlan,VERSION:OWNER_VERSION}=
  require('../twinleaf/agent1-owner-oranguru-starvip-native.cjs');
const {withNewMoonBlowerAutonomy}=
  require('../twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');

const VERSION='agent1-original-six-owner-starvip-opponent-fieldblower-native-pair-v1';

/**
 * Two real-state actor-side opportunities: source first-turn multiaction
 * setup via owner K0 card offer, opponent optional held Field Blower reply.
 * Frozen original rank11 and rank1 physical 60s and same registered seeds.
 * @returns {object}
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
    const pair={index:entry.index,seed:entry.seed,arms:[]};
    for(const opponentBlowerPolicy of [false,true]){
      try{
        const executeSource=()=>withOwnerOranguruStarVipPlan(
          ()=>runMatch({...decks,seed:entry.seed,
            label:'rank11-conditional-K0-screen-v1:'+entry.index,
            maxActions:200,captureDecisionTrace:true,
            strictPromptValidation:true,
            forestSealSearchCorrection:true,
            battleCompressorPositiveSelectionCorrection:true,
            isolatePolicyRandomness:true}),{
              chooseOffer:(view,offer)=>{
                assert.equal(view.decisionKind,'owner-root');
                assert.equal(offer.eligible,true);
                return true;
              }
            });
        const result=opponentBlowerPolicy?
          withNewMoonBlowerAutonomy(1,executeSource,{
            automaticFieldBlower:true,allowAnyActiveBlower:true}):
          {result:executeSource(),policyAudit:null};
        const game=result.result.result;
        const sourceAudit=result.result.audit;
        const blowerAudit=result.policyAudit;
        const first=sourceAudit.originalOwnK0AtOffer?.find(row=>row.seat===0);
        assert.ok(first,'No first genuine original source K0 owner observation');
        assert.equal(first.handSha256,entry.sourceFirstOwnerHandSha256,
          'Source original K0 owner hand changed in paired reply');
        assert.deepEqual(first.bench,entry.sourceBenchAtK0,
          'Source original K0 Bench changed in paired reply');
        assert.equal(game.firstTurnSlot,0);
        assert.equal(game.verifiedByDrawLog,true);
        const turn2FieldBlowerRoots=(game.decisionTrace??[]).filter(row=>
          row.playerSlot===1&&row.turnBefore===2&&
          row.action==='PlayCardAction'&&row.card==='Field Blower');
        const earlyBlowerProposals=(blowerAudit?.events??[]).filter(e=>
          e.turn===2&&e.kind==='autonomous-legal-Item');
        const earlyBlowerRemovalChecks=(blowerAudit?.events??[]).filter(e=>
          e.turn===2&&e.kind==='public-Tool-check'&&
          e.garbodorToolRemoved===true);
        pair.arms.push({opponentBlowerPolicy,
          status:'native-paired-original-K0',
          firstSourceHandSha256:entry.sourceFirstOwnerHandSha256,
          firstTurnSlot:game.firstTurnSlot,
          sourceOfferCount:sourceAudit.opportunities,
          sourcePlansChosen:sourceAudit.plansChosen,
          sourceNativeAccepted:sourceAudit.nativeAccepted,
          sourceOwnerPromptAccepted:sourceAudit.ownerPromptAccepted,
          sourceCompletedEquippedAfterReply:
            sourceAudit.completedEquippedGarbodor,
          sourceAborts:sourceAudit.abortReasons,
          nativeTurn2FieldBlowerRootCount:turn2FieldBlowerRoots.length,
          earlyBlowerProposals:earlyBlowerProposals.length,
          earlyBlowerToolRemoved:earlyBlowerRemovalChecks.length,
          blowerAuditVersion:blowerAudit?.version??null,
          gameEnded:game.finished===true,
          nativeRootCount:game.rootActionLedger?.length??null,
          engineWinnerForCompetitiveUse:null,qualifiedCompetitiveGame:false});
      }catch(error){
        pair.arms.push({opponentBlowerPolicy,status:'blocked',
          error:String(error?.stack??error).slice(0,1500),
          nativeDiagnostic:error?.agent1OwnerPlanDiagnostic??null,
          qualifiedCompetitiveGame:false});
      }
    }
    rows.push(pair);
  }
  const arms=rows.flatMap(row=>row.arms);
  const clean=arms.filter(a=>a.status==='native-paired-original-K0');
  return {version:VERSION,ownerPlanVersion:OWNER_VERSION,
    frameSha256:frame.frameSha256,engineRevision:frame.engineRevision,
    originalPairs:rows.length,armsAttempted:arms.length,
    originallyVerifiedArms:clean.length,
    chosenSourcePlans:clean.reduce((n,a)=>n+a.sourcePlansChosen,0),
    acceptedSourcePlanSteps:clean.reduce((n,a)=>n+a.sourceNativeAccepted,0),
    heldBlowerResponseRootCount:clean.reduce((n,a)=>
      n+a.nativeTurn2FieldBlowerRootCount,0),
    confirmedEarlyToolRemovalEvents:clean.reduce((n,a)=>
      n+a.earlyBlowerToolRemoved,0),
    blocked:arms.length-clean.length,rows,
    competitiveQualifiedGames:0,
    limits:'Same six retrospectively K0-selected rank11 source original 60 against rank1 original 60; source plan explicitly admitted, opponent native actor-directed Field Blower only where held and playable. Weak remaining native bot, no competitive games, no paper-equivalence claim.'};
}
if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.blocked>0){
    process.stderr.write('AGENT1_BILATERAL_BLOCKERS '+JSON.stringify(result.rows.map(r=>({index:r.index,arms:r.arms.filter(x=>x.status==='blocked').map(x=>({opponentBlowerPolicy:x.opponentBlowerPolicy,error:x.error,diagnostic:x.nativeDiagnostic}))})))+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,run};
