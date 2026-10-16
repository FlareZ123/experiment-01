'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output, modulePath));

/**
 * Reproduce the Aichi rank-2 line on a conditioned *legal target state*.
 * No fabricated source-deck shuffle, policy or match-win inference.
 */
function doubleTmBoard() {
  const manager = initializeCards();
  const { Store } = engine('game/store/store');
  const { Player } = engine('game/store/state/player');
  const { PokemonCardList } = engine('game/store/state/pokemon-card-list');
  const { GamePhase } = engine('game/store/state/state');
  const { Format } = engine('game/store/card/card-types');
  const { AttackAction } = engine('game/store/actions/game-actions');
  const { ResolvePromptAction } = engine('game/store/actions/resolve-prompt-action');

  /** @param {string} name */
  function card(name) {
    const found=manager.getCardByName(name);
    assert.ok(found,'Pinned source printing unavailable: '+name);
    return found;
  }

  const store=new Store({onStateChange() {}});
  const state=store.state;
  const player=new Player(),opponent=new Player();
  player.id=101;player.name='Rank-2 Vileplume';
  opponent.id=202;opponent.name='Target';
  state.players=[player,opponent];
  state.activePlayer=0;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=2; // player going second, first actionable attacking turn
  state.gameSettings.format=Format.EXPANDED;

  const bunnelby=card('Bunnelby PRC');
  const tm=card('Technical Machine: Evolution PAR');
  const jet=card('Jet Energy PAL');
  const oddish=card('Oddish UNB');
  const pidgey=card('Pidgey MEW');
  const stageNames=['Gloom UNB','Pidgeotto TEU','Vileplume AOR','Pidgeot ex OBF'];
  const evolved=stageNames.map(card);
  assert.ok(bunnelby.powers.some(p=>p.name==='Barrage'&&p.barrage));
  assert.ok(tm.attacks.some(a=>a.name==='Evolution'));

  player.active.cards.push(bunnelby,jet);
  player.active.energies.cards.push(jet);
  player.active.tools.push(tm);
  for(const pokemon of [oddish,pidgey]) {
    const bench=new PokemonCardList();
    bench.cards.push(pokemon);
    player.bench.push(bench);
  }
  // All four in the deck are actual evolution targets; no stage may be
  // invented during search. Extra cards make shuffling nontrivial.
  player.deck.cards.push(...evolved,card('Grass Energy MEE'));
  opponent.active.cards.push(card('Shadow Rider Calyrex V CRE'));

  store.dispatch(new AttackAction(101,'Evolution'));
  const responses=[], beforeTurn=state.turn;
  let nextEvolve=0, countAttackChoices=0;
  for(let i=0;i<30;i++) {
    const pending=state.prompts.find(p=>p.result===undefined);
    if(!pending) break;
    const name=pending.constructor.name;
    let value;
    if(name==='ChoosePokemonPrompt') {
      value=[player.bench[0],player.bench[1]];
    } else if(name==='ChooseCardsPrompt') {
      assert.ok(nextEvolve<evolved.length,'More evolution searches than expected');
      const expected=evolved[nextEvolve++];
      assert.ok(player.deck.cards.includes(expected),
        'Requested evolution no longer in the deck: '+expected.name);
      value=[expected];
    } else if(name==='ShuffleDeckPrompt') {
      value=Array.from({length:player.deck.cards.length},(_,n)=>n);
    } else if(name==='WaitPrompt') {
      value=null; // Engine animation delay; no gameplay decision.
    } else if(name==='ConfirmPrompt') {
      value=true; // Take second attack offered by Barrage
    } else if(name==='ChooseAttackPrompt') {
      value=tm.attacks[0]; // Repeat Tool-granted Evolution attack
      countAttackChoices++;
    } else {
      throw new Error('Unexpected prompt in double TM attack: '+name);
    }
    responses.push(name);
    store.dispatch(new ResolvePromptAction(pending.id,value));
  }
  assert.equal(state.prompts.some(p=>p.result===undefined),false,
    'All prompts must be fully resolved');
  assert.equal(nextEvolve,4,'Both attacks should evolve two separate targets');
  assert.deepEqual(player.bench.map(b=>b.getPokemonCard().name),
    ['Vileplume','Pidgeot ex']);
  assert.equal(countAttackChoices,1,'Barrage should offer one explicit second attack choice');
  assert.ok(state.turn>=beforeTurn,'Game turn must not rewind');
  return {
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRank:2,
    initial:{active:'Bunnelby PRC with Jet Energy and TM: Evolution',
      bench:['Oddish UNB','Pidgey MEW'],deckEvolutions:stageNames},
    actualPromptSequence:responses,
    evolutionSearches:nextEvolve,
    barrageSecondAttackChoices:countAttackChoices,
    finalBench:player.bench.map(b=>b.getPokemonCard().name),
    finalPhase:state.phase, finalTurn:state.turn,
    scope:'Real pinned Store + attack and prompts on a staged legal board; no shuffled opening, opponent policy, or win rate'
  };
}
if(require.main===module)console.log(JSON.stringify(doubleTmBoard(),null,2));
module.exports={doubleTmBoard};
