'use strict';

const assert=require('node:assert/strict');
const nodePath=require('node:path');
const {stage}=require('./agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseActorRootIntent}=require('./agent34-actor-only-root-policy.cjs');
const {arbitrateOwnerRootIntent}=require('./agent41-owner-root-arbitration.cjs');
const {potentialTwoPrizeAttackVeto}=
  require('./agent35-potential-two-prize-attack-veto.cjs');
const native=p=>require(nodePath.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Stage an identical publicly observable two-Prize race on either physical
 * seat. This is a synthetic original-Store mechanism test, not a dealt match.
 * @param {0|1} seat
 * @returns {object}
 */
function stageRace(seat){
  const x=stage(seat),manager=initializeCards();
  let nextId=9000;
  const card=printing=>{
    const result=manager.getCardByName(printing);
    assert.ok(result,'Pinned engine missing '+printing);
    result.id=nextId++;
    return result;
  };
  x.owner.active.cards.length=0;
  x.owner.active.energies.cards.length=0;
  x.owner.active.cards.push(card('Miraidon ex SVI'));
  for(let i=0;i<3;i++){
    const energy=card('Lightning Energy SVE');
    x.owner.active.cards.push(energy);
    x.owner.active.energies.cards.push(energy);
  }
  x.owner.active.damage=0;
  x.opponent.active.cards.length=0;
  x.opponent.active.cards.push(card('Dedenne-GX UNB'));
  x.opponent.active.damage=0;
  x.owner.bench[1].damage=210;
  x.opponent.bench[0].cards.push(card('Minun PAR'));
  x.opponent.bench[1].cards.push(card('Plusle PAR'));
  x.owner.prizes.splice(2);
  x.opponent.prizes.splice(2);
  assert.equal(x.owner.prizes.length,2);
  assert.equal(x.opponent.prizes.length,2);
  return x;
}

/** @param {object} x */
function publicReceipt(x){
  return {
    ownerPrizes:x.owner.prizes.length,
    opponentPrizes:x.opponent.prizes.length,
    ownerBenchDragonDamage:x.owner.bench[1].damage,
    ownerBenchDragonInPlay:!!x.owner.bench[1].getPokemonCard(),
    ownerBenchDragonEnergy:x.owner.bench[1].energies.cards.map(c=>c.fullName),
    opponentActiveDamage:x.opponent.active.damage,
    opponentActiveInPlay:!!x.opponent.active.getPokemonCard(),
    phase:x.state.phase,turn:x.state.turn,
    activeSeat:x.state.activePlayer,
    winner:x.state.winner?.id??x.state.winner??null
  };
}

/** Resolve only nondiscretionary native animation prompts. */
function settleWaitPrompts(x){
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const sequence=[];
  for(let i=0;i<24;i++){
    const pending=x.state.prompts.find(p=>p.result===undefined);
    if(!pending)return sequence;
    const type=pending.constructor.name;
    sequence.push(type);
    assert.equal(type,'WaitPrompt',
      'Native strategic prompt needs separate owner-legal resolution');
    x.store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.fail('Native WaitPrompt loop exceeded 24 settlements');
}

/** @param {0|1} seat */
function runSeat(seat){
  const a=stageRace(seat),b=stageRace(seat);
  const va=actorObservation(a.state,seat);
  const vb=actorObservation(b.state,seat);
  assert.deepEqual(va,vb,'Two branches must begin with identical owner view');
  const options={publicContextSpecialEnergy:true};
  const first=chooseActorRootIntent(va,a.catalog,options);
  assert.deepEqual(first,{kind:'attack',attackName:'Photon Blaster'},
    'Genuinely affordable finishing attack must be first root');
  const unguarded=arbitrateOwnerRootIntent(vb,b.catalog,first,options);
  assert.equal(unguarded.intent.kind,'attach-special-energy');
  assert.deepEqual({
    printing:unguarded.intent.printing,
    slot:unguarded.intent.slot,index:unguarded.intent.index
  },{printing:'Double Dragon Energy ROS',slot:'bench',index:1});
  const potential=potentialTwoPrizeAttackVeto(va,first);
  const guarded=arbitrateOwnerRootIntent(va,a.catalog,first,{
    ...options,protectPotentialTwoPrizeAttack:true});
  const observedAttack=va.ownPublic.active.attacks.find(
    attack=>attack.name===first.attackName);
  const inputTypes={
    attackDamage:observedAttack?.damage??null,
    attackDamageType:typeof observedAttack?.damage,
    opponentHp:va.opponentPublic.active?.hp??null,
    opponentHpType:typeof va.opponentPublic.active?.hp,
    opponentDamage:va.opponentPublic.active?.damage??null,
    ownerPrizeCount:va.ownPublic.prizeCount,
    opponentPrinting:va.opponentPublic.active?.printing??null
  };
  const hidden=structuredClone(va);
  hidden.opponentPrivate={hand:['unknown'],prizes:['unknown']};
  assert.deepEqual(potentialTwoPrizeAttackVeto(hidden,first),potential);
  const {AttackAction}=native('game/store/actions/game-actions');
  let attackPrompts=[],attackError=null,attachPrompts=[],attachError=null;
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
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
        index:unguarded.intent.index
      }));
    attachPrompts=settleWaitPrompts(b);
  }catch(error){attachError=String(error?.stack??error);}
  const attach=publicReceipt(b);
  return {seat,baseline:first,unguarded:unguarded.receipt,
    guarded:guarded.receipt,potential,inputTypes,
    guardPreservedPotentialAttack:guarded.intent.kind==='attack',
    attackFirst:{...attack,prompts:attackPrompts,error:attackError},
    attachFirst:{...attach,prompts:attachPrompts,error:attachError},
    nativeAttachmentConsumed:b.owner.hand.cards.length===0,
    nativeAttachmentConfirmed:b.owner.bench[1].energies.cards
      .some(c=>c.fullName==='Double Dragon Energy ROS'),
    attackFirstPrizeWin:attackError===null&&attack.ownerPrizes===0,
    attachFirstOpponentPrizeWin:attachError===null&&attach.opponentPrizes===0,
    completeWinnerReversal:attackError===null&&attachError===null&&
      attack.ownerPrizes===0&&attach.opponentPrizes===0};
}

function run(){
  const rows=[0,1].map(seat=>{
    try{return runSeat(seat);}
    catch(error){return {seat,error:String(error?.stack??error),
      completeWinnerReversal:false};}
  });
  return {schema:'agent42-two-prize-buddy-pulse-staged-native-v1',
    enginePin:PIN,
    registration:'results/aichi-2026/registrations/agent42-two-prize-buddy-pulse-20261030.md',
    rows,attemptedSeats:2,
    nativeErrors:rows.filter(r=>r.error!==undefined).length,
    allNativeWinnerReversed:rows.every(r=>r.completeWinnerReversal),
    competitiveQualifiedGames:0,
    caveat:'Synthetic original-Store both-seat action ordering; all errors retained, no natural deal, competent opponent, or paper-clock qualification.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={stageRace,runSeat,run};
