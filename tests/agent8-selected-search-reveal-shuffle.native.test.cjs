'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const {VERSION,withSelectedSearchRevealShuffleHook}=
  require('../simulation/twinleaf/agent8-selected-search-reveal-shuffle-hook.cjs');

const output=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
/** @param {string} file @returns {any} */
const native=file=>require(path.join(output,file));

/**
 * Inject a real pinned Store and source-printed active Ability in either
 * physical seat. All selections are resolved through native prompt validation.
 * This fixture is synthetic and never qualifies a competitive game.
 * @param {'Jirachi TEU'|'Mew CEL'} printing
 * @param {'hit'|'zero'} choice
 * @param {0|1} seat
 * @param {boolean} repaired
 * @returns {object}
 */
function probe(printing,choice,seat,repaired){
  const run=()=>{
    const {Store}=native('game/store/store');
    const {State,GamePhase}=native('game/store/state/state');
    const {Player}=native('game/store/state/player');
    const {PowerEffect}=native('game/store/effects/game-effects');
    const {ResolvePromptAction}=native(
      'game/store/actions/resolve-prompt-action');
    const manager=initializeCards();
    /** @param {string} name @returns {object} */
    const card=name=>{
      const result=manager.getCardByName(name);
      assert.ok(result,'Missing pinned card '+name);
      return result;
    };
    const state=new State(),actor=new Player(),opponent=new Player();
    actor.id=881;opponent.id=882;
    state.players=seat===0?[actor,opponent]:[opponent,actor];
    state.turn=4;
    state.activePlayer=seat;
    state.phase=GamePhase.PLAYER_TURN;
    const abilitySource=card(printing);
    actor.active.cards.push(abilitySource);
    opponent.active.cards.push(card('Regidrago V SIT'));
    const hit=card('Pokegear SVI');
    actor.deck.cards.push(hit);
    for(let i=0;i<8;i++)actor.deck.cards.push(card('Psychic Energy SVE'));
    const store=new Store({onStateChange(){}});
    store.state=state;
    store.reduceEffect(state,new PowerEffect(
      actor,abilitySource.powers[0],abilitySource,actor.active));
    const events=[];
    let permutationChanged=null;
    for(let i=0;i<16;i++){
      const prompt=state.prompts.find(p=>p.result===undefined);
      if(!prompt)break;
      let answer;
      let physicalBefore=null;
      if(prompt.constructor.name==='ChooseCardsPrompt'&&
         prompt.message==='CHOOSE_CARD_TO_HAND')
        answer=choice==='hit'?[hit]:[];
      else if(prompt.constructor.name==='ShowCardsPrompt')
        answer=true;
      else if(prompt.constructor.name==='ShuffleDeckPrompt'){
        physicalBefore=[...actor.deck.cards];
        answer=Array.from({length:physicalBefore.length},
          (_,j)=>physicalBefore.length-j-1);
      }else{
        throw Error('Unexpected native prompt '+prompt.constructor.name+
          ' '+String(prompt.message));
      }
      assert.equal(prompt.validate(answer,state),true,
        prompt.constructor.name+' rejects selected test input');
      store.dispatch(new ResolvePromptAction(prompt.id,answer));
      if(physicalBefore){
        assert.equal(physicalBefore.length,actor.deck.cards.length);
        permutationChanged=physicalBefore.some(
          (card,index)=>actor.deck.cards[index]!==card);
      }
      events.push({prompt:prompt.constructor.name,message:prompt.message,
        answerSize:Array.isArray(answer)?answer.length:null,
        validated:true,turnAfter:state.turn});
    }
    assert.equal(state.prompts.some(p=>p.result===undefined),false);
    return {printing,choice,seat,events,turn:state.turn,
      chosenItemInHand:actor.hand.cards.includes(hit),
      itemRemainingInDeck:actor.deck.cards.includes(hit),
      permutationChanged,gameQualified:false};
  };
  if(!repaired)return {raw:true,...run(),hook:null};
  const {result,audit}=withSelectedSearchRevealShuffleHook(run);
  return {raw:false,...result,hook:audit};
}

for(const printing of ['Jirachi TEU','Mew CEL']){
  test(printing+': native positive search reveal omits shuffle, opt-in repair restores it in both seats',()=>{
    for(const seat of [0,1]){
      const raw=probe(printing,'hit',seat,false);
      const fixed=probe(printing,'hit',seat,true);
      console.log('AGENT8_SELECTED_REVEAL_SHUFFLE',JSON.stringify({
        printing,seat,raw,fixed
      }));
      assert.deepEqual(raw.events.map(x=>x.prompt),[
        'ChooseCardsPrompt','ShowCardsPrompt']);
      assert.deepEqual(fixed.events.map(x=>x.prompt),[
        'ChooseCardsPrompt','ShowCardsPrompt','ShuffleDeckPrompt']);
      assert.equal(raw.turn,4);
      assert.equal(fixed.turn,4);
      assert.equal(raw.chosenItemInHand,true);
      assert.equal(fixed.chosenItemInHand,true);
      assert.equal(raw.itemRemainingInDeck,false);
      assert.equal(fixed.itemRemainingInDeck,false);
      assert.equal(raw.permutationChanged,null);
      assert.equal(fixed.permutationChanged,true);
      assert.equal(fixed.hook.version,VERSION);
      assert.equal(fixed.hook.positiveSelections,1);
      assert.equal(fixed.hook.positiveRevealPrompts,1);
      assert.equal(fixed.hook.repairedShuffles,1);
      assert.equal(fixed.hook.zeroSelections,0);
      assert.equal(fixed.hook.competitiveQualifiedGames,0);
    }
  });
  test(printing+': native zero-choice shuffle survives repair unchanged in both seats',()=>{
    for(const seat of [0,1]){
      const raw=probe(printing,'zero',seat,false);
      const fixed=probe(printing,'zero',seat,true);
      console.log('AGENT8_ZERO_REVEAL_SHUFFLE',JSON.stringify({
        printing,seat,raw,fixed
      }));
      assert.deepEqual(raw.events.map(x=>x.prompt),[
        'ChooseCardsPrompt','ShuffleDeckPrompt']);
      assert.deepEqual(fixed.events.map(x=>x.prompt),[
        'ChooseCardsPrompt','ShuffleDeckPrompt']);
      assert.equal(raw.itemRemainingInDeck,true);
      assert.equal(fixed.itemRemainingInDeck,true);
      assert.equal(raw.chosenItemInHand,false);
      assert.equal(fixed.chosenItemInHand,false);
      assert.equal(raw.permutationChanged,true);
      assert.equal(fixed.permutationChanged,true);
      assert.equal(fixed.hook.zeroSelections,1);
      assert.equal(fixed.hook.positiveSelections,0);
      assert.equal(fixed.hook.repairedShuffles,0);
      assert.equal(fixed.turn,4);
    }
  });
}
test('scope restores both exact pinned card prototype reducers',()=>{
  const {Jirachi}=native('sets/08-sun-and-moon/set-team-up/jirachi');
  const {Mew}=native('sets/09-sword-and-shield/set-celebrations/mew');
  const before=[Jirachi,Mew].map(type=>
    Object.getOwnPropertyDescriptor(type.prototype,'reduceEffect'));
  const result=withSelectedSearchRevealShuffleHook(()=>42);
  assert.equal(result.result,42);
  assert.equal(result.audit.repairedShuffles,0);
  assert.deepEqual([Jirachi,Mew].map(type=>
    Object.getOwnPropertyDescriptor(type.prototype,'reduceEffect')),before);
});
