'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');

const ORIGINAL_JSON_SHA256=
  '22eacafb175bcc1ee365eeea3189c703c256f5555a8118dd68c988edda44cc17';
const ROOT_CAP=48;
const EXPECTED_IDS=[
  '6:100:A:champion-reference',
  '6:100:A:new-moon-lockbreaker-v1',
  '6:101:B:champion-reference',
  '6:101:B:new-moon-lockbreaker-v1',
  '11:102:A:champion-reference',
  '11:102:A:new-moon-lockbreaker-v1',
  '11:103:B:champion-reference',
  '11:103:B:new-moon-lockbreaker-v1'
].sort();

/** @param {Buffer|string} bytes */
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');

/**
 * Audit the independently downloaded immutable v5 native Store JSON.
 * The claimed owner of an aborted game must come from the separately
 * verified native abort provenance. No private opponent hand is accessed.
 *
 * @param {Buffer} bytes Archive's exact unmodified raw JSON bytes.
 * @returns {object} Complete root-budget accounting by physical attempt.
 */
function auditV5RootBudget(bytes){
  assert.ok(Buffer.isBuffer(bytes));
  assert.equal(digest(bytes),ORIGINAL_JSON_SHA256,
    'Original v5 JSON content changed or wrong archive');
  const archive=JSON.parse(bytes.toString('utf8'));
  assert.equal(archive.qualifiedCompetitiveGames,0);
  assert.ok(Array.isArray(archive.attempts));
  assert.deepEqual(archive.attempts.map(row=>row.id).sort(),EXPECTED_IDS);
  const report=[];
  for(const arm of archive.attempts){
    const roots=arm.publicRootActions;
    assert.ok(Array.isArray(roots));
    assert.equal(roots.length,arm.publicRootActionCount);
    assert.equal(roots.length,arm.nativeRootActionCount);
    assert.equal(arm.publicRootActionsTruncated,false);
    assert.equal(arm.publicRootLedgerDigestConsistent,true);
    assert.equal(digest(JSON.stringify(roots)),
      arm.publicRootLedgerSha256Reported,
      'Full public root ledger differs from its source digest: '+arm.id);
    const originalSourceSeat=arm.originalSourceSeat??
      arm.nativeAbortProvenance?.sourceSeat;
    assert.ok(originalSourceSeat===0||originalSourceSeat===1);
    if(arm.status==='engine-error'){
      assert.equal(arm.nativeAbortProvenance.sourceDealStatus,'VERIFIED');
      assert.equal(arm.nativeAbortProvenance.acceptedRootLedgerStatus,
        'VERIFIED');
    }else{
      assert.equal(arm.status,'returned-unqualified');
      assert.equal(arm.finished,false);
      assert.equal(roots.length,ROOT_CAP);
      assert.equal(arm.actualSourceAttackSettlement?.settled,0);
    }
    let promptRoots=0,sourceChosen=0,candidateChosen=0,
      sourcePass=0,sourcePlay=0,sourceAttack=0,candidateAttack=0;
    let initialSetupRoots=0,sourceWaitPrompts=0,waitPromptRoots=0;
    const promptCounts={};
    const sourcePassTurns=[];
    const sourceTurnNonPrompt=new Set();
    for(let index=0;index<roots.length;index++){
      const row=roots[index];
      assert.equal(row.actionOrdinal,index);
      assert.ok(row.playerSlot===0||row.playerSlot===1);
      const isPrompt=row.action==='ResolvePromptAction';
      assert.equal(isPrompt,row.pendingPrompt!==null);
      if(row.turnBefore===0)initialSetupRoots++;
      if(isPrompt){
        promptRoots++;
        promptCounts[row.pendingPrompt]=(promptCounts[row.pendingPrompt]??0)+1;
        if(row.pendingPrompt==='WaitPrompt')waitPromptRoots++;
        if(row.playerSlot===originalSourceSeat &&
           row.pendingPrompt==='WaitPrompt')sourceWaitPrompts++;
        continue;
      }
      if(row.playerSlot===originalSourceSeat){
        sourceChosen++;
        sourceTurnNonPrompt.add(row.turnBefore);
        if(row.action==='PassTurnAction'){
          sourcePass++;
          sourcePassTurns.push(row.turnBefore);
        }
        if(row.action==='PlayCardAction')sourcePlay++;
        if(row.action==='AttackAction')sourceAttack++;
      }else{
        candidateChosen++;
        if(row.action==='AttackAction')candidateAttack++;
      }
    }
    report.push({
      id:arm.id,
      status:arm.status,
      sourceRank:Number(arm.id.split(':')[0]),
      sourceSeat:originalSourceSeat,
      actualStarterSeat:arm.actualStarterSeat,
      sourceWentFirst:originalSourceSeat===arm.actualStarterSeat,
      roots:roots.length,
      initialSetupRoots,
      promptRoots,waitPromptRoots,promptCounts,
      postSetupPromptRoots:promptRoots-initialSetupRoots,
      ownerDecisionRoots:sourceChosen+candidateChosen,
      sourceChosen,sourcePass,sourcePlay,sourceAttack,
      candidateChosen,candidateAttack,sourceWaitPrompts,
      observedSourceTurnCount:sourceTurnNonPrompt.size,
      sourcePassTurns,
      maxGlobalTurn:Math.max(...roots.map(r=>r.turnBefore)),
      qualifiedCompetitiveGame:false
    });
  }
  const sum=key=>report.reduce((n,r)=>n+r[key],0);
  assert.equal(report.length,8);
  assert.equal(report.filter(r=>r.status==='engine-error').length,1);
  assert.equal(report.filter(r=>r.roots===ROOT_CAP).length,7);
  assert.equal(sum('roots'),350);
  assert.equal(sum('promptRoots'),244);
  assert.equal(sum('ownerDecisionRoots'),106);
  assert.equal(sum('initialSetupRoots'),74);
  assert.equal(sum('waitPromptRoots'),151);
  assert.equal(sum('observedSourceTurnCount'),34);
  assert.equal(sum('sourcePass'),33);
  assert.equal(sum('sourcePlay'),7);
  assert.equal(sum('sourceAttack'),0);
  assert.equal(sum('candidateAttack'),9);
  return {
    schema:'agent11-original-issue25-v5-root-budget-immutable-v1',
    archiveSourceRunId:42059191496,
    archivedV5JsonSha256:ORIGINAL_JSON_SHA256,
    originalNativeRootCap:ROOT_CAP,
    sourceWinRateQualified:false,
    competitiveGamesQualified:0,
    totals:{
      attempts:report.length,
      nativeRootActions:sum('roots'),
      setupRoots:sum('initialSetupRoots'),
      nativePromptRoots:sum('promptRoots'),
      waitPromptRoots:sum('waitPromptRoots'),
      postSetupPromptRoots:sum('promptRoots')-sum('initialSetupRoots'),
      observedSourceTurnDecisions:sum('observedSourceTurnCount'),
      ownerDecisionRoots:sum('ownerDecisionRoots'),
      sourcePasses:sum('sourcePass'),
      sourcePlays:sum('sourcePlay'),
      sourceAttacks:sum('sourceAttack'),
      candidateAttacks:sum('candidateAttack'),
      promptFraction:sum('promptRoots')/sum('roots')
    },
    arms:report,
    interpretation:'Actual settled root ledger only; no owner-hand information, legal alternate-action assertion, completed paper game, or calibrated clock'
  };
}

if(require.main===module){
  assert.equal(process.argv.length,3,
    'Pass the independently downloaded original issue25-steward-v5.json');
  process.stdout.write(JSON.stringify(
    auditV5RootBudget(fs.readFileSync(process.argv[2])),null,2)+'\n');
}
module.exports={ORIGINAL_JSON_SHA256,auditV5RootBudget};
