'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createHash}=require('node:crypto');
const {auditFreshUnderworldArchive,REGISTRATION_BLOB}=
  require('../simulation/evaluation/agent34-fresh-underworld-abort-pair-audit.cjs');

const hash=s=>createHash('sha256').update(s).digest('hex');

/** Synthetically registered, identical physical 16-pair study. */
function fixture(){
  const control=[],treatment=[],pairs=[];
  for(let i=0;i<16;i++){
    const candidateSlot=i<8?'A':'B';
    const candidateId=i%2?'new-moon-lockbreaker-v1':'champion-reference';
    const trial={id:['1',Math.floor(i%8/2),candidateSlot,candidateId].join(':'),
      rank:1,repeat:Math.floor(i%8/2),candidateSlot,candidateId,seed:100+i};
    const row={trial,sourceDealFingerprint:hash('source'+i),
      fullPhysicalDealFingerprint:hash('full'+i),actualStarterSeat:0,
      finished:true,winner:0};
    control.push({...row});treatment.push({...row});
    pairs.push({trialId:trial.id,fullySettledSourceEffects:0});
  }
  return {schema:'agent34-fresh-rank1-underworld-paper-hook-source-paired-v1',
    preregistrationGitBlob:REGISTRATION_BLOB,originalRank:1,gamesPerArm:16,
    actualControl:16,actualTreatment:16,
    completeOriginalSourceAbilityEffects:0,control:{rows:control},
    treatment:{rows:treatment},pairs};
}

function makeAbort(archive,index){
  const row=archive.treatment.rows[index];
  const roots=[{action:'PassTurnAction',turnBefore:1,playerSlot:0}];
  const sourceSeat=row.trial.candidateSlot==='A'?1:0;
  archive.treatment.rows[index]={trial:row.trial,status:'engine-error',
    nativeAbortEvidence:{schema:'headless-native-abort-public-v1',
      sourceDealFingerprint:{seat:sourceSeat,digestSha256:row.sourceDealFingerprint},
      rootActionLedger:roots,rootActionCount:1,actionOrdinal:1,
      rootActionLedgerSha256:hash(JSON.stringify(roots)),
      failureStage:'strict-prompt-validation',pendingPrompt:'AttachEnergyPrompt'}};
}

test('all 16 complete registered control/treatment physical pairs certify',()=>{
  const r=auditFreshUnderworldArchive(fixture());
  assert.equal(r.status,'ARCHIVE_STRICT_PAIR_GATE_PASSED');
  assert.equal(r.totals.verifiedOriginalSourcePairs,16);
  assert.equal(r.totals.strictFullPairMatches,16);
  assert.equal(r.totals.competitivelyQualifiedGames,0);
});

test('one authentic root-ledger abort only restores source pairing',()=>{
  const archive=fixture();makeAbort(archive,8);
  archive.pairs[8].fullySettledSourceEffects=2;
  archive.completeOriginalSourceAbilityEffects=2;
  const r=auditFreshUnderworldArchive(archive);
  assert.equal(r.status,'ARCHIVE_STRICT_PAIR_GATE_FAILED');
  assert.equal(r.totals.verifiedOriginalSourcePairs,16);
  assert.equal(r.totals.strictFullPairMatches,15);
  assert.equal(r.totals.sourceOnlyAbortMatches,1);
  assert.equal(r.totals.sourceEffectsInAbortedRows,2);
  assert.equal(r.rows[8].firstPlayerBothVerified,false);
  assert.equal(r.rows[8].fullPhysicalPairVerified,false);
});

test('tampered native abort root ledger cannot authenticate its source digest',()=>{
  const archive=fixture();makeAbort(archive,7);
  archive.treatment.rows[7].nativeAbortEvidence.rootActionLedger[0].action='Other';
  const r=auditFreshUnderworldArchive(archive);
  assert.equal(r.totals.unverifiedSourcePairs,1);
  assert.equal(r.totals.verifiedOriginalSourcePairs,15);
  assert.equal(r.rows[7].status,'SOURCE_DEAL_UNVERIFIED');
});

test('a truly distinct source fingerprint is reported as a mismatch',()=>{
  const archive=fixture();
  archive.treatment.rows[2].sourceDealFingerprint=hash('different source');
  const r=auditFreshUnderworldArchive(archive);
  assert.equal(r.totals.verifiedSourceMismatches,1);
  assert.equal(r.rows[2].status,'VERIFIED_SOURCE_DEAL_MISMATCH');
});

test('a matching seed alone cannot promote a missing full physical deal',()=>{
  const archive=fixture();
  delete archive.treatment.rows[4].fullPhysicalDealFingerprint;
  const r=auditFreshUnderworldArchive(archive);
  assert.equal(r.totals.strictFullPairMatches,15);
  assert.equal(r.rows[4].status,'SOURCE_MATCH_FULL_OR_START_UNVERIFIED');
});

test('trial identity mismatch or duplicate registered ID is rejected',()=>{
  const archive=fixture();
  archive.treatment.rows[4].trial={...archive.treatment.rows[4].trial,id:'changed'};
  assert.throws(()=>auditFreshUnderworldArchive(archive));
});
