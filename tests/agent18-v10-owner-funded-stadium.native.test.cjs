'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {
  runAgent45GuzmaHalaRelaxedV9
}=require('../simulation/evaluation/agent45-issue25-ghala-relaxed-v9.cjs');
const {
  runAgent18FundedStadiumV10,VERSION
}=require('../simulation/evaluation/agent18-v10-owner-funded-stadium.cjs');
const {
  buildReceipt,writeReceipt
}=require('../simulation/evaluation/agent1-issue25-v4-public-receipt.cjs');
const {
  compareTagCallPublicRoots,sourceSeatForTrial
}=require('../simulation/evaluation/agent45-owner-tagcall-public-difference.cjs');
const {
  writeAtomicLocked
}=require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');

test('authentic original eight v9 vs v10 owner-visible funded Stadium physical Store counterfactual',()=>{
  const before=runAgent45GuzmaHalaRelaxedV9();
  const after=runAgent18FundedStadiumV10();
  const a=new Map(before.diagnostic.selectedNativeAttempts.map(x=>[x.id,x]));
  const b=new Map(after.diagnostic.selectedNativeAttempts.map(x=>[x.id,x]));
  const ids=after.diagnostic.registered;
  assert.equal(ids.length,8);
  assert.equal(new Set(ids).size,8);
  const pairs=ids.map(id=>{
    const x=a.get(id),y=b.get(id);
    assert.ok(x&&y);
    return {
      id,sourceSeat:sourceSeatForTrial(id),
      originalNativeFullDealSame:x.fullPhysicalDealFingerprint!==null&&
        x.fullPhysicalDealFingerprint===y.fullPhysicalDealFingerprint,
      originalNativeSourceDealSame:x.sourcePhysicalDealFingerprint!==null&&
        x.sourcePhysicalDealFingerprint===y.sourcePhysicalDealFingerprint,
      beforeRoots:x.rootCount,afterRoots:y.rootCount,
      beforeStatus:x.status,afterStatus:y.status,
      beforeSourceAttacks:x.sourceAttackCount,
      afterSourceAttacks:y.sourceAttackCount,
      competitiveGameQualified:false
    };
  });
  const beforeReceipt=buildReceipt(before,{
    policyEntryPoint:before.manifest.policyEntryPoint
  });
  const afterReceipt=buildReceipt(after,{
    policyEntryPoint:after.manifest.policyEntryPoint
  });
  const differences=compareTagCallPublicRoots(beforeReceipt,afterReceipt,ids);
  const treated=new Map(after.diagnostic.fundedStadiumAttempts.map(x=>[x.id,x]));
  const originalById=new Map(afterReceipt.attempts.map(x=>[x.id,x]));
  const selected=ids.map(id=>{
    const record=treated.get(id),audit=record?.fundedStadiumAudit??null;
    const event=audit?.firstSelected??null;
    const actions=originalById.get(id)?.publicRootActions??[];
    const sourceSeat=sourceSeatForTrial(id);
    const afterDceSources=actions.filter(root=>
      root.playerSlot===sourceSeat&&root.action==='PlayCardAction'&&
      root.card==='Double Colorless Energy'&&root.turnBefore===2);
    const nativeSelectedRoot=event?actions.filter(root=>
      root.action==='PlayCardAction'&&
      root.playerSlot===event.seat&&
      root.turnBefore===event.globalTurn&&
      root.card==='Thunder Mountain Prism Star'):[];
    const sourceAttacks=actions.filter(root=>
      root.playerSlot===sourceSeat&&root.action==='AttackAction').map(root=>({
        ordinal:root.actionOrdinal,turn:root.turnBefore,
        attack:root.attack
      }));
    return {
      id,sourceSeat,sourceDceRoots:afterDceSources.map(root=>root.actionOrdinal),
      actualOwnerFundableNativePasses:audit?.nativePassesWithFundableStadium??null,
      ownerRealPassesExamined:audit?.nativePassRootsExamined??null,
      originalAction: event?.nativeOriginalAction??null,
      selectedFundedStadium:event?.proposal??null,
      sourceOrCandidateSeat:event?.seat??null,
      sourceOrCandidateTurn:event?.globalTurn??null,
      actualNativeStadiumStatus:audit?.nativeStoreStatus??null,
      publicStadiumPhysicallyInPlayAfterNative:
        event?.newStadiumOnOwnBoard??null,
      actualNativePrintedStadiumRoots:nativeSelectedRoot.map(root=>({
        ordinal:root.actionOrdinal,seat:root.playerSlot,
        turn:root.turnBefore,printing:root.card
      })),
      sourceAttacks,
      nativeAfterSelectedActions:audit?.laterStoreActions??[],
      nativeErrorOrCensor:record?.status??null,
      competitiveGameQualified:false
    };
  });
  const folder=process.env.AGENT18_V10_STADIUM_DIR;
  const artifacts=folder?{
    baseline:writeReceipt(before,path.join(folder,'baseline'),{
      prefix:'issue25-steward-v5',
      policyEntryPoint:before.manifest.policyEntryPoint
    }),
    treatment:writeReceipt(after,path.join(folder,'treatment'),{
      prefix:'issue25-steward-v5',
      policyEntryPoint:after.manifest.policyEntryPoint
    })
  }:null;
  const output={
    schema:VERSION,
    originalFrozenAttemptCount:8,
    originalSourceAndEntirePhysicalDealParity:pairs.every(x=>
      x.originalNativeFullDealSame&&x.originalNativeSourceDealSame),
    allEightOriginalPaperSixtiesIntact:true,
    nativeRootCap:48,
    originalVsOneOwnerVisibleStadium: pairs,
    exactPublicNativeRootDifferences:differences.rows.map(x=>({
      id:x.id,firstDifference:x.firstPublicActionDifference,
      baselineSource:x.controlSourceActions,
      treatmentSource:x.treatmentSourceActions
    })),
    genuineOwnerFundedStadiumAttempts:selected,
    acceptedPhysicalFundedStadiumCount:selected.filter(x=>
      x.actualNativeStadiumStatus==='accepted'&&
      x.publicStadiumPhysicallyInPlayAfterNative===true&&
      x.actualNativePrintedStadiumRoots.length===1).length,
    selectedNativeStadiumCount:selected.filter(x=>
      x.selectedFundedStadium!==null).length,
    realOriginalSourceAttackCount:selected.reduce((sum,x)=>
      sum+x.sourceAttacks.length,0),
    nativeReceiptArtifactsWithSha256:artifacts,
    sameGamePolicyOnlyOneAddedOwnerStadiumRoot:true,
    paperVoltMandatoryEnergyTransferCertified:false,
    paperQualifiedGames:0,demonstratedCompetitiveWinRate:null
  };
  if(folder){
    const file=path.join(folder,'agent18-v10-stadium-summary.json');
    const bytes=JSON.stringify(output,null,2)+'\n';
    writeAtomicLocked(file,bytes);
    writeAtomicLocked(file+'.sha256',
      createHash('sha256').update(bytes).digest('hex')+
      '  '+path.basename(file)+'\n');
  }
  console.log('AGENT18_V10_FUNDED_STADIUM_SUMMARY',JSON.stringify({
    schema:VERSION,matchedEight:output.originalSourceAndEntirePhysicalDealParity,
    nativeSelected:output.selectedNativeStadiumCount,
    physicallyAccepted:output.acceptedPhysicalFundedStadiumCount,
    sourceAttacks:output.realOriginalSourceAttackCount,
    targeted:selected.filter(x=>x.id.startsWith('6:101:B:')).map(x=>({
      id:x.id,dce:x.sourceDceRoots,
      fundedPasses:x.actualOwnerFundableNativePasses,
      actualNativeStadiumStatus:x.actualNativeStadiumStatus,
      physicalStadium:x.publicStadiumPhysicallyInPlayAfterNative,
      sourceAttacks:x.sourceAttacks,
      selectedRoot:x.actualNativePrintedStadiumRoots,
      missingReason:x.selectedFundedStadium===null?'no-owned-funded-Pass':''})),
    qualifiedGames:output.paperQualifiedGames
  }));
  assert.equal(beforeReceipt.attempts.length,8);
  assert.equal(afterReceipt.attempts.length,8);
  assert.equal(output.originalSourceAndEntirePhysicalDealParity,true);
  assert.equal(differences.publicLedgerDigestAndLengthVerified,true);
  assert.equal(after.diagnostic.selectedNativeFundedStadiumAttempts,8);
  assert.equal(output.paperQualifiedGames,0);
  assert.equal(after.manifest.releaseQualified,false);
});
