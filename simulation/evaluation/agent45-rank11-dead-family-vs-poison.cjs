'use strict';

const assert=require('node:assert/strict');

const VERSION='agent45-rank11-callfamily-vs-poison-original-frozen-v1';

/**
 * Evaluate a specific publicly visible printed attack alternative. The
 * native source Trubbish FST has Darkness Call for Family and two-Energy
 * (Darkness, Colorless) Super Poison Breath (20 damage + Poison).
 * Paying its printed cost does not prove every other effect permits attack.
 * @param {object} attack Native source AttackAction public settlement
 * @param {0|1} sourceSeat Genuine original source physical seat
 * @param {0|1} candidateSeat Genuine candidate physical seat
 * @returns {object|null}
 */
function visibleFullBenchDeadFamily(attack,sourceSeat,candidateSeat){
  if(attack.attackName!=='Call for Family')return null;
  const before=attack.publicBoardBefore?.[sourceSeat];
  const after=attack.publicBoardAfter?.[sourceSeat];
  const targetBefore=attack.publicBoardBefore?.[candidateSeat];
  const targetAfter=attack.publicBoardAfter?.[candidateSeat];
  if(before?.active?.name!=='Trubbish'||!Array.isArray(before.bench)||
     !Array.isArray(before.active.energyCards)||
     !Array.isArray(before.active.printedAttacks))return null;
  const fullBench=before.bench.length===5;
  const payable=before.active.energyCards.length>=2&&
    before.active.energyCards.some(name=>name.startsWith('Darkness Energy'))&&
    before.active.printedAttacks.some(x=>
      x.name==='Super Poison Breath'&&Array.isArray(x.cost)&&x.cost.length===2);
  const sameSourceBench=Array.isArray(after?.bench)&&
    before.bench.length===after.bench.length&&
    before.bench.every((pokemon,index)=>
      pokemon.name===after.bench[index]?.name);
  const opponentActiveUnchanged=targetBefore?.active?.name===
      targetAfter?.active?.name&&
    targetBefore?.active?.damage===targetAfter?.active?.damage;
  return {
    turnBefore:attack.turnBefore,
    fullBench,
    payablePrintedDamageAlternative:payable,
    settled:attack.settledPromptChain===true,
    sourceBenchUnchanged:sameSourceBench,
    opponentActiveUnchanged,
    activeEnergyCardCount:before.active.energyCards.length,
    benchedMegaAbsolWithoutEnergy:before.bench.filter(p=>
      p.name==='Mega Absol ex'&&p.energyCards?.length===0).length,
    paperOpportunityObserved:fullBench&&payable&&
      attack.settledPromptChain===true&&sameSourceBench&&opponentActiveUnchanged
  };
}

/**
 * Postgame original-source audit, observational and independent of bot scorer.
 * @param {object} archive Full frozen native JSON with every attempted row
 * @returns {object}
 */
function auditRank11DeadFamilyVsPoison(archive){
  assert.ok(Array.isArray(archive?.rows));
  const result={schema:VERSION,rank11AttemptedArms:0,
    sourceCallForFamilyAttacks:0,fullBenchCallForFamilyAttacks:0,
    fullBenchAlternativePayableNoEffect:0,
    fullBenchNonPayableOrUnconfirmed:0,
    candidateGetLostEmptyDiscardCancellations:0,
    sourceCallForFamilyAlternativeByAttempt:[],
    candidateGetLostNullByAttempt:[],
    paperAttackLegalityCertified:false,competitiveQualifiedGames:0};
  const seen=new Set();
  for(const row of archive.rows){
    if(row.trial?.rank!==11)continue;
    assert.ok(!seen.has(row.trial.id));
    seen.add(row.trial.id);
    result.rank11AttemptedArms++;
    const matches=[];
    for(const attack of row.sourceAttackSettlement?.attacks??[]){
      if(attack.attackName!=='Call for Family')continue;
      result.sourceCallForFamilyAttacks++;
      const witness=visibleFullBenchDeadFamily(
        attack,row.sourceSeat,row.candidateSeat);
      if(!witness)continue;
      if(witness.fullBench)result.fullBenchCallForFamilyAttacks++;
      if(witness.fullBench&&witness.paperOpportunityObserved){
        result.fullBenchAlternativePayableNoEffect++;
        matches.push(witness);
      }else if(witness.fullBench){
        result.fullBenchNonPayableOrUnconfirmed++;
      }
    }
    if(matches.length)result.sourceCallForFamilyAlternativeByAttempt.push({
      id:row.trial.id,attacks:matches.length,
      firstTurn:matches[0].turnBefore,
      lastTurn:matches[matches.length-1].turnBefore,
      allTargetBoardsUnchanged:matches.every(x=>
        x.opponentActiveUnchanged&&x.sourceBenchUnchanged),
      benchedMegaAbsolMinimum:Math.min(...matches.map(x=>
        x.benchedMegaAbsolWithoutEnergy)),
      sourceEnergyCardCounts:[...new Set(matches.map(x=>x.activeEnergyCardCount))],
      originalStoreStatus:row.endReason,
      originalStoreFinished:row.finished,
      originalStoreWinnerSeat:row.winner,
      originalStoreRemainingPrizes:row.finalPrizes
    });
    const rootByOrdinal=new Map(row.rootActionLedger.map(root=>
      [root.actionOrdinal,root]));
    let nullGetLost=0;
    for(const event of row.nativePromptChoices?.events??[]){
      if(event.kind!=='ChooseCardsPrompt'||event.selectedCards!==null||
         event.actorSeat!==row.candidateSeat||
         event.sourceZone!=='discard'||
         event.sourceZoneCardCountBefore!==0||
         event.nativePromptAllowCancel!==true)continue;
      const root=rootByOrdinal.get(event.ordinal);
      const original=rootByOrdinal.get(root?.initiatingRootActionOrdinal);
      if(root?.action==='ResolvePromptAction'&&
         root.pendingPrompt==='ChooseCardsPrompt'&&
         original?.action==='AttackAction'&&original.attack==='Get Lost'&&
         original.playerSlot===row.candidateSeat)
        nullGetLost++;
    }
    if(nullGetLost){
      result.candidateGetLostEmptyDiscardCancellations+=nullGetLost;
      result.candidateGetLostNullByAttempt.push({
        id:row.trial.id,emptyDiscardPromptCount:nullGetLost,
        originalStoreStatus:row.endReason,
        finalPrizes:row.finalPrizes
      });
    }
  }
  return result;
}

module.exports={VERSION,visibleFullBenchDeadFamily,
  auditRank11DeadFamilyVsPoison};
