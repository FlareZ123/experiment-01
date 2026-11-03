'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {printedCard,rank26Exposure}=
  require('../scripts/agent2-rank26-basic-ability-exposure.cjs');
const root=path.resolve(__dirname,'..');
const roster=JSON.parse(fs.readFileSync(
  path.join(root,'results/aichi-2026/full-decklists.json'),'utf8'));

test('rank26 exact source has seven Basic Ability classes in 11 of 12 copies',()=>{
 const x=rank26Exposure(roster,root);
 assert.equal(x.sourceRank,26);
 assert.equal(x.sourceTotalCards,60);
 assert.equal(x.sourceBasicCopies,12);
 assert.equal(x.sourceBasicCopiesWithAbility,11);
 assert.equal(x.sourceDistinctBasicAbilityNames,7);
 assert.equal(x.qualifiedCompetitiveGames,0);
 assert.deepEqual(x.abilityRows.filter(x=>x.basicAbilityNames.length)
   .map(x=>x.name),
   ['Unown','Exeggcute','Meloetta ex','Tapu Koko ◇',
     'Squawkabilly ex','Crobat V','Dedenne-GX']);
 assert.equal(x.abilityRows.find(x=>x.name==='Unown').copies,4);
 assert.equal(x.abilityRows.find(x=>x.name==='Exeggcute').copies,2);
});

test('printed Muk covers in-play, hand and discard Basic abilities',()=>{
 const muk=printedCard(root,'sm1-58');
 assert.equal(muk.name,'Alolan Muk');
 assert.equal(muk.subtypes.includes('Basic'),false);
 assert.equal(muk.abilities[0].name,'Power of Alchemy');
 assert.equal(muk.abilities[0].text,
   "Each Basic Pokémon in play, in each player's hand, and in each player's discard pile has no Abilities.");
});

test('Bunnelby Omega Barrage Ancient Trait is a strict negative control',()=>{
 const bunnelby=printedCard(root,'xy5-121');
 assert.equal(bunnelby.name,'Bunnelby');
 assert.ok(!bunnelby.abilities?.length);
 assert.equal(bunnelby.ancientTrait?.name,'Ω Barrage');
});

test('Meloetta special first turn condition and all seven printed names',()=>{
 const x=rank26Exposure(roster,root);
 const names=x.abilityRows.flatMap(r=>r.basicAbilityNames);
 assert.deepEqual(names,['Farewell Letter','Propagation','Debut Performance',
   'Dance of the Ancients','Squawk and Seize','Dark Asset','Dedechange']);
 assert.match(printedCard(root,'zsv10pt5-44').abilities[0].text,
  /If you go first/);
});
