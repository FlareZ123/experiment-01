'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {collectAndChooseOwnerRoot,structurallySupported}=
  require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');
const {buildActorCardCatalog}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

function ownerRoot(){
  return {
    decisionKind:'owner-root',globalTurn:2,
    ownHand:['Stealthy Hood UNB','Muscle Band XY','Psychic Energy SVE'],
    ownTurnResources:{toolPlayLocked:false},
    ownPublic:{active:{tools:[]},
      bench:[null,{printing:'Benched Pokémon',tools:[]},null],
      publicTurnRestrictions:{toolPlayLocked:false}}
  };
}
const toolCatalog={toolPrintings:
  new Set(['Stealthy Hood UNB','Muscle Band XY'])};

test('shared same-root collector keeps distinct physical Tool and recipients observe-only',()=>{
  const original=ownerRoot();
  const saved=JSON.stringify(original);
  const baseline={kind:'pass'};
  const result=collectAndChooseOwnerRoot(original,toolCatalog,baseline,
    {sameRootProbeAll:true});
  const tools=result.receipt.offers.filter(o=>o.source==='owner-tool');
  assert.equal(tools.length,4);
  assert.deepStrictEqual(tools.map(o=>[o.printing,o.handIndex,o.slot,o.index]),[
    ['Stealthy Hood UNB',0,'active',0],
    ['Stealthy Hood UNB',0,'bench',1],
    ['Muscle Band XY',1,'active',0],
    ['Muscle Band XY',1,'bench',1]
  ]);
  assert.ok(tools.every(o=>o.nativeDispatchImplemented===false&&
    o.nativePlayability==='unverified'&&o.score===-1000));
  assert.deepStrictEqual(result.intent,baseline);
  assert.equal(result.receipt.changed,false);
  assert.equal(JSON.stringify(original),saved);
});
test('Tool lock and occupied recipient are structurally excluded',()=>{
  const view=ownerRoot();
  const candidate={kind:'attach-tool-candidate',handIndex:0,
    printing:'Stealthy Hood UNB',slot:'active',index:0};
  assert.equal(structurallySupported(view,candidate),true);
  view.ownPublic.active.tools.push('Other Tool');
  assert.equal(structurallySupported(view,candidate),false);
  view.ownPublic.active.tools.length=0;
  view.ownTurnResources.toolPlayLocked=true;
  assert.equal(structurallySupported(view,candidate),false);
  view.ownTurnResources.toolPlayLocked=false;
  view.ownPublic.publicTurnRestrictions.toolPlayLocked=true;
  assert.equal(structurallySupported(view,candidate),false);
  view.ownPublic.publicTurnRestrictions.toolPlayLocked=false;
  assert.equal(structurallySupported(view,{...candidate,handIndex:2}),false);
  assert.equal(structurallySupported(view,{...candidate,slot:'bench',index:0}),false);
});
test('Tool proposer can never become active while all-probes is selected',()=>{
  const view=ownerRoot(),baseline={kind:'pass'};
  const result=collectAndChooseOwnerRoot(view,toolCatalog,baseline,
    {sameRootProbeAll:true});
  assert.equal(result.receipt.selectedSource,'first-return');
  assert.throws(()=>collectAndChooseOwnerRoot(view,toolCatalog,baseline,
    {sameRootProbeAll:true,sameRootChoiceApply:true}),/observation-only/);
  const active=collectAndChooseOwnerRoot(view,toolCatalog,baseline,
    {sameRootChoiceApply:true});
  assert.equal(active.receipt.offers.some(o=>o.source==='owner-tool'),false);
});
test('pinned public printed TrainerType catalog adds Tool class without requiring it in mocks',()=>{
  class PokemonCard{}
  class EnergyCard{}
  class TrainerCard{
    constructor(fullName,trainerType){
      this.fullName=fullName;this.trainerType=trainerType;
    }
  }
  const types={PokemonCard,EnergyCard,TrainerCard,
    TrainerType:{TOOL:3,ITEM:1},
    Stage:{BASIC:2},EnergyType:{BASIC:0},PowerType:{ABILITY:2},
    CardType:{COLORLESS:9},SpecialCondition:{ASLEEP:2,PARALYZED:0}};
  const all=[new TrainerCard('Stealthy Hood UNB',3),
    new TrainerCard('Boss Orders PAL',1)];
  const catalog=buildActorCardCatalog(all,types);
  assert.deepStrictEqual([...catalog.toolPrintings],['Stealthy Hood UNB']);
  const without=buildActorCardCatalog(all,{
    ...types,TrainerCard:undefined,TrainerType:undefined});
  assert.deepStrictEqual([...without.toolPrintings],[]);
});
