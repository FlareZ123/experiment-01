'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const out = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(out, name));

/**
 * Real AttackAction and PlayCardAction on an injected legal going-second turn.
 * Reads the current Store player after rejected-action rollback.
 * @param {boolean} pathInPlay
 * @param {'none'|'ranger'|'spent'} [response]
 * @returns {object}
 */
function probe(pathInPlay, response='none') {
  const manager = initializeCards();
  let id = 1;
  /** @param {string} name */
  const card = name => {
    const c = manager.getCardByName(name);
    assert.ok(c, 'Missing pinned printing: ' + name);
    c.id = id++;
    return c;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format} = load('game/store/card/card-types');
  const {AttackAction, PassTurnAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {PlayCardAction,PlayerType,SlotType} =
    load('game/store/actions/play-card-action');
  const store = new Store({onStateChange(){}});
  const state = store.state;
  const a = new Player(), b = new Player();
  a.id = 101; b.id = 202;
  state.players = [a,b];
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = 0;
  state.turn = 2;
  state.gameSettings.format = Format.EXPANDED;
  a.active.cards.push(card('Chimecho CIN'));
  const energy = card('Psychic Energy SVE');
  a.active.cards.push(energy);
  a.active.energies.cards.push(energy);
  b.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  b.bench.push(new PokemonCardList());
  const incoming = card('Tapu Lele-GX GRI');
  b.hand.cards.push(incoming);
  const ranger = response==='none' ? null : card('Pokemon Ranger STS');
  if (ranger) b.hand.cards.push(ranger);
  if (pathInPlay) a.stadium.cards.push(card('Path to the Peak CRE'));
  for (const player of state.players) {
    for (let i=0;i<4;i++) player.deck.cards.push(card('Psychic Energy SVE'));
    for (let i=0;i<6;i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  store.dispatch(new AttackAction(a.id,'Bell of Silence'));
  let waits=0;
  for (let i=0;i<20;i++) {
    const p=store.state.prompts.find(x=>x.result===undefined);
    if (!p) break;
    assert.equal(p.constructor.name,'WaitPrompt');
    store.dispatch(new ResolvePromptAction(p.id,null));
    waits++;
  }
  assert.equal(store.state.prompts.some(p=>p.result===undefined),false);
  assert.equal(store.state.activePlayer,1,'Must reach affected player turn');
  assert.equal(store.state.phase,GamePhase.PLAYER_TURN);
  /** @returns {object} */
  const live = () => store.state.players.find(p=>p.id===b.id);
  assert.ok(live());
  assert.equal(live().cannotPlayPokemonWithAbilities,true);
  assert.equal(live().active.damage,10,'Attack must deal printed 10 damage');
  if (response==='spent') live().supporterTurn=store.state.turn;
  let rangerPlayed=false;
  if (ranger) {
    const playRanger=()=>store.dispatch(new PlayCardAction(b.id,
      live().hand.cards.indexOf(ranger),{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }));
    if (response==='spent') {
      assert.throws(playRanger, 'Spent Supporter should reject Ranger');
      assert.equal(live().cannotPlayPokemonWithAbilities,true);
    } else {
      playRanger();
      rangerPlayed=true;
      assert.equal(live().cannotPlayPokemonWithAbilities,false,
        'Ranger must remove attack-origin player lock');
    }
  }
  const expectedBlocked=response!=='ranger';
  const tryBench=()=>store.dispatch(new PlayCardAction(b.id,
    live().hand.cards.indexOf(incoming),{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }));
  if (expectedBlocked) assert.throws(tryBench);
  else tryBench();
  assert.equal(live().bench[0].getPokemonCard()===incoming,!expectedBlocked);
  assert.equal(live().hand.cards.includes(incoming),expectedBlocked);
  let lockExpired=null;
  if (expectedBlocked) {
    store.dispatch(new PassTurnAction(b.id));
    lockExpired=live().cannotPlayPokemonWithAbilities===false;
    assert.equal(lockExpired,true);
  }
  return {pathInPlay,response,turnAfterAttack:3,damage:10,
    waitPrompts:waits,rangerPlayed,
    printedAbilityHandEntryBlocked:expectedBlocked,lockExpired};
}

/** @returns {object} */
function main() {
  return {pinned:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases:['none','ranger','spent'].flatMap(response=>
      [probe(false,response),probe(true,response)]),
    scope:'Staged turn2 actual attack, Ranger support contention, hand entry and expiry; no full source-dealt game.'};
}
if (require.main===module)console.log(JSON.stringify(main(),null,2));
module.exports={probe,main};
