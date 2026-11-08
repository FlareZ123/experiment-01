'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {underworldDoorAction}=
  require('../../simulation/twinleaf/underworld-door-action.cjs');
const v2=require('../../simulation/twinleaf/2026-11/agent4-thorns-lock-neutral-stadium-tool-v2.cjs');
const v3=require('../../simulation/twinleaf/2026-11/agent4-thorns-lock-field-neutral-v3.cjs');
const intent={kind:'use-underworld-door',
  sourcePrinting:'Shadow Rider Calyrex VMAX CRE',
  position:'bench',benchIndex:0};

const additionalStadiums=[
  'Sky Field ROS','Parallel City BKT','Artazon PAL',
  'PokéStop PGO','Shopping Center EVS','Risky Ruins MEG',
  'Thunder Mountain Prism Star LOT','Wondrous Labyrinth Prism Star TEU',
  
];
test('nine additional original-field Stadiums preserve native Thorns lock',()=>{
  for(const stadium of additionalStadiums){
    let observed=null;
    const native=underworldDoorAction({
      hood:false,jammer:false,active:false,stadium,actingSeat:true,
      observeOwnerBeforePower:view=>{observed=view;}
    });
    assert.ok(observed,stadium);
    assert.equal(native.allowed,false,stadium);
    assert.equal(native.powerListed,false,stadium);
    assert.deepEqual(observed.opponentPublic.stadium,[stadium],stadium);
    assert.equal(observed.opponentPublic.active.printing,
      'Iron Thorns ex TWM');
    assert.equal(v2.classifyNeutralThornsVeto(observed,intent).veto,
      false,stadium);
    assert.equal(v3.classifyNeutralThornsVeto(observed,intent).veto,
      true,stadium);
  }
});
test('retreat-only U-Turn Board has an actual blocked Underworld native state',()=>{
  let observed=null;
  const native=underworldDoorAction({
    hood:false,jammer:false,active:false,sourceTool:'U-Turn Board UNM',
    actingSeat:true,observeOwnerBeforePower:view=>{observed=view;}
  });
  assert.equal(native.allowed,false);
  assert.equal(native.powerListed,false);
  assert.deepEqual(observed.ownPublic.bench[0].tools,['U-Turn Board UNM']);
  assert.equal(v2.classifyNeutralThornsVeto(observed,intent).veto,false);
  assert.equal(v3.classifyNeutralThornsVeto(observed,intent).veto,true);
});
test('real native Hood with added Sky Field is still playable and v3 abstains',()=>{
  let observed=null;
  const native=underworldDoorAction({
    hood:true,jammer:false,active:false,stadium:'Sky Field ROS',
    actingSeat:true,observeOwnerBeforePower:view=>{observed=view;}
  });
  assert.equal(native.allowed,true);
  assert.equal(native.attached,1);
  assert.equal(native.drawn,2);
  assert.deepEqual(observed.ownPublic.bench[0].tools,['Stealthy Hood UNB']);
  assert.equal(v3.classifyNeutralThornsVeto(observed,intent).veto,false);
});
