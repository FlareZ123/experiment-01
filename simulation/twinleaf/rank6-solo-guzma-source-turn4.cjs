'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withSourceOpeningProbe}=require('./rank6-seed-opening-probe.cjs');
const {withGuzmaHalaSourceFork,withDamageObserver}=
  require('./rank6-seed-guzma-hala-fork.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p */
const engine=p=>require(path.join(output,p));
const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
const {Store}=engine('game/store/store');
const {GamePhase}=engine('game/store/state/state');
const {PlayCardAction,PlayerType,SlotType}=
  engine('game/store/actions/play-card-action');
const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
const {AttackAction}=engine('game/store/actions/game-actions');

/**
 * Public state and the acting player's visible hand only.
 * Card names in physical Prize cards or the unsearched deck are not inspected
 * by this decision policy.
 * @param {object} state
 */
function soloGuzmaVisibleBoard(state){
  const own=state.players[1];
  const opponent=state.players[0];
  return {
    turn:state.turn,
    actingSeat:state.activePlayer,
    hand:own.hand.cards.map(card=>card.fullName),
    ownActive:own.active.getPokemonCard()?.name||null,
    ownActiveEnergy:own.active.energies.cards.map(card=>card.fullName),
    ownBench:own.bench.filter(slot=>slot.getPokemonCard())
      .map(slot=>slot.getPokemonCard().name),
    opponentActive:opponent.active.getPokemonCard()?.name||null,
    opponentBench:opponent.bench.filter(slot=>slot.getPokemonCard())
      .map(slot=>slot.getPokemonCard().name),
    stadium:own.stadium.cards.map(card=>card.name),
    ownPrizeCount:own.prizes.filter(slot=>slot.cards.length>0).length,
    opponentPrizeCount:opponent.prizes.filter(slot=>slot.cards.length>0).length
  };
}

/**
 * The control bot proposes first on the exact live turn-4 Store State in both
 * arms. The intervention changes only the selected action thereafter.
 * A root-Store identity guard excludes speculative cloned States.
 *
 * @template T
 * @param {()=>T} work
 * @param {{forceGuzma:boolean}} options
 * @returns {{result:T,turn4Start:object|null,events:object[],gustResolved:boolean,turn4Damage:object|null}}
 */
function withSoloGuzmaTurn4(work,options){
  assert.equal(typeof work,'function');
  assert.equal(typeof options?.forceGuzma,'boolean');
  const oldDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldDecode?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');

  let root=null;
  let stage='start';
  let turn4Start=null;
  let gustResolved=false;
  let turn4Damage=null;
  const events=[];

  const observeDispatch=function(action,...rest){
    if(!root&&action?.constructor?.name==='AddPlayerAction')root=this;
    const before=this===root&&action instanceof AttackAction&&
      action.name==='Volt Cyclone'&&this.state.turn===4&&
      this.state.activePlayer===1 ?
      {defender:this.state.players[0].active.getPokemonCard()?.name||null,
        damage:this.state.players[0].active.damage} : null;
    if(before){
      turn4Damage={attack:'Volt Cyclone',target:before.defender,
        damageBefore:before.damage,damageAfter:null};
    }
    const result=oldDispatch.value.call(this,action,...rest);
    if(this===root&&turn4Damage&&turn4Damage.damageAfter===null&&
      this.state.players[0].active.getPokemonCard()?.name===turn4Damage.target&&
      this.state.players[0].active.damage>turn4Damage.damageBefore){
      turn4Damage.damageAfter=this.state.players[0].active.damage;
    }
    return result;
  };

  const choose=function(state,...args){
    const player=state.players.find(p=>p.id===this.client?.id);
    const live=state===root?.state&&state.turn===4&&
      state.activePlayer===1&&state.phase===GamePhase.PLAYER_TURN&&
      player?.id===202;
    if(!live)return oldDecode.value.call(this,state,...args);
    const prompt=state.prompts.find(p=>p.playerId===player.id&&p.result===undefined);

    if(stage==='start'&&!prompt){
      const before=soloGuzmaVisibleBoard(state);
      const proposed=oldDecode.value.call(this,state,...args);
      assert.deepEqual(soloGuzmaVisibleBoard(state),before,
        'Original bot proposal changed visible physical source state');
      assert.equal(before.ownActive,'Iron Thorns ex');
      assert.deepEqual(before.ownBench,[],'Source Iron Thorns must be solo');
      assert.equal(before.opponentActive,'Dialga-GX');
      assert.ok(before.opponentBench.includes('Shadow Rider Calyrex V'),
        'Champion must have a Benched Guzma target after Acerola');
      assert.ok(before.ownActiveEnergy.some(name=>
        name.startsWith('Double Colorless Energy ')));
      assert.ok(before.stadium.includes('Thunder Mountain Prism Star'));
      assert.ok(before.hand.some(name=>name.startsWith('Guzma ')));
      turn4Start=before;
      events.push({turn:4,selected:'first-turn4-proposal',
        originalAction:proposed?.constructor?.name||null,
        originalCard:proposed?.constructor?.name==='PlayCardAction'?
          player.hand.cards[proposed.handIndex]?.name||null:null});
      if(!options.forceGuzma){
        stage='control';
        return proposed;
      }
      const index=player.hand.cards.findIndex(card=>card.name==='Guzma');
      assert.ok(index>=0);
      stage='pick-opponent';
      events.push({turn:4,selected:'Play Guzma',sourceHandIndex:index});
      return new PlayCardAction(player.id,index,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
    }

    if(stage==='pick-opponent'){
      assert.equal(prompt?.constructor.name,'ChoosePokemonPrompt',
        'Live Guzma did not create the expected opponent Bench prompt');
      const target=state.players[0].bench.find(slot=>
        slot.getPokemonCard()?.name==='Shadow Rider Calyrex V');
      assert.ok(target,'The public Guzma target disappeared');
      assert.equal(prompt.validate([target],state),true,
        'Live opponent-target prompt rejects its source Benched V');
      stage='attack-ready';
      events.push({turn:4,selected:'Gust opposing Shadow Rider Calyrex V'});
      return new ResolvePromptAction(prompt.id,[target]);
    }

    if(stage==='attack-ready'){
      assert.equal(prompt,undefined,'Unexpected own-switch prompt on empty Bench');
      assert.equal(player.active.getPokemonCard()?.name,'Iron Thorns ex');
      assert.equal(state.players[0].active.getPokemonCard()?.name,
        'Shadow Rider Calyrex V');
      assert.equal(player.bench.filter(slot=>slot.getPokemonCard()).length,0);
      assert.ok(player.active.energies.cards.some(card=>
        card.name==='Double Colorless Energy'));
      assert.ok(player.stadium.cards.some(card=>
        card.name==='Thunder Mountain Prism Star'));
      gustResolved=true;
      stage='done';
      events.push({turn:4,selected:'Attack Volt Cyclone after solo Guzma'});
      return new AttackAction(player.id,'Volt Cyclone');
    }

    return oldDecode.value.call(this,state,...args);
  };

  Object.defineProperty(Store.prototype,'dispatch',{
    ...oldDispatch,value:observeDispatch
  });
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...oldDecode,value:choose
  });
  let result;
  try{result=work();}
  finally{
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',oldDecode);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
  }
  return {result,turn4Start,events,gustResolved,turn4Damage};
}

/** One physical rank-1/rank-6 source game and a turn-four action fork. */
function main(){
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank6=plan.opponents.find(row=>row.rank===6);
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(rank6?.cards?.length,60);
  const request={
    deckA:plan.candidate.cards,deckB:rank6.cards,seed:20367160,
    maxActions:125,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  /** @param {boolean} forceGuzma */
  const run=forceGuzma=>withSourceOpeningProbe(()=>
    withGuzmaHalaSourceFork(()=>
      withSoloGuzmaTurn4(()=>withDamageObserver(()=>runMatch(request)),
        {forceGuzma}),["Trainers' Mail",'Tropical Beach']));

  const control=run(false),alternate=run(true);
  assert.equal(control.out.completed,true);
  assert.equal(alternate.out.completed,true);
  assert.equal(control.out.result.result.attack.damageAfter,140);
  assert.equal(alternate.out.result.result.attack.damageAfter,140);
  assert.deepEqual(control.observed.hand,alternate.observed.hand);
  assert.deepEqual(control.observed.prizes,alternate.observed.prizes);
  assert.deepEqual(control.observed.doubleColorless,
    alternate.observed.doubleColorless);
  const a=control.out.result,b=alternate.out.result;
  assert.ok(a.turn4Start&&b.turn4Start,
    'Both source arms must reach the same live turn-four decision');
  assert.deepEqual(a.turn4Start,b.turn4Start,
    'Unchanged source prefix must reach the same predecision visible board');
  assert.equal(b.gustResolved,true);
  assert.deepEqual(b.turn4Damage,{
    attack:'Volt Cyclone',target:'Shadow Rider Calyrex V',
    damageBefore:0,damageAfter:140
  },'Paper-legal solo Guzma must leave the powered attacker able to deal 140');

  const game=b.result.result;
  assert.equal(game.firstTurnSlot,0);
  const record={
    evidence:'Fixed physical-source printed rank1/rank6 turn-four Guzma Store fork',
    seed:20367160,
    sourceDeckHashes:game.deckHashes,
    printedOpeningIdentical:true,
    controlPredecision:a.turn4Start,
    alternatePredecision:b.turn4Start,
    controlOriginalBotChoice:a.events,
    alternateActions:b.events,
    alternateGuzmaAndAttackResolved:b.gustResolved,
    actualSourceTurn4DefenderDamage:b.turn4Damage,
    bothArmsGameFinished:[a.result.result.finished,game.finished],
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    note:'Action-path test only. Target choice and gust are scripted; no competitive winner is inferred.'
  };
  console.log(JSON.stringify(record,null,2));
  return record;
}

if(require.main===module)main();
module.exports={soloGuzmaVisibleBoard,withSoloGuzmaTurn4,main};
