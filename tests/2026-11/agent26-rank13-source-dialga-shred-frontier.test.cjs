'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {chooseRank13SourceDialgaShred,VERSION}=
  require('../../simulation/twinleaf/2026-11/agent26-rank13-source-dialga-shred-frontier.cjs');

/** @returns {object} Detached public owner view of the target archived attack. */
function view(){
  return {decisionKind:'owner-root',globalTurn:53,ownPublic:{
    active:{name:'Dialga-GX',printing:'Dialga-GX UPR',
      energies:['Fire Energy MEE','Fire Energy MEE',
        'Double Dragon Energy ROS'],
      attacks:[{name:'Overclock'},{name:'Shred'},{name:'Timeless-GX'}],
      publicRestrictions:{}},
    stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{active:{name:'Unown',printing:'Unown AOR',
        damage:0},stadium:[]}};
}

test('source owner with physically attached paid Fire + DDE offers Shred',()=>{
  assert.deepEqual(chooseRank13SourceDialgaShred(view()),{
    kind:'attack',attackName:'Shred',source:VERSION});
});

test('refuses wrong turn, active source, opponent or incomplete printed payment',()=>{
  for(const change of [
    v=>{v.globalTurn=51;},
    v=>{v.ownPublic.active.printing='Dialga-GX FLI';},
    v=>{v.opponentPublic.active.printing='Mimikyu GRI';},
    v=>{v.ownPublic.active.energies.pop();},
    v=>{v.ownPublic.active.energies.splice(0,1);},
    v=>{v.ownPublic.active.attacks=[{name:'Overclock'}];}
  ]){
    const v=view();change(v);assert.equal(chooseRank13SourceDialgaShred(v),null);
  }
});

test('refuses Temple, active status and named Shred restrictions',()=>{
  for(const change of [
    v=>v.ownPublic.stadium.push('Temple of Sinnoh ASR'),
    v=>v.opponentPublic.stadium.push('Temple of Sinnoh ASR'),
    v=>v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1,
    v=>v.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true,
    v=>v.ownPublic.active.publicRestrictions.blockedAttackNameNextTurn='Shred'
  ]){
    const v=view();change(v);assert.equal(chooseRank13SourceDialgaShred(v),null);
  }
});

test('only real owner root is accepted as an actionable observation',()=>{
  const v=view();v.decisionKind='prompt';
  assert.throws(()=>chooseRank13SourceDialgaShred(v),/owner-root/);
});
