'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withRecordedSourceActions}=require('./source-game-action-replay.cjs');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');

const hash=data=>crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

/**
 * Reconstruct the exact source matchup in a separate Node process, importing
 * only the original immutable seed/deck/option identities. This runs the same
 * compiled Store with archived action inputs. One mismatch must stay visible.
 *
 * @param {object} archive JSON from rank10-source-branch-transcript.cjs
 */
function replayArchivedRank10(archive) {
  assert.equal(archive.schema,'rank10-source-branch-live-dispatch-v1');
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const decks=new Map(field.decks.map(d=>[d.rank,d]));
  const champion=decks.get(1);
  const regidrago=decks.get(10);
  assert.ok(champion?.playableUnderEngine&&regidrago?.playableUnderEngine);
  const plan=loadDefaultCampaign('decorrelated-slots-v3');
  const trial=plan.trials.find(t=>t.trialId===archive.trial.id);
  assert.ok(trial);
  assert.equal(trial.rank,10);
  assert.equal(trial.candidateEngineSlot,'B');
  assert.equal(trial.seed,4246551499);
  assert.equal(archive.trial.seed,trial.seed);
  assert.equal(archive.trial.planDigest,plan.planDigest);
  assert.deepEqual(archive.trial.printHashes,
    [hash(regidrago.cardIds),hash(champion.cardIds)]);
  const common={
    deckA:regidrago.cardIds,deckB:champion.cardIds,seed:trial.seed,
    maxActions:350,label:trial.trialId,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,
    mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,
    passClearsLastAttackCorrection:true
  };
  const arms=[
    ['control',common],
    ['alternate',{...common,mimikyuApexTimelessPolicy:true,
      mimikyuApexTimelessPolicySeat:1,mimikyuTurn27SetupSeat:1}]
  ];
  initializeCards();
  const findings=[];
  for(const [arm,request] of arms) {
    const original=archive[arm];
    const sourceTrace=original.fullLiveDispatchTrace;
    assert.ok(Array.isArray(sourceTrace));
    let assessment;
    try {
      const replay=withRecordedSourceActions(sourceTrace,
        ()=>runMatch(request));
      assert.deepEqual(replay.result,original.result,
        'Replayed live Store result differs from archived original');
      assessment={
        status:'complete-reconstructed-live-input-trace',
        verifiedDispatches:replay.verifiedDispatches,
        sourceActions:sourceTrace.length,
        matchSummaryIdentical:true
      };
    } catch(error) {
      assessment={status:'blocked',reason:String(error.message||error),
        sourceActions:sourceTrace.length,matchSummaryIdentical:false};
    }
    findings.push({arm,...assessment});
  }
  return {
    schema:'rank10-archived-input-fresh-process-test-v1',
    engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    trial:trial.trialId,seed:trial.seed,sourcePlanDigest:plan.planDigest,
    controlsAndForksQualifiedForCompetitiveInference:false,
    sourceReplayMechanicsVerified:false,
    note:'Node process is separate from archive capture. Whole-State reducer fidelity, human-level policy and hidden-information fairness are not proven.',
    findings
  };
}

if(require.main===module) {
  const archivePath=process.argv[2];
  if(!archivePath) throw new Error('Pass a source-game live dispatch archive');
  const archive=JSON.parse(fs.readFileSync(archivePath,'utf8'));
  process.stdout.write(JSON.stringify(replayArchivedRank10(archive),null,2)+'\n');
}
module.exports={replayArchivedRank10};
