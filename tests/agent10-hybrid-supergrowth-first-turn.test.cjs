'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {loadDeck,makePhysicalDeck,ROWLET}=
  require('../scripts/agent10-super-growth-first-turn.cjs');
const {HYBRID,hybridState,hybridOpportunity,simulateHybrid,run}=
  require('../scripts/agent10-hybrid-supergrowth-first-turn.cjs');

/** @param {string[]} seven @param {string[]} prizes @param {string} draw */
function deal(seven,prizes,draw){
  const bag=makePhysicalDeck(loadDeck(HYBRID));
  const first=[...seven,...prizes,draw];
  assert.equal(seven.length,7);
  assert.equal(prizes.length,6);
  for(const name of first){
    const i=bag.indexOf(name);
    assert.notEqual(i,-1,'Missing actual hybrid printed card '+name);
    bag.splice(i,1);
  }
  return [...first,...bag];
}
const prizes=['Capture Energy','Grass Energy','Mega Lopunny ex',
  'Pidgeot ex','Bellelba & Brycen-Man','Counter Gain'];

test('hybrid 60 retains both one-attack direct evolution and Bunnelby fallback',()=>{
  const counts=loadDeck(HYBRID);
  assert.equal(counts.get(ROWLET),1);
  assert.equal(counts.get('Technical Machine: Evolution'),1);
  assert.equal(makePhysicalDeck(counts).length,60);
  console.log('Hybrid SFT: one physical Tag Team and one physical Evolution Tool');
});

test('both starters in seven always selects Rowlet before unknown Prizes',()=>{
  const sh=deal([ROWLET,'Bunnelby','Oddish','Guzma','Karen',
      'Lillipup','Stealthy Hood'],prizes,'Plumeria');
  assert.equal(hybridState(sh).active,ROWLET);
  assert.equal(hybridOpportunity(hybridState(sh)),'REACHABLE_SUPERGROWTH');
  console.log('Hybrid SFT: starting Active fixed before Prize mapping');
});

test('Bunnelby starts when Rowlet absent and TM can still establish Vileplume',()=>{
  const sh=deal(['Bunnelby','Oddish','Technical Machine: Evolution',
    'Jet Energy','Guzma','Karen','Pidgey'],prizes,'Plumeria');
  assert.equal(hybridState(sh).active,'Bunnelby');
  assert.equal(hybridOpportunity(hybridState(sh)),'REACHABLE_TM_BARRAGE');
  console.log('Hybrid SFT: genuine one-copy TM backup when Rowlet is inaccessible');
});

test('two-route union is deterministic, failure inclusive, no implied wins',()=>{
  const a=simulateHybrid(500,20261111);
  const b=simulateHybrid(500,20261111);
  assert.deepEqual(a,b);
  assert.ok(a.reachable<=a.validSeven);
  assert.equal(a.validSeven,
    Object.values(a.routeBreakdown).reduce((x,y)=>x+y,0));
  const result=run(500);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.sourceAndSuperDoNotSharePhysicalDeals,true);
  console.log('Hybrid SFT: stable 60-card shuffling and zero qualified games');
});
