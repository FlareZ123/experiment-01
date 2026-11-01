'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseKnownDeadLeadingAttack,VERSION}=
  require('../simulation/twinleaf/agent1-actor-dead-first-attack-frontier.cjs');
const field=require('../results/aichi-2026/full-decklists.json');

const family={name:'Call for Family',damage:0,cost:[7]};
const poison={name:'Super Poison Breath',damage:20,cost:[7,9]};

/** @param {number} occupied @param {number} size */
function view(occupied=5,size=5){
  return {
    decisionKind:'owner-root',
    ownPublic:{
      active:{printing:'Trubbish FST',name:'Trubbish'},
      bench:Array.from({length:size},(_,i)=>
        i<occupied?{printing:'Mega Absol ex M1L'}:null)
    },
    opponentPublic:{
      active:{printing:'Shadow Rider Calyrex V CRE',damage:0},
      handCount:4,discard:[]
    }
  };
}

test('authentic original rank11 prints exactly two Fusion Strike Trubbish 168',()=>{
  const original=field.decks.find(x=>x.rank===11);
  assert.ok(original);
  const cards=original.cards.filter(x=>x.name==='Trubbish');
  assert.equal(cards.length,1);
  assert.equal(cards[0].count,2);
  assert.equal(cards[0].printing.set,'FST');
  assert.equal(cards[0].printing.number,'168');
  assert.equal(VERSION,'agent1-actor-known-dead-leading-attack-v2-trubbish-fullbench');
});

test('full five-slot Bench prefers fully payable damaging Poison alternative',()=>{
  assert.deepEqual(chooseKnownDeadLeadingAttack(view(),[family,poison]),{
    attackName:'Super Poison Breath',
    reason:'Call for Family cannot place a Basic onto a full Bench'
  });
});

test('an open fifth or expanded eighth Bench slot keeps search candidate',()=>{
  assert.equal(chooseKnownDeadLeadingAttack(view(4),[family,poison]),null);
  assert.equal(chooseKnownDeadLeadingAttack(view(7,8),[family,poison]),null);
  assert.equal(chooseKnownDeadLeadingAttack(view(8,8),[family,poison])?.
    attackName,'Super Poison Breath');
});

test('unpayable Poison, different printing and altered printed damage fail closed',()=>{
  assert.equal(chooseKnownDeadLeadingAttack(view(),[family]),null);
  assert.equal(chooseKnownDeadLeadingAttack(view(),[family,
    {...poison,damage:10}]),null);
  const v=view();v.ownPublic.active.printing='Trubbish DRI';
  assert.equal(chooseKnownDeadLeadingAttack(v,[family,poison]),null);
  assert.equal(chooseKnownDeadLeadingAttack(view(),[poison,family]),null);
  const short=view();short.ownPublic.bench=[];
  assert.equal(chooseKnownDeadLeadingAttack(short,[family,poison]),null);
});

test('opponent private hand and unknown future deck do not enter preference',()=>{
  const a=view(),b=view();
  a.opponentPublic.handCount=0;b.opponentPublic.handCount=9;
  b.opponentPublic.discard=['Mystery card'];
  assert.deepEqual(chooseKnownDeadLeadingAttack(a,[family,poison]),
    chooseKnownDeadLeadingAttack(b,[family,poison]));
});
