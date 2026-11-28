'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

// Tool Jammer BST136 stops Tools on the OPPONENT'S ACTIVE only; it does
// not disable Forest Seal Stone on our Benched Shadow Rider V CRE74.
const V = 'Shadow Rider Calyrex V CRE 74';
const FSS = 'Forest Seal Stone SIT 156';
const JAM = 'Tool Jammer BST 136';
function mon(printing, tools = []) {
  return {
    printing, hp: 210, damage: 0, energies: [], tools,
    attacks: [], abilities: [], abilitySuppressions: [],
    printed: {
      stage: 'BASIC', subtypes: ['Basic', 'V'], types: ['Psychic'],
      weakness: [], resistance: [], retreatCost: ['Colorless']
    }
  };
}
function side(active, bench, stadium = [], suppress = 0) {
  return {
    active, bench, stadium, discard: [], lostZone: [],
    resolvingSupporter: [], deckCount: 30, handCount: 1,
    publicTurnRestrictions: {
      gxUsed: false, vstarUsed: false,
      stadiumAndToolHaveNoEffectTurnsRemaining: suppress
    }
  };
}
function root(seat, mode, onBench, jammer, suppress, jammingTower) {
  const active = mon(V, onBench ? [] : [FSS]);
  const bench = [mon(V, onBench ? [FSS] : [])];
  if (mode === 'attach') {
    active.tools = [];
    bench[0].tools = [];
  }
  const opp = mon('Pikachu ex SVI 63', jammer ? [JAM] : []);
  const owner = side(active, bench);
  const opponent = side(opp, [],
    jammingTower ? ['Jamming Tower TWM 153'] : [], suppress);
  let items;
  if (mode === 'use') {
    items = [
      { token: 'alchemy', kind: 'use-ability', actorPrinting: V,
        publicMetadata: { abilityName: 'Star Alchemy' } },
      { token: 'pass', kind: 'pass' }
    ];
  } else {
    items = [
      { token: 'stone', kind: 'play-card', actorPrinting: FSS,
        targetPrinting: V,
        publicMetadata: {
          cardType: 'tool', targetSeat: 'actor',
          targetZone: onBench ? 'bench' : 'active',
          targetIndex: onBench ? 0 : -1
        } },
      { token: 'pass', kind: 'pass' }
    ];
  }
  return {
    role: 'candidate', seat, prompt: null, publicEventReceipt: null,
    observation: {
      actorSeat: seat, decisionKind: 'owner-root',
      ownHand: mode === 'attach' ? [FSS] : [],
      ownTurnResources: { supporterPlayedTurn: 0 },
      ownPublic: owner, opponentPublic: opponent
    },
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items }
  };
}
const cases = [
  ['Benched Forest Seal Stone stays LIVE under opponent Active Tool Jammer',
    'use', true, true, 0, false, 'alchemy'],
  ['Attaching Forest Seal Stone to Bench stays useful under Tool Jammer',
    'attach', true, true, 0, false, 'stone'],
  ['Forest Seal Stone on own Active IS suppressed by opponent Tool Jammer',
    'use', false, true, 0, false, 'pass'],
  ['Do not attach Forest Seal Stone to suppressed own Active',
    'attach', false, true, 0, false, 'pass'],
  ['Benched Stone remains usable without Tool Jammer',
    'use', true, false, 0, false, 'alchemy'],
  ['Jamming Tower globally suppresses the Bench Stone',
    'use', true, true, 0, true, 'pass'],
  ['Registered all-Tool suppression also blocks the Bench Stone',
    'use', true, true, 1, false, 'pass']
];
for (const seat of [0, 1]) for (const [label, mode, onBench,
    jammer, suppress, tower, token] of cases) {
  test(label + ' seat ' + seat, () => {
    const input = root(seat, mode, onBench, jammer, suppress, tower);
    const got = policy.createPolicy({
      role: 'candidate', seat, policyVersion: policy.POLICY_VERSION,
      config: {}
    }).decideWithAudit(input);
    assert.deepEqual(got.decision, { kind: 'select-action', token });
    protocol.validateDecision(got.decision, null,
      new Set(input.actionFrontier.items.map(x => x.token)));
    protocol.validatePolicyAudit(
      got.policyAudit, input, got.decision, policy.POLICY_VERSION);
    assert.deepEqual(got.policyAudit.selectedTokens, [token]);
  });
}

function retreatRequest(seat, jammer) {
  const ownActive = mon('Shadow Rider Calyrex V CRE 74',
    ['Float Stone BKT 137']);
  const ownBench = mon('Shadow Rider Calyrex VMAX CRE 75');
  ownBench.energies = Array(3).fill('Psychic Energy MEE 13');
  ownBench.attacks = [{
    name:'Max Geist',cost:['Colorless','Colorless','Colorless'],
    damage:'10+'
  }];
  const oppActive = mon('Pikachu ex SVI 63',
    jammer ? [JAM] : []);
  return {
    role:'candidate',seat,prompt:null,publicEventReceipt:null,
    observation:{
      actorSeat:seat,decisionKind:'owner-root',ownHand:[],
      ownTurnResources:{supporterPlayedTurn:0},
      ownPublic:side(ownActive,[ownBench]),
      opponentPublic:side(oppActive,[])
    },
    actionFrontier:{schema:protocol.FRONTIER_SCHEMA,items:[
      {token:'retreat',kind:'retreat',
        targetPrinting:'Shadow Rider Calyrex VMAX CRE 75',
        publicMetadata:{benchIndex:0}},
      {token:'pass',kind:'pass'}
    ]}
  };
}
for(const seat of [0,1])for(const jammer of [true,false]){
  test('Active Float Stone '+(jammer?'suppressed':'live')+
    ' before native-offered retreat seat '+seat,()=>{
    const input=retreatRequest(seat,jammer);
    const got=policy.createPolicy({role:'candidate',seat,
      policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
    const expected=jammer?'pass':'retreat';
    assert.deepEqual(got.decision,{kind:'select-action',token:expected});
    protocol.validatePolicyAudit(got.policyAudit,input,got.decision,
      policy.POLICY_VERSION);
    assert.deepEqual(got.policyAudit.selectedTokens,[expected]);
  });
}
