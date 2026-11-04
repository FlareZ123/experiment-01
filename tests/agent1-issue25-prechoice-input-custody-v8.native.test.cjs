'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const test=require('node:test');
const {
  runPrechoiceCustodyV8,comparePrechoiceCustodyV8
}=require('../simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs');

/** @param {object} report @param {string} directory */
function archiveComparison(report,directory){
  fs.mkdirSync(directory,{recursive:true});
  const name='issue25-prechoice-custody-v8.json';
  const file=path.join(directory,name);
  const digestFile=path.join(directory,name+'.sha256');
  const lock=path.join(directory,'.v8-receipt.lock');
  const fd=fs.openSync(lock,'wx');
  const body=Buffer.from(JSON.stringify(report,null,2)+'\n');
  const digest=createHash('sha256').update(body).digest('hex');
  const tmp=file+'.'+process.pid+'.tmp';
  const hashTmp=digestFile+'.'+process.pid+'.tmp';
  try{
    fs.writeFileSync(tmp,body,{flag:'wx'});
    fs.renameSync(tmp,file);
    fs.writeFileSync(hashTmp,digest+'  '+name+'\n',{flag:'wx'});
    fs.renameSync(hashTmp,digestFile);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    if(fs.existsSync(hashTmp))fs.unlinkSync(hashTmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {file,sha256:digest,bytes:body.length};
}

test('native eight-arm same-process physical prechoice inputs, honest trial linkage qualification',()=>{
  const baseline=runPrechoiceCustodyV8('baseline');
  const challenger=runPrechoiceCustodyV8('protected');
  const comparison=comparePrechoiceCustodyV8(baseline,challenger);
  const directory=process.env.ISSUE25_V8_RECEIPT_DIR;
  const archive=directory?archiveComparison(comparison,directory):null;
  console.log('AGENT1_ISSUE25_PRECHOICE_V8_NATIVE',JSON.stringify({
    registered:comparison.sameEightPreregisteredIDs,
    observer:comparison.prechoiceInputObservers,
    constraints:comparison.constraints,
    briefRows:comparison.pairedRows.map(row=>({
      id:row.id,registeredTrialIdentityMatched:row.registeredTrialIdentityMatched,
      originalAndContenderPrintingDigestsMatched:
        row.originalAndContenderPrintingDigestsMatched,
      physicalSeatsAndFirstPlayerMatched:row.physicalSeatsAndFirstPlayerMatched,
      registeredTrialInputMatches:row.ownerSeats.map(s=>s.trialPairedPrechoiceInputEqual),
      sourceDealPostTreatmentEqual:row.postTreatmentSourcePhysicalDigestEqual
    })),
    archive
  }));
  assert.equal(comparison.sameEightPreregisteredIDs.length,8);
  assert.equal(comparison.constraints.canAttributePostTreatmentDifferenceToOpeningSelection,
    'UNRESOLVED');
  assert.equal(comparison.constraints.nativeStoreTrialLinkVerified,false);
  assert.equal(comparison.constraints.competitiveGamesQualified,0);
  assert.equal(comparison.constraints.releaseQualified,false);
});
