'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {toPrintedManifest}=require('./agent25-dhelmise-v2-native-three-lock-smoke.cjs');
const {withCorrectedHnsDiscardAbilityCount}=require(
  '../twinleaf/agent25-hns-discard-ability-lock-paper-hook.cjs');
const sourceRegistration=require('../../results/aichi-2026/registrations/agent25-rank13-celestial-original-failure-root-lineage-20261101.json');
const original=require('../../results/als/registrations/agent25-dhelmise-v2-native-three-lock-smoke-20261101.json');

/**
 * Retrospective forensic reproduction of a single previously failing
 * authentic original source 60, intentionally continuing past the first
 * failed physical-card check only to identify its native root lineage.
 * All results after the FIRST anomaly remain invalid.
 */
function study(){
  const prep=planAichi({label:sourceRegistration.version,
    player:'Agent25 original source-rank13 forensic challenger',
    archetype:'Dhelmise HNS',cards:toPrintedManifest()},original.options);
  const src=prep.opponents.find(p=>p.rank===13);
  assert.equal(src?.status,'ready');
  const request={
    deckA:src.cards,deckB:prep.candidate.cards,
    seed:sourceRegistration.seed,maxActions:sourceRegistration.maxActions,
    label:sourceRegistration.version,...original.options,
    captureDecisionTrace:true,capturePublicAttackTransitions:true,
    captureInitialFullPhysicalDeal:true,captureStartingBoard:true,
    enforceSettledPhysicalZoneIntegrity:false
  };
  let result;
  try{
    const wrapped=withCorrectedHnsDiscardAbilityCount(()=>runMatch(request));
    const game=wrapped.result;
    const physical=game.physicalZoneIntegrity;
    const first=physical?.firstSettledRootAnomaly??null;
    assert.ok(first,'Previously recorded original rank13 first physical59 must reproduce');
    const ledger=game.rootActionLedger??[];
    const ordinal=first.actionOrdinal-1;
    const root=ledger.find(e=>e.actionOrdinal===ordinal);
    const rootContext=ledger.filter(e=>e.actionOrdinal>=ordinal-16&&
      e.actionOrdinal<=ordinal+3);
    const latestAttackBefore=ledger.filter(e=>e.action==='AttackAction'&&
      e.actionOrdinal<=ordinal).slice(-2);
    const transitions=(game.publicAttackTransitions??[])
      .filter(e=>(e.actionOrdinal??0)>=ordinal-17&&
        (e.actionOrdinal??0)<=ordinal+3);
    const attackDeclarations=(game.attackDeclarationTrace??[])
      .filter(e=>(e.actionOrdinal??0)>=ordinal-17&&
        (e.actionOrdinal??0)<=ordinal+3);
    result={status:'reproduced-invalid-native-physical-custody',
      firstSettledAnomaly:first,firstAnomalousRoot:root,
      rootWindow:rootContext,latestAttackRoot:latestAttackBefore,
      localPublicAttackTransitions:transitions,
      attackDeclarationWindow:attackDeclarations,
      physicalLedgerSummary:{
        actionsChecked:physical.rootActionsChecked,
        settledRootsChecked:physical.settledRootsChecked,
        settledRootsWithAnomaly:physical.settledRootsWithAnomaly,
        firstAnomaly:physical.firstAnomaly,
      },originalFullInitialDealHash:
        game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      hnsAudit:wrapped.audit,
      invalidPostAnomalyRootCount:game.actions-ordinal};
  }catch(error){
    result={status:'native-exception',code:error.code??null,
      message:String(error.stack||error),
      firstPhysicalWitness:error.physicalConservationWitness??null};
  }
  return {version:sourceRegistration.version,
    originalSourceRank:13,candidateSeat:1,seed:sourceRegistration.seed,
    enginePin:sourceRegistration.enginePin,
    sameOriginalBothSixties:true,
    strictlyNoPaperCelestialCorrection:true,
    strictPhysicalGateDeliberatelyOffForForensics:true,
    competitiveQualifiedGames:0,result};
}
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
