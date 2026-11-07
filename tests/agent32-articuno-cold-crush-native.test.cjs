'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {assertValidPromptAction}=
  require('../simulation/twinleaf/prompt-integrity.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(output,name));

/**
 * A script-driven matched board for checking the *printed* Legendary Ascent
 * into Cold Crush-GX line with one Basic Water. This is not a shuffled,
 * authenticated Aichi original 60 or a full opponent-response game.
 *
 * @param {0|1} seat
 * @param {boolean} useAscent
 * @returns {object}
 */
function probeColdCrushAscent(seat,useAscent){
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {CardList}=native('game/store/state/card-list');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {AttackAction}=
    native('game/store/actions/game-actions');
  const manager=initializeCards();
  /** @param {string} name @returns {any} */
  const card=name=>{
    const instance=manager.getCardByName(name);
    assert.ok(instance,'Unavailable pinned printing: '+name);
    return instance;
  };

  const actor=new Player(),opponent=new Player();
  actor.id=801;
  actor.name='rank3-articuno-staged';
  opponent.id=802;
  opponent.name='regidrago-staged';
  actor.bench=Array.from({length:5},()=>new PokemonCardList());
  opponent.bench=Array.from({length:5},()=>new PokemonCardList());
  actor.active.cards.push(card('Snorlax PGO'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const ownedWater=card('Water Energy SVE');
  actor.active.cards.push(ownedWater);
  actor.active.energies.cards.push(ownedWater);
  const opponentGrass=Array.from({length:3},
    ()=>card('Grass Energy SVE'));
  for(const energy of opponentGrass){
    opponent.active.cards.push(energy);
    opponent.active.energies.cards.push(energy);
  }
  const articuno=card('Articuno-GX CES');
  actor.hand.cards.push(articuno);

  const state=new State();
  state.players=seat===0?[actor,opponent]:[opponent,actor];
  state.activePlayer=seat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  for(const player of state.players){
    player.deck.cards.push(card('Psychic Energy SVE'),
      card('Psychic Energy SVE'),card('Psychic Energy SVE'));
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }

  const store=new Store({onStateChange(){}});
  store.state=state;
  const emitted=[];
  store.dispatch(new PlayCardAction(actor.id,0,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
  }));
  const confirm=store.state.prompts.find(p=>p.result===undefined);
  assert.equal(confirm?.constructor.name,'ConfirmPrompt');
  assert.equal(confirm?.message,'WANT_TO_USE_ABILITY');
  const confirming=new ResolvePromptAction(confirm.id,useAscent);
  assertValidPromptAction(store.state,confirming);
  store.dispatch(confirming);
  emitted.push({prompt:confirm.constructor.name,answer:useAscent});

  let movedWater=false,attackSettled=false;
  if(useAscent){
    const pending=store.state.prompts.find(p=>p.result===undefined);
    assert.equal(pending?.constructor.name,'MoveEnergyPrompt');
    assert.equal(pending?.message,'MOVE_ENERGY_TO_ACTIVE');
    const from={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0};
    const to={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
    const moving=new ResolvePromptAction(pending.id,
      [{from,to,card:ownedWater}]);
    assertValidPromptAction(store.state,moving);
    store.dispatch(moving);
    emitted.push({prompt:pending.constructor.name,answer:1});
    movedWater=actor.active.getPokemonCard()===articuno &&
      actor.active.energies.cards.includes(ownedWater) &&
      !actor.bench[0].energies.cards.includes(ownedWater);
    assert.equal(movedWater,true);
    const before={
      actorEnergy:actor.active.energies.cards.length,
      opponentEnergy:opponent.active.energies.cards.length,
      actorGX:actor.usedGX===true
    };
    assert.deepEqual(before,{actorEnergy:1,opponentEnergy:3,actorGX:false});
    store.dispatch(new AttackAction(actor.id,'Cold Crush-GX'));
    attackSettled=true;
    emitted.push({attack:'Cold Crush-GX'});
  }

  return {
    seat,useAscent,movedWater,attackSettled,
    active:actor.active.getPokemonCard()?.fullName??null,
    bench:actor.bench.map(s=>s.getPokemonCard()?.fullName).filter(Boolean),
    actorActiveWater:actor.active.energies.cards.includes(ownedWater),
    actorWaterInDiscard:actor.discard.cards.includes(ownedWater),
    opponentGrassInDiscard:opponentGrass.filter(c=>
      opponent.discard.cards.includes(c)).length,
    opponentRemainingEnergy:opponent.active.energies.cards.length,
    usedGX:actor.usedGX===true,
    remainingPrizes:state.players.map(p=>p.prizes.filter(s=>s.cards.length).length),
    pending:store.state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    emitted
  };
}

test('pinned native one-Water Articuno Cold Crush physically denies three enemy Energy on either seat',()=>{
  for(const seat of [0,1]){
    const control=probeColdCrushAscent(seat,false);
    const treatment=probeColdCrushAscent(seat,true);
    assert.equal(control.active,'Snorlax PGO');
    assert.equal(control.opponentRemainingEnergy,3);
    assert.equal(control.opponentGrassInDiscard,0);
    assert.equal(control.usedGX,false);
    assert.equal(treatment.active,'Articuno-GX CES');
    assert.equal(treatment.movedWater,true);
    assert.equal(treatment.attackSettled,true);
    assert.equal(treatment.opponentRemainingEnergy,0);
    assert.equal(treatment.opponentGrassInDiscard,3);
    assert.equal(treatment.actorWaterInDiscard,true);
    assert.equal(treatment.actorActiveWater,false);
    assert.equal(treatment.usedGX,true);
    assert.deepEqual(treatment.remainingPrizes,control.remainingPrizes);
    assert.deepEqual(treatment.pending,[]);
    console.log('AGENT32_ARTICUNO_COLDCRUSH_NATIVE',JSON.stringify({
      seat,control,treatment,qualifiedForCompetitiveInference:false
    }));
  }
});
module.exports={probeColdCrushAscent};
