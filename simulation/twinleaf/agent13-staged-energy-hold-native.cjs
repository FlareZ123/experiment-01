'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stage,nativeAttack}=
  require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=require('./agent34-actor-only-root-policy.cjs');
const {choosePublicContextSpecialEnergy}=
  require('./agent17-public-context-special-energy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('./agent5-owner-root-slice.cjs');

const ENERGY='Double Dragon Energy ROS';
const PRINT='Regidrago V SIT';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(output,name));

/**
 * Existing genuine staged physical Store, except the printed Bench Regidrago
 * already has two Double Dragon cards. Owner hand still holds one more.
 * @param {0|1} seat Actual physical owner seat.
 * @returns {object} Reconstructed genuine Store state.
 */
function fundedStage(seat){
  const x=stage(seat);
  const manager=initializeCards();
  assert.equal(x.owner.bench[1].cards[0].fullName,PRINT);
  for(let i=0;i<2;i++){
    const energy=manager.getCardByName(ENERGY);
    assert.ok(energy,'Missing native Double Dragon Energy');
    energy.id=1001+i;
    x.owner.bench[1].cards.push(energy);
    x.owner.bench[1].energies.cards.push(energy);
  }
  assert.deepEqual(x.owner.bench[1].energies.cards.map(card=>card.fullName),
    [ENERGY,ENERGY]);
  assert.deepEqual(x.owner.hand.cards.map(card=>card.fullName),[ENERGY]);
  return x;
}

/**
 * Demonstrate physically legal extra attachment that the owner-only printed
 * attack-progress chooser deliberately holds. Both branches are native Store.
 * @param {0|1} seat Physical owner seat.
 * @returns {object} Same-root paired native facts, no gameplay win inference.
 */
function oneSeat(seat){
  const hold=fundedStage(seat),spend=fundedStage(seat);
  const visibleHold=actorObservation(hold.state,seat);
  const visibleSpend=actorObservation(spend.state,seat);
  assert.deepEqual(visibleHold,visibleSpend,
    'Same-owner prechoice root must match exactly');
  const options={publicContextSpecialEnergy:true};
  const chosen=chooseActorRootIntent(visibleHold,hold.catalog,options);
  assert.deepEqual(chosen,{kind:'attack',attackName:'Gnaw'});
  const offered=choosePublicContextSpecialEnergy(visibleHold,hold.catalog);
  assert.equal(offered,null,
    'No positive printed-attack progress from redundant third DDE');
  const holdBefore=rootPhysicalSnapshot(hold.state,seat,{
    kind:'attach-special-energy',printing:ENERGY,
    handIndex:0,slot:'bench',index:1
  });
  const heldAttack=nativeAttack(hold);
  assert.deepEqual(hold.owner.hand.cards.map(card=>card.fullName),[ENERGY]);
  assert.equal(hold.owner.bench[1].energies.cards.length,2);

  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const extra={kind:'attach-special-energy',printing:ENERGY,
    handIndex:0,slot:'bench',index:1};
  const spentBefore=rootPhysicalSnapshot(spend.state,seat,extra);
  assert.deepEqual(spentBefore,holdBefore,
    'Real preaction physical observations must be identical');
  spend.store.dispatch(new PlayCardAction(spend.owner.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
  }));
  const spentAfter=rootPhysicalSnapshot(spend.state,seat,extra);
  const physicalEffect=rootPhysicalWitness(extra,spentBefore,
    spentAfter,spend.GamePhase);
  assert.equal(physicalEffect,'confirmed-public-effect');
  assert.deepEqual(spend.owner.hand.cards.map(card=>card.fullName),[]);
  assert.deepEqual(spend.owner.bench[1].energies.cards.map(c=>c.fullName),
    [ENERGY,ENERGY,ENERGY]);
  assert.equal(spend.state.turn,2);
  assert.equal(spend.state.activePlayer,seat);
  assert.equal(spend.store.hasPrompts(),false);
  const next=chooseActorRootIntent(
    actorObservation(spend.state,seat),spend.catalog,options);
  assert.deepEqual(next,chosen);
  const spentAttack=nativeAttack(spend);
  assert.equal(spentAttack.damageAfter,heldAttack.damageAfter);
  return {seat,chosen,offeredAttachment:null,
    nativeAlternative:'third Double Dragon Energy on funded Regidrago V',
    nativePhysicalEffect:physicalEffect,
    heldEnergyRemainingInHand:hold.owner.hand.cards.map(c=>c.fullName),
    extraEnergyAfterNativeAttachment:
      spend.owner.bench[1].energies.cards.map(c=>c.fullName),
    samePublicOpponentDamage:spentAttack.damageAfter,
    actualTurnClosed:true};
}

function main(){
  const records=[oneSeat(0),oneSeat(1)];
  const output={
    schema:'agent13-staged-special-energy-resource-hold-native-v1',
    registration:'results/aichi-2026/registrations/agent13-staged-special-energy-resource-hold-20261030.md',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    records,realGames:0,competitiveGameQualified:false,
    caveat:'Staged both-seat native availability and resource hold; no natural draw or opposing policy.'
  };
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  return output;
}

if(require.main===module)main();
module.exports={fundedStage,oneSeat,main};
