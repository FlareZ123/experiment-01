'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SCHEMA = 'aichi-native-allroot-independent-paper-review-worklist-v1';
const ARCHIVE = {
  workflowRun: 42577136715,
  artifactId: 13655243326,
  zipSha256: '324fbc141c2464715b689c23db4319d8858f873fbcf8855d0aba1b3496fc6f61',
  innerFilename: 'agent8-source-mew-funding-v6.json',
  innerSha256: '84d4e157822605dfa4eef12660328fc403a1da766e36acdb00520a549d96d5f0',
  phase: 'P0S1',
  trialId: '5:3605:B:new-moon-lockbreaker-v1',
  expectedRootLedgerSha256: '111e5c2a8d8c1b4f10341283fc51011cd87620e7bc498d7c7de3471ae5d2bc56'
};
const ROOT_PAPER_REVIEW_FIELDS = [
  'paperLegalityReviewed', 'paymentsVerified', 'targetsAndTransitionsVerified',
  'ownerInformationOnly', 'physicalCustodyVerified', 'independentlyReviewed'
];
const MATERIAL = new Set([
  'AttackAction', 'PlayCardAction', 'RetreatAction', 'UseAbilityAction',
  'UseTrainerAbilityAction', 'UseEnergyAbilityAction', 'UseStadiumAction'
]);

/** @param {unknown} v @returns {string} */
function sha256Json(v) {
  return createHash('sha256').update(JSON.stringify(v)).digest('hex');
}

/** @param {object[]} objects @param {(e:object)=>number} keyFn @returns {Map<number,object>} */
function uniqueIndex(objects,keyFn) {
  const result = new Map();
  for (const entry of objects) {
    const key = keyFn(entry);
    assert.ok(Number.isSafeInteger(key) && key >= 0, 'Invalid evidence root');
    assert.ok(!result.has(key), 'Duplicate native evidence root');
    result.set(key,entry);
  }
  return result;
}

/**
 * Generate a factual native inventory with NO assumed paper legality and
 * NO owner-secret routing into the candidate/opponent's runtime policy.
 * @param {object} row Frozen raw native trial; read-only.
 * @param {object} archive Registered artifact and trial provenance.
 * @returns {object}
 */
function build(row, archive) {
  assert.equal(row?.trial?.id, archive.trialId);
  assert.ok(Array.isArray(row.rootActionLedger));
  const roots = row.rootActionLedger;
  assert.equal(sha256Json(roots),row.rootActionLedgerSha256);
  if (archive.expectedRootLedgerSha256)
    assert.equal(row.rootActionLedgerSha256,archive.expectedRootLedgerSha256);

  const targetSidecar = row.nativeAcceptedTargetSidecar;
  const choicesSidecar = row.nativePromptChoices;
  assert.ok(Array.isArray(targetSidecar?.events));
  assert.ok(Array.isArray(choicesSidecar?.events));
  const targets = uniqueIndex(targetSidecar.events,e => e.rootActionOrdinal);
  const choices = uniqueIndex(choicesSidecar.events,e => e.ordinal);
  const attackMap = new Map();
  for (const channel of ['sourceAttackSettlement','candidateAttackSettlement']) {
    for (const attack of row[channel]?.attacks ?? []) {
      assert.ok(!attackMap.has(attack.actionOrdinal), 'Duplicate attack evidence');
      attackMap.set(attack.actionOrdinal,attack);
    }
  }

  let observedTargets=0, observedChoices=0, matchedSettlements=0;
  const rows = roots.map((root,index) => {
    assert.equal(root.actionOrdinal,index,'Noncontiguous root ledger');
    assert.ok(root.playerSlot===0||root.playerSlot===1);
    if (index) assert.ok(root.turnBefore>=roots[index-1].turnBefore,
      'Time regressed across accepted roots');
    const target=targets.get(index);
    const choice=choices.get(index);
    const settled=attackMap.get(index);
    if (target) {
      assert.equal(root.action,target.action);
      assert.equal(root.playerSlot,target.playerSlot);
      assert.equal(root.turnBefore,target.turnBefore);
      assert.equal(target.storeAccepted,true);
      observedTargets++;
    }
    if (choice) {
      assert.equal(root.action,'ResolvePromptAction');
      assert.equal(root.pendingPrompt,choice.kind);
      assert.equal(root.playerSlot,choice.actorSeat);
      observedChoices++;
    }
    if (settled) {
      assert.equal(root.action,settled.triggerAction);
      assert.equal(root.turnBefore,settled.turnBefore);
      assert.equal(settled.settledPromptChain,true);
      assert.ok(settled.completionRootOrdinal>=index);
      assert.ok(settled.completionRootOrdinal<roots.length);
      matchedSettlements++;
    }
    const sourceOrCandidate = root.playerSlot === row.sourceSeat ?
      'original-source':'fixed-contender';
    const required = MATERIAL.has(root.action) ?
      ['printed-effect-and-payment','owner-affordable-choice-scan',
       'physical-zone-transfer','paper-legal-targets','opponent-counterplay'] :
      root.action === 'ResolvePromptAction' ?
        ['printed-prompt-choice','owner-information-restrictions',
         'prompt-payment-and-physical-zone-transfer'] :
        ['owner-visible-remaining-affordable-actions',
         'paper-legal-pass-and-next-turn-consequence'];
    return {
      ordinal:index,turnBefore:root.turnBefore,playerSeat:root.playerSlot,
      actorRole:sourceOrCandidate,action:root.action,
      card:root.card??null,attack:root.attack??null,
      pendingPrompt:root.pendingPrompt??null,
      initiatingRootActionOrdinal:root.initiatingRootActionOrdinal??null,
      targetNativeEvidence:target?{
        declared:target.declared??null,
        publicBoardChanges:target.publicBoardChanges??null,
        nativeStoreAccepted:true
      }:null,
      ownerPromptNativeEvidence:choice?{
        kind:choice.kind,sourceZone:choice.sourceZone??null,
        sourcePlayerSlot:choice.sourcePlayerSlot??null,
        selectionCount:Array.isArray(choice.selectedCards)?
          choice.selectedCards.length:null,
        evidencePresent:true,
        ownerPrivateRetrospectiveAuditOnly:true
      }:null,
      settledAttackNativeEvidence:settled?{
        attackName:settled.attackName,
        completionRootOrdinal:settled.completionRootOrdinal,
        settledPromptChain:true,
        prizesBefore:settled.prizesBefore??null,
        prizesAfter:settled.prizesAfter??null,
        independentPaperAttackAudit:false
      }:null,
      reviewNeeded:required,
      paperReviewDisposition:'unreviewed',
      // This packet is an assignment queue. All true claims must come
      // from separately issued signed independent review after inspection.
      independentReceipt:null
    };
  });
  for (const idx of [...targets.keys(),...choices.keys(),...attackMap.keys()])
    assert.ok(idx<roots.length,'Evidence refers outside the native root tape');
  const actionCounts={};
  for(const root of roots) actionCounts[root.action]=(actionCounts[root.action]??0)+1;
  const sourceSettlement=row.sourceAttackSettlement?.attacks??[];
  const contenderSettlement=row.candidateAttackSettlement?.attacks??[];
  return {
    schema:SCHEMA,sourceArchive:archive,trialId:row.trial.id,
    sourceSeat:row.sourceSeat,candidateSeat:row.candidateSeat,
    sourceDealFingerprint:row.sourceDealFingerprint,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
    ledgerSha256:row.rootActionLedgerSha256,
    totalAcceptedNativeRoots:roots.length,
    nativeSummary:{
      actionCounts,sourceSettledAttacks:sourceSettlement.length,
      contenderSettledAttacks:contenderSettlement.length,
      observedNativeTargetActions:observedTargets,
      observedNativePromptChoices:observedChoices,
      observedNativeAttackSettlementAnchors:matchedSettlements,
      sourceAttackPrizesTaken:sourceSettlement.reduce((sum,a)=>
        sum+Math.max(0,(a.prizesBefore?.[row.sourceSeat]??0)-
          (a.prizesAfter?.[row.sourceSeat]??0)),0),
      contenderAttackPrizesTaken:contenderSettlement.reduce((sum,a)=>
        sum+Math.max(0,(a.prizesBefore?.[row.candidateSeat]??0)-
          (a.prizesAfter?.[row.candidateSeat]??0)),0),
      nativeFinished:row.finished===true,nativeWinner:row.winner??null,
      nativeFinalPrizes:row.finalPrizes??null,
      nativePhysicalIntegrityQualified:
        row.physicalZoneQualification?.physicalIntegrityQualified===true
    },
    reviews:{independentFullRootReceipts:0,
      independentlyReviewedPaperWin:false,
      independentlyReviewedOfficialClock:false,
      independentlyReviewedOpponentPolicy:false,
      competitiveGameQualified:false},
    limitations:[
      'Native Store acceptance alone cannot prove printed Japanese paper legality.',
      'Native target and choice sidecars are selective evidence, not complete physical owner custody.',
      'Owner prompt evidence remains a retrospective review record and cannot enter opponent policy.',
      'No missing evidence may be reconstructed as a positive independent reviewer signature.',
      'The original native game has no independently verified match-stage clock.'
    ],
    roots:rows
  };
}

/** @param {object} archiveJson @param {object} [archive] */
function fromArchive(archiveJson,archive=ARCHIVE) {
  const phaseRows=archiveJson?.rawNativeRows?.[archive.phase];
  assert.ok(Array.isArray(phaseRows));
  const matching=phaseRows.filter(row=>row.trial?.id===archive.trialId);
  assert.equal(matching.length,1,'Exact registered trial required');
  return build(matching[0],archive);
}

/**
 * Atomic exclusive output. This helper never edits, tags or authenticates
 * the underlying trial's original raw native artifact.
 * @param {string} destination
 * @param {object} payload
 */
function writeAtomicLocked(destination,payload) {
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  const lock=destination+'.lock';
  const fd=fs.openSync(lock,'wx',0o600);
  const tmp=destination+'.tmp.'+process.pid;
  try {
    fs.writeFileSync(tmp,JSON.stringify(payload,null,2)+'\n',{flag:'wx'});
    const out=fs.openSync(tmp,'r');
    try {fs.fsyncSync(out);} finally {fs.closeSync(out);}
    fs.renameSync(tmp,destination);
  } finally {
    if(fs.existsSync(tmp)) fs.unlinkSync(tmp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

if (require.main===module) {
  assert.equal(process.argv.length,4,
    'Expected archived raw native JSON input and output review-worklist path');
  const archiveJson=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  writeAtomicLocked(process.argv[3],fromArchive(archiveJson));
}

module.exports={SCHEMA,ARCHIVE,ROOT_PAPER_REVIEW_FIELDS,
  build,fromArchive,writeAtomicLocked};
