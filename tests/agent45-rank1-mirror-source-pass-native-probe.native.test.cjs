'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {TARGET,VERSION,runActualOriginalRank1MirrorPassProbe}=
 require('../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

const FROZEN_PUBLIC_ROOT_SHA=
 '3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a';

test('12 original rank1 source Passes: native-visible attack alternatives after policy choice',()=>{
 const r=runActualOriginalRank1MirrorPassProbe();
 assert.equal(r.schema,VERSION);
 const row=r.execution.rawDevelopment.rows.find(x=>x.trial?.id===TARGET);
 assert.ok(row);
 assert.equal(row.finished,true);
 assert.equal(row.winner,1);
 assert.equal(row.actionCount,110);
 assert.deepEqual(row.finalPrizes,[6,0]);
 assert.equal(row.rootActionLedgerSha256,FROZEN_PUBLIC_ROOT_SHA,
   'postchoice probe changed prior frozen actual Store root history');
 const sourcePassRoots=row.rootActionLedger.filter(event=>
   event.playerSlot===0&&event.action==='PassTurnAction');
 assert.equal(sourcePassRoots.length,12);
 assert.equal(r.mirrorSourcePass.nativeReturned,true);
 const audit=r.mirrorSourcePass.audit;
 assert.equal(audit.actualStores,1);
 assert.equal(audit.selectedSourcePassCount,12);
 assert.equal(audit.sourcePasses.length,12);
 assert.equal(audit.auditErrors,0,'no post-decision clone failures');
 assert.equal(audit.decisionsChanged,false);
 assert.equal(audit.opponentPrivateCardsUsedForDecisions,false);
 assert.deepEqual(audit.sourcePasses.map(e=>e.turn),
   sourcePassRoots.map(e=>e.turnBefore));
 assert.ok(audit.sourcePasses.every(e=>
   e.status==='post-choice-detached-clone-probed'));
 const matching={schema:VERSION,trialId:TARGET,
  original60SameBothSides:row.sourceDeckFingerprint===
    row.candidateDeckFingerprint,
  originalRank1SourceSeat:0,nativeWinnerSeat:1,actionCount:row.actionCount,
  actualRootSha256:row.rootActionLedgerSha256,
  sourcePublicAttackRoots:row.rootActionLedger.filter(e=>
    e.playerSlot===0&&e.action==='AttackAction').length,
  sourcePassCount:audit.selectedSourcePassCount,
  realRootStoreInstances:audit.actualStores,
  passesWithAnyNativeAcceptedAttackAnnouncement:
    audit.sourcePasses.filter(x=>x.possibleEngineAttackAnnouncements>0).length,
  passesWhoseCloneRejectedEveryEnumeratedPrintedAttack:
    audit.sourcePasses.filter(x=>x.possibleEngineAttackAnnouncements===0).length,
  actualPasses:audit.sourcePasses,
  controlNativeGameUnchanged:true,paperQualifiedGames:0};
 console.log('AGENT45_MIRROR_SOURCE_PASS_ATTACK_NATIVE',JSON.stringify(matching));
 const dir=process.env.AGENT45_V8_MIRROR_EPISODE_DIR;
 if(dir){
   fs.mkdirSync(dir,{recursive:true});
   const file=path.join(dir,'agent45-mirror-source-pass-attack-probe.json');
   const bytes=JSON.stringify(matching,null,2)+'\n';
   writeAtomicLocked(file,bytes);
   writeAtomicLocked(file+'.sha256',createHash('sha256')
     .update(bytes).digest('hex')+'  '+path.basename(file)+'\n');
 }
});
