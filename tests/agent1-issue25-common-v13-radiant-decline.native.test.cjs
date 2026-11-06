'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runAgent1CommonRadiantV13,VERSION}=
  require('../simulation/evaluation/agent1-issue25-common-v13-radiant-decline.cjs');
const {registeredTrials}=
  require('../simulation/evaluation/agent36-issue25-common-v6.cjs');
const {writeReceipt}=
  require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');

function writeAudit(record,directory){
  fs.mkdirSync(directory,{recursive:true});
  const file=path.resolve(directory,'agent1-v13-radiant-decline-native.json');
  const lock=file+'.lock',temp=file+'.'+process.pid+'.tmp';
  const digestFile=file+'.sha256';
  const digestTemp=digestFile+'.'+process.pid+'.tmp';
  const fd=fs.openSync(lock,'wx');
  const bytes=Buffer.from(JSON.stringify(record,null,2)+'\n');
  const digest=createHash('sha256').update(bytes).digest('hex');
  try{
    fs.writeFileSync(temp,bytes,{flag:'wx'});
    fs.renameSync(temp,file);
    fs.writeFileSync(digestTemp,
      digest+'  '+path.basename(file)+'\n',{flag:'wx'});
    fs.renameSync(digestTemp,digestFile);
    return {file,bytes:bytes.length,sha256:digest};
  }finally{
    for(const f of [temp,digestTemp])if(fs.existsSync(f))fs.unlinkSync(f);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

test('same eight real native rank6/11 source games with optional Radiant decline',()=>{
  const result=runAgent1CommonRadiantV13();
  const expected=registeredTrials().map(x=>x.id).sort();
  const rays=result.diagnostic.realNativeRadiantByTrial;
  const source=result.diagnostic.originalEight;
  assert.equal(result.manifest.version,VERSION);
  assert.equal(result.manifest.nativeRootActionLimit,96);
  assert.deepEqual(rays.map(x=>x.id).sort(),expected);
  assert.deepEqual(source.map(x=>x.id).sort(),expected);
  assert.equal(result.diagnostic.competitiveGamesQualified,0);
  assert.equal(result.diagnostic.estimatedWinRate,null);
  assert.equal(result.diagnostic.actualPrintedRadiantOffers,
    rays.reduce((n,x)=>n+(x.printedRadiantOffers??0),0));
  assert.equal(result.diagnostic.actualNativeOptionalDeclinesAccepted,
    rays.reduce((n,x)=>n+(x.nativeOptionalDeclinesAccepted??0),0));
  const data={
    schema:VERSION,registeredSourceIds:expected,
    v12BaselineReceiptSha256:
      'f0059e2bf405618e8d93f2fbef3ac74ed7bd7acb8670388b24092c79a8a45c93',
    sourceNativeRows:source,
    perTrialOptionalRadiantDecline:rays,
    perTrialNativeWonderTag:
      result.diagnostic.nativePerMatchWonderTag,
    originalPrintedRadialOffers:
      result.diagnostic.actualPrintedRadiantOffers,
    nativeDeclinesActuallySettled:
      result.diagnostic.actualNativeOptionalDeclinesAccepted,
    nativeCompleteDeclineRows:
      result.diagnostic.actualNativeCompleteRadiantDeclineRows,
    paperQualifiedGames:0,competitivelyQualifiedGames:0,
    simulatedWinRate:null
  };
  const directory=process.env.AGENT1_V13_OUTPUT_DIR;
  const auditArchive=directory?writeAudit(data,directory):null;
  const publicArchive=directory?writeReceipt(result,directory,{
    prefix:'issue25-steward-v7',
    policyEntryPoint:result.manifest.policyEntryPoint
  }):null;
  console.log('AGENT1_V13_RADIANT_NATIVE',JSON.stringify({
    version:VERSION,
    originalEight:source.map(x=>({
      id:x.id,status:x.status,rootCount:x.rootCount,
      sourceSeat:x.sourceSeat,
      sourcePhysicalDealFingerprint:x.sourcePhysicalDealFingerprint
    })),
    ownerRadiant:rays.map(x=>({
      id:x.id,status:x.status,offers:x.printedRadiantOffers,
      accepted:x.nativeOptionalDeclinesAccepted,
      sourceDeclines:x.sourceDeclines,
      contenderDeclines:x.contenderDeclines,
      nativeComplete:x.completeNativeDeclineWitness
    })),
    actualPrintedOffers:data.originalPrintedRadialOffers,
    nativeAcceptedDeclines:data.nativeDeclinesActuallySettled,
    auditArchive,publicArchive,competitiveGamesQualified:0
  }));
  assert.equal(result.manifest.releaseQualified,false);
});
