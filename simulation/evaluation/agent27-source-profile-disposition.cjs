'use strict';
const assert=require('node:assert/strict');

/**
 * Machine-parseable release gate accounting for a bounded, explicitly
 * selected original-source canary. All fields describe only the registered
 * tests; they never certify an entire paper game or field win rate.
 * @param {object} profile Frozen canary profile.
 * @param {object[]} cases Matched original source attempts.
 * @returns {object}
 */
function sourceCanaryDisposition(profile,cases){
  assert.equal(profile.schema,'agent27-original-source-min2-canary-profile-v1');
  assert.ok(Array.isArray(cases));
  assert.equal(cases.length,profile.seedCases.length);
  const registered=cases.every((row,i)=>
    row.seed===profile.seedCases[i].seed&&
    JSON.stringify(row.seatRanks)===
      JSON.stringify(profile.seedCases[i].seatRanks));
  const paired=cases.every(row=>
    row.sameRegisteredOriginalSixties===true&&
    row.sameInitialFullPhysicalDeal===true);
  const sourceSeats=[...new Set(cases.map(row=>row.seatRanks.indexOf(10)))].sort();
  const bothSeats=registered&&paired&&JSON.stringify(sourceSeats)==='[0,1]';
  const corrected=cases.map(row=>row.repaired);
  const receipts=corrected.flatMap(row=>
    row.nativeMinimumAttachActionReceipts??[]);
  const accepted=receipts.filter(row=>
    row.nativeStoreActionAccepted===true&&
    row.twoDistinctPhysicalCards===true&&
    row.bothOriginalSourceCards===true&&
    row.bothAttachedToOriginalActive===true);
  const localPayment=registered&&paired&&
    corrected.every(row=>!row.failure&&
      (row.nativeMinimumAttachActionReceipts?.length??0)>0)&&
    accepted.length===receipts.length;
  const continuations=corrected.flatMap(row=>
    row.sourceNativeEnergyAttackContinuation?.promptEpisodes??[]);
  const sourcePayoff=localPayment&&continuations.length===accepted.length&&
    continuations.every(row=>
      row.status==='native-settled-source-attack-with-opponent-root'||
      row.status==='native-settled-source-attack-no-opponent-root');
  const nextOpponent=sourcePayoff&&continuations.every(row=>
    row.opponentReply?.actions?.length>0);
  return {
    schema:'agent27-selected-source-canary-release-disposition-v1',
    CONFIG_FROZEN:registered,
    BOTH_SEATS_EXECUTED:bothSeats,
    PAPER_PAYMENT_VERIFIED:localPayment?'LOCAL_MIN2_ATTACH_ONLY':'NOT_VERIFIED',
    SOURCE_PAYOFF_WITNESSED:sourcePayoff?'CELESTIAL_ROAR_RESOURCE_ATTACK_SETTLED':'NOT_VERIFIED',
    OPPONENT_CONTINUATION_WITNESSED:nextOpponent?'ACTUAL_ROOTS_ONLY':'NOT_VERIFIED',
    acceptedOriginalPhysicalTwoCardTransfers:accepted.length,
    matchedInitialPhysicalDeals:paired,
    registeredSourceSeatCoverage:sourceSeats,
    opponentPolicyCompetenceVerified:false,
    fullPaperPaymentAndRulesVerified:false,
    paperTwentyFiveMinuteClockVerified:false,
    originalTop32SourceRosterComplete:false,
    competitiveGameQualified:false,
    firstUnverifiedGate:!registered?'CONFIG_NOT_FROZEN':
      !bothSeats?'BOTH_SEATS_NOT_PROVEN':
      !localPayment?'LOCAL_MANDATORY_ATTACHMENT_NOT_PROVEN':
      !sourcePayoff?'SOURCE_ATTACK_NOT_SETTLED':
      !nextOpponent?'OPPONENT_ROOT_MISSING':
      'BROAD_PAPER_RULES_AND_OPPONENT_COMPETENCE_UNVERIFIED'
  };
}
module.exports={sourceCanaryDisposition};
