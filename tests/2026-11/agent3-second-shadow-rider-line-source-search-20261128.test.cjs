'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const policy = require('../../simulation/evaluation/2026-11/agent46-candidate-policy.cjs');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');

const V = 'Shadow Rider Calyrex V CRE 74';
const VMAX = 'Shadow Rider Calyrex VMAX CRE 75';
const FOG = 'Fog Crystal CRE 140';
const TREASURE = 'Mysterious Treasure FLI 113';
const QUICK = 'Quick Ball FST 237';
const ENERGY = 'Psychic Energy MEE 13';
function mon(printing, energies = 0) {
  return {
    printing, hp: 320, damage: 0, tools: [], abilities: [],
    abilitySuppressions: [], energies: Array(energies).fill(ENERGY),
    attacks: [], printed: {
      stage: 'BASIC', subtypes: ['V'], types: ['Psychic'],
      weakness: [], resistance: [], retreatCost: ['Colorless']
    }
  };
}
function side(active, bench = []) {
  return {
    active, bench, stadium: [], discard: [], lostZone: [],
    resolvingSupporter: [], deckCount: 30, handCount: 2, prizeCount: 6,
    publicTurnRestrictions: {
      gxUsed: false, vstarUsed: false,
      stadiumAndToolHaveNoEffectTurnsRemaining: 0
    }
  };
}
function base(seat, active, bench = [], ownHand = []) {
  return {
    role: 'candidate', seat, publicEventReceipt: null,
    observation: {
      actorSeat: seat, decisionKind: 'owner-root', ownHand,
      ownTurnResources: { supporterPlayedTurn: 0 },
      ownPublic: side(active, bench),
      opponentPublic: side(mon('Mimikyu GRI 58'))
    },
    prompt: null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] }
  };
}
const basic = {token:'basic',kind:'play-card',actorPrinting:V,
  publicMetadata:{targetSeat:'actor',targetZone:'bench',targetIndex:0}};
function item(name, token) {
  return { token, kind:'play-card', actorPrinting:name,
    publicMetadata:{cardType:'item'} };
}
const pass={token:'pass',kind:'pass'};
function root(seat, active, bench, hand, offers) {
  const r=base(seat,active,bench,hand);
  r.actionFrontier.items=[...offers,pass];
  return r;
}
function deckPrompt(seat, active, bench, choices, effect) {
  const req=base(seat,active,bench,[]);
  req.observation.decisionKind='owner-prompt';
  req.prompt={
    schema:protocol.PROMPT_SCHEMA,actingSeat:seat,
    promptType:'ChooseCardsPrompt',description:'CHOOSE_CARD',
    source:{classification:'actor-choice',sourceKind:'card-effect',
      sourcePrinting: effect==='Fog Crystal'?FOG:TREASURE,
      effectName:effect},
    choices:choices.map((printing,i)=>({
      token:'choice-'+i,kind:'card',printing,
      publicMetadata:{ownerSeat:'actor',isOwnerVisible:true,
        sourceZone:'deck',selectionIndex:i}
    })),
    publicMetadata:{selectionType:'card-combination',
      ownerSeat:'actor',isOwnerVisible:true,sourceZone:'deck',
      minimumCount:1,maximumCount:1,allowCancel:false,isSecret:true}
  };
  return req;
}
function check(input, expected) {
  if(input.prompt) protocol.validatePrompt(input.prompt,input.seat);
  const got=policy.createPolicy({role:'candidate',seat:input.seat,
    policyVersion:policy.POLICY_VERSION,config:{}}).decideWithAudit(input);
  assert.deepEqual(got.decision,expected);
  protocol.validateDecision(got.decision,input.prompt,
    new Set(input.actionFrontier.items.map(x=>x.token)));
  protocol.validatePolicyAudit(
    got.policyAudit,input,got.decision,policy.POLICY_VERSION);
  assert.deepEqual(got.policyAudit.selectedTokens,
    expected.tokens ?? [expected.token]);
}
for(const seat of [0,1]){
  const act=token=>({kind:'select-action',token});
  const cards=token=>({kind:'select-choices',tokens:[token]});
  const tests=[
    ['Second Basic alongside unevolved first V is a real Bench objective',
      root(seat,mon(V),[],[V],[basic]),act('basic')],
    ['Single VMAX is NOT a second Basic V: develop next engine',
      root(seat,mon(VMAX),[],[V],[basic]),act('basic')],
    ['Two established VMAX do not require a third Basic now',
      root(seat,mon(VMAX),[mon(VMAX)],[V],[basic]),act('pass')],
    ['Play held second Basic before wastefully searching for it',
      root(seat,mon(VMAX,3),[],[V,FOG],[basic,item(FOG,'fog')]),act('basic')],
    ['One VMAX and no second Basic: Fog Crystal must remain usable',
      root(seat,mon(VMAX,3),[],[FOG],[item(FOG,'fog')]),act('fog')],
    ['One VMAX and no second Basic: Mysterious Treasure viable',
      root(seat,mon(VMAX,3),[],[TREASURE,ENERGY],
        [item(TREASURE,'treasure')]),act('treasure')],
    ['One VMAX and no second Basic: Quick Ball viable',
      root(seat,mon(VMAX,3),[],[QUICK,ENERGY],
        [item(QUICK,'quick')]),act('quick')],
    ['Fog Crystal prompt prioritizes second V over redundant Energy',
      deckPrompt(seat,mon(VMAX,3),[],[ENERGY,V],'Fog Crystal'),
      cards('choice-1')],
    ['Mysterious Treasure prioritizes second V over Latias',
      deckPrompt(seat,mon(VMAX,3),[],['Latias ex SSP 76',V],
        'Mysterious Treasure'),cards('choice-1')],
    ['Mysterious Treasure finds second VMAX when second Basic exists',
      deckPrompt(seat,mon(VMAX,3),[mon(V)],
        ['Latias ex SSP 76',VMAX],'Mysterious Treasure'),
      cards('choice-1')]
  ];
  for(const [label,input,expected] of tests)
    test(label+' seat '+seat,()=>check(input,expected));
}
