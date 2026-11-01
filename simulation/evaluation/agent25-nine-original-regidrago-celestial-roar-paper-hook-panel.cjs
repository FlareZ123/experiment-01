'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {toPrintedManifest}=require('./agent25-dhelmise-v2-native-three-lock-smoke.cjs');
const {withPaperCelestialRoarEnergy}=require(
  '../twinleaf/agent47-celestial-roar-paper-energy-hook.cjs');
const {withCorrectedHnsDiscardAbilityCount}=require(
  '../twinleaf/agent25-hns-discard-ability-lock-paper-hook.cjs');
const original=require('../../results/als/registrations/agent25-dhelmise-v2-native-three-lock-smoke-20261101.json');
const registered=require('../../results/aichi-2026/registrations/agent25-nine-original-regidrago-celestial-roar-paper-hook-20261101.json');

/** Nine preregistered original Aichi Regidrago source 60s, two arms each.
 * Native roots, real source printed cards; no winner qualifications.
 * @returns {object}
 */
function study(){
  const prepared=planAichi({
    label:registered.version,player:'Agent25 frozen development challenger',
    archetype:'Dhelmise HNS v2',cards:toPrintedManifest()
  },original.options);
  assert.equal(prepared.candidate.cards?.length,60);
  assert.deepEqual(registered.sourceRanks,[10,12,13,14,18,20,21,27,32]);
  const results=[];
  for(const rank of registered.sourceRanks){
    const opponent=prepared.opponents.find(d=>d.rank===rank);
    if(opponent?.status!=='ready'){
      for(const correction of [false,true])
        results.push({rank,correction,status:'source-printing-unresolved',
          opponentStatus:opponent?.status??'missing',
          competitiveQualified:false});
      continue;
    }
    for(const correction of [false,true]){
      const request={
        deckA:opponent.cards,deckB:prepared.candidate.cards,
        seed:registered.oneSeedPerRank[rank],
        maxActions:registered.maxNativeRootActions,
        label:registered.version+':'+rank+':'+(correction?'paper':'original'),
        ...original.options,
        captureDecisionTrace:true,captureInitialFullPhysicalDeal:true,
        captureStartingBoard:true
      };
      try{
        const nested=withCorrectedHnsDiscardAbilityCount(()=>
          correction?withPaperCelestialRoarEnergy(()=>runMatch(request)):
          {result:runMatch(request),audit:null});
        const game=nested.result.result;
        const celestial=(game.rootActionLedger??[])
          .filter(e=>e.action==='AttackAction'&&e.attack==='Celestial Roar');
        results.push({rank,correction,
          status:game.finished?'untimed-engine-terminal':'120-root-action-cap',
          actions:game.actions,turns:game.turns,
          sourceActualCelestialRoarAttacks:celestial.length,
          sourceNativeAttackRootOrdinals:celestial.map(e=>e.actionOrdinal),
          physicalConservation:game.physicalZoneIntegrity?
            {settledRootsChecked:game.physicalZoneIntegrity.settledRootsChecked,
             settledRootsWithAnomaly:game.physicalZoneIntegrity.settledRootsWithAnomaly,
             firstSettledRootAnomaly:game.physicalZoneIntegrity.firstSettledRootAnomaly}:null,
          sourcePrintSignature:opponent.nativeOrderedSha256??null,
          initialFullDealHash:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
          originalCandidateNativeSha:prepared.candidateNativeOrderedSha256,
          originalSourceRank:rank,
          correctionAudit:nested.result.audit,
          hnsAudit:{
            checks:nested.audit.countChecks,
            suppressed:nested.audit.suppressedDonors},
          untrustedNativeWinner:game.winner,
          prizesRemaining:game.prizesRemaining,
          competitiveQualified:false});
      }catch(error){
        results.push({rank,correction,
          status:'native-exception',code:error.code??null,
          message:String(error.message||error),
          firstPhysicalWitness:error.physicalConservationWitness??null,
          paperHookAuditOnError:error.nativeCelestialRoarSpecialEvidence??null,
          sourcePrintSignature:opponent.nativeOrderedSha256??null,
          competitiveQualified:false});
      }
    }
  }
  assert.equal(results.length,18);
  const byRank=registered.sourceRanks.map(rank=>{
    const two=results.filter(row=>row.rank===rank);
    const [original,paper]=two;
    return {rank,originalStatus:original.status,
      paperStatus:paper.status,
      paperSourceCelestialRoarCalls:paper.sourceActualCelestialRoarAttacks??0,
      paperBasicReveals:paper.correctionAudit?.candidateBasicEnergyCards??0,
      paperSpecialReveals:paper.correctionAudit?.candidateSpecialEnergyCards??0,
      paperNativePhysicalAnomalies:paper.physicalConservation?
        paper.physicalConservation.settledRootsWithAnomaly:null,
      pairedInitialDealShaEqual:original.initialFullDealHash&&paper.initialFullDealHash?
        original.initialFullDealHash===paper.initialFullDealHash:null};
  });
  return {version:registered.version,enginePin:registered.enginePin,
    sourceRanks:registered.sourceRanks,seeds:registered.oneSeedPerRank,
    originalOpponentRosterCount:prepared.opponents.length,
    sourceCandidatePrinting:prepared.candidateNativeOrderedSha256,
    aggregate:{
      originalNativeExceptions:results.filter(x=>!x.correction&&x.status==='native-exception').length,
      paperNativeExceptions:results.filter(x=>x.correction&&x.status==='native-exception').length,
      originalGamesWithCelestial:results.filter(x=>!x.correction&&x.sourceActualCelestialRoarAttacks>0).length,
      paperGamesWithCelestial:results.filter(x=>x.correction&&x.sourceActualCelestialRoarAttacks>0).length,
      sourceOriginalsUnresolved:results.filter(x=>!x.correction&&x.status==='source-printing-unresolved').length
    },byRank,results,competitivelyQualifiedGames:0,
    allObservedNativeWinnersUnqualified:true};
}
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
