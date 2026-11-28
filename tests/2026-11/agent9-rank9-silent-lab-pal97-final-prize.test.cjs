'use strict';
// Source-policy proof of paper-realistic Silent Lab vs an Active PAL97.
// Pinned Twinleaf Store isn't executed here; no matchup claims.
const test=require('node:test');
const assert=require('node:assert/strict');
const rank9=require('../../simulation/evaluation/2026-11/agent29-rank9-tactical-slice.cjs');

function card(printing,hp,stage=2,types=[5]){
  return {printing,hp,damage:0,
    printed:{stage,types,subtypes:[],weakness:[],resistance:[]},
    tools:[],energies:[],abilityDetails:[],abilitySuppressions:[]
  };
}
function state(seat,{
  cologne=true,labInHand=true,stadiumAlready=false,stadiumDisabled=false,
  newMoon=false,newMoonOff=false,solrock=true,itemLock=false,labLocked=false,
  targetTool=false,targetStage=2,native=true
}={}) {
  const attacker={
    ...card('Mega Absol ex M1L',280,2,[7]),
    energies:['Prism Energy ASC','Prism Energy ASC','Darkness Energy MEE']
  };
  const target={
    ...card(native?'Mimikyu PAL':'Mimikyu PAL 97',70,targetStage,[5]),
    tools:targetTool?['Stealthy Hood UNB']:[],
    abilityDetails:[{
      name:'Safeguard',
      text:"Prevent all damage done to this Pokémon by attacks from your opponent's Pokémon ex and Pokémon V."
    }],
    abilitySuppressions:[{abilityName:'Safeguard',suppressed:null}]
  };
  const blocker={
    ...card('Lunatone OBF',90),
    abilityDetails:[{
      name:'New Moon',text:'Prevent all effects of Stadium cards done to your Pokémon.'
    }],
    abilitySuppressions:[{abilityName:'New Moon',suppressed:newMoonOff?true:null}]
  };
  return {
    actorSeat:seat,globalTurn:7,phase:2,
    ownHand:[
      ...(labInHand?['Silent Lab PRC']:[]),
      ...(cologne?['Canceling Cologne ASR']:[])
    ],
    ownPublic:{
      active:attacker,bench:[],discard:[],
      stadium:stadiumAlready?['Silent Lab PRC']:[],
      prizeCount:1,
      publicTurnRestrictions:{
        stadiumAndToolHaveNoEffectTurnsRemaining:stadiumDisabled?1:0
      }
    },
    opponentPublic:{
      active:target,
      bench:newMoon?[blocker,...(solrock?[card('Solrock OBF',90,2,[6])]:[])]:[card('Snorlax PGO',150,2,[9])],
      stadium:[],prizeCount:4
    },
    ownTurnResources:{
      itemPlayLocked:itemLock,stadiumPlayLocked:labLocked,
      supporterPlayedTurn:0,energyPlayedTurn:true,
      stadiumPlayedTurn:null,retreatedTurn:false
    }
  };
}
const offered=[
  {kind:'play-card',printing:'Silent Lab PRC',token:'lab'},
  {kind:'play-card',printing:'Canceling Cologne ASR',token:'cologne'},
  {kind:'attack',attackName:'Claw of Darkness',token:'claw',
    publicMetadata:{attackCostPayable:true}},
  {kind:'pass',token:'pass'}
];
function actor(seat){
  return rank9.createPolicy({
    role:'opponent',seat,policyVersion:rank9.POLICY_VERSION,config:{}
  });
}
function root(w,seat,o,sequence=7,actions=offered){
  return w.decide({
    role:'opponent',seat,observation:o,sequence,prompt:null,
    actionFrontier:{items:actions}
  });
}
for(const seat of [0,1]){
  for(const native of [false,true]){
    test(`seat ${seat}, native ${native}: conserves Cologne with Lab->Claw final-Prize route`,()=>{
      const o=state(seat,{native}),w=actor(seat);
      assert.equal(rank9.payable(o.ownPublic.active,
        [7,7,9],-1,o),true);
      assert.deepEqual(root(w,seat,o),{kind:'select-action',token:'lab'});
      const after={
        ...o,ownHand:['Canceling Cologne ASR'],
        ownPublic:{...o.ownPublic,stadium:['Silent Lab PRC']}
      };
      assert.equal(rank9.printedDamage(after,after.ownPublic.active,
        after.opponentPublic.active,'Claw of Darkness'),200);
      assert.deepEqual(root(w,seat,after,8,offered.slice(2)),{
        kind:'select-action',token:'claw'
      });
    });
  }
  test(`seat ${seat}: live Silent Lab enables a direct final-Prize Claw`,()=>{
    const o=state(seat,{stadiumAlready:true,labInHand:false});
    assert.deepEqual(root(actor(seat),seat,o),{
      kind:'select-action',token:'claw'
    });
  });
  test(`seat ${seat}: item-locked actor can play Lab instead of impossible Cologne`,()=>{
    const o=state(seat,{itemLock:true});
    assert.deepEqual(root(actor(seat),seat,o),{
      kind:'select-action',token:'lab'
    });
  });
  test(`seat ${seat}: live New Moon protects PAL97 from Lab, preserve Cologne route`,()=>{
    const o=state(seat,{newMoon:true});
    assert.equal(rank9.stadiumScore('Silent Lab PRC',o),0);
    assert.deepEqual(root(actor(seat),seat,o),{
      kind:'select-action',token:'cologne'
    });
  });
  test(`seat ${seat}: lone New Moon Lunatone without Solrock cannot block Lab`,()=>{
    const o=state(seat,{newMoon:true,solrock:false});
    assert.equal(rank9.stadiumScore('Silent Lab PRC',o),950);
    assert.deepEqual(root(actor(seat),seat,o),{
      kind:'select-action',token:'lab'
    });
  });
  test(`seat ${seat}: known suppressed New Moon reopens Lab`,()=>{
    const o=state(seat,{newMoon:true,newMoonOff:true});
    assert.deepEqual(root(actor(seat),seat,o),{
      kind:'select-action',token:'lab'
    });
  });
  test(`seat ${seat}: suppressed Stadium effects do not claim a direct KO`,()=>{
    const o=state(seat,{stadiumDisabled:true,stadiumAlready:true,labInHand:false});
    assert.equal(rank9.printedDamage(o,o.ownPublic.active,
      o.opponentPublic.active,'Claw of Darkness'),null);
    assert.deepEqual(root(actor(seat),seat,o),{
      kind:'select-action',token:'cologne'
    });
  });
  test(`seat ${seat}: locked Stadium play cannot displace useful Cologne`,()=>{
    const o=state(seat,{labLocked:true});
    assert.deepEqual(root(actor(seat),seat,o),{
      kind:'select-action',token:'cologne'
    });
  });
  test(`seat ${seat}: unmodeled PAL97 Tool leaves Lab shortcut uncertain`,()=>{
    const o=state(seat,{targetTool:true});
    assert.equal(rank9.stadiumScore('Silent Lab PRC',o),0);
    assert.deepEqual(root(actor(seat),seat,o),{
      kind:'select-action',token:'pass'
    });
  });
  test(`seat ${seat}: an impossible non-Basic PAL stage must not gain Lab protection bypass`,()=>{
    const o=state(seat,{targetStage:3});
    assert.equal(rank9.stadiumScore('Silent Lab PRC',o),0);
    assert.deepEqual(root(actor(seat),seat,o),{
      kind:'select-action',token:'cologne'
    });
  });
}
