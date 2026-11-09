'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {payableTreasureHandIndex,installTreasureMimikyuSetup}=
  require('../../simulation/twinleaf/2026-11/agent46-mimikyu-treasure-search-setup.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native=name=>require(path.join(OUTPUT,name));
/** @param {0|1} seat @returns {object} Full native source-card ownership fixture. */
function fixture(seat){
  const manager=initializeCards();
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Pinned card missing '+name);
    return c;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {PlayBasicTactic}=native('simple-bot/simple-tactics/play-basic-tactic');
  const {PlayTrainerTactic}=native('simple-bot/simple-tactics/play-trainer-tactic');
  const {ChooseCardsPromptResolver}=
    native('simple-bot/prompt-resolver/choose-cards-prompt-resolver');
  const def=native('simple-bot/simple-bot-definitions');
  const options={tactics:def.allSimpleTactics,
    promptResolvers:def.allPromptResolvers,scores:def.defaultStateScores,
    arbiter:def.defaultArbiterOptions};
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const candidate=new Player();
  candidate.id=seat===0?101:202;
  const opponent=new Player();
  opponent.id=seat===0?202:101;
  state.players=seat===0?[candidate,opponent]:[opponent,candidate];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.turn=4;
  candidate.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  candidate.bench.push(new PokemonCardList());
  candidate.hand.cards.push(card('Dialga-GX UPR'),
    card('Mysterious Treasure FLI'),card('Fog Crystal CRE'));
  const physicalMimikyu=card('Mimikyu GRI');
  candidate.deck.cards.push(physicalMimikyu,
    card('Psychic Energy SVE'),card('Psychic Energy SVE'),
    card('Lillie\'s Clefairy ex JTG'));
  opponent.deck.cards.push(card('Psychic Energy SVE'));
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>
      CardList.fromList(['Psychic Energy SVE']));
  }
  return {store,state,candidate,opponent,card,seat,physicalMimikyu,
    basic:new PlayBasicTactic(options),
    trainer:new PlayTrainerTactic(options),
    resolver:new ChooseCardsPromptResolver(options)};
}

for(const seat of [0,1]){
  test('native Treasure pays with real Dialga and obtains real own-deck Mimikyu, seat '+seat,()=>{
    const x=fixture(seat),events=[];
    assert.equal(payableTreasureHandIndex(x.state,x.candidate,seat),1);
    const restore=installTreasureMimikyuSetup({seat,onEvent:e=>events.push(e)});
    try{
      assert.strictEqual(installTreasureMimikyuSetup({seat}),restore);
      assert.equal(x.basic.useTactic(x.state,x.candidate),undefined);
      const action=x.trainer.useTactic(x.state,x.candidate);
      assert.equal(action?.handIndex,1);
      assert.equal(action?.type,'PLAY_CARD_ACTION');
      x.store.dispatch(action);
      const discardPrompt=x.store.state.prompts.find(p=>p.result===undefined&&
        p.constructor.name==='ChooseCardsPrompt');
      assert.ok(discardPrompt,'Actual Treasure must request its discard');
      assert.equal(discardPrompt.message,'CHOOSE_CARD_TO_DISCARD');
      const dialga=x.candidate.hand.cards.find(c=>c.fullName==='Dialga-GX UPR');
      const discardReply=x.resolver.resolvePrompt(x.store.state,x.candidate,discardPrompt);
      assert.deepEqual(discardReply?.result,[dialga]);
      assert.equal(discardPrompt.validate(discardReply.result),true);
      x.store.dispatch(discardReply);
      assert.ok(x.candidate.discard.cards.includes(dialga),
        'Native Store must actually pay the owner-held physical Dragon');
      const searchPrompt=x.store.state.prompts.find(p=>p.result===undefined&&
        p.constructor.name==='ChooseCardsPrompt'&&p.cards===x.candidate.deck);
      assert.ok(searchPrompt,'Native dual-axis Treasure must request owner-deck search');
      assert.equal(searchPrompt.message,'CHOOSE_CARD_TO_HAND');
      const searchReply=x.resolver.resolvePrompt(x.store.state,x.candidate,searchPrompt);
      assert.deepEqual(searchReply?.result,[x.physicalMimikyu]);
      assert.equal(searchPrompt.validate(searchReply.result),true);
      x.store.dispatch(searchReply);
      assert.equal(x.candidate.hand.cards.includes(x.physicalMimikyu),true);
      assert.equal(x.candidate.deck.cards.includes(x.physicalMimikyu),false);
      assert.ok(events.some(e=>e.kind==='proposed-treasure'));
      assert.ok(events.some(e=>e.kind==='selected-physical-treasure-discard'));
      assert.ok(events.some(e=>e.kind==='selected-physical-treasure-mimikyu'));
    }finally{restore();}
    assert.equal(x.basic.useTactic(x.store.state,x.store.state.players[seat])
      ?.handIndex,0,'Uninstall must restore printed default Basic action');
  });

  test('non-Regidrago and owner-seat isolation for Treasure, seat '+seat,()=>{
    const x=fixture(seat);
    const restore=installTreasureMimikyuSetup({seat});
    try{
      assert.equal(payableTreasureHandIndex(x.state,x.opponent,seat),-1);
      x.opponent.active.cards.length=0;
      x.opponent.active.cards.push(x.card('Dratini OBF'));
      assert.equal(payableTreasureHandIndex(x.state,x.candidate,seat),-1);
      assert.equal(x.basic.useTactic(x.state,x.candidate)?.handIndex,0);
      assert.throws(()=>installTreasureMimikyuSetup({seat:1-seat}),
        /Conflicting Treasure owner/);
    }finally{restore();}
  });
}
