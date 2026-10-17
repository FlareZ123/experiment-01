'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const root = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const engine = file => require(path.join(root,file));

/**
 * Staged printed-card ability test; its fixtures are injected and therefore
 * establish no setup accessibility, Tool attachment action or match outcome.
 * @param {{iron:boolean,garbodor:boolean,hood:boolean,jammer:boolean}} opts
 */
function probe(opts) {
  const manager=initializeCards();
  let nextId=1;
  /** @param {string} fullName */
  const card=fullName=>{
    const found=manager.getCardByName(fullName);
    assert.ok(found,'Missing pinned card: '+fullName);
    found.id=nextId++;
    return found;
  };
  const {Store}=engine('game/store/store');
  const {Player}=engine('game/store/state/player');
  const {GamePhase}=engine('game/store/state/state');
  const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
  const {Format}=engine('game/store/card/card-types');
  const {CheckPokemonPowersEffect}=engine('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=engine('game/store/prefabs/prefabs');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const theirs=new Player(),ours=new Player();
  theirs.id=101;ours.id=202;
  state.players=[theirs,ours];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;state.activePlayer=1;
  state.gameSettings.format=Format.EXPANDED;
  const mew=card('Mewtwo & Mew-GX UNM');
  ours.active.cards.push(mew);
  theirs.active.cards.push(card(opts.iron?'Iron Thorns ex TWM':'Pidgey MEW'));
  if(opts.hood)ours.active.tools.push(card('Stealthy Hood UNB'));
  if(opts.jammer)theirs.active.tools.push(card('Tool Jammer BST'));
  if(opts.garbodor) {
    const garbo=new PokemonCardList();
    garbo.cards.push(card('Trubbish BKP'),card('Garbodor BKP'));
    garbo.tools.push(card('Float Stone BKT'));
    theirs.bench.push(garbo);
  }
  const effect=new CheckPokemonPowersEffect(ours,mew);
  store.reduceEffect(state,effect);
  const visible=effect.powers.some(p=>p.name==='Perfection');
  const blocked=IS_ABILITY_BLOCKED(store,state,ours,mew);
  assert.equal(blocked,!visible,'Pinned powers and blocked flag disagree');
  return {...opts,perfectionVisible:visible};
}

function run() {
  const cases=[
    {iron:false,garbodor:false,hood:false,jammer:false},
    {iron:true,garbodor:false,hood:false,jammer:false},
    {iron:false,garbodor:true,hood:false,jammer:false},
    {iron:true,garbodor:false,hood:true,jammer:false},
    {iron:false,garbodor:true,hood:true,jammer:false},
    {iron:true,garbodor:true,hood:true,jammer:false},
    {iron:true,garbodor:false,hood:true,jammer:true},
    {iron:false,garbodor:true,hood:true,jammer:true}
  ];
  return {
    schema:'new-moon-stealthy-hood-injected-ability-gate-v1',
    sourceScope:'deliberately staged source-printed Tools and Pokemon, no physical starting hand or legal play sequence',
    qualifiedForCompetitiveInference:false,
    cases:cases.map(probe)
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
