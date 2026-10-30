'use strict';

const assert=require('node:assert/strict');
const VERSION='agent1-original-six-k0-native-source-route-policy-pair-v1';

/**
 * Pair the same six original physical seeds with a deliberately scripted
 * first-turn source route versus untouched native source/recipient bots.
 * This is an intervention on source choices, not an estimate of deck strength.
 * @param {object} treatment Original 11-action-source-line opponent-return report.
 * @param {object} control Entirely native bot source/opponent continuation report.
 * @returns {object}
 */
function compare(treatment,control){
  assert.equal(treatment.schema,'agent1-rank11-six-native-opponent-return-v1');
  assert.equal(control.version,'agent1-rank11-six-unaltered-bot-source-reply-v1');
  assert.equal(treatment.registrationSha256,control.frameSha256);
  assert.equal(treatment.engineRevision,control.engineRevision);
  assert.equal(treatment.scheduled,6);
  assert.equal(control.scheduled,6);
  assert.equal(treatment.attempted,6);
  assert.equal(control.attempted,6);
  const controlByIndex=new Map(control.rows.map(row=>[row.index,row]));
  assert.equal(controlByIndex.size,6);
  const rows=treatment.rows.map(t=>{
    const c=controlByIndex.get(t.index);
    assert.ok(c,'Missing control physical deal index '+t.index);
    assert.equal(t.seed,c.seed,'Different original physical deal seeds');
    assert.equal(t.originalK0Replayed,true);
    assert.equal(c.originalK0Replayed,true);
    assert.equal(t.witness?.atOpponentOriginalRoot,true);
    assert.equal(t.opponentFirstRootObserved,true);
    assert.equal(c.opponentFirstRoot,true);
    const tAfter=t.afterOpponentPublic?.sourceEquippedGarbodorCount??null;
    const cAfter=c.afterOpponentPublic?.equippedGarbodorCount??null;
    const cBefore=c.atOpponentFirstRoot?.equippedGarbodorCount??null;
    return {index:t.index,seed:t.seed,
      treatmentStatus:t.status,controlStatus:c.status,
      tOpponentProposals:t.opponentRootProposals?.length??0,
      cOpponentProposals:c.opponentRootProposals?.length??0,
      treatmentSourceReturn:t.sourceReturnObserved===true,
      controlSourceReturn:c.sourceReturnRoot===true,
      treatmentEquippedAtOpponentFirst:t.witness.sourceEquippedGarbodor===true,
      controlEquippedAtOpponentFirst:cBefore,
      treatmentEquippedAfterReply:tAfter,
      controlEquippedAfterReply:cAfter,
      treatmentPrizesAfter:t.afterOpponentPublic?.sourceRemainingPrizes??null,
      controlPrizesAfter:c.afterOpponentPublic?.remainingPrizes??null,
      winRateInterpretation:'none'};
  });
  return {version:VERSION,sameOriginalSeedAndK0Pairs:rows.length,
    treatmentSourceReturns:rows.filter(r=>r.treatmentSourceReturn).length,
    controlSourceReturns:rows.filter(r=>r.controlSourceReturn).length,
    treatmentEquippedAfter:rows.filter(r=>
      r.treatmentEquippedAfterReply!==null&&r.treatmentEquippedAfterReply>0).length,
    controlEquippedAfter:rows.filter(r=>
      r.controlEquippedAfterReply!==null&&r.controlEquippedAfterReply>0).length,
    rows,competitiveQualifiedGames:0,
    limitations:'Retrospectively selected fixed source K0 deals; scripted treatment vs unmodified weak bot; no owner-safe general chooser, paper clock or complete competitive games.'};
}

/** @returns {object} Actual six original native source physical paired continuations. */
function run(){
  const treatment=require('./agent32-rank11-six-star-vip-k1-native.cjs')
    .run({observeOpponentReturn:true});
  const control=require('./agent1-rank11-six-original-policy-control.cjs').run();
  return {report:compare(treatment,control),
    treatment,control};
}
if(require.main===module){
  const output=run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(output.report.treatmentSourceReturns!==6||output.control.blocked>0)
    process.exitCode=1;
}
module.exports={VERSION,compare,run};
