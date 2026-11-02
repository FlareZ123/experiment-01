'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {
  projectPendingReplayPrizes,projectPendingOrdinaryPrizes,
  compareNativePendingPrizeWinner
}=require('../evaluation/agent24-pending-replay-prize-disposition.cjs');
const {
  captureInitialPhysicalOwners,inspectPhysicalCardZones,
  fixedDeckCountAnomalies
}=require('./physical-card-ledger.cjs');

const {withNativeKODispatchLedger}=
  require('./agent24-native-ko-batch-observer.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const SEED=1847000101;

/**
 * Research-only intervention. A real 60/60 source Store first undergoes an
 * experimenter-induced both-zero-Prize tie. The pinned engine itself then
 * redeals six Prizes each and reaches a settled native replay turn. At that
 * instant, both Active Pokémon are artificially assigned lethal damage and
 * the actual pinned checkState reducer resolves the simultaneous Knock Outs.
 * Every artificial manipulation is flagged. This is a reducer fixture, not
 * a paper-legal attack or a native competitive match.
 *
 * @param {0|1} reverse Reverses the two registered printed source sixties.
 * @param {Map<number,object>} byRank Published original sources.
 * @returns {object} Full two-seat native reducer disposition.
 */
function one(reverse,byRank,{forceOppositeLeader=false}={}){
  assert.ok(!forceOppositeLeader||reverse===1);

  const a=byRank.get(reverse?11:20).cardIds;
  const b=byRank.get(reverse?20:11).cardIds;
  assert.equal(a.length,60);assert.equal(b.length,60);
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  const {PokemonCard}=require(path.join(output,'game/store/card/pokemon-card'));
  const {Stage}=require(path.join(output,'game/store/card/card-types'));
  const {checkState}=require(path.join(output,'game/store/effect-reducers/check-effect'));
  const original=Store.prototype.dispatch;
  const originalReduceEffect=Store.prototype.reduceEffect;
  const nativeKOEntitlements=[];
  let root=null,owners=null,stagedTie=false,resetSeen=false;
  let replayOpened=false,doubleKOStaged=false;
  let matchedBenchSlots=0;
  const forcedActiveReplacements=[];
  let before=null,afterReducer=null;
  Store.prototype.reduceEffect=function nativeKoPrizeGroupReceipt(state,effect){
    const returned=originalReduceEffect.call(this,state,effect);
    if(this===root&&doubleKOStaged&&
       effect.constructor.name==='KnockOutEffect'){
      const victimSeat=state.players.indexOf(effect.player);
      assert.ok(victimSeat===0||victimSeat===1);
      nativeKOEntitlements.push({
        victimSeat,claimantSeat:1-victimSeat,
        prizeCount:effect.prizeCount,
        preventDefault:effect.preventDefault===true,
        alternatePrizeDestination:effect.prizeDestination!==undefined
      });
    }
    return returned;
  };
  Store.prototype.dispatch=function simultaneousKORoot(action,...args){
    if(!root&&action.constructor.name==='AddPlayerAction')root=this;
    const result=original.call(this,action,...args);
    if(this!==root)return result;
    const state=this.state;
    if(action.constructor.name==='AddPlayerAction'&&
       state.players.length===2&&!owners)
      owners=captureInitialPhysicalOwners(state,60);
    if(!owners)return result;
    const settled=state.players.length===2&&
      !state.prompts.some(p=>p.result===undefined);
    if(!stagedTie&&settled&&state.turn===1&&
       state.phase===GamePhase.PLAYER_TURN){
      for(const player of state.players){
        assert.equal(player.prizes.filter(p=>p.cards.length>0).length,6);
        for(const prize of player.prizes)
          player.hand.cards.push(...prize.cards.splice(0));
      }
      stagedTie=true;
    }else if(stagedTie&&state.turn===0&&
             state.phase===GamePhase.SETUP&&state.isSuddenDeath===true){
      resetSeen=true;
    }else if(resetSeen&&!replayOpened&&settled&&state.turn>=1&&
             state.phase===GamePhase.PLAYER_TURN&&
             state.isSuddenDeath===true){
      replayOpened=true;
      assert.deepEqual(state.players.map(p=>
        p.prizes.filter(pr=>pr.cards.length>0).length),[6,6]);
      for(const player of state.players){
        assert.ok(player.active.getPokemonCard());
        if(player.bench.some(slot=>!!slot.getPokemonCard()))continue;
        const target=player.bench.find(slot=>!slot.getPokemonCard());
        const basic=player.deck.cards.find(card=>
          card instanceof PokemonCard&&card.stage===Stage.BASIC);
        assert.ok(target&&basic,
          'Need a retained genuine original Basic on both Benches');
        player.deck.cards.splice(player.deck.cards.indexOf(basic),1);
        target.cards.push(basic);
        matchedBenchSlots++;
      }

      if(forceOppositeLeader){
        // Deliberately synthetic: select the exact original-owner physical
        // Basic from a present zone, exchanging it with the Active Basic.
        // This never claims the move was a playable action.
        for(const [seat,targetName] of
          [[0,'Mega Absol ex'],[1,'Squawkabilly ex']]){
          const player=state.players[seat];
          const active=player.active.getPokemonCard();
          assert.ok(active&&player.active.cards.length===1,
            'Forced case requires an unattached Basic Active');
          const zones=[
            ['deck',player.deck],['hand',player.hand],
            ...player.bench.map((s,i)=>['bench-'+i,s]),
            ...player.prizes.map((s,i)=>['prize-'+i,s])
          ];
          const located=zones.find(([,zone])=>zone.cards.some(card=>
            card instanceof PokemonCard&&card.stage===Stage.BASIC&&
            card.name===targetName));
          assert.ok(located,
            'Expected original printed '+targetName+' in seat '+seat);
          const [zoneName,zone]=located;
          const index=zone.cards.findIndex(card=>
            card instanceof PokemonCard&&card.stage===Stage.BASIC&&
            card.name===targetName);
          const replacement=zone.cards[index];
          zone.cards[index]=active;
          player.active.cards[0]=replacement;
          forcedActiveReplacements.push({
            seat,fromZone:zoneName,
            previousActive:active.name,forcedActive:replacement.name
          });
        }
      }
      const audit=inspectPhysicalCardZones(state,owners);
      assert.deepEqual(fixedDeckCountAnomalies(audit),[]);
      assert.deepEqual(audit.originalOwnerCustody.missingOriginalCounts,[0,0]);
      before={
        turn:state.turn,phase:state.phase,
        prizes:state.players.map(p=>p.getPrizeLeft()),
        bench:state.players.map(p=>p.bench.filter(s=>s.getPokemonCard()).length),
        active:state.players.map(p=>p.active.getPokemonCard()?.name??null)
      };
      for(const player of state.players)
        player.active.damage=9999;
      doubleKOStaged=true;
      checkState(this,state);
      afterReducer={
        phase:state.phase,winner:state.winner,
        prizes:state.players.map(p=>p.getPrizeLeft()),
        active:state.players.map(p=>p.active.getPokemonCard()?.name??null),
        bench:state.players.map(p=>p.bench.filter(s=>s.getPokemonCard()).length),
        prompts:state.prompts.filter(p=>p.result===undefined)
          .map(p=>p.constructor.name)
      };
    }
    return result;
  };
  let game=null,dispatchLedger=null;
  try{
    const observed=withNativeKODispatchLedger(()=>runMatch({
      deckA:a,deckB:b,seed:SEED,maxActions:260,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      doubleDragonRecovery:true,capturePhysicalZoneIntegrity:true,
      captureOriginalOwnerIntegrity:true,enforceSettledPhysicalZoneIntegrity:true,
      label:'agent24-experimental-simultaneous-double-ko-'+reverse
    }),{Store});
    game=observed.result;
    dispatchLedger=observed.evidence;
  }finally{
    Store.prototype.dispatch=original;
    Store.prototype.reduceEffect=originalReduceEffect;
  }
  assert.ok(owners&&stagedTie&&resetSeen&&replayOpened&&doubleKOStaged);
  assert.equal(owners.size,120);
  assert.equal(dispatchLedger.sameResolutionBatchAuthenticated,false);
  const observedKO=dispatchLedger.events.filter(e=>
    e.koEntitlements.length===2);
  assert.equal(observedKO.length,1);
  assert.deepEqual(observedKO[0].koEntitlements,nativeKOEntitlements);
  assert.deepEqual(before.prizes,[6,6]);
  assert.ok(before.bench.every(x=>x>=1));
  assert.ok(game.finished,'Staged simultaneous KO did not reach native terminal');
  assert.equal(nativeKOEntitlements.length,2,
    'Native did not reduce two actual opponent-owned Knock Out effects');
  assert.ok(nativeKOEntitlements.every(x=>
    x.prizeCount>0&&!x.preventDefault&&!x.alternatePrizeDestination));
  const pendingPrizesByClaimant=[0,0];
  for(const ko of nativeKOEntitlements)
    pendingPrizesByClaimant[ko.claimantSeat]+=ko.prizeCount;
  const hypotheticalPaperRemainingPrizes=
    pendingPrizesByClaimant.map(x=>6-x);
  const hypotheticalPaperLeader=
    hypotheticalPaperRemainingPrizes[0]===hypotheticalPaperRemainingPrizes[1]?
      null:(hypotheticalPaperRemainingPrizes[0]<
        hypotheticalPaperRemainingPrizes[1]?0:1);
  const pendingPrizeAudit=projectPendingReplayPrizes({
    authenticatedReplayEpoch:replayOpened,
    singleSettledResolutionBatch:true,
    physicalRemaining:before.prizes,
    koEntitlements:nativeKOEntitlements
  });
  assert.deepEqual(pendingPrizeAudit.pendingPrizesByClaimant,pendingPrizesByClaimant);
  assert.deepEqual(pendingPrizeAudit.projectedRemainingPrizes,
    hypotheticalPaperRemainingPrizes);
  assert.equal(pendingPrizeAudit.projectedLeaderSeat,hypotheticalPaperLeader);
  assert.equal(pendingPrizeAudit.paperGameOutcomeQualified,false);
  const nativePendingComparison=compareNativePendingPrizeWinner({
    projection:pendingPrizeAudit,
    nativeFinished:game.finished,
    nativeEndReason:game.endReason,
    nativeWinnerSeat:game.winner
  });
  assert.equal(nativePendingComparison.paperGameOutcomeQualified,false);
  if(forceOppositeLeader){
    assert.equal(nativePendingComparison.status,
      'NATIVE_WINNER_OPPOSES_PENDING_PRIZE_LEAD');
    assert.deepEqual(pendingPrizesByClaimant,[2,3],
      'Expected forced source-owned 3-Prize A versus 2-Prize B');
    assert.equal(pendingPrizeAudit.status,'PENDING_KO_PRIZES_STRICT_LEAD');
    assert.equal(pendingPrizeAudit.projectedLeaderSeat,1);
    assert.equal(game.winner,0,
      'Expected pinned first-seat priority despite the opposing pending Prize leader');
  }else if(reverse===1){
    assert.deepEqual(pendingPrizesByClaimant,[2,2],
      'Expected a controlled equal-award simultaneous KO');
    assert.equal(pendingPrizeAudit.status,'PENDING_KO_PRIZES_NO_STRICT_LEAD');
    assert.equal(nativePendingComparison.status,
      'NATIVE_WINNER_WITHOUT_PENDING_PRIZE_LEAD');
    assert.equal(game.winner,0,
      'Expected pinned native first-seat sudden-death KO priority');
  }else{
    assert.deepEqual(pendingPrizesByClaimant,[3,2]);
    assert.equal(pendingPrizeAudit.status,'PENDING_KO_PRIZES_STRICT_LEAD');
    assert.equal(nativePendingComparison.status,
      'NATIVE_WINNER_MATCHES_PENDING_PRIZE_LEAD');
  }
  return {
    reverse,rankA:reverse?11:20,rankB:reverse?20:11,seed:SEED,
    genuineFirstSourceDeal:true,experimentalInitialTie:true,
    genuineNativeSixPrizeReplay:true,
    syntheticSimultaneousActiveLethalDamage:true,
    syntheticBasicBenchAllocations:matchedBenchSlots,
    syntheticActiveReplacements:forcedActiveReplacements,
    before,afterReducer,dispatchLedger,
    nativeKOEntitlements,
    pendingPrizeAudit,nativePendingComparison,
    pendingPrizesByClaimant,
    hypotheticalPaperRemainingPrizes,
    hypotheticalPaperLeader,
    prematureNativeOutcomeVersusPendingPrizeLeader:
      hypotheticalPaperLeader!==game.winner,
    nativeFinished:game.finished,nativeWinner:game.winner,
    nativeFinalPrizes:game.prizesRemaining,nativeActions:game.actions,
    nativeEndReason:game.endReason,
    competitiveQualified:false
  };
}

/**
 * Independently exercise ordinary non-tiebreaker simultaneous KO at two
 * remaining Prizes per seat. This deliberately simulates previous Prize
 * taking by moving four real owned Prize objects to the matching owner's hand.
 * Neither the artificial prize-taking nor simultaneous lethal damage was a
 * legal action. The point is the native decision on one already prepared
 * state. Both printed source Actives are forced to two-Prize Basics.
 *
 * @param {0|1} reverse Swaps source rank 11 and rank 20 physical seats.
 * @param {Map<number,object>} byRank Exact source lists.
 * @returns {object} Read-only native ordinary-game adjudication receipt.
 */
function oneOrdinaryDoubleFinalKO(reverse,byRank){
  const ranks=reverse?[20,11]:[11,20];
  const decks=ranks.map(rank=>byRank.get(rank).cardIds);
  assert.ok(decks.every(deck=>deck.length===60));
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  const {PokemonCard}=require(path.join(output,'game/store/card/pokemon-card'));
  const {Stage}=require(path.join(output,'game/store/card/card-types'));
  const {checkState}=require(path.join(output,'game/store/effect-reducers/check-effect'));
  const originalDispatch=Store.prototype.dispatch;
  const originalReduce=Store.prototype.reduceEffect;
  let root=null,owners=null,staged=false;
  let before=null,after=null;
  const koEntitlements=[],physicalSwaps=[];
  Store.prototype.reduceEffect=function auditedNormalLastKO(state,effect){
    const result=originalReduce.call(this,state,effect);
    if(this===root&&staged&&effect.constructor.name==='KnockOutEffect'){
      const victimSeat=state.players.indexOf(effect.player);
      assert.ok(victimSeat===0||victimSeat===1);
      koEntitlements.push({
        victimSeat,claimantSeat:1-victimSeat,
        prizeCount:effect.prizeCount,
        preventDefault:effect.preventDefault===true,
        alternatePrizeDestination:effect.prizeDestination!==undefined
      });
    }
    return result;
  };
  Store.prototype.dispatch=function ordinaryDoubleLastPrize(action,...args){
    if(!root&&action.constructor.name==='AddPlayerAction')root=this;
    const result=originalDispatch.call(this,action,...args);
    if(this!==root)return result;
    const state=this.state;
    if(action.constructor.name==='AddPlayerAction'&&
       state.players.length===2&&!owners)
      owners=captureInitialPhysicalOwners(state,60);
    if(!owners||staged||state.players.length!==2||
       state.turn!==1||state.phase!==GamePhase.PLAYER_TURN||
       state.prompts.some(p=>p.result===undefined))
      return result;
    assert.notEqual(state.isSuddenDeath,true,
      'Ordinary prize-ending fixture must remain outside sudden death');
    for(let seat=0;seat<2;seat++){
      const player=state.players[seat];
      const desired=ranks[seat]===11?'Crobat V':'Regidrago V';
      assert.equal(player.getPrizeLeft(),6);
      const current=player.active.getPokemonCard();
      assert.ok(current instanceof PokemonCard&&current.stage===Stage.BASIC);
      if(current.name!==desired){
        const sources=[['deck',player.deck],['hand',player.hand]];
        const located=sources.find(([,zone])=>zone.cards.some(card=>
          card instanceof PokemonCard&&card.stage===Stage.BASIC&&
          card.name===desired));
        assert.ok(located,'Expected unplayed original 2-Prize Basic: '+desired);
        const [zoneName,zone]=located;
        assert.equal(player.active.cards.length,1,
          'Prepared ordinary game must have unattached Basic Active');
        const index=zone.cards.findIndex(card=>
          card instanceof PokemonCard&&card.stage===Stage.BASIC&&
          card.name===desired);
        const replacement=zone.cards[index];
        zone.cards[index]=current;
        player.active.cards[0]=replacement;
        physicalSwaps.push({
          seat,from:zoneName,oldActive:current.name,newActive:replacement.name
        });
      }
      if(!player.bench.some(slot=>slot.getPokemonCard())){
        const available=player.deck.cards.find(card=>
          card instanceof PokemonCard&&card.stage===Stage.BASIC);
        const empty=player.bench.find(slot=>!slot.getPokemonCard());
        assert.ok(available&&empty,'Need owned original Basic for live Bench');
        player.deck.cards.splice(player.deck.cards.indexOf(available),1);
        empty.cards.push(available);
        physicalSwaps.push({seat,from:'deck',to:'bench',name:available.name});
      }
      const realPrizeSlots=player.prizes.filter(pr=>pr.cards.length>0);
      assert.equal(realPrizeSlots.length,6);
      for(const prize of realPrizeSlots.slice(0,4))
        player.hand.cards.push(...prize.cards.splice(0));
    }
    const audit=inspectPhysicalCardZones(state,owners);
    assert.deepEqual(fixedDeckCountAnomalies(audit),[]);
    assert.deepEqual(audit.originalOwnerCustody.missingOriginalCounts,[0,0]);
    assert.deepEqual(audit.originalOwnerCustody.displacedOriginalReferences,[]);
    before={
      isSuddenDeath:state.isSuddenDeath,
      prizes:state.players.map(p=>p.getPrizeLeft()),
      active:state.players.map(p=>p.active.getPokemonCard()?.name??null),
      bench:state.players.map(p=>
        p.bench.filter(s=>s.getPokemonCard()).length)
    };
    assert.deepEqual(before.prizes,[2,2]);
    assert.ok(before.bench.every(n=>n>0));
    for(const player of state.players)player.active.damage=9999;
    staged=true;
    checkState(this,state);
    after={
      winner:state.winner,phase:state.phase,
      prizes:state.players.map(p=>p.getPrizeLeft()),
      active:state.players.map(p=>p.active.getPokemonCard()?.name??null),
      bench:state.players.map(p=>
        p.bench.filter(s=>s.getPokemonCard()).length)
    };
    return result;
  };
  let game,dispatchLedger=null;
  try{
    const observed=withNativeKODispatchLedger(()=>runMatch({
      deckA:decks[0],deckB:decks[1],seed:SEED,maxActions:100,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      doubleDragonRecovery:true,capturePhysicalZoneIntegrity:true,
      captureOriginalOwnerIntegrity:true,
      enforceSettledPhysicalZoneIntegrity:true,
      label:'agent24-synthetic-ordinary-simultaneous-last-prizes-'+reverse
    }),{Store});
    game=observed.result;
    dispatchLedger=observed.evidence;
  }finally{
    Store.prototype.dispatch=originalDispatch;
    Store.prototype.reduceEffect=originalReduce;
  }
  assert.ok(owners&&staged&&before&&after);
  assert.equal(owners.size,120);
  assert.equal(dispatchLedger.sameResolutionBatchAuthenticated,false);
  const observedKO=dispatchLedger.events.filter(e=>
    e.koEntitlements.length===2);
  assert.equal(observedKO.length,1);
  assert.deepEqual(observedKO[0].koEntitlements,koEntitlements);
  assert.deepEqual(observedKO[0].preFirstKOPrizes,[2,2]);
  assert.equal(observedKO[0].suddenDeathAtFirstKO,false);
  assert.deepEqual([...before.active].sort(),['Crobat V','Regidrago V']);
  assert.equal(koEntitlements.length,2);
  assert.ok(koEntitlements.every(e=>
    e.prizeCount===2&&!e.preventDefault&&!e.alternatePrizeDestination));
  assert.ok(game.finished,'Ordinary simultaneous KO must reach native terminal');
  assert.equal(game.winner,0,'Expected first physical-seat priority');
  assert.deepEqual(after.prizes,[0,2],
    'Expected native first claimant to take both final Prizes exclusively');
  const ordinaryPendingPrizeAudit=projectPendingOrdinaryPrizes({
    authenticatedOrdinaryEpoch:staged&&
      before.isSuddenDeath!==true,
    singleSettledResolutionBatch:true,
    physicalRemaining:before.prizes,
    koEntitlements
  });
  const nativePendingComparison=compareNativePendingPrizeWinner({
    projection:ordinaryPendingPrizeAudit,
    nativeFinished:game.finished,
    nativeEndReason:game.endReason,
    nativeWinnerSeat:game.winner
  });
  assert.equal(ordinaryPendingPrizeAudit.projectedBothPrizeEmpty,true);
  assert.deepEqual(ordinaryPendingPrizeAudit.projectedRemainingPrizes,[0,0]);
  assert.equal(nativePendingComparison.status,
    'NATIVE_WINNER_WITHOUT_PENDING_PRIZE_LEAD');
  assert.equal(nativePendingComparison.paperGameOutcomeQualified,false);
  return {
    reverse,ranks,seed:SEED,genuineOriginal60PerSeat:true,
    initialSixPrizesNativeDealt:true,syntheticFourPrizeMovesPerSeat:true,
    syntheticLethalDamage:true,syntheticOwnedBoardSwaps:physicalSwaps,
    before,after,koEntitlements,dispatchLedger,
    ordinaryPendingPrizeAudit,nativePendingComparison,
    hypotheticalBothAwardsRemaining:[0,0],
    simultaneousBothTakeLastPrizesNativeNotTie:true,
    nativeFinished:game.finished,nativeWinner:game.winner,
    nativeEndReason:game.endReason,
    competitiveQualified:false
  };
}

/** @returns {object} */
function main(){
  initializeCards();
  const {byRank}=registration();
  const rows=[
    one(0,byRank),
    one(1,byRank),
    one(1,byRank,{forceOppositeLeader:true})
  ];
  const ordinaryDoubleFinalKOs=[
    oneOrdinaryDoubleFinalKO(0,byRank),
    oneOrdinaryDoubleFinalKO(1,byRank)
  ];
  return {
    schema:'agent24-native-replay-synthetic-simultaneous-ko-v2',
    pinnedTwinleaf:PIN,rows,ordinaryDoubleFinalKOs,
    competitiveQualifiedGames:0,
    note:'Synthetic lethal Active damage; optional synthetic Basic Bench and Active swaps explicitly tagged. This is a pinned reducer counterexample, not a paper-legal attack trace, game win or qualified match.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main,one,oneOrdinaryDoubleFinalKO,SEED};
