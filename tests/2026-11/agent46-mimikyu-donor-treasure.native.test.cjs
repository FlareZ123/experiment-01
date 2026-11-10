'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {ownerDonorTreasureOpportunity,installMimikyuDonorTreasure}=
  require('../../simulation/twinleaf/2026-11/agent46-mimikyu-donor-treasure.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} pathInsideOutput @returns {any} Pinned compiled native API. */
const native=p=>require(path.join(OUTPUT,p));

/** @param {0|1} seat @returns {object} Physical printed original-card owner State. */
function fixture(seat){
  const manager=initializeCards();
  const card=fullName=>{
    const c=manager.getCardByName(fullName);
    assert.ok(c,'Missing original native '+fullName);
    return c;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {PlayTrainerTactic}=
    native('simple-bot/simple-tactics/play-trainer-tactic');
  const {ChooseCardsPromptResolver}=
    native('simple-bot/prompt-resolver/choose-cards-prompt-resolver');
  const definitions=native('simple-bot/simple-bot-definitions');
  const options={tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions};
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player();owner.id=seat===0?101:202;
  const opponent=new Player();opponent.id=seat===0?202:101;
  state.players=seat===0?[owner,opponent]:[opponent,owner];
  state.phase=GamePhase.PLAYER_TURN;state.activePlayer=seat;state.turn=4;
  owner.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  opponent.active.cards.push(card('Regidrago V SIT'));
  const bench=new PokemonCardList();
  bench.cards.push(card('Mimikyu GRI'));
  owner.bench.push(bench);
  const dialga=card('Dialga-GX UPR');
  owner.hand.cards.push(dialga,card('Mysterious Treasure FLI'));
  owner.deck.cards.push(card('Shadow Rider Calyrex VMAX CRE'),
    card('Shadow Rider Calyrex V CRE'),card('Psychic Energy SVE'));
  opponent.deck.cards.push(card('Psychic Energy SVE'));
  for(const p of state.players)
    p.prizes=Array.from({length:6},()=>CardList.fromList(['Psychic Energy SVE']));
  return {store,state,owner,opponent,dialga,card,seat,
    trainer:new PlayTrainerTactic(options),
    resolver:new ChooseCardsPromptResolver(options)};
}

for(const seat of [0,1]){
  test('physical Mimikyu is already Benched; Treasure pays Dialga from owner hand in seat '+seat,()=>{
    const f=fixture(seat),events=[];
    assert.equal(ownerDonorTreasureOpportunity(f.state,f.owner,seat).handIndex,1);
    const restore=installMimikyuDonorTreasure({seat,onEvent:e=>events.push(e)});
    try{
      assert.strictEqual(installMimikyuDonorTreasure({seat}),restore);
      const action=f.trainer.useTactic(f.state,f.owner);
      assert.equal(action?.type,'PLAY_CARD_ACTION');
      assert.equal(action?.handIndex,1);
      f.store.dispatch(action);
      const pending=f.store.state.prompts.find(p=>p.result===undefined&&
        p.constructor.name==='ChooseCardsPrompt');
      assert.equal(pending?.message,'CHOOSE_CARD_TO_DISCARD');
      const answer=f.resolver.resolvePrompt(f.store.state,f.owner,pending);
      assert.deepEqual(answer?.result,[f.dialga]);
      assert.equal(pending.validate(answer.result),true);
      f.store.dispatch(answer);
      assert.equal(f.owner.hand.cards.includes(f.dialga),false);
      assert.ok(f.owner.discard.cards.includes(f.dialga));
      assert.equal(ownerDonorTreasureOpportunity(f.store.state,f.owner,seat),null);
      assert.ok(events.some(e=>e.kind==='proposed-donor-treasure-root'));
      assert.ok(events.some(e=>e.kind==='resolved-physical-donor-treasure-payment'));
      const search=f.store.state.prompts.find(p=>p.result===undefined&&
        p.constructor.name==='ChooseCardsPrompt'&&p.cards===f.owner.deck);
      assert.equal(search?.message,'CHOOSE_CARD_TO_HAND');
      const searchAnswer=f.resolver.resolvePrompt(f.store.state,f.owner,search);
      assert.equal(search.validate(searchAnswer?.result),true);
      f.store.dispatch(searchAnswer);
      assert.equal(f.owner.bench[0].getPokemonCard()?.fullName,'Mimikyu GRI',
        'Donor payment must not consume or replace the established Mimikyu');
    }finally{restore();}
  });

  test('owner hand and Regidrago scope; spent GX blocks donor priority in seat '+seat,()=>{
    const f=fixture(seat);
    assert.equal(ownerDonorTreasureOpportunity(f.state,f.opponent,seat),null);
    f.owner.usedGX=true;
    assert.equal(ownerDonorTreasureOpportunity(f.state,f.owner,seat),null);
    f.owner.usedGX=false;
    f.opponent.active.cards.length=0;
    f.opponent.active.cards.push(f.card('Dratini OBF'));
    assert.equal(ownerDonorTreasureOpportunity(f.state,f.owner,seat),null);
    assert.throws(()=>ownerDonorTreasureOpportunity({},f.owner,seat),
      /Cannot read properties|undefined/);
  });
}
