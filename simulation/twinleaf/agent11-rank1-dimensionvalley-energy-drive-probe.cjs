'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent11-t16-detached-dimensionvalley-energy-drive-native-v6';
const TARGET_TURN=16;
const ACTIVE='Tapu Lele-GX GRI';
const STADIUM='Dimension Valley PHF';
const ATTACK='Energy Drive';

/**
 * Match the physically observed post-choice source setup, before proposing
 * any trial action. Only own hand and face-up Active are consulted.
 * @param {object} view Detached acting-owner observation.
 * @returns {number} Source hand index, or -1 if the target is absent.
 */
function ownerStadiumIndex(view){
  if(view?.decisionKind!=='owner-root'||
      view?.globalTurn!==TARGET_TURN||
      view?.ownPublic?.active?.printing!==ACTIVE||
      !Array.isArray(view.ownHand))return -1;
  return view.ownHand.indexOf(STADIUM);
}

/**
 * Test the exact source's voluntarily held Stadium -> printed attack line
 * in independent copies of the real pre-Pass Store state. Neither copy is
 * consulted by a player decision, and neither ever modifies the real Store.
 *
 * @param {object} state Original actual Store state, read only.
 * @param {number} ownerId Acting source player's physical client ID.
 * @param {object} view Detached own-hand/public-board observation.
 * @param {object} [deps] Optional native dependencies supplied by pure tests.
 * @returns {object} Factually observed native clone receipt.
 */
function probeStadiumThenEnergyDrive(state,ownerId,view,deps={}){
  const handIndex=ownerStadiumIndex(view);
  const result={
    schema:VERSION,ownerTurn:TARGET_TURN,stadiumPrinting:STADIUM,
    sourceActive:ACTIVE,attackName:ATTACK,
    sourceHandIndex:handIndex,proposalUsesOwnerHandOnly:true,
    targetTurnMatched:handIndex>=0,baselineAttackAccepted:null,
    stadiumNativeAccepted:false,stadiumPhysicalMove:false,
    stadiumEffectiveInPlay:false,attackNativeAccepted:false,
    attackSettled:false,attackDamage:null,opponentDamageBefore:null,
    opponentDamageAfter:null,opponentPrizesBefore:null,
    stadiumWaitPrompts:[],attackWaitPrompts:[],
    opponentPrizesAfter:null,unresolvedPromptTypes:[],
    errors:[],realStoreChanged:false,paperQualified:false
  };
  if(handIndex<0){result.status='target-state-not-present';return result;}
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const {deepClone}=deps.utils??load('utils/utils');
  const {Store}=deps.StoreModule??load('game/store/store');
  const {AttackAction,RetreatAction,PassTurnAction}=
    deps.gameActions??load('game/store/actions/game-actions');
  const {PlayCardAction,PlayerType,SlotType}=
    deps.playActions??load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=deps.resolvePromptAction??
    load('game/store/actions/resolve-prompt-action');
  const {WaitPrompt}=deps.waitPromptModule??load('game/store/prompts/wait-prompt');
  const {StateUtils}=deps.stateUtils??load('game/store/state-utils');
  // Prize zones always contain six physical slots, including empty slots.
  // Count occupied cards when comparing actual remaining Prizes.
  const remainingPrizes=player=>player.prizes.reduce(
    (n,slot)=>n+slot.cards.length,0);
  const copy=()=>{const clone=new Store({onStateChange(){}});
    clone.state=deepClone(state);return clone;};
  const settleWaitPrompts=clone=>{
    const resolved=[];
    for(let i=0;i<16;i++){
      const pending=clone.state.prompts.find(p=>p.result===undefined);
      if(!pending||!(pending instanceof WaitPrompt))break;
      resolved.push({message:pending.message??null,duration:pending.duration??null,
        showVisual:pending.showVisual??null});
      clone.dispatch(new ResolvePromptAction(pending.id,null));
    }
    return resolved;
  };
  const initial=state.players.find(p=>p.id===ownerId);
  assert.ok(initial);
  const previousRandom=Math.random;
  Math.random=()=>0.5;
  try{
    const baseline=copy();
    try{
      baseline.dispatch(new AttackAction(ownerId,ATTACK));
      result.baselineAttackAccepted=true;
    }catch(error){
      result.baselineAttackAccepted=false;
      result.baselineRejection=String(error?.message??error);
    }

    const clone=copy();
    const before=clone.state.players.find(p=>p.id===ownerId);
    const opposing=clone.state.players.find(p=>p.id!==ownerId);
    const beforeHand=before.hand.cards.length;
    const selectedHeldStadium=before.hand.cards[handIndex];
    const beforeStadium=StateUtils.getStadiumCard(clone.state)?.fullName??null;
    result.stadiumBefore=beforeStadium;
    result.sourceActiveEnergyBefore=before.active.energies.cards
      .map(c=>c.fullName);
    result.opponentActiveBefore=
      opposing.active.getPokemonCard?.()?.fullName??null;
    result.opponentActiveEnergyBefore=opposing.active.energies.cards
      .map(c=>c.fullName);
    result.opponentDamageBefore=opposing.active.damage;
    result.opponentPrizesBefore=remainingPrizes(opposing);
    try{
      clone.dispatch(new PlayCardAction(ownerId,handIndex,{
        player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BOARD,index:0
      }));
      result.stadiumNativeAccepted=true;
      result.stadiumWaitPrompts=settleWaitPrompts(clone);
    }catch(error){
      result.errors.push({phase:'play-stadium',
        message:String(error?.message??error)});
      result.status='stadium-native-rejected';
      return result;
    }
    const afterStadium=clone.state.players.find(p=>p.id===ownerId);
    result.stadiumAfter=StateUtils.getStadiumCard(clone.state)?.fullName??null;
    result.stadiumEffectiveInPlay=result.stadiumAfter===STADIUM;
    result.stadiumPhysicalMove=beforeHand-afterStadium.hand.cards.length===1 &&
      !afterStadium.hand.cards.includes(selectedHeldStadium);
    if(!result.stadiumPhysicalMove||!result.stadiumEffectiveInPlay){
      result.status='stadium-physical-custody-unverified';
      return result;
    }

    try{
      clone.dispatch(new AttackAction(ownerId,ATTACK));
      result.attackNativeAccepted=true;
      result.attackWaitPrompts=settleWaitPrompts(clone);
    }catch(error){
      result.errors.push({phase:'attack',
        message:String(error?.message??error)});
      result.status='stadium-paid-attack-native-rejected';
      return result;
    }
    const finalOwner=clone.state.players.find(p=>p.id===ownerId);
    const finalOpponent=clone.state.players.find(p=>p.id!==ownerId);
    result.opponentDamageAfter=finalOpponent.active.damage;
    result.attackDamage=result.opponentDamageAfter-result.opponentDamageBefore;
    result.opponentActiveAfter=
      finalOpponent.active.getPokemonCard?.()?.fullName??null;
    result.opponentPrizesAfter=remainingPrizes(finalOpponent);
    result.ownerPrizesAfter=remainingPrizes(finalOwner);
    result.activeEnergyPrintings=finalOwner.active.energies.cards
      .map(c=>c.fullName);
    result.unresolvedPromptTypes=clone.state.prompts
      .filter(p=>p.result===undefined).map(p=>p.constructor.name);
    result.attackSettled=result.unresolvedPromptTypes.length===0;
    result.status=result.attackSettled?'native-stadium-attack-settled':
      'native-attack-prompt-pending';

    // Continue the *same attack branch* into a native opposing turn. The
    // separate pre-attack retreat branch below remains independent; attacks
    // end their turn, so it cannot be appended after Energy Drive.
    const opponentId=opposing.id;
    const attackFollowthrough={
      opponentAttackName:'Eon Blade',
      nativeOpponentTurnAfterAttack:false,
      nextActorId:null,
      opponentAttackNativeAccepted:false,
      ownerActiveAfter:null,ownerActiveDamageAfter:null,
      ownerPrizesAfter:null,opponentPrizesAfter:null,
      opponentActiveDamageAfter:null,
      pendingPrizePrompt:false,
      unresolvedPromptTypes:[],waitPrompts:[]
    };
    if(result.attackSettled){
      try{
        const next=clone.state.players[clone.state.activePlayer];
        attackFollowthrough.nextActorId=next?.id??null;
        if(next?.id!==opponentId)
          throw new Error('Energy Drive has not handed the turn to opponent');
        attackFollowthrough.nativeOpponentTurnAfterAttack=true;
        clone.dispatch(new AttackAction(opponentId,'Eon Blade'));
        attackFollowthrough.opponentAttackNativeAccepted=true;
        attackFollowthrough.waitPrompts=settleWaitPrompts(clone);
      }catch(error){
        attackFollowthrough.error=String(error?.message??error);
      }
      const replyOwner=clone.state.players.find(p=>p.id===ownerId);
      const replyOpponent=clone.state.players.find(p=>p.id===opponentId);
      attackFollowthrough.ownerActiveAfter=
        replyOwner.active.getPokemonCard?.()?.fullName??null;
      attackFollowthrough.ownerActiveDamageAfter=
        replyOwner.active.damage??null;
      attackFollowthrough.ownerPrizesAfter=remainingPrizes(replyOwner);
      attackFollowthrough.opponentPrizesAfter=remainingPrizes(replyOpponent);
      attackFollowthrough.opponentActiveDamageAfter=
        replyOpponent.active.damage??null;
      attackFollowthrough.unresolvedPromptTypes=clone.state.prompts
        .filter(p=>p.result===undefined).map(p=>p.constructor.name);
      attackFollowthrough.pendingPrizePrompt=
        attackFollowthrough.unresolvedPromptTypes.includes('ChoosePrizePrompt');
    }
    attackFollowthrough.status=
      !attackFollowthrough.opponentAttackNativeAccepted?
        'opponent-reply-not-accepted':
        attackFollowthrough.pendingPrizePrompt?
          'native-opponent-ko-prize-choice-pending':
          attackFollowthrough.unresolvedPromptTypes.length===0?
            'native-opponent-reply-settled':'native-opponent-reply-prompt-pending';
    result.attackFollowthrough=attackFollowthrough;

    // Extend the same cloned attack branch through ordinary Knock Out Prize
    // selection. Choose only occupied face-down slot positions, as in the
    // existing Agent21 owner-first-Prize baseline. No concealed faces, names
    // or contents enter the choice, and native prompt.validate remains final.
    const koPrizeContinuation={
      status:'not-attempted',ownerId:opponentId,
      selectedSlots:0,nativeValidated:false,nativeResolved:false,
      physicalOwnerHandTransfer:false,readConcealedPrizeFaces:false,
      beforePrizeCards:null,afterPrizeCards:null,ownerHandDelta:null,
      postPrizePendingPrompts:[]
    };
    if(attackFollowthrough.opponentAttackNativeAccepted &&
       attackFollowthrough.pendingPrizePrompt &&
       attackFollowthrough.ownerActiveAfter===null){
      const replyTaker=clone.state.players.find(p=>p.id===opponentId);
      const pending=clone.state.prompts.find(p=>
        p.result===undefined && p.constructor.name==='ChoosePrizePrompt');
      const options=pending?.options;
      const ordinaryKoShape=Boolean(replyTaker &&
        pending?.playerId===opponentId &&
        typeof pending.getPerspectivePlayerId==='function' &&
        pending.getPerspectivePlayerId()===opponentId &&
        options?.destination===replyTaker.hand &&
        options.allowCancel===false &&
        options.useOpponentPrizes===false &&
        Array.isArray(options.blocked) && options.blocked.length===0 &&
        Number.isSafeInteger(options.count) &&
        options.count>=1 && options.count<=6 &&
        Array.isArray(replyTaker.prizes) &&
        replyTaker.prizes.length===6 &&
        Array.isArray(replyTaker.hand?.cards) &&
        typeof pending.validate==='function');
      if(!ordinaryKoShape){
        koPrizeContinuation.status='ordinary-ko-owner-shape-unverified';
      }else{
        const chosen=replyTaker.prizes.filter(slot=>
          Array.isArray(slot?.cards)&&slot.cards.length>0
        ).slice(0,options.count);
        koPrizeContinuation.selectedSlots=chosen.length;
        if(chosen.length!==options.count ||
           pending.validate(chosen,clone.state)!==true){
          koPrizeContinuation.status='ordinary-ko-native-selection-rejected';
        }else{
          koPrizeContinuation.nativeValidated=true;
          const beforePrizes=replyTaker.prizes.reduce(
            (n,slot)=>n+slot.cards.length,0);
          const beforeHand=replyTaker.hand.cards.length;
          // Physical identities are retained only for post-choice custody
          // verification and never read by the selection policy.
          const selectedPhysical=chosen.flatMap(slot=>slot.cards.slice());
          koPrizeContinuation.beforePrizeCards=beforePrizes;
          try{
            clone.dispatch(new ResolvePromptAction(pending.id,chosen));
            koPrizeContinuation.nativeResolved=pending.result===chosen;
            settleWaitPrompts(clone);
            koPrizeContinuation.afterPrizeCards=replyTaker.prizes.reduce(
              (n,slot)=>n+slot.cards.length,0);
            koPrizeContinuation.ownerHandDelta=
              replyTaker.hand.cards.length-beforeHand;
            koPrizeContinuation.physicalOwnerHandTransfer=
              selectedPhysical.length===options.count &&
              selectedPhysical.every(card=>
                replyTaker.hand.cards.includes(card) &&
                !replyTaker.prizes.some(slot=>slot.cards.includes(card)));
            koPrizeContinuation.postPrizePendingPrompts=clone.state.prompts
              .filter(p=>p.result===undefined)
              .map(p=>p.constructor.name);
            koPrizeContinuation.status=
              koPrizeContinuation.nativeResolved &&
              koPrizeContinuation.physicalOwnerHandTransfer &&
              koPrizeContinuation.afterPrizeCards===
                beforePrizes-options.count &&
              koPrizeContinuation.ownerHandDelta===options.count?
                'native-ordinary-ko-prizes-transferred':
                'native-ordinary-ko-prize-custody-unverified';
          }catch(error){
            koPrizeContinuation.error=String(error?.message??error);
            koPrizeContinuation.status='native-ordinary-ko-prize-dispatch-error';
          }
        }
      }
    }
    attackFollowthrough.koPrizeContinuation=koPrizeContinuation;

    // Source owns the post-KO Active selection. Use the same face-up Bench
    // Trevenant & Dusknoir known from the independent defensive Retreat fork.
    // This is a diagnostic, fixed owner-public choice, not a general strategy.
    const sourcePromotion={
      ownerId,target:'Trevenant & Dusknoir-GX SMP',
      checkedNativePrompt:false,nativeValidated:false,
      nativeResolved:false,selectedOwnFaceupBench:true,
      sourceActiveAfter:null,nextActorId:null,
      remainingPromptTypes:[],status:'not-attempted',
      readConcealedOpponentCards:false
    };
    if(koPrizeContinuation.status==='native-ordinary-ko-prizes-transferred'){
      const ownerForPromotion=clone.state.players.find(p=>p.id===ownerId);
      const question=clone.state.prompts.find(p=>
        p.result===undefined && p.constructor.name==='ChoosePokemonPrompt');
      const message=deps.GameMessage??load('game/game-message').GameMessage;
      const options=question?.options;
      const target=ownerForPromotion.bench.find(slot=>
        slot.cards[0]?.fullName===sourcePromotion.target);
      sourcePromotion.checkedNativePrompt=Boolean(question);
      const shaped=Boolean(target&&question?.playerId===ownerId &&
        question.message===message.CHOOSE_NEW_ACTIVE_POKEMON &&
        question.playerType===PlayerType.BOTTOM_PLAYER &&
        Array.isArray(question.slots)&&question.slots.length===1&&
        question.slots[0]===SlotType.BENCH &&
        options?.min===1 && options.max===1 &&
        options.allowCancel===false &&
        Array.isArray(options.blocked)&&options.blocked.length===0 &&
        typeof question.getPerspectivePlayerId==='function' &&
        question.getPerspectivePlayerId()===ownerId &&
        typeof question.validate==='function');
      if(!shaped){
        sourcePromotion.status='source-owner-promotion-prompt-shape-unverified';
      }else if(question.validate([target],clone.state)!==true){
        sourcePromotion.status='source-owner-target-native-invalid';
      }else{
        sourcePromotion.nativeValidated=true;
        const chosen=[target];
        try{
          clone.dispatch(new ResolvePromptAction(question.id,chosen));
          sourcePromotion.nativeResolved=question.result===chosen;
          settleWaitPrompts(clone);
          const promotedOwner=clone.state.players.find(p=>p.id===ownerId);
          sourcePromotion.sourceActiveAfter=
            promotedOwner.active.getPokemonCard?.()?.fullName??null;
          sourcePromotion.nextActorId=
            clone.state.players[clone.state.activePlayer]?.id??null;
          sourcePromotion.remainingPromptTypes=clone.state.prompts
            .filter(p=>p.result===undefined).map(p=>p.constructor.name);
          sourcePromotion.status=
            sourcePromotion.nativeResolved &&
            sourcePromotion.sourceActiveAfter===sourcePromotion.target &&
            sourcePromotion.remainingPromptTypes.length===0?
              'native-source-promotion-settled':
              'native-source-promotion-incomplete';
        }catch(error){
          sourcePromotion.error=String(error?.message??error);
          sourcePromotion.status='native-source-promotion-dispatch-error';
        }
      }
    }
    attackFollowthrough.sourcePromotion=sourcePromotion;

    const ownerBenchTargetIndex=initial.bench.findIndex(cardList=>
      cardList.cards[0]?.name==='Trevenant & Dusknoir-GX');
    const hasSkylinerBenchPokemon=initial.bench.some(cardList=>
      cardList.cards.some(card=>card.fullName==='Latias ex SSP'));
    const baselineReply=copy();
    const baselineResult={
      opponentAttackName:'Eon Blade',opponentAttackNativeAccepted:false,
      ownerActiveAfter:null,ownerActiveDamageAfter:null,
      ownerPrizesAfter:null,opponentPrizesAfter:null,
      unresolvedPromptTypes:[],waitPrompts:[]
    };
    try{
      baselineReply.dispatch(new PassTurnAction(ownerId));
      settleWaitPrompts(baselineReply);
      baselineReply.dispatch(new AttackAction(opponentId,'Eon Blade'));
      baselineResult.opponentAttackNativeAccepted=true;
      baselineResult.waitPrompts=settleWaitPrompts(baselineReply);
    }catch(error){
      baselineResult.error=String(error?.message??error);
    }
    const baselineOwner=baselineReply.state.players.find(p=>p.id===ownerId);
    const baselineOpponent=baselineReply.state.players.find(p=>p.id===opponentId);
    baselineResult.ownerActiveAfter=
      baselineOwner.active.getPokemonCard?.()?.fullName??null;
    baselineResult.ownerActiveDamageAfter=baselineOwner.active.damage??null;
    baselineResult.ownerPrizesAfter=remainingPrizes(baselineOwner);
    baselineResult.opponentPrizesAfter=remainingPrizes(baselineOpponent);
    baselineResult.unresolvedPromptTypes=baselineReply.state.prompts
      .filter(p=>p.result===undefined).map(p=>p.constructor.name);

    const defense=copy();
    const defensiveLine={
      sourceOwnerHasSkylinerBenchPokemon:hasSkylinerBenchPokemon,
      retreatTargetIndex:ownerBenchTargetIndex,
      retreatNativeAccepted:false,opponentAttackName:'Eon Blade',
      opponentAttackNativeAccepted:false,ownerActiveAfterRetreat:null,
      ownerActiveAfterReply:null,ownerActiveDamageAfter:null,
      ownerPrizesAfter:null,opponentPrizesAfter:null,
      retreatWaitPrompts:[],opponentAttackWaitPrompts:[],
      unresolvedPromptTypes:[]
    };
    try{
      if(ownerBenchTargetIndex<0)throw new Error('Trevenant & Dusknoir bench target missing');
      defense.dispatch(new RetreatAction(ownerId,ownerBenchTargetIndex));
      defensiveLine.retreatNativeAccepted=true;
      defensiveLine.retreatWaitPrompts=settleWaitPrompts(defense);
      const afterRetreatOwner=defense.state.players.find(p=>p.id===ownerId);
      defensiveLine.ownerActiveAfterRetreat=
        afterRetreatOwner.active.getPokemonCard?.()?.fullName??null;
      const currentId=defense.state.players[defense.state.activePlayer].id;
      if(currentId===ownerId){
        defense.dispatch(new PassTurnAction(ownerId));
        settleWaitPrompts(defense);
      }
      const nextId=defense.state.players[defense.state.activePlayer].id;
      if(nextId!==opponentId)throw new Error('opponent turn was not reached after retreat');
      defense.dispatch(new AttackAction(opponentId,'Eon Blade'));
      defensiveLine.opponentAttackNativeAccepted=true;
      defensiveLine.opponentAttackWaitPrompts=settleWaitPrompts(defense);
    }catch(error){
      defensiveLine.error=String(error?.message??error);
    }
    const defensiveOwner=defense.state.players.find(p=>p.id===ownerId);
    const defensiveOpponent=defense.state.players.find(p=>p.id===opponentId);
    defensiveLine.ownerActiveAfterReply=
      defensiveOwner.active.getPokemonCard?.()?.fullName??null;
    defensiveLine.ownerActiveDamageAfter=defensiveOwner.active.damage??null;
    defensiveLine.ownerPrizesAfter=remainingPrizes(defensiveOwner);
    defensiveLine.opponentPrizesAfter=remainingPrizes(defensiveOpponent);
    defensiveLine.unresolvedPromptTypes=defense.state.prompts
      .filter(p=>p.result===undefined).map(p=>p.constructor.name);
    defensiveLine.status=defensiveLine.opponentAttackNativeAccepted&&
      defensiveLine.unresolvedPromptTypes.length===0?
      'native-defensive-reply-settled':'native-defensive-reply-incomplete';
    result.baselineOpponentReply=baselineResult;
    result.defensiveLine=defensiveLine;
    return result;
  }finally{
    Math.random=previousRandom;
  }
}

module.exports={VERSION,TARGET_TURN,ACTIVE,STADIUM,ATTACK,
  ownerStadiumIndex,probeStadiumThenEnergyDrive};
