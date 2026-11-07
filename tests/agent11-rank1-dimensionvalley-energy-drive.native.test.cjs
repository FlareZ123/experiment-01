'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');
const {withRank1MirrorResourceAndAttackAudit}=
  require('../simulation/twinleaf/agent11-rank1-mirror-owner-pass-resources.cjs');
const {VERSION,probeStadiumThenEnergyDrive}=
  require('../simulation/twinleaf/agent11-rank1-dimensionvalley-energy-drive-probe.cjs');
const {TARGET,runActualOriginalRank1MirrorPassProbe}=
  require('../simulation/twinleaf/agent45-rank1-mirror-source-pass-native-probe.cjs');

const FROZEN_ROOT_SHA=
  '3f07a98bee3266a5866351307333d4ad1673ed9e3adb7f356c08cef1290c919a';

test('post-choice exact rank1 source t16 owner-held Dimension Valley -> Energy Drive cloned Store',()=>{
  const observer=(execute,deps)=>withRank1MirrorResourceAndAttackAudit(
    execute,{...deps,onSourcePass:probeStadiumThenEnergyDrive});
  const run=runActualOriginalRank1MirrorPassProbe({observer});
  const row=run.execution.rawDevelopment.rows.find(x=>x.trial?.id===TARGET);
  assert.ok(row);
  assert.equal(row.rootActionLedgerSha256,FROZEN_ROOT_SHA,
    'counterfactual must preserve complete original source game');
  assert.equal(row.finished,true);
  assert.equal(row.winner,1);
  assert.equal(row.actionCount,110);
  assert.deepEqual(row.finalPrizes,[6,0]);
  const sourcePasses=row.rootActionLedger.filter(e=>
    e.playerSlot===0&&e.action==='PassTurnAction');
  assert.equal(sourcePasses.length,12);
  const sourceAudit=run.mirrorSourcePass.audit.ownerPassResourceAudit;
  assert.equal(sourceAudit.selectedSourcePassCount,12);
  assert.equal(sourceAudit.actualStores,1);
  assert.equal(sourceAudit.errorCount,0);
  const turn16=sourceAudit.sourcePasses.find(e=>e.globalTurn===16);
  assert.ok(turn16);
  assert.ok(turn16.detachedCounterfactual,
    'the frozen actual Store t16 was not passed to the attached cloned probe');
  const alternate=turn16.detachedCounterfactual;
  assert.equal(alternate.schema,VERSION,
    'native probe error is not an accepted counterfactual result');
  assert.equal(alternate.targetTurnMatched,true);
  assert.equal(alternate.sourceHandIndex,
    turn16.ownerHandPrintings.indexOf('Dimension Valley PHF'));
  assert.equal(turn16.active.printing,'Tapu Lele-GX GRI');
  assert.deepEqual(turn16.active.energies,['Psychic Energy MEE']);
  assert.equal(turn16.stadiumPlayedTurn,0);
  assert.equal(sourceAudit.sourcePasses.filter(e=>
    e.detachedCounterfactual!==undefined).length,1);
  const packet={
    schema:VERSION,trialId:TARGET,sourceSeat:0,sourceTurn:16,
    realSourcePassHeadlessOrdinal:sourcePasses.find(e=>e.turnBefore===16)
      .actionOrdinal,
    originalFrozenRootSha256:FROZEN_ROOT_SHA,
    originalActionCount:110,
    originalNativeWinnerSeat:1,originalSourceAttackActions:0,
    exactOwnerPrePassHand:turn16.ownerHandPrintings,
    exactOwnerPrePassActive:turn16.active,
    unspentStadiumPlacementBeforeActualPass:true,
    detachedNativeAlternative:alternate,
    genuineNativeStoreDecisionChanged:false,
    sourceRootHistoryUnchanged:true,
    paperQualifiedGames:0,
    limitation:'One retrospective source-only cloned counterfactual; native legality is not paper certification, downstream opponent does not reply, not a matchup win'
  };
  console.log('AGENT11_DIMENSIONVALLEY_ENERGY_DRIVE_NATIVE',
    JSON.stringify(packet));
  const dir=process.env.AGENT11_RANK1_MIRROR_RESOURCE_DIR;
  if(dir){
    fs.mkdirSync(dir,{recursive:true});
    const file=path.join(dir,'agent11-rank1-t16-dimensionvalley-energy-drive.json');
    const bytes=JSON.stringify(packet,null,2)+'\n';
    writeAtomicLocked(file,bytes);
    writeAtomicLocked(file+'.sha256',
      createHash('sha256').update(bytes).digest('hex')+
      '  '+path.basename(file)+'\n');
  }
});
