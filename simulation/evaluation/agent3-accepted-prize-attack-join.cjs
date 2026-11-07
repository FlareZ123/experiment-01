'use strict';

const assert=require('node:assert/strict');

const VERSION='agent3-accepted-prize-attack-join-v1';

/**
 * Reconcile a genuine physical Prize exit to exactly one previously settled
 * native attack with the appropriate Prize delta in the same registered game.
 * The fixed roles and full accepted public root tapes are required.
 *
 * Only events for which one specific attack accounts for an exact physical
 * Prize packet are admissible. Simultaneous/multi-packet or other sources
 * must be reported as unmatched rather than silently reassigned.
 *
 * @param {object[]} attempts Genuine post-game returned native development rows.
 * @param {object[]} physicalExits Actual Store Prize exits with an independently
 *   bound accepted-root action ordinal.
 * @returns {object[]} One auditable attack-to-physical-Prize join per event.
 */
function joinNativePrizeExitsToSettledAttacks(attempts,physicalExits){
  assert.ok(Array.isArray(attempts));
  assert.ok(Array.isArray(physicalExits));
  const byId=new Map();
  for(const row of attempts){
    assert.equal(typeof row?.trial?.id,'string');
    assert.equal(byId.has(row.trial.id),false,'Duplicate registered native trial');
    assert.ok(row.sourceSeat===0||row.sourceSeat===1);
    assert.equal(row.candidateSeat,1-row.sourceSeat);
    assert.ok(Array.isArray(row.rootActionLedger));
    byId.set(row.trial.id,row);
  }
  const used=new Set();
  return physicalExits.map((exit,eventIndex)=>{
    const row=byId.get(exit.registeredTrialId);
    assert.ok(row,'Prize exit must belong to a registered returned trial');
    const ordinal=exit.acceptedRootActionOrdinal;
    assert.ok(Number.isSafeInteger(ordinal)&&ordinal>=0);
    assert.ok(Number.isSafeInteger(exit.acceptedRootTurnBefore));
    assert.ok(Number.isSafeInteger(exit.turn));
    assert.ok(Number.isSafeInteger(exit.exactExitedCards)&&
      exit.exactExitedCards>0);
    assert.ok(exit.ownerSeat===0||exit.ownerSeat===1);
    assert.equal(exit.byDestination?.hand,exit.exactExitedCards,
      'This gate considers physical Prize cards reaching taking hand');
    const acceptedRoots=row.rootActionLedger.filter(root=>
      root.actionOrdinal===ordinal);
    assert.equal(acceptedRoots.length,1,
      'Physical exit must join exactly one actual accepted root');
    const root=acceptedRoots[0];
    assert.equal(root.action,exit.actionType);
    assert.equal(root.playerSlot,exit.acceptedRootActorSeat);
    assert.equal(root.turnBefore,exit.acceptedRootTurnBefore);
    assert.equal(root.turnAfter,exit.turn);
    const candidates=[
      ['original-source',row.sourceSeat,row.sourceAttackSettlement],
      ['fixed-contender',row.candidateSeat,row.candidateAttackSettlement]
    ].flatMap(([role,seat,report])=>{
      assert.ok(Array.isArray(report?.attacks),
        'Native attack settlement must be complete and authenticated');
      return report.attacks.filter(attack=>
        seat===exit.ownerSeat &&
        attack.settledPromptChain===true &&
        attack.settlementCrossesClockReset!==true &&
        Number.isSafeInteger(attack.actionOrdinal) &&
        Number.isSafeInteger(attack.completionRootOrdinal) &&
        attack.actionOrdinal<=ordinal &&
        ordinal<=attack.completionRootOrdinal &&
        attack.turnBefore===exit.acceptedRootTurnBefore &&
        Array.isArray(attack.prizesBefore) &&
        Array.isArray(attack.prizesAfter) &&
        attack.prizesBefore.length===2 &&
        attack.prizesAfter.length===2 &&
        attack.prizesBefore[seat]-attack.prizesAfter[seat]===
          exit.exactExitedCards
      ).map(attack=>({role,seat,attack}));
    });
    assert.equal(candidates.length,1,
      'Exact native Prize packet must have one settled attacker/prize attribution');
    const {role,seat,attack}=candidates[0];
    const attackId=[exit.registeredTrialId,seat,attack.actionOrdinal].join(':');
    assert.equal(used.has(attackId),false,
      'Cannot charge one attack twice as an independent Prize episode');
    used.add(attackId);
    const declaring= row.rootActionLedger.filter(root=>
      root.actionOrdinal===attack.actionOrdinal);
    assert.equal(declaring.length,1,
      'Settled attack must originate at a unique accepted action');
    assert.equal(declaring[0].playerSlot,seat);
    assert.equal(declaring[0].turnBefore,attack.turnBefore);
    assert.equal(declaring[0].action,attack.triggerAction);
    assert.equal(typeof attack.attackName,'string');
    assert.ok(attack.attackName.length>0);
    return {
      eventIndex,registeredTrialId:exit.registeredTrialId,
      attackRole:role,attackSeat:seat,
      attackName:attack.attackName,
      attackDeclarationRootOrdinal:attack.actionOrdinal,
      attackCompletionRootOrdinal:attack.completionRootOrdinal,
      actualPrizeExitRootOrdinal:ordinal,
      actualPrizeExitRootAction:root.action,
      exactPhysicalPrizeCards:exit.exactExitedCards,
      takerPrizesRemainingBefore:attack.prizesBefore[seat],
      takerPrizesRemainingAfter:attack.prizesAfter[seat],
      sameTurn:attack.turnBefore,
      acceptedStoreAndAttackLineageVerified:true,
      paperValidityCertified:false
    };
  });
}

module.exports={VERSION,joinNativePrizeExitsToSettledAttacks};
