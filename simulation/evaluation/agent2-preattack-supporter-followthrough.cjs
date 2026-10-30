'use strict';

const assert=require('node:assert/strict');
const VERSION='agent2-preattack-supporter-public-followthrough-v1';

/**
 * Keep the accepted post-dispatch root fields visible to both players.
 * The source ledger contains public actions only, no owner or opponent hands.
 * @param {object|null|undefined} row A native Store accepted-root entry.
 * @returns {object|null}
 */
function publicRoot(row){
  if(!row)return null;
  return {
    actionOrdinal:row.actionOrdinal,
    turnBefore:row.turnBefore,
    turnAfter:row.turnAfter,
    playerSlot:row.playerSlot,
    action:row.action,
    pendingPrompt:row.pendingPrompt??null,
    card:row.card??null,
    attack:row.attack??null,
    ability:row.ability??null
  };
}

/**
 * Recover one genuine played Supporter and subsequent turns. This only sees
 * accepted native Store ledger events, with turn-aligned post-dispatch
 * Supporter roots. It does not infer the value of the choice, paper legality,
 * printed draw resolution or competence from an accepted root.
 *
 * @param {object} treated Canonical native trial row.
 * @param {Array<object>} selectedOwnerIntents Typed pre-attack choices.
 * @returns {object} Read-only, bounded, public sequence witness.
 */
function auditPreAttackSupporterFollowThrough(treated,selectedOwnerIntents){
  assert.ok(treated&&typeof treated==='object');
  assert.ok(Array.isArray(selectedOwnerIntents));
  const ledger=treated.rootActionLedger;
  if(selectedOwnerIntents.length===0)return {
    version:VERSION,selectedCount:0,verifiedPlayedRootCount:0,
    status:'no-selected-pre-attack-supporter'
  };
  if(!Array.isArray(ledger))return {
    version:VERSION,selectedCount:selectedOwnerIntents.length,
    verifiedPlayedRootCount:0,status:'source-public-root-ledger-missing'
  };
  const records=[];
  for(const selected of selectedOwnerIntents){
    const intent=selected.intent??selected;
    const seat=selected.seat;
    const turn=selected.globalTurn;
    const printing=intent.printing;
    if(!Number.isSafeInteger(turn)||turn<2||![0,1].includes(seat)||
        intent.kind!=='play-conservative-shuffle-supporter'||
        typeof printing!=='string'){
      records.push({status:'typed-intent-metadata-invalid'});
      continue;
    }
    const fullNameMatch=/^(Lillie's Determination|Marnie|Iono) (.+)$/.exec(printing);
    if(!fullNameMatch){
      records.push({status:'unsupported-printed-family',seat,turn});
      continue;
    }
    const accepted=ledger.filter(row=>
      row?.action==='PlayCardAction'&&row.pendingPrompt===null&&
      row.playerSlot===seat&&row.turnBefore===turn&&
      row.card===fullNameMatch[1]);
    if(accepted.length!==1){
      records.push({status:'nonunique-native-supporter-root',seat,turn,
        nativeMatchCount:accepted.length});
      continue;
    }
    const chosen=accepted[0];
    const nextOwnSameTurn=ledger.find(row=>
      row?.actionOrdinal>chosen.actionOrdinal&&row.playerSlot===seat&&
      row.turnBefore===turn&&row.pendingPrompt===null);
    const firstOpponent=ledger.find(row=>
      row?.actionOrdinal>chosen.actionOrdinal&&row.playerSlot===1-seat&&
      row.turnBefore>turn&&row.pendingPrompt===null);
    const subsequentOwn=firstOpponent?ledger.find(row=>
      row?.actionOrdinal>firstOpponent.actionOrdinal&&row.playerSlot===seat&&
      row.turnBefore>firstOpponent.turnBefore&&row.pendingPrompt===null):null;
    records.push({
      status:'native-play-card-root-verified',seat,turn,
      family:intent.family??fullNameMatch[1],
      printedCard:printing,
      playedRoot:publicRoot(chosen),
      nextOwnSameTurnRoot:publicRoot(nextOwnSameTurn),
      firstOpponentNewTurnRoot:publicRoot(firstOpponent),
      nextOwnAfterOpponentRoot:publicRoot(subsequentOwn),
      sameTurnContinuationObserved:Boolean(nextOwnSameTurn),
      opponentNewTurnContinuationObserved:Boolean(firstOpponent),
      nextOwnerTurnContinuationObserved:Boolean(subsequentOwn),
      opponentReplyMeaning:'native-public-root-only; strategic response not certified',
      fullPrintedDrawMeaning:'requires independent native prompt settlement audit'
    });
  }
  return {version:VERSION,selectedCount:selectedOwnerIntents.length,
    verifiedPlayedRootCount:records.filter(x=>
      x.status==='native-play-card-root-verified').length,
    status:'root-audit-complete',records,
    competitiveGameQualified:false};
}

module.exports={VERSION,publicRoot,auditPreAttackSupporterFollowThrough};
