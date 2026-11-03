'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {
  chooseFundedApexCompressor,chooseActualOwnerDeckDonors,ITEM
}=require('../simulation/twinleaf/agent8-funded-apex-compressor-owner-bridge.cjs');

function root(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:8,
    ownHand:[ITEM,'Grass Energy MEE'],
    ownTurnResources:{itemPlayLocked:false},
    ownPublic:{
      active:{printing:'Regidrago VSTAR SIT',
        energies:['Double Dragon Energy ROS','Double Dragon Energy ROS']},
      bench:[null,null,null,null,null],deckCount:20,discard:[],
      stadium:[],publicTurnRestrictions:{itemPlayLocked:false}
    },opponentPublic:{stadium:[]}
  };
}

test('funded owner Apex requires a real missing donor channel',()=>{
  const v=root();
  assert.equal(chooseFundedApexCompressor(v)?.handIndex,0);
  const cases=[
    x=>{x.ownHand=[];},
    x=>{x.ownTurnResources.itemPlayLocked=true;},
    x=>{x.ownPublic.deckCount=0;},
    x=>{x.ownPublic.active.printing='Regidrago V SIT';},
    x=>{x.ownPublic.active.energies=['Double Dragon Energy ROS'];},
    x=>{x.opponentPublic.stadium=['Temple of Sinnoh ASR'];},
    x=>{x.ownPublic.discard=['Dragapult ex TWM'];}
  ];
  for(const modify of cases){
    const candidate=structuredClone(v);modify(candidate);
    assert.equal(chooseFundedApexCompressor(candidate),null);
  }
});

test('owner-deck donor choice uses actual offered physical cards',()=>{
  const own={deck:{cards:[
    {fullName:'Kyurem SFA',id:1},
    {fullName:'Dragapult ex TWM',id:3},
    {fullName:'Noivern ex PAL',id:5},
    {fullName:'Dialga-GX UPR',id:4}
  ]}};
  const menu={cards:own.deck};
  assert.deepEqual(chooseActualOwnerDeckDonors(menu,own).map(x=>x.id),
    [3,5,4]);
  assert.throws(()=>chooseActualOwnerDeckDonors(
    {cards:{cards:own.deck.cards}},own),/strictEqual/);
});
