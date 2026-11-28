'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const policy = require('../../simulation/evaluation/2026-11/agent5-rank22-absol-vikavolt-opponent-policy.cjs');
const P = {
  vikavolt: 'Vikavolt V DAA 60',
  mega: 'Mega Absol ex MEG 86',
  trubbishFst: 'Trubbish FST 168',
  trubbishNvi: 'Trubbish NVI 48',
  garbodor: 'Garbodor BKP 57',
  lightning: 'Lightning Energy MEE 12',
  dark: 'Darkness Energy MEE 15'
};
const poke = (printing, opt = {}) => ({
  printing, energies: opt.energies ?? [], tools: opt.tools ?? [],
  hp: opt.hp ?? 210, damage: opt.damage ?? 0
});
const player = (opt = {}) => ({
  active: opt.active ?? null, bench: opt.bench ?? [], stadium: [],
  discard: opt.discard ?? [], handCount: opt.handCount ?? 0, deckCount: 30,
  prizeCount: 6, publicTurnRestrictions: {}
});
function observation(opt = {}) {
  return {
    actorSeat: opt.actorSeat ?? 0, globalTurn: opt.globalTurn ?? 3,
    ownPublic: opt.ownPublic ?? player(), opponentPublic: opt.opponentPublic ?? player(),
    ownHand: opt.ownHand ?? [], ownTurnResources: { supporterPlayedTurn: 0, vstarUsed: false }
  };
}
const root = (items, o = observation()) => ({
  role: 'opponent', seat: o.actorSeat, observation: o,
  prompt: null, actionFrontier: { items }
});
const attack = (name, damage, metadata = {}) => ({
  token: name, kind: 'attack', attackName: name,
  publicMetadata: { attackCostPayable: true, targetHp: 320, targetDamage: damage, ...metadata }
});
const choice = (token, printing, sourceZone = 'deck') => ({
  token, kind: 'card', printing, publicMetadata: { ownerSeat: 'actor', sourceZone }
});
const pass = { token: 'pass', kind: 'pass' };

test('rank22 policy is anchored to all and only the 60 printed source copies', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const field = JSON.parse(fs.readFileSync(
    path.join(rootDir, 'results/aichi-2026/full-decklists.json'), 'utf8'));
  const entry = field.decks.find(deck => deck.rank === 22);
  const actual = policy.SOURCE_INVENTORY.slice().sort((a,b)=>a[0].localeCompare(b[0]));
  const expected = entry.cards.map(c => [
    c.name + ' ' + c.printing.set + ' ' + c.printing.number, c.count
  ]).sort((a,b)=>a[0].localeCompare(b[0]));
  assert.equal(policy.SOURCE_RANK,22);
  assert.deepEqual(actual,expected);
  assert.equal(actual.reduce((n,c)=>n+c[1],0),60);
});
test('Vikavolt Paralyzing Bolt has nonlethal early Item-lock priority', () => {
  const o = observation({ ownPublic: player({active: poke(P.vikavolt)}),
    opponentPublic: player({active: poke('Shadow Rider Calyrex VMAX CRE 75', {hp: 320}),handCount: 5}) });
  assert.deepEqual(policy.bestAction(root([
    attack('Super Zap Cannon',0), attack('Paralyzing Bolt',0), pass
  ],o)), {kind:'select-action',token:'Paralyzing Bolt'});
});
test('Super Zap Cannon can overtake Bolt for immediate knockout despite 2-Energy discard', () => {
  const o = observation({ ownPublic: player({active: poke(P.vikavolt)}),
    opponentPublic: player({active: poke('Shadow Rider Calyrex V CRE 74',{hp: 210,damage: 40}),handCount: 5}) });
  assert.deepEqual(policy.bestAction(root([
    attack('Super Zap Cannon',40,{targetHp:210}),attack('Paralyzing Bolt',40,{targetHp:210}),pass
  ],o)), {kind:'select-action',token:'Super Zap Cannon'});
});
test('paid Lightning attachment is directed to developing Vikavolt', () => {
  const o=observation({ownPublic:player({active:poke(P.mega),
    bench:[poke(P.vikavolt, {energies:[P.lightning]})]})});
  const v={kind:'play-card',actorPrinting:P.lightning,targetPrinting:P.vikavolt};
  const m={kind:'play-card',actorPrinting:P.lightning,targetPrinting:P.mega};
  assert.ok(policy.scoreAction(v,root([],o))>policy.scoreAction(m,root([],o)));
});
test('Quick Ball prefers missing Vikavolt to redundant Mega Absol with lock already staged', () => {
  const o=observation({ownPublic:player({active:poke(P.trubbishNvi),
    bench:[poke(P.garbodor),poke(P.mega)]})});
  const prompt={
    promptType:'ChooseCardsPrompt',
    source:{sourcePrinting:'Quick Ball FST 237',effectName:'Quick Ball'},
    choices:[choice('mega',P.mega),choice('vikavolt',P.vikavolt)]
  };
  assert.deepEqual(policy.promptDecision({observation:o,prompt}), {kind:'select-choice',token:'vikavolt'});
});
test('both rank22 Trubbish printings feed Garbodor evolution priority', () => {
  for (const basic of [P.trubbishFst,P.trubbishNvi]) {
    const o=observation({ownPublic:player({active:poke(basic)})});
    assert.ok(policy.scoreAction({kind:'play-card',actorPrinting:P.garbodor},root([],o))>0);
  }
});
test('Terminal Period only wins at six counters, never thirty', () => {
  const o=observation();
  for (const damage of [50,60,70,300]) {
    assert.equal(policy.scoreAttack(attack('Terminal Period',damage),o),damage===60?340:0);
  }
});
test('source rank/physical seat binding is fail closed', () => {
  const instance = policy.createPolicy({
    role:'opponent',seat:1,policyVersion:policy.POLICY_VERSION,config:{}
  });
  const o=observation({actorSeat:0});
  assert.deepEqual(instance.decide(root([pass],o)),
    {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'});
});

function setupPrompt(cards, min = 1, max = 4) {
  return {
    promptType: 'ChooseCardsPrompt',
    source: { sourceKind: 'engine', sourcePrinting: null, effectName: 'choose_starting_pokemons' },
    description: 'choose_starting_pokemons',
    publicMetadata: {
      ownerSeat: 'actor', sourceZone: 'hand', isOwnerVisible: true,
      selectionType: 'card-combination', minimumCount: min, maximumCount: max
    },
    choices: cards.map(([token, printing]) => ({
      token, kind: 'card', printing,
      publicMetadata: { ownerSeat: 'actor', sourceZone: 'hand', isOwnerVisible: true }
    }))
  };
}
test('initial setup chooses Vikavolt Active with Lightning and Trubbish without it', () => {
  const cards = [['mega', P.mega], ['vikavolt', P.vikavolt], ['trubbish', P.trubbishFst]];
  const prompt = setupPrompt(cards);
  const decision = ownHand => policy.promptDecision({
    prompt, observation: { ...observation({ ownHand }), phase: 1 }
  });
  assert.deepEqual(decision([P.lightning]), {
    kind: 'select-choices', tokens: ['vikavolt', 'trubbish', 'mega']
  });
  assert.deepEqual(decision([P.dark]), {
    kind: 'select-choices', tokens: ['trubbish', 'vikavolt', 'mega']
  });
});
test('post-mulligan bonus preserves existing Active and respects three-Bench budget', () => {
  const prompt = setupPrompt([['trubbish',P.trubbishNvi],['mega',P.mega],
    ['vikavolt',P.vikavolt]],0,3);
  const o={...observation({ownPublic:player({
    active:poke(P.vikavolt),bench:[poke(P.trubbishFst)]
  })}),phase:1};
  const decision=policy.promptDecision({observation:o,prompt});
  assert.deepEqual(decision,{kind:'select-choices',tokens:['mega']});
});
test('engine setup refuses a card not actually included in the source 60', () => {
  const prompt=setupPrompt([['foreign','Iron Thorns ex TWM 77']]);
  const decision=policy.promptDecision({
    observation:{...observation(),phase:1},prompt
  });
  assert.deepEqual(decision,{kind:'abstain',reasonCode:'RANK22_UNKNOWN_SETUP_BASIC'});
});
test('engine chooses maximum lawful opponent mulligan bonus draw', () => {
  const prompt={
    promptType:'SelectPrompt',
    source:{sourceKind:'engine',sourcePrinting:null,effectName:'want_to_draw_cards'},
    description:'want_to_draw_cards',
    choices:[{token:'0',label:'0'},{token:'1',label:'1'},{token:'2',label:'2'}]
  };
  assert.deepEqual(policy.promptDecision({
    prompt,observation:{...observation(),phase:1}
  }),{kind:'select-choice',token:'2'});
});
