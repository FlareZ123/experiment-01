'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {SEEKER,LILLIE,VERSION,
  chooseSeekerLillieRoot,chooseSeekerLilliePrompt}=
  require('../simulation/twinleaf/agent48-owner-vs-seeker-lillie.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('../simulation/twinleaf/agent5-owner-root-slice.cjs');

const catalog={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
  specialEnergies:new Set(),basicEnergyTypes:{},
  colorlessEnergyType:9,specialConditions:{ASLEEP:2,PARALYZED:0}
};

function view(hand=[SEEKER],discard=[LILLIE]){
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:6,
    ownHand:[...hand],
    ownTurnResources:{
      itemPlayLocked:false,supporterPlayLocked:false,
      supporterPlayedTurn:0,energyPlayLocked:false,
      energyPlayedTurn:0,pokemonPlayLocked:false,
      specialEnergyPlayLocked:false,
      stadiumPlayLocked:false,stadiumPlayedTurn:0
    },
    ownPublic:{
      active:{name:'Regidrago V',energies:[],attacks:[],
        specialConditions:[],publicRestrictions:{}},
      bench:[null,null,null,null,null],discard:[...discard],
      deckCount:38,prizeCount:6,stadium:[],resolvingSupporter:[],
      publicTurnRestrictions:{supporterPlayLocked:false}
    },
    opponentPublic:{handCount:7,stadium:[],active:null},
    opponentPrivateHand:['NOT_AVAILABLE'],
    ownerUnsearchedDeckOrder:['NOT_AVAILABLE']
  };
}

test('pure owner root selects physically held Seeker into own-public Lillie',()=>{
  const input=view();
  assert.equal(VERSION,'agent48-owner-seeker-lillie-v1');
  assert.equal(chooseActorRootIntent(input,catalog).kind,'pass');
  const planned={kind:'play-seeker-get-lillie',handIndex:0,
    printing:SEEKER,target:LILLIE};
  assert.deepEqual(chooseSeekerLillieRoot(input),planned);
  assert.deepEqual(chooseActorRootIntent(input,catalog,{
    seekerLillieRoot:true
  }),planned);
});

test('follow-up actual held Lillie spends the next free Supporter root',()=>{
  const input=view([LILLIE],[]);
  const planned={kind:'play-seeker-recovered-lillie',
    handIndex:0,printing:LILLIE,target:LILLIE};
  assert.deepEqual(chooseSeekerLillieRoot(input),planned);
  assert.deepEqual(chooseActorRootIntent(input,catalog,{
    seekerLillieRoot:true
  }),planned);
  assert.equal(chooseActorRootIntent(input,catalog).kind,'pass');
});

test('first player, root count, deck, discard, lock, and discard cost gates',()=>{
  const root=view();
  root.globalTurn=1;
  assert.equal(chooseSeekerLillieRoot(root),null);
  root.globalTurn=6;
  root.ownTurnResources.supporterPlayedTurn=6;
  assert.equal(chooseSeekerLillieRoot(root),null);
  root.ownTurnResources.supporterPlayedTurn=0;
  root.ownTurnResources.itemPlayLocked=true;
  assert.equal(chooseSeekerLillieRoot(root),null);
  root.ownTurnResources.itemPlayLocked=false;
  root.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;
  assert.equal(chooseSeekerLillieRoot(root),null);
  root.ownPublic.publicTurnRestrictions.supporterPlayLocked=false;
  root.ownPublic.deckCount=7;
  assert.equal(chooseSeekerLillieRoot(root),null);
  root.ownPublic.deckCount=38;
  root.ownHand=[SEEKER,'ACE SPEC TEST','Unique Supporter TEST','Vital VSTAR TEST'];
  assert.equal(chooseSeekerLillieRoot(root),null);
  root.ownHand=[SEEKER];
  root.ownPublic.discard=[];
  assert.equal(chooseSeekerLillieRoot(root),null);
  root.ownPublic.discard=[LILLIE];
  root.ownPublic.active=null;
  assert.equal(chooseSeekerLillieRoot(root),null);
});

test('owner-only selected live discard prompt returns a physical card',()=>{
  class ChooseCardsPrompt{
    validate(selected){return selected.length===1&&
      this.cards.cards.includes(selected[0]);}
  }
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  const support={fullName:LILLIE};
  const ownDiscard={cards:[{fullName:'Guzma BUS'},support]};
  const owner={id:101,discard:ownDiscard};
  const rival={id:202,discard:{cards:[{fullName:'HIDDEN RIVAL'}]}};
  const state={players:[owner,rival],privateDeck:['UNSEEN']};
  const prompt=new ChooseCardsPrompt();
  Object.assign(prompt,{id:42,playerId:101,result:undefined,
    cards:ownDiscard});
  const action=chooseSeekerLilliePrompt(state,0,prompt,ResolvePromptAction);
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.id,42);
  assert.strictEqual(action.result[0],support);
  const other={...state,privateDeck:['CHANGED SECRET'],
    players:[owner,{...rival,discard:{cards:[{fullName:'DIFFERENT SECRET'}]}}]};
  assert.strictEqual(
    chooseSeekerLilliePrompt(other,0,prompt,ResolvePromptAction).result[0],
    support);
  assert.throws(()=>chooseSeekerLilliePrompt(state,1,prompt,
    ResolvePromptAction));
  prompt.cards=rival.discard;
  assert.throws(()=>chooseSeekerLilliePrompt(state,0,prompt,
    ResolvePromptAction),/own/i);
});

function physical(ownerHand,discard,quota){
  const zeroPokemon={
    getPokemonCard:()=>null,getPokemons:()=>[],
    energies:{cards:[]},tools:[]
  };
  return {players:[{
    hand:{cards:ownerHand.map(fullName=>({fullName}))},
    discard:{cards:discard.map(fullName=>({fullName}))},
    supporter:{cards:[]},active:zeroPokemon,
    bench:[zeroPokemon,zeroPokemon,zeroPokemon,zeroPokemon,zeroPokemon],
    supporterTurn:quota,stadium:{cards:[]}
  }],turn:6,phase:1};
}

test('physical Store witness handles Seeker card departure and Carmine quota',()=>{
  const itemIntent={kind:'play-seeker-get-lillie',printing:SEEKER};
  const before=rootPhysicalSnapshot(physical([SEEKER],[],0),0,itemIntent);
  const after=rootPhysicalSnapshot(physical([], [SEEKER],0),0,itemIntent);
  assert.equal(rootPhysicalWitness(itemIntent,before,after,{FINISHED:7}),
    'confirmed-public-effect');
  const invalid=rootPhysicalSnapshot(physical([SEEKER],[],0),0,itemIntent);
  assert.equal(rootPhysicalWitness(itemIntent,before,invalid,{FINISHED:7}),
    'no-confirmed-public-effect');

  for(const [kind,printed] of [
    ['play-carmine-first','Carmine TWM'],
    ['play-seeker-recovered-lillie',LILLIE]
  ]){
    const intent={kind,printing:printed};
    const b=rootPhysicalSnapshot(physical([printed],[],0),0,intent);
    const a=rootPhysicalSnapshot(physical([], [printed],1),0,intent);
    assert.equal(rootPhysicalWitness(intent,b,a,{FINISHED:7}),
      'confirmed-public-effect',kind);
  }
});

test('all new root and prompt decisions exclude opponent private information',()=>{
  const a=view();
  const b=structuredClone(a);
  b.opponentPrivateHand=['SECRET 1','SECRET 2'];
  b.ownerUnsearchedDeckOrder=['SECRET 3'];
  assert.deepEqual(chooseSeekerLillieRoot(a),chooseSeekerLillieRoot(b));
});
