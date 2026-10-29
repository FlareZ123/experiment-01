'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage,nativeAttack}=
  require('./agent5-attack-special-arbitration-native.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=
  require('./agent34-actor-only-root-policy.cjs');
const {arbitrateOwnerRootIntent,VERSION}=
  require('./agent41-owner-root-arbitration.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('./agent5-owner-root-slice.cjs');
const native=p=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));

/**
 * Original pinned Store both-seat staged positive plus a last-Prize resource
 * hold negative. Both are static fixtures, not original Aichi opening deals.
 * @param {0|1} seat Actual owner position.
 * @returns {object} Bounded native receipts.
 */
function evaluateSeat(seat){
  const x=stage(seat);
  const options={publicContextSpecialEnergy:true};
  const view=actorObservation(x.state,seat);
  const first=chooseActorRootIntent(view,x.catalog,options);
  assert.deepEqual(first,{kind:'attack',attackName:'Gnaw'});
  const arbitration=arbitrateOwnerRootIntent(view,x.catalog,first,options);
  assert.deepEqual(arbitration.intent,{
    kind:'attach-special-energy',
    printing:'Double Dragon Energy ROS',handIndex:0,slot:'bench',index:1
  });
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const before=rootPhysicalSnapshot(x.state,seat,arbitration.intent);
  x.store.dispatch(new PlayCardAction(x.owner.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1}));
  const after=rootPhysicalSnapshot(x.state,seat,arbitration.intent);
  assert.equal(rootPhysicalWitness(arbitration.intent,before,after,x.GamePhase),
    'confirmed-public-effect');
  assert.equal(x.owner.bench[1].energies.cards[0]?.fullName,
    'Double Dragon Energy ROS');
  assert.equal(x.state.turn,2);
  const afterView=actorObservation(x.state,seat);
  const later=chooseActorRootIntent(afterView,x.catalog,options);
  assert.deepEqual(later,{kind:'attack',attackName:'Gnaw'});
  const laterArbitration=arbitrateOwnerRootIntent(
    afterView,x.catalog,later,options);
  assert.deepEqual(laterArbitration.intent,later);
  const settled=nativeAttack(x);

  const hold=stage(seat);
  hold.owner.prizes.splice(1);
  const holdView=actorObservation(hold.state,seat);
  assert.equal(holdView.ownPublic.prizeCount,1);
  const heldAttack=chooseActorRootIntent(holdView,hold.catalog,options);
  assert.deepEqual(heldAttack,{kind:'attack',attackName:'Gnaw'});
  const holdDecision=arbitrateOwnerRootIntent(
    holdView,hold.catalog,heldAttack,options);
  assert.deepEqual(holdDecision.intent,heldAttack);
  assert.equal(holdDecision.receipt.reason,'potential-last-prize-attack');
  const nativeHoldAttack=nativeAttack(hold);
  return {seat,originalRoot:first,
    arbitratedRoot:arbitration.intent,
    nativeAttachmentConfirmed:true,
    laterRoot:laterArbitration.intent,
    nativeSameAttackSettled:typeof settled.damageAfter==='number',
    conservativeHold:holdDecision.receipt,
    nativeHoldAttackSettled:typeof nativeHoldAttack.damageAfter==='number',
    competitiveQualifiedGames:0};
}
function run(){
  const rows=[evaluateSeat(0),evaluateSeat(1)];
  return {schema:'agent41-staged-owner-turnend-arbitration-native-v1',
    policyVersion:VERSION,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows,competitiveQualifiedGames:0,
    caveat:'Staged owner-visible two-seat positive and hold only; no source-dealt opponent counterpolicy or strategy certification.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,evaluateSeat};
