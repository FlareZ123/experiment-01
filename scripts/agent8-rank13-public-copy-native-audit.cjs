'use strict';
const assert=require('node:assert/strict');
const {ownerApexPublicGates}=
  require('../simulation/evaluation/agent8-rank13-apex-public-conjunction.cjs');

const VERSION='agent8-rank13-prospective-native-copy-census-v1';

/**
 * Read-only examination of the actual archived owner observations. A native
 * winner is deliberately omitted from this developmental opportunity audit.
 * @param {object} report Full registered native JSON artifact.
 * @returns {object} Failure-inclusive physical-pair/gate census.
 */
function auditPublicCopyReport(report){
  assert.equal(report?.schema,'agent8-rank13-prospective-public-flat-copy-v1');
  assert.equal(report.sourceRank,13);
  assert.equal(report.opponentRank,1);
  assert.ok(Array.isArray(report.rows));
  assert.equal(report.attempts,report.rows.length*2);
  const events=[],seedIds=new Set();
  for(const row of report.rows){
    const {trial,fullNativeArms}=row;
    assert.ok(trial?.sourceSeat===0||trial?.sourceSeat===1);
    assert.ok(Number.isSafeInteger(trial.seed)&&trial.seed>=0&&
      trial.seed<=0xffffffff);
    assert.ok(!seedIds.has(trial.seed));
    seedIds.add(trial.seed);
    assert.ok(fullNativeArms?.control&&fullNativeArms?.selected);
    const a=fullNativeArms.control,b=fullNativeArms.selected;
    const returned=a.status==='native-returned'&&
      b.status==='native-returned';
    const sourceMatched=returned&&typeof a.sourceDealSha256==='string'&&
      a.sourceDealSha256.length===64&&
      a.sourceDealSha256===b.sourceDealSha256;
    const allMatched=sourceMatched&&
      typeof a.fullPhysicalDealSha256==='string'&&
      a.fullPhysicalDealSha256.length===64&&
      a.fullPhysicalDealSha256===b.fullPhysicalDealSha256;
    assert.equal(row.returned,returned);
    assert.equal(row.paired,allMatched);
    const validRoots=a.sourceOwnerPayloadAccessRoots??[];
    assert.ok(Array.isArray(validRoots));
    const gates=validRoots.map(ownerApexPublicGates);
    const any=index=>gates.some(index);
    const nativeCopies=['control','selected'].map(k=>{
      const choices=fullNativeArms[k].sourceNativeCopiedAttackChoices??[];
      assert.ok(Array.isArray(choices));
      return choices.length;
    });
    const controlBoardToSelected=returned&&
      JSON.stringify(a.publicAttackTransitions??[])===
        JSON.stringify(b.publicAttackTransitions??[])&&
      JSON.stringify(a.sourceOwnerPayloadAccessRoots??[])===
        JSON.stringify(b.sourceOwnerPayloadAccessRoots??[])&&
      JSON.stringify(a.prizesRemaining??null)===
        JSON.stringify(b.prizesRemaining??null);
    const custodyClean=returned&&[a,b].every(arm=>
      arm.physicalCustody?.abnormalSettledRoots===0);
    events.push({
      seed:trial.seed,sourceSeat:trial.sourceSeat,
      returned,allMatched,
      nativeActions:[a.nativeActionCount??null,b.nativeActionCount??null],
      nominalGateRoots:gates.length,
      everActiveVstar:any(x=>x.activeRegidragoVstar),
      everPublicDragonPayload:any(x=>x.publicDragonDiscardPayload),
      everPrintedCostPayable:any(x=>x.printedColoredApexCostPossiblySatisfied),
      everAllThreeGates:any(x=>x.allThreeNecessaryPublicGates),
      heldCompressorMissingPayloadRoots:validRoots.filter(x=>
        x.heldCompressorWhilePayloadMissing===true).length,
      copyChoices:nativeCopies,
      actionLedgerSame:returned&&
        typeof a.gameDecisionTraceSha256==='string'&&
        a.gameDecisionTraceSha256===b.gameDecisionTraceSha256,
      recordedPublicBoardParity:controlBoardToSelected,
      physicalCustodyClean:custodyClean,
      naturalNativeTerminals:[a,b].filter(x=>x.gameFinished===true).length,
      nativeCaps:[a,b].filter(x=>x.gameFinished!==true&&
        x.status==='native-returned').length
    });
  }
  const count=fn=>events.filter(fn).length;
  return {
    version:VERSION,attempts:report.attempts,
    physicalSeedGroups:events.length,
    bothSeats:new Set(events.map(x=>x.sourceSeat)).size===2,
    returnedPairs:count(x=>x.returned),
    matchedFullPhysicalPairs:count(x=>x.allMatched),
    activeVstarDeals:count(x=>x.everActiveVstar),
    publicPayloadDeals:count(x=>x.everPublicDragonPayload),
    payableDeals:count(x=>x.everPrintedCostPayable),
    allThreeNecessaryGateDeals:count(x=>x.everAllThreeGates),
    publicGateObservations:events.reduce((n,e)=>n+e.nominalGateRoots,0),
    pairsWithAnyCopySelection:count(x=>x.copyChoices.some(n=>n>0)),
    identicalActionLedgerPairs:count(x=>x.actionLedgerSame),
    pairsWithMatchingRecordedPublicBoardFields:
      count(x=>x.recordedPublicBoardParity),
    pairsWithCleanSettledCustody:count(x=>x.physicalCustodyClean),
    nativeTerminals:events.reduce((n,e)=>n+e.naturalNativeTerminals,0),
    actionCensoredAttempts:events.reduce((n,e)=>n+e.nativeCaps,0),
    competitiveQualifiedGames:0,
    rows:events
  };
}
module.exports={VERSION,auditPublicCopyReport};
