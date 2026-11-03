'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {summarizeOriginalSourceSetup,compareOriginalSourceSetup,
  censusOriginalSourceSetup}=
  require('../simulation/evaluation/agent48-original-setup-contrast.cjs');

const hash=s=>createHash('sha256').update(s).digest('hex');
function sample(candidateId,source='same-source'){
  return {
    trial:{id:'5:101:A:'+candidateId,rank:5,repeat:101,
      candidateSlot:'A',candidateId,seed:198157155},
    status:null,sourceDealFingerprint:hash(source),
    verifiedFirstTurn:true,actualStarterSeat:0,
    initialSetupCompensation:{
      schema:'real-store-initial-setup-compensation-v1',
      mulligans:[1,0],bonusDrawn:[0,1]
    },
    initialPublicMulliganReveals:{
      schema:'native-public-opponent-mulligan-reveal-v1',
      revealedHandCounts:[1,0],handsByOwner:[
        [['private-disallowed-from-output']],[]
      ]
    }
  };
}
const first='champion-reference';
const second='new-moon-lockbreaker-v1';

test('original same-seed source divergence remains visible with equal public mulligans',()=>{
  const report=compareOriginalSourceSetup(
    [sample(first,'one'),sample(second,'two')],'5:101:A');
  assert.equal(report.registeredSameSeed,true);
  assert.equal(report.physicalSourceDealMatch,false);
  assert.equal(report.sameMulliganCounts,true);
  assert.equal(report.sameBonusDrawnCounts,true);
  assert.equal(report.samePublicMulliganCounts,true);
  assert.equal(report.sameNativeStarter,true);
  assert.equal(JSON.stringify(report).includes('private-disallowed'),false);
  assert.equal(report.causalOriginEstablished,false);
});

test('public source setup difference is reported without guessing its cause',()=>{
  const other=sample(second);
  other.initialSetupCompensation.mulligans=[0,1];
  other.initialSetupCompensation.bonusDrawn=[1,0];
  other.initialPublicMulliganReveals.revealedHandCounts=[0,1];
  const report=compareOriginalSourceSetup([sample(first),other],'5:101:A');
  assert.equal(report.physicalSourceDealMatch,true);
  assert.equal(report.sameMulliganCounts,false);
  assert.equal(report.sameBonusDrawnCounts,false);
  assert.equal(report.samePublicMulliganCounts,false);
  assert.equal(report.causalOriginEstablished,false);
});

test('missing public setup data is unknown, even if source digest known',()=>{
  const other=sample(second);
  delete other.initialSetupCompensation;
  delete other.initialPublicMulliganReveals;
  const report=compareOriginalSourceSetup([sample(first),other],'5:101:A');
  assert.equal(report.publicSetupKnown,false);
  assert.equal(report.sameMulliganCounts,null);
  assert.equal(report.publicRevealsKnown,false);
  assert.equal(report.samePublicMulliganCounts,null);
  assert.equal(report.physicalSourceDealMatch,true);
});

test('different source trial or seed and a one-arm comparison cannot be compared',()=>{
  assert.throws(()=>compareOriginalSourceSetup([sample(first)],'5:101:A'),
    /Need exactly two/);
  const different=sample(second);
  different.trial.seed++;
  assert.throws(()=>compareOriginalSourceSetup(
    [sample(first),different],'5:101:A'),/seed differs/);
  assert.throws(()=>compareOriginalSourceSetup(
    [sample(first),sample(first)],'5:101:A'));
});

test('public setup summary excludes revealed printings',()=>{
  const summary=summarizeOriginalSourceSetup(sample(first));
  assert.equal(Object.prototype.hasOwnProperty.call(summary,
    'revealedHands'),false);
  assert.equal(summary.mulligansBySeat[0],1);
  assert.equal(summary.sourceSeat,1);
  assert.equal(summary.competitiveGameQualified,false);
});


test('paired setup census partitions matched source openings by mulligan covariance',()=>{
  const p=sample(first);
  const q=sample(second);
  const census=censusOriginalSourceSetup([p,q]);
  assert.equal(census.groups,1);
  assert.equal(census.pairedComparisonsWithKnownSetupAndDigest,1);
  assert.equal(census.sameMulliganVector.groups,1);
  assert.equal(census.sameMulliganVector.physicalOpeningMatched,1);
  assert.equal(census.differentMulliganVector.groups,0);
  assert.equal(census.causalOriginEstablished,false);
});

test('paired setup census retains incompatible seeded mulligan as unmatched source position',()=>{
  const p=sample(first);
  const q=sample(second,'different-original-source');
  q.initialSetupCompensation.mulligans=[0,0];
  q.initialSetupCompensation.bonusDrawn=[0,0];
  const census=censusOriginalSourceSetup([p,q]);
  assert.equal(census.sameMulliganVector.groups,0);
  assert.equal(census.differentMulliganVector.groups,1);
  assert.equal(census.differentMulliganVector.physicalOpeningMismatched,1);
  assert.equal(census.differentMulliganVector.sameCompensation,0);
  assert.equal(census.competitiveGameQualified,false);
});
