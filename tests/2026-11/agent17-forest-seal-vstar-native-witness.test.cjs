'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../../simulation/twinleaf/agent5-owner-root-slice.cjs');

const STONE='Forest Seal Stone SIT';
function state(usedVSTAR,prompts=[]){
  const holder={tools:[{fullName:STONE}]};
  return {
    turn:1,phase:2,activePlayer:0,prompts,
    players:[{
      active:{
        ...holder,
        energies:{cards:[]}
      },
      bench:[...Array(5)].map(()=>({tools:[],energies:{cards:[]}})),
      hand:{cards:[]},stadium:{cards:[]},usedVSTAR,
      supporter:{cards:[]},discard:{cards:[]},
      prizes:[],supporterTurn:0,retreatedTurn:-1
    },{
      stadium:{cards:[]}
    }]
  };
}
test('Star Alchemy marker follows actual owner once-per-game VSTAR effect',()=>{
  const intent={kind:'use-forest-star-alchemy',slot:'active',index:0};
  const before=rootPhysicalSnapshot(state(false),0,intent);
  const after=rootPhysicalSnapshot(state(true,[{result:undefined}]),0,intent);
  assert.equal(before.fssVstarSpent,false);
  assert.equal(before.fssAttachedToHolder,true);
  assert.equal(after.pendingNativePrompts,1);
  assert.equal(rootPhysicalWitness(intent,before,after,{}),
    'confirmed-public-effect');
});
test('unaccepted Ability action cannot count as native VSTAR effect',()=>{
  const intent={kind:'use-forest-star-alchemy',slot:'active',index:0};
  const before=rootPhysicalSnapshot(state(false),0,intent);
  const after=rootPhysicalSnapshot(state(false),0,intent);
  assert.equal(rootPhysicalWitness(intent,before,after,{}),
    'no-confirmed-public-effect');
});
test('Star Alchemy requires the actual Tool on the public owner target',()=>{
  const intent={kind:'use-forest-star-alchemy',slot:'active',index:0};
  const beforeState=state(false);
  beforeState.players[0].active.tools=[];
  const before=rootPhysicalSnapshot(beforeState,0,intent);
  const after=rootPhysicalSnapshot(state(true),0,intent);
  assert.equal(rootPhysicalWitness(intent,before,after,{}),
    'no-confirmed-public-effect');
});
