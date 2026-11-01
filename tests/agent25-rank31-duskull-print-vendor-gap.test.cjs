'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');

test('original rank31 Duskull PRE printed attack uses discard, with zero-cost output',()=>{
  const cards=require('../resources/cards/en/sv8pt5.json');
  const card=cards.find(entry=>entry.id==='sv8pt5-35');
  assert.equal(card?.name,'Duskull');
  assert.equal(card.attacks[0].name,'Come and Get You');
  assert.deepEqual(card.attacks[0].cost,['Psychic']);
  assert.equal(card.attacks[0].text,
    'Put up to 3 Duskull from your discard pile onto your Bench.');
  const roster=require('../results/aichi-2026/full-decklists.json');
  const rank31=roster.decks.find(deck=>deck.rank===31);
  assert.equal(rank31.cards.find(c=>c.name==='Duskull')?.printing.set,'PRE');
  assert.equal(rank31.cards.find(c=>c.name==='Duskull')?.printing.number,'35');
});

test('pinned native PRE implementation inherits SFA Duskull hand/discard mismatch',()=>{
  const read=p=>fs.readFileSync(path.join(ROOT,'vendor/twinleaf',p),'utf8');
  const inherited=read(
    'ptcg-server/src/sets/10-scarlet-and-violet/set-prismatic-evolution/alt-arts.ts');
  const source=read(
    'ptcg-server/src/sets/10-scarlet-and-violet/set-shrouded-fable/duskull.ts');
  assert.match(inherited,/class DuskullPRE extends Duskull/);
  assert.match(inherited,/fullName\s*=\s*'Duskull PRE'/);
  assert.match(source,/hasDuskullInDiscard\s*=\s*player\.hand\.cards\.some/);
  assert.match(source,/new ChooseCardsPrompt\(/[\s\S]*?player\.discard/);
  assert.match(source,/CANNOT_USE_POWER/);
  assert.match(source,/name:\s*'Come and Get You'/);
});

test('advanced rulebook attack zero-target behavior remains the source contract',()=>{
  const manual=fs.readFileSync(path.join(ROOT,
    'resources/manual/advanced-players-rulebook.md'),'utf8');
  assert.match(manual,/If you use an attack with such an effect when your Bench is full/);
  assert.match(manual,/the attack ends without putting/);
});
