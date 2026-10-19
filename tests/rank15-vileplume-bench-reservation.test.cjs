'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  rank15BenchNeeds,rank15ReservedBasicPlay
}=require('../simulation/twinleaf/rank15-vileplume-bench-reservation.cjs');
const playerPhase=4;

/** @param {string|null} fullName */
const slot=fullName=>({getPokemonCard:()=>
  fullName?{fullName}:null});

/**
 * @param {string|null} active
 * @param {(string|null)[]} bench
 * @param {object[]} cards
 * @returns {object}
 */
function owner(active,bench,cards){
  return {
    active:slot(active),
    bench:bench.map(slot),
    hand:{cards}
  };
}
/** @param {number} handIndex */
const play=handIndex=>({constructor:{name:'PlayCardAction'},handIndex});

test('reserves two open Stage-line Bench positions while Bunnelby is Active',()=>{
  const p=owner('Bunnelby PRC',
    ['Fan Rotom SCR','Budew ASC','Tatsugiri TWM',null,null],
    [{fullName:'Buneary M2',stage:0}]);
  assert.deepEqual(rank15BenchNeeds(p),{
    lineSlots:0,needed:2,free:2,hasBunnelby:true
  });
  assert.deepEqual(rank15ReservedBasicPlay(
    play(0),p,2,playerPhase,playerPhase),{
    proposed:'Buneary M2',needed:2,free:2,lineSlots:0
  });
});

test('after first Oddish, preserve the one remaining Stage-line slot',()=>{
  const p=owner('Bunnelby PRC',
    ['Oddish UNB','Fan Rotom SCR','Budew ASC','Buneary M2',null],
    [{fullName:'Tatsugiri TWM',stage:0}]);
  assert.equal(rank15BenchNeeds(p).needed,1);
  assert.equal(rank15ReservedBasicPlay(
    play(0),p,4,playerPhase,playerPhase)?.proposed,'Tatsugiri TWM');
  p.bench[4]=slot('Gloom UNB');
  assert.equal(rank15BenchNeeds(p).needed,0);
  assert.equal(rank15ReservedBasicPlay(
    play(0),p,4,playerPhase,playerPhase),null);
});

test('stage evolution, Oddish, Trainer and Energy are exempt',()=>{
  const p=owner('Bunnelby PRC',
    ['Fan Rotom SCR','Budew ASC','Buneary M2',null,null],
    [
      {fullName:'Oddish UNB',stage:0},
      {fullName:'Gloom UNB',stage:1,evolvesFrom:'Oddish'},
      {fullName:'Grand Tree SCR'},
      {fullName:'Jet Energy PAL'}
    ]);
  for(let i=0;i<4;i++) assert.equal(rank15ReservedBasicPlay(
    play(i),p,2,playerPhase,playerPhase),null);
});

test('does not reserve before Bunnelby or outside the declared early turn',()=>{
  const p=owner('Fan Rotom SCR',
    ['Budew ASC','Buneary M2','Tatsugiri TWM',null,null],
    [{fullName:'Pidgey FLF',stage:0}]);
  assert.equal(rank15ReservedBasicPlay(
    play(0),p,2,playerPhase,playerPhase),null);
  p.active=slot('Bunnelby PRC');
  assert.equal(rank15ReservedBasicPlay(
    play(0),p,11,playerPhase,playerPhase),null);
  assert.equal(rank15ReservedBasicPlay(
    play(0),p,2,3,playerPhase),null);
  assert.equal(rank15ReservedBasicPlay(
    {constructor:{name:'AttackAction'}},p,2,playerPhase,playerPhase),null);
});

test('visible state audit never opens source hidden deck or Prizes',()=>{
  const p=owner('Bunnelby PRC',
    ['Fan Rotom SCR','Budew ASC','Tatsugiri TWM',null,null],
    [{fullName:'Pidgey FLF',stage:0}]);
  Object.defineProperty(p,'deck',{get(){throw Error('hidden deck leaked');}});
  Object.defineProperty(p,'prizes',{get(){throw Error('face-down Prize leaked');}});
  assert.equal(rank15ReservedBasicPlay(
    play(0),p,2,playerPhase,playerPhase)?.needed,2);
});
