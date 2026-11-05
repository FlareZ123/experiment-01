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
const {withRank3SourceGuzmaReply}=
  require('../twinleaf/agent2-rank3-owned-guzma-reply.cjs');
const {withRank1HeldGuzmaCounterplay}=
  require('./agent2-rank1-original-guzma-counterplay-aba.cjs');
const {withOwnerSelectedDialgaPaidRetreat}=
  require('../twinleaf/agent2-rank1-dialga-owner-decoder-retreat-v2.cjs');
const {withBilateralMultiBasicPaidRetreat}=
  require('../twinleaf/agent2-bilateral-multi-basic-retreat-bot.cjs');

const VERSION='agent2-bilateral-multi-basic-paid-retreat-aba-v1';
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
  try{
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(()=>{
        const rank1=withRank1HeldGuzmaCounterplay(()=>{
          const source=withRank3SourceGuzmaReply(()=>{
            const retreat=withOwnerSelectedDialgaPaidRetreat(()=>{
              const native=()=>withSameTargetAttachEnergySelection(()=>runMatch({
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
              })).result;
              if(variant!=='bilateral-multi-basic-retreat')return native();
              const generic=withBilateralMultiBasicPaidRetreat(native);
              genericAudit=generic.audit;
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
      retreatAudit,genericAudit,sourceAudit,rank1Audit,
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

/** @returns {object} Preregistered native same-opening A/B/A evidence. */
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
    const arms=['control','bilateral-multi-basic-retreat',
      'control-repeat'].map(x=>runArm(x,cards));
    const [a,b,c]=arms;
    const physical=arms.every(x=>x.status!=='native-error'&&
      x.initialFullPhysicalDealSha256===FULL&&
      x.initialSourceDealSha256===SOURCE);
    const repeat=physical&&
      a.status===c.status&&a.actualNativeWinner===c.actualNativeWinner&&
      a.globalTurns===c.globalTurns&&a.nativeActions===c.nativeActions&&
      a.nativeRootLedgerSha256===c.nativeRootLedgerSha256;
    const originalBothGuzmas=arms.every(x=>
      x.sourceGuzmaRoots?.length===1&&
      x.rank1GuzmaRoots?.length===1);
    const actualRetreat=b.retreatAudit?.verifiedPayments===1&&
      b.retreatAudit?.storeRetreatDispatches===1&&
      b.genericAudit?.algorithmSameForBothSeats===true&&
      b.genericAudit?.chosenTypedRetreatsBySeat?.[1]>=1&&
      b.rank1NativeRetreatRoots?.some(x=>x.turnBefore===33);
    const checks={samePhysicalOriginals:physical,
      repeatedControlExactNativeLedger:repeat,
      bothActualSourceGuzmaRoots:originalBothGuzmas,
      genuineNativePaidRetreat:actualRetreat};
    return {
      schema:VERSION,nativePin:PIN,seed:SEED,
      sourceRank:3,sourceSeat:0,referenceRank:1,referenceSeat:1,
      convertedSource60Sha256:hash(cards.source),
      convertedReference60Sha256:hash(cards.candidate),
      registeredArms:arms.map(x=>x.variant),
      checks,checksPass:Object.values(checks).every(Boolean),
      arms,competitivelyQualifiedGames:0,
      qualification:'UNQUALIFIED retrospective selected historical physical deal; no competent opponent admission, paper-complete game engine or 25-minute match clock.'
    };
  }finally{
    for(const [key,value] of old){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}

if(require.main===module){
  try{
    const data=run();
    process.stdout.write(JSON.stringify(data,null,2)+'\n');
    if(!data.checksPass)process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({status:'native-error',
      error:String(error?.stack??error).slice(0,4500),
      competitivelyQualifiedGames:0},null,2)+'\n');
    process.exitCode=1;
  }
}

module.exports={VERSION,runArm,run};
