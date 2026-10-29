'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const path=require('node:path');
const {runMatch,initializeCards}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {observedFirstTurn}=require('./aichi-campaign-execute.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');

const VERSION='agent41-rank3-printed-original-aba-v3-settled-public-attack';
const SEEDS=Object.freeze([290126,290127]);
const SOURCE_RANK=3, CANDIDATE_RANK=1;
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ACTION_LIMIT=260;

/**
 * Exactly the field's original rank3 and rank1 printed sixties, using the
 * shared canonical conversion and pinned simulator. No card-level inference.
 * @param {object} [corpus] Injected manifest for bounded tests.
 * @returns {object} Original source and candidate engine printings.
 */
function originals(corpus=require('../../results/aichi-2026/full-decklists.json')){
  const source=corpus.decks.find(d=>d.rank===SOURCE_RANK);
  const candidate=corpus.decks.find(d=>d.rank===CANDIDATE_RANK);
  assert.equal(source?.archetype,'Snorlax Stall');
  assert.equal(candidate?.archetype,'Shadow Rider Calyrex');
  assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(candidate.cards.reduce((n,c)=>n+c.count,0),60);
  const p=planAichi({label:'agent41-rank3-original-source-check',
    cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=p.opponents.find(o=>o.rank===SOURCE_RANK);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  assert.equal(p.candidate.cards.length,60);
  return {candidate:p.candidate.cards,source:opponent.cards};
}

/**
 * No outcome-based selection. Two fixed seeds, both candidate physical seats
 * and A/B/A options produce twelve unconditional original-Store attempts.
 * @returns {object[]}
 */
function schedule(){
  const rows=[];
  for(const seat of [0,1])for(const seed of SEEDS)
    for(const variant of ['control','treatment','control-repeat'])
      rows.push({id:[SOURCE_RANK,seat,seed,variant].join(':'),
        candidateSeat:seat,sourceSeat:1-seat,seed,variant});
  assert.equal(rows.length,12);
  return rows;
}

const digest=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');

/**
 * Policy uses the same owner-derived options in each real seat. Original bot
 * prompt and fallback limitations remain visible; never infer win strength.
 * @param {object} trial
 * @param {object} cards Original converted 60-card printings.
 * @returns {object} Native Store result and decision audit.
 */
function executeOne(trial,cards){
  const {candidateSeat,sourceSeat,seed,variant}=trial;
  const enabled=variant==='treatment';
  const request={
    deckA:candidateSeat===0?cards.candidate:cards.source,
    deckB:candidateSeat===1?cards.candidate:cards.source,
    seed,maxActions:ACTION_LIMIT,
    label:'agent41-original-rank3-actor-'+trial.id,
    strictPromptValidation:true,
    mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureDecisionTrace:true,
    captureInitialFullPhysicalDeal:true,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    captureNativeAbortEvidence:true,
    captureFinalPublicBoard:true,
    capturePublicAttackTransitions:true
  };
  try{
    const simulate=()=>
      withSameTargetAttachEnergySelection(()=>runMatch(request)).result;
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(simulate,{
        root:work=>withActorOnlyRootPolicy(work,{
          terminalArbitration:enabled,
          publicContextSpecialEnergy:true,
          specialEnergyRoot:true
        })
      },{ownerSingleSearch:true,genericFallbackAttribution:true}));
    const observed=guarded.result;
    const game=observed.result;
    const verifiedStart=observedFirstTurn(game);
    const root=observed.audit.detailedComponentAudits?.root;
    assert.equal(root?.terminalArbitrationOptIn===true,enabled);
    assert.equal(root?.publicContextSpecialEnergyOptIn,true);
    const candidates=root?.terminalArbitration?.samples??[];
    const conflicts=candidates.filter(sample=>
      sample.baselineKind!==sample.selectedKind).map(sample=>{
      const rootOrdinal=sample.rootOrdinal;
      const roots=root?.nativeRootAcceptances??[];
      const selected=roots.find(r=>r.policyDecisionOrdinal===rootOrdinal);
      const sameTurnFollowups=roots.filter(r=>
        r.seat===sample.seat&&r.globalTurn===sample.globalTurn&&
        r.policyDecisionOrdinal>rootOrdinal).slice(0,4);
      const opponentReplies=roots.filter(r=>
        r.seat!==sample.seat&&r.globalTurn>sample.globalTurn)
        .slice(0,4);
      const declarations=(game.attackDeclarationTrace??[]).filter(d=>
        d.playerSlot===sample.seat&&
        d.turnBefore===sample.globalTurn).slice(0,4);
      const publicSettlements=(game.publicAttackTransitions??[]).filter(d=>
        d.triggerPlayerSlot===sample.seat&&
        d.turnBefore===sample.globalTurn).slice(0,4);
      const sourceTurnLedger=(game.rootActionLedger??[]).filter(event=>
        event.playerSlot===sample.seat&&
        event.turnBefore===sample.globalTurn).slice(0,12);
      const replyLedger=(game.rootActionLedger??[]).filter(event=>
        event.playerSlot!==sample.seat&&
        event.turnBefore>sample.globalTurn).slice(0,8);
      return {
        sample,selectedRoot: selected??null,
        nativeSameTurnFollowupRoots:sameTurnFollowups,
        nativeOpponentFollowingRoots:opponentReplies,
        nativePrintedAttackDeclarations:declarations,
        nativePublicAttackSettlements:publicSettlements,
        realStoreOwnTurnLedger:sourceTurnLedger,
        realStoreOpponentReplyLedger:replyLedger,
        postgameOnly:true
      };
    });
    return {trial,enginePin:PIN,
      sourceDeckPrintingsSha256:digest(cards.source),
      candidateDeckPrintingsSha256:digest(cards.candidate),
      fullPhysicalDealFingerprint:
        game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      sourceDealFingerprint:
        game.initialSourceDealFingerprint?.digestSha256??null,
      actualStarterSeat:verifiedStart?.firstTurnSlot??null,
      sourceActuallyFirst:verifiedStart?
        verifiedStart.firstTurnSlot===sourceSeat:null,
      firstStartVerified:verifiedStart!==null,
      status:game.finished?'engine-terminal':'capped-or-unresolved',
      winner:game.winner??null,actionCount:game.actions??null,
      engineEndReason:game.endReason??null,
      rootActionLedgerSha256:game.rootActionLedger?
        digest(game.rootActionLedger):null,
      rootActionCount:game.rootActionLedger?.length??null,
      attackDeclarationCount:game.attackDeclarationTrace?.length??null,
      actorPolicyVersion:observed.audit.version,
      rootPolicyVersion:root?.version??null,
      arbitrationEnabled:enabled,
      arbitrationRootCount:root?.terminalArbitration?.ownerRoots??null,
      arbitrationChangedRoots:root?.terminalArbitration?.changedRoots??0,
      arbitrationBySeat:root?.terminalArbitration?.bySeat??null,
      arbitrationReasons:root?.terminalArbitration?.reasons??null,
      arbitrationSamples:candidates,
      arbitratedNativeContinuationWindows:conflicts,
      nativeAccepted:root?.acceptedActorRoots??0,
      nativeRejected:root?.rejectedActorRoots??0,
      nativeRootAcceptances:root?.nativeRootAcceptances??[],
      paperSupporterVetoCount:guarded.audit?.vetoCount??null,
      competitiveQualified:false};
  }catch(error){
    return {trial,enginePin:PIN,status:'native-error',
      error:String(error?.stack??error).slice(0,2000),
      arbitrationEnabled:enabled,
      competitiveQualified:false};
  }
}

/**
 * Compare only original same-deck, same-seed and same-physical-deal records;
 * absent evidence and native aborts remain explicit incomparable states.
 * @param {object[]} rows All attempts.
 * @returns {object[]} Four paired snapshots.
 */
function compare(rows){
  return [0,1].flatMap(seat=>SEEDS.map(seed=>{
    const trio=['control','treatment','control-repeat'].map(kind=>{
      const row=rows.find(r=>r.trial.candidateSeat===seat&&
        r.trial.seed===seed&&r.trial.variant===kind);
      assert.ok(row);return row;
    });
    const [a,b,rep]=trio;
    const valid=trio.every(r=>r.status!=='native-error'&&
      typeof r.fullPhysicalDealFingerprint==='string');
    const fullDealMatches=valid&&trio.every(r=>
      r.fullPhysicalDealFingerprint===a.fullPhysicalDealFingerprint);
    const repeatIdentical=fullDealMatches&&
      a.status===rep.status&&a.winner===rep.winner&&
      a.actionCount===rep.actionCount&&
      digest(a.nativeRootAcceptances)===digest(rep.nativeRootAcceptances)&&
      a.rootActionLedgerSha256!==null&&
      a.rootActionLedgerSha256===rep.rootActionLedgerSha256;
    const firstDifferentRootIndex=fullDealMatches?
      Array.from({length:Math.min(a.nativeRootAcceptances.length,
        b.nativeRootAcceptances.length)},(_,i)=>i).find(i=>{
        const x=a.nativeRootAcceptances[i],y=b.nativeRootAcceptances[i];
        return x.kind!==y.kind||x.seat!==y.seat||
          x.globalTurn!==y.globalTurn||
          JSON.stringify(x.intent)!==JSON.stringify(y.intent);
      })??null:null;
    const firstDifferentRoot=firstDifferentRootIndex===null?null:{
      ordinalZeroBased:firstDifferentRootIndex,
      control:a.nativeRootAcceptances[firstDifferentRootIndex],
      treatment:b.nativeRootAcceptances[firstDifferentRootIndex],
      verifiedCommonPreviousRoots:firstDifferentRootIndex
    };
    return {candidateSeat:seat,sourceSeat:1-seat,seed,
      firstDifferentRoot,
      status:fullDealMatches?'same-full-physical-start':'unverified-or-different',
      repeatStatus:repeatIdentical?'identical-observed-repeat':'unverified-or-different',
      sourceFirst:[a.sourceActuallyFirst,b.sourceActuallyFirst,rep.sourceActuallyFirst],
      baselineStatus:a.status,treatmentStatus:b.status,
      baselineWinner:a.winner,treatmentWinner:b.winner,
      baselineActions:a.actionCount,treatmentActions:b.actionCount,
      treatmentChangedRoots:b.arbitrationChangedRoots??null,
      results:trio.map(r=>r.status)};
  }));
}

/** @returns {object} Full unconditional original-Store development packet. */
function run(){
  initializeCards();
  const cards=originals();
  const trials=schedule();
  const savedEnv=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const rows=trials.map(t=>executeOne(t,cards));
    const pairs=compare(rows);
    return {schema:VERSION,sourceRank:SOURCE_RANK,
      sourceArchetype:'Snorlax Stall',
      candidateRank:CANDIDATE_RANK,
      candidateArchetype:'Shadow Rider Calyrex',
      originalSourceDeckPrintingsSha256:digest(cards.source),
      originalCandidateDeckPrintingsSha256:digest(cards.candidate),
      enginePin:PIN,seeds:SEEDS,candidateSeats:[0,1],
      actionLimit:ACTION_LIMIT,
      attempted:rows.length,rows,pairs,
      summary:{errors:rows.filter(r=>r.status==='native-error').length,
        terminalGames:rows.filter(r=>r.status==='engine-terminal').length,
        unresolved:rows.filter(r=>r.status==='capped-or-unresolved').length,
        arbitrationChangedRoots:rows.filter(r=>r.arbitrationEnabled)
          .reduce((n,r)=>n+(r.arbitrationChangedRoots??0),0),
        sourceFirst:rows.filter(r=>r.sourceActuallyFirst===true).length,
        comparableFullDeals:pairs.filter(p=>
          p.status==='same-full-physical-start').length,
        repeatIdentical:pairs.filter(p=>
          p.repeatStatus==='identical-observed-repeat').length,
        competitiveQualifiedGames:0},
      limitations:'Fixed new development seeds; weak generic source/candidate prompts and clock; not match win-rate evidence'};
  }finally{
    for(const [key,value] of savedEnv){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={VERSION,SEEDS,originals,schedule,compare,executeOne,run};
