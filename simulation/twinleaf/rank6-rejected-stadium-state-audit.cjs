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
 * Move the native Stadium object into the player's hand. The original
 * prepared game's Pokemon, hand, deck, prizes and all other cards remain.
 * Source-dealt Aichi card counts are NOT claimed by this small fixture.
 * @returns {{a:object,state:object,store:object,stadium:object}}
 */
function makeHeldStadium() {
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

/** @param {{a:object}} f */
function stadiumAction(f){
  const index=f.a.hand.cards.findIndex(c=>c.name==='Thunder Mountain Prism Star');
  assert.ok(index>=0,'Stadium must be held');
  return new PlayCardAction(f.a.id,index,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  });
}

/** @returns {object} */
function main(){
  const legal=makeHeldStadium();
  const locked=makeHeldStadium();
  assert.equal(legal.state.turn,locked.state.turn);
  assert.deepEqual(legal.a.hand.cards.map(c=>c.fullName),
    locked.a.hand.cards.map(c=>c.fullName));
  assert.equal(legal.a.stadiumPlayedTurn,0);
  assert.equal(locked.a.stadiumPlayedTurn,0);

  legal.store.dispatch(stadiumAction(legal));
  assert.ok(legal.a.stadium.cards.includes(legal.stadium));
  assert.ok(!legal.a.hand.cards.includes(legal.stadium));
  assert.equal(legal.a.stadiumPlayedTurn,legal.state.turn);

  locked.a.cannotPlayStadiumCards=true;
  assert.equal(planOpeningHand([{name:'Double Colorless Energy'}],
    false,undefined,false,{stadiumLocked:true}),null);
  let firstReject=null;
  try{locked.store.dispatch(stadiumAction(locked));}
  catch(error){firstReject=error?.message??String(error);}
  assert.equal(firstReject,'BLOCKED_BY_EFFECT');
  assert.ok(locked.a.hand.cards.includes(locked.stadium));
  assert.ok(!locked.a.stadium.cards.includes(locked.stadium));

  const afterRejected=locked.a.stadiumPlayedTurn;
  locked.a.cannotPlayStadiumCards=false;
  let afterClearingLock=null;
  try{locked.store.dispatch(stadiumAction(locked));}
  catch(error){afterClearingLock=error?.message??String(error);}

  const result={
    schema:'rank6-native-rejected-stadium-state-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    preparedNativeState:true,sourceAichiDeal:false,
    firstUnlockedStadiumPlaySucceeded:true,
    lockedPlayRejected:firstReject,
    stadiumWasStillHeldAfterReject:true,
    stadiumPlayedTurnAfterReject:afterRejected,
    rejectedPlayConsumedStadiumAllowance:afterRejected===locked.state.turn,
    laterAfterLockClearedError:afterClearingLock,
    laterStadiumInPlay:locked.a.stadium.cards.includes(locked.stadium),
    laterStadiumStillHeld:locked.a.hand.cards.includes(locked.stadium),
    actualCompleteGame:false,qualifiedForCompetitiveInference:false
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}

if(require.main===module)main();
module.exports={main,makeHeldStadium,stadiumAction};
