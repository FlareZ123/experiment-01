'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  canPayVoltCost, oneRemovedCard,
  classifyVoltDonorDebt, auditRank6VoltDonorDebt
} = require('../simulation/evaluation/agent45-volt-cyclone-donor-debt.cjs');

const speed = 'Speed Lightning Energy';
const spiky = 'Spiky Energy';
const dce = 'Double Colorless Energy';

/**
 * @param {string[]} before
 * @param {string[]} after
 * @param {string[]} [stadium]
 * @param {boolean} [benched]
 * @returns {object}
 */
function attack(before, after, stadium = [], benched = true) {
  const ownBoard = (energies) => ({
    active:{name:'Iron Thorns ex',energyCards:energies,toolCards:[]},
    bench:benched ? [{name:'Iron Thorns ex'}] : [],
    stadium
  });
  return {
    attackName:'Volt Cyclone',settledPromptChain:true,
    actionOrdinal:8,turnBefore:9,
    publicBoardBefore:[{},ownBoard(before)],
    publicBoardAfter:[{},ownBoard(after)]
  };
}

test('typed Lightning plus total Energy units govern printed Volt cost', () => {
  assert.equal(canPayVoltCost([speed,dce],[]),true);
  assert.equal(canPayVoltCost([spiky,dce],[]),false);
  assert.equal(canPayVoltCost([speed,spiky],[]),false);
  assert.equal(canPayVoltCost([speed,spiky],['Thunder Mountain Prism Star']),true);
  assert.equal(canPayVoltCost([speed],['Thunder Mountain Prism Star']),false);
  assert.equal(canPayVoltCost([speed,dce],['Wondrous Labyrinth Prism Star']),false);
  assert.equal(canPayVoltCost(['Unknown Energy'],[]),null);
  assert.equal(canPayVoltCost([speed,dce],['Other Stadium']),null);
});

test('multiset difference detects precisely one physical Energy card', () => {
  assert.equal(oneRemovedCard([speed,dce,spiky],[dce,spiky]),speed);
  assert.equal(oneRemovedCard([speed,speed,dce],[speed,dce]),speed);
  assert.equal(oneRemovedCard([speed,dce],[speed,dce]),null);
  assert.equal(oneRemovedCard([speed,dce],[speed,spiky]),null);
});

test('native default donor leaves avoidable Lightning deficit', () => {
  const a = attack([speed,spiky,dce],[spiky,dce]);
  const d = classifyVoltDonorDebt(a,1);
  assert.equal(d.status,'VERIFIED_BENCHED');
  assert.equal(d.observedDonor,speed);
  assert.equal(d.printedCostImmediatelyPayable,false);
  assert.equal(d.avoidableDonorDebt,true);
  assert.deepEqual(d.safeDonorAlternatives,[spiky]);
});

test('choosing Spiky preserves another printed-cost attack on same public board', () => {
  const d = classifyVoltDonorDebt(
    attack([speed,spiky,dce],[speed,dce]),1);
  assert.equal(d.observedDonor,spiky);
  assert.equal(d.printedCostImmediatelyPayable,true);
  assert.equal(d.avoidableDonorDebt,false);
  assert.deepEqual(d.safeDonorAlternatives,[spiky]);
});

test('insufficient total Energy gives unavoidable immediate debt', () => {
  const d = classifyVoltDonorDebt(
    attack([speed,spiky],[speed]),1);
  assert.equal(d.printedCostImmediatelyPayable,false);
  assert.equal(d.avoidableDonorDebt,false);
  assert.deepEqual(d.safeDonorAlternatives,[]);
});

test('solo attack retains cost, and malformed or unset states fail closed', () => {
  const solo = classifyVoltDonorDebt(
    attack([speed,dce],[speed,dce],[],false),1);
  assert.equal(solo.status,'VERIFIED_SOLO');
  assert.equal(solo.printedCostImmediatelyPayable,true);
  assert.equal(classifyVoltDonorDebt(
    attack([speed,dce],[speed],[],false),1).status,
  'SOLO_ENERGY_CHANGED');
  const unknown = attack([speed,dce],[speed]);
  unknown.publicBoardAfter[1].active.toolCards = ['Unknown Tool'];
  assert.equal(classifyVoltDonorDebt(unknown,1).status,'PUBLIC_STATE_UNVERIFIED');
  assert.equal(classifyVoltDonorDebt({...unknown,settledPromptChain:false},1).status,
    'OUT_OF_SCOPE_OR_UNSETTLED');
});

test('census preserves correlated source games and actual next-turn dispositions', () => {
  const invalidDonor = attack([speed,spiky,dce],[spiky,dce]);
  const validDonor = attack([speed,spiky,dce],[speed,dce]);
  validDonor.actionOrdinal = 18;
  validDonor.turnBefore = 13;
  const solo = attack([speed,dce],[speed,dce],[],false);
  solo.actionOrdinal = 28;
  solo.turnBefore = 17;
  const archive = {rows:[
    {trial:{rank:6,id:'6:0:A:champion-reference'},sourceSeat:1,
      sourceAttackSettlement:{attacks:[invalidDonor,validDonor,solo]},
      rootActionLedger:[
        {turnBefore:11,playerSlot:1,action:'PassTurnAction'},
        {turnBefore:15,playerSlot:1,action:'PlayCardAction',card:speed},
        {turnBefore:15,playerSlot:1,action:'AttackAction'}
      ]},
    {trial:{rank:11,id:'11:0:A:champion-reference'},sourceSeat:1,
      sourceAttackSettlement:{attacks:[]},rootActionLedger:[]}
  ]};
  const r = auditRank6VoltDonorDebt(archive);
  assert.equal(r.attempts,1);
  assert.equal(r.settledVoltAttacks,3);
  assert.equal(r.benched,2);
  assert.equal(r.solo,1);
  assert.equal(r.immediatelyPayableSolo,1);
  assert.equal(r.benchedPrintedCostDebt,1);
  assert.equal(r.avoidableBenchedDonorDebt,1);
  assert.equal(r.benchedNextTurnPasses,1);
  assert.equal(r.benchedNextTurnAttacks,1);
  assert.equal(r.observedBenchedAttackWithAttachment,1);
  assert.deepEqual(r.sourceGamesWithAvoidableDonorDebt,
    ['6:0:A:champion-reference']);
  assert.equal(r.counterexamples.length,1);
  assert.equal(r.counterexamples[0].rootActionOrdinal,8);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('duplicate trials cannot silently inflate source games', () => {
  const row = {trial:{rank:6,id:'duplicate'},sourceSeat:1,
    sourceAttackSettlement:{attacks:[]},rootActionLedger:[]};
  assert.throws(() => auditRank6VoltDonorDebt({rows:[row,row]}),
    /Duplicate native trial/);
});
