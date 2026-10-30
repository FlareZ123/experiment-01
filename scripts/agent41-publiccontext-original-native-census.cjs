'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/**
 * Compare every exact original rank-4/10 source and unchanged candidate pair.
 * The genuine Store emits native accepted action samples limited to 64 roots.
 * Such a sample is a lower bound, never a game-wide accepted count.
 * @param {object} before Control cohort.
 * @param {object} after Both-seat contextual Energy cohort.
 * @returns {object} Full, failure-inclusive native development evidence.
 */
function comparePublicEnergyFourPairs(before,after){
  for(const [mode,p] of [['control',before],['public-context',after]]){
    assert.equal(p.mode,mode);
    assert.equal(p.attempts,8);
    assert.equal(p.result?.attempted,8);
    assert.equal(p.result?.rows?.length,8);
    assert.equal(p.competitiveQualifiedGames,0);
  }
  assert.equal(before.registrationBlob,after.registrationBlob);
  assert.equal(before.enginePin,after.enginePin);
  const treated=new Map(after.result.rows.map(x=>[x.trial.id,x]));
  assert.equal(treated.size,8);
  const rows=[];
  for(const b of before.result.rows){
    const t=treated.get(b.trial.id);
    assert.ok(t,'Required original trial missing');
    for(const field of ['seed','rank','candidateSlot','candidateId'])
      assert.equal(b.trial[field],t.trial[field]);
    const sourceSeat=b.trial.candidateSlot==='A'?1:0;
    const oldDigest=b.fullPhysicalDealFingerprint;
    const newDigest=t.fullPhysicalDealFingerprint;
    const matched=typeof oldDigest==='string'&&oldDigest.length===64&&
      oldDigest===newDigest;
    const profile=t.bilateralPublicContextSpecialProfile??null;
    if(profile){
      assert.equal(profile.mode,'both');
      assert.equal(profile.ownerSeat,null);
      assert.equal(profile.sharedPolicy,true);
    }
    const native=t.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
    const sampled=native?.nativeRootAcceptances??[];
    const energy=sampled.filter(x=>x.kind==='attach-special-energy');
    const accepted=seat=>energy.filter(x=>x.seat===seat&&x.accepted===true);
    const confirmed=seat=>accepted(seat).filter(x=>
      x.nativePhysicalEffect==='confirmed-public-effect');
    const controlAttack=b.attackDeclarations?.source??null;
    const treatedAttack=t.attackDeclarations?.source??null;
    rows.push({
      id:b.trial.id,rank:b.trial.rank,candidateId:b.trial.candidateId,
      candidateSlot:b.trial.candidateSlot,sourceSeat,
      originalSeed:b.trial.seed,
      matchedInitialPhysicalDeal:matched,
      initialDealEvidenceMissing:
        typeof oldDigest!=='string'||typeof newDigest!=='string',
      matchedActualFirstPlayer:b.verifiedFirstTurn===true&&
        t.verifiedFirstTurn===true&&
        b.actualStarterSeat===t.actualStarterSeat,
      before:{status:b.status??(b.finished?'terminal':'capped'),
        finished:b.finished===true,winner:b.winner??null,
        actions:b.actionCount??null,sourceAttackDeclarations:controlAttack},
      after:{status:t.status??(t.finished?'terminal':'capped'),
        finished:t.finished===true,winner:t.winner??null,
        actions:t.actionCount??null,sourceAttackDeclarations:treatedAttack},
      sourceAttackChange:Number.isInteger(controlAttack)&&
        Number.isInteger(treatedAttack)?treatedAttack-controlAttack:null,
      publicContextProfilePresent:Boolean(profile),
      rootAuditPresent:Boolean(native),
      sourceSpecialAcceptedSample:accepted(sourceSeat).length,
      sourceSpecialConfirmedSample:confirmed(sourceSeat).length,
      candidateSpecialAcceptedSample:accepted(1-sourceSeat).length,
      candidateSpecialConfirmedSample:confirmed(1-sourceSeat).length,
      sampledSourceSpecialPrintings:confirmed(sourceSeat).map(x=>
        x.printing??null),
      sampledCandidateSpecialPrintings:confirmed(1-sourceSeat).map(x=>
        x.printing??null),
      rootSampleTruncated:Boolean(native&&
        native.acceptedActorRoots>sampled.length),
      fullGameSpecialRootIntents:native?.typedIntentCounts?.['attach-special-energy']??null,
      competitiveQualified:false
    });
  }
  const sum=key=>rows.reduce((n,x)=>n+(Number(x[key])||0),0);
  return {schema:'agent41-publiccontext-original-rank4rank10-paired-native-v1',
    attemptsPerPolicy:8,nativeArms:16,registrationBlob:before.registrationBlob,
    matchedInitialPhysicalDeals:rows.filter(x=>x.matchedInitialPhysicalDeal).length,
    missingInitialPhysicalEvidence:
      rows.filter(x=>x.initialDealEvidenceMissing).length,
    matchedActualFirstPlayers:rows.filter(x=>x.matchedActualFirstPlayer).length,
    sourceAttackChanges:rows.filter(x=>x.sourceAttackChange!==null&&
      x.sourceAttackChange!==0).length,
    sampledSourceAcceptedSpecial:sum('sourceSpecialAcceptedSample'),
    sampledCandidateAcceptedSpecial:sum('candidateSpecialAcceptedSample'),
    sampledSourceConfirmedSpecial:sum('sourceSpecialConfirmedSample'),
    sampledCandidateConfirmedSpecial:sum('candidateSpecialConfirmedSample'),
    engineErrorsBefore:rows.filter(x=>x.before.status==='engine-error').length,
    engineErrorsAfter:rows.filter(x=>x.after.status==='engine-error').length,
    actionCappedBefore:rows.filter(x=>x.before.status==='capped').length,
    actionCappedAfter:rows.filter(x=>x.after.status==='capped').length,
    rows,competitiveQualifiedGames:0,
    caveat:'Same registered original rank4/10 full 60 and source/slot seeds; source bot still incomplete, sample first64 root acceptances per episode, censors/errors retained, no 99.5 or competitive winner inference.'};
}

if(require.main===module){
  assert.equal(process.argv.length,4);
  const a=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const b=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(comparePublicEnergyFourPairs(a,b),null,2)+'\n');
}

module.exports={comparePublicEnergyFourPairs};
