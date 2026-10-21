'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=
  require('../simulation/twinleaf/headless.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {knownPerfectionDonorCatalog,knownPerfectionReadyOptions}=
  require('../simulation/twinleaf/agent30-known-perfection-options.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine=name=>require(path.join(output,name));

/** Staged, genuine Store with an owner-visible GX donor in discard. */
function scene(){
  const manager=initializeCards();
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {Format,Stage,EnergyType,CardType,SpecialCondition}=
    engine('game/store/card/card-types');
  const {PokemonCard}=engine('game/store/card/pokemon-card');
  const {EnergyCard}=engine('game/store/card/energy-card');
  const {PowerType}=engine('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,
    SpecialCondition
  });
  let id=95000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing frozen native printing: '+name);
    c.id=id++;
    return c;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const defender=new Player(),owner=new Player();
  defender.id=101;owner.id=202;
  defender.active.cards.push(card('Pidgey MEW'));
  owner.active.cards.push(card('Mewtwo & Mew-GX UNM'));
  const telepath=card('Telepath [P] Energy M3');
  owner.active.cards.push(telepath);
  owner.active.energies.cards.push(telepath);
  owner.discard.cards.push(card('Gengar & Mimikyu-GX TEU'));
  for(const player of [defender,owner]){
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  state.players=[defender,owner];
  state.turn=2;
  state.activePlayer=1;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  return {store,state,owner,defender,catalog};
}

test('supported public Mewtwo state passes in root, yet native Perfection offers payable GX',()=>{
  const {store,state,owner,catalog}=scene();
  const view=actorObservation(state,1);
  assert.equal(view.ownPublic.active.printing,'Mewtwo & Mew-GX UNM');
  assert.ok(view.ownPublic.discard.includes('Gengar & Mimikyu-GX TEU'));
  assert.deepEqual(view.ownPublic.active.energies,
    ['Telepath [P] Energy M3']);
  const donorCatalog=knownPerfectionDonorCatalog(
    initializeCards().getAllCards());
  assert.deepEqual(knownPerfectionReadyOptions(view,catalog,donorCatalog)
    .map(x=>x.attackName),['Horror House-GX']);
  const intent=chooseActorRootIntent(view,catalog,{
    energyRecipientFrontier:true,specialEnergyRoot:true
  });
  assert.equal(intent.kind,'pass',
    'This test documents the missing safe Perfection initiating root');

  const {UseAbilityAction}=engine('game/store/actions/game-actions');
  const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  store.dispatch(new UseAbilityAction(owner.id,'Perfection',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  for(let i=0;pending()?.constructor.name==='WaitPrompt'&&i<10;i++){
    store.dispatch(new ResolvePromptAction(pending().id,true));
  }
  const prompt=pending();
  assert.equal(prompt?.constructor.name,'ChooseAttackPrompt',
    'Native Perfection must offer owned discard donor attack choices');
  const source=prompt.cards.find(c=>c.fullName==='Gengar & Mimikyu-GX TEU');
  assert.ok(source);
  const horror=source.attacks.find(a=>a.name==='Horror House-GX');
  assert.ok(horror);
  assert.equal(prompt.validate(horror),true,
    'One attached Telepath must pay the source GX attack');
  store.dispatch(new ResolvePromptAction(prompt.id,horror));
  for(let i=0;pending()?.constructor.name==='WaitPrompt'&&i<10;i++){
    store.dispatch(new ResolvePromptAction(pending().id,true));
  }
  assert.equal(state.players[1].usedGX,true,
    'A native payable copied GX attack consumes the GX allowance');
});
