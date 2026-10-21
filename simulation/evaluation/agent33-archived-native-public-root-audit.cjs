'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');

const SAFE_ROOT_FIELDS=new Set([
  'actionOrdinal','turnBefore','turnAfter','playerSlot','action',
  'pendingPrompt','initiatingRootActionOrdinal','card','ability',
  'attack','attackChoice'
]);
const SAFE_ATTACK_FIELDS=new Set([
  'printing','attackName','attackIndex','sourceIndex'
]);
const SHA=/^[0-9a-f]{64}$/;

/** @param {unknown} value */
function digest(value){
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/** @param {object} root @param {number} index */
function assertPublicRoot(root,index){
  assert.ok(root&&typeof root==='object'&&!Array.isArray(root));
  assert.equal(root.actionOrdinal,index,
    'Native Store roots must retain original 0-based ordinals');
  assert.ok(Number.isSafeInteger(root.turnBefore)&&root.turnBefore>=0);
  assert.ok(Number.isSafeInteger(root.turnAfter)&&root.turnAfter>=0);
  assert.ok(root.playerSlot===0||root.playerSlot===1);
  assert.ok(typeof root.action==='string'&&root.action.length>0);
  for(const field of Object.keys(root)){
    assert.ok(SAFE_ROOT_FIELDS.has(field),
      'Archive root includes nonpublic or unknown field '+field);
  }
  if(root.attackChoice!==undefined){
    assert.ok(root.attackChoice&&typeof root.attackChoice==='object'&&
      !Array.isArray(root.attackChoice));
    for(const field of Object.keys(root.attackChoice)){
      assert.ok(SAFE_ATTACK_FIELDS.has(field),
        'Archive attackChoice includes unknown field '+field);
    }
  }
}

/**
 * Independently verify a full post-dispatch public Store action ledger.
 * A native Sudden Death clock reset is explicitly identified and is never
 * silently merged into one physical-deal bilateral witness.
 *
 * @param {object} row Native canonical runner archive row
 * @returns {object} Diagnostic classification, never a win certificate
 */
function auditRow(row){
  assert.equal(row.rootActionLedgerProtocol,
    'actual-store-root-action-ledger-v1');
  assert.ok(Array.isArray(row.rootActionLedger));
  const roots=row.rootActionLedger;
  assert.equal(row.rootActionCount,roots.length);
  assert.ok(roots.length>0);
  assert.match(row.rootActionLedgerSha256,SHA);
  assert.equal(digest(roots),row.rootActionLedgerSha256,
    'Full native Store public action ledger digest differs from archive');
  const resets=row.suddenDeathClockResets??[];
  assert.ok(Array.isArray(resets));
  const reverse=[];
  for(let i=0;i<roots.length;i++){
    const r=roots[i];
    assertPublicRoot(r,i);
    if(i>0){
      assert.equal(r.turnBefore,roots[i-1].turnAfter,
        'Consecutive native roots must preserve their actual turn clock');
    }
    if(r.turnAfter<r.turnBefore)reverse.push({
      actionOrdinal:r.actionOrdinal,fromTurn:r.turnBefore,
      toTurn:r.turnAfter
    });
  }
  assert.equal(resets.length,reverse.length,
    'Native clock reversals require matching actual engine reset markers');
  for(const r of reverse){
    const match=resets.find(m=>m.actionOrdinal===r.actionOrdinal);
    assert.ok(match,'Missing native sudden-death marker for reset root');
    assert.equal(match.fromTurn,r.fromTurn);
    assert.equal(match.toTurn,r.toTurn);
    assert.equal(match.afterSuddenDeath,true);
    assert.equal(match.enteredSetup,true);
  }
  const episodes=row.sourceDealEpochs??null;
  let authenticatedPhysicalDealCount=0;
  if(episodes){
    assert.equal(episodes.recordedNativeRestarts,resets.length);
    assert.ok(Array.isArray(episodes.deals));
    assert.equal(episodes.recordedOpeningDeals,episodes.deals.length);
    assert.equal(episodes.allEpisodeOpeningsCaptured,true);
    assert.equal(episodes.deals.length,reverse.length+1);
    for(let i=0;i<episodes.deals.length;i++){
      const d=episodes.deals[i];
      assert.equal(d.episodeIndex,i);
      assert.match(d.sourceDealDigestSha256,SHA);
      assert.match(d.fullPhysicalDealDigestSha256,SHA);
      assert.equal(d.initialPrizeCounts.length,2);
      assert.deepEqual(d.initialPrizeCounts,[6,6]);
    }
    // Distinct original and replay Deal hashes are evidence of separately
    // shuffled physical openings. Neither one certifies paper tiebreaks.
    const hashes=episodes.deals.map(d=>d.fullPhysicalDealDigestSha256);
    assert.equal(new Set(hashes).size,hashes.length,
      'Native restart requires an independently identifiable physical deal');
    authenticatedPhysicalDealCount=episodes.deals.length;
    if(row.sourceDealFingerprint){
      assert.equal(episodes.deals[0].sourceDealDigestSha256,
        row.sourceDealFingerprint,'Initial source fingerprint mismatch');
    }
  }else{
    assert.equal(resets.length,0,
      'An actual native restart must have separately bound deal episodes');
  }
  return {
    trialId:row.trial?.id??null,
    rootCount:roots.length,
    rootSha256:row.rootActionLedgerSha256,
    reverseNativeClockRoots:reverse,
    visibleSourceDealEpochs:authenticatedPhysicalDealCount,
    singleEpisode:reverse.length===0,
    crossEpochBilateralAllowed:false,
    qualifiedCompetitiveGames:0,
    caveat:'Digest and publicly visible root chronology validated; no paper game/clock or decision-policy certification'
  };
}

/**
 * @param {object} archive Canonical bilateral four-arm result
 */
function auditArchive(archive){
  assert.ok(Array.isArray(archive.rows));
  assert.equal(archive.rows.length,archive.attempted);
  const rows=[],missing=[];
  for(const row of archive.rows){
    if(!Array.isArray(row.rootActionLedger)){
      missing.push({trialId:row.trial?.id??null,status:row.status??null});
    }else{
      rows.push(auditRow(row));
    }
  }
  return {
    schema:'agent33-canonical-archived-public-store-roots-audit-v1',
    attempted:archive.attempted,
    rootsVerified:rows.length,
    rowsWithoutFullRoots:missing,
    rows,
    replayedRows:rows.filter(r=>!r.singleEpisode).length,
    competitiveQualifiedGames:0
  };
}

if(require.main===module){
  assert.equal(process.argv.length,3,'Usage: node <script> <canonical-archive-json>');
  const report=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  process.stdout.write(JSON.stringify(auditArchive(report),null,2)+'\n');
}
module.exports={SAFE_ROOT_FIELDS,assertPublicRoot,auditRow,auditArchive,digest};
