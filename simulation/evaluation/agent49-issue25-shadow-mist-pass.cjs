'use strict';
const assert=require('node:assert/strict');
const {censusSourceRoots}=
  require('./agent8-issue25-source-action-census.cjs');

const VERSION='agent49-issue25-shadow-mist-paper-lock-v1';
const RANK6_ENERGY=Object.freeze({
  'Speed Lightning Energy RCL':4,
  'Capture Energy RCL':2,
  'Spiky Energy JTG':1,
  'Double Colorless Energy SUM':1
});

/**
 * Original rank-6 source roster must contain exactly eight known Special
 * Energy printings. This is a pure print/copy-count gate, not a game state.
 * @param {{decks:object[]}} roster
 */
function rank6SpecialEnergyGate(roster){
  const decks=roster.decks.filter(d=>d.rank===6);
  assert.equal(decks.length,1);
  const energy=decks[0].cards.filter(c=>c.category==='Energy');
  const actual=Object.fromEntries(energy.map(c=>[
    c.name+' '+c.printing.set,c.count
  ]));
  assert.equal(energy.length,Object.keys(actual).length);
  assert.deepEqual(actual,RANK6_ENERGY);
  return true;
}

/**
 * Public accepted-root chronology only. Shadow Mist is a player-level
 * next-turn Special-Energy-from-hand lock if its printed effect settled.
 * Does not certify native effect settlement, owner-held alternatives,
 * Pass rationality, or a competitive game.
 * @param {object} archive
 * @param {{decks:object[]}} roster
 */
function shadowMistPassStratum(archive,roster){
  const source=censusSourceRoots(archive);
  rank6SpecialEnergyGate(roster);
  const passes=[];
  for(const row of archive.attempts){
    const rec=source.records.find(r=>r.id===row.id);
    assert.ok(rec);
    const seat=rec.sourceSeat;
    for(const root of row.publicRootActions){
      if(root.playerSlot!==seat||root.action!=='PassTurnAction')continue;
      assert.ok(Number.isSafeInteger(root.turnBefore)&&root.turnBefore>0);
      const previous=row.publicRootActions.filter(r=>
        r.playerSlot!==seat&&r.action==='AttackAction'&&
        r.actionOrdinal<root.actionOrdinal&&
        r.turnBefore===root.turnBefore-1).at(-1);
      const exposure=rec.sourceRank===6&&previous?.attack==='Shadow Mist';
      passes.push({
        id:row.id,sourceRank:rec.sourceRank,sourceSeat:seat,
        passOrdinal:root.actionOrdinal,passTurn:root.turnBefore,
        previousAttackOrdinal:previous?.actionOrdinal??null,
        previousAttackName:previous?.attack??null,
        shadowMistAllSourceEnergyHandPlayLockedIfEffectSettled:exposure,
        effectSettlementCertified:false,ownerHandKnown:false,
        passStrategicallyJustifiedCertified:false
      });
    }
  }
  assert.equal(passes.length,
    source.originalSourceActionCounts.PassTurnAction??0);
  return {version:VERSION,passes,
    originalSourcePassCount:passes.length,
    rank6SourcePassCount:passes.filter(x=>x.sourceRank===6).length,
    conditionalAllEnergyHandLockWindows:passes.filter(x=>
      x.shadowMistAllSourceEnergyHandPlayLockedIfEffectSettled),
    sourceAttackActions:source.originalSourceAttackActions,
    ownerOpportunityDenominatorCertified:false,
    competitiveGamesQualified:0};
}
module.exports={VERSION,RANK6_ENERGY,rank6SpecialEnergyGate,
  shadowMistPassStratum};
