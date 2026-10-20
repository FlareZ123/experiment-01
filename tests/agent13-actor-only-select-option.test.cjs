'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,actorSelectOptionInput,chooseActorSelectOption,
  withActorOnlySelectOption}=
  require('../simulation/twinleaf/agent13-actor-only-select-option.cjs');

/** @param {object} [options] */
function sampleInput(options={}){
  const values=options.values??['Keep','Discard','Retreat'];
  const disabled=options.disabled??values.map(()=>false);
  return Object.freeze({
    actor:Object.freeze({decisionKind:'owner-prompt',globalTurn:5,
      actorSeat:1,ownHand:['Double Colorless Energy SUM']}),
    prompt:Object.freeze({
      kind:'SelectOptionPrompt',promptId:7,
      values:Object.freeze([...values]),disabled:Object.freeze([...disabled]),
      defaultValue:options.defaultValue??0,
      allowCancel:options.allowCancel??false
    })
  });
}

test('actor-only option selection respects enabled native default',()=>{
  assert.deepEqual(chooseActorSelectOption(sampleInput({
    defaultValue:2})),{kind:'resolve-select-option',optionIndex:2});
  assert.deepEqual(chooseActorSelectOption(sampleInput({
    disabled:[false,true,false],defaultValue:1
  })),{kind:'resolve-select-option',optionIndex:0});
});

test('mandatory all-disabled prompt fails closed; optional may cancel',()=>{
  assert.deepEqual(chooseActorSelectOption(sampleInput({
    values:['A','B'],disabled:[true,true],allowCancel:true
  })),{kind:'resolve-select-option',optionIndex:null});
  assert.throws(()=>chooseActorSelectOption(sampleInput({
    values:['A','B'],disabled:[true,true],allowCancel:false
  })),/no enabled response/);
});

test('detached input uses only owner prompt values, restrictions, and observation',()=>{
  class SelectOptionPrompt{}
  const p=new SelectOptionPrompt();
  Object.assign(p,{id:21,playerId:202,result:undefined,
    values:['draw','shuffle'],options:{defaultValue:1,allowCancel:false,
      disabled:[false,true]}});
  const state={players:[{id:101},{id:202}],prompts:[p],
    hiddenOpponentHand:['MUST_NOT_APPEAR'],turn:3};
  const actor=Object.freeze({decisionKind:'owner-prompt',globalTurn:3,
    ownHand:['Own Basic MEE']});
  const view=actorSelectOptionInput(state,1,()=>{
    return actor;
  });
  assert.deepEqual(view.prompt,{
    kind:'SelectOptionPrompt',promptId:21,values:['draw','shuffle'],
    disabled:[false,true],defaultValue:1,allowCancel:false
  });
  assert.strictEqual(view.actor,actor);
  assert.ok(Object.isFrozen(view.prompt.values));
  assert.ok(Object.isFrozen(view.prompt.disabled));
  assert.equal(JSON.stringify(view).includes('MUST_NOT_APPEAR'),false);
  assert.equal(actorSelectOptionInput(state,0,()=>actor),null);
});

test('both native seats dispatch real typed prompt option with validated legality',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store{
    constructor(){this.seen=[];}
    dispatch(action){this.seen.push(action);return 'accepted';}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('Hidden-State bot must not choose SelectOption');}
  }
  const priorBot=SimpleTacticsAi.prototype.decodeNextAction;
  const priorStore=Store.prototype.dispatch;
  const legality=[];
  const events=[];
  const output=withActorOnlySelectOption(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    for(const [seat,id] of [[0,101],[1,202]]){
      const bot=new SimpleTacticsAi(id);
      const state={players:[{id:101},{id:202}],activePlayer:seat,
        turn:5,prompts:[]};
      store.state=state;
      assert.throws(()=>bot.decodeNextAction({...state}),
        /Hidden-State bot must not choose SelectOption/);
      const a=bot.decodeNextAction(state);
      assert.ok(a instanceof ResolvePromptAction);
      assert.equal(a.result,2);
      assert.equal(store.dispatch(a),'accepted');
      events.push([seat,a.id,a.result]);
    }
    return store.seen.filter(a=>a instanceof ResolvePromptAction).length;
  },{
    SimpleTacticsAi,Store,ResolvePromptAction,
    observe:(_state,seat)=>sampleInput({
      defaultValue:2,values:['A','B','C']
    }),
    validate:(state,action,options)=>{
      assert.ok(state);
      legality.push({id:action.id,choice:action.result,...options});
    }
  });
  assert.equal(output.result,2);
  assert.equal(output.audit.version,VERSION);
  assert.equal(output.audit.eligiblePrompts,2);
  assert.equal(output.audit.selectedPrompts,2);
  assert.equal(output.audit.acceptedPromptActions,2);
  assert.equal(output.audit.actualStoreInstances,1);
  assert.equal(output.audit.rejectedPromptActions,0);
  assert.equal(output.audit.nonLiveSpeculativeFallbacks,2);
  assert.equal(output.audit.competitiveGameQualified,false);
  assert.deepEqual(events,[[0,7,2],[1,7,2]]);
  assert.deepEqual(legality,[
    {id:7,choice:2,enforceSelectOptionLegality:true},
    {id:7,choice:2,enforceSelectOptionLegality:true}
  ]);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,priorBot);
  assert.strictEqual(Store.prototype.dispatch,priorStore);
});

test('unsupported pending prompt delegates and remains unqualified',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{}
  class Store{dispatch(){return true;}}
  class SimpleTacticsAi{
    constructor(){this.client={id:101};}
    decodeNextAction(){return 'NATIVE_PROMPT_FALLBACK';}
  }
  const output=withActorOnlySelectOption(()=>{
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
  assert.equal(output.result,'NATIVE_PROMPT_FALLBACK');
  assert.equal(output.audit.unsupportedPromptDelegations,1);
  assert.equal(output.audit.acceptedPromptActions,0);
  assert.equal(output.audit.competitiveGameQualified,false);
});

test('rejected real Store actions restore both reversible prototypes',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
  class Store{dispatch(action){
    if(action instanceof AddPlayerAction)return true;
    throw Error('REAL_STORE_REJECTION');
  }}
  class SimpleTacticsAi{
    constructor(){this.client={id:202};}
    decodeNextAction(){throw Error('Unexpected fallback');}
  }
  const bot=SimpleTacticsAi.prototype.decodeNextAction;
  const dispatch=Store.prototype.dispatch;
  assert.throws(()=>withActorOnlySelectOption(()=>{
    const state={players:[{id:101},{id:202}],prompts:[],turn:6};
    const store=new Store();
    store.state=state;
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi().decodeNextAction(state);
    store.dispatch(action);
  },{
    SimpleTacticsAi,Store,ResolvePromptAction,
    observe:()=>sampleInput(),validate:()=>{}
  }),/REAL_STORE_REJECTION/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,bot);
  assert.strictEqual(Store.prototype.dispatch,dispatch);
});
