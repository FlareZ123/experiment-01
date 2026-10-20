'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {executeDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');

const SEED=482443328;
const FROZEN_ROOT='d1f8b09a618a1dd43746a218ec25aad97d7d7042ba2129eab9577c2a7861b520';
const FROZEN_SOURCE_DEAL='60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31';

/**
 * Historical fixture selected in prior Agent9 source-success replay,
 * intentionally not a prospective seed or conditional win-rate sample.
 */
function prepare(){
  const roster=JSON.parse(fs.readFileSync(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),'utf8'));
  const rank1=roster.decks.find(deck=>deck.rank===1);
  assert.ok(rank1);
  const opts={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  return new Map([
    ['champion-reference',{label:'champion-reference',cards:rank1.cards}],
    ['new-moon-lockbreaker-v1',{label:'new-moon-lockbreaker-v1',
      cards:loadNewMoonCandidate().cards}]
  ].map(([id,candidate])=>[id,{plan:planAichi(candidate,opts)}]));
}

function run(){
  const trial={rank:11,repeat:2,seed:SEED,candidateSlot:'B',
    candidateId:'new-moon-lockbreaker-v1',
    id:'11:sourcefirst-mechanic:2:B:new-moon-lockbreaker-v1'};
  const candidates=prepare();
  const options={compressorPayload:true,lateCompressorPayload:true};
  const original=executeDevelopment(trial,candidates,options);
  const watched=executeDevelopment(trial,candidates,{
    ...options,garbotoxinWindow:true
  });
  assert.equal(original.error,undefined);
  assert.equal(watched.error,undefined);
  for(const row of [original,watched]){
    assert.equal(row.sourceActuallyFirst,true);
    assert.equal(row.sourceAudit.completed,true);
    assert.equal(row.sourceAudit.opportunityTurn,1);
    assert.equal(row.sourceDealFingerprint,FROZEN_SOURCE_DEAL);
    assert.equal(row.rootActionLedgerSha256,FROZEN_ROOT,
      'Original historical source-first selected action history drifted');
  }
  for(const key of ['sourceDealFingerprint','actualStarterSeat',
    'rootActionLedgerSha256','actionCount','turns','endReason',
    'finished','winner','finalPrizes','finalBoard','attackDeclarations',
    'candidateAttackSettlement','sourceAudit','firstCandidatePostSourceRoot']){
    assert.deepEqual(watched[key],original[key],
      'Read-only power check changed game or candidate action: '+key);
  }
  const first=watched.firstCandidatePostSourceRoot;
  assert.equal(first?.action,'PlayCardAction');
  assert.equal(first?.card,'Field Blower');
  assert.equal(first?.turnBefore,2);
  return {
    schema:'agent41-authentic-sourcefirst-ability-window-equivalence-v1',
    evidenceType:'historical seed selected by previous source-success replay',
    candidate:trial.candidateId,seed:SEED,
    opponentRank:11,sourceActuallyFirst:true,
    sourceLockLineCompleted:true,
    firstCandidateResponse:first,
    originalRootSha256:original.rootActionLedgerSha256,
    observerRootSha256:watched.rootActionLedgerSha256,
    sameSourceDeal:true,
    sameActualPlayAndPublicEffects:true,
    powerWindow:watched.garbotoxinWindowAudit,
    candidateAttackSettlement:watched.candidateAttackSettlement,
    qualification:{
      ownerInformationSetSafe:false,paperRulesVerified:false,
      competitiveGameQualified:false,prospectiveStrengthTrial:false,
      paperClockCalibrated:false
    }
  };
}
if(require.main===module){
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={SEED,FROZEN_ROOT,FROZEN_SOURCE_DEAL,run};
