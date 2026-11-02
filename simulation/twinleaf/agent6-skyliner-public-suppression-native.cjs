'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseOwnerSkylinerRondoRetreat}=require(
  './agent6-owner-public-skyliner-rondo-frontier.cjs');
const {publicSkylinerSuppressionReason,
  choosePublicLockGuardedSkylinerRondoRetreat}=require(
    './agent6-skyliner-ability-suppression-guard.cjs');

const {choosePublicHoodAwareSkylinerRondoRetreat}=
  require('./agent6-skyliner-hood-vs-thorns-frontier.cjs');
const {chooseSkylinerOrFloatStoneRondoRetreat}=require(
  './agent6-skyliner-or-floatstone-mobility.cjs');
const {withToolJammerFloatStoneRetreatRepair}=require(
  './agent6-tool-jammer-floatstone-retreat-hook.cjs');
const {withActiveToolJammerToolEffectGuard}=require(
  './agent6-tool-jammer-tool-effect-guard.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=relative=>require(path.join(output,relative));
const VERSION='agent6-skyliner-pinned-store-public-ability-retreat-v2-floatstone';
const EXTRA_EFFECT_MODES=['path-airballoon','path-airballoon-jammer',
  'thorns-airballoon','thorns-airballoon-jammer',
  'path-furybelt','path-furybelt-jammer',
  'thorns-furybelt','thorns-furybelt-jammer',
  'path-float-bench-jammer','path-airballoon-bench-jammer',
  'path-furybelt-bench-jammer',
  'thorns-stealthyhood','thorns-stealthyhood-jammer',
  'thorns-float-jammer-jamming',
  'thorns-stealthyhood-jammer-jamming'];
const MODES=['baseline','path','silent','klefki','thorns',
  'garbotoxin','muk','weezing','wobbuffet',
  'path-float','path-float-jammer','thorns-float',
  'thorns-float-jammer','garbotoxin-float','garbotoxin-float-jamming'];

/**
 * A staged genuine pinned Store exposes printed Skyliner and actual
 * CheckRetreatCostEffect in the same state. Both physical seats checked.
 * This bypasses natural opening/setup and is never a competitive game.
 *
 * @param {'baseline'|'path'|'silent'|'klefki'|'thorns'|'garbotoxin'|'muk'|'weezing'|'wobbuffet'} mode
 * @param {0|1} sourceSeat
 * @returns {object} Actual native reduction and dispatch receipt.
 */
function probe(mode,sourceSeat,{repair=false,effectRepair=false,
  attackFollowup=false,nativePlayJammer=false,opponentReply=false,
  nativeEndOpponentTurn=false,opponentPassOnly=false,
  ownerHoldsBlower=false,ownerPlaysBlower=false}={}){
  assert.ok(!(repair&&effectRepair));
  assert.ok(MODES.includes(mode)||EXTRA_EFFECT_MODES.includes(mode));
  assert.ok(sourceSeat===0||sourceSeat===1);
  const baseMode=mode.split(/-(?:float|airballoon|furybelt|stealthyhood)/)[0];
  const equippedFloatStone=mode.includes('-float');
  const equippedAirBalloon=mode.includes('-airballoon');
  const equippedFuryBelt=mode.includes('-furybelt');
  const equippedStealthyHood=mode.includes('-stealthyhood');
  assert.ok(!attackFollowup||(effectRepair&&
    (equippedStealthyHood||equippedFloatStone)));
  assert.ok(!opponentReply||attackFollowup);
  const opponentBenchJammer=mode.endsWith('-bench-jammer');
  const opponentToolJammer=(mode.endsWith('-jammer')||
    mode.includes('-jammer-jamming'))&&!opponentBenchJammer;
  assert.ok(!nativePlayJammer||opponentToolJammer);
  assert.ok(!nativeEndOpponentTurn||nativePlayJammer||opponentPassOnly);
  assert.ok(!(nativePlayJammer&&opponentPassOnly));
  assert.ok(!ownerPlaysBlower||ownerHoldsBlower);
  assert.ok(!ownerHoldsBlower||
    (nativePlayJammer&&nativeEndOpponentTurn&&opponentToolJammer));
  assert.ok(!opponentPassOnly||!opponentToolJammer);
  const stadiumToolJamming=mode.endsWith('-jamming');
  const manager=initializeCards();
  let id=1;
  const card=printed=>{
    const actual=manager.getCardByName(printed);
    assert.ok(actual,'Missing pinned card '+printed);
    actual.id=id++;
    return actual;
  };
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format,CardType,SpecialCondition}=
    load('game/store/card/card-types');
  const {RetreatAction,AttackAction,PassTurnAction}=
    load('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');
  const {CheckRetreatCostEffect,CheckHpEffect}=
    load('game/store/effects/check-effects');
  const {IS_ABILITY_BLOCKED}=load('game/store/prefabs/prefabs');

  const store=new Store({onStateChange(){}});
  const state=store.state,mine=new Player(),enemy=new Player();
  mine.id=101;enemy.id=202;
  state.players=sourceSeat===0?[mine,enemy]:[enemy,mine];
  state.activePlayer=sourceSeat;
  state.turn=4;
  state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  // Genuine setup zones for RetreatAction's full Store preconditions.
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const prize=new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      return prize;
    });
    for(let i=0;i<7;i++)player.deck.cards.push(card('Psychic Energy MEE'));
  }
  const latias=card('Latias ex SSP');
  mine.active.cards.push(latias);
  if(equippedFloatStone)mine.active.tools.push(card('Float Stone BKT'));
  if(equippedAirBalloon)mine.active.tools.push(card('Air Balloon SSH'));
  if(equippedFuryBelt)mine.active.tools.push(card('Fighting Fury Belt BKP'));
  if(equippedStealthyHood)mine.active.tools.push(card('Stealthy Hood UNB'));
  const addBench=(owner,printed)=>{
    const slot=new PokemonCardList();
    slot.cards.push(card(printed));
    owner.bench.push(slot);
    return slot;
  };
  const physicalFieldBlower=ownerHoldsBlower?card('Field Blower GRI'):null;
  if(physicalFieldBlower)mine.hand.cards.push(physicalFieldBlower);
  const clefairy=addBench(mine,"Lillie's Clefairy ex JTG");
  clefairy.energies.cards.push(card('Psychic Energy MEE'));
  clefairy.energies.cards.push(card('Psychic Energy MEE'));
  for(let i=0;i<4;i++)addBench(mine,'Pidgey MEW');
  let enemyActive='Duskull VIV';
  if(baseMode==='klefki')enemyActive='Klefki SVI';
  if(baseMode==='thorns')enemyActive='Iron Thorns ex TWM';
  if(baseMode==='weezing')enemyActive='Galarian Weezing RCL';
  if(baseMode==='wobbuffet')enemyActive='Wobbuffet PHF';
  enemy.active.cards.push(card(enemyActive));
  if(baseMode==='thorns')enemy.active.damage=20;
  if(opponentToolJammer&&!nativePlayJammer)
    enemy.active.tools.push(card('Tool Jammer BST'));
  let nativeJammerPlayReceipt=null;
  if(baseMode==='garbotoxin'){
    const slot=addBench(enemy,'Garbodor BKP');
    slot.tools.push(card('Float Stone BKT'));
  }else if(baseMode==='muk')addBench(enemy,'Alolan Muk SUM');
  else addBench(enemy,'Pidgey MEW');
  for(let i=0;i<4;i++)addBench(enemy,'Pidgey MEW');
  if(opponentReply){
    enemy.bench[0].energies.cards.push(card('Psychic Energy MEE'));
    enemy.bench[0].energies.cards.push(card('Psychic Energy MEE'));
  }
  if(opponentBenchJammer)enemy.bench[0].tools.push(card('Tool Jammer BST'));
  if(baseMode==='path')enemy.stadium.cards.push(card('Path to the Peak CRE'));
  if(baseMode==='silent')enemy.stadium.cards.push(card('Silent Lab PRC'));
  if(stadiumToolJamming)enemy.stadium.cards.push(card('Jamming Tower TWM'));

  if(nativePlayJammer||opponentPassOnly){
    const actualJammer=card('Tool Jammer BST');
    enemy.hand.cards.push(actualJammer);
    const handBefore=enemy.hand.cards.map(c=>c.fullName);
    state.activePlayer=1-sourceSeat;
    const initialRootSnapshot=JSON.stringify({
      turn:state.turn,phase:state.phase,activePlayer:state.activePlayer,
      players:state.players.map(player=>({
        active:player.active.cards.map(c=>c.fullName),
        activeTools:player.active.tools.map(c=>c.fullName),
        activeEnergies:player.active.energies.cards.map(c=>c.fullName),
        bench:player.bench.map(slot=>({
          pokemon:slot.cards.map(c=>c.fullName),
          tools:slot.tools.map(c=>c.fullName),
          energies:slot.energies.cards.map(c=>c.fullName)
        })),
        hand:player.hand.cards.map(c=>c.fullName),
        stadium:player.stadium.cards.map(c=>c.fullName),
        prizes:player.prizes.map(slot=>slot.cards.length)
      }))
    });
    const initialRootFingerprint=require('node:crypto').createHash('sha256')
      .update(initialRootSnapshot).digest('hex');
    let playError=null;
    if(nativePlayJammer){
      try{store.dispatch(new PlayCardAction(enemy.id,0,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0}));}
      catch(error){playError=String(error?.message??error);}
    }
    nativeJammerPlayReceipt={
      initialRootFingerprint,playError,handBefore,
      handAfter:enemy.hand.cards.map(c=>c.fullName),
      activeToolsAfter:enemy.active.tools.map(c=>c.fullName),
      inHandAfter:enemy.hand.cards.includes(actualJammer),
      attachedToTarget:enemy.active.tools.includes(actualJammer),
      inEnemyDiscard:enemy.discard.cards.includes(actualJammer),
      pendingPrompts:state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)
    };
    if(nativeEndOpponentTurn&&playError===null){
      nativeJammerPlayReceipt.nativeTurnEnd={
        beforeTurn:state.turn,beforeSeat:state.activePlayer,
        passError:null,resolvedWaitIds:[],afterTurn:null,afterSeat:null,
        pendingPromptTypes:[]};
      try{store.dispatch(new PassTurnAction(enemy.id));}
      catch(error){nativeJammerPlayReceipt.nativeTurnEnd.passError=
        String(error?.message??error);}
      if(nativeJammerPlayReceipt.nativeTurnEnd.passError===null){
        for(let i=0;i<16;i++){
          const wait=state.prompts.find(p=>p.result===undefined&&
            p.constructor.name==='WaitPrompt');
          if(!wait)break;
          store.dispatch(new ResolvePromptAction(wait.id,null));
          nativeJammerPlayReceipt.nativeTurnEnd.resolvedWaitIds.push(wait.id);
        }
      }
      nativeJammerPlayReceipt.nativeTurnEnd.afterTurn=state.turn;
      nativeJammerPlayReceipt.nativeTurnEnd.afterSeat=state.activePlayer;
      nativeJammerPlayReceipt.nativeTurnEnd.pendingPromptTypes=
        state.prompts.filter(p=>p.result===undefined)
          .map(p=>p.constructor.name);
    }else state.activePlayer=sourceSeat;
    assert.equal(playError,null);
    assert.equal(nativeJammerPlayReceipt.attachedToTarget,nativePlayJammer);
    assert.equal(nativeJammerPlayReceipt.inHandAfter,opponentPassOnly);
  }

  // This is a second source-action decision on the authentic next owner turn.
  // The owner holds the same physical Field Blower in both matched arms.
  let ownerBlowerReceipt=null;
  if(ownerHoldsBlower){
    assert.equal(state.activePlayer,sourceSeat);
    const ownHandBefore=mine.hand.cards.map(c=>c.fullName);
    const opposingToolsBefore=enemy.active.tools.map(c=>c.fullName);
    const start=JSON.stringify({turn:state.turn,activePlayer:state.activePlayer,
      ownHand:ownHandBefore,opponentHand:enemy.hand.cards.map(c=>c.fullName),
      opposingTools:opposingToolsBefore,
      ownActive:mine.active.getPokemonCard()?.fullName,
      ownTools:mine.active.tools.map(c=>c.fullName),
      ownBench:mine.bench.map(b=>b.cards.map(c=>c.fullName)),
      ownPrizes:mine.prizes.map(p=>p.cards.map(c=>c.fullName)),
      opponentPrizes:enemy.prizes.map(p=>p.cards.map(c=>c.fullName))});
    const startFingerprint=require('node:crypto').createHash('sha256')
      .update(start).digest('hex');
    let playError=null,promptError=null,chosenPromptType=null;
    const targetTool=enemy.active.tools[0];
    if(ownerPlaysBlower){
      try{
        store.dispatch(new PlayCardAction(mine.id,
          mine.hand.cards.indexOf(physicalFieldBlower),{
            player:PlayerType.ANY,slot:SlotType.BOARD,index:0}));
        const prompt=state.prompts.find(p=>p.result===undefined);
        chosenPromptType=prompt?.constructor.name??null;
        assert.equal(chosenPromptType,'ChoosePokemonPrompt');
        assert.equal(prompt.playerId,mine.id);
        assert.ok(prompt.validate([enemy.active],state));
        store.dispatch(new ResolvePromptAction(prompt.id,[enemy.active]));
      }catch(error){
        if(chosenPromptType)promptError=String(error?.message??error);
        else playError=String(error?.message??error);
      }
    }
    ownerBlowerReceipt={startFingerprint,ownerPlaysBlower,
      ownHandBefore,opposingToolsBefore,chosenPromptType,
      playError,promptError,
      ownHandAfter:mine.hand.cards.map(c=>c.fullName),
      physicalItemDiscarded:mine.discard.cards.includes(physicalFieldBlower),
      physicalToolDiscarded:enemy.discard.cards.includes(targetTool),
      opposingToolsAfter:enemy.active.tools.map(c=>c.fullName),
      pendingPromptTypes:state.prompts.filter(p=>p.result===undefined)
        .map(p=>p.constructor.name)};
  }
  const effectiveOpponentToolJammer=opponentToolJammer&&!ownerPlaysBlower;
  const view=actorObservation(state,sourceSeat);
  const catalog={
    basicEnergies:new Set(['Psychic Energy MEE']),
    basicEnergyTypes:{Psychic:CardType.PSYCHIC},
    colorlessEnergyType:CardType.COLORLESS,
    specialConditions:{ASLEEP:SpecialCondition.ASLEEP,
      PARALYZED:SpecialCondition.PARALYZED}
  };
  const original=chooseOwnerSkylinerRondoRetreat(view,catalog);
  const guarded=choosePublicLockGuardedSkylinerRondoRetreat(view,catalog);
  const hoodGuard=equippedStealthyHood?
    choosePublicHoodAwareSkylinerRondoRetreat(view,catalog):null;
  const floatStoneGuard=chooseSkylinerOrFloatStoneRondoRetreat(view,catalog);
  const reason=publicSkylinerSuppressionReason(view);
  const livePower=latias.powers.find(power=>power.name==='Skyliner');
  assert.ok(livePower);
  const executeNative=()=>{
    // Ability-lock verification must occur *inside* the optional ToolEffect
    // guard to catch Tool Jammer disabling Stealthy Hood.
    const nativeBlocked=Boolean(IS_ABILITY_BLOCKED(
      store,state,mine,latias,livePower));
    let nativeHp=null;
    if(equippedFuryBelt){
      const hpEffect=new CheckHpEffect(mine,mine.active);
      store.reduceEffect(state,hpEffect);
      nativeHp=hpEffect.hp;
    }
    const nativeCost=new CheckRetreatCostEffect(mine);
    store.reduceEffect(state,nativeCost);
    const nativeRetreatCost=nativeCost.cost.length;
    let nativeRetreatError=null;
    try{store.dispatch(new RetreatAction(mine.id,0));}
    catch(error){nativeRetreatError=String(error?.message??error);}
    const promoted=store.state.players[sourceSeat].active.getPokemonCard()?.fullName;
    const nativeRetreatAccepted=promoted==="Lillie's Clefairy ex JTG";
    let attackReceipt=null;
    if(attackFollowup){
      const before={ownerPrizes:mine.prizes.filter(slot=>slot.cards.length>0).length,
        opponentActive:enemy.active.getPokemonCard()?.fullName??null,
        opponentActiveDamage:enemy.active.damage};
      let attackError=null,attempted=false,accepted=false;
      if(nativeRetreatAccepted){
        attempted=true;
        try{store.dispatch(new AttackAction(mine.id,'Full Moon Rondo'));
          accepted=true;}
        catch(error){attackError=String(error?.message??error);}
      }
      const resolvedWaitPromptIds=[];
      const resolvedPrizePromptIds=[];
      const resolvedPromotionPromptIds=[];
      if(accepted){
        for(let i=0;i<16;i++){
          const prompt=store.state.prompts.find(p=>p.result===undefined);
          if(!prompt)break;
          let choice=null,kind=null;
          if(prompt.constructor.name==='WaitPrompt'){
            kind='wait';
          }else if(prompt.constructor.name==='ChoosePrizePrompt'&&
              prompt.playerId===mine.id){
            const ownerPrizes=mine.prizes.filter(p=>p.cards.length>0);
            choice=ownerPrizes.slice(0,prompt.options.count);
            assert.ok(prompt.validate(choice,store.state));
            kind='prize';
          }else if(prompt.constructor.name==='ChoosePokemonPrompt'&&
              prompt.playerId===enemy.id){
            choice=[enemy.bench.find(slot=>slot.cards.length>0)];
            assert.ok(prompt.validate(choice,store.state));
            kind='promotion';
          }else{
            break;
          }
          store.dispatch(new ResolvePromptAction(prompt.id,choice));
          if(kind==='wait')resolvedWaitPromptIds.push(prompt.id);
          if(kind==='prize')resolvedPrizePromptIds.push(prompt.id);
          if(kind==='promotion')resolvedPromotionPromptIds.push(prompt.id);
        }
      }
      let opponentReplyReceipt=null;
      if(opponentReply){
        let replyAttempted=false,replyAccepted=false,replyError=null;
        const ownerDamageBefore=mine.active.damage;
        const replyActiveBefore=enemy.active.getPokemonCard()?.fullName??null;
        const stateTurnBefore=state.turn;
        const actorSeatBefore=state.activePlayer;
        const resolvedReplyWaitIds=[];
        if(accepted&&mine.prizes.filter(p=>p.cards.length>0).length===4){
          replyAttempted=true;
          try{store.dispatch(new AttackAction(enemy.id,'Tackle'));
            replyAccepted=true;}
          catch(error){replyError=String(error?.message??error);}
          if(replyAccepted){
            for(let i=0;i<8;i++){
              const wait=state.prompts.find(p=>p.result===undefined&&
                p.constructor.name==='WaitPrompt');
              if(!wait)break;
              store.dispatch(new ResolvePromptAction(wait.id,null));
              resolvedReplyWaitIds.push(wait.id);
            }
          }
        }
        opponentReplyReceipt={replyAttempted,replyAccepted,replyError,
          replyActiveBefore,ownerDamageBefore,
          ownerDamageAfter:mine.active.damage,
          stateTurnBefore,actorSeatBefore,resolvedReplyWaitIds,
          pendingPrompts:state.prompts.filter(p=>p.result===undefined)
            .map(p=>p.constructor.name),
          activeAfter:state.players[sourceSeat].active.getPokemonCard()?.fullName??null};
      }
      attackReceipt={attempted,accepted,attackError,before,
        resolvedWaitPromptIds,resolvedPrizePromptIds,
        resolvedPromotionPromptIds,opponentReplyReceipt,
        after:{ownerPrizes:mine.prizes.filter(slot=>slot.cards.length>0).length,
          opponentActive:enemy.active.getPokemonCard()?.fullName??null,
          opponentActiveDamage:enemy.active.damage,
          opponentDiscard:enemy.discard.cards.map(c=>c.fullName),
          pendingPrompts:store.state.prompts.filter(p=>
            p.result===undefined).map(p=>p.constructor.name),
          phase:store.state.phase}};
    }
    return {nativeBlocked,nativeHp,nativeRetreatCost,nativeRetreatError,
      promoted,nativeRetreatAccepted,attackReceipt};
  };
  const receipt=effectRepair?
    withActiveToolJammerToolEffectGuard(store,mine,enemy,executeNative):
    repair?withToolJammerFloatStoneRetreatRepair(store,mine,enemy,executeNative):
    {result:executeNative(),patches:[]};
  const {nativeBlocked,nativeHp,nativeRetreatCost,nativeRetreatError,
    promoted,nativeRetreatAccepted,attackReceipt}=receipt.result;
  const expectedSuppressed=!['baseline','wobbuffet'].includes(baseMode)&&
    !(baseMode==='thorns'&&equippedStealthyHood&&!effectiveOpponentToolJammer);
  const expectedFree=!expectedSuppressed||
    ((equippedFloatStone||equippedAirBalloon)&&
      !effectiveOpponentToolJammer&&!stadiumToolJamming);
  const checks={
    nativeOwnerBlowerAnswerAsPaper:!ownerHoldsBlower||(
      ownerBlowerReceipt.playError===null&&
      ownerBlowerReceipt.promptError===null&&
      ownerBlowerReceipt.pendingPromptTypes.length===0&&
      ownerBlowerReceipt.physicalItemDiscarded===ownerPlaysBlower&&
      ownerBlowerReceipt.physicalToolDiscarded===ownerPlaysBlower&&
      (ownerPlaysBlower?
        ownerBlowerReceipt.opposingToolsAfter.length===0:
        ownerBlowerReceipt.opposingToolsAfter.includes('Tool Jammer BST'))),
    printedRootPresent:Boolean(original),
    nativeAbilityBlockAsPaper:nativeBlocked===expectedSuppressed,
    nativeRetreatCostAsPaper:nativeRetreatCost===(expectedFree?0:2),
    hoodGuardAsPaper:!equippedStealthyHood||
      Boolean(hoodGuard)===expectedFree,
    publicGuardAsPaper:equippedStealthyHood||
      Boolean(guarded)===!expectedSuppressed,
    furyBeltNativeHpAsPaper:!equippedFuryBelt||
      nativeHp===latias.hp+(effectiveOpponentToolJammer?0:40),
    floatStoneGuardAsPaper:equippedAirBalloon||equippedFuryBelt||
      equippedStealthyHood||
      Boolean(floatStoneGuard)===expectedFree,
    nativePhysicalRetreatAsPaper:nativeRetreatAccepted===expectedFree,
    nativeTurnBoundaryAsPaper:!nativeEndOpponentTurn||(
      nativeJammerPlayReceipt.nativeTurnEnd.passError===null&&
      nativeJammerPlayReceipt.nativeTurnEnd.afterSeat===sourceSeat&&
      nativeJammerPlayReceipt.nativeTurnEnd.afterTurn>
        nativeJammerPlayReceipt.nativeTurnEnd.beforeTurn&&
      nativeJammerPlayReceipt.nativeTurnEnd.pendingPromptTypes.length===0),
    nativeOpponentPassCardPreservedAsPaper:!opponentPassOnly||(
      nativeJammerPlayReceipt.playError===null&&
      !nativeJammerPlayReceipt.attachedToTarget&&
      nativeJammerPlayReceipt.inHandAfter&&
      !nativeJammerPlayReceipt.inEnemyDiscard),
    nativeJammerPaymentAsPaper:!nativePlayJammer||(
      nativeJammerPlayReceipt.playError===null&&
      nativeJammerPlayReceipt.attachedToTarget&&
      !nativeJammerPlayReceipt.inHandAfter&&
      !nativeJammerPlayReceipt.inEnemyDiscard),
    attackFollowupSelectedAsPaper:!attackFollowup||
      (effectiveOpponentToolJammer?!attackReceipt.attempted:
        attackReceipt.attempted&&attackReceipt.accepted),
    nativeOpponentReplyAsPaper:!opponentReply||
      (effectiveOpponentToolJammer?!attackReceipt.opponentReplyReceipt.replyAttempted:
        attackReceipt.opponentReplyReceipt.replyAttempted&&
        attackReceipt.opponentReplyReceipt.replyAccepted&&
        attackReceipt.opponentReplyReceipt.ownerDamageAfter===20&&
        attackReceipt.opponentReplyReceipt.pendingPrompts.length===0),
    nativePrizeAndKnockOutAsPaper:!attackFollowup||
      (effectiveOpponentToolJammer?!attackReceipt.attempted:
        attackReceipt.after.ownerPrizes===4&&
        attackReceipt.after.opponentDiscard.includes('Iron Thorns ex TWM')),
    paperHookApplied:effectRepair?
      (effectiveOpponentToolJammer&&!stadiumToolJamming?
        receipt.patches.length>0:
        receipt.patches.length===0):!repair||receipt.patches.length>0
  };
  return {mode,sourceSeat,repairApplied:repair||effectRepair,
    repairKind:effectRepair?'tool-effect':(repair?'retreat-cost':'none'),
    repairPatches:receipt.patches,
    floatStonePlannerCheckSkipped:equippedAirBalloon||equippedFuryBelt||
      equippedStealthyHood,
    nativeJammerPlayReceipt,ownerBlowerReceipt,
    activeBefore:latias.fullName,printedPower:livePower.name,
    ownerPrintedPowerVisible:view.ownPublic.active.abilities.includes('Skyliner'),
    originalRootWouldSelect:original?.kind??null,
    guardedRootWouldSelect:guarded?.kind??null,
    hoodGuardRootWouldSelect:hoodGuard?.kind??null,
    floatStoneRootWouldSelect:floatStoneGuard?.kind??null,
    suppressionReason:reason,nativeAbilityBlocked:nativeBlocked,
    nativeHp,printedHp:latias.hp,nativeRetreatCost,
    nativeRetreatAccepted,nativeRetreatError,activeAfter:promoted,
    attackReceipt,
    expectedRetreatAccepted:expectedFree,checks,
    competitiveQualified:false};
}

/** @returns {object} Full staged native case archive, paper unqualified. */
function run(){
  const rows=[];
  for(const mode of MODES)for(const seat of [0,1])
    rows.push(probe(mode,seat));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,sourceSeat:row.sourceSeat,
      check,nativeRetreatError:row.nativeRetreatError})));
  return {version:VERSION,enginePin:
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    stagedNativeCases:rows.length,failedChecks:failures.length,
    failures,rows,qualifiedCompetitiveGames:0};
}

function runRepair(){
  const rows=['path-float-jammer','thorns-float-jammer']
    .flatMap(mode=>[0,1].map(seat=>probe(mode,seat,{repair:true})));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,seat:row.sourceSeat,check})));
  return {repairTest:true,version:VERSION,rows,failures,
    stagedNativeCases:rows.length,failedChecks:failures.length,
    qualifiedCompetitiveGames:0};
}
function runPairedJammerTurnCounterfactual(){
  // Float Stone is in the authenticated rank-30 source sixty; Hood is a
  // separate mechanical contrast, not an original rank-30 deck inclusion.
  const pairs=[
    ['thorns-float','thorns-float-jammer'],
    ['thorns-stealthyhood','thorns-stealthyhood-jammer']
  ];
  const rows=pairs.flatMap(modes=>modes.flatMap(mode=>
    [0,1].map(seat=>probe(mode,seat,{
      effectRepair:true,nativeEndOpponentTurn:true,
      nativePlayJammer:mode.endsWith('-jammer'),
      opponentPassOnly:!mode.endsWith('-jammer'),
      attackFollowup:true,opponentReply:true}))));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,seat:row.sourceSeat,check})));
  const rootFingerprints={};
  for(const modes of pairs)for(const seat of [0,1]){
    const key=modes[0]+':seat'+seat;
    const hashes=modes.map(mode=>rows.find(r=>r.mode===mode&&
      r.sourceSeat===seat).nativeJammerPlayReceipt.initialRootFingerprint);
    rootFingerprints[key]=hashes;
    if(hashes[0]!==hashes[1])
      failures.push({mode:'paired-root-mismatch',seat,hashes,
        control:modes[0],treatment:modes[1]});
  }
  return {version:VERSION,pairedJammerTurnCounterfactual:true,
    pairModes:pairs,rootFingerprints,
    rows,stagedNativeCases:rows.length,failures,
    failedChecks:failures.length,qualifiedCompetitiveGames:0};
}
function runOwnerFieldBlowerAfterPaidJammer(){
  // The source owner already holds original-rank30 Field Blower GRI125.
  // Compare playing it against retaining the identical initial card.
  const rows=[0,1].flatMap(seat=>[false,true].map(ownerPlaysBlower=>
    probe('thorns-float-jammer',seat,{
      effectRepair:true,nativePlayJammer:true,nativeEndOpponentTurn:true,
      ownerHoldsBlower:true,ownerPlaysBlower,
      attackFollowup:true,opponentReply:true})));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,seat:row.sourceSeat,
      ownerPlaysBlower:row.ownerBlowerReceipt.ownerPlaysBlower,check})));
  const ownerRootFingerprints={};
  for(const seat of [0,1]){
    const hashes=rows.filter(r=>r.sourceSeat===seat).map(row=>
      row.ownerBlowerReceipt.startFingerprint);
    ownerRootFingerprints[String(seat)]=hashes;
    if(hashes.length!==2||hashes[0]!==hashes[1])
      failures.push({mode:'owner-blower-root-mismatch',seat,hashes});
  }
  return {version:VERSION,ownerFieldBlowerCounterline:true,
    rows,ownerRootFingerprints,stagedNativeCases:rows.length,
    failures,failedChecks:failures.length,qualifiedCompetitiveGames:0};
}

function runNativePlayedJammerTurnBoundaryRepair(){
  const rows=['path-float-jammer','thorns-stealthyhood-jammer']
    .flatMap(mode=>[0,1].map(seat=>probe(mode,seat,{
      effectRepair:true,nativePlayJammer:true,nativeEndOpponentTurn:true})));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,seat:row.sourceSeat,check})));
  return {version:VERSION,nativePlayedJammerTurnBoundary:true,rows,
    stagedNativeCases:rows.length,failures,failedChecks:failures.length,
    qualifiedCompetitiveGames:0};
}
function runHoodOpponentReplyRepair(){
  const rows=['thorns-stealthyhood','thorns-stealthyhood-jammer']
    .flatMap(mode=>[0,1].map(seat=>probe(mode,seat,{
      effectRepair:true,attackFollowup:true,opponentReply:true})));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,seat:row.sourceSeat,check})));
  return {version:VERSION,hoodOpponentReply:true,rows,
    stagedNativeCases:rows.length,failures,failedChecks:failures.length,
    qualifiedCompetitiveGames:0};
}
function runNativePlayedJammerRepair(){
  const rows=['path-float-jammer','thorns-stealthyhood-jammer']
    .flatMap(mode=>[0,1].map(seat=>probe(mode,seat,{
      effectRepair:true,nativePlayJammer:true})));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,seat:row.sourceSeat,check})));
  return {version:VERSION,nativePlayedJammer:true,rows,
    stagedNativeCases:rows.length,failures,failedChecks:failures.length,
    qualifiedCompetitiveGames:0};
}
function runHoodAttackRepair(){
  const rows=['thorns-stealthyhood','thorns-stealthyhood-jammer']
    .flatMap(mode=>[0,1].map(seat=>probe(mode,seat,{
      effectRepair:true,attackFollowup:true})));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,seat:row.sourceSeat,check})));
  return {version:VERSION,hoodAttackFollowup:true,rows,
    stagedNativeCases:rows.length,failures,failedChecks:failures.length,
    qualifiedCompetitiveGames:0};
}
function runEffectRepair(){
  const rows=['path-float-jammer','thorns-float-jammer',
    'path-airballoon','path-airballoon-jammer',
    'thorns-airballoon','thorns-airballoon-jammer',
    'path-furybelt','path-furybelt-jammer',
    'thorns-furybelt','thorns-furybelt-jammer',
    'path-float-bench-jammer','path-airballoon-bench-jammer',
    'path-furybelt-bench-jammer',
    'thorns-stealthyhood','thorns-stealthyhood-jammer',
    'thorns-float-jammer-jamming',
    'thorns-stealthyhood-jammer-jamming']
    .flatMap(mode=>[0,1].map(seat=>probe(mode,seat,{effectRepair:true})));
  const failures=rows.flatMap(row=>Object.entries(row.checks)
    .filter(([,passes])=>!passes)
    .map(([check])=>({mode:row.mode,seat:row.sourceSeat,check})));
  return {effectRepairTest:true,version:VERSION,rows,failures,
    stagedNativeCases:rows.length,failedChecks:failures.length,
    qualifiedCompetitiveGames:0};
}
if(require.main===module){
  const result=process.env.AGENT6_OWNER_FIELD_BLOWER_DEV==='true'?
    runOwnerFieldBlowerAfterPaidJammer():
    process.env.AGENT6_PAIRED_JAMMER_TURN_DEV==='true'?
    runPairedJammerTurnCounterfactual():
    process.env.AGENT6_NATIVE_JAMMER_REAL_TURN_DEV==='true'?
    runNativePlayedJammerTurnBoundaryRepair():
    process.env.AGENT6_HOOD_OPPONENT_REPLY_DEV==='true'?
    runHoodOpponentReplyRepair():
    process.env.AGENT6_NATIVE_PLAY_TOOL_JAMMER_DEV==='true'?
    runNativePlayedJammerRepair():
    process.env.AGENT6_HOOD_ATTACK_FOLLOWUP_DEV==='true'?
    runHoodAttackRepair():
    process.env.AGENT6_TOOL_JAMMER_EFFECT_REPAIR_DEV==='true'?
    runEffectRepair():process.env.AGENT6_TOOL_JAMMER_REPAIR_DEV==='true'?
    runRepair():run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.failedChecks>0)process.exitCode=1;
}
module.exports={VERSION,MODES,probe,run,runRepair,runEffectRepair,
  runHoodAttackRepair,runNativePlayedJammerRepair,
  runHoodOpponentReplyRepair,runNativePlayedJammerTurnBoundaryRepair,
  runPairedJammerTurnCounterfactual,runOwnerFieldBlowerAfterPaidJammer};
