'use strict';

const assert=require('node:assert/strict');
const reg=require('../../results/aichi-2026/registrations/agent32-fresh-early-vip-perfection-20261108.json');
const {
  runNativeBatch,summarizeRow,comparePairs
}=require('./agent32-fresh-perfection-field.cjs');

const VERSION='agent32-fresh-vip-donor-energy-perfection-two-seat-native-v1';

/** @returns {object[]} Exactly the frozen original sixteen source seat/deals. */
function trials(){
  assert.equal(reg.schema,
    'agent32-fresh-early-vip-perfection-composition-16groups-20261108-v1');
  assert.equal(reg.physicalDealGroups,16);
  assert.equal(reg.expectedGames,32);
  assert.equal(new Set(reg.groups.map(x=>x.id)).size,16);
  assert.equal(new Set(reg.groups.map(x=>x.rank)).size,8);
  for(const row of reg.groups) {
    assert.equal(row.id,[row.rank,row.repeat,row.candidateSlot,
      row.candidateId].join(':'));
    assert.equal(row.candidateId,reg.fixedCandidate);
    assert.ok(Number.isSafeInteger(row.seed)&&row.seed>=0&&
      row.seed<=0xffffffff);
  }
  return reg.groups.map(row=>({...row}));
}

/**
 * Extract concrete native evidence that a first-turn VIP really changed
 * Bench contents. Audit values are owned by the genuine active-side bot.
 *
 * @param {object} row Native original source attempt.
 * @returns {object}
 */
function setupEvidence(row){
  const details=row.actorOnlyDecisionCoverage?.detailedComponentAudits??{};
  const vip=details.ownerVipAfterPass??{};
  const root=details.root??{};
  const energy=(root.ownerRootIntents??[]).filter(x=>
    x.intent?.kind==='attach-basic-energy'&&
    (x.intent?.donorAttack!=null||
      x.intent?.recipientReason?.includes?.('energy')));
  return {
    trial:row.trial?.id??row.id,
    nativeVipItemAccepted:vip.acceptedItems??0,
    ownerDeckVipSearchAccepted:vip.acceptedSearches??0,
    nativePhysicalVipBenchConfirmed:vip.nativeBenchConfirmed??0,
    preferredMewtwoDonorPairSearches:vip.preferredMewtwoDonorSearches??0,
    firstTurnVipProposed:vip.proposedItems??0,
    vipUnresolvedPrompts:vip.unresolvedOwnerSearches??0,
    benchPerfectionFundingOptions:root.perfectionBenchFundingOptIn??null,
    earlyEnergyIntentCount:energy.length,
    earlyEnergyIntents:energy,
    paidPerfectionIntents:root.typedIntentCounts?.perfection??0,
    copiedAttacks:details.chooseAttack?.selections??[]
  };
}

/** @param {{runner?:Function}} [deps] */
function run(deps={}){
  const frozen=trials();
  const common={
    registeredTrials:frozen,registeredFrameName:reg.schema,
    nativeRootActionLimit:reg.rootLimit
  };
  const control=runNativeBatch(true,deps.runner,common);
  const enhanced=runNativeBatch(true,deps.runner,{
    ...common,
    vipAfterPass:true,vipPreferMewtwoDonor:true,
    energyRecipientFrontier:true,perfectionBenchFunding:true
  });
  const controls=control.selected.rawDevelopment.rows.map(row=>
    summarizeRow(row,true));
  const treatments=enhanced.selected.rawDevelopment.rows.map(row=>
    summarizeRow(row,true));
  const pairs=comparePairs(controls,treatments);
  const setup=enhanced.selected.rawDevelopment.rows.map(setupEvidence);
  const summary={
    pairedGroups:pairs.length,
    physicallyMatched:pairs.filter(x=>x.physicallyMatched).length,
    unchangedRootLedgers:pairs.filter(x=>
      x.control.ledgerSha&&
      x.control.ledgerSha===x.paidPerfection.ledgerSha).length,
    acceptedVipItems:setup.reduce((n,x)=>n+x.nativeVipItemAccepted,0),
    acceptedVipOwnerSearches:setup.reduce((n,x)=>n+x.ownerDeckVipSearchAccepted,0),
    genuineVipBenchEvents:setup.reduce((n,x)=>n+x.nativePhysicalVipBenchConfirmed,0),
    preferredMewtwoDonorSearches:setup.reduce((n,x)=>
      n+x.preferredMewtwoDonorPairSearches,0),
    unresolvedVipPrompts:setup.reduce((n,x)=>n+x.vipUnresolvedPrompts,0),
    paidPerfectionControl:controls.reduce((n,x)=>
      n+x.acceptedPerfectionRootIntents,0),
    paidPerfectionEnhanced:treatments.reduce((n,x)=>
      n+x.acceptedPerfectionRootIntents,0),
    nativeTerminalsControl:controls.filter(x=>x.status==='native-terminal').length,
    nativeTerminalsEnhanced:treatments.filter(x=>x.status==='native-terminal').length,
    pairedTerminalReversals:pairs.filter(x=>x.nativeResultReversed).length,
    nativeEngineErrors:[...controls,...treatments].filter(x=>
      x.status==='engine-error').length,
    nativeRootCaps:[...controls,...treatments].filter(x=>
      x.status==='root-cap').length,
    competitiveGamesQualified:0
  };
  return {
    version:VERSION,
    preregistration:reg.schema,
    registeredSourceRanks:reg.sourceRanks,
    fixedOriginalCandidate:reg.fixedCandidate,
    nativeEnginePin:reg.enginePin,
    nativeLimit:reg.rootLimit,
    actualNativeGames:controls.length+treatments.length,
    causalDifference:'Same Perfection root plus original owner-only first-turn Battle VIP, owner-deck-authorized Mewtwo/Gengar pairing, public-energy recipient funding',
    firstPolicy:'paid Perfection root only',
    secondPolicy:'paid Perfection root + VIP/Mewtwo/Gengar + early owner Psychic recipient',
    policySymmetricBothSeats:true,
    summary,pairs,setup,
    controls,treatments,
    status:summary.physicallyMatched===16&&summary.nativeEngineErrors===0?
      'matched-no-engine-errors':'unqualified-native-errors-or-deal-mismatch',
    releaseQualified:false,competitiveGamesQualified:0
  };
}

if(require.main===module){
  const report=run();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  if(report.summary.physicallyMatched!==16||
      report.summary.nativeEngineErrors>0)process.exitCode=1;
}

module.exports={VERSION,trials,setupEvidence,run};
