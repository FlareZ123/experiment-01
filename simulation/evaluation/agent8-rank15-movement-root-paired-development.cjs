'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const {gitBlobHash}=require('./agent42-strict-profile-preflight.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent8-rank15-movement-root-paired-native-20261101.json';
const REGISTRATION_BLOB='e72eeb19e4a7157f4533fc1ad6337a090ef94695';
const ROSTER='results/aichi-2026/full-decklists.json';
const OUTPUT='agent8-rank15-movement-paired-native';
const VERSION='agent8-rank15-original-receipt-postobserved-setup-recovery-v3';

/** @returns {object} Immutable registered trial and source preflight. */
function preflight(){
  const registrationBytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  assert.equal(gitBlobHash(registrationBytes),REGISTRATION_BLOB,
    'Original CSPRNG development registration changed');
  const registration=JSON.parse(registrationBytes.toString('utf8'));
  assert.equal(registration.schema,
    'agent8-rank15-original-sixty-boolean-public-movement-receipt-paired-development-v1');
  assert.equal(registration.phase,'registered-before-first-native-rank15-game-run');
  const rosterBytes=fs.readFileSync(path.join(ROOT,ROSTER));
  assert.equal(gitBlobHash(rosterBytes),registration.originalSourceRosterBlobSha);
  const roster=JSON.parse(rosterBytes.toString('utf8'));
  const source=roster.decks.find(row=>row.rank===15);
  assert.ok(source);
  assert.equal(source.cards.reduce((n,row)=>n+row.count,0),60);
  assert.equal(source.cards.filter(row=>
    row.name==='Mega Lopunny ex'&&
    row.printing?.set==='PFL'&&String(row.printing?.number)==='84')
    .reduce((n,row)=>n+row.count,0),2);
  const pin=execFileSync('git',['-C',path.join(ROOT,'vendor/twinleaf'),
    'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(pin,registration.enginePin,'Different compiled native vendor revision');
  const groups=new Map();
  assert.equal(registration.trials.length,16);
  for(const trial of registration.trials){
    assert.equal(trial.rank,15);
    assert.ok(trial.candidateSlot==='A'||trial.candidateSlot==='B');
    assert.ok(registration.candidateIds.includes(trial.candidateId));
    assert.ok(Number.isInteger(trial.repeat)&&trial.repeat>=0&&trial.repeat<4);
    assert.equal(registration.seeds[trial.candidateSlot][trial.repeat],trial.seed);
    assert.equal(trial.id,
      [trial.rank,trial.repeat,trial.candidateSlot,trial.candidateId].join(':'));
    const key=[trial.rank,trial.repeat,trial.candidateSlot].join(':');
    const ids=groups.get(key)||[];
    ids.push(trial.candidateId);
    groups.set(key,ids);
  }
  assert.equal(groups.size,8);
  for(const ids of groups.values())
    assert.deepEqual(ids.sort(),registration.candidateIds.slice().sort());
  assert.equal(registration.attemptsPerPolicy,16);
  assert.equal(registration.plannedNativeAttempts,32);
  const sha256=text=>createHash('sha256').update(text).digest('hex');
  return {registration,source,enginePin:pin,
    registrationBlob:REGISTRATION_BLOB,
    rosterBlob:gitBlobHash(rosterBytes),
    trialSetDigest:sha256(JSON.stringify(registration.trials))};
}

/** @param {object} row */
function summaryOf(row){
  const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root
    ?.sameRootProposalChoice;
  const samples=[...(root?.changedSamples??[]),...(root?.samples??[])];
  const matched=new Map();
  for(const receipt of samples){
    if(!Array.isArray(receipt.offers))continue;
    const offers=receipt.offers.filter(offer=>
      offer.source==='payable-printed-attack'&&
      (offer.attackName==='Gale Thrust'||offer.attackName==='Spiky Hopper'));
    if(!offers.length)continue;
    const key=[receipt.seat,receipt.globalTurn,receipt.rootOrdinal].join(':');
    if(!matched.has(key))matched.set(key,{
      seat:receipt.seat,turn:receipt.globalTurn,
      rootOrdinal:receipt.rootOrdinal,baselineKind:receipt.baselineKind,
      selectedKind:receipt.selectedKind,selectedSource:receipt.selectedSource,
      reason:receipt.reason,changed:receipt.changed,
      offers:offers.map(o=>({name:o.attackName,score:o.score,
        printedDamage:o.printedDamage,reason:o.reason}))
    });
  }
  return {
    id:row.trial?.id??null,seed:row.trial?.seed??null,
    status:row.status??(row.finished===true?'engine-terminal':
      row.finished===false?'native-unfinished':'unclassified'),
    finished:row.finished??null,
    winner:row.finished===true?(row.winner??null):null,
    endReason:row.endReason??null,
    error:row.error??null,
    nativeRejectedPlayCard:row.nativeRejectedPlayCard??null,
    // Failed source matches now carry the identical postsetup fingerprint
    // and first native draw receipt inside the archived abort packet.
    sourceDealFingerprint:row.sourceDealFingerprint??
      row.nativeAbortEvidence?.sourceDealFingerprint?.digestSha256??null,
    sourceDealFingerprintProvenance:row.sourceDealFingerprint?
      'normal-game-result':
      row.nativeAbortEvidence?.sourceDealFingerprint?.digestSha256?
        'postfailure-native-abort-evidence':null,
    actualStarterSeat:row.actualStarterSeat??
      row.nativeSetupCoinChoiceReceipt?.firstSeatFromVerifiedDraw??null,
    firstTurnVerified:row.verifiedFirstTurn??
      row.nativeSetupCoinChoiceReceipt?.nativeFirstDrawVerified??null,
    initialGameRootHash:row.rootActionLedgerSha256??null,
    nativeSetupReceiptStatus:row.nativeSetupCoinChoiceReceipt?.status??null,
    physicalStatus:row.physicalZoneQualification?.status??null,
    nativeRootActions:row.rootActionCount??row.rootActionLedger?.length??null,
    sourceAttacks:row.sourceAttackDeclarations??null,
    candidateAttacks:row.candidateAttackDeclarations??null,
    totalActorOwnerRoots:root?.ownerRoots??null,
    offeredRoots:root?.offerRoots??null,
    selectedChangedRoots:root?.changedRoots??null,
    rootAuditSampleLimit:root?.samples?.length??null,
    rootAuditChangedSampleTruncated:root?.truncatedChangedSamples??null,
    rank15PayableAttackSamples:[...matched.values()],
    selectorErrors:root?.selectorErrorRoots??null,
    qualifiedCompetitiveGame:false
  };
}

/** @param {object} control @param {object} treatment */
function compareRows(control,treatment){
  const a=new Map(control.rows.map(row=>[row.trial?.id,row]));
  const b=new Map(treatment.rows.map(row=>[row.trial?.id,row]));
  const pairs=[];
  for(const [id,x] of a){
    const y=b.get(id);
    assert.ok(y,'Missing treated registered ID '+id);
    assert.equal(x.trial?.seed,y.trial?.seed);
    assert.equal(x.trial?.candidateSlot,y.trial?.candidateSlot);
    const left=summaryOf(x),right=summaryOf(y);
    const bothFingerprints=typeof left.sourceDealFingerprint==='string'&&
      typeof right.sourceDealFingerprint==='string';
    const bothNativeSetup=left.nativeSetupReceiptStatus===
      'consistent-accepted-native-setup-and-first-draw'&&
      right.nativeSetupReceiptStatus===
      'consistent-accepted-native-setup-and-first-draw';
    pairs.push({
      id,rank:15,candidateSeat:x.trial.candidateSlot,
      candidateId:x.trial.candidateId,seed:x.trial.seed,
      samePhysicalSourceDeal:bothFingerprints?
        left.sourceDealFingerprint===right.sourceDealFingerprint:null,
      sameActualStarter:
        left.actualStarterSeat!==null&&right.actualStarterSeat!==null?
        left.actualStarterSeat===right.actualStarterSeat:null,
      bothNativeSetupCertified:bothNativeSetup,
      firstNativeRootLedgerDifference:
        left.initialGameRootHash&&right.initialGameRootHash?
          left.initialGameRootHash!==right.initialGameRootHash:null,
      control:left,treatment:right
    });
  }
  assert.equal(pairs.length,16);
  assert.equal(b.size,16);
  return pairs;
}

/** Execute all registered arms under a one-boolean treatment, preserving failures. */
function run(){
  const provenance=preflight();
  const registration=provenance.registration;
  const options={...registration.fixedBothArmOptions,
    allowAdditionalOriginalSourceRanks:true,
    registeredTrials:registration.trials,
    registeredFrameName:registration.schema,
    sameRootPublicEventReceipt:false,
    // Postobserved diagnostic for four previously failed original trials.
    // Printings are captured only after native dispatch fails.
    nativeRejectedActionEvidence:true};
  assert.equal(options.sameRootChoiceApply,true);
  assert.equal(options.actorNaturalEvolutionRoot,true);
  const control=runDevelopment(options);
  const treatment=runDevelopment({...options,sameRootPublicEventReceipt:true});
  assert.equal(control.rows.length,16);
  assert.equal(treatment.rows.length,16);
  assert.equal(control.attempted,16);
  assert.equal(treatment.attempted,16);
  const pairs=compareRows(control,treatment);
  const counts=rows=>rows.reduce((acc,row)=>{
    const s=row.status??(row.finished===true?'engine-terminal':
      row.finished===false?'native-unfinished':'unclassified');
    acc[s]=(acc[s]??0)+1;
    return acc;
  },{});
  const digest=value=>createHash('sha256')
    .update(JSON.stringify(value)).digest('hex');
  const summary={
    version:VERSION,registeredUtc:registration.registeredUtc,
    registrationGitBlob:provenance.registrationBlob,
    rosterGitBlob:provenance.rosterBlob,
    sourceRank:15,sourceArchetype:provenance.source.archetype,
    original60Count:provenance.source.cards.reduce((n,row)=>n+row.count,0),
    pinnedNative:provenance.enginePin,
    researchHeadCommit:process.env.GITHUB_SHA??null,
    registeredSeedGroups:8,expectedAttempts:32,attempts:32,
    controlStatuses:counts(control.rows),
    treatmentStatuses:counts(treatment.rows),
    matchedNonemptySourceDealFingerprints:pairs.filter(p=>
      p.samePhysicalSourceDeal===true).length,
    nonmatchingSourceDealFingerprints:pairs.filter(p=>
      p.samePhysicalSourceDeal===false).length,
    unresolvedSourceDealFingerprints:pairs.filter(p=>
      p.samePhysicalSourceDeal===null).length,
    nativeSetupConsistentPairs:pairs.filter(p=>
      p.bothNativeSetupCertified===true).length,
    missingSetupOrDifferentStarts:pairs.filter(p=>
      p.bothNativeSetupCertified!==true||p.sameActualStarter!==true).length,
    countedRank15AttackOfferSamples:{
      control:pairs.reduce((n,p)=>n+p.control.rank15PayableAttackSamples.length,0),
      treatment:pairs.reduce((n,p)=>n+p.treatment.rank15PayableAttackSamples.length,0)
    },
    changedOwnerRootCounts:{
      control:pairs.reduce((n,p)=>n+(p.control.selectedChangedRoots??0),0),
      treatment:pairs.reduce((n,p)=>n+(p.treatment.selectedChangedRoots??0),0)
    },
    errorRows:{
      control:control.rows.filter(r=>r.status==='engine-error').map(r=>({
        id:r.trial.id,error:r.error,nativeStack:r.nativeStoreCauseStack??null,
        rejected:r.nativeRejectedPlayCard??null
      })),
      treatment:treatment.rows.filter(r=>r.status==='engine-error').map(r=>({
        id:r.trial.id,error:r.error,nativeStack:r.nativeStoreCauseStack??null,
        rejected:r.nativeRejectedPlayCard??null
      }))
    },
    pairs,pairDigestSha256:digest(pairs),
    pairedCompetitiveQualification:false,
    competitivelyQualifiedGames:0,
    verified99Point5:false,
    caveats:[
      'Fixed original rank15 source physical 60 and two candidate physical 60s, developmental native policy only',
      'Unmodified generic owner/opponent prompt continuations may remain unqualified',
      'Source native PFL #84 printing has fullName Mega Lopunny ex M2',
      'No verified Aichi wall clock, skilled policy or paper prompt-completeness gate',
      'Root evidence samples have bounded size; absence in sample is not proof of zero exposure',
      'Changed root offers are not necessarily selected and selection is not proven to be a stronger game strategy'
    ]
  };
  return {raw:{summary,
      controls:{sameRootPublicEventReceipt:false,...control},
      treatments:{sameRootPublicEventReceipt:true,...treatment}},
    summary};
}

/**
 * Exclusive advisory lock + temporary sibling file + atomic rename.
 * A later failure cannot leave a partially written output presented as complete.
 * @param {string} target
 * @param {object} value
 */
function writeJsonAtomically(target,value){
  const destination=path.resolve(process.cwd(),target);
  const lock=destination+'.lock';
  const temporary=destination+'.'+process.pid+'.tmp';
  const handle=fs.openSync(lock,'wx');
  try{
    fs.writeFileSync(temporary,JSON.stringify(value,null,2)+'\n',
      {flag:'wx'});
    fs.renameSync(temporary,destination);
  }finally{
    if(fs.existsSync(temporary))fs.unlinkSync(temporary);
    fs.closeSync(handle);
    fs.unlinkSync(lock);
  }
}

if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const pre=preflight();
    process.stdout.write(JSON.stringify({version:VERSION,
      registrationBlob:pre.registrationBlob,
      pinnedNative:pre.enginePin,
      originalSource:pre.source.archetype,
      preregisteredTrials:pre.registration.trials.length,
      expectedComparativeNativeAttempts:32,
      priorResultScreening:false,qualified:false},null,2)+'\n');
  }else{
    const result=run();
    writeJsonAtomically(OUTPUT+'-raw.json',result.raw);
    writeJsonAtomically(OUTPUT+'-summary.json',result.summary);
    process.stdout.write(JSON.stringify({
      version:VERSION,attempts:result.summary.attempts,
      controlStatuses:result.summary.controlStatuses,
      treatmentStatuses:result.summary.treatmentStatuses,
      matchedInitialSourceDeals:
        result.summary.matchedNonemptySourceDealFingerprints,
      pairedInitialSourceDealMismatches:
        result.summary.nonmatchingSourceDealFingerprints,
      pairedInitialSourceDealMissing:
        result.summary.unresolvedSourceDealFingerprints,
      nativeSetupConsistentPairs:
        result.summary.nativeSetupConsistentPairs,
      rank15AttackOfferSampleCounts:
        result.summary.countedRank15AttackOfferSamples,
      changedOwnerRootCounts:
        result.summary.changedOwnerRootCounts,
      errorRows:result.summary.errorRows,
      pairRows:result.summary.pairs.map(p=>({
        id:p.id,sameSource:p.samePhysicalSourceDeal,sameStarter:p.sameActualStarter,
        control:{status:p.control.status,finished:p.control.finished,
          winner:p.control.winner,root:p.control.nativeRootActions,
          offered:p.control.rank15PayableAttackSamples,
          changed:p.control.selectedChangedRoots},
        treatment:{status:p.treatment.status,finished:p.treatment.finished,
          winner:p.treatment.winner,root:p.treatment.nativeRootActions,
          offered:p.treatment.rank15PayableAttackSamples,
          changed:p.treatment.selectedChangedRoots}
      })),
      competitiveQualifiedGames:0
    })+'\n');
  }
}
module.exports={VERSION,preflight,run,summaryOf,compareRows,writeJsonAtomically};
