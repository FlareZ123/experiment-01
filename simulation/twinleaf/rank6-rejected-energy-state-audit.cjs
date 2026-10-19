'use strict';

const assert=require('node:assert/strict');
const {makeHeldDce,manualDceAction}=
  require('./rank6-manual-attachment-native-fixture.cjs');
const {dceHandAttachmentBlocked}=
  require('./rank6-broad-thorns-policy.cjs');

/**
 * Characterize the mutation boundary of a rejected real pinned Store action.
 * Both locks are player-visible. The experiment is a prepared native state,
 * never a source-dealt tournament game.
 * @param {'cannotPlayEnergyCards'|'cannotPlaySpecialEnergyCards'} flag
 * @returns {object}
 */
function checkOne(flag){
  const f=makeHeldDce();
  const {a,state,store,dce}=f;
  a.energyPlayedTurn=0;
  a[flag]=true;
  assert.equal(dceHandAttachmentBlocked(a,state),true);
  const before={
    turn:state.turn,energyPlayedTurn:a.energyPlayedTurn,
    activeEnergyCount:a.active.energies.cards.length,
    ownerHasDce:a.hand.cards.includes(dce)
  };
  let rejectedCode=null;
  try{store.dispatch(manualDceAction(f));}
  catch(error){rejectedCode=error?.message??String(error);}
  assert.equal(rejectedCode,'BLOCKED_BY_EFFECT');
  assert.equal(a.hand.cards.includes(dce),true);
  assert.equal(a.active.energies.cards.includes(dce),false);
  const afterRejected={
    turn:state.turn,energyPlayedTurn:a.energyPlayedTurn,
    activeEnergyCount:a.active.energies.cards.length,
    ownerHasDce:a.hand.cards.includes(dce)
  };
  a[flag]=false;
  let laterCode=null;
  try{store.dispatch(manualDceAction(f));}
  catch(error){laterCode=error?.message??String(error);}
  const afterLockCleared={
    energyPlayedTurn:a.energyPlayedTurn,
    activeHasDce:a.active.energies.cards.includes(dce),
    ownerHasDce:a.hand.cards.includes(dce)
  };
  return {flag,rejectedCode,before,afterRejected,
    laterCode,afterLockCleared,
    rejectionConsumedNormalAttachment:
      afterRejected.energyPlayedTurn===state.turn,
    paperFidelityCertified:false};
}

/** @returns {object} */
function main(){
  const broad=checkOne('cannotPlayEnergyCards');
  const special=checkOne('cannotPlaySpecialEnergyCards');
  const summary={
    schema:'rank6-native-rejected-energy-state-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    preparedNativeState:true,sourceAichiDeal:false,
    cases:[broad,special],
    refusalAcceptedAsNoop:!broad.rejectionConsumedNormalAttachment &&
      !special.rejectionConsumedNormalAttachment,
    actualCompleteGame:false,qualifiedForCompetitiveInference:false
  };
  process.stdout.write(JSON.stringify(summary,null,2)+'\n');
  return summary;
}

if(require.main===module)main();
module.exports={main,checkOne};
