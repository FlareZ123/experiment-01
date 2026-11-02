'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {
  inspectPhysicalCardZones,captureInitialPhysicalOwners,
  fixedDeckCountAnomalies
}=require('./physical-card-ledger.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEED=1847000101;
const MAX_ACTIONS=260;
const TRIALS=Object.freeze([
  {rankA:20,rankB:11,seed:SEED},
  {rankA:5,rankB:26,seed:SEED}
]);

/**
 * Research-only natural-replay first lead search. A genuine original-60
 * source game is artificially forced into native replay by relocating
 * each player's initial genuine six Prize objects to its OWN hand after
 * the initial setup, preserving 120 physical reference identities.
 * The new six-Prize replay proceeds unmodified under normal native
 * actor policies. Only actual subsequent native roots may take Prizes.
 *
 * Any observed first lead remains a development-game witness because
 * the antecedent tie was artificially staged and original action policy,
 * printed rules and clock are not certified.
 *
 * @param {object} trial Original printed source trial.
 * @param {0|1} reverse Source physical seat ordering.
 * @param {Map<number,object>} byRank Source manifest.
 * @returns {object} Failure-inclusive bounded genuine replay.
 */
function runOne(trial,reverse,byRank){
  const rankA=reverse?trial.rankB:trial.rankA;
  const rankB=reverse?trial.rankA:trial.rankB;
  const a=byRank.get(rankA),b=byRank.get(rankB);
  assert.ok(a?.playableUnderEngine&&b?.playableUnderEngine);
  assert.equal(a.cardIds.length,60);
  assert.equal(b.cardIds.length,60);
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  const previous=Store.prototype.dispatch;
  let root=null,originalOwners=null;
  let stagedTie=false,resetSeen=false,replayOpened=false;
  let resetDealPrizes=null,firstNativePhysicalLead=null;
  let postResetRootCount=0;
  Store.prototype.dispatch=function naturalReplayFirstLeadPanel(action,...args){
    if(!root&&action.constructor.name==='AddPlayerAction')root=this;
    const result=previous.call(this,action,...args);
    if(this!==root)return result;
    const state=this.state;
    if(action.constructor.name==='AddPlayerAction'&&
       state.players.length===2&&!originalOwners)
      originalOwners=captureInitialPhysicalOwners(state,60);
    if(!originalOwners)return result;
    const settled=!state.prompts.some(p=>p.result===undefined);
    if(!stagedTie&&settled&&state.phase===GamePhase.PLAYER_TURN&&
       state.turn===1){
      const audit=inspectPhysicalCardZones(state,originalOwners);
      assert.deepEqual(audit.canonicalCounts,[60,60]);
      assert.deepEqual(fixedDeckCountAnomalies(audit),[]);
      for(const player of state.players){
        assert.equal(player.prizes.filter(p=>p.cards.length>0).length,6);
        for(const prize of player.prizes)
          player.hand.cards.push(...prize.cards.splice(0));
      }
      stagedTie=true;
    }else if(stagedTie&&state.turn===0&&
             state.phase===GamePhase.SETUP&&state.isSuddenDeath===true){
      resetSeen=true;
    }else if(resetSeen&&settled&&state.isSuddenDeath===true&&
             state.turn>=1&&!replayOpened&&
             state.phase===GamePhase.PLAYER_TURN){
      resetDealPrizes=state.players.map(player=>
        player.prizes.filter(prize=>prize.cards.length>0).length);
      assert.deepEqual(resetDealPrizes,[6,6]);
      replayOpened=true;
    }
    if(replayOpened){
      postResetRootCount++;
      if(!firstNativePhysicalLead&&settled){
        const prizes=state.players.map(player=>
          player.prizes.filter(p=>p.cards.length>0).length);
        if(prizes[0]!==prizes[1]){
          const audit=inspectPhysicalCardZones(state,originalOwners);
          firstNativePhysicalLead={
            action:action.constructor.name,
            turn:state.turn,phase:state.phase,
            prizes,
            oldCountAnomalies:fixedDeckCountAnomalies(audit),
            originalOwnerMissing:audit.originalOwnerCustody.missingOriginalCounts,
            winnerSeatByRemainingPrizes:prizes[0]<prizes[1]?0:1,
            nativeWinnerAtRoot:state.winner
          };
        }
      }
    }
    return result;
  };
  const request={
    deckA:a.cardIds,deckB:b.cardIds,seed:trial.seed,maxActions:MAX_ACTIONS,
    strictPromptValidation:true,isolatePolicyRandomness:true,
    doubleDragonRecovery:true,
    captureDecisionTrace:true,
    capturePaperReplayFirstPrizeLead:true,
    capturePhysicalZoneIntegrity:true,
    captureOriginalOwnerIntegrity:true,
    enforceSettledPhysicalZoneIntegrity:true,
    label:'agent24-natural-replay-source-'+rankA+'-'+rankB
  };
  let game=null,error=null;
  try{
    game=runMatch(request);
  }catch(e){
    error={name:e.name,code:e.code??null,message:String(e.message).slice(0,440),
      firstBadRoot:e.physicalConservationWitness?.actionOrdinal??null};
  }finally{
    Store.prototype.dispatch=previous;
  }
  const result={
    rankA,rankB,seed:trial.seed,sourceSeatReversed:!!reverse,
    originalPhysicalCards:originalOwners?.size??null,
    stagedInitialTie:stagedTie,
    observedNativeReplaySetup:resetSeen,
    verifiedSixPrizesRedealt:replayOpened,
    originalReplayPrizeDeal:resetDealPrizes,
    settledReplayRootsObserved:postResetRootCount,
    firstNativePhysicalLead,
    nativeReturned:game!==null,
    nativeError:error,
    nativeActions:game?.actions??null,
    nativeFinished:game?.finished??null,
    nativeWinner:game?.winner??null,
    nativeEndReason:game?.endReason??null,
    nativeTerminalTransition:game?.terminalTransition??null,
    finalReplayPrizesRemaining:game?.prizesRemaining??null,
    finalReplayDeckRemaining:game?.finalState?.map(s=>s.deckRemaining)??null,
    finalReplayActivePresent:game?.finalState?.map(s=>s.activePokemon!=='')??null,
    finalReplayBenchCounts:game?.finalState?.map(s=>s.benchedPokemon.length)??null,
    nativeTerminalWithoutObservedPrizeLead:!!(game?.finished&&
      replayOpened&&!firstNativePhysicalLead),
    actualHeadlessPaperLeadRecords:game?.paperReplayFirstPrizeLeads??null,
    actualHeadlessPaperLeadVeto:game?.paperReplayFirstPrizeLeadVeto??null,
    sourceCardHashes:game?.deckHashes??null,
    competitiveQualified:false
  };
  if(game&&replayOpened&&firstNativePhysicalLead){
    assert.ok(game.paperReplayFirstPrizeLeadVeto,
      'Natural first strict Prize lead was missed by paper outcome detector');
    assert.ok(game.paperReplayFirstPrizeLeads.length>0);
    assert.equal(game.paperReplayFirstPrizeLeads[0].paperWinnerSeat,
      firstNativePhysicalLead.winnerSeatByRemainingPrizes);
  }
  return result;
}

/** @returns {object} */
function main(){
  initializeCards();
  const {byRank}=registration();
  const rows=TRIALS.flatMap(t=>[runOne(t,0,byRank),runOne(t,1,byRank)]);
  return {
    schema:'agent24-natural-native-replay-paper-lead-panel-v1',
    pinnedEngine:PIN,registeredRows:rows.length,
    sourceRankPairs:TRIALS.map(t=>[t.rankA,t.rankB]),
    observedReplaySetups:rows.filter(r=>r.observedNativeReplaySetup).length,
    verifiedFreshSixPrizeDeals:rows.filter(r=>r.verifiedSixPrizesRedealt).length,
    nativeFirstStrictPrizeLeads:rows.filter(r=>r.firstNativePhysicalLead).length,
    nativeEngineAborts:rows.filter(r=>r.nativeError).length,
    nativeActionCaps:rows.filter(r=>r.nativeReturned&&
      r.nativeFinished===false).length,
    rows,competitiveQualifiedGames:0,
    limitation:'Original initial tie is experimenter-staged. Replay after fresh deal has no experimenter-injected Prize event. Native policy/rules/clock are not paper certified. No deck win rate.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={TRIALS,SEED,MAX_ACTIONS,runOne,main};
