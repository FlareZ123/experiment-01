'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {payableCompressorHandIndex,installMimikyuCompressorDonor}=
  require('../../simulation/twinleaf/2026-11/agent46-mimikyu-battle-compressor-donor.cjs');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName @returns {any} Pinned compiled engine module. */
const native=moduleName=>require(path.join(OUTPUT,moduleName));

/** @param {0|1} seat @returns {object} Native registered original card fixture. */
function fixture(seat){
  const manager=initializeCards();
  const card=printing=>{
    const c=manager.getCardByName(printing);
    assert.ok(c,'Native card not installed '+printing);
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
  const def=native('simple-bot/simple-bot-definitions');
  const options={tactics:def.allSimpleTactics,
    promptResolvers:def.allPromptResolvers,
    scores:def.defaultStateScores,arbiter:def.defaultArbiterOptions};
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player();owner.id=seat===0?101:202;
  const rival=new Player();rival.id=seat===0?202:101;
  state.players=seat===0?[owner,rival]:[rival,owner];
  state.phase=GamePhase.PLAYER_TURN;state.activePlayer=seat;state.turn=4;
  owner.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  rival.active.cards.push(card('Regidrago V SIT'));
  const mimikyu=new PokemonCardList();
  mimikyu.cards.push(card('Mimikyu GRI'));
  mimikyu.energies.cards.push(card('Psychic Energy SVE'));
  owner.bench.push(mimikyu);
  owner.hand.cards.push(card('Battle Compressor PHF'));
  const donor=card('Dialga-GX UPR');
  owner.deck.cards.push(donor,card('Shadow Rider Calyrex VMAX CRE'),
    card('Psychic Energy SVE'));
  rival.deck.cards.push(card('Psychic Energy SVE'));
  for(const p of state.players)
    p.prizes=Array.from({length:6},()=>CardList.fromList(['Psychic Energy SVE']));
  return {store,state,owner,rival,mimikyu,donor,card,seat,
    tactic:new PlayTrainerTactic(options),
    resolver:new ChooseCardsPromptResolver(options)};
}

for(const seat of [0,1]){
  test('Compressor searches real own deck and discards physical Dialga, seat '+seat,()=>{
    const f=fixture(seat),events=[];
    assert.equal(payableCompressorHandIndex(f.state,f.owner,seat),0);
    const restore=installMimikyuCompressorDonor({seat,onEvent:e=>events.push(e)});
    try{
      assert.strictEqual(installMimikyuCompressorDonor({seat}),restore);
      const action=f.tactic.useTactic(f.state,f.owner);
      assert.equal(action?.type,'PLAY_CARD_ACTION');
      assert.equal(action?.handIndex,0);
      f.store.dispatch(action);
      const prompt=f.store.state.prompts.find(p=>p.result===undefined&&
        p.constructor.name==='ChooseCardsPrompt'&&p.cards===f.owner.deck);
      assert.equal(prompt?.message,'CHOOSE_CARD_TO_DISCARD');
      const response=f.resolver.resolvePrompt(f.store.state,f.owner,prompt);
      assert.deepEqual(response?.result,[f.donor]);
      assert.equal(prompt.validate(response.result),true);
      f.store.dispatch(response);
      assert.equal(f.owner.deck.cards.includes(f.donor),false);
      assert.ok(f.owner.discard.cards.includes(f.donor));
      assert.equal(f.mimikyu.energies.cards.length,1);
      assert.ok(events.some(e=>e.kind==='proposed-donor-compressor-root'));
      assert.ok(events.some(e=>e.kind==='resolved-physical-compressor-donor-search'));
    }finally{restore();}
  });

  test('Compressor donor branch rejects paid or unready conditions in seat '+seat,()=>{
    const f=fixture(seat);
    assert.equal(payableCompressorHandIndex(f.state,f.rival,seat),-1);
    f.owner.usedGX=true;
    assert.equal(payableCompressorHandIndex(f.state,f.owner,seat),-1);
    f.owner.usedGX=false;
    f.mimikyu.energies.cards.length=0;
    assert.equal(payableCompressorHandIndex(f.state,f.owner,seat),-1);
    f.mimikyu.energies.cards.push(f.card('Psychic Energy SVE'));
    f.owner.hand.cards.push(f.donor);
    assert.equal(payableCompressorHandIndex(f.state,f.owner,seat),-1);
  });
}
