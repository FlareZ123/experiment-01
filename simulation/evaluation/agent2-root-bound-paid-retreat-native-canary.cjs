'use strict';

const assert=require('node:assert/strict');
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
const {withRank3SourceGuzmaReply}=
  require('../twinleaf/agent2-rank3-owned-guzma-reply.cjs');
const {withRank1HeldGuzmaCounterplay}=
  require('./agent2-rank1-original-guzma-counterplay-aba.cjs');
const {withOwnerSelectedDialgaPaidRetreat}=
  require('../twinleaf/agent2-rank1-dialga-owner-decoder-retreat-v2.cjs');
const {withBilateralMultiBasicPaidRetreat}=
  require('../twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs');
const {createActualRootIdentityGuard}=
  require('../twinleaf/agent2-root-identity-guard.cjs');
const {createPaidRetreatAcceptedRootReceipt}=
  require('../twinleaf/agent2-paid-retreat-accepted-root-receipt.cjs');

const VERSION='agent2-root-bound-paid-retreat-native-canary-v2';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const FULL='e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb';
const SOURCE='ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a';
const SEED=290134;
const hash=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/**
 * Same historical opening, unchanged exact original source and opponent 60s.
 * All arms preserve the actual held rank1 Guzma and rank3 reciprocal Guzma.
 * The controlled difference is the same owner-only generic multi-Basic paid-retreat planner enabled for BOTH physical seats.
 *
 * @param {string} variant Registered control, treatment or repeat.
 * @param {{source:string[],candidate:string[]}} cards Exact printed 60s.
 * @returns {object} Complete native disposition and research custody audit.
 */
function runArm(variant,cards){
  let sourceAudit=null,rank1Audit=null,retreatAudit=null,genericAudit=null;
  let identityAudit=null,acceptedRootAudit=null;
  try{
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(()=>{
        const rank1=withRank1HeldGuzmaCounterplay(()=>{
          const source=withRank3SourceGuzmaReply(()=>{
            const retreat=withOwnerSelectedDialgaPaidRetreat(()=>{
              const rootIdentity=createActualRootIdentityGuard();
              const acceptedReceipt=createPaidRetreatAcceptedRootReceipt();
              const native=()=>withSameTargetAttachEnergySelection(()=>runMatch(rootIdentity.attach(acceptedReceipt.attach({
                deckA:cards.source,deckB:cards.candidate,
                seed:SEED,maxActions:520,
                label:'agent2-original-bilateral-multi-basic-retreat-'+variant,
                strictPromptValidation:true,
                mandatoryOptionFallback:true,
                enforceSelectOptionLegality:true,
                enforceVisiblePlayLockBothSeats:true,
                captureInitialFullPhysicalDeal:true,
                captureInitialSourceDealFingerprintSeat:0,
                captureDecisionTrace:true,
                capturePublicAttackTransitions:true,
                captureNativeAbortEvidence:true,
                captureFinalPublicBoard:true
              })))).result;
              if(variant!=='root-bound-treatment')return native();
              const generic=withBilateralMultiBasicPaidRetreat(native,{
                isActualRoot:rootIdentity.isActualRoot,
                onRetreatSelected:acceptedReceipt.onRetreatSelected
              });
              genericAudit=generic.audit;
              identityAudit=rootIdentity.audit;
              acceptedRootAudit=acceptedReceipt.audit;
              return generic.result;
            },{
                treatment:false,
                ownerSeat:1,targetTurn:33
              });
            retreatAudit=retreat.audit;
            return retreat.result;
          });
          sourceAudit=source.audit;
          return source.result;
        },{evolveVmax:true});
        rank1Audit=rank1.audit;
        return rank1.result;
      },{root:work=>withActorOnlyRootPolicy(work,{
        publicContextSpecialEnergy:true,specialEnergyRoot:true
      })},{ownerSingleSearch:true,genericFallbackAttribution:true})
    );
    const game=guarded.result.result;
    const roots=game.rootActionLedger??[];
    const attacks=game.attackDeclarationTrace??[];
    const rank1Roots=roots.filter(row=>row.playerSlot===1&&
      ['RetreatAction','AttackAction','PassTurnAction','PlayCardAction']
        .includes(row.action));
    const sourceRoots=roots.filter(row=>row.playerSlot===0&&
      ['RetreatAction','AttackAction','PassTurnAction','PlayCardAction']
        .includes(row.action));
    return {
      variant,status:game.finished?'native-terminal':'native-cap',
      initialFullPhysicalDealSha256:
        game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      initialSourceDealSha256:
        game.initialSourceDealFingerprint?.digestSha256??null,
      actualNativeWinner:game.winner,
      globalTurns:game.turns,nativeActions:game.actions,
      engineEndReason:game.endReason??null,
      nativeRootLedgerSha256:hash(roots),
      rank1NativeRetreatRoots:rank1Roots.filter(x=>
        x.action==='RetreatAction'),
      rank1NativeAttacks:attacks.filter(x=>x.playerSlot===1)
        .map(x=>({turn:x.turnBefore,name:x.attackName})),
      rank3NativeBurrows:attacks.filter(x=>x.playerSlot===0&&
        x.attackName==='Burrow').map(x=>x.turnBefore),
      sourceGuzmaRoots:sourceRoots.filter(x=>
        x.action==='PlayCardAction'&&x.card==='Guzma'),
      rank1GuzmaRoots:rank1Roots.filter(x=>
        x.action==='PlayCardAction'&&x.card==='Guzma'),
      rank1SourceResponseTimeline:rank1Roots.filter(row=>
        row.turnBefore>=33),
      rank3SourceResponseTimeline:sourceRoots.filter(row=>
        row.turnBefore>=33),
      retreatAudit,genericAudit,identityAudit,acceptedRootAudit,sourceAudit,rank1Audit,
      finalPublicBoard:game.finalPublicBoard??null,
      nativeTerminal:game.terminalTransition??null,
      competitivelyQualified:false
    };
  }catch(error){
    return {variant,status:'native-error',
      error:String(error?.stack??error).slice(0,4500),
      retreatAuditAtError:error?.agent2Rank1RetreatAudit??null,
      competitivelyQualified:false};
  }
}

/** One fixed original-60 historical physical-deal root-binding canary. */
function run(){
  initializeCards();
  const cards=originals();
  const old=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const arm=runArm('root-bound-treatment',cards);
    const identity=arm.identityAudit,policy=arm.genericAudit;
    const accepted=arm.acceptedRootAudit;
    const guards={
      rootStoreRegisteredExactlyOnce:
        identity?.rootStoreRegistrations===1,
      rootBotsRegisteredExactlyOnce:
        identity?.rootAgentRegistrations===1,
      nativePassCheckedAtRealRoot:
        (identity?.acceptedChecks??0)>0,
      symmetricPassReceipt:
        (identity?.acceptedChecks??-1)===
          (policy?.originalPassesBySeat??[]).reduce((a,b)=>a+b,0),
      guardedNativeWrapperSelected:
        policy?.rootIdentityGuardEnabled===true,
      exactSelectedRetreatNativeAccepted:
        accepted?.selectedProposals===1&&
        accepted?.acceptedNativeProposals===1&&
        accepted?.invalidNativeJoins===0&&
        accepted?.receipts?.some(receipt=>
          receipt.actorSeat===1&&receipt.turnBefore===33&&
          receipt.actionName==='RetreatAction'&&
          arm.rank1NativeRetreatRoots?.some(x=>
            x.actionOrdinal===receipt.actionOrdinal)),
      sameSourcePhysicalDeal:
        arm.initialFullPhysicalDealSha256===FULL &&
        arm.initialSourceDealSha256===SOURCE
    };
    return {version:VERSION,pin:PIN,seed:SEED,
      originalSourceRank:3,originalReferenceRank:1,
      sourceOriginal60Sha256:hash(cards.source),
      referenceOriginal60Sha256:hash(cards.candidate),
      checks:guards,checksPass:Object.values(guards).every(Boolean),
      arm,qualification:'Native single retrospective root canary only. Pinned Store dispatch and paper legality/official clock must be independently audited; no competitive game or win rate inferred.',
      competitivelyQualifiedGames:0};
  }finally{
    for(const [key,value] of old){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  const data=run();
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
  if(!data.checksPass)process.exitCode=1;
}
module.exports={VERSION,runArm,run};
