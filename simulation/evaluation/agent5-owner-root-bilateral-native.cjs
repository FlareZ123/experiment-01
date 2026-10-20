'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {initializeCards}=require('../twinleaf/headless.cjs');
const {withOwnerRootSlice,VERSION}=
  require('../twinleaf/agent5-owner-root-slice.cjs');
const {developmentTrials,sourceFirstPressureTrials,executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');

const root=path.resolve(__dirname,'../..');

/**
 * Versioned, original-published source 60s. Never edit the candidates or
 * choose roots based on their eventual outcomes.
 * @returns {Map<string,object>}
 */
function prepareCandidates(){
  const source=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=source.decks.find(deck=>deck.rank===1);
  assert.ok(reference&&Array.isArray(reference.cards));
  const names=[
    ['champion-reference',{label:'champion-reference',
      cards:reference.cards}],
    ['new-moon-lockbreaker-v1',{label:'new-moon-lockbreaker-v1',
      cards:loadNewMoonCandidate().cards}]
  ];
  return new Map(names.map(([name,manifest])=>[
    name,{plan:planAichi(manifest,{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })}
  ]));
}

/**
 * Read-only corroboration of actual Store accepted roots: a proposal is
 * meaningful only if it is visible in the real native ledger for that seat.
 * Root order has intentionally not been inferred from changed tape ordinals.
 * @param {object} arm Original canonical result.
 * @param {object} audit Direct interception record.
 * @returns {object}
 */
function summarize(arm,audit){
  const roots=arm.paperSupporterComparisonTrace??[];
  const candidateRoots=roots.filter(row=>row.playerSlot===audit.candidateSeat);
  const relevant=candidateRoots.filter(row=>
    ['PlayCardAction','AttackAction','PassTurnAction'].includes(row.action));
  return {
    version:VERSION,trial:arm.trial,
    candidateSeat:audit.candidateSeat,
    sourceSeat:arm.sourceSeat,sourceActuallyFirst:arm.sourceActuallyFirst,
    sourcePhysicalDeal:arm.sourceDealFingerprint,
    actualRootCount:arm.actionCount,
    candidateRootCount:relevant.length,
    rootActionLedgerSha256:arm.rootActionLedgerSha256,
    actorOnlyRootProposals:audit.ownerRootProposals,
    acceptedByNativeStore:audit.acceptedByLiveStore,
    rejectedOrUncorroborated:audit.records.filter(
      row=>!row.acceptedByLiveStore).length,
    proposalBreakdown:Object.fromEntries(
      ['bench-basic','attach-basic-energy','attack','pass'].map(kind=>[
        kind,audit.records.filter(row=>row.intent.kind===kind).length
      ])),
    acceptedExamples:audit.records.filter(
      row=>row.acceptedByLiveStore).slice(0,12),
    genericFallbacks:{
      prompts:audit.promptGenericFallbacks,
      sourceDecisions:audit.sourceGenericFallbacks
    },
    confirmedAttackDeclarations:arm.attackDeclarations,
    sourceLineReplyStatus:arm.candidateFollowupStatus,
    sourceLineReply:arm.sourceLinePacket,
    paperSupporterQuotaPassed:arm.nativeSupporterQuotaQualified,
    finalPrizes:arm.finalPrizes,
    state:arm.finished?'engine-terminal':'censored',
    engineTerminalReason:arm.endReason,
    competitiveQualified:false
  };
}

/** @returns {object} */
function runNativeActorRootBilateral(){
  initializeCards();
  const candidates=prepareCandidates();
  const historical=developmentTrials().filter(row=>row.rank===11);
  const sourceFirst=sourceFirstPressureTrials().filter(row=>row.rank===11);
  const trials=[...historical,...sourceFirst];
  assert.equal(trials.length,4);
  const outcomes=[];
  for(const trial of trials){
    const seat=trial.candidateSlot==='A'?0:1;
    try{
      const attempt=withOwnerRootSlice(seat,()=>
        executeDevelopment(trial,candidates,{
          paperSupporterQuota:true,paperSupporterComparisonTrace:true,
          mandatoryOptionFallback:true
        }));
      outcomes.push(summarize(attempt.result,attempt.audit));
    }catch(error){
      outcomes.push({trial,status:'actor-only-native-experiment-error',
        error:String(error?.stack??error),
        competitiveQualified:false});
    }
  }
  return {
    schema:'agent5-owner-root-bilateral-native-retrospective-development-v1',
    comparison:'Rank11 published source vs unchanged champion/New Moon fixed 60',
    historical:2,retrospectiveSourceFirst:2,attempted:outcomes.length,
    nativeAcceptedRootActions:outcomes.reduce((sum,row)=>
      sum+(row.acceptedByNativeStore??0),0),
    policy:'Actor-view owner-root subset; prompted choices/source decisions still generic',
    candidatePolicyComplete:false,hiddenInformationSafeFullGames:false,
    engineClockCertified:false,competitiveQualifiedGames:0,
    sourceRank11Selection:'Retrospective Tool-Garbodor success; cannot use as prospective strength evidence',
    outcomes
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(runNativeActorRootBilateral(),null,2)+'\n');
module.exports={prepareCandidates,summarize,runNativeActorRootBilateral};
