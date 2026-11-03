'use strict';

const assert = require('node:assert/strict');
const {auditSelectedV2SourcePairCensus} =
  require('./agent44-selected-v2-cross-candidate-archive-census.cjs');

const WINDOWS = Object.freeze([6,10,20,40]);

/** @param {unknown} values @returns {boolean} */
function validPrizeVector(values) {
  return Array.isArray(values) && values.length === 2 &&
    values.every(x=>Number.isSafeInteger(x) && x >= 0 && x <= 6);
}

/**
 * Authenticated source settlements by actual global-turn window. All
 * observations are postgame public receipts, and the raw unit is a repeated
 * historical source attack rather than an independent match outcome.
 * @param {object[]} rows
 * @returns {object}
 */
function summarizeSourceAttackWindows(rows) {
  assert.ok(Array.isArray(rows));
  const windows=Object.fromEntries(WINDOWS.map(limit=>[
    String(limit),{limit,settled:0,positivePrizeChanges:0,
      originalSourcePrizesTaken:0,rowsWithSettledAttacks:0}
  ]));
  const seenByWindow=Object.fromEntries(WINDOWS.map(limit=>[limit,new Set()]));
  const all={settled:0,positivePrizeChanges:0,originalSourcePrizesTaken:0,
    rowsWithSettledAttacks:0};
  let declarations=0,unsettled=0,missingPrizeReceipts=0;
  let unavailableSourceRows=0,sourceRowsWithNoSettledAttack=0;
  let nonMonotonicPrizeChanges=0;
  const allSeen=new Set();
  for(const row of rows) {
    assert.ok(row?.trial?.id && typeof row.trial.id === 'string');
    const packet=row.sourceAttackSettlement;
    if(packet===null || packet===undefined) {
      unavailableSourceRows+=1;
      continue;
    }
    const sourceSeat=row.sourceSeat;
    assert.ok(sourceSeat===0 || sourceSeat===1);
    assert.equal(sourceSeat,row.trial.candidateSlot==='A'?1:0);
    assert.ok(Array.isArray(packet.attacks));
    assert.equal(packet.declarations,packet.attacks.length);
    const settled=packet.attacks.filter(a=>a.settledPromptChain===true);
    assert.equal(packet.settled,settled.length);
    declarations+=packet.declarations;
    unsettled+=packet.declarations-packet.settled;
    if(settled.length===0)sourceRowsWithNoSettledAttack+=1;
    for(const attack of settled) {
      assert.ok(Number.isSafeInteger(attack.turnBefore) &&
        attack.turnBefore >= 0);
      assert.ok(typeof attack.attackName === 'string' &&
        attack.attackName.length > 0);
      all.settled+=1;
      allSeen.add(row.trial.id);
      for(const limit of WINDOWS) {
        if(attack.turnBefore > limit)continue;
        windows[String(limit)].settled+=1;
        seenByWindow[limit].add(row.trial.id);
      }
      if(!validPrizeVector(attack.prizesBefore) ||
        !validPrizeVector(attack.prizesAfter)) {
        missingPrizeReceipts+=1;
        continue;
      }
      const delta=attack.prizesBefore[sourceSeat]-
        attack.prizesAfter[sourceSeat];
      if(delta < 0)nonMonotonicPrizeChanges+=1;
      if(delta<=0)continue;
      all.positivePrizeChanges+=1;
      all.originalSourcePrizesTaken+=delta;
      for(const limit of WINDOWS) {
        if(attack.turnBefore > limit)continue;
        windows[String(limit)].positivePrizeChanges+=1;
        windows[String(limit)].originalSourcePrizesTaken+=delta;
      }
    }
  }
  all.rowsWithSettledAttacks=allSeen.size;
  for(const limit of WINDOWS){
    windows[String(limit)].rowsWithSettledAttacks=seenByWindow[limit].size;
  }
  return {
    schema:'agent44-source-attack-payoff-by-actual-global-turn-v1',
    sourceAttemptRows:rows.length,unavailableSourceRows,
    sourceRowsWithNoSettledAttack,
    declarations,unsettled,missingPrizeReceipts,
    nonMonotonicPrizeChanges,all,windows
  };
}

/**
 * Strictly replay historical source-per-turn receipts under two frozen
 * policies. The source-pair census must validate original 52-arm integrity.
 * @param {object} archive
 * @returns {object}
 */
function auditSelectedV2SourceAttackWindows(archive) {
  const pairing=auditSelectedV2SourcePairCensus(archive);
  const modes=[];
  for(const mode of archive.modes) {
    const rows=mode.native.rows;
    const ranks=[...new Set(rows.map(r=>r.trial.rank))]
      .sort((a,b)=>a-b);
    const byRank=Object.fromEntries(ranks.map(rank=>[
      String(rank),summarizeSourceAttackWindows(rows.filter(r=>
        r.trial.rank===rank))
    ]));
    modes.push({mode:mode.id,byRank});
  }
  return {
    schema:'agent44-frozen-native-source-payoff-window-census-v1',
    originalArchiveSchema:archive.schema,
    registrationContexts:pairing.comparisons,
    witnessedInitialSourceParity:pairing.modes.map(x=>
      ({mode:x.mode,counts:x.counts})),
    globalTurnWindows:[...WINDOWS],
    independentlyQualifiedGames:0,
    gameplayCompetenceCertified:false,
    modes
  };
}

module.exports = {
  validPrizeVector,summarizeSourceAttackWindows,
  auditSelectedV2SourceAttackWindows
};
