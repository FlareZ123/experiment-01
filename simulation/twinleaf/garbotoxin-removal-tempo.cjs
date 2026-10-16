'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const root = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(root,name));

/**
 * Action-order test: removing a Tool from a functioning Garbotoxin Pokémon
 * can reactivate Vileplume's Item lock before the same player plays Switch.
 * @param {{vileplume:boolean,hood:boolean,activeSeat:0|1}} options
 */
function probe(options) {
  const manager = initializeCards();
  let nextId = 1;
  /** @param {string} name */
  const card = name => {
    const found = manager.getCardByName(name);
    assert.ok(found,'Missing pinned card '+name);
    found.id = nextId++;
    return found;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} = engine('game/store/actions/play-card-action');
  const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const owner = new Player(),other = new Player();
  owner.id = 101; owner.name = 'Vileplume seat';
  other.id = 202; other.name = 'Garbodor seat';
  state.players = [owner,other];
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = options.activeSeat;
  state.gameSettings.format = Format.EXPANDED;
  owner.active.cards.push(card('Bunnelby PRC'));
  other.active.cards.push(card('Shadow Rider Calyrex V CRE'));

  const flower = new PokemonCardList();
  flower.cards.push(card('Oddish UNB'));
  if (options.vileplume) {
    flower.cards.push(card('Gloom UNB'),card('Vileplume AOR'));
    if (options.hood) flower.tools.push(card('Stealthy Hood UNB'));
  }
  owner.bench.push(flower);
  const trash = new PokemonCardList();
  trash.cards.push(card('Trubbish BKP'),card('Garbodor BKP'));
  const tool = card('Float Stone BKT');
  trash.tools.push(tool);
  other.bench.push(trash);
  for (const p of state.players) {
    p.prizes = Array.from({length:6},()=>{
      const prize = new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
    p.deck.cards.push(card('Psychic Energy SVE'),card('Psychic Energy SVE'));
  }

  const actor = state.players[options.activeSeat];
  const blower = card('Field Blower GRI');
  const switchCard = card('Switch SVI');
  actor.hand.cards.push(blower,switchCard);
  const trainerTarget = {player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const switchTarget = {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
  const dispatch = (selected,target) => {
    let error = null;
    try {
      const index = actor.hand.cards.indexOf(selected);
      assert.ok(index >= 0,'Expected card in hand');
      store.dispatch(new PlayCardAction(actor.id,index,target));
    } catch (e) {
      error = e.message;
    }
    return error;
  };
  const blowerError = dispatch(blower,trainerTarget);
  const pending = () => state.prompts.find(p=>p.result === undefined);
  const blowerPrompt = pending()?.constructor.name||null;
  let selectedGarbodor = false;
  if (blowerPrompt === 'ChoosePokemonPrompt') {
    const prompt = pending();
    assert.equal(prompt.validate([trash],state),true,
      'Field Blower must permit targeting the attached Garbodor Tool');
    store.dispatch(new ResolvePromptAction(prompt.id,[trash]));
    selectedGarbodor = true;
  }
  assert.equal(pending(),undefined,'Every Field Blower prompt must resolve');
  const toolDiscarded = other.discard.cards.includes(tool);
  const switchError = dispatch(switchCard,switchTarget);
  const switchPrompt = pending()?.constructor.name||null;
  return {...options,blowerError,blowerPrompt,selectedGarbodor,
    blowerInHand:actor.hand.cards.includes(blower),
    garbodorHasTool:trash.tools.includes(tool),toolDiscarded,
    switchError,switchPrompt,switchInHand:actor.hand.cards.includes(switchCard)};
}

/** @returns {object} Complete action/ordering matrix. */
function run() {
  const rows = [false,true].flatMap(vileplume =>
    (vileplume?[false,true]:[false]).flatMap(hood =>
      [0,1].map(activeSeat => probe({vileplume,hood,activeSeat}))));
  for (const row of rows) {
    const lockAlreadyLive = row.vileplume && row.hood;
    assert.equal(row.blowerError,lockAlreadyLive?'CANNOT_PLAY_THIS_CARD':null,
      'Unexpected prior Item restriction: '+JSON.stringify(row));
    assert.equal(row.selectedGarbodor,!lockAlreadyLive,
      'Tool target prompt mismatch: '+JSON.stringify(row));
    assert.equal(row.toolDiscarded,!lockAlreadyLive,
      'Field Blower failed to change Garbotoxin Tool state');
    assert.equal(row.garbodorHasTool,lockAlreadyLive,
      'Tool should persist only when Blower itself was locked');
    assert.equal(row.switchError,row.vileplume?'CANNOT_PLAY_THIS_CARD':null,
      'Item legality not recomputed after Tool-removal action');
    assert.equal(row.switchInHand,row.vileplume,
      'Blocked Switch must remain in hand');
    assert.equal(row.switchPrompt,row.vileplume?null:'ChoosePokemonPrompt',
      'Switch accepted only without Vileplume');
  }
  return {
    study:'Tool-removal reactivates Item lock within the same turn',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    scope:'Staged board with real Field Blower and Switch Store actions, not a complete game',
    rows
  };
}
if (require.main === module) console.log(JSON.stringify(run(),null,2));
module.exports={probe,run};
