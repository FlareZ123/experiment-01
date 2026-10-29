'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  actorToolPrintingCatalog,enumerateActorToolCandidates
}=require('../simulation/twinleaf/agent18-actor-tool-candidate-frontier.cjs');

class FakeTrainerCard{
  constructor(fullName,trainerType){
    this.fullName=fullName;
    this.trainerType=trainerType;
  }
}

const toolType=3;
const tools=actorToolPrintingCatalog([
  new FakeTrainerCard('Stealthy Hood UNB',toolType),
  new FakeTrainerCard('Muscle Band XY',toolType),
  new FakeTrainerCard('Boss Orders PAL',1),
  {fullName:'Psychic Energy MEE',trainerType:toolType}
],{TrainerCard:FakeTrainerCard,TrainerType:{TOOL:toolType}});

/** @param {string[]} hand @returns {object} */
function ownerRoot(hand){
  return {
    decisionKind:'owner-root',ownHand:hand,
    ownTurnResources:{toolPlayLocked:false},
    ownPublic:{
      publicTurnRestrictions:{toolPlayLocked:false},
      active:{tools:[]},
      bench:[{tools:['Existing Tool']},null,{tools:[]},null]
    }
  };
}

test('only public printed TrainerType.TOOL entries enter catalog',()=>{
  assert.deepStrictEqual([...tools].sort(),
    ['Muscle Band XY','Stealthy Hood UNB']);
});

test('a verified original hand Tool has actor-visible free recipients',()=>{
  const view=ownerRoot(['Stealthy Hood UNB','Muscle Band XY']);
  const unchanged=JSON.stringify(view);
  assert.deepStrictEqual(enumerateActorToolCandidates(view,tools),[
    {kind:'attach-tool-candidate',printing:'Stealthy Hood UNB',
      handIndex:0,slot:'active',index:0},
    {kind:'attach-tool-candidate',printing:'Stealthy Hood UNB',
      handIndex:0,slot:'bench',index:2},
    {kind:'attach-tool-candidate',printing:'Muscle Band XY',
      handIndex:1,slot:'active',index:0},
    {kind:'attach-tool-candidate',printing:'Muscle Band XY',
      handIndex:1,slot:'bench',index:2}
  ]);
  assert.equal(JSON.stringify(view),unchanged);
});

test('locked owner cannot play any Tool candidate',()=>{
  const view=ownerRoot(['Stealthy Hood UNB']);
  view.ownTurnResources.toolPlayLocked=true;
  assert.deepStrictEqual(enumerateActorToolCandidates(view,tools),[]);
  view.ownTurnResources.toolPlayLocked=false;
  view.ownPublic.publicTurnRestrictions.toolPlayLocked=true;
  assert.deepStrictEqual(enumerateActorToolCandidates(view,tools),[]);
});

test('occupied Tool recipients and empty Bench slots cannot receive candidates',()=>{
  const view=ownerRoot(['Muscle Band XY']);
  view.ownPublic.active.tools.push('Existing Active Tool');
  view.ownPublic.bench[2].tools.push('Existing Bench Tool');
  assert.deepStrictEqual(enumerateActorToolCandidates(view,tools),[]);
});

test('non-Tools do not create candidate and physical copies keep own hand index',()=>{
  const view=ownerRoot(['Psychic Energy MEE','Stealthy Hood UNB',
    'Boss Orders PAL','Stealthy Hood UNB']);
  const result=enumerateActorToolCandidates(view,tools);
  assert.deepStrictEqual(result.map(x=>x.handIndex),[1,1,3,3]);
  assert.ok(result.every(x=>x.printing==='Stealthy Hood UNB'));
});

test('only detached owner root observations accepted',()=>{
  const view=ownerRoot(['Stealthy Hood UNB']);
  view.decisionKind='owner-prompt';
  assert.throws(()=>enumerateActorToolCandidates(view,tools),
    {name:'AssertionError'});
});
