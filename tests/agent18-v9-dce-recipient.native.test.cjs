'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {runAgent18V9SourceDce,VERSION}=
  require('../simulation/evaluation/agent18-v9-dce-recipient-audit.cjs');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');

test('same-eight original v9 paid G&H source DCE native physical recipient and actual reply witness',()=>{
  const audited=runAgent18V9SourceDce();
  const dir=process.env.AGENT18_V9_DCE_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const output=path.join(dir,'agent18-v9-source-dce-recipient.json');
    const bytes=JSON.stringify(audited,null,2)+'\n';
    writeAtomicLocked(output,bytes);
    writeAtomicLocked(output+'.sha256',
      createHash('sha256').update(bytes).digest('hex')+
      '  '+path.basename(output)+'\n');
  }
  console.log('AGENT18_V9_NATIVE_SOURCE_DCE_RECIPIENT',JSON.stringify({
    schema:audited.schema,
    frozenEight:audited.originalAttemptCount,
    sameSourceDeals:audited.allSourceDealsMatch,
    sameCompleteOpenings:audited.allFullDealsMatch,
    physicalDceTargets:audited.physicallySettledDceTargets,
    sourceTurns:audited.targets.map(x=>({
      id:x.id,sourceSeat:x.sourceSeat,status:x.status,
      authenticatedDceRoot:x.sourceDceAcceptedRootCount,
      nativeStoreLinked:x.nativeStoreRootOrdinalsLinked,
      nativeEventCount:x.nativeStorePhysicalEventCount,
      physicalRecipient:x.custody?.destination??null,
      verified:x.nativePhysicalRecipientSettled,
      firstSourceAttack:x.nextOriginalSourceAttack,
      firstOpponentAction:x.nextOpponentOwnerRoot,
      physicalReason:x.custody?.reason??null
    })),
    statuses:audited.statuses,
    competitivelyQualifiedGames:audited.qualifiedCompetitiveGames
  }));
  assert.equal(audited.schema,VERSION);
  assert.equal(audited.originalAttemptCount,8);
  assert.equal(new Set(audited.allOriginalIds).size,8);
  assert.equal(audited.allSourceDealsMatch,true);
  assert.equal(audited.allFullDealsMatch,true);
  assert.ok(audited.targets.every(x=>
    x.sourceSeat===0&&x.sourceDceAcceptedRootCount===1));
  assert.equal(audited.qualifiedCompetitiveGames,0);
  assert.equal(audited.paperAttackCertified,false);
});
