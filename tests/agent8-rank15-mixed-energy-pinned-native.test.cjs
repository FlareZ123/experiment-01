'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(output,name));

/**
 * Stage the exact original rank15 printed Grass/DCE and Buneary-Lopunny
 * evolution on a genuine pinned Store. Does not claim natural setup access.
 * @param {0|1} seat
 * @returns {object|null}
 */
function rank15NativeScene(seat){
  const manager=initializeCards();
  // Source reports PFL #83/#84, but pinned native identifiers are M2.
  // Resolve exact printed set and collector number, never name suffix alone.
  const original=(name,number)=>{
    const matches=manager.getAllCards().filter(c=>
      c.name===name&&c.set==='PFL'&&String(c.setNumber)===number);
    assert.equal(matches.length,1,'Ambiguous original PFL card '+name+' #'+number);
    return matches[0].fullName;
  };
  const basic=original('Buneary','83');
  const mega=original('Mega Lopunny ex','84');
  const required=[basic,mega,'Grass Energy MEE',
    'Double Colorless Energy SUM','Shadow Rider Calyrex V CRE'];
  const unsupported=required.filter(name=>!manager.getCardByName(name));
  assert.deepEqual(unsupported,[],
    'Exact rank15 source printing must resolve in pinned CardManager');
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {GameSettings}=native('game/core/game-settings');
  const {Format,Stage,EnergyType,CardType,SpecialCondition}=
    native('game/store/card/card-types');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {PowerType}=native('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,
    SpecialCondition
  });
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=518;opponent.id=519;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.activePlayer=seat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings=new GameSettings();
  state.gameSettings.format=Format.EXPANDED;
  state.rules=state.gameSettings.rules;
  let id=92000;
  const card=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result,'Card unexpectedly missing '+name);
    result.id=id++;
    return result;
  };
  owner.active.cards.push(card(basic),card(mega));
  owner.hand.cards.push(card('Grass Energy MEE'),
    card('Double Colorless Energy SUM'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const player of [owner,opponent]){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<15;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const p=new CardList();p.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(p);
    }
  }
  return {store,state,owner,opponent,catalog};
}

/**
 * Same physical board with either card consumed from the same two-card hand.
 * All card movement and settled attack damage are real Store transitions.
 * @param {0|1} seat
 * @param {'Grass Energy MEE'|'Double Colorless Energy SUM'} printing
 * @param {'Gale Thrust'|'Spiky Hopper'} attackName
 * @returns {object}
 */
function runFork(seat,printing,attackName){
  const x=rank15NativeScene(seat);
  if(x.unsupported?.length)return {unsupported:x.unsupported};
  const {store,state,owner,opponent,catalog}=x;
  const view=actorObservation(state,seat);
  const defaultRoot=chooseActorRootIntent(view,catalog,{
    contestedEnergyRoot:true,specialEnergyRoot:true
  });
  assert.equal(defaultRoot.kind,'attach-basic-energy');
  assert.equal(defaultRoot.printing,'Grass Energy MEE');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const handIndex=owner.hand.cards.findIndex(c=>c.fullName===printing);
  assert.ok(handIndex>=0);
  store.dispatch(new PlayCardAction(owner.id,handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.ok(owner.active.energies.cards.some(c=>c.fullName===printing));
  assert.equal(state.prompts.some(p=>p.result===undefined),false);
  const after=actorObservation(state,seat);
  assert.equal(after.ownPublic.active.energies.length,1);
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');
  const initial=opponent.active.damage;
  store.dispatch(new AttackAction(owner.id,attackName));
  for(let step=0;step<25 && state.turn===4;step++){
    const pending=state.prompts.find(p=>p.result===undefined);
    assert.ok(pending,'Stalled native Lopunny attack at prompt step '+step);
    assert.equal(pending.constructor.name,'WaitPrompt');
    store.dispatch(new ResolvePromptAction(pending.id,null));
  }
  const dealt=opponent.active.damage-initial;
  return {seat,printing,attackName,dealt,ownerPrizes:owner.prizes.length,
    ownerHand:owner.hand.cards.map(c=>c.fullName),
    ownerActiveEnergy:owner.active.energies.cards.map(c=>c.fullName),
    opponentActive:opponent.active.getPokemonCard()?.fullName??null,
    turn:state.turn,nativeAccepted:true};
}

for(const seat of [0,1]){
  test('rank15 native printed Grass vs DCE same-board attack settlement, seat '+seat,t=>{
    const grass=runFork(seat,'Grass Energy MEE','Gale Thrust');
    const dce=runFork(seat,'Double Colorless Energy SUM','Spiky Hopper');
    if(grass.unsupported?.length||dce.unsupported?.length){
      const unsupported=[...new Set([
        ...(grass.unsupported??[]),...(dce.unsupported??[])
      ])];
      t.skip('Pinned native Store lacks original rank15 printing(s): '+
        unsupported.join(', '));
      return;
    }
    assert.equal(grass.dealt,60);
    assert.equal(dce.dealt,160);
    assert.equal(dce.dealt-grass.dealt,100);
    assert.equal(grass.turn,5);
    assert.equal(dce.turn,5);
    assert.equal(grass.nativeAccepted,true);
    assert.equal(dce.nativeAccepted,true);
    assert.equal(grass.opponentActive,'Shadow Rider Calyrex V CRE');
    assert.equal(dce.opponentActive,'Shadow Rider Calyrex V CRE');
    console.log('NATIVE_RANK15_LOPUNNY_ENERGY_CONTEST',
      JSON.stringify({seat,grass,dce,competitiveQualifiedGames:0}));
  });
}
