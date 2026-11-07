'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {observedFirstTurn}=require('./aichi-campaign-execute.cjs');
const {withCanonicalActorOnlyPolicy}=require(
  './agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=require(
  '../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=require(
  '../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=require(
  '../twinleaf/same-target-attach-energy-hook.cjs');

const VERSION='agent2-owner-seeker-research-original-rank13-aba-native-v1';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEEDS=Object.freeze([290134,290135]);
const RANK_SOURCE=3,RANK_CANDIDATE=13,ACTION_LIMIT=320;
const VARIANTS=Object.freeze(['control','treatment','control-repeat']);
const hash=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/**
 * Convert both source-original printed 60s without modifying any card.
 * @param {object} [corpus] Fixed original Aichi Top32 source.
 * @returns {{source:string[],candidate:string[]}}
 */
function originalPrintings(corpus=require('../../results/aichi-2026/full-decklists.json')){
  const deck=rank=>corpus.decks.find(d=>d.rank===rank);
  for(const rank of [RANK_SOURCE,RANK_CANDIDATE]){
    const d=deck(rank);
    assert.ok(d&&d.cards.reduce((n,c)=>n+c.count,0)===60,
      'original rank 60 missing');
  }
  assert.equal(deck(RANK_SOURCE).archetype,'Snorlax Stall');
  assert.equal(deck(RANK_CANDIDATE).archetype,'Regidrago');
  const planned=planAichi({
    label:'agent2-original-rank13-owner-seeker-research',
    cards:deck(RANK_CANDIDATE).cards
  },{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=planned.opponents.find(x=>x.rank===RANK_SOURCE);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(planned.candidate.cards.length,60);
  const vc=planned.candidate.cards.filter(x=>x==='VS Seeker PHF');
  const research=planned.candidate.cards.filter(
    x=>x==="Professor's Research JTG");
  assert.equal(vc.length,3);
  assert.equal(research.length,3);
  return {source:source.cards,candidate:planned.candidate.cards};
}

/** @returns {object[]} Frozen rank-13/3 two-seat, two-seed, A/B/A profile. */
function schedule(){
  return [0,1].flatMap(candidateSeat=>
    SEEDS.flatMap(seed=>VARIANTS.map(variant=>({
      seed,candidateSeat,sourceSeat:1-candidateSeat,variant
    }))));
}

/**
 * One genuine Store experiment. Aborts and nonterminal outcomes are retained.
 * @param {object} trial Fixed input schedule entry.
 * @param {object} cards Unaltered original sixty IDs.
 * @returns {object}
 */
function runArm(trial,cards){
  const {seed,candidateSeat,sourceSeat,variant}=trial;
  const optIn=variant==='treatment';
  const request={
    deckA:candidateSeat===0?cards.candidate:cards.source,
    deckB:candidateSeat===1?cards.candidate:cards.source,
    seed,maxActions:ACTION_LIMIT,
    label:'agent2-owner-seeker-research-r13-r3-'+
      [seed,candidateSeat,variant].join('-'),
    strictPromptValidation:true,
    mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialFullPhysicalDeal:true,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    captureDecisionTrace:true,captureNativeAbortEvidence:true,
    capturePublicAttackTransitions:true,captureFinalPublicBoard:true
  };
  try{
    const simulate=()=>withSameTargetAttachEnergySelection(()=>
      runMatch(request)).result;
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(simulate,{
        root:work=>withActorOnlyRootPolicy(work,{
          publicContextSpecialEnergy:true,
          specialEnergyRoot:true,
          seekerResearchRoot:optIn,
          losslessNativeRootJoin:true
        })
      },{ownerSingleSearch:true,genericFallbackAttribution:true}));
    const observed=guarded.result;
    const game=observed.result;
    const root=observed.audit.detailedComponentAudits?.root;
    assert.equal(root?.seekerResearchRootOptIn,optIn,
      'B arm must reach real owner-root opt-in');
    const starts=observedFirstTurn(game);
    const selected=(root?.nativeRootAcceptances??[]).filter(x=>
      ['play-seeker-get-research','play-seeker-recovered-research']
        .includes(x.kind));
    return {
      trial,enginePin:PIN,
      status:game.finished?'engine-terminal':'capped-or-unresolved',
      winner:game.winner??null,endReason:game.endReason??null,
      actionCount:game.actions??null,
      originalSourcePrintingsSha256:hash(cards.source),
      originalCandidatePrintingsSha256:hash(cards.candidate),
      initialFullPhysicalDealSha256:
        game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      initialSourcePhysicalDealSha256:
        game.initialSourceDealFingerprint?.digestSha256??null,
      firstTurnSeat:starts?.firstTurnSlot??null,
      sourceWentFirst:starts?
        starts.firstTurnSlot===sourceSeat:null,
      rootLedgerSha256:game.rootActionLedger?
        hash(game.rootActionLedger):null,
      rootCount:game.rootActionLedger?.length??null,
      selectorEnabled:optIn,
      eligibleResearchRootSelected:
        (root?.typedIntentCounts?.['play-seeker-get-research']??0),
      selectedRecoveredResearch:
        (root?.typedIntentCounts?.['play-seeker-recovered-research']??0),
      selectedRootSamples:selected,
      physicallyAcceptedResearchRootCount:selected.filter(x=>
        x.accepted&&x.nativePhysicalEffect==='confirmed-public-effect').length,
      retrievedResearchPromptsAccepted:root?.seekerResearchPromptsAccepted??0,
      retrievedResearchPromptsProposed:root?.seekerResearchPromptsProposed??0,
      paidNativeRootCount:root?.acceptedActorRoots??null,
      rejectedNativeRootCount:root?.rejectedActorRoots??null,
      nativePaperSupporterVetoes:guarded.audit?.vetoCount??null,
      researchDrawCountNativeCertified:false,
      paperValidWholeGame:false,competitivelyQualified:false
    };
  }catch(error){
    return {trial,enginePin:PIN,
      status:'native-error',
      error:String(error?.stack??error).slice(0,2500),
      paperValidWholeGame:false,competitivelyQualified:false};
  }
}

/**
 * Require repeat controls at exactly the same source physical deal/ledger.
 * @param {object[]} rows All 12 unconditional original native attempts.
 * @returns {object[]} Four A/B/A analyses.
 */
function compare(rows){
  return [0,1].flatMap(candidateSeat=>SEEDS.map(seed=>{
    const [a,b,rep]=VARIANTS.map(variant=>{
      const match=rows.find(row=>row.trial.candidateSeat===candidateSeat&&
        row.trial.seed===seed&&row.trial.variant===variant);
      assert.ok(match);
      return match;
    });
    const available=[a,b,rep].every(row=>
      row.status!=='native-error'&&
      typeof row.initialFullPhysicalDealSha256==='string');
    const samePhysicalDeal=available&&[b,rep].every(row=>
      row.initialFullPhysicalDealSha256===a.initialFullPhysicalDealSha256&&
      row.initialSourcePhysicalDealSha256===a.initialSourcePhysicalDealSha256);
    const controlReplayIdentical=samePhysicalDeal&&
      rep.rootLedgerSha256!==null&&
      a.rootLedgerSha256===rep.rootLedgerSha256&&
      a.status===rep.status&&a.endReason===rep.endReason&&
      a.winner===rep.winner&&a.actionCount===rep.actionCount;
    return {
      candidateSeat,seed,sourceSeat:1-candidateSeat,
      samePhysicalDeal,controlReplayIdentical,
      meaningfulTreatmentComparison:controlReplayIdentical&&
        b.eligibleResearchRootSelected>0&&
        b.retrievedResearchPromptsAccepted>0,
      treatmentResearchItemRoots:b.eligibleResearchRootSelected??null,
      treatmentRecoveredResearchRoots:b.selectedRecoveredResearch??null,
      treatmentResearchPrompts:b.retrievedResearchPromptsAccepted??null,
      controlStatus:a.status,treatmentStatus:b.status,
      controlRepeatStatus:rep.status,
      paperValidFullGames:0,competitivelyQualifiedGames:0
    };
  }));
}

/** @returns {object} Fixed full-field-limited preregistered receipt. */
function run(){
  initializeCards();
  const cards=originalPrintings(),rows=[];
  const keys=['AGENT48_VS_SEEKER_LILLIE_DEV','AGENT8_ACTOR_QUICK_BALL_DEV',
    'AGENT41_OWNER_TERMINAL_ARBITRATION_DEV'];
  const prior=keys.map(k=>[k,process.env[k]]);
  try{
    for(const [k] of prior)process.env[k]='false';
    for(const trial of schedule())rows.push(runArm(trial,cards));
  }finally{
    for(const [k,v] of prior){
      if(v===undefined)delete process.env[k];
      else process.env[k]=v;
    }
  }
  const pairs=compare(rows);
  return {
    version:VERSION,pinnedTwinleaf:PIN,
    seeds:[...SEEDS],rankSource:RANK_SOURCE,
    rankCandidate:RANK_CANDIDATE,actionLimit:ACTION_LIMIT,
    scheduledArms:12,executedArms:rows.length,
    originalSourcePrintingsSha256:hash(cards.source),
    originalCandidatePrintingsSha256:hash(cards.candidate),
    pairs,
    treatmentSelectedItemCount:rows.filter(x=>
      x.trial.variant==='treatment').reduce((n,x)=>
      n+(x.eligibleResearchRootSelected??0),0),
    treatmentAcceptedPromptCount:rows.filter(x=>
      x.trial.variant==='treatment').reduce((n,x)=>
      n+(x.retrievedResearchPromptsAccepted??0),0),
    qualifiedGames:0,rows
  };
}
if(require.main===module){
  const r=run();
  process.stdout.write(JSON.stringify(r,null,2)+'\n');
  if(r.rows.length!==12||r.pairs.some(x=>!x.controlReplayIdentical))
    process.exitCode=1;
}
module.exports={VERSION,SEEDS,RANK_SOURCE,RANK_CANDIDATE,
  ACTION_LIMIT,VARIANTS,originalPrintings,schedule,runArm,compare,run};
