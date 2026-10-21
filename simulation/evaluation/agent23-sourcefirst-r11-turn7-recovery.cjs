'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {loadCampaignInputs}=require('./aichi-campaign-runner.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {sourceFirstPressureTrials,executeDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withOwnedTurnRootReadObserver}=
  require('../twinleaf/agent23-source-owner-turn7-read-observer.cjs');
const {initializeCards}=require('../twinleaf/headless.cjs');

const ENGINE_PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const ARCHIVED_SOURCE_DEAL=
  '60b66e9e74e6e2914d92ba2c03dce8671b372e624f4f50797a6022a3eb955e31';
const ARCHIVED_ROOT_LEDGER=
  'b6810151644e298d8a4bdfcd766e8adf509a5c25e6a73a0f4aa02c4c8fd9f5a6';

/**
 * One preselected, already-published source-first original State: exactly
 * Agent42's manually compiled Escape Rope treatment. Record only the source
 * owner's own-hand mobility resource counts when the source next acts on
 * turn 7. This is never a replay or artificial alternate game outcome.
 */
function run(){
  initializeCards();
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(output,
    'simple-bot/simple-tactics-ai'));
  const trial=sourceFirstPressureTrials().find(row=>
    row.rank===11&&row.candidateId==='new-moon-lockbreaker-v1');
  assert.equal(trial?.id,
    '11:retrospective-sourcefirst:2:B:new-moon-lockbreaker-v1');
  assert.equal(trial.seed,482443328);
  const inputs=loadCampaignInputs();
  const row=inputs.candidates.find(candidate=>
    candidate.id==='new-moon-lockbreaker-v1');
  assert.ok(row);
  const plan=planAichi({label:row.id,cards:row.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  const prepared=new Map([[row.id,{plan}]]);
  const execute=()=>{
    const observed=withCanonicalActorOnlyPolicy(
      ()=>executeDevelopment(trial,prepared,{
        mandatoryOptionFallback:true,
        paperSupporterQuota:true,
        initializationWindow:false,
        garbotoxinWindow:true
      }),{},{
        ownerSingleSearch:true,
        genericFallbackAttribution:true,
        actorHandDiscard:true,
        actorChoosePokemon:true
      });
    return {...observed.result,actorAudit:observed.audit};
  };
  const {result,observationAudit}=
    withOwnedTurnRootReadObserver(SimpleTacticsAi,execute,{
      seat:0,turn:7
    });
  const physical={
    sourceDealFingerprint:result.sourceDealFingerprint,
    rootActionLedgerSha256:result.rootActionLedgerSha256,
    actualStarterSeat:result.actualStarterSeat,
    verifiedFirstTurn:result.verifiedFirstTurn,
    sourceActuallyFirst:result.sourceActuallyFirst,
    actionCount:result.actionCount,
    finalPrizes:result.finalPrizes,
    winner:result.winner
  };
  const physicalArchiveMatches=
    physical.sourceDealFingerprint===ARCHIVED_SOURCE_DEAL&&
    physical.rootActionLedgerSha256===ARCHIVED_ROOT_LEDGER&&
    physical.actualStarterSeat===0&&
    physical.verifiedFirstTurn===true&&
    physical.sourceActuallyFirst===true&&
    physical.actionCount===175&&
    JSON.stringify(physical.finalPrizes)==='[6,0]'&&
    physical.winner===1;
  const first=observationAudit.boundedRoots[0]?.root??null;
  const observationUsable=observationAudit.matchCalls===1&&
    observationAudit.hookErrors===0&&
    observationAudit.seenRoots>=1&&
    first?.turn===7&&first?.actorSeat===0&&
    first?.active?.printing==='Garbodor BKP';
  const report={
    schema:'agent23-sourcefirst-rank11-source-turn7-owned-recovery-v1',
    enginePin:ENGINE_PIN,
    historicalTrial:trial,
    canonicalSourceArtifact:'agent42-sourcefirst-escape-rope-20261021',
    archivedSourceDeal:ARCHIVED_SOURCE_DEAL,
    archivedRootLedger:ARCHIVED_ROOT_LEDGER,
    physical,physicalArchiveMatches,observationUsable,
    observationAudit,
    competitiveQualifiedGames:0,
    winRateCertified:false,
    caveat:'One retrospective original-Store source-first case. Owner private hand '+
      'recorded AFTER game for provenance; source policy decisions remain unchanged. '+
      'Availability and printed costs cannot certify a legal multi-action rescue '+
      'or competitive win rate.'
  };
  assert.ok(physicalArchiveMatches,
    'Original archived source-first full-game playback mismatch');
  assert.ok(observationUsable,
    'Authentic source seat0 turn7 owner-root not observed');
  return report;
}
if(require.main===module){
  const report=run();
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  process.stderr.write(JSON.stringify({
    replayMatched:report.physicalArchiveMatches,
    sourceTurn7Roots:report.observationAudit.seenRoots,
    firstSourceTurn7OwnerRecovery:
      report.observationAudit.boundedRoots[0]?.root??null
  })+'\n');
}
module.exports={run,ENGINE_PIN,ARCHIVED_SOURCE_DEAL,ARCHIVED_ROOT_LEDGER};
