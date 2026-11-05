'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {captureChoice,withOwnerCaptureEnergySearch,CAPTURE}=
  require('../simulation/twinleaf/agent41-owner-capture-energy-search.cjs');

const Stage={BASIC:0,STAGE_1:1};
class ChooseCardsPrompt{
  constructor(id,owner,minimum=0){
    this.id=id;
    this.playerId=owner.id;
    this.cards=owner.deck;
    this.result=undefined;
    this.options={min:minimum,max:1};
  }
  validate(cards){
    return Array.isArray(cards)&&
      cards.length>=this.options.min&&cards.length<=this.options.max&&
      cards.every(c=>this.cards.cards.includes(c)&&c.stage===Stage.BASIC);
  }
}
class AddPlayerAction{}
class PlayCardAction{
  constructor(clientId,handIndex){
    this.clientId=clientId;
    this.handIndex=handIndex;
  }
}
class ResolvePromptAction{
  constructor(id,cards){this.id=id;this.cards=cards;}
}
class Bot{
  constructor(id){this.client={id};}
  decodeNextAction(){return {kind:'native-fallback'};}
}
class Store{
  constructor(players){
    this.state={turn:1,players,prompts:[]};
  }
  dispatch(action){
    if(action.constructor.name==='AddPlayerAction')return this.state;
    if(action instanceof PlayCardAction){
      const owner=this.state.players.find(p=>p.id===action.clientId);
      const [card]=owner.hand.cards.splice(action.handIndex,1);
      owner.active.energies.cards.push(card);
      this.state.prompts.push(new ChooseCardsPrompt(17,owner));
    }
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      assert.ok(prompt.validate(action.cards));
      const owner=this.state.players.find(p=>p.id===prompt.playerId);
      for(const card of action.cards){
        owner.deck.cards.splice(owner.deck.cards.indexOf(card),1);
        owner.bench.find(slot=>slot.cards.length===0).cards.push(card);
      }
      prompt.result=action.cards;
    }
    return this.state;
  }
}
const blank=()=>({cards:[],energies:{cards:[]}});
function owner(id,hand=[{fullName:CAPTURE}],deck=[
  {fullName:'Iron Thorns ex TWM',stage:Stage.BASIC},
  {fullName:'Garbodor BKP',stage:Stage.STAGE_1}
]){
  return {
    id,hand:{cards:hand},deck:{cards:deck},
    active:blank(),bench:Array.from({length:5},blank)
  };
}
const dependencies={
  SimpleTacticsAi:Bot,Store,ResolvePromptAction,Stage
};

test('choose only actual deck-listed Basic with Bench capacity',()=>{
  const p=owner(101);
  const prompt=new ChooseCardsPrompt(1,p);
  assert.equal(captureChoice(prompt,p,Stage,{}).cards[0],p.deck.cards[0]);
  assert.equal(captureChoice(prompt,owner(202),Stage,{}),null);
  p.bench.forEach(slot=>slot.cards.push({fullName:'occupied'}));
  assert.deepEqual(captureChoice(prompt,p,Stage,{}).cards,[]);
  prompt.options.min=1;
  assert.equal(captureChoice(prompt,p,Stage,{}),null);
});

test('actual native Capture dispatch permits source-owned deck choice on either seat',()=>{
  for(const seat of [0,1]){
    const ps=[owner(101),owner(202)];
    const store=new Store(ps);
    const before=Bot.prototype.decodeNextAction;
    const wrapped=withOwnerCaptureEnergySearch(()=>{
      store.dispatch(new AddPlayerAction());
      const client=ps[seat].id;
      const bot=new Bot(client);
      assert.deepEqual(bot.decodeNextAction(store.state),
        {kind:'native-fallback'});
      store.dispatch(new PlayCardAction(client,0));
      const choice=bot.decodeNextAction(store.state);
      assert.ok(choice instanceof ResolvePromptAction);
      assert.equal(choice.cards[0].fullName,'Iron Thorns ex TWM');
      store.dispatch(choice);
      assert.equal(ps[seat].bench[0].cards[0].fullName,
        'Iron Thorns ex TWM');
      assert.equal(new Bot(ps[1-seat].id)
        .decodeNextAction(store.state).kind,'native-fallback');
      return 'done';
    },dependencies);
    assert.equal(wrapped.result,'done');
    assert.equal(wrapped.audit.acceptedCaptureAttachments,1);
    assert.equal(wrapped.audit.matchedOwnerDeckPrompts,1);
    assert.equal(wrapped.audit.ownerSearchProposals,1);
    assert.equal(wrapped.audit.acceptedOwnerSearches,1);
    assert.equal(wrapped.audit.sourceBasicPhysicallyBenched,1);
    assert.strictEqual(Bot.prototype.decodeNextAction,before);
  }
});

test('unrelated owner deck prompt and speculative Store stay untouched',()=>{
  const players=[owner(101),owner(202)];
  const store=new Store(players);
  const result=withOwnerCaptureEnergySearch(()=>{
    store.dispatch(new AddPlayerAction());
    store.state.prompts.push(new ChooseCardsPrompt(35,players[0]));
    assert.equal(new Bot(101).decodeNextAction(store.state).kind,
      'native-fallback');
    const cloned=new Store(players);
    cloned.dispatch(new PlayCardAction(101,0));
    assert.equal(new Bot(101).decodeNextAction(store.state).kind,
      'native-fallback');
  },dependencies);
  assert.equal(result.audit.acceptedCaptureAttachments,0);
  assert.equal(result.audit.ownerSearchProposals,0);
});

test('zero valid Basic in entitled deck produces native validated empty search',()=>{
  const ps=[owner(101,[{fullName:CAPTURE}],
    [{fullName:'Garbodor BKP',stage:Stage.STAGE_1}]),owner(202)];
  const store=new Store(ps);
  const result=withOwnerCaptureEnergySearch(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(101,0));
    const answer=new Bot(101).decodeNextAction(store.state);
    assert.deepEqual(answer.cards,[]);
    store.dispatch(answer);
  },dependencies);
  assert.equal(result.audit.emptySearchesAccepted,1);
  assert.equal(result.audit.sourceBasicPhysicallyBenched,0);
});

test('wrapper restores patched methods when native callback throws',()=>{
  const previousBot=Bot.prototype.decodeNextAction;
  const previousStore=Store.prototype.dispatch;
  assert.throws(()=>withOwnerCaptureEnergySearch(()=>{
    throw new Error('synthetic native error');
  },dependencies),/synthetic native error/);
  assert.strictEqual(Bot.prototype.decodeNextAction,previousBot);
  assert.strictEqual(Store.prototype.dispatch,previousStore);
});
