'use strict';

const assert=require('node:assert/strict');
const nodePath=require('node:path');
const {stage,nativeAttack}=require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=require('./agent34-actor-only-root-policy.cjs');
const {arbitrateOwnerRootIntent}=require('./agent41-owner-root-arbitration.cjs');
const {evaluatePublicAttachmentReaction}=
  require('./agent5-public-attachment-reaction.cjs');
const {settleWaitPrompts,publicReceipt}=
  require('./agent42-buddy-pulse-two-prize-native.cjs');
const native=p=>require(nodePath.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Fixed genuine Store setup with a non-finishing paid attack, Bench V near
 * knockout, opponent's public Minun+Plusle and exactly two remaining Prizes.
 * @param {0|1} seat
 * @returns {object}
 */
function stageNonFinisher(seat){
  const x=stage(seat),manager=initializeCards();
  let cardId=30000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing pinned printing '+name);
    c.id=cardId++;
    return c;
  };
  x.opponent.bench[0].cards.push(card('Minun PAR'));
  x.opponent.bench[2].cards.push(card('Plusle PAR'));
  x.owner.bench[1].damage=210;
  x.opponent.prizes.splice(2);
  assert.equal(x.opponent.prizes.length,2);
  return x;
}

/** @param {0|1} seat @returns {object} */
function runSeat(seat){
  const attackFirst=stageNonFinisher(seat),attachFirst=stageNonFinisher(seat);
  const v=actorObservation(attackFirst.state,seat);
  assert.deepEqual(v,actorObservation(attachFirst.state,seat),
    'Paired owner public and private observations must match');
  const first=chooseActorRootIntent(v,attackFirst.catalog,
    {publicContextSpecialEnergy:true});
  assert.deepEqual(first,{kind:'attack',attackName:'Gnaw'});
  const options={publicContextSpecialEnergy:true,
    protectPotentialPrintedPrizeAttack:true,protectPotentialTwoPrizeAttack:true};
  const candidate=arbitrateOwnerRootIntent(v,attachFirst.catalog,first,options);
  assert.equal(candidate.intent.kind,'attach-special-energy');
  assert.equal(candidate.intent.printing,'Double Dragon Energy ROS');
  assert.equal(candidate.intent.slot,'bench');
  assert.equal(candidate.intent.index,1);
  const exposure=evaluatePublicAttachmentReaction(v,candidate.intent);
  assert.equal(exposure.terminalLossPossible,true);
  // Ordinary attack cannot possibly take six own Prizes from lone Pidgey.
  assert.equal(v.ownPublic.prizeCount,6);
  assert.equal(v.opponentPublic.active.name,'Pidgey');

  const resolvedAttack=nativeAttack(attackFirst);
  const postAttack=publicReceipt(attackFirst);
  assert.equal(postAttack.winner,null,
    'Non-finishing attack must leave game open');
  assert.equal(postAttack.ownerPrizes,6);
  assert.equal(postAttack.opponentPrizes,2);

  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  attachFirst.store.dispatch(new PlayCardAction(attachFirst.owner.id,
    candidate.intent.handIndex,{player:PlayerType.BOTTOM_PLAYER,
      slot:SlotType.BENCH,index:candidate.intent.index}));
  const prompts=settleWaitPrompts(attachFirst);
  const postAttach=publicReceipt(attachFirst);
  assert.equal(postAttach.opponentPrizes,0);
  assert.equal(postAttach.winner,attachFirst.opponent.id);
  assert.equal(postAttach.ownerBenchDragonInPlay,false);
  assert.ok(postAttach.ownerDiscard.includes('Regidrago V SIT'));
  assert.ok(postAttach.ownerDiscard.includes('Double Dragon Energy ROS'));
  return {seat,first,candidate:candidate.receipt,exposure,
    attackFirst:{...postAttack,nativeAttack:resolvedAttack},
    attachFirst:{...postAttach,prompts},
    ordinaryAttackDoesNotEndGame:true,
    attachmentImmediatelyLosesGame:true};
}

function run(){
  const rows=[0,1].map(seat=>{
    try{return runSeat(seat);}
    catch(error){return {seat,error:String(error?.stack??error),
      ordinaryAttackDoesNotEndGame:false,
      attachmentImmediatelyLosesGame:false};}
  });
  return {schema:'agent5-buddy-pulse-nonfinishing-native-v1',
    enginePin:PIN,attemptedSeats:2,
    nativeErrors:rows.filter(r=>r.error!==undefined).length,
    allNativeReversals:rows.every(r=>r.ordinaryAttackDoesNotEndGame&&
      r.attachmentImmediatelyLosesGame),rows,
    competitiveQualifiedGames:0,
    caveat:'Synthetic true Store two-seat counterexample; no naturally dealt original Top32 game.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={stageNonFinisher,runSeat,run};
