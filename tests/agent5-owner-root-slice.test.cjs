'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {basicEnergyPays,selectOwnerRootIntent,nativeActionForIntent,
  rootPhysicalWitness,rootPhysicalSnapshot}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const P='Psychic Energy SVE';
const B='Mewtwo & Mew-GX UNM';
const C='Crobat V DAA';
const catalog={
  [P]:{basicEnergyType:'PSYCHIC'},
  [B]:{basicPokemon:true,hasAbility:true},
  [C]:{basicPokemon:true,hasAbility:false}
};
function view(){
  return {
    decisionKind:'owner-root',globalTurn:2,
    ownHand:[C,P],
    ownPublic:{
      active:{
        printing:B,energies:[],specialConditions:[],
        attacks:[{name:'Psy Bolt',cost:['PSYCHIC','COLORLESS'],
          gxAttack:false}],
        publicRestrictions:{
          cannotAttackNextTurn:false,cannotUseAttacksNextTurn:[],
          blockedAttackNameNextTurn:null,
          blockedAttackNameUntilLeavesActive:null,
          onlyAllowedAttackNameNextTurn:null
        }
      },
      bench:[null,null,null,null,null],
      publicTurnRestrictions:{gxUsed:false,attackLockTurnsRemaining:0}
    },
    ownTurnResources:{
      energyPlayedTurn:0,pokemonPlayLocked:false,
      abilityPokemonPlayLocked:false,energyPlayLocked:false,
      specialEnergyPlayLocked:false,attackLockTurnsRemaining:0
    }
  };
}
test('printed cost respects duplicate colored symbols and generic payments',()=>{
  assert.equal(basicEnergyPays(
    ['PSYCHIC','PSYCHIC','COLORLESS'],
    ['PSYCHIC','PSYCHIC','FIRE']),true);
  assert.equal(basicEnergyPays(
    ['PSYCHIC','PSYCHIC'],['PSYCHIC','FIRE']),false);
  assert.equal(basicEnergyPays(
    ['COLORLESS','COLORLESS'],['PSYCHIC','FIRE']),true);
  assert.equal(basicEnergyPays(['PSYCHIC'],[]),false);
});
test('first Basic Bench is chosen without consulting opponent hidden zones',()=>{
  const a=view(),b=view();
  a.opponentPublic={handCount:5};
  b.opponentPublic={handCount:5};
  assert.deepEqual(selectOwnerRootIntent(a,catalog),{
    kind:'bench-basic',printing:C,handIndex:0,benchSlot:0
  });
  assert.deepEqual(selectOwnerRootIntent(a,catalog),
    selectOwnerRootIntent(b,catalog));
});
test('Basic Energy play survives Special Energy lock',()=>{
  const a=view();
  a.ownPublic.bench[0]={printing:C};
  a.ownTurnResources.specialEnergyPlayLocked=true;
  assert.deepEqual(selectOwnerRootIntent(a,catalog),{
    kind:'attach-basic-energy',printing:P,handIndex:1
  });
});
test('no repeat attachment, then legal attack by Basic-only energy',()=>{
  const a=view();
  a.ownPublic.bench[0]={printing:C};
  a.ownPublic.active.energies=[P,P];
  a.ownTurnResources.energyPlayedTurn=2;
  assert.deepEqual(selectOwnerRootIntent(a,catalog),{
    kind:'attack',name:'Psy Bolt'
  });
  a.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(selectOwnerRootIntent(a,catalog).kind,'pass');
  a.ownPublic.active.publicRestrictions.cannotAttackNextTurn=false;
  a.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(selectOwnerRootIntent(a,catalog).kind,'pass');
});
test('no GX after spent and no attack on first global turn',()=>{
  const a=view();
  a.ownPublic.bench[0]={printing:C};
  a.ownPublic.active.attacks=[{
    name:'Breakthrough-GX',cost:['PSYCHIC'],gxAttack:true
  }];
  a.ownPublic.active.energies=[P];
  a.ownTurnResources.energyPlayedTurn=2;
  a.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.equal(selectOwnerRootIntent(a,catalog).kind,'pass');
  a.ownPublic.publicTurnRestrictions.gxUsed=false;
  a.globalTurn=1;
  a.ownTurnResources.energyPlayedTurn=1;
  assert.equal(selectOwnerRootIntent(a,catalog).kind,'pass');
});
test('owner Ability-play lock excludes ability-bearing Basics',()=>{
  const a=view();
  a.ownHand=[B,C];
  a.ownTurnResources.abilityPokemonPlayLocked=true;
  assert.deepEqual(selectOwnerRootIntent(a,catalog),{
    kind:'bench-basic',printing:C,handIndex:1,benchSlot:0
  });
});
test('typed native translator uses owner hand index and public target',()=>{
  class PlayCardAction {
    constructor(id,handIndex,target){
      this.id=id;this.handIndex=handIndex;this.target=target;
    }
  }
  class AttackAction {
    constructor(id,name){this.id=id;this.name=name;}
  }
  class PassTurnAction {
    constructor(id){this.id=id;}
  }
  const deps={PlayCardAction,AttackAction,PassTurnAction,
    PlayerType:{BOTTOM_PLAYER:10},SlotType:{BENCH:20,ACTIVE:30}};
  const player={id:101,hand:{cards:[
    {fullName:C},{fullName:P}
  ]}};
  const bench=nativeActionForIntent({
    kind:'bench-basic',printing:C,handIndex:0,benchSlot:2
  },player,deps);
  assert.ok(bench instanceof PlayCardAction);
  assert.deepEqual(bench.target,{player:10,slot:20,index:2});
  const energy=nativeActionForIntent({
    kind:'attach-basic-energy',printing:P,handIndex:1
  },player,deps);
  assert.deepEqual(energy.target,{player:10,slot:30,index:0});
  assert.ok(nativeActionForIntent({
    kind:'attack',name:'Psy Bolt'
  },player,deps) instanceof AttackAction);
  assert.ok(nativeActionForIntent({
    kind:'pass'
  },player,deps) instanceof PassTurnAction);
  assert.throws(()=>nativeActionForIntent({
    kind:'bench-basic',printing:C,handIndex:1,benchSlot:0
  },player,deps),/Expected values to be strictly equal/);
});


test('native effect witness requires public card movement, not no-throw dispatch',()=>{
  const phase={FINISHED:99};
  const bench={kind:'bench-basic',benchSlot:0,printing:C};
  const eb={kind:'attach-basic-energy',printing:P};
  const pass={kind:'pass'};
  const a={turn:2,phase:5,handCount:5,
    activeEnergies:[P],benchPrinting:null};
  const afterBench={...a,handCount:4,benchPrinting:C};
  assert.equal(rootPhysicalWitness(bench,a,afterBench,phase),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(bench,a,a,phase),
    'no-confirmed-public-effect');
  const afterEnergy={...a,handCount:4,activeEnergies:[P,P]};
  assert.equal(rootPhysicalWitness(eb,a,afterEnergy,phase),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(eb,a,a,phase),
    'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(pass,a,{...a,turn:3},phase),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(pass,a,a,phase),
    'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(pass,a,{...a,phase:99},phase),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness({kind:'attack',name:'Psy Bolt'},
    a,afterEnergy,phase),'attack-needs-declaration');
});

test('Thunder Mountain native root needs a real public Stadium transition',()=>{
  const intent={kind:'play-thunder-mountain',
    printing:'Thunder Mountain Prism Star LOT'};
  const before={turn:2,phase:5,handCount:3,
    stadiumPrintings:[],activeEnergies:[],benchPrinting:null};
  const after={...before,handCount:2,
    stadiumPrintings:[intent.printing]};
  assert.equal(rootPhysicalWitness(intent,before,after,{FINISHED:99}),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,before,{FINISHED:99}),
    'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(intent,before,{
    ...after,stadiumPrintings:['Dimension Valley PHF']
  },{FINISHED:99}),'no-confirmed-public-effect');
});

test('physical snapshot accesses acting-owner public zones only',()=>{
  const v=state=>(state.players[0]);
  const p={
    hand:{cards:[{fullName:P}]},
    active:{energies:{cards:[{fullName:P}]}},
    bench:[{getPokemonCard:()=>null}]
  };
  const hostile=new Proxy({}, {get(){throw Error('Opponent hidden read');}});
  const s={turn:2,phase:5,players:[p,hostile]};
  assert.deepEqual(rootPhysicalSnapshot(s,0,{
    kind:'bench-basic',benchSlot:0,printing:C
  }),{evolutionTop:null,evolutionLayers:null,
    turn:2,phase:5,handCount:1,stadiumPrintings:[],
    activeEnergies:[P],activeToolPrintings:[],targetEnergies:[P],benchPrinting:null});
});


test('pinned numeric attack cost symbols admit genuine payable Colorless',()=>{
  const numeric={9:9,5:5};
  assert.equal(basicEnergyPays([9],[5],numeric[9]),true);
  assert.equal(basicEnergyPays([5,9],[5,5],9),true);
  assert.equal(basicEnergyPays([5,5,9],[5,5],9),false);
  assert.equal(basicEnergyPays([5,5,9],[5,5,5],9),true);
  // The engine's printed cost arrives as numbers, and the owner holding a
  // Psychic Basic Energy must be encoded with the *same* native CardType.
  const a=view();
  a.ownPublic.active.attacks=[{
    name:'Get Lost',cost:[9],gxAttack:false
  }];
  a.ownPublic.active.energies=[P];
  a.ownPublic.bench[0]={printing:C};
  a.ownTurnResources.energyPlayedTurn=a.globalTurn;
  assert.deepEqual(selectOwnerRootIntent(a,{...catalog,
    [P]:{basicEnergyType:5}},{colorlessSymbol:9}),{
    kind:'attack',name:'Get Lost'
  });
});

test('native numeric Special Conditions prohibit payable attacks',()=>{
  const v=view();
  v.ownPublic.bench[0]={printing:C};
  v.ownPublic.active.energies=[P,P];
  v.ownTurnResources.energyPlayedTurn=2;
  v.ownPublic.active.attacks=[{name:'Paid',cost:[5,9],gxAttack:false}];
  const meta={...catalog,[P]:{basicEnergyType:5}};
  const options={colorlessSymbol:9,incapacitatingStatuses:[0,2]};
  for(const status of [0,2]){
    v.ownPublic.active.specialConditions=[status];
    assert.equal(selectOwnerRootIntent(v,meta,options).kind,'pass');
  }
  v.ownPublic.active.specialConditions=[];
  assert.equal(selectOwnerRootIntent(v,meta,options).kind,'attack');
});

test('native Tool chooser exact active and bench recipient witness',()=>{
  const tool='Muscle Band XY';
  const before={
    handCount:4,toolRecipientPokemonPrinting:'Dedenne-GX UNB',
    toolRecipientToolPrintings:[]
  };
  const after={...before,handCount:3,
    toolRecipientToolPrintings:[tool]};
  const active={kind:'attach-tool-candidate',printing:tool,
    slot:'active',index:0};
  const bench={...active,slot:'bench',index:0};
  const gamePhase={FINISHED:99};
  assert.equal(rootPhysicalWitness(active,before,after,gamePhase),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(bench,before,after,gamePhase),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(active,before,{
    ...after,toolRecipientPokemonPrinting:'Koraidon ex TEF'
  },gamePhase),'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(active,before,{
    ...after,toolRecipientToolPrintings:['Stealthy Hood UNB']
  },gamePhase),'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(active,before,{
    ...after,handCount:4
  },gamePhase),'no-confirmed-public-effect');
  assert.equal(rootPhysicalWitness(active,before,before,gamePhase),
    'no-confirmed-public-effect');
});

test('native Tool recipient snapshots use only owner physical slots',()=>{
  const tool='Muscle Band XY';
  const pokemon=(printing,tools=[])=>({
    getPokemonCard:()=>({fullName:printing}),
    energies:{cards:[]},
    tools:tools.map(fullName=>({fullName}))
  });
  const rival=new Proxy({},{get(){throw Error('Opponent hidden read');}});
  const owner={
    hand:{cards:[{fullName:tool},{fullName:P}]},
    active:pokemon('Dedenne-GX UNB'),
    bench:[pokemon('Koraidon ex TEF')],
    supporter:{cards:[]},discard:{cards:[]}
  };
  const state={players:[owner,rival],turn:2,phase:5};
  const active={kind:'attach-tool-candidate',
    printing:tool,slot:'active',index:0};
  const bench={...active,slot:'bench',index:0};
  const beforeActive=rootPhysicalSnapshot(state,0,active);
  assert.deepEqual(beforeActive.toolRecipientToolPrintings,[]);
  assert.equal(beforeActive.toolRecipientPokemonPrinting,'Dedenne-GX UNB');
  const beforeBench=rootPhysicalSnapshot(state,0,bench);
  assert.equal(beforeBench.toolRecipientPokemonPrinting,'Koraidon ex TEF');
  owner.hand.cards.shift();
  owner.bench[0].tools.push({fullName:tool});
  const afterBench=rootPhysicalSnapshot(state,0,bench);
  assert.equal(rootPhysicalWitness(bench,beforeBench,afterBench,{FINISHED:99}),
    'confirmed-public-effect');
  assert.equal(rootPhysicalWitness(active,beforeActive,
    rootPhysicalSnapshot(state,0,active),{FINISHED:99}),
  'no-confirmed-public-effect');
});
