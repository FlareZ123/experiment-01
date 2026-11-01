'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=require('../results/aichi-2026/full-decklists.json');
const sets=require('../resources/sets/en.json');
const {sourcePrintedCard}=require('../scripts/agent30-roster-direct-energy-census.cjs');
const {assessDirectEnergy}=require('../simulation/twinleaf/agent30-source-attack-energy-reachability.cjs');
const {registeredSixtyAttackEnergyCeiling}=
  require('../simulation/twinleaf/actor-energy-payability.cjs');

const rank30=source.decks.find(deck=>deck.rank===30);
const readCards=id=>{
  const filename=path.join(__dirname,'../resources/cards/en',id+'.json');
  return fs.existsSync(filename)?
    JSON.parse(fs.readFileSync(filename,'utf8')):[];
};
const resolve=entry=>sourcePrintedCard(entry.printing,entry.name,sets,readCards);
const context={isBasic:true,isEvolution:false,isDragon:false,
  hasRuleBox:true,behindOnPrizes:false};

test('authenticated original rank30: exact printed Empoleon and Energy list',()=>{
  assert.equal(source.published_deck_count,29);
  assert.equal(rank30.cards.reduce((n,c)=>n+c.count,0),60);
  const emp=rank30.cards.find(c=>c.name==='Empoleon V');
  assert.equal(emp.count,1);
  assert.deepEqual([emp.printing.set,emp.printing.number],['BST','40']);
  const printed=resolve(emp);
  assert.equal(printed.id,'swsh5-40');
  assert.deepEqual(printed.attacks,[{
    name:'Swirling Slice',cost:['Water','Colorless','Colorless'],
    convertedEnergyCost:3,damage:'130',
    text:'Move an Energy from this Pokémon to 1 of your Benched Pokémon.'
  }]);
  const energy=rank30.cards.filter(c=>c.category==='Energy');
  assert.deepEqual(energy.map(c=>[c.name,c.count]),[
    ['Psychic Energy',5],['Telepathic Psychic Energy',2]
  ]);
  const telepathic=resolve(energy[1]);
  assert.equal(telepathic.id,'me3-88');
  assert.ok(telepathic.rules[0].startsWith(
    'As long as this card is attached to a Pokémon, it provides Psychic Energy.'));
});

test('entire own original Energy roster cannot meet Swirling Slice Water',()=>{
  const costs=['Water','Colorless','Colorless'];
  const ceiling=registeredSixtyAttackEnergyCeiling(
    ['W','C','C'],rank30.cards,context);
  assert.equal(ceiling.possible,false);
  assert.deepEqual(ceiling.unknownEnergyPrintings,[]);
  assert.equal(ceiling.knownEnergyUnits,7);
  const direct=assessDirectEnergy(
    {types:['Water'],stage:'Basic'},costs,
    rank30.cards.filter(c=>c.category==='Energy')
      .map(c=>({name:c.name,count:c.count})));
  assert.deepEqual([direct.status,direct.knownUnits,direct.unknownEnergy],
    ['IMPOSSIBLE',7,[]]);
});

test('necessary-Water screen responds to a counterfactual Water card',()=>{
  // Hypothetical list, distinct from the authenticated original 60.
  const modified=rank30.cards.map(c=>c.name==='Psychic Energy'?
    {...c,name:'Water Energy',count:c.count}:c);
  const ceiling=registeredSixtyAttackEnergyCeiling(
    ['W','C','C'],modified,context);
  assert.equal(ceiling.possible,true);
});
