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
const {withAcceptedTargetWitness,acceptedTargetAbortEvidence}=
  require('../twinleaf/native-accepted-target-store-observer.cjs');

const VERSION='agent2-four-fresh-seed-two-seat-bilateral-multi-basic-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEEDS=[3565472974,130758722,3792360798,1654918696];
const MODES=['control','bilateral-multi-basic-retreat','control-repeat'];
const hash=obj=>createHash('sha256').update(JSON.stringify(obj))
  .digest('hex');

/**
 * Fixed original two-deck, both-order game. No rank-dependent
 * Counter-Guzma interventions; only identical canonical owner policy.
 * @param {object} trial Frozen seed, source seat, mode and id.
 * @param {object} cards Original rank3 and rank1 printed 60s.
 * @returns {object} Failure-inclusive native execution.
 */
function runArm(trial,cards){
  const rank3Seat=trial.rank3Seat;
  const deckA=rank3Seat===0?cards.source:cards.candidate;
  const deckB=rank3Seat===0?cards.candidate:cards.source;
  let genericAudit=null,targetAudit=null;
  try{
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(()=>{
        const originalNative=()=>withSameTargetAttachEnergySelection(()=>runMatch({
          deckA,deckB,seed:trial.seed,maxActions:520,
          label:'agent2-fresh-multibasic-'+trial.id,
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
        })).result;
        const native=()=>{
          if(trial.captureTargets!==true)return originalNative();
          const observed=withAcceptedTargetWitness(originalNative);
          targetAudit=observed.audit;
          return observed.result;
        };
        if(trial.mode==='bilateral-skyliner-free-retreat'){
          const {withBilateralSkylinerFreeRetreat}=
            require('../twinleaf/agent2-bilateral-skyliner-free-retreat-bot.cjs');
          const added=withBilateralSkylinerFreeRetreat(native);
          genericAudit=added.audit;
          return added.result;
        }
        if(trial.mode!=='bilateral-multi-basic-retreat')return native();
        const added=withBilateralMultiBasicPaidRetreat(native);
        genericAudit=added.audit;
        return added.result;
      },{root:work=>withActorOnlyRootPolicy(work,{
        publicContextSpecialEnergy:true,specialEnergyRoot:true,
        energyRecipientFrontier:trial.energyRecipient===true
      })},{ownerSingleSearch:true,genericFallbackAttribution:true})
    );
    const game=guarded.result.result;
    const roots=game.rootActionLedger??[];
    const rank1Seat=1-rank3Seat;
    const rank1Roots=roots.filter(x=>x.playerSlot===rank1Seat);
    const rank3Roots=roots.filter(x=>x.playerSlot===rank3Seat);
    const terminal=game.terminalTransition??null;
    return {
      id:trial.id,seed:trial.seed,rank3Seat,rank1Seat,
      mode:trial.mode,status:game.finished?'native-terminal':'native-cap',
      originalSource60Hash:hash(cards.source),
      originalReference60Hash:hash(cards.candidate),
      actualFirstSeat:game.firstTurnSlot??null,
      nativeVerifiedStartByDraw:game.verifiedByDrawLog??null,
      fullDealSha256:
        game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      rank3DealSha256:
        game.initialSourceDealFingerprint?.digestSha256??null,
      actions:game.actions,globalTurns:game.turns,
      winner:game.winner,endReason:game.endReason??null,
      rootLedgerSha256:hash(roots),rootCount:roots.length,
      rootActionLedger:roots,
      rank1RetreatRoots:rank1Roots.filter(x=>x.action==='RetreatAction'),
      rank3RetreatRoots:rank3Roots.filter(x=>x.action==='RetreatAction'),
      rank1AttackCount:rank1Roots.filter(x=>x.action==='AttackAction').length,
      rank3AttackCount:rank3Roots.filter(x=>x.action==='AttackAction').length,
      rank1PassCount:rank1Roots.filter(x=>x.action==='PassTurnAction').length,
      rank3PassCount:rank3Roots.filter(x=>x.action==='PassTurnAction').length,
      nativeTerminal:terminal,
      finalPublicBoard:game.finalPublicBoard??null,
      genericAudit,
      ...(trial.captureTargets===true?{nativeAcceptedTargetSidecar:targetAudit}:{}),
      competitiveGameQualified:false
    };
  }catch(error){
    return {id:trial.id,seed:trial.seed,rank3Seat,
      rank1Seat:1-rank3Seat,mode:trial.mode,status:'native-error',
      error:String(error?.stack??error).slice(0,4800),
      genericAudit,errorAbortProvenance:error?.nativeAbortEvidence??null,
      ...(trial.captureTargets===true?{
        nativeAcceptedTargetSidecar:targetAudit??
          acceptedTargetAbortEvidence(error)}:{}),
      competitiveGameQualified:false};
  }
}

/** @returns {object} Exactly preregistered 24 A/B/A native attempts. */
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
    const groups=[];
    for(const seed of SEEDS){
      for(const rank3Seat of [0,1]){
        const group=[...MODES].map(mode=>
          runArm({seed,rank3Seat,mode,
            id:[seed,rank3Seat,mode].join(':')},cards));
        groups.push({seed,rank3Seat,arms:group});
      }
    }
    const evidence=groups.map(group=>{
      const [a,b,c]=group.arms;
      const matched=group.arms.every(x=>x.status!=='native-error'&&
        x.fullDealSha256!==null&&
        x.fullDealSha256===a.fullDealSha256&&
        x.rank3DealSha256!==null&&
        x.rank3DealSha256===a.rank3DealSha256&&
        x.actualFirstSeat===a.actualFirstSeat);
      const controlRepeat=matched&&
        a.rootLedgerSha256===c.rootLedgerSha256&&
        a.status===c.status&&a.winner===c.winner&&
        a.actions===c.actions&&a.globalTurns===c.globalTurns;
      return {
        seed:group.seed,rank3Seat:group.rank3Seat,
        status:matched&&controlRepeat?'paired-reproducible':
          'unresolved-or-nonidentical',
        matchedOriginalPhysicalDeal:matched,
        repeatedControlLedgerExact:controlRepeat,
        source60Hash:a.originalSource60Hash??null,
        reference60Hash:a.originalReference60Hash??null,
        controlStatus:a.status,treatmentStatus:b.status,
        controlWinner:a.winner??null,treatmentWinner:b.winner??null,
        treatmentOffers:b.genericAudit?.proposedActions??[],
        treatmentRetreatRoots:b.rank1RetreatRoots??[],
        treatmentSourceRetreatRoots:b.rank3RetreatRoots??[]
      };
    });
    const arms=groups.flatMap(x=>x.arms);
    const statuses={};
    for(const arm of arms)
      statuses[arm.status]=(statuses[arm.status]??0)+1;
    const controlsMatched=evidence.every(x=>
      x.status==='paired-reproducible');
    const totalOffers=evidence.reduce((sum,x)=>
      sum+x.treatmentOffers.length,0);
    return {
      version:VERSION,pinnedNativeRevision:PIN,
      originalRank3Source60Sha256:hash(cards.source),
      originalRank1Reference60Sha256:hash(cards.candidate),
      registeredSeeds:SEEDS,
      registeredRank3Seats:[0,1],
      registeredModes:MODES,
      expectedGroups:8,expectedArms:24,actualArms:arms.length,
      statuses,controlsMatched,totalOwnerVisibleNominalRetreatOffers:totalOffers,
      groupEvidence:evidence,arms,
      competitivelyQualifiedGames:0,
      noFieldWinRateInference:true,
      qualification:'DEVELOPMENTAL: two original ranks only, no competent source policy, paper-complete engine or 25-minute adjudication.'
    };
  }finally{
    for(const [key,value] of prior){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  try{
    const data=run();
    process.stdout.write(JSON.stringify(data,null,2)+'\n');
    if(!data.controlsMatched||data.actualArms!==24)process.exitCode=1;
  }catch(error){
    process.stdout.write(JSON.stringify({status:'native-error',
      error:String(error?.stack??error).slice(0,4500),
      competitivelyQualifiedGames:0},null,2)+'\n');
    process.exitCode=1;
  }
}
module.exports={VERSION,SEEDS,MODES,runArm,run};
