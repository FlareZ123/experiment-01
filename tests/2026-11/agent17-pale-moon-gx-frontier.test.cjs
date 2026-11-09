'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,choosePaleMoonGX}=require(
  '../../simulation/twinleaf/2026-11/agent17-pale-moon-gx-native-frontier.cjs');

const catalog={specialConditions:{ASLEEP:8,PARALYZED:9}};
function view({
  energies=['Psychic Energy MEE','Psychic Energy MEE'],
  gxUsed=false,printing='Trevenant & Dusknoir-GX SMP',
  activeName='Trevenant & Dusknoir-GX',
  opponent=true,specialConditions=[]
}={}){
  return {
    decisionKind:'owner-root',globalTurn:13,ownHand:[],
    ownPublic:{
      active:{printing,name:activeName,
        attacks:[{name:'Night Watch'},{name:'Pale Moon-GX'}],
        energies,specialConditions,publicRestrictions:{}},
      publicTurnRestrictions:{gxUsed,attackLockTurnsRemaining:0}
    },
    opponentPublic:{active:opponent?{printing:'Girafarig LOT'}:null}
  };
}
test('paid GX is proposed from exact owner public active without damage proxy',()=>{
  const result=choosePaleMoonGX(view(),catalog);
  assert.equal(result.kind,'attack');
  assert.equal(result.attackName,'Pale Moon-GX');
  assert.equal(result.source,VERSION);
  assert.equal(result.backedByPrintedEnergy,2);
});
test('one Psychic cannot pay Psychic+Colorless printed attack',()=>{
  assert.equal(choosePaleMoonGX(view({energies:['Psychic Energy MEE']}),catalog),null);
});
test('spent GX, no opponent or wrong stage are excluded',()=>{
  assert.equal(choosePaleMoonGX(view({gxUsed:true}),catalog),null);
  assert.equal(choosePaleMoonGX(view({opponent:false}),catalog),null);
  assert.equal(choosePaleMoonGX(view({printing:'Shadow Rider Calyrex V CRE'}),catalog),null);
});
test('asleep, paralyzed and printed attack-name lock exclude root',()=>{
  assert.equal(choosePaleMoonGX(view({specialConditions:[8]}),catalog),null);
  assert.equal(choosePaleMoonGX(view({specialConditions:[9]}),catalog),null);
  const blocked=view();
  blocked.ownPublic.active.publicRestrictions.blockedAttackNameNextTurn='Pale Moon-GX';
  assert.equal(choosePaleMoonGX(blocked,catalog),null);
});
test('opposing concealed hand and Prize identities are never used',()=>{
  const v=view();
  const result=choosePaleMoonGX(v,catalog);
  v.opponentPublic.handCount=999;
  assert.deepEqual(choosePaleMoonGX(v,catalog),result);
});
