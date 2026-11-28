'use strict';

// Original Aichi ranks 6 and 29 each registered Spiky Energy JTG159 x1.
// Pinned Twinleaf triggers its 20 damage-counter return even if the holder
// is Knocked Out by Volt Cyclone. The paper game can therefore end in a tie
// instead of a nominal final-Prize/sole-Pokémon victory.
// This is an exact actor-visible policy test, NOT a native battle resolution.
const test=require('node:test');
const assert=require('node:assert/strict');
const {POLICY_VERSION,createPolicy,scoreAction}=
  require('../../simulation/evaluation/2026-11/agent4-rank29-iron-thorns-opponent-policy.cjs');

function request(seat,{
    ownBench=false,opponentBench=false,ownPrizes=6,
    opponentPrizes=6,spiky=true,ownDamage=220}={}){
  const observation={
    actorSeat:seat,globalTurn:20,ownHand:[],
    ownPublic:{
      active:{printing:'Iron Thorns ex TWM 77',hp:230,damage:ownDamage,
        energies:['Speed Lightning Energy RCL 173','Double Colorless Energy SUM 136'],
        tools:[]},
      bench:ownBench?[{printing:'Iron Thorns ex TWM 77',hp:230,damage:0,
        energies:[],tools:[]}]:[],
      stadium:[],prizeCount:ownPrizes
    },
    opponentPublic:{
      active:{printing:'Iron Thorns ex TWM 77',hp:230,damage:100,
        energies:spiky?['Spiky Energy JTG 159']:[],tools:[],
        printed:{stage:'BASIC',subtypes:['ex'],
          weakness:[{type:'Fighting',value:2}],resistance:[]}},
      bench:opponentBench?[{printing:'Iron Thorns ex TWM 77',hp:230,
        damage:0,energies:[],tools:[]}]:[],
      stadium:[],prizeCount:opponentPrizes
    }
  };
  return {role:'opponent',seat,observation,prompt:null,
    actionFrontier:{items:[
      {kind:'attack',token:'volt',attackName:'Volt Cyclone',
        publicMetadata:{attackCostPayable:true}},
      {kind:'pass',token:'pass'}
    ]}};
}
for(const seat of [0,1]){
  const policy=createPolicy({role:'opponent',seat,policyVersion:POLICY_VERSION,config:{}});
  test('seat '+seat+': 10HP last attacker vs Spiky sole opponent cannot be scored as win',()=>{
    const r=request(seat);
    assert.equal(scoreAction(r.actionFrontier.items[0],r),0);
    assert.deepEqual(policy.decide(r),{kind:'select-action',token:'pass'});
  });
  test('seat '+seat+': surviving own Bench and no opponent final Prize permits true win',()=>{
    const r=request(seat,{ownBench:true});
    assert.equal(scoreAction(r.actionFrontier.items[0],r),1000);
    assert.deepEqual(policy.decide(r),{kind:'select-action',token:'volt'});
  });
  test('seat '+seat+': opponent takes final Prizes from Spiky despite own Bench: tie not win',()=>{
    const r=request(seat,{ownBench:true,ownPrizes:2,opponentPrizes:2});
    assert.equal(scoreAction(r.actionFrontier.items[0],r),0);
    assert.deepEqual(policy.decide(r),{kind:'select-action',token:'pass'});
  });
  test('seat '+seat+': no Spiky or too much attacker HP retains terminal score',()=>{
    for(const opts of [{spiky:false},{ownDamage:200}]){
      const r=request(seat,opts);
      assert.equal(scoreAction(r.actionFrontier.items[0],r),1000);
      assert.deepEqual(policy.decide(r),{kind:'select-action',token:'volt'});
    }
  });
  test('seat '+seat+': surviving opponent Bench, no own Bench and lethal recoil is not a win',()=>{
    const r=request(seat,{ownPrizes:2,opponentBench:true});
    assert.equal(scoreAction(r.actionFrontier.items[0],r),0);
    assert.deepEqual(policy.decide(r),{kind:'select-action',token:'pass'});
  });
}
