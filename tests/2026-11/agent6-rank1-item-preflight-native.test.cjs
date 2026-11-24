'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const runner = require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const frontierModule = require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const adapterModule = require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');
const { createValidationRandomScope, seededRandom } = require('../../simulation/evaluation/2026-11/agent49-native-fixture-game.cjs');

const compiledActionEnumerator = path.join(
  __dirname,
  '../../vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js'
);

test('pinned rank-1 Item exact-print preflights filter native CANNOT boundaries and admit valid states', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 60000
}, () => {
  const enginePin=runner.V3_FIXTURE.engineCommit;
  const native=runner.loadNativeRoleDependencies({enginePin});
  const withValidationRandom=createValidationRandomScope({
    ambientRandom:Math.random,
    physicalRandom:seededRandom(0x71a7e124)
  });
  const manager=native.CardManager.getInstance();
  let nextCardId=980000;
  function cloneCard(fullName){
    const card=manager.getCardByName(fullName);
    assert.ok(card,'CardManager must resolve '+fullName);
    card.id=nextCardId++;
    return card;
  }
  const basicDefinition=manager.getAllCards().find(card=>
    card instanceof native.PokemonCard&&card.stage===native.Stage.BASIC&&
    (!Array.isArray(card.powers)||card.powers.length===0));
  assert.ok(basicDefinition,'pinned pool must contain a Basic Pokémon');
  const psychicSearchTarget=cloneCard('Shadow Rider Calyrex VMAX CRE');
  assert.ok(psychicSearchTarget instanceof native.PokemonCard,
    'Mysterious Treasure positive control requires a Psychic Pokémon target');

  const scenarios=[
    {
      fullName:'Mysterious Treasure FLI',
      configure(player,positive){
        player.hand.cards.push(cloneCard(basicDefinition.fullName));
        player.deck.cards=positive?[cloneCard(psychicSearchTarget.fullName)]:[];
      }
    },
    {
      fullName:'Quick Ball FST',
      configure(player,positive){
        player.hand.cards.push(cloneCard(basicDefinition.fullName));
        player.deck.cards=positive?[cloneCard(basicDefinition.fullName)]:[];
      }
    },
    {
      fullName:'Hisuian Heavy Ball ASR',
      configure(player,positive){
        player.deck.cards=[cloneCard(basicDefinition.fullName)];
        player.prizes.forEach((prize,index)=>{
          prize.isSecret=positive&&index===0;
        });
      }
    },
    {
      fullName:'Battle Compressor PHF',
      configure(player,positive){
        player.deck.cards=positive?
          Array.from({length:5},()=>cloneCard(basicDefinition.fullName)):[];
      }
    }
  ];

  function makePlayer(id){
    const player=new native.Player();
    player.id=id;
    player.active=new native.PokemonCardList();
    const active=cloneCard(basicDefinition.fullName);
    player.active.cards=[active];
    player.active.hp=active.hp;
    player.active.damage=0;
    player.active.energies.cards=[];
    player.active.tools=[];
    player.active.specialConditions=[];
    player.bench=Array.from({length:5},()=>new native.PokemonCardList());
    player.prizes=Array.from({length:6},()=>{
      const prize=new native.CardList();
      prize.cards=[cloneCard(basicDefinition.fullName)];
      prize.isSecret=true;
      return prize;
    });
    player.deck.cards=[];
    player.hand.cards=[];
    player.discard.cards=[];
    player.stadium.cards=[];
    player.lostzone.cards=[];
    player.supporter.cards=[];
    player.playableCardIds=[];
    player.playableHandAbilityCardIds=[];
    player.supporterTurn=0;
    player.canEvolve=false;
    return player;
  }

  function makeScenario(scenario,positive){
    const candidate=makePlayer(0);
    const opponent=makePlayer(1);
    const item=cloneCard(scenario.fullName);
    candidate.hand.cards=[item];
    scenario.configure(candidate,positive);
    candidate.playableCardIds=candidate.hand.cards.map(card=>card.id);
    const initialState=new native.State();
    initialState.players=[candidate,opponent];
    initialState.activePlayer=0;
    initialState.phase=native.GamePhase.PLAYER_TURN;
    initialState.turn=3;
    initialState.prompts=[];
    initialState.gameSettings.format=native.Format.EXPANDED;
    initialState.gameSettings.sandboxMode=false;
    const simulator=withValidationRandom(()=>new native.Simulator(initialState));
    const state=simulator.store.state;
    // Keep the face-down Prize boundary explicit after Simulator cloning.
    if(scenario.fullName==='Hisuian Heavy Ball ASR'){
      state.players[0].prizes.forEach((prize,index)=>{
        prize.isSecret=positive&&index===0;
      });
    }
    const actor=state.players[0];
    const enumerator=adapterModule.createKnownCapFreeActionEnumerator({native,enginePin});
    const action=enumerator.playItemActions(state,actor).find(candidate=>
      actor.hand.cards[candidate.handIndex]?.fullName===scenario.fullName);
    assert.ok(action,'native ActionEnumerator must propose '+scenario.fullName);
    const pass=enumerator.enumerate(state,actor,actor.id).find(candidate=>candidate.type==='PASS_TURN');
    assert.ok(pass,'native ActionEnumerator must provide a pass fallback');
    return {simulator,state,actor,enumerator,action,pass};
  }

  for(const scenario of scenarios){
    const valid=makeScenario(scenario,true);
    const validFrontier=withValidationRandom(()=>frontierModule.buildNativeActionFrontier({
      state:valid.state,actorSeat:0,native,
      enumerator:{enumerate:()=>[valid.action,valid.pass]}
    }));
    assert.equal(validFrontier.diagnostics.preflightRejectedCount,0,
      scenario.fullName+' positive state must not be preflight-rejected');
    const validItem=validFrontier.actionFrontier.items.find(item=>
      item.kind==='play-card'&&item.actorPrinting===scenario.fullName);
    assert.ok(validItem,scenario.fullName+' positive state must remain available to the policy');
    assert.doesNotThrow(()=>frontierModule.dispatchSelectedNativeAction({
      store:valid.simulator.store,frontier:validFrontier,token:validItem.token,
      state:valid.state,actorSeat:0,native,withValidationRandom
    }),scenario.fullName+' positive state must survive selected cloned-Store validation');

    const invalid=makeScenario(scenario,false);
    const rawStore=withValidationRandom(()=>new native.Simulator(invalid.state)).store;
    assert.throws(()=>withValidationRandom(()=>rawStore.dispatch(invalid.action)),
      error=>error instanceof native.GameError&&
        error.message===native.GameMessage.CANNOT_PLAY_THIS_CARD,
      scenario.fullName+' negative boundary must be rejected by the pinned native Store');
    const invalidFrontier=withValidationRandom(()=>frontierModule.buildNativeActionFrontier({
      state:invalid.state,actorSeat:0,native,
      enumerator:{enumerate:()=>[invalid.action,invalid.pass]}
    }));
    assert.equal(invalidFrontier.diagnostics.preflightRejectedCount,1,
      scenario.fullName+' negative boundary must be filtered by its exact-print preflight');
    assert.equal(invalidFrontier.diagnostics.rejectedCount,1);
    assert.equal(invalidFrontier.actionFrontier.items.some(item=>
      item.kind==='play-card'&&item.actorPrinting===scenario.fullName),false,
      scenario.fullName+' negative boundary must not reach the policy');
    assert.ok(invalidFrontier.actionFrontier.items.some(item=>item.kind==='pass'),
      scenario.fullName+' negative boundary must leave the legal pass fallback');
  }
});
