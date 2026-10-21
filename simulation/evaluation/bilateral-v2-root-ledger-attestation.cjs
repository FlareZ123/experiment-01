'use strict';

const assert=require('node:assert/strict');

/**
 * Independently bind a proposed v2 bilateral pressure/reply claim to actual
 * successful Store root actions. The source and candidate policies never read
 * these postgame observations.
 *
 * This verifier authenticates actor, turn, ordinal and dispatch continuity
 * against the supplied root transcript. A transcript must separately be
 * preserved and SHA-256 checked against the frozen artifact. It does not
 * interpret native Pokémon effects, prove paper legality or certify a match.
 *
 * @param {object} row Proposed bilateral observation with sourcePressure,
 *   candidateReply, sourceContinuation and rootActionCount.
 * @param {object[]} ledger Raw actual-store-root-action-ledger-v1 rows.
 * @param {0|1} candidateSeat Physical candidate seat.
 * @returns {object} Read-only source and reply claim evidence.
 */
function attestBilateralRootClaims(row,ledger,candidateSeat){
  assert.ok(candidateSeat===0||candidateSeat===1);
  assert.ok(Array.isArray(ledger),'Actual Store root ledger required');
  assert.ok(Number.isSafeInteger(row?.rootActionCount)&&
    row.rootActionCount>=0);
  assert.equal(ledger.length,row.rootActionCount,
    'Preserved ledger must include every successful Store root');
  for(let i=0;i<ledger.length;i++){
    const root=ledger[i];
    assert.equal(root?.actionOrdinal,i,
      'Store ledger must preserve every consecutive root ordinal');
    assert.ok(Number.isSafeInteger(root.turnBefore)&&root.turnBefore>=0,
      'Store root turn required');
    assert.ok([-1,0,1].includes(root.playerSlot),
      'Store root physical actor slot required');
    assert.ok(typeof root.action==='string'&&root.action.length>0,
      'Store root action class required');
    if(i>0){
      const previous=ledger[i-1].turnBefore;
      assert.ok(root.turnBefore>=previous && root.turnBefore<=previous+1,
        'Complete Store ledger cannot skip or reverse global turns');
    }
    // A native replay can reset the turn counter while dealing a new set of
    // Prizes. Such roots must first be partitioned by authenticated game
    // epoch, with separately bound source-deal identities. Never join one
    // bilateral witness across an unchecked replay boundary.
    assert.ok(Number.isSafeInteger(root.turnAfter)&&
      root.turnAfter>=root.turnBefore,
      'Native Store turnAfter required; a replay reset needs epoch attestation');
    if(i>0){
      assert.equal(root.turnBefore,ledger[i-1].turnAfter,
        'Consecutive native Store roots must preserve before/after turn continuity');
    }
  }
  const sourceSeat=1-candidateSeat;
  /**
   * @param {unknown} ordinal
   * @param {0|1} seat
   * @param {unknown} turn
   * @returns {boolean}
   */
  function rootMatches(ordinal,seat,turn){
    return Number.isSafeInteger(ordinal)&&ordinal>=0&&
      ordinal<ledger.length&&Number.isSafeInteger(turn)&&turn>=1&&
      ledger[ordinal].playerSlot===seat&&
      ledger[ordinal].turnBefore===turn;
  }
  const pressure=row?.sourcePressure;
  const candidate=row?.candidateReply;
  const source=row?.sourceContinuation;
  const pressureRoot=rootMatches(pressure?.rootActionOrdinal,
    sourceSeat,pressure?.turnBefore);
  // An actual source attack or search can finish on an unowned ShuffleDeck
  // prompt (seat -1), or on a defender-owned choice. Bind that final
  // ResolvePromptAction to its real source-owned initiating Store root.
  const completionOrdinal=pressure?.completionOrdinal;
  const completed=Number.isSafeInteger(completionOrdinal)?
    ledger[completionOrdinal]:null;
  const origin=completed?.initiatingRootActionOrdinal;
  const promptSourceOrigin=completed?.action==='ResolvePromptAction'&&
    Number.isSafeInteger(origin)&&origin>=pressure?.rootActionOrdinal&&
    origin<completionOrdinal&&ledger[origin]?.playerSlot===sourceSeat&&
    ledger[origin].action!=='ResolvePromptAction';
  const pressureCompletion=pressureRoot&&
    Number.isSafeInteger(completionOrdinal)&&completionOrdinal>=0&&
    completionOrdinal<ledger.length&&
    completed.turnBefore===pressure?.completionTurnBefore&&
    (completed.playerSlot===sourceSeat||promptSourceOrigin);
  const candidateReply=rootMatches(candidate?.rootActionOrdinal,
    candidateSeat,candidate?.turnBefore);
  const sourceContinuation=rootMatches(source?.rootActionOrdinal,
    sourceSeat,source?.turnBefore);
  const ordered=pressureRoot&&pressureCompletion&&candidateReply&&
    sourceContinuation&&
    pressure.rootActionOrdinal<=pressure.completionOrdinal&&
    pressure.completionOrdinal<candidate.rootActionOrdinal&&
    candidate.rootActionOrdinal<source.rootActionOrdinal;
  // Bonus-turn claims are optional unless the source next acts at t+3.
  // A matched issuer, prompt close and new-own-turn actor all are required.
  const bonus=row?.candidateBonusTurn;
  // Only a direct printed Timeless-GX attack can be attested here.
  // A copied bonus-turn attack needs separate native copied-effect evidence.
  const grantIsAttack=Number.isSafeInteger(bonus?.grantRootActionOrdinal)&&
    ledger[bonus.grantRootActionOrdinal]?.action==='AttackAction'&&
    ledger[bonus.grantRootActionOrdinal]?.attack==='Timeless-GX';
  // Prompt closure must descend from this actual attack. Prompt actors can
  // be unowned or defender-owned, and unrelated later roots cannot close it.
  const bonusClose=Number.isSafeInteger(bonus?.completionOrdinal)?
    ledger[bonus.completionOrdinal]:null;
  const bonusClosureRooted=Boolean(bonusClose&&
    bonusClose.turnBefore===bonus?.completionTurnBefore&&
    (bonus.completionOrdinal===bonus.grantRootActionOrdinal ||
      (bonusClose.action==='ResolvePromptAction'&&
        bonusClose.initiatingRootActionOrdinal===bonus.grantRootActionOrdinal)));
  const bonusTurnRootChain=Boolean(ordered&&bonus&&grantIsAttack&&
    bonusClosureRooted&&
    rootMatches(bonus.grantRootActionOrdinal,candidateSeat,
      bonus.grantTurnBefore)&&
    rootMatches(bonus.nextOwnRootActionOrdinal,candidateSeat,
      bonus.nextOwnTurnBefore)&&
    bonus.grantRootActionOrdinal<=bonus.completionOrdinal&&
    bonus.completionOrdinal<bonus.nextOwnRootActionOrdinal&&
    candidate.rootActionOrdinal<=bonus.grantRootActionOrdinal&&
    bonus.nextOwnRootActionOrdinal<source.rootActionOrdinal);
  const consecutive=ordered&&
    pressure.completionTurnBefore===pressure.turnBefore&&
    candidate.turnBefore===pressure.turnBefore+1&&
    (source.turnBefore===pressure.turnBefore+2||
      (source.turnBefore===pressure.turnBefore+3&&bonusTurnRootChain));
  return Object.freeze({
    schema:'bilateral-v2-actual-store-root-claim-attestation-v1',
    checkedRoots:ledger.length,
    pressureRoot,pressureCompletion,candidateReply,sourceContinuation,
    ordered,consecutive,bonusTurnRootChain,
    rootClaimsAuthenticated:Boolean(ordered&&consecutive),
    sourceFirstTurnPressureAuthenticated:Boolean(ordered&&consecutive&&
      pressure.turnBefore===1&&
      row.actualStarterSeat===sourceSeat),
    effectAndPaperFidelityAuthenticated:false,
    hiddenPolicyInformationSetAuthenticated:false
  });
}

module.exports={attestBilateralRootClaims};
