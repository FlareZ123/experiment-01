'use strict';
const assert = require('node:assert/strict');
const {test} = require('node:test');
const {chooseRetreatFundingBridge, VERSION} =
  require('../../simulation/twinleaf/2026-11/agent2-retreat-funding-bridge.cjs');
const BASIC = 'Psychic Energy SVE';
const COLORLESS = 0;
const PSYCHIC = 1;
const catalog = {basicEnergies: new Set([BASIC]),
  basicEnergyTypes: {Psychic: PSYCHIC}, colorlessEnergyType: COLORLESS,
  specialConditions: {ASLEEP: 10, PARALYZED: 11}};
const helpers = {
  paysWithBasics(slot, attack) {
    const symbols = [...slot.energies].map(() => PSYCHIC);
    for (const req of attack.cost) {
      if (req === COLORLESS) continue;
      const i = symbols.indexOf(req);
      if (i < 0) return false;
      symbols.splice(i, 1);
    }
    return symbols.length >= attack.cost.filter(x => x === COLORLESS).length;
  },
  opponentActiveBlocksRetreat: () => false,
  wouldLoseActivePositionAbility: () => false,
  projectedPrintedDamage: (_view, _pokemon, attack) => attack.damage
};
function view() {
  return {
    decisionKind: 'owner-root', globalTurn: 6, actorSeat: 0,
    ownHand: [BASIC, 'Other Trainer XY'],
    ownTurnResources: {retreatedTurn: 0, energyPlayedTurn: 0,
      energyPlayLocked: false},
    ownPublic: {publicTurnRestrictions: {}, active: {
      printing: 'Stranded V UNB', name: 'Stranded V',
      printed: {retreatCost: [COLORLESS]},
      energies: [], tools: [], specialConditions: [],
      attacks: [{name: 'Underfunded', cost: [PSYCHIC, PSYCHIC],
        damage: 120}]},
    bench: [{printing: 'Funded V CRE', name: 'Funded V',
      energies: [BASIC], specialConditions: [],
      attacks: [{name: 'Hit', cost: [PSYCHIC], damage: 130}]}]},
    opponentPublic: {active: {printing: 'Opponent V'}, bench: []}
  };
}
function choose(v, injected = {}) {
  return chooseRetreatFundingBridge(v, catalog, {...helpers, ...injected});
}
test('owner root builds an actual two-action attachment then retreat plan', () => {
  const v = view();
  const first = choose(v);
  assert.equal(first.source, VERSION);
  assert.equal(first.kind, 'attach-basic-energy');
  assert.equal(first.handIndex, 0);
  assert.equal(first.slot, 'active');
  assert.equal(first.readyBenchIndex, 0);
  v.ownPublic.active.energies.push(BASIC);
  v.ownHand.shift();
  v.ownTurnResources.energyPlayedTurn = 6;
  const second = choose(v);
  assert.equal(second.kind, 'paid-retreat');
  assert.equal(second.benchIndex, 0);
  assert.equal(second.attackName, 'Hit');
  v.ownTurnResources.retreatedTurn = 6;
  assert.equal(choose(v), null);
});
test('retaining a payable zero-damage lock attack takes precedence', () => {
  const v = view();
  v.ownPublic.active.attacks = [{name: 'Item Lock', cost: [], damage: 0}];
  assert.equal(choose(v), null);
});
test('does not propose when the foe blocks retreat or the active lock would be lost', () => {
  assert.equal(choose(view(), {opponentActiveBlocksRetreat: () => true}), null);
  assert.equal(choose(view(), {wouldLoseActivePositionAbility: () => true}), null);
});
test('no held Basic, exhausted attachment, no Bench payoff all abstain', () => {
  const a = view(); a.ownHand = ['Item XY'];
  assert.equal(choose(a), null);
  const b = view(); b.ownTurnResources.energyPlayedTurn = 6;
  assert.equal(choose(b), null);
  const c = view(); c.ownPublic.bench[0].attacks[0].damage = 40;
  assert.equal(choose(c), null);
});
test('status and retreat cost alterations fail closed', () => {
  const a = view(); a.ownPublic.active.specialConditions = [10];
  assert.equal(choose(a), null);
  const b = view(); b.ownPublic.active.printed.retreatCost = [0, 0];
  assert.equal(choose(b), null);
  const c = view(); c.ownPublic.active.tools = ['Float Stone PLF'];
  assert.equal(choose(c), null);
});
test('selects strongest funded Bench attack with deterministic tie break', () => {
  const v = view();
  v.ownPublic.bench.push({printing: 'Second V CRE',
    energies: [BASIC], attacks: [{name: 'Hit 2', cost: [PSYCHIC], damage: 180}]});
  assert.equal(choose(v).readyBenchIndex, 1);
});
test('cannot use an unrecognized attachment or an unfunded Bench', () => {
  const v = view(); v.ownPublic.active.energies = ['Special Energy XY'];
  assert.equal(choose(v), null);
  const b = view(); b.ownPublic.bench[0].energies = [];
  assert.equal(choose(b), null);
});

test('does not fund retreat if the attachment itself makes an Active attack payable', () => {
  const v = view();
  v.ownPublic.active.attacks = [{name: 'Available after one',
    cost: [PSYCHIC], damage: 100}];
  assert.equal(choose(v), null);
});

test('visible active-position Skyliner makes Basic retreat free, so hold the Energy',()=>{
  const v=view();
  v.ownPublic.active.printed.stage=0;
  v.ownPublic.bench[0].abilities=['Skyliner'];
  const known={...catalog,stages:{BASIC:0}};
  assert.equal(chooseRetreatFundingBridge(v,known,helpers),null);
  const evolution=view();
  evolution.ownPublic.active.printed.stage=1;
  evolution.ownPublic.bench[0].abilities=['Skyliner'];
  assert.equal(chooseRetreatFundingBridge(evolution,known,helpers)?.kind,
    'attach-basic-energy','Skyliner excludes an evolved Active');
});

test('two-Colorless fee with one existing Basic follows one attachment then paid retreat',()=>{
  const v=view();
  v.ownPublic.active.printed.retreatCost=[COLORLESS,COLORLESS];
  v.ownPublic.active.energies=[BASIC];
  v.ownPublic.active.attacks=[{name:'Too Expensive',cost:[PSYCHIC,PSYCHIC,PSYCHIC],damage:200}];
  const first=choose(v);
  assert.equal(first.kind,'attach-basic-energy');
  assert.equal(first.retreatCostUnits,2);
  v.ownPublic.active.energies.push(BASIC);
  v.ownHand.shift();
  v.ownTurnResources.energyPlayedTurn=v.globalTurn;
  const second=choose(v);
  assert.equal(second.kind,'paid-retreat');
  assert.equal(second.retreatCostUnits,2);
  assert.equal(second.benchIndex,0);
});
test('two-Colorless fee requires exactly one missing Basic, no unrecognized attached Energy',()=>{
  const a=view();a.ownPublic.active.printed.retreatCost=[0,0];
  assert.equal(choose(a),null,'Zero of two fee must defer');
  a.ownPublic.active.energies=['Double Colorless Energy NXD'];
  assert.equal(choose(a),null,'Unsupported Special cannot be counted as one physical Basic');
  a.ownPublic.active.energies=[BASIC];
  a.ownPublic.active.attacks=[{name:'Still Underfunded',cost:[PSYCHIC,PSYCHIC,PSYCHIC],damage:200}];
  assert.equal(choose(a)?.kind,'attach-basic-energy');
});
test('two-unit funding gives priority to a newly funded Active attack',()=>{
  const a=view();
  a.ownPublic.active.printed.retreatCost=[0,0];
  a.ownPublic.active.energies=[BASIC];
  a.ownPublic.active.attacks=[{name:'New Funded Attack',cost:[PSYCHIC,PSYCHIC],damage:140}];
  assert.equal(choose(a),null);
});
