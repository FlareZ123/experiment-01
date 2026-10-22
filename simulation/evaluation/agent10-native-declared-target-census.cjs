'use strict';

const assert=require('node:assert/strict');

const VERSION='agent10-native-declared-target-public-slot-census-v1';

/**
 * A native PlayCardAction may carry a valid target parameter even when the
 * played card has no physical Pokémon recipient (for example a deck-search
 * Item). The accepted parameter by itself is not receipt of a board effect.
 *
 * This read-only reduction uses the original captured native Store sidecar.
 * It never accesses a State, deck, Prize card, or opponent's concealed hand.
 *
 * @param {object} event Accepted Store record from targetSidecar.
 * @returns {object}
 */
function classifyAcceptedTarget(event){
  const changes=event?.publicBoardChanges;
  const declared=event?.declared;
  const base={
    actionOrdinal:event?.rootActionOrdinal??null,
    turn:event?.turnBefore??null,
    playerSlot:event?.playerSlot??null,
    card:declared?.ownerHandPrinting??null
  };
  if(event?.storeAccepted!==true||
    event.visibility!=='public-after-dispatch'||
    declared?.status!=='captured'||!Array.isArray(changes))
    return {...base,category:'unverified',reason:'missing-accepted-public-receipt'};

  if(declared.kind==='retreat'){
    const bench=declared.benchIndex;
    const movedActive=changes.some(x=>
      x.seat===event.playerSlot&&x.position==='active'&&x.index===0);
    const movedBench=changes.some(x=>
      x.seat===event.playerSlot&&x.position==='bench'&&x.index===bench);
    if(Number.isSafeInteger(bench)&&bench>=0&&movedActive&&movedBench)
      return {...base,category:'retreat-board-slot-confirmed'};
    return {...base,category:'unverified',reason:'retreat-public-delta-missing'};
  }

  if(declared.kind!=='play-card')
    return {...base,category:'unverified',reason:'unsupported-declared-action'};

  const target=declared.target;
  // Observed current native action geometry: player=2 denotes the actor's
  // own field; slot=1 is Active and slot=2 is Bench. Do not extrapolate this
  // coordinate meaning to unrelated engine action classes or prompt types.
  const ownBoard=target?.player===2&&
    (target.slot===1||target.slot===2)&&
    Number.isSafeInteger(target.index)&&target.index>=0;
  if(ownBoard){
    const position=target.slot===1?'active':'bench';
    const changed=changes.some(x=>
      x.seat===event.playerSlot&&x.position===position&&
      x.index===target.index);
    if(changed){
      return {...base,category:'declared-own-slot-public-delta-confirmed',
        position,index:target.index};
    }
    return {...base,category:'unverified',reason:'targeted-own-slot-no-public-delta'};
  }

  return {...base,category:'coordinate-only-unverified',
    reason:'native-PlayCard-target-without-verified-own-board-recipient'};
}

/**
 * Summarize every recorded accepted target parameter without converting
 * unspecified physical recipient semantics into a positive observation.
 *
 * @param {object} sidecar
 * @returns {object}
 */
function auditAcceptedTargetSemantics(sidecar){
  assert.ok(sidecar&&typeof sidecar==='object');
  assert.ok(Array.isArray(sidecar.events));
  const linked=sidecar.rootOrdinalLinked===true;
  const records=sidecar.events.map(event=>{
    const result=classifyAcceptedTarget(event);
    return linked?result:{
      ...result,category:'unverified',reason:'root-ordinal-not-linked'
    };
  });
  const counts={};
  for(const row of records)counts[row.category]=(counts[row.category]??0)+1;
  return {
    version:VERSION,
    nativeRootOrdinalsLinked:linked,
    acceptedDeclaredPlayOrRetreat:records.length,
    publicOwnRecipientConfirmed:(
      counts['declared-own-slot-public-delta-confirmed']??0)+
      (counts['retreat-board-slot-confirmed']??0),
    coordinateOnlyUnverified:counts['coordinate-only-unverified']??0,
    additionalUnverified:counts.unverified??0,
    byCategory:counts,
    records,
    note:'A verified public slot delta is a limited receipt. Accepted PlayCardAction coordinates without a recipient delta remain unverified. This never certifies paper rules or full-game state.'
  };
}

module.exports={VERSION,classifyAcceptedTarget,auditAcceptedTargetSemantics};
