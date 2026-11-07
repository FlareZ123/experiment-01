'use strict';

const assert=require('node:assert/strict');

const VERSION='agent3-postprize-owner-reply-projection-v1';

/**
 * Project an already-captured *post-policy-choice* owner-visible hand and
 * actual first response turn onto an exact physical Prize-taking source
 * attack. Reuses the genuine headless decision trace's
 * candidateRepliesAfterSourceAttacks packet without changing policy.
 *
 * A complete actual Pass turn does not imply the bot had a playable attack;
 * printed costs, special Energy, legal search and lock still require audit.
 *
 * @param {object[]} attempts Native full-development attempt rows with true
 *   rootActionLedger and candidateRepliesAfterSourceAttacks.
 * @param {object[]} exactPrizeAttackJoins V27 accepted physical Prize roots,
 *   source/contender roles and genuinely settled attack spans.
 * @returns {object[]} All source-caused Prize events, including explicit
 *   censored/unknown responses when owner telemetry is unavailable.
 */
function projectOwnerRepliesAfterSourcePrize(attempts,exactPrizeAttackJoins){
  assert.ok(Array.isArray(attempts));
  assert.ok(Array.isArray(exactPrizeAttackJoins));
  const byId=new Map();
  for(const row of attempts){
    assert.equal(typeof row.trial?.id,'string');
    assert.equal(byId.has(row.trial.id),false);
    assert.ok(row.sourceSeat===0||row.sourceSeat===1);
    assert.equal(row.candidateSeat,1-row.sourceSeat);
    assert.ok(Array.isArray(row.rootActionLedger));
    assert.ok(Array.isArray(row.candidateRepliesAfterSourceAttacks));
    byId.set(row.trial.id,row);
  }
  return exactPrizeAttackJoins.filter(attack=>
    attack.attackRole==='original-source').map(attack=>{
    const row=byId.get(attack.registeredTrialId);
    assert.ok(row,'Original source Prize needs exact registered native trial');
    assert.equal(attack.attackSeat,row.sourceSeat);
    assert.ok(Number.isSafeInteger(attack.attackDeclarationRootOrdinal));
    assert.ok(Number.isSafeInteger(attack.actualPrizeExitRootOrdinal));
    assert.ok(Number.isSafeInteger(attack.attackCompletionRootOrdinal));
    assert.ok(attack.attackDeclarationRootOrdinal<=
      attack.actualPrizeExitRootOrdinal);
    assert.ok(attack.actualPrizeExitRootOrdinal<=
      attack.attackCompletionRootOrdinal);
    const replies=row.candidateRepliesAfterSourceAttacks.filter(packet=>
      packet.sourceAttackOrdinal===attack.attackDeclarationRootOrdinal);
    assert.equal(replies.length,1,
      'Each physical source Prize attack needs exactly one existing owner reply');
    const reply=replies[0];
    assert.equal(reply.sourceTurn,attack.sameTurn);
    assert.equal(reply.sourceAttackName,attack.attackName);
    const nativeRoots=row.rootActionLedger;
    const first=reply.candidateReplyOrdinal;
    const ownerRoot=Number.isSafeInteger(first)?
      nativeRoots.filter(root=>root.actionOrdinal===first):[];
    if(Number.isSafeInteger(first)){
      assert.equal(ownerRoot.length,1,'Next owner root must exist exactly once');
      assert.equal(ownerRoot[0].playerSlot,row.candidateSeat);
      assert.equal(ownerRoot[0].action,reply.candidateReplyAction);
      assert.equal(ownerRoot[0].turnBefore,reply.candidateReplyTurn);
      assert.ok(first>attack.attackCompletionRootOrdinal,
        'Owner voluntary reply must follow settled Prize-causing attack');
    }else{
      assert.equal(reply.candidateReplyTurn,null);
      assert.equal(reply.candidateReplyAction,null);
    }
    const sameEpoch=reply.sameEpochCandidateReplyVerified===true;
    const pass=reply.candidateReplyTurnFinalPass??null;
    const actualPassRoot=pass&&Number.isSafeInteger(pass.ordinal)?
      nativeRoots.filter(root=>root.actionOrdinal===pass.ordinal):[];
    if(pass){
      assert.equal(actualPassRoot.length,1);
      assert.equal(actualPassRoot[0].playerSlot,row.candidateSeat);
      assert.equal(actualPassRoot[0].turnBefore,reply.candidateReplyTurn);
      assert.equal(actualPassRoot[0].action,'PassTurnAction');
      assert.ok(pass.ordinal>=first);
      assert.ok(Array.isArray(pass.ownerHandAfterDecision)||pass.ownerHandAfterDecision===null);
    }
    const turnActions=reply.candidateReplyTurnRootSequence;
    assert.ok(Array.isArray(turnActions));
    if(pass){
      assert.equal(turnActions.some(root=>
        root.ordinal===pass.ordinal&&root.action==='PassTurnAction'),true);
    }
    return {
      registeredTrialId:attack.registeredTrialId,
      originalSourceSeat:row.sourceSeat,candidateOwnerSeat:row.candidateSeat,
      causalOriginalAttackName:attack.attackName,
      causalOriginalAttackOrdinal:attack.attackDeclarationRootOrdinal,
      causalSourcePrizeRootOrdinal:attack.actualPrizeExitRootOrdinal,
      causalSourcePrizeCards:attack.exactPhysicalPrizeCards,
      settledSourceAttackCompletionRoot:attack.attackCompletionRootOrdinal,
      candidateReplyStatus:reply.status,
      sameEpochCandidateReplyVerified:sameEpoch,
      firstCandidateResponseRootOrdinal:first,
      firstCandidateResponseAction:reply.candidateReplyAction,
      candidateReplyNativeTurn:reply.candidateReplyTurn,
      completeCandidateTurnActions:turnActions,
      nativeObservedFinalPassRootOrdinal:pass?.ordinal??null,
      ownerHandPrintingsBeforeFinalPass:Array.isArray(pass?.ownerHandAfterDecision)?
        [...pass.ownerHandAfterDecision]:null,
      ownerPublicBoardBeforeFinalPass:pass?.publicBoardBeforePass??null,
      activeBasicEnergyOnlyPrintedCostAuditBeforeFinalPass:
        pass?.printedBasicEnergyBeforePass??null,
      postChoiceNativeAttackPassProbe:pass?.postChoiceAttackProbe??null,
      nativeAcceptedActualResponse:true,
      ownerHandCapturedAfterPolicyChoice:
        Array.isArray(pass?.ownerHandAfterDecision),
      alternateActionPaperLegalityCertified:false
    };
  });
}
module.exports={VERSION,projectOwnerRepliesAfterSourcePrize};
