'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { guzmaTrapEvents } = require('../simulation/evaluation/aichi-guzma-trap.cjs');

/** @param {number} seat @param {number} turn @param {string} active */
function pass(seat, turn, active) {
  return {
    action: 'PassTurnAction', playerSlot: seat, turnBefore: turn,
    publicBoardBeforePass: [{ active: { name: seat === 0 ? active : 'Iron Thorns ex' } },
      { active: { name: seat === 1 ? active : 'Iron Thorns ex' } }],
    printedBasicEnergyBeforePass: {
      activePokemon: active, attacks: [
        {name:'Overclock',printedCostCoveredByBasic:false},
        {name:'Shred',printedCostCoveredByBasic:false}
      ]
    }
  };
}

/** @param {string} slot @param {object[]} trace */
function report(slot, trace) {
  return {candidateEngineSlot:slot,
    traceSummary:{chronologicalActionTrace:trace}};
}

test('candidate Guzma precedes an extended off-type Active lock', () => {
  const trace = [
    {action:'ResolvePromptAction',playerSlot:1,
      cardSelection:{message:'CHOOSE_STARTING_POKEMONS',
        selectedCards:['Shadow Rider Calyrex V CRE']}},
    {action:'PlayCardAction',playerSlot:1,card:'Guzma',
      turnBefore:2,actionOrdinal:27},
    pass(1,2,'Dialga-GX'),pass(1,4,'Dialga-GX'),
    pass(1,6,'Shadow Rider Calyrex VMAX')
  ];
  const actual = guzmaTrapEvents(report('B',trace));
  assert.deepEqual(actual,[{
    playedBy:'candidate',guzmaOrdinal:27,guzmaTurn:2,
    previousActive:'Shadow Rider Calyrex V',nextActive:'Dialga-GX',
    sustainedCandidatePassTurns:[2,4],
    uncoveredPrintedBasicCostTurns:[2,4]
  }]);
});

test('opponent Guzma traps a previously active attacker', () => {
  const trace = [pass(0,1,'Shadow Rider Calyrex V'),
    {action:'PlayCardAction',card:'Guzma',playerSlot:1,
      turnBefore:2,actionOrdinal:27},
    pass(0,3,'Dialga-GX'),pass(0,5,'Dialga-GX')];
  const events = guzmaTrapEvents(report('A',trace));
  assert.equal(events.length,1);
  assert.equal(events[0].playedBy,'opponent');
  assert.deepEqual(events[0].sustainedCandidatePassTurns,[3,5]);
});

test('no trap is reported on unchanged Active, one pass, or later attack', () => {
  const unchanged = report('A',[pass(0,1,'Dialga-GX'),
    {action:'PlayCardAction',card:'Guzma',playerSlot:1,turnBefore:2},
    pass(0,3,'Dialga-GX'),pass(0,5,'Dialga-GX')]);
  assert.deepEqual(guzmaTrapEvents(unchanged),[]);
  const one = report('A',[pass(0,1,'Shadow Rider Calyrex V'),
    {action:'PlayCardAction',card:'Guzma',playerSlot:1,turnBefore:2},
    pass(0,3,'Dialga-GX'),pass(0,5,'Latias ex')]);
  assert.deepEqual(guzmaTrapEvents(one),[]);
  const attacked = report('A',[pass(0,1,'Shadow Rider Calyrex V'),
    {action:'PlayCardAction',card:'Guzma',playerSlot:1,turnBefore:2},
    pass(0,3,'Dialga-GX'),
    {action:'AttackAction',playerSlot:0,turnBefore:5},
    pass(0,7,'Dialga-GX')]);
  assert.deepEqual(guzmaTrapEvents(attacked),[]);
});

test('lack of a source trace is an explicit blocker', () => {
  assert.throws(() => guzmaTrapEvents({candidateEngineSlot:'A',
    traceSummary:{chronologicalActionTrace:null}}),/Chronological trace/);
});
