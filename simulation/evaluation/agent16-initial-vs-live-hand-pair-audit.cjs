'use strict';

const assert=require('node:assert/strict');

const HEX64=/^[0-9a-f]{64}$/;
const PROTOCOL='first-live-owner-hand-prebot-v1';

/** @param {unknown} value @returns {string|null} */
function digest(value){
  return typeof value==='string'&&HEX64.test(value)?value:null;
}

/** @param {string|null} a @param {string|null} b */
function compare(a,b){
  return a===null||b===null?'UNKNOWN':a===b?'MATCHED':'MISMATCHED';
}

/**
 * Compare two actual native attempts. A first-own-turn hand is an outcome:
 * when the source goes second, its opponent has already had a turn in which
 * it can affect that hand. Never require that post-start hand to match as a
 * prerequisite for estimating the effect of the opponent's deck or policy.
 *
 * @param {object} a Original source against comparison candidate A.
 * @param {object} b Original source against comparison candidate B.
 * @returns {object} Postgame-only provenance, with no game qualification.
 */
function auditInitialVsLiveSourceHands(a,b){
  assert.ok(a?.trial&&b?.trial);
  for(const field of ['rank','repeat','candidateSlot','seed']){
    assert.equal(a.trial[field],b.trial[field]);
  }
  assert.ok(a.trial.candidateId!==b.trial.candidateId,
    'Expected different frozen contender identities');
  const initialDealStatus=compare(
    digest(a.sourceDealFingerprint),digest(b.sourceDealFingerprint));
  const starterA=a.verifiedFirstTurn===true&&
    (a.actualStarterSeat===0||a.actualStarterSeat===1)?a.actualStarterSeat:null;
  const starterB=b.verifiedFirstTurn===true&&
    (b.actualStarterSeat===0||b.actualStarterSeat===1)?b.actualStarterSeat:null;
  const starterStatus=compare(starterA,starterB);
  const sourceSeatA=a.sourceSeat,sourceSeatB=b.sourceSeat;
  const sourceSeatStatus=
    (sourceSeatA===0||sourceSeatA===1)&&
    (sourceSeatB===0||sourceSeatB===1)?
    (sourceSeatA===sourceSeatB?'MATCHED':'MISMATCHED'):'UNKNOWN';
  const validLive=row=>row.sourceFirstOwnHandProtocol===PROTOCOL;
  const orderedLiveStatus=compare(
    validLive(a)?digest(a.sourceFirstOwnHandSha256):null,
    validLive(b)?digest(b.sourceFirstOwnHandSha256):null);
  const multisetLiveStatus=compare(
    validLive(a)?digest(a.sourceFirstOwnHandMultisetSha256):null,
    validLive(b)?digest(b.sourceFirstOwnHandMultisetSha256):null);
  const sourceActuallySecond=starterStatus==='MATCHED'&&
    sourceSeatStatus==='MATCHED'&&starterA!==sourceSeatA;
  const pairedAtInitialRoot=initialDealStatus==='MATCHED'&&
    starterStatus==='MATCHED'&&sourceSeatStatus==='MATCHED';
  const postStartHandDifference=orderedLiveStatus==='MISMATCHED'||
    multisetLiveStatus==='MISMATCHED';
  return {
    schema:'agent16-initial-vs-first-live-source-hand-custody-v1',
    initialDealStatus,starterStatus,sourceSeatStatus,
    orderedLiveStatus,multisetLiveStatus,
    pairedAtInitialRoot,
    sourceActuallySecond:sourceActuallySecond?true:
      pairedAtInitialRoot?false:null,
    postStartHandDifference,
    postStartHandInterpretation:!pairedAtInitialRoot?
      'NO_VERIFIED_INITIAL_PAIR':
      !postStartHandDifference?'NO_OBSERVED_LIVE_HAND_DISCORDANCE':
      sourceActuallySecond?'POSSIBLE_OPPONENT_TURN_EFFECT':
      'REPLAY_FIRST_TURN_PREBOT_DIFFERENCE',
    inferentialBoundary:'The first-live hand is downstream of initial setup and may be modified by opposing play. Preserve natural attempts in the game-win denominator; never select them by post-start hand equality.',
    competitiveQualifiedGames:0
  };
}

module.exports={auditInitialVsLiveSourceHands};
