'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseEscapeRope,VERSION}=
  require('../simulation/twinleaf/agent42-actor-escape-rope-frontier.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const P=5,C=9;
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:P},colorlessEnergyType:C,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};

/** Genuine-rank11-compatible detached owner/public shape. */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:20,
    ownHand:['Ace Trainer AOR','Secret Box TWM','Escape Rope BST'],
    ownTurnResources:{itemPlayLocked:false,energyPlayedTurn:0,
      energyPlayLocked:false,pokemonPlayLocked:false},
    ownPublic:{
      active:{name:'Galarian Articuno V',energies:[],
        specialConditions:[],publicRestrictions:{},
        attacks:[{name:'Psyray',cost:[P,C,C],gxAttack:false}]},
      bench:[{name:'Duskull',energies:[],attacks:[]},
        {name:'Gengar & Mimikyu-GX',energies:[],attacks:[]},null],
      deckCount:30,prizeCount:6,
      stadium:[],publicTurnRestrictions:{itemPlayLocked:false}
    },
    opponentPublic:{
      active:{name:'Oranguru V',
        energies:['Darkness Energy MEE','Darkness Energy MEE',
          'Darkness Energy MEE'],attacks:[{name:'Psychic',cost:[C,C,C]}]},
      bench:[{name:'Garbodor',energies:[],attacks:[]},
        {name:'Crobat V',energies:[],attacks:[]},null],
      prizeCount:5,stadium:[]
    }
  };
}
test('genuine rank11-like hand offers opponent-first Item switch at last chance',()=>{
  const v=view();
  assert.deepEqual(chooseEscapeRope(v),{
    kind:'play-escape-rope',handIndex:2,printing:'Escape Rope BST'
  });
  assert.equal(chooseActorRootIntent(v,catalog,{}).kind,'pass');
  assert.deepEqual(chooseActorRootIntent(v,catalog,{escapeRopeRoot:true}),
    chooseEscapeRope(v));
  assert.match(VERSION,/agent42-actor/);
});
test('requires held rope, both benches, energized opponent and no Item lock',()=>{
  const v=view();
  v.ownHand=['Ace Trainer AOR'];
  assert.equal(chooseEscapeRope(v),null);
  v.ownHand.push('Escape Rope BST');
  v.ownTurnResources.itemPlayLocked=true;
  assert.equal(chooseEscapeRope(v),null);
  v.ownTurnResources.itemPlayLocked=false;
  v.ownPublic.publicTurnRestrictions.itemPlayLocked=true;
  assert.equal(chooseEscapeRope(v),null);
  v.ownPublic.publicTurnRestrictions.itemPlayLocked=false;
  v.ownPublic.bench=[null,null];
  assert.equal(chooseEscapeRope(v),null);
  v.ownPublic.bench=[{name:'Duskull',energies:[]}];
  v.opponentPublic.bench=[null];
  assert.equal(chooseEscapeRope(v),null);
  v.opponentPublic.bench=[{name:'Crobat V',energies:[]}];
  v.opponentPublic.active.energies=[];
  assert.equal(chooseEscapeRope(v),null);
  v.opponentPublic.active.energies=['Darkness Energy MEE'];
  v.opponentPublic.bench[0].energies=['Psychic Energy MEE'];
  assert.equal(chooseEscapeRope(v),null);
});
test('known ready attack retains priority over disruptive rope and no hidden read',()=>{
  const v=view();
  v.ownHand=['Escape Rope BST'];
  v.ownPublic.active.energies=[
    'Psychic Energy MEE','Psychic Energy MEE','Psychic Energy MEE'];
  assert.equal(chooseActorRootIntent(v,catalog,{escapeRopeRoot:true}).kind,
    'attack');
  const a=view(),b=view();
  Object.defineProperty(a,'opponentHidden',{get(){
    throw new Error('Forbidden opponent concealed zone accessed');
  }});
  b.opponentHidden={hand:['private marker'],deck:['private'],prizes:[]};
  assert.deepEqual(chooseEscapeRope(a),chooseEscapeRope(b));
});
