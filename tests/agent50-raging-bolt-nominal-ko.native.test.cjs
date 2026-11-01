'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const native=x=>require(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output',x));
function stage(seat){
  const manager=initializeCards();
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition,Format}=
    native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  const {GamePhase}=native('game/store/state/state');
  const {GameSettings}=native('game/core/game-settings');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,SpecialCondition
  });
  let id=50000;
  const card=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result,'Missing original printed card '+name);
    result.id=id++;return result;
  };
  const store=new Store({onStateChange(){}}),owner=new Player(),opponent=new Player();
  owner.id=501;opponent.id=502;
  const state=store.state;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;state.activePlayer=seat;
  state.gameSettings=new GameSettings();
  state.gameSettings.format=Format.EXPANDED;
  state.rules=state.gameSettings.rules;
  owner.active.cards.push(card('Raging Bolt ex TEF'));
  owner.active.energies.cards.push(card('Lightning Energy MEE'),card('Fighting Energy MEE'));
  opponent.active.cards.push(card('Iron Thorns ex TWM'));
  opponent.active.damage=90;
  for(const player of [owner,opponent]){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  owner.bench[0].cards.push(card('Sandy Shocks ex PAR'));
  owner.bench[0].energies.cards.push(card('Darkness Energy MEE'));
  return {store,state,owner,opponent,catalog};
}
for(const seat of [0,1]){
  test('original rank19 native Raging Bolt attack offer in seat '+seat,()=>{
    const {store,state,owner,opponent,catalog}=stage(seat);
    const observed=actorObservation(state,seat);
    if(seat===0){
      const printed=owner.active.getPokemonCard();
      console.log('AGENT50_RANK19_PINNED_CARD_METHOD',JSON.stringify({
        printing:printed.fullName,
        constructorName:printed.constructor.name,
        methodNames:Object.getOwnPropertyNames(Object.getPrototypeOf(printed)),
        reduceEffectDefined:typeof printed.reduceEffect==='function',
        printedAttacks:observed.ownPublic.active.attacks.map(x=>({
          name:x.name,damage:x.damage,calculation:x.damageCalculation
        }))
      }));
    }
    assert.equal(observed.ownPublic.active.printing,'Raging Bolt ex TEF');
    assert.equal(observed.opponentPublic.active.damage,90);
    const baseline=chooseActorRootIntent(observed,catalog);
    const proposed=chooseActorRootIntent(observed,catalog,{
      ragingBoltNominalKoRoot:true
    });
    assert.equal(baseline.attackName,'Burst Roar');
    assert.equal(proposed.attackName,'Bellowing Thunder');
    const {AttackAction}=native('game/store/actions/game-actions');
    store.dispatch(new AttackAction(owner.id,proposed.attackName));
    const pending=state.prompts.find(p=>p.result===undefined)??null;
    console.log('AGENT50_RANK19_BELLOWING_NATIVE_OFFER',JSON.stringify({
      seat,baseline:baseline.attackName,proposed:proposed.attackName,
      damageBefore:90,damageAfter:opponent.active.damage,
      prompt:pending?.constructor.name??null,
      promptOptionKeys:pending?Object.keys(pending.options??{}):[],
      physicalActiveBasicCount:owner.active.energies.cards.length,
      physicalBenchBasicCount:owner.bench[0].energies.cards.length,
      competitiveQualifiedGames:0
    }));
    assert.ok(pending,'Native Bellowing must offer a resolution prompt');
    assert.equal(pending.playerId,owner.id);
    const {ResolvePromptAction}=
      native('game/store/actions/resolve-prompt-action');
    // Continue through native Wait prompts only. These do not choose cards,
    // target an opponent zone or decide Energy payment.
    const trace=[];
    for(let step=0;step<24;step++){
      const next=state.prompts.find(p=>p.result===undefined);
      if(!next)break;
      const kind=next.constructor.name;
      trace.push({kind,ownerSeat:state.players.findIndex(p=>
        p.id===next.playerId),offeredCount:next.cards?.length??null,
        optionKeys:Object.keys(next.options??{})});
      if(kind!=='WaitPrompt')break;
      store.dispatch(new ResolvePromptAction(next.id,null));
    }
    const next=state.prompts.find(p=>p.result===undefined)??null;
    console.log('AGENT50_RANK19_AFTER_NATIVE_WAITS',JSON.stringify({
      seat,trace,nextPrompt:next?.constructor.name??null,
      nextPromptOwnerSeat:next?state.players.findIndex(p=>
        p.id===next.playerId):null,
      damageAfter:opponent.active.damage,
      activeBasicCount:owner.active.energies.cards.length,
      benchBasicCount:owner.bench[0].energies.cards.length,
      competitiveQualifiedGames:0
    }));
    assert.ok(trace.length>0);

  });
}
