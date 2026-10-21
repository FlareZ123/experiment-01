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
  const candidateSeat=row.trial?.candidateSlot==='A'?0:1;
  const exposeSourceFirstTurn22=Boolean(
    row.trial?.id?.startsWith('11:retrospective-sourcefirst:2:B:new-moon'));
  const nearTurn22Root=exposeSourceFirstTurn22?acceptances
    .filter(a=>a.seat===candidateSeat&&
      a.globalTurn>=20&&a.globalTurn<=28&&
      ['attach-basic-energy','attach-special-energy','pass'].includes(a.kind))
    .map(a=>({
      globalTurn:a.globalTurn,kind:a.kind,intent:a.intent,
      accepted:a.accepted,
      nativePhysicalEffect:a.nativePhysicalEffect,
      beforePublicEnergy:a.before?.attachedEnergyCounts,
      afterPublicEnergy:a.after?.attachedEnergyCounts,
      publicZonesChanged:a.publicZonesChanged,
      error:a.error??null
    })):[];
  const projectedActive=board=>{
    const slot=Array.isArray(board)?board[candidateSeat]?.active:null;
    return slot?{name:slot.name,damage:slot.damage,
      energyCards:slot.energyCards,toolCards:slot.toolCards}:null;
  };
  const sourceScalingAttacks=exposeSourceFirstTurn22?
    (row.sourceAttackSettlement?.attacks??[])
      .filter(a=>a.attackName==='Psychic'&&
        a.turnBefore>=19&&a.turnBefore<=33)
      .map(a=>({
        ordinal:a.actionOrdinal,turn:a.turnBefore,
        attacker:'source',attackName:a.attackName,
        candidateBefore:projectedActive(a.publicBoardBefore),
        candidateAfter:projectedActive(a.publicBoardAfter),
        prizesBefore:a.prizesBefore,prizesAfter:a.prizesAfter,
        nextCandidateRoot:a.nextSourceRoot,
        settledPromptChain:a.settledPromptChain
      })):[];
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
    sourcefirstTurn22OwnerRoots:nearTurn22Root,
    sourcefirstOranguruPsychicSettlement:sourceScalingAttacks,
    actorNativeRootsAccepted:root?.acceptedActorRoots??null,
    actorNativeRootsRejected:root?.rejectedActorRoots??null,
    competitiveQualified:false
  };
}

/** @returns {void} */
function main(){
  const filename=process.argv[2]??'agent7-canonical-actor-fourarm.json';
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
