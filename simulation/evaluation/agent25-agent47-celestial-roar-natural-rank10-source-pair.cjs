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
const registered=require('../../results/als/registrations/agent25-agent47-celestial-roar-natural-rank10-20261101.json');

/**
 * Two pre-frozen natural-deal rank10 source games, correcting only the
 * previous researcher Agent47's existing printed-energy Celestial Roar bug.
 * Same source original physical 60, policies, initial seed and both-seat
 * conservation assertion. Never qualify the result as a competitive game.
 */
function study(){
  assert.equal(registered.seed,original.seedsByRank[10]);
  assert.equal(registered.candidateSeat,1);
  const prepared=planAichi({label:'Agent25-natural-rank10-Agent47-existing-paper-hook',
    player:'Agent25 fixed Dhelmise v2',archetype:'HNS',cards:toPrintedManifest()},
  original.options);
  assert.equal(prepared.candidate.cards?.length,60);
  const source=prepared.opponents.find(p=>p.rank===10);
  assert.equal(source?.status,'ready');
  const records=[];
  for(const withCompressor of [false,true]){
    const request={deckA:source.cards,deckB:prepared.candidate.cards,
      seed:registered.seed,maxActions:registered.maxRootActions,
      ...original.options,
      label:registered.version+':'+(withCompressor?'owner-compressor':'default-owner'),
      capturePublicAttackTransitions:true,captureDecisionTrace:true,
      captureStartingBoard:true,
      ...(withCompressor?{dhelmiseDonorCompressorSeat:1}:{})};
    try{
      const hns=withCorrectedHnsDiscardAbilityCount(()=>
        withPaperCelestialRoarEnergy(()=>runMatch(request)));
      const game=hns.result.result;
      const paperAudit=hns.result.audit;
      const originalRegidragoAttackNames=(game.rootActionLedger??[])
        .filter(e=>e.attack==='Celestial Roar')
        .map(e=>({ordinal:e.actionOrdinal,turn:e.turnBefore,
          actingSeat:e.playerSlot}));
      records.push({policy:withCompressor?'owner-compressor':'default-owner',
        status:game.finished?'untimed-native-terminal':'native-root-cap',
        nativeActions:game.actions,turns:game.turns,
        physicalZoneIntegrity:game.physicalZoneIntegrity,
        gameFinished:game.finished,untrustedNativeWinner:game.winner,
        prizesRemaining:game.prizesRemaining,
        firstTurnPublicBoard:game.initialBoardAtFirstTurn??null,
        agent47PaperCelestialRoarAudit:paperAudit,
        agent25HnsAbilityAudit:hns.audit,
        sourceCelestialRoarActualRoots:originalRegidragoAttackNames,
        candidateNativePrintingSha:prepared.candidateNativeOrderedSha256,
        competitiveQualified:false});
    }catch(error){
      records.push({policy:withCompressor?'owner-compressor':'default-owner',
        status:'native-exception',code:error.code??null,
        error:String(error.message||error),
        physicalConservationWitness:error.physicalConservationWitness??null,
        celestialAuditOnThrow:error.nativeCelestialRoarSpecialEvidence??null,
        competitiveQualified:false});
    }
  }
  return {version:registered.version,pin:registered.pin,
    rootCap:registered.maxRootActions,seed:registered.seed,
    sourceRank:10,candidateSeat:1,
    newHookUsesExistingAgent47Module:true,
    records,competitivelyQualifiedGames:0,
    exactOriginalSourceAndCandidate60:true,
    fullPaperDecisionPolicyNotProven:true};
}
module.exports={study};
if(require.main===module)process.stdout.write(JSON.stringify(study(),null,2)+'\n');
