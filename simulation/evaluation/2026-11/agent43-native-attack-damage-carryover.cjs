'use strict';

const assert = require('node:assert/strict');

const SCHEMA='aichi-native-public-attack-damage-carryover-v1';

/**
 * Read-only two-hit continuation screen. Native public printing and damage
 * observations are not physical-card identity, full-game paper legality, or
 * an independently evaluated game outcome.
 *
 * @param {object[]} attacks A single actual attacking seat's native attacks.
 * @param {0|1} attackingSeat
 * @returns {object}
 */
function inspectAttackCarryover(attacks,attackingSeat) {
  assert.ok(Array.isArray(attacks));
  assert.ok(attackingSeat===0||attackingSeat===1);
  const defenderSeat=1-attackingSeat;
  const candidates=[];
  const links=[];
  for(let i=0;i<attacks.length;i++) {
    const cur=attacks[i];
    if(cur?.settledPromptChain!==true ||
       cur.settlementCrossesClockReset===true)continue;
    const before=cur.publicBoardBefore?.[defenderSeat]?.active;
    const after=cur.publicBoardAfter?.[defenderSeat]?.active;
    if(!before||!after||typeof before.printing!=='string'||
       before.printing!==after.printing||!Number.isSafeInteger(before.damage)||
       !Number.isSafeInteger(after.damage)||after.damage<=before.damage ||
       (after.damage-before.damage)%10!==0)continue;
    if(!Array.isArray(cur.prizesBefore)||!Array.isArray(cur.prizesAfter)||
       cur.prizesBefore[attackingSeat]!==cur.prizesAfter[attackingSeat])
      continue;
    const seed={
      noPrizeAttackOrdinal:cur.actionOrdinal,
      noPrizeTurn:cur.turnBefore,
      sourceAttackName:cur.attackName,
      defenderPublicPrinting:before.printing,
      defenderPublicDamageBefore:before.damage,
      defenderPublicDamageAfter:after.damage,
      publicDamageCountersAdded:(after.damage-before.damage)/10,
      immediatelyTakenPrizes:0
    };
    candidates.push(seed);
    const follow=attacks[i+1];
    if(!follow||follow.settledPromptChain!==true||
       follow.settlementCrossesClockReset===true||
       !Number.isSafeInteger(follow.actionOrdinal) ||
       follow.actionOrdinal<=cur.actionOrdinal)continue;
    const nextBefore=follow.publicBoardBefore?.[defenderSeat]?.active;
    const nextAfter=follow.publicBoardAfter?.[defenderSeat]?.active;
    const previousPrize=follow.prizesBefore?.[attackingSeat];
    const nextPrize=follow.prizesAfter?.[attackingSeat];
    const prizeDelta=previousPrize-nextPrize;
    if(!nextBefore||nextBefore.printing!==after.printing ||
       nextBefore.damage!==after.damage ||
       !Number.isSafeInteger(prizeDelta)||prizeDelta<=0 ||
       (nextAfter?.printing===nextBefore.printing))continue;
    links.push({
      ...seed,nextAttackOrdinal:follow.actionOrdinal,
      nextAttackName:follow.attackName,
      nextAttackTurn:follow.turnBefore,
      nextAttackPrizesTaken:prizeDelta,
      publicContinuityEvidence:'same-printing-and-unchanged-damage-before-followup',
      samePhysicalDefenderIndependentlyVerified:false,
      printedAttackPaperLegalityVerified:false,
      priorDamageCausallyProven:false,
      attribution:'native-public-two-hit-continuation-candidate'
    });
  }
  return {
    schema:SCHEMA,attackingSeat,defenderSeat,attackSettlementsExamined:attacks.length,
    noPrizePositiveDamageCandidates:candidates,
    candidateTwoHitLinks:links,
    zeroPrizeDamageCountersBeforeLinkedKOs:
      links.reduce((sum,x)=>sum+x.publicDamageCountersAdded,0),
    linkedLaterNativePrizes:links.reduce((sum,x)=>sum+x.nextAttackPrizesTaken,0),
    warning:'Public same-printing continuity alone never proves the physical card identity, printed legality, exclusive causality, or a competitive-paper win.'
  };
}

/**
 * Avoid double-crediting one prize event. Each attacking seat is inspected
 * separately; only the immediately following same-seat settled attack can
 * qualify as a continuation.
 * @param {object} row Unmodified pinned Store trial.
 * @returns {object}
 */
/**
 * The opponent's actual between-hit material actions are visible and must
 * accompany a proposed delayed-knockout credit. Opponent Pass is not proof
 * that the game state prevented useful counterplay.
 * @param {object[]} links Native public two-hit continuation candidates.
 * @param {object[]} roots Actual accepted root tape.
 * @param {0|1} defenderSeat
 * @returns {object[]}
 */
function attachActualOpponentReplies(links,roots,defenderSeat) {
  assert.ok(Array.isArray(roots));
  return links.map(link => {
    const replies=roots.filter(root =>
      root.playerSlot===defenderSeat &&
      root.actionOrdinal>link.noPrizeAttackOrdinal &&
      root.actionOrdinal<link.nextAttackOrdinal &&
      root.action!=='ResolvePromptAction');
    const meaningful=replies.filter(root=>root.action!=='PassTurnAction');
    return {
      ...link,interveningDefenderRootActions:replies.map(root=>({
        ordinal:root.actionOrdinal,turn:root.turnBefore,
        action:root.action,card:root.card??null,attack:root.attack??null
      })),
      interveningDefenderMaterialActionCount:meaningful.length,
      defenderPassedWithoutMaterialAction:
        replies.length>0 && meaningful.length===0 &&
        replies.every(root=>root.action==='PassTurnAction'),
      defenderCounterplayOptionsIndependentlyReviewed:false
    };
  });
}

function inspectNativeGameCarryover(row) {
  assert.ok((row?.sourceSeat===0||row?.sourceSeat===1) &&
    row.candidateSeat===1-row.sourceSeat);
  const source=inspectAttackCarryover(
    row.sourceAttackSettlement?.attacks??[],row.sourceSeat);
  const candidate=inspectAttackCarryover(
    row.candidateAttackSettlement?.attacks??[],row.candidateSeat);
  if(Array.isArray(row.rootActionLedger)) {
    source.candidateTwoHitLinks=attachActualOpponentReplies(
      source.candidateTwoHitLinks,row.rootActionLedger,row.candidateSeat);
    candidate.candidateTwoHitLinks=attachActualOpponentReplies(
      candidate.candidateTwoHitLinks,row.rootActionLedger,row.sourceSeat);
  }
  return {
    schema:SCHEMA,trialId:row.trial?.id??null,
    source,candidate,
    totalCandidateTwoHitLinks:
      source.candidateTwoHitLinks.length+candidate.candidateTwoHitLinks.length,
    competitiveGameQualified:false
  };
}

module.exports={SCHEMA,inspectAttackCarryover,
  attachActualOpponentReplies,inspectNativeGameCarryover};
