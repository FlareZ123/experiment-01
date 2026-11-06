'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json');

const VERSION='agent36-prospective-v8-original-field-native-census-v1';
const ARCHIVE='issue25-steward-v8.json';
const ROOT=path.resolve(__dirname,'../..');
const sha256=b=>createHash('sha256').update(b).digest('hex');

/**
 * Read authentic pre-registered native v8 attempts without invoking the game.
 * Preserve unknown post-abort outcomes, separate declarations and settlements,
 * and never attribute legal competitive wins to these bounded Store trials.
 * @param {Buffer} bytes
 * @param {string} sidecar
 * @param {string|null} [expectedDigest] Pinned once the original CI was observed.
 * @returns {object}
 */
function inspect(bytes,sidecar,expectedDigest=null){
  assert.ok(Buffer.isBuffer(bytes));
  const digest=sha256(bytes);
  assert.equal(sidecar,digest+'  '+ARCHIVE+'\n');
  if(expectedDigest!==null)assert.equal(digest,expectedDigest);
  const source=JSON.parse(bytes.toString('utf8'));
  const expectedIds=registration.trials.map(x=>x.id);
  const manifest=source.actuallyExecutingManifest;
  assert.equal(manifest?.version,
    'agent36-issue25-broader-four-rank-prospective-v8-128root');
  assert.equal(manifest?.nativeRootActionLimit,128);
  assert.equal(manifest?.releaseQualified,false);
  assert.equal(manifest?.competitiveGamesQualified,0);
  assert.equal(source.qualifiedCompetitiveGames,0);
  assert.equal(source.registration?.exactJoinedByTrialId,true);
  assert.equal(source.registration?.registeredReconciliation?.exactUniqueMatch,true);
  assert.deepEqual([...source.registration.expectedIds].sort(),
    [...expectedIds].sort());
  const returned=source.attempts??[];
  assert.equal(returned.length,8);
  const seen=new Set();
  const rows=returned.map(row=>{
    assert.ok(expectedIds.includes(row.id)&&!seen.has(row.id),
      'Returned ID missing, repeated, or not preregistered');
    seen.add(row.id);
    const registered=registration.trials.find(x=>x.id===row.id);
    const expectedSourceSeat=registered.candidateSlot==='A'?1:0;
    const sourceSeat=row.originalSourceSeat??
      row.nativeAbortProvenance?.sourceSeat??null;
    if(sourceSeat!==null)assert.equal(sourceSeat,expectedSourceSeat,
      'Conflicting native source physical seat');
    const verifiedSourceSeat=sourceSeat===expectedSourceSeat;
    const candidateSeat=row.candidateSeat??
      row.nativeAbortProvenance?.candidateSeat??null;
    if(candidateSeat!==null)assert.equal(candidateSeat,1-expectedSourceSeat);
    const roots=row.publicRootActions;
    const complete=Array.isArray(roots)&&
      row.publicRootActionsTruncated===false&&
      row.publicRootActionCount===roots.length&&
      roots.length<=128&&
      roots.every((x,i)=>x.actionOrdinal===i)&&
      row.publicRootLedgerSha256Computed===
        sha256(Buffer.from(JSON.stringify(roots)));
    const settled=row.actualSourceAttackSettlement?.attacks??null;
    const sourceAttackRoots=complete?roots.filter(x=>
      x.playerSlot===expectedSourceSeat&&x.action==='AttackAction')
      .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,
        attack:x.attack??null})):null;
    // Store attack declarations are event-origin independent. A copied attack
    // may begin with UseAbilityAction rather than AttackAction (Perfection).
    // Headless builds the attack settlement from its Store declaration trace.
    // Aborted rows without that trace remain unknown, never inferred zero.
    const sourceStoreAttackDeclarations=Array.isArray(settled)?
      settled.map(a=>({
        originatingActionOrdinal:a.actionOrdinal??null,
        attack:a.attackName??null,
        source:'real-Store attackDeclarationTrace',
        settledPromptChain:a.settledPromptChain===true
      })):null;
    const sourceSettlements=Array.isArray(settled)?settled.map(a=>{
      const pre=a.publicBoardBefore?.[expectedSourceSeat]??null;
      const post=a.publicBoardAfter?.[expectedSourceSeat]??null;
      const enemyPre=a.publicBoardBefore?.[1-expectedSourceSeat]??null;
      const enemyPost=a.publicBoardAfter?.[1-expectedSourceSeat]??null;
      return {
        ordinal:a.actionOrdinal,attack:a.attackName,
        publicSettlement:a.settledPromptChain===true,
        crossedGameEpoch:a.settlementCrossesClockReset===true,
        sourceActiveEnergyBefore:pre?.active?.energyCards??null,
        sourceActiveEnergyAfter:post?.active?.energyCards??null,
        sourceBenchEnergyAfter:post?.bench?.map(x=>x?.energyCards??null)??null,
        enemyActiveBefore:enemyPre?.active?.name??null,
        enemyDamageBefore:enemyPre?.active?.damage??null,
        enemyDamageAfter:enemyPost?.active?.damage??null,
        prizeBefore:a.prizesBefore??null,
        prizeAfter:a.prizesAfter??null,
        nextOpponentRoot:a.nextSourceRoot??null,
        nextOpponentSameEpochCertified:a.nextSourceSameEpochProven===true
      };
    }):null;
    return {
      id:row.id,rank:registered.rank,sourceSeat:expectedSourceSeat,
      actualSourceSeatAuthenticated:verifiedSourceSeat,
      candidateSeatAuthenticated:candidateSeat!==null,
      candidateId:registered.candidateId,
      nativeDisposition:row.rawDisposition??null,
      nativeWinner:row.finalNativeWinner??null,
      acceptedRoots:row.publicRootActionCount??null,
      publicRootHashPass:complete,
      sourceOpeningFingerprint:row.sourceDealFingerprint??null,
      entirePhysicalOpeningFingerprint:row.fullPhysicalDealFingerprint??null,
      // Legacy compatibility name: counts only accepted AttackAction roots.
      sourceAttackRoots,
      sourceStoreAttackDeclarations,
      settledSourceAttackCount:Array.isArray(sourceSettlements)?
        sourceSettlements.filter(a=>a.publicSettlement).length:null,
      actualAttackSettlements:sourceSettlements,
      sourcePasses:complete?roots.filter(x=>
        x.playerSlot===expectedSourceSeat&&
        x.action==='PassTurnAction').length:null,
      sourceNonpassNonprompt:complete?roots.filter(x=>
        x.playerSlot===expectedSourceSeat&&
        x.action!=='PassTurnAction'&&
        x.action!=='ResolvePromptAction').length:null,
      abortReason:row.nativeFailure??null,
      abortAt:row.abortActionOrdinal??null,
      abortType:row.abortActionName??null,
      abortPrompt:row.abortPendingPrompt??null,
      competitiveGameQualified:false
    };
  });
  assert.equal(seen.size,expectedIds.length);
  assert.ok(rows.every(row=>row.publicRootHashPass));
  const n=(filter)=>rows.filter(filter).length;
  return {
    schema:VERSION,artifactSha256:digest,
    runId:source.provenance?.githubRunId??null,
    pinnedTwinleaf:source.provenance?.observedTwinleafCommit??null,
    registration:'results/aichi-2026/registrations/agent36-issue25-common-v8-broader-prospective-20261106.json',
    registeredAttempts:8,actualAttempts:rows.length,
    allNativeRootLedgersDigestVerified:true,
    originalRanks:[1,3,6,11],
    fatalEngineAbortCount:n(x=>x.nativeDisposition==='engine-error'),
    hitNativeRoot128Count:n(x=>x.acceptedRoots===128),
    returnedNativeTerminalCount:n(x=>
      x.nativeDisposition==='finished'||x.nativeDisposition==='native-terminal'),
    // Explicitly distinguish root-action shape from real Store declarations.
    sourceAcceptedAttackActionRoots:rows.reduce((sum,x)=>
      sum+(x.sourceAttackRoots?.length??0),0),
    sourceRealStoreAttackDeclarationsKnown:rows.reduce((sum,x)=>
      sum+(x.sourceStoreAttackDeclarations?.length??0),0),
    sourceRealStoreAttackDeclarationsUnknownRows:
      n(x=>x.sourceStoreAttackDeclarations===null),
    sourceSettledAttacksKnown:rows.reduce((sum,x)=>
      sum+(x.settledSourceAttackCount??0),0),
    sourceSettledAttacksUnknownInAborted:
      n(x=>x.settledSourceAttackCount===null),
    sameEpochOpponentReplies:rows.reduce((sum,x)=>
      sum+(x.actualAttackSettlements?.filter(a=>
        a.publicSettlement&&a.nextOpponentSameEpochCertified).length??0),0),
    rows,competitiveGameQualifiedCount:0,
    estimatedWinRate:null,
    verdict:'FAIL-development-only-paper-clock-and-competence-unverified'
  };
}
function auditExisting(root=ROOT){
  const dir=path.join(root,'archives','v8');
  return inspect(
    fs.readFileSync(path.join(dir,ARCHIVE)),
    fs.readFileSync(path.join(dir,'issue25-steward-v8.sha256'),'utf8')
  );
}
if(require.main===module)
  process.stdout.write('AGENT36_V8_INDEPENDENT_CENSUS '+
    JSON.stringify(auditExisting())+'\n');
module.exports={VERSION,ARCHIVE,inspect,auditExisting};
