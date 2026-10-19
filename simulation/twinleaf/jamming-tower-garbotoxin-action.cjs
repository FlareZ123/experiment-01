'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file */
const load=file=>require(path.join(output,file));

/**
 * A staged physical-board test of attached Tool existence under Jamming Tower.
 * This establishes a bounded rule interaction, never tournament performance.
 * @param {{equipped:boolean,tower:boolean,seat:0|1}} scenario
 */
function probe(scenario) {
  const manager=initializeCards();
  let id=1;
  /** @param {string} print */
  const card=print=>{
    const item=manager.getCardByName(print);
    assert.ok(item,'Unavailable pinned printing: '+print);
    item.id=id++;
    return item;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {CheckPokemonPowersEffect}=
    load('game/store/effects/check-effects');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=4;
  state.activePlayer=scenario.seat;
  state.gameSettings.format=Format.EXPANDED;
  const candidate=new Player(),source=new Player();
  candidate.id=scenario.seat===0?101:202;
  source.id=scenario.seat===0?202:101;
  state.players=scenario.seat===0?[candidate,source]:[source,candidate];
  candidate.active.cards.push(card('Shadow Rider Calyrex V CRE'));
  const vmaxSlot=new PokemonCardList();
  vmaxSlot.cards.push(card('Shadow Rider Calyrex V CRE'));
  const vmax=card('Shadow Rider Calyrex VMAX CRE');
  vmaxSlot.cards.push(vmax);
  candidate.bench.push(vmaxSlot);
  source.active.cards.push(card('Bunnelby PRC'));
  const garbodorSlot=new PokemonCardList();
  garbodorSlot.cards.push(card('Trubbish FST'),card('Garbodor BKP'));
  if(scenario.equipped)garbodorSlot.tools.push(card('Float Stone BKT'));
  source.bench.push(garbodorSlot);
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
    player.deck.cards.push(card('Psychic Energy SVE'));
  }
  /** @returns {boolean} */
  function underworldDoorAvailable(){
    const powers=new CheckPokemonPowersEffect(candidate,vmax);
    store.reduceEffect(state,powers);
    return powers.powers.some(power=>power.name==='Underworld Door');
  }
  const before=underworldDoorAvailable();
  if(scenario.tower){
    const stadium=card('Jamming Tower TWM');
    candidate.hand.cards.push(stadium);
    store.dispatch(new PlayCardAction(candidate.id,
      candidate.hand.cards.indexOf(stadium),
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
    assert.equal(candidate.stadium.cards[0],stadium);
  }
  const after=underworldDoorAvailable();
  return {...scenario,before,after,
    toolAttached:garbodorSlot.tools.map(item=>item.fullName),
    stadium:candidate.stadium.cards.map(item=>item.fullName)};
}
function run(){
  const cases=[];
  for(const seat of [0,1]){
    for(const equipped of [false,true]){
      for(const tower of [false,true]){
        const found=probe({seat,equipped,tower});
        assert.equal(found.before,!equipped);
        assert.equal(found.after,!equipped,
          'Jamming Tower must preserve Tool-attached Garbotoxin');
        assert.equal(found.toolAttached.length,Number(equipped));
        assert.equal(found.stadium.length,Number(tower));
        cases.push(found);
      }
    }
  }
  return {schema:'staged-jamming-tower-garbotoxin-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cases,qualifiedCompetitiveGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={probe,run};
