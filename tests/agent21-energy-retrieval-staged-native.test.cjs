'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const PIN = path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const native = name => require(path.join(PIN,name));

/**
 * Staged source-print test only: it does not deal a natural sixty-card game.
 * No setup, search connector, bot policy or competitive sample is implied.
 * @param {0|1} ownerSeat
 * @param {number} basicDiscardCount
 */
function fixture(ownerSeat,basicDiscardCount) {
  const {Store}=native('game/store/store');
  const {State,GamePhase}=native('game/store/state/state');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GameSettings}=native('game/core/game-settings');
  const {Format}=native('game/store/card/card-types');
  const manager=initializeCards();
  let serial=721000+1000*ownerSeat+100*basicDiscardCount;
  /** @param {string} fullName @returns {object} */
  const card=fullName=>{
    const value=manager.getCardByName(fullName);
    assert.ok(value,'Native printable missing: '+fullName);
    value.id=serial++;
    return value;
  };
  const owner=new Player(),opponent=new Player();
  owner.id=301;opponent.id=502;
  owner.name='OriginalOwner';
  opponent.name='Opponent';
  const retrieval=card('Energy Retrieval SVI');
  const activeUnown=card('Unown AOR');
  const trubbish=card('Trubbish FST');
  owner.hand.cards.push(retrieval);
  owner.active.cards.push(activeUnown);
  opponent.active.cards.push(trubbish);
  opponent.active.damage=60;
  opponent.bench.push(new PokemonCardList());
  opponent.bench[0].cards.push(card('Lunatone OBF'));
  for(let i=0;i<basicDiscardCount;i++) {
    owner.discard.cards.push(card('Psychic Energy MEE'));
  }
  const specials=card('Double Colorless Energy NXD');
  owner.discard.cards.push(specials);
  for(const p of [owner,opponent]) {
    for(let i=0;i<16;i++)p.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<6;i++) {
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      p.prizes.push(prize);
    }
  }
  const settings=new GameSettings();
  settings.format=Format.EXPANDED;
  const state=new State();
  state.gameSettings=settings;
  state.rules=settings.rules;
  state.turn=14;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=ownerSeat;
  state.players=ownerSeat===0?[owner,opponent]:[opponent,owner];
  const store=new Store({onStateChange(){}});
  store.state=state;
  return {store,state,owner,opponent,retrieval,activeUnown,
    trubbish,specials};
}

/** @param {object} state @returns {object|null} */
const pending=state=>state.prompts.find(p=>p.result===undefined)??null;

/**
 * Acknowledges only the genuine informational show/reveal prompts generated
 * by this specific Item. It cannot choose a strategic action.
 * @param {object} f
 */
function settleRetrievalReveal(f) {
  const {ResolvePromptAction}=native(
    'game/store/actions/resolve-prompt-action');
  for(let i=0;i<12;i++) {
    const p=pending(f.state);
    if(!p)return;
    const type=p.constructor.name;
    if(type==='ShowCardsPrompt') {
      assert.equal(p.playerId,f.opponent.id);
      f.store.dispatch(new ResolvePromptAction(p.id,true));
    } else if(type==='WaitPrompt') {
      f.store.dispatch(new ResolvePromptAction(p.id,null));
    } else {
      assert.fail('Unexpected native retrieval prompt: '+type);
    }
  }
  assert.fail('Recovery reveal did not terminate in bounded native prompts');
}

/** @param {0|1} seat @param {1|2} recoveredCount */
function runRetrieval(seat,recoveredCount) {
  const f=fixture(seat,2);
  const {PlayCardAction,PlayerType,SlotType}=native(
    'game/store/actions/play-card-action');
  const {ResolvePromptAction}=native(
    'game/store/actions/resolve-prompt-action');
  assert.equal(f.retrieval.canPlay(f.store,f.state,f.owner),true);
  const before=f.owner.discard.cards.slice();
  const basic=before.filter(x=>x.name==='Psychic Energy');
  assert.equal(basic.length,2);
  assert.equal(f.specials.energyType,native(
    'game/store/card/card-types').EnergyType.SPECIAL);
  const beforePrize=f.owner.prizes.reduce((n,p)=>n+p.cards.length,0);
  f.store.dispatch(new PlayCardAction(f.owner.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  let p=pending(f.state);
  assert.equal(p?.constructor.name,'ChooseCardsPrompt');
  assert.equal(p.playerId,f.owner.id);
  assert.strictEqual(p.cards,f.owner.discard);
  assert.equal(p.message,'CHOOSE_CARD_TO_HAND');
  assert.equal(p.options.min,1);
  assert.equal(p.options.max,2);
  const selection=basic.slice(0,recoveredCount);
  assert.equal(p.validate(selection,f.state),true);
  assert.equal(p.validate([f.specials],f.state),false);
  f.store.dispatch(new ResolvePromptAction(p.id,selection));
  settleRetrievalReveal(f);
  assert.equal(f.owner.discard.cards.includes(f.retrieval),true,
    'Played Item must finish in owner discard after show prompt');
  assert.equal(f.owner.hand.cards.includes(f.retrieval),false);
  assert.equal(f.owner.supporter.cards.includes(f.retrieval),false);
  for(const x of selection) {
    assert.equal(f.owner.hand.cards.filter(c=>c===x).length,1,
      'Selected original Basic in hand exactly once');
    assert.equal(f.owner.discard.cards.includes(x),false);
  }
  assert.equal(f.owner.discard.cards.includes(f.specials),true);
  assert.equal(f.owner.discard.cards.filter(c=>
    c.name==='Psychic Energy').length,2-recoveredCount);
  assert.equal(f.owner.prizes.reduce((n,p)=>n+p.cards.length,0),
    beforePrize);
  return {...f,selected:selection};
}

for(const seat of [0,1]) {
  for(const qty of [1,2]) {
    test('pinned Energy Retrieval SVI owner-discard selection '+
      qty+' Basic, actor seat '+seat,()=>{
      const f=runRetrieval(seat,qty);
      console.log('AGENT21_ENERGY_RETRIEVAL_NATIVE',
        JSON.stringify({
          seat,recoveredCount:qty,
          retrievedPhysicalIds:f.selected.map(c=>c.id),
          ownerDiscardBasicAfter:f.owner.discard.cards.filter(
            x=>x.name==='Psychic Energy').length,
          itemPhysicallyDiscarded:true,
          specialUntouched:f.owner.discard.cards.includes(f.specials),
          competitiveQualifiedGames:0
        }));
    });
  }
  test('no Basic discard makes Energy Retrieval unplayable, seat '+seat,()=>{
    const f=fixture(seat,0);
    assert.equal(f.retrieval.canPlay(f.store,f.state,f.owner),false);
    assert.equal(f.owner.discard.cards.includes(f.specials),true);
  });
  test('one physically recovered Basic attaches to Unown, seat '+seat,()=>{
    const f=runRetrieval(seat,1);
    const {PlayCardAction,PlayerType,SlotType}=native(
      'game/store/actions/play-card-action');
    const energy=f.selected[0];
    const index=f.owner.hand.cards.indexOf(energy);
    assert.ok(index>=0);
    f.store.dispatch(new PlayCardAction(f.owner.id,index,{
      player:PlayerType.ANY,slot:SlotType.ACTIVE,index:0
    }));
    assert.equal(f.owner.active.energies.cards.includes(energy),true);
    assert.equal(f.owner.hand.cards.includes(energy),false);
    assert.equal(f.owner.active.getPokemonCard(),f.activeUnown);
    console.log('AGENT21_ENERGY_RETRIEVAL_NATIVE_ATTACH',
      JSON.stringify({
        seat,energyPhysicalId:energy.id,
        originalActiveUnownId:f.activeUnown.id,
        physicallyAttached:true,competitivelyQualifiedGames:0
      }));
  });
}
