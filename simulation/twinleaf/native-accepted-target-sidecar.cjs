'use strict';

const {createHash}=require('node:crypto');
const {isDeepStrictEqual}=require('node:util');

const SCHEMA='actual-store-declared-target-sidecar-v1';

/** @param {object} slot A public in-play Active or Bench slot. */
function publicSlot(slot){
  const pokemon=slot.getPokemonCard();
  return {
    pokemon:pokemon?.fullName??null,
    energies:slot.energies.cards.map(card=>card.fullName),
    tools:slot.tools.map(card=>card.fullName)
  };
}

/**
 * Record positions, preserving empty Bench indices. In SETUP and
 * WAITING_FOR_PLAYERS even placed Pokemon are face-down; refuse to reveal them.
 * @param {object} state Original pinned Store State.
 * @returns {object[]|null} Public physical board only.
 */
function publicTargetBoard(state){
  if(state.phase===0||state.phase===1)return null;
  return state.players.map((player,seat)=>({
    seat,active:publicSlot(player.active),bench:player.bench.map(publicSlot)
  }));
}

/** @param {object} action @param {object} state @param {0|1} seat */
function declaredActionTarget(action,state,seat){
  if(seat!==0&&seat!==1)return null;
  const type=action?.constructor?.name;
  if(type==='PlayCardAction'){
    const target=action.target;
    const known=target&&['player','slot','index']
      .every(key=>Number.isSafeInteger(target[key]));
    return {
      kind:'play-card',status:known?'captured':'target-unobserved',
      handIndex:action.handIndex,
      ownerHandPrinting:state.players[seat].hand.cards[action.handIndex]?.fullName??null,
      target:known?{player:target.player,slot:target.slot,index:target.index}:null
    };
  }
  if(type==='RetreatAction'){
    const known=Number.isSafeInteger(action.benchIndex);
    return {
      kind:'retreat',status:known?'captured':'target-unobserved',
      benchIndex:known?action.benchIndex:null
    };
  }
  return null;
}

/**
 * Capture once just before native Store.dispatch, AFTER all actor decisions.
 * No bot receives this record. Other roots are represented in legacy ledger.
 * @param {object} state
 * @param {object} action
 * @param {0|1} seat
 * @param {number} ordinal
 * @param {number} turnBefore
 */
function beforeAcceptedTarget(state,action,seat,ordinal,turnBefore){
  const declared=declaredActionTarget(action,state,seat);
  if(!declared)return null;
  return {actionOrdinal:ordinal,turnBefore,playerSlot:seat,
    action:action.constructor.name,declared,publicBefore:publicTargetBoard(state)};
}

/** @param {object[]|null} prior @param {object[]|null} after */
function changedPublicSlots(prior,after){
  if(!prior||!after)return null;
  const changes=[];
  for(let seat=0;seat<after.length;seat++){
    const old=prior[seat],current=after[seat];
    for(const [position,index,before,now] of [
      ['active',0,old.active,current.active],
      ...current.bench.map((slot,index)=>[
        'bench',index,old.bench[index],slot
      ])
    ]){
      if(!isDeepStrictEqual(before,now))
        changes.push({seat,position,index,before,after:now});
    }
  }
  return changes;
}

/**
 * Call only after original Store.dispatch returned without throwing.
 * The declared native target and visible post-dispatch changes are separate
 * evidence; a successful dispatch need not imply a persistent attachment.
 * @param {object} before
 * @param {object} afterState
 */
function afterAcceptedTarget(before,afterState){
  const after=publicTargetBoard(afterState);
  return {
    schema:SCHEMA,
    actionOrdinal:before.actionOrdinal,turnBefore:before.turnBefore,
    playerSlot:before.playerSlot,action:before.action,
    declared:before.declared,storeAccepted:true,
    publicBoardChanges:changedPublicSlots(before.publicBefore,after),
    visibility:before.publicBefore&&after?'public-after-dispatch':'target-unobserved'
  };
}

/** @param {object[]} receipts Actual accepted-target rows. */
function targetSidecar(receipts){
  const canonical=receipts.map(row=>({...row}));
  return {schema:SCHEMA,events:canonical,
    sha256:createHash('sha256').update(JSON.stringify(canonical)).digest('hex'),
    observedTargetActions:canonical.length,
    targetUnobserved:canonical.filter(row=>
      row.declared.status!=='captured'||row.visibility==='target-unobserved').length,
    scope:'Accepted root PlayCardAction and RetreatAction; selective physical target evidence, no competitive qualification'};
}

/**
 * Strictly compare target-bearing accepted roots. Null/missing geometry
 * precludes a physical identity assertion, even if legacy root hashes agree.
 * @param {object} left
 * @param {object} right
 */
function firstPhysicalTargetDifference(left,right){
  if(left?.schema!==SCHEMA||right?.schema!==SCHEMA||
    !Array.isArray(left.events)||!Array.isArray(right.events))
    return {status:'target-unobserved',reason:'missing-or-wrong-protocol'};
  const a=left.events,b=right.events;
  for(let i=0;i<Math.max(a.length,b.length);i++){
    const l=a[i],r=b[i];
    if(!l||!r)return {status:'different',index:i,reason:'target-root-count'};
    if(l.declared.status!=='captured'||r.declared.status!=='captured'||
      l.visibility!=='public-after-dispatch'||r.visibility!=='public-after-dispatch')
      return {status:'target-unobserved',index:i,reason:'missing-physical-target'};
    if(!isDeepStrictEqual(l,r))
      return {status:'different',index:i,
        firstOrdinal:l.actionOrdinal,secondOrdinal:r.actionOrdinal};
  }
  return {status:'same-observed-targets',observed:a.length,
    scope:'Only PlayCardAction and RetreatAction targets'};
}

module.exports={SCHEMA,publicSlot,publicTargetBoard,
  declaredActionTarget,beforeAcceptedTarget,changedPublicSlots,
  afterAcceptedTarget,targetSidecar,firstPhysicalTargetDifference};
