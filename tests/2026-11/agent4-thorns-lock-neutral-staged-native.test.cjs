'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {underworldDoorAction}=
  require('../../simulation/twinleaf/underworld-door-action.cjs');
const {classifyVisibleThornsVeto}=
  require('../../simulation/twinleaf/agent4-underworld-visible-thorns-veto.cjs');
const {classifyNeutralThornsVeto}=
  require('../../simulation/twinleaf/2026-11/agent4-thorns-lock-neutral-stadium-tool-v2.cjs');
const intent={kind:'use-underworld-door',
  sourcePrinting:'Shadow Rider Calyrex VMAX CRE',
  position:'bench',benchIndex:0};

/**
 * Public owner observation describing precisely the visible staged
 * native board that underworldDoorAction builds.
 * @param {{stadium?:string,sourceTool?:string,hood?:boolean}} scenario
 */
function publicActorView(scenario){
  const sourceTool=scenario.hood?'Stealthy Hood UNB':
    scenario.sourceTool??null;
  return {
    decisionKind:'owner-root',actorSeat:1,globalTurn:2,
    ownPublic:{active:{printing:'Shadow Rider Calyrex V CRE'},
      bench:[{printing:'Shadow Rider Calyrex VMAX CRE',
        abilities:['Underworld Door'],tools:sourceTool?[sourceTool]:[]}],
      stadium:[]},
    opponentPublic:{active:{printing:'Iron Thorns ex TWM',
      abilities:['Initialization']},
      stadium:scenario.stadium?[scenario.stadium]:[]}
  };
}

test('compiled pinned native Store agrees that Float Stone leaves Underworld blocked',()=>{
  const scenario={hood:false,jammer:false,active:false,
    sourceTool:'Float Stone BKT'};
  const actual=underworldDoorAction(scenario);
  assert.equal(actual.allowed,false);
  assert.equal(actual.powerListed,false);
  const view=publicActorView(scenario);
  assert.equal(classifyVisibleThornsVeto(view,intent).veto,false);
  assert.equal(classifyNeutralThornsVeto(view,intent).veto,true);
});
test('pinned native Tropical Beach and Temple do not restore Underworld',()=>{
  for(const stadium of ['Tropical Beach BWP','Temple of Sinnoh ASR']){
    const scenario={hood:false,jammer:false,active:false,stadium};
    const actual=underworldDoorAction(scenario);
    assert.equal(actual.allowed,false,stadium);
    assert.equal(actual.powerListed,false,stadium);
    const view=publicActorView(scenario);
    // Original classifier conservatively abstained on any Stadium.
    assert.equal(classifyVisibleThornsVeto(view,intent).veto,false,stadium);
    // The pinned actor observation uses the exact native card.fullName
    // spelling, which contains card name and set, without collector number.
    assert.equal(classifyNeutralThornsVeto(view,intent).veto,true,stadium);
  }
});
test('pinned native same-board combined neutral Tool and Stadium still blocked',()=>{
  const scenario={hood:false,jammer:false,active:false,
    sourceTool:'Float Stone BKT',stadium:'Tropical Beach BWP'};
  const actual=underworldDoorAction(scenario);
  assert.equal(actual.allowed,false);
  assert.equal(actual.powerListed,false);
  const view=publicActorView(scenario);
  assert.deepEqual(view.opponentPublic.stadium,['Tropical Beach BWP']);
  assert.deepEqual(view.ownPublic.bench[0].tools,['Float Stone BKT']);
  assert.equal(classifyNeutralThornsVeto(view,intent).veto,true);
});
test('Hood protects Underworld, and v2 must abstain',()=>{
  const scenario={hood:true,jammer:false,active:false};
  const actual=underworldDoorAction(scenario);
  assert.equal(actual.allowed,true);
  assert.equal(actual.attached,1);
  assert.equal(actual.drawn,2);
  assert.equal(classifyNeutralThornsVeto(publicActorView(scenario),intent).veto,
    false);
});
test('unidentified Tool labels conservatively abstain even where Store blocks',()=>{
  const scenario={hood:false,jammer:false,active:false,
    sourceTool:'Float Stone BKT'};
  const actual=underworldDoorAction(scenario);
  assert.equal(actual.allowed,false);
  const owner=publicActorView(scenario);
  owner.ownPublic.bench[0].tools=['Float Stone unknown'];
  assert.equal(classifyNeutralThornsVeto(owner,intent).veto,false);
});

test('actual Store owner-only detached view reaches the v2 joint case',()=>{
  for(const scenario of [
    {hood:false,jammer:false,active:false,sourceTool:'Float Stone BKT'},
    {hood:false,jammer:false,active:false,stadium:'Tropical Beach BWP'},
    {hood:false,jammer:false,active:false,
      sourceTool:'Float Stone BKT',stadium:'Tropical Beach BWP'}
  ]){
    let nativeView=null;
    const native=underworldDoorAction({...scenario,actingSeat:true,
      observeOwnerBeforePower:view=>{nativeView=view;}});
    assert.equal(native.allowed,false);
    assert.ok(nativeView,'missing actual actor observation');
    assert.equal(nativeView.decisionKind,'owner-root');
    assert.equal(nativeView.actorSeat,1);
    assert.equal(nativeView.opponentPublic.active.printing,'Iron Thorns ex TWM');
    assert.equal(nativeView.ownPublic.bench[0].printing,
      'Shadow Rider Calyrex VMAX CRE');
    assert.deepEqual(nativeView.ownPublic.bench[0].tools,
      scenario.sourceTool?[scenario.sourceTool]:[]);
    assert.deepEqual(nativeView.opponentPublic.stadium,
      scenario.stadium?[scenario.stadium]:[]);
    assert.equal(classifyVisibleThornsVeto(nativeView,intent).veto,false);
    assert.equal(classifyNeutralThornsVeto(nativeView,intent).veto,true);
    assert.equal(nativeView.opponentPublic.handCount,0);
    assert.equal(Object.isFrozen(nativeView),true);
  }
});
test('actual owner-only Stealthy Hood observation avoids false veto',()=>{
  let nativeView=null;
  const result=underworldDoorAction({
    hood:true,jammer:false,active:false,actingSeat:true,
    observeOwnerBeforePower:view=>{nativeView=view;}
  });
  assert.equal(result.allowed,true);
  assert.equal(result.attached,1);
  assert.deepEqual(nativeView.ownPublic.bench[0].tools,
    ['Stealthy Hood UNB']);
  assert.equal(classifyNeutralThornsVeto(nativeView,intent).veto,false);
});

test('every remaining whitelisted set-qualified Stadium passes native lock check',()=>{
  for(const stadium of ['Dimension Valley PHF','Chaotic Swell CEC']){
    let view=null;
    const actual=underworldDoorAction({
      hood:false,jammer:false,active:false,actingSeat:true,stadium,
      observeOwnerBeforePower:v=>{view=v;}
    });
    assert.equal(actual.allowed,false,stadium);
    assert.equal(actual.powerListed,false,stadium);
    assert.deepEqual(view.opponentPublic.stadium,[stadium],stadium);
    assert.equal(classifyVisibleThornsVeto(view,intent).veto,false,stadium);
    assert.equal(classifyNeutralThornsVeto(view,intent).veto,true,stadium);
  }
});
test('every remaining whitelisted set-qualified retreat Tool passes native lock check',()=>{
  for(const sourceTool of ['Float Stone PLF','Air Balloon SSH']){
    let view=null;
    const actual=underworldDoorAction({
      hood:false,jammer:false,active:false,actingSeat:true,sourceTool,
      observeOwnerBeforePower:v=>{view=v;}
    });
    assert.equal(actual.allowed,false,sourceTool);
    assert.equal(actual.powerListed,false,sourceTool);
    assert.deepEqual(view.ownPublic.bench[0].tools,[sourceTool],sourceTool);
    assert.equal(classifyVisibleThornsVeto(view,intent).veto,false,sourceTool);
    assert.equal(classifyNeutralThornsVeto(view,intent).veto,true,sourceTool);
  }
});
