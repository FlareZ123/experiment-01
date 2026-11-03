'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent11-original-tutor-v2-public-attack-payoff-audit-v1';
const REGISTERED_SCHEMA='agent11-owner-resource-tutor-bilateral-v2';

/**
 * A strictly postgame comparison of the immutable v2 baseline and its
 * opt-in, read-only public attack transition replay. This audit never
 * supplies card information to either player.
 *
 * @param {object} frozen Original, preregistered 32-arm native archive.
 * @param {object} replay Read-only Store replay of those same arms.
 * @returns {object} Machine-readable public action and payoff accounting.
 */
function auditTutorV2TerminalPeriod(frozen,replay) {
  assert.equal(frozen?.schema,REGISTERED_SCHEMA);
  assert.equal(replay?.schema,REGISTERED_SCHEMA);
  assert.equal(replay?.attackTraceReplay,
    'read-only-retrospective-v2-source-payoff-audit-v1');
  assert.equal(replay?.registrationSha256,frozen.registrationSha256);
  assert.equal(replay?.engine,frozen.engine);
  assert.equal(replay?.codeVersion,frozen.codeVersion);
  assert.ok(Array.isArray(frozen.rows)&&Array.isArray(replay.rows));
  assert.equal(replay.rows.length,frozen.rows.length);
  const original=new Map(frozen.rows.map(row=>[row.id,row]));
  assert.equal(original.size,frozen.rows.length,'Original row IDs must be unique');

  const names=new Map(),targetDamage=new Map();
  const byMode={control:{arms:0,sourceAttackRoots:0,settled:0,censored:0,
      sourcePrizeGains:0,sourceTargetDamageIncreases:0,printedSixCounterConditionMet:0},
    'resource-tutor':{arms:0,sourceAttackRoots:0,settled:0,censored:0,
      sourcePrizeGains:0,sourceTargetDamageIncreases:0,printedSixCounterConditionMet:0}};
  let comparedRows=0,nativeErrors=0,capped=0,terminated=0,
    opponentRank5AttackRoots=0,sourceAttacksNotPresentInPublicTrace=0;
  const cases=[];
  for(const row of replay.rows){
    const historical=original.get(row.id);
    assert.ok(historical,'Unregistered replay row '+row.id);
    for(const field of ['seed','rank5Seat','mode','maxActions','engine',
      'nativeStatus','firstTurnSlot','initialFullPhysicalDealDigest',
      'rootActionLedgerSha','decisionTraceSha','nativeFinished','nativeWinner']){
      assert.deepEqual(row[field],historical[field],
        'Read-only replay changed '+field+' for '+row.id);
    }
    assert.deepEqual(row.tutorAudit,historical.tutorAudit,
      'Read-only replay changed selected tutor actions '+row.id);
    comparedRows++;
    if(row.nativeStatus==='native-error'){
      nativeErrors++;
      continue;
    }
    assert.ok(['native-capped','native-terminal'].includes(row.nativeStatus));
    if(row.nativeStatus==='native-capped')capped++;
    else terminated++;
    assert.ok(row.rank5Seat===0||row.rank5Seat===1);
    assert.ok(Object.hasOwn(byMode,row.mode),'Unexpected mode '+row.mode);
    const counter=byMode[row.mode];
    counter.arms++;
    const sourceSeat=1-row.rank5Seat;
    const roots=row.rootActionLedger;
    assert.ok(Array.isArray(roots));
    const sourceAttacks=roots.filter(root=>
      root.action==='AttackAction'&&root.playerSlot===sourceSeat);
    opponentRank5AttackRoots+=roots.filter(root=>
      root.action==='AttackAction'&&root.playerSlot===row.rank5Seat).length;
    counter.sourceAttackRoots+=sourceAttacks.length;
    assert.ok(Array.isArray(row.publicAttackTransitions));
    const transitions=new Map();
    for(const event of row.publicAttackTransitions){
      if(event.triggerAction==='AttackAction'&&
          event.triggerPlayerSlot===sourceSeat){
        assert.ok(!transitions.has(event.actionOrdinal),
          'Duplicate source attack transition '+row.id);
        transitions.set(event.actionOrdinal,event);
      }
    }
    if(transitions.size!==sourceAttacks.length)
      sourceAttacksNotPresentInPublicTrace+=Math.abs(transitions.size-sourceAttacks.length);
    assert.equal(transitions.size,sourceAttacks.length,
      'Native source attack lacks same-root effect trace '+row.id);
    for(const attack of sourceAttacks){
      const event=transitions.get(attack.actionOrdinal);
      assert.ok(event,'Missing effect event for source root '+row.id);
      assert.equal(event.declarations?.length,1,
        'Require exactly one source declaration per root '+row.id);
      const printedAttack=event.declarations[0].attackName;
      names.set(printedAttack,(names.get(printedAttack)??0)+1);
      const defending=event.before?.[row.rank5Seat]?.active;
      assert.ok(defending&&Number.isSafeInteger(defending.damage));
      targetDamage.set(defending.damage,(targetDamage.get(defending.damage)??0)+1);
      if(printedAttack==='Terminal Period'&&defending.damage===60)
        counter.printedSixCounterConditionMet++;
      if(event.settled){
        counter.settled++;
        const after=event.settled.after?.[row.rank5Seat]?.active;
        assert.ok(after,'Settled attack missing opposing Active');
        if(after.damage>defending.damage)counter.sourceTargetDamageIncreases++;
        const beforePrizes=event.beforePrizesRemaining?.[sourceSeat];
        const afterPrizes=event.settled.prizesRemaining?.[sourceSeat];
        assert.ok(Number.isSafeInteger(beforePrizes)&&
          Number.isSafeInteger(afterPrizes));
        if(afterPrizes<beforePrizes)counter.sourcePrizeGains++;
      }else {
        counter.censored++;
      }
    }
    if(sourceAttacks.length){
      cases.push({id:row.id,sourceAttackRoots:sourceAttacks.length,
        resolved:sourceAttacks.filter(a=>
          transitions.get(a.actionOrdinal).settled!==null).length,
        acceptedTutorItems:row.tutorAudit?.acceptedItems??null});
    }
  }
  assert.equal(original.size,comparedRows,
    'All registered original arms must be matched exactly');
  return {
    version:VERSION,engine:frozen.engine,
    preregistrationSha256:frozen.registrationSha256,
    immutableRowsCompared:comparedRows,
    genuineOriginalPhysicalPairCount:replay.sourcePhysicalParityMatched,
    statusCounts:{nativeErrors,capped,terminated},
    byMode,
    attackNames:Object.fromEntries([...names].sort()),
    defendingActivePreAttackDamage:Object.fromEntries([...targetDamage]
      .sort((a,b)=>a[0]-b[0]).map(([damage,n])=>[String(damage),n])),
    opponentRank5AttackRoots,
    sourceAttacksNotPresentInPublicTrace,
    sourceAttackCases:cases,
    exactPrintedCondition:'Terminal Period requires exactly six damage counters on opposing Active',
    printedConditionIsFullyEvaluableFromPublicBoard:true,
    fullPaperGameplayCertified:false,competitivelyQualifiedGames:0
  };
}

if(require.main===module){
  assert.equal(process.argv.length,4,
    'Expected paths to original frozen and read-only replay JSON files');
  const frozen=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const replay=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(auditTutorV2TerminalPeriod(frozen,replay),null,2)+'\n');
}

module.exports={VERSION,auditTutorV2TerminalPeriod};
