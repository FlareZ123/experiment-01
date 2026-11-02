'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {actorObservation}=
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=file=>require(path.join(OUTPUT,file));

/**
 * Staged owner-public mechanistic board matching archived rank5 source:
 * Genesect V Active has one DCE, separate Mew VMAX on Bench has one DCE,
 * another Genesect V is Benched as its Fusion Strike donor.
 * Native Store validates all RetreatAction and payment effects.
 * @param {0|1} seat
 */
function stage(seat){
  const manager=initializeCards();
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {CardList}=engine('game/store/state/card-list');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {GamePhase}=engine('game/store/state/state');
  const {GameSettings}=engine('game/core/game-settings');
  const {PokemonCard}=engine('game/store/card/pokemon-card');
  const {EnergyCard}=engine('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition,Format}=
    engine('game/store/card/card-types');
  const {PowerType}=engine('game/store/card/pokemon-types');
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard,EnergyCard,Stage,EnergyType,CardType,PowerType,SpecialCondition
  });
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=47;
  state.activePlayer=seat;
  const owner=new Player(),opponent=new Player();
  owner.id=101;opponent.id=202;
  owner.name='rank5-physical-owner';opponent.name='candidate-physical-opponent';
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  let id=67000;
  const card=name=>{
    const item=manager.getCardByName(name);
    assert.ok(item,'Pinned native printing missing: '+name);
    item.id=id++;
    return item;
  };
  owner.active.cards.push(card('Genesect V FST'));
  owner.active.energies.cards.push(card('Double Colorless Energy SUM'));
  const mew=new PokemonCardList();
  mew.cards.push(card('Mew V FST'),card('Mew VMAX FST'));
  mew.energies.cards.push(card('Double Colorless Energy SUM'));
  const donor=new PokemonCardList();
  donor.cards.push(card('Genesect V FST'));
  owner.bench=[mew,donor];
  opponent.active.cards.push(card('Tapu Lele-GX GRI'));
  for(const player of state.players){
    for(let i=0;i<14;i++)player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  return {store,state,owner,opponent,catalog,seat};
}

for(const seat of [0,1]){
  test('native paid DCE -> Mew VMAX retreat, owner physical seat '+seat,()=>{
    const {store,state,owner,catalog}=stage(seat);
    const {RetreatAction}=engine('game/store/actions/game-actions');
    const {ResolvePromptAction}=
      engine('game/store/actions/resolve-prompt-action');
    const before=actorObservation(state,seat);
    const noOpt=chooseActorRootIntent(before,catalog,{});
    assert.notEqual(noOpt?.kind,'paid-retreat',
      'The new print-specific owner retreat is default OFF');
    const intent=chooseActorRootIntent(before,catalog,{
      dceMewMobilityRoot:true
    });
    assert.ok(intent,'Owner-root Mew DCE mobility intent must exist');
    assert.equal(intent.kind,'paid-retreat');
    assert.equal(intent.benchIndex,0);
    assert.equal(intent.printing,'Mew VMAX FST');
    assert.equal(intent.retreatCostUnits,1);
    assert.equal(owner.active.energies.cards.length,1);
    store.dispatch(new RetreatAction(owner.id,intent.benchIndex));
    for(let i=0;i<25;i++){
      const prompt=state.prompts.find(x=>x.result===undefined);
      if(!prompt)break;
      assert.equal(prompt.playerId,owner.id,
        'Prompt resolution must remain on real physical retreat owner');
      if(prompt.constructor.name==='WaitPrompt'){
        store.dispatch(new ResolvePromptAction(prompt.id,null));
      }else if(prompt.constructor.name==='ChooseCardsPrompt'){
        assert.equal(prompt.cards,owner.active.energies,
          'Retreat payment must draw from the original Active Energy cards');
        assert.equal(prompt.validate([owner.active.energies.cards[0]]),true);
        store.dispatch(new ResolvePromptAction(prompt.id,
          [owner.active.energies.cards[0]]));
      }else{
        assert.fail('Unhandled real native paid-retreat prompt '+prompt.constructor.name);
      }
    }
    assert.equal(owner.active.getPokemonCard().fullName,'Mew VMAX FST',
      'Genuine Store must promote the separately paid attacker');
    assert.equal(owner.active.energies.cards.length,1);
    assert.equal(owner.bench[0].getPokemonCard().fullName,'Genesect V FST');
    assert.equal(owner.bench[0].energies.cards.length,0,
      'Printed DCE on the old Active is discarded to pay Retreat');
    assert.equal(owner.retreatedTurn,47);
    assert.equal(owner.discard.cards.some(x=>
      x.fullName==='Double Colorless Energy SUM'),true);
  });
}

module.exports={stage};
