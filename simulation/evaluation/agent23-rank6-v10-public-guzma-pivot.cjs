'use strict';
const assert=require('node:assert/strict');

const VERSION='agent23-ranked6-v10-next-source-guzma-public-bench-audit-v1';
const IDS=Object.freeze([
  '6:101:B:champion-reference',
  '6:101:B:new-moon-lockbreaker-v1'
]);

/**
 * Read only already-completed PUBLIC board/root fields in the archived
 * original-60 rank6 v10 treatment. This never runs a bot, chooses cards,
 * infers an owner hand, or constructs a speculative winner.
 *
 * @param {object} archivedTreatment Frozen v10 treatment-complete.json.
 * @param {string[]} [ids] Registered original-v10 rank6 exact IDs.
 * @returns {object} Public constraints, without hidden card or policy claims.
 */
function auditRank6GuzmaPublicBench(archivedTreatment,ids=IDS){
  assert.ok(Array.isArray(archivedTreatment?.attempts));
  assert.ok(Array.isArray(ids)&&ids.length>0);
  const rows=ids.map(id=>{
    const matches=archivedTreatment.attempts.filter(a=>a.id===id);
    assert.equal(matches.length,1,'Require one original registered source: '+id);
    const attempt=matches[0];
    const seat=attempt.originalSourceSeat;
    assert.ok(seat===0||seat===1);
    const attacks=attempt.actualSourceAttackSettlement?.attacks??[];
    const settled=attacks.filter(a=>a.attackName==='Volt Cyclone'&&
      a.settledPromptChain===true&&a.settlementCrossesClockReset===false);
    assert.equal(settled.length,1,'One same-epoch physically resolved Volt: '+id);
    const attack=settled[0];
    const board=attack.publicBoardAfter;
    assert.ok(Array.isArray(board)&&board.length===2);
    const own=board[seat],opponent=board[1-seat];
    assert.ok(own?.active&&opponent?.active);
    assert.ok(Array.isArray(own.bench)&&Array.isArray(opponent.bench));
    assert.ok(Array.isArray(own.stadium));
    const ownActiveEnergies=own.active.energyCards??[];
    const fundedBench=own.bench.filter(b=>
      (b.energyCards??[]).includes('Double Colorless Energy'));
    const opposingBenchedPokemon=opponent.bench.map(b=>b.name);
    const nextSourceTurn=attack.turnBefore+2;
    const sourceRoots=(attempt.publicRootActions??[]).filter(r=>
      r.playerSlot===seat&&r.turnBefore===nextSourceTurn&&
      r.action!=='ResolvePromptAction');
    const initialOwnRoot=sourceRoots[0]??null;
    return {
      id,sourceSeat:seat,sourceAttackTurn:attack.turnBefore,
      afterAttackNativeStatus:attempt.status,
      fullAttackPromptChainSettled:true,
      afterAttackSourceActive:own.active.name,
      afterAttackSourceActiveEnergyNames:ownActiveEnergies,
      afterAttackSourceDceOnBenchedPokemonCount:fundedBench.length,
      afterAttackSourceThunderMountainPresent:own.stadium.includes(
        'Thunder Mountain Prism Star'),
      afterAttackOpponentActive:opponent.active.name,
      afterAttackOpposingBenchedPokemon:opposingBenchedPokemon,
      opposingBenchAvailableForPrintedGuzma:
        opposingBenchedPokemon.length>0,
      nextSourceTurn,firstNativeSourceVoluntaryAction:
        initialOwnRoot?{
          ordinal:initialOwnRoot.ordinal??initialOwnRoot.actionOrdinal??null,
          action:initialOwnRoot.action,card:initialOwnRoot.card??null
        }:null,
      ownGuzmaHandAvailability:null,
      ownSupporterQuotaAvailability:null,
      nativeGuzmaProposalOrAcceptance:null,
      otherRealSwitchChoices:null,
      paperGuzmaPivotAvailableProven:false,
      qualifiedCompetitiveGame:false
    };
  });
  return {
    schema:VERSION,originalSourceIds:[...ids],rows,
    bothOpponentsHaveBench:rows.every(x=>
      x.opposingBenchAvailableForPrintedGuzma),
    observedSourceAttackCount:rows.length,
    sourceExactDecksChanged:false,
    fullGamePolicyQualified:false,
    competitiveGamesQualified:0,
    interpretation:'A nonempty opposing Bench removes only one printed Guzma precondition; owner hand, Supporter quota, own Bench recipient, paper payment, opponent answers and winning value remain untested'
  };
}

module.exports={VERSION,IDS,auditRank6GuzmaPublicBench};
