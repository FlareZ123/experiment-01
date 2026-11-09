'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash,randomUUID}=require('node:crypto');
const registration=require('../../../results/aichi-2026/registrations/agent41-rank3-owner-colored-opening-v1-20261109.json');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {createLivePaperRootReceipts}=require('../../twinleaf/agent36-live-paper-root-receipts.cjs');
const {rootLedger,joinReceiptLedger}=
  require('../agent36-v8-native-paper-root-capture.cjs');

const VERSION='agent41-rank3-one-energy-setup-alternative-native-v1';
const ROOT=path.resolve(__dirname,'../../..');
const sha=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/** Original selected v8 rank3 physical seed, replayed as a historical canary. */
const HISTORICAL_CANARY={
  rank:3,repeat:213,candidateSlot:'A',seed:948758444
};

function makeTrials(groups) {
  return groups.flatMap(group=>registration.contenderIds.map(candidateId=>({
    ...group,candidateId,
    id:[group.rank,group.repeat,group.candidateSlot,candidateId].join(':')
  })));
}

/**
 * Recover the physical original chosen Active from the real native Store
 * setup card selection. No per-policy proposed choice is treated as accepted.
 */
function physicalStartingActive(store,seat) {
  if(!store || !Array.isArray(store.receipts) ||
      !Array.isArray(store.originalPhysicalCards))return null;
  const original=new Map(store.originalPhysicalCards.map(card=>[card.id,card]));
  const matching=store.receipts.filter(root=>
    root.seat===seat && root.action==='ResolvePromptAction' &&
    root.beforePrompts?.some(prompt=>
      prompt.type==='ChooseCardsPrompt' &&
      prompt.message==='CHOOSE_STARTING_POKEMONS'));
  if(matching.length!==1)return null;
  const root=matching[0];
  const selected=root.selected;
  if(!Array.isArray(selected)||selected.length<1)return null;
  const physicalId=selected[0]?.physicalId;
  const card=original.get(physicalId);
  if(!card || card.originalSeat!==seat ||
      !root.afterPositions?.[physicalId]?.startsWith('s'+seat+'.active:'))
    return null;
  return {printing:card.printing,physicalId,
    selectedPrintings:selected.map(s=>original.get(s?.physicalId)?.printing??null),
    selectedCount:selected.length,rootOrdinal:root.actionOrdinal,
    turnBefore:root.turnBefore,confirmedNativeActiveZone:true};
}

/**
 * One unchanged symmetric game-policy cohort under selected control/treatment.
 * @param {boolean} bias Whether the one-Energy self-owned setup rule is active.
 * @param {object[]} trials Registered control/treatment physical deals.
 * @param {Function} [runner] Exact native runner, injectable for pure tests.
 */
function oneArm(bias,trials,runner=runDevelopment) {
  const recorders=new Map(),stores=new WeakMap();
  let native;
  try{
    native=runner({
      actorOnlyComposition:true,sourceIndependentCommonPolicy:true,
      bilateralSpecialEnergyRoot:true,nativeAcceptedTargets:true,
      actorColoredStarterBias:bias,
      nativeRootActionLimit:registration.rootLimit,
      allowExtendedRegisteredNativeRootCap:true,
      allowAdditionalOriginalSourceRanks:true,
      registeredTrials:trials,
      registeredFrameName:VERSION+(bias?'-treatment':'-control')
        +'-rank3-same-original-sixties',
      onRootStoreCreated:(store,trialId)=>{
        assert.equal(typeof trialId,'string');
        assert.ok(!recorders.has(trialId));
        const recorder=createLivePaperRootReceipts(trialId);
        recorder.onRootStoreCreated(store);
        recorders.set(trialId,recorder);
        stores.set(store,recorder);
      },
      onRootActionDispatched:(store,action,ordinal,seat,turn)=>{
        const recorder=stores.get(store);
        assert.ok(recorder);
        recorder.onRootActionDispatched(store,action,ordinal,seat,turn);
      }
    });
  }finally{
    for(const recorder of recorders.values())recorder.close();
  }
  const byId=new Map((native.rows??[]).map(row=>[row.trial?.id,row]));
  return trials.map(trial=>{
    const row=byId.get(trial.id);
    const store=recorders.get(trial.id)?.result()??null;
    const candidateSeat=trial.candidateSlot==='A'?0:1;
    const sourceSeat=1-candidateSeat;
    const joined=joinReceiptLedger(store,row);
    const ledger=row?rootLedger(row):null;
    return {
      trialId:trial.id,retrospectiveCanary:trial.repeat===213,
      candidateId:trial.candidateId,
      seed:trial.seed,candidateSeat,sourceSeat,
      sourceDealFingerprint:row?.sourceDealFingerprint??null,
      fullPhysicalDealFingerprint:row?.fullPhysicalDealFingerprint??null,
      reportedNativeRootCount:row?.rootActionCount??null,
      actualRecordedNativeRoots:store?.acceptedStoreRootCount??null,
      physicalJoin:joined,
      candidateOpening:physicalStartingActive(store,candidateSeat),
      sourceOpening:physicalStartingActive(store,sourceSeat),
      nativeFinished:row?.finished===true,
      nativeWinner:row?.winner??null,
      nativeError:row?.error??null,
      finalPrizes:row?.finalPrizes??null,
      candidateAcceptedAttacks:ledger?.filter(root=>
        root.action==='AttackAction'&&root.playerSlot===candidateSeat).length??null,
      sourceAcceptedAttacks:ledger?.filter(root=>
        root.action==='AttackAction'&&root.playerSlot===sourceSeat).length??null,
      nativeRootLedgerSha256:ledger?sha(ledger):null,
      acceptedRootLedger:ledger,
      // Only frozen physical card identity and prompt receipt needed to audit
      // actual setup selection. The original full Store receipt generator
      // remains available for deeper physical-payment analysis.
      nativeSetupReceipts:store?.receipts?.filter(root=>
        root.beforePrompts?.some(prompt=>
          prompt.message==='CHOOSE_STARTING_POKEMONS')).map(root=>({
            seat:root.seat,ordinal:root.actionOrdinal,turn:root.turnBefore,
            selected:root.selected,
            beforePrompts:root.beforePrompts,
            afterPositions:root.afterPositions
          }))??null,
      competitiveGameQualified:false
    };
  });
}

function run() {
  assert.equal(registration.schema,
    'agent41-original-rank3-owner-starting-attackable-basic-prospective-v1');
  assert.equal(registration.rootLimit,160);
  const future=makeTrials(registration.groups);
  assert.deepEqual(future,registration.registeredTrials);
  const canary=makeTrials([HISTORICAL_CANARY]);
  const trials=[...future,...canary];
  const control=oneArm(false,trials);
  const treatment=oneArm(true,trials);
  const pair=control.map((base,index)=>{
    const improved=treatment[index];
    assert.equal(base.trialId,improved.trialId);
    return {
      trialId:base.trialId,retrospectiveCanary:base.retrospectiveCanary,
      candidateId:base.candidateId,seed:base.seed,
      sourceDealMatched:base.sourceDealFingerprint!==null &&
        base.sourceDealFingerprint===improved.sourceDealFingerprint,
      controlCandidateOpening:base.candidateOpening,
      treatmentCandidateOpening:improved.candidateOpening,
      openingChanged:base.candidateOpening?.physicalId !==
        improved.candidateOpening?.physicalId,
      controlCandidateAttacks:base.candidateAcceptedAttacks,
      treatmentCandidateAttacks:improved.candidateAcceptedAttacks,
      controlNativeFinished:base.nativeFinished,
      treatmentNativeFinished:improved.nativeFinished,
      controlNativeError:base.nativeError,
      treatmentNativeError:improved.nativeError,
      status:'UNQUALIFIED_DEVELOPMENTAL_NATIVE'
    };
  });
  return {
    schema:VERSION,
    observedVendorGitCommit:
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    registrationSha256:sha(registration),registeredProspectiveTrials:future.length,
    historicalCanaryTrials:canary.length,
    actualNativeAttempts:control.length+treatment.length,
    plannedRootLimit:registration.rootLimit,
    successfullyJoinedStoreTapes:[...control,...treatment].filter(row=>
      row.physicalJoin?.status==='EXACT_ROOT_IDENTITY_JOIN').length,
    changedOpeningCases:pair.filter(row=>row.openingChanged).length,
    pair,control,treatment,
    competitivePaperQualifiedGames:0
  };
}

/** Atomic locked local output, against accidental concurrent artifact writers. */
function writeArchive(value,file='artifacts/agent41-rank3-owner-colored-opening-v1.json') {
  const target=path.resolve(ROOT,file);
  const relative=path.relative(ROOT,target);
  assert.ok(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative));
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const lock=target+'.lock',temp=target+'.'+randomUUID()+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try {
    const bytes=JSON.stringify(value,null,2)+'\n';
    fs.writeFileSync(temp,bytes,{flag:'wx'});
    fs.renameSync(temp,target);
    return {file:relative,sha256:createHash('sha256').update(bytes)
      .digest('hex'),bytes:Buffer.byteLength(bytes)};
  }finally {
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

if(require.main===module){
  const result=run();
  const artifact=writeArchive(result);
  process.stdout.write('AGENT41_COLORED_SETUP_NATIVE '+
    JSON.stringify({artifact,schema:result.schema,
      registeredProspectiveTrials:result.registeredProspectiveTrials,
      historicalCanaryTrials:result.historicalCanaryTrials,
      changedOpeningCases:result.changedOpeningCases,
      successfullyJoinedStoreTapes:result.successfullyJoinedStoreTapes,
      nativeAttempts:result.actualNativeAttempts,
      qualified:result.competitivePaperQualifiedGames})+'\n');
}

module.exports={VERSION,HISTORICAL_CANARY,makeTrials,
  physicalStartingActive,oneArm,run,writeArchive};
