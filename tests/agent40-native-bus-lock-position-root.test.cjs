'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {stage}=require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const O=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=n=>require(path.join(O,n));
const GRASS='Grass Energy MEE';

/**
 * Pinned Store with the printed Original rank15 lock-state geometry.
 * Genuine 60-card dealing frequency is intentionally unmodeled.
 * @param {0|1} seat Physical acting source seat.
 */
function staged(seat){
  const x=stage(seat),manager=initializeCards();
  let id=51000+seat*100;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing required registered source printing '+name);
    c.id=id++;
    return c;
  };
  const owner=x.owner,opponent=x.opponent;
  owner.active.cards.length=0;
  owner.active.energies.cards.length=0;
  owner.active.tools.length=0;
  owner.active.cards.push(card('Bunnelby PRC'));
  const firstGrass=card(GRASS);
  owner.active.cards.push(firstGrass);
  owner.active.energies.cards.push(firstGrass);
  owner.hand.cards.length=0;
  owner.hand.cards.push(card(GRASS));
  const evolve=(slot,last)=>{
    slot.cards.length=0;
    slot.cards.push(card('Oddish UNB'),card('Gloom UNB'),card(last));
    slot.energies.cards.length=0;
  };
  evolve(owner.bench[1],'Vileplume BUS');
  evolve(owner.bench[2],'Vileplume AOR');
  opponent.active.cards.length=0;
  opponent.active.energies.cards.length=0;
  opponent.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  for(let k=0;k<3;k++){
    const e=card('Psychic Energy SVE');
    opponent.active.cards.push(e);
    opponent.active.energies.cards.push(e);
  }
  x.state.turn=18;
  return x;
}
for(const seat of [0,1]){
  test('native owner two-step BUS lock position and opposing Basic attack veto seat '+seat,()=>{
    const x=staged(seat),options={busLockPositionRoot:true};
    const {PlayCardAction,PlayerType,SlotType}=
      native('game/store/actions/play-card-action');
    const {RetreatAction,PassTurnAction,AttackAction}=
      native('game/store/actions/game-actions');
    const actor=()=>actorObservation(x.state,seat);
    const first=chooseActorRootIntent(actor(),x.catalog,options);
    assert.equal(first.kind,'attach-basic-energy');
    assert.equal(first.printing,GRASS);
    assert.equal(first.slot,'active');
    assert.equal(first.reason,'fund-public-bus-lock-retreat');
    const before=rootPhysicalSnapshot(x.state,seat,first);
    x.store.dispatch(new PlayCardAction(x.owner.id,first.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    const after=rootPhysicalSnapshot(x.state,seat,first);
    assert.equal(rootPhysicalWitness(first,before,after,x.GamePhase),
      'confirmed-public-effect');
    assert.equal(x.owner.active.energies.cards.length,2);

    const second=chooseActorRootIntent(actor(),x.catalog,options);
    assert.equal(second.kind,'paid-retreat');
    assert.equal(second.benchIndex,1);
    assert.equal(second.printing,'Vileplume BUS');
    assert.equal(second.retreatCostUnits,2);
    const pre=rootPhysicalSnapshot(x.state,seat,second);
    x.store.dispatch(new RetreatAction(x.owner.id,second.benchIndex));
    const post=rootPhysicalSnapshot(x.state,seat,second);
    assert.equal(rootPhysicalWitness(second,pre,post,x.GamePhase),
      'confirmed-public-effect');
    assert.equal(x.owner.active.getPokemonCard()?.fullName,'Vileplume BUS');
    assert.equal(x.owner.bench[1].getPokemonCard()?.fullName,'Bunnelby PRC');
    assert.equal(x.owner.active.energies.cards.length,0);
    assert.equal(x.owner.bench[1].energies.cards.length,0,
      'Printed ordinary retreat discards both Grass energy cards');
    assert.equal(x.owner.bench[2].getPokemonCard()?.fullName,'Vileplume AOR');

    x.store.dispatch(new PassTurnAction(x.owner.id));
    assert.equal(x.state.activePlayer,1-seat);
    const candidateBefore=x.opponent.active.damage;
    let rejected=null;
    try{
      x.store.dispatch(new AttackAction(x.opponent.id,'Miraculous Duo-GX'));
    }catch(error){rejected=String(error?.message??error);}
    assert.ok(rejected,'Printed candidate Basic attack should be blocked by BUS');
    assert.equal(x.opponent.active.damage,candidateBefore);
    console.log('AGENT40_NATIVE_BUS_POSITION',JSON.stringify({
      seat,originalPrintedBunnelby:'Bunnelby PRC',
      grassAttached:2,sourceActive:x.owner.active.getPokemonCard().fullName,
      sourceBenchAor:x.owner.bench[2].getPokemonCard().fullName,
      nativeRetreatReceipt:'confirmed-public-effect',
      rejectedCandidateAttack:rejected,competitiveQualifiedGames:0
    }));
  });
}
