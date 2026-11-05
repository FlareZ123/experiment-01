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
  constructor(id,handIndex){
    this.id=id;
    this.handIndex=handIndex;
  }
}
class ResolvePromptAction{
  constructor(id,cards){this.id=id;this.result=cards;this.cards=cards;}
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
      const owner=this.state.players.find(p=>p.id===action.id);
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

test('other Energy cannot hijack a matching owner-deck prompt',()=>{
  const ps=[owner(101,[{fullName:'Speed Lightning Energy RCL'}]),
    owner(202)];
  const store=new Store(ps);
  const result=withOwnerCaptureEnergySearch(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(101,0));
    assert.equal(new Bot(101).decodeNextAction(store.state).kind,
      'native-fallback');
  },dependencies);
  assert.equal(result.audit.acceptedCaptureAttachments,0);
  assert.equal(result.audit.ownerSearchProposals,0);
});

test('native prompt count contract mismatch delegates without mutation',()=>{
  const ps=[owner(101),owner(202)];
  const store=new Store(ps);
  const result=withOwnerCaptureEnergySearch(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(101,0));
    store.state.prompts[0].options.min=1;
    assert.equal(new Bot(101).decodeNextAction(store.state).kind,
      'native-fallback');
    assert.equal(store.state.prompts[0].result,undefined);
  },dependencies);
  assert.equal(result.audit.acceptedCaptureAttachments,1);
  assert.equal(result.audit.matchedOwnerDeckPrompts,1);
  assert.equal(result.audit.ownerSearchProposals,0);
});

test('owner-deck physical order does not change chosen Basic printing',()=>{
  const a={fullName:'Zekrom BLW',stage:Stage.BASIC};
  const b={fullName:'Abra MEG',stage:Stage.BASIC};
  const ownerOne=owner(101,[{fullName:CAPTURE}],[a,b]);
  const ownerTwo=owner(101,[{fullName:CAPTURE}],[b,a]);
  const selectedOne=captureChoice(new ChooseCardsPrompt(42,ownerOne),
    ownerOne,Stage,{}).cards[0].fullName;
  const selectedTwo=captureChoice(new ChooseCardsPrompt(43,ownerTwo),
    ownerTwo,Stage,{}).cards[0].fullName;
  assert.equal(selectedOne,'Abra MEG');
  assert.equal(selectedOne,selectedTwo);
});

/** Simulates pinned Store's nonthrowing no-op prompt reducer. */
class SilentPromptStore extends Store{
  dispatch(action){
    if(action instanceof ResolvePromptAction)return this.state;
    return super.dispatch(action);
  }
}

/** Simulates prompt resolution without the Basic's printed movement. */
class ResultOnlyStore extends Store{
  dispatch(action){
    if(action instanceof ResolvePromptAction){
      const prompt=this.state.prompts.find(p=>p.id===action.id);
      prompt.result=action.result;
      return this.state;
    }
    return super.dispatch(action);
  }
}

test('silent native prompt no-op cannot count as accepted on either seat',()=>{
  for(const seat of [0,1]){
    const ps=[owner(101),owner(202)];
    const store=new SilentPromptStore(ps);
    assert.throws(()=>withOwnerCaptureEnergySearch(()=>{
      store.dispatch(new AddPlayerAction());
      store.dispatch(new PlayCardAction(ps[seat].id,0));
      const chosen=new Bot(ps[seat].id).decodeNextAction(store.state);
      assert.ok(chosen instanceof ResolvePromptAction);
      store.dispatch(chosen);
    },{...dependencies,Store:SilentPromptStore}),error=>{
      assert.match(error.message,/without settling the pending prompt/);
      const audit=error.ownerCaptureSearchAudit;
      assert.equal(audit.ownerSearchReturnsWithoutThrow,1);
      assert.equal(audit.unsettledOwnerSearches,1);
      assert.equal(audit.acceptedOwnerSearches,0);
      assert.equal(audit.sourceBasicPhysicallyBenched,0);
      assert.equal(audit.emptySearchesAccepted,0);
      return true;
    });
  }
});

test('a stale missing native prompt cannot be certified by a silent Store',()=>{
  const ps=[owner(101),owner(202)];
  const store=new SilentPromptStore(ps);
  assert.throws(()=>withOwnerCaptureEnergySearch(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(101,0));
    const chosen=new Bot(101).decodeNextAction(store.state);
    store.state.prompts.length=0;
    store.dispatch(chosen);
  },{...dependencies,Store:SilentPromptStore}),error=>{
    assert.equal(error.ownerCaptureSearchAudit.unsettledOwnerSearches,1);
    assert.equal(error.ownerCaptureSearchAudit.acceptedOwnerSearches,0);
    return true;
  });
});

test('a resolved prompt without a deck-to-Bench transition is unverified',()=>{
  const ps=[owner(101),owner(202)];
  const store=new ResultOnlyStore(ps);
  const outcome=withOwnerCaptureEnergySearch(()=>{
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(101,0));
    store.dispatch(new Bot(101).decodeNextAction(store.state));
  },{...dependencies,Store:ResultOnlyStore});
  assert.equal(outcome.audit.acceptedOwnerSearches,1);
  assert.equal(outcome.audit.sourceBasicPhysicallyBenched,0);
  assert.equal(outcome.audit.records[0].nativePromptSettled,true);
  assert.equal(outcome.audit.records[0].physicalDeckToBenchVerified,false);
  assert.equal(outcome.audit.records[0].paperEffectVerified,false);
});
