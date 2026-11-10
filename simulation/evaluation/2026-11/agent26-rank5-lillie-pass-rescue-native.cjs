'use strict';

const assert=require('node:assert/strict');
const {runNativeBatch}=
  require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const {runFreshPacket,writeArtifact}=
  require('../agent36-fresh-rank5-native-paper-packet.cjs');
const {frozenDeals,ORIGINAL_RUN_ID}=
  require('./agent26-rank5-energy-mix-native-continuation.cjs');
const {withMewEnergyMixOwnerPrompt,VERSION:MIX_VERSION}=
  require('../../twinleaf/2026-11/agent26-mew-energy-mix-owner-prompt.cjs');

const VERSION='agent26-rank5-observed-lillie-after-pass-v1';

/**
 * A separately labeled postobserved policy comparison of four original
 * printed-sixty rank5 openings. The same acting-owner Lillie-after-Pass
 * policy applies to both physical seats; the Mew Energy Mix native repair
 * remains on in both seats so the original source can finish its lines.
 *
 * @param {object} [deps] Pure-test seams for the genuine native runner.
 * @returns {object}
 */
function runRetrospectiveLillie(deps={}){
  const promptAudits=[];
  const batch=runFreshPacket({
    nativeBatch:deps.nativeBatch??runNativeBatch,
    run:options=>{
      const session=withMewEnergyMixOwnerPrompt(
        ()=>(deps.run??runDevelopment)({
          ...options,
          actorBilateralLillieAfterPass:true
        }),deps.promptDependencies??{});
      promptAudits.push(session.audit);
      return session.result;
    }
  });
  assert.equal(batch.initialPhysicalStoreGameCount,4);
  for(const entry of batch.gameRecords){
    assert.equal(entry.initialFullPhysicalDeal,frozenDeals[entry.trialId],
      'Must preserve all actual original rank5 60-card physical deals');
  }
  const games=batch.gameRecords.map(row=>{
    const roots=row.acceptedNativeRootLedger??[];
    const supporters=roots.filter(root=>
      root.action==='PlayCardAction'&&
      root.card==="Lillie's Determination");
    const source=roots.filter(root=>root.playerSlot===row.sourceSeat);
    const contender=roots.filter(root=>root.playerSlot===row.contenderSeat);
    const tally=(items,action)=>items.filter(root=>root.action===action).length;
    const detailed=row.rawNative?.ownerBilateralLillieAfterPassAudit??null;
    return {trialId:row.trialId,sourceSeat:row.sourceSeat,
      contenderSeat:row.contenderSeat,
      fullOriginalPhysicalDealSha256:row.initialFullPhysicalDeal,
      nativeFinished:row.nativeFinished,nativeWinner:row.nativeWinner,
      nativeError:row.nativeError,
      nativeRootCount:roots.length,
      nativeRootReceiptJoin:row.rootIdentityJoin.status,
      cleanPhysicalCards:row.storeRaw?.settledPhysicalIdentityClean===true,
      finalPrizes:row.finalPrizes,
      sourceAttacks:tally(source,'AttackAction'),
      contenderAttacks:tally(contender,'AttackAction'),
      contenderPasses:tally(contender,'PassTurnAction'),
      contenderLillieSupporters:supporters.filter(root=>
        root.playerSlot===row.contenderSeat).map(root=>({
          actionOrdinal:root.actionOrdinal,globalTurn:root.turnBefore
        })),
      sourceLillieSupporters:supporters.filter(root=>
        root.playerSlot===row.sourceSeat).map(root=>({
          actionOrdinal:root.actionOrdinal,globalTurn:root.turnBefore
        })),
      actualNativeLillieAudit:detailed
    };
  });
  return {...batch,schema:VERSION,mechanicalPromptRepair:MIX_VERSION,
    baselineNativeRunId:ORIGINAL_RUN_ID,
    previousCompletedBaselineRunId:42738222660,
    intervention:'existing shared actorBilateralLillieAfterPass',
    optInAppliesToBothPhysicalSeats:true,
    postobservedPolicyBranch:true,
    paperQualifiedGames:0,competitivelyAdmittedGames:0,
    ownerEnergyMixPromptAudits:promptAudits,
    games,
    evidenceBoundary:'Retrospective owner-root perturbation with exactly the original physical deals; native terminal and Store receipt only. No paper-competitive win-rate admission.'};
}

if(require.main===module){
  let packet;
  try{packet=runRetrospectiveLillie();}
  catch(error){
    if(error?.partialPaperPacket){
      const archive=writeArtifact({...error.partialPaperPacket,
        schema:VERSION+'-partial-native-v1',
        postobservedPolicyBranch:true,paperQualifiedGames:0},
      'artifacts/agent26-rank5-lillie');
      process.stderr.write(JSON.stringify({
        status:'ABORT_RETAINED',archive,message:error.message})+'\n');
    }
    throw error;
  }
  const artifact=writeArtifact(packet,'artifacts/agent26-rank5-lillie');
  const summary={
    version:VERSION,artifact,
    sameOriginalPhysicalDeals:true,
    totalNativeRoots:packet.exactNativeActionReceiptCount,
    joinedNativeGames:packet.joinedNativeGames,
    cleanOriginalPhysicalGames:packet.cleanOriginalPhysicalGames,
    terminalNativeGames:packet.terminalNativeGames,
    games:packet.games,
    nativePromptAudit:packet.ownerEnergyMixPromptAudits,
    competitivelyAdmittedGames:0
  };
  process.stdout.write('AGENT26_RANK5_LILLIE_PASS '+JSON.stringify(summary)+'\n');
  if(packet.joinedNativeGames!==4||
     packet.cleanOriginalPhysicalGames!==4||
     packet.terminalNativeGames!==4)process.exitCode=1;
}
module.exports={VERSION,runRetrospectiveLillie};
