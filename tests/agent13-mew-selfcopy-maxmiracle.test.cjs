'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorCopiedAttack,withActorOnlyChooseAttack}=
  require('../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');

/** Deterministic actor-owned menu, with no opponent private fields. */
function input(overrides={}){
  const offered=overrides.offered??[
    {index:0,printing:'Mew VMAX FST',attacks:[
      {index:0,name:'Cross Fusion Strike',blocked:false,gxAttack:false},
      {index:1,name:'Max Miracle',blocked:false,gxAttack:false,damage:130}]},
    {index:1,printing:'Genesect V FST',attacks:[
      {index:0,name:'Techno Blast',blocked:false,gxAttack:false,damage:210}]}
  ];
  return {actor:{decisionKind:'owner-prompt',globalTurn:11,
    ownPublic:{active:{printing:overrides.active??'Mew VMAX FST'},
      publicTurnRestrictions:{gxUsed:false}},
    opponentPublic:{handCount:7}},
    prompt:{id:27,kind:'ChooseAttackPrompt',allowCancel:false,offered}};
}

test('default policy preserved; opt-in prioritizes same-donor Max Miracle',()=>{
  const menu=input();
  assert.deepEqual(chooseActorCopiedAttack(menu),
    {sourceIndex:0,attackIndex:0});
  assert.deepEqual(chooseActorCopiedAttack(menu,
    {preferMewMaxMiracleOverSelfCopy:true}),
    {sourceIndex:0,attackIndex:1});
  assert.deepEqual(chooseActorCopiedAttack(menu,
    {preferMewMaxMiracleOverSelfCopy:true,
      preferMewGenesectTechnoBlast:true}),
    {sourceIndex:1,attackIndex:0});
});

test('blocked Max Miracle keeps the prior eligible selected attack',()=>{
  const menu=input();
  menu.prompt.offered[0].attacks[1].blocked=true;
  assert.deepEqual(chooseActorCopiedAttack(menu,
    {preferMewMaxMiracleOverSelfCopy:true}),
    {sourceIndex:0,attackIndex:0});
  menu.prompt.offered[0].attacks[1].blocked=false;
  menu.prompt.offered[0].attacks[1].gxAttack=true;
  menu.actor.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.deepEqual(chooseActorCopiedAttack(menu,
    {preferMewMaxMiracleOverSelfCopy:true}),
    {sourceIndex:0,attackIndex:0});
});

test('uses exact donor index; no switch to a different duplicate Mew printing',()=>{
  const menu=input({offered:[
    {index:0,printing:'Mew VMAX FST',attacks:[
      {index:0,name:'Cross Fusion Strike',blocked:false,gxAttack:false}]},
    {index:1,printing:'Mew VMAX FST',attacks:[
      {index:0,name:'Max Miracle',blocked:false,gxAttack:false,damage:130}]}
  ]});
  assert.deepEqual(chooseActorCopiedAttack(menu,
    {preferMewMaxMiracleOverSelfCopy:true}),
    {sourceIndex:0,attackIndex:0});
});

test('does not alter other active Pokemon or already selected non-selfcopy line',()=>{
  const other=input({active:'Mewtwo & Mew-GX UNM'});
  assert.deepEqual(chooseActorCopiedAttack(other,
    {preferMewMaxMiracleOverSelfCopy:true}),
    {sourceIndex:0,attackIndex:0});
  const first=input({offered:[
    {index:0,printing:'Genesect V FST',attacks:[
      {index:0,name:'Techno Blast',blocked:false,gxAttack:false}]},
    {index:1,printing:'Mew VMAX FST',attacks:[
      {index:0,name:'Cross Fusion Strike',blocked:false,gxAttack:false},
      {index:1,name:'Max Miracle',blocked:false,gxAttack:false,damage:130}]}
  ]});
  assert.deepEqual(chooseActorCopiedAttack(first,
    {preferMewMaxMiracleOverSelfCopy:true}),
    {sourceIndex:0,attackIndex:0});
});

test('opponent hidden identity does not affect opt-in choice',()=>{
  const clean=input();
  const dirty=structuredClone(clean);
  dirty.opponentSecret=['TOP_SECRET'];
  dirty.actor.opponentPublic.handCount=900;
  assert.deepEqual(chooseActorCopiedAttack(clean,
    {preferMewMaxMiracleOverSelfCopy:true}),
    chooseActorCopiedAttack(dirty,
    {preferMewMaxMiracleOverSelfCopy:true}));
});

test('typed mock Store accepts selected original Attack reference and restores patches',()=>{
  class AddPlayerAction{}
  class ChooseAttackPrompt{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store{dispatch(action){return action;}}
  class SimpleTacticsAi{
    constructor(){this.client={id:10};}
    decodeNextAction(){throw Error('unexpected fallback');}
  }
  const first={name:'Cross Fusion Strike',damage:null};
  const second={name:'Max Miracle',damage:130};
  const prompt=new ChooseAttackPrompt();
  Object.assign(prompt,{id:17,result:undefined,playerId:10,
    cards:[{fullName:'Mew VMAX FST',attacks:[first,second]}],
    options:{allowCancel:false,blocked:[]}});
  const state={players:[{id:10},{id:20}],prompts:[prompt]};
  const oldDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  const {audit,result}=withActorOnlyChooseAttack(()=>{
    const store=new Store();
    store.state=state;
    store.dispatch(new AddPlayerAction());
    const selection=new SimpleTacticsAi().decodeNextAction(state);
    assert.ok(selection instanceof ResolvePromptAction);
    assert.strictEqual(selection.result,second);
    store.dispatch(selection);
    return selection.result;
  },{
    SimpleTacticsAi,Store,ResolvePromptAction,
    preferMewMaxMiracleOverSelfCopy:true,
    observe:()=>input({offered:[
      {index:0,printing:'Mew VMAX FST',attacks:[
        {index:0,name:'Cross Fusion Strike',blocked:false,gxAttack:false},
        {index:1,name:'Max Miracle',blocked:false,gxAttack:false,damage:130}]}
    ]}),
    validate:(s,action)=>{
      assert.strictEqual(s,state);
      assert.strictEqual(action.result,second);
    }
  });
  assert.strictEqual(result,second);
  assert.equal(audit.menus,1);
  assert.equal(audit.accepted,1);
  assert.equal(audit.rejected,0);
  assert.equal(audit.preferMewMaxMiracleOverSelfCopy,true);
  assert.match(audit.version,/selfcopy-maxmiracle-v1/);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldDecode);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
});

test('canonical bilateral composition forwards only explicitly selected owner choice',()=>{
  const {withCanonicalActorOnlyPolicy}=
    require('../simulation/evaluation/agent7-canonical-actor-composition.cjs');
  const observed=[];
  const wrap=name=>(run,options)=>{
    if(name==='attack')observed.push(options??null);
    return {result:run(),audit:{version:name}};
  };
  const adapters={
    root:wrap('root'),fog:wrap('fog'),select:wrap('select'),
    option:wrap('option'),attack:wrap('attack')
  };
  assert.equal(withCanonicalActorOnlyPolicy(()=>9,adapters).result,9);
  assert.equal(withCanonicalActorOnlyPolicy(()=>11,adapters,
    {preferMewMaxMiracleOverSelfCopy:true}).result,11);
  assert.equal(withCanonicalActorOnlyPolicy(()=>13,adapters,
    {preferMewGenesectTechnoBlast:true,
      preferMewMaxMiracleOverSelfCopy:true}).result,13);
  assert.deepEqual(observed,[
    null,
    {preferMewMaxMiracleOverSelfCopy:true},
    {preferMewGenesectTechnoBlast:true,
      preferMewMaxMiracleOverSelfCopy:true}
  ]);
});
