'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {prepare}=require('./iron-thorns-turn2-attack.cjs');
const {planOpeningHand}=
  require('./rank6-broad-thorns-policy.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const {PlayCardAction,PlayerType,SlotType}=
  require(path.join(output,'game/store/actions/play-card-action'));

/**
 * Prepare an actual pinned Store with Thunder Mountain moved to own hand.
 * The synthetic board is only a native rule test, not an Aichi source deal.
 * @returns {{a:object,state:object,store:object,stadium:object}}
 */
function makeHeldStadium(){
  const prepared=prepare(true);
  const {a}=prepared;
  assert.equal(a.stadium.cards.length,1);
  const [stadium]=a.stadium.cards.splice(0,1);
  assert.equal(stadium.name,'Thunder Mountain Prism Star');
  a.hand.cards.push(stadium);
  assert.equal(a.stadium.cards.length,0);
  a.stadiumPlayedTurn=0;
  return {...prepared,stadium};
}

/** @param {{a:object}} fixture */
function stadiumAction(fixture){
  const index=fixture.a.hand.cards.findIndex(
    c=>c.name==='Thunder Mountain Prism Star');
  assert.ok(index>=0,'Stadium must be held');
  return new PlayCardAction(fixture.a.id,index,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  });
}

/** @returns {object} */
function main(){
  const legal=makeHeldStadium();
  const locked=makeHeldStadium();
  assert.deepEqual(legal.a.hand.cards.map(c=>c.fullName),
    locked.a.hand.cards.map(c=>c.fullName));
  assert.equal(legal.a.stadiumPlayedTurn,0);
  assert.equal(locked.a.stadiumPlayedTurn,0);

  legal.store.dispatch(stadiumAction(legal));
  assert.ok(legal.store.state.players[0].stadium.cards.some(
    c=>c.fullName===legal.stadium.fullName));
  assert.equal(legal.store.state.players[0].stadiumPlayedTurn,
    legal.store.state.turn);

  locked.a.cannotPlayStadiumCards=true;
  assert.equal(planOpeningHand([{name:'Double Colorless Energy'}],
    false,undefined,false,{stadiumLocked:true}),null);
  let firstReject=null;
  try{locked.store.dispatch(stadiumAction(locked));}
  catch(error){firstReject=error?.message??String(error);}
  assert.equal(firstReject,'BLOCKED_BY_EFFECT');

  const live=locked.store.state.players[0];
  assert.notEqual(live,locked.a);
  assert.notEqual(locked.store.state,locked.state);
  const stalePreparedPlayerCounter=locked.a.stadiumPlayedTurn;
  const afterRejectedLive={
    stadiumPlayedTurn:live.stadiumPlayedTurn,
    ownHandHasStadium:live.hand.cards.some(
      c=>c.fullName===locked.stadium.fullName),
    ownStadiumInPlay:live.stadium.cards.some(
      c=>c.fullName===locked.stadium.fullName)
  };
  assert.equal(afterRejectedLive.stadiumPlayedTurn,0);
  assert.equal(afterRejectedLive.ownHandHasStadium,true);
  assert.equal(afterRejectedLive.ownStadiumInPlay,false);

  live.cannotPlayStadiumCards=false;
  let afterClearingLock=null;
  try{locked.store.dispatch(stadiumAction({a:live}));}
  catch(error){afterClearingLock=error?.message??String(error);}
  const final=locked.store.state.players[0];
  assert.equal(afterClearingLock,null,
    'Unlocked live retry should be legal after rejected Stadium');
  assert.equal(final.stadiumPlayedTurn,locked.store.state.turn);
  assert.equal(final.stadium.cards.some(
    c=>c.fullName===locked.stadium.fullName),true);
  const result={
    schema:'rank6-native-rejected-stadium-state-v2-live-backup',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    preparedNativeState:true,sourceAichiDeal:false,
    firstUnlockedStadiumPlaySucceeded:true,
    lockedPlayRejected:firstReject,
    afterRejectedLive,stalePreparedPlayerCounter,
    playerReferenceReplaced:true,stateReferenceReplaced:true,
    laterAfterLockClearedError:afterClearingLock,
    laterStadiumInPlay:true,
    liveBackupPreservesAllowance:true,
    actualCompleteGame:false,qualifiedForCompetitiveInference:false
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}

if(require.main===module)main();
module.exports={main,makeHeldStadium,stadiumAction};
