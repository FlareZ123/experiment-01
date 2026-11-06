'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const registration=require('../../results/aichi-2026/registrations/agent36-issue25-common-v6-96root-20261106.json');

const VERSION='agent36-prospective-v6-archive-eight-attempt-source-payoff-audit-v1';
const NAME='issue25-steward-v6.json';
const ROOT=path.resolve(__dirname,'../..');
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

/**
 * Pure, read-only audit of a completed native archive, with no match replay.
 * Every error and capped arm remains in the denominator. This report cannot
 * make a paper legality or competitive win-rate claim.
 * @param {Buffer} bytes Original locked atomic JSON.
 * @param {string} sidecar Original locked atomic SHA256 line.
 * @returns {object}
 */
function inspect(bytes,sidecar){
  assert.ok(Buffer.isBuffer(bytes));
  const digest=sha256(bytes);
  assert.equal(sidecar,digest+'  '+NAME+'\n',
    'Native v6 artifact checksum mismatch');
  const archive=JSON.parse(bytes.toString('utf8'));
  assert.equal(archive.actuallyExecutingManifest?.version,
    'agent36-issue25-common-owner-root-v6-prospective-96');
  assert.equal(archive.actuallyExecutingManifest?.nativeRootActionLimit,96);
  assert.equal(archive.actuallyExecutingManifest?.competitiveGamesQualified,0);
  assert.equal(archive.actuallyExecutingManifest?.releaseQualified,false);
  assert.equal(archive.qualifiedCompetitiveGames,0);
  assert.equal(archive.registration?.registeredReconciliation?.exactUniqueMatch,true);
  assert.equal(archive.registration?.exactJoinedByTrialId,true);
  const expected=registration.trials.map(x=>x.id);
  assert.deepEqual([...archive.registration.expectedIds].sort(),
    [...expected].sort());
  const attempts=archive.attempts;
  assert.equal(attempts?.length,8);
  const seen=new Set();
  const rows=[];
  for(const row of attempts){
    assert.ok(expected.includes(row.id),'Unregistered trial: '+row.id);
    assert.ok(!seen.has(row.id),'Duplicate return: '+row.id);
    seen.add(row.id);
    const nativeRoots=row.publicRootActions;
    const sourceSeat=row.originalSourceSeat;
    const recordedOtherSeat=row.candidateSeat;
    assert.ok(sourceSeat===0||sourceSeat===1,
      'Missing real source physical seat: '+row.id);
    const otherSeat=1-sourceSeat;
    assert.ok(recordedOtherSeat===null||recordedOtherSeat===otherSeat,
      'Contradictory native candidate physical seat: '+row.id);
    const rootsOk=Array.isArray(nativeRoots)&&
      row.publicRootActionsTruncated===false&&
      row.publicRootActionCount===nativeRoots.length&&
      row.publicRootLedgerSha256Computed===
        sha256(Buffer.from(JSON.stringify(nativeRoots)))&&
      nativeRoots.every((r,i)=>r.actionOrdinal===i)&&
      nativeRoots.length<=96;
    const sourceAttackRoots=rootsOk?nativeRoots.filter(r=>
      r.playerSlot===sourceSeat&&r.action==='AttackAction').map(r=>({
        ordinal:r.actionOrdinal,turn:r.turnBefore,
        attack:r.attack??null
      })):null;
    const sourceSettlements=row.actualSourceAttackSettlement?.attacks??null;
    const sourceAttacks=Array.isArray(sourceSettlements)?
      sourceSettlements.map(a=>{
        const before=a.publicBoardBefore?.[1-sourceSeat]?.active??null;
        const after=a.publicBoardAfter?.[1-sourceSeat]?.active??null;
        const opponentRoot=a.nextSourceRoot??null;
        const returnRoot=rootsOk?nativeRoots.find(r=>
          r.playerSlot===sourceSeat&&r.turnBefore>=a.turnBefore+2&&
          r.action!=='ResolvePromptAction'&&
          r.actionOrdinal>(opponentRoot?.ordinal??a.actionOrdinal)
        )??null:null;
        return {
          ordinal:a.actionOrdinal,turn:a.turnBefore,
          name:a.attackName,settled:a.settledPromptChain===true,
          resetCrossed:a.settlementCrossesClockReset===true,
          completionOrdinal:a.completionRootOrdinal,
          opponentActiveBefore:before?.name??null,
          opponentActiveDamageBefore:before?.damage??null,
          opponentActiveDamageAfter:after?.damage??null,
          prizeBefore:a.prizesBefore??null,prizeAfter:a.prizesAfter??null,
          opponentActionImmediatelyAfter:opponentRoot,
          sameEpochOpponentRootProven:a.nextSourceSameEpochProven===true,
          nextOwnerVoluntaryRoot:returnRoot?{
            ordinal:returnRoot.actionOrdinal,
            turn:returnRoot.turnBefore,action:returnRoot.action,
            attack:returnRoot.attack??null,card:returnRoot.card??null
          }:null
        };
      }):null;
    const rootCensus=rootsOk?{
      sourcePass:nativeRoots.filter(x=>
        x.playerSlot===sourceSeat&&x.action==='PassTurnAction').length,
      sourceNonpass:nativeRoots.filter(x=>
        x.playerSlot===sourceSeat&&x.action!=='PassTurnAction'&&
        x.action!=='ResolvePromptAction').length,
      opponentPass:nativeRoots.filter(x=>
        x.playerSlot===otherSeat&&x.action==='PassTurnAction').length,
      opponentNonpass:nativeRoots.filter(x=>
        x.playerSlot===otherSeat&&x.action!=='PassTurnAction'&&
        x.action!=='ResolvePromptAction').length
    }:null;
    rows.push({
      id:row.id,sourceSeat,
      opponentSeat:otherSeat,
      candidateSeatDirectlyAuthenticated:recordedOtherSeat!==null,
      nativeDisposition:row.rawDisposition??row.status??null,
      abortActionOrdinal:row.abortActionOrdinal??null,
      abortActionName:row.abortActionName??null,
      abortPendingPrompt:row.abortPendingPrompt??null,
      abortFailureStage:row.abortFailureStage??null,
      lastPublicRoot:rootsOk&&nativeRoots.length>0?{
        ordinal:nativeRoots.at(-1).actionOrdinal,
        turn:nativeRoots.at(-1).turnBefore,
        seat:nativeRoots.at(-1).playerSlot,
        action:nativeRoots.at(-1).action,
        card:nativeRoots.at(-1).card??null,
        attack:nativeRoots.at(-1).attack??null,
        pendingPrompt:nativeRoots.at(-1).pendingPrompt??null
      }:null,
      nativeFinalWinner:row.finalNativeWinner??null,
      rootCount:row.publicRootActionCount,
      completeRootLedger:rootsOk,
      sourceOpeningSha:row.sourceDealFingerprint??null,
      fullOpeningSha:row.fullPhysicalDealFingerprint??null,
      nativeError:row.nativeFailure??null,
      roots:rootCensus,sourceAttackRoots,sourceAttacks,
      actualSourceAttackCount:
        Array.isArray(sourceAttacks)?sourceAttacks.length:null,
      settledSourceAttackCount:
        Array.isArray(sourceAttacks)?
          sourceAttacks.filter(x=>x.settled).length:null,
      qualifiedPaperGame:false
    });
  }
  assert.equal(seen.size,8);
  return {
    schema:VERSION,artifactSha256:digest,
    pinnedNativeGitlink:archive.provenance?.observedTwinleafCommit??null,
    observedWorkflowRun:archive.provenance?.githubRunId??null,
    sourceRegistration:'results/aichi-2026/registrations/agent36-issue25-common-v6-96root-20261106.json',
    allEightOriginalTrialsReconciled:true,
    allEightCompletePublicRootLedgers:rows.every(r=>r.completeRootLedger),
    sourceAttackRootTotal:rows.reduce((n,r)=>n+(r.sourceAttackRoots?.length??0),0),
    settledSourceAttackTotal:rows.reduce((n,r)=>n+(r.settledSourceAttackCount??0),0),
    rootCountTotal:rows.reduce((n,r)=>n+(r.rootCount??0),0),
    rows,qualifiedCompetitiveGames:0,estimatedWinRate:null,
    verdict:'FAIL-development-only-no-paper-clock-or-complete-policy-fidelity'
  };
}

/** @param {string} [root] Downloaded artifact directory in CI. */
function auditExisting(root=ROOT){
  const dir=path.join(root,'archives','v6');
  return inspect(fs.readFileSync(path.join(dir,NAME)),
    fs.readFileSync(path.join(dir,'issue25-steward-v6.sha256'),'utf8'));
}
if(require.main===module)
  process.stdout.write('AGENT36_V6_ARCHIVE_CENSUS '+
    JSON.stringify(auditExisting())+'\n');
module.exports={VERSION,NAME,inspect,auditExisting};
