'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(root,name));
/** @param {number} turn @param {boolean} fresh */
function probe(turn,fresh=false){
  const manager=initializeCards();
  let id=0;
  /** @param {string} name */
  function card(name){const c=manager.getCardByName(name);assert.ok(c,name);c.id=++id;return c;}
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {UseStadiumAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const store=new Store({onStateChange(){}}),state=store.state;
  state.turn=turn;state.phase=GamePhase.PLAYER_TURN;state.activePlayer=(turn+1)%2;
  state.gameSettings.format=Format.EXPANDED;
  state.players=[new Player(),new Player()];
  for(let i=0;i<2;i++){
    const p=state.players[i];p.id=101+i;p.active.cards.push(card('Bunnelby PRC'));
    p.deck.cards.push(card('Grass Energy MEE'));
  }
  const player=state.players[state.activePlayer];
  const oddish=new PokemonCardList();oddish.cards.push(card('Oddish UNB'));
  oddish.pokemonPlayedTurn=fresh?turn:0;player.bench.push(oddish);
  player.deck.cards.push(card('Gloom UNB'),card('Vileplume AOR'));
  const tree=card('Great Tree SCR');player.stadium.cards.push(tree);
  let error=null;
  try{store.dispatch(new UseStadiumAction(player.id));}catch(e){error=e.message;}
  return {turn,activeSeat:state.activePlayer,fresh,error,
    promptTypes:state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name),
    canEvolveByPaperRules:turn>2&&!fresh};
}
/** @returns {object} */
function run(){const cases=[[1,false],[2,false],[3,false],[4,false],[3,true]]
  .map(([turn,fresh])=>probe(turn,fresh));
  return {study:'Grand Tree first-turn prohibition raw engine',cases,
    suspectedViolations:cases.filter(c=>c.promptTypes.includes('ChoosePokemonPrompt')&&!c.canEvolveByPaperRules),
    qualification:'diagnostic only'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={probe,run};
