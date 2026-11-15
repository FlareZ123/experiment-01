'use strict';

const {
  assessFieldEvidence,
  CELLS_PER_ROUND,
  ZERO_LOSS_WEIGHT,
  LAMBDAS
}=require('./aichi-anytime-field-evidence.cjs');
const {sha256}=require('../simulation/evaluation/2026-11/agent36-4410-policy-provenance.cjs');
const {assessPairedSeatRejection,toAgent37SourceSeatOrientationCoin}=require('../simulation/evaluation/agent37-aichi-995-paired-seat-rejection.cjs');

/** @param {number[]} terms Natural logarithms of nonnegative e-process components. */
function logSumExp(terms) {
  const max=Math.max(...terms);
  if(max===-Infinity) return max;
  return max+Math.log(terms.reduce((sum,term)=>sum+Math.exp(term-max),0));
}

/**
 * Correlation-robust, anytime-valid field-mean evidence over COMPLETE 64-cell
 * rounds. Requires E[roundWins/64 | all previous rounds] <= nullMean under H0.
 * No independence is required among the 64 observations within a round.
 *
 * All provenance, actual-start, outcome, frozen-policy, duplicate ID and seed
 * guards are inherited from the established full-field validator.
 * @param {Array<Array<object>>} rounds
 * @param {{nullMean?:number,alpha?:number}} [options]
 */
function assessCorrelatedFieldEvidence(rounds,options={}) {
  const validated=assessFieldEvidence(rounds,options);
  const {nullMean:q,alpha}=validated;
  const boundary=-Math.log(alpha);
  const finiteWeight=Math.log((1-ZERO_LOSS_WEIGHT)/LAMBDAS.length);
  let wins=0,firstCrossedAtRound=null,logEValue=0;

  for(let i=0;i<rounds.length;i++) {
    wins+=rounds[i].filter(game=>game.outcome==='win').length;
    const completed=i+1;
    const perfect=wins===completed*CELLS_PER_ROUND;
    // Perfect correlation within a round can make all 64 cells win together;
    // its null probability is bounded by q per round, never by q^64.
    const terms=[perfect ?
      Math.log(ZERO_LOSS_WEIGHT)-completed*Math.log(q) : -Infinity];
    for(const lambda of LAMBDAS) {
      // Convexity: exp(lambda*y) <= 1+y*(exp(lambda)-1) for 0<=y<=1.
      const logNormalizer=lambda+Math.log(q+(1-q)*Math.exp(-lambda));
      terms.push(finiteWeight+lambda*wins/CELLS_PER_ROUND-
        completed*logNormalizer);
    }
    logEValue=logSumExp(terms);
    if(firstCrossedAtRound===null&&logEValue>=boundary)
      firstCrossedAtRound=completed;
  }
  return {
    ...validated,
    model:'conditional-round-mean-arbitrary-within-round-dependence-v1',
    logEValue,
    eValue:Math.exp(logEValue),
    currentCrosses:logEValue>=boundary,
    everCrossed:firstCrossedAtRound!==null,
    firstCrossedAtRound
  };
}

module.exports={assessCorrelatedFieldEvidence};


const CAMPAIGN_SCHEMA='aichi-correlated-round-campaign-v1';
const CAMPAIGN_RESULT_SCHEMA='aichi-correlated-round-campaign-assessment-v1';
const ORIENTATION_ASSIGNMENT='SHARED_FAIR_COIN_PER_COMPLETE_ROUND';
const RANDOMIZATION_PROTOCOL='TRUSTED_HOST_FAIR_CSPRNG_BIT_AFTER_ROUND_PRECOMMITMENT';
const PHYSICAL_DEAL_PROTOCOL='INDEPENDENT_FRESH_PHYSICAL_DEAL_PER_GAME';
const POLICY_RESET_PROTOCOL='FRESH_PROCESS_PER_GAME';
const ABORT_POLICY='FAIL_CLOSED';
const SHA256=/^[a-f0-9]{64}$/i;
const GIT_SHA=/^[a-f0-9]{40}$/i;
const HOST_SIGNATURE_ALGORITHM='Ed25519';

function isRecord(value) {
  return !!value && typeof value==='object' && !Array.isArray(value) &&
    Object.getPrototypeOf(value)===Object.prototype;
}

function requireTimestamp(value,label) {
  if(typeof value!=='string'||!/(?:Z|[+-][0-9]{2}:[0-9]{2})$/.test(value))
    throw new Error(label+' must be an offset-aware timestamp.');
  const time=Date.parse(value);
  if(!Number.isFinite(time)) throw new Error(label+' is not a valid timestamp.');
  return time;
}

function requireHostSignature(receipt,label,hostKeyId) {
  if(!isRecord(receipt)||receipt.hostKeyId!==hostKeyId||
      receipt.signatureAlgorithm!==HOST_SIGNATURE_ALGORITHM||
      typeof receipt.signature!=='string'||receipt.signature.length<16||
      !SHA256.test(receipt.signedPayloadSha256||'')) {
    throw new Error(label+' host signature receipt is structurally invalid.');
  }
}

function withoutField(value,field) {
  const copy={...value};
  delete copy[field];
  return copy;
}

function validateCampaignRegistration(request) {
  if(!isRecord(request)||!isRecord(request.registration)||
      !Array.isArray(request.records)||!isRecord(request.registrationReceipt)||
      !isRecord(request.ledgerReceipt)) {
    throw new TypeError('Campaign registration, records, registration receipt and ledger receipt are required.');
  }
  const registration=request.registration;
  const registrationSha256=request.registrationSha256;
  if(registration.schema!==CAMPAIGN_SCHEMA||
      typeof registration.campaignId!=='string'||!registration.campaignId||
      !SHA256.test(registrationSha256||'')||
      sha256(registration)!==registrationSha256) {
    throw new Error('Campaign registration schema or digest is invalid.');
  }
  if(registration.samplingModel!=='correlation-robust-128-stratum-shared-round-coin-v1'||
      registration.orientationAssignment!==ORIENTATION_ASSIGNMENT||
      registration.randomizationProtocol!==RANDOMIZATION_PROTOCOL||
      registration.physicalDealProtocol!==PHYSICAL_DEAL_PROTOCOL||
      registration.policyResetProtocol!==POLICY_RESET_PROTOCOL||
      registration.abortPolicy!==ABORT_POLICY) {
    throw new Error('Campaign sampling, orientation, deal, reset or abort contract is invalid.');
  }
  if(registration.target!==0.995||registration.nullMean!==0.995||
      registration.alpha!==0.05) {
    throw new Error('Campaign inference contract must be fixed at nullMean 0.995 and alpha 0.05.');
  }
  if(registration.candidateSlotMapping!=='A=0,B=1'||
      registration.sourceSeatMapping!=='sourceSeat=1-candidateSlot'||
      registration.sourceSeatAtCandidateSlotA!==1) {
    throw new Error('Campaign physical-seat coordinate mapping is invalid.');
  }
  const expectedDiagonals=[
    {orientationCoin:0,candidateAActualStart:'first',candidateBActualStart:'second'},
    {orientationCoin:1,candidateAActualStart:'second',candidateBActualStart:'first'}
  ];
  if(!Array.isArray(registration.allowedDiagonals)||
      sha256(registration.allowedDiagonals)!==sha256(expectedDiagonals)) {
    throw new Error('Campaign allowed shared-round diagonals are invalid.');
  }
  const registeredAt=requireTimestamp(registration.registeredAt,'Campaign registeredAt');
  if(!SHA256.test(registration.candidateDeckSha256||'')||
      !SHA256.test(registration.candidatePolicyRevision||'')||
      !GIT_SHA.test(registration.engineRevision||'')||
      !SHA256.test(registration.rulesetRevision||'')||
      !GIT_SHA.test(registration.runnerRevision||'')) {
    throw new Error('Campaign fixed candidate, policy, engine, ruleset or runner identity is invalid.');
  }
  if(!Array.isArray(registration.opponents)||registration.opponents.length!==32) {
    throw new Error('Campaign must pre-register all 32 opponent identities.');
  }
  const opponentByRank=new Map();
  for(let i=0;i<registration.opponents.length;i++) {
    const opponent=registration.opponents[i];
    if(!isRecord(opponent)||opponent.rank!==i+1||
        !SHA256.test(opponent.deckSha256||'')||
        !SHA256.test(opponent.policyRevision||'')) {
      throw new Error('Campaign opponent roster must contain ordered, frozen identities for all 32 ranks.');
    }
    opponentByRank.set(opponent.rank,opponent);
  }
  const hostKeyId=request.registrationReceipt.hostKeyId;
  if(typeof hostKeyId!=='string'||!hostKeyId) {
    throw new Error('Campaign registration host key identity is missing.');
  }
  requireHostSignature(request.registrationReceipt,'Campaign registration',hostKeyId);
  if(request.registrationReceipt.registrationSha256!==registrationSha256) {
    throw new Error('Campaign registration receipt digest mismatch.');
  }
  const signedAt=requireTimestamp(request.registrationReceipt.signedAt,'Campaign registration signedAt');
  if(signedAt<registeredAt) throw new Error('Campaign registration receipt predates its registration timestamp.');
  const expectedRegistrationSignatureDigest=sha256({
    registrationSha256,
    signedAt:request.registrationReceipt.signedAt,
    hostKeyId,
    signatureAlgorithm:request.registrationReceipt.signatureAlgorithm
  });
  if(request.registrationReceipt.signedPayloadSha256!==expectedRegistrationSignatureDigest) {
    throw new Error('Campaign registration signed-payload digest mismatch.');
  }
  return {registration,registrationSha256,opponentByRank,hostKeyId,signedAt};
}

function validateChainedRecord(record,expectedSequence,previousRecordSha256) {
  if(!isRecord(record)||record.sequence!==expectedSequence||
      record.previousRecordSha256!==previousRecordSha256||
      !SHA256.test(record.recordSha256||'')) {
    throw new Error('Campaign append-only record sequence or previous-hash link is invalid.');
  }
  if(sha256(withoutField(record,'recordSha256'))!==record.recordSha256) {
    throw new Error('Campaign append-only record digest is invalid.');
  }
  return record.recordSha256;
}

function validateRoster(gameRoster) {
  if(!Array.isArray(gameRoster)||gameRoster.length!==64) {
    throw new Error('Each registered round must precommit exactly 64 game assignments.');
  }
  const byTrial=new Map();
  const physicalDeals=new Set();
  const dealCommitments=new Set();
  const counts=Array.from({length:32},()=>({A:0,B:0}));
  for(const row of gameRoster) {
    if(!isRecord(row)||typeof row.trialId!=='string'||!row.trialId||
        !Number.isInteger(row.rank)||row.rank<1||row.rank>32||
        !['A','B'].includes(row.candidateEngineSlot)||
        typeof row.physicalDealId!=='string'||!row.physicalDealId||
        !SHA256.test(row.physicalDealCommitmentSha256||'')||
        byTrial.has(row.trialId)||physicalDeals.has(row.physicalDealId)||
        dealCommitments.has(row.physicalDealCommitmentSha256)) {
      throw new Error('Registered game roster contains an invalid or duplicate trial/deal assignment.');
    }
    byTrial.set(row.trialId,row);
    physicalDeals.add(row.physicalDealId);
    dealCommitments.add(row.physicalDealCommitmentSha256);
    counts[row.rank-1][row.candidateEngineSlot]++;
  }
  if(counts.some(row=>row.A!==1||row.B!==1)) {
    throw new Error('Registered round must contain exactly one candidate A and B game for every rank.');
  }
  return byTrial;
}

function assessCorrelatedFieldCampaign(request,options={}) {
  const {registration,registrationSha256,opponentByRank,hostKeyId,signedAt}=
    validateCampaignRegistration(request);
  if(options.nullMean!==undefined&&options.nullMean!==registration.nullMean) {
    throw new Error('Evaluator nullMean differs from the immutable campaign registration.');
  }
  if(options.alpha!==undefined&&options.alpha!==registration.alpha) {
    throw new Error('Evaluator alpha differs from the immutable campaign registration.');
  }
  const records=request.records;
  let previousRecordSha256=registrationSha256;
  let expectedSequence=1;
  let nextOrdinal=1;
  let latestTimestamp=signedAt;
  const rounds=[];
  const gameIds=new Set(),seeds=new Set(),trialIds=new Set();
  const physicalDeals=new Set(),dealCommitments=new Set(),policyProcessIds=new Set();
  let abortedRound=null;
  const roundIds=new Set();

  for(let index=0;index<records.length;) {
    if(abortedRound) throw new Error('Campaign ledger contains records after an aborted round.');
    const roundStart=records[index++];
    previousRecordSha256=validateChainedRecord(roundStart,expectedSequence++,previousRecordSha256);
    if(roundStart.recordType!=='round-start'||roundStart.ordinal!==nextOrdinal||
        typeof roundStart.roundId!=='string'||!roundStart.roundId||
        roundIds.has(roundStart.roundId)||
        roundStart.registrationSha256!==registrationSha256) {
      throw new Error('Campaign round-start is missing, out of order or not bound to its registration.');
    }
    roundIds.add(roundStart.roundId);
    const roundStartTime=requireTimestamp(roundStart.registeredAt,'Round registeredAt');
    if(roundStartTime<latestTimestamp||roundStartTime<signedAt||
        roundStartTime<requireTimestamp(registration.registeredAt,'Campaign registeredAt')) {
      throw new Error('Round was registered before the immutable campaign registration.');
    }
    for(const [field,expected] of [
      ['candidateDeckSha256',registration.candidateDeckSha256],
      ['candidatePolicyRevision',registration.candidatePolicyRevision],
      ['engineRevision',registration.engineRevision],
      ['rulesetRevision',registration.rulesetRevision],
      ['runnerRevision',registration.runnerRevision]
    ]) {
      if(roundStart[field]!==expected) throw new Error('Round-start fixed identity drift: '+field);
    }
    const rosterByTrial=validateRoster(roundStart.gameRoster);
    latestTimestamp=Math.max(latestTimestamp,roundStartTime);

    if(index>=records.length) throw new Error('Registered round has no orientation receipt or terminal record.');
    const orientation=records[index++];
    previousRecordSha256=validateChainedRecord(orientation,expectedSequence++,previousRecordSha256);
    if(orientation.recordType!=='orientation-coin'||
        orientation.roundId!==roundStart.roundId||orientation.ordinal!==roundStart.ordinal||
        orientation.roundStartRecordSha256!==roundStart.recordSha256||
        (orientation.orientationCoin!==0&&orientation.orientationCoin!==1)||
        typeof orientation.entropyCommitmentSha256!=='string'||
        !SHA256.test(orientation.entropyCommitmentSha256)) {
      throw new Error('Round orientation receipt is invalid or detached from its precommitted roster.');
    }
    requireHostSignature(orientation,'Round orientation',hostKeyId);
    const orientationTime=requireTimestamp(orientation.drawnAt,'Orientation drawnAt');
    if(orientationTime<roundStartTime) throw new Error('Orientation coin was drawn before round precommitment.');
    const expectedOrientationDigest=sha256({
      campaignId:registration.campaignId,
      roundId:orientation.roundId,
      ordinal:orientation.ordinal,
      roundStartRecordSha256:orientation.roundStartRecordSha256,
      orientationCoin:orientation.orientationCoin,
      drawnAt:orientation.drawnAt,
      entropyCommitmentSha256:orientation.entropyCommitmentSha256,
      hostKeyId:orientation.hostKeyId,
      signatureAlgorithm:orientation.signatureAlgorithm
    });
    if(orientation.signedPayloadSha256!==expectedOrientationDigest) {
      throw new Error('Orientation signed-payload digest does not bind the shared coin receipt.');
    }
    latestTimestamp=Math.max(latestTimestamp,orientationTime);

    const gameRecords=[];
    while(index<records.length&&records[index]?.recordType==='game') {
      const record=records[index++];
      previousRecordSha256=validateChainedRecord(record,expectedSequence++,previousRecordSha256);
      if(record.roundId!==roundStart.roundId||record.ordinal!==roundStart.ordinal||
          record.orientationRecordSha256!==orientation.recordSha256) {
        throw new Error('Game attempt is not bound to its round and orientation receipt.');
      }
      const planned=rosterByTrial.get(record.trialId);
      if(!planned||planned.rank!==record.rank||
          planned.candidateEngineSlot!==record.candidateEngineSlot||
          planned.physicalDealId!==record.physicalDealId||
          planned.physicalDealCommitmentSha256!==record.physicalDealCommitmentSha256||
          trialIds.has(record.trialId)) {
        throw new Error('Game attempt is missing from or differs from the immutable round roster.');
      }
      const game=record.game;
      // Actual-start belongs to the receipt envelope; the engine game uses startingSeat.
      if(!isRecord(game)||game.rank!==record.rank||
          game.candidateEngineSlot!==record.candidateEngineSlot) {
        throw new Error('Game payload does not match its registered rank and candidate slot.');
      }
      const candidateSlot=record.candidateEngineSlot==='A'?0:1;
      const expectedSourceSeat=1-candidateSlot;
      const expectedStart=orientation.orientationCoin===0?
        (candidateSlot===0?'first':'second'):(candidateSlot===0?'second':'first');
      if(record.sourceSeat!==expectedSourceSeat||
          record.candidateActualStart!==expectedStart||
          game.startingSeat!==expectedStart||
          game.candidateDeckSha256!==registration.candidateDeckSha256||
          game.candidatePolicyRevision!==registration.candidatePolicyRevision||
          game.opponentDeckSha256!==opponentByRank.get(record.rank)?.deckSha256||
          game.opponentPolicyRevision!==opponentByRank.get(record.rank)?.policyRevision||
          game.engineRevision!==registration.engineRevision||
          game.rulesetRevision!==registration.rulesetRevision) {
        throw new Error('Game identity, source-seat mapping or shared coin diagonal is inconsistent.');
      }
      if(Object.hasOwn(game,'orientationCoin')||Object.hasOwn(game,'orientationSeed')||
          Object.hasOwn(game,'hostSeed')||Object.hasOwn(game,'hostEntropy')) {
        throw new Error('Host orientation entropy must not be included in a policy/game payload.');
      }
      const startedAt=requireTimestamp(record.startedAt,'Game startedAt');
      const completedAt=requireTimestamp(record.completedAt,'Game completedAt');
      if(startedAt<orientationTime||completedAt<startedAt) {
        throw new Error('Game started before the host orientation draw or has invalid chronology.');
      }
      if(typeof record.candidatePolicyProcessId!=='string'||!record.candidatePolicyProcessId||
          typeof record.opponentPolicyProcessId!=='string'||!record.opponentPolicyProcessId||
          record.candidatePolicyProcessId===record.opponentPolicyProcessId||
          policyProcessIds.has(record.candidatePolicyProcessId)||
          policyProcessIds.has(record.opponentPolicyProcessId)) {
        throw new Error('Each game must use fresh, distinct candidate and opponent policy processes.');
      }
      policyProcessIds.add(record.candidatePolicyProcessId);
      policyProcessIds.add(record.opponentPolicyProcessId);
      if(typeof game.gameId!=='string'||!game.gameId||gameIds.has(game.gameId)||
          !Number.isInteger(game.seed)||seeds.has(game.seed)||
          physicalDeals.has(record.physicalDealId)||
          dealCommitments.has(record.physicalDealCommitmentSha256)) {
        throw new Error('Campaign game IDs, shuffle seeds and physical-deal commitments must be unique.');
      }
      gameIds.add(game.gameId);
      seeds.add(game.seed);
      physicalDeals.add(record.physicalDealId);
      dealCommitments.add(record.physicalDealCommitmentSha256);
      trialIds.add(record.trialId);
      gameRecords.push(record);
      latestTimestamp=Math.max(latestTimestamp,completedAt);
    }
    if(index>=records.length) throw new Error('Registered round is incomplete and has no complete or abort terminal record.');
    const terminal=records[index++];
    previousRecordSha256=validateChainedRecord(terminal,expectedSequence++,previousRecordSha256);
    if(terminal.roundId!==roundStart.roundId||terminal.ordinal!==roundStart.ordinal||
        terminal.roundStartRecordSha256!==roundStart.recordSha256||
        terminal.orientationRecordSha256!==orientation.recordSha256||
        !Array.isArray(terminal.gameRecordSha256s)||
        sha256(terminal.gameRecordSha256s)!==sha256(gameRecords.map(row=>row.recordSha256))||
        terminal.gameCount!==gameRecords.length) {
      throw new Error('Round terminal does not reconcile every recorded game attempt.');
    }
    if(terminal.recordType==='round-abort') {
      const abortedAt=requireTimestamp(terminal.abortedAt,'Round abortedAt');
      if(typeof terminal.reasonCode!=='string'||!terminal.reasonCode||
          abortedAt<latestTimestamp) throw new Error('Round abort receipt is invalid.');
      latestTimestamp=Math.max(latestTimestamp,abortedAt);
      abortedRound=roundStart.ordinal;
    } else if(terminal.recordType==='round-complete') {
      if(gameRecords.length!==64||terminal.gameCount!==64) {
        throw new Error('A complete round requires exactly 64 games; partial rounds cannot enter the e-process.');
      }
      const completedAt=requireTimestamp(terminal.completedAt,'Round completedAt');
      if(completedAt<latestTimestamp) throw new Error('Round completion predates a game outcome.');
      latestTimestamp=Math.max(latestTimestamp,completedAt);
      rounds.push({
        ordinal:roundStart.ordinal,
        roundId:roundStart.roundId,
        orientationCoin:orientation.orientationCoin,
        gameRecords,
        games:gameRecords.map(row=>row.game)
      });
    } else {
      throw new Error('Every registered round must end in exactly one complete or abort record.');
    }
    nextOrdinal++;
  }

  const ledgerReceipt=request.ledgerReceipt;
  requireHostSignature(ledgerReceipt,'Campaign ledger',hostKeyId);
  if(ledgerReceipt.campaignId!==registration.campaignId||
      ledgerReceipt.registrationSha256!==registrationSha256||
      ledgerReceipt.recordCount!==records.length||
      ledgerReceipt.lastRecordSha256!==previousRecordSha256) {
    throw new Error('Campaign ledger receipt does not bind the complete append-only record stream.');
  }
  const issuedAt=requireTimestamp(ledgerReceipt.issuedAt,'Campaign ledger issuedAt');
  if(issuedAt<latestTimestamp) throw new Error('Campaign ledger receipt predates its final record.');
  const expectedLedgerSignatureDigest=sha256({
    campaignId:ledgerReceipt.campaignId,
    registrationSha256:ledgerReceipt.registrationSha256,
    recordCount:ledgerReceipt.recordCount,
    lastRecordSha256:ledgerReceipt.lastRecordSha256,
    issuedAt:ledgerReceipt.issuedAt,
    hostKeyId:ledgerReceipt.hostKeyId,
    signatureAlgorithm:ledgerReceipt.signatureAlgorithm
  });
  if(ledgerReceipt.signedPayloadSha256!==expectedLedgerSignatureDigest) {
    throw new Error('Campaign ledger signed-payload digest mismatch.');
  }
  if(abortedRound!==null) {
    throw new Error('Campaign contains aborted round '+abortedRound+'; FAIL_CLOSED forbids certification or restarting.');
  }

  const aggregate=assessCorrelatedFieldEvidence(rounds.map(round=>round.games),{
    nullMean:registration.nullMean,alpha:registration.alpha
  });
  // The shared coin is correlated across ranks but fresh across rounds. Run the
  // existing paired analyzer separately for each rank's across-round sequence,
  // and expose all 32 veto results only after the complete-round ledger passes.
  const perRankVetoes=[];
  for(let rank=1;rank<=32;rank++) {
    const blocks=rounds.map(round=>{
      const pair=round.gameRecords.filter(row=>row.rank===rank);
      if(pair.length!==2) throw new Error('Complete round lost a rank pair after validation.');
      return {
        pairId:round.roundId+':rank:'+rank,
        candidateId:registration.candidateDeckSha256,
        originalRank:rank,
        pairingDesign:'SOURCE_SEAT_AND_ACTUAL_START_BALANCED',
        // Within this one-rank sequence, the shared round coin is fresh and
        // independent across rounds. Cross-rank coin independence is not assumed.
        orientationAssignment:'INDEPENDENT_FAIR_COIN_PER_COMPLETE_PAIR',
        orientationCoin:toAgent37SourceSeatOrientationCoin(
          round.orientationCoin,registration.sourceSeatAtCandidateSlotA),
        games:pair.map(row=>({
          id:row.trialId,
          sourceSeat:row.sourceSeat,
          candidateActualStart:row.candidateActualStart,
          qualification:'QUALIFIED',
          outcome:row.game.outcome==='draw'?'tie':row.game.outcome
        }))
      };
    });
    const report=assessPairedSeatRejection(blocks,registration.candidateDeckSha256);
    const rankResult=report.ranks[rank-1];
    const crossingRound=report.firstCrossing?
      rounds[report.firstCrossing.pairOrdinal-1].ordinal:null;
    perRankVetoes.push({
      originalRank:rank,
      completedPairs:rankResult.completedPairs,
      wins:rankResult.wins,
      nonwins:rankResult.nonwins,
      logEValue:rankResult.logEValue,
      rejectionFlag:report.rejectionFlag,
      firstCrossingRound:crossingRound
    });
  }

  return {
    schema:CAMPAIGN_RESULT_SCHEMA,
    campaignId:registration.campaignId,
    registrationSha256,
    ledgerRecordCount:records.length,
    orientationAssignment:ORIENTATION_ASSIGNMENT,
    perRankUpdateBoundary:'COMPLETE_ROUND_ONLY',
    abortPolicy:ABORT_POLICY,
    aggregate,
    perRankVetoes,
    admissionStatus:'STRUCTURALLY_VALID_EXTERNAL_AUDIT_REQUIRED',
    competitiveAdmissionEligible:false,
    registrationSignatureVerifiedExternally:false,
    orientationCoinFairnessVerifiedExternally:false,
    ledgerSignatureVerifiedExternally:false,
    physicalDealIndependenceVerifiedExternally:false,
    policyResetVerifiedExternally:false,
    paperQualificationVerifiedExternally:false,
    fixedPoliciesVerifiedExternally:false,
    interpretation:'STRUCTURAL_VALIDATION_ONLY_NOT_COMPETITIVE_CERTIFICATION'
  };
}

module.exports={...module.exports,assessCorrelatedFieldCampaign};
