'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {BASIC_ENERGY_TYPE}=require('./printed-basic-energy-audit.cjs');

const VERSION='agent5-owner-root-slice-v2-numeric-statuses-development-unqualified';

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
  return {
    turn:state.turn,phase:state.phase,
    handCount:owner.hand.cards.length,
    activeEnergies:owner.active.energies.cards.map(c=>c.fullName),
    benchPrinting:intent.kind==='bench-basic'?
      owner.bench[intent.benchSlot].getPokemonCard()?.fullName??null:null
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
  if(intent.kind==='bench-basic'){
    return before.benchPrinting===null&&
      after.benchPrinting===intent.printing&&
      after.handCount===before.handCount-1?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='attach-basic-energy'){
    const count=cards=>cards.filter(c=>c===intent.printing).length;
    return after.activeEnergies.length===before.activeEnergies.length+1&&
      count(after.activeEnergies)===count(before.activeEnergies)+1&&
      after.handCount===before.handCount-1?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
  if(intent.kind==='pass'){
    return after.turn>before.turn||
      (after.phase===GamePhase.FINISHED&&
        before.phase!==GamePhase.FINISHED)?
      'confirmed-public-effect':'no-confirmed-public-effect';
  }
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
