'use strict';

const assert=require('node:assert/strict');
const {makeHeldDce,manualDceAction}=
  require('./rank6-manual-attachment-native-fixture.cjs');
const {dceHandAttachmentBlocked}=
  require('./rank6-broad-thorns-policy.cjs');

/**
 * Audit the LIVE Store state after a rejected pinned-engine action. A caught
 * Store error replaces store.state with a deep-cloned backup. References
 * captured before rejection therefore become stale; observe both separately.
 * This is a prepared native fixture, not a source-dealt Aichi tournament game.
 * @param {'cannotPlayEnergyCards'|'cannotPlaySpecialEnergyCards'} flag
 * @returns {object}
 */
function checkOne(flag){
  const f=makeHeldDce();
  const {a,state,store,dce}=f;
  a.energyPlayedTurn=0;
  a[flag]=true;
  assert.equal(store.state.players[0],a);
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

  const live=store.state.players[0];
  assert.notEqual(live,a,'Rejected Store must replace the original Player');
  assert.notEqual(store.state,state,'Rejected Store must restore cloned State');
  const afterRejectedLive={
    turn:store.state.turn,energyPlayedTurn:live.energyPlayedTurn,
    activeEnergyCount:live.active.energies.cards.length,
    ownerHasDce:live.hand.cards.some(c=>c.fullName===dce.fullName)
  };
  const stalePreparedPlayerCounter=a.energyPlayedTurn;
  assert.equal(afterRejectedLive.energyPlayedTurn,before.energyPlayedTurn,
    'The live Store must preserve the normal Energy allowance on rejection');
  assert.equal(afterRejectedLive.activeEnergyCount,0);
  assert.equal(afterRejectedLive.ownerHasDce,true);

  // Remove the synthetic lock from the actual live restored player and
  // re-dispatch the same physical printed Energy from its current hand.
  live[flag]=false;
  assert.equal(dceHandAttachmentBlocked(live,store.state),false);
  let laterCode=null;
  try{store.dispatch(manualDceAction({a:live}));}
  catch(error){laterCode=error?.message??String(error);}
  const final=store.state.players[0];
  const afterLockCleared={
    energyPlayedTurn:final.energyPlayedTurn,
    activeHasDce:final.active.energies.cards.some(
      c=>c.fullName===dce.fullName),
    ownerHasDce:final.hand.cards.some(c=>c.fullName===dce.fullName)
  };
  assert.equal(laterCode,null,'Unblocked live retry should be legal');
  assert.equal(afterLockCleared.activeHasDce,true);
  assert.equal(afterLockCleared.ownerHasDce,false);
  return {
    flag,rejectedCode,before,afterRejectedLive,stalePreparedPlayerCounter,
    playerReferenceReplaced:true,stateReferenceReplaced:true,
    laterCode,afterLockCleared,
    rejectionConsumedLiveNormalAttachment:
      afterRejectedLive.energyPlayedTurn===store.state.turn,
    paperFidelityCertified:false
  };
}

/** @returns {object} */
function main(){
  const broad=checkOne('cannotPlayEnergyCards');
  const special=checkOne('cannotPlaySpecialEnergyCards');
  const summary={
    schema:'rank6-native-rejected-energy-state-v2-live-backup',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    preparedNativeState:true,sourceAichiDeal:false,
    cases:[broad,special],
    liveBackupPreservesAllowance:
      broad.afterRejectedLive.energyPlayedTurn===broad.before.energyPlayedTurn &&
      special.afterRejectedLive.energyPlayedTurn===special.before.energyPlayedTurn,
    actualCompleteGame:false,qualifiedForCompetitiveInference:false
  };
  process.stdout.write(JSON.stringify(summary,null,2)+'\n');
  return summary;
}

if(require.main===module)main();
module.exports={main,checkOne};
