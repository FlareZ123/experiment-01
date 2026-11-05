'use strict';

const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {originals}=require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');
const {withBilateralMultiBasicPaidRetreat}=
  require('../twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs');
const {STEPS,classifyOwnerMultiBasicRetreatPass}=
  require('../twinleaf/agent2-multi-basic-retreat-pass-cascade.cjs');
const {classifyOneBasicAttachmentAtPass}=
  require('../twinleaf/agent2-one-basic-attack-attachment-frontier.cjs');

const VERSION='agent2-fresh-eight-pair-one-basic-attachment-opportunity-v1';
const FROZEN=[
  [3565472974,0,'fe2a2f8d189c3c98db8a315e37051106b70309cee9fc572faef0d2cf39d5fa7f','df6e3f0db56316667a09d285b0f4a09b5cf3d955e113b1e2364c14b9f243a222','6962589458ad2b03bd3344f139cd7fa31bc6e62be6e932d7ace75f81eafb7652'],
  [3565472974,1,'c2b4019e4fd9db4d0facb714b429abe59ff7ef0bbaa21aba0cb98fdb5fa4e148','b1a840820c97a30f51698973a43d48b1ea48553f5f2166bd9eae183959f4b197','e755fd4af340b12f0b9beac96d7c7764aac091de1ec1f40ec4cdaa1eeff3a564'],
  [130758722,0,'5236177955b9393c59f1fd5b88403e4afcfca36b0545e0fd0ce2c818508def5f','e07b723019a4bbb593b5cfac9567ff580027f5b0ab14ddccdc91a7e5974e6dc3','f0d067d10a7fa8533684888961ee06e2acebaf37496dbd0e63f5c5dc7998b234'],
  [130758722,1,'a5c35dae2b66b2a5163e94745c1c0aaef1312d61504b7c43586fe9b0c3f8c893','fffd32fb8d9ba760bc505e94b08b21083044c127da9be2835072feaaec593f29','2a3ef6496b970ec11234b84eb5b2df1c96d99dc4fb138f591ba610eaf9df5889'],
  [3792360798,0,'02bb2b2e4b28d1cfc9e030e70c38f389fa37948e8c3dceb34472133f4753582a','37ed042b42966fd5c2232d28d1e458131e0ba9e0febf14cb3ad2961710c70c46','f41dea697fa43e85a6278e8522692c1ca0cc0c11e1ee2b10b2c007e193640f0c'],
  [3792360798,1,'b577aad657950cdbbd02f11f1c43fb593354a7e2aa2ae10b749aecb0abdef0da','e1cac398b33852faae99b88c69082055ba47acd685e8bb0a7b6059b6efc57143','95a4e442bc853a6269af0c5800e2faec2835892e9876b4c354ff2da9a072a648'],
  [1654918696,0,'9d7c93ada82caf2f0d02e79d4d4f9601b5eee88f918be7711cd56aecab9609cd','cf4bcb1ac20b9219841330074d85214afa2a3c744af1e12f0ec2946e5f168754','35c53f15fa7a3d0b97bfccfaec16968ac574880a6349d000eb086fa5a691948f'],
  [1654918696,1,'6119a9838d2af7fb932db8971c1e9ece50d11fde6dca5278625773405400ac18','1834d0a276140edf1f7d95fd5e32313672372ce19d018b3f9b7b39d3b276636e','42c0f999f6b9413c1f7b67766bc7d0185de450399463eed295ecdebfb97702a0']
];
const hash=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/**
 * Eight exactly frozen reference-control replays, pure pass diagnosis only.
 * All player decisions originate from existing identical native policies.
 * @returns {object} Failure-inclusive source-custody and eligibility counts.
 */
function run(){
  initializeCards();
  const cards=originals();
  const prior=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const rows=[];
    for(const [seed,rank3Seat,full,source,ledger] of FROZEN){
      const obs=[],attachmentObs=[];
      let originalPassAudit=null;
      const deckA=rank3Seat===0?cards.source:cards.candidate;
      const deckB=rank3Seat===0?cards.candidate:cards.source;
      try{
        const guarded=withNativePaperSupporterDiscipline(()=>
          withCanonicalActorOnlyPolicy(()=>{
            const generic=withBilateralMultiBasicPaidRetreat(()=>
              withSameTargetAttachEnergySelection(()=>runMatch({
                deckA,deckB,seed,maxActions:520,
                label:'agent2-original-pass-one-basic-reachability-'+seed+'-'+rank3Seat,
                strictPromptValidation:true,
                mandatoryOptionFallback:true,
                enforceSelectOptionLegality:true,
                enforceVisiblePlayLockBothSeats:true,
                captureInitialFullPhysicalDeal:true,
                captureInitialSourceDealFingerprintSeat:rank3Seat,
                captureDecisionTrace:true,
                capturePublicAttackTransitions:true,
                captureNativeAbortEvidence:true,
                captureFinalPublicBoard:true
              })).result,{
                observeFirstTurnPassOnly:true,
                choose:(view,catalog)=>{
                  obs.push(classifyOwnerMultiBasicRetreatPass(view,catalog));
                  attachmentObs.push(classifyOneBasicAttachmentAtPass(view,catalog));
                  return null;
                }
              });
            originalPassAudit=generic.audit;
            return generic.result;
          },{root:work=>withActorOnlyRootPolicy(work,{
            publicContextSpecialEnergy:true,specialEnergyRoot:true
          })},{ownerSingleSearch:true,genericFallbackAttribution:true})
        );
        const game=guarded.result.result;
        const roots=game.rootActionLedger??[];
        const actualFull=game.initialFullPhysicalDealFingerprint
          ?.digestSha256??null;
        const actualSource=game.initialSourceDealFingerprint
          ?.digestSha256??null;
        const actualLedger=hash(roots);
        const expectedPasses=roots.filter(x=>
          x.action==='PassTurnAction').length;
        const passesBySeat=[0,1].map(seat=>roots.filter(x=>
          x.playerSlot===seat&&x.action==='PassTurnAction').length);
        const originalPasses=originalPassAudit?.originalPassesBySeat??null;
        const identityMatch=actualFull===full&&actualSource===source&&
          actualLedger===ledger;
        const observationsComplete=obs.length===expectedPasses&&
          originalPasses?.[0]===passesBySeat[0]&&
          originalPasses?.[1]===passesBySeat[1];
        const independent={},cumulative={},firstFailure={};
        for(const step of STEPS){
          independent[step]=obs.filter(x=>x.stages[step]).length;
          cumulative[step]=obs.filter(x=>x.cumulative[step]).length;
          firstFailure[step]=obs.filter(x=>x.firstFailure===step).length;
        }
        rows.push({seed,rank3Seat,
          status:identityMatch&&observationsComplete&&game.finished?
            'exact-reproduced-terminal':'UNRESOLVED',
          actualFullDealSha256:actualFull,actualSourceDealSha256:actualSource,
          actualRootLedgerSha256:actualLedger,
          frozenReferenceFullSha256:full,
          frozenReferenceSourceSha256:source,
          frozenReferenceLedgerSha256:ledger,
          identityMatch,observationsComplete,
          attachmentObservationsComplete:attachmentObs.length===expectedPasses,
          attachmentOpportunity:attachmentObs,
          nativeFinished:game.finished,nativeWinner:game.winner,
          actualRootCount:roots.length,
          actualPassRoots:expectedPasses,
          passRootsBySeat:passesBySeat,
          observations:obs,
          independentStages:independent,cumulativeStages:cumulative,
          firstFailures:firstFailure,
          nominalOffers:obs.filter(x=>x.wouldNominallyOffer).length,
          qualifiedGames:0
        });
      }catch(error){
        rows.push({seed,rank3Seat,status:'native-error',
          error:String(error?.stack??error).slice(0,3800),
          attemptedObserverPasses:obs.length,qualifiedGames:0});
      }
    }
    const totals={passRoots:0,nominalOffers:0,
      oneBasicShortfallPasses:0,quotaActivePasses:0,quotaBenchPasses:0,
      rawActiveShortfallPasses:0,rawBenchShortfallPasses:0,
      passRootsByActorSeat:[0,0],quotaActiveByActorSeat:[0,0],
      quotaBenchByActorSeat:[0,0],
      independentStages:{},cumulativeStages:{},firstFailures:{}};
    for(const row of rows){
      totals.passRoots+=row.actualPassRoots??0;
      for(const receipt of row.attachmentOpportunity??[]){
        const seat=receipt.actorSeat;
        totals.passRootsByActorSeat[seat]++;
        if(receipt.anyOneBasicShortfall)totals.oneBasicShortfallPasses++;
        if(receipt.activeShortfallCount>0)totals.rawActiveShortfallPasses++;
        if(receipt.benchShortfallCount>0)totals.rawBenchShortfallPasses++;
        if(receipt.anyQuotaAllowedActive){
          totals.quotaActivePasses++;
          totals.quotaActiveByActorSeat[seat]++;
        }
        if(receipt.anyQuotaAllowedBench){
          totals.quotaBenchPasses++;
          totals.quotaBenchByActorSeat[seat]++;
        }
      }
      totals.nominalOffers+=row.nominalOffers??0;
      for(const [key,where] of [
        ['independentStages','independentStages'],
        ['cumulativeStages','cumulativeStages'],
        ['firstFailures','firstFailures']]){
        for(const [step,value] of Object.entries(row[where]??{}))
          totals[key][step]=(totals[key][step]??0)+value;
      }
    }
    return {
      schema:VERSION,enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      originalRank3Sha256:hash(cards.source),
      originalRank1Sha256:hash(cards.candidate),
      frozenOriginalPanelArtifactId:13420591771,
      originalFourSeeds:[3565472974,130758722,3792360798,1654918696],
      originalRank3Seats:[0,1],
      noGameplayIntervention:true,
      sourcePreRegistered:'results/methodology/agent2-340-pass-one-basic-attachment-opportunity-prereg-20261105.md',
      rowCount:rows.length,
      allEightReferenceRootsExactlyReproduced:rows.length===8&&
        rows.every(x=>x.status==='exact-reproduced-terminal'),
      steps:STEPS,totals,rows,
      qualifiedGames:0,
      caveat:'Original eight unchanged developmental games; owner-held Basic-only nominal one-card attack readiness, never native Store legality, paper payment, mobility, or competitive wins.'
    };
  }finally{
    for(const [key,value] of prior){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  const d=run();
  process.stdout.write(JSON.stringify(d,null,2)+'\n');
  if(!d.allEightReferenceRootsExactlyReproduced||
    d.totals.passRoots!==340||d.totals.nominalOffers!==0)
    process.exitCode=1;
}
module.exports={VERSION,FROZEN,run};
