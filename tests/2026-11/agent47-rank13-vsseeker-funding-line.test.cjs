'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { chooseRank13VsSeekerFundingLine: choose } =
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
        prizeCount: 1,
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
    r => { r.observation.ownTurnResources.supporterPlayedTurn = 5; },
    r => { r.observation.ownPublic.prizeCount = 2; },
    r => { r.observation.opponentPublic.active.damage = 70; },
    r => { r.observation.ownPublic.discard.push('Grass Energy MEE 9','Grass Energy MEE 9','Grass Energy MEE 9'); },
    r => { r.observation.ownPublic.discard.push('Fire Energy MEE 10','Fire Energy MEE 10'); },
    r => { r.prompt.publicMetadata.sourceZone = 'opponent-discard'; }
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
    r => { r.prompt.source.sourcePrinting = 'Quick Ball FST 237'; }
  ];
  for (const mutation of variants) {
    const request = base(); mutation(request); assert.equal(choose(request), null);
  }
});
