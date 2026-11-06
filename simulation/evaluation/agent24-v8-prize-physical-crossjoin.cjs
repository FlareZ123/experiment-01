'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');

const VERSION = 'agent24-v8-independent-prize-physical-crossjoin-v1';

/**
 * Join a settled public attack's Prize delta to a separate native Store
 * observer's object-level Prize exits. The join is by documented source
 * tuple, not a shared Store object or exact independently certified root ID.
 * @param {object} v8 Archived Telepath+Confirm public attack receipt.
 * @param {object} physical Independent Agent3 native root physical-exit receipt.
 * @returns {object} Evidence with all original denominators, no win claim.
 */
function crossjoinNativePhysicalPrizeExits(v8, physical) {
  const attempts=v8?.attempts;
  assert.ok(Array.isArray(attempts));
  const descriptions=physical?.actualOriginalDispositionRows;
  const exits=physical?.exactTrialLinkedEveryPhysicalPrizeExit;
  assert.ok(Array.isArray(descriptions) && Array.isArray(exits));
  assert.equal(v8.provenance?.observedTwinleafCommit,physical.vendor,
    'Different native vendor revision');
  assert.equal(physical.callbackTrialJoinPassed,true);
  assert.equal(physical.actualHeadlessRootCallbacks,attempts.length);
  assert.equal(physical.physicalExitObserver?.registeredRootStores,attempts.length);
  assert.equal(physical.physicalExitObserver?.hiddenPrizeFacesRead,false);
  assert.equal(physical.physicalExitObserver?.omittedRecords,0);
  assert.equal(physical.physicalExitObserver?.rootsWithPrizeCardExit,exits.length);
  assert.equal(physical.physicalExitObserver?.exactPhysicalPrizeCardsExited,
    exits.reduce((n,e)=>n+e.exactExitedCards,0));
  const byId=new Map(descriptions.map(d=>[d.id,d]));
  assert.equal(byId.size,descriptions.length,'Duplicate physical trial');
  assert.equal(new Set(attempts.map(row=>row.id)).size,attempts.length);
  assert.equal(byId.size,attempts.length,'Missing registered physical trial');
  const usedPhysical=new Set();
  const rows=[];
  let sourcePrizeAttackEvents=0,contenderPrizeAttackEvents=0;
  for(const row of attempts) {
    const other=byId.get(row.id);
    assert.ok(other,'Missing physical review for '+row.id);
    assert.equal(row.publicRootActionsTruncated,false);
    assert.equal(row.publicRootActionCount,row.publicRootActions.length);
    const digest=createHash('sha256').update(JSON.stringify(
      row.publicRootActions)).digest('hex');
    assert.equal(digest,row.publicRootLedgerSha256Computed);
    assert.equal(digest,row.publicRootLedgerSha256Reported);
    assert.equal(row.candidateSeat,1-row.originalSourceSeat);
    assert.equal(other.sourceSeat,row.originalSourceSeat);
    assert.equal(other.candidateSeat,row.candidateSeat);
    assert.equal(other.sourceDealFingerprint,row.sourceDealFingerprint);
    assert.equal(other.fullPhysicalDealFingerprint,row.fullPhysicalDealFingerprint);
    assert.equal(other.rootActionCount,row.publicRootActionCount);
    assert.equal(other.status,row.status);
    assert.deepEqual(other.finalPrizes,row.finalPrizes);
    assert.equal(other.actualDeclaredSourceAttacks,
      row.actualSourceAttackSettlement.declarations,
      'Cross-run original source declaration count mismatch');
    assert.equal(other.completedSettledSourceAttacks,
      row.actualSourceAttackSettlement.settled,
      'Cross-run original source settled count mismatch');
    for(const [role,packet,seat] of [
      ['source',row.actualSourceAttackSettlement,row.originalSourceSeat],
      ['contender',row.candidateAttackSettlement,row.candidateSeat]
    ]) {
      assert.ok(Array.isArray(packet?.attacks));
      for(const attack of packet.attacks) {
        if(attack.settledPromptChain!==true)continue;
        const before=attack.prizesBefore?.[seat];
        const after=attack.prizesAfter?.[seat];
        assert.ok(Number.isSafeInteger(before) && Number.isSafeInteger(after));
        assert.ok(before>=after);
        if(before===after)continue;
        const paid=before-after;
        assert.ok(Number.isSafeInteger(attack.turnBefore));
        assert.ok(Number.isSafeInteger(attack.actionOrdinal) &&
          Number.isSafeInteger(attack.completionRootOrdinal));
        assert.ok(attack.completionRootOrdinal>=attack.actionOrdinal &&
          attack.completionRootOrdinal<row.publicRootActions.length);
        const attackRoot=row.publicRootActions[attack.actionOrdinal];
        assert.equal(attackRoot.action,'AttackAction');
        assert.equal(attackRoot.playerSlot,seat);
        assert.equal(attackRoot.turnBefore,attack.turnBefore);
        const withinAttack=row.publicRootActions.slice(attack.actionOrdinal,
          attack.completionRootOrdinal+1);
        assert.ok(withinAttack.some(root=>
          root.action==='ResolvePromptAction' &&
          root.turnBefore===attack.turnBefore),
        'Prize exit lacks same-turn prompt-resolution root');
        const match=exits.map((record,index)=>({record,index})).filter(
          ({record})=>record.registeredTrialId===row.id &&
            record.ownerSeat===seat &&
            record.turn===attack.turnBefore &&
            record.prePrizeCards===before &&
            record.postPrizeCards===after &&
            record.exactExitedCards===paid &&
            record.actionType==='ResolvePromptAction');
        assert.equal(match.length,1,'Missing or ambiguous physical Prize exit');
        const {record,index}=match[0];
        assert.ok(!usedPhysical.has(index),'One physical exit reused');
        assert.deepEqual(record.byDestination,{hand:paid},
          'Prize objects did not all physically reach taking owner hand');
        usedPhysical.add(index);
        if(role==='source')sourcePrizeAttackEvents++;
        else contenderPrizeAttackEvents++;
        rows.push({trialId:row.id,role,actorSeat:seat,
          attackRoot:attack.actionOrdinal,
          attackSettlementRoot:attack.completionRootOrdinal,
          attackName:attack.attackName,turn:attack.turnBefore,
          prizesBefore:before,prizesAfter:after,
          physicalExitRecordIndex:index,physicalCardsToOwnerHand:paid,
          exactRootOrdinalIndependentJoin:false});
      }
    }
  }
  assert.equal(usedPhysical.size,exits.length,
    'Unattributed physical Prize exits remain');
  return {
    schema:VERSION,registeredTrials:attempts.length,
    publicPrizeAttackEvents:rows.length,
    sourcePrizeAttackEvents,contenderPrizeAttackEvents,
    independentPhysicalPrizeExitRecords:exits.length,
    uniquelyJoinedEvents:usedPhysical.size,
    physicallyMovedPrizeCards:rows.reduce((n,row)=>
      n+row.physicalCardsToOwnerHand,0),
    paperQualifiedGames:0,competitiveWinRate:null,
    joinLimitation:'Unique trial/seat/turn/Prize-delta/Store-action fingerprint; independent physical observer lacks the exact public attack settlement root ordinal and KO cause token',
    rows
  };
}

module.exports={VERSION,crossjoinNativePhysicalPrizeExits};
