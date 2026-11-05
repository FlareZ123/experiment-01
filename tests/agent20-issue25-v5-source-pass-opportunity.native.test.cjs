'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {
  VERSION,runOriginalV5SourcePassOpportunities
}=require('../simulation/evaluation/agent20-issue25-v5-source-pass-opportunity.cjs');

test('original v5 eight-arm pinned native source Pass owner/payment audit',()=>{
  const result=runOriginalV5SourcePassOpportunities();
  const dir=process.env.AGENT20_SOURCE_PASS_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const filepath=path.join(dir,'agent20-source-pass-v5-owner-evidence.json');
    const bytes=JSON.stringify(result,null,2)+'\n';
    const digest=createHash('sha256').update(bytes).digest('hex');
    writeAtomicLocked(filepath,bytes);
    writeAtomicLocked(filepath+'.sha256',
      digest+'  '+path.basename(filepath)+'\n');
  }
  console.log('AGENT20_V5_SOURCE_PASS_OPPORTUNITY',JSON.stringify({
    version:result.schema,
    eightNativeAttempts:result.nativeAttemptCount,
    anchors:result.opportunities.map(x=>({
      id:x.id,exactTape:x.exactHistoricRootReproduced,
      captured:x.ownerSnapshotCount,screened:x.allHeldTrainerCopiesScreened,
      blockedTrainerCopies:x.paperNecessaryRejectedTrainerCopies,
      unresolvedTrainerCopies:x.unresolvedHeldTrainerCopies,
      ownerHand:x.ownerVisibleBeforeChoice?.ownHand??null,
      ownerPublic:x.ownerVisibleBeforeChoice?.ownPublic??null,
      ownerQuotas:x.ownerVisibleBeforeChoice?.ownTurnResources??null
    })),
    allTapeMatched:result.fullRootTapeParityAtBothAnchors,
    allOwnerSnapshots:result.snapshotsAndNecessaryScreensPresent,
    qualifiedGames:result.qualifiedGames
  }));
  assert.equal(result.schema,VERSION);
  assert.equal(result.nativeAttemptCount,8);
  assert.equal(result.opportunities.length,2);
  assert.equal(result.qualifiedGames,0);
  assert.equal(result.fullRootTapeParityAtBothAnchors,true);
  assert.equal(result.snapshotsAndNecessaryScreensPresent,true);
  assert.ok(result.opportunities.every(x=>
    x.ownerSnapshotCount===1&&x.actualPassAccepted===true&&
    x.ownerVisibleBeforeChoice?.ownHand.length>=0));
});
