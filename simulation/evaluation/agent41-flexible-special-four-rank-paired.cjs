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

const BASE=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/'+
  'agent41-flexible-special-r4-r10-r12-r17-20261030.json';
const MIXED_NONREG_REGISTRATION='results/aichi-2026/registrations/'+'agent41-nonreg-mixed-energy-r9-r15-r19-r26-20261030.json';
const ORIGINAL=path.join(BASE,
  'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json');
const VERSION='agent41-flexible-special-original-four-rank-bilateral-paired-v1';
const enginePin='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const digest=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');
const native=path.join(BASE,'vendor/twinleaf/ptcg-server/output');
const {Store}=require(path.join(native,'game/store/store'));

/**
 * Load exact preregistered seed cells and immutable original source inventory.
 * All eight deal specifications are inspected before running any game.
 * @returns {{registration:object,source:object,plan:object,originalFlags:object, trials:object[]}}
 */
function prepare(options={}){
  const cohort=options.cohort??'original-four';
  assert.ok(['original-four','nonreg-mixed'].includes(cohort));
  const registrationPath=cohort==='nonreg-mixed'?MIXED_NONREG_REGISTRATION:REGISTRATION;
  const reg=JSON.parse(fs.readFileSync(path.join(BASE,registrationPath),'utf8'));
  const archive=JSON.parse(fs.readFileSync(ORIGINAL,'utf8'));
  if(cohort==='original-four'){
    assert.equal(reg.schema,
      'agent41-original-source-flexible-special-four-rank-two-seat-paired-v1');
    assert.deepEqual(reg.source_ranks,[4,10,12,17]);
  }else{
    assert.equal(reg.schema,
      'agent41-mixed-energy-original-four-rank-two-seat-factorial-v1');
    assert.deepEqual(reg.source_ranks,[9,15,19,26]);
  }
  assert.equal(reg.engine_pin,enginePin);
  assert.equal(reg.sample_size,16);
  assert.equal(reg.action_cap,260);
  assert.equal(archive.enginePin,enginePin);
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.engineRevision,enginePin);
  assert.equal(plan.candidate.cards?.length,60);
  const ranked=JSON.parse(fs.readFileSync(path.join(BASE,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const trials=[];
  for(const rank of reg.source_ranks){
    const original=ranked.decks.find(deck=>deck.rank===rank);
    assert.ok(original,'Unpublished original source rank: '+rank);
    assert.equal(original.cards.reduce((s,card)=>s+card.count,0),60);
    const source=plan.opponents.find(deck=>deck.rank===rank);
    assert.equal(source.status,'ready','Exact source printing unresolved');
    assert.equal(source.cards.length,60);
    for(const candidateSlot of ['A','B']){
      const seed=reg.seeds[String(rank)]?.[candidateSlot];
      assert.ok(Number.isSafeInteger(seed)&&seed>=0&&seed<=0xffffffff);
      trials.push({id:rank+':'+candidateSlot,rank,candidateSlot,seed,
        archetype:original.archetype,
        opponentSourceFingerprint:digest(source.cards)});
    }
  }
  assert.equal(trials.length,8);
  assert.equal(new Set(trials.map(trial=>trial.seed)).size,8);
  return {registration:reg,registrationPath,cohort,source:ranked,plan,
    originalFlags:archive.frozenFlags,trials};
}

/**
 * Run two unchanged physical decks with the *same* information-limited
 * owner-root policy on both seats. All native fallback and source-specific
 * strategy remains explicitly unqualified. Native Store witnesses are
 * separated into their own audit channels rather than inferred from intents.
 *
 * @param {object} trial
 * @param {object} prepared
 * @param {boolean} treated Enable owner-public flexible Special Energy, or
 *   the immediate Special-over-Basic contest in the registered third profile.
 * @param {'public-context'|'contest'} [mode] Preregistered factorial.
 * @returns {object}
 */
function runOne(trial,prepared,treated,mode='public-context'){
  assert.ok(['public-context','contest'].includes(mode));
  const candidate=prepared.plan.candidate.cards;
  const source=prepared.plan.opponents.find(deck=>deck.rank===trial.rank).cards;
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const sourceSeat=1-candidateSeat;
  const deckA=candidateSeat===0?candidate:source;
  const deckB=candidateSeat===1?candidate:source;
  const request={
    ...prepared.originalFlags,
    deckA,deckB,seed:trial.seed,maxActions:260,
    label:VERSION+'-'+prepared.cohort+'-'+mode+'-'+trial.id+'-'+(treated?'treatment':'control'),
    mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialSourceDealFingerprintSeat:sourceSeat,
    captureInitialFullPhysicalDeal:true,
    capturePublicAttackTransitions:true,
    captureFinalPublicBoard:true,
    captureNativeAbortEvidence:true
  };
  let nativeTargetAudit=null,nativeEnergyPromptAudit=null;
  let sameTargetAudit=null,paperSupporterAudit=null;
  const core=()=>{
    const paper=withNativePaperSupporterDiscipline(()=>{
      const observed=withAcceptedTargetWitness(()=>{
        const witness=withAcceptedEnergyPromptPublicWitness(()=>{
          const same=withSameTargetAttachEnergySelection(()=>
            runMatch(request));
          sameTargetAudit=same.audit;
          return same.result;
        },{Store});
        nativeEnergyPromptAudit=witness.audit;
        return witness.result;
      },{Store});
      nativeTargetAudit=observed.audit;
      return observed.result;
    });
    paperSupporterAudit=paper.audit;
    return paper.result;
  };
  const actor=withCanonicalActorOnlyPolicy(core,{
    root:work=>withActorOnlyRootPolicy(work,{
      publicContextSpecialEnergy:mode==='contest'||treated,
      publicFlexibleEnergyContest:mode==='contest'&&treated,
      specialEnergyRoot:false,specialEnergyRootOwnerSeat:null,
      beforeAttackDenial:false,terminalArbitration:false,
      teamFlareGruntDenialRoot:false,
      naturalEvolutionRoot:true,
      quickBallRoot:true,mysteriousTreasureRoot:true,
      energyRecipientFrontier:true,energyFrontier:true,
      lowHandLillieRoot:true,
      heldGuzmaMobility:true
    })
  },{
    ownerSingleSearch:true,
    actorChoosePokemon:true,
    actorHandDiscard:true,
    genericFallbackAttribution:true
  });
  const game=actor.result;
  assert.equal(game.seed,trial.seed);
  assert.equal(game.engine,'twinleafgg/'+enginePin);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.promptValidationMode,'predispatch-prompt-validate');
  assert.equal(game.initialFullPhysicalDealFingerprint?.schema,
    'initial-full-physical-deal-sha256-v1');
  assert.equal(nativeTargetAudit?.observedLiveStore,true);
  assert.equal(nativeEnergyPromptAudit?.observedLiveStore,true);
  const roots=game.rootActionLedger??[];
  const root=actor.audit.detailedComponentAudits?.root;
  assert.ok(root);
  assert.equal(root.actualGamesSeen,1);
  assert.equal(root.publicContextSpecialEnergyOptIn,
    mode==='contest'||treated);
  assert.equal(root.publicFlexibleEnergyContestOptIn===true,
    mode==='contest'&&treated);
  assert.equal(actor.audit.qualification.competitiveGames,0);
  return {
    status:game.finished?'native-terminal-unqualified':'native-capped-unqualified',
    trial,treated,mode,candidateSeat,sourceSeat,
    initialSourceDealSha256:game.initialSourceDealFingerprint?.digestSha256??null,
    initialFullDealSha256:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
    candidateSixtySha256:digest(candidate),
    sourceSixtySha256:digest(source),
    deckHashes:game.deckHashes??null,
    actualFirstPlayer:game.firstTurnSlot,
    engine:game.engine,
    nativeSupporterQuotaQualified:paperSupporterAudit?.nativeSupporterQuotaQualified,
    actualActions:game.actions,turns:game.turns,
    nativeWinner:game.finished?game.winner:null,
    nativeEndReason:game.endReason,
    finalPublicBoard:game.finalPublicBoard??null,
    publicAttackDeclarations:game.attackDeclarationTrace?.map(row=>({
      turn:row.turnBefore,seat:row.playerSlot,
      attackName:row.attackName
    }))??[],
    ownerRootAudit:{
      total:root.selectedRootDecisions,accepted:root.acceptedActorRoots,
      rejected:root.rejectedActorRoots,
      intentCounts:root.typedIntentCounts,
      acceptedPhysical:root.nativePhysicalConfirmed,
      unconfirmedPhysical:root.nativePhysicalUnconfirmed,
      acceptedPhysicalByIntent:root.nativePhysicalConfirmedByIntent,
      unconfirmedPhysicalByIntent:root.nativePhysicalUnconfirmedByIntent,
      acceptancesSample:root.nativeRootAcceptances,
      ownerRootIntents:root.ownerRootIntents
    },
    actorQualification:actor.audit.qualification,
    nativeTargetSidecar:nativeTargetAudit,
    nativeEnergyPromptSidecar:nativeEnergyPromptAudit,
    sameTargetEnergyAudit:sameTargetAudit,
    nativeSupporterAudit:paperSupporterAudit,
    rootActionLedger:roots,
    competitiveQualified:false
  };
}

/** @param {object} a @param {object} b @returns {object} */
function compare(a,b){
  assert.equal(a.trial.id,b.trial.id);
  const validSha=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
  const matching=[a,b].every(row=>
    row.status==='native-terminal-unqualified'||
    row.status==='native-capped-unqualified');
  const sameDeal=matching&&validSha(a.initialFullDealSha256)&&
    validSha(b.initialFullDealSha256)&&
    a.initialFullDealSha256===b.initialFullDealSha256;
  const sameSource=matching&&validSha(a.initialSourceDealSha256)&&
    validSha(b.initialSourceDealSha256)&&
    a.initialSourceDealSha256===b.initialSourceDealSha256;
  const sameFirst=matching&&[0,1].includes(a.actualFirstPlayer)&&
    a.actualFirstPlayer===b.actualFirstPlayer;
  const sameDecks=matching&&validSha(a.candidateSixtySha256)&&
    validSha(b.candidateSixtySha256)&&
    validSha(a.sourceSixtySha256)&&
    validSha(b.sourceSixtySha256)&&
    a.candidateSixtySha256===b.candidateSixtySha256&&
    a.sourceSixtySha256===b.sourceSixtySha256&&
    a.engine==='twinleafgg/'+enginePin&&a.engine===b.engine;
  const before=matching?a.rootActionLedger:null,
        after=matching?b.rootActionLedger:null;
  const firstChanged=before&&after?Array.from({
    length:Math.max(before.length,after.length)
  },(_,i)=>i).find(i=>JSON.stringify(before[i])!==JSON.stringify(after[i])):null;
  const actorCount=row=>row.ownerRootAudit?
    (row.ownerRootAudit.intentCounts?.['attach-special-energy']??0):null;
  const acceptedCount=row=>row.ownerRootAudit?.acceptancesSample?.
    filter(action=>action.kind==='attach-special-energy'&&
      action.accepted===true).length??null;
  return {
    trial:a.trial,controlStatus:a.status,treatmentStatus:b.status,
    fullDealMatch:Boolean(sameDeal),sourceDealMatch:Boolean(sameSource),
    firstPlayerMatch:Boolean(sameFirst),deckAndEngineMatch:Boolean(sameDecks),
    firstDifferentLedgerIndex:firstChanged===undefined?null:firstChanged,
    controlSpecialSelected:actorCount(a),
    treatmentSpecialSelected:actorCount(b),
    controlSpecialSampleAccepted:acceptedCount(a),
    treatmentSpecialSampleAccepted:acceptedCount(b),
    controlSourceAttacks:a.publicAttackDeclarations?.filter(row=>
      row.seat===a.sourceSeat).length??null,
    treatmentSourceAttacks:b.publicAttackDeclarations?.filter(row=>
      row.seat===b.sourceSeat).length??null,
    controlNativeWinner:a.nativeWinner??null,
    treatmentNativeWinner:b.nativeWinner??null,
    qualifiedCompetitiveOutcome:false
  };
}

/**
 * Any native failure is a typed attempted game. Never drop an attempted cell
 * from the full denominator or claim a pair without physical fingerprints.
 * @param {object} trial
 * @param {object} prepared
 * @param {boolean} treated
 * @param {Function} [runner]
 * @param {'public-context'|'contest'} [mode]
 * @returns {object}
 */
function attempt(trial,prepared,treated,runner=runOne,mode='public-context'){
  try{return runner(trial,prepared,treated,mode);}
  catch(error){
    const {error:message,nativeAbortEvidence, nativeStoreCauseStack}=
      require('../twinleaf/native-dispatch-abort-evidence.cjs')
        .publicNativeAbortError(error);
    return {
      trial,treated,mode,status:'native-error-unqualified',
      error:message,nativeStoreCauseStack,
      nativeAbortEvidence,
      nativeTargetAbort:
        require('../twinleaf/native-accepted-target-store-observer.cjs')
          .acceptedTargetAbortEvidence(error),
      nativeEnergyPromptAbort:
        require('../twinleaf/accepted-energy-prompt-public-witness.cjs')
          .acceptedEnergyPromptPublicAbortEvidence(error),
      nativeSupporterQuotaAbort:error.paperSupporterQuotaEvidence??null,
      competitiveQualified:false
    };
  }
}

/** @param {{rank?:number}} [options] @returns {object} */
function runStudy(options={}){
  const mode=options.mode??'public-context';
  assert.ok(['public-context','contest'].includes(mode));
  const cohort=options.cohort??'original-four';
  const prepared=prepare({cohort});
  const selected=options.rank===undefined?prepared.trials:
    prepared.trials.filter(trial=>trial.rank===options.rank);
  assert.ok(selected.length>0,'No preregistered original source');
  const rows=selected.map(trial=>{
    const control=attempt(trial,prepared,false,runOne,mode);
    const treatment=attempt(trial,prepared,true,runOne,mode);
    return {trial,comparison:compare(control,treatment),control,treatment};
  });
  const comparisons=rows.map(row=>row.comparison);
  return {
    schema:VERSION+'-'+mode,
    registration:cohort==='nonreg-mixed'?MIXED_NONREG_REGISTRATION:mode==='contest'?
      'results/aichi-2026/registrations/'+
        'agent41-flexible-energy-contest-r4-r10-r12-r17-20261030.json':REGISTRATION,
    comparisonMode:mode,cohort,
    fieldSource:prepared.source.source,
    candidate:'unmodified original rank1 Shadow Rider full 60',
    opponentRanks:[...new Set(selected.map(trial=>trial.rank))],
    attempts:rows.length*2,expectedAttempts:rows.length*2,
    pairedPhysicalStarts:comparisons.filter(row=>
      row.fullDealMatch&&row.sourceDealMatch&&
      row.firstPlayerMatch&&row.deckAndEngineMatch).length,
    sourceAttackControl:comparisons.reduce((s,row)=>
      s+(row.controlSourceAttacks??0),0),
    sourceAttackTreatment:comparisons.reduce((s,row)=>
      s+(row.treatmentSourceAttacks??0),0),
    treatmentSpecialSelections:comparisons.reduce((s,row)=>
      s+(row.treatmentSpecialSelected??0),0),
    treatmentSpecialSampleAcceptedLowerBound:comparisons.reduce((s,row)=>
      s+(row.treatmentSpecialSampleAccepted??0),0),
    nativeErrors:rows.flatMap(row=>[row.control,row.treatment])
      .filter(cell=>cell.status==='native-error-unqualified').length,
    rows,competitiveQualifiedGames:0,winRateCertified:false
  };
}
if(require.main===module){
  const rank=process.env.AGENT41_FLEXIBLE_SPECIAL_RANK?
    Number(process.env.AGENT41_FLEXIBLE_SPECIAL_RANK):undefined;
  const mode=process.env.AGENT41_FLEXIBLE_SPECIAL_STUDY??'public-context';
  const cohort=process.env.AGENT41_FLEXIBLE_SPECIAL_COHORT??'original-four';
  process.stdout.write(JSON.stringify(runStudy({rank,mode,cohort}),null,2)+'\n');
}
module.exports={VERSION,REGISTRATION,MIXED_NONREG_REGISTRATION,prepare,runOne,attempt,compare,runStudy};
