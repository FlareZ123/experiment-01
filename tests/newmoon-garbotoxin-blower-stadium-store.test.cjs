'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {chooseGarbotoxinTargets,twoGarbotoxinBlowerOption}=
  require('../simulation/twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');
const {assertValidPromptAction}=
  require('../simulation/twinleaf/prompt-integrity.cjs');
const out=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const get=name=>require(path.join(out,name));

/** @param {0|1} mode */
function exercise(mode){
  const manager=initializeCards();
  let id=0;
  const card=name=>{
    const v=manager.getCardByName(name);
    assert.ok(v,'Missing '+name);
    v.id=++id;
    return v;
  };
  const {Store}=get('game/store/store');
  const {Player}=get('game/store/state/player');
  const {PokemonCardList}=get('game/store/state/pokemon-card-list');
  const {CardList}=get('game/store/state/card-list');
  const {GamePhase}=get('game/store/state/state');
  const {Format}=get('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=get('game/store/actions/play-card-action');
  const {ResolvePromptAction}=get('game/store/actions/resolve-prompt-action');
  const {IS_ABILITY_BLOCKED}=get('game/store/prefabs/prefabs');
  const {StateUtils}=get('game/store/state-utils');
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const mine=new Player(),enemy=new Player();
  mine.id=101;mine.name='research-A';
  enemy.id=202;enemy.name='research-B';
  state.players=[mine,enemy];
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=0;
  state.turn=4;
  state.gameSettings.format=Format.EXPANDED;
  const mew=card('Mewtwo & Mew-GX UNM');
  mine.active.cards.push(mew);
  enemy.active.cards.push(card('Trubbish FST'),card('Garbodor LTR'));
  const bench=new PokemonCardList();
  bench.cards.push(card('Trubbish FST'),card('Garbodor BKP'));
  enemy.bench.push(bench);
  const tools=[card('Float Stone BKT'),card('Float Stone BKT')];
  enemy.active.tools.push(tools[0]);bench.tools.push(tools[1]);
  const stadium=card('Sky Field ROS');
  mine.stadium.cards.push(stadium);
  const blower=card('Field Blower GRI');
  mine.hand.cards.push(blower);
  for(const player of state.players){
    player.deck.cards.push(card('Psychic Energy SVE'));
    for(let i=0;i<6;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      player.prizes.push(prize);
    }
  }
  const power=mew.powers.find(x=>x.name==='Perfection');
  assert.ok(power);
  const blocked=()=>IS_ABILITY_BLOCKED(store,state,mine,mew,power);
  assert.equal(blocked(),true);
  store.dispatch(new PlayCardAction(mine.id,0,{
    player:PlayerType.ANY,slot:SlotType.BOARD,index:0
  }));
  const pending=()=>state.prompts.find(p=>p.result===undefined);
  const option=pending();
  assert.equal(option?.constructor.name,'SelectOptionPrompt');
  assert.equal(twoGarbotoxinBlowerOption(option,enemy),1);
  store.dispatch(new ResolvePromptAction(option.id,mode));
  const choose=pending();
  assert.equal(choose?.constructor.name,'ChoosePokemonPrompt');
  const targets=chooseGarbotoxinTargets(choose,enemy,state);
  assert.equal(targets?.length,mode===0?1:2);
  assert.doesNotThrow(()=>assertValidPromptAction(state,
    new ResolvePromptAction(choose.id,targets)));
  const targetNames=targets.map(x=>x.getPokemonCard().fullName);
  store.dispatch(new ResolvePromptAction(choose.id,targets));
  assert.equal(pending(),undefined);
  const discarded=tools.filter(tool=>
    enemy.discard.cards.some(x=>x.id===tool.id)).length;
  assert.equal(discarded,mode===0?1:2);
  assert.equal(StateUtils.getStadiumCard(state)===stadium,mode===1);
  assert.equal(blocked(),mode===0);
  assert.ok(mine.discard.cards.some(x=>x.id===blower.id));
  return {mode,discarded,blocked:blocked(),targetNames};
}

test('pinned Store two-Tool choice removes both Garbotoxin sources',()=>{
  assert.deepEqual(exercise(1),{mode:1,discarded:2,blocked:false,
    targetNames:['Garbodor LTR','Garbodor BKP']});
});

test('pinned Store Stadium-plus-one choice preserves the other lock',()=>{
  assert.deepEqual(exercise(0),{mode:0,discarded:1,blocked:true,
    targetNames:['Garbodor LTR']});
});
