'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {initializeCards} = require('../../simulation/twinleaf/headless.cjs');
const {installFogMimikyuSetup,eligibleFogMimikyu,ownerSetupWindow} =
  require('../../simulation/twinleaf/2026-11/agent46-mimikyu-fog-search-setup.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native = name => require(path.join(OUTPUT, name));

/** @param {0|1} seat @returns {object} Legal native mid-game fixture. */
function fixture(seat) {
  const manager = initializeCards();
  const card = name => {
    const c = manager.getCardByName(name);
    assert.ok(c, 'Unavailable pinned card '+name);
    return c;
  };
  const {Store} = native('game/store/store');
  const {Player} = native('game/store/state/player');
  const {PokemonCardList} = native('game/store/state/pokemon-card-list');
  const {CardList} = native('game/store/state/card-list');
  const {GamePhase} = native('game/store/state/state');
  const definitions = native('simple-bot/simple-bot-definitions');
  const {PlayBasicTactic} = native('simple-bot/simple-tactics/play-basic-tactic');
  const {PlayTrainerTactic} = native('simple-bot/simple-tactics/play-trainer-tactic');
  const {ChooseCardsPromptResolver} =
    native('simple-bot/prompt-resolver/choose-cards-prompt-resolver');
  const options = {
    tactics:definitions.allSimpleTactics,
    promptResolvers:definitions.allPromptResolvers,
    scores:definitions.defaultStateScores,
    arbiter:definitions.defaultArbiterOptions
  };
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const owner = new Player();
  owner.id = seat === 0 ? 101 : 202;
  const opponent = new Player();
  opponent.id = seat === 0 ? 202 : 101;
  state.players = seat === 0 ? [owner,opponent] : [opponent,owner];
  state.activePlayer = seat;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  for (const player of state.players) {
    player.prizes = Array.from({length:6}, () =>
      CardList.fromList(['Psychic Energy SVE']));
  }
  owner.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  owner.bench.push(new PokemonCardList());
  opponent.active.cards.push(card('Regidrago V SIT'));
  owner.hand.cards.push(card('Dialga-GX UPR'),
    card('Radiant Eternatus CRZ'),card('Fog Crystal CRE'));
  owner.deck.cards.push(card('Mimikyu GRI'),card('Psychic Energy SVE'),
    card('Psychic Energy SVE'),card('Lillie\'s Clefairy ex JTG'));
  opponent.deck.cards.push(card('Psychic Energy SVE'));
  return {
    store,state,owner,opponent,card,seat,
    basic:new PlayBasicTactic(options),
    trainer:new PlayTrainerTactic(options),
    resolver:new ChooseCardsPromptResolver(options)
  };
}

for (const seat of [0,1]) {
  test('native Fog Crystal searches and physically transfers owner Mimikyu in seat '+seat,() => {
    const f = fixture(seat);
    const events=[];
    const initialBasic=f.basic.useTactic(f.state,f.owner);
    assert.equal(initialBasic?.handIndex,0);
    const restore=installFogMimikyuSetup({seat,onEvent:e=>events.push(e)});
    try {
      assert.strictEqual(installFogMimikyuSetup({seat}),restore);
      assert.equal(ownerSetupWindow(f.state,f.owner,seat),true);
      assert.equal(f.basic.useTactic(f.state,f.owner),undefined,
        'Dragon payloads should be held instead of automatically benched');
      const action=f.trainer.useTactic(f.state,f.owner);
      assert.equal(action?.type,'PLAY_CARD_ACTION');
      assert.equal(action.handIndex,2);
      assert.equal(f.owner.hand.cards[action.handIndex]?.fullName,'Fog Crystal CRE');
      f.store.dispatch(action);
      const prompt=f.store.state.prompts.find(p=>
        p.result===undefined&&p.constructor.name==='ChooseCardsPrompt');
      assert.ok(prompt,'Actual Fog Crystal must expose physical owner-deck search');
      assert.equal(prompt.playerId,f.owner.id);
      const physical=f.owner.deck.cards.find(c=>c.fullName==='Mimikyu GRI');
      assert.strictEqual(eligibleFogMimikyu(f.store.state,f.owner,prompt,seat),
        physical);
      const answer=f.resolver.resolvePrompt(f.store.state,f.owner,prompt);
      assert.equal(answer?.constructor?.name,'ResolvePromptAction');
      assert.deepEqual(answer.result,[physical]);
      assert.equal(prompt.validate(answer.result),true);
      f.store.dispatch(answer);
      const nativeOwner=f.store.state.players[seat];
      assert.ok(nativeOwner.hand.cards.includes(physical),
        'Actual native Store must move the selected physical Mimikyu to owner hand');
      assert.equal(nativeOwner.deck.cards.includes(physical),false);
      assert.equal(events.some(e=>e.kind==='preserved-dragon-payloads'),true);
      assert.equal(events.some(e=>e.kind==='proposed-fog-crystal'),true);
      assert.equal(events.some(e=>e.kind==='selected-physical-fog-mimikyu'),true);
    } finally {
      restore();
    }
    assert.equal(f.basic.useTactic(f.store.state,f.store.state.players[seat])
      ?.handIndex,0,'Native Basic tactic must be restored');
  });

  test('non-Regidrago disables owner Fog and preserves opponent policy in seat '+seat,()=>{
    const f=fixture(seat);
    const restore=installFogMimikyuSetup({seat});
    try {
      assert.equal(f.trainer.useTactic(f.state,f.opponent),undefined);
      f.opponent.active.cards.length=0;
      f.opponent.active.cards.push(f.card('Dratini OBF'));
      assert.equal(ownerSetupWindow(f.state,f.owner,seat),false);
      assert.equal(f.basic.useTactic(f.state,f.owner).handIndex,0);
      const r=f.trainer.useTactic(f.state,f.owner);
      assert.ok(r===undefined||r.handIndex===2);
      assert.throws(()=>installFogMimikyuSetup({seat:1-seat}),
        /Conflicting Fog setup owner/);
    }finally{restore();}
  });
}
