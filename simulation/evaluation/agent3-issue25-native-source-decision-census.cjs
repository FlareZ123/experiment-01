'use strict';

const assert=require('node:assert/strict');
const {auditRootLedger}=require('./agent10-issue25-receipt-independent-audit.cjs');

const VERSION='agent3-issue25-native-source-decision-census-v1';
const ROOT_KINDS_EXCLUDED=new Set(['ResolvePromptAction','PassTurnAction']);

/**
 * Count actually Store-accepted source decisions from an independent public
 * native receipt. This is a behavioral observation, not a legal-action
 * opportunity census or evidence of competitive match strength.
 *
 * @param {object} receipt Archived v4/v5/v6 style public receipt.
 * @returns {object} Fail-closed action/turn-horizon audit and source census.
 */
function auditNativeSourceDecisions(receipt){
  assert.ok(receipt&&typeof receipt==='object');
  const manifest=receipt.actuallyExecutingManifest;
  const registration=receipt.registration;
  const attempts=receipt.attempts;
  assert.ok(manifest&&registration&&Array.isArray(attempts));
  assert.ok(Array.isArray(registration.expectedIds));
  assert.ok(registration.expectedIds.length>0);
  assert.equal(registration.exactJoinedByTrialId,true,
    'Every native returned row must have a genuine registered ID');
  const ids=registration.expectedIds;
  assert.equal(new Set(ids).size,ids.length);
  assert.equal(ids.length,attempts.length);
  const mapped=new Map();
  for(const row of attempts){
    assert.equal(typeof row?.id,'string');
    assert.ok(!mapped.has(row.id),'Duplicate returned native attempt');
    assert.equal(row.actualRawTrialId,row.id);
    mapped.set(row.id,row);
  }
  assert.deepEqual([...mapped.keys()].sort(),[...ids].sort());
  const observed=[];
  for(const id of ids){
    const row=mapped.get(id);
    const rootAudit=auditRootLedger(row,manifest.nativeRootActionLimit);
    assert.equal(rootAudit.verdict,'PASS',
      'Unreconciled public native accepted-root custody: '+id);
    const sourceSeatDirect=row.originalSourceSeat;
    const sourceSeatAbort=row.nativeAbortProvenance?.sourceSeat??null;
    const sourceSeat=sourceSeatDirect??sourceSeatAbort;
    assert.ok(sourceSeat===0||sourceSeat===1,
      'Source physical seat missing: '+id);
    if(sourceSeatDirect!==null&&sourceSeatAbort!==null)
      assert.equal(sourceSeatDirect,sourceSeatAbort,
        'Source seat contradiction with independent native abort evidence');
    const candidateSeat=row.candidateSeat;
    if(candidateSeat!==null){
      assert.ok(candidateSeat===0||candidateSeat===1);
      assert.notEqual(candidateSeat,sourceSeat);
    }
    assert.ok([0,1].includes(row.actualFirstPlayer));
    const actions=row.publicRootActions;
    const counts={sourceNonPassNonPrompt:0,sourceAttackActions:0,
      candidateNonPassNonPrompt:0,candidateAttackActions:0,
      promptActions:0,waitPrompts:0,passes:0,setupRoots:0};
    const sourceActions=[];
    let finalGlobalTurn=0;
    for(const action of actions){
      assert.ok([0,1].includes(action?.playerSlot));
      assert.ok(Number.isSafeInteger(action.turnBefore)&&action.turnBefore>=0);
      assert.ok(Number.isSafeInteger(action.turnAfter)&&action.turnAfter>=0);
      assert.equal(typeof action.action,'string');
      finalGlobalTurn=Math.max(finalGlobalTurn,action.turnAfter);
      if(action.turnBefore===0)counts.setupRoots++;
      if(action.action==='ResolvePromptAction')counts.promptActions++;
      if(action.pendingPrompt==='WaitPrompt')counts.waitPrompts++;
      if(action.action==='PassTurnAction')counts.passes++;
      if(ROOT_KINDS_EXCLUDED.has(action.action))continue;
      const isSource=action.playerSlot===sourceSeat;
      if(isSource){
        counts.sourceNonPassNonPrompt++;
        sourceActions.push({ordinal:action.actionOrdinal,
          turn:action.turnBefore,action:action.action,
          card:action.card??null,attack:action.attack??null});
      }else counts.candidateNonPassNonPrompt++;
      if(action.action==='AttackAction'){
        if(isSource)counts.sourceAttackActions++;
        else counts.candidateAttackActions++;
      }
    }
    observed.push({id,rank:Number(id.split(':')[0]),
      actualSourceSeat:sourceSeat,
      sourceSeatProvenance:sourceSeatDirect===null?
        'independently-attested-native-abort':'direct-returned-row',
      actualFirstPlayer:row.actualFirstPlayer,
      nativeDisposition:row.status,rootLimit:manifest.nativeRootActionLimit,
      capturedNativeRoots:actions.length,finalGlobalTurn,counts,
      sourceActions});
  }
  const rankMap=new Map();
  for(const row of observed){
    if(!rankMap.has(row.rank))rankMap.set(row.rank,[]);
    rankMap.get(row.rank).push(row);
  }
  const perRank=[...rankMap].sort((a,b)=>a[0]-b[0]).map(([rank,rows])=>({
    rank,attempts:rows.length,
    attemptsWithZeroSourceNonPass:rows.filter(row=>
      row.counts.sourceNonPassNonPrompt===0).length,
    sourceNonPassNonPromptTotal:rows.reduce((sum,row)=>
      sum+row.counts.sourceNonPassNonPrompt,0),
    sourceAttackActionsTotal:rows.reduce((sum,row)=>
      sum+row.counts.sourceAttackActions,0)
  }));
  const sum=key=>observed.reduce((n,row)=>n+row.counts[key],0);
  return {schema:VERSION,
    observedTwinleafGitCommit:manifest.observedTwinleafGitCommit??null,
    observedRepositoryGitCommit:manifest.observedRepositoryGitCommit??null,
    receiptTrialIds:[...ids],
    totalAttempts:observed.length,
    totalNativeRoots:observed.reduce((n,r)=>n+r.capturedNativeRoots,0),
    totalWaitPromptRoots:sum('waitPrompts'),
    totalPromptRoots:sum('promptActions'),
    totalSetupRoots:sum('setupRoots'),
    totalSourceNonPassNonPrompt:sum('sourceNonPassNonPrompt'),
    totalSourceAttacks:sum('sourceAttackActions'),
    totalCandidateAttacks:sum('candidateAttackActions'),
    perRank,observed,
    note:'Accepted root actions only; no affordable alternative/owner-hand evidence',
    competitiveGameQualification:'FAIL-development-only',
    qualifiedGames:0};
}

module.exports={VERSION,auditNativeSourceDecisions};
