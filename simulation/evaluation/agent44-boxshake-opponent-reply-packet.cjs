'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const VERSION='agent44-owner-boxshake-strict-public-reply-packet-v1';
const sha=value=>crypto.createHash('sha256').update(
  JSON.stringify(value)).digest('hex');

/**
 * Separate a source's native firstturn Box+Shake root chronology from
 * real opponent next-turn roots using Store-accepted public action ledger.
 * Never read either player's concealed zones.
 *
 * @param {object} game Native headless output with accepted rootActionLedger.
 * @param {object} audit Shared Box hook append-only public audit.
 * @param {0|1} sourceSeat Physical original rank8 seat.
 * @returns {object} Strict root receipt or documented incomplete reason.
 */
function boxShakeOpponentReplyPacket(game,audit,sourceSeat){
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.ok(Array.isArray(game?.rootActionLedger),
    'Authenticated accepted native root ledger required');
  assert.ok(Array.isArray(audit?.offers));
  assert.ok(Array.isArray(audit?.opponentContinuations));
  const offer=audit.offers.find(row=>row.seat===sourceSeat)??null;
  const reply=audit.opponentContinuations.find(row=>
    row.sourceSeat===sourceSeat)??null;
  const sourceTurn=offer?.turn??null;
  const replayRows=sourceTurn===null?[]:game.rootActionLedger.filter(row=>
    row.playerSlot===sourceSeat&&row.turnBefore===sourceTurn);
  const sourceBoxRoot=replayRows.find(row=>
    row.action==='PlayCardAction'&&row.card==='Secret Box'&&
    row.pendingPrompt===null)??null;
  const sourceShakeRoot=replayRows.find(row=>
    row.action==='PlayCardAction'&&row.card==='Boost Shake'&&
    row.pendingPrompt===null)??null;
  const sourceToolRoot=replayRows.find(row=>
    row.action==='PlayCardAction'&&
    ['Float Stone','Muscle Band'].includes(row.card)&&
    row.pendingPrompt===null)??null;
  const firstOpponentTurn=reply?.turn??null;
  const opponentRoots=firstOpponentTurn===null?[]:
    game.rootActionLedger.filter(row=>
      row.playerSlot===1-sourceSeat&&
      row.turnBefore===firstOpponentTurn&&row.pendingPrompt===null)
      .map(row=>({ordinal:row.actionOrdinal,
        turn:row.turnBefore,action:row.action,
        card:row.card??null,attack:row.attack??null,
        ability:row.ability??null}));
  const temporalValid=Number.isSafeInteger(sourceTurn)&&
    Number.isSafeInteger(firstOpponentTurn)&&
    firstOpponentTurn===sourceTurn+1;
  const settled=Boolean(sourceBoxRoot&&sourceShakeRoot&&
    sourceToolRoot&&reply?.equippedGarbodor&&
    temporalValid&&opponentRoots.length>0);
  return {
    version:VERSION,sourceSeat,
    nativeOfferObserved:Boolean(offer),
    sourceTurn,opponentTurn:firstOpponentTurn,
    sourceBoxRootOrdinal:sourceBoxRoot?.actionOrdinal??null,
    sourceShakeRootOrdinal:sourceShakeRoot?.actionOrdinal??null,
    sourceToolRootOrdinal:sourceToolRoot?.actionOrdinal??null,
    sourceActionOrderValid:Boolean(sourceBoxRoot&&sourceShakeRoot&&
      sourceToolRoot&&
      sourceBoxRoot.actionOrdinal<sourceToolRoot.actionOrdinal&&
      sourceToolRoot.actionOrdinal<sourceShakeRoot.actionOrdinal),
    nativeOpposingActorBoundaryObserved:Boolean(reply),
    equippedGarbodorAtOpposingBoundary:Boolean(reply?.equippedGarbodor),
    opponentRootCount:opponentRoots.length,
    opponentPublicRoots:opponentRoots.slice(0,32),
    opponentPublicRootLedgerSha256:sha(opponentRoots),
    rootClipTruncated:opponentRoots.length>32,
    sourceNextTurnAttackNames:game.rootActionLedger.filter(row=>
      firstOpponentTurn!==null&&row.playerSlot===sourceSeat&&
      row.turnBefore>firstOpponentTurn&&row.action==='AttackAction'
    ).slice(0,10).map(row=>({turn:row.turnBefore,
      attack:row.attack??null})),
    strictPublicContinuationAccepted:settled,
    competitiveQualified:false,
    caveat:'Public native Store roots establish chronology, not owner policy competence, actual paper timing, strategic merit or terminal match outcome.'
  };
}

module.exports={VERSION,boxShakeOpponentReplyPacket};
