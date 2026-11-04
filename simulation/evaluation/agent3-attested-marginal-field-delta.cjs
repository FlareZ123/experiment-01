'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {marginalCoupledFieldDelta}=
  require('./agent3-marginal-coupled-field-delta.cjs');

const VERSION='agent3-attested-balanced-unconditional-field-v2';
const SHA256=/^[a-f0-9]{64}$/;
const GIT_SHA=/^[a-f0-9]{40}$/;

/**
 * Fail-closed study-cell identity admission for the separate unconditional
 * randomized-source marginal field estimand. It does not certify game
 * outcomes or statistical independence: all verified flags and record
 * identities require *independent* custodial attestation.
 *
 * @typedef {'QUALIFIED_WIN'|'QUALIFIED_NONWIN'|'CENSORED'} Status
 * @typedef {object} StudyPair
 * @property {string} pairId
 * @property {string} roundId
 * @property {string} seedBlockSha256 Unique independently registered block ID.
 * @property {string} source60Sha256 Printed original name/count 60 digest.
 * @property {string} reference60Sha256 Frozen reference candidate digest.
 * @property {string} challenger60Sha256 Frozen challenger candidate digest.
 * @property {string} policySha256 Same selected policy for both full games.
 * @property {string} engineRevision Pinned actual vendor source revision.
 * @property {string|null} referenceSourceFingerprint Actual deal, null only if censored pre-deal.
 * @property {string|null} challengerSourceFingerprint Actual deal, null only if censored pre-deal.
 * @property {0|1} referenceCandidateSeat Actual contender physical seat.
 * @property {0|1} challengerCandidateSeat Actual contender physical seat.
 * @property {0|1|null} referenceFirstTurnSeat Null only if censored pre-choice.
 * @property {0|1|null} challengerFirstTurnSeat Null only if censored pre-choice.
 * @property {Status} referenceStatus
 * @property {Status} challengerStatus
 *
 * @param {{
 *  candidateOrdinal:number,alpha?:number,targetDelta?:number,
 *  reference60Sha256:string,challenger60Sha256:string,
 *  policySha256:string,sourceArtCrosswalkSha256:string,
 *  registrationSha256:string,engineRevision:string,
 *  randomizationProtocol:string,
 *  originalSources:Array<{rank:number,source60Sha256:string}>,
 *  cells:Array<{rank:number,candidateSeat:0|1,
 *    firstTurnSeat:0|1|null,samples:StudyPair[]}>,
 *  independentAcrossCells:true,marginalSourceSamplingValidated:true,
 *  prospectivelyRegisteredRounds:true
 * }} design
 * @returns {object} Mathematical field interval, not qualified competition.
 */
function attestedMarginalFieldDelta(design){
  if(!design || typeof design!=='object' ||
      !Array.isArray(design.originalSources) ||
      design.originalSources.length!==32 ||
      !Array.isArray(design.cells) ||
      ![32,64,128].includes(design.cells.length) ||
      ![design.reference60Sha256,design.challenger60Sha256,
        design.policySha256,design.sourceArtCrosswalkSha256,
        design.registrationSha256].every(x=>SHA256.test(x)) ||
      !GIT_SHA.test(design.engineRevision) ||
      typeof design.randomizationProtocol!=='string' ||
      !design.randomizationProtocol.trim()) {
    throw new TypeError('Missing complete printed source field, frozen policy or registration');
  }
  const sourceMap=new Map();
  for(const original of design.originalSources) {
    if(!Number.isInteger(original?.rank)||original.rank<1||
       original.rank>32||!SHA256.test(original.source60Sha256)||
       sourceMap.has(original.rank)) {
      throw new TypeError('Every rank 1..32 needs exactly one named 60-card source digest');
    }
    sourceMap.set(original.rank,original.source60Sha256);
  }
  assert.equal(sourceMap.size,32);

  const cells=design.cells;
  const seats=new Set(),firstSeats=new Set(),seenCells=new Set();
  const registeredSeedBlocks=new Set();
  const transformed=[];
  let commonRoundCount=null;
  let actualFirstTurnMismatchedPairs=0;
  let actualFirstTurnUnknownPairs=0;
  for(const cell of cells) {
    const {rank,candidateSeat,firstTurnSeat,samples}=cell??{};
    if(!sourceMap.has(rank)||![0,1].includes(candidateSeat) ||
       !(firstTurnSeat===null||[0,1].includes(firstTurnSeat)) ||
       !Array.isArray(samples)||samples.length===0 ||
       (commonRoundCount!==null&&samples.length!==commonRoundCount)) {
      throw new TypeError('Invalid or unbalanced source rank, physical seat or first-turn cell');
    }
    commonRoundCount=samples.length;
    const key=[rank,candidateSeat,firstTurnSeat].join(':');
    if(seenCells.has(key))throw new TypeError('Repeated source rank/seat/turn cell');
    seenCells.add(key);seats.add(candidateSeat);firstSeats.add(firstTurnSeat);
    const pairs=[];
    for(const sample of samples) {
      const referenceFingerprintValid=SHA256.test(sample?.referenceSourceFingerprint)||
        (sample?.referenceSourceFingerprint===null&&sample.referenceStatus==='CENSORED');
      const challengerFingerprintValid=SHA256.test(sample?.challengerSourceFingerprint)||
        (sample?.challengerSourceFingerprint===null&&sample.challengerStatus==='CENSORED');
      const referenceFirstTurnValid=[0,1].includes(sample?.referenceFirstTurnSeat)||
        (sample?.referenceFirstTurnSeat===null&&sample.referenceStatus==='CENSORED');
      const challengerFirstTurnValid=[0,1].includes(sample?.challengerFirstTurnSeat)||
        (sample?.challengerFirstTurnSeat===null&&sample.challengerStatus==='CENSORED');
      if(!sample||!SHA256.test(sample.seedBlockSha256)||
         registeredSeedBlocks.has(sample.seedBlockSha256)||
         sample.source60Sha256!==sourceMap.get(rank)||
         sample.reference60Sha256!==design.reference60Sha256||
         sample.challenger60Sha256!==design.challenger60Sha256||
         sample.policySha256!==design.policySha256||
         sample.engineRevision!==design.engineRevision||
         !referenceFingerprintValid||!challengerFingerprintValid||
         sample.referenceCandidateSeat!==candidateSeat||
         sample.challengerCandidateSeat!==candidateSeat||
         !referenceFirstTurnValid||!challengerFirstTurnValid||
         (firstTurnSeat!==null&&
           ((sample.referenceFirstTurnSeat!==null&&firstTurnSeat!==sample.referenceFirstTurnSeat)||
            (sample.challengerFirstTurnSeat!==null&&firstTurnSeat!==sample.challengerFirstTurnSeat)))) {
        throw new TypeError('Unattributed, repeated or contradicted physical-source pair');
      }
      registeredSeedBlocks.add(sample.seedBlockSha256);
      if(sample.referenceFirstTurnSeat===null||sample.challengerFirstTurnSeat===null)
        actualFirstTurnUnknownPairs++;
      else if(sample.referenceFirstTurnSeat!==sample.challengerFirstTurnSeat)
        actualFirstTurnMismatchedPairs++;
      pairs.push({
        pairId:sample.pairId,roundId:sample.roundId,
        referenceFingerprint:sample.referenceSourceFingerprint,
        challengerFingerprint:sample.challengerSourceFingerprint,
        referenceStatus:sample.referenceStatus,
        challengerStatus:sample.challengerStatus
      });
    }
    transformed.push(pairs);
  }
  const seatCoverage=seats.size===2?'BOTH_PHYSICAL_SEATS':'ONE_PHYSICAL_SEAT_ONLY';
  const startControl=firstSeats.size===1&&firstSeats.has(null)?
    'NATURAL_FIRST_TURN':firstSeats.size===2&&
    firstSeats.has(0)&&firstSeats.has(1)?
      'BALANCED_FIRST_TURN':'INVALID_FIRST_TURN_COVERAGE';
  const expectedCells=32*seats.size*
    (startControl==='BALANCED_FIRST_TURN'?2:1);
  if(startControl==='INVALID_FIRST_TURN_COVERAGE'||
     expectedCells!==cells.length ||
     (startControl==='BALANCED_FIRST_TURN'&&seats.size!==2) ||
     ![1,2].includes(seats.size)||
     commonRoundCount===null) {
    throw new TypeError('Missing source rank / physical seat / first-turn cross product');
  }
  // Requiring all 32 ranks for every registered seat/start factor is what
  // prevents a superficially 32-row easy-opponent dataset from passing.
  for(let rank=1;rank<=32;rank++)for(const seat of seats)
    for(const first of startControl==='BALANCED_FIRST_TURN'?[0,1]:[null]){
      if(!seenCells.has([rank,seat,first].join(':')))
        throw new TypeError('Absent complete source/seat/first-turn field cell');
    }
  const mathematical=marginalCoupledFieldDelta({
    candidateOrdinal:design.candidateOrdinal,alpha:design.alpha,
    targetDelta:design.targetDelta,cells:transformed,
    independentAcrossCells:design.independentAcrossCells,
    marginalSourceSamplingValidated:design.marginalSourceSamplingValidated,
    prospectivelyRegisteredRounds:design.prospectivelyRegisteredRounds
  });
  const immutableStudyDesign={
    originalSources:design.originalSources.slice().sort((a,b)=>a.rank-b.rank),
    reference60Sha256:design.reference60Sha256,
    challenger60Sha256:design.challenger60Sha256,
    policySha256:design.policySha256,
    sourceArtCrosswalkSha256:design.sourceArtCrosswalkSha256,
    registrationSha256:design.registrationSha256,
    engineRevision:design.engineRevision,
    randomizationProtocol:design.randomizationProtocol,
    registeredCells:[...seenCells].sort(),
    registeredRoundCount:commonRoundCount
  };
  const designSha256=createHash('sha256')
    .update(JSON.stringify(immutableStudyDesign)).digest('hex');
  return {
    ...mathematical,version:VERSION,
    method:'COMPLETE_ORIGINAL_SOURCE_FIELD_MARGINAL_MEAN',
    fieldOriginalRanks:32,sourceRosterComplete:true,
    seatCoverage,startControl,designSha256,
    actualFirstTurnMismatchedPairs,actualFirstTurnUnknownPairs,
    registrationSha256:design.registrationSha256,
    sourceArtCrosswalkSha256:design.sourceArtCrosswalkSha256,
    reference60Sha256:design.reference60Sha256,
    challenger60Sha256:design.challenger60Sha256,
    policySha256:design.policySha256,
    engineRevision:design.engineRevision,
    randomizationProtocol:design.randomizationProtocol,
    mathematicalDecision:mathematical.decision,
    decision:seatCoverage==='BOTH_PHYSICAL_SEATS'?mathematical.decision:
      'INSUFFICIENT_SEAT_COVERAGE',
    competitiveQualified:false,
    qualification:'Requires separately verified registered source 60 identities, actual printed art versus aliases, genuinely independently generated random blocks, correct marginal natural setups, full paper-valid Store actions, selected information-set-safe symmetric policy, and official match-clock terminals. This structural gate cannot authenticate supplied hashes, flags, or statuses.'
  };
}
module.exports={VERSION,attestedMarginalFieldDelta};
