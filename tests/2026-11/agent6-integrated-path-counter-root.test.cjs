'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const PSY=5;
const catalog={
  basicEnergies:new Set(['Psychic Energy SVE']),
  basicEnergyTypes:{Psychic:PSY},
  trainerStadiumPrints:new Map([
    ['Sky Field ROS',{name:'Sky Field',type:'Stadium'}],
    ['Dimension Valley PHF',{name:'Dimension Valley',type:'Stadium'}]
  ])
};
const markers={activeUnspent:true,benchUnspent:[false]};
function view(seat){
  return {
    actorSeat:seat,decisionKind:'owner-root',globalTurn:9,
    ownHand:['Psychic Energy SVE','Sky Field ROS','Dimension Valley PHF'],
    ownTurnResources:{stadiumPlayLocked:false,stadiumPlayedTurn:0},
    ownPublic:{
      active:{printing:'Shadow Rider Calyrex VMAX CRE',
        name:'Shadow Rider Calyrex VMAX',abilities:['Underworld Door'],
        printed:{types:[PSY]}},
      bench:[{printing:'Mew UNB',name:'Mew',
        printed:{types:[PSY]},abilities:[]}],
      stadium:[],discard:[],
      publicTurnRestrictions:{}
    },
    opponentPublic:{
      active:{printing:'Snorlax PGO',name:'Snorlax',
        abilities:['Block'],printed:{types:[PSY]}},
      bench:[],stadium:['Path to the Peak CRE'],discard:[],
      publicTurnRestrictions:{}
    }
  };
}
const options={
  underworldDoorRoot:true,
  pathUnderworldStadiumCounter:true,
  underworldMarkerReceipt:markers
};

for(const seat of [0,1]){
  test('integrated native-neutral actor root proposes owner-hand Sky Field response seat '+seat,()=>{
    const own=view(seat);
    const saved=JSON.stringify(own);
    const intent=chooseActorRootIntent(own,catalog,options);
    assert.equal(intent?.kind,'play-path-underworld-stadium-counter');
    assert.equal(intent?.printing,'Sky Field ROS');
    assert.equal(intent?.handIndex,1);
    assert.deepEqual(intent?.alternativePrintings,[
      'Sky Field ROS','Dimension Valley PHF'
    ]);
    assert.equal(intent?.expectedNativeEffectUnverified,true);
    assert.equal(JSON.stringify(own),saved);
  });
}
test('shared actor chooser default keeps new recovery policy disabled',()=>{
  const own=view(0);
  const intent=chooseActorRootIntent(own,catalog,{
    underworldDoorRoot:true,underworldMarkerReceipt:markers
  });
  assert.notEqual(intent?.kind,'play-path-underworld-stadium-counter');
});
test('integrated root refuses this line when used Stadium quota prevents play',()=>{
  const own=view(1);
  own.ownTurnResources.stadiumPlayedTurn=9;
  assert.notEqual(chooseActorRootIntent(own,catalog,options)?.kind,
    'play-path-underworld-stadium-counter');
});
