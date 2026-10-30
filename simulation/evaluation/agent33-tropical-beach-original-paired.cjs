'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');
const {withAcceptedTargetWitness}=
  require('../twinleaf/native-accepted-target-store-observer.cjs');
const {withAcceptedEnergyPromptPublicWitness}=
  require('../twinleaf/accepted-energy-prompt-public-witness.cjs');
const {withBeachStoreEffectWitness,beachStoreAbortEvidence}=
  require('../twinleaf/agent33-beach-store-effect-witness.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent33-tropical-beach-original-three-rank-20261030.json';
const ORIGINAL='results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json';
const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const VERSION='agent33-native-original-beach-three-rank-paired-v1';
const digest=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');
const sha=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);

/**
 * Preserve a public-safe digest and typed root/seat of a physical conservation
 * exception. Never let a nested native engine error become a censored match.
 */
function settledPhysicalFailure(error){
  const seen=new Set();
  for(let e=error,d=0;e&&typeof e==='object'&&d<16&&!seen.has(e);
    e=e.cause,d++){
    seen.add(e);
    if(e.code!=='TWINLEAF_SETTLED_PHYSICAL_60_VIOLATION')continue;
    const witness=e.physicalConservationWitness??null;
    return {
      code:e.code,
      firstActionOrdinal:witness?.actionOrdinal??null,
      firstTurn:witness?.turn??null,
      firstActingSeat:witness?.actingSeat??null,
      firstActionType:witness?.actionType??null,
      witnessSha256:witness?digest(witness):null,
      completeRawPhysicalWitnessOmitted:true
    };
  }
  return null;
}
/** Account for real completed Store-root integrity without leaking zones. */
function settledPhysicalSummary(physical){
  if(physical?.schema!=='live-headless-physical-zone-integrity-v1')
    return {status:'PHYSICAL_INTEGRITY_UNVERIFIED',
      settledRootsChecked:0,settledRootsWithAnomaly:null};
  const intact=Number.isSafeInteger(physical.settledRootsChecked)&&
    physical.settledRootsChecked>0&&
    physical.settledRootsWithAnomaly===0;
  return {
    status:intact?'SETTLED_PHYSICAL_60_VERIFIED':'PHYSICAL_INTEGRITY_UNVERIFIED',
    settledRootsChecked:physical.settledRootsChecked,
    settledRootsWithAnomaly:physical.settledRootsWithAnomaly,
    firstViolationSha256:physical.firstSettledRootAnomaly?
      digest(physical.firstSettledRootAnomaly):null
  };
}
/**
 * The Store root ledger records card *names* (not exact printings).
 * Only a PlayCardAction with the exact public name is Beach placement.
 * Any other generic PlayCardAction is irrelevant to this observation.
 */
function publicBeachLedgerCounts(roots){
  assert.ok(Array.isArray(roots));
  return {
    nativeStadiumUseActions:roots.filter(row=>
      row.action==='UseStadiumAction').length,
    nativeBeachCardPlacements:roots.filter(row=>
      row.action==='PlayCardAction'&&row.card==='Tropical Beach').length
  };
}

/** Read immutable original human-print inventories before any native trial. */
function prepare(){
  const registration=JSON.parse(fs.readFileSync(
    path.join(ROOT,REGISTRATION),'utf8'));
  const originalFlags=JSON.parse(fs.readFileSync(
    path.join(ROOT,ORIGINAL),'utf8'));
  const field=JSON.parse(fs.readFileSync(
    path.join(ROOT,'results/aichi-2026/full-decklists.json'),'utf8'));
  assert.equal(registration.schema,
    'agent33-tropical-beach-original-three-rank-two-seat-paired-v1');
  assert.equal(registration.engine_pin,ENGINE_PIN);
  assert.equal(registration.max_actions,260);
  assert.equal(registration.candidate_rank,1);
  assert.deepEqual(registration.source_ranks,[3,6,29]);
  assert.equal(originalFlags.enginePin,ENGINE_PIN);
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.engineRevision,ENGINE_PIN);
  assert.equal(plan.candidate.cards.length,60);
  for(const rank of [1,...registration.source_ranks]){
    const original=field.decks.find(d=>d.rank===rank);
    assert.ok(original,'Unauthenticated source rank: '+rank);
    assert.equal(original.cards.reduce((s,card)=>s+card.count,0),60);
    assert.deepEqual(original.cards,
      registration.exact_original_paper_sixties[String(rank)],
      'Original printed sixty drifted after paired preregistration');
    if(rank!==1){
      const converted=plan.opponents.find(deck=>deck.rank===rank);
      assert.equal(converted?.status,'ready','Native source rank unavailable');
      assert.equal(converted.cards.length,60);
    }
  }
  const trials=[];
  for(const rank of registration.source_ranks){
    for(const candidateSlot of ['A','B']){
      const seed=registration.seeds[String(rank)]?.[candidateSlot];
      assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
      trials.push({id:String(rank)+':'+candidateSlot,
        rank,candidateSlot,seed});
    }
  }
  assert.equal(trials.length,6);
  assert.equal(new Set(trials.map(x=>x.seed)).size,6);
  return {registration,originalFlags:originalFlags.frozenFlags,
    field,plan,trials};
}

/**
 * Both original printed sixties remain unchanged. Every source and
 * candidate player uses the exact same shared actor policy in each arm.
 * Only the owner-visible Tropical Beach last-chance flag changes.
 */
function runOne(trial,prepared,treated){
  const {Store}=require(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/output/game/store/store'));
  const source=prepared.plan.opponents
    .find(deck=>deck.rank===trial.rank).cards;
  const candidate=prepared.plan.candidate.cards;
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const sourceSeat=1-candidateSeat;
  const deckA=candidateSeat===0?candidate:source;
  const deckB=candidateSeat===1?candidate:source;
  const request={
    ...prepared.originalFlags,deckA,deckB,seed:trial.seed,
    maxActions:prepared.registration.max_actions,
    label:VERSION+'-'+trial.id+'-'+(treated?'beach':'control'),
    mandatoryOptionFallback:true,enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    captureInitialFullPhysicalDeal:true,captureDecisionTrace:true,
    capturePublicAttackTransitions:true,
    captureFinalPublicBoard:true,captureNativeAbortEvidence:true,
    capturePhysicalZoneIntegrity:true,
    enforceSettledPhysicalZoneIntegrity:true
  };
  let targetAudit=null,energyPromptAudit=null,
    sameTargetAudit=null,supporterAudit=null,beachStoreAudit=null;
  const core=()=>{
    const supp=withNativePaperSupporterDiscipline(()=>{
      const observed=withAcceptedTargetWitness(()=>{
        const witness=withAcceptedEnergyPromptPublicWitness(()=>{
          const beach=withBeachStoreEffectWitness(()=>
            withSameTargetAttachEnergySelection(()=>runMatch(request)),
            {Store});
          beachStoreAudit=beach.audit;
          sameTargetAudit=beach.result.audit;
          return beach.result.result;
        },{Store});
        energyPromptAudit=witness.audit;
        return witness.result;
      },{Store});
      targetAudit=observed.audit;
      return observed.result;
    });
    supporterAudit=supp.audit;
    return supp.result;
  };
  const actor=withCanonicalActorOnlyPolicy(core,{
    root:work=>withActorOnlyRootPolicy(work,{
      publicContextSpecialEnergy:true,publicFlexibleEnergyContest:false,
      specialEnergyRoot:false,specialEnergyRootOwnerSeat:null,
      beforeAttackDenial:false,terminalArbitration:false,
      teamFlareGruntDenialRoot:false,
      naturalEvolutionRoot:true,
      quickBallRoot:true,mysteriousTreasureRoot:true,
      energyRecipientFrontier:true,energyFrontier:true,
      lowHandLillieRoot:true,heldGuzmaMobility:true,
      tropicalBeachLastChance:treated
    })
  },{
    ownerSingleSearch:true,actorChoosePokemon:true,
    actorHandDiscard:true,genericFallbackAttribution:true
  });
  const game=actor.result;
  assert.equal(game.seed,trial.seed);
  assert.equal(game.engine,'twinleafgg/'+ENGINE_PIN);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.promptValidationMode,'predispatch-prompt-validate');
  assert.equal(game.initialFullPhysicalDealFingerprint?.schema,
    'initial-full-physical-deal-sha256-v1');
  assert.equal(targetAudit?.observedLiveStore,true);
  assert.equal(energyPromptAudit?.observedLiveStore,true);
  assert.equal(beachStoreAudit?.observedLiveStore,true);
  const root=actor.audit.detailedComponentAudits?.root;
  assert.ok(root);
  assert.equal(root.actualGamesSeen,1);
  assert.equal(root.tropicalBeachLastChanceOptIn,treated);
  assert.equal(actor.audit.qualification.competitiveGames,0);
  const roots=game.rootActionLedger??[];
  const beachLedger=publicBeachLedgerCounts(roots);
  const physical=settledPhysicalSummary(game.physicalZoneIntegrity);
  assert.equal(physical.status,'SETTLED_PHYSICAL_60_VERIFIED',
    'Completed native trials require intact settled source and candidate 60s');
  assert.equal(beachLedger.nativeStadiumUseActions,
    beachStoreAudit.acceptedStadiumUses,
    'A claimed complete native ledger must account for every Stadium dispatch');
  return {
    status:game.finished?'native-terminal-unqualified':'native-capped-unqualified',
    trial,treated,candidateSeat,sourceSeat,
    engine:game.engine,actualFirstPlayer:game.firstTurnSlot,
    candidateSixtySha256:digest(candidate),
    sourceSixtySha256:digest(source),
    fullDealSha256:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
    sourceDealSha256:game.initialSourceDealFingerprint?.digestSha256??null,
    actions:game.actions,turns:game.turns,
    nativeWinner:game.finished?game.winner:null,
    nativeEndReason:game.endReason,
    ...beachLedger,
    physicalIntegrity:physical,
    nativeBeachEffectSettled:beachStoreAudit.beachDrawAndEndTurnSettled,
    nativeBeachEffectUnsettled:beachStoreAudit.unsettledBeachUses,
    beachStoreAudit,
    beachProposalCounts:{
      play:root.typedIntentCounts?.['play-tropical-beach']??0,
      use:root.typedIntentCounts?.['use-tropical-beach']??0
    },
    beachNativeConfirmed:{
      play:root.nativePhysicalConfirmedByIntent?.['play-tropical-beach']??0,
      use:root.nativePhysicalConfirmedByIntent?.['use-tropical-beach']??0
    },
    rootAudit:{selected:root.selectedRootDecisions,
      accepted:root.acceptedActorRoots,
      rejected:root.rejectedActorRoots,
      acceptanceSample:root.nativeRootAcceptances},
    rootActionLedger:roots,
    actorQualification:actor.audit.qualification,
    targetAudit,energyPromptAudit,sameTargetAudit,supporterAudit,
    competitiveQualified:false
  };
}

/** Preserve failed rows; no status-string prefixes or null-hash pair claims. */
function compare(control,treatment){
  assert.equal(control.trial.id,treatment.trial.id);
  const known=[control,treatment].every(row=>
    row.status==='native-terminal-unqualified'||
    row.status==='native-capped-unqualified');
  const sameDeal=known&&sha(control.fullDealSha256)&&
    sha(treatment.fullDealSha256)&&
    control.fullDealSha256===treatment.fullDealSha256;
  const sameSource=known&&sha(control.sourceDealSha256)&&
    sha(treatment.sourceDealSha256)&&
    control.sourceDealSha256===treatment.sourceDealSha256;
  const sameDecks=known&&sha(control.candidateSixtySha256)&&
    sha(treatment.candidateSixtySha256)&&
    sha(control.sourceSixtySha256)&&sha(treatment.sourceSixtySha256)&&
    control.candidateSixtySha256===treatment.candidateSixtySha256&&
    control.sourceSixtySha256===treatment.sourceSixtySha256&&
    control.engine==='twinleafgg/'+ENGINE_PIN&&
    control.engine===treatment.engine;
  const sameFirst=known&&[0,1].includes(control.actualFirstPlayer)&&
    control.actualFirstPlayer===treatment.actualFirstPlayer;
  const paired=Boolean(sameDeal&&sameSource&&sameDecks&&sameFirst);
  const a=paired?control.rootActionLedger:null;
  const b=paired?treatment.rootActionLedger:null;
  let firstDifferentActionOrdinal=null;
  if(Array.isArray(a)&&Array.isArray(b)){
    const first=Array.from({length:Math.max(a.length,b.length)},(_,i)=>i)
      .find(i=>JSON.stringify(a[i])!==JSON.stringify(b[i]));
    if(first!==undefined)firstDifferentActionOrdinal=
      a[first]?.actionOrdinal??b[first]?.actionOrdinal??null;
  }
  return {
    trial:control.trial,
    controlStatus:control.status,treatmentStatus:treatment.status,
    fullPhysicalDealMatch:Boolean(sameDeal),
    originalSourceDealMatch:Boolean(sameSource),
    printedSixtiesAndEngineMatch:Boolean(sameDecks),
    firstPlayerMatch:Boolean(sameFirst),
    registeredPairedPhysicalStart:paired,
    firstDifferentActionOrdinal,
    controlBeachUses:control.beachProposalCounts?.use??null,
    treatmentBeachUses:treatment.beachProposalCounts?.use??null,
    treatmentBeachNativeConfirmed:
      treatment.beachNativeConfirmed?.use??null,
    treatmentBeachEffectSettled:
      treatment.nativeBeachEffectSettled??null,
    controlWinner:control.nativeWinner??null,
    treatmentWinner:treatment.nativeWinner??null,
    competitivelyQualified:false
  };
}

/** Failures are explicit attempted cells, never silently omitted. */
function attempt(trial,prepared,treated,runner=runOne){
  try{return runner(trial,prepared,treated);}
  catch(error){
    const abort=require('../twinleaf/native-dispatch-abort-evidence.cjs')
      .publicNativeAbortError(error);
    const conservation=settledPhysicalFailure(error);
    return {trial,treated,status:conservation?
      'ENGINE_PHYSICAL_INVALID':'native-error-unqualified',
      physicalFailure:conservation,
      error:abort.error,nativeAbortEvidence:abort.nativeAbortEvidence,
      beachStoreAbort:beachStoreAbortEvidence(error),
      nativeStoreCauseStack:abort.nativeStoreCauseStack,
      competitiveQualified:false};
  }
}

function runStudy(options={}){
  const prepared=prepare();
  const selected=options.rank===undefined?prepared.trials:
    prepared.trials.filter(trial=>trial.rank===options.rank);
  assert.ok(selected.length>0);
  const rows=selected.map(trial=>{
    const control=attempt(trial,prepared,false),
      treatment=attempt(trial,prepared,true);
    return {trial,comparison:compare(control,treatment),control,treatment};
  });
  return {
    schema:VERSION,
    registration:REGISTRATION,
    pinnedEngine:ENGINE_PIN,
    fixedOriginalCandidate:'Aichi rank1 full physical 60',
    sourceRanks:[...new Set(selected.map(x=>x.rank))],
    expectedAttempts:selected.length*2,
    observedAttempts:rows.length*2,
    pairedPhysicalStarts:rows.filter(x=>
      x.comparison.registeredPairedPhysicalStart).length,
    controlsBeachUses:rows.reduce((s,x)=>s+
      (x.comparison.controlBeachUses??0),0),
    treatmentsBeachUses:rows.reduce((s,x)=>s+
      (x.comparison.treatmentBeachUses??0),0),
    treatmentNativeBeachConfirmation:rows.reduce((s,x)=>s+
      (x.comparison.treatmentBeachNativeConfirmed??0),0),
    treatmentNativeBeachDrawAndEndTurnSettled:rows.reduce((s,x)=>s+
      (x.comparison.treatmentBeachEffectSettled??0),0),
    nativeErrors:rows.flatMap(x=>[x.control,x.treatment])
      .filter(x=>x.status==='native-error-unqualified').length,
    enginePhysicalInvalid:rows.flatMap(x=>[x.control,x.treatment])
      .filter(x=>x.status==='ENGINE_PHYSICAL_INVALID').length,
    rows,competitiveQualifiedGames:0,winRateCertified:false
  };
}
if(require.main===module){
  const rank=process.env.AGENT33_BEACH_RANK?
    Number(process.env.AGENT33_BEACH_RANK):undefined;
  process.stdout.write(JSON.stringify(runStudy({rank}),null,2)+'\n');
}
module.exports={VERSION,REGISTRATION,prepare,runOne,
  attempt,compare,runStudy,publicBeachLedgerCounts,
  settledPhysicalFailure,settledPhysicalSummary};
