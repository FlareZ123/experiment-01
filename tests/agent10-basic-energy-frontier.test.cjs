'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {remainingBasicAttachments, chooseBasicEnergyFrontier} =
  require('../simulation/twinleaf/agent10-basic-energy-frontier.cjs');
const P = 5, D = 7, C = 9;
const catalog = {
  basicEnergies:new Set(['Psychic Energy MEE', 'Darkness Energy MEE']),
  basicEnergyTypes:{Psychic:P,Darkness:D}, colorlessEnergyType:C
};
function view({held=['Darkness Energy MEE','Psychic Energy MEE'],
  attached=['Psychic Energy MEE'],cost=[P,P],other=[]}={}) {
  return {decisionKind:'owner-root', ownHand:held,
    ownPublic:{active:{energies:attached,
      attacks:[{name:'Repeated Psychic',cost,gxAttack:false},...other],
      publicRestrictions:{}}, publicTurnRestrictions:{}}};
}

test('native numeric repeated colored symbols retain multiplicity', () => {
  assert.equal(remainingBasicAttachments([P,P],[P],C),1);
  assert.equal(remainingBasicAttachments([P,P],[P,D],C),1);
  assert.equal(remainingBasicAttachments([P,P],[P,P],C),0);
  assert.equal(remainingBasicAttachments([P,P,C],[P,P],C),1);
  assert.equal(remainingBasicAttachments([P,P,C],[P,P,D],C),0);
});

test('choose second matching Psychic over first irrelevant Darkness', () => {
  const pick=chooseBasicEnergyFrontier(view(),catalog);
  assert.deepEqual(pick,{handIndex:1,printing:'Psychic Energy MEE',
    attackName:'Repeated Psychic',gapBefore:1,gapAfter:0,
    knownBasicEnergyOnly:true});
});

test('typed deficit wins against unhelpful matching total quantity', () => {
  const pick=chooseBasicEnergyFrontier(view({attached:['Psychic Energy MEE',
    'Psychic Energy MEE'],cost:[P,P,D]}),catalog);
  assert.equal(pick.printing,'Darkness Energy MEE');
  assert.equal(pick.gapAfter,0);
});

test('Colorless deficit accepts any Basic but breaks ties by hand order', () => {
  const pick=chooseBasicEnergyFrontier(view({attached:['Psychic Energy MEE'],
    cost:[P,C]}),catalog);
  assert.equal(pick.handIndex,0);
  assert.equal(pick.gapAfter,0);
});

test('shortest reachable attack wins, excluding a spent GX choice', () => {
  const v=view({attached:[],cost:[P,P,P],other:[
    {name:'Shorter',cost:[D],gxAttack:false},
    {name:'GX',cost:[P],gxAttack:true}]});
  v.ownPublic.publicTurnRestrictions.gxUsed=true;
  const pick=chooseBasicEnergyFrontier(v,catalog);
  assert.equal(pick.attackName,'Shorter');
  assert.equal(pick.printing,'Darkness Energy MEE');
});

test('unspent GX cannot divert Basic Energy from root-executable attack', () => {
  const v=view({attached:[],cost:[P,P],other:[
    {name:'Unspent GX',cost:[D],gxAttack:true}]});
  const pick=chooseBasicEnergyFrontier(v,catalog);
  assert.equal(pick.printing,'Psychic Energy MEE');
  assert.equal(pick.attackName,'Repeated Psychic');
});

test('no Basic in hand is null; irrelevant legal Energy retains existing first-choice behavior', () => {
  assert.equal(chooseBasicEnergyFrontier(view({held:[]}),catalog),null);
  const pick=chooseBasicEnergyFrontier(view({cost:[P],
    attached:['Psychic Energy MEE']}),catalog);
  assert.equal(pick.handIndex,0);
  assert.equal(pick.attackName,null);
});

test('unavailable attacks do not influence energy choice', () => {
  const v=view({attached:['Psychic Energy MEE'],cost:[P,P]});
  v.ownPublic.active.publicRestrictions.cannotUseAttacksNextTurn=['Repeated Psychic'];
  const pick=chooseBasicEnergyFrontier(v,catalog);
  assert.equal(pick.handIndex,0);
  assert.equal(pick.gapAfter,null);
});

test('decisions invariant to opponent private cards, deck and Prizes', () => {
  const a=view();
  const b=JSON.parse(JSON.stringify(a));
  a.opponentHidden={hand:['Mysterious Card'],prizes:['ACE SPEC']};
  b.opponentHidden={hand:['Completely Different'],prizes:['Other']};
  assert.deepEqual(chooseBasicEnergyFrontier(a,catalog),
    chooseBasicEnergyFrontier(b,catalog));
});
