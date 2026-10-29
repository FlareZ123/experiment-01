'use strict';
const assert=require('node:assert/strict');

const VERSION='agent7-native-pass-next-root-postgame-v1';

/**
 * Verify that every owner Pass accepted by the live Store observer appears
 * once in the independently captured original native root ledger, and that
 * the next ordinary root is in a later engine turn. A later-turn root proves
 * an observable engine clock advance after Pass. It does not prove paper-rule
 * card legality, turn clock, source competence or an entire competitive game.
 *
 * @param {object} report Fully archived headless cohort, including roots and
 *   actorOnlyDecisionCoverage native owner-supporter observer.
 * @returns {object} Read-only aggregate and per-arm original-Store receipts.
 */
function auditPassNextNativeRoot(report){
  assert.ok(Array.isArray(report?.rows));
  const arms=[];
  let acceptedPasses=0,ledgerPasses=0,advanced=0,noFollowing=0,
    sameTurn=0,regressed=0;
  for(const row of report.rows){
    const observer=row.actorOnlyDecisionCoverage?.ownerSupporterOpportunityAudit;
    assert.ok(observer?.actualStoreSeen===true,
      'Every audited arm must have an authenticated live owner observer');
    assert.ok(Array.isArray(row.rootActionLedger),
      'Every audited arm must have an original Store root ledger');
    const bySeat={0:0,1:0};
    for(const seat of [0,1]){
      const accepted=observer.bySeat?.[seat]?.acceptedPassRoots;
      assert.ok(Number.isSafeInteger(accepted)&&accepted>=0);
      bySeat[seat]=accepted;
    }
    const roots=row.rootActionLedger.filter(entry=>entry.pendingPrompt===null);
    const observedBySeat={0:0,1:0};
    let armAdvanced=0,armNoFollowing=0,armSameTurn=0,armRegressed=0;
    for(let i=0;i<roots.length;i++){
      const current=roots[i];
      if(current.action!=='PassTurnAction')continue;
      assert.ok(current.playerSlot===0||current.playerSlot===1);
      observedBySeat[current.playerSlot]++;
      const next=roots[i+1];
      if(!next){armNoFollowing++;continue;}
      if(next.turnBefore>current.turnBefore){armAdvanced++;continue;}
      if(next.turnBefore===current.turnBefore){armSameTurn++;continue;}
      armRegressed++;
    }
    assert.deepEqual(observedBySeat,bySeat,
      'Native Pass ledger does not exactly match accepted actor Pass roots');
    const count=bySeat[0]+bySeat[1];
    acceptedPasses+=count;
    ledgerPasses+=observedBySeat[0]+observedBySeat[1];
    advanced+=armAdvanced;
    noFollowing+=armNoFollowing;
    sameTurn+=armSameTurn;
    regressed+=armRegressed;
    arms.push({
      trial:row.trial?.id??null,actualSourceFirst:row.sourceActuallyFirst??null,
      acceptedPasses:count,ledgerPasses:observedBySeat[0]+observedBySeat[1],
      followedByLaterTurn:armAdvanced,noFollowingRoot:armNoFollowing,
      sameTurnFollowingRoot:armSameTurn,clockRegression:armRegressed
    });
  }
  assert.equal(acceptedPasses,ledgerPasses);
  assert.equal(acceptedPasses,advanced+noFollowing+sameTurn+regressed);
  return {
    version:VERSION,arms,
    acceptedPasses,ledgerPasses,
    followedByLaterTurn:advanced,
    noFollowingRoot:noFollowing,sameTurnFollowingRoot:sameTurn,
    clockRegression:regressed,
    completeImmediateNextRootTurnEvidence:
      acceptedPasses===advanced,
    competitiveQualifiedGames:0,
    caveat:'A later engine root turn confirms a subsequent clock advance, not that Store dispatch itself immediately advanced the turn. This is no proof of printed Supporter legality or match strength.'
  };
}
module.exports={VERSION,auditPassNextNativeRoot};
