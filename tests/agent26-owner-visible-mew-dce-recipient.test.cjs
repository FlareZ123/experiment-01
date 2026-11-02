'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseMewDceRecipient:choose}=require('../simulation/twinleaf/agent26-owner-visible-mew-dce-recipient.cjs');
const DCE='Double Colorless Energy SUM';
const CATALOG={specialEnergies:new Set([DCE])};
function view({active='Lillie\'s Clefairy ex JTG',bench=['Mew V FST'],hand=[DCE],used=false,temple=false}={}){
  return {decisionKind:'owner-root',globalTurn:3,ownHand:hand,
    ownTurnResources:{energyPlayLocked:false,specialEnergyPlayLocked:false,
      energyPlayedTurn:used?3:2},
    ownPublic:{active:{printing:active,energies:[]},
      bench:bench.map(printing=>({printing,energies:[]})),stadium:[]},
    opponentPublic:{stadium:temple?['Temple of Sinnoh ASR']:[]}};
}
test('visible Benched source Mew V receives held DCE before stranded Clefairy',()=>{
  assert.deepEqual(choose(view(),CATALOG),{kind:'attach-special-energy',
    handIndex:0,printing:DCE,slot:'bench',index:0});
});
test('already-evolved Mew VMAX takes priority over Mew V regardless of Bench order',()=>{
  const v=view({bench:['Mew V FST','Mew VMAX FST']});
  assert.deepEqual(choose(v,CATALOG),{kind:'attach-special-energy',
    handIndex:0,printing:DCE,slot:'bench',index:1});
});
test('active Mew V gets the DCE when equally promising Bench Mew exists',()=>{
  assert.equal(choose(view({active:'Mew V FST'}),CATALOG).slot,'active');
});
test('already attached DCE on the only Mew is not duplicated',()=>{
  const v=view();v.ownPublic.bench[0].energies=[DCE];
  assert.equal(choose(v,CATALOG),null);
});
test('previous attachment or public Energy lock suppresses intent',()=>{
  assert.equal(choose(view({used:true}),CATALOG),null);
  const v=view();v.ownTurnResources.energyPlayLocked=true;
  assert.equal(choose(v,CATALOG),null);
});
test('Temple cancels two Colorless funded line; DCE missing also returns null',()=>{
  assert.equal(choose(view({temple:true}),CATALOG),null);
  assert.equal(choose(view({hand:['Energy Retrieval SVI']}),CATALOG),null);
});
test('helper is owner-relative and never searches hidden opponent/deck information',()=>{
  for(const seat of [0,1]){
    const v=view();v.playerSeat=seat;
    Object.defineProperty(v,'hiddenDeck',{get(){throw Error('invalid hidden deck read');}});
    assert.equal(choose(v,CATALOG).slot,'bench');
  }
});
