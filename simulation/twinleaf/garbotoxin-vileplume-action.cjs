'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const load = modulePath => require(path.join(output, modulePath));

/**
 * Probe the printed Garbotoxin/Stealthy Hood/Irritating Pollen priority matrix
 * by actually trying to play an Item through Twinleaf's Store.
 * The board is a staged midgame; only the Switch is played as an action.
 * @param {{garbodor:boolean,garbodorTool:boolean,vileplumeHood:boolean,activeSeat:0|1}} p
 */
function probe(p) {
  const manager = initializeCards();
  let id = 1;
  /** @param {string} fullName */
  const card = fullName => {
    const c = manager.getCardByName(fullName);
    assert.ok(c, 'Pinned card missing: '+fullName);
    c.id = id++;
    return c;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {GamePhase} = load('game/store/state/state');
  const {Format} = load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} =
    load('game/store/actions/play-card-action');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = p.activeSeat;
  state.gameSettings.format = Format.EXPANDED;

  const a = new Player(), b = new Player();
  a.id = 101; a.name = 'Vileplume owner';
  b.id = 202; b.name = 'Garbodor opponent';
  state.players = [a,b];
  a.active.cards.push(card('Bunnelby PRC'));
  b.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const vileplume = new PokemonCardList();
  vileplume.cards.push(card('Oddish UNB'),card('Gloom UNB'),card('Vileplume AOR'));
  if (p.vileplumeHood) vileplume.tools.push(card('Stealthy Hood UNB'));
  a.bench.push(vileplume);
  if (p.garbodor) {
    const garbodor = new PokemonCardList();
    garbodor.cards.push(card('Trubbish BKP'),card('Garbodor BKP'));
    if (p.garbodorTool) garbodor.tools.push(card('Stealthy Hood UNB'));
    b.bench.push(garbodor);
  } else {
    const filler = new PokemonCardList();
    filler.cards.push(card('Dratini OBF'));
    b.bench.push(filler);
  }
  for (const player of state.players) {
    player.prizes = Array.from({length:6},() => {
      const prize = new CardList();
      prize.cards.push(card('Dratini OBF'));
      return prize;
    });
    player.deck.cards.push(card('Grass Energy MEE'),card('Grass Energy MEE'));
    player.hand.cards.push(card('Switch SVI'));
  }
  const current = state.players[p.activeSeat];
  const switchCard = current.hand.cards.find(c => c.name === 'Switch');
  const index = current.hand.cards.indexOf(switchCard);
  let error = null;
  try {
    store.dispatch(new PlayCardAction(current.id,index,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
  } catch (e) {
    error = e.message;
  }
  const prompts = state.prompts.filter(x => x.result === undefined)
    .map(x => x.constructor.name);
  const switchInHand = current.hand.cards.includes(switchCard);
  return {...p,error,switchInHand,prompts,
    allowed:!error && prompts.includes('ChoosePokemonPrompt')};
}

/** @returns {object} Report baseline and crossed locks in both seats. */
function run() {
  const combinations = [
    {garbodor:false,garbodorTool:false,vileplumeHood:false},
    {garbodor:true,garbodorTool:false,vileplumeHood:false},
    {garbodor:true,garbodorTool:true,vileplumeHood:false},
    {garbodor:true,garbodorTool:true,vileplumeHood:true}
  ];
  const rows = combinations.flatMap(p=>[0,1].map(
    activeSeat=>probe({...p,activeSeat})));
  return {
    study:'Vileplume AOR Irritating Pollen vs Garbodor BKP Garbotoxin vs Stealthy Hood UNB',
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    protocol:'Staged evolutions/tools, actual Switch SVI Store PlayCardAction',
    rows,
    evidenceLimit:'Synthetic board action audit; not a full legal setup, bot policy, or match win-rate'
  };
}
if (require.main === module) console.log(JSON.stringify(run(),null,2));
module.exports={probe,run};
