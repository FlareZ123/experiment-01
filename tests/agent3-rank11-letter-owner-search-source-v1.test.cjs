'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  chooseTwoDarknessFromOwnerPrompt,withSourceLetterOwnerSearch
}=require('../simulation/evaluation/agent3-rank11-letter-owner-search-source-v1.cjs');

const ENERGY='Darkness Energy MEE';
const types={SuperType:{ENERGY:2},EnergyType:{BASIC:0}};
const makeEnergy=(name=ENERGY,basic=true)=>({
  fullName:name,superType:2,energyType:basic?0:1
});
const reg={
  selectedOriginalId:'11:102:A:champion-reference',
  originalSourceSeat:1,sourceTurn:8,
  sourceCardToPlay:'Professors Letter BKT'
};
class AddPlayerAction{}
class PlayCardAction{
  constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
}
class PassTurnAction{}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(id,owner){
    this.id=id;this.playerId=owner.id;
    this.message='CHOOSE_CARD_TO_HAND';this.cards=owner.deck;
    this.options={min:0,max:2,allowCancel:false};
    this.result=undefined;
  }
  validate(selected){
    return Array.isArray(selected)&&selected.length<=2&&
      selected.every(card=>this.cards.cards.includes(card)&&
        card.superType===2&&card.energyType===0);
  }
}
class Store{
  constructor(owner){
    this.state={turn:8,activePlayer:1,
      players:[{id:41,deck:{cards:[]},hand:{cards:[]}},owner],
      prompts:[]};
  }
  dispatch(action){
    const owner=this.state.players[1];
    if(action instanceof AddPlayerAction)return this.state;
    if(action instanceof PlayCardAction){
      assert.equal(action.id,owner.id);
      const card=owner.hand.cards.splice(action.handIndex,1)[0];
      owner.supporter.cards.push(card);
      this.state.prompts=[new ChooseCardsPrompt(101,owner)];
      return this.state;
    }
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts[0];
      assert.equal(prompt.validate(action.result),true);
      prompt.result=action.result;
      for(const card of action.result){
        owner.deck.cards.splice(owner.deck.cards.indexOf(card),1);
        owner.hand.cards.push(card);
      }
      return this.state;
    }
    return this.state;
  }
}
class SimpleTacticsAi{
  constructor(clientId){this.client={id:clientId};}
  decodeNextAction(){return new PassTurnAction();}
}
const observe=(state,seat)=>{
  assert.equal(state.activePlayer,seat);
  return {decisionKind:'owner-prompt',pendingOwnerDeckSearch:true};
};
function fixture(target=true,malformed=false){
  const owner={id:99,hand:{cards:[{fullName:reg.sourceCardToPlay}]},
    deck:{cards:[makeEnergy(),makeEnergy(),makeEnergy('Grass Energy MEE')]},
    supporter:{cards:[]}};
  let recorded=null;
  const headless={runMatch(request){
    const store=new Store(owner);
    store.dispatch(new AddPlayerAction());
    const baseline=new SimpleTacticsAi(99);
    const pre=baseline.decodeNextAction(store.state);
    assert.ok(pre instanceof PassTurnAction);
    store.dispatch(new PlayCardAction(99,0));
    if(malformed)store.state.prompts[0].options.max=3;
    const next=baseline.decodeNextAction(store.state);
    recorded=next;
    if(next instanceof ResolvePromptAction)store.dispatch(next);
    return {owner,pending:store.state.prompts[0],answer:next};
  }};
  const priorMatch=headless.runMatch;
  const priorDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const priorDispatch=Store.prototype.dispatch;
  const out=withSourceLetterOwnerSearch(()=>
    headless.runMatch({label:'test-'+(target?reg.selectedOriginalId:'non-target')}),
    {registration:reg,headless,Store,SimpleTacticsAi,
      ResolvePromptAction,types,observe});
  assert.strictEqual(headless.runMatch,priorMatch);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,priorDecode);
  assert.strictEqual(Store.prototype.dispatch,priorDispatch);
  return {...out,recorded};
}

test('only native-valid two physical Basic Darkness Energy are eligible',()=>{
  const owner={id:7,deck:{cards:[makeEnergy(),makeEnergy(),
    makeEnergy('Grass Energy MEE')]}};
  const prompt=new ChooseCardsPrompt(2,owner);
  const cards=chooseTwoDarknessFromOwnerPrompt(prompt,owner,types,{});
  assert.deepEqual(cards,owner.deck.cards.slice(0,2));
  for(const change of [
    ()=>(prompt.playerId=8),
    ()=>(prompt.cards={cards:[...owner.deck.cards]}),
    ()=>(prompt.message='CHOOSE_CARD_FROM_DECK'),
    ()=>(prompt.options.max=1),
    ()=>(prompt.options.min=1),
    ()=>(prompt.options.allowCancel=true)
  ]){
    const original={playerId:prompt.playerId,cards:prompt.cards,
      message:prompt.message,options:{...prompt.options}};
    change();
    assert.equal(chooseTwoDarknessFromOwnerPrompt(prompt,owner,types,{}),null);
    Object.assign(prompt,original);
  }
  owner.deck.cards.pop();
  owner.deck.cards.pop();
  assert.equal(chooseTwoDarknessFromOwnerPrompt(prompt,owner,types,{}),null);
});

test('actual owner pending prompt and full physical to-hand custody settle',()=>{
  const {result,audit,recorded}=fixture(true,false);
  assert.ok(recorded instanceof ResolvePromptAction);
  assert.equal(audit.activeRegisteredMatches,1);
  assert.equal(audit.realTargetStores,1);
  assert.equal(audit.printedLetterNativeDispatches,1);
  assert.equal(audit.matchedLiveOwnerSearchPrompts,1);
  assert.equal(audit.proposedOwnerSearchAnswers,1);
  assert.equal(audit.nativeResolvedAnswers,1);
  assert.equal(audit.exactOriginalEnergyObjectsToOwnerHand,2);
  assert.equal(audit.ownerSearchAnswersUnsettled,0);
  assert.equal(result.owner.hand.cards.length,2);
  assert.equal(result.owner.deck.cards.length,1);
  assert.strictEqual(result.pending.result,recorded.result);
});

test('different arm never activates registered-only source prompt bridge',()=>{
  const {result,audit,recorded}=fixture(false,false);
  assert.ok(recorded instanceof PassTurnAction);
  assert.equal(result.owner.hand.cards.length,0);
  assert.equal(audit.realTargetStores,0);
  assert.equal(audit.proposedOwnerSearchAnswers,0);
});

test('incompatible native prompt keeps unchanged fallback, without false transfer',()=>{
  const {result,audit,recorded}=fixture(true,true);
  assert.ok(recorded instanceof PassTurnAction);
  assert.equal(result.owner.hand.cards.length,0);
  assert.equal(audit.proposedOwnerSearchAnswers,0);
  assert.equal(audit.exactOriginalEnergyObjectsToOwnerHand,0);
});
