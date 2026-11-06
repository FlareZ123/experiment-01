'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {TARGET,VERSION,runRank1MirrorOwnerPassHandCensus}=
  require('../simulation/twinleaf/agent15-rank1-source-pass-hand-census.cjs');
const FROZEN_ROOT_SHA='3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a';

test('frozen 110-root rank1 mirror: postchoice owner-hand and normal Energy quota audit',()=>{
  const r=runRank1MirrorOwnerPassHandCensus();
  assert.equal(r.schema,VERSION);
  assert.equal(r.target,TARGET);
  const row=r.execution.rawDevelopment.rows.find(x=>x.trial?.id===TARGET);
  assert.ok(row);
  assert.equal(row.finished,true);
  assert.equal(row.actionCount,110);
  assert.equal(row.rootActionLedgerSha256,FROZEN_ROOT_SHA);
  assert.deepEqual(row.finalPrizes,[6,0]);
  const passRoots=row.rootActionLedger.filter(x=>
    x.playerSlot===0&&x.action==='PassTurnAction');
  assert.equal(passRoots.length,12);
  assert.equal(r.audit.originalStores,1);
  assert.equal(r.audit.ownerPasses.length,12);
  assert.deepEqual(r.audit.ownerPasses.map(x=>x.turn),
    passRoots.map(x=>x.turnBefore));
  assert.ok(r.audit.ownerPasses.every(x=>x.seat===0));
  assert.ok(r.audit.ownerPasses.every(x=>
    x.ownerHandSize===x.ownerHandAfterOwnDecision.length));
  assert.equal(r.audit.ownerPrivateCardsUsedByBot,false);
  assert.equal(r.audit.sourceDecisionChanged,false);
  const candidates=r.audit.ownerPasses.filter(x=>
    x.preliminaryUnspentHandEnergyOpportunity);
  const counts={
    schema:VERSION,trial:TARGET,originalRank1SourceSeat:0,
    pinnedSourceAndCandidateSixtyMatch:
      row.sourceDeckFingerprint===row.candidateDeckFingerprint,
    publicRootSha256:row.rootActionLedgerSha256,
    originalActions:row.actionCount,originalSourcePasses:12,
    originalSourceAttacks:row.rootActionLedger.filter(x=>
      x.playerSlot===0&&x.action==='AttackAction').length,
    ownerHandEnergyHeldPasses:r.audit.ownerPasses.filter(x=>
      x.heldEnergyCount>0).length,
    preliminaryUnspentHandEnergyPasses:candidates.length,
    preliminaryCandidateTurns:candidates.map(x=>x.turn),
    sourcePassOwnerHandAndBoard:r.audit.ownerPasses,
    paperCertifiedNormalEnergyActions:0,
    qualifiedCompetitiveGames:0,
    inferenceLimit:'Postchoice owner-visible hand and public board are observed, not alternative native energy actions. Other printed attachment restrictions and target-specific effects remain unverified.'
  };
  console.log('AGENT15_RANK1_OWNER_HAND_POSTCHOICE',JSON.stringify({
    rootSha256:counts.publicRootSha256,
    ownerHandEnergyHeldPasses:counts.ownerHandEnergyHeldPasses,
    preliminaryUnspentHandEnergyPasses:counts.preliminaryUnspentHandEnergyPasses,
    preliminaryCandidateTurns:counts.preliminaryCandidateTurns
  }));
  const dir=process.env.AGENT15_RANK1_SOURCE_PASS_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const filename='agent15-rank1-mirror-owner-hand-postchoice.json';
    const bytes=JSON.stringify(counts,null,2)+'\n';
    const filepath=path.join(dir,filename);
    writeAtomicLocked(filepath,bytes);
    writeAtomicLocked(filepath+'.sha256',createHash('sha256')
      .update(bytes).digest('hex')+'  '+filename+'\n');
  }
});
