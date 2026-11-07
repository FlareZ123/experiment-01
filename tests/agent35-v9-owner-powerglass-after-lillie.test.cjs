'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choosePowerglassAfterSupporter}=
  require('../simulation/twinleaf/agent35-v9-owner-powerglass-after-lillie.cjs');
function view(){return {
  decisionKind:'owner-root',actorSeat:1,globalTurn:14,
  ownHand:['Powerglass SFA','Escape Rope BST'],
  ownTurnResources:{supporterPlayedTurn:1,toolPlayLocked:false},
  ownPublic:{
    active:{printing:'Unown AOR',hp:60,damage:0,energies:[],tools:[],
      attacks:[{name:'Hidden Power',cost:[9],damage:10,gxAttack:false}]},
    publicTurnRestrictions:{toolPlayLocked:false},
    discard:['Unown AOR','Psychic Energy MEE','Psychic Energy MEE']
  },
  opponentPublic:{active:{printing:'Trubbish FST',hp:70,damage:60}}
};}
test('owner-public route selects genuinely held Powerglass',()=>{
  assert.deepEqual(choosePowerglassAfterSupporter(view(),9),{
    handIndex:0,printing:'Powerglass SFA',sourceAttack:'Hidden Power'});
});
test('preserve earlier Lillie availability when Supporter unused',()=>{
  const v=view();v.ownTurnResources.supporterPlayedTurn=0;
  assert.equal(choosePowerglassAfterSupporter(v,9),null);
});
test('reject absent Basic Energy in public discard and already funded attacker',()=>{
  const a=view();a.ownPublic.discard=['Telepathic Psychic Energy PAL'];
  assert.equal(choosePowerglassAfterSupporter(a,9),null);
  const b=view();b.ownPublic.active.energies=['Psychic Energy MEE'];
  assert.equal(choosePowerglassAfterSupporter(b,9),null);
});
test('reject Tool lock, occupied Tool, insufficient target damage and prompts',()=>{
  const a=view();a.ownTurnResources.toolPlayLocked=true;
  assert.equal(choosePowerglassAfterSupporter(a,9),null);
  const b=view();b.ownPublic.active.tools=['Float Stone BKT'];
  assert.equal(choosePowerglassAfterSupporter(b,9),null);
  const c=view();c.opponentPublic.active.damage=40;
  assert.equal(choosePowerglassAfterSupporter(c,9),null);
  const d=view();d.decisionKind='owner-prompt';
  assert.equal(choosePowerglassAfterSupporter(d,9),null);
});
test('both seats and inaccessible opponent hidden hand cannot influence selector',()=>{
  const a=view();a.actorSeat=0;
  a.ownPublic.active.printing='A different cheap Colorless attacker';
  assert.equal(choosePowerglassAfterSupporter(a,9)?.printing,'Powerglass SFA');
  a.opponentPrivateHand=['arbitrary-hidden-opponent-card'];
  assert.equal(choosePowerglassAfterSupporter(a,9)?.printing,'Powerglass SFA');
});
