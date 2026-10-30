'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  SCHEMA,publicTargetBoard,beforeAcceptedTarget,afterAcceptedTarget,
  targetSidecar,firstPhysicalTargetDifference
}=require('../simulation/twinleaf/native-accepted-target-sidecar.cjs');

class PlayCardAction {
  constructor(handIndex,target){this.handIndex=handIndex;this.target=target;}
}
class RetreatAction {
  constructor(benchIndex){this.benchIndex=benchIndex;}
}
function slot(name=null){
  return {pokemon:name?{fullName:name}:null,energies:{cards:[]},tools:[],
    getPokemonCard(){return this.pokemon;}};
}
function player(pokemon){
  return {hand:{cards:[{fullName:'Darkness Energy SVE 7'}]},
    active:slot(pokemon),bench:[slot('Crobat V DAA 104'),slot()]};
}
function game(){
  return {phase:3,players:[
    player('Garbodor BKP 57'),player('Meloetta FST 124')
  ]};
}
const ACTIVE={player:2,slot:1,index:0};
const BENCH={player:2,slot:2,index:0};
function acceptedEnergy(to,recipient){
  const state=game();
  const choice=new PlayCardAction(0,to);
  const before=beforeAcceptedTarget(state,choice,0,49,7);
  const target=recipient==='active'?state.players[0].active:
    state.players[0].bench[0];
  target.energies.cards.push(state.players[0].hand.cards[0]);
  state.players[0].hand.cards.shift();
  return targetSidecar([afterAcceptedTarget(before,state)]);
}

test('equal old root labels lose genuine accepted Energy recipient difference',()=>{
  const oldA=[{actionOrdinal:49,turnBefore:7,playerSlot:0,
    action:'PlayCardAction',card:'Darkness Energy'}];
  const oldB=structuredClone(oldA);
  assert.deepEqual(oldA,oldB);
  const active=acceptedEnergy(ACTIVE,'active');
  const benched=acceptedEnergy(BENCH,'bench');
  assert.equal(active.schema,SCHEMA);
  assert.notEqual(active.sha256,benched.sha256);
  assert.equal(active.events[0].storeAccepted,true);
  assert.equal(benched.events[0].storeAccepted,true);
  assert.deepEqual(active.events[0].declared.target,ACTIVE);
  assert.deepEqual(benched.events[0].declared.target,BENCH);
  assert.deepEqual(active.events[0].publicBoardChanges.map(x=>x.position),
    ['active']);
  assert.deepEqual(benched.events[0].publicBoardChanges.map(x=>x.position),
    ['bench']);
  assert.deepEqual(firstPhysicalTargetDifference(active,benched),{
    status:'different',index:0,firstOrdinal:49,secondOrdinal:49
  });
});

test('identical physical accepted target and public effect have stable digest',()=>{
  const one=acceptedEnergy(BENCH,'bench');
  const two=acceptedEnergy({...BENCH},'bench');
  assert.equal(one.sha256,two.sha256);
  assert.deepEqual(firstPhysicalTargetDifference(one,two),{
    status:'same-observed-targets',observed:1,
    scope:'Only PlayCardAction and RetreatAction targets'
  });
});

test('retreat Bench recipient is retained without private card identities',()=>{
  const state=game();
  const before=beforeAcceptedTarget(state,new RetreatAction(0),0,64,9);
  const prior=state.players[0].active;
  state.players[0].active=state.players[0].bench[0];
  state.players[0].bench[0]=prior;
  const after=afterAcceptedTarget(before,state);
  assert.equal(after.declared.benchIndex,0);
  assert.equal(after.publicBoardChanges.length,2);
  assert.deepEqual(after.publicBoardChanges.map(x=>x.position),
    ['active','bench']);
});

test('absent coordinates or setup identities forbid physical identity claim',()=>{
  const state=game();
  const missing=beforeAcceptedTarget(state,
    new PlayCardAction(0,{player:2,slot:2}),0,17,5);
  const sidecar=targetSidecar([afterAcceptedTarget(missing,state)]);
  assert.equal(sidecar.targetUnobserved,1);
  assert.equal(firstPhysicalTargetDifference(sidecar,sidecar).status,
    'target-unobserved');
  state.phase=0;
  assert.equal(publicTargetBoard(state),null);
  const setup=beforeAcceptedTarget(state,new PlayCardAction(0,BENCH),0,1,0);
  const recorded=afterAcceptedTarget(setup,state);
  assert.equal(recorded.visibility,'target-unobserved');
});

test('capture never reads concealed opponent hand, deck or Prize identities',()=>{
  const state=game();
  for(const key of ['hand','deck','prizes']){
    Object.defineProperty(state.players[1],key,{get(){
      throw new Error('Illegal concealed read: '+key);
    }});
  }
  const before=beforeAcceptedTarget(state,new PlayCardAction(0,BENCH),0,2,2);
  assert.equal(before.declared.status,'captured');
  const after=afterAcceptedTarget(before,state);
  assert.equal(after.storeAccepted,true);
  assert.deepEqual(after.publicBoardChanges,[]);
});

test('unlinked native Store targets veto first physical root assertions',()=>{
  const one=acceptedEnergy(ACTIVE,'active');
  const two=acceptedEnergy(BENCH,'bench');
  one.rootOrdinalLinked=false;
  two.rootOrdinalLinked=true;
  assert.deepEqual(firstPhysicalTargetDifference(one,two),{
    status:'target-unobserved',reason:'unlinked-Store-root-ordinals'
  });
});

test('authenticated native game-root ordinals differ from raw Store dispatch counters',()=>{
  const control=acceptedEnergy(ACTIVE,'active');
  const treatment=acceptedEnergy(BENCH,'bench');
  control.rootOrdinalLinked=true;
  treatment.rootOrdinalLinked=true;
  control.events[0].actionOrdinal=52;
  treatment.events[0].actionOrdinal=52;
  control.events[0].rootActionOrdinal=49;
  treatment.events[0].rootActionOrdinal=49;
  assert.deepEqual(firstPhysicalTargetDifference(control,treatment),{
    status:'different',index:0,firstOrdinal:49,secondOrdinal:49
  });
  delete treatment.events[0].rootActionOrdinal;
  assert.deepEqual(firstPhysicalTargetDifference(control,treatment),{
    status:'target-unobserved',index:0,
    reason:'missing-authenticated-root-ordinal'
  });
  treatment.rootOrdinalLinked=false;
  assert.deepEqual(firstPhysicalTargetDifference(control,treatment),{
    status:'target-unobserved',reason:'unlinked-Store-root-ordinals'
  });
});

test('equal linked public root and target ignore different Store dispatch bookkeeping',()=>{
  const control=acceptedEnergy(BENCH,'bench');
  const extraPrompt=acceptedEnergy(BENCH,'bench');
  control.rootOrdinalLinked=true;
  extraPrompt.rootOrdinalLinked=true;
  control.events[0].rootActionOrdinal=49;
  extraPrompt.events[0].rootActionOrdinal=49;
  control.events[0].actionOrdinal=52;
  extraPrompt.events[0].actionOrdinal=59;
  assert.deepEqual(firstPhysicalTargetDifference(control,extraPrompt),{
    status:'same-observed-targets',observed:1,
    scope:'Only PlayCardAction and RetreatAction targets'
  });
  // A visible physical result still differs, even when selected card and
  // declared target geometry are identical. Do not hide board deltas.
  extraPrompt.events[0].publicBoardChanges[0].after.energies.push(
    'Basic Fighting Energy MEE');
  assert.deepEqual(firstPhysicalTargetDifference(control,extraPrompt),{
    status:'different',index:0,firstOrdinal:49,secondOrdinal:49
  });
});

test('zero target-bearing actions are unobserved even with authenticated roots',()=>{
  const empty=targetSidecar([]);
  assert.deepEqual(firstPhysicalTargetDifference(empty,empty),{
    status:'target-unobserved',reason:'no-target-bearing-root-events'
  });
  const authenticated={...empty,rootOrdinalLinked:true};
  assert.deepEqual(firstPhysicalTargetDifference(authenticated,authenticated),{
    status:'target-unobserved',reason:'no-target-bearing-root-events'
  });
});

test('physical matching ignores transient owner hand positions but not printing',()=>{
  const left=acceptedEnergy(BENCH,'bench');
  const right=targetSidecar(left.events.map(row=>({
    ...row,declared:{...row.declared,handIndex:3}
  })));
  assert.notEqual(left.sha256,right.sha256,
    'The immutable forensic sidecar retains the distinct raw hand positions');
  assert.deepEqual(firstPhysicalTargetDifference(left,right),{
    status:'same-observed-targets',observed:1,
    scope:'Only PlayCardAction and RetreatAction targets'
  });
  right.events[0].declared.ownerHandPrinting='Other Energy SVE 99';
  assert.deepEqual(firstPhysicalTargetDifference(left,right),{
    status:'different',index:0,firstOrdinal:49,secondOrdinal:49
  });
});
