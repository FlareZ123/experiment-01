'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorCopiedAttack,withActorOnlyChooseAttack}=
  require('../simulation/twinleaf/agent13-actor-only-choose-attack.cjs');

/** @param {string} [target] @param {boolean} [blocked] */
function input(target='Mimikyu PAL',blocked=false){
  return {actor:{decisionKind:'owner-prompt',globalTurn:9,
    ownPublic:{active:{printing:'Mew VMAX FST'},
      publicTurnRestrictions:{gxUsed:false}},
    opponentPublic:{active:{printing:target}}},
  prompt:{kind:'ChooseAttackPrompt',id:51,allowCancel:false,
    offered:[
      {index:0,printing:'Genesect V FST',attacks:[
        {index:0,name:'Techno Blast',damage:210,blocked:false}]},
      {index:1,printing:'Mew VMAX FST',attacks:[
        {index:0,name:'Cross Fusion Strike',blocked:false},
        {index:1,name:'Max Miracle',damage:130,blocked}]}
    ]}};
}

test('branch opt-in selects second Mew Max Miracle; frozen Gene option remains baseline',()=>{
  const offer=input();
  assert.deepEqual(chooseActorCopiedAttack(offer,
    {preferMewGenesectTechnoBlast:true}),{sourceIndex:0,attackIndex:0});
  assert.deepEqual(chooseActorCopiedAttack(offer,{
    preferMewGenesectTechnoBlast:true,
    preferMewMaxMiracleAgainstSafeguard:true
  }),{sourceIndex:1,attackIndex:1});
});

test('blocked or missing Max Miracle keeps the original Genesect choice',()=>{
  const opts={preferMewGenesectTechnoBlast:true,
    preferMewMaxMiracleAgainstSafeguard:true};
  assert.deepEqual(chooseActorCopiedAttack(input('Mimikyu PAL',true),opts),
    {sourceIndex:0,attackIndex:0});
  const noMirror=input();
  noMirror.prompt.offered.pop();
  assert.deepEqual(chooseActorCopiedAttack(noMirror,opts),
    {sourceIndex:0,attackIndex:0});
  assert.deepEqual(chooseActorCopiedAttack(input('Iron Thorns ex TWM'),opts),
    {sourceIndex:0,attackIndex:0});
});

test('opt-in detached choice survives native-style Attack reference dispatch on owner seat',()=>{
  class AddPlayerAction{}
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store{
    constructor(){this.seen=[];}
    dispatch(action){this.seen.push(action);return true;}
  }
  class SimpleTacticsAi{
    constructor(){this.client={id:202};}
    decodeNextAction(){throw Error('Unsupported fallback');}
  }
  class ChooseAttackPrompt{}
  const gene={name:'Techno Blast'},first={name:'Cross Fusion Strike'};
  const mirror={name:'Max Miracle'};
  const nativePrompt=new ChooseAttackPrompt();
  Object.assign(nativePrompt,{id:51,playerId:202,result:undefined,
    cards:[{fullName:'Genesect V FST',attacks:[gene]},
      {fullName:'Mew VMAX FST',attacks:[first,mirror]}],
    options:{allowCancel:false}});
  const state={players:[{id:101},{id:202}],
    activePlayer:1,prompts:[nativePrompt],
    opponentHiddenHand:['SECRET']};
  const result=withActorOnlyChooseAttack(()=>{
    const store=new Store();
    store.state=state;
    store.dispatch(new AddPlayerAction());
    const action=new SimpleTacticsAi().decodeNextAction(state);
    assert.strictEqual(action.result,mirror);
    store.dispatch(action);
    return action;
  },{SimpleTacticsAi,Store,ResolvePromptAction,
    observe:()=>input(),
    validate:()=>{},
    preferMewGenesectTechnoBlast:true,
    preferMewMaxMiracleAgainstSafeguard:true});
  assert.strictEqual(result.result.result,mirror);
  assert.equal(result.audit.accepted,1);
  assert.equal(result.audit.selected,1);
  assert.match(result.audit.version,/mew-maxmiracle-pal97/);
  assert.deepEqual(result.audit.selections.map(s=>[s.printing,s.attack]),
    [['Mew VMAX FST','Max Miracle']]);
});
