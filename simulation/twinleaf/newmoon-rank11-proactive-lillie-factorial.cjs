'use strict';

const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {loadNewMoonCandidate}=
  require('../../scripts/aichi-new-moon-candidate.cjs');
const {deriveSlotSeeds}=
  require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runWithResearchProfile,RANK11_AUTONOMOUS_PROFILE}=
  require('./policy-profiles.cjs');
const {withNewMoonBlowerAutonomy}=
  require('./newmoon-garbotoxin-blower-autonomy.cjs');

const SOURCE_RANK=11;
const SOURCE_SEAT=0;
const CANDIDATE_SEAT=1;
const SEED_BASE=20261019;
const REPEATS=6;
const ACTION_LIMIT=160;
const OLD_SELECTED_POSITIVE=1244180408;
const MODES=[
  {id:'generic',options:null},
  {id:'blower',options:{}},
  {id:'lillie',options:{
    proactiveLowHandLillie:true,automaticFieldBlower:false
  }},
  {id:'combined',options:{proactiveLowHandLillie:true}}
];

/** @param {object} game @param {object|null} audit */
function summarize(game,audit) {
  const turns=game.decisionTrace.filter(row=>
    row.playerSlot===CANDIDATE_SEAT);
  const sourceTurns=game.decisionTrace.filter(row=>
    row.playerSlot===SOURCE_SEAT);
  return {
    actualFirstTurn:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,
    deckHashes:game.deckHashes,
    rootActions:game.actions,turns:game.turns,
    engineFinished:game.finished,winner:game.winner,
    endReason:game.endReason,prizesRemaining:game.prizesRemaining,
    sourceOpener:game.rank11AutonomousPolicy,
    candidateLilliePlays:turns.filter(row=>
      row.action==='PlayCardAction' && row.card==="Lillie's Determination")
      .map(row=>({ordinal:row.actionOrdinal,turn:row.turnBefore})),
    candidateBlowerPlays:turns.filter(row=>
      row.action==='PlayCardAction' && row.card==='Field Blower')
      .map(row=>({ordinal:row.actionOrdinal,turn:row.turnBefore})),
    candidateStoreAttacks:game.attackDeclarationTrace.filter(row=>
      row.playerSlot===CANDIDATE_SEAT).map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        attack:row.attackName,trigger:row.triggerAction
      })),
    sourceAttackCount:game.attackTrace.filter(row=>
      row.seat===SOURCE_SEAT).length,
    sourceFirstTurnTrace:sourceTurns.filter(row=>
      row.turnBefore===1).map(row=>({
        ordinal:row.actionOrdinal,action:row.action,
        card:row.card??null,ability:row.ability??null
      })),
    policy:audit===null?null:{
      version:audit.version,
      blowerSelections:audit.opportunitySelections,
      confirmedToolRemovals:audit.confirmedToolRemovals,
      lowHandLillieSelections:audit.lowHandLillieSelections,
      selectedLillieEvents:audit.events.filter(row=>
        row.kind==='autonomous-legal-low-hand-Supporter')
    }
  };
}

/** @param {string[]} candidate @param {string[]} opponent @param {number} seed @param {{id:string,options:object|null}} mode */
function arm(candidate,opponent,seed,mode) {
  const request={
    deckA:opponent,deckB:candidate,seed,
    maxActions:ACTION_LIMIT,
    rank11SourceSeat:SOURCE_SEAT,
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true,
    label:'rank11-proactive-Lillie-prospective-'+mode.id
  };
  const play=()=>runWithResearchProfile(request,RANK11_AUTONOMOUS_PROFILE);
  const {result,policyAudit}=mode.options===null ?
    {result:play(),policyAudit:null} :
    withNewMoonBlowerAutonomy(CANDIDATE_SEAT,play,mode.options);
  assert.equal(result.verifiedByDrawLog,true);
  assert.equal(result.attackDeclarationTraceProtocol,
    'real-store-attack-log-declarations-v1');
  assert.equal(result.rank11AutonomousPolicy?.sourceSeat,SOURCE_SEAT);
  const summary=summarize(result,policyAudit);
  if (policyAudit) {
    assert.ok(summary.candidateLilliePlays.length>=
      policyAudit.lowHandLillieSelections,
      'A selected proactive Supporter must be a real Store PlayCardAction');
    assert.ok(summary.candidateBlowerPlays.length>=
      policyAudit.opportunitySelections,
      'An autonomous selected Item must be a real Store PlayCardAction');
    for(const event of policyAudit.events.filter(x=>
      x.kind==='autonomous-legal-low-hand-Supporter')) {
      assert.ok(summary.candidateLilliePlays.some(row=>
        row.turn===event.turn),
      'A selected Lillie should be present in the same actual turn');
    }
  }
  return summary;
}

/** @param {string[]} candidate @param {string[]} opponent @param {number} seed @param {string} frame */
function comparison(candidate,opponent,seed,frame) {
  const arms=Object.fromEntries(MODES.map(mode=>[
    mode.id,arm(candidate,opponent,seed,mode)
  ]));
  const first=arms.generic;
  for(const result of Object.values(arms)) {
    assert.deepEqual(result.deckHashes,first.deckHashes,
      'Policy comparison changed physical opening deck order');
    assert.equal(result.actualFirstTurn,first.actualFirstTurn,
      'Policy comparison changed which actual physical seat starts');
  }
  if(first.actualFirstTurn===SOURCE_SEAT) {
    for(const result of Object.values(arms)) {
      assert.deepEqual(result.sourceFirstTurnTrace,first.sourceFirstTurnTrace,
        'Candidate-only policy must preserve the authentic source-first opener');
    }
  }
  return {frame,seed,actualFirstTurn:first.actualFirstTurn,arms,
    qualifiedForCompetitiveInference:false};
}

function run() {
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:candidate.id,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(row=>row.rank===SOURCE_RANK);
  assert.equal(source?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  const seeds=Array.from({length:REPEATS},(_,i)=>
    deriveSlotSeeds(SEED_BASE,'pilot',SOURCE_RANK,i).B);
  assert.equal(new Set(seeds).size,REPEATS);
  assert.ok(!seeds.includes(OLD_SELECTED_POSITIVE));
  const prospective=seeds.map(seed=>
    comparison(plan.candidate.cards,source.cards,seed,'registered-untested-pilot'));
  const retrospectivePositive=comparison(
    plan.candidate.cards,source.cards,OLD_SELECTED_POSITIVE,
    'already-selected-positive-mechanical-control');
  return {
    schema:'rank11-proactive-lowhand-lillie-small-factorial-v1',
    sourceRank:SOURCE_RANK,sourceSeat:SOURCE_SEAT,
    candidateSeat:CANDIDATE_SEAT,
    fixedCandidate:candidate.id,
    candidateProxyIdCountHash:candidate.proxyIdCountHash,
    engineRevision:plan.engineRevision,
    actionLimit:ACTION_LIMIT,
    seedBase:SEED_BASE,
    prospectiveSeedProtocol:'deriveSlotSeeds(20261019,pilot,11,repeat).B for repeats 0 through 5; written to source before the CI execution; all retained',
    modes:MODES.map(x=>x.id),
    trialRegistryNote:'Initial manual CI 39174187678 failed before any game because the v3 hash generator rejects unknown phase labels. This run uses the documented pilot phase while preserving seed base, all six prespecified repeat indices and policies; no outcome-conditioned seed selection.',
    prospective,
    retrospectivePositive,
    interpretation:'Only source-dealt short-horizon owner-information decision-policy exposure. The selected positive control is excluded from prospective statistics; weak source bot and no paper clock.',
    competitivelyQualifiedGames:0
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,arm,summarize,comparison,MODES};
