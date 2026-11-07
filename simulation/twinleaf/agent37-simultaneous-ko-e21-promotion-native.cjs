'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {
  withInstanceScopedPaperKoBeforeEndTurn,VERSION,PINNED
}=require('./agent37-paper-ko-instance-scoped-hook.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} p @returns {any} */
const native=p=>require(path.join(OUTPUT,p));

/**
 * Actual simultaneous active KO: Ferroseed's 60 self-damage and 60 attack
 * damage KO Ferroseed and a 60-HP Duskull together. By default, owner's Unown
 * starts on the Bench with Powerglass; terminal fixtures may omit either Bench.
 *
 * @param {0|1} actorSeat Physical state.players index of the attacking owner.
 * @param {boolean|Function} useHook Apply v1 (true) or a supplied research-owned per-Store hook.
 * @param {number} prizesPerPlayer Prize cards created for each player.
 * @param {boolean} terminalMode Return terminal state without normal promotion assertions.
 * @param {boolean} enemyHasBench Include the defender's promotion Pokémon.
 * @param {boolean} ownerHasBench Include the attacking owner's promotion Pokémon.
 * @param {{enemyActiveName?:string,enemyEvolutionBaseName?:string,enemyActiveDamage?:number,ownerPrizes?:number,enemyPrizes?:number,stopAfterAttack?:boolean}} fixture Optional staged Active, Prize-count, and post-attack snapshot profile.
 * @returns {object} Native prompt, Prize, promotion, and Powerglass receipt.
 */
function runOne(actorSeat,useHook,prizesPerPlayer=6,terminalMode=false,enemyHasBench=true,ownerHasBench=true,fixture={}){
  const cards=initializeCards();
  let id=940000+actorSeat*1000;
  const card=name=>{
    const value=cards.getCardByName(name);
    assert.ok(value,'Missing pinned printing '+name);
    value.id=id++;
    return value;
  };
  const {Store}=native('game/store/store');
  const {Player}=native('game/store/state/player');
  const {CardList}=native('game/store/state/card-list');
  const {PokemonCardList}=native('game/store/state/pokemon-card-list');
  const {GamePhase}=native('game/store/state/state');
  const {Format}=native('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    native('game/store/actions/resolve-prompt-action');

  const store=new Store({onStateChange(){}});
  const state=store.state;
  const owner=new Player(),enemy=new Player();
  owner.id=101;owner.name='Ferroseed attacker';
  enemy.id=202;enemy.name='Duskull defender';
  state.players=actorSeat===0?[owner,enemy]:[enemy,owner];
  state.activePlayer=actorSeat;
  state.turn=16;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;

  const enemyActiveName=fixture.enemyActiveName||'Duskull VIV';
  owner.active.cards.push(card('Ferroseed NXD'));
  owner.active.energies.cards.push(
    card('Metal Energy MEE'),
    card('Double Colorless Energy NXD')
  );
  if(fixture.enemyEvolutionBaseName){
    enemy.active.cards.push(card(fixture.enemyEvolutionBaseName));
  }
  enemy.active.cards.push(card(enemyActiveName));
  enemy.active.damage=fixture.enemyActiveDamage??0;

  if(ownerHasBench){
    const ownerBench=new PokemonCardList();
    ownerBench.cards.push(card('Unown AOR'));
    owner.bench.push(ownerBench);
  }
  if(enemyHasBench){
    const enemyBench=new PokemonCardList();
    enemyBench.cards.push(card('Trubbish FST'));
    enemy.bench.push(enemyBench);
  }

  owner.hand.cards.push(card('Powerglass SFA'));
  owner.discard.cards.push(card('Psychic Energy MEE'));

  for(const [player,prizeCount] of [
    [owner,fixture.ownerPrizes??prizesPerPlayer],
    [enemy,fixture.enemyPrizes??prizesPerPlayer]
  ]){
    for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy MEE'));
    for(let i=0;i<prizeCount;i++){
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }

  if(ownerHasBench){
    store.dispatch(new PlayCardAction(owner.id,0,{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0
    }));
    assert.equal(owner.bench[0].tools[0].fullName,'Powerglass SFA');
  }
  assert.equal(owner.active.getPokemonCard().fullName,'Ferroseed NXD');
  assert.equal(enemy.active.getPokemonCard().fullName,enemyActiveName);
  assert.equal(owner.active.energies.cards.length,2);
  assert.equal(enemy.active.damage,fixture.enemyActiveDamage??0);

  const runNativeTransaction=()=>{
    store.dispatch(new AttackAction(owner.id,'Self Destruct'));
    const seenPrompts=[];
    const prizePromptOrder=[];
    const promotionOrder=[];
    let powerglassPromptIndex=-1;

    if(fixture.stopAfterAttack){
      while(true){
        const pending=state.prompts.find(prompt=>prompt.result===undefined);
        if(!pending||pending.constructor.name!=='WaitPrompt')break;
        seenPrompts.push('WaitPrompt');
        store.dispatch(new ResolvePromptAction(pending.id,null));
      }
      const {GameWinner}=native('game/store/state/state');
      const winnerSeat=state.winner===GameWinner.PLAYER_1?0:
        state.winner===GameWinner.PLAYER_2?1:null;
      return {
        actorSeat,
        finished:state.phase===GamePhase.FINISHED,
        winner:state.winner,
        winnerSeat,
        winnerPlayer:winnerSeat===null?null:
          state.players[winnerSeat].id===owner.id?'owner':'opponent',
        pendingPrompts:state.prompts.filter(p=>p.result===undefined)
          .map(p=>p.constructor.name),
        seenPrompts,
        ownerPrizesRemaining:owner.prizes.filter(p=>p.cards.length>0).length,
        opponentPrizesRemaining:enemy.prizes.filter(p=>p.cards.length>0).length,
        ownerPrizesTakenThisTurn:owner.prizesTakenThisTurn,
        opponentPrizesTakenThisTurn:enemy.prizesTakenThisTurn,
        ownerCanPromote:owner.bench.some(slot=>slot.getPokemonCard()),
        opponentCanPromote:enemy.bench.some(slot=>slot.getPokemonCard()),
        playersOrderAfterTurn:state.players.map(p=>p.id===owner.id?'owner':'opponent')
      };
    }

    for(let i=0;i<64;i++){
      const pending=state.prompts.find(prompt=>prompt.result===undefined);
      if(!pending)break;
      const name=pending.constructor.name;
      seenPrompts.push(name);
      let answer=null;

      if(name==='ChoosePrizePrompt'){
        prizePromptOrder.push(pending.playerId);
        const player=state.players.find(p=>p.id===pending.playerId);
        assert.ok(player);
        const remaining=player.prizes.filter(prize=>prize.cards.length>0);
        answer=remaining.slice(0,pending.options.count);
        assert.equal(answer.length,pending.options.count);
        assert.equal(pending.validate(answer,state),true);
      }else if(name==='ChoosePokemonPrompt'){
        promotionOrder.push(pending.playerId);
        const player=state.players.find(p=>p.id===pending.playerId);
        assert.ok(player);
        const promote=player.bench.find(slot=>slot.getPokemonCard());
        assert.ok(promote,'Both players must have a real Pokémon to promote');
        answer=[promote];
        assert.equal(pending.validate(answer,state),true);
      }else if(name==='AttachEnergyPrompt'){
        powerglassPromptIndex=seenPrompts.length-1;
        assert.strictEqual(pending.cardList,owner.discard);
        const donor=owner.discard.cards.find(
          value=>value.fullName==='Psychic Energy MEE'
        );
        assert.ok(donor,'Powerglass requires a physical Basic Psychic in discard');
        answer=[{card:donor,to:{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
        }}];
        assert.equal(pending.validate(answer),true);
      }else{
        assert.equal(name,'WaitPrompt','Unexpected simultaneous-KO prompt');
      }
      store.dispatch(new ResolvePromptAction(pending.id,answer));
    }

    assert.equal(state.prompts.filter(p=>p.result===undefined).length,0);
    if(terminalMode){
      const {GameWinner}=native('game/store/state/state');
      const winnerSeat=state.winner===GameWinner.PLAYER_1?0:
        state.winner===GameWinner.PLAYER_2?1:null;
      return {
        actorSeat,
        finished:state.phase===GamePhase.FINISHED,
        winner:state.winner,
        winnerSeat,
        winnerPlayer:winnerSeat===null?null:
          state.players[winnerSeat].id===owner.id?'owner':'opponent',
        seenPrompts,
        prizePromptOrder:prizePromptOrder.map(id=>
          id===owner.id?'owner':'opponent'),
        promotionOrder:promotionOrder.map(id=>
          id===owner.id?'owner':'opponent'),
        ownerPrizesRemaining:owner.prizes.filter(p=>p.cards.length>0).length,
        opponentPrizesRemaining:enemy.prizes.filter(p=>p.cards.length>0).length,
        ownerPrizesTakenThisTurn:owner.prizesTakenThisTurn,
        opponentPrizesTakenThisTurn:enemy.prizesTakenThisTurn,
        ownerActive:owner.active.getPokemonCard()?.fullName??null,
        opponentActive:enemy.active.getPokemonCard()?.fullName??null,
        playersOrderAfterTurn:state.players.map(p=>p.id===owner.id?'owner':'opponent')
      };
    }
    const expectedFirstPromoter=state.players[1-actorSeat];
    const observedFirstPromoter=state.players.find(
      p=>p.id===promotionOrder[0]
    );
    const lastPrizeIndex=seenPrompts.lastIndexOf('ChoosePrizePrompt');
    const firstPromotionIndex=seenPrompts.indexOf('ChoosePokemonPrompt');
    const lastPromotionIndex=seenPrompts.lastIndexOf('ChoosePokemonPrompt');
    const orderedPrizeBeforePromotion=
      lastPrizeIndex>=0&&firstPromotionIndex>lastPrizeIndex;
    const powerglassAfterBothPromotions=
      powerglassPromptIndex>lastPromotionIndex&&lastPromotionIndex>=0;

    return {
      actorSeat,
      seenPrompts,
      prizePromptOrder:prizePromptOrder.map(id=>
        id===owner.id?'owner':'opponent'),
      promotionOrder:promotionOrder.map(id=>
        id===owner.id?'owner':'opponent'),
      expectedFirstPromoter:expectedFirstPromoter===owner?'owner':'opponent',
      observedFirstPromoter:observedFirstPromoter===owner?'owner':'opponent',
      paperPromotionOrderMatches:observedFirstPromoter===expectedFirstPromoter,
      orderedPrizeBeforePromotion,
      powerglassPromptIndex,
      powerglassAfterBothPromotions,
      ownerActive:owner.active.getPokemonCard()?.fullName??null,
      opponentActive:enemy.active.getPokemonCard()?.fullName??null,
      ownerPrizesRemaining:owner.prizes.filter(p=>p.cards.length>0).length,
      opponentPrizesRemaining:enemy.prizes.filter(p=>p.cards.length>0).length,
      ownerActiveEnergy:owner.active.energies.cards.map(c=>c.fullName),
      ownerActiveTools:owner.active.tools.map(c=>c.fullName),
      ownerDiscard:owner.discard.cards.map(c=>c.fullName),
      ownerWinner:state.winner,
      ownerPhase:state.phase,
      playersOrderAfterTurn:state.players.map(p=>p.id===owner.id?'owner':'opponent'),
      activePlayerAfterTurn:state.players[state.activePlayer].id===owner.id?'owner':'opponent'
    };
  };

  if(!useHook)return {result:runNativeTransaction(),audit:null};
  const hook=typeof useHook==='function'
    ?useHook
    :withInstanceScopedPaperKoBeforeEndTurn;
  const wrapped=hook(store,runNativeTransaction);
  return {result:wrapped.result,audit:wrapped.audit};
}

/**
 * @returns {object} Two physical actor seats, each with baseline and treatment.
 */
function run(){
  const rows=[0,1].map(actorSeat=>{
    const baseline=runOne(actorSeat,false);
    const treatment=runOne(actorSeat,true);
    const b=baseline.result,t=treatment.result;
    assert.deepEqual(b.seenPrompts.filter(p=>
      p==='ChoosePrizePrompt'||p==='ChoosePokemonPrompt'),[
      'ChoosePrizePrompt','ChoosePrizePrompt',
      'ChoosePokemonPrompt','ChoosePokemonPrompt'
    ]);
    assert.equal(t.seenPrompts.filter(p=>p==='AttachEnergyPrompt').length,1,
      'Promoted owner Active must receive the post-KO Powerglass prompt');
    assert.equal(b.seenPrompts.filter(p=>p==='AttachEnergyPrompt').length,0,
      'Unpatched E-21 runs while Powerglass is still on the Bench');
    assert.equal(t.powerglassAfterBothPromotions,true);
    assert.equal(t.orderedPrizeBeforePromotion,true);
    assert.equal(b.ownerActive,'Unown AOR');
    assert.equal(t.ownerActive,'Unown AOR');
    assert.equal(b.opponentActive,'Trubbish FST');
    assert.equal(t.opponentActive,'Trubbish FST');
    assert.equal(b.ownerPrizesRemaining,5);
    assert.equal(t.ownerPrizesRemaining,5);
    assert.equal(b.opponentPrizesRemaining,5);
    assert.equal(t.opponentPrizesRemaining,5);
    assert.equal(b.ownerActiveEnergy.length,0);
    assert.equal(t.ownerActiveEnergy.length,1);
    assert.equal(t.ownerActiveEnergy[0],'Psychic Energy MEE');
    assert.ok(t.ownerActiveTools.includes('Powerglass SFA'));
    assert.equal(treatment.audit.intercepted,1);
    assert.equal(treatment.audit.completed,1);
    assert.equal(treatment.audit.terminalSuppressed,0);
    assert.equal(treatment.audit.callbacks,treatment.audit.intercepted);
    assert.equal(treatment.audit.otherStoresUnmodified,true);
    assert.equal(treatment.audit.originalRestored,true);
    return {
      actorSeat,
      baseline:b,
      scoped:t,
      hookAudit:treatment.audit,
      paperPromotionOrderMismatch:!t.paperPromotionOrderMatches
    };
  });
  return {
    schema:'agent37-simultaneous-ko-e21-promotion-native-v1',
    pinnedTwinleaf:PINNED,
    hook:VERSION,
    scenario:'Ferroseed NXD Self Destruct KOs both 60-HP Active Pokémon; promoted owner Unown AOR holds Powerglass SFA',
    physicalSeatPairs:2,
    fullBaselineTreatmentPairs:2,
    simultaneousPrizeAndPromotionSettled:true,
    promotedPowerglassTriggersOnlyAfterHookedKoSettlement:true,
    nativePromotionOrderAuditedAgainstRulebook:true,
    paperPromotionOrderMismatchSeats:rows.filter(
      row=>row.paperPromotionOrderMismatch
    ).map(row=>row.actorSeat),
    competitiveGamesQualified:0,
    rows
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,runOne};
