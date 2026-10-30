'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {BASIC_ENERGY_TYPE}=require('./printed-basic-energy-audit.cjs');

const VERSION='agent5-owner-root-slice-v4-floatstone-mobility-witness-development-unqualified';

/**
 * Determine whether one attached Basic Energy per type covers a printed
 * attack cost. Unknown Special Energy are deliberately not credited.
 * @param {(string|number)[]} cost Printed attack symbols.
 * @param {(string|number)[]} attached Known Basic Energy types.
 * @param {string|number} [colorlessSymbol] Pinned numeric CardType.COLORLESS.
 * @returns {boolean}
 */
function basicEnergyPays(cost,attached,colorlessSymbol='COLORLESS'){
  const left=[...attached];
  for(const symbol of cost.filter(type=>type!==colorlessSymbol)){
    const i=left.indexOf(symbol);
    if(i<0)return false;
    left.splice(i,1);
  }
  return left.length>=cost.filter(type=>type===colorlessSymbol).length;
}

/**
 * Pure owner-root choice, using only the detached actor view and publicly
 * defined card metadata for visible cards. The catalog has no State objects.
 * Unknown actions fail closed to Pass. This is an intentionally weak
 * development baseline, not a complete competitive decision policy.
 * @param {object} view Detached frozen actorObservation.
 * @param {Record<string,object>} catalog Own-hand/face-up card print metadata.
 * @param {{colorlessSymbol?:string|number,incapacitatingStatuses?:(string|number)[]}} [options] Pinned printed and status enums.
 * @returns {object}
 */
function selectOwnerRootIntent(view,catalog,options={}){
  const colorlessSymbol=options.colorlessSymbol??'COLORLESS';
  const incapacitatingStatuses=options.incapacitatingStatuses??
    ['ASLEEP','PARALYZED'];
  assert.equal(view.decisionKind,'owner-root');
  const turn=view.globalTurn;
  const flags=view.ownTurnResources;
  const active=view.ownPublic.active;
  if(!active)return {kind:'pass',reason:'no-active'};
  const held=view.ownHand.map((printing,index)=>({
    printing,index,meta:catalog[printing]??{}
  }));
  const free=view.ownPublic.bench.findIndex(slot=>slot===null);
  const benched=view.ownPublic.bench.filter(Boolean).length;
  if(free>=0&&benched===0&&flags.pokemonPlayLocked!==true){
    const basic=held.find(row=>row.meta.basicPokemon===true&&
      !(flags.abilityPokemonPlayLocked===true&&
        row.meta.hasAbility===true));
    if(basic)return {kind:'bench-basic',printing:basic.printing,
      handIndex:basic.index,benchSlot:free};
  }
  const attached=active.energies.map(printing=>
    catalog[printing]?.basicEnergyType??null)
    .filter(type=>type!==null);
  const attacks=active.attacks.filter(attack=>
    attack.gxAttack!==true||view.ownPublic.publicTurnRestrictions.gxUsed!==true);
  if(flags.energyPlayLocked!==true&&
      flags.energyPlayedTurn!==turn&&active){
    const basics=held.filter(row=>row.meta.basicEnergyType);
    const deficits=attacks.flatMap(attack=>
      attack.cost.filter(symbol=>symbol!==colorlessSymbol&&
        !basicEnergyPays([symbol],attached,colorlessSymbol)));
    const energy=basics.find(row=>
      deficits.includes(row.meta.basicEnergyType))??basics[0];
    if(energy)return {kind:'attach-basic-energy',
      printing:energy.printing,handIndex:energy.index};
  }
  const restrictions=active.publicRestrictions;
  const unable=turn===1||
    view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining>0||
    active.specialConditions.some(condition=>
      incapacitatingStatuses.includes(condition))||
    restrictions.cannotAttackNextTurn===true;
  if(!unable){
    for(const attack of attacks){
      if(restrictions.cannotUseAttacksNextTurn.includes(attack.name)||
         restrictions.blockedAttackNameNextTurn===attack.name||
         restrictions.blockedAttackNameUntilLeavesActive===attack.name||
         (restrictions.onlyAllowedAttackNameNextTurn!==null&&
          restrictions.onlyAllowedAttackNameNextTurn!==attack.name))continue;
      if(basicEnergyPays(attack.cost,attached,colorlessSymbol)){
        return {kind:'attack',name:attack.name};
      }
    }
  }
  return {kind:'pass',reason:'no-supported-safe-root'};
}

/**
 * Translate an actor-only intent into a genuine pinned Store input.
 * Native card objects are touched only after the abstract choice and only
 * for the acting player's own hand. Store.dispatch remains the final arbiter.
 * @param {object} intent
 * @param {object} player Real acting owner.
 * @param {object} deps Native action classes and target enums.
 * @returns {object}
 */
function nativeActionForIntent(intent,player,deps){
  const {PlayCardAction,AttackAction,PassTurnAction,PlayerType,SlotType}=deps;
  if(intent.kind==='attack')return new AttackAction(player.id,intent.name);
  if(intent.kind==='bench-basic'||intent.kind==='attach-basic-energy'){
    assert.equal(player.hand.cards[intent.handIndex]?.fullName,intent.printing);
    const slot=intent.kind==='bench-basic'?SlotType.BENCH:SlotType.ACTIVE;
    const index=intent.kind==='bench-basic'?intent.benchSlot:0;
    return new PlayCardAction(player.id,intent.handIndex,{
      player:PlayerType.BOTTOM_PLAYER,slot,index
    });
  }
  assert.equal(intent.kind,'pass');
  return new PassTurnAction(player.id);
}

/**
 * Only physically observable owner root consequences are read here.
 * A settled attack requires the separate actual-game declaration log.
 * @param {object} state Authenticated live native Store State.
 * @param {0|1} seat
 * @param {object} intent
 * @returns {object}
 */
function rootPhysicalSnapshot(state,seat,intent){
  const owner=state.players[seat];
  const target=intent.kind==='evolve-pokemon'?(intent.slot==='bench'?owner.bench[intent.index]:owner.active):null;
  const toolRecipient=intent.kind==='equip-bunnelby-tm'?
    (intent.slot==='bench'?owner.bench[intent.index]:owner.active):null;
  const jetRecipient=intent.kind==='attach-special-energy'&&
    intent.slot==='bench'?owner.bench[intent.index]:null;
  const energyRecipient=intent.kind==='paid-retreat'?
    owner.bench[intent.benchIndex]:
    (intent.kind==='attach-basic-energy'||
     intent.kind==='attach-special-energy')&&intent.slot==='bench'?
      owner.bench[intent.index]:owner.active;
  return {
    evolutionTop:target?.getPokemonCard()?.fullName??null,
    evolutionLayers:target?.getPokemons().length??null,
    turn:state.turn,phase:state.phase,
    handCount:owner.hand.cards.length,
    stadiumPrintings:owner.stadium?.cards?.map(c=>c.fullName)??[],
    activeEnergies:owner.active.energies.cards.map(c=>c.fullName),
    activeToolPrintings:owner.active.tools?.map(c=>c.fullName)??[],
    ...(toolRecipient?{
      toolRecipientPokemonPrinting:
        toolRecipient.getPokemonCard()?.fullName??null,
      toolRecipientToolPrintings:
        toolRecipient.tools?.map(c=>c.fullName)??[]
    }:{}),
    ...(jetRecipient?{
      jetBenchTargetPokemonPrinting:
        jetRecipient.getPokemonCard()?.fullName??null,
      jetActivePokemonPrinting:
        owner.active.getPokemonCard()?.fullName??null
    }:{}),
    ...(['paid-retreat','retreat-emergency-floatstone'].includes(intent.kind)?{
      activePokemonPrinting:owner.active.getPokemonCard()?.fullName??null,
      targetPokemonPrinting:
        owner.bench[intent.benchIndex]?.getPokemonCard()?.fullName??null,
      retreatedTurn:owner.retreatedTurn,
      publicSkylinerPresent:[owner.active,...owner.bench].some(slot=>
        slot?.getPokemonCard()?.powers?.some(power=>
          power.name==='Skyliner')===true)
    }:{}),
    targetEnergies:energyRecipient?.energies?.cards.map(c=>c.fullName)??null,
    benchPrinting:intent.kind==='bench-basic'?
      owner.bench[intent.benchSlot].getPokemonCard()?.fullName??null:null,
    ...(intent.kind==='play-seeker-get-lillie'?{
      seekerSpent:[...owner.discard.cards,...owner.supporter.cards]
        .filter(card=>card.fullName===intent.printing).length
    }:{}),
    ...(intent.kind==='play-quick-ball'?{
      quickBallSpent:[...owner.discard.cards,...owner.supporter.cards]
        .filter(card=>card.fullName===intent.printing).length
    }:{}),
    ...(['play-stranded-marnie','play-lowhand-lillie',
      'play-conservative-shuffle-supporter','play-carmine-first',
      'play-seeker-recovered-lillie'].includes(intent.kind)?{
      supporterTurn:owner.supporterTurn,
      supporterSpent:[...owner.discard.cards,...owner.supporter.cards]
        .filter(card=>card.fullName===intent.printing).length
    }:{}),
    // Preserve the existing observable field for downstream Marnie fixtures.
    ...(intent.kind==='play-stranded-marnie'?{
      marnieSpent:[...owner.discard.cards,...owner.supporter.cards]
        .filter(card=>card.fullName===intent.printing).length
    }:{})
  };
}

/**
 * Native dispatch need not throw when a proposed action fails to settle.
 * Confirm the expected owner/public-zone physical change without reading
 * concealed card identities or mistaking a successful dispatch for an attack.
 * @param {object} intent
 * @param {object} before
 * @param {object} after
 * @param {object} GamePhase Pinned phase enum.
 * @returns {'confirmed-public-effect'|'no-confirmed-public-effect'|'attack-needs-declaration'}
 */
function rootPhysicalWitness(intent,before,after,GamePhase){
  if(intent.kind==='evolve-pokemon')return before.evolutionTop===intent.from&&after.evolutionTop===intent.printing&&after.evolutionLayers===before.evolutionLayers+1?'confirmed-public-effect':'no-confirmed-public-effect';
  if(intent.kind==='bench-basic'){
    return before.benchPrinting===null&&
      after.benchPrinting===intent.printing&&
      after.handCount===before.handCount-1?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='equip-bunnelby-tm'){
    const beforeTools=before.toolRecipientToolPrintings;
    const afterTools=after.toolRecipientToolPrintings;
    const count=cards=>cards.filter(x=>x===intent.printing).length;
    return before.toolRecipientPokemonPrinting!==null&&
      before.toolRecipientPokemonPrinting===after.toolRecipientPokemonPrinting&&
      Array.isArray(beforeTools)&&Array.isArray(afterTools)&&
      count(beforeTools)===0&&count(afterTools)===1&&
      after.handCount===before.handCount-1?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='attach-emergency-floatstone'){
    // The intent's printing names the desired Benched replacement, not the
    // Tool. Verify the exact held Float Stone reached the Active's Tool zone.
    const stone=require('./agent1-owner-float-stone-mobility.cjs').FLOAT_STONE;
    const count=cards=>cards.filter(c=>c===stone).length;
    return Array.isArray(before.activeToolPrintings)&&
      Array.isArray(after.activeToolPrintings)&&
      count(before.activeToolPrintings)===0&&
      count(after.activeToolPrintings)===1&&
      after.handCount===before.handCount-1?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='retreat-emergency-floatstone'){
    // A zero-cost Float Stone retreat must move the exact selected Benched
    // Pokemon, while the former Active occupies the vacated Bench slot.
    return before.activePokemonPrinting!==null&&
      before.targetPokemonPrinting===intent.printing&&
      before.activePokemonPrinting!==intent.printing&&
      after.activePokemonPrinting===intent.printing&&
      after.targetPokemonPrinting===before.activePokemonPrinting&&
      after.retreatedTurn===before.turn?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='equip-powerglass'){
    const count=cards=>cards.filter(c=>c===intent.printing).length;
    return count(before.activeToolPrintings)===0&&
      count(after.activeToolPrintings)===1&&
      after.handCount===before.handCount-1?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='attach-basic-energy'){
    const count=cards=>cards.filter(c=>c===intent.printing).length;
    const ownBefore=intent.slot==='bench'?before.targetEnergies:before.activeEnergies;
    const ownAfter=intent.slot==='bench'?after.targetEnergies:after.activeEnergies;
    return Array.isArray(ownBefore)&&Array.isArray(ownAfter)&&
      ownAfter.length===ownBefore.length+1&&
      count(ownAfter)===count(ownBefore)+1&&
      after.handCount===before.handCount-1?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='attach-special-energy'&&
     intent.slot==='bench'&&intent.printing.startsWith('Jet Energy ')){
    // Jet's mandatory swap moves the intended Bench recipient into Active.
    // Post-swap the original Bench index contains the old Active; a normal
    // same-slot Energy witness would falsely reject the genuine attachment.
    const count=cards=>cards.filter(x=>x===intent.printing).length;
    return before.jetBenchTargetPokemonPrinting!==null&&
      before.jetActivePokemonPrinting!==null&&
      before.jetBenchTargetPokemonPrinting!==before.jetActivePokemonPrinting&&
      after.jetActivePokemonPrinting===before.jetBenchTargetPokemonPrinting&&
      after.jetBenchTargetPokemonPrinting===before.jetActivePokemonPrinting&&
      Array.isArray(before.targetEnergies)&&
      Array.isArray(after.activeEnergies)&&
      count(after.activeEnergies)===count(before.targetEnergies)+1?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='attach-special-energy'||intent.kind==='attach-dce'){
    // A Special Energy such as Speed Lightning can draw cards on attachment.
    // Confirm the actual visible attached physical card rather than assuming
    // a one-card hand decrease after any triggered effect or new prompt.
    const count=cards=>cards.filter(c=>c===intent.printing).length;
    // Public-context Special Energy may target a Benched attacker. Confirm
    // the actual recipient, not a different Active Pokemon's Energy zone.
    const beforeEnergies=intent.slot==='bench'?
      before.targetEnergies:before.activeEnergies;
    const afterEnergies=intent.slot==='bench'?
      after.targetEnergies:after.activeEnergies;
    return Array.isArray(beforeEnergies)&&Array.isArray(afterEnergies)&&
      afterEnergies.length===beforeEnergies.length+1&&
      count(afterEnergies)===count(beforeEnergies)+1?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='play-stranded-marnie'||
     intent.kind==='play-lowhand-lillie'||
     intent.kind==='play-conservative-shuffle-supporter'||
     intent.kind==='play-carmine-first'||
     intent.kind==='play-seeker-recovered-lillie'){
    // The genuine Store first moves the Supporter into its publicly
    // resolving zone; subsequent hand redraws may require more prompts.
    // This attests dispatch/quota only, not the draw or tactical outcome.
    const beforeSpent=before.supporterSpent??before.marnieSpent;
    const afterSpent=after.supporterSpent??after.marnieSpent;
    return afterSpent>beforeSpent&&
      after.supporterTurn>before.supporterTurn?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='play-seeker-get-lillie'){
    // Physical native Item departure, with the own-discard retrieval pending.
    return after.seekerSpent>before.seekerSpent&&
      after.handCount<before.handCount?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='play-quick-ball'){
    // Native Quick Ball moves into the resolving Trainer zone before the
    // discard/search prompts settle, or into the public discard immediately.
    return after.quickBallSpent>before.quickBallSpent &&
      after.handCount<before.handCount?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='play-thunder-mountain'){
    const count=cards=>cards.filter(c=>c===intent.printing).length;
    return Array.isArray(before.stadiumPrintings)&&
      Array.isArray(after.stadiumPrintings)&&
      count(after.stadiumPrintings)===1&&
      count(before.stadiumPrintings)===0&&
      after.handCount===before.handCount-1?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='paid-retreat'){
    return before.activePokemonPrinting!==null&&
      before.targetPokemonPrinting===intent.printing&&
      before.activePokemonPrinting!==intent.printing&&
      after.activePokemonPrinting===intent.printing&&
      after.targetPokemonPrinting===before.activePokemonPrinting&&
      Array.isArray(before.activeEnergies)&&
      before.activeEnergies.length===1&&
      Array.isArray(after.targetEnergies)&&
      (after.targetEnergies.length===0||
       (before.publicSkylinerPresent===true&&
        JSON.stringify(after.targetEnergies)===
          JSON.stringify(before.activeEnergies)))&&
      after.retreatedTurn===before.turn?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='pass'){
    return after.turn>before.turn||
      (after.phase===GamePhase.FINISHED&&
        before.phase!==GamePhase.FINISHED)?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='perfection')return 'attack-needs-declaration';
  assert.equal(intent.kind,'attack');
  return 'attack-needs-declaration';
}

/**
 * A narrowly scoped, reversible actual-Store prototype.
 * The candidate root is actor-only; pending prompt and source decisions
 * retain the generic policy and are explicitly counted as unqualified.
 * No repository engine files or opponent hidden zones are modified.
 * @template T
 * @param {0|1} candidateSeat Actual physical candidate seat for ONE game.
 * @param {()=>T} work One native game.
 * @param {object} [deps] Synthetic-test dependency seam.
 * @returns {{result:T,audit:object}}
 */
function withOwnerRootSlice(candidateSeat,work,deps={}){
  assert.ok(candidateSeat===0||candidateSeat===1);
  assert.equal(typeof work,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const engine=p=>require(path.join(output,p));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??engine('game/store/store').Store;
  const {GamePhase}=deps.GamePhase??engine('game/store/state/state');
  const actionClasses=deps.actionClasses??{
    ...engine('game/store/actions/play-card-action'),
    ...engine('game/store/actions/game-actions')
  };
  const enums=deps.enums??{
    ...engine('game/store/card/card-types'),
    ...engine('game/store/card/pokemon-types')
  };
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  const records=[];
  const actionRecords=new WeakMap();
  let promptFallbacks=0,sourceFallbacks=0,ownerRootProposals=0;
  let nonLiveSpeculativeFallbacks=0,liveStore=null;
  function intercepted(state,...args){
    // The simulator can recursively inspect speculative Store clones. Only
    // the authenticated AddPlayerAction Store is eligible for this policy.
    if(state!==liveStore?.state){
      nonLiveSpeculativeFallbacks++;
      return original.call(this,state,...args);
    }
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(pending){
      promptFallbacks++;
      return original.call(this,state,...args);
    }
    if(state.phase!==GamePhase.PLAYER_TURN||
       state.activePlayer!==candidateSeat){
      sourceFallbacks++;
      return original.call(this,state,...args);
    }
    const view=actorObservation(state,candidateSeat);
    const player=state.players[candidateSeat];
    const catalog=Object.create(null);
    const publicCards=[
      ...player.hand.cards,...player.active.energies.cards
    ];
    for(const card of publicCards){
      const basic=card.superType===enums.SuperType.POKEMON&&
        card.stage===enums.Stage.BASIC;
      const energy=card.superType===enums.SuperType.ENERGY&&
        card.energyType===enums.EnergyType.BASIC;
      catalog[card.fullName]=Object.freeze({
        basicPokemon:basic,
        hasAbility:basic&&card.powers.some(power=>
          power.powerType===enums.PowerType.ABILITY),
        basicEnergyType:energy?
          enums.CardType[BASIC_ENERGY_TYPE[card.name]]??null:null
      });
    }
    const intent=selectOwnerRootIntent(view,catalog,{
      colorlessSymbol:enums.CardType.COLORLESS,
      incapacitatingStatuses:[enums.SpecialCondition.ASLEEP,
        enums.SpecialCondition.PARALYZED]
    });
    const action=nativeActionForIntent(intent,player,{
      ...actionClasses,...enums
    });
    const record={turn:view.globalTurn,seat:candidateSeat,
      intent,printing:player.active.getPokemonCard()?.fullName??null,
      originalProposal:action.constructor.name,
      // This is a copy of the already detached actor view. No physical
      // deck, Prize identities or opposing hand can enter diagnostics.
      passActorView:intent.kind==='pass'?{
        energyPrintings:view.ownPublic.active.energies,
        printedAttacks:view.ownPublic.active.attacks.map(attack=>({
          name:attack.name,cost:attack.cost,gxAttack:attack.gxAttack
        })),
        ownerBasicEnergyHeld:view.ownHand.filter(printing=>
          catalog[printing]?.basicEnergyType),
        publicRestrictions:view.ownPublic.active.publicRestrictions,
        playerWide:view.ownPublic.publicTurnRestrictions
      }:null,
      acceptedByLiveStore:false,storeError:null};
    records.push(record);
    ownerRootProposals++;
    actionRecords.set(action,record);
    return action;
  }
  function tracedDispatch(action,...args){
    if(liveStore===null&&action?.constructor?.name==='AddPlayerAction'){
      liveStore=this;
    }
    const row=this===liveStore?actionRecords.get(action):null;
    const physicalBefore=row?
      rootPhysicalSnapshot(this.state,row.seat,row.intent):null;
    try{
      const outcome=descriptor.value.call(this,action,...args);
      if(row){
        row.acceptedByLiveStore=true;
        const physicalAfter=rootPhysicalSnapshot(
          this.state,row.seat,row.intent);
        row.nativeEffectStatus=rootPhysicalWitness(
          row.intent,physicalBefore,physicalAfter,GamePhase);
      }
      return outcome;
    }catch(error){
      if(row)row.storeError=String(error);
      throw error;
    }
  }
  SimpleTacticsAi.prototype.decodeNextAction=intercepted;
  Object.defineProperty(Store.prototype,'dispatch',{
    ...descriptor,value:tracedDispatch
  });
  try{
    const result=work();
    return {result,audit:{version:VERSION,candidateSeat,
      ownerRootProposals,promptGenericFallbacks:promptFallbacks,
      sourceGenericFallbacks:sourceFallbacks,
      nonLiveSpeculativeFallbacks,
      authenticatedLiveStore:liveStore!==null,
      acceptedByLiveStore:records.filter(row=>row.acceptedByLiveStore).length,
      confirmedPublicEffects:records.filter(row=>
        row.nativeEffectStatus==='confirmed-public-effect').length,
      unconfirmedPublicEffects:records.filter(row=>
        row.nativeEffectStatus==='no-confirmed-public-effect').length,
      records,hiddenInformationSafeForCompleteGame:false,
      competitiveGameQualified:false,
      scope:'Owner-root intents only; all other bot decisions remain unqualified'}};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,intercepted);
    SimpleTacticsAi.prototype.decodeNextAction=original;
    assert.strictEqual(Store.prototype.dispatch,tracedDispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={VERSION,basicEnergyPays,selectOwnerRootIntent,
  nativeActionForIntent,rootPhysicalSnapshot,rootPhysicalWitness,
  withOwnerRootSlice};
