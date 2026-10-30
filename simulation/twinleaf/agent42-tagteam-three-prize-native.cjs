'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {stageRace,publicReceipt,settleWaitPrompts}=
  require('./agent42-buddy-pulse-two-prize-native.cjs');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=
  require('./agent34-actor-only-root-policy.cjs');
const {arbitrateOwnerRootIntent}=
  require('./agent41-owner-root-arbitration.cjs');
const {potentialTwoPrizeAttackVeto}=
  require('./agent35-potential-two-prize-attack-veto.cjs');
const native=p=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));

/**
 * Change only the public target, its current damage, and owner's remaining
 * Prizes. The source board and live Minun reaction match the preregistered
 * two-Prize fixture. This test is synthetic, not naturally source-dealt.
 * @param {0|1} seat
 * @returns {object}
 */
function stageTagTeam(seat){
  const x=stageRace(seat,3);
  const target=initializeCards().getCardByName('Gengar & Mimikyu-GX TEU');
  assert.ok(target,'Pinned engine must implement TEU 53');
  target.id=9088;
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(target);
  x.opponent.active.damage=30;
  assert.equal(x.owner.prizes.length,3);
  assert.equal(x.opponent.prizes.length,2);
  return x;
}

/** @param {0|1} seat */
function runSeat(seat){
  const a=stageTagTeam(seat),b=stageTagTeam(seat);
  const va=actorObservation(a.state,seat);
  const vb=actorObservation(b.state,seat);
  assert.deepEqual(va,vb,'Frozen owner views must match exactly');
  const options={publicContextSpecialEnergy:true};
  const first=chooseActorRootIntent(va,a.catalog,options);
  assert.deepEqual(first,{kind:'attack',attackName:'Photon Blaster'});
  assert.equal(va.ownPublic.prizeCount,3);
  assert.equal(va.opponentPublic.active.hp,240);
  assert.equal(va.opponentPublic.active.damage,30);
  const unguarded=arbitrateOwnerRootIntent(vb,b.catalog,first,options);
  const oldPotential=potentialTwoPrizeAttackVeto(va,first);
  const currentlyGuarded=arbitrateOwnerRootIntent(va,a.catalog,first,{
    ...options,protectPotentialTwoPrizeAttack:true
  });
  assert.equal(oldPotential.protect,false);
  assert.equal(oldPotential.reason,'outside-two-prize-attack-window');
  assert.equal(unguarded.intent.kind,'attach-special-energy');
  assert.equal(currentlyGuarded.intent.kind,'attach-special-energy');
  assert.equal(unguarded.intent.printing,'Double Dragon Energy ROS');
  assert.equal(unguarded.intent.slot,'bench');
  assert.equal(unguarded.intent.index,1);

  const {AttackAction}=native('game/store/actions/game-actions');
  let attackError=null,attachError=null;
  let attackPrompts=[],attachPrompts=[];
  try{
    a.store.dispatch(new AttackAction(a.owner.id,first.attackName));
    attackPrompts=settleWaitPrompts(a);
  }catch(error){attackError=String(error?.stack??error);}
  const attack=publicReceipt(a);

  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  try{
    b.store.dispatch(new PlayCardAction(b.owner.id,
      unguarded.intent.handIndex,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:1
      }));
    attachPrompts=settleWaitPrompts(b);
  }catch(error){attachError=String(error?.stack??error);}
  const attach=publicReceipt(b);
  return {
    seat,first,oldPotential,unguarded:unguarded.receipt,
    currentlyGuarded:currentlyGuarded.receipt,
    attackingFirst:{...attack,prompts:attackPrompts,error:attackError},
    attachingFirst:{...attach,prompts:attachPrompts,error:attachError},
    attackFirstWins:attackError===null&&attack.ownerPrizes===0&&
      attack.winner===seat,
    attachmentFirstLoses:attachError===null&&attach.opponentPrizes===0&&
      attach.winner===1-seat&&
      attach.ownerDiscard.includes('Regidrago V SIT')&&
      attach.ownerDiscard.includes('Double Dragon Energy ROS'),
    nativeWinnerReversal:attackError===null&&attachError===null&&
      attack.ownerPrizes===0&&attach.opponentPrizes===0&&
      attack.winner===seat&&attach.winner===1-seat
  };
}

function run(){
  const rows=[0,1].map(seat=>{
    try{return runSeat(seat);}
    catch(error){return {seat,error:String(error?.stack??error),
      nativeWinnerReversal:false};}
  });
  return {
    schema:'agent42-three-prize-tagteam-staged-original-store-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    preregistration:'results/aichi-2026/registrations/agent42-tagteam-three-prize-arbitration-20261030.md',
    rows,nativeErrors:rows.filter(r=>r.error!==undefined).length,
    bothSeatWinnerReversal:rows.every(r=>r.nativeWinnerReversal),
    qualifiedCompetitiveGames:0,
    limitation:'Synthetic staged original-Store counterfactual, not original source-dealt tournament game.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={stageTagTeam,runSeat,run};
