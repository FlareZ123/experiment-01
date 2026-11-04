'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnedStartingBasics,withOwnerStartingBasicChoice}=
  require('../simulation/twinleaf/agent50-owner-starting-basic-choice.cjs');

const Stage={BASIC:0,STAGE_1:1};
const CardTag={PLAY_DURING_SETUP:'setup'};
const card=(name,stage,tags=[])=>({fullName:name,stage,tags});
function fixture({seat=0,ownNames=['Basic A','Basic B'],phase=1,
    message='STARTING',promptOwnerId=null}={}){
  const own=ownNames.map(name=>card(name,Stage.BASIC));
  const id=101+seat*101;
  const owner={id,hand:{cards:own}};
  const other={id:101+(1-seat)*101,hand:{cards:[
    card('Unrevealed opponent A',Stage.BASIC),
    card('Unrevealed opponent B',Stage.BASIC)]}};
  class ChooseCardsPrompt{
    constructor(){
      this.playerId=promptOwnerId??id;
      this.message=message;
      this.id=77;
      this.result=undefined;
      this.cards=owner.hand;
      this.options={min:1,max:6,blocked:[],allowCancel:false};
    }
    validate(selection){
      return selection.length>=1&&selection.length<=6&&
        selection.every(x=>this.cards.cards.includes(x)&&
          x.stage===Stage.BASIC);
    }
  }
  const prompt=new ChooseCardsPrompt();
  const players=seat===0?[owner,other]:[other,owner];
  const state={turn:0,phase,players,prompts:[prompt],activePlayer:seat};
  return {owner,other,prompt,state,ChooseCardsPrompt};
}
test('deterministic owner-hand-only prompt selection respects blocked and min/max',()=>{
  const {owner,prompt}=fixture();
  assert.deepEqual(chooseOwnedStartingBasics(prompt,owner,Stage,CardTag),
    owner.hand.cards);
  prompt.options.blocked=[0];
  assert.deepEqual(chooseOwnedStartingBasics(prompt,owner,Stage,CardTag),
    [owner.hand.cards[1]]);
  prompt.options.blocked=[0,1];
  assert.equal(chooseOwnedStartingBasics(prompt,owner,Stage,CardTag),null);
  prompt.options.blocked=[];
  owner.hand.cards=[card('Evolution C',Stage.STAGE_1)];
  assert.equal(chooseOwnedStartingBasics(prompt,owner,Stage,CardTag),null);
});
test('both seats: hidden opponent order cannot affect owner setup choice',()=>{
  for(const seat of [0,1]){
    const {owner,other,prompt,state,ChooseCardsPrompt}=fixture({seat});
    class Bot{
      constructor(id){this.client={id};}
      decodeNextAction(){return {kind:'native-delegated'};}
    }
    class Resolve{
      constructor(id,result){this.id=id;this.result=result;}
    }
    const modules={
      'simple-bot/simple-tactics-ai':{SimpleTacticsAi:Bot},
      'game/store/prompts/choose-cards-prompt':{ChooseCardsPrompt},
      'game/store/actions/resolve-prompt-action':{ResolvePromptAction:Resolve},
      'game/game-message':{GameMessage:{CHOOSE_STARTING_POKEMONS:'STARTING'}},
      'game/store/state/state':{GamePhase:{SETUP:1}},
      'game/store/card/card-types':{Stage,CardTag}
    };
    const engine=p=>modules[p];
    const before=JSON.stringify(state);
    let first;
    const observed=withOwnerStartingBasicChoice(()=>{
      const bot=new Bot(owner.id);
      first=bot.decodeNextAction(state);
      other.hand.cards.reverse();
      const second=bot.decodeNextAction(state);
      assert.deepEqual(first.result,second.result);
      assert.deepEqual(first.result.map(c=>c.fullName),['Basic A','Basic B']);
      return 'selected';
    },{engine});
    assert.equal(observed.result,'selected');
    assert.equal(observed.audit.proposals,2);
    assert.ok(observed.audit.events.every(e=>e.seat===seat));
    assert.equal(state.players[seat],owner);
    assert.equal(JSON.parse(before).players[seat].hand.cards[0].fullName,
      owner.hand.cards[0].fullName);
    assert.deepEqual(prompt.cards.cards,owner.hand.cards);
  }
});
test('delegate wrong setup phase, wrong prompt owner, wrong message',()=>{
  for(const mutation of [
    f=>{f.state.phase=2;},
    f=>{f.prompt.message='OTHER';},
    f=>{f.prompt.playerId=202;}
  ]){
    const f=fixture();
    mutation(f);
    class Bot{
      constructor(){this.client={id:101};}
      decodeNextAction(){return {kind:'native-delegated'};}
    }
    class Resolve{}
    const modules={
      'simple-bot/simple-tactics-ai':{SimpleTacticsAi:Bot},
      'game/store/prompts/choose-cards-prompt':{
        ChooseCardsPrompt:f.ChooseCardsPrompt
      },
      'game/store/actions/resolve-prompt-action':{ResolvePromptAction:Resolve},
      'game/game-message':{GameMessage:{CHOOSE_STARTING_POKEMONS:'STARTING'}},
      'game/store/state/state':{GamePhase:{SETUP:1}},
      'game/store/card/card-types':{Stage,CardTag}
    };
    const before=JSON.stringify(f.state);
    const wrapped=withOwnerStartingBasicChoice(()=>
      new Bot().decodeNextAction(f.state),{engine:p=>modules[p]});
    assert.deepEqual(wrapped.result,{kind:'native-delegated'});
    assert.equal(wrapped.audit.proposals,0);
    assert.equal(JSON.stringify(f.state),before);
  }
});
