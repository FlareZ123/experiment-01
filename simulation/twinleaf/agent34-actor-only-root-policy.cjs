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
  // Explicit unary callback: Array.map passes index as a second argument,
  // which must never become publicPlayer's hidePokemon flag.
  const views=state.players.map(player=>publicPlayer(player));
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
    perfectionDonors:require('./agent30-known-perfection-options.cjs')
      .knownPerfectionDonorCatalog(all),
    basics:new Set(all.filter(c=>c instanceof PokemonCard&&
      c.stage===Stage.BASIC).map(c=>c.fullName)),
    abilityBasics:new Set(all.filter(c=>c instanceof PokemonCard&&
      c.stage===Stage.BASIC&&c.powers.some(power=>
        power.powerType===PowerType.ABILITY)).map(c=>c.fullName)),
    evolutions:new Map(all.filter(c=>c instanceof PokemonCard&&
      [Stage.STAGE_1,Stage.STAGE_2,Stage.VMAX,Stage.VSTAR].includes(c.stage))
      .map(c=>[c.fullName,{stage:c.stage,evolvesFrom:c.evolvesFrom,
        hasAbility:c.powers.some(power=>power.powerType===PowerType.ABILITY)}])),
    stages:{RESTORED:Stage.RESTORED,BASIC:Stage.BASIC,
      STAGE_1:Stage.STAGE_1,STAGE_2:Stage.STAGE_2,
      VMAX:Stage.VMAX,VSTAR:Stage.VSTAR},
    basicEnergies:new Set(all.filter(c=>c instanceof EnergyCard&&
      c.energyType===EnergyType.BASIC).map(c=>c.fullName)),
    specialEnergies:new Set(all.filter(c=>c instanceof EnergyCard&&
      c.energyType===EnergyType.SPECIAL).map(c=>c.fullName)),
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
  if(options.naturalEvolutionRoot===true){
    const evolution=require('./agent1-actor-evolution-frontier.cjs')
      .chooseNaturalEvolutionIntent(view,catalog);
    if(evolution)return evolution;
  }
  if(options.quickBallRoot===true){
    const item=require('./agent8-actor-quick-ball-frontier.cjs')
      .chooseQuickBallRootIntent(view);
    if(item)return item;
  }
  if(options.powerglassRoot===true){
    const tool=require('./agent41-powerglass-root-frontier.cjs')
      .choosePowerglassRootIntent(view,catalog);
    if(tool)return tool;
  }
  // Explicit development-only Iron Thorns ALS. Real native Store remains the
  // authority for Stadium, Special Energy and attack legality. No K0 deck or
  // Prize truth is consulted. This line is deliberately absent by default.
  if(options.thornsDirectLine===true&&own.active?.name==='Iron Thorns ex'){
    const stadiumName='Thunder Mountain Prism Star';
    const energyName='Double Colorless Energy';
    const stadiumUp=[...(own.stadium??[]),
      ...(view.opponentPublic?.stadium??[])]
      .some(p=>p.startsWith(stadiumName+' '));
    const alreadyCharged=own.active.energies.some(p=>
      p.startsWith(energyName+' '));
    const stadiumIndex=view.ownHand.findIndex(p=>
      p.startsWith(stadiumName+' '));
    if(!stadiumUp&&stadiumIndex>=0&&!r.stadiumPlayLocked&&
       r.stadiumPlayedTurn!==view.globalTurn){
      return {kind:'play-thunder-mountain',handIndex:stadiumIndex,
        printing:view.ownHand[stadiumIndex]};
    }
    const energyIndex=view.ownHand.findIndex(p=>
      p.startsWith(energyName+' '));
    if(!alreadyCharged&&energyIndex>=0&&!r.energyPlayLocked&&
       !r.specialEnergyPlayLocked&&r.energyPlayedTurn!==view.globalTurn){
      return {kind:'attach-dce',handIndex:energyIndex,
        printing:view.ownHand[energyIndex]};
    }
  }
  if(options.perfectionTransitionRoot===true){
    const planned=require('./agent35-perfection-transition-frontier.cjs')
      .choosePerfectionTransition(view,catalog);
    if(planned)return planned;
  }
  if(own.active&&!r.energyPlayLocked&&r.energyPlayedTurn!==view.globalTurn){
    const first=view.ownHand.findIndex(p=>catalog.basicEnergies.has(p));
    if(first>=0){
      // Development opt-in: choose one-unit Basic Energy using the detached
      // actor view, while preserving the original branch when not enabled.
      if(options.energyRecipientFrontier===true){
        const recipient=require('./agent44-actor-energy-recipient.cjs')
          .chooseActorEnergyRecipient(view,catalog,{
            preferNearTermDamage:options.nearTermDamageRecipient===true
          });
        if(recipient)return {kind:'attach-basic-energy',...recipient};
        // Preserve a held Basic when all publicly known attack deficits
        // are already satisfied; a later legal turn may use the resource.
      }else{
        const planned=options.energyFrontier?
          require('./agent10-basic-energy-frontier.cjs')
            .chooseBasicEnergyFrontier(view,catalog):null;
        const index=planned?.handIndex??first;
        return {kind:'attach-basic-energy',handIndex:index,
          printing:view.ownHand[index]};
      }
    }
  }
  if(options.paidRetreatRoot===true){
    const retreat=require('./agent6-actor-paid-retreat-frontier.cjs')
      .choosePaidRetreatToDamagingBench(view,catalog);
    if(retreat)return retreat;
  }
  const active=own.active,restrictions=active?.publicRestrictions;
  const locked=own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
    restrictions?.cannotAttackNextTurn===true||
    active?.specialConditions?.some(x=>x===catalog.specialConditions.ASLEEP||
      x===catalog.specialConditions.PARALYZED);
  if(active&&!locked&&view.globalTurn!==1){
    const payable=[];
    const attached=[];
    const temple=options.specialEnergyRoot===true&&
      [...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
        .some(p=>p.startsWith('Temple of Sinnoh '));
    for(const printing of active.energies){
      if(options.specialEnergyRoot===true){
        const units=require('./agent3-special-energy-frontier.cjs')
          .specialEnergyUnits(printing,catalog,temple);
        if(units!==null){attached.push(...units);continue;}
      }
      if(!catalog.basicEnergies.has(printing))continue;
      const kind=ENERGY_NAMES.find(k=>printing.startsWith(k+' Energy '));
      if(kind)attached.push(catalog.basicEnergyTypes[kind]);
    }
    const thunder=options.specialEnergyRoot===true&&
      active.printed?.types?.includes(catalog.basicEnergyTypes.Lightning)&&
      [...(own.stadium??[]),...(view.opponentPublic?.stadium??[])]
        .some(p=>p.startsWith('Thunder Mountain Prism Star '));
    for(const attack of active.attacks){
      if(!Array.isArray(attack.cost))continue;
      // Printed GX attacks share the global one-GX-per-game resource. They are
      // disabled by default until explicitly tested as actor-owned roots.
      // Rule-specific eligibility still belongs to the genuine native Store.
      if(attack.gxAttack && (
        options.printedGxRoot!==true ||
        own.publicTurnRestrictions?.gxUsed===true ||
        own.publicTurnRestrictions?.cannotUseGXAttacks===true
      ))continue;
      if(restrictions?.blockedAttackNameNextTurn===attack.name||
        restrictions?.blockedAttackNameUntilLeavesActive===attack.name||
        restrictions?.cannotUseAttacksNextTurn?.includes(attack.name)||
        (restrictions?.onlyAllowedAttackNameNextTurn&&
          restrictions.onlyAllowedAttackNameNextTurn!==attack.name))continue;
      if(options.thornsDirectLine===true&&active.name==='Iron Thorns ex'&&
         attack.name==='Volt Cyclone'&&attack.cost.length===3&&
         attack.cost[0]===catalog.basicEnergyTypes.Lightning&&
         attack.cost[1]===catalog.colorlessEnergyType&&
         attack.cost[2]===catalog.colorlessEnergyType&&
         active.printed?.types?.includes(catalog.basicEnergyTypes.Lightning)&&
         own.stadium.some(p=>p.startsWith('Thunder Mountain Prism Star '))&&
         active.energies.some(p=>p.startsWith('Double Colorless Energy '))){
        // Printed Lightning + Colorless + Colorless with public Thunder
        // reducing Lightning and attached DCE supplying both Colorless.
        // A native Store rejection must still be reported and retained.
        return {kind:'attack',attackName:attack.name};
      }
      const payableCost=attack.cost.slice();
      if(thunder){
        const i=payableCost.indexOf(catalog.basicEnergyTypes.Lightning);
        if(i>=0)payableCost.splice(i,1);
      }
      const left=attached.slice(),
        colored=payableCost.filter(t=>t!==catalog.colorlessEnergyType);
      if(colored.some(type=>{
        const index=left.indexOf(type);
        if(index<0)return true;
        left.splice(index,1);
        return false;
      }))continue;
      if(left.length>=payableCost.length-colored.length){
        payable.push(attack);
      }
    }
    if(payable.length>0){
      const knownDead=options.knownDeadAttackRoot===true?
        require('./agent1-actor-dead-first-attack-frontier.cjs')
          .chooseKnownDeadLeadingAttack(view,payable):null;
      const chosen=knownDead?
        payable.find(attack=>attack.name===knownDead.attackName):
        options.potentialKoRoot===true?
          require('./agent49-actor-potential-knockout.cjs')
            .choosePotentialKnockout(view,payable):payable[0];
      assert.ok(chosen,'Known-dead attack selector must choose a payable attack');
      return {kind:'attack',attackName:chosen.name};
    }
  }
  if(options.perfectionRoot===true&&view.globalTurn!==1&&
     catalog.perfectionDonors instanceof Map){
    const ready=require('./agent30-known-perfection-options.cjs')
      .knownPerfectionReadyOptions(view,catalog,catalog.perfectionDonors);
    if(ready.length>0)return {kind:'perfection',
      donorPrinting:ready[0].sourcePrinting,
      attackName:ready[0].attackName};
  }
  if(options.specialEnergyRoot===true&&own.active&&!r.energyPlayLocked&&
     !r.specialEnergyPlayLocked&&r.energyPlayedTurn!==view.globalTurn){
    const special=require('./agent3-special-energy-frontier.cjs')
      .chooseSpecialEnergyIntent(view,catalog);
    if(special)return special;
  }
  if(options.emergencyAceTrainerRoot===true){
    const reset=require('./agent8-actor-ace-trainer-frontier.cjs')
      .chooseEmergencyAceTrainer(view);
    if(reset)return reset;
  }
  if(options.escapeRopeRoot===true){
    const mobility=require('./agent42-actor-escape-rope-frontier.cjs')
      .chooseEscapeRope(view);
    if(mobility)return mobility;
  }
  if(options.strandedGuzmaRoot===true){
    const planned=require('./agent50-stranded-guzma-frontier.cjs')
      .chooseStrandedGuzma(view,catalog);
    if(planned)return planned;
  }
  if(options.strandedMarnieRoot===true){
    const planned=require('./agent50-stranded-marnie-frontier.cjs')
      .chooseStrandedMarnie(view);
    if(planned)return planned;
  }
  return {kind:'pass',reason:'no-supported-owner-visible-root'};
}

/**
 * Restrict this opt-in to one genuine physical player without changing its
 * actor-owned search/hand observation. Null means the original both-seat opt-in.
 * @param {boolean} enabled
 * @param {0|1|null} allowedSeat
 * @param {0|1} actorSeat
 * @returns {boolean}
 */
function actorSpecialEnergyEnabled(enabled,allowedSeat,actorSeat){
  assert.ok(allowedSeat===null||allowedSeat===0||allowedSeat===1);
  assert.ok(actorSeat===0||actorSeat===1);
  return enabled===true&&(allowedSeat===null||allowedSeat===actorSeat);
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
  const {AttackAction,PassTurnAction,RetreatAction,UseAbilityAction}=deps.gameActions??
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
    energyRecipientFrontierOptIn:deps.energyRecipientFrontier??
      (process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV==='true'),
    nearTermDamageRecipientOptIn:deps.nearTermDamageRecipient??
      (process.env.AGENT8_NEAR_TERM_DAMAGE_RECIPIENT_DEV==='true'),
    emergencyAceTrainerRootOptIn:deps.emergencyAceTrainerRoot??
      (process.env.AGENT8_ACE_TRAINER_EMERGENCY_DEV==='true'),
    escapeRopeRootOptIn:deps.escapeRopeRoot??
      (process.env.AGENT42_ESCAPE_ROPE_DEV==='true'),
    escapeRopeOwnerSeat:deps.escapeRopeOwnerSeat??
      (process.env.AGENT42_ESCAPE_ROPE_OWNER_SEAT===undefined?null:
        Number(process.env.AGENT42_ESCAPE_ROPE_OWNER_SEAT)),
    perfectionRootOptIn:deps.perfectionRoot??
      (process.env.AGENT30_PERFECTION_ROOT_DEV==='true'),
    perfectionTransitionRootOptIn:deps.perfectionTransitionRoot??
      (process.env.AGENT35_PERFECTION_TRANSITION_ROOT_DEV==='true'),
    paidRetreatRootOptIn:deps.paidRetreatRoot??
      (process.env.AGENT6_PAID_RETREAT_ROOT_DEV==='true'),
    thornsDirectLineOptIn:deps.thornsDirectLine??
      (process.env.AGENT1_THORNS_DIRECT_ROOT_DEV==='true'),
    specialEnergyRootOptIn:deps.specialEnergyRoot??
      (process.env.AGENT3_SPECIAL_ENERGY_ROOT_DEV==='true'),
    specialEnergyRootOwnerSeat:deps.specialEnergyRootOwnerSeat??null,
    naturalEvolutionRootOptIn:deps.naturalEvolutionRoot??
      (process.env.AGENT1_NATURAL_EVOLUTION_ROOT_DEV==='true'),
    quickBallRootOptIn:deps.quickBallRoot??
      (process.env.AGENT8_ACTOR_QUICK_BALL_DEV==='true'),
    printedGxRootOptIn:deps.printedGxRoot??
      (process.env.AGENT25_PRINTED_GX_ROOT_DEV==='true'),
    potentialKoRootOptIn:deps.potentialKoRoot??
      (process.env.AGENT49_POTENTIAL_KO_ROOT_DEV==='true'),
    knownDeadAttackRootOptIn:deps.knownDeadAttackRoot??
      (process.env.AGENT7_KNOWN_DEAD_ATTACK_ROOT_DEV==='true'),
    powerglassRootOptIn:deps.powerglassRoot??
      (process.env.AGENT41_ACTOR_POWERGLASS_ROOT_DEV==='true'),
    strandedMarnieRootOptIn:deps.strandedMarnieRoot??
      (process.env.AGENT50_STRANDED_MARNIE_DEV==='true'),
    strandedMarnieOwnerSeat:deps.strandedMarnieOwnerSeat??
      (process.env.AGENT50_STRANDED_MARNIE_OWNER_SEAT===undefined?null:
        Number(process.env.AGENT50_STRANDED_MARNIE_OWNER_SEAT)),
    strandedGuzmaRootOptIn:deps.strandedGuzmaRoot??
      (process.env.AGENT50_STRANDED_GUZMA_DEV==='true'),
    strandedGuzmaOwnerSeat:deps.strandedGuzmaOwnerSeat??
      (process.env.AGENT50_STRANDED_GUZMA_OWNER_SEAT===undefined?null:
        Number(process.env.AGENT50_STRANDED_GUZMA_OWNER_SEAT)),
    selectedRootDecisions:0,acceptedActorRoots:0,rejectedActorRoots:0,
    typedIntentCounts:{},nativeRootAcceptances:[],actualGamesSeen:0,
    publicTransitionWitnesses:0,publicTransitionChanges:0,
    nativePhysicalConfirmed:0,nativePhysicalUnconfirmed:0,
    nativePhysicalConfirmedByIntent:{},nativePhysicalUnconfirmedByIntent:{},
    nativeAttackNeedsDeclaration:0,
    observationSchema:'agent2-public-native-dispatch-diff-v1',
    unsupportedPromptTypes:{},
    unsupportedPromptFallbacks:0,nonOwnerNativeDelegations:0,
    nonLiveSpeculativeFallbacks:0,nonTurnPhaseFallbacks:0,
    ownerRootIntents:[],
    agent42SourceMobilityPasses:[],competitiveGameQualified:false,
    note:'Only roots are actor-only. Every native prompt fallback makes the full game unqualified.'
  };
  assert.ok([null,0,1].includes(audit.specialEnergyRootOwnerSeat));
  assert.ok(!audit.nearTermDamageRecipientOptIn||
    audit.energyRecipientFrontierOptIn,
    'Near-term damaging Bench priority requires owner Energy recipient');
  if(audit.nearTermDamageRecipientOptIn)
    audit.version+='+'+
      require('./agent44-actor-energy-recipient.cjs').NEAR_TERM_DAMAGE_VERSION;
  if(audit.emergencyAceTrainerRootOptIn)
    audit.version+='+'+
      require('./agent8-actor-ace-trainer-frontier.cjs').VERSION;
  assert.ok(!audit.escapeRopeRootOptIn ||
    [0,1].includes(audit.escapeRopeOwnerSeat),
    'Escape Rope development root requires exact candidate physical seat');
  if(audit.escapeRopeRootOptIn)
    audit.version+='+'+
      require('./agent42-actor-escape-rope-frontier.cjs').VERSION;
  if(audit.specialEnergyRootOwnerSeat!==null)
    audit.version+='+agent49-source-seat-special-v1';
  if(audit.quickBallRootOptIn)
    audit.version=VERSION+'+'+
      require('./agent8-actor-quick-ball-frontier.cjs').VERSION;
  if(audit.potentialKoRootOptIn)
    audit.version+='+agent49-public-potential-ko-v2';
  if(audit.knownDeadAttackRootOptIn)
    audit.version+='+agent1-known-dead-leading-attack-v1';
  if(audit.perfectionRootOptIn)
    audit.version+='+agent30-known-perfection-root-v1';
  if(audit.perfectionTransitionRootOptIn)
    audit.version+='+agent35-public-donor-funding-pivot-v1';
  if(audit.powerglassRootOptIn)
    audit.version+='+agent41-owner-visible-powerglass-root-v1';
  assert.ok(!audit.strandedMarnieRootOptIn||
    [0,1].includes(audit.strandedMarnieOwnerSeat),
    'Stranded Marnie treatment must specify the physical source owner');
  if(audit.strandedMarnieRootOptIn)
    audit.version+='+'+
      require('./agent50-stranded-marnie-frontier.cjs').VERSION;
  assert.ok(!audit.strandedGuzmaRootOptIn||
    [0,1].includes(audit.strandedGuzmaOwnerSeat),
    'Guzma rescue must be scoped to the physical source seat');
  if(audit.strandedGuzmaRootOptIn)
    audit.version+='+'+
      require('./agent50-stranded-guzma-frontier.cjs').VERSION;
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
    const intent=chooseActorRootIntent(view,catalog,{
      energyFrontier:audit.energyFrontierOptIn,
      energyRecipientFrontier:audit.energyRecipientFrontierOptIn,
      nearTermDamageRecipient:audit.nearTermDamageRecipientOptIn,
      emergencyAceTrainerRoot:audit.emergencyAceTrainerRootOptIn,
      escapeRopeRoot:audit.escapeRopeRootOptIn&&
        seat===audit.escapeRopeOwnerSeat,
      paidRetreatRoot:audit.paidRetreatRootOptIn,
      perfectionRoot:audit.perfectionRootOptIn,
      perfectionTransitionRoot:audit.perfectionTransitionRootOptIn,
      thornsDirectLine:audit.thornsDirectLineOptIn,
      specialEnergyRoot:actorSpecialEnergyEnabled(
        audit.specialEnergyRootOptIn,audit.specialEnergyRootOwnerSeat,seat),
      printedGxRoot:audit.printedGxRootOptIn,
      potentialKoRoot:audit.potentialKoRootOptIn,
      knownDeadAttackRoot:audit.knownDeadAttackRootOptIn,
      naturalEvolutionRoot:audit.naturalEvolutionRootOptIn,
      quickBallRoot:audit.quickBallRootOptIn,
      powerglassRoot:audit.powerglassRootOptIn,
      strandedMarnieRoot:audit.strandedMarnieRootOptIn&&
        audit.strandedMarnieOwnerSeat===seat,
      strandedGuzmaRoot:audit.strandedGuzmaRootOptIn&&
        audit.strandedGuzmaOwnerSeat===seat
    });
    const ownerId=state.players[seat].id;
    // Research-only post-decision witness of a source player's OWN concealed
    // hand and publicly observable switching gap. Never enters policy choice.
    if(audit.escapeRopeRootOptIn&&seat!==audit.escapeRopeOwnerSeat&&
      intent.kind==='pass'&&audit.agent42SourceMobilityPasses.length<24){
      const active=view.ownPublic.active,bench=view.ownPublic.bench
        .filter(Boolean);
      if(active&&bench.some(p=>p.energies.length>0)&&
          active.energies.length===0){
        audit.agent42SourceMobilityPasses.push({
          turn:view.globalTurn,seat,active:active.printing,
          activeTools:active.tools,
          activeRetreatCost:active.printed.retreatCost,
          activeCanRetreat:!active.publicRestrictions.cannotRetreatNextTurn,
          benchAttackers:bench.filter(p=>p.energies.length>0)
            .map(p=>({printing:p.printing,energyCount:p.energies.length})),
          handMobility:view.ownHand.filter(p=>
            /^(Float Stone |Escape Rope |Guzma |Switch )/.test(p)),
          itemLocked:view.ownTurnResources.itemPlayLocked===true,
          supporterLocked:view.ownTurnResources.supporterPlayLocked===true,
          supporterPlayed:view.ownTurnResources.supporterPlayedTurn===
            view.globalTurn
        });
      }
    }
    let action;
    switch(intent.kind){
      case 'evolve-pokemon':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,
          slot:intent.slot==='bench'?SlotType.BENCH:SlotType.ACTIVE,
          index:intent.index});
        break;
      case 'bench-basic':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:intent.benchIndex});
        break;
      case 'equip-powerglass':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
        break;
      case 'attach-special-energy':
      case 'attach-basic-energy':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,
          slot:intent.slot==='bench'?SlotType.BENCH:SlotType.ACTIVE,
          index:intent.slot==='bench'?intent.index:0});
        break;
      case 'play-escape-rope':
      case 'play-ace-trainer':
      case 'play-stranded-guzma':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'play-stranded-marnie':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'play-quick-ball':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'play-thunder-mountain':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'attach-dce':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
        break;
      case 'paid-retreat':
        action=new RetreatAction(ownerId,intent.benchIndex);
        break;
      case 'perfection':
        action=new UseAbilityAction(ownerId,'Perfection',{
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
      if(physical==='confirmed-public-effect'){
        audit.nativePhysicalConfirmed++;
        audit.nativePhysicalConfirmedByIntent[choice.kind]=
          (audit.nativePhysicalConfirmedByIntent[choice.kind]??0)+1;
      }
      if(physical==='no-confirmed-public-effect'){
        audit.nativePhysicalUnconfirmed++;
        audit.nativePhysicalUnconfirmedByIntent[choice.kind]=
          (audit.nativePhysicalUnconfirmedByIntent[choice.kind]??0)+1;
      }
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
  actorSpecialEnergyEnabled,publicDispatchState,withActorOnlyRootPolicy};
