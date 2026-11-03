'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');

const ROOT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(ROOT,name));
const DITTO='Ditto Prism Star LOT';
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Native Store regression for Ditto Prism Star LOT "Almighty Evolution".
 * The actual pinned Store checks a temporary evolvable-stage allowance.
 * This fixture neither searches hidden cards nor asserts source play strength.
 * @param {string} evolution Exact Stage 1 card printing from the owner hand.
 * @param {boolean} [primeTable] Whether to perform the native board-state check.
 * @returns {object}
 */
function probeDittoEvolution(evolution,primeTable=true){
  const cards=initializeCards();
  let counter=1;
  const card=printing=>{
    const c=cards.getCardByName(printing);
    assert.ok(c,'Missing pinned printing '+printing);
    c.id=counter++;
    return c;
  };
  const {Store}=load('game/store/store');
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {Stage}=load('game/store/card/card-types');
  const {CheckTableStateEffect}=load('game/store/effects/check-effects');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const p0=new Player(),p1=new Player();
  p0.id=101;p0.name='Ditto actor';
  p1.id=202;p1.name='Opponent';
  const source=card(DITTO),target=card(evolution);
  assert.equal(source.stage,Stage.BASIC);
  assert.equal(target.stage,Stage.STAGE_1);
  assert.notEqual(target.evolvesFrom,source.name,
    'This must exercise the unique Ditto path, not ordinary predecessor text');
  p0.active.cards.push(source);
  p0.active.pokemonPlayedTurn=1;
  p0.hand.cards.push(target);
  p1.active.cards.push(card('Trubbish FST'));
  p1.active.pokemonPlayedTurn=1;
  for(const player of [p0,p1]){
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const state=new State();
  state.players=[p0,p1];
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=0;
  const store=new Store({onStateChange(){}});
  store.state=state;
  const allowedBefore=[...source.evolvesToStage];
  if(primeTable)store.reduceEffect(state,new CheckTableStateEffect([5,5]));
  const allowedAfter=[...source.evolvesToStage];
  let error=null;
  try{
    store.dispatch(new PlayCardAction(p0.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
  }catch(e){
    error={name:e.name,message:String(e.message)};
  }
  const live=store.state.players[0];
  return {
    source:DITTO,evolution,primeTable,turn:state.turn,
    printedPredecessor:target.evolvesFrom,sourceName:source.name,
    allowedBefore,allowedAfter,
    accepted:error===null,
    evolved:live.active.getPokemonCard()?.fullName===evolution,
    handRetained:live.hand.cards.some(c=>c.fullName===evolution),
    activeEvolutionStack:live.active.cards.map(c=>c.fullName),
    error,paperWinQualified:false
  };
}
function run(){
  const rows=[
    probeDittoEvolution('Alolan Raichu UNM'),
    probeDittoEvolution('Electrode-GX CES')
  ];
  for(const row of rows){
    assert.equal(row.allowedAfter.includes(load('game/store/card/card-types').Stage.STAGE_1),true,
      'Pinned source card must expose dynamic Stage 1 path after board check');
    assert.equal(row.accepted,true,'Printed Ditto Stage 1 is native-playable: '+JSON.stringify(row));
    assert.equal(row.evolved,true);
    assert.equal(row.handRetained,false);
  }
  return {
    schema:'agent1-ditto-prism-rank17-stage1-native-v1',
    enginePin:PIN,attempted:rows.length,observed:rows,
    nativeConfirmedEvolutionPaths:rows.filter(r=>r.accepted&&r.evolved).length,
    qualifiedCompetitiveGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={DITTO,PIN,probeDittoEvolution,run};
