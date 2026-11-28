'use strict';
// Source-locked rank9 final-Prize Cologne->Claw. A source-policy V8 test,
// NOT a pinned native Store game or evidence that a host provides a receipt.
const test=require('node:test');
const assert=require('node:assert/strict');
const rank9=require('../../simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs');

function card(printing,hp=70,type='Psychic') {
  return {
    printing,hp,damage:0,tools:[],energies:[],
    printed:{stage:'Basic',types:[type],subtypes:['Basic']},
    abilityDetails:[],abilitySuppressions:[]
  };
}
function scenario(seat,{prizes=1,native=true,tool=false,itemLock=false,
  activeMimikyu=true,extraMimikyu=false,paid=true,suppressed=null
}={}) {
  const own={
    ...card('Mega Absol ex MEG 86',280,'Darkness'),
    energies:paid?[
      'Prism Energy ASC 216','Prism Energy ASC 216',
      'Darkness Energy MEE 15'
    ]:['Darkness Energy MEE 15']
  };
  const mimikyu={
    ...card(native?'Mimikyu PAL':'Mimikyu PAL 97'),
    tools:tool?['Stealthy Hood UNB']:[],
    abilityDetails:[{
      name:'Safeguard',
      text:"Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon ex and Pokémon V."
    }],
    // Public source projection often cannot prove the real temporary lock:
    abilitySuppressions:[{
      abilityName:'Safeguard',suppressed,
      reasonCode:null,sourcePrinting:null
    }]
  };
  return {
    actorSeat:seat,globalTurn:7,phase:2,
    ownHand:['Canceling Cologne ASR'],
    ownPublic:{
      active:own,bench:[],stadium:[],discard:[],prizeCount:prizes
    },
    opponentPublic:{
      active:activeMimikyu?mimikyu:card('Snorlax PGO 55',150,'Colorless'),
      bench:[card('Girafarig LOT 94',90),
        ...(extraMimikyu?[{...mimikyu}]:[])],
      stadium:[],prizeCount:4
    },
    ownTurnResources:{
      itemPlayLocked:itemLock,energyPlayedTurn:true,
      supporterPlayedTurn:0,retreatedTurn:false
    }
  };
}
function policy(seat) {
  return rank9.createPolicy({
    role:'opponent',seat,policyVersion:rank9.POLICY_VERSION,config:{}
  });
}
const offer=[
  {kind:'play-card',printing:'Canceling Cologne ASR',token:'cologne'},
  {
    kind:'attack',attackName:'Claw of Darkness',token:'claw',
    publicMetadata:{attackCostPayable:true}
  },
  {kind:'pass',token:'pass'}
];
function root(worker,seat,o,sequence,actions=offer) {
  return worker.decide({
    role:'opponent',seat,observation:o,prompt:null,sequence,
    actionFrontier:{items:actions}
  });
}
function settled(o,{
  discard=true,removeHand=true,keepAttacker=true
}={}) {
  return {
    ...o,
    ownHand:removeHand?[]:o.ownHand,
    ownPublic:{
      ...o.ownPublic,
      discard:discard?['Canceling Cologne ASR']:[],
      active:keepAttacker?o.ownPublic.active:card('Sableye V SSH 120',170,'Darkness')
    }
  };
}
for(const seat of [0,1]) {
  for(const native of [false,true]) {
    test(`seat ${seat}, nativeAlias ${native}: public Item settlement certifies final-Prize Claw with unknown suppression`,()=>{
      const o=scenario(seat,{native,extraMimikyu:true});
      const worker=policy(seat);
      // No guessed Ability off-status: printed Safeguard still appears unknown.
      assert.equal(o.opponentPublic.active.abilitySuppressions[0].suppressed,null);
      assert.deepEqual(root(worker,seat,o,7),{
        kind:'select-action',token:'cologne'
      });
      const after=settled(o);
      assert.deepEqual(root(worker,seat,after,8,offer.slice(1)),{
        kind:'select-action',token:'claw'
      });
    });
  }
  test(`seat ${seat}: a selected but UNSETTLED Item cannot justify the knockout`,()=>{
    const o=scenario(seat),worker=policy(seat);
    assert.equal(root(worker,seat,o,7).token,'cologne');
    assert.deepEqual(root(worker,seat,settled(o,{discard:false}),8,offer.slice(1)),{
      kind:'select-action',token:'pass'
    });
  });
  test(`seat ${seat}: a skipped root ordinal invalidates the Cologne receipt`,()=>{
    const o=scenario(seat),worker=policy(seat);
    assert.equal(root(worker,seat,o,7).token,'cologne');
    assert.deepEqual(root(worker,seat,settled(o),9,offer.slice(1)),{
      kind:'select-action',token:'pass'
    });
  });
  test(`seat ${seat}: changing the funded attacker invalidates the receipt`,()=>{
    const o=scenario(seat),worker=policy(seat);
    assert.equal(root(worker,seat,o,7).token,'cologne');
    assert.deepEqual(root(worker,seat,settled(o,{keepAttacker:false}),8,offer.slice(1)),{
      kind:'select-action',token:'pass'
    });
  });
  test(`seat ${seat}: two Prize cards left is not an emergency singleton spend`,()=>{
    const o=scenario(seat,{prizes:2}),worker=policy(seat);
    assert.deepEqual(root(worker,seat,o,7),{kind:'select-action',token:'pass'});
  });
  test(`seat ${seat}: no Energy payment does not trigger a speculative Cologne`,()=>{
    const o=scenario(seat,{paid:false}),worker=policy(seat);
    assert.deepEqual(root(worker,seat,o,7),{kind:'select-action',token:'pass'});
  });
  test(`seat ${seat}: Item lock is respected even if frontier is malformed`,()=>{
    const o=scenario(seat,{itemLock:true}),worker=policy(seat);
    assert.deepEqual(root(worker,seat,o,7),{kind:'select-action',token:'pass'});
  });
  test(`seat ${seat}: a Tool-bearing PAL97 remains conservatively blocked`,()=>{
    const o=scenario(seat,{tool:true}),worker=policy(seat);
    assert.deepEqual(root(worker,seat,o,7),{kind:'select-action',token:'pass'});
  });
  test(`seat ${seat}: direct final-Prize attack wins without spending Cologne`,()=>{
    const o=scenario(seat,{suppressed:true}),worker=policy(seat);
    assert.deepEqual(root(worker,seat,o,7),{kind:'select-action',token:'claw'});
  });
  test(`seat ${seat}: unrelated Benched Mimikyu never consumes Cologne`,()=>{
    const o=scenario(seat,{activeMimikyu:false,extraMimikyu:true}),worker=policy(seat);
    assert.deepEqual(root(worker,seat,o,7),{kind:'select-action',token:'claw'});
  });
}
