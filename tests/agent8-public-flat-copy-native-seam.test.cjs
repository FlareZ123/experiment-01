'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {withActorOnlyChooseAttack}=
  require('../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');

test('opt-in flat public copy chooses real offered Dragapult Attack object in native seam',()=>{
  class AddPlayerAction{}
  class ChooseAttackPrompt{}
  class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
  class Store{
    constructor(){this.actions=[];}
    dispatch(action){this.actions.push(action);return true;}
  }
  class SimpleTacticsAi{
    constructor(){this.client={id:202};}
    decodeNextAction(){throw Error('Unqualified generic fallback');}
  }
  const baseDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const baseDispatch=Store.prototype.dispatch;
  const covert={name:'Covert Flight',damage:70,damageCalculation:null};
  const phantom={name:'Phantom Dive',damage:200,damageCalculation:null};
  const prompt=new ChooseAttackPrompt();
  Object.assign(prompt,{
    id:77,playerId:202,result:undefined,
    cards:[
      {fullName:'Noivern ex PAL',attacks:[covert]},
      {fullName:'Dragapult ex TWM',attacks:[phantom]}
    ],
    options:{allowCancel:false,blocked:[]}
  });
  const state={players:[{id:101},{id:202}],
    turn:16,prompts:[prompt]};
  const observation=()=>({
    decisionKind:'owner-prompt',globalTurn:16,actorSeat:1,
    ownPublic:{publicTurnRestrictions:{gxUsed:false,cannotUseGXAttacks:false}},
    opponentPublic:{active:{hp:320,damage:0}}
  });
  const deps={
    SimpleTacticsAi,Store,ResolvePromptAction,
    preferPublicFlatCopy:true,
    observe:(s,seat)=>require('../simulation/twinleaf/agent13-actor-only-choose-attack.cjs')
      .actorChooseAttackInput(s,seat,observation),
    validate:(s,action)=>{
      assert.strictEqual(s,state);
      assert.strictEqual(action.result,phantom);
      assert.equal(action.id,77);
    }
  };
  const result=withActorOnlyChooseAttack(()=>{
    const store=new Store();
    store.state=state;
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi().decodeNextAction(state);
    assert.strictEqual(action.result,phantom);
    store.dispatch(action);
    return store.actions;
  },deps);
  assert.equal(result.audit.selected,1);
  assert.equal(result.audit.accepted,1);
  assert.equal(result.audit.rejected,0);
  assert.equal(result.audit.selections[0].printing,'Dragapult ex TWM');
  assert.equal(result.audit.selections[0].attack,'Phantom Dive');
  assert.strictEqual(result.result[1].result,phantom);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,baseDecode);
  assert.strictEqual(Store.prototype.dispatch,baseDispatch);
});

test('default-off chooser preserves first legal copied attack in the same owner menu',()=>{
  const {chooseActorCopiedAttack}=require(
    '../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');
  const input={actor:{
    decisionKind:'owner-prompt',
    ownPublic:{publicTurnRestrictions:{gxUsed:false}},
    opponentPublic:{active:{hp:320,damage:0}}
  },prompt:{
    kind:'ChooseAttackPrompt',allowCancel:false,offered:[
      {index:0,printing:'Noivern ex PAL',
        attacks:[{index:0,name:'Covert Flight',damage:70,blocked:false}]},
      {index:1,printing:'Dragapult ex TWM',
        attacks:[{index:0,name:'Phantom Dive',damage:200,blocked:false}]}
    ]
  }};
  assert.deepEqual(chooseActorCopiedAttack(input),
    {sourceIndex:0,attackIndex:0});
  assert.deepEqual(chooseActorCopiedAttack(input,
    {preferFasterNominalCopy:true}),{sourceIndex:1,attackIndex:0});
});
