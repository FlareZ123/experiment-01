'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {effectiveNativeAttackCost,publicSpecialAttackPayable}=
  require('../simulation/twinleaf/agent17-public-context-special-energy.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(output,name));

/** @param {0|1} seat @param {boolean} labyrinth */
function scene(seat,labyrinth){
  const manager=initializeCards();
  const wonders=manager.getAllCards().filter(card=>
    card.name.startsWith('Wondrous Labyrinth')&&
    card.set==='TEU'&&String(card.setNumber)==='158');
  if(!wonders.length)return {unsupported:'Wondrous Labyrinth TEU 158'};
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {GameSettings}=native('game/core/game-settings');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition,Format}=
    native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,
    SpecialCondition
  });
  let id=94000;
  const card=name=>{
    const found=manager.getCardByName(name);
    assert.ok(found,'Missing native printed card '+name);
    found.id=id++;
    return found;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),opponent=new Player();
  owner.id=941;opponent.id=942;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.turn=4;
  state.activePlayer=seat;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings=new GameSettings();
  state.gameSettings.format=Format.EXPANDED;
  state.rules=state.gameSettings.rules;
  owner.active.cards.push(card('Iron Thorns ex TWM'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  for(const printing of ['Lightning Energy SVE','Double Colorless Energy SUM']){
    const energy=card(printing);
    owner.active.cards.push(energy);
    owner.active.energies.cards.push(energy);
  }
  if(labyrinth){
    const stadium=manager.getCardByName(wonders[0].fullName);
    assert.ok(stadium);
    owner.stadium.cards.push(stadium);
  }
  for(const player of [owner,opponent]){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    player.bench[0].cards.push(card('Pidgey MEW'));
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,catalog,stadium:wonders[0].fullName};
}

/**
 * Staged same-physical-board native attack opportunity audit. A root intent
 * is only a policy proposal; the actual Store decides whether it is legal.
 */
function tryOriginalThornsAttack(seat,labyrinth){
  const x=scene(seat,labyrinth);
  if(x.unsupported)return x;
  const {store,state,owner,opponent,catalog}=x;
  const view=actorObservation(state,seat);
  const attack=view.ownPublic.active.attacks.find(a=>a.name==='Volt Cyclone');
  assert.ok(attack);
  const currentCost=effectiveNativeAttackCost(view,catalog,
    view.ownPublic.active,attack);
  assert.ok(currentCost);
  const publiclyPayable=publicSpecialAttackPayable(view,catalog,
    view.ownPublic.active,attack);
  const proposal=chooseActorRootIntent(view,catalog,{
    specialEnergyRoot:true,publicContextSpecialEnergy:true
  });
  const {AttackAction}=native('game/store/actions/game-actions');
  const before=opponent.active.damage;
  let error=null;
  try{
    store.dispatch(new AttackAction(owner.id,'Volt Cyclone'));
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    for(let step=0;step<35&&state.turn===4;step++){
      const pending=state.prompts.find(p=>p.result===undefined);
      assert.ok(pending,'Native attack stopped with no prompt');
      if(pending.constructor.name==='WaitPrompt'){
        store.dispatch(new ResolvePromptAction(pending.id,null));
      }else if(pending.constructor.name==='MoveEnergyPrompt'){
        const movement=[{
          from:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0},
          to:{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0},
          card:owner.active.energies.cards[0]
        }];
        assert.equal(pending.validate(movement,state),true);
        store.dispatch(new ResolvePromptAction(pending.id,movement));
      }else{
        assert.fail('Unexpected native Volt Cyclone prompt '+
          pending.constructor.name);
      }
    }
    assert.equal(state.turn,5,'Native attack must settle and end the turn');
  }catch(e){
    if(String(e.message??e)==='NOT_ENOUGH_ENERGY'){
      error={name:e.name,message:String(e.message??e)};
    }else throw e;
  }
  return {seat,labyrinth,currentCost,payable:publiclyPayable,
    rootIntent:proposal.kind,rootAttack:proposal.attackName??null,
    nativeError:error,damage:opponent.active.damage-before,
    pendingTypes:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name),
    nativeStadium:x.stadium,competitiveQualifiedGames:0};
}

for(const seat of [0,1]){
  test('native Wondrous taxed underpayment at original rank6 Iron Thorns, seat '+seat,t=>{
    const control=tryOriginalThornsAttack(seat,false);
    const tax=tryOriginalThornsAttack(seat,true);
    if(control.unsupported||tax.unsupported){
      t.skip('No pinned native '+(control.unsupported??tax.unsupported));
      return;
    }
    console.log('NATIVE_WONDROUS_RANK6',JSON.stringify({seat,control,tax}));
    assert.equal(control.payable,true);
    assert.equal(tax.payable,false);
    assert.equal(control.currentCost.length,3);
    assert.equal(tax.currentCost.length,4);
    assert.equal(control.damage,140,
      'Printed native Volt Cyclone must finish after the paid MoveEnergyPrompt');
    assert.equal(control.nativeError,null);
    assert.equal(tax.nativeError?.message,'NOT_ENOUGH_ENERGY');
    assert.equal(tax.damage,0,
      'Pinned Store must reject Volt Cyclone with one unpaid Wondrous Colorless');
  });
}
