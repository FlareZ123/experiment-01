'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const test = require('node:test');

const {runOwnerPokemonAba} =
  require('../simulation/evaluation/agent3-issue25-v14-owner-pokemon-aba.cjs');
const {VERSION,withOwnerKoPrizeSettlementEvidence} =
  require('../simulation/twinleaf/agent3-owner-ko-prize-settlement-evidence.cjs');

const ROOT = path.resolve(__dirname,'..');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

/**
 * Write a unique native witness with an exclusive lock and atomic replacement,
 * retaining the archived v14 test and its historical bytes unchanged.
 * @param {object} receipt Sanitzed public physical movement record.
 * @param {string} dir Output directory.
 * @returns {{bytes:number,sha256:string}}
 */
function saveReceipt(receipt,dir) {
  fs.mkdirSync(dir,{recursive:true});
  const lock = path.join(dir,'.agent3-v16-prize.lock');
  const fd = fs.openSync(lock,'wx');
  const filename = 'issue25-v16-ko-prize-settlement.json';
  const output = path.join(dir,filename);
  const sidecar = output+'.sha256';
  const staged = output+'.'+process.pid+'.tmp';
  const stagedSidecar = sidecar+'.'+process.pid+'.tmp';
  const bytes = Buffer.from(JSON.stringify(receipt,null,2)+'\n');
  const digest = sha256(bytes);
  try {
    fs.writeFileSync(staged,bytes,{flag:'wx'});
    fs.renameSync(staged,output);
    fs.writeFileSync(stagedSidecar,digest+'  '+filename+'\n',{flag:'wx'});
    fs.renameSync(stagedSidecar,sidecar);
  } finally {
    if(fs.existsSync(staged))fs.unlinkSync(staged);
    if(fs.existsSync(stagedSidecar))fs.unlinkSync(stagedSidecar);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
  return {bytes:bytes.length,sha256:digest};
}

test('registered v14 A/B/A under passive owner KO Prize physical custody observer',()=>{
  const observed = withOwnerKoPrizeSettlementEvidence(
    ()=>runOwnerPokemonAba());
  const {result:panel,audit} = observed;
  assert.equal(audit.version,VERSION);
  assert.equal(panel.sourceTrialIds.length,8);
  assert.equal(panel.totalRegisteredNativeAttempts,24);
  assert.equal(panel.baselineReplayVerdict,
    'PASS-bounded-protected-opening-A-A-control');
  assert.equal(panel.certifiedPaperGames,0);
  assert.equal(audit.competitivelyQualifiedGames,0);
  assert.equal(audit.chosenPrizeFacesReadByPolicy,false);
  assert.equal(audit.knockoutSourceOriginFullyCertified,false);
  assert.equal(audit.opponentPrizeRedirectionPaperCertified,false);

  // The observer sees only prompts genuinely offered by the live Store.
  // Preserve zero-opportunity and all engine-error/nonterminal rows.
  assert.equal(audit.observedKoShapedSelections,
    audit.nativeResolved+audit.nativeUnresolved+audit.nativeRejected);
  assert.equal(audit.records.length+audit.recordsOmitted,
    audit.nativeResolved);
  assert.ok(audit.exactOwnerHandTransfers +
    audit.exactOwnerLostZoneTransfers +
    audit.otherOrUnverifiedDestinations <= audit.nativeResolved);

  const receipt = {
    schema:VERSION,
    provenance:{
      researchCommit:process.env.GITHUB_SHA??null,
      githubRun:process.env.GITHUB_RUN_ID??null,
      observerSha256:sha256(fs.readFileSync(path.join(ROOT,
        'simulation/twinleaf/agent3-owner-ko-prize-settlement-evidence.cjs'))),
      nativeTestSha256:sha256(fs.readFileSync(__filename)),
      v14SourceSha256:sha256(fs.readFileSync(path.join(ROOT,
        'simulation/evaluation/agent3-issue25-v14-owner-pokemon-aba.cjs'))),
      revisedSelectorSourceSha256:sha256(fs.readFileSync(path.join(ROOT,
        'simulation/twinleaf/agent21-owner-first-prize-reveal.cjs'))),
      pinnedVendorExpected:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05'
    },
    registeredTrialIds:panel.sourceTrialIds,
    registeredNativeAttempts:panel.totalRegisteredNativeAttempts,
    matchedSourcePhysicalDeals:panel.equalAllThreePhysicalSourceDealRows,
    controlsIdentical:panel.equalControlPublicRootAndStatusRows,
    controlReplay:panel.baselineReplayVerdict,
    originalDispositionRows:panel.rows,
    koShapedPrizeAudit:audit,
    anyPaperQualified:false,
    provenFieldWinRate:null
  };
  const dir=process.env.AGENT3_V16_PRIZE_RECEIPT_DIR;
  const archive=dir?saveReceipt(receipt,dir):null;
  console.log('AGENT3_V16_OWNER_KO_PRIZE_NATIVE',
    JSON.stringify({registered:panel.totalRegisteredNativeAttempts,
      sourceTrialIds:panel.sourceTrialIds,
      controlsIdentical:panel.equalControlPublicRootAndStatusRows,
      sourcePhysicalDealEquality:panel.equalAllThreePhysicalSourceDealRows,
      eligibleKoShapedChoices:audit.observedKoShapedSelections,
      resolved:audit.nativeResolved,unresolved:audit.nativeUnresolved,
      exactHandTransfers:audit.exactOwnerHandTransfers,
      exactLostZoneTransfers:audit.exactOwnerLostZoneTransfers,
      otherDestinations:audit.otherOrUnverifiedDestinations,
      bySeat:audit.bySeat,qualifiedGames:0,archive}));
});
