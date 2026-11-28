'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { chooseRank13VsSeekerFundingLine: choose,
  assessRank13CrispinEnergyPair: assess,
  assessSourceCountCrispinEnergyPair: assessSource,
  requiredBasicForApex: requiredBasic } =
  require('../../simulation/evaluation/2026-11/agent47-rank13-vsseeker-funding-line.cjs');
const rank13 =
  require('../../simulation/evaluation/2026-11/agent24-rank13-regidrago-opponent-policy.cjs');

function base(seat = 0, shorthand = false) {
  const suffix = shorthand ? '' : ' 136';
  return {
    role: 'opponent', seat,
    observation: {
      actorSeat: seat, decisionKind: 'owner-prompt', globalTurn: 5,
      ownTurnResources: { supporterPlayedTurn: 0 },
      ownHand: [],
      ownPublic: {
        prizeCount: 1, deckCount: 18,
        active: { printing: 'Regidrago VSTAR SIT' + suffix,
          energies: [{ printing: 'Grass Energy MEE 9' }, { printing: 'Fire Energy MEE 10' }],
          specialConditions: [], publicRestrictions: {} },
        bench: [{ printing: 'Budew ASC 16' }],
        discard: [{ printing: 'Dialga-GX UPR 100' }, { printing: 'Crispin SCR 133' },
          { printing: 'Guzma BUS 115' }],
        publicTurnRestrictions: { attackLockTurnsRemaining: 0 }
      },
      opponentPublic: { prizeCount: 1,
        active: { printing: 'Mimikyu GRI 58', hp: 70, damage: 0 },
        bench: [{ printing: 'Shadow Rider Calyrex VMAX CRE 75', hp: 320, damage: 0 }] }
    },
    prompt: {
      promptType: 'ChooseCardsPrompt',
      source: { classification: 'actor-choice', sourceKind: 'card-effect',
        sourcePrinting: 'VS Seeker PHF 109', effectName: 'VS Seeker choose Supporter' },
      publicMetadata: { selectionType: 'card-combination', minimumCount: 1, maximumCount: 1,
        ownerSeat: 'actor', sourceZone: 'discard', isOwnerVisible: true, allowCancel: false },
      choices: [
        { token: 'guzma', kind: 'card', printing: shorthand ? 'Guzma BUS' : 'Guzma BUS 115' },
        { token: 'crispin', kind: 'card', printing: shorthand ? 'Crispin SCR' : 'Crispin SCR 133' }
      ]
    }
  };
}
for (const seat of [0, 1]) {
  test('seat ' + seat + ': existing rank13 worker wrongly chooses unfunded Guzma; optional branch selects Crispin', () => {
    const request = base(seat, seat === 1);
    const worker = rank13.createPolicy({
      role: 'opponent', seat, policyVersion: rank13.POLICY_VERSION, config: {}
    });
    assert.deepEqual(worker.decide(request), { kind: 'select-choices', tokens: ['guzma'] });
    assert.deepEqual(choose(request), { kind: 'select-choices', tokens: ['crispin'] });
  });
}
test('negative: active pivot with already-powered benched Regidrago and vulnerable benched defender delegates to Guzma', () => {
  const request = base();
  request.observation.ownPublic.active = { printing: 'Budew ASC 16', energies: [],
    specialConditions: [], publicRestrictions: {} };
  request.observation.ownPublic.bench = [{
    printing: 'Regidrago VSTAR SIT 136',
    energies: [{ printing: 'Grass Energy MEE 9' }, { printing: 'Grass Energy MEE 9' },
      { printing: 'Fire Energy MEE 10' }]
  }];
  request.observation.opponentPublic.active = {
    printing: 'Shadow Rider Calyrex VMAX CRE 75', hp: 320, damage: 0
  };
  request.observation.opponentPublic.bench = [{
    printing: 'Mimikyu GRI 58', hp: 70, damage: 0
  }];
  assert.equal(choose(request), null);
  assert.deepEqual(rank13.createPolicy({ role: 'opponent', seat: 0,
    policyVersion: rank13.POLICY_VERSION, config: {} }).decide(request),
    { kind: 'select-choices', tokens: ['guzma'] });
});
test('fail-closed: no Dialga payload, already powered, already used Supporter or not last Prize', () => {
  const variants = [
    r => { r.observation.ownPublic.discard = []; },
    r => { r.observation.ownPublic.active.energies.push({ printing: 'Grass Energy MEE 9' }); },
    r => { r.observation.ownTurnResources.supporterPlayedTurn = 1; },
    r => { r.observation.ownTurnResources.supporterPlayedTurn = 5; },
    r => { r.observation.ownTurnResources.supporterPlayLocked = true; },
    r => { r.observation.ownPublic.prizeCount = 2; },
    r => { r.observation.ownPublic.deckCount = 1; },
    r => { r.observation.ownPublic.deckCount = 0; },
    r => { r.observation.opponentPublic.active.damage = 70; },
    r => { r.observation.ownPublic.discard.push('Grass Energy MEE 9','Grass Energy MEE 9','Grass Energy MEE 9'); },
    r => { r.observation.ownPublic.discard.push('Fire Energy MEE 10','Fire Energy MEE 10'); },
    r => { r.prompt.publicMetadata.sourceZone = 'opponent-discard'; },
    r => { r.observation.ownPublic.discard.push('Fire Energy MEE 10');
      r.observation.ownerK1 = { epoch:2,exactMembershipKnown:true,
        invalidationReason:null,knownPrintings:[{printing:'Grass Energy MEE',copies:3}] }; },
    r => { r.observation.ownPublic.discard.push('Grass Energy MEE 9','Grass Energy MEE 9');
      r.observation.ownerK1 = { epoch:2,exactMembershipKnown:true,
        invalidationReason:null,knownPrintings:[{printing:'Fire Energy MEE',copies:2}] }; },
    r => { r.observation.ownerK1 = { epoch:2,exactMembershipKnown:true,
      invalidationReason:null,knownPrintings:[{printing:'Grass Energy MEE',copies:2},
      {printing:'Fire Energy MEE',copies:1}] }; },
    r => { r.observation.ownPublic.discard.push('Grass Energy MEE 9','Grass Energy MEE 9',
      'Grass Energy MEE 9','Grass Energy MEE 9'); }
  ];
  for (const mutation of variants) {
    const request = base(); mutation(request); assert.equal(choose(request), null);
  }
});
test('fail-closed: unknown prompt provenance, bounds and paralysis', () => {
  const variants = [
    r => { r.prompt.source.classification = 'public-observation'; },
    r => { r.prompt.publicMetadata.maximumCount = 2; },
    r => { r.prompt.choices[1].token = null; },
    r => { r.observation.ownPublic.active.specialConditions = ['PARALYZED']; },
    r => { r.observation.decisionKind = 'owner-root'; },
    r => { r.prompt.source.sourcePrinting = 'Quick Ball FST 237'; },
    r => { r.role = 'candidate'; },
    r => { r.seat = 1; }
  ];
  for (const mutation of variants) {
    const request = base(); mutation(request); assert.equal(choose(request), null);
  }
});

test('fresh actor-only K1 recognizes an intact Grass/Fire deck pair; stale K1 does not veto',()=>{
  const r=base();
  r.observation.ownerK1={epoch:2,exactMembershipKnown:true,
    invalidationReason:null,knownPrintings:[
      {printing:'Grass Energy MEE',copies:3},
      {printing:'Fire Energy MEE',copies:1}]};
  assert.deepEqual(choose(r),{kind:'select-choices',tokens:['crispin']});
  r.observation.ownerK1={epoch:3,exactMembershipKnown:false,
    invalidationReason:'own-deck-may-have-changed',knownPrintings:[]};
  assert.deepEqual(choose(r),{kind:'select-choices',tokens:['crispin']});
});

test('K0 pigeonhole proves exact source rank13 still has both Basic Energy types in own deck',()=>{
  const view=base().observation;
  const proof=assess(view);
  assert.equal(proof.status,'certified-k0-lower-bound');
  assert.deepEqual(proof.lowerBounds,{grass:2,fire:1});
  // Source has G4/F3, 1 each visibly attached, and at most 1 hidden Prize.
  // The remaining 3 Grass and 2 Fire must include >=2 Grass and >=1 Fire
  // in deck even without performing a physical search.
  view.ownPublic.discard.push('Fire Energy MEE 10');
  const possible=assess(view);
  assert.equal(possible.status,'possible-k0');
  assert.deepEqual(possible.lowerBounds,{grass:2,fire:0});
});
test('K1 source conservation: authenticated physical pair certifies, impossible snapshot fails closed',()=>{
  const view=base().observation;
  view.ownerK1={epoch:1,exactMembershipKnown:true,invalidationReason:null,
    knownPrintings:[{printing:'Grass Energy MEE',copies:3},
      {printing:'Fire Energy MEE',copies:1}]};
  assert.equal(assess(view).status,'certified-fresh-k1');
  assert.deepEqual(assess(view).knownDeck,{grass:3,fire:1});
  view.ownerK1.knownPrintings=[
    {printing:'Grass Energy MEE',copies:2},
    {printing:'Fire Energy MEE',copies:1}];
  assert.equal(assess(view).status,'invalid');
});

test('source MEE 9/10 and pinned native MEE 1/2 equivalent Basic Energy aliases retain same K0 proof',()=>{
  const view=base().observation;
  const before=assess(view);
  assert.equal(before.status,'certified-k0-lower-bound');
  view.ownPublic.active.energies=[
    {printing:'Grass Energy MEE 1'},
    {printing:'Fire Energy MEE 2'}];
  assert.deepEqual(assess(view),before);
  assert.deepEqual(choose({...base(),observation:view}),
    {kind:'select-choices',tokens:['crispin']});
});

test('same Crispin source-text adapter serves ranks 13/14/20; ONLY rank13 4G/3F has this K0 Fire guarantee',()=>{
  const view=base().observation;
  const thirteen=assessSource(view,{grass:4,fire:3});
  assert.equal(thirteen.status,'certified-k0-lower-bound');
  assert.deepEqual(thirteen.lowerBounds,{grass:2,fire:1});
  // Authenticated source rank14 and rank20 each have 4 Grass but only 2 Fire.
  // With a Grass+Fire already attached and one Prize remaining, the single
  // unaccounted Fire may be the last Prize; no invisible-source assumption
  // can certify its presence in the deck without a fresh owner K1 search.
  const fourteen=assessSource(view,{grass:4,fire:2});
  const twenty=assessSource(view,{grass:4,fire:2});
  assert.equal(fourteen.status,'possible-k0');
  assert.deepEqual(fourteen.lowerBounds,{grass:2,fire:0});
  assert.deepEqual(twenty,fourteen);
  assert.equal(assessSource(view,{grass:65,fire:2}).status,'invalid');
});

for(const seat of [0,1]){
  test('seat '+seat+': G+G -> Crispin Fire guaranteed at K0 and wins the same final-Prize Apex cost',()=>{
    const r=base(seat);
    r.observation.ownPublic.active.energies=[
      {printing:'Grass Energy MEE 9'},{printing:'Grass Energy MEE 1'}];
    assert.equal(requiredBasic(r.observation.ownPublic.active.energies),'fire');
    assert.equal(assess(r.observation).status,'certified-k0-lower-bound');
    assert.deepEqual(assess(r.observation).lowerBounds,{grass:1,fire:2});
    assert.deepEqual(choose(r),{kind:'select-choices',tokens:['crispin']});
    // Even the independently authenticated rank14 and rank20 4G/2F
    // inventories certify a deck Grass+Fire pair in THIS G+G prestate.
    const other=assessSource(r.observation,{grass:4,fire:2});
    assert.equal(other.status,'certified-k0-lower-bound');
    assert.deepEqual(other.lowerBounds,{grass:1,fire:1});
  });
}
test('Apex Basic-payment classification is exact and refuses F+F / surplus-energy paths',()=>{
  const g={printing:'Grass Energy MEE 9'},f={printing:'Fire Energy MEE 10'};
  assert.equal(requiredBasic([g,f]),'grass');
  assert.equal(requiredBasic([g,g]),'fire');
  assert.equal(requiredBasic([f,f]),null);
  assert.equal(requiredBasic([g,g,f]),null);
  assert.equal(requiredBasic([{printing:'Double Dragon Energy ROS 97'},g]),null);
});
