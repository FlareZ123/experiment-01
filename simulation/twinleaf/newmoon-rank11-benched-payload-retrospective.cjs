'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');
const {deriveSlotSeeds}=
  require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy}=
  require('./newmoon-garbotoxin-blower-autonomy.cjs');
const {arm,observations}=require('./newmoon-rank11-payload-prospective.cjs');

/**
 * Fixed older registered repeat 1 with an additional explicitly post-hoc
 * opt-in Benched-Mewtwo policy. Existing baseline parameters, lists and
 * physical seat allocation are preserved. This is RETROSPECTIVE discovery,
 * never a pre-registered performance estimate.
 *
 * @param {string[]} candidate The frozen New Moon 60.
 * @param {string[]} opponent Published rank-11 Absol Garbodor 60.
 * @param {number} seed Source pair seed.
 * @returns {object}
 */
function benchArm(candidate,opponent,seed){
  const request={
    deckA:opponent,deckB:candidate,seed,maxActions:200,
    rank11SourceSeat:0,strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,
    newMoonOpeningHorrorHouseSeat:1,
    newMoonAttackPayloadCompressorBenchedSeat:1,
    label:'newmoon-rank11-retrospective-BenchedMewtwoCompressor-v2'
  };
  try{
    const {result,policyAudit}=withNewMoonBlowerAutonomy(1,
      ()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE));
    const own=result.decisionTrace.filter(row=>row.playerSlot===1);
    return {
      ok:true,
      observations:observations(result),
      earlyCompressorHeldDecisions:own.filter(row=>
        row.decisionHandBefore?.ownHandPrintings?.some(x=>
          x.startsWith('Battle Compressor'))).slice(0,20).map(row=>({
            ordinal:row.actionOrdinal,turn:row.turnBefore,
            action:row.action,card:row.card
          })),
      blowerAudit:{
        selected:policyAudit.opportunitySelections,
        removed:policyAudit.confirmedToolRemovals
      }
    };
  }catch(error){
    return {ok:false,error:String(error?.stack||error),
      qualifiedForCompetitiveInference:false};
  }
}

/** @returns {object} */
function main(){
  const repeat=1;
  const seed=deriveSlotSeeds(20261018,'pilot',11,repeat).B;
  assert.equal(seed,599726095,
    'Preserve the original twelve-deal cohort source seed exactly');
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(o=>o.rank===11);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);

  const oldActiveOnly=arm(plan.candidate.cards,opponent.cards,seed,true);
  const benched=benchArm(plan.candidate.cards,opponent.cards,seed);
  const physicalPair=oldActiveOnly.ok&&benched.ok;
  if(physicalPair){
    assert.deepEqual(oldActiveOnly.observations.deckHashes,
      benched.observations.deckHashes);
    assert.equal(oldActiveOnly.observations.actualStartingSeat,
      benched.observations.actualStartingSeat);
  }
  const packet={
    schema:'newmoon-rank11-bench-prep-retrospective-repeat1-v1',
    timing:'post hoc hypothesis on an already examined source seed',
    candidateSeat:1,sourceRank:11,sourceSeat:0,
    originalRegisteredRepeat:repeat,
    originalRegisteredSeed:seed,
    totalOriginalRegisteredRepeats:12,
    enginePin:plan.engineRevision,
    candidatePrintHash:candidate.proxyIdCountHash,
    physicalDealParityVerified:physicalPair,
    comparison:'archived Active-Mewtwo-only tactic under current head versus additional opt-in Benched-Mewtwo anticipatory tactic; frozen 60s',
    oldActiveOnly,benched,
    fullCohortCompared:false,
    fairProspectiveStrengthEvidence:false,
    qualifiedForCompetitiveInference:false
  };
  const brief={schema:packet.schema,seed,physicalDealParityVerified:physicalPair,
    old:{
      ok:oldActiveOnly.ok,
      compressorPlays:oldActiveOnly.observations?.compressorPlays,
      payloadDiscards:oldActiveOnly.observations?.payloadDiscards,
      copyAttacks:oldActiveOnly.observations?.nativeOrCopiedAttacks,
      engineWinner:oldActiveOnly.observations?.engineWinner,
      actions:oldActiveOnly.observations?.rootActions,
      error:oldActiveOnly.error
    },
    benched:{
      ok:benched.ok,
      compressorPlays:benched.observations?.compressorPlays,
      payloadDiscards:benched.observations?.payloadDiscards,
      copyAttacks:benched.observations?.nativeOrCopiedAttacks,
      engineWinner:benched.observations?.engineWinner,
      actions:benched.observations?.rootActions,
      error:benched.error
    }};
  process.stderr.write('RETROSPECTIVE_MECHANICS_ONLY ' +
    JSON.stringify(brief)+'\n');
  process.stdout.write(JSON.stringify(packet,null,2)+'\n');
  return packet;
}

if(require.main===module)main();
module.exports={main,benchArm};
