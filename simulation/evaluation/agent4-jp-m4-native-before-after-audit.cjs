'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createHash}=require('node:crypto');

const VERSION='agent4-jp-m4-original-native-paper-before-after-v1';
const NEW_PRINTING='Special Red Card M4';
const FROZEN_REGISTRATION_SHA=
  '672a2bad01f5338d8656af8d9d05808a36a109b411320cf8648c3205631d97f6';
const ENGINE='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const sha=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Independent, strictly read-only comparison of two actual native Store
 * archives. Every held physical hand index and root is matched before a new
 * printed-paper ineligibility certificate is admitted.
 *
 * @param {object} original Historical immutable v6 native six attempts.
 * @param {object} modified Source-exact Japanese M4 v7 six attempts.
 * @returns {object} Reproducible paper-only delta.
 */
function auditNativeJapaneseM4(original,modified){
  for(const archive of [original,modified]){
    assert.equal(archive.enginePin,ENGINE);
    assert.equal(archive.registrationSha256,FROZEN_REGISTRATION_SHA);
    assert.equal(archive.allAttempted,6);
    assert.equal(archive.allPhysicalAndDecisionParity,true);
    assert.deepEqual(archive.nativeErrors,[]);
    assert.equal(archive.groups.length,2);
  }
  const changed=[];
  const observedTotals={
    before:{frames:0,held:0,proven:0,unresolved:0},
    after:{frames:0,held:0,proven:0,unresolved:0}
  };
  for(let i=0;i<2;i++){
    const a=original.groups[i],b=modified.groups[i];
    assert.equal(a.seed,b.seed);
    assert.equal(a.slot,b.slot);
    assert.equal(a.rank5Seat,b.rank5Seat);
    assert.equal(a.originalDeckSha256,b.originalDeckSha256);
    assert.deepEqual(a.physicalSha256,b.physicalSha256);
    assert.deepEqual(a.traceSha256,b.traceSha256);
    assert.equal(a.allPhysicalDealMatched,true);
    assert.equal(b.allPhysicalDealMatched,true);
    assert.equal(a.allActionTraceMatched,true);
    assert.equal(b.allActionTraceMatched,true);
    assert.equal(a.attempts.length,3);
    assert.equal(b.attempts.length,3);
    for(let j=0;j<3;j++){
      assert.equal(a.attempts[j].status,b.attempts[j].status);
      assert.equal(a.attempts[j].error,b.attempts[j].error);
    }
    const rootsA=a.attempts[1].paperCensus.paperOwnerRoots;
    const rootsB=b.attempts[1].paperCensus.paperOwnerRoots;
    assert.equal(rootsA.length,rootsB.length);
    for(const [metric,roots] of [
      ['before',rootsA],['after',rootsB]
    ]){
      for(const root of roots){
        observedTotals[metric].frames++;
        const screen=root.ownerPaperNecessity;
        observedTotals[metric].held+=screen.heldTrainerCopies;
        observedTotals[metric].proven+=
          screen.provenNecessaryConditionFailures;
        observedTotals[metric].unresolved+=
          screen.remainingUnresolvedCopies;
      }
    }
    for(let k=0;k<rootsA.length;k++){
      const old=rootsA[k],now=rootsB[k];
      assert.equal(old.ordinal,now.ordinal);
      assert.equal(old.seat,now.seat);
      assert.equal(old.turn,now.turn);
      assert.deepEqual(old.selectedNativeAction,now.selectedNativeAction);
      assert.equal(old.nativeDispatch,now.nativeDispatch);
      const rowsA=old.ownerPaperNecessity.rows;
      const rowsB=now.ownerPaperNecessity.rows;
      assert.equal(rowsA.length,rowsB.length);
      for(let c=0;c<rowsA.length;c++){
        const oldCard=rowsA[c],newCard=rowsB[c];
        assert.equal(oldCard.handIndex,newCard.handIndex);
        assert.equal(oldCard.printing,newCard.printing);
        assert.equal(oldCard.type,newCard.type);
        assert.equal(oldCard.nativeEnumeratorOffered,
          newCard.nativeEnumeratorOffered);
        const blockersBefore=oldCard.necessaryBlockers??[];
        const blockersAfter=newCard.necessaryBlockers??[];
        if(sha(blockersBefore)===sha(blockersAfter))continue;
        assert.equal(newCard.printing,NEW_PRINTING);
        assert.deepEqual(blockersBefore,[]);
        assert.deepEqual(blockersAfter,[
          'printed-prize:public-prize-prerequisite-failed'
        ]);
        assert.equal(oldCard.paperPlayable,null);
        assert.equal(newCard.paperPlayable,false);
        assert.equal(newCard.printedPrizeCertificate?.exactSourceCardId,
          'jp/M4/72');
        assert.equal(newCard.printedPrizeCertificate?.observedOwnPrizeCount,6);
        assert.equal(newCard.printedPrizeCertificate
          ?.observedOpponentPrizeCount,6);
        assert.equal(newCard.nativeEnumeratorOffered,true);
        assert.equal(newCard.nativeStoreAcceptance,'unverified');
        changed.push({
          seed:b.seed,seat:b.rank5Seat,sourceSeat:now.seat,
          globalTurn:now.turn,ordinal:now.ordinal,
          handIndex:newCard.handIndex,printing:newCard.printing,
          printedPrerequisite:
            newCard.printedPrizeCertificate.printedPrerequisite,
          ownPrizes:newCard.printedPrizeCertificate.observedOwnPrizeCount,
          opponentPrizes:newCard.printedPrizeCertificate
            .observedOpponentPrizeCount,
          nativeEnumeratorOffered:newCard.nativeEnumeratorOffered,
          selectedAction:now.selectedNativeAction,
          nativeDispatch:now.nativeDispatch,
          originalFullPhysicalDealSha:a.physicalSha256[1],
          originalFullDecisionTraceSha:a.traceSha256[1],
          oldBlockers:blockersBefore,newBlockers:blockersAfter
        });
      }
    }
  }
  assert.deepEqual(observedTotals.before,
    {frames:56,held:452,proven:60,unresolved:392});
  assert.deepEqual(observedTotals.after,
    {frames:56,held:452,proven:61,unresolved:391});
  assert.equal(changed.length,1);
  assert.equal(changed[0].seed,912174767);
  assert.equal(changed[0].sourceSeat,0);
  assert.equal(changed[0].globalTurn,25);
  assert.equal(changed[0].ordinal,26);
  assert.equal(changed[0].handIndex,18);
  assert.equal(changed[0].selectedAction.action,'PassTurnAction');
  return {
    version:VERSION,sourceType:'original Aichi rank5 vs rank11',
    genuineNativeStoreAttemptsPerArchive:6,
    exactFrozenSourceDecks:true,allOriginalPhysicalDealsMatched:true,
    allCompleteNativeActionTracesMatched:true,
    sameHistoricalSourceSeeds:true,
    independentRoots:56,
    oldPaperScreenVersion:original.groups[0].attempts[1]
      .paperCensus.paperOwnerRoots[0].ownerPaperNecessity.version,
    newPaperScreenVersion:modified.groups[0].attempts[1]
      .paperCensus.paperOwnerRoots[0].ownerPaperNecessity.version,
    observedTotals,changed,
    eligibleActionProven:false,
    nativeStoreAcceptanceOfM4Proven:false,
    paperGameQualified:false,competitiveFieldWinRate:null
  };
}

if(require.main===module){
  const [oldPath,newPath]=process.argv.slice(2);
  assert.ok(oldPath&&newPath,
    'Require old six-attempt raw JSON and new six-attempt raw JSON');
  const a=JSON.parse(fs.readFileSync(oldPath,'utf8'));
  const b=JSON.parse(fs.readFileSync(newPath,'utf8'));
  process.stdout.write('AGENT4_JP_M4_NATIVE_DIFF '+
    JSON.stringify(auditNativeJapaneseM4(a,b))+'\n');
}

module.exports={VERSION,auditNativeJapaneseM4};
