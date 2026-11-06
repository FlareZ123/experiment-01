'use strict';

const assert=require('node:assert/strict');
const VERSION='agent42-original-vmax-any-bench-source-paid-2psy-realroot-v1';
const SOURCE='Shadow Rider Calyrex VMAX CRE';
const PSY='Psychic Energy ';

/** @param {unknown} cards */
function twoBasicPsychic(cards){
  return Array.isArray(cards)&&cards.length===2&&
    cards.every(name=>typeof name==='string'&&name.startsWith(PSY));
}

/**
 * A real accepted native RetreatAction and public native Store snapshots
 * prove the two Psychic attachments left the source VMAX at the pivot. The
 * target can be any eligible printed Benched Pokémon, including Latias ex.
 * Physical card object identities and destination zone require other custody.
 * @param {object} event Actual native accepted-target public sidecar.
 * @param {0|1} seat Original source seat.
 * @returns {object|null} Detached public-state transition.
 */
function publicPaidPivot(event,seat){
  if(event?.action!=='RetreatAction'||event.storeAccepted!==true||
    event.playerSlot!==seat||
    !Number.isSafeInteger(event.declared?.benchIndex)||
    event.declared.benchIndex<0)return null;
  const change=event.publicBoardChanges??[];
  const active=change.filter(x=>x.seat===seat&&x.position==='active'&&
    x.index===0);
  const bench=change.filter(x=>x.seat===seat&&x.position==='bench'&&
    x.index===event.declared.benchIndex);
  if(active.length!==1||bench.length!==1)return null;
  const oldActive=active[0].before,newActive=active[0].after;
  const previousBench=bench[0].before,oldNowBench=bench[0].after;
  if(oldActive?.pokemon!==SOURCE||oldNowBench?.pokemon!==SOURCE||
    !twoBasicPsychic(oldActive.energies)||
    !Array.isArray(oldNowBench.energies)||
    oldNowBench.energies.length!==0||
    typeof previousBench?.pokemon!=='string'||
    previousBench.pokemon.length===0||
    newActive?.pokemon!==previousBench.pokemon||
    !Array.isArray(previousBench.energies)||
    previousBench.energies.length===0||
    !Array.isArray(newActive.energies)||
    JSON.stringify(newActive.energies)!==
      JSON.stringify(previousBench.energies)||
    !Array.isArray(oldActive.tools)||oldActive.tools.length!==0||
    !Array.isArray(oldNowBench.tools)||oldNowBench.tools.length!==0)
    return null;
  return {
    sourcePrinting:SOURCE,targetPrinting:newActive.pokemon,
    publicPsychicDiscardedFromActive:2,
    previouslyFundedTargetEnergyCount:previousBench.energies.length,
    targetEnergyIdentitiesPreserved:true,
    acceptedNativeRetreat:true,
    hasVerifiedPrivatePhysicalDiscardObjectIds:false
  };
}

/**
 * Match public Store before/after to a real retained accepted root. Evidence
 * from an independent globally wrapped Store prototype is speculative until
 * rooted, and does not upgrade physical-object or paper-game qualification.
 * @param {object} row Native trial result with true Store root action ledger.
 * @param {0|1} seat Original source seat.
 * @returns {object}
 */
function join(row,seat){
  assert.ok(seat===0||seat===1);
  assert.ok(Array.isArray(row.rootActionLedger));
  const side=row.nativeAcceptedTargetSidecar?.events??[];
  const attacks=row.sourceAttackSettlement?.attacks??[];
  const evidence=[];
  for(const root of row.rootActionLedger){
    if(root.action!=='RetreatAction'||root.playerSlot!==seat||
      !Number.isSafeInteger(root.actionOrdinal))continue;
    const matches=side.filter(x=>x.rootActionOrdinal===root.actionOrdinal&&
      x.action==='RetreatAction'&&x.playerSlot===seat);
    if(matches.length!==1)continue;
    const pivot=publicPaidPivot(matches[0],seat);
    if(!pivot)continue;
    const attack=attacks.find(a=>a.actionOrdinal>root.actionOrdinal&&
      a.turnBefore===root.turnBefore&&
      a.settledPromptChain===true&&
      a.settlementCrossesClockReset!==true)??null;
    const before=attack?.prizesBefore?.[seat]??null;
    const after=attack?.prizesAfter?.[seat]??null;
    const prizeDecrease=Number.isInteger(before)&&
      Number.isInteger(after)&&after<before;
    const nativeWon=row.finished===true&&row.winner===seat&&
      row.finalPrizes?.[seat]===0;
    evidence.push({
      acceptedRootOrdinal:root.actionOrdinal,
      globalTurn:root.turnBefore,
      sourceSeat:seat,
      benchIndex:matches[0].declared.benchIndex,
      ...pivot,
      nextSettledSourceAttackOrdinal:attack?.actionOrdinal??null,
      nextSettledSourceAttackName:attack?.attackName??null,
      nextSettledAttackTookPrize:prizeDecrease,
      sourcePrizesBefore:before,sourcePrizesAfter:after,
      sourceNativeTerminalWin:nativeWon,
      competitiveGameQualified:false
    });
  }
  return {
    schema:VERSION,trialId:row.trial?.id??null,
    sourceSeat:seat,sourceNativeFinished:row.finished===true,
    sourceNativeWinner:row.winner??null,
    nativePublicPaidPivotCount:evidence.length,
    pivotWithSettledAttackCount:evidence.filter(x=>
      x.nextSettledSourceAttackOrdinal!==null).length,
    pivotWithPrizeCount:evidence.filter(x=>
      x.nextSettledAttackTookPrize).length,
    pivotWithNativeTerminalSourceWin:evidence.filter(x=>
      x.sourceNativeTerminalWin).length,
    evidence,
    independentPrivatePhysicalObjectPaymentConfirmed:false,
    paperQualifiedGames:0,fieldWinRate:null
  };
}
module.exports={VERSION,twoBasicPsychic,publicPaidPivot,join};
