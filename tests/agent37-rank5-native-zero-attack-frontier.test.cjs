'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {publicSourceRoots,auditRank5Archive}=
  require('../scripts/agent37-rank5-native-zero-attack-frontier.cjs');

const HASH='a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';

/** @param {'control'|'integrated'} mode */
function fixture(mode){
  return Array.from({length:8},(_,i)=>{
    const candidateSlot=i%2===0?'A':'B';
    const sourceSeat=candidateSlot==='A'?1:0;
    const trial={rank:5,candidateSlot,id:'rank5-'+i};
    const attacks=mode==='integrated'&&i>=5?(i===5?3:i===6?4:1):0;
    const row={trial,sourceDealFingerprint:'exact-source-deal-'+i,
      actualStarterSeat:sourceSeat,
      finished:mode==='integrated'&&i===5,
      endReason:mode==='integrated'&&i===5?'engine-game-end':'action-limit',
      actionCount:260,
      attackDeclarations:{source:attacks},
      rootActionLedger:[
        {playerSlot:sourceSeat,action:'PlayCardAction',
          card:'Mew VMAX FST',turnBefore:5,actionOrdinal:4},
        {playerSlot:1-sourceSeat,action:'PlayCardAction',
          card:'Cynthia',turnBefore:6,actionOrdinal:5},
        ...(attacks?[{playerSlot:sourceSeat,action:'AttackAction',
          attack:'Cross Fusion Strike',turnBefore:7,actionOrdinal:6}]:[])
      ]};
    return {trial,evidence:{sourceSeat,
      ownerSourceGenesectCopiedSelections:Array.from(
        {length:attacks},()=>({attack:'Techno Blast'}))},rawNativeRow:row};
  });
}

test('projector reads only actual physical actor accepted public roots',()=>{
  const r=fixture('integrated')[5].rawNativeRow;
  const sourceSeat=r.trial.candidateSlot==='A'?1:0;
  const p=publicSourceRoots(r,sourceSeat);
  assert.equal(p.acceptedSourceRootCount,2);
  assert.equal(p.acceptedSourceMewVmaxPlayRoots,1);
  assert.equal(p.acceptedSourceAttackRoots.length,1);
  assert.equal(p.sourceRootTail[0].card,'Mew VMAX FST');
  assert.equal(JSON.stringify(p).includes('Cynthia'),false);
});

test('exact 16-attempt archive yields all 5 zero-attack fronts and 3 positives',()=>{
  const archive={schema:'agent13-integrated-rank5-v31-corrected-root-release-v1',
    attempted:16,competitiveQualifiedGames:0,
    actualSourcePrinted60Sha256:HASH,
    modes:{frozenV2Control:{attempts:fixture('control')},
      integratedV3:{attempts:fixture('integrated')}}};
  const a=auditRank5Archive(archive);
  assert.equal(a.nativeArchivedAttemptCount,16);
  assert.equal(a.integratedZeroDeclaredAttackCount,5);
  assert.equal(a.integratedPositiveAttackCount,3);
  assert.equal(a.integratedUnknownAttackCount,0);
  assert.equal(a.noAttackRows.length,5);
  assert.equal(a.rows[5].nativeStatus,'ENGINE_TERMINAL_UNQUALIFIED');
  assert.equal(a.rows[6].nativeStatus,'CENSORED');
  assert.equal(a.competitiveQualifiedGames,0);
  assert.equal(a.rows[5].ownerGenesectCopySelections,3);
  assert.equal(a.rows[6].sourceSeat,1);
  assert.equal(a.rows[5].sourceSeat,0);
  assert.equal(a.rows[0].sourceDealFingerprint,
    a.controlRows[0].sourceDealFingerprint);
});

test('wrong source identity or lost attempt is rejected before inference',()=>{
  const a={schema:'agent13-integrated-rank5-v31-corrected-root-release-v1',
    attempted:16,competitiveQualifiedGames:0,
    actualSourcePrinted60Sha256:HASH,
    modes:{frozenV2Control:{attempts:fixture('control')},
      integratedV3:{attempts:fixture('integrated')}}};
  a.actualSourcePrinted60Sha256='wrong';
  assert.throws(()=>auditRank5Archive(a));
  a.actualSourcePrinted60Sha256=HASH;
  a.modes.integratedV3.attempts.pop();
  assert.throws(()=>auditRank5Archive(a));
});
