'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {audit:validateFirst,EXPECTED_ROOT,EXPECTED_DEAL,TARGET_ID,sourceAttacks}=
  require('./agent5-rank6-lowprize-native-audit.cjs');

const EXPECTED_SINGLE='9626b719fbb911cbfbd2e8b33eeed104b0783bb1ddb302bdaf782e0bf9b12083';

/**
 * Verify the previously frozen two-arm physical experiment and the
 * preregistered T17 extension, including failures in every other arm.
 * @param {object} original Untouched control.
 * @param {object} single Validated T15-only intervention.
 * @param {object} double Separately registered T15 + T17 intervention.
 * @returns {object}
 */
function auditDouble(original,single,double){
  const originalAudit=validateFirst(original,single);
  assert.equal(double.rows?.length,4);
  assert.equal(double.registeredLowPrizePromotion?.treatment,true);
  assert.equal(double.registeredLowPrizePromotion?.secondTurn,true);
  assert.equal(originalAudit.exactControlRoot,EXPECTED_ROOT);
  assert.equal(originalAudit.physicalSourceDeal,EXPECTED_DEAL);
  const before=single.rows.find(x=>x.trial?.id===TARGET_ID);
  const after=double.rows.find(x=>x.trial?.id===TARGET_ID);
  assert.ok(before&&after);
  assert.equal(before.rootActionLedgerSha256,EXPECTED_SINGLE,
    'Original registered T15-only outcome changed');
  assert.equal(after.sourceDealFingerprint,EXPECTED_DEAL);
  assert.equal(after.sourceActuallyFirst,true);
  const matched=[];
  for(const row of single.rows){
    if(row.trial.id===TARGET_ID)continue;
    const other=double.rows.find(x=>x.trial?.id===row.trial.id);
    assert.ok(other);
    assert.equal(other.sourceDealFingerprint,row.sourceDealFingerprint);
    assert.equal(other.rootActionLedgerSha256,row.rootActionLedgerSha256);
    matched.push({id:row.trial.id,
      nativeRootSha256:row.rootActionLedgerSha256});
  }
  const record=double.registeredLowPrizePromotion;
  assert.equal(record.attemptedTargets,1);
  assert.equal(record.receipts.length,1);
  const eventAudit=record.receipts[0].audit;
  assert.ok(eventAudit);
  assert.equal(eventAudit.opportunitySeen,2,
    'Required exact T15 and T17 physical owner menus unavailable');
  assert.equal(eventAudit.selected,2);
  assert.equal(eventAudit.accepted,2);
  assert.equal(eventAudit.rejected,0);
  assert.equal(eventAudit.physicallyConfirmed,2);
  assert.equal(eventAudit.failedPhysical,0);
  const events=eventAudit.events.filter(x=>x.status==='accepted');
  assert.deepEqual(events.map(x=>x.turn),[15,17]);
  for(const event of events){
    assert.equal(event.selected,'Duskull VIV');
    assert.equal(event.after.active,'Duskull VIV');
    assert.ok(event.before.bench.includes('Mewtwo & Mew-GX UNM'));
    assert.ok(event.before.bench.includes('Duskull VIV'));
  }
  assert.notEqual(after.rootActionLedgerSha256,EXPECTED_SINGLE);
  const summarize=row=>({
    finished:row.finished,
    winnerSeat:row.winner,
    finalPrizes:row.finalPrizes,
    endReason:row.endReason,
    lastGlobalTurn:row.turns,
    nativeRootCount:row.rootActionCount,
    nativeRootSha256:row.rootActionLedgerSha256,
    sourceSettledAttacks:sourceAttacks(row),
    candidateSettledAttacks:(row.candidateAttackSettlement?.attacks??[])
      .map(x=>({turn:x.turnBefore,name:x.attackName,
        prizesBefore:x.prizesBefore,prizesAfter:x.prizesAfter}))
  });
  return {
    schema:'agent5-rank6-double-duskull-native-audit-v1',
    registration:'results/aichi-2026/registrations/agent5-rank6-double-duskull-20261022.md',
    verifiedPreviousT15:originalAudit,
    sourceDealSha256:EXPECTED_DEAL,
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceFirst:true,seed:407516727,
    unchangedNonTargetArms:matched,
    additionalNativePromotion:eventAudit,
    untouchedControl:summarize(original.rows.find(x=>x.trial?.id===TARGET_ID)),
    singleT15:summarize(before),
    doubleT15T17:summarize(after),
    competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'retrospective conditional one-deal decision experiment, native Store and policy coverage not tournament certified'
  };
}

if(require.main===module){
  const [original,single,double]=process.argv.slice(2).map(file=>
    JSON.parse(fs.readFileSync(file,'utf8')));
  process.stdout.write(JSON.stringify(auditDouble(original,single,double),null,2)+'\n');
}

module.exports={EXPECTED_SINGLE,auditDouble};
