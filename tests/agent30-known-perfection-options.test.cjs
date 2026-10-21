'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  knownPerfectionDonorCatalog,knownPerfectionReadyOptions,
  publicPerfectionVeto
}=require('../simulation/twinleaf/agent30-known-perfection-options.cjs');

const P=5,C=9;
const M3='Telepath [P] Energy M3',BASIC='Psychic Energy SVE';
const donorCatalog=knownPerfectionDonorCatalog([
  {fullName:'Gengar & Mimikyu-GX TEU',attacks:[
    {name:'Poltergeist',cost:[P,P],gxAttack:false},
    {name:'Horror House-GX',cost:[P],gxAttack:true}
  ]},
  {fullName:'Trevenant & Dusknoir-GX SMP',attacks:[
    {name:'Night Watch',cost:[P,P,P],gxAttack:false},
    {name:'Pale Moon-GX',cost:[P,C],gxAttack:true}
  ]}
]);
const energyCatalog={
  basicEnergies:new Set([BASIC]),
  specialEnergies:new Set([M3,'Mystery Energy PHF']),
  basicEnergyTypes:{Psychic:P,Lightning:4},
  colorlessEnergyType:C
};
/** @param {string[]} energy @returns {object} */
function view(energy=[M3]){
  return {decisionKind:'owner-root',ownPublic:{
    active:{printing:'Mewtwo & Mew-GX UNM',abilities:['Perfection'],
      energies:energy,specialConditions:[],publicRestrictions:{}},
    bench:[],discard:['Gengar & Mimikyu-GX TEU'],
    stadium:[],publicTurnRestrictions:{gxUsed:false}
  },opponentPublic:{active:{printing:'Pidgey MEW',abilities:[]},
    bench:[],stadium:[]}};
}

test('one M3 supplies one Psychic, making donor Horror House-GX paid',()=>{
  const v=view();
  assert.equal(publicPerfectionVeto(v),null);
  assert.deepEqual(knownPerfectionReadyOptions(v,energyCatalog,donorCatalog)
    .map(x=>x.attackName),['Horror House-GX']);
});

test('two known Psychic units unlock Poltergeist too; used GX removes Horror House',()=>{
  const v=view([M3,BASIC]);
  assert.deepEqual(knownPerfectionReadyOptions(v,energyCatalog,donorCatalog)
    .map(x=>x.attackName),['Poltergeist','Horror House-GX']);
  v.ownPublic.publicTurnRestrictions.gxUsed=true;
  assert.deepEqual(knownPerfectionReadyOptions(v,energyCatalog,donorCatalog)
    .map(x=>x.attackName),['Poltergeist']);
});

test('Temple replaces special Psychic with Colorless; unknown Special fails closed',()=>{
  const temple=view();
  temple.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(knownPerfectionReadyOptions(temple,energyCatalog,donorCatalog).length,0);
  const unknown=view(['Mystery Energy PHF']);
  assert.equal(knownPerfectionReadyOptions(unknown,energyCatalog,donorCatalog).length,0);
  const paid=view([M3,BASIC]);
  paid.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.deepEqual(knownPerfectionReadyOptions(paid,energyCatalog,donorCatalog)
    .map(x=>x.attackName),['Horror House-GX']);
});

test('known public locks veto an otherwise payable Perfection line',()=>{
  const thorns=view();
  thorns.opponentPublic.active={printing:'Iron Thorns ex TWM',
    abilities:['Initialization']};
  assert.match(publicPerfectionVeto(thorns),/ability-lock/);
  assert.equal(knownPerfectionReadyOptions(thorns,energyCatalog,donorCatalog).length,0);
  const garbo=view();
  garbo.opponentPublic.bench=[{printing:'Garbodor BKP',
    abilities:['Garbotoxin'],tools:['Float Stone PLF']}];
  assert.match(publicPerfectionVeto(garbo),/garbotoxin/);
  assert.equal(knownPerfectionReadyOptions(garbo,energyCatalog,donorCatalog).length,0);
  const path=view();
  path.opponentPublic.stadium=['Path to the Peak CRE'];
  assert.match(publicPerfectionVeto(path),/stadium/);
  assert.equal(knownPerfectionReadyOptions(path,energyCatalog,donorCatalog).length,0);
});

test('owner public Bench donor works without owner discard',()=>{
  const v=view([M3]);
  v.ownPublic.discard=[];
  v.ownPublic.bench=[{printing:'Gengar & Mimikyu-GX TEU',
    abilities:[],attacks:[]}];
  assert.deepEqual(knownPerfectionReadyOptions(v,energyCatalog,donorCatalog)
    .map(x=>x.attackName),['Horror House-GX']);
});

test('concealed opponent and owner deck identities never affect ready options',()=>{
  const a=view(),b=view();
  a.opponentHidden={hand:['inferred Trainer A'],prizes:['hidden A']};
  b.opponentHidden={hand:['inferred Trainer B'],prizes:['hidden B']};
  b.ownHiddenDeck=['any card'];
  assert.deepEqual(knownPerfectionReadyOptions(a,energyCatalog,donorCatalog),
    knownPerfectionReadyOptions(b,energyCatalog,donorCatalog));
});

test('own Mewtwo must be active, and unknown GX donor must stay unsupported',()=>{
  const v=view();
  v.ownPublic.active.printing='Latias ex SSP';
  assert.equal(knownPerfectionReadyOptions(v,energyCatalog,donorCatalog).length,0);
  const unknown=view();
  unknown.ownPublic.discard=['Arceus & Dialga & Palkia-GX CEC'];
  assert.equal(knownPerfectionReadyOptions(unknown,energyCatalog,donorCatalog).length,0);
});

test('global turn one has no legal copied-attack readiness',()=>{
  const v=view();
  v.globalTurn=1;
  assert.equal(publicPerfectionVeto(v),'first-turn');
  assert.equal(knownPerfectionReadyOptions(v,energyCatalog,donorCatalog).length,0);
});

test('Perfection root physical observer waits for native copied-attack declaration',()=>{
  const {rootPhysicalWitness}=require('../simulation/twinleaf/agent5-owner-root-slice.cjs');
  assert.equal(rootPhysicalWitness({kind:'perfection'}, {},{},{}),
    'attack-needs-declaration');
});

test('optional root policy emits native-typed Perfection Ability action and restores hooks',()=>{
  const {withActorOnlyRootPolicy}=require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
  class AddPlayerAction{}
  class PlayCardAction{}
  class AttackAction{}
  class PassTurnAction{}
  class RetreatAction{}
  class UseAbilityAction{
    constructor(id,name,target){this.id=id;this.name=name;this.target=target;}
  }
  const pokemonCard={fullName:'Mewtwo & Mew-GX UNM',
    name:'Mewtwo & Mew-GX',stage:1,cardType:[P],hp:270,
    weakness:[],resistance:[],retreat:[],attacks:[],
    powers:[{name:'Perfection'}]};
  const active=()=>({getPokemonCard:()=>pokemonCard,
    getPokemons:()=>[pokemonCard],cards:[pokemonCard],damage:0,
    energies:{cards:[]},tools:[],specialConditions:[]});
  const player=id=>({id,active:active(),bench:[],
    hand:{cards:[]},deck:{cards:[]},prizes:[],
    stadium:{cards:[]},discard:{cards:[]},lostzone:{cards:[]},
    supporter:{cards:[]}});
  class Store{
    constructor(){this.state={turn:3,phase:2,activePlayer:0,
      prompts:[],players:[player(11),player(22)]};}
    dispatch(){return true;}
  }
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){throw Error('Unqualified fallback');}
  }
  const oldBot=SimpleTacticsAi.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  const v=view();
  v.globalTurn=3;
  v.ownHand=[];
  v.ownTurnResources={energyPlayedTurn:0,energyPlayLocked:false,
    pokemonPlayLocked:false,specialEnergyPlayLocked:false};
  v.ownPublic.active.attacks=[{name:'Miraculous Duo-GX',
    cost:[P,P,C],gxAttack:true}];
  v.ownPublic.active.printed={types:[P]};
  const result=withActorOnlyRootPolicy(()=>{
    const store=new Store();
    store.dispatch(new AddPlayerAction());
    const choice=new SimpleTacticsAi(11).decodeNextAction(store.state);
    assert.ok(choice instanceof UseAbilityAction);
    assert.equal(choice.name,'Perfection');
    assert.deepEqual(choice.target,{player:0,slot:1,index:0});
    store.dispatch(choice);
    return choice;
  },{
    SimpleTacticsAi,Store,GamePhase:{PLAYER_TURN:2,FINISHED:7},
    getCatalog:()=>({...energyCatalog,perfectionDonors:donorCatalog,
      basics:new Set(),abilityBasics:new Set(),specialConditions:{ASLEEP:2,PARALYZED:0}}),
    observe:()=>v,perfectionRoot:true,
    cardActions:{PlayCardAction,PlayerType:{BOTTOM_PLAYER:0,ANY:2},
      SlotType:{ACTIVE:1,BENCH:2,BOARD:3}},
    gameActions:{AttackAction,PassTurnAction,RetreatAction,UseAbilityAction}
  });
  assert.equal(result.audit.perfectionRootOptIn,true);
  assert.equal(result.audit.acceptedActorRoots,1);
  assert.equal(result.audit.rejectedActorRoots,0);
  assert.equal(result.audit.nativeAttackNeedsDeclaration,1);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldBot);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
});
