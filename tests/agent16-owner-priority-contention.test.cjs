'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  collectOwnerContention,contentionReason,recordOwnerContention,
  newOwnerContentionAudit
}=require('../simulation/twinleaf/agent16-owner-priority-contention.cjs');

const view={decisionKind:'owner-root',globalTurn:4,
  ownHand:['Guzma BUS','Speed Lightning Energy RCL'],
  ownTurnResources:{energyPlayLocked:false,specialEnergyPlayLocked:false,
    energyPlayedTurn:0},
  ownPublic:{active:{},bench:[]},opponentPublic:{bench:[]}};
const offering=(flag,order,name,returned)=>({
  flag,order,name,load:()=>()=>returned
});

test('printed Arceus V attack-first masks same-root DCE funding',()=>{
  const {chooseActorRootIntent}=require(
    '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const catalog={
    basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set(),
    specialEnergies:new Set(['Double Colorless Energy SUM']),
    basicEnergyTypes:{Psychic:5,Lightning:4},colorlessEnergyType:9,
    specialConditions:{ASLEEP:2,PARALYZED:0}
  };
  const v={decisionKind:'owner-root',globalTurn:4,
    ownHand:['Double Colorless Energy SUM'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      specialEnergyPlayLocked:false,pokemonPlayLocked:false},
    ownPublic:{
      active:{name:'Arceus V',printing:'Arceus V BRS',
        energies:['Double Colorless Energy SUM'],
        attacks:[
          {name:'Trinity Charge',cost:[9,9],gxAttack:false},
          {name:'Power Edge',cost:[9,9,9],gxAttack:false}
        ],specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false}
    },opponentPublic:{stadium:[]}
  };
  const options={specialEnergyRoot:true};
  const selected=chooseActorRootIntent(v,catalog,options);
  assert.deepEqual(selected,{kind:'attack',attackName:'Trinity Charge'});
  const receipt=collectOwnerContention(v,catalog,options,selected);
  assert.equal(receipt.alternatives.length,1);
  assert.deepEqual(receipt.alternatives.map(a=>[a.kind,a.printing,a.reason]),[
    ['attach-special-energy','Double Colorless Energy SUM',
      'turn-ending-selection']
  ]);
});

test('same-root attack shadows later Energy and Supporter proposals only',()=>{
  const probes=[
    offering('specialEnergyRoot',16,'energy',{
      kind:'attach-special-energy',printing:'Speed Lightning Energy RCL',
      handIndex:1,slot:'active',index:0
    }),
    offering('heldGuzmaMobility',17,'gust',{
      kind:'play-held-guzma-mobility',printing:'Guzma BUS',handIndex:0
    }),
    offering('lowHandLillieRoot',8,'early',{kind:'play-lowhand-lillie'})
  ];
  const result=collectOwnerContention(view,{},{
    specialEnergyRoot:true,heldGuzmaMobility:true,
    lowHandLillieRoot:true
  },{kind:'attack',attackName:'Volt Cyclone'},probes);
  assert.deepEqual(result.alternatives.map(x=>x.kind),[
    'attach-special-energy','play-held-guzma-mobility'
  ]);
  assert.ok(result.alternatives.every(x=>
    x.reason==='turn-ending-selection'&&
    x.nativePlayability==='unverified'));
  assert.equal(result.alternatives[0].printing,'Speed Lightning Energy RCL');
});

test('one normal attachment consumes the Energy-per-turn opportunity',()=>{
  const r=collectOwnerContention(view,{},{
    specialEnergyRoot:true
  },{kind:'attach-basic-energy'},[
    offering('specialEnergyRoot',16,'special',{
      kind:'attach-special-energy',printing:'Speed Lightning Energy RCL',
      handIndex:1,slot:'active',index:0
    })
  ]);
  assert.equal(r.alternatives[0].reason,'same-turn-energy-attachment');
});

test('energy already attached this turn cannot be misreported as displaced',()=>{
  const v={...view,ownTurnResources:{
    ...view.ownTurnResources,energyPlayedTurn:4
  }};
  const r=collectOwnerContention(v,{},{
    specialEnergyRoot:true
  },{kind:'attack'},[
    offering('specialEnergyRoot',16,'special',{
      kind:'attach-special-energy',printing:'Speed Lightning Energy RCL',
      handIndex:1,slot:'active',index:0
    })
  ]);
  assert.deepEqual(r.alternatives,[]);
});

test('a chosen Supporter disputes a later Supporter quota',()=>{
  const r=collectOwnerContention(view,{},{
    heldGuzmaMobility:true
  },{kind:'play-carmine-first'},[
    offering('heldGuzmaMobility',17,'gust',{
      kind:'play-held-guzma-mobility',printing:'Guzma BUS',handIndex:0
    })
  ]);
  assert.equal(r.alternatives[0].reason,'same-turn-supporter-quota');
  assert.equal(contentionReason('bench-basic','attach-special-energy'),
    'later-root-may-recover');
});

test('disabled or higher-priority alternatives are excluded',()=>{
  const p=[
    offering('specialEnergyRoot',16,'disabled',{kind:'attach-special-energy'}),
    offering('lowHandLillieRoot',8,'earlier',{kind:'play-lowhand-lillie'})
  ];
  const r=collectOwnerContention(view,{},{
    specialEnergyRoot:false,lowHandLillieRoot:true
  },{kind:'attack'},p);
  assert.deepEqual(r.alternatives,[]);
});

test('equivalent physical proposals are deduplicated',()=>{
  const same={kind:'attach-special-energy',printing:'Speed Lightning Energy RCL',
    handIndex:1,slot:'active',index:0};
  const r=collectOwnerContention(view,{},{
    publicContextSpecialEnergy:true,specialEnergyRoot:true
  },{kind:'attack'},[
    offering('publicContextSpecialEnergy',16,'flexible',same),
    offering('specialEnergyRoot',16,'numeric',{...same})
  ]);
  assert.equal(r.alternatives.length,1);
  assert.equal(r.alternatives[0].probe,'flexible');
});

test('unknown selected intent is fail-closed',()=>{
  const r=collectOwnerContention(view,{},{
    specialEnergyRoot:true
  },{kind:'unmapped-new-intent'},[
    offering('specialEnergyRoot',16,'unused',{kind:'attach-special-energy'})
  ]);
  assert.equal(r.unknownPriority,true);
  assert.deepEqual(r.alternatives,[]);
});

test('bounded rollup reports diagnostic offers, never native acceptance',()=>{
  const audit=newOwnerContentionAudit();
  const receipt={selectedKind:'attack',unknownPriority:false,alternatives:[
    {probe:'special',kind:'attach-special-energy',
      printing:'Speed Lightning Energy RCL',slot:'active',index:0,
      reason:'turn-ending-selection'}
  ]};
  for(let i=0;i<50;i++)recordOwnerContention(audit,0,4,receipt);
  assert.equal(audit.ownerRoots,50);
  assert.equal(audit.contentionRoots,50);
  assert.equal(audit.pairs['attack > attach-special-energy'],50);
  assert.equal(audit.samples.length,40);
  assert.ok(audit.samples.every(x=>x.nativePlayability==='unverified'));
});
