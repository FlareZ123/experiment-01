'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const test=require('node:test');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');

const OUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const native=p=>require(path.join(OUT,p));

/**
 * A genuine pinned Store miniature Bawl turn, performed in both possible
 * physical seats. This is neither a shuffled original source nor a game.
 * @param {0|1} seat
 */
function stage(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=2;
  state.activePlayer=seat;
  state.gameSettings.format=Format.EXPANDED;
  const actor=new Player(),defender=new Player();
  actor.id=511;defender.id=612;
  actor.name='Whismur Bawl actor';
  defender.name='opposing printed Trainer owner';
  state.players=seat===0?[actor,defender]:[defender,actor];
  let identity=92000;
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Missing pinned '+printing);
    c.id=identity++;
    return c;
  };
  const whismur=card('Whismur CES');
  assert.ok(whismur.attacks.some(a=>a.name==='Bawl'));
  actor.active.cards.push(whismur);
  const energy=card('Psychic Energy SVE');
  actor.active.cards.push(energy);
  actor.active.energies.cards.push(energy);
  defender.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  defender.hand.cards.push(card('Tag Call CEC'));
  defender.hand.cards.push(card('Guzma & Hala CEC'));
  for(const player of state.players){
    for(let i=0;i<10;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Dratini OBF'));
      player.prizes.push(prize);
    }
  }
  return {store,actorId:actor.id,defenderId:defender.id,seat};
}

/** @param {object} player */
const trainerLocks=player=>({
  item:player.cannotPlayItemCards===true,
  supporter:player.cannotPlaySupporterCards===true,
  stadium:player.cannotPlayStadiumCards===true,
  tool:player.cannotPlayToolCards===true,
  pokemon:player.cannotPlayPokemonCards===true,
  energy:player.cannotPlayEnergyCards===true
});

/** @param {object} fixture */
function resolveBawl(fixture){
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const {store,actorId,defenderId,seat}=fixture;
  store.dispatch(new AttackAction(actorId,'Bawl'));
  for(let i=0;i<24;i++){
    const pending=store.state.prompts.find(x=>x.result===undefined);
    if(!pending&&store.state.turn>=3)break;
    assert.ok(pending,'Bawl must yield a genuine native prompt');
    assert.equal(pending.constructor.name,'WaitPrompt');
    store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.equal(store.state.turn,3);
  assert.equal(store.state.activePlayer,1-seat);
  assert.equal(store.state.prompts.find(x=>x.result===undefined),undefined);
  return store.state.players.find(x=>x.id===defenderId);
}

for(const seat of [0,1]){
  test('genuine first-turn-second Bawl blocks every Trainer category on seat '+seat,()=>{
    const f=stage(seat);
    const before=f.store.state.players.find(p=>p.id===f.defenderId);
    assert.deepEqual(trainerLocks(before),{
      item:false,supporter:false,stadium:false,tool:false,
      pokemon:false,energy:false
    });
    const after=resolveBawl(f);
    const flags=trainerLocks(after);
    assert.deepEqual(flags,{
      item:true,supporter:true,stadium:true,tool:true,
      pokemon:false,energy:false
    });
    assert.equal(after.hand.cards.some(c=>c.fullName==='Tag Call CEC'),true);
    assert.equal(after.hand.cards.some(c=>c.fullName==='Guzma & Hala CEC'),true);
    console.log('AGENT29_BAWL_NATIVE_LOCK',JSON.stringify({
      seat,turn:f.store.state.turn,flags,sourceHand:after.hand.cards.map(c=>c.fullName),
      paperQualified:false
    }));
  });
}

test('Bawl player-scoped Trainer prohibition expires after one opposing turn',()=>{
  const f=stage(0);
  resolveBawl(f);
  const {PassTurnAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  f.store.dispatch(new PassTurnAction(f.defenderId));
  for(let i=0;i<15;i++){
    const pending=f.store.state.prompts.find(x=>x.result===undefined);
    if(!pending&&f.store.state.turn>=4)break;
    assert.ok(pending);
    assert.equal(pending.constructor.name,'WaitPrompt');
    f.store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  assert.equal(f.store.state.turn,4);
  const source=f.store.state.players.find(p=>p.id===f.defenderId);
  assert.deepEqual(trainerLocks(source),{
    item:false,supporter:false,stadium:false,tool:false,
    pokemon:false,energy:false
  });
});
