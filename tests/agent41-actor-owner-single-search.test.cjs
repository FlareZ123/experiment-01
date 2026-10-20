'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,actorSingleSearchInput,chooseActorSingleSearch,
  withActorOwnerSingleSearch}=
  require('../simulation/twinleaf/agent41-actor-owner-single-search.cjs');

function createPrompt(owner,source,options={}){
  class ChooseCardsPrompt{}
  const prompt=new ChooseCardsPrompt();
  Object.assign(prompt,{
    id:options.id??7,playerId:owner.id,result:undefined,
    message:options.message??'CHOOSE_CARD_TO_HAND',
    cards:source,options:{min:options.min??0,max:options.max??1},
    validate:options.validate??(chosen=>
      Array.isArray(chosen)&&chosen.length<=1&&
      chosen.every(card=>source.cards.includes(card)))
  });
  return prompt;
}
function actor(seat,turn=3){
  return Object.freeze({decisionKind:'owner-prompt',
    actorSeat:seat,globalTurn:turn,ownHand:['Owner Secret']});
}

test('detached live owner deck menu selects only validator-approved exact card',()=>{
  const deck={cards:[{fullName:'Blocked Basic'},{
    fullName:'Duskull VIV'}, {fullName:'Duskull VIV'}]};
  const owner={id:101,deck,discard:{cards:[]},hand:{cards:[]}};
  const prompt=createPrompt(owner,deck,{validate:xs=>
    Array.isArray(xs)&&xs.length===1&&xs[0]===deck.cards[2]});
  const state={players:[owner,{id:202}],prompts:[prompt],
    opponentHand:['MUST_NOT_LEAK']};
  const input=actorSingleSearchInput(state,0,()=>actor(0));
  assert.equal(input.prompt.source,'own-deck');
  assert.deepEqual(input.prompt.offered.map(x=>x.selectableAlone),
    [false,false,true]);
  assert.deepEqual(chooseActorSingleSearch(input),{indices:[2]});
  assert.ok(Object.isFrozen(input.prompt.offered));
  assert.equal(JSON.stringify(input).includes('MUST_NOT_LEAK'),false);
  assert.equal(actorSingleSearchInput(state,1,()=>actor(1)),null);
});

test('non-owner zone, non-search discard and mandatory multi-card fail closed',()=>{
  const owner={id:101,deck:{cards:[]},hand:{cards:[]},
    discard:{cards:[]}};
  const enemy={id:202,deck:{cards:[{fullName:'Hidden Prize'}]},
    hand:{cards:[]},discard:{cards:[]}};
  const state={players:[owner,enemy],prompts:[]};
  state.prompts=[createPrompt(owner,enemy.deck)];
  assert.equal(actorSingleSearchInput(state,0,()=>actor(0)),null);
  state.prompts=[createPrompt(owner,owner.hand,{
    message:'CHOOSE_CARD_TO_DISCARD'})];
  assert.equal(actorSingleSearchInput(state,0,()=>actor(0)),null);
  state.prompts=[createPrompt(owner,owner.deck,{min:2,max:2})];
  assert.equal(actorSingleSearchInput(state,0,()=>actor(0)),null);
});

test('pure chooser handles legal empty, legal cancel and unsupported forced choice',()=>{
  const base={actor:actor(0),prompt:{offered:[]}};
  assert.deepEqual(chooseActorSingleSearch({
    ...base,prompt:{...base.prompt,canSkip:true,canCancel:false}}),
  {indices:[]});
  assert.deepEqual(chooseActorSingleSearch({
    ...base,prompt:{...base.prompt,canSkip:false,canCancel:true}}),
  {indices:null});
  assert.equal(chooseActorSingleSearch({
    ...base,prompt:{...base.prompt,canSkip:false,canCancel:false}}),null);
});

test('both physical seats execute genuine owner-native typed searches',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{constructor(id,result){
    this.id=id;this.result=result;}}
  class Store{constructor(){this.state=null;this.actions=[];}
    dispatch(action){
      this.actions.push(action);
      if(action instanceof ResolvePromptAction){
        const p=this.state.prompts.find(p=>p.id===action.id);
        assert.ok(p.validate(action.result));
        p.result=action.result;
      }
      return 'accepted';
    }}
  class SimpleTacticsAi{constructor(id){this.client={id};}
    decodeNextAction(){return 'NATIVE_FALLBACK';}}
  const previous=SimpleTacticsAi.prototype.decodeNextAction;
  const previousDispatch=Store.prototype.dispatch;
  const played=[];
  const result=withActorOwnerSingleSearch(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    for(const [seat,id] of [[0,101],[1,202]]){
      const a={id:101,deck:{cards:[{fullName:'Duskull VIV'}]},
        hand:{cards:[]},discard:{cards:[]}};
      const b={id:202,deck:{cards:[{fullName:'Trubbish FST'}]},
        hand:{cards:[]},discard:{cards:[]}};
      const player=[a,b][seat];
      const prompt=createPrompt(player,player.deck,{id:seat+5});
      const state={phase:5,players:[a,b],prompts:[prompt],
        activePlayer:seat,turn:3};
      store.state=state;
      const bot=new SimpleTacticsAi(id);
      assert.equal(bot.decodeNextAction({...state}),'NATIVE_FALLBACK');
      const action=bot.decodeNextAction(state);
      assert.ok(action instanceof ResolvePromptAction);
      assert.strictEqual(action.result[0],player.deck.cards[0]);
      assert.equal(store.dispatch(action),'accepted');
      played.push({seat,card:action.result[0].fullName});
    }
    return played;
  },{
    SimpleTacticsAi,Store,ResolvePromptAction,
    GamePhase:{PLAYER_TURN:5},
    observe:(state,seat)=>actor(seat,state.turn),
    // The injected observer returns a detached *prompt DTO* as in the native path.
    choose:chooseActorSingleSearch
  });
  assert.deepEqual(result.result,[
    {seat:0,card:'Duskull VIV'},{seat:1,card:'Trubbish FST'}]);
  assert.equal(result.audit.version,VERSION);
  assert.equal(result.audit.selected,2);
  assert.equal(result.audit.accepted,2);
  assert.equal(result.audit.nativePromptPostconditionsConfirmed,2);
  assert.equal(result.audit.nonLiveSpeculativeFallbacks,2);
  assert.equal(result.audit.competitiveGameQualified,false);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,previous);
  assert.strictEqual(Store.prototype.dispatch,previousDispatch);
});

test('unsupported native prompt delegates without actor-only credit',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{}
  class Store{dispatch(){return true;}}
  class SimpleTacticsAi{constructor(){this.client={id:101};}
    decodeNextAction(){return 'NATIVE_UNQUALIFIED';}}
  const output=withActorOwnerSingleSearch(()=>{
    const store=new Store();
    const a={id:101,deck:{cards:[]},hand:{cards:[]},discard:{cards:[]}};
    const p=createPrompt(a,a.hand,{message:'CHOOSE_CARD_TO_DISCARD'});
    store.state={players:[a,{id:202}],prompts:[p],phase:5};
    store.dispatch(new AddPlayerAction());
    return new SimpleTacticsAi().decodeNextAction(store.state);
  },{SimpleTacticsAi,Store,ResolvePromptAction,
    GamePhase:{PLAYER_TURN:5},
    observe:()=>{throw Error('Unsupported prompt must not project deck');}});
  assert.equal(output.result,'NATIVE_UNQUALIFIED');
  assert.equal(output.audit.selected,0);
  assert.equal(output.audit.nativeFallbacks,1);
  assert.equal(output.audit.unsupportedPromptMessages.CHOOSE_CARD_TO_DISCARD,1);
});

test('Store rejection restores both prototype methods',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{constructor(id,result){
    this.id=id;this.result=result;}}
  class Store{dispatch(action){
    if(action instanceof AddPlayerAction)return true;
    throw Error('STORE_REJECTION');}}
  class SimpleTacticsAi{constructor(){this.client={id:101};}
    decodeNextAction(){return 'UNEXPECTED_FALLBACK';}}
  const before=SimpleTacticsAi.prototype.decodeNextAction;
  const beforeDispatch=Store.prototype.dispatch;
  assert.throws(()=>withActorOwnerSingleSearch(()=>{
    const store=new Store();
    const a={id:101,deck:{cards:[{fullName:'Duskull VIV'}]},
      hand:{cards:[]},discard:{cards:[]}};
    const p=createPrompt(a,a.deck);
    store.state={players:[a,{id:202}],prompts:[p],phase:5,turn:2};
    store.dispatch(new AddPlayerAction());
    store.dispatch(new SimpleTacticsAi().decodeNextAction(store.state));
  },{SimpleTacticsAi,Store,ResolvePromptAction,
    GamePhase:{PLAYER_TURN:5},
    observe:state=>actor(0,state.turn)}),/STORE_REJECTION/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,before);
  assert.strictEqual(Store.prototype.dispatch,beforeDispatch);
});
