'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,actorChooseAttackInput,chooseActorCopiedAttack,
  withActorOnlyChooseAttack}=
  require('../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');

/** @param {object} [options] */
function view(options={}){
  const attacks=options.attacks??[
    {index:0,name:'Poltergeist',gxAttack:false,blocked:true},
    {index:1,name:'Horror House-GX',gxAttack:true,blocked:false}
  ];
  return Object.freeze({
    actor:Object.freeze({decisionKind:'owner-prompt',globalTurn:8,
      ownPublic:{publicTurnRestrictions:{gxUsed:options.gxUsed??false}}}),
    prompt:Object.freeze({kind:'ChooseAttackPrompt',id:51,
      allowCancel:options.allowCancel??false,
      offered:Object.freeze([{index:0,printing:'Gengar & Mimikyu-GX TEU',
        attacks:Object.freeze(attacks)}])})
  });
}

test('choose attacks from detached menu and honor blocked or spent GX',()=>{
  assert.deepEqual(chooseActorCopiedAttack(view()),
    {sourceIndex:0,attackIndex:1});
  assert.deepEqual(chooseActorCopiedAttack(view({
    attacks:[{index:0,name:'Horror House-GX',gxAttack:true,blocked:false},
      {index:1,name:'Poltergeist',gxAttack:false,blocked:false}],
    gxUsed:true})),{sourceIndex:0,attackIndex:1});
  assert.deepEqual(chooseActorCopiedAttack(view({
    gxUsed:true,allowCancel:true})),{sourceIndex:null,attackIndex:null});
  assert.throws(()=>chooseActorCopiedAttack(view({gxUsed:true})),
    /no permitted printed attack/);
});

test('choose attack menu preserves duplicate source printing indices and excludes poison',()=>{
  class ChooseAttackPrompt{}
  const sameName={name:'Timeless-GX',gxAttack:true};
  const other={name:'Timeless-GX',gxAttack:true};
  const prompt=new ChooseAttackPrompt();
  Object.assign(prompt,{id:73,playerId:202,result:undefined,
    cards:[{fullName:'Dialga-GX UPR',attacks:[sameName]},
      {fullName:'Dialga-GX UPR',attacks:[other]}],
    options:{blocked:[{index:0,attack:'Timeless-GX'}],allowCancel:false}});
  const state={players:[{id:101},{id:202}],
    prompts:[prompt],opponentSecret:['MUST_NOT_LEAK']};
  const detached=actorChooseAttackInput(state,1,()=>Object.freeze({
    decisionKind:'owner-prompt',globalTurn:5,
    ownPublic:{publicTurnRestrictions:{gxUsed:false}}
  }));
  assert.ok(Object.isFrozen(detached.prompt.offered));
  assert.ok(Object.isFrozen(detached.prompt.offered[0].attacks));
  assert.deepEqual(chooseActorCopiedAttack(detached),
    {sourceIndex:1,attackIndex:0});
  assert.equal(JSON.stringify(detached).includes('MUST_NOT_LEAK'),false);
  assert.equal(actorChooseAttackInput(state,0,()=>detached.actor),null);
});

test('native typed choice submits the identical donor Attack reference in real Store',()=>{
  class AddPlayerAction{}
  class ChooseAttackPrompt{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store{
    constructor(){this.seen=[];}
    dispatch(action){this.seen.push(action);return true;}
  }
  class SimpleTacticsAi{
    constructor(){this.client={id:202};}
    decodeNextAction(){throw Error('Hidden bot fallback not allowed');}
  }
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch=Store.prototype.dispatch;
  const first={name:'Poltergeist'},selected={name:'Poltergeist'};
  const prompt=new ChooseAttackPrompt();
  Object.assign(prompt,{id:91,playerId:202,result:undefined,
    cards:[{fullName:'Gengar & Mimikyu-GX TEU',attacks:[first]},
      {fullName:'Gengar & Mimikyu-GX TEU',attacks:[selected]}],
    options:{allowCancel:false,blocked:[{index:0,attack:'Poltergeist'}]}});
  const state={players:[{id:101},{id:202}],prompts:[prompt],turn:6};
  const validity=[];
  const run=withActorOnlyChooseAttack(()=>{
    const store=new Store();
    store.state=state;
    store.dispatch(new AddPlayerAction());
    assert.throws(()=>new SimpleTacticsAi().decodeNextAction({...state}),
      /Hidden bot fallback not allowed/);
    const action=new SimpleTacticsAi().decodeNextAction(state);
    assert.ok(action instanceof ResolvePromptAction);
    assert.strictEqual(action.result,selected);
    store.dispatch(action);
    return action.result;
  },{
    SimpleTacticsAi,Store,ResolvePromptAction,
    observe:(s,seat)=>actorChooseAttackInput(s,seat,()=>({
      decisionKind:'owner-prompt',globalTurn:6,
      ownPublic:{publicTurnRestrictions:{gxUsed:false}}
    })),
    validate:(s,a)=>{
      assert.strictEqual(s,state);
      validity.push(prompt.cards[1].attacks.includes(a.result));
    }
  });
  assert.strictEqual(run.result,selected);
  assert.deepEqual(validity,[true]);
  assert.equal(run.audit.version,VERSION);
  assert.equal(run.audit.nativeStores,1);
  assert.equal(run.audit.menus,1);
  assert.equal(run.audit.selected,1);
  assert.equal(run.audit.accepted,1);
  assert.equal(run.audit.rejected,0);
  assert.equal(run.audit.nonLiveSpeculativeFallbacks,1);
  assert.deepEqual(run.audit.selections[0],{
    seat:1,turn:6,sourceIndex:1,attackIndex:0,
    printing:'Gengar & Mimikyu-GX TEU',attack:'Poltergeist'
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,original);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
});

test('unsupported native prompt is delegated and never promoted',()=>{
  class AddPlayerAction{}
  class Store{dispatch(){return true;}}
  class ResolvePromptAction{}
  class SimpleTacticsAi{
    constructor(){this.client={id:101};}
    decodeNextAction(){return 'NATIVE_UNQUALIFIED_FALLBACK';}
  }
  const result=withActorOnlyChooseAttack(()=>{
    const store=new Store();
    const state={players:[{id:101},{id:202}],
      prompts:[{playerId:101,result:undefined}]};
    store.state=state;
    store.dispatch(new AddPlayerAction());
    return new SimpleTacticsAi().decodeNextAction(state);
  },{
    SimpleTacticsAi,Store,ResolvePromptAction,
    observe:()=>null,validate:()=>{}
  });
  assert.equal(result.result,'NATIVE_UNQUALIFIED_FALLBACK');
  assert.equal(result.audit.nativeFallbacks,1);
  assert.equal(result.audit.competitiveGameQualified,false);
});

test('native Store rejection propagates and both patches restore',()=>{
  class AddPlayerAction{}
  class ChooseAttackPrompt{}
  class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
  class Store{dispatch(action){
    if(action instanceof AddPlayerAction)return;
    throw Error('STORE_REJECTED');
  }}
  class SimpleTacticsAi{
    constructor(){this.client={id:101};}
    decodeNextAction(){throw Error('unsupported');}
  }
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const originalDispatch=Store.prototype.dispatch;
  assert.throws(()=>withActorOnlyChooseAttack(()=>{
    const store=new Store();store.dispatch(new AddPlayerAction());
    const pending=new ChooseAttackPrompt();
    Object.assign(pending,{id:51,playerId:101,result:undefined,
      cards:[{fullName:'Gengar & Mimikyu-GX TEU',attacks:[
        {name:'Poltergeist'},{name:'Horror House-GX'}]}]});
    const state={players:[{id:101},{id:202}],prompts:[pending],turn:8};
    store.state=state;
    const action=new SimpleTacticsAi().decodeNextAction(state);
    store.dispatch(action);
  },{
    SimpleTacticsAi,Store,ResolvePromptAction,
    observe:()=>view(),validate:()=>{}
  }),/STORE_REJECTED/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,original);
  assert.strictEqual(Store.prototype.dispatch,originalDispatch);
});

test('opt-in printed Poltergeist priority changes only eligible donor ordering',()=>{
  const prompt={
    kind:'ChooseAttackPrompt',id:89,allowCancel:false,
    offered:[
      {index:0,printing:'Tapu Lele-GX GRI',attacks:[
        {index:0,name:'Energy Drive',gxAttack:false,blocked:false}]},
      {index:1,printing:'Gengar & Mimikyu-GX TEU',attacks:[
        {index:0,name:'Poltergeist',gxAttack:false,blocked:false},
        {index:1,name:'Horror House-GX',gxAttack:true,blocked:false}]}
    ]
  };
  const input={actor:{decisionKind:'owner-prompt',
    ownPublic:{publicTurnRestrictions:{gxUsed:false}},
    opponentPublic:{handCount:8}},
    prompt};
  assert.deepEqual(chooseActorCopiedAttack(input),{sourceIndex:0,attackIndex:0});
  assert.deepEqual(chooseActorCopiedAttack(input,{preferGengarPoltergeist:true}),
    {sourceIndex:1,attackIndex:0});
  prompt.offered[1].attacks[0].blocked=true;
  assert.deepEqual(chooseActorCopiedAttack(input,{preferGengarPoltergeist:true}),
    {sourceIndex:0,attackIndex:0});
  prompt.offered[1].attacks[0].blocked=false;
  const changedHidden={...input,opponentHiddenHand:['SECRET_CARD']};
  assert.deepEqual(chooseActorCopiedAttack(changedHidden,
    {preferGengarPoltergeist:true}),{sourceIndex:1,attackIndex:0});
  input.actor.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.deepEqual(chooseActorCopiedAttack(input,{preferGengarPoltergeist:true}),
    {sourceIndex:1,attackIndex:0});
});
