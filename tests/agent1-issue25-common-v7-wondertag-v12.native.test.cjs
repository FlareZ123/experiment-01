'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {
  runAgent1InnermostWonderTagV12,VERSION
}=require('../simulation/evaluation/agent1-issue25-common-v7-wondertag-v12.cjs');
const {registeredTrials}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

/** Write a locked and atomic source/contender owner-prompt receipt. */
function archiveAudit(audit,directory){
  fs.mkdirSync(directory,{recursive:true});
  const target=path.resolve(directory,'agent1-v12-native-owner-WonderTag.json');
  const lock=target+'.lock',tmp=target+'.'+process.pid+'.tmp';
  const digestTarget=target+'.sha256';
  const digestTmp=digestTarget+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  const bytes=Buffer.from(JSON.stringify(audit,null,2)+'\n');
  const digest=createHash('sha256').update(bytes).digest('hex');
  try{
    fs.writeFileSync(tmp,bytes,{flag:'wx'});
    fs.renameSync(tmp,target);
    fs.writeFileSync(digestTmp,
      digest+'  '+path.basename(target)+'\n',{flag:'wx'});
    fs.renameSync(digestTmp,digestTarget);
    return {file:target,bytes:bytes.length,sha256:digest};
  }finally{
    for(const f of [tmp,digestTmp])if(fs.existsSync(f))fs.unlinkSync(f);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

test('actual pinned native 8 source/candidate trials with innermost generic Wonder Tag',()=>{
  const selected=runAgent1InnermostWonderTagV12();
  const expected=registeredTrials().map(x=>x.id).sort();
  const all=selected.diagnostic.nativePerMatchWonderTag;
  const rows=selected.diagnostic.originalEight;
  assert.equal(selected.manifest.version,VERSION);
  assert.equal(selected.manifest.nativeRootActionLimit,96);
  assert.deepEqual(rows.map(x=>x.id).sort(),expected);
  assert.deepEqual(all.map(x=>x.id).sort(),expected);
  assert.equal(selected.diagnostic.competitiveGamesQualified,0);
  assert.equal(selected.diagnostic.estimatedWinRate,null);
  assert.ok(all.every(x=>x.nativeStatus==='engine-error'||
    x.nativeStatus==='returned-unqualified'));
  assert.equal(selected.diagnostic.registeredNativeSettledRowCount,
    all.filter(x=>x.registeredNativePrintedSettlement).length);
  const directory=process.env.AGENT1_ISSUE25_V12_OUTPUT_DIR;
  const audit={
    version:VERSION,originalEightIds:expected,
    baselineV7NativeArchiveSha256:
      'e54944b2592917b6578267b523718dd9cad6f929f3a2b3deffce01f8e205cb7a',
    nativeAttempts:rows.map(x=>({
      id:x.id,status:x.status,rootCount:x.rootCount,
      sourceSeat:x.sourceSeat,
      sourcePhysicalDealFingerprint:x.sourcePhysicalDealFingerprint,
      fullPhysicalDealFingerprint:x.fullPhysicalDealFingerprint
    })),
    nativeWonderTagByRegisteredTrial:all,
    registeredNativeSettledRowCount:
      selected.diagnostic.registeredNativeSettledRowCount,
    confirmedAbilityOffers:
      selected.diagnostic.printedConfirmationOffers,
    exactNativeOwnerSupporterTransfers:
      selected.diagnostic.printedOwnerSupporterTransfers,
    exactNativeShuffleCallbacks:
      selected.diagnostic.nativePrintedShufflesValid,
    nativeSourceRootAndPaperAbilityCertified:false,
    paperGameQualified:false,competitiveGamesQualified:0,
    winRateClaim:null
  };
  const privateAuditArchive=directory?archiveAudit(audit,directory):null;
  const rootLedgerArchive=directory?writeReceipt(selected,directory,{
    prefix:'issue25-steward-v7',
    policyEntryPoint:selected.manifest.policyEntryPoint
  }):null;
  console.log('AGENT1_ISSUE25_V12_NATIVE',JSON.stringify({
    version:VERSION,
    registeredTrialCount:all.length,
    statusSummary:rows.map(x=>({id:x.id,status:x.status,
      rootCount:x.rootCount,sourceSeat:x.sourceSeat,
      sourcePhysicalDealFingerprint:x.sourcePhysicalDealFingerprint
    })),
    perTrialOwnerChoice:all.map(x=>({
      id:x.id,roleSourceSeat:x.sourceSeat,
      nativeStatus:x.nativeStatus,offers:x.printedConfirmationOffers,
      confirmed:x.printedConfirmed,
      search:x.ownerSupporterSearches,
      settled:x.settledOwnerSupporterTransfers,
      completedShuffles:x.callbackShufflesValid,
      sourceCompletedShuffles:x.sourceCompletedShuffles,
      contenderCompletedShuffles:x.contenderCompletedShuffles,
      nativePrintedSettlement:x.registeredNativePrintedSettlement
    })),
    nativeAuditArchive:privateAuditArchive,
    nativeRootArchive:rootLedgerArchive,
    paperGamesQualified:0
  }));
  assert.equal(selected.manifest.releaseQualified,false);
});
