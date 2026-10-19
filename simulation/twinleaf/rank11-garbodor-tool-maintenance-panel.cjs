'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {runMatch}=require('./headless.cjs');
const {withRank11AutonomousOpener}=require('./rank11-autonomous-opener.cjs');
const {withRank11GarbodorToolMaintenance}=
  require('./rank11-garbodor-tool-maintenance-policy.cjs');

const SEEDS=Object.freeze([2659000125,2476078180,2913690314,3562376534]);
const MAX_ACTIONS=450;
const SOURCE_RANK=11;
const SOURCE_PROFILE='rank11-autonomous-boostshake-v1';
const sha=object=>createHash('sha256').update(JSON.stringify(object)).digest('hex');

/** @param {object} game */
function summary(game) {
  return {
    finished:game.finished,
    winner:game.winner,
    endReason:game.endReason??null,
    turns:game.turns,
    actions:game.actions,
    firstTurnSlot:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    deckHashes:game.deckHashes,
    prizes:game.prizesRemaining,
    rootLedgerSha256:sha(game.rootActionLedger),
    rootActions:game.rootActionLedger.length,
    sourceAttackDeclarations:game.attackDeclarationTrace?.length??null
  };
}

/**
 * Preserve failed Store runs as explicit scheduled negative evidence.
 * @param {()=>object} execute
 * @returns {{ok:true,value:object}|{ok:false,error:string}}
 */
function capture(execute) {
  try {
    return {ok:true,value:execute()};
  }catch(error){
    return {ok:false,error:String(error?.stack||error)};
  }
}

/**
 * One exact seed, two physical slots, both baseline/Tool maintenance arms.
 * Every started runner shares all choices until the proposed first retarget.
 * @param {string[]} candidate
 * @param {string[]} opponent
 * @param {number} seed
 * @param {0|1} candidateSeat
 */
function replayPair(candidate,opponent,seed,candidateSeat) {
  const sourceSeat=1-candidateSeat;
  const request={
    deckA:candidateSeat===0?candidate:opponent,
    deckB:candidateSeat===1?candidate:opponent,
    seed,maxActions:MAX_ACTIONS,
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    rank11SourceSeat:sourceSeat,
    label:'agent37-rank11-maintenance-prospective-v1'
  };
  /** @param {()=>object} execute */
  const sourceProfile=execute=>withRank11AutonomousOpener(sourceSeat,execute,{
    allowSecondGlobalTurn:false,version:SOURCE_PROFILE
  });
  const baseline=capture(()=>sourceProfile(()=>runMatch(request)));
  const alternative=capture(()=>sourceProfile(()=>
    withRank11GarbodorToolMaintenance(sourceSeat,()=>runMatch(request))));
  const row={
    seed,candidateSeat,sourceSeat,
    status:baseline.ok&&alternative.ok?'both-engine-arms-completed':'engine-error-retained',
    baseline:baseline.ok?summary(baseline.value.result):{error:baseline.error},
    maintenance:alternative.ok?summary(alternative.value.result.result):
      {error:alternative.error},
    candidatePolicy:'unqualified-SimpleTacticsAi',
    sourcePolicy:SOURCE_PROFILE,
    qualifiedCompetitiveGames:0
  };
  if(!baseline.ok||!alternative.ok)return row;
  const ordinary=baseline.value.result;
  const changed=alternative.value.result.result;
  const audit=alternative.value.result.audit;
  row.policyAudit=audit;
  assert.equal(ordinary.firstTurnSlot,changed.firstTurnSlot,
    'First-turn player must agree before and after Tool maintenance');
  assert.equal(ordinary.verifiedByDrawLog,true);
  assert.equal(changed.verifiedByDrawLog,true);
  assert.deepEqual(ordinary.deckHashes,changed.deckHashes,
    'Physical deck identities cannot change across policy-only arms');
  const originals=ordinary.rootActionLedger;
  const variants=changed.rootActionLedger;
  if(audit.eligibleDecisions===0) {
    assert.deepEqual(variants,originals,
      'Untriggered owner Tool policy must be fully noninterfering');
    row.rootBeforeChoiceIdentical=true;
    row.untriggeredWholeReplayIdentical=true;
  } else {
    const first=audit.events[0];
    const locator=ledger=>ledger.findIndex(action=>
      action.turnBefore===first.globalTurn &&
      action.playerSlot===sourceSeat &&
      action.action==='PlayCardAction' &&
      action.card?.startsWith('Float Stone'));
    const left=locator(originals),right=locator(variants);
    assert.ok(left>=0&&right>=0,
      'Both real Store ledgers must contain the source Float Stone decision');
    assert.equal(left,right,
      'Source same-deal prefixes must reach Tool choice at matching root ordinal');
    assert.deepEqual(originals.slice(0,left),variants.slice(0,right),
      'Everything before the first alternate Tool choice must be identical');
    row.firstRetargetOrdinal=originals[left].actionOrdinal;
    row.rootBeforeChoiceIdentical=true;
    row.untriggeredWholeReplayIdentical=false;
  }
  return row;
}

/** Runs every prespecified seed/seat without searching for winners. */
function run() {
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(p=>p.rank===SOURCE_RANK);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  const rows=[];
  for(const seed of SEEDS)
    for(const seat of [0,1])
      rows.push(replayPair(plan.candidate.cards,opponent.cards,seed,seat));
  const attempted=rows.filter(row=>row.status==='both-engine-arms-completed');
  return {
    schema:'rank11-full-source-tool-maintenance-prospective-v1',
    registration:'results/aichi-2026/rank11-garbodor-tool-maintenance-registration.md',
    seedProtocol:'four cryptographically drawn seeds, both physical candidate slots, fixed before compiling',
    seeds:SEEDS,
    sourceRank:SOURCE_RANK,
    engineRevision:plan.engineRevision,
    candidateDeckSha256:candidate.canonical_id_count_sha256??null,
    sourceProfile:SOURCE_PROFILE,
    totalSeeds:SEEDS.length,
    totalScheduledPairs:SEEDS.length*2,
    totalRecordedPairs:rows.length,
    bothArmsCompleted:attempted.length,
    failedArmsPreserved:rows.length-attempted.length,
    retargetOpportunities:attempted.reduce((n,r)=>n+r.policyAudit.eligibleDecisions,0),
    positiveFixtureOutsideDenominator:1111464409,
    qualifiedCompetitiveGames:0,
    policyAndRulesCertified:false,
    rows
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');

module.exports={run,replayPair,summary};
