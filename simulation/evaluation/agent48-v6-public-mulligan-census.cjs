'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');

const VERSION='agent48-actual-setup-mulligan-v6-public-census-v1';
const HEX=/^[0-9a-f]{64}$/;
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Record the actual first-root setup prompt sequence in an authenticated
 * native row. A bare SelectPrompt has no printed choice payload, so it
 * cannot prove the owner selected or physically drew bonus cards.
 *
 * @param {object} row Raw archived native attempt with full Store public roots.
 * @param {object} trial Immutable predeclared rank/seed/slot/candidate.
 * @returns {object} Exact prompt census without concealed cards or win claims.
 */
function auditActualSetupRow(row,trial) {
  assert.equal(row?.id,trial?.id,'Archived trial is not registered ID');
  const expectedSourceSeat=trial.candidateSlot==='A'?1:0;
  assert.ok(row.status && typeof row.status==='string');
  assert.ok(Array.isArray(row.publicRootActions));
  assert.equal(row.publicRootActionsTruncated,false,
    'Actual source public root tape is truncated');
  assert.equal(row.nativeRootActionCount,row.publicRootActions.length);
  assert.ok(HEX.test(row.publicRootLedgerSha256Computed),
    'Missing native public ledger digest');
  assert.equal(sha(row.publicRootActions),
    row.publicRootLedgerSha256Computed,'Raw public root ledger hash mismatch');
  assert.equal(row.publicRootLedgerDigestConsistent,true,
    'Original Store ledger and archive sidecar disagree');
  const sourceSeat=row.originalSourceSeat===expectedSourceSeat?
    expectedSourceSeat:row.originalSourceSeat===null&&
    row.nativeAbortProvenance?.sourceSeat===expectedSourceSeat&&
    row.nativeAbortProvenance?.sourceDealStatus==='VERIFIED'?
      expectedSourceSeat:null;
  const starts=[0,0];
  const allShuffles=[0,0];
  const selects=[];
  const pregameActions=[];
  for(const root of row.publicRootActions){
    if(root.turnBefore!==0)break;
    pregameActions.push(root);
    assert.ok(root.playerSlot===0||root.playerSlot===1);
    if(root.action!=='ResolvePromptAction')continue;
    if(root.pendingPrompt==='ShuffleDeckPrompt'){
      allShuffles[root.playerSlot]++;
    }else if(root.pendingPrompt==='SelectPrompt'){
      selects.push(root.playerSlot);
    }
  }
  for(let seat=0;seat<=1;seat++){
    assert.ok(allShuffles[seat]>=1,'Missing initial player shuffle');
    starts[seat]=allShuffles[seat]-1;
  }
  const offered=[Math.max(0,starts[1]-starts[0]),
    Math.max(0,starts[0]-starts[1])];
  assert.ok(HEX.test(row.sourceDealFingerprint),
    'Missing source first-stable physical deal fingerprint');
  assert.ok(HEX.test(row.fullPhysicalDealFingerprint),
    'Missing complete two-player first-stable deal fingerprint');
  assert.equal(row.verifiedFirstTurn,true);
  assert.ok(row.actualStarterSeat===0||row.actualStarterSeat===1);
  return {
    id:trial.id,rank:trial.rank,candidateSlot:trial.candidateSlot,
    candidateId:trial.candidateId,sourceSeat,
    nativeStatus:row.status,fullLedgerSha256:sha(row.publicRootActions),
    setupPublicRootCount:pregameActions.length,
    actualShufflePromptCounts:allShuffles,
    inferredMulliganCounts:starts,
    mechanicallyOfferedBonusCounts:offered,
    observedBareSelectPromptSeats:selects,
    bonusChoiceAndPhysicalDrawVerified:false,
    sourceDealFingerprint:row.sourceDealFingerprint,
    fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
    actualStarterSeat:row.actualStarterSeat,
    gameQualified:false
  };
}

/**
 * Audit complete authentic v6 archived register. Original slots and
 * disposition are fixed before paired statuses are inspected; unmatched
 * natural-game attempts stay registered.
 *
 * @param {object} registration Agent1's frozen eight-trial manifest.
 * @param {object} archive ZIP's original issue25-mirrored-v6.json content.
 */
function auditActualMirroredV6Setup(registration,archive) {
  assert.equal(registration.schema,
    'agent1-issue25-mirrored-original-source-r6-r11-v1');
  assert.equal(registration.trialCount,8);
  assert.equal(registration.trials.length,8);
  assert.equal(archive.registration?.registeredReconciliation?.exactUniqueMatch,
    true);
  assert.equal(archive.registration?.rawRowReconciliation?.exactlyReconciled,
    true);
  assert.equal(archive.attempts?.length,8);
  assert.equal(archive.provenance?.observedTwinleafCommit,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  const observed=new Map(), registered=new Map();
  for(const trial of registration.trials){
    assert.ok(!registered.has(trial.id));
    registered.set(trial.id,trial);
  }
  for(const row of archive.attempts){
    assert.ok(registered.has(row.id),'Unregistered native result');
    assert.ok(!observed.has(row.id),'Duplicate native result');
    observed.set(row.id,row);
  }
  assert.equal(registered.size,observed.size);
  const attempts=[...registered.values()].map(trial=>
    auditActualSetupRow(observed.get(trial.id),trial));
  const groups=new Map();
  for(const row of attempts){
    const key=[row.rank,row.candidateSlot].join(':');
    if(!groups.has(key))groups.set(key,[]);
    groups.get(key).push(row);
  }
  const pairs=[...groups].map(([id,rows])=>{
    assert.equal(rows.length,2);
    const candidates=new Set(rows.map(row=>row.candidateId));
    assert.deepEqual([...candidates].sort(),
      ['champion-reference','new-moon-lockbreaker-v1'].sort());
    const [a,b]=rows;
    return {id,sourceSeat:a.sourceSeat,sourceSeatCertified:
        a.sourceSeat!==null&&a.sourceSeat===b.sourceSeat,
      sourceDealParity:a.sourceDealFingerprint===b.sourceDealFingerprint?
        'MATCHED':'MISMATCHED',
      fullPhysicalDealParity:
        a.fullPhysicalDealFingerprint===b.fullPhysicalDealFingerprint?
        'MATCHED':'MISMATCHED',
      starterParity:a.actualStarterSeat===b.actualStarterSeat?
        'MATCHED':'MISMATCHED',
      pretreatmentMulliganCountsByCandidate:rows.map(row=>({
        candidateId:row.candidateId,mulligans:row.inferredMulliganCounts,
        offeredBonus:row.mechanicallyOfferedBonusCounts,
        bareSelectPromptSeats:row.observedBareSelectPromptSeats
      })),
      primaryNaturalPopulationBothArmsRetained:true,
      candidateComparisonConditionalOnPhysicalOpeningOnly:true
    };
  });
  return {
    version:VERSION,artifactProvenance:{
      nativeRunId:archive.provenance.githubRunId,
      nativeCommit:archive.provenance.githubCommit,
      pinnedTwinleaf:archive.provenance.observedTwinleafCommit
    },
    primaryNaturalGamePopulationRetained:attempts.length,
    attempted:attempts,comparisonGroups:pairs,
    actualOriginalSourceDealMismatches:pairs.filter(x=>
      x.sourceDealParity==='MISMATCHED').length,
    sourceMulliganCausationClaim:'UNVERIFIED_SELECTED_DRAW_AND_RNG',
    competitivelyQualifiedGames:0
  };
}
module.exports={VERSION,auditActualSetupRow,auditActualMirroredV6Setup};
