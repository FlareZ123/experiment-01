'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const EXPECTED_ROOT='20203d34d1f9149f7229b147a4906e8a4a80b7192e129a293d68cdc69bfcb419';
const EXPECTED_DEAL='14549caa34487d41ae4100c0c3542085d6fe57ed33b9d7da89b79bc55379b5de';
const TARGET_ID='6:retrospective-sourcefirst:0:B:new-moon-lockbreaker-v1';

/** @param {object} r @returns {object[]} */
function sourceAttacks(r){
  return (r.sourceAttackSettlement?.attacks??[]).map(a=>({
    turn:a.turnBefore,name:a.attackName,root:a.actionOrdinal,
    prizesBefore:a.prizesBefore,prizesAfter:a.prizesAfter,
    targetActiveBefore:a.publicBoardBefore?.[1]?.active?.name??null,
    targetActiveAfter:a.publicBoardAfter?.[1]?.active?.name??null,
    settled:a.settledPromptChain===true
  }));
}
/** @param {object} data @returns {object} */
function target(data){
  const row=data.rows?.find(r=>r.trial?.id===TARGET_ID);
  assert.ok(row,'Missing source-first rank6 New Moon row');
  return row;
}
/**
 * Exhaustively account for the four frozen arms. Does not promote native
 * engine completion to tournament-quality game or inferred win rate.
 * @param {object} control
 * @param {object} treatment
 * @returns {object}
 */
function audit(control,treatment){
  assert.equal(control.rows?.length,4);
  assert.equal(treatment.rows?.length,4);
  const c=target(control),t=target(treatment);
  assert.equal(c.rootActionLedgerSha256,EXPECTED_ROOT,
    'Prior historical control transcript changed');
  assert.equal(c.sourceDealFingerprint,EXPECTED_DEAL);
  assert.equal(t.sourceDealFingerprint,EXPECTED_DEAL);
  assert.equal(c.sourceActuallyFirst,true);
  assert.equal(t.sourceActuallyFirst,true);
  assert.equal(control.registeredLowPrizePromotion?.treatment,false);
  assert.equal(treatment.registeredLowPrizePromotion?.treatment,true);
  const other=[];
  for(const x of control.rows){
    if(x.trial?.id===TARGET_ID)continue;
    const y=treatment.rows.find(r=>r.trial?.id===x.trial?.id);
    assert.ok(y,'Missing paired historical non-target');
    assert.equal(x.rootActionLedgerSha256,y.rootActionLedgerSha256,
      'Non-target real Store decisions changed');
    assert.equal(x.sourceDealFingerprint,y.sourceDealFingerprint);
    other.push({trial:x.trial.id,
      unchangedRoot:x.rootActionLedgerSha256});
  }
  const registry=treatment.registeredLowPrizePromotion;
  assert.equal(registry.attemptedTargets,1);
  const receipt=registry.receipts[0];
  assert.ok(receipt?.audit);
  const ra=receipt.audit;
  assert.equal(ra.opportunitySeen,1,
    'Registered physically eligible source KO promotion prompt missed');
  assert.equal(ra.selected,1);
  assert.equal(ra.accepted,1);
  assert.equal(ra.rejected,0);
  assert.equal(ra.physicallyConfirmed,1);
  assert.equal(ra.failedPhysical,0);
  const event=ra.events.find(x=>x.status==='accepted');
  assert.equal(event?.turn,15);
  assert.equal(event?.selected,'Duskull VIV');
  assert.equal(event?.after?.active,'Duskull VIV');
  assert.ok(event.before.bench.includes('Duskull VIV'));
  assert.ok(event.before.bench.includes('Mewtwo & Mew-GX UNM'));
  assert.notEqual(t.rootActionLedgerSha256,c.rootActionLedgerSha256);
  const summarize=r=>({
    finished:r.finished,status:r.status??null,
    winner:r.winner,prizes:r.finalPrizes,
    rootDigest:r.rootActionLedgerSha256,
    rootCount:r.rootActionCount,turns:r.turns,
    firstCandidateAttack:r.candidateAttackSettlement?.attacks?.[0]?.turnBefore??null,
    sourceAttacks:sourceAttacks(r),
    candidateAttacks:(r.candidateAttackSettlement?.attacks??[]).map(x=>
      ({turn:x.turnBefore,name:x.attackName,
        prizesBefore:x.prizesBefore,prizesAfter:x.prizesAfter}))
  });
  return {schema:'agent5-rank6-lowprize-paired-native-audit-v1',
    registration:'results/aichi-2026/registrations/agent5-rank6-lowprize-promotion-20261022.md',
    target:TARGET_ID,sourceFirst:true,seed:407516727,
    enginePin:control.enginePin,
    physicalSourceDeal:EXPECTED_DEAL,
    exactControlRoot:EXPECTED_ROOT,
    opponentAndCandidatePrint60Unchanged:true,
    nonTargetArms:other,
    nativePromotion:ra,
    control:summarize(c),
    treatment:summarize(t),
    competitiveQualifiedGames:0,winRateCertified:false,
    caveat:'retrospective, untimed, incomplete actor policies; Store outcome is not a qualified competitive result'};
}

if(require.main===module){
  const [control,treatment]=process.argv.slice(2).map(p=>
    JSON.parse(fs.readFileSync(p,'utf8')));
  process.stdout.write(JSON.stringify(audit(control,treatment),null,2)+'\n');
}

module.exports={EXPECTED_ROOT,EXPECTED_DEAL,TARGET_ID,sourceAttacks,audit};
