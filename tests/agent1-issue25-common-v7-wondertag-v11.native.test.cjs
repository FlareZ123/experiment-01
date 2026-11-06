'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runAgent1CommonWonderTagV11,VERSION}=
  require('../simulation/evaluation/agent1-issue25-common-v7-wondertag-v11.cjs');
const {registeredTrials}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

/** Atomic, locked write of the exact public owner-prompt audit and outcomes. */
function archiveV11(report,directory){
  fs.mkdirSync(directory,{recursive:true});
  const file=path.resolve(directory,'agent1-issue25-v11-public.json');
  const lock=file+'.lock',tmp=file+'.'+process.pid+'.tmp';
  const digestPath=file+'.sha256',digestTmp=digestPath+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  const data=Buffer.from(JSON.stringify(report,null,2)+'\n');
  const digest=createHash('sha256').update(data).digest('hex');
  try{
    fs.writeFileSync(tmp,data,{flag:'wx'});
    fs.renameSync(tmp,file);
    fs.writeFileSync(digestTmp,digest+'  '+path.basename(file)+'\n',
      {flag:'wx'});
    fs.renameSync(digestTmp,digestPath);
    return {file,bytes:data.length,sha256:digest};
  }finally{
    for(const p of [tmp,digestTmp])if(fs.existsSync(p))fs.unlinkSync(p);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

test('pinned native original-eight common-v7 Wonder Tag both-seat treatment preserves every status',()=>{
  const selected=runAgent1CommonWonderTagV11();
  const ids=registeredTrials().map(x=>x.id).sort();
  const rows=selected.diagnostic.nativeEight;
  assert.equal(selected.manifest.version,VERSION);
  assert.deepEqual(rows.map(x=>x.id).sort(),ids);
  assert.equal(selected.manifest.nativeRootActionLimit,96);
  assert.equal(selected.diagnostic.competitiveGamesQualified,0);
  assert.equal(selected.diagnostic.estimatedWinRate,null);
  const actions=selected.diagnostic.actualOwnerWonderTagAudit;
  const shuffle=selected.diagnostic.actualOwnerShuffleAudit;
  const decisions=selected.diagnostic.registeredActorDecisions;
  assert.ok(actions&&shuffle&&Array.isArray(decisions));
  assert.equal(decisions.length,actions.searchOffers);
  assert.ok(shuffle.shufflePromptsOffered>=
    shuffle.shuffleCallbacksCompleted);
  assert.ok(shuffle.validShuffleCallbacksCompleted<=
    shuffle.shuffleCallbacksCompleted);
  assert.ok(rows.every(x=>x.status!=='paper-qualified-game'));
  const directory=process.env.AGENT1_ISSUE25_V11_OUTPUT_DIR;
  const audit={
    schema:VERSION,
    originalRegistrationIds:ids,
    originalBaseV7ArchiveSha256:
      'e54944b2592917b6578267b523718dd9cad6f929f3a2b3deffce01f8e205cb7a',
    experimentalPolicyHash: selected.manifest.resolvedSourceAndPolicyHashes,
    originalPrintedSixtiesUnchanged:true,
    exactNativeResults:rows,
    originalSourceVersusContenderSearches:decisions,
    ownerWonderTag:actions,
    ownerNativeShuffle:shuffle,
    ownerNativePrizePokemon:
      selected.diagnostic.actualOwnerPrizePokemonAudit,
    nativePrintedShuffleCompletionCertified:
      selected.diagnostic.nativePrintedShuffleCompletionCertified,
    callbackTrialAndActorJoin:
      selected.diagnostic.registeredNativeShuffleTrialSeatJoin,
    paperGameQualified:false,competitiveGamesQualified:0,
    winRateClaim:null
  };
  const archive=directory?archiveV11(audit,directory):null;
  const publicNativeArchive=directory?writeReceipt(selected,directory,{
    prefix:'issue25-steward-v7',
    policyEntryPoint:selected.manifest.policyEntryPoint
  }):null;
  console.log('AGENT1_ISSUE25_V11_NATIVE',JSON.stringify({
    version:VERSION,nativeSourceStatuses:rows.map(x=>({
      id:x.id,status:x.status,rootCount:x.rootCount,
      sourceSeat:x.sourceSeat,
      sourcePhysicalDealFingerprint:x.sourcePhysicalDealFingerprint
    })),
    verifiedRegisteredActorDecisions:decisions,
    ownerWonderTag:actions,shuffle,
    nativePrintedShuffleCompletionCertified:
      audit.nativePrintedShuffleCompletionCertified,
    nativeOwnerArchive:archive,nativePublicRootArchive:publicNativeArchive,
    competitivelyQualifiedGames:0
  }));
  assert.equal(selected.manifest.releaseQualified,false);
});
