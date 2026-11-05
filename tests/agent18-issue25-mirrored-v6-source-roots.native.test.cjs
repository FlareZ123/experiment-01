'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runMirroredIssue25V6}=
  require('../simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');
const {summarizeSourcePanel}=
  require('../simulation/evaluation/agent18-issue25-source-root-custody.cjs');

/**
 * Keep the original preregistered eight arms, candidate 60s, shared policy,
 * and action caps unchanged; only inspect original Store accepted roots
 * after the native run. No source scripts or opponent private input.
 */
test('source-independent v6 eight-arm accepted owner-root custody',()=>{
  const {manifest,diagnostic,rawDevelopment}=runMirroredIssue25V6();
  const rows=rawDevelopment?.rows??[];
  const panel=summarizeSourcePanel(rows);
  const crossTab={6:new Set(),11:new Set()};
  for(const row of panel.attempts){
    const rank=Number(row.id?.split(':')[0]);
    if((rank===6||rank===11)&&
       (row.sourceSeat===0||row.sourceSeat===1))
      crossTab[rank].add(row.sourceSeat);
  }
  const result={
    schema:'agent18-issue25-v6-source-owner-roots-native-v1',
    originalRegisteredTrialIds:diagnostic.registered,
    actualSourceIndependentPolicy:manifest.actualRunnerConfirmedOption,
    sourceSpecificScriptsDisabled:
      manifest.originalSourceRankScriptsDisabledByOptIn===true,
    fullPolicyPaperQualified:false,
    selectedPolicyCompetitiveQualified:false,
    policyEntryPoint:manifest.policyEntryPoint,
    pinnedTwinleafCommit:manifest.observedTwinleafGitCommit,
    panel,
    sourceSeatCoverageByRank:{
      6:[...crossTab[6]].sort(),11:[...crossTab[11]].sort()
    }
  };
  console.log('AGENT18_ISSUE25_V6_SOURCE_ROOT_CUSTODY',JSON.stringify(result));
  assert.equal(manifest.actualRunnerConfirmedOption,true);
  assert.equal(rows.length,8,'original eight-arm denominator must remain whole');
  assert.equal(panel.registeredAttempts,8);
  assert.equal(panel.observedAttempts,8,
    'every registered original-source arm must have verified native Store roots');
  assert.deepEqual(result.sourceSeatCoverageByRank,
    {6:[0,1],11:[0,1]});
  assert.equal(manifest.releaseQualified,false);
  assert.equal(panel.competitiveGamesQualified,0);
});
