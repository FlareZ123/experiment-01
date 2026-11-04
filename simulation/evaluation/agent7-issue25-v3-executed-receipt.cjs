'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent7-issue25-v3-executed-receipt-v1';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

/**
 * Derive public accepted Store action counts, separating prompt overhead
 * and Passes from other roots. No tactical success is inferred.
 * @param {object[]|null} ledger
 * @returns {object}
 */
function rootDecisionComposition(ledger){
  if(!Array.isArray(ledger))return {
    available:false,nativeAcceptedRoots:null,meaningfulNonPassRoots:null
  };
  const actionKinds={},promptKinds={};
  const bySeat={0:{roots:0,meaningful:0},1:{roots:0,meaningful:0}};
  let promptRoots=0,passRoots=0,waitPromptRoots=0;
  let meaningfulNonPassRoots=0;
  const attacks=[];
  for(const row of ledger){
    const action=row.action??'unknown';
    actionKinds[action]=(actionKinds[action]??0)+1;
    if(row.playerSlot===0||row.playerSlot===1)
      bySeat[row.playerSlot].roots++;
    if(action==='ResolvePromptAction'){
      promptRoots++;
      const kind=row.pendingPrompt??'unidentified';
      promptKinds[kind]=(promptKinds[kind]??0)+1;
      if(kind==='WaitPrompt')waitPromptRoots++;
    }else if(action==='PassTurnAction'){
      passRoots++;
    }else{
      meaningfulNonPassRoots++;
      if(row.playerSlot===0||row.playerSlot===1)
        bySeat[row.playerSlot].meaningful++;
    }
    if(action==='AttackAction')
      attacks.push({ordinal:row.actionOrdinal??null,
        turn:row.turnBefore??null,seat:row.playerSlot??null,
        attack:row.attack??null});
  }
  return {
    available:true,nativeAcceptedRoots:ledger.length,
    meaning:'Nonpass/nonprompt Store actions are descriptive, not a strategically complete policy or a qualified game',
    meaningfulNonPassRoots,promptRoots,passRoots,waitPromptRoots,
    actionKinds,promptKinds,bySeat,attacks,
    highestObservedGlobalTurn:ledger.reduce((max,row)=>
      Math.max(max,row.turnBefore??0),0)
  };
}

/**
 * Summarize one actually returned native trial without disclosing concealed
 * deck ordering or private game hands. The native root ledger is a public
 * action history. A missing history remains null for failed trials.
 * @param {object} status
 * @param {object|null} raw
 * @returns {object}
 */
function executionRow(status,raw){
  const abort=raw?.nativeAbortEvidence??null;
  const actions=raw?.rootActionLedger??
    raw?.nativePublicRootArchive?.rootActionLedger??
    abort?.rootActionLedger??null;
  const computedLedgerDigest=Array.isArray(actions)?
    sha256(Buffer.from(JSON.stringify(actions))):null;
  const engineReportedLedgerDigest=
    raw?.rootActionLedgerSha256??
    abort?.rootActionLedgerSha256??null;
  return {
    ...status,
    actualRawTrialId:raw?.trial?.id??raw?.id??null,
    rawDisposition:raw?.status??null,
    publicRootActionCount:Array.isArray(actions)?actions.length:null,
    publicRootActions:Array.isArray(actions)?actions.slice(0,128):null,
    publicRootActionsTruncated:
      Array.isArray(actions)?actions.length>128:null,
    publicRootDecisionComposition:rootDecisionComposition(actions),
    publicRootLedgerSha256Computed:computedLedgerDigest,
    publicRootLedgerSha256Reported:engineReportedLedgerDigest,
    publicRootLedgerDigestConsistent:computedLedgerDigest===null?
      null:engineReportedLedgerDigest===null?
        'UNVERIFIED':engineReportedLedgerDigest===computedLedgerDigest,
    abortFailureStage:abort?.failureStage??null,
    abortActionOrdinal:abort?.actionOrdinal??null,
    abortActionName:abort?.actionName??null,
    abortPendingPrompt:abort?.pendingPrompt??null,
    actualSourceDeckFingerprint:raw?.sourceDeckFingerprint??null,
    actualCandidateDeckFingerprint:raw?.candidateDeckFingerprint??null,
    actualFirstPlayer:raw?.actualStarterSeat??status.actualStarterSeat??null,
    finalNativeWinner:raw?.winner??null,
    actualSourceAttackSettlement:raw?.sourceAttackSettlement??null,
    nativeFailure:raw?.error??null,
    // Engine abort information is retained by status.nativeAbortProvenance.
    // Never substitute a generated physical deal for an aborted attempt.
  };
}

/**
 * Build a prospectively audit-ready developmental receipt from the actual
 * returned selected-v3 execution. A passing CI assertion never upgrades a
 * FAIL game qualification gate.
 * @param {{manifest:object,diagnostic:object,rawDevelopment:object|null}} executed
 * @returns {object}
 */
function buildReceipt(executed){
  assert.ok(executed&&typeof executed==='object');
  const {manifest,diagnostic,rawDevelopment}=executed;
  assert.equal(manifest?.policyEntryPoint,
    'simulation/evaluation/agent36-issue25-nightwatch-futuresight-v3.cjs');
  assert.ok(Array.isArray(diagnostic?.registered));
  assert.ok(Array.isArray(diagnostic?.attemptedRows));
  const rawRows=Array.isArray(rawDevelopment?.rows)?rawDevelopment.rows:[];
  // Join by authenticated trial identity, never by list position. Aborted
  // native arms and asynchronous result collectors may reorder their rows.
  const rawById=new Map();
  const rawIdentityConflicts=[];
  for(const raw of rawRows){
    const nested=raw?.trial?.id??null;
    const flat=raw?.id??null;
    if(nested!==null&&flat!==null&&nested!==flat){
      rawIdentityConflicts.push({nested,flat});
      continue;
    }
    const id=nested??flat;
    if(typeof id!=='string')continue;
    if(rawById.has(id)){
      rawIdentityConflicts.push({duplicateId:id});
      rawById.set(id,null);
    }else rawById.set(id,raw);
  }
  const rows=diagnostic.attemptedRows.map(status=>
    executionRow(status,rawById.get(status.id)??null));
  const rawJoinExact=rawIdentityConflicts.length===0&&
    rawRows.length===rows.length&&
    rows.every(row=>row.actualRawTrialId===row.id);
  const reconciled=rawJoinExact&&
    diagnostic.registeredAttemptReconciliation?.exactUniqueMatch===true&&
    diagnostic.rawRowIdentityReconciliation?.exactlyReconciled===true;
  const observedGit=manifest.runtimeGitAttestationStatus==='VERIFIED';
  const engineLedgerDigestGate=rows.some(row=>
    row.publicRootLedgerDigestConsistent===false)?'FAIL':
    rows.every(row=>row.publicRootLedgerDigestConsistent===true&&
      row.publicRootActionsTruncated===false)?'PASS':'UNRESOLVED';
  const fullRootLedgerGate=rows.every(row=>
    row.publicRootActionCount!==null&&
    row.publicRootActionsTruncated===false)?'PASS':'UNRESOLVED';
  const attemptIds=rows.map(row=>row.id);
  return {
    schema:VERSION,
    provenance:{
      source:'actual-selected-v3-return-object',
      ciRunId:process.env.GITHUB_RUN_ID??null,
      ciRunAttempt:process.env.GITHUB_RUN_ATTEMPT??null,
      ciHeadSha:process.env.GITHUB_SHA??null,
      observedRepositoryGitCommit:manifest.observedRepositoryGitCommit??null,
      observedTwinleafGitCommit:manifest.observedTwinleafGitCommit??null,
      observedLoadedResearchModuleDigest:
        manifest.observedLoadedResearchModuleDigest??null,
      receiptProducerSha256:sha256(fs.readFileSync(__filename)),
      concealedZonePolicy:
        'Only fingerprints of physical deals; no private deck order or concealed hands',
      printedSourceDecksEmbedded:false,
      printedSourceDeckRefs:manifest.originalSourceRegistration??null
    },
    selectedExecutingManifest:manifest,
    registration:{
      ids:diagnostic.registered,
      actualReturnedIds:attemptIds,
      exactIdReconciliation:diagnostic.registeredAttemptReconciliation??null,
      rawRowReconciliation:diagnostic.rawRowIdentityReconciliation??null,
      receiptRawJoinIdentityConflicts:rawIdentityConflicts,
      receiptRawJoinExact:rawJoinExact,
      registeredAttemptsReturned:diagnostic.allRegisteredAttemptsReturned===true
    },
    attempts:rows,
    selectedActionAndPromptAudits:{
      sourceStampedNightWatch:diagnostic.sourceStampedNightWatch??null,
      sourceStampedFutureSight:diagnostic.sourceStampedFutureSight??null,
      printedAttackOrigins:diagnostic.printedAttackOrigins??null,
      firstBlockedPromptEnvelope:
        diagnostic.audit?.firstBlockedPromptEnvelope??null
    },
    gate:{
      observedCodeAndVendor:observedGit?'PASS':'UNRESOLVED',
      exactTrialIdentity:reconciled?'PASS':'FAIL',
      observedPublicRootLedgerDigest:engineLedgerDigestGate,
      fullUntruncatedPublicRootLedger:fullRootLedgerGate,
      completeReturnedFourArmLedger:rows.length===4&&reconciled?
        'PASS':'FAIL',
      fullPolicyBothSeatSymmetry:manifest.fullDecisionPolicySymmetryCertified?
        'UNRESOLVED':'FAIL',
      completeOwnerInformationProof:'UNRESOLVED',
      completePaperPaymentProof:'FAIL',
      qualifiedSourceOpponentGames:'FAIL',
      full32OriginalPrintedSources:'FAIL',
      officialPaper25MinuteClock:'FAIL',
      competitiveWinRate:'UNRESOLVED',
      overall:'FAIL-development-only'
    },
    verdict:diagnostic.verdict,
    reportedCompetitiveGames:diagnostic.competitiveGamesQualified??0,
    notes:'Retrospective 48-root development arms; errors and caps remain attempts, and native Store acceptance does not establish paper legality.'
  };
}

/**
 * Write the complete JSON and SHA-256 sidecar under an exclusive lock.
 * Atomic renames prevent an incomplete file being mistaken for a receipt.
 * @param {object} executed
 * @param {string} directory
 * @returns {{file:string,sha256:string,bytes:number}}
 */
function writeReceipt(executed,directory){
  const document=JSON.stringify(buildReceipt(executed),null,2)+'\n';
  const bytes=Buffer.from(document,'utf8');
  assert.ok(bytes.length<=8*1024*1024,
    'Issue25 developmental archive exceeds the bounded 8 MiB public receipt');
  fs.mkdirSync(directory,{recursive:true});
  const lock=path.join(directory,'.issue25-v3-receipt.lock');
  const lockFd=fs.openSync(lock,'wx');
  const file=path.join(directory,'issue25-v3-executed.json');
  const temp=file+'.'+process.pid+'.tmp';
  const digest=sha256(bytes);
  const digestFile=path.join(directory,'issue25-v3-executed.sha256');
  const digestTemp=digestFile+'.'+process.pid+'.tmp';
  try{
    fs.writeFileSync(temp,bytes,{flag:'wx'});
    fs.renameSync(temp,file);
    fs.writeFileSync(digestTemp,digest+'  issue25-v3-executed.json\n',
      {flag:'wx'});
    fs.renameSync(digestTemp,digestFile);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    if(fs.existsSync(digestTemp))fs.unlinkSync(digestTemp);
    fs.closeSync(lockFd);
    fs.unlinkSync(lock);
  }
  return {file,sha256:digest,bytes:bytes.length};
}
module.exports={VERSION,rootDecisionComposition,executionRow,buildReceipt,writeReceipt};
