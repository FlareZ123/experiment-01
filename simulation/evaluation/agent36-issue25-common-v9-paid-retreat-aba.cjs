'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash,randomUUID}=require('node:crypto');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');
const {hashRegisteredFile}=require('./agent36-issue25-selected-v0.cjs');
const {runStewardBroaderV8,trials:v8Trials,ROOT_LIMIT:V8_ROOT_LIMIT}=
  require('./agent36-issue25-common-v8.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {withTwoPsychicAnyTargetCustody}=
  require('../twinleaf/agent36-v9-two-psychic-retreat-custody.cjs');
const {join:joinPaidRetreat}=
  require('./agent42-general-paid-retreat-root-audit.cjs');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent36-issue25-common-v9-paid-retreat-aba-128root';
const REGISTRATION_PATH=
  'results/aichi-2026/registrations/agent36-issue25-common-v9-paid-retreat-aba-20261106.json';
const BASE_REGISTRATION_PATH=
  'results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json';
const BASE_REGISTRATION_BLOB='5425749642c0692034f0db79c889b4ee42284b1a';
const HASH_PATHS=[
  'simulation/evaluation/agent36-issue25-common-v9-paid-retreat-aba.cjs',
  REGISTRATION_PATH,
  BASE_REGISTRATION_PATH,
  'simulation/evaluation/agent36-issue25-common-v8.cjs',
  'simulation/evaluation/agent36-issue25-common-v7.cjs',
  'simulation/evaluation/agent36-issue25-selected-v0.cjs',
  'simulation/evaluation/agent41-bilateral-v2-development.cjs',
  'simulation/evaluation/agent42-general-paid-retreat-root-audit.cjs',
  'simulation/twinleaf/agent34-actor-only-root-policy.cjs',
  'simulation/twinleaf/agent42-public-two-unit-paid-retreat-proposal.cjs',
  'simulation/twinleaf/agent36-v9-two-psychic-retreat-custody.cjs',
  'tests/agent36-issue25-common-v9-paid-retreat-aba.test.cjs',
  'tests/agent36-issue25-common-v9-paid-retreat-aba.native.test.cjs',
  'tests/agent36-v9-two-psychic-retreat-custody.test.cjs'
];
const registration=require('../../results/aichi-2026/registrations/agent36-issue25-common-v9-paid-retreat-aba-20261106.json');

/** @param {string} relative @returns {Buffer} */
function bytes(relative){return fs.readFileSync(path.join(ROOT,relative));}

/** Verify the immutable base registration and every v9 frozen input. */
function preflight(){
  const m=registration;
  assert.equal(m.schema,'agent36-issue25-common-v9-paid-retreat-aba-128root-v1');
  assert.equal(m.registeredBeforeFirstNativeAttempt,true);
  assert.equal(m.observedV9AttemptsBeforeRegistration,0);
  assert.equal(m.experimentalType,
    'retrospective same-physical-deal A/B/A common-policy intervention; preregistered before v9 execution; not a fresh win-rate sample');
  assert.equal(gitBlobHash(bytes(BASE_REGISTRATION_PATH)),BASE_REGISTRATION_BLOB);
  assert.equal(m.baseRegistrationGitBlobSha,BASE_REGISTRATION_BLOB);
  const base=JSON.parse(bytes(BASE_REGISTRATION_PATH).toString('utf8'));
  assert.equal(base.pinnedTwinleaf,m.pinnedTwinleaf);
  assert.equal(base.maxNativeRootActionsPerArm,V8_ROOT_LIMIT);
  assert.equal(V8_ROOT_LIMIT,128);
  assert.deepEqual(m.groups,base.groups);
  assert.deepEqual(m.trials,base.trials);
  assert.deepEqual(m.trials,v8Trials());
  assert.deepEqual(m.sourceOriginalRanks,[6,11,1,3]);
  assert.equal(m.trials.length,8);
  assert.equal(m.expectedCandidateContexts,8);
  assert.equal(m.expectedNativeAttempts,24);
  assert.deepEqual(m.modes.map(x=>[
    x.id,x.actorTwoUnitPaidRetreatRoot,x.actorTwoUnitPaidRetreatTargetTurn
  ]),[
    ['A-v8-control',false,null],
    ['B-common-paid-retreat',true,null],
    ['A-repeat-control',false,null]
  ]);
  assert.ok(m.frozenInputs.length===HASH_PATHS.length-1);
  const expectedPaths=HASH_PATHS.filter(p=>p!==REGISTRATION_PATH).sort();
  assert.deepEqual(m.frozenInputs.map(x=>x.path).sort(),expectedPaths);
  for(const item of m.frozenInputs){
    assert.match(item.gitBlobSha,/^[a-f0-9]{40}$/);
    assert.equal(gitBlobHash(bytes(item.path)),item.gitBlobSha,
      'Frozen v9 source changed: '+item.path);
  }
  return m;
}

/** @param {object} row @param {0|1} seat @param {object} custody */
function paidRetreatEvidence(row,seat,custody){
  if(!Array.isArray(row.rootActionLedger))return null;
  const audit=joinPaidRetreat(row,seat);
  const evidence=(audit.evidence??[]).map(item=>{
    const matches=(custody?.receipts??[]).filter(receipt=>
      receipt.status==='EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT_ANY_TARGET'&&
      receipt.seat===item.sourceSeat&&receipt.turn===item.globalTurn&&
      receipt.benchIndex===item.benchIndex&&
      receipt.sourcePrinting===item.sourcePrinting&&
      receipt.promotedPrinting===item.targetPrinting);
    const attack=row.sourceAttackSettlement?.attacks?.find(a=>
      a.actionOrdinal===item.nextSettledSourceAttackOrdinal)??null;
    return {
      ...item,
      physicalCustodyMatchCount:matches.length,
      physicalCustodyBoundToThisRoot:matches.length===1,
      physicalCustody:matches.length===1?matches[0]:null,
      sameEpochOpponentReply:attack?.nextSourceSameEpochProven===true,
      nextSourceRoot:attack?.nextSourceRoot??null,
      attackDamage:attack?.damage??null
    };
  });
  return {...audit,evidence};
}

/** @param {object} row @param {object} custody */
function summarizeRow(row,custody){
  const trial=row.trial??{};
  const sourceSeat=row.sourceSeat??(trial.candidateSlot==='A'?1:0);
  const candidateSeat=row.candidateSeat??(1-sourceSeat);
  const roots=Array.isArray(row.rootActionLedger)?row.rootActionLedger:[];
  const sourceRoots=roots.filter(root=>root.playerSlot===sourceSeat);
  const candidateRoots=roots.filter(root=>root.playerSlot===candidateSeat);
  const attacks=row.sourceAttackSettlement?.attacks??[];
  return {
    id:trial.id??row.id??null,
    rank:trial.rank??null,
    candidateId:trial.candidateId??null,
    sourceSeat,candidateSeat,
    status:row.status??'returned-unqualified',
    acceptedRootCount:Array.isArray(row.rootActionLedger)?
      row.rootActionLedger.length:null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
    actualStarterSeat:row.actualStarterSeat??null,
    sourceRetreatActionRoots:sourceRoots.filter(x=>
      x.action==='RetreatAction').length,
    candidateRetreatActionRoots:candidateRoots.filter(x=>
      x.action==='RetreatAction').length,
    sourceAttackDeclarations:attacks.length,
    settledSourceAttacks:attacks.filter(x=>
      x.settledPromptChain===true).length,
    sourcePrizeCountBefore:row.prizesBefore??null,
    finalPrizes:row.finalPrizes??null,
    nativeFinished:row.finished===true,
    nativeWinner:row.winner??null,
    nativeError:row.error??null,
    sourcePaidRetreatAudit:paidRetreatEvidence(row,sourceSeat,custody),
    candidatePaidRetreatAudit:paidRetreatEvidence(row,candidateSeat,custody),
    paperQualifiedGame:false
  };
}

/** @param {object} mode @param {object} deps */
function runPhase(mode,deps={}){
  const runner=deps.runDevelopment??runDevelopment;
  const runV8=deps.runV8??runStewardBroaderV8;
  const custodyLayer=deps.custodyLayer??withTwoPsychicAnyTargetCustody;
  let custodyAudit=null;
  const execution=runV8({
    env:deps.env,headless:deps.headless,layers:deps.layers,
    attackLayer:deps.attackLayer,ownerLayer:deps.ownerLayer,
    globalVoltLayer:deps.globalVoltLayer,voltLayer:deps.voltLayer,
    runner:options=>{
      assert.equal(options.nativeRootActionLimit,128);
      const observed=custodyLayer(()=>runner({
        ...options,
        actorTwoUnitPaidRetreatRoot:mode.actorTwoUnitPaidRetreatRoot,
        actorTwoUnitPaidRetreatTargetTurn:null
      }),{Store:deps.Store});
      custodyAudit=observed.audit;
      return observed.result;
    }
  });
  const rawRows=execution.rawDevelopment?.rows??[];
  const rows=rawRows.map(row=>summarizeRow(row,custodyAudit));
  const manifest={
    ...execution.manifest,
    version:VERSION,
    policyEntryPoint:HASH_PATHS[0],
    originalSourceRegistration:REGISTRATION_PATH,
    profile:'retrospective-v8-four-rank-common-policy-'+mode.id,
    actorTwoUnitPaidRetreatRoot:mode.actorTwoUnitPaidRetreatRoot,
    actorTwoUnitPaidRetreatTargetTurn:null,
    commonOwnerTwoUnitPaidRetreatRoot:mode.actorTwoUnitPaidRetreatRoot,
    sameAlgorithmBothPhysicalSeats:true,
    fullPolicyOwnerHiddenInformationCertified:false,
    fullPaperCardInteractionCertified:false,
    official25MinuteClockImplemented:false,
    resolvedSourceAndPolicyHashes:[
      ...execution.manifest.resolvedSourceAndPolicyHashes,
      ...HASH_PATHS.map(hashRegisteredFile)
    ],
    releaseQualified:false,competitiveGamesQualified:0
  };
  const diagnostic={
    ...execution.diagnostic,
    schema:VERSION,preregistration:REGISTRATION_PATH,
    mode:mode.id,
    actorTwoUnitPaidRetreatRoot:mode.actorTwoUnitPaidRetreatRoot,
    actorTwoUnitPaidRetreatTargetTurn:null,
    paidRetreatCustodyAudit:custodyAudit,
    actualAttemptRows:rows,
    verdict:'FAIL-retrospective-common-policy-paid-retreat-development-only',
    competitiveGamesQualified:0,estimatedWinRate:null
  };
  return {id:mode.id,actorTwoUnitPaidRetreatRoot:
    mode.actorTwoUnitPaidRetreatRoot,manifest,diagnostic,
    custodyAudit,rows,rawDevelopment:execution.rawDevelopment};
}

/** @param {object} a @param {object} b */
function firstRootDifference(a,b){
  const left=a?.rootActionLedger??[],right=b?.rootActionLedger??[];
  const n=Math.min(left.length,right.length);
  for(let i=0;i<n;i++){
    if(JSON.stringify(left[i])!==JSON.stringify(right[i]))
      return {index:i,ordinalA:left[i]?.actionOrdinal??null,
        ordinalB:right[i]?.actionOrdinal??null,
        actionA:left[i]?.action??null,actionB:right[i]?.action??null,
        playerSlotB:right[i]?.playerSlot??null};
  }
  if(left.length!==right.length)
    return {index:n,ordinalA:left[n]?.actionOrdinal??null,
      ordinalB:right[n]?.actionOrdinal??null,
      actionA:left[n]?.action??null,actionB:right[n]?.action??null,
      playerSlotB:right[n]?.playerSlot??null};
  return null;
}

/** @param {object} a @param {object} b */
function sameOutcome(a,b){
  return a?.status===b?.status&&a?.finished===b?.finished&&
    a?.winner===b?.winner&&
    JSON.stringify(a?.finalPrizes??null)===JSON.stringify(b?.finalPrizes??null)&&
    String(a?.error??'')===String(b?.error??'');
}

/** @param {object[]} phases @param {object} m */
function compare(phases,m){
  const [a,b,a2]=phases;
  const byId=phase=>new Map((phase.rawDevelopment?.rows??[]).map(row=>[
    row.trial?.id??row.id,row
  ]));
  const maps=phases.map(byId);
  return m.trials.map(trial=>{
    const id=trial.id,rows=maps.map(map=>map.get(id)??null);
    const summaries=phases.map(phase=>
      phase.rows.find(row=>row.id===id)??null);
    const [ra,rb,ra2]=rows;
    const [sa,sb,sa2]=summaries;
    const present=rows.every(Boolean);
    const physicalMatch=present&&
      typeof sa?.sourceDealFingerprint==='string'&&
      sa.sourceDealFingerprint===sb?.sourceDealFingerprint&&
      sa.sourceDealFingerprint===sa2?.sourceDealFingerprint&&
      typeof sa?.fullPhysicalDealFingerprint==='string'&&
      sa.fullPhysicalDealFingerprint===sb?.fullPhysicalDealFingerprint&&
      sa.fullPhysicalDealFingerprint===sa2?.fullPhysicalDealFingerprint&&
      sa?.actualStarterSeat===sb?.actualStarterSeat&&
      sa?.actualStarterSeat===sa2?.actualStarterSeat&&
      sa?.sourceSeat===sb?.sourceSeat&&sa?.sourceSeat===sa2?.sourceSeat&&
      sa?.candidateSeat===sb?.candidateSeat&&sa?.candidateSeat===sa2?.candidateSeat;
    const controlDiff=firstRootDifference(ra,ra2);
    const controlsRepeated=present&&controlDiff===null&&
      sameOutcome(ra,ra2)&&
      sa?.rootActionLedgerSha256!==null&&
      sa?.rootActionLedgerSha256===sa2?.rootActionLedgerSha256;
    const treatmentDiff=firstRootDifference(ra,rb);
    const firstTreatmentDiffIsRetreat=treatmentDiff===null||
      treatmentDiff.actionB==='RetreatAction';
    const publicPaidRetreats=sb?.sourcePaidRetreatAudit?.evidence??[];
    const candidatePaidRetreats=sb?.candidatePaidRetreatAudit?.evidence??[];
    return {
      id,rank:trial.rank,candidateId:trial.candidateId,
      physicalOpeningMatchedAcrossABA:physicalMatch,
      controlsRepeatedExactly:controlsRepeated,
      controlRootDifference:controlDiff,
      treatmentRootDifference:treatmentDiff,
      firstTreatmentDifferenceIsRetreat:firstTreatmentDiffIsRetreat,
      sourceRetreatActionRootsB:sb?.sourceRetreatActionRoots??null,
      candidateRetreatActionRootsB:sb?.candidateRetreatActionRoots??null,
      sourcePublicPaidRetreatsB:publicPaidRetreats,
      candidatePublicPaidRetreatsB:candidatePaidRetreats,
      sourcePhysicalCustodyBoundCountB:publicPaidRetreats.filter(x=>
        x.physicalCustodyBoundToThisRoot).length,
      sourcePaidRetreatSettledAttackCountB:publicPaidRetreats.filter(x=>
        x.nextSettledSourceAttackOrdinal!==null).length,
      sourcePaidRetreatPrizeCountB:publicPaidRetreats.filter(x=>
        x.nextSettledAttackTookPrize).length,
      sourcePaidRetreatTerminalWinCountB:publicPaidRetreats.filter(x=>
        x.sourceNativeTerminalWin).length,
      sourcePaidRetreatSameEpochOpponentReplyCountB:publicPaidRetreats.filter(x=>
        x.sameEpochOpponentReply).length,
      candidatePaidRetreatCountB:candidatePaidRetreats.length
    };
  });
}

/** @param {object} phase */
function phaseSummary(phase){
  const rows=phase.rows;
  const sourcePaid=rows.flatMap(x=>
    x.sourcePaidRetreatAudit?.evidence??[]);
  const candidatePaid=rows.flatMap(x=>
    x.candidatePaidRetreatAudit?.evidence??[]);
  return {
    id:phase.id,actorTwoUnitPaidRetreatRoot:phase.actorTwoUnitPaidRetreatRoot,
    registeredReturnedRows:rows.length,
    nativeFinished:rows.filter(x=>x.nativeFinished).length,
    nativeErrors:rows.filter(x=>x.nativeError!==null).length,
    root128Caps:rows.filter(x=>x.acceptedRootCount===128&&
      !x.nativeFinished&&x.nativeError===null).length,
    sourceRetreatActionRoots:rows.reduce((n,x)=>
      n+(x.sourceRetreatActionRoots??0),0),
    candidateRetreatActionRoots:rows.reduce((n,x)=>
      n+(x.candidateRetreatActionRoots??0),0),
    sourcePublicPaidRetreats:sourcePaid.length,
    candidatePublicPaidRetreats:candidatePaid.length,
    sourcePhysicalCustodyBound:sourcePaid.filter(x=>
      x.physicalCustodyBoundToThisRoot).length,
    sourceSettledFollowOnAttacks:sourcePaid.filter(x=>
      x.nextSettledSourceAttackOrdinal!==null).length,
    sourcePrizeTakingFollowOnAttacks:sourcePaid.filter(x=>
      x.nextSettledAttackTookPrize).length,
    sourceNativeTerminalWinsAfterPaidRetreat:sourcePaid.filter(x=>
      x.sourceNativeTerminalWin).length,
    sourceSameEpochOpponentRepliesAfterPaidRetreat:sourcePaid.filter(x=>
      x.sameEpochOpponentReply).length,
    competitiveGamesQualified:0
  };
}

/** Run the frozen A/B/A with no post-result seed or root filtering. */
function run(deps={}){
  const m=preflight();
  const phases=m.modes.map(mode=>runPhase(mode,deps));
  const comparisons=compare(phases,m);
  const summary={
    candidateContexts:m.expectedCandidateContexts,
    nativeAttempts:phases.reduce((n,p)=>n+p.rows.length,0),
    allRegisteredIdsReturned:phases.every(p=>
      p.rows.length===m.expectedCandidateContexts&&
      p.rows.every(row=>m.trials.some(t=>t.id===row.id))),
    allOpeningsMatchedWithinTrial:comparisons.every(x=>
      x.physicalOpeningMatchedAcrossABA),
    controlsRepeatedExactly:comparisons.every(x=>
      x.controlsRepeatedExactly),
    allTreatmentFirstDivergencesAreRetreat:comparisons.every(x=>
      x.firstTreatmentDifferenceIsRetreat),
    treatmentChangedTrialCount:comparisons.filter(x=>
      x.treatmentRootDifference!==null).length,
    phaseSummaries:phases.map(phaseSummary),
    sourcePublicPaidRetreatsInTreatment:
      phaseSummary(phases[1]).sourcePublicPaidRetreats,
    sourcePhysicalCustodyBoundInTreatment:
      phaseSummary(phases[1]).sourcePhysicalCustodyBound,
    sourceSettledFollowOnAttacksInTreatment:
      phaseSummary(phases[1]).sourceSettledFollowOnAttacks,
    sourcePrizeTakingFollowOnAttacksInTreatment:
      phaseSummary(phases[1]).sourcePrizeTakingFollowOnAttacks,
    sourceSameEpochOpponentRepliesInTreatment:
      phaseSummary(phases[1]).sourceSameEpochOpponentRepliesAfterPaidRetreat,
    competitiveGamesQualified:0,estimatedWinRate:null
  };
  return {
    schema:VERSION,registrationPath:REGISTRATION_PATH,
    registrationGitBlobSha:gitBlobHash(bytes(REGISTRATION_PATH)),
    baseRegistrationGitBlobSha:BASE_REGISTRATION_BLOB,
    pinnedTwinleaf:m.pinnedTwinleaf,
    registration:m,hashes:HASH_PATHS.map(hashRegisteredFile),
    phases,comparisons,summary,
    releaseQualified:false,competitiveGamesQualified:0,
    estimatedWinRate:null,
    verdict:'DEFER-developmental-only-no-competitive-admission'
  };
}

/**
 * Exclusive lock plus same-directory atomic renames for the complete archive
 * and its SHA-256 sidecar.
 * @param {object} value Complete A/B/A evidence.
 * @param {string} directory Relative output directory under repository root.
 * @returns {{file:string,sha256:string,bytes:number}}
 */
function writeArchive(value,directory){
  const dir=path.resolve(ROOT,directory);
  const relative=path.relative(ROOT,dir);
  assert.ok(relative&&relative!== '..'&&!relative.startsWith('..'+path.sep)&&
    !path.isAbsolute(relative),'Archive directory must remain inside repository');
  fs.mkdirSync(dir,{recursive:true});
  const prefix='agent36-issue25-common-v9-paid-retreat-aba';
  const file=path.join(dir,prefix+'.json');
  const digestFile=file+'.sha256';
  const lock=path.join(dir,'.'+prefix+'.lock');
  const tmp=file+'.'+randomUUID()+'.tmp';
  const digestTmp=digestFile+'.'+randomUUID()+'.tmp';
  const fd=fs.openSync(lock,'wx');
  const data=Buffer.from(JSON.stringify(value,null,2)+'\n');
  const digest=createHash('sha256').update(data).digest('hex');
  try{
    fs.writeFileSync(tmp,data,{flag:'wx'});
    fs.renameSync(tmp,file);
    fs.writeFileSync(digestTmp,digest+'  '+prefix+'.json\n',{flag:'wx'});
    fs.renameSync(digestTmp,digestFile);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(digestTmp))fs.unlinkSync(digestTmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {file:path.relative(ROOT,file),sha256:digest,bytes:data.length};
}

module.exports={VERSION,REGISTRATION_PATH,BASE_REGISTRATION_PATH,HASH_PATHS,
  preflight,phaseOptions:mode=>({
    actorTwoUnitPaidRetreatRoot:mode.actorTwoUnitPaidRetreatRoot,
    actorTwoUnitPaidRetreatTargetTurn:null
  }),paidRetreatEvidence,summarizeRow,firstRootDifference,compare,
  phaseSummary,run,writeArchive};
