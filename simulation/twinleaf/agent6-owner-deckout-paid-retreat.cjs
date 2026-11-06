'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {nativePublicCatalog}=
  require('./agent2-bilateral-multi-basic-retreat-bot.cjs');
const {publicSpecialAttackPayable}=
  require('./agent17-public-context-special-energy.cjs');

const VERSION='agent6-bilateral-owner-deckout-paid-retreat-v1';
const DECKOUT_TEXT="Discard the top card of your opponent's deck.";
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));

/**
 * Find a currently payable printed zero-damage attack that mills the public
 * opponent deck. The attack's actual resolution remains a Store question.
 * @param {object} view Frozen owner observation.
 * @param {object} catalog Public printing and Energy catalog.
 * @param {object} pokemon Public owner Pokémon.
 * @returns {object|null}
 */
function deckOutAttack(view,catalog,pokemon){
  if(!pokemon||pokemon.publicRestrictions?.cannotAttackNextTurn===true||
     pokemon.specialConditions?.some(x=>
       x===catalog.specialConditions?.ASLEEP||
       x===catalog.specialConditions?.PARALYZED))return null;
  for(const attack of pokemon.attacks??[]){
    if(attack.gxAttack===true||attack.damage!==0||
       attack.text!==DECKOUT_TEXT||
       pokemon.publicRestrictions?.blockedAttackNameNextTurn===attack.name||
       pokemon.publicRestrictions?.blockedAttackNameUntilLeavesActive===attack.name||
       pokemon.publicRestrictions?.cannotUseAttacksNextTurn?.includes(attack.name)||
       (pokemon.publicRestrictions?.onlyAllowedAttackNameNextTurn&&
        pokemon.publicRestrictions.onlyAllowedAttackNameNextTurn!==attack.name)||
       !publicSpecialAttackPayable(view,catalog,pokemon,attack))continue;
    return {
      attackName:attack.name,
      hasDoubleAttackTrait:
        (pokemon.abilities??[]).some(name=>/barrage/i.test(name))||
        (pokemon.abilityDetails??[]).some(power=>
          typeof power.text==='string'&&/attack twice/i.test(power.text))
    };
  }
  return null;
}

/**
 * Locate an already-funded deck-out attacker on the owner's Bench. The owner
 * is not behind in deck count and the opponent still has cards to mill.
 * @param {object} view Frozen owner observation.
 * @param {object} catalog Public printing and Energy catalog.
 * @returns {object|null}
 */
function fundedDeckOutBench(view,catalog){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,opponent=view.opponentPublic;
  if(!own||!opponent||
     !Number.isSafeInteger(own.deckCount)||
     !Number.isSafeInteger(opponent.deckCount)||
     opponent.deckCount<1||own.deckCount<opponent.deckCount)
    return null;
  for(let benchIndex=0;benchIndex<(own.bench??[]).length;benchIndex++){
    const pokemon=own.bench[benchIndex];
    const attack=deckOutAttack(view,catalog,pokemon);
    if(attack)return {
      benchIndex,printing:pokemon.printing,
      attackName:attack.attackName,
      hasDoubleAttackTrait:attack.hasDoubleAttackTrait
    };
  }
  return null;
}

/**
 * Strict public checks shared by the recipient and RetreatAction stages.
 * Unknown Stadium/Tool modifiers and a usable Skyliner are deliberate vetoes.
 * @param {object} view Frozen owner observation.
 * @param {object} catalog Public printing and Energy catalog.
 * @param {number} attachedEnergyCount Required Active Energy count.
 * @returns {object|null}
 */
function deckOutPaidRetreatOpportunity(view,catalog,attachedEnergyCount){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,opponent=view.opponentPublic;
  const active=own?.active,resources=view.ownTurnResources;
  const printed=active?.printed?.retreatCost;
  if(!own||!opponent||!active||!resources||
     view.globalTurn<=1||
     !Number.isSafeInteger(resources.retreatedTurn)||
     resources.retreatedTurn===view.globalTurn||
     (own.publicTurnRestrictions?.attackLockTurnsRemaining??0)>0||
     !Array.isArray(printed)||printed.length!==1||
     printed[0]!==catalog.colorlessEnergyType||
     !Array.isArray(active.energies)||
     active.energies.length!==attachedEnergyCount||
     (active.tools??[]).length>0||
     (own.stadium??[]).length>0||
     (opponent.stadium??[]).length>0||
     active.publicRestrictions?.cannotRetreatNextTurn===true||
     active.publicRestrictions?.cannotRetreatWhileActive===true||
     active.specialConditions?.some(x=>
       x===catalog.specialConditions?.ASLEEP||
       x===catalog.specialConditions?.PARALYZED)||
     [own.active,...(own.bench??[])].some(p=>
       p?.abilities?.includes('Skyliner')))
    return null;
  if(attachedEnergyCount===1&&
     !catalog.basicEnergies.has(active.energies[0]))return null;
  if((active.attacks??[]).some(attack=>
    attack.gxAttack!==true&&Number.isSafeInteger(attack.damage)&&
    attack.damage>0&&publicSpecialAttackPayable(view,catalog,active,attack)))
    return null;
  const funded=fundedDeckOutBench(view,catalog);
  if(!funded)return null;
  return {
    actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    activePrinting:active.printing,
    ownerDeckCount:own.deckCount,
    opponentDeckCount:opponent.deckCount,
    fundedBench:funded
  };
}

/**
 * Redirect only an already selected held Basic Energy from a different Bench
 * target to an Active that needs exactly one Colorless for the deck-out pivot.
 * @param {object} view Frozen owner observation.
 * @param {object} catalog Public printing and Energy catalog.
 * @param {object|null} original Existing recipient proposal.
 * @returns {object|null}
 */
function chooseDeckOutEnergyRecipient(view,catalog,original){
  if(original?.slot!=='bench'||
     !Number.isSafeInteger(original.handIndex)||
     !catalog.basicEnergies.has(original.printing)||
     view.ownHand?.[original.handIndex]!==original.printing||
     view.ownTurnResources?.energyPlayLocked===true||
     view.ownTurnResources?.energyPlayedTurn===view.globalTurn)
    return original;
  const opportunity=deckOutPaidRetreatOpportunity(view,catalog,0);
  if(!opportunity||original.index===opportunity.fundedBench.benchIndex)
    return original;
  return {
    ...original,slot:'active',index:0,
    originalBenchIndex:original.index,
    attackName:null,gapBefore:null,gapAfter:null,
    deckOutRetreatRecipient:true,
    deckOutOpportunity:opportunity
  };
}

/**
 * Propose the paid RetreatAction only after the same held Basic Energy is
 * physically attached to the Active. Native effective fee is checked again.
 * @param {object} view Frozen owner observation.
 * @param {object} catalog Public printing and Energy catalog.
 * @returns {object|null}
 */
function chooseDeckOutPaidRetreat(view,catalog){
  const opportunity=deckOutPaidRetreatOpportunity(view,catalog,1);
  if(!opportunity)return null;
  return {
    kind:'paid-retreat',
    benchIndex:opportunity.fundedBench.benchIndex,
    printing:opportunity.fundedBench.printing,
    attackName:opportunity.fundedBench.attackName,
    retreatCostUnits:1,
    ownerDeckCount:opportunity.ownerDeckCount,
    opponentDeckCount:opportunity.opponentDeckCount,
    hasDoubleAttackTrait:opportunity.fundedBench.hasDoubleAttackTrait,
    source:VERSION,
    paperFullLegalityCertified:false
  };
}

/**
 * Apply one identical owner-only deck-out policy to both seats. It may retarget
 * an existing Basic attachment, replace a genuine Pass with a paid RetreatAction
 * after a one-Colorless native preflight, and accept a genuine optional second
 * deck-out attack prompt. The Store remains authoritative for every action.
 *
 * @template T
 * @param {()=>T} execute Native match execution.
 * @param {object} [deps] Reversible test seams.
 * @returns {{result:T,audit:object}}
 */
function withBilateralDeckOutPaidRetreat(execute,deps={}){
  assert.equal(typeof execute,'function');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const RetreatAction=deps.RetreatAction??
    native('game/store/actions/game-actions').RetreatAction;
  const Store=deps.Store??native('game/store/store').Store;
  const CheckRetreatCostEffect=deps.CheckRetreatCostEffect??
    native('game/store/effects/check-effects').CheckRetreatCostEffect;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const GameMessage=deps.GameMessage??native('game/game-message').GameMessage;
  const catalog=deps.catalog??nativePublicCatalog();
  const observe=deps.observe??actorObservation;
  const recipientModule=deps.recipientModule??
    require('./agent44-actor-energy-recipient.cjs');
  const oldRecipient=recipientModule.chooseActorEnergyRecipient;
  const oldDecoder=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof oldDecoder?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  const audit={
    version:VERSION,sameAlgorithmBothSeats:true,
    actorOnlySelection:true,opponentHiddenZonesRead:false,
    originalRecipientCalls:0,recipientRetargetsBySeat:[0,0],
    recipientProposals:[],
    originalPassesBySeat:[0,0],nominalRetreatOffersBySeat:[0,0],
    nativeExactFeeBySeat:[0,0],nativeFeeVetoBySeat:[0,0],
    typedRetreatsBySeat:[0,0],retreatProposals:[],
    deckOutAttackRoots:[],
    eligibleSecondAttackConfirmPrompts:0,
    acceptedSecondAttackConfirmPrompts:0,
    chosenSecondAttackPrompts:0,secondAttackTurns:[],
    competitivelyQualifiedGames:0
  };
  let markedDeckOutAttack=null;

  function chooseRecipient(view,publicCatalog,...args){
    const original=oldRecipient(view,publicCatalog,...args);
    audit.originalRecipientCalls++;
    const selected=chooseDeckOutEnergyRecipient(view,publicCatalog,original);
    if(selected?.deckOutRetreatRecipient){
      audit.recipientRetargetsBySeat[view.actorSeat]++;
      audit.recipientProposals.push({
        actorSeat:view.actorSeat,globalTurn:view.globalTurn,
        heldBasic:selected.printing,handIndex:selected.handIndex,
        originalBenchIndex:selected.originalBenchIndex,
        selectedRecipient:'active',
        deckOutOpportunity:selected.deckOutOpportunity
      });
    }
    return selected;
  }

  function dispatch(action,...args){
    const state=this.state;
    const seat=state?.activePlayer;
    const active=state?.players?.[seat]?.active?.getPokemonCard?.();
    if(action?.constructor?.name==='AttackAction'&&
       (seat===0||seat===1)&&active){
      const attack=active.attacks?.find(move=>move.name===action.name);
      if(attack?.damage===0&&attack.text===DECKOUT_TEXT){
        markedDeckOutAttack={
          seat,turn:state.turn,printing:active.fullName,
          attackName:attack.name
        };
        audit.deckOutAttackRoots.push({...markedDeckOutAttack});
      }
    }
    const result=oldDispatch.value.call(this,action,...args);
    if(markedDeckOutAttack!==null&&
       this.state?.turn!==markedDeckOutAttack.turn)
      markedDeckOutAttack=null;
    return result;
  }

  function decoder(state,...args){
    const prompt=(state.prompts??[]).find(p=>p.result===undefined);
    const seat=state.activePlayer;
    const player=state.players?.[seat];
    const opponent=state.players?.[1-seat];
    if(markedDeckOutAttack!==null&&
       state.turn===markedDeckOutAttack.turn&&
       seat===markedDeckOutAttack.seat&&
       player&&prompt?.playerId===player.id){
      if(prompt.constructor?.name==='ConfirmPrompt'&&
         prompt.message===GameMessage.WANT_TO_USE_ABILITY&&
         (opponent?.deck?.cards?.length??0)>0){
        audit.eligibleSecondAttackConfirmPrompts++;
        if(prompt.validate(true)===true){
          audit.acceptedSecondAttackConfirmPrompts++;
          return new ResolvePromptAction(prompt.id,true);
        }
      }
      if(prompt.constructor?.name==='ChooseAttackPrompt'&&
         prompt.message===GameMessage.CHOOSE_ATTACK_TO_COPY){
        const printed=prompt.cards?.find(card=>
          card.fullName===markedDeckOutAttack.printing);
        const attack=printed?.attacks?.find(move=>
          move.name===markedDeckOutAttack.attackName&&
          move.damage===0&&move.text===DECKOUT_TEXT);
        if(attack&&prompt.validate(attack)===true){
          audit.chosenSecondAttackPrompts++;
          audit.secondAttackTurns.push(state.turn);
          return new ResolvePromptAction(prompt.id,attack);
        }
      }
    }

    const original=oldDecoder.value.call(this,state,...args);
    if(original?.constructor?.name!=='PassTurnAction'||
       !Number.isSafeInteger(state?.turn)||state.turn<=1||
       (seat!==0&&seat!==1)||
       (state.prompts??[]).some(p=>p.result===undefined))
      return original;
    audit.originalPassesBySeat[seat]++;
    const view=observe(state,seat);
    const offer=chooseDeckOutPaidRetreat(view,catalog);
    if(!offer)return original;
    assert.ok(Number.isSafeInteger(offer.benchIndex)&&
      offer.benchIndex>=0&&offer.benchIndex<5);
    audit.nominalRetreatOffersBySeat[seat]++;
    const before=JSON.stringify(view);
    const checker=new Store({onStateChange(){}});
    checker.state=state;
    const effect=new CheckRetreatCostEffect(state.players[seat]);
    checker.reduceEffect(state,effect);
    assert.equal(JSON.stringify(observe(state,seat)),before,
      'Native retreat-cost preflight changed the owner observation');
    const actualNativeFee=Array.isArray(effect.cost)?[...effect.cost]:null;
    const exactOneColorless=actualNativeFee?.length===1&&
      actualNativeFee[0]===catalog.colorlessEnergyType;
    const proposal={
      actorSeat:seat,globalTurn:state.turn,
      active:view.ownPublic.active?.printing??null,
      actualNativeFee,
      exactOneColorless,
      offer:{...offer},
      outcome:exactOneColorless?
        'typed-retreat-action-pending-Store':'veto-native-fee-mismatch'
    };
    audit.retreatProposals.push(proposal);
    if(!exactOneColorless){
      audit.nativeFeeVetoBySeat[seat]++;
      return original;
    }
    audit.nativeExactFeeBySeat[seat]++;
    audit.typedRetreatsBySeat[seat]++;
    return new RetreatAction(state.players[seat].id,offer.benchIndex);
  }

  recipientModule.chooseActorEnergyRecipient=chooseRecipient;
  Object.defineProperty(Store.prototype,'dispatch',{
    ...oldDispatch,value:dispatch
  });
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...oldDecoder,value:decoder
  });
  try{
    return {result:execute(),audit};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decoder);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldDecoder);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    assert.strictEqual(recipientModule.chooseActorEnergyRecipient,chooseRecipient);
    recipientModule.chooseActorEnergyRecipient=oldRecipient;
  }
}

module.exports={
  VERSION,DECKOUT_TEXT,deckOutAttack,fundedDeckOutBench,
  deckOutPaidRetreatOpportunity,chooseDeckOutEnergyRecipient,
  chooseDeckOutPaidRetreat,withBilateralDeckOutPaidRetreat
};
