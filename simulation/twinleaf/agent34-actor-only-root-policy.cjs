'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {actorObservation,publicPlayer}=require('./actor-observation-contract.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('./agent5-owner-root-slice.cjs');
const VERSION='agent34-actor-only-root-slice-v3-optional-energy-frontier';
const ENERGY_NAMES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy'];

/**
 * Read only publicly exposed native Store zones before or after dispatch.
 * A successful action can still fail to produce the intended game mutation.
 * @param {object} store Genuine Store with current State.
 * @returns {object|null} Detached public-zone/turn transition witness.
 */
function publicDispatchState(store){
  const state=store?.state;
  if(!Array.isArray(state?.players)||state.players.length!==2)return null;
  const views=state.players.map(publicPlayer);
  const digest=createHash('sha256').update(JSON.stringify(views)).digest('hex');
  return {
    turn:state.turn,
    activePlayer:state.activePlayer,
    phase:state.phase,
    publicZonesSha256:digest,
    handCounts:views.map(view=>view.handCount),
    benchCounts:views.map(view=>view.bench.filter(Boolean).length),
    activePrintings:views.map(view=>view.active?.printing??null),
    attachedEnergyCounts:views.map(view=>
      [view.active,...view.bench].reduce((sum,slot)=>sum+(slot?.energies.length??0),0))
  };
}


/**
 * Translate pinned public card catalog metadata into the actor-only types.
 * This pure adapter has no access to deck order, Prize identities, or State.
 * @param {object[]} all Public printed card definitions.
 * @param {object} types Pinned native card classes and enum constants.
 * @returns {object} Detached Basic, Energy, type and status lookup.
 */
function buildActorCardCatalog(all,types){
  const {PokemonCard,EnergyCard,Stage,EnergyType,CardType,
    PowerType,SpecialCondition}=types;
  return {
    basics:new Set(all.filter(c=>c instanceof PokemonCard&&
      c.stage===Stage.BASIC).map(c=>c.fullName)),
    abilityBasics:new Set(all.filter(c=>c instanceof PokemonCard&&
      c.stage===Stage.BASIC&&c.powers.some(power=>
        power.powerType===PowerType.ABILITY)).map(c=>c.fullName)),
    basicEnergies:new Set(all.filter(c=>c instanceof EnergyCard&&
      c.energyType===EnergyType.BASIC).map(c=>c.fullName)),
    basicEnergyTypes:{
      Grass:CardType.GRASS,Fire:CardType.FIRE,Water:CardType.WATER,
      Lightning:CardType.LIGHTNING,Psychic:CardType.PSYCHIC,
      Fighting:CardType.FIGHTING,Darkness:CardType.DARK,
      Metal:CardType.METAL,Fairy:CardType.FAIRY
    },
    colorlessEnergyType:CardType.COLORLESS,
    specialConditions:{
      ASLEEP:SpecialCondition.ASLEEP,PARALYZED:SpecialCondition.PARALYZED
    }
  };
}

/**
 * Pure decision from a detached owner observation plus the public print catalog.
 * No native State, opposing hidden zones, or own unknown deck identities enter.
 * @param {object} view
 * @param {{basics:Set<string>,abilityBasics:Set<string>,basicEnergies:Set<string>,basicEnergyTypes:Record<string,number>,colorlessEnergyType:number,specialConditions:{ASLEEP:number,PARALYZED:number}}} catalog
 * @returns {object} Native-neutral intent.
 */
function chooseActorRootIntent(view,catalog,options={}){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  const benchIndex=own.bench.findIndex(slot=>slot===null);
  if(benchIndex>=0&&!r.pokemonPlayLocked){
    const index=view.ownHand.findIndex(p=>catalog.basics.has(p)&&
      !(r.abilityPokemonPlayLocked===true&&catalog.abilityBasics.has(p)));
    if(index>=0)return {kind:'bench-basic',handIndex:index,benchIndex,printing:view.ownHand[index]};
  }
  if(own.active&&!r.energyPlayLocked&&r.energyPlayedTurn!==view.globalTurn){
    const first=view.ownHand.findIndex(p=>catalog.basicEnergies.has(p));
    if(first>=0){
      // Development opt-in: choose one-unit Basic Energy using the detached
      // actor view, while preserving the original branch when not enabled.
      const planned=options.energyFrontier?
        require('./agent10-basic-energy-frontier.cjs')
          .chooseBasicEnergyFrontier(view,catalog):null;
      const index=planned?.handIndex??first;
      return {kind:'attach-basic-energy',handIndex:index,printing:view.ownHand[index]};
    }
  }
  const active=own.active,restrictions=active?.publicRestrictions;
  const locked=own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
    restrictions?.cannotAttackNextTurn===true||
    active?.specialConditions?.some(x=>x===catalog.specialConditions.ASLEEP||
      x===catalog.specialConditions.PARALYZED);
  if(active&&!locked&&view.globalTurn!==1){
    const attached=[];
    for(const printing of active.energies){
      if(!catalog.basicEnergies.has(printing))continue;
      const kind=ENERGY_NAMES.find(k=>printing.startsWith(k+' Energy '));
      if(kind)attached.push(catalog.basicEnergyTypes[kind]);
    }
    for(const attack of active.attacks){
      if(attack.gxAttack||!Array.isArray(attack.cost))continue;
      if(restrictions?.blockedAttackNameNextTurn===attack.name||
        restrictions?.blockedAttackNameUntilLeavesActive===attack.name||
        restrictions?.cannotUseAttacksNextTurn?.includes(attack.name)||
        (restrictions?.onlyAllowedAttackNameNextTurn&&
          restrictions.onlyAllowedAttackNameNextTurn!==attack.name))continue;
      const left=attached.slice(),colored=attack.cost.filter(t=>t!==catalog.colorlessEnergyType);
      if(colored.some(type=>{
        const index=left.indexOf(type);
        if(index<0)return true;
        left.splice(index,1);
        return false;
      }))continue;
      if(left.length>=attack.cost.length-colored.length){
        return {kind:'attack',attackName:attack.name};
      }
    }
  }
  return {kind:'pass',reason:'no-supported-owner-visible-root'};
}

/**
 * Reversible real-bot decision override and independent actual Store acceptance
 * counter. Prompts explicitly delegate to the native bot and are unqualified.
 * Static printing metadata comes only from CardManager's public card pool.
 * @template T
 * @param {()=>T} run Synchronous genuine pinned headless games.
 * @param {object} [deps] Injectable pinned classes or pure test fixtures.
 * @returns {{result:T,audit:object}}
 */
function withActorOnlyRootPolicy(run,deps={}){
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    require(path.join(base,'game/store/actions/play-card-action'));
  const {AttackAction,PassTurnAction}=deps.gameActions??
    require(path.join(base,'game/store/actions/game-actions'));
  const getCatalog=deps.getCatalog??(()=>{
    const {CardManager}=require(path.join(base,'game/cards/card-manager'));
    const {PokemonCard}=require(path.join(base,'game/store/card/pokemon-card'));
    const {EnergyCard}=require(path.join(base,'game/store/card/energy-card'));
    const {Stage,EnergyType,CardType,SpecialCondition}=
      require(path.join(base,'game/store/card/card-types'));
    const {PowerType}=require(path.join(base,'game/store/card/pokemon-types'));
    return buildActorCardCatalog(CardManager.getInstance().getAllCards(),{
      PokemonCard,EnergyCard,Stage,EnergyType,CardType,
      PowerType,SpecialCondition
    });
  });
  const observe=deps.observe??actorObservation;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeDispatch?.value,'function');
  const original=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  const typedDecisions=new WeakMap();
  const engineGamePhase=()=>deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  let nativeStore=null,catalog=null,actualGamesSeen=0;
  const audit={
    version:VERSION,origin:'detached-actor-observation',
    energyFrontierOptIn:deps.energyFrontier??
      (process.env.AGENT10_BASIC_ENERGY_FRONTIER_DEV==='true'),
    selectedRootDecisions:0,acceptedActorRoots:0,rejectedActorRoots:0,
    typedIntentCounts:{},nativeRootAcceptances:[],actualGamesSeen:0,
    publicTransitionWitnesses:0,publicTransitionChanges:0,
    nativePhysicalConfirmed:0,nativePhysicalUnconfirmed:0,
    nativeAttackNeedsDeclaration:0,
    observationSchema:'agent2-public-native-dispatch-diff-v1',
    unsupportedPromptTypes:{},
    unsupportedPromptFallbacks:0,nonOwnerNativeDelegations:0,
    nonLiveSpeculativeFallbacks:0,nonTurnPhaseFallbacks:0,
    ownerRootIntents:[],competitiveGameQualified:false,
    note:'Only roots are actor-only. Every native prompt fallback makes the full game unqualified.'
  };
  function wrapped(state){
    // A bot may evaluate hypothetical cloned States in its own tactics.
    // Never make an actor-root policy decision against such a speculative
    // state or count it as a genuine Store-root action.
    if(state!==nativeStore?.state){
      audit.nonLiveSpeculativeFallbacks++;
      return original.value.call(this,state);
    }
    const playerId=this.client?.id;
    const seat=state.players?.findIndex(p=>p.id===playerId);
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(!pending&&state.phase!==engineGamePhase().PLAYER_TURN){
      audit.nonTurnPhaseFallbacks++;
      return original.value.call(this,state);
    }
    if(seat===-1||pending||state.activePlayer!==seat){
      if(pending&&state.players?.[seat]?.id===pending.playerId){
        audit.unsupportedPromptFallbacks++;
        const name=pending.constructor?.name??'unknown';
        audit.unsupportedPromptTypes[name]=(audit.unsupportedPromptTypes[name]??0)+1;
      }else audit.nonOwnerNativeDelegations++;
      return original.value.call(this,state);
    }
    if(catalog===null)catalog=getCatalog();
    const view=observe(state,seat);
    const intent=chooseActorRootIntent(view,catalog,{energyFrontier:audit.energyFrontierOptIn});
    const ownerId=state.players[seat].id;
    let action;
    switch(intent.kind){
      case 'bench-basic':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:intent.benchIndex});
        break;
      case 'attach-basic-energy':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
        break;
      case 'attack':action=new AttackAction(ownerId,intent.attackName);break;
      case 'pass':action=new PassTurnAction(ownerId);break;
      default:throw new Error('Unknown actor-only intent: '+intent.kind);
    }
    audit.selectedRootDecisions++;
    typedDecisions.set(action,{globalTurn:view.globalTurn,seat,kind:intent.kind,
      intent:{...intent,benchSlot:intent.benchIndex}});
    audit.typedIntentCounts[intent.kind]=(audit.typedIntentCounts[intent.kind]??0)+1;
    if(audit.ownerRootIntents.length<40)audit.ownerRootIntents.push({
      globalTurn:view.globalTurn,seat,intent,typedAction:action.constructor.name
    });
    return action;
  }
  function dispatchObserved(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==nativeStore){
      nativeStore=this;actualGamesSeen++;audit.actualGamesSeen=actualGamesSeen;
    }
    const choice=this===nativeStore?typedDecisions.get(action):undefined;
    if(!choice)return beforeDispatch.value.apply(this,[action,...args]);
    const before=publicDispatchState(this);
    const ownerBefore=before===null?null:
      rootPhysicalSnapshot(this.state,choice.seat,choice.intent);
    try{
      const result=beforeDispatch.value.apply(this,[action,...args]);
      const after=publicDispatchState(this);
      const physical=ownerBefore===null||after===null?null:
        rootPhysicalWitness(choice.intent,ownerBefore,
          rootPhysicalSnapshot(this.state,choice.seat,choice.intent),
          engineGamePhase());
      if(physical==='confirmed-public-effect')audit.nativePhysicalConfirmed++;
      if(physical==='no-confirmed-public-effect')audit.nativePhysicalUnconfirmed++;
      if(physical==='attack-needs-declaration')audit.nativeAttackNeedsDeclaration++;
      const witnessed=before!==null&&after!==null;
      const publicZonesChanged=witnessed&&
        before.publicZonesSha256!==after.publicZonesSha256;
      const turnOrPhaseChanged=witnessed&&
        (before.turn!==after.turn||
          before.activePlayer!==after.activePlayer||
          before.phase!==after.phase);
      audit.acceptedActorRoots++;
      if(witnessed)audit.publicTransitionWitnesses++;
      if(publicZonesChanged||turnOrPhaseChanged)audit.publicTransitionChanges++;
      if(audit.nativeRootAcceptances.length<64)
        audit.nativeRootAcceptances.push({...choice,accepted:true,
          publicTransitionWitnessed:witnessed,
          publicZonesChanged,turnOrPhaseChanged,
          nativePhysicalEffect:physical,before,after});
      return result;
    }catch(error){
      audit.rejectedActorRoots++;
      if(audit.nativeRootAcceptances.length<64)
        audit.nativeRootAcceptances.push({...choice,accepted:false,error:String(error)});
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{...original,value:wrapped});
  Object.defineProperty(Store.prototype,'dispatch',{...beforeDispatch,value:dispatchObserved});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatchObserved);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,wrapped);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}
module.exports={VERSION,buildActorCardCatalog,chooseActorRootIntent,
  publicDispatchState,withActorOnlyRootPolicy};
