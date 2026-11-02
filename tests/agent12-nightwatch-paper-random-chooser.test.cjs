'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  sampleUniformPositions,nightWatchLikeShape,
  withUniformNightWatchOpponentSelection
}=require('../simulation/twinleaf/agent12-nightwatch-paper-random-chooser.cjs');

class ChooseCardsPrompt{
  constructor(player,other){
    this.id=7;this.playerId=player.id;
    this.cards=other.hand;this.filter={};
    this.options={min:2,max:2,allowCancel:false,isSecret:true};
  }
  validate(cards){
    return cards.length===2&&cards.every(x=>this.cards.cards.includes(x));
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class Ai{
  resolvePrompt(player,state,prompt){
    return {kind:'original',playerId:player.id,promptId:prompt.id};
  }
}
const player={id:1},other={id:2,hand:{cards:[
  {id:10,name:'HIDDEN-A'}, {id:11,name:'HIDDEN-B'},
  {id:12,name:'HIDDEN-C'}, {id:13,name:'HIDDEN-D'}
]}};
const state={turn:11,players:[player,other]};

test('fixed seed yields reproducible without-replacement positions',()=>{
  const one=sampleUniformPositions(10,2,'precommitted-seed','7|0');
  assert.deepEqual(one,sampleUniformPositions(10,2,'precommitted-seed','7|0'));
  assert.equal(one.length,2);
  assert.equal(new Set(one).size,2);
  assert.ok(one.every(i=>Number.isInteger(i)&&i>=0&&i<10));
});

test('different fixed exogenous seeds do not collapse to one fixed pair',()=>{
  const positions=new Set();
  for(let i=0;i<50;i++)
    positions.add(sampleUniformPositions(7,2,
      'precommitted-'+i,'7|0').join(':'));
  assert.ok(positions.size>8);
});

test('speculative prompt calls cannot perturb a later real Night Watch physical choice',()=>{
  const ai=new Ai(),live=new ChooseCardsPrompt(player,other);
  const aux=new ChooseCardsPrompt(player,other);
  aux.id=6;
  const realState={turn:11,players:[player,other]};
  const speculativeState={turn:11,players:[player,other]};
  const opts={committedSeed:'fixed',deps:{
    SimpleTacticsAi:Ai,ResolvePromptAction
  }};
  const baseline=withUniformNightWatchOpponentSelection(
    ()=>ai.resolvePrompt(player,realState,live),opts);
  const perturbed=withUniformNightWatchOpponentSelection(()=>{
    ai.resolvePrompt(player,speculativeState,aux);
    return ai.resolvePrompt(player,realState,live);
  },opts);
  assert.equal(baseline.audit.structuralCandidates,1);
  assert.equal(perturbed.audit.structuralCandidates,2);
  assert.equal(perturbed.audit.structuralCounterNotUsedForSampling,true);
  assert.deepEqual(perturbed.result.result.map(x=>x.id),
    baseline.result.result.map(x=>x.id));
  assert.equal(perturbed.audit.events[1].nonce,
    baseline.audit.events[0].nonce);
  assert.notEqual(perturbed.audit.events[0].nonce,
    perturbed.audit.events[1].nonce);
  // Also exercise a speculative clone with the *same* prompt ID and turn.
  const sameIdClone=new ChooseCardsPrompt(player,other);
  const repeated=withUniformNightWatchOpponentSelection(()=>{
    ai.resolvePrompt(player,speculativeState,sameIdClone);
    return ai.resolvePrompt(player,realState,live);
  },opts);
  assert.deepEqual(repeated.result.result.map(x=>x.id),
    baseline.result.result.map(x=>x.id));
  assert.equal(repeated.audit.events[0].nonce,
    repeated.audit.events[1].nonce);
});


class AttackEffect{
  constructor(player,attack){this.player=player;this.attack=attack;}
}
class FakeTrevenantDusknoirGX{
  constructor(){this.attacks=[{name:'Night Watch'},{name:'Pale Moon-GX'}];}
  reduceEffect(store,working,effect){
    if(effect.attack===this.attacks[0]){
      const actor=effect.player;
      working.prompts.push(new ChooseCardsPrompt(actor,
        working.players.find(p=>p.id!==actor.id)));
    }
    return working;
  }
}

test('printed-source guard excludes lookalike hand selection and permits exact reducer origin',()=>{
  const ai=new Ai();
  const source=new FakeTrevenantDusknoirGX();
  const otherActor={id:2,hand:{cards:[
    {id:10}, {id:11}, {id:12}, {id:13}
  ]}};
  const actor={id:1},working={turn:11,players:[actor,otherActor],prompts:[]};
  const fake=new ChooseCardsPrompt(actor,otherActor);
  fake.id=400;
  const beforeAi=Ai.prototype.resolvePrompt;
  const beforeSource=FakeTrevenantDusknoirGX.prototype.reduceEffect;
  const out=withUniformNightWatchOpponentSelection(()=>{
    const excluded=ai.resolvePrompt(actor,working,fake);
    source.reduceEffect({},working,new AttackEffect(actor,source.attacks[1]));
    assert.equal(working.prompts.length,0);
    source.reduceEffect({},working,new AttackEffect(actor,source.attacks[0]));
    assert.equal(working.prompts.length,1);
    working.prompts[0].id=401;
    const included=ai.resolvePrompt(actor,working,working.prompts[0]);
    return {excluded,included};
  },{committedSeed:'fixed',requirePrintedOrigin:true,deps:{
    SimpleTacticsAi:Ai,ResolvePromptAction,
    TrevenantDusknoirGX:FakeTrevenantDusknoirGX
  }});
  assert.equal(out.result.excluded.kind,'original');
  assert.ok(out.result.included instanceof ResolvePromptAction);
  assert.equal(out.audit.skippedUnmarkedStructuralPrompts,1);
  assert.equal(out.audit.printedSourceReducerInvocations,1);
  assert.equal(out.audit.printedNightWatchPromptMarks,1);
  assert.equal(out.audit.structuralCandidates,1);
  assert.equal(out.audit.requirePrintedOrigin,true);
  assert.equal(Ai.prototype.resolvePrompt,beforeAi);
  assert.equal(FakeTrevenantDusknoirGX.prototype.reduceEffect,beforeSource);
});

test('printed-source reducer and bot resolver both restore after exception',()=>{
  const ai=new Ai(),beforeAi=Ai.prototype.resolvePrompt;
  const beforeSource=FakeTrevenantDusknoirGX.prototype.reduceEffect;
  assert.throws(()=>withUniformNightWatchOpponentSelection(()=>{
    const source=new FakeTrevenantDusknoirGX();
    const state={turn:3,players:[player,other],prompts:[]};
    source.reduceEffect({},state,new AttackEffect(player,source.attacks[0]));
    ai.resolvePrompt(player,state,state.prompts[0]);
    throw Error('expected printed failure');
  },{committedSeed:'fixed',requirePrintedOrigin:true,deps:{
    SimpleTacticsAi:Ai,ResolvePromptAction,
    TrevenantDusknoirGX:FakeTrevenantDusknoirGX
  }}),/expected printed failure/);
  assert.equal(Ai.prototype.resolvePrompt,beforeAi);
  assert.equal(FakeTrevenantDusknoirGX.prototype.reduceEffect,beforeSource);
});

class AddPlayerAction{}
class FakeStore{
  constructor(state){this.state=state;}
  dispatch(action){return {accepted:true,action};}
}

test('root-Store gate excludes marked speculative clones but samples printed live root',()=>{
  const ai=new Ai(),source=new FakeTrevenantDusknoirGX();
  const beforeAi=Ai.prototype.resolvePrompt;
  const beforeSource=FakeTrevenantDusknoirGX.prototype.reduceEffect;
  const beforeDispatch=FakeStore.prototype.dispatch;
  const live={turn:12,players:[player,other],prompts:[]};
  const detached={turn:12,players:[player,other],prompts:[]};
  const originalStore=new FakeStore(live);
  const result=withUniformNightWatchOpponentSelection(()=>{
    source.reduceEffect({},detached,
      new AttackEffect(player,source.attacks[0]));
    const shadow=ai.resolvePrompt(player,detached,detached.prompts[0]);
    assert.equal(shadow.kind,'original');
    originalStore.dispatch(new AddPlayerAction());
    source.reduceEffect({},live,new AttackEffect(player,source.attacks[0]));
    const real=ai.resolvePrompt(player,live,live.prompts[0]);
    assert.ok(real instanceof ResolvePromptAction);
    return real;
  },{committedSeed:'fixed',requirePrintedOrigin:true,
    requireNativeRootState:true,deps:{
      SimpleTacticsAi:Ai,ResolvePromptAction,
      TrevenantDusknoirGX:FakeTrevenantDusknoirGX,
      Store:FakeStore,AddPlayerAction
    }});
  assert.equal(result.audit.printedSourceReducerInvocations,2);
  assert.equal(result.audit.printedNightWatchPromptMarks,2);
  assert.equal(result.audit.skippedDetachedStorePrintedPrompts,1);
  assert.equal(result.audit.nativeRootSetupDispatchesObserved,1);
  assert.equal(result.audit.structuralCandidates,1);
  assert.equal(Ai.prototype.resolvePrompt,beforeAi);
  assert.equal(FakeTrevenantDusknoirGX.prototype.reduceEffect,beforeSource);
  assert.equal(FakeStore.prototype.dispatch,beforeDispatch);
});

test('zero-sized and complete-population physical draws work',()=>{
  assert.deepEqual(sampleUniformPositions(0,0,'seed','p'),[]);
  const all=sampleUniformPositions(3,3,'seed','p');
  assert.deepEqual([...all].sort((a,b)=>a-b),[0,1,2]);
  assert.throws(()=>sampleUniformPositions(1,2,'seed','p'));
});

test('inspects no hidden card identities before sampling positions',()=>{
  const secretCards=Array.from({length:5},(_,i)=>
    Object.defineProperty({id:i},'name',{get(){
      throw Error('hidden identity must not be evaluated');
    }}));
  const opponent={id:2,hand:{cards:secretCards}};
  const prompt=new ChooseCardsPrompt(player,opponent);
  const ai=new Ai(),before=Ai.prototype.resolvePrompt;
  const options={committedSeed:'fixed',deps:{
    SimpleTacticsAi:Ai,ResolvePromptAction
  }};
  const result=withUniformNightWatchOpponentSelection(
    ()=>ai.resolvePrompt(player,{turn:1,players:[player,opponent]},prompt),
    options);
  assert.ok(result.result instanceof ResolvePromptAction);
  assert.equal(result.result.result.length,2);
  assert.equal(result.audit.structuralCandidates,1);
  assert.equal(result.audit.selectedCount,2);
  assert.equal(Ai.prototype.resolvePrompt,before);
});

test('unrelated own-deck prompt passes unchanged',()=>{
  const prompt=new ChooseCardsPrompt(player,other);
  prompt.cards=player.deck??{cards:[]};
  const ai=new Ai(),before=Ai.prototype.resolvePrompt;
  const result=withUniformNightWatchOpponentSelection(
    ()=>ai.resolvePrompt(player,state,prompt),
    {committedSeed:'fixed',deps:{SimpleTacticsAi:Ai,ResolvePromptAction}});
  assert.equal(result.result.kind,'original');
  assert.equal(result.audit.structuralCandidates,0);
  assert.equal(Ai.prototype.resolvePrompt,before);
});

test('hook restores original method after real exception',()=>{
  const ai=new Ai(),before=Ai.prototype.resolvePrompt;
  let caught;
  try{
    withUniformNightWatchOpponentSelection(()=>{
      throw Error('native-error');
    },{committedSeed:'fixed',deps:{
      SimpleTacticsAi:Ai,ResolvePromptAction
    }});
  }catch(error){caught=error;}
  assert.match(caught.message,/native-error/);
  assert.equal(caught.agent12NightWatchRandomAudit.structuralCandidates,0);
  assert.equal(Ai.prototype.resolvePrompt,before);
});


class ShowCardsPrompt{constructor(){this.id=81;}}
class ShuffleDeckPrompt{constructor(){this.id=82;}}
class MovementStore{
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof AddPlayerAction)return this.state;
    if(!(action instanceof ResolvePromptAction))
      throw Error('Unsupported staged action');
    const prompt=this.state.prompts.find(p=>p.id===action.id);
    assert.ok(prompt,'Physical prompt must exist');
    this.state.prompts=this.state.prompts.filter(p=>p!==prompt);
    if(prompt instanceof ChooseCardsPrompt){
      const source=this.state.players.find(p=>p.id!==prompt.playerId);
      for(const card of action.result){
        const idx=source.hand.cards.indexOf(card);
        assert.ok(idx>=0);
        source.hand.cards.splice(idx,1);
        source.deck.cards.push(card);
      }
      this.state.prompts.push(new ShowCardsPrompt(),
        new ShuffleDeckPrompt());
    }
    return this.state;
  }
}

test('original Store-shaped Night Watch moves opaque selected objects and settles both followups',()=>{
  const actor={id:1};
  const concealed=[{name:'SECRET-ONE'},{name:'SECRET-TWO'},
    {name:'SECRET-THREE'},{name:'SECRET-FOUR'}];
  const opponent={id:2,hand:{cards:concealed.slice()},deck:{cards:[]}};
  const native={turn:21,players:[actor,opponent],prompts:[]};
  const store=new MovementStore(native);
  const ai=new Ai(),source=new FakeTrevenantDusknoirGX();
  const original=MovementStore.prototype.dispatch;
  const observed=withUniformNightWatchOpponentSelection(()=>{
    store.dispatch(new AddPlayerAction());
    source.reduceEffect(store,native,new AttackEffect(actor,source.attacks[0]));
    native.prompts[0].id=77;
    const choice=ai.resolvePrompt(actor,native,native.prompts[0]);
    store.dispatch(choice);
    store.dispatch(new ResolvePromptAction(81,null));
    store.dispatch(new ResolvePromptAction(82,[]));
    return {opponentHand:opponent.hand.cards.length,
      opponentDeck:opponent.deck.cards.length};
  },{committedSeed:'already-registered-independent-seed',
    requirePrintedOrigin:true,requireNativeRootState:true,
    captureNativeMovementEvidence:true,deps:{
      SimpleTacticsAi:Ai,ResolvePromptAction,
      TrevenantDusknoirGX:FakeTrevenantDusknoirGX,
      Store:MovementStore,AddPlayerAction
    }});
  assert.deepEqual(observed.result,{opponentHand:2,opponentDeck:2});
  assert.equal(observed.audit.nativeMovementDispatches,1);
  const e=observed.audit.nativeMovementEvents[0];
  assert.equal(e.nativePromptDispatched,true);
  assert.equal(e.handCountBefore,4);
  assert.equal(e.deckCountBefore,0);
  assert.equal(e.handCountAfter,2);
  assert.equal(e.deckCountAfter,2);
  assert.equal(e.selectedAllInHandBefore,true);
  assert.equal(e.selectedNowInDeck,2);
  assert.equal(e.selectedRemainingInHand,0);
  assert.equal(e.physicalHandDeckMovementConfirmed,true);
  assert.deepEqual(e.generatedFollowupPromptKinds,
    ['ShowCardsPrompt','ShuffleDeckPrompt']);
  assert.deepEqual(e.followupResolutions.map(x=>x.promptKind),
    ['ShowCardsPrompt','ShuffleDeckPrompt']);
  assert.ok(e.followupResolutions.every(x=>x.promptRemovedAfter));
  assert.equal(MovementStore.prototype.dispatch,original);
});

test('an accepted native prompt without physical movement records a negative',()=>{
  const actor={id:1},opponent={id:2,hand:{cards:[
    {name:'A'},{name:'B'},{name:'C'}
  ]},deck:{cards:[]}};
  const native={turn:23,players:[actor,opponent],prompts:[]};
  const store=new FakeStore(native);
  const observed=withUniformNightWatchOpponentSelection(()=>{
    store.dispatch(new AddPlayerAction());
    const source=new FakeTrevenantDusknoirGX();
    source.reduceEffect(store,native,new AttackEffect(actor,source.attacks[0]));
    return store.dispatch(new Ai().resolvePrompt(actor,native,native.prompts[0]));
  },{committedSeed:'fixed',
    requirePrintedOrigin:true,requireNativeRootState:true,
    captureNativeMovementEvidence:true,deps:{
      SimpleTacticsAi:Ai,ResolvePromptAction,
      TrevenantDusknoirGX:FakeTrevenantDusknoirGX,
      Store:FakeStore,AddPlayerAction
    }});
  assert.equal(observed.audit.nativeMovementDispatches,1);
  const e=observed.audit.nativeMovementEvents[0];
  assert.equal(e.physicalHandDeckMovementConfirmed,false);
  assert.equal(e.handCountBefore,e.handCountAfter);
  assert.equal(e.deckCountBefore,e.deckCountAfter);
  assert.equal(e.followupResolutions.length,0);
});
