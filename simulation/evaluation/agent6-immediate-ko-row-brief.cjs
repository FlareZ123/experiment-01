'use strict';

const fs=require('node:fs');

/**
 * Read-only diagnostic of the canonical bilateral historical JSON archive.
 * The original JSON remains the source of truth. No native State, hidden hand
 * identities or historical deals are touched by this postgame summary.
 *
 * @param {object} row Completed or typed engine-error archive row.
 * @returns {object}
 */
function rowSummary(row){
  const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  const acceptances=root?.nativeRootAcceptances??[];
  const attachmentIntents=acceptances.filter(a=>
    a.kind==='attach-basic-energy'&&
    (a.intent?.projectedBaseDamage!==undefined||
      a.intent?.attackName==='Claw of Darkness'||
      (a.intent?.printing==='Darkness Energy MEE'&&
        a.globalTurn>=24)))
    .map(a=>({
      turn:a.globalTurn,seat:a.seat,kind:a.kind,
      intent:a.intent,accepted:a.accepted,
      nativePhysicalEffect:a.nativePhysicalEffect,
      beforePublicEnergy:a.before?.attachedEnergyCounts,
      afterPublicEnergy:a.after?.attachedEnergyCounts,
      error:a.error??null
    }));
  const nativeSourceClaw=(row.sourceAttackSettlement?.attacks??[])
    .filter(a=>a.attackName==='Claw of Darkness')
    .map(a=>({
      turn:a.turnBefore,ordinal:a.actionOrdinal,
      prizesBefore:a.prizesBefore,prizesAfter:a.prizesAfter,
      settledPromptChain:a.settledPromptChain,
      nextSourceRoot:a.nextSourceRoot,
      sameEpoch:a.nextSourceSameEpochProven
    }));
  const sourceRoots=(row.rootActionLedger??[])
    .filter(a=>a.playerSlot===(row.trial?.candidateSlot==='A'?1:0)&&
      (a.attack==='Claw of Darkness'||
        (a.action==='PlayCardAction'&&a.card==='Darkness Energy MEE')))
    .map(a=>({
      ordinal:a.actionOrdinal,turn:a.turnBefore,action:a.action,
      card:a.card??null,attack:a.attack??null
    }));
  return {
    trial:row.trial?.id,status:row.status,
    error:row.error?.slice(0,320)??null,
    actualStarterSeat:row.actualStarterSeat,
    verifiedFirstTurn:row.verifiedFirstTurn,
    sourceDealFingerprint:row.sourceDealFingerprint??null,
    rootActionLedgerSha256:row.rootActionLedgerSha256??null,
    actionCount:row.actionCount??null,
    finished:row.finished??null,winner:row.winner??null,
    finalPrizes:row.finalPrizes??null,endReason:row.endReason??null,
    sourceNativeEnergyAndClawRoots:sourceRoots,
    matchedNativeEnergyIntents:attachmentIntents,
    sourceClawAttackSettlement:nativeSourceClaw,
    actorNativeRootsAccepted:root?.acceptedActorRoots??null,
    actorNativeRootsRejected:root?.rejectedActorRoots??null,
    competitiveQualified:false
  };
}

/** @returns {void} */
function main(){
  const filename='agent7-canonical-actor-fourarm.json';
  if(!fs.existsSync(filename)){
    console.log('AGENT6_DIAGNOSTIC_MISSING_ARCHIVE '+filename);
    return;
  }
  const data=JSON.parse(fs.readFileSync(filename,'utf8'));
  console.log('AGENT6_DIAGNOSTIC_HEADER',JSON.stringify({
    attempted:data.attempted,withActorAudits:data.actorOnlyCellsWithAudits,
    errors:data.errors,competitiveQualifiedGames:data.competitiveQualifiedGames,
    winRateCertified:data.winRateCertified,
    actorOnlyCompositionVersion:data.actorOnlyCompositionVersion
  }));
  for(const row of data.rows??[]){
    console.log('AGENT6_DIAGNOSTIC_ROW',JSON.stringify(rowSummary(row)));
  }
}
if(require.main===module)main();
module.exports={rowSummary};
