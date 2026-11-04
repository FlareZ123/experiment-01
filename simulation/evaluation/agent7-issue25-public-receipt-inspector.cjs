'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {rootDecisionComposition}=
  require('./agent7-issue25-v3-executed-receipt.cjs');

const VERSION='agent7-issue25-independent-public-receipt-inspector-v1';
const sha256=buffer=>createHash('sha256').update(buffer).digest('hex');

/**
 * Inspect actual native public evidence without running a match or reading
 * concealed player zones. Physical full-deal fingerprints may legitimately
 * differ across candidate 60s; matching source-deal hashes remain an
 * explicit separate condition for the intended four-arm design.
 *
 * @param {Buffer} bytes Exact JSON archive bytes, including final newline.
 * @param {string} sidecar Exact companion SHA256 sidecar UTF-8 content.
 * @returns {object} Independent custody findings; never a gameplay verdict.
 */
function inspectIssue25PublicReceipt(bytes,sidecar){
  assert.ok(Buffer.isBuffer(bytes));
  assert.ok(bytes.length>0&&bytes.length<=8*1024*1024);
  assert.equal(typeof sidecar,'string');
  const checksum=sha256(bytes);
  const exactSidecar=checksum+'  issue25-v3-executed.json\n';
  const checksumPass=sidecar===exactSidecar;
  if(!checksumPass)return {
    version:VERSION,checksum,checksumPass:false,
    integrity:'FAIL-checksum',qualifiedGames:0,
    failures:['detached-json-sha256-sidecar-mismatch']
  };
  const data=JSON.parse(bytes.toString('utf8'));
  assert.equal(data.schema,'agent7-issue25-v3-executed-receipt-v1');
  const registered=data.registration?.ids??[];
  const returned=data.attempts??[];
  assert.ok(Array.isArray(registered));
  assert.ok(Array.isArray(returned));
  const failures=[];
  const ids=returned.map(x=>x.id);
  if(new Set(registered).size!==registered.length||
     new Set(ids).size!==ids.length||
     registered.length!==ids.length||
     registered.some(id=>!ids.includes(id))||
     ids.some(id=>!registered.includes(id)))
    failures.push('registered-returned-trial-id-mismatch');
  if(registered.length!==4)
    failures.push('not-four-original-source-development-arms');
  const roots=returned.map(x=>{
    const ledger=x.publicRootActions;
    const present=Array.isArray(ledger);
    const bounded=x.publicRootActionsTruncated!==true;
    const actualCount=x.publicRootActionCount;
    const ownCount=present?ledger.length:null;
    const indicesOk=present&&ledger.every((root,index)=>
      Number.isSafeInteger(root.actionOrdinal)&&
      root.actionOrdinal===index);
    const countMatches=present&&actualCount===ownCount;
    const observed=x.publicRootDecisionComposition??null;
    const computed=present?rootDecisionComposition(ledger):null;
    const claimedSummaryPass=observed===null?null:
      JSON.stringify(observed)===JSON.stringify(computed);
    const digest=present?sha256(Buffer.from(JSON.stringify(ledger))):null;
    const reported=x.publicRootLedgerSha256Reported??null;
    const digestPass=reported===null?null:reported===digest;
    const result={
      id:x.id,status:x.status,
      nativeRootActionCount:x.nativeRootActionCount??null,
      actualCount,rootSequenceAvailable:present,
      fullPublicLedger:present&&bounded,
      exactActionOrdinals:indicesOk,
      countMatches,summaryMatches:claimedSummaryPass,
      independentRootSha256:digest,
      reportedRootSha256Matches:digestPass,
      rootComposition:computed
    };
    if(present&&!indicesOk)
      failures.push(x.id+':noncanonical-root-action-ordinals');
    if(present&&!countMatches)
      failures.push(x.id+':public-root-count-mismatch');
    if(claimedSummaryPass===false)
      failures.push(x.id+':claimed-root-summary-mismatch');
    if(digestPass===false)
      failures.push(x.id+':native-root-ledger-digest-mismatch');
    return result;
  });
  const sourceGroups={};
  for(const row of returned){
    const rank=String(row.id??'').split(':')[0];
    (sourceGroups[rank]??=[]).push(row.sourceDealFingerprint??null);
  }
  const pairedSources=Object.entries(sourceGroups).map(([rank,digests])=>({
    rank,arms:digests.length,
    paired:digests.length===2&&digests.every(d=>
      typeof d==='string'&&d.length>0&&d===digests[0]),
    sourceDealFingerprint:digests[0]??null
  }));
  if(pairedSources.length!==2||
     pairedSources.some(x=>!x.paired))
    failures.push('source-paired-physical-deal-digest-mismatch');
  const manifest=data.selectedExecutingManifest??{};
  const reported=data.reportedCompetitiveGames??null;
  if(reported!==0)failures.push('unexpected-reported-competitive-games');
  if(manifest.releaseQualified!==false)
    failures.push('selected-manifest-qualification-inconsistent');
  if(data.gate?.overall!=='FAIL-development-only')
    failures.push('unsupported-receipt-competitive-promotion');
  return {
    version:VERSION,checksum,checksumPass,
    integrity:failures.length?'FAIL-custody':'PASS-bounded-artifact-custody',
    failures,
    registeredCount:registered.length,
    returnedCount:returned.length,
    actualRunnerGitCommit:manifest.observedRepositoryGitCommit??null,
    actualVendorGitCommit:manifest.observedTwinleafGitCommit??null,
    selectedPolicyEntryPoint:manifest.policyEntryPoint??null,
    actualReturnedRootSummary:roots,
    sourcePairedFingerprints:pairedSources,
    fullPublicLedgersAvailable:roots.every(x=>x.fullPublicLedger),
    qualifiedGames:0,
    qualification:'FAIL-development-only',
    caveat:'The checksum and source identity support file custody only; no paper payment, full opponent policy, all-32 exact sources or official clock is certified.'
  };
}
module.exports={VERSION,inspectIssue25PublicReceipt};
