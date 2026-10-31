'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {actorObservation,publicPlayer}=require('./actor-observation-contract.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('./agent5-owner-root-slice.cjs');
const VERSION='agent34-actor-only-root-slice-v4-optional-energy-frontier-printed-gx';
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
    // Only inspect the publicly printed set of rule-box card identities and
    // Ability definitions. The owner's and opponent's unknown decks stay out.
    // Defer Rule Box identity to pinned PokémonCard.hasRuleBox(), whose
    // logic distinguishes current ex from older ex and handles actual
    // grouped Pokémon V/GX/radiant/Prism tags. Literal tag heuristics drift.
    ruleboxPokemonPrintings:new Set(all.filter(c=>
      c instanceof PokemonCard&&c.hasRuleBox()).map(c=>c.fullName)),
    ruleboxAbilityPrintings:new Set(all.filter(c=>
      c instanceof PokemonCard&&c.hasRuleBox()&&
      c.powers.some(power=>power.powerType===PowerType.ABILITY))
      .map(c=>c.fullName)),
    basicNames:new Map(all.filter(c=>c instanceof PokemonCard&&
      c.stage===Stage.BASIC).map(c=>[c.fullName,c.name])),
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
    dragonPokemonPrintings:new Set(all.filter(c=>c instanceof PokemonCard&&
      Array.isArray(c.cardType)&&c.cardType.includes(CardType.DRAGON))
      .map(c=>c.fullName)),
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
  const soloThornsHold=options.thornsSoloEnergyRetention===true&&
    require('./agent14-thorns-solo-energy-retention.cjs')
      .holdSoloThornsBench(view,catalog);
  if(benchIndex>=0&&!r.pokemonPlayLocked&&!soloThornsHold){
    const index=view.ownHand.findIndex(p=>catalog.basics.has(p)&&
      !(r.abilityPokemonPlayLocked===true&&catalog.abilityBasics.has(p)));
    if(index>=0){
      const first={kind:'bench-basic',handIndex:index,benchIndex,
        printing:view.ownHand[index]};
      if(options.lastBenchHeldEvolution===true){
        const chosen=require('./agent43-held-evolution-bench-admission.cjs')
          .chooseHeldEvolutionBench(view,catalog,first);
        if(chosen)return chosen.intent;
      }
      return first;
    }
  }
  // Sky Field must be placed before an attack: the next owner root can
  // legally Bench the extra held Basic in the newly created sixth slot.
  // This is a separate default-off action, with no Stadium replacement.
  if(options.skyFieldBenchExpansion===true){
    const sky=require('./agent33-sky-field-bench-expansion.cjs')
      .chooseSkyFieldBenchExpansion(view,catalog);
    if(sky)return sky;
  }
  if(options.pathToPeakOpposingAbility===true){
    const path=require('./agent33-path-to-peak-public-lock.cjs')
      .choosePathToPeakOpposingAbility(view,catalog);
    if(path)return path;
  }
  if(options.naturalEvolutionRoot===true){
    const evolution=require('./agent1-actor-evolution-frontier.cjs')
      .chooseNaturalEvolutionIntent(view,catalog);
    if(evolution)return evolution;
  }
  if(options.mysteriousTreasureRoot===true){
    const item=require('./agent49-mysterious-treasure-frontier.cjs')
      .chooseTreasureRootIntent(view,catalog);
    if(item)return item;
  }
  if(options.quickBallRoot===true){
    const item=require('./agent8-actor-quick-ball-frontier.cjs')
      .chooseQuickBallRootIntent(view);
    if(item)return item;
  }
  // Development-only owner-registered Bunnelby TM + Jet ALS.
  // The source 60 is the acting player's known list, never the opponent's.
  if(options.bunnelbyTmJetRoot===true){
    const line=require('./agent40-owner-bunnelby-tm-jet-line.cjs')
      .chooseBunnelbyTmJetRoot(view,catalog,
        options.ownRegisteredSixty);
    if(line)return line;
  }
  if(options.floatStoneMobility===true){
    const mobility=require('./agent1-owner-float-stone-mobility.cjs')
      .chooseOwnerFloatStoneMobility(view,catalog);
    if(mobility)return mobility;
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
  if(options.contestedEnergyRoot===true&&
      options.specialEnergyRoot===true){
    const stronger=require('./agent41-energy-attachment-contest.cjs')
      .specialFundsImmediateAttack(view,catalog);
    if(stronger)return stronger;
  }
  if(options.publicFlexibleEnergyContest===true&&
      options.publicContextSpecialEnergy===true){
    const stronger=require('./agent41-public-flexible-energy-contest.cjs')
      .choosePublicFlexibleImmediateAttackEnergy(view,catalog);
    if(stronger)return stronger;
  }
  // Opt-in owner-visible Jet Bench switch. The native action constructor
  // already handles the generic attach-special-energy Bench target.
  if(options.jetBenchSwitchRoot===true){
    const jet=require('./agent40-public-jet-bench-frontier.cjs')
      .choosePublicJetBenchSwitch(view,catalog);
    if(jet)return jet;
  }
  // Default-off original-rank15-derived source lock-position transition.
  // Prefer a two-Unit retreat into BUS when AOR already occupies Bench;
  // a held Basic Energy can fund that retreat on the current owner turn.
  if(options.busLockPositionRoot===true){
    const lock=require('./agent40-public-bus-position-frontier.cjs')
      .choosePublicBusPositionTransition(view,catalog);
    if(lock)return lock;
  }
  if(own.active&&!r.energyPlayLocked&&r.energyPlayedTurn!==view.globalTurn){
    const first=view.ownHand.findIndex(p=>catalog.basicEnergies.has(p));
    if(first>=0){
      // Development opt-in: choose one-unit Basic Energy using the detached
      // actor view, while preserving the original branch when not enabled.
      if(options.energyRecipientFrontier===true){
        const recipient=require('./agent44-actor-energy-recipient.cjs')
          .chooseActorEnergyRecipient(view,catalog,{
            mobilityAware:options.mobilityAwareRecipient===true
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
  // Opt-in, both-seat low-hand Supporter choice before an otherwise
  // immediately payable attack. Keep benchmark root decisions unchanged.
  if(options.lowHandLillieRoot===true){
    const draw=require('./agent25-lowhand-lillie-frontier.cjs')
      .chooseLowHandLillieBeforeAttack(view);
    if(draw)return draw;
  }
  if(options.conservativeShuffleBeforeAttack===true){
    const draw=require('./agent2-conservative-shuffle-supporter.cjs')
      .chooseConservativeShuffleSupporter(view);
    if(draw)return {...draw,kind:'play-conservative-shuffle-supporter'};
  }
  if(options.seekerLillieRoot===true){
    const follow=require('./agent48-owner-vs-seeker-lillie.cjs')
      .chooseSeekerLillieRoot(view);
    if(follow)return follow;
  }
  if(options.carmineFirstRoot===true){
    const first=require('./agent48-conservative-first-carmine.cjs')
      .chooseConservativeFirstCarmine(view);
    if(first)return first;
  }
  if(options.paidRetreatRoot===true){
    const retreat=require('./agent6-actor-paid-retreat-frontier.cjs')
      .choosePaidRetreatToDamagingBench(view,catalog);
    if(retreat)return retreat;
  }
  if(options.raichuKoBreakpointBeforeAttack===true&&
      options.publicContextSpecialEnergy===true){
    const proposed=require('./agent10-raichu-damage-breakpoint-before-attack.cjs')
      .chooseRaichuPrintedKnockoutAttachment(view,catalog);
    if(proposed)return proposed;
  }
  const active=own.active,restrictions=active?.publicRestrictions;
  const locked=own.publicTurnRestrictions?.attackLockTurnsRemaining>0||
    restrictions?.cannotAttackNextTurn===true||
    active?.specialConditions?.some(x=>x===catalog.specialConditions.ASLEEP||
      x===catalog.specialConditions.PARALYZED);
  if(active&&!locked&&(view.globalTurn!==1||
      options.printedFirstTurnAttackRoot===true)){
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
      if(view.globalTurn===1&&(
        options.printedFirstTurnAttackRoot!==true||
        !require('./agent37-firstturn-exception.cjs')
          .hasFirstPlayerPrintedAttackException(attack)))continue;
      // Printed GX attacks share the global one-GX-per-game resource. They are
      // disabled by default until explicitly tested as actor-owned roots.
      // Rule-specific eligibility still belongs to the genuine native Store.
      if((attack.gxAttack===true||attack.name.endsWith('-GX')) && (
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
      const payableCost=require('./agent17-public-context-special-energy.cjs')
        .effectiveNativeAttackCost(view,catalog,active,attack);
      if(payableCost===null)continue;
      const left=attached.slice(),
        colored=payableCost.filter(t=>t!==catalog.colorlessEnergyType);
      const missingColored=colored.some(type=>{
        const index=left.indexOf(type);
        if(index<0)return true;
        left.splice(index,1);
        return false;
      });
      if(!missingColored&&left.length>=payableCost.length-colored.length){
        payable.push(attack);
      }else if(options.publicContextSpecialEnergy===true&&
        require('./agent17-public-context-special-energy.cjs')
          .publicSpecialAttackPayable(view,catalog,active,attack)){
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
  if((options.specialEnergyRoot===true||
      options.publicContextSpecialEnergy===true)&&own.active&&
     !r.energyPlayLocked&&!r.specialEnergyPlayLocked&&
     r.energyPlayedTurn!==view.globalTurn){
    if(options.publicContextSpecialEnergy===true){
      const planned=require('./agent17-public-context-special-energy.cjs')
        .choosePublicContextSpecialEnergy(view,catalog);
      if(planned)return planned;
    }
    if(options.specialEnergyRoot===true){
      const special=require('./agent3-special-energy-frontier.cjs')
        .chooseSpecialEnergyIntent(view,catalog);
      if(special)return special;
    }
  }
  if(options.heldGuzmaMobility===true){
    const mobility=require('./agent2-held-guzma-mobility-frontier.cjs')
      .chooseHeldGuzmaMobility(view,catalog);
    if(mobility)return mobility;
  }
  if(options.strandedMarnieRoot===true){
    const planned=require('./agent50-stranded-marnie-frontier.cjs')
      .chooseStrandedMarnie(view);
    if(planned)return planned;
  }
  if(options.teamFlareGruntDenialRoot===true){
    const denial=require('./agent1-owner-team-flare-grunt-denial.cjs')
      .chooseTeamFlareGruntDenial(view);
    if(denial)return denial;
  }
  if(options.tropicalBeachLastChance===true){
    const beach=require('./agent33-tropical-beach-lastchance.cjs')
      .chooseTropicalBeachLastChance(view);
    if(beach)return beach;
  }
  if(options.playersCeremonyLastChance===true){
    const ceremony=require('./agent33-players-ceremony-lastchance.cjs')
      .choosePlayersCeremonyLastChance(view);
    if(ceremony)return ceremony;
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
  const {AttackAction,PassTurnAction,RetreatAction,UseAbilityAction,
    UseStadiumAction}=deps.gameActions??
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
  const typedSeekerReplies=new WeakMap();
  const ownerSeekerPending=new Map();
  const typedEriReplies=new WeakMap();
  const ownerEriPending=new Map();
  const engineGamePhase=()=>deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  let nativeStore=null,catalog=null,actualGamesSeen=0;
  const audit={
    version:VERSION,origin:'detached-actor-observation',
    energyFrontierOptIn:deps.energyFrontier??
      (process.env.AGENT10_BASIC_ENERGY_FRONTIER_DEV==='true'),
    energyRecipientFrontierOptIn:deps.energyRecipientFrontier??
      (process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV==='true'),
    mobilityAwareRecipientOptIn:deps.mobilityAwareRecipient??
      (process.env.AGENT2_MOBILITY_ENERGY_RECIPIENT_DEV==='true'),
    perfectionRootOptIn:deps.perfectionRoot??
      (process.env.AGENT30_PERFECTION_ROOT_DEV==='true'),
    perfectionTransitionRootOptIn:deps.perfectionTransitionRoot??
      (process.env.AGENT35_PERFECTION_TRANSITION_ROOT_DEV==='true'),
    paidRetreatRootOptIn:deps.paidRetreatRoot??
      (process.env.AGENT6_PAID_RETREAT_ROOT_DEV==='true'),
    thornsDirectLineOptIn:deps.thornsDirectLine??
      (process.env.AGENT1_THORNS_DIRECT_ROOT_DEV==='true'),
    thornsSoloEnergyRetentionOptIn:deps.thornsSoloEnergyRetention??
      (process.env.AGENT14_THORNS_SOLO_HOLD_DEV==='true'),
    specialEnergyRootOptIn:deps.specialEnergyRoot??
      (process.env.AGENT3_SPECIAL_ENERGY_ROOT_DEV==='true'),
    publicContextSpecialEnergyOptIn:deps.publicContextSpecialEnergy??
      (process.env.AGENT17_PUBLIC_CONTEXT_SPECIAL_DEV==='true'),
    publicFlexibleEnergyContestOptIn:deps.publicFlexibleEnergyContest===true||
      process.env.AGENT41_PUBLIC_FLEXIBLE_CONTEST_DEV==='true',
    tropicalBeachLastChanceOptIn:deps.tropicalBeachLastChance===true,
    playersCeremonyLastChanceOptIn:deps.playersCeremonyLastChance===true,
    skyFieldBenchExpansionOptIn:deps.skyFieldBenchExpansion===true,
    pathToPeakOpposingAbilityOptIn:deps.pathToPeakOpposingAbility===true,
    jetBenchSwitchRootOptIn:deps.jetBenchSwitchRoot??
      (process.env.AGENT40_JET_BENCH_SWITCH_DEV==='true'),
    bunnelbyTmJetRootOptIn:deps.bunnelbyTmJetRoot??
      (process.env.AGENT40_BUNNELBY_TM_JET_DEV==='true'),
    busLockPositionRootOptIn:deps.busLockPositionRoot??
      (process.env.AGENT40_BUS_POSITION_DEV==='true'),
    raichuKoBreakpointBeforeAttackOptIn:deps.raichuKoBreakpointBeforeAttack??
      (process.env.AGENT10_RAICHU_KO_BREAKPOINT_DEV==='true'),
    specialEnergyRootOwnerSeat:deps.specialEnergyRootOwnerSeat??null,
    contestedEnergyRootOptIn:deps.contestedEnergyRoot===true,
    naturalEvolutionRootOptIn:deps.naturalEvolutionRoot??
      (process.env.AGENT1_NATURAL_EVOLUTION_ROOT_DEV==='true'),
    mysteriousTreasureRootOptIn:deps.mysteriousTreasureRoot??
      (process.env.AGENT49_MYSTERIOUS_TREASURE_ROOT_DEV==='true'),
    quickBallRootOptIn:deps.quickBallRoot??
      (process.env.AGENT8_ACTOR_QUICK_BALL_DEV==='true'),
    printedGxRootOptIn:deps.printedGxRoot??
      (process.env.AGENT25_PRINTED_GX_ROOT_DEV==='true'),
    printedFirstTurnAttackRootOptIn:deps.printedFirstTurnAttackRoot??
      (process.env.AGENT37_FIRSTTURN_ATTACK_ROOT_DEV==='true'),
    potentialKoRootOptIn:deps.potentialKoRoot??
      (process.env.AGENT49_POTENTIAL_KO_ROOT_DEV==='true'),
    knownDeadAttackRootOptIn:deps.knownDeadAttackRoot??
      (process.env.AGENT7_KNOWN_DEAD_ATTACK_ROOT_DEV==='true'),
    knownDeadAttackRootOwnerSeat:deps.knownDeadAttackRootOwnerSeat??null,
    powerglassRootOptIn:deps.powerglassRoot??
      (process.env.AGENT41_ACTOR_POWERGLASS_ROOT_DEV==='true'),
    floatStoneMobilityOptIn:deps.floatStoneMobility===true,
    floatStoneMobilityOwnerSeat:deps.floatStoneMobilityOwnerSeat??null,
    heldGuzmaMobilityOptIn:deps.heldGuzmaMobility??
      (process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV==='true'),
    lowHandLillieRootOptIn:deps.lowHandLillieRoot??
      (process.env.AGENT25_LOWHAND_LILLIE_DEV==='true'),
    teamFlareGruntDenialRootOptIn:deps.teamFlareGruntDenialRoot??
      (process.env.AGENT1_TEAM_FLARE_GRUNT_DEV==='true'),
    carmineFirstRootOptIn:deps.carmineFirstRoot??
      (process.env.AGENT48_CARMINE_FIRST_ROOT_DEV==='true'),
    seekerLillieRootOptIn:deps.seekerLillieRoot??
      (process.env.AGENT48_VS_SEEKER_LILLIE_DEV==='true'),
    seekerLilliePromptsProposed:0,
    seekerLilliePromptsAccepted:0,
    eriRevealRootOptIn:deps.eriRevealRoot??
      (process.env.AGENT50_ERI_REVEAL_DEV==='true'),
    eriPromptsProposed:0,eriPromptsAccepted:0,eriItemsDiscarded:0,
    conservativeShuffleBeforeAttackOptIn:deps.conservativeShuffleBeforeAttack??
      (process.env.AGENT2_SHUFFLE_PREATTACK_DEV==='true'),
    lowHandLillieCensusOptIn:deps.lowHandLillieCensus??
      (process.env.AGENT25_LOWHAND_LILLIE_CENSUS_DEV==='true'),
    ownerArbitrationCensusOptIn:deps.ownerArbitrationCensus??
      (process.env.AGENT16_OWNER_ARBITRATION_CENSUS_DEV==='true'),
    ownerArbitration:require('./agent16-owner-priority-contention.cjs')
      .newOwnerContentionAudit(),
    sameRootProposalChoiceOptIn:deps.sameRootProposalChoice===true,
    sameRootChoiceApplyOptIn:deps.sameRootChoiceApply===true,
    sameRootPassAttackProbeGlobalTurn:deps.sameRootPassAttackProbeGlobalTurn??null,
    sameRootProbeAllOptIn:deps.sameRootProbeAll===true,
    sameRootPublicEventReceiptOptIn:deps.sameRootPublicEventReceipt===true,
    sameRootProposalChoice:require('./agent41-same-root-proposal-choice.cjs')
      .newSameRootAudit(),
    terminalArbitrationOptIn:(deps.terminalArbitration??
      (process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV==='true'))||
      deps.beforeAttackDenial===true||
      process.env.AGENT41_OWNER_DENIAL_ARBITRATION_DEV==='true'||
      deps.eriRevealRoot===true||
      process.env.AGENT50_ERI_REVEAL_DEV==='true',
    beforeAttackDenialOptIn:deps.beforeAttackDenial===true||
      process.env.AGENT41_OWNER_DENIAL_ARBITRATION_DEV==='true',
    protectPotentialTwoPrizeAttackOptIn:deps.protectPotentialTwoPrizeAttack??
      (process.env.AGENT35_POTENTIAL_TWO_PRIZE_ATTACK_VETO_DEV==='true'),
    protectPotentialPrintedPrizeAttackOptIn:deps.protectPotentialPrintedPrizeAttack??
      (process.env.AGENT42_PRINTED_PRIZE_FINISHER_DEV==='true'),
    terminalArbitration:require('./agent41-owner-root-arbitration.cjs')
      .newOwnerArbitrationAudit(),
    strandedMarnieRootOptIn:deps.strandedMarnieRoot??
      (process.env.AGENT50_STRANDED_MARNIE_DEV==='true'),
    lowHandLillieRootCensus:{
      ownerRoots:0,heldRoots:0,eligibleRoots:0,
      reasonCounts:{},heldReasonCounts:{},
      bySeat:{0:{ownerRoots:0,heldRoots:0,eligibleRoots:0},
        1:{ownerRoots:0,heldRoots:0,eligibleRoots:0}},
      heldSamples:[],sampleLimit:40
    },
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
    ownerRootIntents:[],competitiveGameQualified:false,
    note:'Only roots are actor-only. Every native prompt fallback makes the full game unqualified.'
  };
  // The opt-in diagnostic must leave the default JSON audit shape intact.
  if(!audit.eriRevealRootOptIn){
    delete audit.eriRevealRootOptIn;
    delete audit.eriPromptsProposed;
    delete audit.eriPromptsAccepted;
    delete audit.eriItemsDiscarded;
  }
  if(audit.ownerArbitrationCensusOptIn){
    audit.version+='+'+
      require('./agent16-owner-priority-contention.cjs').VERSION;
  }else{
    delete audit.ownerArbitrationCensusOptIn;
    delete audit.ownerArbitration;
  }
  if(audit.sameRootProposalChoiceOptIn){
    assert.ok(!audit.sameRootProbeAllOptIn||!audit.sameRootChoiceApplyOptIn,
      'All same-root proposers may only run in observer mode');
    assert.ok(!audit.sameRootPublicEventReceiptOptIn||audit.sameRootProposalChoiceOptIn,
      'Public event history is only admitted under root proposal observation');
    audit.version+='+'+
      require('./agent41-same-root-proposal-choice.cjs').VERSION;
  }else{
    delete audit.sameRootProposalChoiceOptIn;
    delete audit.sameRootChoiceApplyOptIn;
    delete audit.sameRootPassAttackProbeGlobalTurn;
    delete audit.sameRootProbeAllOptIn;
    delete audit.sameRootPublicEventReceiptOptIn;
    delete audit.sameRootProposalChoice;
  }
  if(deps.lastBenchHeldEvolution===true ||
     process.env.AGENT43_HELD_EVOLUTION_BENCH_DEV==='true'){
    audit.lastBenchHeldEvolutionOptIn=true;
    audit.version+='+'+
      require('./agent43-held-evolution-bench-admission.cjs').VERSION;
  }
  if(audit.terminalArbitrationOptIn){
    audit.version+='+'+
      require('./agent41-owner-root-arbitration.cjs').VERSION;
    if(audit.protectPotentialPrintedPrizeAttackOptIn){
      audit.version+='+'+
        require('./agent42-visible-printed-prize-finisher.cjs').VERSION;
    }
  }else{
    delete audit.terminalArbitrationOptIn;
    delete audit.terminalArbitration;
  }
  if(!audit.beforeAttackDenialOptIn)delete audit.beforeAttackDenialOptIn;
  assert.ok([null,0,1].includes(audit.specialEnergyRootOwnerSeat));
  assert.ok([null,0,1].includes(audit.knownDeadAttackRootOwnerSeat));
  assert.ok([null,0,1].includes(audit.floatStoneMobilityOwnerSeat));
  if(audit.floatStoneMobilityOptIn)
    audit.version+='+agent1-owner-public-floatstone-mobility-v1';
  if(audit.specialEnergyRootOwnerSeat!==null)
    audit.version+='+agent49-source-seat-special-v1';
  if(audit.thornsSoloEnergyRetentionOptIn){
    audit.version+='+'+
      require('./agent14-thorns-solo-energy-retention.cjs').VERSION+'+'+
      require('./agent14-owner-solo-bench-choice-contract.cjs').VERSION;
    audit.sameRootSoloBenchChoices=[];
    audit.sameRootSoloBenchChoiceCount=0;
  }else delete audit.thornsSoloEnergyRetentionOptIn;
  if(audit.contestedEnergyRootOptIn){
    audit.version+='+'+
      require('./agent41-energy-attachment-contest.cjs').VERSION;
  }else delete audit.contestedEnergyRootOptIn;
  if(audit.publicContextSpecialEnergyOptIn)
    audit.version+='+'+
      require('./agent17-public-context-special-energy.cjs').VERSION;
  if(audit.publicFlexibleEnergyContestOptIn)
    audit.version+='+'+
      require('./agent41-public-flexible-energy-contest.cjs').VERSION;
  else delete audit.publicFlexibleEnergyContestOptIn;
  if(audit.tropicalBeachLastChanceOptIn)
    audit.version+='+'+
      require('./agent33-tropical-beach-lastchance.cjs').VERSION;
  if(audit.playersCeremonyLastChanceOptIn)
    audit.version+='+'+
      require('./agent33-players-ceremony-lastchance.cjs').VERSION;
  if(audit.skyFieldBenchExpansionOptIn)
    audit.version+='+'+
      require('./agent33-sky-field-bench-expansion.cjs').VERSION;
  if(audit.pathToPeakOpposingAbilityOptIn)
    audit.version+='+'+
      require('./agent33-path-to-peak-public-lock.cjs').VERSION;
  if(audit.jetBenchSwitchRootOptIn)
    audit.version+='+'+
      require('./agent40-public-jet-bench-frontier.cjs').VERSION;
  if(audit.bunnelbyTmJetRootOptIn)
    audit.version+='+'+
      require('./agent40-owner-bunnelby-tm-jet-line.cjs').VERSION;
  if(audit.busLockPositionRootOptIn)
    audit.version+='+'+
      require('./agent40-public-bus-position-frontier.cjs').VERSION;
  if(audit.raichuKoBreakpointBeforeAttackOptIn)
    audit.version+='+'+
      require('./agent10-raichu-damage-breakpoint-before-attack.cjs').VERSION;
  if(audit.teamFlareGruntDenialRootOptIn)
    audit.version+='+'+
      require('./agent1-owner-team-flare-grunt-denial.cjs').VERSION;
  if(audit.mysteriousTreasureRootOptIn)
    audit.version+='+'+
      require('./agent49-mysterious-treasure-frontier.cjs').VERSION;
  if(audit.quickBallRootOptIn)
    audit.version+='+'+
      require('./agent8-actor-quick-ball-frontier.cjs').VERSION;
  if(audit.potentialKoRootOptIn)
    audit.version+='+agent49-public-potential-ko-v2';
  if(audit.knownDeadAttackRootOptIn)
    audit.version+='+agent1-known-dead-leading-attack-v1';
  if(audit.knownDeadAttackRootOwnerSeat!==null)
    audit.version+='+candidate-only-seat-'+audit.knownDeadAttackRootOwnerSeat;
  if(audit.perfectionRootOptIn)
    audit.version+='+agent30-known-perfection-root-v1';
  if(audit.heldGuzmaMobilityOptIn)
    audit.version+='+'+
      require('./agent2-held-guzma-mobility-frontier.cjs').VERSION;
  if(audit.mobilityAwareRecipientOptIn)
    audit.version+='+agent2-owner-held-mobility-recipient-v1';
  if(audit.perfectionTransitionRootOptIn)
    audit.version+='+agent35-public-donor-funding-pivot-v1';
  if(audit.powerglassRootOptIn)
    audit.version+='+agent41-owner-visible-powerglass-root-v1';
  if(audit.printedFirstTurnAttackRootOptIn)
    audit.version+='+'+
      require('./agent37-firstturn-exception.cjs').VERSION;
  if(audit.lowHandLillieRootOptIn)
    audit.version+='+'+
      require('./agent25-lowhand-lillie-frontier.cjs').VERSION;
  if(audit.carmineFirstRootOptIn)
    audit.version+='+'+
      require('./agent48-conservative-first-carmine.cjs').VERSION;
  if(audit.seekerLillieRootOptIn)
    audit.version+='+'+
      require('./agent48-owner-vs-seeker-lillie.cjs').VERSION;
  if(audit.lowHandLillieCensusOptIn)
    audit.version+='+agent25-owner-lowhand-lillie-census-v1';
  if(audit.strandedMarnieRootOptIn)
    audit.version+='+'+
      require('./agent50-stranded-marnie-frontier.cjs').VERSION;
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
    if(seat!==-1&&pending&&audit.seekerLillieRootOptIn&&
       pending.playerId===playerId&&ownerSeekerPending.has(playerId)){
      const {ResolvePromptAction}=deps.promptActions??
        require(path.join(base,'game/store/actions/resolve-prompt-action'));
      const planned=require('./agent48-owner-vs-seeker-lillie.cjs')
        .chooseSeekerLilliePrompt(state,seat,pending,ResolvePromptAction);
      typedSeekerReplies.set(planned,{seat,ownerId:playerId,
        printing:ownerSeekerPending.get(playerId).target});
      audit.seekerLilliePromptsProposed++;
      return planned;
    }
    if(seat!==-1&&pending&&audit.eriRevealRootOptIn&&
       pending.playerId===playerId&&ownerEriPending.has(playerId)){
      const token=ownerEriPending.get(playerId);
      assert.equal(token.promptId,pending.id,
        'Eri reply must originate from the accepted native reveal prompt');
      const {ResolvePromptAction}=deps.promptActions??
        require(path.join(base,'game/store/actions/resolve-prompt-action'));
      const {SuperType,TrainerType,CardTag}=deps.eriCardTypes??
        require(path.join(base,'game/store/card/card-types'));
      const decision=require('./agent50-eri-revealed-item-prompt.cjs')
        .resolveEriRevealedItemPrompt(state,seat,pending,
          SuperType,TrainerType,ResolvePromptAction,CardTag);
      assert.ok(decision,'Eri owner prompt lost its revelation entitlement');
      typedEriReplies.set(decision.action,{seat,ownerId:playerId,
        selectedPhysical:decision.action.result,
        selectedPrintings:decision.selectedPrintings});
      audit.eriPromptsProposed++;
      return decision.action;
    }
    if(seat===-1||pending||state.activePlayer!==seat){
      if(pending&&state.players?.[seat]?.id===pending.playerId){
        audit.unsupportedPromptFallbacks++;
        const name=pending.constructor?.name??'unknown';
        audit.unsupportedPromptTypes[name]=(audit.unsupportedPromptTypes[name]??0)+1;
      }else audit.nonOwnerNativeDelegations++;
      return original.value.call(this,state);
    }
    if(catalog===null){
      catalog=getCatalog();
      if((audit.publicContextSpecialEnergyOptIn||
          audit.protectPotentialPrintedPrizeAttackOptIn)&&
          !(catalog.publicPokemonProfileIndex instanceof Map)){
        catalog.publicPokemonProfileIndex=
          require('./agent10-original-printing-energy-flags.cjs')
            .buildPublicPokemonProfileIndex(path.resolve(__dirname,'../..'));
      }
    }
    const view=observe(state,seat);
    if(audit.lowHandLillieCensusOptIn){
      const {LILLIE}=require('./agent12-actor-only-lillie-after-pass.cjs');
      const reason=require('./agent25-lowhand-lillie-frontier.cjs')
        .lowHandLillieExclusionReason(view)??'eligible';
      const c=audit.lowHandLillieRootCensus;
      const bySeat=c.bySeat[seat];
      const held=view.ownHand.includes(LILLIE);
      c.ownerRoots++;bySeat.ownerRoots++;
      c.reasonCounts[reason]=(c.reasonCounts[reason]??0)+1;
      if(held){
        c.heldRoots++;bySeat.heldRoots++;
        c.heldReasonCounts[reason]=(c.heldReasonCounts[reason]??0)+1;
        if(c.heldSamples.length<c.sampleLimit)c.heldSamples.push({
          seat,globalTurn:view.globalTurn,handCount:view.ownHand.length,
          deckCount:view.ownPublic.deckCount,reason
        });
      }
      if(reason==='eligible'){c.eligibleRoots++;bySeat.eligibleRoots++;}
    }
    const rootOptions={
      energyFrontier:audit.energyFrontierOptIn,
      energyRecipientFrontier:audit.energyRecipientFrontierOptIn,
      contestedEnergyRoot:audit.contestedEnergyRootOptIn===true,
      mobilityAwareRecipient:audit.mobilityAwareRecipientOptIn,
      paidRetreatRoot:audit.paidRetreatRootOptIn,
      perfectionRoot:audit.perfectionRootOptIn,
      perfectionTransitionRoot:audit.perfectionTransitionRootOptIn,
      thornsDirectLine:audit.thornsDirectLineOptIn,
      thornsSoloEnergyRetention:audit.thornsSoloEnergyRetentionOptIn===true,
      specialEnergyRoot:actorSpecialEnergyEnabled(
        audit.specialEnergyRootOptIn,audit.specialEnergyRootOwnerSeat,seat),
      publicContextSpecialEnergy:actorSpecialEnergyEnabled(
        audit.publicContextSpecialEnergyOptIn,
        audit.specialEnergyRootOwnerSeat,seat),
      publicFlexibleEnergyContest:audit.publicFlexibleEnergyContestOptIn===true,
      tropicalBeachLastChance:audit.tropicalBeachLastChanceOptIn===true,
      playersCeremonyLastChance:audit.playersCeremonyLastChanceOptIn===true,
      skyFieldBenchExpansion:audit.skyFieldBenchExpansionOptIn===true,
      pathToPeakOpposingAbility:audit.pathToPeakOpposingAbilityOptIn===true,
      raichuKoBreakpointBeforeAttack:audit.raichuKoBreakpointBeforeAttackOptIn,
      jetBenchSwitchRoot:audit.jetBenchSwitchRootOptIn,
      bunnelbyTmJetRoot:audit.bunnelbyTmJetRootOptIn,
      busLockPositionRoot:audit.busLockPositionRootOptIn,
      ownRegisteredSixty:deps.ownRegisteredSixtiesBySeat?.[seat]??null,
      printedGxRoot:audit.printedGxRootOptIn,
      printedFirstTurnAttackRoot:audit.printedFirstTurnAttackRootOptIn,
      potentialKoRoot:audit.potentialKoRootOptIn,
      knownDeadAttackRoot:actorSpecialEnergyEnabled(
        audit.knownDeadAttackRootOptIn,audit.knownDeadAttackRootOwnerSeat,seat),
      naturalEvolutionRoot:audit.naturalEvolutionRootOptIn,
      mysteriousTreasureRoot:audit.mysteriousTreasureRootOptIn,
      quickBallRoot:audit.quickBallRootOptIn,
      powerglassRoot:audit.powerglassRootOptIn,
      floatStoneMobility:actorSpecialEnergyEnabled(
        audit.floatStoneMobilityOptIn,
        audit.floatStoneMobilityOwnerSeat,seat),
      heldGuzmaMobility:audit.heldGuzmaMobilityOptIn,
      lastBenchHeldEvolution:audit.lastBenchHeldEvolutionOptIn===true,
      strandedMarnieRoot:audit.strandedMarnieRootOptIn,
      lowHandLillieRoot:audit.lowHandLillieRootOptIn,
      teamFlareGruntDenialRoot:audit.teamFlareGruntDenialRootOptIn,
      eriRevealRoot:audit.eriRevealRootOptIn===true,
      carmineFirstRoot:audit.carmineFirstRootOptIn,
      seekerLillieRoot:audit.seekerLillieRootOptIn,
      protectPotentialTwoPrizeAttack:audit.protectPotentialTwoPrizeAttackOptIn,
      protectPotentialPrintedPrizeAttack:audit.protectPotentialPrintedPrizeAttackOptIn,
      conservativeShuffleBeforeAttack:audit.conservativeShuffleBeforeAttackOptIn,
      beforeAttackDenialRoot:audit.beforeAttackDenialOptIn,
      payablePrintedAttackOffer:audit.sameRootProposalChoiceOptIn===true,
      preterminalSpeedDrawOffer:audit.sameRootProposalChoiceOptIn===true,
      sameRootPublicEventReceipt:audit.sameRootPublicEventReceiptOptIn===true,
      sameRootProbeAll:audit.sameRootProbeAllOptIn===true,
      sameRootChoiceApply:audit.sameRootChoiceApplyOptIn===true,
      passAttackProbeGlobalTurn:audit.sameRootPassAttackProbeGlobalTurn
    };
    // Option contract is obtained before selecting the owner root. The same
    // detached view supplies both Bench and attack/setup proposals; no native
    // Store action is attempted during proposal collection.
    const soloChoice=audit.thornsSoloEnergyRetentionOptIn?
      require('./agent14-owner-solo-bench-choice-contract.cjs')
        .collectSoloBenchChoice(view,catalog,chooseActorRootIntent,rootOptions):null;
    if(soloChoice){
      audit.sameRootSoloBenchChoiceCount++;
      if(audit.sameRootSoloBenchChoices.length<40)
        audit.sameRootSoloBenchChoices.push({
          globalTurn:view.globalTurn,seat,
          rootDecisionOrdinal:audit.selectedRootDecisions+1,
          ...soloChoice
        });
    }
    const firstIntent=soloChoice?.chosen??
      chooseActorRootIntent(view,catalog,rootOptions);
    // Partial owner-view alternative collection is explicitly opt-in. The
    // first-return action is a control offer, never previously dispatched.
    // The new chooser and historical terminal arbiter are mutually exclusive
    // until their option sets and native receipts can be reconciled.
    // The owner-visible public event clock is separately admitted at the
    // trusted Store boundary. Never pass State or native card IDs to a
    // selector. The historical baseline continues using the original view.
    const rootProposalView=audit.sameRootPublicEventReceiptOptIn?
      Object.freeze({...view,publicEventReceipt:
        require('./agent8-public-event-receipt.cjs')
          .publicEventReceipt(state,seat)}):view;
    const sameRoot=audit.sameRootProposalChoiceOptIn?
      require('./agent41-same-root-proposal-choice.cjs')
        .collectAndChooseOwnerRoot(rootProposalView,catalog,firstIntent,
          rootOptions):null;
    if(sameRoot){
      require('./agent41-same-root-proposal-choice.cjs')
        .recordSameRootAudit(audit.sameRootProposalChoice,seat,
          view.globalTurn,audit.selectedRootDecisions+1,sameRoot.receipt);
    }
    const arbitration=audit.terminalArbitrationOptIn&&
      !audit.sameRootProposalChoiceOptIn?
      require('./agent41-owner-root-arbitration.cjs')
        .arbitrateOwnerRootIntent(view,catalog,firstIntent,rootOptions):null;
    if(arbitration){
      require('./agent41-owner-root-arbitration.cjs')
        .recordOwnerArbitration(audit.terminalArbitration,
          seat,view.globalTurn,arbitration.receipt,
          audit.selectedRootDecisions+1);
    }
    const intent=arbitration?.intent??sameRoot?.intent??firstIntent;
    if(audit.ownerArbitrationCensusOptIn){
      const diagnostics=require('./agent16-owner-priority-contention.cjs');
      const receipt=diagnostics.collectOwnerContention(
        view,catalog,rootOptions,intent);
      diagnostics.recordOwnerContention(audit.ownerArbitration,
        seat,view.globalTurn,receipt);
    }
    const ownerId=state.players[seat].id;
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
      case 'equip-bunnelby-tm':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,
          slot:intent.slot==='bench'?SlotType.BENCH:SlotType.ACTIVE,
          index:intent.slot==='bench'?intent.index:0});
        break;
      case 'attach-emergency-floatstone':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
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
      case 'play-held-guzma-mobility':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'play-seeker-get-lillie':
      case 'play-seeker-recovered-lillie':
      case 'play-carmine-first':
      case 'play-lowhand-lillie':
      case 'play-stranded-marnie':
      case 'play-team-flare-grunt-denial':
      case 'play-eri-reveal':
      case 'play-conservative-shuffle-supporter':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'play-mysterious-treasure':
      case 'play-quick-ball':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'play-tropical-beach':
      case 'play-players-ceremony':
      case 'play-sky-field':
      case 'play-path-to-peak':
      case 'play-thunder-mountain':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'attach-dce':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
        break;
      case 'retreat-emergency-floatstone':
        action=new RetreatAction(ownerId,intent.benchIndex);
        break;
      case 'paid-retreat':
        action=new RetreatAction(ownerId,intent.benchIndex);
        break;
      case 'perfection':
        action=new UseAbilityAction(ownerId,'Perfection',{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0});
        break;
      case 'attack':action=new AttackAction(ownerId,intent.attackName);break;
      case 'use-tropical-beach':
      case 'use-players-ceremony':
        action=new UseStadiumAction(ownerId);break;
      case 'pass':action=new PassTurnAction(ownerId);break;
      default:throw new Error('Unknown actor-only intent: '+intent.kind);
    }
    audit.selectedRootDecisions++;
    typedDecisions.set(action,{globalTurn:view.globalTurn,seat,kind:intent.kind,
      ...((audit.terminalArbitrationOptIn||audit.sameRootProposalChoiceOptIn)?{
        policyDecisionOrdinal:audit.selectedRootDecisions}:{}),
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
    const eriReply=this===nativeStore?typedEriReplies.get(action):undefined;
    if(eriReply){
      const owner=this.state.players[eriReply.seat];
      const opponent=this.state.players[1-eriReply.seat];
      assert.equal(owner?.id,eriReply.ownerId);
      const chosen=eriReply.selectedPhysical;
      assert.ok(chosen.every(card=>opponent.hand.cards.includes(card)),
        'Eri must choose exact physical cards from the revealed hand');
      const result=beforeDispatch.value.apply(this,[action,...args]);
      assert.ok(chosen.every(card=>
        opponent.discard.cards.includes(card)&&
        !opponent.hand.cards.includes(card)),
        'Eri native response failed to discard chosen physical Items');
      assert.ok(owner.discard.cards.some(card=>card.fullName==='Eri TEF'),
        'Eri must finish in the acting owner discard after resolution');
      ownerEriPending.delete(eriReply.ownerId);
      audit.eriPromptsAccepted++;
      audit.eriItemsDiscarded+=chosen.length;
      return result;
    }
    const seekerReply=this===nativeStore?typedSeekerReplies.get(action):undefined;
    if(seekerReply){
      const owner=this.state.players[seekerReply.seat];
      assert.equal(owner?.id,seekerReply.ownerId);
      const beforeHand=owner.hand.cards.filter(x=>
        x.fullName===seekerReply.printing).length;
      const beforeDiscard=owner.discard.cards.filter(x=>
        x.fullName===seekerReply.printing).length;
      const result=beforeDispatch.value.apply(this,[action,...args]);
      const afterward=this.state.players[seekerReply.seat];
      const afterHand=afterward.hand.cards.filter(x=>
        x.fullName===seekerReply.printing).length;
      const afterDiscard=afterward.discard.cards.filter(x=>
        x.fullName===seekerReply.printing).length;
      assert.equal(afterHand,beforeHand+1,
        'VS Seeker live owner prompt failed to physically recover Lillie');
      assert.equal(afterDiscard,beforeDiscard-1,
        'VS Seeker live owner prompt did not remove exact own-discard Lillie');
      ownerSeekerPending.delete(seekerReply.ownerId);
      audit.seekerLilliePromptsAccepted++;
      return result;
    }
    const choice=this===nativeStore?typedDecisions.get(action):undefined;
    if(!choice)return beforeDispatch.value.apply(this,[action,...args]);
    const before=publicDispatchState(this);
    const ownerBefore=before===null?null:
      rootPhysicalSnapshot(this.state,choice.seat,choice.intent);
    try{
      const result=beforeDispatch.value.apply(this,[action,...args]);
      if(choice.kind==='play-eri-reveal'){
        const owner=this.state.players[choice.seat];
        const rival=this.state.players[1-choice.seat];
        const pending=this.state.prompts?.find(p=>p.result===undefined);
        const {SuperType,TrainerType}=deps.eriCardTypes??
          require(path.join(base,'game/store/card/card-types'));
        assert.ok(owner&&rival&&pending&&
          require('./agent50-eri-revealed-item-prompt.cjs')
            .observeEriRevealedItems(this.state,choice.seat,pending,
              SuperType,TrainerType)!==null,
          'Native Eri root failed to create authenticated opponent-hand reveal');
        assert.ok(!ownerEriPending.has(owner.id));
        ownerEriPending.set(owner.id,{seat:choice.seat,
          promptId:pending.id,globalTurn:choice.globalTurn});
      }
      if(choice.kind==='play-seeker-get-lillie'){
        const owner=this.state.players[choice.seat];
        const pending=this.state.prompts?.find(p=>p.result===undefined);
        assert.ok(owner&&pending&&
          pending.constructor?.name==='ChooseCardsPrompt'&&
          pending.playerId===owner.id&&
          pending.cards===owner.discard,
          'Native VS Seeker root did not create its authenticated own-discard prompt');
        assert.ok(!ownerSeekerPending.has(owner.id));
        ownerSeekerPending.set(owner.id,{seat:choice.seat,
          target:choice.intent.target,globalTurn:choice.globalTurn});
      }
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
