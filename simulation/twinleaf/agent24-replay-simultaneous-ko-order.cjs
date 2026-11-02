'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {
  captureInitialPhysicalOwners,inspectPhysicalCardZones,
  fixedDeckCountAnomalies
}=require('./physical-card-ledger.cjs');

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
function one(reverse,byRank){
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
  let root=null,owners=null,stagedTie=false,resetSeen=false;
  let replayOpened=false,doubleKOStaged=false;
  let matchedBenchSlots=0;
  let before=null,afterReducer=null;
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
  let game=null;
  try{
    game=runMatch({
      deckA:a,deckB:b,seed:SEED,maxActions:260,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      doubleDragonRecovery:true,capturePhysicalZoneIntegrity:true,
      captureOriginalOwnerIntegrity:true,enforceSettledPhysicalZoneIntegrity:true,
      label:'agent24-experimental-simultaneous-double-ko-'+reverse
    });
  }finally{
    Store.prototype.dispatch=original;
  }
  assert.ok(owners&&stagedTie&&resetSeen&&replayOpened&&doubleKOStaged);
  assert.equal(owners.size,120);
  assert.deepEqual(before.prizes,[6,6]);
  assert.ok(before.bench.every(x=>x>=1));
  assert.ok(game.finished,'Staged simultaneous KO did not reach native terminal');
  return {
    reverse,rankA:reverse?11:20,rankB:reverse?20:11,seed:SEED,
    genuineFirstSourceDeal:true,experimentalInitialTie:true,
    genuineNativeSixPrizeReplay:true,
    syntheticSimultaneousActiveLethalDamage:true,
    syntheticBasicBenchAllocations:matchedBenchSlots,
    before,afterReducer,
    nativeFinished:game.finished,nativeWinner:game.winner,
    nativeFinalPrizes:game.prizesRemaining,nativeActions:game.actions,
    nativeEndReason:game.endReason,
    competitiveQualified:false
  };
}

/** @returns {object} */
function main(){
  initializeCards();
  const {byRank}=registration();
  const rows=[one(0,byRank),one(1,byRank)];
  return {
    schema:'agent24-native-replay-synthetic-simultaneous-ko-v1',
    pinnedTwinleaf:PIN,rows,competitiveQualifiedGames:0,
    note:'Both lethal Active damages are synthetic, possibly Bench placement too. Isolated pinned reducer ordering only; no legal simultaneous damage attack, actual game win, or paper match.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main,one,SEED};
