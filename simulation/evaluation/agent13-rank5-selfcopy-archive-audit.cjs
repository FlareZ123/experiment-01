'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const VERSION='agent13-rank5-selfcopy-root-archive-audit-v1';
/**
 * Join one real source-owned Store ResolvePromptAction to its initiating
 * attack and recorded physical public state. This is a read-only audit.
 * @param {object} row Native archived game with public Store roots.
 * @returns {object[]}
 */
function sourceSelfCopyChoices(row){
  assert.ok(row.sourceSeat===0||row.sourceSeat===1);
  assert.ok(Array.isArray(row.rootActionLedger));
  const attacks=row.sourceAttackSettlement?.attacks??[];
  const actorSelections=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.
    chooseAttack?.selections??[];
  const out=[];
  for(const root of row.rootActionLedger){
    const selected=root.attackChoice;
    if(root.playerSlot!==row.sourceSeat||
        root.action!=='ResolvePromptAction'||
        root.pendingPrompt!=='ChooseAttackPrompt'||
        selected?.printing!=='Mew VMAX FST'||
        !['Cross Fusion Strike','Max Miracle'].includes(selected?.attackName))
      continue;
    const source=attacks.find(attack=>
      attack.actionOrdinal===root.initiatingRootActionOrdinal&&
      attack.turnBefore===root.turnBefore&&
      attack.attackName==='Cross Fusion Strike');
    assert.ok(source,'Actual root must join a settled source attack');
    assert.equal(source.settledPromptChain,true);
    assert.equal(source.settlementCrossesClockReset,false);
    const actor=actorSelections.find(choice=>
      choice.seat===row.sourceSeat&&choice.turn===root.turnBefore&&
      choice.sourceIndex===selected.sourceIndex&&
      choice.attackIndex===selected.attackIndex&&
      choice.attack===selected.attackName);
    assert.ok(actor,'Prompt selected in a real actor-only observation');
    const defending=1-row.sourceSeat;
    const before=source.publicBoardBefore[defending].active;
    const after=source.publicBoardAfter[defending].active;
    const beforePrizes=source.prizesBefore[row.sourceSeat];
    const afterPrizes=source.prizesAfter[row.sourceSeat];
    assert.ok(Number.isSafeInteger(beforePrizes)&&
      Number.isSafeInteger(afterPrizes));
    returnableCheck: {
      assert.ok(before,'Source opponent must have a physical Active');
    }
    out.push({
      turn:root.turnBefore,rootOrdinal:root.actionOrdinal,
      attackOrdinal:source.actionOrdinal,donorIndex:selected.sourceIndex,
      attackName:selected.attackName,
      defendingActiveBefore:before.name,
      defendingActiveAfter:after?.name??null,
      damageBefore:before.damage,
      damageAfter:after?.damage??null,
      observedSameActiveDamageDelta:
        after?.name===before.name?after.damage-before.damage:null,
      sourcePrizesTaken:beforePrizes-afterPrizes,
      nextOpponentRoot:source.nextSourceRoot??null,
      sameEpochOpponentAction:source.nextSourceSameEpochProven===true
    });
  }
  return out;
}
/**
 * Preserve every preregistered attempt while comparing only same-deal
 * physical source and candidate hands and game roots.
 * @param {object} archive Full 32-attempt native archive.
 * @returns {object}
 */
function auditNativeArchive(archive){
  assert.equal(archive.schema,'agent13-rank5-selfcopy-maxmiracle-prospective-v1');
  assert.equal(archive.modes?.length,2);
  const controls=archive.modes[0].native.rows;
  const treatments=archive.modes[1].native.rows;
  assert.equal(controls.length,16);
  assert.equal(treatments.length,16);
  const pairs=[];
  for(let i=0;i<16;i++){
    const a=controls[i],b=treatments[i];
    assert.equal(a.trial.id,b.trial.id);
    assert.equal(a.sourceSeat,b.sourceSeat);
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.ok(a.sourceDealFingerprint&&a.fullPhysicalDealFingerprint);
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint);
    assert.equal(a.fullPhysicalDealFingerprint,b.fullPhysicalDealFingerprint);
    const before=sourceSelfCopyChoices(a),after=sourceSelfCopyChoices(b);
    const different=a.rootActionLedgerSha256!==b.rootActionLedgerSha256;
    const fresh=a.trial.repeat>=2;
    const firstDivergence=(()=>{
      const x=a.rootActionLedger,y=b.rootActionLedger;
      for(let j=0;j<Math.max(x.length,y.length);j++)
        if(JSON.stringify(x[j])!==JSON.stringify(y[j]))
          return {index:j,control:x[j]??null,treatment:y[j]??null};
      return null;
    })();
    assert.equal(Boolean(firstDivergence),different);
    const opponentReplyRoots=after.filter(x=>x.nextOpponentRoot!==null).length;
    pairs.push({id:a.trial.id,stratum:fresh?'fresh-uninspected':'historical-mechanism-canary',
      sourceSeat:a.sourceSeat,firstPlayer:a.actualStarterSeat,
      physicallyPaired:true,rootHistoriesDiffer:different,
      firstDivergence,
      controls:before,treatments:after,opponentReplyRoots,
      nativeStatuses:[a.finished?'ENGINE_TERMINAL':'ACTION_CAP',
        b.finished?'ENGINE_TERMINAL':'ACTION_CAP'],
      nativeWinners:[a.winner??null,b.winner??null],
      turnCounts:[a.turns,b.turns],
      rootCounts:[a.actionCount,b.actionCount],
      paperQualified:false,competitivelyQualified:false});
  }
  const summed={controlSelfCopies:pairs.reduce((n,p)=>
      n+p.controls.filter(x=>x.attackName==='Cross Fusion Strike').length,0),
    treatmentMaxMiracles:pairs.reduce((n,p)=>
      n+p.treatments.filter(x=>x.attackName==='Max Miracle').length,0),
    changedRootHistories:pairs.filter(p=>p.rootHistoriesDiffer).length,
    freshPairs:pairs.filter(p=>p.stratum==='fresh-uninspected').length,
    freshChangedRootHistories:pairs.filter(p=>p.stratum==='fresh-uninspected'&&
      p.rootHistoriesDiffer).length,
    treatmentTwoPrizeAttacks:pairs.flatMap(p=>p.treatments).filter(x=>
      x.sourcePrizesTaken===2).length,
    treatmentSameTarget130Damage:pairs.flatMap(p=>p.treatments).filter(x=>
      x.observedSameActiveDamageDelta===130).length,
    sameNativeWinners:pairs.filter(p=>
      p.nativeWinners[0]===p.nativeWinners[1]).length};
  return {version:VERSION,registeredNativeAttempts:32,
    retainedNativeAttempts:controls.length+treatments.length,
    identicalPhysicalPairs:pairs.length,summed,pairs,
    competitivelyQualifiedGames:0,
    proofBoundary:'Native Store prompt selection, public board, physical Prize and opponent next-root observations; copied-attack paper and opponent competence unqualified'};
}
if(require.main===module){
  const source=process.argv[2];
  assert.ok(source,'Specify the archived JSON path');
  const report=auditNativeArchive(JSON.parse(fs.readFileSync(source,'utf8')));
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={VERSION,sourceSelfCopyChoices,auditNativeArchive};
