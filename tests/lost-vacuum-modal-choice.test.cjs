'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {withMandatoryOptionFallback}=require('../simulation/twinleaf/mandatory-option-policy.cjs');
const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
function engine(name){return require(path.join(output,name));}
const {State,GamePhase}=engine('game/store/state/state');
const {Player}=engine('game/store/state/player');
const {Store}=engine('game/store/store');
const {CardList}=engine('game/store/state/card-list');
const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
const {ChoosePokemonPrompt}=engine('game/store/prompts/choose-pokemon-prompt');
const {SelectOptionPrompt}=engine('game/store/prompts/select-option-prompt');
const {PlayCardAction,PlayerType,SlotType}=engine('game/store/actions/play-card-action');
const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
const defs=engine('simple-bot/simple-bot-definitions');

function board(){
  const manager=initializeCards();
  const get=name=>{const card=manager.getCardByName(name);
    assert.ok(card,'Card absent: '+name);return card;};
  const store=new Store({onStateChange(){}});
  const state=new State();state.turn=4;state.phase=GamePhase.PLAYER_TURN;state.activePlayer=0;
  const a=new Player();a.id=101;a.name='A';
  const b=new Player();b.id=202;b.name='B';state.players=[a,b];
  a.active.cards.push(get('Regidrago V SIT'));
  b.active.cards.push(get('Dratini OBF'));
  b.active.tools.push(get('Float Stone BKT'));
  a.stadium.cards.push(get('Sky Field ROS'));
  a.hand.cards.push(get('Lost Vacuum LOR'),get('Fire Energy MEE'),get('Grass Energy MEE'));
  a.deck.cards.push(get('Dratini OBF'));
  b.deck.cards.push(get('Dratini OBF'));
  for(const player of [a,b]){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();prize.cards.push(get('Dratini OBF'));return prize;});
  }
  store.state=state;
  store.dispatch(new PlayCardAction(a.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const discard=state.prompts.find(p=>p instanceof ChooseCardsPrompt&&p.result===undefined);
  assert.ok(discard,'Expected mandatory Lost Vacuum card-to-Lost-Zone selection');
  const fire=a.hand.cards.find(c=>c.name==='Fire Energy');
  assert.ok(fire);
  store.dispatch(new ResolvePromptAction(discard.id,[fire]));
  const mode=state.prompts.find(p=>p instanceof SelectOptionPrompt&&p.result===undefined);
  assert.ok(mode,'Expected real Lost Vacuum mandatory Tool/Stadium selector');
  assert.equal(mode.options.allowCancel,false);
  return {store,state,a,b,mode};
}

function ai(corrected){
  const options={tactics:defs.allSimpleTactics,promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,arbiter:defs.defaultArbiterOptions};
  return new SimpleTacticsAi({id:101},
    corrected?withMandatoryOptionFallback(options):options,null);
}

test('pinned Lost Vacuum actual Store cannot accept null required mode',()=>{
  const f=board();
  const action=ai(false).decodeNextAction(f.state);
  assert.equal(action.result,null);
  assert.throws(()=>f.store.dispatch(action));
});

test('default-choice adapter proceeds into real Lost Vacuum Tool selection',()=>{
  const f=board();
  const action=ai(true).decodeNextAction(f.state);
  assert.equal(action.result,0);
  f.store.dispatch(action);
  assert.ok(f.state.prompts.some(p=>p instanceof ChoosePokemonPrompt&&p.result===undefined));
});
