'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');

test('exact printed SMP SM217 Night Watch demands random opponent hand cards',()=>{
  const cards=JSON.parse(fs.readFileSync(path.join(ROOT,
    'resources/cards/en/smp.json'),'utf8'));
  const pokemon=cards.find(c=>c.id==='smp-SM217');
  assert.equal(pokemon.name,'Trevenant & Dusknoir-GX');
  const attack=pokemon.attacks.find(a=>a.name==='Night Watch');
  assert.match(attack.text,
    /Choose 2 random cards from your opponent's hand/);
});

test('pinned original vendor gives attacker ChooseCardsPrompt over opponent hand',()=>{
  const src=fs.readFileSync(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx.ts'),'utf8');
  assert.match(src,/cardsToShuffle = Math\.min\(2, opponent\.hand\.cards\.length\)/);
  assert.match(src,/new ChooseCardsPrompt\(\s*player,\s*GameMessage\.CHOOSE_CARD_TO_DISCARD,\s*opponent\.hand,/);
  assert.match(src,/isSecret:\s*true/);
  assert.doesNotMatch(src,/sampleUniform|shuffleRandom|randomInt/);
});

test('pinned generic bot scores individual physical cards and sorts',()=>{
  const src=fs.readFileSync(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/src/simple-bot/prompt-resolver/choose-cards-prompt-resolver.ts'),'utf8');
  assert.match(src,
    /this\.stateScore\.getCardScore\(state, prompt\.playerId, card\)/);
  assert.match(src,/cards\.sort\(\(a, b\) => b\.score - a\.score\)/);
  assert.match(src,/return cards\.map\(c => c\.card\)/);
});

test('pinned hand scorer reads card identity when evaluating a prompt',()=>{
  const src=fs.readFileSync(path.join(ROOT,
    'vendor/twinleaf/ptcg-server/src/simple-bot/state-score/state-score.ts'),'utf8');
  assert.match(src,/getCardScore\(state: State, playerId: number, card: Card\)/);
  assert.match(src,/player\.hand\.cards\.push\(card\)/);
  assert.match(src,/this\.handScore\.getScore\(state, playerId\)/);
});
