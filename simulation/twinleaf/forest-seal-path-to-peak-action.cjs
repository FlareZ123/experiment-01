'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=rel=>require(path.join(output,rel));

/**
 * Real native Store regression of official Japanese Q&A: Path to the Peak
 * leaves Forest Seal Stone Star Alchemy usable on a Pokemon V.
 * @param {0|1} seat Original physical source seat.
 */
function testSeat(seat) {
  const manager=initializeCards();
  let physicalId=1;
  const card=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result,name);
    result.id=physicalId++;
    return result;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {UseAbilityAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  const source=new Player(),opponent=new Player();
  source.id=101;opponent.id=202;
  state.players=seat===0?[source,opponent]:[opponent,source];
  source.active.cards.push(card('Oranguru V ASR'));
  source.active.tools.push(card('Forest Seal Stone SIT'));
  opponent.active.cards.push(card('Bunnelby PRC'));
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
    player.deck.cards.push(card('Psychic Energy SVE'));
  }
  source.deck.cards.push(card('Boost Shake EVS'));
  state.turn=3;
  state.activePlayer=1-seat;
  const stadium=card('Path to the Peak CRE');
  opponent.hand.cards.push(stadium);
  store.dispatch(new PlayCardAction(opponent.id,
    opponent.hand.cards.indexOf(stadium),{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    }));
  assert.equal(opponent.stadium.cards[0],stadium);
  state.turn=4;state.activePlayer=seat;
  store.dispatch(new UseAbilityAction(source.id,'Star Alchemy',{
    player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
  }));
  const animation=store.state.prompts.find(p=>
    p.result===undefined&&p.constructor.name==='WaitPrompt');
  if(animation) store.dispatch(new ResolvePromptAction(animation.id,null));
  const pending=store.state.prompts.find(p=>
    p.result===undefined&&p.constructor.name==='ChooseCardsPrompt');
  assert.ok(pending,'Path to the Peak must not suppress Tool-granted Star Alchemy');
  assert.equal(source.usedVSTAR,true);
  assert.ok(source.active.tools.includes(stadium)===false);
  assert.equal(opponent.stadium.cards[0],stadium);
  return {seat,accepted:true,prompt:pending.constructor.name,
    markerConsumed:source.usedVSTAR,stadium:stadium.fullName};
}

function run(){
  return {schema:'forest-seal-path-to-peak-native-two-seat-v1',
    cases:[testSeat(0),testSeat(1)],qualifiedCompetitiveGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={testSeat,run};
