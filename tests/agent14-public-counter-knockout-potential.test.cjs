'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {counterKnockoutPrerequisite:check}=require(
  '../simulation/twinleaf/agent14-public-counter-knockout-potential.cjs');

/**
 * @param {number} damage Amount of damage in points, not counters.
 * @returns {object} Detached opponent-public board.
 */
function view(damage){
  return {decisionKind:'owner-root',ownPublic:{},
    opponentPublic:{
      active:{printing:'Unown AOR',damage,hp:60,tools:[]},
      bench:[]
    }};
}

const terminal={name:'Terminal Period',damage:0,
  text:"If your opponent's Active Pokémon has exactly 6 damage counters on it, that Pokémon is Knocked Out."};

test('observed source Unown with zero damage never qualifies',()=>{
  assert.deepEqual(check(view(0),terminal),{
    recognized:true,satisfied:false,condition:'exact-count',
    requiredDamage:60,targets:[]
  });
});

test('exact six counters is a conditional witness, not paper legality',()=>{
  const actual=check(view(60),terminal);
  assert.equal(actual.satisfied,true);
  assert.equal(actual.targets[0].observedDamage,60);
  assert.equal(actual.targets[0].printing,'Unown AOR');
});

test('extra seventh counter fails exact six prerequisite',()=>{
  assert.equal(check(view(70),terminal).satisfied,false);
});

test('Gengar Creep Show permits >=3 damage counters',()=>{
  const attack={text:
    "If your opponent's Active Pokémon has 3 or more damage counters on it, that Pokémon is Knocked Out."};
  assert.equal(check(view(20),attack).satisfied,false);
  assert.equal(check(view(30),attack).satisfied,true);
});

test('Glaceon Euclase can satisfy exact six on a public Bench target',()=>{
  const attack={text:
    "Knock Out 1 of your opponent's Pokémon that has exactly 6 damage counters on it."};
  const v=view(0);
  v.opponentPublic.bench=[{printing:'Snorlax SVI',damage:60,hp:150}];
  const actual=check(v,attack);
  assert.equal(actual.satisfied,true);
  assert.equal(actual.targets[0].slot,'bench');
  assert.equal(actual.targets[0].index,0);
});

test('unknown printed effects fail closed and hidden zones never read',()=>{
  const v=view(0);
  const hidden=new Proxy({},{get(){throw Error('private zone read');}});
  v.opponentPublic.deck=hidden;
  v.opponentPublic.hand=hidden;
  v.opponentPublic.prizes=hidden;
  v.ownPublic.prizes=hidden;
  assert.equal(check(v,terminal).satisfied,false);
  assert.deepEqual(check(v,{text:'Choose another attack.'}),{
    recognized:false,satisfied:false,condition:null,
    requiredDamage:null,targets:[]
  });
});
