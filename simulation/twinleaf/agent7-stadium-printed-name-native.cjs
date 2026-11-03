'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {stageForcedActive,settleNative} =
  require('./agent5-forced-active-marshadow-chain-native.cjs');
const {actorObservation} = require('./actor-observation-contract.cjs');

const OUT = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUT,name));
const {ActionEnumerator} = native('advanced-bot/action-enumerator');
const {PlayCardAction,PlayerType,SlotType} =
  native('game/store/actions/play-card-action');
const BOARD={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};

/** @param {0|1} seat @param {'replace-own'|'same-name-alt'} scenario */
function runArm(seat,scenario) {
  const x=stageForcedActive(seat,'floatstone');
  const manager=initializeCards();
  let nextId=60001;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing native printing '+printing);
    c.id=nextId++;
    return c;
  };
  x.owner.hand.cards.length=0;
  x.owner.stadium.cards.length=0;
  x.opponent.stadium.cards.length=0;
  x.owner.stadiumPlayedTurn=0;
  const original=card('Path to the Peak CRE');
  const attempted=scenario==='replace-own'?
    card('Sky Field ROS'):card('Path to the Peak CRE');
  if(scenario==='replace-own')
    x.owner.stadium.cards.push(original);
  else {
    x.opponent.stadium.cards.push(original);
    // Native manager lacks this second print. Inject only the exact alternate
    // public printing identity from the supplied card database, retaining
    // the original Path effect/name. This is an engine comparator fixture.
    attempted.fullName='Path to the Peak ASR';
    attempted.set='ASR';
    attempted.setNumber='213';
  }
  x.owner.hand.cards.push(attempted);
  const before=actorObservation(x.state,seat);
  const nativeActions=new ActionEnumerator()
    .enumerate(x.state,x.owner,x.owner.id);
  const nativeOffered=nativeActions.some(action=>
    action instanceof PlayCardAction&&action.handIndex===0);
  const expectedNativeOffer=scenario==='same-name-alt';
  assert.equal(nativeOffered,expectedNativeOffer);
  const legalOnPrintedBaseRule=scenario==='replace-own';
  const previousTurn=x.state.turn;
  let accepted=false,rejection=null,prompts=[];
  try {
    x.store.dispatch(new PlayCardAction(x.owner.id,0,BOARD));
    accepted=true;
    prompts=settleNative(x,false);
  } catch(error) {
    rejection=String(error?.message??error);
  }
  assert.equal(accepted,legalOnPrintedBaseRule,
    'Native Store must enforce printed Stadium-name replacement');
  const after=actorObservation(x.state,seat);
  if(accepted){
    assert.deepEqual(after.ownPublic.stadium,['Sky Field ROS']);
    assert.deepEqual(after.ownPublic.discard.includes('Path to the Peak CRE'),true);
    assert.equal(after.ownHand.includes('Sky Field ROS'),false);
    assert.equal(x.owner.stadiumPlayedTurn,previousTurn);
  } else {
    assert.deepEqual(after.opponentPublic.stadium,['Path to the Peak CRE']);
    assert.ok(after.ownHand.includes('Path to the Peak ASR'));
    assert.equal(x.owner.stadiumPlayedTurn,0);
  }
  assert.equal(x.state.turn,previousTurn);
  assert.equal(x.state.activePlayer,seat);
  return {seat,scenario,success:true,nativeOffered,
    printedBaseRuleAllows:legalOnPrintedBaseRule,
    actualStoreAccepted:accepted,rejection,prompts,
    before:{own:before.ownPublic.stadium,opp:before.opponentPublic.stadium},
    after:{own:after.ownPublic.stadium,opp:after.opponentPublic.stadium},
    originalTurnPreserved:true,competitiveQualifiedGames:0};
}
function run(){
  const rows=[];
  for(const seat of [0,1])for(const scenario of ['replace-own','same-name-alt']){
    try {rows.push(runArm(seat,scenario));}
    catch(error){rows.push({seat,scenario,success:false,error:String(error?.stack??error)});}
  }
  return {schema:'agent7-stadium-printed-name-vs-native-enumerator-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows,attempted:4,passed:rows.filter(r=>r.success).length,
    competitiveQualifiedGames:0,
    limitation:'Constructed two-seat native fixtures, not actual shuffled source games.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,runArm};
