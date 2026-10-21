'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  observedDecision, firstObservedDecisionDifference
} = require('../simulation/evaluation/action-ledger-first-observable-difference.cjs');

const shared = {
  action: 'ResolvePromptAction', actionOrdinal: 174,
  playerSlot: 1, turnBefore: 16, turnAfter: 16
};

/** @param {string} selectedCard */
const search = selectedCard => ({...shared, cardSelection: {
  promptKind: 'ChooseCardsPrompt', message: 'CHOOSE_CARD_TO_HAND',
  sourceZone: 'deck', sourcePlayerSlot: 1,
  selectedCards: [selectedCard], selectedIndices: null,
  unmappedSelectedCards: 0
}});

test('same prompt root type, distinct owner-card choice, is first difference', () => {
  const prefix = {action:'UseAbilityAction',playerSlot:1,ability:'Star Alchemy',
    actionOrdinal:172,turnBefore:16};
  const original = [prefix, search('Acerola BUS'),
    {action:'RetreatAction',playerSlot:1,actionOrdinal:176}];
  const treated = [prefix, search('Psychic Energy MEE'),
    {action:'UseAbilityAction',ability:'Underworld Door',
      playerSlot:1,actionOrdinal:176}];
  const d = firstObservedDecisionDifference(original,treated);
  assert.equal(d.index,1);
  assert.equal(d.originalOrdinal,174);
  assert.equal(d.treatedOrdinal,174);
  assert.deepEqual(d.original.cardSelection.selectedCards,['Acerola BUS']);
  assert.deepEqual(d.treated.cardSelection.selectedCards,['Psychic Energy MEE']);
});

test('different opponent concealed-state or owner hand snapshot is not an action', () => {
  const a = search('Psychic Energy MEE');
  const b = {...a,decisionHandBefore:{opponentHandSize:9,ownHandPrintings:[]},
    decksAfter:[12,3],prizesAfter:[5,6]};
  assert.deepEqual(observedDecision(a),observedDecision(b));
  assert.equal(firstObservedDecisionDifference([a],[b]),null);
});

test('recorded retreat destination and attacker differences are material', () => {
  const r={action:'RetreatAction',playerSlot:0,
    retreatTransition:{destinationBenchIndex:2,intendedActive:{name:'Marshadow'}}};
  const s={...r,retreatTransition:{destinationBenchIndex:3,
    intendedActive:{name:'Marshadow'}}};
  assert.equal(firstObservedDecisionDifference([r],[s]).index,0);
  const a={action:'AttackAction',playerSlot:1,attack:'Max Geist',
    attacker:'Shadow Rider Calyrex VMAX'};
  const b={...a,attacker:'Mewtwo & Mew-GX'};
  assert.equal(firstObservedDecisionDifference([a],[b]).index,0);
});

test('identical evidence rows and empty arrays yield no difference', () => {
  assert.equal(firstObservedDecisionDifference([],[]),null);
  assert.equal(firstObservedDecisionDifference([search('Acerola BUS')],
    [search('Acerola BUS')]),null);
});

test('different number of recorded decisions has an explicit null side', () => {
  const d=firstObservedDecisionDifference([search('Acerola BUS')],[]);
  assert.equal(d.index,0);
  assert.equal(d.originalOrdinal,174);
  assert.equal(d.treated,null);
  assert.equal(d.treatedOrdinal,null);
});

test('same chosen names with different source-deck indices do not imply different choices', () => {
  const base=search('Psychic Energy MEE');
  const a={...base,cardSelection:{...base.cardSelection,selectedIndices:[5]}};
  const b={...base,cardSelection:{...base.cardSelection,selectedIndices:[8]}};
  assert.equal(firstObservedDecisionDifference([a],[b]),null);
});

test('different declared decision turn is observable even if chosen action matches', () => {
  const a=search('Psychic Energy MEE');
  const b={...a,turnBefore:18};
  assert.equal(firstObservedDecisionDifference([a],[b]).index,0);
});

test('equal PlayCard labels can conceal different accepted Energy recipients',()=>{
  const common={action:'PlayCardAction',playerSlot:0,turnBefore:7,
    actionOrdinal:49,card:'Darkness Energy'};
  const active={...common,declaredTarget:{player:2,slot:0,index:0}};
  const bench={...common,declaredTarget:{player:2,slot:1,index:1}};
  assert.equal(firstObservedDecisionDifference([common],[common]),null);
  const first=firstObservedDecisionDifference([active],[bench]);
  assert.equal(first.index,0);
  assert.deepEqual(first.original.declaredTarget,active.declaredTarget);
  assert.deepEqual(first.treated.declaredTarget,bench.declaredTarget);
});

test('retreat target geometry differs even with same class and turn',()=>{
  const common={action:'RetreatAction',playerSlot:1,turnBefore:9};
  const one={...common,declaredTarget:{benchIndex:1}};
  const two={...common,declaredTarget:{benchIndex:2}};
  assert.equal(firstObservedDecisionDifference([one],[two]).index,0);
  assert.equal(firstObservedDecisionDifference([one],[{...one}]),null);
});
