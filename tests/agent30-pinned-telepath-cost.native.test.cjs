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
const {chooseActorEnergyRecipient}=
  require('../simulation/twinleaf/agent44-actor-energy-recipient.cjs');
const {specialEnergyUnits}=
  require('../simulation/twinleaf/agent3-special-energy-frontier.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(output,name));

/** @returns {object} Genuine pinned catalog and a staged owner-root Store. */
function staged(){
  const manager=initializeCards();
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {PokemonCard}=engine('game/store/card/pokemon-card');
  const {EnergyCard}=engine('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition,Format}=
    engine('game/store/card/card-types');
  const {PowerType}=engine('game/store/card/pokemon-types');
  const {GamePhase}=engine('game/store/state/state');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,
    SpecialCondition
  });
  let id=65000;
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Native printing is missing: '+name);
    c.id=id++;
    return c;
  };
  const store=new Store({onStateChange(){}});
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  const state=store.state;
  state.players=[owner,opponent];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=0;
  state.gameSettings.format=Format.EXPANDED;
  owner.active.cards.push(card('Duskull VIV'),card('Dusclops SFA'));
  const attached=card('Telepath [P] Energy M3');
  owner.active.cards.push(attached);
  owner.active.energies.cards.push(attached);
  owner.hand.cards.push(card('Psychic Energy SVE'));
  opponent.active.cards.push(card('Bunnelby PRC'));
  for(const player of state.players){
    for(let i=0;i<5;i++)player.bench.push(new PokemonCardList());
    for(let i=0;i<12;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,catalog,CardType};
}

test('real CardManager exposes exact M3 alias and one Psychic unit',()=>{
  const {catalog,CardType}=staged();
  assert.ok(catalog.specialEnergies.has('Telepath [P] Energy M3'));
  assert.deepEqual(specialEnergyUnits('Telepath [P] Energy M3',catalog),
    [CardType.PSYCHIC]);
  assert.deepEqual(specialEnergyUnits('Telepath [P] Energy M3',catalog,true),
    [CardType.COLORLESS]);
});

test('real owner-visible M3 attachment closes printed Dusclops attack with Basic Psychic',()=>{
  const {state,store,owner,opponent,catalog}=staged();
  const view=actorObservation(state,0);
  assert.equal(view.ownPublic.active.name,'Dusclops');
  assert.ok(view.ownPublic.active.energies.includes('Telepath [P] Energy M3'));
  const pick=chooseActorEnergyRecipient(view,catalog);
  assert.ok(pick);
  assert.equal(pick.slot,'active');
  assert.equal(pick.attackName,'Will-o-Wisp');
  assert.equal(pick.gapBefore,1);
  assert.equal(pick.gapAfter,0);
  const intent=chooseActorRootIntent(view,catalog,{
    energyRecipientFrontier:true,specialEnergyRoot:true
  });
  assert.equal(intent.kind,'attach-basic-energy');
  assert.equal(intent.slot,'active');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const handBefore=owner.hand.cards.length;
  store.dispatch(new PlayCardAction(owner.id,intent.handIndex,{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  assert.equal(owner.hand.cards.length,handBefore-1);
  assert.ok(owner.active.energies.cards.some(c=>
    c.fullName==='Psychic Energy SVE'));
  assert.equal(owner.active.energies.cards.length,2);
  assert.equal(state.prompts.filter(p=>p.result===undefined).length,0);
  const after=actorObservation(state,0);
  assert.deepEqual(chooseActorRootIntent(after,catalog,{
    energyRecipientFrontier:true,specialEnergyRoot:true
  }),{kind:'attack',attackName:'Will-o-Wisp'});
  const {AttackAction}=engine('game/store/actions/game-actions');
  store.dispatch(new AttackAction(owner.id,'Will-o-Wisp'));
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  for(let i=0;i<10;i++){
    const next=store.state.prompts.find(p=>p.result===undefined);
    if(!next||next.constructor.name!=='WaitPrompt')break;
    store.dispatch(new ResolvePromptAction(next.id,null));
  }
  assert.equal(opponent.active.damage,50,
    'Attack resolves real pinned Store damage after paid two-Psychic cost');
});

test('Temple converts attached M3 to Colorless in real owner observation',()=>{
  const {state,owner,catalog}=staged();
  const manager=initializeCards();
  const temple=manager.getCardByName('Temple of Sinnoh ASR');
  assert.ok(temple);
  owner.stadium.cards.push(temple);
  const view=actorObservation(state,0);
  const pick=chooseActorEnergyRecipient(view,catalog);
  assert.equal(pick.gapBefore,2);
  assert.equal(pick.gapAfter,1);
});
