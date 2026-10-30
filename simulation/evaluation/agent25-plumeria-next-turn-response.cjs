'use strict';

const assert = require('node:assert/strict');
const {auditPlumeriaHandCosts} =
  require('./agent25-plumeria-native-hand-cost.cjs');

const VERSION = 'agent25-native-plumeria-nextturn-response-v1';

/**
 * Reconcile each original pinned Store Plumeria Energy removal to the
 * opponent's immediately subsequent genuine owner turn and the source's
 * following turn. Public attached-Energy witnesses are accepted Store
 * physical target/board-change deltas. It never asserts the old opponent
 * action would persist under a changed intervening policy.
 * @param {object} archive Original Agent38 32-arm treatment JSON.
 * @returns {object} Fail-closed retrospective reply census.
 */
function auditPlumeriaNextTurns(archive) {
  const cost = auditPlumeriaHandCosts(archive);
  const originalRows = archive.result.rows;
  const source = new Map(originalRows.filter(row =>
    row.trial?.rank === 6).map(row => [row.trial.id, row]));
  const events = [];
  for (const record of cost.records) {
    const row = source.get(record.trialId);
    assert.ok(row && row.sourceSeat === record.sourceSeat);
    assert.ok(Array.isArray(row.rootActionLedger));
    assert.ok(Array.isArray(row.nativeAcceptedTargetSidecar?.events));
    const owner = record.sourceSeat;
    const opponent = 1 - owner;
    const nextOpponent = row.rootActionLedger.filter(root =>
      root.turnBefore === record.turn + 1 &&
      root.playerSlot === opponent && root.pendingPrompt === null);
    const nextSource = row.rootActionLedger.filter(root =>
      root.turnBefore === record.turn + 2 &&
      root.playerSlot === owner && root.pendingPrompt === null);
    assert.ok(nextOpponent.length > 0,
      'No next native opponent root after actual Plumeria settlement');
    assert.ok(nextSource.length > 0,
      'No next native source root after actual opponent continuation');
    const reattached = [];
    for (const root of nextOpponent.filter(root =>
      root.action === 'PlayCardAction' &&
      root.card === 'Psychic Energy')) {
      const native = row.nativeAcceptedTargetSidecar.events.filter(e =>
        e.rootActionOrdinal === root.actionOrdinal &&
        e.playerSlot === opponent &&
        e.turnBefore === root.turnBefore &&
        e.action === 'PlayCardAction' &&
        e.storeAccepted === true);
      assert.equal(native.length, 1, 'Missing exact native Energy root linkage');
      const changes = native[0].publicBoardChanges.filter(change =>
        change.seat === opponent &&
        change.after.energies.length === change.before.energies.length+1 &&
        change.after.energies.filter(energy =>
          energy === 'Psychic Energy MEE').length ===
          change.before.energies.filter(energy =>
            energy === 'Psychic Energy MEE').length+1);
      assert.equal(changes.length,1,
        'Declared Psychic Energy lacks physical public attachment witness');
      reattached.push({rootOrdinal:root.actionOrdinal,
        attachedTo:changes[0].after.pokemon,
        position:changes[0].position,
        index:changes[0].index,
        beforeEnergyCount:changes[0].before.energies.length,
        afterEnergyCount:changes[0].after.energies.length});
    }
    const attacks = nextOpponent.filter(root => root.action === 'AttackAction');
    const settledAttacks = attacks.map(root => {
      const records = row.candidateAttackSettlement?.attacks?.filter(attack =>
        attack.actionOrdinal === root.actionOrdinal &&
        attack.turnBefore === root.turnBefore &&
        attack.attackName === root.attack) ?? [];
      assert.equal(records.length, 1,
        'Native accepted opponent attack must match exactly one settlement');
      assert.equal(records[0].settledPromptChain, true,
        'An attack declaration without settled native prompt chain');
      assert.equal(records[0].settlementCrossesClockReset, false,
        'Native attack settlement crosses an invalid epoch boundary');
      return {attackName:root.attack,rootOrdinal:root.actionOrdinal,
        completionRootOrdinal:records[0].completionRootOrdinal};
    });
    const nextSourceOnlyPass = nextSource.length === 1 &&
      nextSource[0].action === 'PassTurnAction';
    events.push({trialId:record.trialId,plumeriaTurn:record.turn,
      originalPlumeriaRootOrdinal:record.rootOrdinal,
      originalDiscardedEnergy:record.settledOpponentEnergy,
      opponentTurn:record.turn+1,
      nextOpponentRootCount:nextOpponent.length,
      opponentAcceptedAttackNames:attacks.map(root => root.attack),
      opponentSettledAttacks:settledAttacks,
      opponentPsychicReattachments:reattached,
      nextSourceTurn:record.turn+2,
      nextSourceRootCount:nextSource.length,
      nextSourceOnlyPass,
      nextSourceRoots:nextSource.map(root => ({
        actionOrdinal:root.actionOrdinal,
        action:root.action, card:root.card ?? null,
        attack:root.attack ?? null
      })),
      noCompetitiveInference:true});
  }
  assert.equal(events.length,cost.settledPlumeriaChains);
  return {version:VERSION, archivedOriginalRank6Games:cost.sourceRank6Games,
    settledPlumeriaSourceChains:events.length,
    nextOpponentRootFound:events.filter(e=>e.nextOpponentRootCount>0).length,
    nextSourceRootFound:events.filter(e=>e.nextSourceRootCount>0).length,
    immediatelyNextOpponentTurnPsychicReattachments:
      events.filter(e=>e.opponentPsychicReattachments.length>0).length,
    physicallyProvenPsychicAttachments:events.reduce((n,e)=>
      n+e.opponentPsychicReattachments.length,0),
    nextOpponentAttackDeclarations:events.filter(e=>
      e.opponentAcceptedAttackNames.length>0).length,
    nextOpponentWithSettledAttack:events.filter(e=>
      e.opponentSettledAttacks.length>0).length,
    nextSourcePassOnly:events.filter(e=>e.nextSourceOnlyPass).length,
    records:events,
    competitiveQualifiedGames:0,
    caveat:'Observed original Store continuation after settled Plumeria; next-turn attach or attack does not prove previous denial was useless or infer counterfactual actions. Repeated source-deal arms are correlated.'};
}

module.exports = {VERSION,auditPlumeriaNextTurns};
