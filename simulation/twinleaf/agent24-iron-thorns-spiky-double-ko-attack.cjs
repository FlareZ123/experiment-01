'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {registration}=require('./agent47-rank20-apex-natural-audit.cjs');
const {captureInitialPhysicalOwners,inspectPhysicalCardZones,
  fixedDeckCountAnomalies}=require('./physical-card-ledger.cjs');
const {
  projectPendingReplayPrizes,projectPendingOrdinaryPrizes,
  compareNativePendingPrizeWinner
}=require('../evaluation/agent24-pending-replay-prize-disposition.cjs');

const SEED=1847000101;
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Move an authentic original card to a fixture target. A single Prized copy
 * is swapped with a same-owner deck card, preserving six hidden Prize objects
 * in the strictly synthetic attack setup.
 * @param {object} owner
 * @param {string} name
 * @param {object} target
 * @returns {object} Provenance of a physical-card relocation.
 */
function stageOwnedCard(owner,name,target){
  if(target.cards.some(c=>c.name===name))
    return {name,from:'already-attached'};
  const sources=[
    {zone:owner.deck,label:'deck'},
    {zone:owner.hand,label:'hand'},
    {zone:owner.discard,label:'discard'},
    ...owner.bench.map((zone,i)=>({zone,label:'bench-'+i})),
    ...owner.prizes.map((zone,i)=>({zone,label:'prize-'+i}))
  ];
  for(const {zone,label} of sources){
    const i=zone.cards.findIndex(c=>c.name===name);
    if(i<0)continue;
    const [card]=zone.cards.splice(i,1);
    if(label.startsWith('prize-')){
      assert.ok(owner.deck.cards.length>0,'Need prize swap filler');
      const [filler]=owner.deck.cards.splice(0,1);
      zone.cards.push(filler);
    }
    target.cards.push(card);
    return{name,from:label};
  }
  throw new Error('Physical source card not available for staging: '+name);
}

/**
 * One root attack under genuine native printed card reducers after synthetic
 * setup edits. It is deliberately outside ordinary gameplay and cannot be
 * counted as a competitive game. Two natural original 60s are unchanged.
 *
 * @param {0|1} reverse
 * @param {Map<number,object>} byRank
 * @param {{ordinaryLastPrizes?:boolean}} [settings]
 * @returns {object}
 */
function one(reverse,byRank,{ordinaryLastPrizes=false}={}){
  const a=byRank.get(reverse?29:6).cardIds;
  const b=byRank.get(reverse?6:29).cardIds;
  assert.equal(a.length,60);assert.equal(b.length,60);
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  const {AttackAction}=require(path.join(output,'game/store/actions/game-actions'));
  const previousDispatch=Store.prototype.dispatch;
  const previousReduce=Store.prototype.reduceEffect;
  let root=null,owners=null,stagedTie=false,resetSeen=false,replayOpened=false;
  let forcedAttack=false,forcedFromSeat=null,attackBefore=null,attackSource=null;
  let attackingActive=null,defendingActive=null;
  const materializations=[],koEntitlements=[],damageEffects=[];
  Store.prototype.reduceEffect=function spikyNativeAudit(state,effect){
    const result=previousReduce.call(this,state,effect);
    if(this!==root||!forcedAttack)return result;
    const name=effect.constructor.name;
    if(name==='KnockOutEffect'){
      const victimSeat=state.players.indexOf(effect.player);
      assert.ok(victimSeat===0||victimSeat===1);
      koEntitlements.push({
        victimSeat,claimantSeat:1-victimSeat,
        prizeCount:effect.prizeCount,
        preventDefault:effect.preventDefault===true,
        alternatePrizeDestination:effect.prizeDestination!==undefined
      });
    }else if(name==='DealDamageEffect'||name==='PutCountersEffect'){
      damageEffects.push({
        type:name,
        effectTargetsDefender:effect.target===defendingActive,
        effectTargetsAttacker:effect.target===attackingActive,
        damage:effect.damage??null
      });
    }
    return result;
  };
  Store.prototype.dispatch=function actualSpikyStoreAttack(action,...args){
    if(!root&&action.constructor.name==='AddPlayerAction')root=this;
    const state=this.state;
    const settled=state.players.length===2&&
      !state.prompts.some(p=>p.result===undefined);
    if(this===root&&replayOpened&&!forcedAttack&&
       settled&&state.phase===GamePhase.PLAYER_TURN&&state.turn>=2){
      const seat=state.activePlayer;
      assert.ok(seat===0||seat===1);
      const attacker=state.players[seat];
      const defender=state.players[1-seat];
      assert.equal(attacker.active.getPokemonCard()?.name,'Iron Thorns ex');
      assert.equal(defender.active.getPokemonCard()?.name,'Iron Thorns ex');
      for(const player of state.players){
        if(player.bench.some(s=>s.getPokemonCard()))continue;
        const empty=player.bench.find(s=>!s.getPokemonCard());
        assert.ok(empty,'No open slot for an original Bench Basic');
        materializations.push(stageOwnedCard(player,'Iron Thorns ex',empty));
      }
      materializations.push(stageOwnedCard(attacker,'Speed Lightning Energy',
        attacker.active));
      materializations.push(stageOwnedCard(attacker,'Double Colorless Energy',
        attacker.active));
      materializations.push(stageOwnedCard(defender,'Spiky Energy',
        defender.active));
      attacker.active.damage=210;
      defender.active.damage=90;
      const census=inspectPhysicalCardZones(state,owners);
      assert.deepEqual(fixedDeckCountAnomalies(census),[]);
      assert.deepEqual(census.originalOwnerCustody.missingOriginalCounts,[0,0]);
      assert.equal(census.originalOwnerCustody.displacedOriginalReferences.length,0);
      assert.deepEqual(state.players.map(p=>p.getPrizeLeft()),
        ordinaryLastPrizes?[2,2]:[6,6]);
      assert.equal(state.isSuddenDeath===true,!ordinaryLastPrizes);
      attackBefore={
        seat,turn:state.turn,
        physicalPrizeCounts:state.players.map(p=>p.getPrizeLeft()),
        attacker:attacker.active.getPokemonCard()?.name,
        defender:defender.active.getPokemonCard()?.name,
        attackerDamage:attacker.active.damage,
        defenderDamage:defender.active.damage,
        attackerBench:attacker.bench.filter(s=>s.getPokemonCard()).length,
        defenderBench:defender.bench.filter(s=>s.getPokemonCard()).length,
        defenderSpikyAttached:defender.active.cards.some(c=>
          c.name==='Spiky Energy'),
        attackerLightningAttached:attacker.active.cards.some(c=>
          c.name==='Speed Lightning Energy'),
        attackerDoubleColorlessAttached:attacker.active.cards.some(c=>
          c.name==='Double Colorless Energy')
      };
      attackingActive=attacker.active;
      defendingActive=defender.active;
      forcedAttack=true;forcedFromSeat=seat;
      attackSource='substituted-real-Store-AttackAction-Volt-Cyclone';
      return previousDispatch.call(this,
        new AttackAction(attacker.id,'Volt Cyclone'),...args);
    }
    const result=previousDispatch.call(this,action,...args);
    if(this!==root)return result;
    const after=this.state;
    if(action.constructor.name==='AddPlayerAction'&&
       after.players.length===2&&!owners)
      owners=captureInitialPhysicalOwners(after,60);
    if(!owners)return result;
    const ready=after.players.length===2&&
       !after.prompts.some(p=>p.result===undefined);
    if(!stagedTie&&ready&&after.turn===1&&
       after.phase===GamePhase.PLAYER_TURN){
      for(const player of after.players){
        const authenticPrizes=player.prizes.filter(p=>p.cards.length>0);
        assert.equal(authenticPrizes.length,6);
        const moving=ordinaryLastPrizes?authenticPrizes.slice(0,4):
          authenticPrizes;
        for(const prize of moving)
          player.hand.cards.push(...prize.cards.splice(0));
      }
      stagedTie=true;
      if(ordinaryLastPrizes)replayOpened=true;
    }else if(stagedTie&&after.turn===0&&
             after.phase===GamePhase.SETUP&&after.isSuddenDeath===true){
      resetSeen=true;
    }else if(resetSeen&&ready&&after.turn>=1&&
             after.phase===GamePhase.PLAYER_TURN&&
             after.isSuddenDeath===true){
      replayOpened=true;
    }
    return result;
  };
  let game;
  try{
    game=runMatch({
      deckA:a,deckB:b,seed:SEED,maxActions:240,
      strictPromptValidation:true,isolatePolicyRandomness:true,
      doubleDragonRecovery:true,capturePhysicalZoneIntegrity:true,
      captureOriginalOwnerIntegrity:true,
      enforceSettledPhysicalZoneIntegrity:true,
      label:'agent24-staged-real-Spiky-Volt-Cyclone-double-ko-'+reverse+
        (ordinaryLastPrizes?'-ordinary-last-prize':'-replay')
    });
  }finally{
    Store.prototype.dispatch=previousDispatch;
    Store.prototype.reduceEffect=previousReduce;
  }
  assert.ok(owners&&stagedTie&&replayOpened&&forcedAttack);
  assert.ok(ordinaryLastPrizes||resetSeen,
    'Replay mode requires an actual native new six-Prize deal');
  assert.equal(owners.size,120);
  assert.ok(game.finished,'Real Store attack did not reach a native terminal');
  assert.equal(koEntitlements.length,2,
    'Real Volt Cyclone+Spiky root failed to create two KOs');
  assert.ok(koEntitlements.every(e=>
    e.prizeCount===2&&!e.preventDefault&&!e.alternatePrizeDestination));
  assert.ok(damageEffects.some(e=>e.type==='PutCountersEffect'&&
    e.effectTargetsAttacker),
    'Spiky Energy counter effect did not apply to attacker');
  const pendingPrizeAudit=ordinaryLastPrizes?
    projectPendingOrdinaryPrizes({
      authenticatedOrdinaryEpoch:replayOpened&&resetSeen===false,
      singleSettledResolutionBatch:true,
      physicalRemaining:[2,2],koEntitlements
    }):
    projectPendingReplayPrizes({
      authenticatedReplayEpoch:replayOpened&&resetSeen===true,
      singleSettledResolutionBatch:true,
      physicalRemaining:[6,6],koEntitlements
    });
  assert.equal(pendingPrizeAudit.status,'PENDING_KO_PRIZES_NO_STRICT_LEAD');
  assert.deepEqual(pendingPrizeAudit.projectedRemainingPrizes,
    ordinaryLastPrizes?[0,0]:[4,4]);
  assert.equal(pendingPrizeAudit.projectedBothPrizeEmpty,
    ordinaryLastPrizes);
  const nativePendingComparison=compareNativePendingPrizeWinner({
    projection:pendingPrizeAudit,
    nativeFinished:game.finished,
    nativeEndReason:game.endReason,
    nativeWinnerSeat:game.winner
  });
  assert.equal(nativePendingComparison.status,
    'NATIVE_WINNER_WITHOUT_PENDING_PRIZE_LEAD');
  assert.equal(nativePendingComparison.paperGameOutcomeQualified,false);
  assert.equal(game.winner,0,
    'Expected pinned native first-seat tiebreak bias');
  return {
    schema:'agent24-real-printed-attack-staged-spiky-double-ko-v1',
    pin:PIN,rankA:reverse?29:6,rankB:reverse?6:29,
    seed:SEED,reverse,
    initialRealSourceSixties:true,
    initialTieExperimenterStaged:!ordinaryLastPrizes,
    genuineNativeFreshSixPrizeReplay:!ordinaryLastPrizes,
    syntheticFourPrizeMovesPerOwner:ordinaryLastPrizes,
    syntheticEnergyAndDamagePreparation:true,
    actualPrintedAttackRoot:true,attackSource,forcedFromSeat,attackBefore,
    stagedOwnerCardMoves:materializations,
    damageEffects,koEntitlements,pendingPrizeAudit,nativePendingComparison,
    nativeFinished:game.finished,nativeWinner:game.winner,
    nativeFinalPrizes:game.prizesRemaining,
    nativeActions:game.actions,
    competitiveQualified:false
  };
}

/** @returns {object} */
function main(){
  initializeCards();
  const {byRank}=registration();
  return {
    schema:'agent24-real-printed-attack-staged-spiky-double-ko-panel-v2',
    pinnedTwinleaf:PIN,
    rows:[one(0,byRank),one(1,byRank)],
    ordinaryRows:[
      one(0,byRank,{ordinaryLastPrizes:true}),
      one(1,byRank,{ordinaryLastPrizes:true})
    ],
    competitiveQualifiedGames:0,
    caveat:'Both source 60s real rank6/rank29. Synthetic either tie or prior four-Prize movement, Bench, Energy, and damage setup; actual native Volt Cyclone attack + actual Spiky Energy reducer. No legal turn-by-turn development or field-game evidence.'
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
module.exports={main,one};
