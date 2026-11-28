'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const policy = require('../../simulation/evaluation/2026-11/agent33-rank16-absol-garbodor-dual-lock-opponent-policy.cjs');
const {
  POLICY_VERSION, SOURCE_RANK, SOURCE_LIST_BLOB_SHA1,
  CANDIDATE_ENTRY_JSON_SHA256, WORKER_PROTOCOL_BLOB_SHA1, ENGINE_PIN,
  SOURCE_INVENTORY, createPolicy
} = policy;
const root = path.resolve(__dirname, '../..');
const config = {};
const policyPath = path.join(root, 'simulation/evaluation/2026-11/agent33-rank16-absol-garbodor-dual-lock-opponent-policy.cjs');
const bundleSha256 = crypto.createHash('sha256').update(fs.readFileSync(policyPath)).digest('hex');
const P = { absol:'Mega Absol ex MEG 86', garb:'Garbodor BKP 57', budew:'Budew ASC 16', crobat:'Crobat V DAA 104', float:'Float Stone BKT 137' };
function restrictions() {
  return { cannotAttackNextTurn: false, cannotUseAttacksNextTurn: [], blockedAttackNameNextTurn: null,
    blockedAttackNameUntilLeavesActive: null, onlyAllowedAttackNameNextTurn: null, attackCostIncreaseNextTurn: 0,
    attackCostIncreaseWhileActive: 0, cannotRetreat: false, cannotRetreatNextTurn: false,
    cannotRetreatWhileActive: false, cannotEvolveNextTurn: false };
}
function publicRestrictions(extra = {}) {
  return { gxUsed: false, vstarUsed: false, attackLockTurnsRemaining: 0, attackMaxEnergy: null,
    attackMaxEnergyTurnsRemaining: 0, ignoreAttackCostCardTypes: [], ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false, pokemonPlayLocked: false, abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false, itemPlayLocked: false, supporterPlayLocked: false, stadiumPlayLocked: false,
    toolPlayLocked: false, energyPlayLocked: false, specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: null, ...extra };
}
function pokemon(printing, options = {}) {
  const abilities = options.abilities ?? [];
  return { printing, name: options.name ?? printing.split(' ').slice(0, -2).join(' '),
    hp: options.hp ?? 180, damage: options.damage ?? 0, lastPlayedOrEvolvedTurn: options.lastPlayedOrEvolvedTurn ?? 1,
    printed: { stage: options.stage ?? 'BASIC', subtypes: options.subtypes ?? ['Basic'],
      types: options.types ?? ['Darkness'], retreatCost: options.retreatCost ?? ['Colorless'], weakness: [], resistance: [] },
    specialConditions: [], publicRestrictions: restrictions(), evolutionPrintings: options.evolutionPrintings ?? [],
    energies: options.energies ?? [], tools: options.tools ?? [], attacks: options.attacks ?? [], abilities,
    abilityDetails: abilities.map(name => ({ name, powerType: 'ABILITY', text: 'Once during your turn.' })),
    abilitySuppressions: null };
}
function player(options = {}) {
  const bench = (options.bench ?? []).slice(0, 5);
  while (bench.length < 5) bench.push(null);
  return { active: options.active ?? null, bench, stadium: options.stadium ?? [], discard: options.discard ?? [],
    lostZone: [], resolvingSupporter: [], publicHand: null, prizeSlots: [],
    publicTurnRestrictions: publicRestrictions(options.publicTurnRestrictions ?? {}),
    handCount: options.handCount ?? 0, deckCount: options.deckCount ?? 30, prizeCount: options.prizeCount ?? 6 };
}
function turnResources(extra = {}) {
  return { supporterPlayedTurn: 0, retreatedTurn: 0, extraTurnActive: false, energyPlayedTurn: false,
    stadiumPlayedTurn: false, stadiumUsedTurn: false, vstarUsed: false, pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false, evolutionPlayLocked: false, itemPlayLocked: false,
    supporterPlayLocked: false, stadiumPlayLocked: false, toolPlayLocked: false, energyPlayLocked: false,
    specialEnergyPlayLocked: false, ...extra };
}
function observation(options = {}) {
  return { actorSeat: options.actorSeat ?? 0, globalTurn: options.globalTurn ?? 3, phase: 2,
    decisionKind: options.prompt ? 'owner-prompt' : 'owner-root', pendingPromptType: options.prompt?.promptType ?? null,
    pendingOwnerDeckSearch: false, ownHand: options.ownHand ?? [], ownPublic: options.ownPublic ?? player(),
    opponentPublic: options.opponentPublic ?? player(), ownTurnResources: options.ownTurnResources ?? turnResources(),
    ownerK1: null };
}
function rootRequest(options = {}) {
  const seat = options.seat ?? 0;
  return { schema: protocol.REQUEST_SCHEMA, type: 'decision', requestId: options.requestId ?? 'agent44-root-1',
    sequence: 1, role: 'opponent', seat, observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({ ...options, actorSeat: seat }), prompt: null, publicEventReceipt: null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: options.items ?? [{ token: 'pass', kind: 'pass', label: 'Pass turn' }] } };
}
function source(printing, effect) {
  return { classification: 'actor-choice', sourceKind: 'card-effect', sourcePrinting: printing, effectName: effect };
}
function card(token, printing, zone = 'deck', owner = 'actor') {
  return { token, kind: 'card', printing, label: printing,
    publicMetadata: { sourceZone: zone, ownerSeat: owner } };
}
function poke(token, printing, owner = 'actor', zone = 'bench', index = 0) {
  return { token, kind: 'pokemon', printing, label: printing,
    publicMetadata: { ownerSeat: owner, targetZone: zone, benchIndex: index, isOwnerVisible: true } };
}
function promptRequest(options = {}) {
  const seat = options.seat ?? 0;
  const prompt = { schema: protocol.PROMPT_SCHEMA, actingSeat: seat, promptType: options.promptType,
    description: options.description ?? 'Choose a legal option',
    source: options.source ?? source('Test source TEST 1', 'Test effect'),
    choices: options.choices ?? [], ...(options.publicMetadata ? { publicMetadata: options.publicMetadata } : {}) };
  return { schema: protocol.REQUEST_SCHEMA, type: 'decision', requestId: options.requestId ?? 'agent44-prompt-1',
    sequence: 1, role: 'opponent', seat, observationSchema: protocol.OBSERVATION_SCHEMA,
    observation: observation({ ...options, actorSeat: seat, prompt }), prompt, publicEventReceipt: null,
    actionFrontier: { schema: protocol.FRONTIER_SCHEMA, items: [] } };
}
function makePolicy(seat = 0) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION, config });
}
function checked(request, seat = 0) {
  const init = { schema: protocol.INIT_SCHEMA, type: 'init', role: 'opponent', seat,
    policyVersion: POLICY_VERSION, bundleSha256, config };
  protocol.validateInit(init);
  const validated = protocol.validateRequest(request, init, request.sequence, new Set());
  const decision = makePolicy(seat).decide(request);
  protocol.validateDecision(decision, validated.prompt, validated.actionTokens);
  return decision;
}
function gitBlobSha1(value) {
  return crypto.createHash('sha1').update('blob ' + Buffer.byteLength(value, 'utf8') + '\0' + value, 'utf8').digest('hex');
}
function sha256(value) { return crypto.createHash('sha256').update(value, 'utf8').digest('hex'); }


/* Real strict production protocol; these states are source-shaped mocks, not native game. */
for(const seat of [0,1]) {
  test('strict root Tool selection seat '+seat,()=>{
    const request=rootRequest({seat,ownPublic:player({active:pokemon(P.absol),bench:[pokemon(P.garb)]}),
      items:[{token:'tool',kind:'play-card',actorPrinting:P.float,targetPrinting:P.garb},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
    assert.deepEqual(checked(request,seat),{kind:'select-action',token:'tool'});
  });
  test('strict root useful Dark Asset before disabling Tool seat '+seat,()=>{
    const request=rootRequest({seat,ownPublic:player({active:pokemon(P.absol),bench:[pokemon(P.garb)]}),
      items:[{token:'ability',kind:'use-ability',actorPrinting:P.crobat,publicMetadata:{abilityName:'Dark Asset'}},
      {token:'tool',kind:'play-card',actorPrinting:P.float,targetPrinting:P.garb},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
    assert.deepEqual(checked(request,seat),{kind:'select-action',token:'ability'});
  });
  test('strict BKP Garbodor Tool prompt needs MULTI select token seat '+seat,()=>{
    const request=promptRequest({seat,promptType:'ChoosePokemonPrompt',
      source:source(P.float,'Float Stone'),
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false},
      ownPublic:player({active:pokemon(P.absol),bench:[pokemon(P.garb),pokemon(P.crobat)]}),
      choices:[poke('garb',P.garb,'actor','bench',0),poke('crobat',P.crobat,'actor','bench',1)]});
    assert.deepEqual(checked(request,seat),{kind:'select-choices',tokens:['garb']});
  });
  test('strict Jamming Tower array rejects false dual lock retreat seat '+seat,()=>{
    const request=rootRequest({seat,ownPublic:player({active:pokemon(P.absol),
      bench:[pokemon(P.garb,{tools:[P.float]}),pokemon(P.budew)],
      stadium:['Jamming Tower TWM 153']}),
      items:[{token:'budew',kind:'retreat',targetPrinting:P.budew},
      {token:'pass',kind:'pass',label:'Pass turn'}]});
    assert.deepEqual(checked(request,seat),{kind:'select-action',token:'pass'});
  });
}
test('strict protocol forbids hidden-state seed',()=>{
  const request=rootRequest();
  request.observation.seed=1;
  const init={schema:protocol.INIT_SCHEMA,type:'init',role:'opponent',seat:0,
    policyVersion:POLICY_VERSION,bundleSha256,config};
  protocol.validateInit(init);
  assert.throws(()=>protocol.validateRequest(request,init,1,new Set()));
});

/* Source-bound Plumeria: pay 2 disposable cards, target opponent Energy. */
for(const seat of [0,1]) {
  const plumeria='Plumeria BUS 120';
  const vip='Battle VIP Pass FST 225';
  const boost='Boost Shake EVS 142';
  const opp=player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75',
    {energies:['Psychic Energy MEE 13','Psychic Energy MEE 13']})});
  const own=player({active:pokemon(P.absol),bench:[pokemon(P.garb)]});
  test('strict Plumeria root pays two source costs seat '+seat,()=>{
    const r=rootRequest({seat,globalTurn:4,ownPublic:own,opponentPublic:opp,
      ownHand:[vip,boost,'Darkness Energy MEE 15'],
      items:[{token:'plumeria',kind:'play-card',actorPrinting:plumeria},
        {token:'pass',kind:'pass',label:'Pass turn'}]});
    assert.deepEqual(checked(r,seat),{kind:'select-action',token:'plumeria'});
  });
  test('strict Plumeria exact two discard cards seat '+seat,()=>{
    const r=promptRequest({seat,globalTurn:4,ownPublic:own,opponentPublic:opp,
      ownHand:[vip,boost,'Darkness Energy MEE 15'],
      promptType:'ChooseCardsPrompt',source:source(plumeria,'Plumeria'),
      publicMetadata:{selectionType:'card-combination',minimumCount:2,maximumCount:2,allowCancel:false},
      choices:[card('vip',vip,'hand'),card('boost',boost,'hand'),
        card('dark','Darkness Energy MEE 15','hand')]});
    assert.deepEqual(checked(r,seat),{kind:'select-choices',tokens:['vip','boost']});
  });
  test('strict Plumeria opponent-only powered Pokémon target seat '+seat,()=>{
    const r=promptRequest({seat,ownPublic:own,opponentPublic:opp,
      promptType:'ChoosePokemonPrompt',source:source(plumeria,'Plumeria'),
      publicMetadata:{selectionType:'pokemon',minimumCount:1,maximumCount:1,allowCancel:false},
      choices:[poke('active','Shadow Rider Calyrex VMAX CRE 75','opponent','active',0)]});
    assert.deepEqual(checked(r,seat),{kind:'select-choices',tokens:['active']});
  });
  test('strict Plumeria opponent attached Energy payment selector seat '+seat,()=>{
    const r=promptRequest({seat,ownPublic:own,opponentPublic:opp,
      promptType:'ChooseEnergyPrompt',source:source(plumeria,'Plumeria'),
      publicMetadata:{selectionType:'energy-payment',energyCount:1,count:1,allowCancel:false},
      choices:[{token:'energy',kind:'energy',printing:'Psychic Energy MEE 13',
        label:'Psychic Energy MEE 13',
        publicMetadata:{ownerSeat:'opponent',sourceZone:'energy'}}]});
    assert.deepEqual(checked(r,seat),{kind:'select-choices',tokens:['energy']});
  });
}

/* Source rank16 Battle Compressor -> Dark Patch fuel; up-to-three requires
 * an explicit native empty-selection option even when choosing nonempty. */
for(const seat of [0,1]) {
  const own=player({active:pokemon('Budew ASC 16'),bench:[
    pokemon('Mega Absol ex MEG 86')]});
  const opp=player({active:pokemon('Shadow Rider Calyrex VMAX CRE 75')});
  const hand=['Battle Compressor PHF 92','Dark Patch ASR 139'];
  test('strict Compressor offered root chooses fuel search seat '+seat,()=>{
    const r=rootRequest({seat,globalTurn:4,ownPublic:own,
      opponentPublic:opp,ownHand:hand,items:[
        {token:'compressor',kind:'play-card',actorPrinting:'Battle Compressor PHF 92'},
        {token:'pass',kind:'pass',label:'Pass turn'}]});
    assert.deepEqual(checked(r,seat),{kind:'select-action',token:'compressor'});
  });
  test('strict Compressor selects at most two Darkness and a dead VIP seat '+seat,()=>{
    const r=promptRequest({seat,globalTurn:4,ownPublic:own,
      opponentPublic:opp,ownHand:hand,
      promptType:'ChooseCardsPrompt',
      source:source('Battle Compressor PHF 92','Battle Compressor'),
      publicMetadata:{selectionType:'card-combination',minimumCount:0,maximumCount:3,allowCancel:false},
      choices:[card('dark1','Darkness Energy MEE 15','deck'),
        card('dark2','Darkness Energy MEE 15','deck'),
        card('dark3','Darkness Energy MEE 15','deck'),
        card('vip','Battle VIP Pass FST 225','deck'),
        card('garb','Garbodor LTR 68','deck'),
        {token:'none',kind:'empty-selection',label:'Choose no cards'}]});
    assert.deepEqual(checked(r,seat),
      {kind:'select-choices',tokens:['dark1','dark2','vip']});
  });
}

/* Source Karen XYP177 itself has no choose-card prompt: shuffle all Pokémon
 * in both public discards, specifically useful versus Regidrago Apex Dragon. */
for(const seat of [0,1]) {
  test('strict source Karen attacks Regidrago live Dragon discard seat '+seat,()=>{
    const request=rootRequest({seat,globalTurn:5,
      ownPublic:player({active:pokemon('Mega Absol ex MEG 86')}),
      ownHand:['Karen XYP 177'],
      opponentPublic:player({active:pokemon('Regidrago VSTAR SIT 136'),
        discard:['Dragapult ex TWM 130']}),
      items:[{token:'karen',kind:'play-card',actorPrinting:'Karen XYP 177'},
        {token:'pass',kind:'pass',label:'Pass turn'}]});
    assert.deepEqual(checked(request,seat),{kind:'select-action',token:'karen'});
  });
  test('strict Karen does not burn Supporter with no public Dragon payload seat '+seat,()=>{
    const request=rootRequest({seat,globalTurn:5,
      ownPublic:player({active:pokemon('Mega Absol ex MEG 86')}),
      ownHand:['Karen XYP 177'],
      opponentPublic:player({active:pokemon('Regidrago VSTAR SIT 136'),discard:[]}),
      items:[{token:'karen',kind:'play-card',actorPrinting:'Karen XYP 177'},
        {token:'pass',kind:'pass',label:'Pass turn'}]});
    assert.deepEqual(checked(request,seat),{kind:'select-action',token:'pass'});
  });
}
