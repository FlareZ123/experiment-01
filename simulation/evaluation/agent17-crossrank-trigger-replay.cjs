'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {executeArm,scheduledArms,assertManifest}=
  require('./agent41-crossrank-actual-decisions.cjs');

const root=path.resolve(__dirname,'../..');
const TRIGGER_IDS=Object.freeze([
  '6:0:A:champion-reference',
  '6:0:A:new-moon-lockbreaker-v1',
  '6:2:A:new-moon-lockbreaker-v1',
  '11:2:B:champion-reference'
]);

/**
 * Exactly the four source-policy triggers observed in the original partition
 * zero. This intentionally selects outcomes retrospectively for forensic
 * replay and must never be counted as a fresh competitive sample.
 * @returns {object[]}
 */
function selectedArchivedTrials() {
  const byId=new Map(scheduledArms().map(row=>[row.id,row]));
  const selected=TRIGGER_IDS.map(id=>{
    const row=byId.get(id);
    assert(row && row.repeat<=2,'Missing original partition-0 trial '+id);
    return row;
  });
  assert.equal(new Set(selected.map(row=>row.id)).size,4);
  return selected;
}

/** @returns {Map<string,object>} */
function preparedFrozenDecks() {
  const {planAichi}=require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate}=
    require('../../scripts/aichi-new-moon-candidate.cjs');
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=roster.decks.find(row=>row.rank===1);
  assert(reference && reference.cards.length===60);
  const newMoon=loadNewMoonCandidate();
  const specs=[
    ['champion-reference',reference.cards],
    ['new-moon-lockbreaker-v1',newMoon.cards]
  ];
  return new Map(specs.map(([id,cards])=>[id,{plan:planAichi(
    {label:id,cards},
    {allowEquivalentBasicEnergies:true,allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true}
  )}]));
}

/**
 * Reexecute only earlier selected deals with extra post-choice, read-only
 * evidence. No observed action, policy or prior source is changed on purpose.
 * @returns {object}
 */
function run() {
  assertManifest();
  const prepared=preparedFrozenDecks();
  const rows=selectedArchivedTrials().map(trial=>{
    try {
      const observed=executeArm(trial,prepared,{
        captureBilateralReplyPacket:true
      });
      return {
        id:trial.id,seed:trial.seed,sourceRank:trial.rank,
        status:observed.status,actions:observed.actions,turns:observed.turns,
        sourcePolicyAudit:observed.sourcePolicyAudit,
        sourceActuallyFirst:observed.sourceActuallyFirst,
        verifiedFirstTurn:observed.verifiedFirstTurn,
        candidateAttackDeclarations:observed.candidateAttackDeclarations,
        sourceAttackDeclarations:observed.sourceAttackDeclarations,
        sourceReplyPacket:observed.sourceReplyPacket,
        finalPrizes:observed.prizesRemaining,
        qualifiedCompetitiveGame:false
      };
    }catch(error) {
      return {id:trial.id,seed:trial.seed,sourceRank:trial.rank,
        status:'retrospective-forensic-error',error:String(error?.stack||error),
        qualifiedCompetitiveGame:false};
    }
  });
  return {
    schema:'agent17-retrospective-crossrank-bilateral-store-v1',
    originalCompiledRun:39193837824,
    originalArchivedArtifact:12161805529,
    originalResearchRevision:'16ed358b5f0324dba10762e67f9bf286c833af49',
    originalUniquePhysicalSeedSlots:3,
    currentResearchRevision:process.env.GITHUB_SHA??null,
    originallyRegisteredTotal:48,originallyExecutedPartition0:24,
    retrospectiveReplayedRows:rows.length,
    retrospectiveSampling:'source-trigger-outcome-selected for mechanics only',
    currentEnginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows,qualifiedCompetitiveGames:0,rankingPermitted:false,
    limits:'Root acceptance and actual Store declarations do not independently verify printed attack effects, paper rules, bilateral policy competence or clock equivalence.'
  };
}

module.exports={TRIGGER_IDS,selectedArchivedTrials,run};
if(require.main===module) {
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
