'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load=name=>require(path.join(output,name));

/**
 * Actual Stadium PlayCardAction after a staged opponent Active Iron Thorns.
 * Check New Moon's own Rule-Box Stadium immunity and the opposite player's
 * Initialization simultaneously; neither side can skip the other's Ability.
 *
 * @param {{solrock:boolean,lunatone:boolean,path:boolean}} options
 */
function probe(options){
  const manager=initializeCards();
  let id=1;
  /** @param {string} name */
  const card=name=>{
    const c=manager.getCardByName(name);
    assert.ok(c,'Missing source print '+name);
    c.id=id++;
    return c;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
  const {CheckPokemonPowersEffect}=load('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=load('game/store/prefabs/prefabs');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  const mine=new Player(),them=new Player();
  mine.id=101;them.id=202;
  state.players=[mine,them];
  state.activePlayer=0;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;
  const mew=card('Mewtwo & Mew-GX UNM');
  const iron=card('Iron Thorns ex TWM');
  mine.active.cards.push(mew);
  them.active.cards.push(iron);
  if(options.solrock){
    const rock=new PokemonCardList();
    rock.cards.push(card('Solrock CES'));
    mine.bench.push(rock);
  }
  if(options.lunatone){
    const moon=new PokemonCardList();
    moon.cards.push(card('Lunatone OBF'));
    mine.bench.push(moon);
  }
  for(const player of state.players){
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
    player.deck.cards.push(card('Psychic Energy SVE'));
  }
  const visible=(player,pokemon,name)=>{
    const effect=new CheckPokemonPowersEffect(player,pokemon);
    store.reduceEffect(state,effect);
    return {listed:effect.powers.some(power=>power.name===name),
      blocked:IS_ABILITY_BLOCKED(store,state,player,pokemon)};
  };
  const before={mew:visible(mine,mew,'Perfection'),
    iron:visible(them,iron,'Initialization')};
  if(options.path){
    const stadium=card('Path to the Peak CRE');
    mine.hand.cards.push(stadium);
    const index=mine.hand.cards.indexOf(stadium);
    store.dispatch(new PlayCardAction(mine.id,index,
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    assert.equal(mine.stadium.cards[0],stadium);
  }
  const after={mew:visible(mine,mew,'Perfection'),
    iron:visible(them,iron,'Initialization'),
    stadium:mine.stadium.cards.map(c=>c.fullName)};
  return {...options,before,after};
}

function run(){
  const cases=[
    {solrock:false,lunatone:false,path:false},
    {solrock:true,lunatone:true,path:false},
    {solrock:false,lunatone:true,path:true},
    {solrock:true,lunatone:false,path:true},
    {solrock:true,lunatone:true,path:true}
  ];
  const rows=cases.map(probe);
  assert.deepEqual(rows.map(row=>row.before.mew.listed),
    [false,false,false,false,false]);
  assert.deepEqual(rows.map(row=>row.after.mew.listed),
    [false,false,false,false,true],
    'Only full Sunbeam/New Moon + Path structure restores Perfection');
  assert.deepEqual(rows.map(row=>row.after.iron.listed),
    [true,true,false,false,false],
    'Path still shuts down opponent Rule-Box Initialization');
  for(const row of rows){
    assert.equal(row.after.mew.blocked,!row.after.mew.listed);
    assert.equal(row.after.iron.blocked,!row.after.iron.listed);
  }
  return {schema:'new-moon-vs-iron-thorns-path-interaction-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    caveat:'Staged printed-card board, actual Path PlayCardAction, no setup probability, source sequencing, active replacement, or complete game',
    rows};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
