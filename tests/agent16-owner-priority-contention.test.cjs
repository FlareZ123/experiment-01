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

test('rank3 printed Girafarig Get Lost shadows Capture Energy progress',()=>{
  const {chooseActorRootIntent}=require(
    '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const catalog={
    basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set(),
    specialEnergies:new Set(['Capture Energy RCL']),
    basicEnergyTypes:{Psychic:5,Lightning:4},colorlessEnergyType:9,
    specialConditions:{ASLEEP:2,PARALYZED:0}
  };
  const v={decisionKind:'owner-root',globalTurn:4,
    ownHand:['Capture Energy RCL'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      specialEnergyPlayLocked:false,pokemonPlayLocked:false},
    ownPublic:{
      active:{name:'Girafarig',printing:'Girafarig LOT',
        energies:['Capture Energy RCL'],
        attacks:[
          {name:'Get Lost',cost:[9],gxAttack:false},
          {name:'Mind Shock',cost:[9,9,9],gxAttack:false}
        ],specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false}
    },opponentPublic:{stadium:[]}
  };
  const options={specialEnergyRoot:true};
  const selected=chooseActorRootIntent(v,catalog,options);
  assert.deepEqual(selected,{kind:'attack',attackName:'Get Lost'});
  const receipt=collectOwnerContention(v,catalog,options,selected);
  assert.equal(receipt.alternatives.length,1);
  assert.deepEqual(receipt.alternatives.map(a=>[a.kind,a.printing,a.reason]),[
    ['attach-special-energy','Capture Energy RCL',
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

test('opponent concealed hand and Prize truth cannot alter the numeric contender',()=>{
  const {chooseActorRootIntent}=require(
    '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const catalog={
    basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
    specialEnergies:new Set(['Capture Energy RCL']),
    basicEnergyTypes:{Psychic:5,Lightning:4},colorlessEnergyType:9,
    specialConditions:{ASLEEP:2,PARALYZED:0}
  };
  const base={
    decisionKind:'owner-root',globalTurn:4,
    ownHand:['Capture Energy RCL'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      specialEnergyPlayLocked:false,pokemonPlayLocked:false},
    ownPublic:{
      active:{name:'Girafarig',printing:'Girafarig LOT',
        energies:['Capture Energy RCL'],
        attacks:[
          {name:'Get Lost',cost:[9],gxAttack:false},
          {name:'Mind Shock',cost:[9,9,9],gxAttack:false}
        ],specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,gxUsed:false}
    },opponentPublic:{stadium:[]},
    opponentPrivate:{hand:['Hidden Control'],prizes:['Known only to us']},
    unseenOwnedDeckOrder:['Unseen A']
  };
  const hiddenAlternate=structuredClone(base);
  hiddenAlternate.opponentPrivate={
    hand:['Completely different'],prizes:['Hidden opposite']
  };
  hiddenAlternate.unseenOwnedDeckOrder=['Unseen X'];
  const options={specialEnergyRoot:true};
  const outcome=view=>{
    const selected=chooseActorRootIntent(view,catalog,options);
    return collectOwnerContention(view,catalog,options,selected);
  };
  assert.deepStrictEqual(outcome(base),outcome(hiddenAlternate));
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

test('rank6 printed Team Flare Grunt denial is visible behind a chosen attack',()=>{
  const source={
    decisionKind:'owner-root',globalTurn:4,
    ownHand:['Team Flare Grunt XY'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false,
      energyPlayedTurn:0,energyPlayLocked:false,specialEnergyPlayLocked:false},
    ownPublic:{active:{name:'Iron Thorns ex'},
      publicTurnRestrictions:{supporterPlayLocked:false},
      resolvingSupporter:[]},
    opponentPublic:{active:{energies:['Basic Psychic Energy SVE 5']}}
  };
  const options={teamFlareGruntDenialRoot:true};
  const attack=collectOwnerContention(source,{},options,{kind:'attack'});
  assert.deepEqual(attack.alternatives.map(x=>[
    x.kind,x.printing,x.reason,x.nativePlayability
  ]),[['play-team-flare-grunt-denial','Team Flare Grunt XY',
    'turn-ending-selection','unverified']]);
  const supporter=collectOwnerContention(source,{},options,
    {kind:'play-carmine-first'});
  assert.equal(supporter.alternatives.length,1);
  assert.equal(supporter.alternatives[0].reason,'same-turn-supporter-quota');
  const noEnergy=structuredClone(source);
  noEnergy.opponentPublic.active.energies=[];
  assert.equal(collectOwnerContention(noEnergy,{},options,
    {kind:'attack'}).alternatives.length,0);
  const hiddenWorld=structuredClone(source);
  hiddenWorld.opponentPrivate={hand:['unseen'],prizes:['unseen']};
  assert.deepEqual(collectOwnerContention(source,{},options,{kind:'attack'}),
    collectOwnerContention(hiddenWorld,{},options,{kind:'attack'}));
});

test('printed duplicate action cannot contend with itself after hand reordering',()=>{
  const selected={kind:'attach-special-energy',printing:'Reversal Energy PAL',
    handIndex:0,slot:'active',index:0};
  const later=offering('specialEnergyRoot',17,'duplicate-late',
    {...selected,handIndex:2});
  const v={...view,ownHand:[
    'Reversal Energy PAL','Guzma BUS','Reversal Energy PAL'
  ]};
  const r=collectOwnerContention(v,{},{
    specialEnergyRoot:true
  },selected,[later]);
  assert.equal(r.alternatives.length,0);
  assert.equal(r.selectedPriority,16);
});


/**
 * Same owner-visible hand as the immediate-attack Special comparator test.
 * The early Special branch executes before generic Basic Energy placement.
 * The original v4 contention observer classified it as a late Special and
 * lost the displaced Basic option entirely.
 */
function contestedEnergySource(){
  const L=1,C=9;
  return {
    view:{
      decisionKind:'owner-root',globalTurn:3,
      ownHand:['Lightning Energy SVE','Double Colorless Energy SUM'],
      ownTurnResources:{pokemonPlayLocked:false,energyPlayLocked:false,
        specialEnergyPlayLocked:false,energyPlayedTurn:0},
      ownPublic:{
        bench:[null,null,null,null,null],stadium:[],
        publicTurnRestrictions:{attackLockTurnsRemaining:0},
        active:{
          name:'Iron Thorns ex',printing:'Iron Thorns ex TWM',
          energies:['Lightning Energy SVE'],
          publicRestrictions:{cannotAttackNextTurn:false},
          specialConditions:[],
          attacks:[{name:'Volt Cyclone',damage:140,cost:[L,C,C],
            gxAttack:false}]
        }
      },opponentPublic:{stadium:[]}
    },
    catalog:{
      basics:new Set(),abilityBasics:new Set(),
      basicEnergies:new Set(['Lightning Energy SVE']),
      specialEnergies:new Set(['Double Colorless Energy SUM']),
      basicEnergyTypes:{Lightning:L},colorlessEnergyType:C,
      specialConditions:{ASLEEP:6,PARALYZED:7}
    },
    options:{contestedEnergyRoot:true,specialEnergyRoot:true}
  };
}

test('early Special records the otherwise displaced Basic at same genuine owner root',()=>{
  const {chooseActorRootIntent}=require(
    '../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  const {view:v,catalog,options}=contestedEnergySource();
  const selected=chooseActorRootIntent(v,catalog,options);
  assert.deepEqual(selected,{kind:'attach-special-energy',
    handIndex:1,printing:'Double Colorless Energy SUM',
    slot:'active',index:0});
  const receipt=collectOwnerContention(v,catalog,options,selected);
  assert.equal(receipt.selectedPriority,6);
  assert.equal(receipt.unknownPriority,false);
  assert.deepEqual(receipt.alternatives.map(a=>[
    a.probe,a.kind,a.printing,a.slot,a.index,a.reason,a.nativePlayability
  ]),[['displaced-basic-energy','attach-basic-energy',
    'Lightning Energy SVE','active',0,'same-turn-energy-attachment',
    'unverified']]);
});

test('displaced Basic appears only for exact verified early Special intent',()=>{
  const {view:v,catalog,options}=contestedEnergySource();
  const late={kind:'attach-special-energy',handIndex:1,
    printing:'Speed Lightning Energy RCL',slot:'active',index:0};
  const notMatched=collectOwnerContention(v,catalog,options,late);
  assert.equal(notMatched.selectedPriority,16);
  assert.deepEqual(notMatched.alternatives,[]);
  const flagsOff=collectOwnerContention(v,catalog,
    {...options,contestedEnergyRoot:false},{
      kind:'attach-special-energy',handIndex:1,
      printing:'Double Colorless Energy SUM',slot:'active',index:0});
  assert.equal(flagsOff.selectedPriority,16);
  assert.deepEqual(flagsOff.alternatives,[]);
});

test('displaced Basic proposal ignores concealed opposing and future deck cards',()=>{
  const x=contestedEnergySource(),y=contestedEnergySource();
  x.view.opponentPrivate={hand:['one'],prizes:['first']};
  y.view.opponentPrivate={hand:['different'],prizes:['other']};
  x.view.unknownDeckOrder=['A'];
  y.view.unknownDeckOrder=['B'];
  const chosen={kind:'attach-special-energy',handIndex:1,
    printing:'Double Colorless Energy SUM',slot:'active',index:0};
  assert.deepStrictEqual(collectOwnerContention(x.view,x.catalog,x.options,chosen),
    collectOwnerContention(y.view,y.catalog,y.options,chosen));
});
