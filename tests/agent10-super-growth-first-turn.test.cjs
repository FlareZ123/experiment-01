'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  ROWLET,loadDeck,makePhysicalDeck,state,superGrowth,tmBarrage,
  wilson95,simulate,run,SOURCE,CHALLENGER
}=require('../scripts/agent10-super-growth-first-turn.cjs');

const R='Rowlet & Alolan Exeggutor-GX';

/** Construct a complete physical deck with fixed first-seven, six Prizes, and turn-two draw.
 * @param {Map<string,number>} deck @param {string[]} seven
 * @param {string[]} prizes @param {string} draw
 */
function deal(deck,seven,prizes,draw){
  const bag=makePhysicalDeck(deck);
  const first=[...seven,...prizes,draw];
  assert.equal(seven.length,7);
  assert.equal(prizes.length,6);
  for(const name of first){
    const i=bag.indexOf(name);
    assert.notEqual(i,-1,'Missing genuine printed card '+name);
    bag.splice(i,1);
  }
  return [...first,...bag];
}

test('two-slot candidate is one fixed playable 60; both evolution stages preserved',()=>{
  const a=loadDeck(SOURCE),b=loadDeck(CHALLENGER);
  assert.equal(a.get('Technical Machine: Evolution'),2);
  assert.equal(b.has('Technical Machine: Evolution'),false);
  assert.equal(b.get(R),2);
  for(const n of ['Gloom','Vileplume','Oddish','Tag Call','Guzma & Hala']){
    assert.equal(b.get(n),a.get(n));
  }
  assert.equal(makePhysicalDeck(b).length,60);
  console.log('SFT: validated unchanged core and exact 2-slot replacement');
});

test('physical opening Tag Call fetches both TAG TEAM and Supporter, then Hala reaches Artazon+Jet',()=>{
  const b=loadDeck(CHALLENGER);
  const sh=deal(b,
    ['Bunnelby','Tag Call','Karen','Guzma','Lillipup','Pidgey','Stealthy Hood'],
    ['Capture Energy','Grass Energy','Mega Lopunny ex','Pidgeot ex',
      'Bellelba & Brycen-Man','Counter Gain'],
    'Plumeria');
  const s=state(sh,'super');
  assert.equal(s.active,'Bunnelby');
  assert.equal(s.hand.get(R)||0,0);
  assert.equal(s.hand.get('Guzma & Hala')||0,0);
  assert.equal(superGrowth(s),'REACHABLE');
  console.log('SFT: single genuine Tag Call, actual deck fetch, Hala discard reserves, Artazon Oddish, Jet switch, Super Growth');
});

test('opening Rowlet Active and held Oddish needs no Supporter, Jet or discard payment',()=>{
  const b=loadDeck(CHALLENGER);
  const sh=deal(b,
    [R,'Oddish','Pidgey','Karen','Guzma','Lillipup','Stealthy Hood'],
    ['Capture Energy','Grass Energy','Mega Lopunny ex','Pidgeot ex',
      'Bellelba & Brycen-Man','Counter Gain'],
    'Plumeria');
  assert.equal(superGrowth(state(sh,'super')),'REACHABLE');
  console.log('SFT: zero-Energy attack route without Supporter or forced payment');
});

test('paid Jet retrieval cannot fabricate two uncommitted physical discard cards',()=>{
  const fake={
    active:'Bunnelby',
    hand:new Map([['Rowlet & Alolan Exeggutor-GX',1],['Oddish',1],
      ['Guzma & Hala',1],['Karen',1]]),
    deck:new Map([['Gloom',2],['Vileplume',2],['Jet Energy',3]])
  };
  assert.equal(superGrowth(fake),'HALA_PAYMENT_UNAVAILABLE');
  console.log('SFT: two-card mandatory payment unavailable; route rejected');
});

test('a Stage 2 card in hand cannot be fetched by Super Growth from deck',()=>{
  const s={active:R,hand:new Map([['Oddish',1],['Vileplume',2]]),
    deck:new Map([['Gloom',2]])};
  assert.equal(superGrowth(s),'EVOLUTION_NOT_IN_DECK');
  console.log('SFT: forbids inaccessible Stage 2 from hand');
});

test('source Bunnelby route requires actual TM and one Energy to attack twice',()=>{
  const a=loadDeck(SOURCE);
  const sh=deal(a,
    ['Bunnelby','Oddish','Technical Machine: Evolution','Jet Energy',
      'Karen','Guzma','Pidgey'],
    ['Capture Energy','Grass Energy','Mega Lopunny ex','Pidgeot ex',
      'Bellelba & Brycen-Man','Counter Gain'],'Plumeria');
  assert.equal(tmBarrage(state(sh,'tm')),'REACHABLE');
  console.log('SFT: original Bunnelby Ω Barrage double TM Evolution route');
});

test('fixed-seed whole-60 Monte Carlo is reproducible without same-deal pairing',()=>{
  const b=loadDeck(CHALLENGER);
  const a=simulate(b,'super',300,20261109);
  const c=simulate(b,'super',300,20261109);
  assert.deepEqual(a,c);
  assert.equal(Object.values(a.firstFailedPrerequisite).reduce((x,y)=>x+y,0),a.validSeven);
  assert.ok(a.reachable<=a.validSeven);
  const r=run(300);
  assert.ok(r.differenceInConditionalOpportunity<1);
  assert.equal(r.competitiveQualifiedGames,0);
  assert.ok(wilson95(30,60)[0]<0.5&&wilson95(30,60)[1]>0.5);
  console.log('SFT: fully reproducible original physical 60-card shuffle; n=300 each');
});
