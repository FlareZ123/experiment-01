'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

/** @param {object} x One authentic archived native root. */
function rootKey(x){
  return JSON.stringify([x?.turnBefore,x?.playerSlot,x?.action,
    x?.card??null,x?.attack??null,x?.pendingPrompt??null]);
}
/**
 * Compare all source-first rows while retaining every selected or failed arm.
 * The first changed native action must be the candidate's held Escape Rope in
 * place of the canonical Pass; a missing divergence is a valid negative.
 *
 * @param {object} control Same-head original Store no-Rope source-first packet.
 * @param {object} treatment Same-head original Store Rope-enabled packet.
 */
function compareNativeRope(control,treatment){
  assert.equal(control?.attempted,4);
  assert.equal(treatment?.attempted,4);
  assert.equal(control?.rows?.length,4);
  assert.equal(treatment?.rows?.length,4);
  assert.equal(control.enginePin,treatment.enginePin);
  assert.equal(control.competitiveQualifiedGames,0);
  assert.equal(treatment.competitiveQualifiedGames,0);
  const rows=control.rows.map((a,i)=>{
    const b=treatment.rows[i];
    assert.deepEqual(a.trial,b.trial,'Frozen original trial changed');
    assert.equal(a.sourceDealFingerprint,b.sourceDealFingerprint,
      'Original source physical deal changed');
    assert.equal(a.sourceActuallyFirst,b.sourceActuallyFirst);
    assert.equal(a.actualStarterSeat,b.actualStarterSeat);
    assert.equal(a.sourceActuallyFirst,true,'Only source-first cohort registered');
    const ac=a.rootActionLedger??[],bc=b.rootActionLedger??[];
    let divergence=0;
    while(divergence<ac.length&&divergence<bc.length&&
      rootKey(ac[divergence])===rootKey(bc[divergence]))divergence++;
    const matched=divergence===ac.length&&divergence===bc.length;
    const changed=matched?null:{
      index:divergence,
      original:ac[divergence]??null,
      treatment:bc[divergence]??null
    };
    const candidateSeat=a.candidateSeat;
    const ropeAtFirst=changed?.treatment?.playerSlot===candidateSeat&&
      changed?.treatment?.action==='PlayCardAction'&&
      changed?.treatment?.card==='Escape Rope'&&
      changed?.original?.action==='PassTurnAction';
    if(!matched&&ac.length&&bc.length)assert.equal(ropeAtFirst,true,
      'First changed native root was not owner Escape Rope instead of Pass');
    const acceptedRoots=bc.filter(x=>x.playerSlot===candidateSeat&&
      x.action==='PlayCardAction'&&x.card==='Escape Rope');
    const sourceContinuation=changed?
      bc.filter(x=>x.turnBefore>changed.treatment.turnBefore&&
        x.playerSlot!==candidateSeat&&
        x.action!=='ResolvePromptAction').slice(0,6):[];
    return {
      trial:a.trial,sourcePhysicalDealSha256:a.sourceDealFingerprint,
      sameActualStart:a.actualStarterSeat===b.actualStarterSeat,
      sourceFirst:a.sourceActuallyFirst,
      control:{status:a.status??'observed',error:a.error??null,
        rootDigest:a.rootActionLedgerSha256??null,
        sourceAttacks:a.attackDeclarations?.source??null,
        candidateAttacks:a.attackDeclarations?.candidate??null,
        finalPrizes:a.finalPrizes??null,winner:a.winner??null},
      treatment:{status:b.status??'observed',error:b.error??null,
        rootDigest:b.rootActionLedgerSha256??null,
        sourceAttacks:b.attackDeclarations?.source??null,
        candidateAttacks:b.attackDeclarations?.candidate??null,
        finalPrizes:b.finalPrizes??null,winner:b.winner??null},
      changed,acceptedNativeRopeRoots:acceptedRoots.map(x=>({
        ordinal:x.actionOrdinal,turn:x.turnBefore
      })),sourceContinuation,
      admissibleNativeContrast:!a.error&&!b.error&&
        (matched||ropeAtFirst)
    };
  });
  return {
    schema:'agent42-sourcefirst-rope-same-deal-native-development-v1',
    enginePin:control.enginePin,
    attempted:4,
    rows,
    changedPairs:rows.filter(x=>x.changed!==null).length,
    nativeRopePlayRoots:rows.reduce((sum,x)=>
      sum+x.acceptedNativeRopeRoots.length,0),
    unverified:rows.filter(x=>!x.admissibleNativeContrast).length,
    prospectiveSample:false,competitiveQualifiedGames:0,
    claim:'Selected retrospective original Stores only; native alternatives and source replies are diagnostics, not strength estimates.'
  };
}
if(require.main===module){
  assert.equal(process.argv.length,4,
    'Pass control and treatment JSON packet filenames');
  const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
  const result=compareNativeRope(read(process.argv[2]),read(process.argv[3]));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={rootKey,compareNativeRope};
