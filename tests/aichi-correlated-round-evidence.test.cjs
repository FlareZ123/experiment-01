'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {assessFieldEvidence}=require('../scripts/aichi-anytime-field-evidence.cjs');
const {assessCorrelatedFieldEvidence}=
  require('../scripts/aichi-correlated-round-evidence.cjs');

const Q=0.995;

/**
 * An explicitly synthetic, provenance-complete 64-cell round.
 * @param {number} iteration
 * @param {'win'|'loss'|'draw'} outcome
 * @returns {object[]}
 */
function syntheticRound(iteration,outcome='win') {
  return Array.from({length:64},(_,i)=>{
    const first=i<32;
    return {
      rank:i%32+1,
      startingSeat:first?'first':'second',
      outcome,
      finished:true,
      winnerIndex:outcome==='win'?0:outcome==='loss'?1:3,
      status:'qualified-completed-game',
      gameId:'synthetic-correlated:'+iteration+':'+i,
      seed:200000+iteration*64+i,
      candidateDeckSha256:'a'.repeat(64),
      opponentDeckSha256:(i%32+1).toString(16).padStart(64,'0'),
      candidatePolicyRevision:'frozen-synthetic-v1',
      opponentPolicyRevision:'frozen-opponent-synthetic-v1',
      engineRevision:'synthetic-engine-v1',
      rulesetRevision:'synthetic-rules-v1',
      candidateEngineSlot:'A',
      turnEvidence:{
        firstTurnSlot:first?0:1,
        firstTurnPlayerId:first?101:202,
        firstTurnPlayerName:first?'research-A':'research-B',
        firstDrawLogName:first?'research-A':'research-B',
        verifiedByDrawLog:true
      }
    };
  });
}

test('perfectly correlated 64-cell null does not earn 64 independent wins',()=>{
  const ten=Array.from({length:10},(_,i)=>syntheticRound(i));
  assert.equal(assessFieldEvidence(ten).currentCrosses,true,
    'historical independent-game model is unsafe for this correlation model');
  const safe=assessCorrelatedFieldEvidence(ten);
  assert.equal(safe.rounds,10);
  assert.equal(safe.wins,640);
  assert.equal(safe.currentCrosses,false);
  assert.equal(safe.everCrossed,false);
  assert.ok(safe.eValue<1.1);
  assert.match(safe.model,/arbitrary-within-round/);
});

test('one-round null e-expectation handles perfectly dependent wins',()=>{
  const allWin=syntheticRound(0);
  const allLoss=syntheticRound(0,'loss');
  const robustWin=assessCorrelatedFieldEvidence([allWin]).eValue;
  const robustLoss=assessCorrelatedFieldEvidence([allLoss]).eValue;
  assert.ok(Q*robustWin+(1-Q)*robustLoss<=1+1e-12);
  const oldWin=assessFieldEvidence([allWin]).eValue;
  const oldLoss=assessFieldEvidence([allLoss]).eValue;
  assert.ok(Q*oldWin+(1-Q)*oldLoss>1.1,
    'independent-game e-value fails under valid all-or-nothing correlation');
});

test('round-level sequential evidence eventually crosses after enough fresh perfect rounds',()=>{
  const all=Array.from({length:610},(_,i)=>syntheticRound(i));
  const prior=assessCorrelatedFieldEvidence(all.slice(0,598));
  const later=assessCorrelatedFieldEvidence(all);
  assert.equal(prior.currentCrosses,false);
  assert.equal(later.currentCrosses,true);
  assert.ok(later.firstCrossedAtRound>598);
  assert.ok(later.firstCrossedAtRound<=610);
  assert.equal(later.games,39040);
  assert.equal(later.nonWins,0);
});

test('mixed completed outcomes contribute fractions, with draws counted as nonwins',()=>{
  const first=syntheticRound(0);
  first[0].outcome='draw';
  first[0].winnerIndex=3;
  const second=syntheticRound(1,'loss');
  const value=assessCorrelatedFieldEvidence([first,second]);
  assert.equal(value.games,128);
  assert.equal(value.wins,63);
  assert.equal(value.nonWins,65);
  assert.ok(Number.isFinite(value.logEValue));
  assert.equal(value.currentCrosses,false);
  assert.equal(assessCorrelatedFieldEvidence([]).eValue,1);
});

test('inherits mandatory qualification, provenance and actual-start checks',()=>{
  const incomplete=syntheticRound(0).slice(1);
  assert.throws(()=>assessCorrelatedFieldEvidence([incomplete]),/64/);
  const repeated=syntheticRound(0);
  assert.throws(()=>assessCorrelatedFieldEvidence([repeated,repeated]),/Repeated game ID/);
  const unqualified=syntheticRound(0);
  unqualified[0].status='completed-engine-game';
  assert.throws(()=>assessCorrelatedFieldEvidence([unqualified]),/unqualified/);
  const wrongStart=syntheticRound(0);
  wrongStart[0].turnEvidence.firstDrawLogName='research-B';
  assert.throws(()=>assessCorrelatedFieldEvidence([wrongStart]),/starting seat/);
  const drift=syntheticRound(1);
  drift[0].candidatePolicyRevision='different-policy';
  assert.throws(()=>assessCorrelatedFieldEvidence([syntheticRound(0),drift]),/Candidate deck/);
});

test('parameters and null horizon are preserved by the original validator',()=>{
  assert.throws(()=>assessCorrelatedFieldEvidence([],{alpha:1}),/Invalid/);
  assert.throws(()=>assessCorrelatedFieldEvidence([],{nullMean:0}),/Invalid/);
  const override=assessCorrelatedFieldEvidence([syntheticRound(0)],{
    nullMean:0.98,alpha:0.01
  });
  assert.equal(override.nullMean,0.98);
  assert.equal(override.alpha,0.01);
  assert.equal(override.threshold,100);
});


function buildCampaign({roundCount=1,coins=[0],outcomeFor=()=> 'win',
  abortAtRound=null,abortAfterGames=0,omitGameAt=null,wrongStartAt=null,
  duplicateProcessAt=null}={}) {
  const opponents=Array.from({length:32},(_,i)=>({
    rank:i+1,
    deckSha256:(i+1).toString(16).padStart(64,'0'),
    policyRevision:sha256('opponent-policy-'+(i+1))
  }));
  const registration={
    schema:'aichi-correlated-round-campaign-v1',
    campaignId:'synthetic-correlated-campaign-v1',
    registeredAt:'2026-11-15T00:00:00.000Z',
    target:0.995,nullMean:0.995,alpha:0.05,
    samplingModel:'correlation-robust-128-stratum-shared-round-coin-v1',
    orientationAssignment:'SHARED_FAIR_COIN_PER_COMPLETE_ROUND',
    randomizationProtocol:'TRUSTED_HOST_FAIR_CSPRNG_BIT_AFTER_ROUND_PRECOMMITMENT',
    physicalDealProtocol:'INDEPENDENT_FRESH_PHYSICAL_DEAL_PER_GAME',
    policyResetProtocol:'FRESH_PROCESS_PER_GAME',
    abortPolicy:'FAIL_CLOSED',
    candidateDeckSha256:'a'.repeat(64),
    candidatePolicyRevision:sha256('candidate-policy-v1'),
    engineRevision:'1'.repeat(40),
    rulesetRevision:sha256('ruleset-v1'),
    runnerRevision:'2'.repeat(40),
    candidateSlotMapping:'A=0,B=1',
    sourceSeatMapping:'sourceSeat=1-candidateSlot',
    sourceSeatAtCandidateSlotA:1,
    allowedDiagonals:[
      {orientationCoin:0,candidateAActualStart:'first',candidateBActualStart:'second'},
      {orientationCoin:1,candidateAActualStart:'second',candidateBActualStart:'first'}
    ],
    opponents
  };
  const registrationSha256=sha256(registration);
  const hostKeyId='synthetic-host-key';
  const registrationReceipt={
    registrationSha256,signedAt:registration.registeredAt,hostKeyId,
    signatureAlgorithm:'Ed25519',signature:'synthetic-unverified-signature',
    signedPayloadSha256:sha256({
      registrationSha256,signedAt:registration.registeredAt,hostKeyId,
      signatureAlgorithm:'Ed25519'
    })
  };
  const records=[];
  let previousRecordSha256=registrationSha256;
  const push=payload=>{
    const record={...payload,sequence:records.length+1,previousRecordSha256};
    record.recordSha256=sha256(record);
    records.push(record);
    previousRecordSha256=record.recordSha256;
    return record;
  };
  let lastTime=Date.parse(registration.registeredAt);
  for(let ordinal=1;ordinal<=roundCount;ordinal++) {
    const roundId='round-'+ordinal;
    const base=Date.parse('2026-11-15T00:01:00.000Z')+(ordinal-1)*60000;
    const iso=offset=>new Date(base+offset).toISOString();
    const roster=[];
    for(let rank=1;rank<=32;rank++) {
      for(const slot of ['A','B']) {
        const trialId=roundId+':rank:'+rank+':slot:'+slot;
        const physicalDealId='deal-'+trialId;
        roster.push({
          trialId,rank,candidateEngineSlot:slot,physicalDealId,
          physicalDealCommitmentSha256:sha256('commitment-'+physicalDealId)
        });
      }
    }
    const roundStart=push({
      recordType:'round-start',roundId,ordinal,registeredAt:iso(0),
      registrationSha256,
      candidateDeckSha256:registration.candidateDeckSha256,
      candidatePolicyRevision:registration.candidatePolicyRevision,
      engineRevision:registration.engineRevision,
      rulesetRevision:registration.rulesetRevision,
      runnerRevision:registration.runnerRevision,
      gameRoster:roster
    });
    const orientationCoin=coins[ordinal-1]===undefined?0:coins[ordinal-1];
    const drawnAt=iso(10000);
    const orientationPayload={
      campaignId:registration.campaignId,roundId,ordinal,
      roundStartRecordSha256:roundStart.recordSha256,
      orientationCoin,drawnAt,
      entropyCommitmentSha256:sha256('entropy-'+roundId),
      hostKeyId,signatureAlgorithm:'Ed25519'
    };
    const orientation=push({
      recordType:'orientation-coin',...orientationPayload,
      signature:'synthetic-unverified-signature',
      signedPayloadSha256:sha256(orientationPayload)
    });
    const gameRecords=[];
    const gameLimit=abortAtRound===ordinal?abortAfterGames:64;
    for(let rank=1;rank<=32;rank++) {
      for(const slot of ['A','B']) {
        const trialId=roundId+':rank:'+rank+':slot:'+slot;
        if(omitGameAt&&omitGameAt.ordinal===ordinal&&
            omitGameAt.rank===rank&&omitGameAt.slot===slot) continue;
        if(gameRecords.length>=gameLimit) continue;
        const planned=roster.find(row=>row.trialId===trialId);
        const candidateSlot=slot==='A'?0:1;
        let startingSeat=orientationCoin===0?
          (slot==='A'?'first':'second'):(slot==='A'?'second':'first');
        if(wrongStartAt&&wrongStartAt.ordinal===ordinal&&
            wrongStartAt.rank===rank&&wrongStartAt.slot===slot) {
          startingSeat=startingSeat==='first'?'second':'first';
        }
        const firstTurnSlot=startingSeat==='first'?candidateSlot:1-candidateSlot;
        const outcome=outcomeFor(rank,slot,ordinal);
        const winnerIndex=outcome==='win'?candidateSlot:
          outcome==='loss'?1-candidateSlot:3;
        const game={
          rank,startingSeat,outcome,finished:true,winnerIndex,
          status:'qualified-completed-game',
          gameId:trialId,
          seed:100000+ordinal*1000+rank*2+(slot==='A'?0:1),
          candidateDeckSha256:registration.candidateDeckSha256,
          opponentDeckSha256:opponents[rank-1].deckSha256,
          candidatePolicyRevision:registration.candidatePolicyRevision,
          opponentPolicyRevision:opponents[rank-1].policyRevision,
          engineRevision:registration.engineRevision,
          rulesetRevision:registration.rulesetRevision,
          candidateEngineSlot:slot,
          turnEvidence:{
            firstTurnSlot,
            firstTurnPlayerId:firstTurnSlot===0?101:202,
            firstTurnPlayerName:firstTurnSlot===0?'research-A':'research-B',
            firstDrawLogName:firstTurnSlot===0?'research-A':'research-B',
            verifiedByDrawLog:true
          }
        };
        const startedAt=iso(20000),completedAt=iso(30000);
        const duplicate=duplicateProcessAt&&duplicateProcessAt.ordinal===ordinal&&
          duplicateProcessAt.rank===rank&&duplicateProcessAt.slot===slot;
        const candidatePolicyProcessId=duplicate?'candidate-process-round-1-rank-1-slot-A':
          'candidate-process-'+trialId;
        const record=push({
          recordType:'game',roundId,ordinal,
          orientationRecordSha256:orientation.recordSha256,
          trialId,rank,candidateEngineSlot:slot,sourceSeat:1-candidateSlot,
          candidateActualStart:startingSeat,
          physicalDealId:planned.physicalDealId,
          physicalDealCommitmentSha256:planned.physicalDealCommitmentSha256,
          startedAt,completedAt,candidatePolicyProcessId,
          opponentPolicyProcessId:'opponent-process-'+trialId,
          game
        });
        gameRecords.push(record);
      }
    }
    const isAbort=abortAtRound===ordinal;
    const terminalTime=isAbort?iso(40000):iso(40000);
    push({
      recordType:isAbort?'round-abort':'round-complete',
      roundId,ordinal,roundStartRecordSha256:roundStart.recordSha256,
      orientationRecordSha256:orientation.recordSha256,
      gameRecordSha256s:gameRecords.map(row=>row.recordSha256),
      gameCount:gameRecords.length,
      ...(isAbort?{abortedAt:terminalTime,reasonCode:'synthetic-abort'}:
        {completedAt:terminalTime})
    });
    lastTime=base+50000;
    if(isAbort) break;
  }
  const issuedAt=new Date(lastTime).toISOString();
  const ledgerPayload={
    campaignId:registration.campaignId,registrationSha256,
    recordCount:records.length,lastRecordSha256:previousRecordSha256,
    issuedAt,hostKeyId,signatureAlgorithm:'Ed25519'
  };
  const ledgerReceipt={
    ...ledgerPayload,signature:'synthetic-unverified-signature',
    signedPayloadSha256:sha256(ledgerPayload)
  };
  return {registration,registrationSha256,registrationReceipt,records,ledgerReceipt};
}

test('campaign ledger admits a complete shared-coin 32-rank round structurally only',()=>{
  const result=assessCorrelatedFieldCampaign(buildCampaign());
  assert.equal(result.admissionStatus,'STRUCTURALLY_VALID_EXTERNAL_AUDIT_REQUIRED');
  assert.equal(result.orientationAssignment,'SHARED_FAIR_COIN_PER_COMPLETE_ROUND');
  assert.equal(result.perRankUpdateBoundary,'COMPLETE_ROUND_ONLY');
  assert.equal(result.aggregate.rounds,1);
  assert.equal(result.aggregate.games,64);
  assert.equal(result.perRankVetoes.length,32);
  assert.ok(result.perRankVetoes.every(row=>row.completedPairs===1));
  assert.equal(result.registrationSignatureVerifiedExternally,false);
  assert.equal(result.orientationCoinFairnessVerifiedExternally,false);
  assert.equal(result.physicalDealIndependenceVerifiedExternally,false);
  assert.equal(result.policyResetVerifiedExternally,false);
  assert.equal(result.competitiveAdmissionEligible,false);
});

test('shared round coin drives one diagonal across all ranks and per-rank updates batch by round',()=>{
  const result=assessCorrelatedFieldCampaign(buildCampaign({
    roundCount:5,coins:[0,1,0,1,0],
    outcomeFor:(rank)=>rank===6?'loss':'win'
  }));
  const rank6=result.perRankVetoes[5];
  assert.equal(result.aggregate.rounds,5);
  assert.equal(rank6.completedPairs,5);
  assert.equal(rank6.nonwins,10);
  assert.equal(rank6.rejectionFlag,true);
  assert.equal(rank6.firstCrossingRound,5);
  assert.ok(result.perRankVetoes.filter(row=>row.originalRank!==6)
    .every(row=>row.rejectionFlag===false));
});

test('candidate-start diagonal cannot differ within a shared-coin round',()=>{
  assert.throws(()=>assessCorrelatedFieldCampaign(buildCampaign({
    wrongStartAt:{ordinal:1,rank:17,slot:'B'}
  })),/shared coin diagonal/);
});

test('partial or omitted game cannot be accepted as a complete round',()=>{
  assert.throws(()=>assessCorrelatedFieldCampaign(buildCampaign({
    omitGameAt:{ordinal:1,rank:32,slot:'B'}
  })),/exactly 64 games/);
});

test('an omitted terminal leaves a registered round open and is rejected',()=>{
  const campaign=buildCampaign();
  campaign.records.pop();
  assert.throws(()=>assessCorrelatedFieldCampaign(campaign),/no complete or abort terminal record/);
});

test('ledger receipt count and head must bind the complete append-only record stream',()=>{
  const campaign=buildCampaign();
  campaign.ledgerReceipt.recordCount--;
  assert.throws(()=>assessCorrelatedFieldCampaign(campaign),/ledger receipt/);
});

test('an explicit abort remains in the ledger and fails certification closed',()=>{
  assert.throws(()=>assessCorrelatedFieldCampaign(buildCampaign({
    abortAtRound:1,abortAfterGames:7
  })),/aborted round 1.*FAIL_CLOSED/);
});

test('registration digest and fresh per-game policy-process identities are enforced',()=>{
  const changed=buildCampaign();
  changed.registration.candidatePolicyRevision=sha256('changed-policy');
  assert.throws(()=>assessCorrelatedFieldCampaign(changed),/registration schema or digest/);
  assert.throws(()=>assessCorrelatedFieldCampaign(buildCampaign({
    duplicateProcessAt:{ordinal:1,rank:2,slot:'A'}
  })),/fresh, distinct candidate and opponent policy processes/);
});

test('a campaign with no committed rounds is structurally empty, not evidence',()=>{
  const result=assessCorrelatedFieldCampaign(buildCampaign({roundCount:0}));
  assert.equal(result.aggregate.rounds,0);
  assert.equal(result.aggregate.games,0);
  assert.ok(result.perRankVetoes.every(row=>row.completedPairs===0));
  assert.equal(result.competitiveAdmissionEligible,false);
});
