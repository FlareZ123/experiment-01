'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');

const FROZEN=Object.freeze({
  schema:'agent10-rank11-letter-natural-deal-native-aba-v1',
  originalArtifactId:13269629991,
  jsonSha256:'8c0574aa2df803f6b6aad71fb089fdf2cf5df6fd534ca027fac8160db533d597',
  twinleaf:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
  sourceDeals:{
    '11:401:A:champion-reference':'4ac2d076d69be8abb04dded5c329d9e168c939c9c49f6f991a1d8732065a7873',
    '11:401:A:new-moon-lockbreaker-v1':'4ac2d076d69be8abb04dded5c329d9e168c939c9c49f6f991a1d8732065a7873',
    '11:402:B:champion-reference':'a4ce707056ab157da91e2e09c0156fb628786eeec258c85ceea5ea9da1ee8453',
    '11:402:B:new-moon-lockbreaker-v1':'a4ce707056ab157da91e2e09c0156fb628786eeec258c85ceea5ea9da1ee8453'
  }
});
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

/**
 * The public game snapshots after a Store attack contain settled final Prize
 * zones, separately from the immediate after-dispatch snapshots. Count only
 * source-owned real attack transitions with both before and settled arrays.
 * @param {object} row Genuine complete original native postgame row.
 * @returns {{prizes:number,positiveGains:number[],attacks:number}}
 */
function sourceSettledPrizeAudit(row){
  const events=(row.publicAttackTransitions??[]).filter(e=>
    e.triggerPlayerSlot===row.sourceSeat);
  let prizes=0;
  const gains=[];
  for(const event of events){
    assert.equal(event.triggerAction,'AttackAction');
    const before=event.beforePrizesRemaining?.[row.sourceSeat];
    const after=event.settled?.prizesRemaining?.[row.sourceSeat];
    assert.ok(Number.isSafeInteger(before)&&before>=0&&before<=6);
    assert.ok(Number.isSafeInteger(after)&&after>=0&&after<=6);
    assert.ok(before>=after,
      'Settled native source Prize count must never increase from own attack');
    const gain=before-after;
    prizes+=gain;
    if(gain>0)gains.push({
      turn:event.turnBefore,
      attack:event.declarations?.[0]?.attackName??null,
      prizeGain:gain,
      opposingActiveBefore:event.before?.[1-row.sourceSeat]?.active?.name??null
    });
  }
  assert.equal(events.length,row.sourceNativeAttackCount);
  assert.equal(prizes,row.sourcePrizesFromSettledNativeAttacks);
  return {prizes,positiveGains:gains,attacks:events.length};
}

/**
 * Audit all 12 original archived native rows, physically paired control
 * replay and authenticated first source deals. No game is re-executed.
 * @param {object} result Original unmodified native result JSON.
 * @returns {object} Exact matched diagnostic, developmental only.
 */
function auditNativeResult(result){
  assert.equal(result.schema,FROZEN.schema);
  assert.equal(result.pinnedEngine,FROZEN.twinleaf);
  assert.equal(result.attemptedArms,12);
  assert.equal(result.rows.length,12);
  assert.equal(result.competitiveQualifiedGames,0);
  const cases=[];
  for(const [context,digest] of Object.entries(FROZEN.sourceDeals)){
    const rows=result.rows.filter(x=>x.contextId===context);
    assert.deepEqual(rows.map(x=>x.mode),
      ['control-a','tutor-after-pass','control-b']);
    const [a,b,c]=rows;
    assert.ok(rows.every(x=>
      x.sourceDealMatchesHistoric===true&&
      x.sourceDealDigest===digest&&
      x.status==='native-terminal'&&
      x.error===null));
    assert.ok(rows.every(x=>
      x.initialFullPhysicalDealDigest&&
      x.initialFullPhysicalDealDigest===a.initialFullPhysicalDealDigest));
    assert.equal(a.rootActionLedgerSha,c.rootActionLedgerSha);
    assert.equal(a.actualNativeWinner,c.actualNativeWinner);
    assert.deepEqual(a.actualNativeFinalPrizesRemaining,
      c.actualNativeFinalPrizesRemaining);
    assert.equal(a.tutorOptIn,false);
    assert.equal(b.tutorOptIn,true);
    assert.equal(c.tutorOptIn,false);
    const prize=rows.map(sourceSettledPrizeAudit);
    const letterMoves=b.tutorAudit?.examples?.filter(x=>
      x.kind==='prompt'&&x.printing==='Professors Letter BKT'&&
      x.physicalMovementConfirmed===true&&x.nativeAccepted===true)??[];
    assert.equal(letterMoves.length,b.sourceNativeLetterPlayCount);
    assert.ok(letterMoves.every(move=>
      move.selected?.length===2&&move.selected.every(s=>
        s==='Darkness Energy MEE')));
    cases.push({
      contextId:context,sourceSeat:b.sourceSeat,
      originalSourceDealDigest:digest,
      controlRepeatRootLedgerIdentical:true,
      controlWinner:a.actualNativeWinner,
      treatmentWinner:b.actualNativeWinner,
      treatmentAcceptedLetterItems:letterMoves.length,
      treatmentConfirmedPhysicalDarknessTargets:letterMoves.length*2,
      originalSourceAttackCounts:rows.map(x=>x.sourceNativeAttackCount),
      sourceSettledPrizeGains:prize.map(x=>x.prizes),
      treatmentPositivePrizeGains:prize[1].positiveGains
    });
  }
  assert.equal(cases.length,4);
  assert.equal(cases.reduce((n,x)=>n+x.treatmentAcceptedLetterItems,0),3);
  assert.equal(cases.reduce((n,x)=>
    n+x.treatmentConfirmedPhysicalDarknessTargets,0),6);
  const changed=cases[0];
  assert.equal(changed.contextId,'11:401:A:champion-reference');
  assert.deepEqual([
    changed.controlWinner,changed.treatmentWinner,
    changed.sourceSettledPrizeGains
  ],[0,1,[0,6,0]]);
  assert.deepEqual(changed.treatmentPositivePrizeGains.map(x=>
    [x.turn,x.attack,x.prizeGain,x.opposingActiveBefore]),[
    [7,'Energy Drive',2,"Lillie's Clefairy ex"],
    [13,'Energy Drive',2,'Dialga-GX'],
    [21,'Energy Drive',2,'Trevenant & Dusknoir-GX']
  ]);
  return {schema:'agent10-ranked11-native-original-action-and-prize-audit-v1',
    frozenArtifactId:FROZEN.originalArtifactId,
    originalJsonSha256:FROZEN.jsonSha256,
    nativeAttempts:result.attemptedArms,
    sourceDealMatchedContexts:cases.length,
    controlRepeatIdenticalContexts:cases.length,
    treatmentLetterItems:3,treatmentConfirmedDarknessCards:6,
    observedNativeWinnerReversals:1,
    competitivelyQualifiedGames:0,
    caveat:'Retrospective selected natural source deals and limited native policy; not a paper-game strength or metagame win-rate estimate.',
    cases};
}

function readAudited(path){
  const bytes=fs.readFileSync(path);
  assert.equal(sha256(bytes),FROZEN.jsonSha256,
    'Archive JSON bytes differ from the original retained full native result');
  return auditNativeResult(JSON.parse(bytes.toString('utf8')));
}
if(require.main===module){
  assert.equal(process.argv.length,3,
    'Pass exactly the extracted original archived native JSON filepath');
  process.stdout.write(JSON.stringify(readAudited(process.argv[2]),null,2)+'\n');
}
module.exports={FROZEN,sourceSettledPrizeAudit,auditNativeResult,readAudited};
