'use strict';

const fs = require('node:fs');
const assert = require('node:assert/strict');
const {isDeepStrictEqual} = require('node:util');

/** @param {object} record @returns {object} */
function summarize(record) {
  const seat = record.sourceCompressorSeat;
  const rows = record.traceSummary.rootActionLedger.filter(row => row.playerSlot === seat);
  const actions = (name, field, value) => rows.filter(row =>
    row.action === name && (field === null || row[field] === value));
  return {
    trialId: record.trialId,
    sourceSeat: seat,
    status: record.status,
    winnerIndex: record.winnerIndex,
    sourceEngineWon: record.status === 'completed-engine-game' && record.winnerIndex === seat,
    sourceAttacks: actions('AttackAction', null).map(x => ({
      ordinal: x.actionOrdinal, turn: x.turnBefore, attack: x.attack
    })),
    sourceRopePlays: actions('PlayCardAction', 'card', 'Escape Rope').map(x => x.actionOrdinal),
    sourceExtraEnergyBombs: actions('UseAbilityAction', 'ability', 'Extra Energy Bomb')
      .map(x => x.actionOrdinal),
    sourceElectroRain: actions('AttackAction', 'attack', 'Electro Rain')
      .map(x => x.actionOrdinal),
    sourceCompressorPlays: actions('PlayCardAction', 'card', 'Battle Compressor')
      .map(x => x.actionOrdinal)
  };
}

/**
 * Compare every original matched physical trial. Do not interpret engine
 * winners as competitive game-win estimates.
 * @param {object} control
 * @param {object} treatment
 * @returns {object}
 */
function compare(control, treatment) {
  const flag = 'rank4RaichuRopePivotSource';
  assert.equal(control.policyFlags[flag], false);
  assert.equal(treatment.policyFlags[flag], true);
  const aFlags = {...control.policyFlags};
  const bFlags = {...treatment.policyFlags};
  delete aFlags[flag];
  delete bFlags[flag];
  assert.deepStrictEqual(aFlags, bFlags, 'Only the frozen Rope flag may differ');
  for (const key of ['planDigest', 'fieldDigest', 'seedBase', 'seedProtocol',
    'campaignSchemaVersion', 'expectedEngineRevision', 'maxActions']) {
    assert.deepStrictEqual(control[key], treatment[key], 'Mismatched ' + key);
  }
  assert.deepStrictEqual(control.candidateRows, treatment.candidateRows);
  assert.deepStrictEqual(control.selectedPilotRanks, [4]);
  assert.deepStrictEqual(treatment.selectedPilotRanks, [4]);
  assert.equal(control.records.length, 8);
  assert.equal(treatment.records.length, 8);
  const paired = control.records.map((a, i) => {
    const b = treatment.records[i];
    for (const key of ['trialId', 'seed', 'candidateEngineSlot',
      'engineDeckHashes', 'candidateActualTurn', 'sourceCompressorSeat']) {
      assert.deepStrictEqual(a[key], b[key], a.trialId + ': mismatched ' + key);
    }
    assert.equal(a.status, 'completed-engine-game', a.trialId);
    assert.equal(b.status, 'completed-engine-game', b.trialId);
    assert.equal(b.sourceRopePivotSeat, a.sourceCompressorSeat);
    assert.equal(a.sourceRopePivotSeat, null);
    const rootA = a.traceSummary.rootActionLedger;
    const rootB = b.traceSummary.rootActionLedger;
    let index = 0;
    while (index < Math.min(rootA.length, rootB.length) &&
      isDeepStrictEqual(rootA[index], rootB[index])) index++;
    const excerpt = x => x ? {
      action: x.action, actor: x.playerSlot, turn: x.turnBefore,
      card: x.card ?? null, attack: x.attack ?? null, ability: x.ability ?? null
    } : null;
    const firstRootDivergence = index === rootA.length && index === rootB.length
      ? null : {ordinal: index, control: excerpt(rootA[index]), treatment: excerpt(rootB[index])};
    return {
      trialId: a.trialId,
      sourceSeat: a.sourceCompressorSeat,
      firstRootDivergence,
      control: summarize(a),
      treatment: summarize(b)
    };
  });
  const total = arm => ({
    completed: paired.filter(x => x[arm].status === 'completed-engine-game').length,
    sourceEngineWins: paired.filter(x => x[arm].sourceEngineWon).length,
    sourceAttacks: paired.reduce((n, x) => n + x[arm].sourceAttacks.length, 0),
    sourceRopePlays: paired.reduce((n, x) => n + x[arm].sourceRopePlays.length, 0),
    sourceExtraEnergyBombs: paired.reduce((n, x) => n + x[arm].sourceExtraEnergyBombs.length, 0),
    sourceElectroRain: paired.reduce((n, x) => n + x[arm].sourceElectroRain.length, 0),
    sourceCompressorPlays: paired.reduce((n, x) => n + x[arm].sourceCompressorPlays.length, 0)
  });
  return {
    researchStatus: 'development-only; competitively unqualified',
    samePhysicalDecksAndDeals: true,
    differingPolicyFlag: flag,
    control: total('control'),
    treatment: total('treatment'),
    changedTraces: paired.filter(x => x.firstRootDivergence !== null).length,
    paired
  };
}

if (require.main === module) {
  if (process.argv.length !== 4) {
    throw Error('Supply the control and treatment diagnostic JSON paths');
  }
  const control = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const treatment = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  console.log(JSON.stringify(compare(control, treatment), null, 2));
}

module.exports = {compare, summarize};
