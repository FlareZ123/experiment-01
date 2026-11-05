'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runMirroredIssue25V6}=
  require('./agent1-issue25-mirrored-r6-r11-v6.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withThreePrintedOwnerAttackFrontiers}=
  require('./agent1-issue25-joined-three-attacks-v5.cjs');
const {withOwnerCaptureEnergySearch}=
  require('../twinleaf/agent41-owner-capture-energy-search.cjs');

const VERSION='agent4-issue25-capture-retrospective-96root-v2-abort-ledger';
const ROOT_LIMIT=96;
const sha256=value=>createHash('sha256').update(JSON.stringify(value))
  .digest('hex');

/**
 * Retrospective cap-extension of already-visible v6 source contexts. All
 * underlying original and candidate printed 60s, IDs and both source seats
 * remain unchanged. Explicitly overrides the historic 48 cap at execution.
 * @param {Function|null} attackLayer
 * @returns {object}
 */
function runExtended(attackLayer){
  const runner=options=>runDevelopment({
    ...options,nativeRootActionLimit:ROOT_LIMIT,
    bilateralSpecialEnergyRoot:true,nativeAcceptedTargets:true
  });
  return runMirroredIssue25V6({
    runner,...(attackLayer?{attackLayer}:{})
  });
}

/** @param {()=>unknown} next */
function withCaptureContinuation(next){
  let capture=null;
  const wrapped=withThreePrintedOwnerAttackFrontiers(()=>{
    const result=withOwnerCaptureEnergySearch(next);
    capture=result.audit;
    return result.result;
  });
  return {result:wrapped.result,audit:{
    ...wrapped.audit,ownerCaptureEnergySearch:capture
  }};
}

/**
 * Public accepted native Store roots, deliberately without hands, decks or
 * prize identities. Aborted attempts retain available public root history.
 * @param {object} row
 * @returns {object}
 */
function publicAttempt(row){
  const roots=Array.isArray(row.rootActionLedger)?
    row.rootActionLedger:(row.nativeAbortEvidence?.rootActionLedger??[]);
  return {
    id:row.trial?.id??null,
    sourceSeat:row.sourceSeat??row.nativeAbortProvenance?.sourceSeat??null,
    candidateSeat:row.candidateSeat??null,
    status:row.status??(row.finished?'native-terminal-unqualified':
      'returned-unqualified'),
    sourceDealSha256:row.sourceDealFingerprint??null,
    completePhysicalDealSha256:row.fullPhysicalDealFingerprint??null,
    verifiedFirstTurn:row.verifiedFirstTurn??null,
    firstStarterSeat:row.actualStarterSeat??null,
    nativeRootCount:roots.length,
    finished:row.finished??null,
    sourceAttackDeclarations:row.sourceAttackSettlement?.attacks?.length??null,
    nativeAbortPrompt:row.nativeAbortEvidence?.pendingPrompt??null,
    roots:roots.map(root=>({
      ordinal:root.actionOrdinal,turn:root.turnBefore,
      seat:root.playerSlot,action:root.action,
      card:root.card??null,attack:root.attack??null,
      prompt:root.pendingPrompt??null
    }))
  };
}

/**
 * Match all fixed original8 contexts and explicitly distinguish 96-root
 * retrospective research from the originally registered 48-root campaign.
 * @returns {object}
 */
function runCaptureRetrospective96(){
  const control=runExtended(null);
  const treatment=runExtended(withCaptureContinuation);
  const a=control.rawDevelopment?.rows??[];
  const b=treatment.rawDevelopment?.rows??[];
  assert.equal(a.length,8);
  assert.equal(b.length,8);
  const expected=control.diagnostic.registered;
  assert.equal(expected.length,8);
  assert.deepEqual(treatment.diagnostic.registered,expected);
  const orig=new Map(a.map(row=>[row.trial.id,row]));
  assert.equal(orig.size,8);
  assert.equal(new Set(b.map(row=>row.trial.id)).size,8);
  const pairing=b.map(row=>{
    const old=orig.get(row.trial.id);
    assert.ok(old);
    return {
      id:row.trial.id,
      sourceShaEqual:old.sourceDealFingerprint===row.sourceDealFingerprint,
      fullDealShaEqual:old.fullPhysicalDealFingerprint===
        row.fullPhysicalDealFingerprint,
      controlStatus:old.status??'returned',
      treatmentStatus:row.status??'returned',
      controlRootCount:(old.rootActionLedger??old.nativeAbortEvidence?.rootActionLedger??[]).length,
      treatmentRootCount:(row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[]).length,
      sourceAttackDeclarations:
        row.sourceAttackSettlement?.attacks?.length??null
    };
  });
  const matchingDeals=pairing.every(row=>
    row.sourceShaEqual&&row.fullDealShaEqual);
  const capture=treatment.diagnostic.audit?.
    firstBlockedPromptEnvelope?.ownerCaptureEnergySearch??null;
  const receipt={
    schema:VERSION,method:'retrospective-cap-extension',
    researchQuestion:'Does actual settled Capture Energy owner search lead to a later original source attack and immediate opponent root?',
    originalImmutableV6Registration:
      'results/aichi-2026/registrations/agent1-issue25-mirrored-r6-r11-20261104.json',
    originalRegisteredRootCap:48,
    actualExecutedRootCap:ROOT_LIMIT,
    historicalOnly:true,prospectiveWinEvidence:false,
    originalSourceRanks:[6,11],
    bothSourceSeatsPerRank:true,
    candidateSixties:['champion-reference','new-moon-lockbreaker-v1'],
    exactRegisteredIDs:expected,
    pairing,matchingFullInitialDealAndOriginalSourceDeal:matchingDeals,
    sourceIndependentResourceRootOption:true,
    additionalTreatment:'native Capture Energy owner-deck search after real physical attachment',
    captureAudit:capture,
    control: a.map(publicAttempt),
    treatment:b.map(publicAttempt),
    controlPublicRootLedgerHash:sha256(a.map(row=>row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[])),
    treatmentPublicRootLedgerHash:sha256(b.map(row=>row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[])),
    reportedSelectedManifestRootLimit:control.manifest.nativeRootActionLimit,
    manifestCorrection:'The historical v6 manifest retains its 48-root label; actual runner override for this distinctly named retrospective execution is 96.',
    engineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    codeHeadSha:process.env.GITHUB_SHA??null,
    paperGameQualified:0,competitiveGamesQualified:0,
    finalFixed60Selected:false,winRateClaim:null
  };
  return receipt;
}

/**
 * Commit only sanitized public-root and hash evidence. Outputs are locked
 * and atomically replaced when the optional artifact directory is supplied.
 * @param {object} receipt
 * @param {string} directory
 */
function archiveReceipt(receipt,directory){
  fs.mkdirSync(directory,{recursive:true});
  const base='agent4-issue25-capture-retro96-source-roots.json';
  const target=path.resolve(directory,base);
  const lock=target+'.lock';
  const tmp=target+'.'+process.pid+'.tmp';
  const shaTarget=target+'.sha256',shaTmp=shaTarget+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try{
    const body=JSON.stringify(receipt,null,2)+'\n';
    const digest=createHash('sha256').update(body).digest('hex');
    fs.writeFileSync(tmp,body,{flag:'wx'});
    fs.renameSync(tmp,target);
    fs.writeFileSync(shaTmp,digest+'  '+base+'\n',{flag:'wx'});
    fs.renameSync(shaTmp,shaTarget);
    return {json:target,sha256:digest,bytes:Buffer.byteLength(body)};
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(shaTmp))fs.unlinkSync(shaTmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

module.exports={VERSION,ROOT_LIMIT,runExtended,withCaptureContinuation,
  publicAttempt,runCaptureRetrospective96,archiveReceipt};
