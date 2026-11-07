'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {VERSION,withRank1MirrorResourceAndAttackAudit}=
  require('../simulation/twinleaf/agent11-rank1-mirror-owner-pass-resources.cjs');
const {TARGET,runActualOriginalRank1MirrorPassProbe}=
  require('../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

const FROZEN_ROOT_SHA=
  '3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a';

test('original rank1 mirror: exact same native roots and all 12 source owner-hand setup states',()=>{
  const run=runActualOriginalRank1MirrorPassProbe({
    observer:withRank1MirrorResourceAndAttackAudit
  });
  const row=run.execution.rawDevelopment.rows.find(x=>x.trial?.id===TARGET);
  assert.ok(row);
  assert.equal(row.rootActionLedgerSha256,FROZEN_ROOT_SHA,
    'read-only resource observer must not change any genuine Store action');
  assert.equal(row.finished,true);
  assert.equal(row.winner,1);
  assert.deepEqual(row.finalPrizes,[6,0]);
  const other=run.mirrorSourcePass.audit;
  assert.equal(other.selectedSourcePassCount,12);
  assert.equal(other.actualStores,1);
  assert.equal(other.auditErrors,0);
  const audit=other.ownerPassResourceAudit;
  assert.equal(audit.schema,VERSION);
  assert.equal(audit.actualStores,1);
  assert.equal(audit.errorCount,0);
  assert.equal(audit.selectedSourcePassCount,12);
  assert.equal(audit.decisionsChanged,false);
  assert.equal(audit.opponentConcealedZonesInspected,false);
  const realSourcePasses=row.rootActionLedger.filter(event=>
    event.playerSlot===0&&event.action==='PassTurnAction');
  assert.deepEqual(audit.sourcePasses.map(e=>e.rootOrdinal),
    realSourcePasses.map(e=>e.actionOrdinal));
  assert.deepEqual(audit.sourcePasses.map(e=>e.globalTurn),
    realSourcePasses.map(e=>e.turnBefore));
  assert.deepEqual(audit.sourcePasses.map(e=>e.globalTurn),
    other.sourcePasses.map(e=>e.turn));
  assert.ok(audit.sourcePasses.every(e=>e.actorSeat===0&&
    e.opponentConcealedZonesInspected===false&&
    e.ownerHandSize===e.ownerHandPrintings.length));
  const full={
    schema:VERSION,
    evidenceType:'actual native Store, post-choice owner-only resource census',
    trialId:TARGET,sourceSeat:0,sourcePrintingsEqualCandidate:
      row.sourceDeckFingerprint===row.candidateDeckFingerprint,
    firstPlayer:row.firstPlayer??null,
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sameExactRootSha256:FROZEN_ROOT_SHA,
    fullNativeRootActions:row.actionCount,
    nativeFinished:row.finished,
    nativeWinnerSeat:row.winner,
    sourceAttackActions:row.rootActionLedger.filter(e=>
      e.playerSlot===0&&e.action==='AttackAction').length,
    sourcePassCount:audit.selectedSourcePassCount,
    passesWithBasicPsychicHeld:audit.sourcePasses.filter(e=>
      e.handBasicPsychicCount>0).length,
    passesWithBasicPsychicHeldAndNormalHandAttachmentStillOpen:
      audit.sourcePasses.filter(e=>
        e.handBasicPsychicCount>0&&
        e.normalHandEnergyAttachmentStillOpen).length,
    fullPhysicalSourceOwnerHandAndBoardAtEveryPass:audit.sourcePasses,
    sourcePrintedAttacksAcceptedInDetachedClones:
      other.sourcePasses.reduce((s,e)=>s+e.possibleEngineAttackAnnouncements,0),
    opponentHiddenInformationReadByObserver:false,
    originalLiveDecisionChanged:false,
    proofLimit:'Retrospective owner resource opportunities only; no independently certified paper playability, paid attack, opponent competence, game clock or win rate',
    paperQualifiedGameCount:0
  };
  console.log('AGENT11_RANK1_MIRROR_OWNER_RESOURCE_NATIVE',JSON.stringify(full));
  const dir=process.env.AGENT11_RANK1_MIRROR_RESOURCE_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const file=path.join(dir,'agent11-rank1-mirror-source-pass-owner-resources.json');
    const bytes=JSON.stringify(full,null,2)+'\n';
    writeAtomicLocked(file,bytes);
    writeAtomicLocked(file+'.sha256',
      createHash('sha256').update(bytes).digest('hex')+'  '+path.basename(file)+'\n');
  }
});
