'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {actorObservation,publicPlayer}=require('./actor-observation-contract.cjs');
const {rootPhysicalSnapshot,rootPhysicalWitness}=
  require('./agent5-owner-root-slice.cjs');
const {
  VERSION:POST_TIMELESS_MAX_GEIST_VERSION,
  choosePostTimelessMaxGeistRetreat
}=require('./2026-11/agent8-post-timeless-maxgeist-root-intent.cjs');
const {
  VERSION:POST_TIMELESS_POWERBEAM_PROMPT_VERSION,
  chooseNativeMimikyuPostTimelessPowerBeamPrompt
}=require('./2026-11/agent8-mimikyu-post-timeless-powerbeam-prompt.cjs');
const VERSION='agent34-actor-only-root-slice-v11-post-timeless-maxgeist-powerbeam-prompt';
const ENERGY_NAMES=['Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal','Fairy'];
/**
 * Shared policy-to-headless provenance channel, keyed by the identical typed
 * native action object. It never mutates a Store action or copies hidden
 * cards. The headless loop binds its own action ordinal before dispatch.
 */
const actorNativeActionMetadata=new WeakMap();

/** @param {object} action @returns {object|null} */
function actorNativeActionReceipt(action){
  return action&&typeof action==='object'?
    actorNativeActionMetadata.get(action)??null:null;
}

/**
 * The headless loop supplies the real Store-clock ordinal, which is distinct
 * from the actor chooser's policy clock. A replaced or generic bot action has
 * no tag and cannot be confused with an actor proposal.
 * @param {object} action
 * @param {number} storeOrdinal
 * @param {0|1} seat
 * @returns {object|null}
 */
function bindActorNativeStoreOrdinal(action,storeOrdinal,seat){
  const tagged=actorNativeActionReceipt(action);
  if(!tagged)return null;
  assert.ok(Number.isSafeInteger(storeOrdinal)&&storeOrdinal>=0);
  assert.equal(seat,tagged.seat);
  const bound=Object.freeze({...tagged,nativeStoreActionOrdinal:storeOrdinal});
  actorNativeActionMetadata.set(action,bound);
  return bound;
}


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
  const {PokemonCard,EnergyCard,TrainerCard,TrainerType,Stage,EnergyType,CardType,
    PowerType,SpecialCondition}=types;
  return {
    perfectionDonors:require('./agent30-known-perfection-options.cjs')
      .knownPerfectionDonorCatalog(all),
    // All Stadium identities are public printed metadata; only the actor's
    // own held copies may be selected for the Path recovery action.
    trainerStadiumPrints:TrainerCard&&TrainerType?
      new Map(all.filter(c=>c instanceof TrainerCard&&
        c.trainerType===TrainerType.STADIUM)
        .map(c=>[c.fullName,{name:c.name,type:'Stadium'}])):new Map(),
    itemPrintings:TrainerCard&&TrainerType?
      new Set(all.filter(c=>c instanceof TrainerCard&&
        c.trainerType===TrainerType.ITEM).map(c=>c.fullName)):new Set(),
    basics:new Set(all.filter(c=>c instanceof PokemonCard&&
      c.stage===Stage.BASIC).map(c=>c.fullName)),
    // Printed Tool identity is public card-catalog metadata. A Tool in an
    // owner's hand is private to that owner; do not read its deck or Prizes.
    // Synthetic catalog callers that omit TrainerCard cannot offer Tools.
    toolPrintings:types.TrainerCard&&types.TrainerType?
      require('./agent18-actor-tool-candidate-frontier.cjs')
        .actorToolPrintingCatalog(all,types):new Set(),
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
      ASLEEP:SpecialCondition.ASLEEP,PARALYZED:SpecialCondition.PARALYZED,
      CONFUSED:SpecialCondition.CONFUSED,POISONED:SpecialCondition.POISONED,
      BURNED:SpecialCondition.BURNED
    }
  };
}

/**
 * Pure decision from a detached owner observation plus the public print catalog.
 * No native State, opposing hidden zones, or own unknown deck identities enter.
 * @param {object} view
 * @param {{basics:Set<string>,abilityBasics:Set<string>,basicEnergies:Set<string>,basicEnergyTypes:Record<string,number>,colorlessEnergyType:number,specialConditions:{ASLEEP:number,PARALYZED:number,CONFUSED:number}}} catalog
 * @returns {object} Native-neutral intent.
 */
function chooseActorRootIntent(view,catalog,options={}){
  assert.equal(view.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  if(options.rank7FabaJetBridge===true){
    const first=require('./2026-11/agent40-faba-jet-owner-bridge.cjs')
      .chooseFabaJetHoodRoot(view);
    if(first)return first;
  }
  const garbodorResponseOwnerSeat=options.garbodorResponseOwnerSeat??null;
  const naturalEvolutionOwnerSeat=
    options.naturalEvolutionRootOwnerSeat??garbodorResponseOwnerSeat;
  assert.ok(garbodorResponseOwnerSeat===null||
    garbodorResponseOwnerSeat===0||garbodorResponseOwnerSeat===1,
  'garbodorResponseOwnerSeat must be null, 0, or 1');
  assert.ok(naturalEvolutionOwnerSeat===null||
    naturalEvolutionOwnerSeat===0||naturalEvolutionOwnerSeat===1,
    'naturalEvolutionRootOwnerSeat must be null, 0, or 1');
  assert.ok(garbodorResponseOwnerSeat===null||
    options.naturalEvolutionRoot===true||options.garbotoxinToolRoot===true,
  'garbodorResponseOwnerSeat requires a Garbodor response root');
  // Development-only, source-independent response to an already publicly
  // announced paid GX attack. Only the actor's own held Ranger can be offered;
  // default policy decisions and the canonical observation are unchanged.
  if(options.rangerPaidGxResponse===true){
    const ranger=require('./agent30-ranger-public-gx-frontier.cjs')
      .proposeRangerAfterPaidGx(view);
    if(ranger)return ranger;
  }
  const benchIndex=own.bench.findIndex(slot=>slot===null);
  const soloThornsHold=options.thornsSoloEnergyRetention===true&&
    require('./agent14-thorns-solo-energy-retention.cjs')
      .holdSoloThornsBench(view,catalog);
  if(options.farewellLetterRoot===true){
    const farewell=require('./agent14-owner-farewell-letter.cjs')
      .chooseOwnerFarewellLetter(view);
    if(farewell)return farewell;
  }
  if(benchIndex>=0&&!r.pokemonPlayLocked&&!soloThornsHold){
    const eligible=view.ownHand.flatMap((p,i)=>
      catalog.basics.has(p)&&
      !(r.abilityPokemonPlayLocked===true&&catalog.abilityBasics.has(p))?
        [i]:[]);
    const preferred=options.mewGenesectBenchFirst===true?
      require('./2026-11/agent8-mew-genesect-bench-priority.cjs')
        .chooseMewGenesectBenchIndex(view,eligible):null;
    const index=preferred??eligible[0]??-1;
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
  // Default-off owner-only Temple counterline. This is a new planned
  // action policy for the original Thorns mirror, never a claim of native
  // attack denial until real Store receipts confirm it.
  if(process.env.AGENT12_TEMPLE_THORNS_OWNER_DEV==='true'){
    const temple=require('./2026-11/agent12-thorns-mimikyu-temple-owner.cjs')
      .chooseTempleMimikyuThornsLine(view,catalog);
    if(temple)return temple;
  }
  if(options.pathToPeakOpposingAbility===true){
    const path=require('./agent33-path-to-peak-public-lock.cjs')
      .choosePathToPeakOpposingAbility(view,catalog,{
        ownFusionUsage:options.ownFusionUsage??null,
        allowSafeSkyFieldReplacement:options.pathSafeSkyFieldReplacement===true
      });
    if(path)return path;
  }
  if(options.naturalEvolutionRoot===true&&
     (naturalEvolutionOwnerSeat===null||
      view.actorSeat===naturalEvolutionOwnerSeat)){
    const evolution=require('./agent1-actor-evolution-frontier.cjs')
      .chooseNaturalEvolutionIntent(view,catalog);
    if(evolution)return evolution;
  }
  // A literal opt-in owner-only counterline: consume the actor's genuine
  // held Hood on a free Benched VMAX Tool slot under public Iron Thorns.
  // Every other invocation follows the existing shared actor policy.
  if(process.env.AGENT4_HOOD_TOOL_ROOT_DEV==='true'){
    const hood=require('./2026-11/agent4-hood-protected-underworld-owner-exception.cjs')
      .chooseHoodToolPreparation(view,catalog);
    if(hood && process.env.AGENT4_IMMEDIATE_PSYCHIC_HOOD_DEV==='true'){
      const funded=require('./2026-11/agent4-immediate-hood-psychic-budget.cjs')
        .immediateHoodFunding(view,catalog,hood);
      if(funded.eligible)return hood;
    }else if(hood)return hood;
  }
  if(options.arvenHoodSearch===true){
    const arven=require('./agent31/arven-hood-owner-frontier.cjs')
      .chooseArvenHoodRoot(view,catalog);
    if(arven)return arven;
  }
  if(options.garbotoxinToolRoot===true&&
     (garbodorResponseOwnerSeat===null||
      view.actorSeat===garbodorResponseOwnerSeat)){
    const tool=require('./agent36-garbotoxin-tool-intent.cjs')
      .chooseGarbodorToolIntent(view,catalog,{
        deferForStarAlchemy:
          options.garbotoxinToolRootDeferForStarAlchemy===true
      });
    if(tool)return tool;
  }
  // Optional owner-public Ditto Prism permission after the native board check.
  if(options.dittoStage1Root===true){
    const ditto=require('./agent1-ditto-prism-actor-evolution.cjs')
      .chooseDittoStage1EvolutionIntent(
        view,catalog,options.dittoStage1Receipt??null);
    if(ditto)return ditto;
  }
  // The extra-turn follow-up is narrower than the general Skyliner pivot:
  // only a candidate-owned, publicly evidenced Timeless-GX turn can propose
  // Max Geist, and the helper abstains when Power Beam is a competing donor.
  if(options.mimikyuTimelessMaxGeistRetreatRoot===true&&
     options.mimikyuApexFundedPromotion===true){
    const followUp=choosePostTimelessMaxGeistRetreat(view,catalog,{
      ownerSeat:options.mimikyuTimelessMaxGeistRetreatRootOwnerSeat
    });
    if(followUp)return followUp;
  }
  // Source-independent effective zero-cost Skyliner pivot to an already
  // funded Benched attacker. The native Store determines true Ability
  // suppression, Retreat legality and attack settlement. This helper
  // inspects only the acting owner's public board and public opponent Active.
  if(options.skylinerFundedBenchRetreatRoot===true&&
     require('./agent6-skyliner-ability-suppression-guard.cjs')
       .publicSkylinerSuppressionReason(view)===null){
    const skyliner=require('./agent2-owner-skyliner-funded-bench-frontier.cjs')
      .chooseOwnerSkylinerFundedBenchRetreat(view,catalog);
    if(skyliner)return {...skyliner,printing:skyliner.pokemon};
  }
  // General funded-KO Item mobility is a separate opt-in counterfactual.
  // It considers the actual enemy Active and preserves an already payable
  // Active KO. A prior Block effect is not required.
  if(options.genericTacticalSwitchRoot===true){
    const tactical=require('./2026-11/agent35-tactical-switch-funded-ko.cjs')
      .chooseTacticalSwitchFundedKo(view,catalog);
    if(tactical)return tactical;
  }
  // Explicit owner-visible Item switch through an enemy Active retreat ban.
  // Never turns a blocked voluntary RetreatAction into a claimed legal play.
  if(options.opponentBlockSwitchRoot===true){
    const rescue=require('./agent35-block-switch-ko-frontier.cjs')
      .chooseBlockSwitchFundedKo(view,catalog);
    if(rescue)return rescue;
  }
  // Opt-in owner-only, fully funded post-Apex Mimikyu Active promotion.
  // Its public attack-history receipt comes from the real Store tracker.
  if(options.mimikyuApexFundedPromotion===true){
    const apex=require('./2026-11/agent6-funded-mimikyu-apex-promotion.cjs');
    const attack=apex.chooseFundedMimikyuApexCopycat(view,catalog);
    if(attack)return attack;
    const planned=apex.chooseFundedMimikyuApexPromotion(view,catalog);
    if(planned)return planned;
  }
  // Source-independent counterpart to the frozen rank1 VMAX-specific line.
  // This is strictly opt-in and uses only the detached acting owner's view.
  if(options.genericFundedFloatStoneRoot===true&&
     (options.genericFundedFloatStoneOwnerSeat===undefined||
      options.genericFundedFloatStoneOwnerSeat===view.actorSeat)){
    const mobility=require('./agent14-generic-funded-floatstone-frontier.cjs')
      .chooseGenericFundedFloatStone(view,catalog);
    if(mobility)return mobility;
  }
  // Deliberately narrow research-only rescue, kept separate from the
  // positive-Energy preservation helper. The turn is preregistered.
  if(options.zeroEnergyStrandFloatStoneRoot===true&&
     (options.zeroEnergyStrandFloatStoneTargetTurn===null||
      options.zeroEnergyStrandFloatStoneTargetTurn===view.globalTurn)){
    const rescue=require('./agent31-zero-energy-strand-floatstone.cjs')
      .chooseZeroEnergyStrandFloatStone(view,catalog);
    if(rescue)return rescue;
  }
  // V2 compares a same-target free Float Stone line before any paid fee.
  if(options.twoUnitPaidRetreatRootV2===true&&
     ((options.twoUnitPaidRetreatTargetTurnV2??null)===null||
      options.twoUnitPaidRetreatTargetTurnV2===view.globalTurn)){
    const paid=require('./agent42-public-two-unit-paid-retreat-proposal-v2.cjs')
      .proposeTwoUnitPaidRetreatV2(view,catalog);
    if(paid){
      const freeGeneric=require('./agent14-generic-funded-floatstone-frontier.cjs')
        .chooseGenericFundedFloatStone(view,catalog);
      if(freeGeneric&&freeGeneric.benchIndex===paid.benchIndex&&
         freeGeneric.targetAttackName===paid.attackName){
        return {...freeGeneric,
          source:'agent42-paid-retreat-v2-floatstone-arbitration'};
      }
      if(options.fundedVmaxFloatStoneRoot===true){
        const freeVmax=require('./agent31-shadow-rider-funded-bench-floatstone.cjs')
          .chooseFundedShadowRiderFloatStone(view,catalog);
        if(freeVmax&&freeVmax.benchIndex===paid.benchIndex&&
           freeVmax.targetAttackName===paid.attackName)return freeVmax;
      }
      return {...paid,kind:'paid-retreat',
        source:'agent42-owner-two-unit-paid-retreat-v2'};
    }
  }
  // Default-off owner-visible paid alternative to consuming Float Stone.
  // Keep this before funded Tool selection so both routes can be evaluated
  // at exactly the same public root, without importing any hidden zones.
  if(options.twoUnitPaidRetreatRoot===true&&
     ((options.twoUnitPaidRetreatTargetTurn??null)===null||
      options.twoUnitPaidRetreatTargetTurn===view.globalTurn)){
    const paid=require('./agent42-public-two-unit-paid-retreat-proposal.cjs')
      .proposeTwoUnitPaidRetreat(view,catalog);
    if(paid)return {...paid,kind:'paid-retreat',
      source:'agent42-owner-two-unit-paid-retreat-v1'};
  }
  if(options.fundedVmaxFloatStoneRoot===true){
    const mobility=require('./agent31-shadow-rider-funded-bench-floatstone.cjs')
      .chooseFundedShadowRiderFloatStone(view,catalog);
    if(mobility)return mobility;
  }
  if(options.templeDdeDenial===true){
    const temple=require('./2026-11/agent22-temple-dde-owner-policy.cjs')
      .chooseTempleDdeDenial(view,catalog);
    if(temple)return temple;
  }
  if(options.underworldDoorRoot===true){
    const underworld=require('./agent31-underworld-door-owner-frontier.cjs')
      .chooseUnderworldDoorRoot(
        view,catalog,options.underworldMarkerReceipt);
    if(underworld){
      if(options.underworldActiveFundingThresholdV2===true){
        const threshold=require('./2026-11/agent26-underworld-immediate-max-geist-payability-v1.cjs')
          .chooseUnderworldImmediateMaxGeistPayability(view,catalog);
        if(threshold)return threshold;
      }else if(options.underworldActiveFundingPriority===true&&
          view.globalTurn>=(options.underworldActiveFundingMinTurn??0)){
        const mirrorVeto=options.underworldActiveFundingMirrorVeto===true&&
          require('./2026-11/agent26-shadow-rider-mirror-funding-veto.cjs')
            .vetoManualActiveFunding(view);
        if(!mirrorVeto){
          const active=require('./agent34-underworld-active-funding-priority.cjs')
            .chooseUnderworldActiveFundingPriority(view,catalog);
          if(active)return active;
        }
      }
      return underworld;
    }
  }
  if(options.maxGeistManualRecovery===true){
    const recovery=require('./2026-11/agent33-max-geist-manual-psychic-recovery.cjs')
      .chooseMaxGeistManualRecovery(view,catalog);
    if(recovery)return recovery;
  }
  if(options.pathUnderworldStadiumCounter===true&&
     options.underworldDoorRoot===true){
    const pathCounter=require('./2026-11/agent6-path-underworld-stadium-counter.cjs')
      .planPathUnderworldStadiumCounter(view,catalog,
        catalog.trainerStadiumPrints??new Map(),
        options.underworldMarkerReceipt);
    if(pathCounter){
      const next=pathCounter.options[0];
      return {
        kind:'play-path-underworld-stadium-counter',
        handIndex:next.handIndex,printing:next.printing,
        source:'agent6-owner-path-stadium-underworld-counter-v1',
        expectedNativeEffectUnverified:true,
        alternativePrintings:pathCounter.options.map(x=>x.printing)
      };
    }
  }
  if(options.mysteriousTreasureEarlyRegistered===true){
    const early=require('./agent49-registered-treasure-early-setup.cjs')
      .chooseRegisteredTreasureEarlyIntent(
        view,catalog,options.ownRegisteredSixty);
    if(early)return early;
  }
  if(options.mysteriousTreasureRoot===true){
    const item=require('./agent49-mysterious-treasure-frontier.cjs')
      .chooseTreasureRootIntent(view,catalog,{
        preferMuscleBandPayment:
          options.mysteriousTreasureMuscleBandPayment===true
      });
    if(item)return item;
  }
  if(options.firstCrispinSeekerRecovery===true){
    const seeker=require('./agent49/first-turn-crispin-seeker-recovery.cjs')
      .chooseFirstCrispinSeekerRecovery(view);
    if(seeker)return seeker;
  }
  if(options.earlyRegidragoCompressor===true){
    const donor=require('./agent49/early-regidrago-compressor.cjs')
      .chooseEarlyRegidragoCompressor(view,{
        allowFirstOwnTurnTwo:
          options.earlyRegidragoCompressorAllowFirstOwnTurnTwo===true
      });
    if(donor)return donor;
  }
  if(options.rank13CrispinRoot===true){
    const crispin=require('./agent5/rank13-crispin-owner-funding.cjs')
      .chooseRank13CrispinRoot(view);
    if(crispin)return crispin;
  }
  if(options.rank13DdeEnergyRoot===true){
    const funding=require('./agent8-rank13-double-dragon-energy-frontier.cjs')
      .chooseRank13DoubleDragonRoot(view);
    if(funding)return funding;
  }
  if(options.regidragoDonorQuickBallRoot===true){
    const donor=require('./agent8-regidrago-quickball-donor-frontier.cjs')
      .chooseRegidragoDonorQuickBall(view);
    if(donor)return donor;
  }
  if(options.quickBallRoot===true&&
     options.quickBallPayableAttackPriority!==true){
    const item=require('./agent8-actor-quick-ball-frontier.cjs')
      .chooseQuickBallRootIntent(view);
    if(item)return item;
  }
  // Development-only owner-registered Bunnelby TM + Jet ALS.
  // The source 60 is the acting player's known list, never the opponent's.
  // Owner-visible search for the missing VMAX evolution from an established
  // Mew V. The physical Ultra Ball payment and search remain native.
  if(options.mewUltraBallEvolutionRoot===true){
    const mew=require('./agent37/mew-ultraball-evolution.cjs')
      .chooseMewUltraBallEvolutionRoot(view);
    if(mew)return mew;
  }
  if(options.bunnelbyTmJetRoot===true){
    const line=require('./agent40-owner-bunnelby-tm-jet-line.cjs')
      .chooseBunnelbyTmJetRoot(view,catalog,
        options.ownRegisteredSixty);
    if(line)return line;
  }
  // Development-only second-own-turn Blockade priority after Bunnelby TM.
  // This can override a payable Burrow when a held Jet establishes the
  // public Exeggutor player-level Supporter lock; no hidden deck access.
  if(options.exeggutorBlockadeContinuation===true){
    const line=require('./agent40-owner-blockade-continuation.cjs')
      .chooseOwnerBlockadeContinuation(view,catalog);
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
  // Development-only original-source Mew attack funding: reserve an actual
  // held Double Colorless Energy for an unfunded Mew V/VMAX. The native Store
  // remains the authority for Energy attachment and resulting turn state.
  if(options.mewDceRecipientRoot===true){
    const mew=require('./agent26-owner-visible-mew-dce-recipient.cjs')
      .chooseMewDceRecipient(view,catalog);
    if(mew)return mew;
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
  // A multi-turn, exact-printing Bench funding plan. Its independent
  // owner-public opportunity is evaluated BEFORE the generic nearest-attack
  // Energy attachment, which otherwise diverts valuable Prism to Active.
  if(options.rank9MegaAbsolFundingRoot===true){
    const staged=require('./agent2-rank9-mega-absol-funding.cjs')
      .chooseMegaAbsolStagedFunding(view,catalog);
    if(staged&&options.activeMegaClawPriorityRoot===true){
      const better=require('./agent10-active-mega-claw-over-bench.cjs')
        .chooseActiveMegaClawOverBenchedMega(view,catalog,staged);
      if(better)return better;
    }
    if(staged)return staged;
  }
  if(options.rank13SourceFirstOwnGrass===true){
    const grass=require('./agent5/rank13-first-own-turn-grass.cjs')
      .chooseSourceFirstOwnGrass(view,catalog);
    if(grass)return grass;
  }
  if(options.firstRegidragoBenchGrass===true){
    const funding=require('./agent49/first-turn-regidrago-bench-funding.cjs')
      .chooseFirstRegidragoBenchGrass(view,catalog);
    if(funding)return funding;
  }
  if(options.retreatFundingBridge===true){
    const bridge=require('./2026-11/agent2-retreat-funding-bridge.cjs')
      .chooseRetreatFundingBridge(view,catalog);
    if(bridge)return bridge;
  }
  if(options.gengarHorrorHouseTempo===true||options.gengarFlexibleV2===true||
     options.gengarResourceProtectedV3===true){
    const choose=options.gengarResourceProtectedV3===true?
      require('./2026-11/agent50-gengar-perfection-resource-guard-v3.cjs')
        .chooseGengarPerfectionProtected:
      options.gengarFlexibleV2===true?
        require('./2026-11/agent50-gengar-flexible-telepath-v2.cjs')
          .chooseGengarFlexibleTelepath:
        require('./2026-11/agent20-gengar-horror-house-tempo.cjs')
        .chooseGengarHorrorHouseTempo;
    const tempo=choose(view,catalog,{
      minOpponentHandCount:options.gengarHorrorHouseMinOpponentHandCount??0
    });
    if(tempo)return tempo;
  }
  if(options.perfectionBenchFunding===true&&own.active&&!r.energyPlayLocked&&
    r.energyPlayedTurn!==view.globalTurn){
    const funding=require('./agent24-early-perfection-recipient.cjs')
      .chooseBenchPerfectionFunding(view,catalog);
    if(funding)return {kind:'attach-basic-energy',...funding};
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
  if(options.seekerResearchRoot===true){
    const research=require('./agent2-owner-vs-seeker-research-root.cjs')
      .chooseOwnerSeekerResearchRoot(view);
    if(research)return research;
  }
  if(options.carmineFirstRoot===true){
    const first=require('./agent48-conservative-first-carmine.cjs')
      .chooseConservativeFirstCarmine(view);
    if(first)return first;
  }
  // Default-off, owner-public funded Clefairy path under printed Skyliner.
  // Native Store remains final for modified Retreat Cost and attack effects.
  if(options.skylinerRondoRetreat===true){
    const rondo=require('./agent6-owner-public-skyliner-rondo-frontier.cjs')
      .chooseOwnerSkylinerRondoRetreat(view,catalog);
    if(rondo)return rondo;
  }
  if(options.genesectFusionDraw===true){
    const draw=require('./agent37-genesect-public-fusion-draw.cjs')
      .chooseGenesectFusionDraw(view,{
        usedThisTurn:options.genesectFusionUsedThisTurn===true,
        publicUsage:options.genesectFusionPublicUsage??null,
        availableNativeSlots:options.genesectFusionNativeAvailableSlots
      });
    if(draw)return draw;
  }
  if(options.crobatDceMewRetreat===true){
    const retreat=require('./agent9-crobat-dce-mew-retreat.cjs')
      .chooseCrobatDceMewRetreat(view,catalog);
    if(retreat)return retreat;
  }
  if(options.dceMewMobilityRoot===true){
    const retreat=require('./agent37-dce-mew-paid-retreat.cjs')
      .chooseDceMewPaidRetreat(view,catalog);
    if(retreat)return retreat;
  }
  if(options.flexiblePaidRetreatRoot===true){
    const flexible=require('./agent10-flexible-paid-retreat-frontier.cjs')
      .chooseFlexiblePaidRetreatToFundedBench(view,catalog);
    if(flexible)return flexible;
  }
  if(options.rank9SpecialPaidRetreat===true){
    const retreat=require('./agent10-rank9-special-paid-retreat.cjs')
      .chooseRank9SpecialPaidRetreat(view,catalog);
    if(retreat)return retreat;
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
  // Exact rank-9 Special Energy + Darkness Weakness Guzma opportunity.
  // Default OFF; native Store must prove both targets and real damage.
  if(options.rank9SpecialFundedGuzma===true){
    const special=require('./agent2-rank9-special-guzma-frontier.cjs')
      .chooseRank9SpecialFundedGuzma(view,catalog);
    if(special)return special;
  }
  // Opt-in tactical recovery of a publicly discarded Guzma using VS Seeker.
  // A nominated nominal KO is recomputed after the actual discard prompt.
  if(options.seekerGuzmaNominalKo===true){
    const follow=require('./agent31/late-seeker-guzma-prize.cjs')
      .chooseLateSeekerGuzmaPrize(view,catalog,{
        ownerSeat:options.seekerGuzmaOwnerSeat??null,
        globalTurn:options.seekerGuzmaGlobalTurn??null
      });
    if(follow)return follow;
  }
  // Experimental nonfinal Prize trade: still only an owner-public nominal KO.
  if(options.prizeTradeGuzma===true){
    const gust=require('./agent31-final-prize-guzma-frontier.cjs')
      .choosePrizeTradeGuzma(view,catalog);
    if(gust)return gust;
  }
  // Final-Prize Guzma tactical line permits multiple Bench targets. It is
  // opt-in and keeps its exact planned native recipient indices.
  if(options.finalPrizeGuzma===true){
    const gust=require('./agent31-final-prize-guzma-frontier.cjs')
      .chooseFinalPrizeGuzma(view,catalog);
    if(gust)return gust;
  }
  // Opt-in owner-visible Guzma line where both native switch targets are
  // forced and an already funded Bench attack nominally takes a Prize.
  // This proposal precedes the ordinary attack-first root decision.
  if(options.forcedGuzmaNominalKo===true){
    const gust=require('./agent31-forced-guzma-ko-frontier.cjs')
      .chooseForcedGuzmaNominalKo(view,catalog);
    if(gust)return gust;
  }
  if(options.sourceDialgaShredT53===true){
    const shred=require('./2026-11/agent26-rank13-source-dialga-shred-frontier.cjs')
      .chooseRank13SourceDialgaShred(view);
    if(shred)return shred;
  }
  if(options.rank13SourceApexRoot===true){
    const apex=require('./agent8-rank13-source-apex-attack-frontier.cjs')
      .choosePublicApexRoot(view,catalog);
    if(apex)return apex;
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
      const adpGxException=options.adpBoostedGxRoot===true&&
        active.printing==='Arceus & Dialga & Palkia GX CEC'&&
        attack.name==='Altered Creation-GX';
      if((attack.gxAttack===true||attack.name.endsWith('-GX')) && (
        (options.printedGxRoot!==true&&!adpGxException) ||
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
      }else if((options.publicContextSpecialEnergy===true||
          options.potentialKoRoot===true)&&
        require('./agent17-public-context-special-energy.cjs')
          .publicSpecialAttackPayable(view,catalog,active,attack)){
        payable.push(attack);
      }
    }
    if(payable.length>0){
      const knownDead=options.knownDeadAttackRoot===true?
        require('./agent1-actor-dead-first-attack-frontier.cjs')
          .chooseKnownDeadLeadingAttack(view,payable):null;
      // Default-off exact-print Raging Bolt breakpoint: Basic Energy on ALL
      // of our public Pokémon may fund nominal Bellowing Thunder damage.
      // This ranks an attack only; native discard prompts and damage effects
      // still require independent paper-valid settlement.
      const ragingBolt=options.ragingBoltNominalKoRoot===true?
        require('./agent50-raging-bolt-nominal-ko.cjs')
          .chooseRagingBoltNominalKo(view,payable,catalog):null;
      const adpGx=options.adpBoostedGxRoot===true?
        require('./agent28-adp-post-retreat-gx-window.cjs')
          .chooseAdpGxFromPayable(view,payable):null;
      const copycatHistoryIntent=options.copycatHistoryRoot===true?
        require('./agent7-copycat-history-root.cjs')
          .chooseMimikyuBurrowCopycat(view):null;
      const copycatAttack=copycatHistoryIntent?
        payable.find(attack=>attack.name===copycatHistoryIntent.attackName):null;
      const chosen=copycatAttack??(adpGx?
        payable.find(attack=>attack.name===adpGx.attackName):
        knownDead?
          payable.find(attack=>attack.name===knownDead.attackName):
        ragingBolt?
          payable.find(attack=>attack.name===ragingBolt.attackName):
        options.potentialKoRoot===true?
          require('./agent49-actor-potential-knockout.cjs')
            .choosePotentialKnockout(view,payable):payable[0]);
      assert.ok(chosen,'Known-dead attack selector must choose a payable attack');
      const first=copycatAttack?copycatHistoryIntent:
        {kind:'attack',attackName:chosen.name};
      if(options.printedScalingBasicKoBeforeAttack===true){
        const better=require('./agent17-printed-scaling-basic-ko.cjs')
          .choosePrintedScalingBasicKoAttachment(view,catalog,first);
        if(better)return better;
      }
      return first;
    }
  }
  // Optional source-only arbitration: an already payable printed attack
  // takes precedence over speculative Quick Ball deck access. Quick Ball
  // remains eligible if no payable attack was selected. The native Store
  // still determines whether the attack and any printed effect settle.
  if(options.quickBallRoot===true&&
     options.quickBallPayableAttackPriority===true){
    const item=require('./agent8-actor-quick-ball-frontier.cjs')
      .chooseQuickBallRootIntent(view);
    if(item)return item;
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
      // Development-only public owner arbitration: conserve a unique Jet
      // pivot for uncharged Benched Mimikyu in the actual Thorns mirror.
      // Continue to later owner priorities when this one offer is rejected.
      const jetReserved=planned&&
        process.env.AGENT12_MIMIKYU_JET_RESERVE_DEV==='true'&&
        require('./2026-11/agent12-thorns-jet-reservation-owner.cjs')
          .shouldReserveThornsJet(view,planned);
      if(planned&&!jetReserved)return planned;
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
  if(options.earlyBeachAfterPass===true){
    const beach=require('./agent7-early-beach-after-pass.cjs')
      .chooseEarlyBeachAfterPass(view,{
        deferForMail:options.earlyBeachDeferForMail===true
      });
    if(beach)return beach;
  }
  if(options.rank7FabaJetBridge===true){
    const follow=require('./2026-11/agent40-faba-jet-owner-bridge.cjs')
      .choosePostJetNestRoot(view);
    if(follow)return follow;
  }
  if(options.jetPostRoboContinuation===true){
    const follow=require('./2026-11/agent33-jet-robo-postroot.cjs')
      .choosePostJetRoboRoot(view);
    if(follow)return follow;
  }
  if(options.jetPostSeekerFabaContinuation===true){
    const follow=require('./2026-11/agent33-jet-vs-faba-postroot.cjs')
      .choosePostJetVsFabaRoot(view);
    if(follow)return follow;
  }
  if(options.paleMoonGXRoot===true){
    const gx=require('./2026-11/agent17-pale-moon-gx-native-frontier.cjs')
      .choosePaleMoonGX(view,catalog);
    if(gx)return gx;
  }
  if(options.earlyForestSealRoot===true){
    const stone=require('./2026-11/agent17-forest-seal-early-root.cjs')
      .chooseForestSealEarly(view,catalog);
    if(stone)return stone;
  }
  if(options.rangerBudewItemLock===true){
    const ranger=require('./agent6-budew-ranger-itemlock.cjs')
      .proposeRangerForBudewItemLock(view,catalog);
    if(ranger)return ranger;
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

const MCTS_ROOT_INTENT_KINDS=new Set([
  'bench-basic','attach-basic-energy','attack','pass','paid-retreat'
]);
const MCTS_PROVIDER_ABSTENTION_REASONS=new Set([
  'outside-applicability-envelope','unsupported-prompt','incomplete-action-frontier',
  'ledger-unverified','budget-exhausted','unsupported-action','low-confidence'
]);
function isMctsRootIntentRecord(value){
  return value!==null&&typeof value==='object'&&!Array.isArray(value)&&
    Object.getPrototypeOf(value)===Object.prototype;
}
function sanitizeMctsRootIntent(intent){
  if(!isMctsRootIntentRecord(intent)||!MCTS_ROOT_INTENT_KINDS.has(intent.kind))return null;
  const source='agent5-information-set-mcts-v1';
  switch(intent.kind){
    case 'bench-basic':
      if(!Number.isSafeInteger(intent.handIndex)||intent.handIndex<0||
         !Number.isSafeInteger(intent.benchIndex)||intent.benchIndex<0)return null;
      return {kind:'bench-basic',handIndex:intent.handIndex,
        benchIndex:intent.benchIndex,source,
        ...(typeof intent.printing==='string'?{printing:intent.printing}:{})};
    case 'attach-basic-energy':
      if(!Number.isSafeInteger(intent.handIndex)||intent.handIndex<0||
         !['active','bench'].includes(intent.slot))return null;
      if(intent.slot==='bench'&&
         (!Number.isSafeInteger(intent.index)||intent.index<0))return null;
      return {kind:'attach-basic-energy',handIndex:intent.handIndex,
        slot:intent.slot,index:intent.slot==='bench'?intent.index:0,source};
    case 'attack':
      if(typeof intent.attackName!=='string'||intent.attackName.length===0)return null;
      return {kind:'attack',attackName:intent.attackName,source};
    case 'pass':
      return {kind:'pass',reason:'mcts-root-pass',source};
    case 'paid-retreat':
      if(!Number.isSafeInteger(intent.benchIndex)||intent.benchIndex<0)return null;
      return {kind:'paid-retreat',benchIndex:intent.benchIndex,source};
    default:return null;
  }
}
function invokeActorRootIntentProvider({
  provider,capabilityFactory,rootIntentActionKey,state,actorSeat,view,catalog,rootOptions
}){
  const abstain=reason=>({status:'abstained',reason});
  if(typeof provider!=='function'||typeof capabilityFactory!=='function')
    return abstain('provider-or-capability-unavailable');
  if(actorSeat!==0&&actorSeat!==1)return abstain('invalid-actor-seat');
  const budget=rootOptions?.rootIntentBudget;
  if(!isMctsRootIntentRecord(budget)||
     !Number.isSafeInteger(budget.iterations)||budget.iterations<1||
     !Number.isSafeInteger(budget.maxPlies)||budget.maxPlies<1||
     !Number.isFinite(budget.maxDecisionMs)||budget.maxDecisionMs<=0||
     !Number.isSafeInteger(budget.seed)||budget.seed<0)
    return abstain('fixed-search-budget-unbound-or-invalid');
  const frozenBudget=Object.freeze({
    iterations:budget.iterations,maxPlies:budget.maxPlies,
    maxDecisionMs:budget.maxDecisionMs,seed:budget.seed
  });
  let searchCapability;
  try{
    searchCapability=capabilityFactory(Object.freeze({
      state,actorSeat,view,catalog,budget:frozenBudget
    }));
  }catch{return abstain('search-capability-construction-failed');}
  if(typeof searchCapability!=='function')
    return abstain('search-capability-not-callable');
  let searchCalls=0,searchResult=null;
  const runSearch=()=>{
    if(searchCalls!==0)throw new Error('root-search-capability-is-one-shot');
    searchCalls++;
    searchResult=searchCapability();
    return searchResult;
  };
  let decision;
  try{
    decision=provider(Object.freeze({
      actorSeat,view,catalog,
      rootOptions:Object.freeze({...rootOptions}),
      budget:frozenBudget,runSearch
    }));
  }catch{return abstain('root-intent-provider-failed');}
  if(decision&&typeof decision.then==='function')
    return abstain('async-provider-not-supported');
  if(decision?.status==='abstained')
    return abstain(MCTS_PROVIDER_ABSTENTION_REASONS.has(decision.reason)?
      decision.reason:'provider-abstained');
  if(decision?.status!=='selected')return abstain('invalid-provider-status');
  if(searchCalls!==1||searchResult?.status!=='selected')
    return abstain('selected-without-one-successful-search');
  const evidence=searchResult.audit;
  if(!isMctsRootIntentRecord(evidence)||
     evidence.frontierComplete!==true||
     evidence.bothSeatKnowledgeLedgersVerified!==true||
     evidence.ownerLedgerInInformationSetKey!==true||
     evidence.promptResolutionActorScoped!==true||
     typeof evidence.applicabilityEnvelopeId!=='string'||
     !/^[a-z0-9][a-z0-9._-]{0,63}$/i.test(evidence.applicabilityEnvelopeId))
    return abstain('native-search-certification-incomplete');
  // A selected intent is accepted only when the core's own monotonic-clock
  // receipt exactly matches the immutable budget handed to the capability.
  // An outer wall-clock check by a provider cannot substitute for this proof.
  const budgetMatches=
    evidence.iterations===frozenBudget.iterations&&
    evidence.completedIterations===frozenBudget.iterations&&
    evidence.maxPlies===frozenBudget.maxPlies&&
    evidence.maxDecisionMs===frozenBudget.maxDecisionMs&&
    evidence.seed===frozenBudget.seed&&
    evidence.timeoutStatus==='completed'&&
    Number.isFinite(evidence.elapsedMs)&&evidence.elapsedMs>=0&&
    evidence.elapsedMs<frozenBudget.maxDecisionMs;
  if(!budgetMatches)return abstain('native-search-budget-mismatch');
  const intent=sanitizeMctsRootIntent(searchResult.intent);
  if(!intent)return abstain('native-search-intent-outside-bounded-vocabulary');
  if(evidence.applicabilityEnvelopeId==='flittle-basic-psychic-v1'&&
     !['attach-basic-energy','attack','pass'].includes(intent.kind))
    return abstain('intent-outside-flittle-envelope');
  const providerIntent=sanitizeMctsRootIntent(decision.intent);
  if(!providerIntent||JSON.stringify(providerIntent)!==JSON.stringify(intent))
    return abstain('native-search-intent-binding-mismatch');
  const selectedActionKey=evidence.selectedActionKey;
  if(typeof selectedActionKey!=='string'||selectedActionKey.length===0)
    return abstain('native-search-action-key-unbound');
  if(typeof rootIntentActionKey!=='function')
    return abstain('native-search-action-key-binding-unavailable');
  let expectedActionKey;
  try{
    expectedActionKey=rootIntentActionKey(intent,Object.freeze({actorSeat,view,catalog}));
  }catch{return abstain('native-search-action-key-binding-failed');}
  if(typeof expectedActionKey!=='string'||expectedActionKey.length===0||
     expectedActionKey!==selectedActionKey)
    return abstain('native-search-action-key-intent-mismatch');
  return {status:'selected',intent,searchAudit:{
    frontierComplete:true,bothSeatKnowledgeLedgersVerified:true,
    ownerLedgerInInformationSetKey:true,promptResolutionActorScoped:true,
    applicabilityEnvelopeId:evidence.applicabilityEnvelopeId,
    iterations:evidence.iterations,
    completedIterations:evidence.completedIterations,
    maxPlies:evidence.maxPlies,
    maxDecisionMs:evidence.maxDecisionMs,
    seed:evidence.seed,
    elapsedMs:evidence.elapsedMs,
    timeoutStatus:evidence.timeoutStatus,
    cPuct:Number.isFinite(evidence.cPuct)?evidence.cPuct:null,
    maxActionTransitions:Number.isSafeInteger(evidence.maxActionTransitions)?
      evidence.maxActionTransitions:null,
    seatActionTransitions:Array.isArray(evidence.seatActionTransitions)?
      evidence.seatActionTransitions.slice(0,2):null,
    rolloutPaths:Array.isArray(evidence.rolloutPaths)?
      evidence.rolloutPaths.slice(0,32):null,
    selectedActionKey:typeof evidence.selectedActionKey==='string'?
      evidence.selectedActionKey:null,
    rootActionCount:Number.isSafeInteger(evidence.rootActionCount)?
      evidence.rootActionCount:null
  }};
}

function withActorOnlyRootPolicy(run,deps={}){
  assert.equal(typeof run,'function');
  // Optional physical-seat scope permits two independently configured
  // role policies to be composed around one native match. Null preserves the
  // historical two-seat behavior.
  const policyOwnerSeat=deps.policyOwnerSeat??null;
  assert.ok(policyOwnerSeat===null||policyOwnerSeat===0||policyOwnerSeat===1,
    'policyOwnerSeat must be physical seat 0, seat 1, or null');
  const hasRootIntentProvider=deps.rootIntentProvider!==undefined||
    deps.createRootSearchCapability!==undefined||
    deps.rootIntentActionKey!==undefined;
  if(hasRootIntentProvider){
    assert.equal(typeof deps.rootIntentProvider,'function',
      'rootIntentProvider must be a protected runtime callback');
    assert.equal(typeof deps.createRootSearchCapability,'function',
      'createRootSearchCapability must be a protected runtime callback');
    assert.equal(typeof deps.rootIntentActionKey,'function',
      'rootIntentActionKey must be a trusted adapter mapping');
  }
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require('../../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/play-card-action');
  const {AttackAction,PassTurnAction,RetreatAction,UseAbilityAction,
    UseStadiumAction}=deps.gameActions??
    require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions');
  const getCatalog=deps.getCatalog??(()=>{
    const {CardManager}=require('../../vendor/twinleaf/ptcg-server/output/game/cards/card-manager');
    const {PokemonCard}=require('../../vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-card');
    const {EnergyCard}=require('../../vendor/twinleaf/ptcg-server/output/game/store/card/energy-card');
    const {TrainerCard}=require('../../vendor/twinleaf/ptcg-server/output/game/store/card/trainer-card');
    const {Stage,EnergyType,CardType,TrainerType,SpecialCondition}=
      require('../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');
    const {PowerType}=require('../../vendor/twinleaf/ptcg-server/output/game/store/card/pokemon-types');
    return buildActorCardCatalog(CardManager.getInstance().getAllCards(),{
      PokemonCard,EnergyCard,TrainerCard,Stage,EnergyType,CardType,TrainerType,
      PowerType,SpecialCondition
    });
  });
  const observe=deps.observe??actorObservation;
  const Store=deps.Store??require('../../vendor/twinleaf/ptcg-server/output/game/store/store').Store;
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeDispatch?.value,'function');
  const original=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  const typedDecisions=new WeakMap();
  const copycatHistoryByAction=new WeakMap();
  const nativeTrainerFallbackActions=new WeakMap();
  const typedSeekerReplies=new WeakMap();
  const ownerSeekerPending=new Map();
  const ownerArvenPending=new Map();
  const typedEarlyCompressorReplies=new WeakMap();
  const ownerEarlyCompressorPending=new Map();
  const typedRank13CrispinReplies=new WeakMap();
  const ownerRank13CrispinPending=new Map();
  const typedEriReplies=new WeakMap();
  const ownerEriPending=new Map();
  const typedRank7BridgeReplies=new WeakMap();
  const ownerRank7BridgePending=new Map();
  const pendingFarewellBySeat=new Map();
  const pendingGenesectBySeat=new Map();
  // A once-per-turn conservative cap for the proposed native Genesect Ability
  // across all copies, keyed by the acting physical owner seat only.
  const genesectDrawUsedTurnBySeat=new Map();
  const engineGamePhase=()=>deps.GamePhase??
    require('../../vendor/twinleaf/ptcg-server/output/game/store/state/state').GamePhase;
  // Test-only seam for an already constructed native, physically complete
  // staged Store. Real games discover their Store from AddPlayerAction below.
  // This explicit dependency is never inferred from cloned or speculative
  // states, and does not certify a staged board as an actual game.
  const stagedStore=deps.stagedStore??null;
  if(stagedStore!==null){
    assert.ok(stagedStore instanceof Store,
      'Explicit staged actor Store must use the pinned native Store class');
    assert.equal(stagedStore.state?.players?.length,2,
      'Staged actor Store must retain two physically distinct owners');
  }
  let nativeStore=stagedStore,catalog=null,trainerCatalog=null,actualGamesSeen=0;
  const copycatHistoryByStore=new WeakMap();
  const copycatHistoryTrackers=[];
  const getNativeTrainerCatalog=deps.getNativeTrainerCatalog??(()=>{
    const {CardManager}=require('../../vendor/twinleaf/ptcg-server/output/game/cards/card-manager');
    const {TrainerCard}=require('../../vendor/twinleaf/ptcg-server/output/game/store/card/trainer-card');
    const {TrainerType}=require('../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');
    return require('./agent5-generic-owner-trainer-opportunity.cjs')
      .trainerPrintCatalog(CardManager.getInstance().getAllCards(),
        {TrainerCard,TrainerType});
  });
  assert.ok(deps.mimikyuTimelessMaxGeistRetreatRoot!==true||
    (deps.mimikyuApexFundedPromotion===true&&
     (deps.mimikyuTimelessMaxGeistRetreatRootOwnerSeat===0||
      deps.mimikyuTimelessMaxGeistRetreatRootOwnerSeat===1)),
    'Post-Timeless Max Geist root requires Mimikyu Apex history and a candidate seat');
  const audit={
    version:VERSION,origin:'detached-actor-observation',
    policyOwnerSeat,nonOwnerSeatBypassCalls:0,
    rootIntentProvider:{
      configured:hasRootIntentProvider,attempts:0,selected:0,abstained:0,
      skipped:0,abstentionReasons:{},lastIntentKind:null,
      lastApplicabilityEnvelopeId:null,lastSearchAudit:null
    },
    energyFrontierOptIn:deps.energyFrontier??
      (process.env.AGENT10_BASIC_ENERGY_FRONTIER_DEV==='true'),
    energyRecipientFrontierOptIn:deps.energyRecipientFrontier??
      (process.env.AGENT44_ACTOR_ENERGY_RECIPIENT_DEV==='true'),
    mobilityAwareRecipientOptIn:deps.mobilityAwareRecipient??
      (process.env.AGENT2_MOBILITY_ENERGY_RECIPIENT_DEV==='true'),
    gengarHorrorHouseTempoOptIn:deps.gengarHorrorHouseTempo===true,
    gengarFlexibleV2OptIn:deps.gengarFlexibleV2===true,
    gengarResourceProtectedV3OptIn:deps.gengarResourceProtectedV3===true,
    gengarHorrorHouseMinOpponentHandCount:
      deps.gengarHorrorHouseMinOpponentHandCount??0,
    perfectionRootOptIn:deps.perfectionRoot??
      (process.env.AGENT30_PERFECTION_ROOT_DEV==='true'),
    perfectionBenchFundingOptIn:deps.perfectionBenchFunding===true,
    perfectionTransitionRootOptIn:deps.perfectionTransitionRoot??
      (process.env.AGENT35_PERFECTION_TRANSITION_ROOT_DEV==='true'),
    dceMewMobilityRootOptIn:deps.dceMewMobilityRoot===true,
    dceMewMobilityRootOwnerSeat:deps.dceMewMobilityRootOwnerSeat??null,
    mewDceRecipientRootOptIn:deps.mewDceRecipientRoot===true,
    mewDceRecipientRootOwnerSeat:deps.mewDceRecipientRootOwnerSeat??null,
    mewGenesectBenchFirstOptIn:deps.mewGenesectBenchFirst===true,
    mewGenesectBenchFirstOwnerSeat:deps.mewGenesectBenchFirstOwnerSeat??null,
    crobatDceMewRetreatOptIn:deps.crobatDceMewRetreat===true,
    crobatDceMewRetreatOwnerSeat:deps.crobatDceMewRetreatOwnerSeat??null,
    genesectFusionDrawOptIn:deps.genesectFusionDraw===true,
    genesectFusionDrawOwnerSeat:deps.genesectFusionDrawOwnerSeat??null,
    genesectPerCopyPublicUsageOptIn:deps.genesectPerCopyPublicUsage===true,
    templeDdeDenialOptIn:deps.templeDdeDenial===true,
    arvenHoodSearchOptIn:deps.arvenHoodSearch===true,
    arvenHoodSearchRootSelected:0,
    arvenHoodSearchPromptsSelected:0,
    templeDdeDenialSelected:0,
    underworldDoorRootOptIn:deps.underworldDoorRoot===true,
    maxGeistManualRecoveryOptIn:deps.maxGeistManualRecovery===true,
    pathUnderworldStadiumCounterOptIn:deps.pathUnderworldStadiumCounter===true,
    mimikyuApexFundedPromotionOptIn:deps.mimikyuApexFundedPromotion===true,
    mimikyuTimelessMaxGeistRetreatRootOptIn:
      deps.mimikyuTimelessMaxGeistRetreatRoot===true,
    mimikyuTimelessMaxGeistRetreatRootOwnerSeat:
      deps.mimikyuTimelessMaxGeistRetreatRootOwnerSeat??null,
    mimikyuTimelessMaxGeistRetreatRootSelected:0,
    mimikyuPostTimelessPowerBeamPromptSelected:0,
    mimikyuApexFundedPromotionSelected:0,
    mimikyuApexCopycatSelected:0,
    mimikyuApexTimelessPromptSelected:0,
    fundedVmaxFloatStoneRootOptIn:deps.fundedVmaxFloatStoneRoot===true,
    genericFundedFloatStoneRootOptIn:deps.genericFundedFloatStoneRoot===true,
    genericTacticalSwitchRootOptIn:deps.genericTacticalSwitchRoot===true,
    opponentBlockSwitchRootOptIn:deps.opponentBlockSwitchRoot===true,
    zeroEnergyStrandFloatStoneRootOptIn:
      deps.zeroEnergyStrandFloatStoneRoot===true,
    zeroEnergyStrandFloatStoneTargetTurn:
      deps.zeroEnergyStrandFloatStoneTargetTurn??null,
    zeroEnergyStrandFloatStoneOwnerSeat:
      deps.zeroEnergyStrandFloatStoneOwnerSeat??null,
    zeroEnergyStrandFloatStoneRootSelected:0,
    fundedVmaxFloatStoneRootSelected:0,
    twoUnitPaidRetreatRootOptIn:deps.twoUnitPaidRetreatRoot===true,
    twoUnitPaidRetreatTargetTurn:deps.twoUnitPaidRetreatTargetTurn??null,
    twoUnitPaidRetreatRootSelected:0,
    twoUnitPaidRetreatRootV2OptIn:deps.twoUnitPaidRetreatRootV2===true,
    twoUnitPaidRetreatTargetTurnV2:deps.twoUnitPaidRetreatTargetTurnV2??null,
    twoUnitPaidRetreatRootV2Selected:0,
    twoUnitPaidRetreatRootV2SelectedBySeat:[0,0],
    twoUnitPaidRetreatRootV2SelectedUnknownSeat:0,
    twoUnitPaidRetreatV2FreeToolSelected:0,
    genericFundedFloatStoneAuditOptIn:deps.genericFundedFloatStoneAudit===true,
    genericFundedFloatStoneAudit:{
      ownerRoots:0,ownerHeldToolRoots:0,ownerAttachedToolRoots:0,
      partiallyFundedActiveRoots:0,currentlyEligibleRoots:0,
      eligibleBySeat:[0,0],declinedWhileToolHeld:0,
      selectedAsNativeIntent:0,eligibleSamples:[],
      heldPayableTargetSamples:[],
      heldGateCounts:Object.fromEntries(require(
        './agent14-floatstone-held-owner-gates.cjs').FIELDS.map(x=>[x,0]))
    },
    underworldActiveFundingPriorityOptIn:
      deps.underworldActiveFundingPriority===true,
    underworldActiveFundingThresholdV2OptIn:
      deps.underworldActiveFundingThresholdV2===true,
    underworldActiveFundingThresholdV2Selected:0,
    underworldActiveFundingMirrorVetoOptIn:
      deps.underworldActiveFundingMirrorVeto===true,
    underworldActiveFundingMinTurn:
      deps.underworldActiveFundingMinTurn??null,
    underworldActiveFundingPrioritySelected:0,
    underworldDoorRootSelected:0,
    pathUnderworldStadiumCounterSelected:0,
    genesectFusionNativeAccepted:0,
    genesectFusionNativeConfirmed:0,
    genesectFusionReceipts:[],
    flexiblePaidRetreatRootOptIn:deps.flexiblePaidRetreatRoot===true,
    skylinerFundedBenchRetreatRootOptIn:deps.skylinerFundedBenchRetreatRoot===true,
    skylinerFundedBenchRetreatSelected:0,
    rank9SpecialPaidRetreatOptIn:deps.rank9SpecialPaidRetreat===true,
    rank9SpecialPaidRetreatOwnerSeat:deps.rank9SpecialPaidRetreatOwnerSeat??null,
    paidRetreatRootOptIn:deps.paidRetreatRoot??
      (process.env.AGENT6_PAID_RETREAT_ROOT_DEV==='true'),
    skylinerRondoRetreatOptIn:deps.skylinerRondoRetreat??
      (process.env.AGENT6_SKYLINER_RONDO_ROOT_DEV==='true'),
    skylinerRondoRetreatOwnerSeat:deps.skylinerRondoRetreatOwnerSeat??
      (process.env.AGENT6_SKYLINER_RONDO_OWNER_SEAT==='0'?0:
        process.env.AGENT6_SKYLINER_RONDO_OWNER_SEAT==='1'?1:null),
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
    earlyBeachAfterPassOptIn:deps.earlyBeachAfterPass??
      (process.env.AGENT7_EARLY_BEACH_DEV==='true'),
    earlyBeachDeferForMailOptIn:deps.earlyBeachDeferForMail??
      (process.env.AGENT7_EARLY_BEACH_DEFER_MAIL_DEV==='true'),
    playersCeremonyLastChanceOptIn:deps.playersCeremonyLastChance===true,
    skyFieldBenchExpansionOptIn:deps.skyFieldBenchExpansion===true,
    pathToPeakOpposingAbilityOptIn:deps.pathToPeakOpposingAbility===true,
    pathToPeakPublicSpentFusionOptIn:deps.pathToPeakPublicSpentFusion===true,
    pathSafeSkyFieldReplacementOptIn:deps.pathSafeSkyFieldReplacement===true,
    jetPostRoboContinuationOptIn:deps.jetPostRoboContinuation===true,
    jetPostSeekerFabaContinuationOptIn:deps.jetPostSeekerFabaContinuation===true,
    jetPostSeekerFabaPromptsProposed:0,
    jetPostSeekerFabaPromptsAccepted:0,
    jetBenchSwitchRootOptIn:deps.jetBenchSwitchRoot??
      (process.env.AGENT40_JET_BENCH_SWITCH_DEV==='true'),
    rank7FabaJetBridgeOptIn:deps.rank7FabaJetBridge===true,
    rank7FabaJetBridgePromptsSelected:0,
    rank7FabaJetBridgePromptsAccepted:0,
    bunnelbyTmJetRootOptIn:deps.bunnelbyTmJetRoot??
      (process.env.AGENT40_BUNNELBY_TM_JET_DEV==='true'),
    busLockPositionRootOptIn:deps.busLockPositionRoot??
      (process.env.AGENT40_BUS_POSITION_DEV==='true'),
    raichuKoBreakpointBeforeAttackOptIn:deps.raichuKoBreakpointBeforeAttack??
      (process.env.AGENT10_RAICHU_KO_BREAKPOINT_DEV==='true'),
    printedScalingBasicKoBeforeAttackOptIn:deps.printedScalingBasicKoBeforeAttack===true,
    specialEnergyRootOwnerSeat:deps.specialEnergyRootOwnerSeat??null,
    contestedEnergyRootOptIn:deps.contestedEnergyRoot===true,
    paleMoonGXRootOptIn:deps.paleMoonGXRoot===true,
    paleMoonGXRootOwnerSeat:deps.paleMoonGXRootOwnerSeat??null,
    earlyForestSealRootOptIn:deps.earlyForestSealRoot===true,
    earlyForestSealRootOwnerSeat:deps.earlyForestSealRootOwnerSeat??null,
    naturalEvolutionRootOptIn:deps.naturalEvolutionRoot??
      (process.env.AGENT1_NATURAL_EVOLUTION_ROOT_DEV==='true'),
    naturalEvolutionRootOwnerSeat:deps.naturalEvolutionRootOwnerSeat??null,
    garbodorResponseOwnerSeat:deps.garbodorResponseOwnerSeat??null,
    garbotoxinToolRootOptIn:deps.garbotoxinToolRoot===true,
    garbotoxinToolRootDeferForStarAlchemy:
      deps.garbotoxinToolRootDeferForStarAlchemy===true,
    garbotoxinToolRootSelected:0,
    garbotoxinFloatStoneRootSelected:0,
    garbotoxinFssFallbackRootSelected:0,
    garbotoxinToolRootDeferredForStarAlchemy:0,
    garbotoxinToolRootNoOpponentAbility:0,
    garbotoxinToolRootNoGarbodorTarget:0,
    garbotoxinToolRootNoToolCandidate:0,
    garbotoxinToolRootStatusSamples:[],
    garbotoxinToolRootStatusSamplesOmitted:0,
    rank17ElectrodeBombCensusOptIn:deps.rank17ElectrodeBombCensus===true,
    dittoStage1RootOptIn:deps.dittoStage1Root===true,
    farewellLetterRootOptIn:deps.farewellLetterRoot===true,
    mysteriousTreasureRootOptIn:deps.mysteriousTreasureRoot??
      (process.env.AGENT49_MYSTERIOUS_TREASURE_ROOT_DEV==='true'),
    mysteriousTreasureEarlyRegisteredOptIn:
      deps.mysteriousTreasureEarlyRegistered===true,
    mysteriousTreasureMuscleBandPaymentOptIn:
      deps.mysteriousTreasureMuscleBandPayment===true,
    firstRegidragoBenchGrassOptIn:
      deps.firstRegidragoBenchGrass===true,
    rank13SourceFirstOwnGrassOptIn:
      deps.rank13SourceFirstOwnGrass===true,
    rank13SourceFirstOwnGrassOwnerSeat:
      deps.rank13SourceFirstOwnGrassOwnerSeat??null,
    retreatFundingBridgeOptIn:deps.retreatFundingBridge===true,
    retreatFundingBridgeAttachmentsSelected:0,
    retreatFundingBridgeRetreatsSelected:0,
    firstCrispinSeekerRecoveryOptIn:
      deps.firstCrispinSeekerRecovery===true,
    earlyRegidragoCompressorOptIn:
      deps.earlyRegidragoCompressor===true,
    earlyRegidragoCompressorOwnerSeat:
      deps.earlyRegidragoCompressorOwnerSeat??null,
    earlyRegidragoCompressorAllowFirstOwnTurnTwo:
      deps.earlyRegidragoCompressorAllowFirstOwnTurnTwo===true,
    earlyRegidragoCompressorPromptsProposed:0,
    earlyRegidragoCompressorPromptsAccepted:0,
    earlyRegidragoCompressorDonorsMoved:0,
    rank13CrispinRootOptIn:deps.rank13CrispinRoot===true,
    rank13CrispinRootOwnerSeat:deps.rank13CrispinRootOwnerSeat??null,
    rank13CrispinNativeSearchAccepted:0,
    rank13CrispinNativeBenchAttachmentsAccepted:0,
    quickBallRootOptIn:deps.quickBallRoot??
      (process.env.AGENT8_ACTOR_QUICK_BALL_DEV==='true'),
    quickBallRootOwnerSeat:deps.quickBallRootOwnerSeat??null,
    mewUltraBallEvolutionRootOptIn:deps.mewUltraBallEvolutionRoot===true,
    mewUltraBallEvolutionRootOwnerSeat:
      deps.mewUltraBallEvolutionRootOwnerSeat??null,
    quickBallPayableAttackPriorityOptIn:
      deps.quickBallPayableAttackPriority===true,
    regidragoDonorQuickBallRootOptIn:deps.regidragoDonorQuickBallRoot===true,
    rank13DdeEnergyRootOptIn:deps.rank13DdeEnergyRoot===true,
    rank13DdeEnergyOwnerSeat:deps.rank13DdeEnergyOwnerSeat??null,
    rank13SourceApexRootOptIn:deps.rank13SourceApexRoot===true,
    rank13SourceApexRootOwnerSeat:deps.rank13SourceApexRootOwnerSeat??null,
    regidragoDonorQuickBallOwnerSeat:
      deps.regidragoDonorQuickBallOwnerSeat??null,
    printedGxRootOptIn:deps.printedGxRoot??
      (process.env.AGENT25_PRINTED_GX_ROOT_DEV==='true'),
    adpBoostedGxRootOptIn:deps.adpBoostedGxRoot??
      (process.env.AGENT28_ADP_GX_ROOT_DEV==='true'),
    printedFirstTurnAttackRootOptIn:deps.printedFirstTurnAttackRoot??
      (process.env.AGENT37_FIRSTTURN_ATTACK_ROOT_DEV==='true'),
    potentialKoRootOptIn:deps.potentialKoRoot??
      (process.env.AGENT49_POTENTIAL_KO_ROOT_DEV==='true'),
    potentialKoRootOwnerSeat:deps.potentialKoRootOwnerSeat??null,
    knownDeadAttackRootOptIn:deps.knownDeadAttackRoot??
      (process.env.AGENT7_KNOWN_DEAD_ATTACK_ROOT_DEV==='true'),
    knownDeadAttackRootOwnerSeat:deps.knownDeadAttackRootOwnerSeat??null,
    ragingBoltNominalKoRootOptIn:deps.ragingBoltNominalKoRoot===true,
    powerglassRootOptIn:deps.powerglassRoot??
      (process.env.AGENT41_ACTOR_POWERGLASS_ROOT_DEV==='true'),
    floatStoneMobilityOptIn:deps.floatStoneMobility===true,
    floatStoneMobilityOwnerSeat:deps.floatStoneMobilityOwnerSeat??null,
    heldGuzmaMobilityOptIn:deps.heldGuzmaMobility??
      (process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV==='true'),
    rank9SpecialFundedGuzmaOptIn:deps.rank9SpecialFundedGuzma===true,
    rank9MegaAbsolFundingOptIn:deps.rank9MegaAbsolFundingRoot===true,
    activeMegaClawPriorityOptIn:deps.activeMegaClawPriorityRoot===true,
    forcedGuzmaNominalKoOptIn:deps.forcedGuzmaNominalKo===true||
      process.env.AGENT31_GUZMA_FORCED_KO_DEV==='true',
    finalPrizeGuzmaOptIn:deps.finalPrizeGuzma===true||
      process.env.AGENT31_GUZMA_FINAL_PRIZE_DEV==='true',
    prizeTradeGuzmaOptIn:deps.prizeTradeGuzma===true||
      process.env.AGENT31_GUZMA_PRIZE_TRADE_DEV==='true',
    seekerGuzmaNominalKoOptIn:deps.seekerGuzmaNominalKo===true,
    seekerGuzmaOwnerSeat:deps.seekerGuzmaOwnerSeat??null,
    seekerGuzmaGlobalTurn:deps.seekerGuzmaGlobalTurn??null,
    seekerGuzmaPromptsProposed:0,
    seekerGuzmaPromptsAccepted:0,
    lowHandLillieRootOptIn:deps.lowHandLillieRoot??
      (process.env.AGENT25_LOWHAND_LILLIE_DEV==='true'),
    teamFlareGruntDenialRootOptIn:deps.teamFlareGruntDenialRoot??
      (process.env.AGENT1_TEAM_FLARE_GRUNT_DEV==='true'),
    carmineFirstRootOptIn:deps.carmineFirstRoot??
      (process.env.AGENT48_CARMINE_FIRST_ROOT_DEV==='true'),
    seekerLillieRootOptIn:deps.seekerLillieRoot??
      (process.env.AGENT48_VS_SEEKER_LILLIE_DEV==='true'),
    seekerResearchRootOptIn:deps.seekerResearchRoot===true,
    seekerLilliePromptsProposed:0,
    seekerLilliePromptsAccepted:0,
    seekerResearchPromptsProposed:0,
    seekerResearchPromptsAccepted:0,
    seekerCrispinPromptsProposed:0,
    seekerCrispinPromptsAccepted:0,
    eriRevealRootOptIn:deps.eriRevealRoot??
      (process.env.AGENT50_ERI_REVEAL_DEV==='true'),
    eriPromptsProposed:0,eriPromptsAccepted:0,eriItemsDiscarded:0,
    rangerPaidGxResponseOptIn:deps.rangerPaidGxResponse===true,
    rangerBudewItemLockOptIn:deps.rangerBudewItemLock===true,
    rangerBudewItemLockVersion:deps.rangerBudewItemLock===true?
      require('./agent6-budew-ranger-itemlock.cjs').VERSION:null,
    conservativeShuffleBeforeAttackOptIn:deps.conservativeShuffleBeforeAttack??
      (process.env.AGENT2_SHUFFLE_PREATTACK_DEV==='true'),
    lowHandLillieCensusOptIn:deps.lowHandLillieCensus??
      (process.env.AGENT25_LOWHAND_LILLIE_CENSUS_DEV==='true'),
    ownerArbitrationCensusOptIn:deps.ownerArbitrationCensus??
      (process.env.AGENT16_OWNER_ARBITRATION_CENSUS_DEV==='true'),
    ownerArbitration:require('./agent16-owner-priority-contention.cjs')
      .newOwnerContentionAudit(),
    sameRootProposalChoiceOptIn:deps.sameRootProposalChoice===true,
    rondoPsychicBenchStageOptIn:deps.rondoPsychicBenchStage??
      (process.env.AGENT7_RONDO_PSYCHIC_BENCH_DEV==='true'),
    rondoPsychicBenchStageOwnerSeat:deps.rondoPsychicBenchStageOwnerSeat??
      (process.env.AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT==='0'?0:
        process.env.AGENT7_RONDO_PSYCHIC_BENCH_OWNER_SEAT==='1'?1:null),
    rondoProtectActiveLatiasEonBladeOptIn:
      (process.env.AGENT7_RONDO_PSYCHIC_PROTECT_LATIAS_DEV==='true'),
    nativeCoheldDenialCanPlayOptIn:deps.nativeCoheldDenialCanPlay===true,
    nativeCoheldDenialCanPlayRoots:0,
    nativeCoheldDenialBothPlayableRoots:0,
    nativeCoheldDenialCanPlayWitnesses:[],
    nativeCoheldDenialFirstPositiveWitness:null,
    nativeCoheldDenialFirstNegativeWitness:null,
    nativeCoheldDenialFirstErrorWitness:null,
    nativeCoheldDenialNativeCanPlayErrorRoots:0,
    nativeCoheldDenialExamplesTruncated:false,
    nativeCoheldDenialPositiveExamplesTruncated:false,
    nativeCoheldDenialErrorExamplesTruncated:false,
    nativeCoheldDenialPositiveWitnessMissing:false,
    sameRootChoiceApplyOptIn:deps.sameRootChoiceApply===true,
    nativeToolAttachRootOptIn:deps.nativeToolAttachRoot??
      (process.env.AGENT41_NATIVE_TOOL_ATTACH_DEV==='true'),
    nativePlumeriaChoiceOptIn:deps.nativePlumeriaChoice===true,
    nativePlumeriaPaymentConservationOptIn:
      deps.nativePlumeriaPaymentConservation===true||
      process.env.AGENT38_NATIVE_PLUMERIA_PAYMENT_CONSERVATION_DEV==='true',
    nativeZeroCostDenialChoiceOptIn:deps.nativeZeroCostDenialChoice===true,
    losslessNativeRootJoinOptIn:deps.losslessNativeRootJoin===true,
    registeredToolEnergyCeilingOptIn:deps.registeredToolEnergyCeiling===true,
    sameRootPassAttackProbeGlobalTurn:deps.sameRootPassAttackProbeGlobalTurn??null,
    sameRootPublicNoBenchTerminalOptIn:deps.publicNoBenchTerminalAttack===true,
    sameRootPositiveAttackOverPassOptIn:deps.positiveAttackOverPass===true,
    sameRootThornsEmptyBenchOptIn:deps.thornsEmptyBenchVoltPreference===true,
    sameRootProbeAllOptIn:deps.sameRootProbeAll===true,
    sameRootPublicEventReceiptOptIn:deps.sameRootPublicEventReceipt===true,
    copycatHistoryRootOptIn:deps.mimikyuApexFundedPromotion===true||
      (deps.copycatHistoryRoot??
        (process.env.AGENT7_COPYCAT_HISTORY_ROOT_DEV==='true')), 
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
    strandedMarnieRootOwnerSeat:deps.strandedMarnieRootOwnerSeat??null,
    sourceDialgaShredT53OptIn:deps.sourceDialgaShredT53===true,
    sourceDialgaShredT53OwnerSeat:deps.sourceDialgaShredT53OwnerSeat??null,
    lowHandLillieRootCensus:{
      ownerRoots:0,heldRoots:0,eligibleRoots:0,
      reasonCounts:{},heldReasonCounts:{},
      bySeat:{0:{ownerRoots:0,heldRoots:0,eligibleRoots:0},
        1:{ownerRoots:0,heldRoots:0,eligibleRoots:0}},
      heldSamples:[],sampleLimit:40
    },
    selectedRootDecisions:0,acceptedActorRoots:0,rejectedActorRoots:0,
    regidragoDonorQuickBallIntentCount:0,
    regidragoDonorQuickBallNativeAccepted:0,
    regidragoDonorQuickBallNativeRejected:0,
    typedIntentCounts:{},nativeRootAcceptances:[],actualGamesSeen:0,
    ...(deps.losslessNativeRootJoin===true?{
      nativeRootJoinReceipts:[],nativeRootJoinTruncated:false}:{}),
    publicTransitionWitnesses:0,publicTransitionChanges:0,
    nativePhysicalConfirmed:0,nativePhysicalUnconfirmed:0,
    nativePhysicalPending:0,
    nativePhysicalConfirmedByIntent:{},nativePhysicalUnconfirmedByIntent:{},
    nativeAttackNeedsDeclaration:0,
    observationSchema:'agent2-public-native-dispatch-diff-v1',
    unsupportedPromptTypes:{},
    unsupportedPromptFallbacks:0,nonOwnerNativeDelegations:0,
    nonLiveSpeculativeFallbacks:0,nonTurnPhaseFallbacks:0,
    ownerRootIntents:[],competitiveGameQualified:false,
    note:'Only roots are actor-only. Every native prompt fallback makes the full game unqualified.'
  };
  if(audit.mimikyuTimelessMaxGeistRetreatRootOptIn){
    audit.version+='+'+POST_TIMELESS_MAX_GEIST_VERSION;
    audit.version+='+'+POST_TIMELESS_POWERBEAM_PROMPT_VERSION;
  }
  if(audit.copycatHistoryRootOptIn){
    audit.version+='+'+require('./agent7-copycat-history-root.cjs').VERSION;
    audit.copycatHistoryRoot={
      trackerStores:0,ownerRoots:0,unavailableRoots:0,knownEmptyRoots:0,
      singleAttackRoots:0,multiattackRoots:0,singleBurrowRoots:0,
      choiceSetRoots:0,barragePairRoots:0,selected:0,historyOverrides:0,
      samples:[]
    };
  }else delete audit.copycatHistoryRootOptIn;
  if(deps.ownerFallbackDiagnosticView===true){
    assert.equal(deps.nativeOwnerTrainerFallback,true,
      'First owner-block diagnostic requires real native fallback quarantine');
    audit.version+='+'+
      require('./agent2-first-unsupported-owner-root-observer.cjs').VERSION;
  }
  if(deps.nativeOwnerTrainerFallback===true){
    const bridge=require('./agent50-native-owner-trainer-pass-bridge.cjs');
    audit.version+='+'+bridge.VERSION;
    audit.nativeOwnerTrainerFallback={
      attemptedUnsupportedPasses:0,selectedNativeTrainerRoots:0,
      acceptedNativeTrainerRoots:0,rejectedNativeTrainerRoots:0,
      declinedByReason:{},receipts:[],receiptsOmitted:0,
      nativePolicyMayUseHiddenInformation:true,
      ...(deps.ownerFallbackDiagnosticView===true?{
        firstUnsupportedOwnerRoot:null
      }:{}),
      paperPaymentVerified:false,competitiveGameQualified:false
    };
  }
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
    if(audit.rondoPsychicBenchStageOptIn)
      audit.version+='+'+
        require('./agent7-rondo-psychic-bench-staging.cjs').VERSION;
  }else{
    delete audit.sameRootProposalChoiceOptIn;
    delete audit.sameRootChoiceApplyOptIn;
    delete audit.rondoPsychicBenchStageOptIn;
    delete audit.rondoPsychicBenchStageOwnerSeat;
    delete audit.rondoProtectActiveLatiasEonBladeOptIn;
    delete audit.nativeToolAttachRootOptIn;
    delete audit.nativePlumeriaChoiceOptIn;
    delete audit.nativePlumeriaPaymentConservationOptIn;
    delete audit.nativeZeroCostDenialChoiceOptIn;
    delete audit.sameRootPassAttackProbeGlobalTurn;
    delete audit.sameRootPublicNoBenchTerminalOptIn;
    delete audit.sameRootPositiveAttackOverPassOptIn;
    delete audit.sameRootThornsEmptyBenchOptIn;
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
  if(audit.nativeCoheldDenialCanPlayOptIn){
    assert.ok(audit.sameRootProposalChoiceOptIn,
      'Native coheld Supporter inspection requires detached same-root census');
    audit.version+='+'+
      require('./agent41-native-coheld-denial-canplay.cjs').VERSION;
  }else{
    delete audit.nativeCoheldDenialCanPlayOptIn;
    delete audit.nativeCoheldDenialCanPlayRoots;
    delete audit.nativeCoheldDenialBothPlayableRoots;
    delete audit.nativeCoheldDenialCanPlayWitnesses;
    delete audit.nativeCoheldDenialFirstPositiveWitness;
    delete audit.nativeCoheldDenialFirstNegativeWitness;
    delete audit.nativeCoheldDenialFirstErrorWitness;
    delete audit.nativeCoheldDenialNativeCanPlayErrorRoots;
    delete audit.nativeCoheldDenialExamplesTruncated;
    delete audit.nativeCoheldDenialPositiveExamplesTruncated;
    delete audit.nativeCoheldDenialErrorExamplesTruncated;
    delete audit.nativeCoheldDenialPositiveWitnessMissing;
  }
  if(!audit.beforeAttackDenialOptIn)delete audit.beforeAttackDenialOptIn;
  assert.ok([null,0,1].includes(audit.specialEnergyRootOwnerSeat));
  assert.ok([null,0,1].includes(audit.knownDeadAttackRootOwnerSeat));
  assert.ok([null,0,1].includes(audit.potentialKoRootOwnerSeat));
  assert.ok([null,0,1].includes(audit.genesectFusionDrawOwnerSeat));
  assert.ok([null,0,1].includes(audit.dceMewMobilityRootOwnerSeat));
  assert.ok([null,0,1].includes(audit.mewDceRecipientRootOwnerSeat));
  assert.ok([null,0,1].includes(audit.mewGenesectBenchFirstOwnerSeat));
  assert.ok([null,0,1].includes(audit.naturalEvolutionRootOwnerSeat));
  assert.ok([null,0,1].includes(audit.floatStoneMobilityOwnerSeat));
  assert.ok([null,0,1].includes(audit.skylinerRondoRetreatOwnerSeat));
  if(audit.skylinerRondoRetreatOptIn)
    audit.version+='+'+
      require('./agent6-owner-public-skyliner-rondo-frontier.cjs').VERSION;
  else{
    delete audit.skylinerRondoRetreatOptIn;
    delete audit.skylinerRondoRetreatOwnerSeat;
  }
  if(audit.crobatDceMewRetreatOptIn)
    audit.version+='+'+
      require('./agent9-crobat-dce-mew-retreat.cjs').VERSION;
  if(audit.dceMewMobilityRootOptIn)
    audit.version+='+'+
      require('./agent37-dce-mew-paid-retreat.cjs').VERSION;
  else delete audit.dceMewMobilityRootOptIn;
  if(audit.genesectFusionDrawOptIn)
    audit.version+='+'+
      require('./agent37-genesect-public-fusion-draw.cjs').VERSION;
  if(audit.genesectPerCopyPublicUsageOptIn){
    assert.equal(audit.genesectFusionDrawOptIn,true,
      'Per-copy Fusion marker mode requires Genesect root enabled');
    audit.version+='+'+
      require('./agent33-public-fusion-usage.cjs').VERSION;
  }
  if(!audit.genesectFusionDrawOptIn){
    delete audit.genesectFusionDrawOptIn;
    delete audit.genesectFusionNativeAccepted;
  }
  if(audit.floatStoneMobilityOptIn)
    audit.version+='+agent1-owner-public-floatstone-mobility-v1';
  if(audit.dittoStage1RootOptIn){
    audit.version+='+'+require('./agent1-ditto-prism-actor-evolution.cjs').VERSION;
    audit.dittoStage1={selected:0,accepted:0,rejected:0,
      physicallyConfirmed:0,records:[]};
  }
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
  if(audit.earlyBeachAfterPassOptIn)
    audit.version+='+'+
      require('./agent7-early-beach-after-pass.cjs').VERSION;
  if(audit.playersCeremonyLastChanceOptIn)
    audit.version+='+'+
      require('./agent33-players-ceremony-lastchance.cjs').VERSION;
  if(audit.skyFieldBenchExpansionOptIn)
    audit.version+='+'+
      require('./agent33-sky-field-bench-expansion.cjs').VERSION;
  if(audit.pathToPeakOpposingAbilityOptIn)
    audit.version+='+'+
      require('./agent33-path-to-peak-public-lock.cjs').VERSION;
  if(audit.pathSafeSkyFieldReplacementOptIn){
    assert.equal(audit.pathToPeakOpposingAbilityOptIn,true,
      'Safe Sky Field replacement requires explicit Path root');
    audit.version+='+agent33-sky-replacement-opt-in-v1';
  }
  if(audit.pathToPeakPublicSpentFusionOptIn){
    assert.equal(audit.pathToPeakOpposingAbilityOptIn,true,
      'Used Fusion proof requires explicit Path selection');
    audit.version+='+'+
      require('./agent33-public-fusion-usage.cjs').VERSION;
  }
  if(audit.underworldActiveFundingThresholdV2OptIn){
    assert.equal(audit.underworldDoorRootOptIn,true,
      'Immediate Max Geist threshold requires the authenticated Underworld root');
    assert.equal(audit.underworldActiveFundingPriorityOptIn,false,
      'Threshold v2 is mutually exclusive with broad v1 Active funding');
    assert.equal(audit.underworldActiveFundingMirrorVetoOptIn,false,
      'Threshold v2 replaces the v1 mirror veto');
    assert.equal(audit.underworldActiveFundingMinTurn,null,
      'Threshold v2 uses live attack payability, not a turn cutoff');
    audit.version+='+'+
      require('./2026-11/agent26-underworld-immediate-max-geist-payability-v1.cjs').VERSION;
  }
  if(audit.underworldActiveFundingMirrorVetoOptIn){
    assert.equal(audit.underworldActiveFundingPriorityOptIn,true,
      'Mirror veto only applies to an enabled Active Psychic priority');
    audit.version+='+'+
      require('./2026-11/agent26-shadow-rider-mirror-funding-veto.cjs').VERSION;
  }
  if(audit.underworldActiveFundingMinTurn!==null){
    assert.ok(Number.isSafeInteger(audit.underworldActiveFundingMinTurn)&&
      audit.underworldActiveFundingMinTurn>=1,
      'Active funding minimum public game-turn index must be positive integer');
    assert.equal(audit.underworldActiveFundingPriorityOptIn,true);
    audit.version+='+agent26-late-active-funding-turn-'+
      audit.underworldActiveFundingMinTurn;
  }
  if(audit.jetBenchSwitchRootOptIn)
    audit.version+='+'+
      require('./agent40-public-jet-bench-frontier.cjs').VERSION;
  if(audit.jetPostSeekerFabaContinuationOptIn){
    assert.equal(audit.jetBenchSwitchRootOptIn,true,
      'Post-Jet Faba recovery requires explicit Jet Bench switch root');
    audit.version+='+'+
      require('./2026-11/agent33-jet-vs-faba-postroot.cjs').VERSION;
  }
  if(audit.rank7FabaJetBridgeOptIn){
    assert.equal(audit.jetBenchSwitchRootOptIn,true,
      'Faba/Nest root bridge requires explicit Jet Bench switch root');
    audit.version+='+'+
      require('./2026-11/agent40-faba-jet-owner-bridge.cjs').VERSION;
  }
  if(audit.bunnelbyTmJetRootOptIn)
    audit.version+='+'+
      require('./agent40-owner-bunnelby-tm-jet-line.cjs').VERSION;
  if(audit.busLockPositionRootOptIn)
    audit.version+='+'+
      require('./agent40-public-bus-position-frontier.cjs').VERSION;
  if(audit.raichuKoBreakpointBeforeAttackOptIn)
    audit.version+='+'+
      require('./agent10-raichu-damage-breakpoint-before-attack.cjs').VERSION;
  if(audit.printedScalingBasicKoBeforeAttackOptIn)
    audit.version+='+'+
      require('./agent17-printed-scaling-basic-ko.cjs').VERSION;
  if(audit.teamFlareGruntDenialRootOptIn)
    audit.version+='+'+
      require('./agent1-owner-team-flare-grunt-denial.cjs').VERSION;
  if(audit.mysteriousTreasureRootOptIn)
    audit.version+='+'+
      require('./agent49-mysterious-treasure-frontier.cjs').VERSION;
  if(audit.mysteriousTreasureMuscleBandPaymentOptIn)
    audit.version+='+agent49-treasure-muscle-band-choice-v1';
  if(audit.firstRegidragoBenchGrassOptIn)
    audit.version+='+'+
      require('./agent49/first-turn-regidrago-bench-funding.cjs').VERSION;
  if(audit.rank13SourceFirstOwnGrassOptIn)
    audit.version+='+'+
      require('./agent5/rank13-first-own-turn-grass.cjs').VERSION;
  if(audit.retreatFundingBridgeOptIn)
    audit.version+='+'+
      require('./2026-11/agent2-retreat-funding-bridge.cjs').VERSION;
  if(audit.firstCrispinSeekerRecoveryOptIn)
    audit.version+='+'+
      require('./agent49/first-turn-crispin-seeker-recovery.cjs').VERSION;
  if(audit.earlyRegidragoCompressorOptIn)
    audit.version+='+'+
      require('./agent49/early-regidrago-compressor.cjs').VERSION;
  if(audit.rank13CrispinRootOptIn)
    audit.version+='+'+
      require('./agent5/rank13-crispin-owner-funding.cjs').VERSION;
  if(audit.quickBallRootOptIn)
    audit.version+='+'+
      require('./agent8-actor-quick-ball-frontier.cjs').VERSION;
  if(audit.mewUltraBallEvolutionRootOptIn)
    audit.version+='+'+
      require('./agent37/mew-ultraball-evolution.cjs').VERSION;
  if(audit.regidragoDonorQuickBallRootOptIn)
    audit.version+='+'+
      require('./agent8-regidrago-quickball-donor-frontier.cjs').VERSION;
  if(audit.potentialKoRootOptIn)
    audit.version+='+agent49-public-potential-ko-v2';
  if(audit.knownDeadAttackRootOptIn)
    audit.version+='+agent1-known-dead-leading-attack-v1';
  if(audit.rank17ElectrodeBombCensusOptIn){
    const observer=require('./agent1-rank17-electrode-census.cjs');
    audit.version+='+'+observer.VERSION;
    audit.rank17ElectrodeBombCensus=observer.newElectrodeOwnerCensus();
  }else delete audit.rank17ElectrodeBombCensusOptIn;
  if(audit.farewellLetterRootOptIn){
    audit.version+='+'+require('./agent14-owner-farewell-letter.cjs').VERSION;
    audit.farewellLetterReceipts=[];
  }else delete audit.farewellLetterRootOptIn;
  if(audit.ragingBoltNominalKoRootOptIn)
    audit.version+='+'+
      require('./agent50-raging-bolt-nominal-ko.cjs').VERSION;
  if(audit.adpBoostedGxRootOptIn)
    audit.version+='+'+
      require('./agent28-adp-post-retreat-gx-window.cjs').VERSION;
  if(audit.knownDeadAttackRootOwnerSeat!==null)
    audit.version+='+candidate-only-seat-'+audit.knownDeadAttackRootOwnerSeat;
  if(audit.perfectionRootOptIn)
    audit.version+='+agent30-known-perfection-root-v1';
  if(audit.perfectionBenchFundingOptIn)
    audit.version+='+'+
      require('./agent24-early-perfection-recipient.cjs').VERSION;
  if(audit.heldGuzmaMobilityOptIn)
    audit.version+='+'+
      require('./agent2-held-guzma-mobility-frontier.cjs').VERSION;
  if(audit.flexiblePaidRetreatRootOptIn)
    audit.version+='+'+
      require('./agent10-flexible-paid-retreat-frontier.cjs').VERSION;
  if(audit.twoUnitPaidRetreatRootOptIn)
    audit.version+='+'+
      require('./agent42-public-two-unit-paid-retreat-proposal.cjs').VERSION;
  if(audit.rank9SpecialPaidRetreatOptIn)
    audit.version+='+'+
      require('./agent10-rank9-special-paid-retreat.cjs').VERSION;
  if(audit.rank9SpecialFundedGuzmaOptIn)
    audit.version+='+'+require('./agent2-rank9-special-guzma-frontier.cjs').VERSION;
  if(audit.rank9MegaAbsolFundingOptIn)
    audit.version+='+'+require('./agent2-rank9-mega-absol-funding.cjs').VERSION;
  if(audit.forcedGuzmaNominalKoOptIn)
    audit.version+='+'+
      require('./agent31-forced-guzma-ko-frontier.cjs').VERSION;
  if(audit.finalPrizeGuzmaOptIn||audit.prizeTradeGuzmaOptIn)
    audit.version+='+'+
      require('./agent31-final-prize-guzma-frontier.cjs').VERSION;
  if(audit.seekerGuzmaNominalKoOptIn)
    audit.version+='+'+
      require('./agent31/late-seeker-guzma-prize.cjs').VERSION;
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
  if(audit.seekerResearchRootOptIn)
    audit.version+='+'+
      require('./agent2-owner-vs-seeker-research-root.cjs').VERSION;
  if(audit.lowHandLillieCensusOptIn)
    audit.version+='+agent25-owner-lowhand-lillie-census-v1';
  if(audit.strandedMarnieRootOptIn)
    audit.version+='+'+
      require('./agent50-stranded-marnie-frontier.cjs').VERSION;
  if(policyOwnerSeat!==null) audit.version+='+seat-scoped-policy-owner-v2-bottom-target';
  const ownerTurnLedger=audit.nativeOwnerTrainerFallback?
    require('./agent4-owner-turn-ledger.cjs').createOwnerTurnLedger():null;
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
    // PlayerType is relative to the acting player, not the physical seat.
    // BOTTOM_PLAYER always means this actor's own side for both seats.
    const ownerPlayerType=PlayerType.BOTTOM_PLAYER;
    assert.ok(ownerPlayerType!==undefined,
      'Actor-owned actions require PlayerType.BOTTOM_PLAYER');
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(policyOwnerSeat!==null&&seat!==policyOwnerSeat){
      audit.nonOwnerSeatBypassCalls++;
      return original.value.call(this,state);
    }
    if(!pending&&state.phase!==engineGamePhase().PLAYER_TURN){
      audit.nonTurnPhaseFallbacks++;
      return original.value.call(this,state);
    }
    if(seat!==-1&&pending&&audit.rank7FabaJetBridgeOptIn&&
       pending.playerId===playerId&&ownerRank7BridgePending.has(playerId)){
      const token=ownerRank7BridgePending.get(playerId);
      assert.equal(token.promptId,pending.id,
        'rank7 Faba/Nest response must match real owner pending prompt');
      const {ResolvePromptAction}=deps.promptActions??
        require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
      const bridge=require('./2026-11/agent40-faba-jet-owner-bridge.cjs');
      const promptView=observe(state,seat);
      const proposal=token.kind==='faba'?
        bridge.chooseFabaJetHoodPrompt(promptView,pending,state,
          {PlayerType,SlotType}):
        bridge.choosePostJetNestSearchPrompt(
          promptView,pending,state.players[seat].deck,
          ['Snorlax PGO','Wobbuffet PHF','Regirock XYP',
            'Mimikyu PAL','Electrike PRC','Girafarig LOT']);
      assert.ok(proposal,'Selected rank7 owner prompt must have a legal public response');
      const action=new ResolvePromptAction(pending.id,proposal.answer);
      typedRank7BridgeReplies.set(action,{
        ownerId:playerId,seat,kind:proposal.kind,
        printing:proposal.printing??null});
      audit.rank7FabaJetBridgePromptsSelected++;
      return action;
    }
    if(seat!==-1&&pending&&audit.arvenHoodSearchOptIn&&
       pending.playerId===playerId&&ownerArvenPending.has(playerId)){
      const token=ownerArvenPending.get(playerId);
      assert.equal(pending.id,token.promptId,
        'Arven Hood search must resolve its own authenticated owner prompt');
      const {ResolvePromptAction}=deps.promptActions??
        require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
      const {TrainerType}=deps.arvenTrainerTypes??
        require('../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');
      const response=require('./agent31/arven-hood-owner-frontier.cjs')
        .resolveArvenHoodSearch(
          state,seat,pending,ResolvePromptAction,TrainerType.ITEM);
      ownerArvenPending.delete(playerId);
      if(response){
        audit.arvenHoodSearchPromptsSelected++;
        return response.action;
      }
    }
    if(seat!==-1&&pending&&
       (audit.seekerLillieRootOptIn||audit.seekerResearchRootOptIn||
        audit.firstCrispinSeekerRecoveryOptIn||
        audit.seekerGuzmaNominalKoOptIn||
        audit.jetPostSeekerFabaContinuationOptIn)&&
       pending.playerId===playerId&&ownerSeekerPending.has(playerId)){
      const {ResolvePromptAction}=deps.promptActions??
        require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
      const token=ownerSeekerPending.get(playerId);
      assert.equal(pending.id,token.promptId,
        'VS Seeker response must match the authentic pending prompt');
      const target=token.target;
      const planned=require('./agent48-owner-vs-seeker-supporter.cjs')
        .chooseOwnerVsSeekerSupporterPrompt(
          state,seat,pending,ResolvePromptAction,target);
      typedSeekerReplies.set(planned,{seat,ownerId:playerId,
        printing:target});
      if(target.startsWith("Professor's Research "))
        audit.seekerResearchPromptsProposed++;
      else if(target==='Crispin SCR')audit.seekerCrispinPromptsProposed++;
      else if(target==='Faba LOT')audit.jetPostSeekerFabaPromptsProposed++;
      else if(require('./agent2-held-guzma-mobility-frontier.cjs')
        .isGuzma(target))audit.seekerGuzmaPromptsProposed++;
      else audit.seekerLilliePromptsProposed++;
      return planned;
    }
    // Resolve Crispin only for the physical owner whose accepted Supporter
    // issued this same native prompt. Never choose from another player's deck.
    if(seat!==-1&&pending&&audit.rank13CrispinRootOptIn&&
       pending.playerId===playerId&&
       ownerRank13CrispinPending.has(playerId)){
      const token=ownerRank13CrispinPending.get(playerId);
      const {ResolvePromptAction}=deps.promptActions??
        require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
      const helper=require('./agent5/rank13-crispin-owner-funding.cjs');
      let response=null;
      if(token.stage==='search'&&token.promptId===pending.id&&
         pending.constructor?.name==='ChooseCardsPrompt')
        response=helper.chooseNativeCrispinEnergySearch(
          state,seat,pending,ResolvePromptAction);
      if(token.stage==='attach'&&
         pending.constructor?.name==='AttachEnergyPrompt')
        response=helper.chooseNativeCrispinBenchAttach(
          state,seat,pending,ResolvePromptAction,PlayerType,SlotType);
      if(response){
        typedRank13CrispinReplies.set(response.action,{
          seat,ownerId:playerId,stage:token.stage,
          chosen:response.chosen,targetIndex:response.targetIndex??null
        });
        return response.action;
      }
    }
    if(seat!==-1&&pending&&audit.earlyRegidragoCompressorOptIn&&
       pending.playerId===playerId&&
       ownerEarlyCompressorPending.has(playerId)){
      const {ResolvePromptAction}=deps.promptActions??
        require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
      const token=ownerEarlyCompressorPending.get(playerId);
      assert.equal(token.promptId,pending.id,
        'Early Compressor reply requires the actual source-owned prompt');
      const choice=require('./agent49/early-regidrago-compressor.cjs')
        .chooseNativeEarlyCompressorDonors(
          state,seat,pending,ResolvePromptAction);
      typedEarlyCompressorReplies.set(choice.action,{
        ownerId:playerId,seat,chosen:choice.chosen});
      audit.earlyRegidragoCompressorPromptsProposed++;
      return choice.action;
    }
    if(seat!==-1&&pending&&audit.eriRevealRootOptIn&&
       pending.playerId===playerId&&ownerEriPending.has(playerId)){
      const token=ownerEriPending.get(playerId);
      assert.equal(token.promptId,pending.id,
        'Eri reply must originate from the accepted native reveal prompt');
      const {ResolvePromptAction}=deps.promptActions??
        require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
      const {SuperType,TrainerType,CardTag}=deps.eriCardTypes??
        require('../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');
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
    // Source-owner prompt for the physical Dialga Timeless-GX payload after
    // Copycat of a real preceding Regidrago Apex. Other prompts retain the
    // standard canonical resolver and its audit.
    if(seat!==-1&&pending&&
        audit.mimikyuApexFundedPromotionOptIn===true&&
        pending.playerId===playerId){
      const chosen=require(
        './2026-11/agent6-funded-mimikyu-apex-promotion.cjs')
          .chooseNativeMimikyuTimelessPrompt(
            state,seat,pending,copycatHistoryByStore.get(nativeStore)??null);
      if(chosen){
        const {ResolvePromptAction}=deps.promptActions??
          require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
        audit.mimikyuApexTimelessPromptSelected++;
        return new ResolvePromptAction(pending.id,chosen);
      }
      if(audit.mimikyuTimelessMaxGeistRetreatRootOptIn===true&&
         audit.mimikyuTimelessMaxGeistRetreatRootOwnerSeat===seat){
        const powerBeam=chooseNativeMimikyuPostTimelessPowerBeamPrompt(
          state,seat,pending,copycatHistoryByStore.get(nativeStore)??null);
        if(powerBeam){
          const {ResolvePromptAction}=deps.promptActions??
            require('../../vendor/twinleaf/ptcg-server/output/game/store/actions/resolve-prompt-action');
          audit.mimikyuPostTimelessPowerBeamPromptSelected++;
          return new ResolvePromptAction(pending.id,powerBeam);
        }
      }
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
    const baseView=observe(state,seat);
    const copycatView=audit.copycatHistoryRootOptIn?
      require('./agent7-copycat-history-root.cjs')
        .attachPreviousOpponentTurnReceipt(baseView,state,seat,
          copycatHistoryByStore.get(nativeStore)??null):baseView;
    if(audit.copycatHistoryRootOptIn){
      const receipt=copycatView.publicEventReceipt;
      const rows=receipt.opponentLastTurnAttacks;
      const stats=audit.copycatHistoryRoot;
      stats.ownerRoots++;
      if(rows===null)stats.unavailableRoots++;
      else if(rows.length===0)stats.knownEmptyRoots++;
      else if(rows.length===1)stats.singleAttackRoots++;
      else stats.multiattackRoots++;
      const choices=receipt.opponentCopycatChoices;
      if(Array.isArray(choices)&&choices.length>0)stats.choiceSetRoots++;
      if(Array.isArray(choices)&&choices.length===2)stats.barragePairRoots++;
      if(choices?.some(row=>row.sourcePrinting.startsWith('Bunnelby PRC')&&
          row.attackName==='Burrow'&&row.gxAttack===false&&row.copycatAttack===false))
        stats.singleBurrowRoots++;
      if(stats.samples.length<32)stats.samples.push({
        globalTurn:state.turn,actorSeat:seat,
        opponentLastTurnTurn:receipt.opponentLastTurnTurn,
        attacks:rows===null?null:rows.map(row=>({...row})),
        copycatChoices:choices===null?null:choices.map(row=>({...row}))
      });
    }
    let view=copycatView;
    if(audit.rangerPaidGxResponseOptIn){
      view=require('./agent30-ranger-public-gx-frontier.cjs')
        .observePublicPaidGxEffects(state,seat,view);
    }
    if(audit.rangerBudewItemLockOptIn){
      view=require('./agent6-budew-ranger-itemlock.cjs')
        .observePublicBudewItemLock(state,seat,view);
    }
    let genericFundedObservation=null;
    if(audit.genericFundedFloatStoneAuditOptIn){
      const census=audit.genericFundedFloatStoneAudit;
      census.ownerRoots++;
      const held=view.ownHand.includes('Float Stone BKT');
      const attached=view.ownPublic.active?.tools?.includes(
        'Float Stone BKT')===true;
      const activeEnergy=view.ownPublic.active?.energies??[];
      const partiallyFunded=activeEnergy.length>0;
      if(held){
        census.ownerHeldToolRoots++;
        const {FIELDS,heldFloatGateFlags}=require(
          './agent14-floatstone-held-owner-gates.cjs');
        const gates=heldFloatGateFlags(view,catalog);
        for(const gate of FIELDS){
          if(gates[gate])census.heldGateCounts[gate]++;
        }
        if(gates.benchHasPayableAttack&&
            census.heldPayableTargetSamples.length<32){
          census.heldPayableTargetSamples.push({
            globalTurn:view.globalTurn,seat,
            active:view.ownPublic.active?.printing??null,
            opponentActive:view.opponentPublic?.active?.printing??null,
            opponentActiveDamage:view.opponentPublic?.active?.damage??null,
            opponentActivePrintedHp:view.opponentPublic?.active?.hp??null,
            opponentActiveTools:[...(view.opponentPublic?.active?.tools??[])],
            payableTargets:gates.benchPayableTargets
          });
        }
      }
      if(attached)census.ownerAttachedToolRoots++;
      if(partiallyFunded)census.partiallyFundedActiveRoots++;
      genericFundedObservation=require(
        './agent14-generic-funded-floatstone-frontier.cjs')
          .chooseGenericFundedFloatStone(view,catalog);
      if(genericFundedObservation!==null){
        census.currentlyEligibleRoots++;
        census.eligibleBySeat[seat]++;
        if(census.eligibleSamples.length<32)census.eligibleSamples.push({
          globalTurn:view.globalTurn,seat,
          active:view.ownPublic.active?.printing??null,
          activeEnergyCards:activeEnergy.length,
          ownHandCount:view.ownHand.length,
          benchTarget:genericFundedObservation.printing,
          targetAttack:genericFundedObservation.targetAttackName,
          kind:genericFundedObservation.kind,
          projectedPrintedDamage:
            genericFundedObservation.projectedPrintedDamage
        });
      }else if(held||attached)census.declinedWhileToolHeld++;
    }
    const ownerTurnReceipt=ownerTurnLedger?
      ownerTurnLedger.observe(view):null;
    if(audit.nativeCoheldDenialCanPlayOptIn){
      const witness=require('./agent41-native-coheld-denial-canplay.cjs')
        .inspectNativeCoheldDenialCanPlay(
          view,state,nativeStore,seat,audit.selectedRootDecisions+1);
      if(witness)
        require('./agent33-coheld-positive-witness-retention.cjs')
          .retainNativeCoheldWitness(audit,witness);
    }
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
      rangerPaidGxResponse:audit.rangerPaidGxResponseOptIn,
      rangerBudewItemLock:audit.rangerBudewItemLockOptIn,
      energyFrontier:audit.energyFrontierOptIn,
      energyRecipientFrontier:audit.energyRecipientFrontierOptIn,
      contestedEnergyRoot:audit.contestedEnergyRootOptIn===true,
      mobilityAwareRecipient:audit.mobilityAwareRecipientOptIn,
      dceMewMobilityRoot:actorSpecialEnergyEnabled(
        audit.dceMewMobilityRootOptIn,audit.dceMewMobilityRootOwnerSeat,seat),
      mewDceRecipientRoot:actorSpecialEnergyEnabled(
        audit.mewDceRecipientRootOptIn,audit.mewDceRecipientRootOwnerSeat,seat),
      mewGenesectBenchFirst:actorSpecialEnergyEnabled(
        audit.mewGenesectBenchFirstOptIn,audit.mewGenesectBenchFirstOwnerSeat,seat),
      crobatDceMewRetreat:actorSpecialEnergyEnabled(
        audit.crobatDceMewRetreatOptIn,
        audit.crobatDceMewRetreatOwnerSeat,seat),
      genesectFusionDraw:actorSpecialEnergyEnabled(
        audit.genesectFusionDrawOptIn,audit.genesectFusionDrawOwnerSeat,seat),
      genesectFusionNativeAvailableSlots:
        actorSpecialEnergyEnabled(audit.genesectFusionDrawOptIn,
          audit.genesectFusionDrawOwnerSeat,seat)&&
          typeof nativeStore.reduceEffect==='function'?
            require('./agent37/native-genesect-power-availability.cjs')
              .nativeGenesectPowerAvailability(state,nativeStore,seat):null,
      templeDdeDenial:audit.templeDdeDenialOptIn===true,
      arvenHoodSearch:audit.arvenHoodSearchOptIn===true,
      underworldDoorRoot:audit.underworldDoorRootOptIn===true,
      maxGeistManualRecovery:audit.maxGeistManualRecoveryOptIn===true,
      pathUnderworldStadiumCounter:
        audit.pathUnderworldStadiumCounterOptIn===true,
      mimikyuApexFundedPromotion:
        audit.mimikyuApexFundedPromotionOptIn===true,
      mimikyuTimelessMaxGeistRetreatRoot:
        audit.mimikyuTimelessMaxGeistRetreatRootOptIn===true&&
        audit.mimikyuTimelessMaxGeistRetreatRootOwnerSeat===seat&&
        audit.mimikyuApexFundedPromotionOptIn===true,
      mimikyuTimelessMaxGeistRetreatRootOwnerSeat:seat,
      fundedVmaxFloatStoneRoot:audit.fundedVmaxFloatStoneRootOptIn===true,
      genericFundedFloatStoneRoot:audit.genericFundedFloatStoneRootOptIn===true,
      genericTacticalSwitchRoot:audit.genericTacticalSwitchRootOptIn===true,
      opponentBlockSwitchRoot:audit.opponentBlockSwitchRootOptIn===true,
      zeroEnergyStrandFloatStoneRoot:
        audit.zeroEnergyStrandFloatStoneRootOptIn===true&&
        (audit.zeroEnergyStrandFloatStoneOwnerSeat===null||
         audit.zeroEnergyStrandFloatStoneOwnerSeat===seat),
      zeroEnergyStrandFloatStoneTargetTurn:
        audit.zeroEnergyStrandFloatStoneTargetTurn,
      twoUnitPaidRetreatRoot:audit.twoUnitPaidRetreatRootOptIn===true,
      twoUnitPaidRetreatTargetTurn:audit.twoUnitPaidRetreatTargetTurn,
      twoUnitPaidRetreatRootV2:audit.twoUnitPaidRetreatRootV2OptIn===true,
      twoUnitPaidRetreatTargetTurnV2:audit.twoUnitPaidRetreatTargetTurnV2,
      underworldActiveFundingPriority:
        audit.underworldActiveFundingPriorityOptIn===true,
      underworldActiveFundingThresholdV2:
        audit.underworldActiveFundingThresholdV2OptIn===true,
      underworldActiveFundingMirrorVeto:
        audit.underworldActiveFundingMirrorVetoOptIn===true,
      underworldActiveFundingMinTurn:
        audit.underworldActiveFundingMinTurn,
      underworldMarkerReceipt:audit.underworldDoorRootOptIn?
        require('./agent31-underworld-door-owner-frontier.cjs')
          .ownerUnderworldMarkerReceipt(state.players[seat]):undefined,
      genesectFusionUsedThisTurn:
        audit.genesectPerCopyPublicUsageOptIn===true||
        genesectDrawUsedTurnBySeat.get(seat)===view.globalTurn,
      genesectFusionPublicUsage:
        audit.genesectPerCopyPublicUsageOptIn===true&&view.phase===2&&
        actorSpecialEnergyEnabled(audit.genesectFusionDrawOptIn,
          audit.genesectFusionDrawOwnerSeat,seat)?
          require('./agent33-public-fusion-usage.cjs')
            .publicFusionUsageAtRoot(state,seat):null,
      flexiblePaidRetreatRoot:audit.flexiblePaidRetreatRootOptIn,
      skylinerFundedBenchRetreatRoot:
        audit.skylinerFundedBenchRetreatRootOptIn===true,
      rank9SpecialPaidRetreat:actorSpecialEnergyEnabled(
        audit.rank9SpecialPaidRetreatOptIn,
        audit.rank9SpecialPaidRetreatOwnerSeat,seat),
      paidRetreatRoot:audit.paidRetreatRootOptIn,
      skylinerRondoRetreat:audit.skylinerRondoRetreatOptIn===true&&
        actorSpecialEnergyEnabled(true,
          audit.skylinerRondoRetreatOwnerSeat,seat),
      perfectionRoot:audit.perfectionRootOptIn,
      gengarHorrorHouseTempo:audit.gengarHorrorHouseTempoOptIn,
      gengarFlexibleV2:audit.gengarFlexibleV2OptIn,
      gengarResourceProtectedV3:audit.gengarResourceProtectedV3OptIn,
      gengarHorrorHouseMinOpponentHandCount:
        audit.gengarHorrorHouseMinOpponentHandCount,
      perfectionBenchFunding:audit.perfectionBenchFundingOptIn,
      perfectionTransitionRoot:audit.perfectionTransitionRootOptIn,
      thornsDirectLine:audit.thornsDirectLineOptIn,
      thornsSoloEnergyRetention:audit.thornsSoloEnergyRetentionOptIn===true,
      specialEnergyRoot:actorSpecialEnergyEnabled(
        audit.specialEnergyRootOptIn,audit.specialEnergyRootOwnerSeat,seat),
      rank13DdeEnergyRoot:actorSpecialEnergyEnabled(
        audit.rank13DdeEnergyRootOptIn,
        audit.rank13DdeEnergyOwnerSeat,seat),
      rank13SourceApexRoot:actorSpecialEnergyEnabled(
        audit.rank13SourceApexRootOptIn,
        audit.rank13SourceApexRootOwnerSeat,seat),
      publicContextSpecialEnergy:actorSpecialEnergyEnabled(
        audit.publicContextSpecialEnergyOptIn,
        audit.specialEnergyRootOwnerSeat,seat),
      publicFlexibleEnergyContest:audit.publicFlexibleEnergyContestOptIn===true,
      tropicalBeachLastChance:audit.tropicalBeachLastChanceOptIn===true,
      earlyBeachAfterPass:audit.earlyBeachAfterPassOptIn===true,
      earlyBeachDeferForMail:audit.earlyBeachDeferForMailOptIn===true,
      playersCeremonyLastChance:audit.playersCeremonyLastChanceOptIn===true,
      skyFieldBenchExpansion:audit.skyFieldBenchExpansionOptIn===true,
      pathToPeakOpposingAbility:audit.pathToPeakOpposingAbilityOptIn===true,
      pathSafeSkyFieldReplacement:audit.pathSafeSkyFieldReplacementOptIn===true,
      ...(audit.pathToPeakPublicSpentFusionOptIn?{
        ownFusionUsage:require('./agent33-public-fusion-usage.cjs')
          .publicFusionUsageAtRoot(state,seat)
      }:{}),
      raichuKoBreakpointBeforeAttack:audit.raichuKoBreakpointBeforeAttackOptIn,
      printedScalingBasicKoBeforeAttack:audit.printedScalingBasicKoBeforeAttackOptIn,
      jetBenchSwitchRoot:audit.jetBenchSwitchRootOptIn,
      jetPostRoboContinuation:audit.jetPostRoboContinuationOptIn,
      jetPostSeekerFabaContinuation:audit.jetPostSeekerFabaContinuationOptIn,
      rank7FabaJetBridge:audit.rank7FabaJetBridgeOptIn,
      bunnelbyTmJetRoot:audit.bunnelbyTmJetRootOptIn,
      busLockPositionRoot:audit.busLockPositionRootOptIn,
      ownRegisteredSixty:deps.ownRegisteredSixtiesBySeat?.[seat]??null,
      printedGxRoot:audit.printedGxRootOptIn,
      adpBoostedGxRoot:audit.adpBoostedGxRootOptIn,
      printedFirstTurnAttackRoot:audit.printedFirstTurnAttackRootOptIn,
      potentialKoRoot:actorSpecialEnergyEnabled(
        audit.potentialKoRootOptIn,audit.potentialKoRootOwnerSeat,seat),
      ragingBoltNominalKoRoot:audit.ragingBoltNominalKoRootOptIn,
      knownDeadAttackRoot:actorSpecialEnergyEnabled(
        audit.knownDeadAttackRootOptIn,audit.knownDeadAttackRootOwnerSeat,seat),
      paleMoonGXRoot:actorSpecialEnergyEnabled(
        audit.paleMoonGXRootOptIn,audit.paleMoonGXRootOwnerSeat,seat),
      earlyForestSealRoot:actorSpecialEnergyEnabled(
        audit.earlyForestSealRootOptIn,audit.earlyForestSealRootOwnerSeat,seat),
      naturalEvolutionRoot:actorSpecialEnergyEnabled(
        audit.naturalEvolutionRootOptIn,audit.naturalEvolutionRootOwnerSeat,seat),
      garbodorResponseOwnerSeat:audit.garbodorResponseOwnerSeat,
      garbotoxinToolRoot:audit.garbotoxinToolRootOptIn,
      garbotoxinToolRootDeferForStarAlchemy:
        audit.garbotoxinToolRootDeferForStarAlchemy,
      dittoStage1Root:audit.dittoStage1RootOptIn,
      dittoStage1Receipt:audit.dittoStage1RootOptIn?
        require('./agent1-ditto-prism-actor-evolution.cjs')
          .ownerDittoStage1Receipt(state.players[seat],catalog.stages):undefined,
      farewellLetterRoot:audit.farewellLetterRootOptIn,
      mysteriousTreasureRoot:audit.mysteriousTreasureRootOptIn,
      mysteriousTreasureMuscleBandPayment:
        audit.mysteriousTreasureMuscleBandPaymentOptIn,
      firstRegidragoBenchGrass:audit.firstRegidragoBenchGrassOptIn,
      rank13SourceFirstOwnGrass:actorSpecialEnergyEnabled(
        audit.rank13SourceFirstOwnGrassOptIn,
        audit.rank13SourceFirstOwnGrassOwnerSeat,seat),
      retreatFundingBridge:audit.retreatFundingBridgeOptIn,
      firstCrispinSeekerRecovery:audit.firstCrispinSeekerRecoveryOptIn,
      earlyRegidragoCompressor:actorSpecialEnergyEnabled(
        audit.earlyRegidragoCompressorOptIn,
        audit.earlyRegidragoCompressorOwnerSeat,seat),
      earlyRegidragoCompressorAllowFirstOwnTurnTwo:
        audit.earlyRegidragoCompressorAllowFirstOwnTurnTwo,
      rank13CrispinRoot:actorSpecialEnergyEnabled(
        audit.rank13CrispinRootOptIn,
        audit.rank13CrispinRootOwnerSeat,seat),
      mysteriousTreasureEarlyRegistered:
        audit.mysteriousTreasureEarlyRegisteredOptIn,
      quickBallRoot:actorSpecialEnergyEnabled(
        audit.quickBallRootOptIn,audit.quickBallRootOwnerSeat,seat),
      quickBallPayableAttackPriority:
        audit.quickBallPayableAttackPriorityOptIn===true&&
        actorSpecialEnergyEnabled(audit.quickBallRootOptIn,
          audit.quickBallRootOwnerSeat,seat),
      mewUltraBallEvolutionRoot:actorSpecialEnergyEnabled(
        audit.mewUltraBallEvolutionRootOptIn,
        audit.mewUltraBallEvolutionRootOwnerSeat,seat),
      regidragoDonorQuickBallRoot:actorSpecialEnergyEnabled(
        audit.regidragoDonorQuickBallRootOptIn,
        audit.regidragoDonorQuickBallOwnerSeat,seat),
      powerglassRoot:audit.powerglassRootOptIn,
      floatStoneMobility:actorSpecialEnergyEnabled(
        audit.floatStoneMobilityOptIn,
        audit.floatStoneMobilityOwnerSeat,seat),
      heldGuzmaMobility:audit.heldGuzmaMobilityOptIn,
      rank9SpecialFundedGuzma:audit.rank9SpecialFundedGuzmaOptIn,
      rank9MegaAbsolFundingRoot:audit.rank9MegaAbsolFundingOptIn,
      activeMegaClawPriorityRoot:audit.activeMegaClawPriorityOptIn,
      forcedGuzmaNominalKo:audit.forcedGuzmaNominalKoOptIn,
      finalPrizeGuzma:audit.finalPrizeGuzmaOptIn,
      prizeTradeGuzma:audit.prizeTradeGuzmaOptIn,
      seekerGuzmaNominalKo:audit.seekerGuzmaNominalKoOptIn,
      seekerGuzmaOwnerSeat:audit.seekerGuzmaOwnerSeat,
      seekerGuzmaGlobalTurn:audit.seekerGuzmaGlobalTurn,
      lastBenchHeldEvolution:audit.lastBenchHeldEvolutionOptIn===true,
      strandedMarnieRoot:actorSpecialEnergyEnabled(
        audit.strandedMarnieRootOptIn,
        audit.strandedMarnieRootOwnerSeat,seat),
      sourceDialgaShredT53:actorSpecialEnergyEnabled(
        audit.sourceDialgaShredT53OptIn,
        audit.sourceDialgaShredT53OwnerSeat,seat),
      lowHandLillieRoot:audit.lowHandLillieRootOptIn,
      teamFlareGruntDenialRoot:audit.teamFlareGruntDenialRootOptIn,
      eriRevealRoot:audit.eriRevealRootOptIn===true,
      carmineFirstRoot:audit.carmineFirstRootOptIn,
      seekerLillieRoot:audit.seekerLillieRootOptIn,
      seekerResearchRoot:audit.seekerResearchRootOptIn,
      protectPotentialTwoPrizeAttack:audit.protectPotentialTwoPrizeAttackOptIn,
      protectPotentialPrintedPrizeAttack:audit.protectPotentialPrintedPrizeAttackOptIn,
      conservativeShuffleBeforeAttack:audit.conservativeShuffleBeforeAttackOptIn,
      beforeAttackDenialRoot:audit.beforeAttackDenialOptIn,
      payablePrintedAttackOffer:audit.sameRootProposalChoiceOptIn===true,
      preterminalSpeedDrawOffer:audit.sameRootProposalChoiceOptIn===true,
      sameRootPublicEventReceipt:audit.sameRootPublicEventReceiptOptIn===true,
      copycatHistoryRoot:audit.copycatHistoryRootOptIn===true,
      sameRootProbeAll:audit.sameRootProbeAllOptIn===true,
      sameRootChoiceApply:audit.sameRootChoiceApplyOptIn===true,
      rondoPsychicBenchStage:actorSpecialEnergyEnabled(
        audit.rondoPsychicBenchStageOptIn,
        audit.rondoPsychicBenchStageOwnerSeat??null,seat),
      rondoPsychicBenchStagingPreference:actorSpecialEnergyEnabled(
        audit.rondoPsychicBenchStageOptIn,
        audit.rondoPsychicBenchStageOwnerSeat??null,seat),
      rondoProtectActiveLatiasEonBlade:actorSpecialEnergyEnabled(
        audit.rondoPsychicBenchStageOptIn&&
          audit.rondoProtectActiveLatiasEonBladeOptIn,
        audit.rondoPsychicBenchStageOwnerSeat??null,seat),
      nativeToolAttachRoot:audit.nativeToolAttachRootOptIn===true,
      nativePlumeriaChoice:audit.nativePlumeriaChoiceOptIn===true,
      nativePlumeriaPaymentConservation:
        audit.nativePlumeriaPaymentConservationOptIn===true,
      nativeZeroCostDenialChoice:audit.nativeZeroCostDenialChoiceOptIn===true,
      registeredToolEnergyCeiling:audit.registeredToolEnergyCeilingOptIn===true,
      passAttackProbeGlobalTurn:audit.sameRootPassAttackProbeGlobalTurn,
      publicNoBenchTerminalAttack:audit.sameRootPublicNoBenchTerminalOptIn===true,
      positivePrintedAttackPassPreference:audit.sameRootPositiveAttackOverPassOptIn===true,
      thornsEmptyBenchVoltPreference:audit.sameRootThornsEmptyBenchOptIn===true
    };
    // Option contract is obtained before selecting the owner root. The same
    // detached view supplies both Bench and attack/setup proposals; no native
    // Store action is attempted during proposal collection.
    if(rootOptions.garbotoxinToolRoot===true&&
       (rootOptions.garbodorResponseOwnerSeat===null||
        view.actorSeat===rootOptions.garbodorResponseOwnerSeat)){
      const status=require('./agent36-garbotoxin-tool-intent.cjs')
        .evaluateGarbodorToolIntent(view,catalog,{
          deferForStarAlchemy:
            rootOptions.garbotoxinToolRootDeferForStarAlchemy===true
        });
      const counter={
        'star-alchemy-available':'garbotoxinToolRootDeferredForStarAlchemy',
        'no-opponent-ability':'garbotoxinToolRootNoOpponentAbility',
        'no-unequipped-garbodor':'garbotoxinToolRootNoGarbodorTarget',
        'no-tool-candidate':'garbotoxinToolRootNoToolCandidate'
      }[status.reason];
      if(counter)audit[counter]++;
      if(audit.garbotoxinToolRootStatusSamples.length<24){
        const {intent,...receipt}=status;
        audit.garbotoxinToolRootStatusSamples.push({
          globalTurn:view.globalTurn,actorSeat:view.actorSeat,
          ...receipt,
          selectedPrinting:intent?.printing??null,
          selectedSlot:intent?.slot??null,
          selectedIndex:intent?.index??null
        });
      }else audit.garbotoxinToolRootStatusSamplesOmitted++;
    }
    rootOptions.rootIntentBudget=deps.rootIntentBudget??null;
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
    let providerChoice=null;
    if(audit.rootIntentProvider.configured){
      const eligible=policyOwnerSeat!==null&&!soloChoice&&
        !audit.sameRootProposalChoiceOptIn&&!audit.terminalArbitrationOptIn&&
        !audit.nativeOwnerTrainerFallback;
      if(!eligible){
        audit.rootIntentProvider.skipped++;
        const reason=policyOwnerSeat===null?'unscoped-policy-owner-seat':
          soloChoice?'higher-priority-solo-choice':
          audit.nativeOwnerTrainerFallback?'native-trainer-fallback-enabled':
          'downstream-arbitration-enabled';
        audit.rootIntentProvider.abstentionReasons[reason]=
          (audit.rootIntentProvider.abstentionReasons[reason]??0)+1;
      }else{
        audit.rootIntentProvider.attempts++;
        const decision=invokeActorRootIntentProvider({
          provider:deps.rootIntentProvider,
          capabilityFactory:deps.createRootSearchCapability,
          rootIntentActionKey:deps.rootIntentActionKey,
          state,actorSeat:seat,view,catalog,rootOptions
        });
        if(decision.status==='selected'){
          providerChoice=decision;
          audit.rootIntentProvider.selected++;
          audit.rootIntentProvider.lastIntentKind=decision.intent.kind;
          audit.rootIntentProvider.lastApplicabilityEnvelopeId=
            decision.searchAudit.applicabilityEnvelopeId;
          audit.rootIntentProvider.lastSearchAudit=decision.searchAudit;
        }else{
          audit.rootIntentProvider.abstained++;
          audit.rootIntentProvider.abstentionReasons[decision.reason]=
            (audit.rootIntentProvider.abstentionReasons[decision.reason]??0)+1;
        }
      }
    }
    const firstIntent=soloChoice?.chosen??providerChoice?.intent??
      chooseActorRootIntent(view,catalog,rootOptions);
    // Partial owner-view alternative collection is explicitly opt-in. The
    // first-return action is a control offer, never previously dispatched.
    // The new chooser and historical terminal arbiter are mutually exclusive
    // until their option sets and native receipts can be reconciled.
    // The owner-visible public event clock is separately admitted at the
    // trusted Store boundary. Never pass State or native card IDs to a
    // selector. The historical baseline continues using the original view.
    const rootProposalView=audit.sameRootPublicEventReceiptOptIn?
      Object.freeze({...view,publicEventReceipt:view.publicEventReceipt??
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
    if(audit.copycatHistoryRootOptIn&&
        intent.source===require('./agent7-copycat-history-root.cjs').VERSION)
      audit.copycatHistoryRoot.selected++;
    if(intent.source===POST_TIMELESS_MAX_GEIST_VERSION)
      audit.mimikyuTimelessMaxGeistRetreatRootSelected++;
    if(intent.source?.startsWith('agent36-garbotoxin-'))
      audit.garbotoxinToolRootSelected++;
    if(intent.source==='agent36-garbotoxin-float-stone-v1')
      audit.garbotoxinFloatStoneRootSelected++;
    if(intent.source==='agent36-garbotoxin-fss-fallback-v1')
      audit.garbotoxinFssFallbackRootSelected++;
    if(audit.genericFundedFloatStoneAuditOptIn&&
        genericFundedObservation!==null&&
        intent.kind===genericFundedObservation.kind&&
        intent.source===genericFundedObservation.source){
      audit.genericFundedFloatStoneAudit.selectedAsNativeIntent++;
    }
    if(audit.rank17ElectrodeBombCensusOptIn)
      require('./agent1-rank17-electrode-census.cjs')
        .recordElectrodeOwnerCensus(audit.rank17ElectrodeBombCensus,
          view,intent,audit.selectedRootDecisions+1);
    // Experimental, symmetrical fallback at genuinely unsupported owner
    // roots only. Unlike the actor policy, native Tactics may inspect hidden
    // information. Every selected root remains competitively unqualified.
    if(audit.nativeOwnerTrainerFallback&&intent.kind==='pass'&&
       intent.reason==='no-supported-owner-visible-root'){
      const bridge=require('./agent50-native-owner-trainer-pass-bridge.cjs');
      const stats=audit.nativeOwnerTrainerFallback;
      stats.attemptedUnsupportedPasses++;
      if(deps.ownerFallbackDiagnosticView===true&&
         stats.firstUnsupportedOwnerRoot===null){
        stats.firstUnsupportedOwnerRoot=
          require('./agent2-first-unsupported-owner-root-observer.cjs')
            .snapshotFirstUnsupportedOwnerRoot(view);
      }
      if(trainerCatalog===null)trainerCatalog=getNativeTrainerCatalog();
      const nativeAction=original.value.call(this,state);
      const proposal=bridge.classifyNativeTrainerAfterPass(
        view,nativeAction,trainerCatalog,PlayCardAction,ownerTurnReceipt);
      if(proposal.selected){
        stats.selectedNativeTrainerRoots++;
        const receipt={seat,globalTurn:view.globalTurn,
          printing:proposal.printing,handIndex:proposal.handIndex,
          type:proposal.type,nativeDispatch:'not-dispatched',
          paperPaymentVerified:false,cardSpecificLegal:false};
        if(stats.receipts.length<40)stats.receipts.push(receipt);
        else stats.receiptsOmitted++;
        nativeTrainerFallbackActions.set(nativeAction,receipt);
        return nativeAction;
      }
      stats.declinedByReason[proposal.reason]=
        (stats.declinedByReason[proposal.reason]??0)+1;
    }
    if(intent.sourceAbility==='Almighty Evolution'&&audit.dittoStage1)
      audit.dittoStage1.selected++;
    if(intent.kind==='skyliner-free-retreat')
      audit.skylinerFundedBenchRetreatSelected++;
    if(intent.kind==='play-temple-dde-denial')
      audit.templeDdeDenialSelected++;
    if(intent.kind==='play-arven-for-hood')
      audit.arvenHoodSearchRootSelected++;
    if(intent.kind==='use-underworld-door')
      audit.underworldDoorRootSelected++;
    if(intent.kind==='play-path-underworld-stadium-counter')
      audit.pathUnderworldStadiumCounterSelected++;
    if(intent.source===require(
      './2026-11/agent6-funded-mimikyu-apex-promotion.cjs').VERSION){
      if(intent.kind==='paid-retreat')
        audit.mimikyuApexFundedPromotionSelected++;
      if(intent.kind==='attack')
        audit.mimikyuApexCopycatSelected++;
    }
    if(intent.source==='agent31-shadow-rider-funded-bench-floatstone-v1')
      audit.fundedVmaxFloatStoneRootSelected++;
    if(intent.source==='agent31-zero-energy-strand-to-funded-ko-v1')
      audit.zeroEnergyStrandFloatStoneRootSelected++;
    if(intent.source==='agent2-one-basic-retreat-funding-bridge-v1'){
      if(intent.kind==='attach-basic-energy')
        audit.retreatFundingBridgeAttachmentsSelected++;
      if(intent.kind==='paid-retreat')
        audit.retreatFundingBridgeRetreatsSelected++;
    }
    if(intent.source==='agent42-owner-two-unit-paid-retreat-v1')
      audit.twoUnitPaidRetreatRootSelected++;
    if(intent.source==='agent42-owner-two-unit-paid-retreat-v2'){
      audit.twoUnitPaidRetreatRootV2Selected++;
      if(seat===0||seat===1)
        audit.twoUnitPaidRetreatRootV2SelectedBySeat[seat]++;
      else audit.twoUnitPaidRetreatRootV2SelectedUnknownSeat++;
    }
    if(intent.source==='agent42-paid-retreat-v2-floatstone-arbitration')
      audit.twoUnitPaidRetreatV2FreeToolSelected++;
    if(intent.underworldActiveFundingThresholdV2===true)
      audit.underworldActiveFundingThresholdV2Selected++;
    else if(intent.singleHeldPsychicContestedByUnderworld===true)
      audit.underworldActiveFundingPrioritySelected++;
    if(intent.source==='rank13-dragon-donor')
      audit.regidragoDonorQuickBallIntentCount++;
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
          player:ownerPlayerType,
          slot:intent.slot==='bench'?SlotType.BENCH:SlotType.ACTIVE,
          index:intent.index});
        break;
      case 'bench-basic':
      case 'play-robo-after-jet':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:ownerPlayerType,slot:SlotType.BENCH,index:intent.benchIndex});
        break;
      case 'equip-bunnelby-tm':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:ownerPlayerType,
          slot:intent.slot==='bench'?SlotType.BENCH:SlotType.ACTIVE,
          index:intent.slot==='bench'?intent.index:0});
        break;
      case 'play-tactical-switch':
      case 'play-opponent-block-switch':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'attach-emergency-floatstone':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:ownerPlayerType,slot:SlotType.ACTIVE,index:0});
        break;
      case 'use-forest-star-alchemy':
        action=new UseAbilityAction(ownerId,'Star Alchemy',{
          player:ownerPlayerType,
          slot:intent.slot==='bench'?SlotType.BENCH:SlotType.ACTIVE,
          index:intent.slot==='bench'?intent.index:0
        });
        break;
      case 'attach-tool-candidate':
        action=require('./agent18-native-tool-play-action.cjs')
          .buildNativeOwnerToolCandidateAction(
            view,catalog,intent,ownerId,
            {PlayCardAction,PlayerType,SlotType});
        break;
      case 'equip-powerglass':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:ownerPlayerType,slot:SlotType.ACTIVE,index:0});
        break;
      case 'attach-special-energy':
      case 'attach-basic-energy':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:ownerPlayerType,
          slot:intent.slot==='bench'?SlotType.BENCH:SlotType.ACTIVE,
          index:intent.slot==='bench'?intent.index:0});
        break;
      case 'play-faba-jet-hood':
      case 'play-nest-after-jet':
      case 'play-plumeria-payment-menu':
      case 'play-held-guzma-mobility':
      case 'play-guzma-forced-nominal-ko':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'play-seeker-get-guzma':
      case 'play-seeker-get-faba':
      case 'play-seeker-get-crispin':
      case 'play-seeker-get-lillie':
      case 'play-seeker-recovered-lillie':
      case 'play-seeker-get-research':
      case 'play-seeker-recovered-research':
      case 'play-carmine-first':
      case 'play-lowhand-lillie':
      case 'play-stranded-marnie':
      case 'play-team-flare-grunt-denial':
      case 'play-eri-reveal':
      case 'play-conservative-shuffle-supporter':
      case 'play-ranger-paid-gx':
      case 'play-ranger-budew-item-lock':
      case 'play-arven-for-hood':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'play-regidrago-crispin':
      case 'play-regidrago-battle-compressor':
      case 'play-mysterious-treasure':
      case 'play-quick-ball':
      case 'play-mew-ultra-ball':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'play-tropical-beach':
      case 'play-players-ceremony':
      case 'play-temple-dde-denial':
      case 'play-sky-field':
      case 'play-path-to-peak':
      case 'play-path-underworld-stadium-counter':
      case 'play-thunder-mountain':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        break;
      case 'attach-dce':
        action=new PlayCardAction(ownerId,intent.handIndex,{
          player:ownerPlayerType,slot:SlotType.ACTIVE,index:0});
        break;
      case 'retreat-emergency-floatstone':
        action=new RetreatAction(ownerId,intent.benchIndex);
        break;
      case 'paid-retreat':
      case 'skyliner-rondo-retreat':
      case 'skyliner-free-retreat':
        action=new RetreatAction(ownerId,intent.benchIndex);
        break;
      case 'use-underworld-door':
      case 'use-genesect-fusion-draw':
        action=new UseAbilityAction(ownerId,intent.abilityName,{
          player:ownerPlayerType,
          slot:intent.position==='bench'?SlotType.BENCH:SlotType.ACTIVE,
          index:intent.position==='bench'?intent.benchIndex:0
        });
        break;
      case 'use-farewell-letter':
        action=new UseAbilityAction(ownerId,intent.abilityName,{
          player:ownerPlayerType,slot:SlotType.BENCH,
          index:intent.benchIndex});
        break;
      case 'perfection':
        action=new UseAbilityAction(ownerId,'Perfection',{
          player:ownerPlayerType,slot:SlotType.ACTIVE,index:0});
        break;
      case 'attack':action=new AttackAction(ownerId,intent.attackName);break;
      case 'use-tropical-beach':
      case 'use-players-ceremony':
        action=new UseStadiumAction(ownerId);break;
      case 'pass':action=new PassTurnAction(ownerId);break;
      default:throw new Error('Unknown actor-only intent: '+intent.kind);
    }
    if(intent.source===require(
      './2026-11/agent6-funded-mimikyu-apex-promotion.cjs').VERSION&&
      intent.kind==='attack'){
      const tracker=copycatHistoryByStore.get(nativeStore);
      const choices=tracker?.getCopycatChoices(state.players[1-seat].id)??[];
      const selected=choices[intent.previousChoiceIndex];
      assert.ok(selected&&selected.turn===intent.previousOpponentTurn);
      assert.equal(selected.sourceCardFullName,intent.previousOpponentSource);
      assert.equal(selected.attackName,intent.previousOpponentAttack);
      assert.equal(selected.gxAttack,false);
      copycatHistoryByAction.set(action,{copycatPlayerId:ownerId,selected});
    }
    if(intent.source===require('./agent7-copycat-history-root.cjs').VERSION){
      const tracker=copycatHistoryByStore.get(nativeStore);
      const opponentId=state.players[1-seat].id;
      const choices=tracker?.getCopycatChoices(opponentId)??[];
      const selected=choices[intent.previousChoiceIndex];
      assert.ok(selected,'Copycat intent must map to its exact native tracker choice');
      assert.equal(selected.turn,intent.previousTurn);
      assert.equal(selected.sourceCardFullName,intent.previousSource);
      assert.equal(selected.attackName,intent.previousAttack);
      assert.equal(selected.barragePairRole??null,intent.previousBarragePairRole??null);
      assert.equal(selected.gxAttack,false);
      assert.equal(selected.copycatAttack,false);
      copycatHistoryByAction.set(action,{copycatPlayerId:ownerId,selected});
    }
    audit.selectedRootDecisions++;
    if(audit.losslessNativeRootJoinOptIn||
       (audit.nativePlumeriaChoiceOptIn&&
        intent.kind==='play-plumeria-payment-menu')||
       (audit.nativeZeroCostDenialChoiceOptIn&&
        intent.kind==='play-team-flare-grunt-denial'))
      actorNativeActionMetadata.set(action,Object.freeze({
        seat,policyDecisionOrdinal:audit.selectedRootDecisions,
        kind:intent.kind,handIndex:intent.handIndex??null,
        printing:intent.printing??null
      }));
    typedDecisions.set(action,{globalTurn:view.globalTurn,seat,kind:intent.kind,
      ...((audit.losslessNativeRootJoinOptIn||
          audit.terminalArbitrationOptIn||audit.sameRootProposalChoiceOptIn)?{
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
      if(audit.copycatHistoryRootOptIn&&!copycatHistoryByStore.has(this)){
        const tracker=require('./copycat-multiattack-history.cjs')
          .installCopycatMultiAttackHistory(this);
        copycatHistoryByStore.set(this,tracker);
        copycatHistoryTrackers.push(tracker);
        audit.copycatHistoryRoot.trackerStores++;
      }
      pendingFarewellBySeat.clear();
      pendingGenesectBySeat.clear();
      ownerRank7BridgePending.clear();
      genesectDrawUsedTurnBySeat.clear();
    }
    if(this===nativeStore&&
       action?.constructor?.name==='ResolvePromptAction'&&
       (pendingFarewellBySeat.size>0||pendingGenesectBySeat.size>0)){
      const result=beforeDispatch.value.apply(this,[action,...args]);
      for(const [seat,pending] of pendingFarewellBySeat){
        const current=rootPhysicalSnapshot(this.state,seat,pending.intent);
        const effect=rootPhysicalWitness(pending.intent,pending.before,
          current,engineGamePhase());
        pending.receipt.deferredPromptActions++;
        if(effect==='confirmed-public-effect'){
          pending.receipt.deferredStatus='confirmed-after-prompt';
          audit.nativePhysicalPending--;
          audit.nativePhysicalConfirmed++;
          audit.nativePhysicalConfirmedByIntent['use-farewell-letter']=
            (audit.nativePhysicalConfirmedByIntent['use-farewell-letter']??0)+1;
          pending.receipt.deferredAfter={
            bench:current.farewellBenchPrinting,
            discarded:current.farewellDiscardCount,
            deck:current.deckCount,hand:current.handCount,
            prizes:current.farewellPrizeCounts
          };
          pendingFarewellBySeat.delete(seat);
        }else if(!(this.state.prompts??[]).some(p=>p.result===undefined)){
          pending.receipt.deferredStatus='prompt-closed-without-effect';
          audit.nativePhysicalPending--;
          audit.nativePhysicalUnconfirmed++;
          audit.nativePhysicalUnconfirmedByIntent['use-farewell-letter']=
            (audit.nativePhysicalUnconfirmedByIntent['use-farewell-letter']??0)+1;
          pendingFarewellBySeat.delete(seat);
        }
      }
      for(const [seat,pending] of pendingGenesectBySeat){
        const current=rootPhysicalSnapshot(this.state,seat,pending.intent);
        const effect=rootPhysicalWitness(pending.intent,pending.before,
          current,engineGamePhase());
        pending.receipt.promptResolutions++;
        if(effect==='confirmed-public-effect'){
          pending.receipt.status='confirmed-after-native-prompt';
          pending.receipt.after={hand:current.handCount,deck:current.deckCount};
          audit.nativePhysicalPending--;
          audit.nativePhysicalConfirmed++;
          audit.genesectFusionNativeConfirmed++;
          audit.nativePhysicalConfirmedByIntent['use-genesect-fusion-draw']=
            (audit.nativePhysicalConfirmedByIntent['use-genesect-fusion-draw']??0)+1;
          pendingGenesectBySeat.delete(seat);
        }else if(!(this.state.prompts??[]).some(p=>p.result===undefined)){
          pending.receipt.status='prompt-closed-without-draw';
          pending.receipt.after={hand:current.handCount,deck:current.deckCount};
          audit.nativePhysicalPending--;
          audit.nativePhysicalUnconfirmed++;
          audit.nativePhysicalUnconfirmedByIntent['use-genesect-fusion-draw']=
            (audit.nativePhysicalUnconfirmedByIntent['use-genesect-fusion-draw']??0)+1;
          pendingGenesectBySeat.delete(seat);
        }
      }
      return result;
    }
    if(this===nativeStore&&
       action?.constructor?.name==='ResolvePromptAction'&&
       ownerRank13CrispinPending.size>0){
      const pending=this.state.prompts?.find(p=>p.result===undefined);
      const token=ownerRank13CrispinPending.get(pending?.playerId);
      if(token?.stage==='search'&&token.promptId===pending?.id)
        assert.ok(typedRank13CrispinReplies.has(action),
          'Real source Crispin energy search cannot fall back to generic bot');
    }
    const crispinReply=this===nativeStore?
      typedRank13CrispinReplies.get(action):undefined;
    if(crispinReply){
      const token=ownerRank13CrispinPending.get(crispinReply.ownerId);
      assert.ok(token&&token.seat===crispinReply.seat&&
        token.stage===crispinReply.stage,
        'Crispin native reply must match source owner and current stage');
      const result=beforeDispatch.value.apply(this,[action,...args]);
      const owner=this.state.players[crispinReply.seat];
      if(crispinReply.stage==='search'){
        // Crispin allows one Basic Energy if the other type is Prized.
        // That branch puts it in hand without opening an attach prompt.
        if(crispinReply.chosen.length===2)token.stage='attach';
        else ownerRank13CrispinPending.delete(crispinReply.ownerId);
        audit.rank13CrispinNativeSearchAccepted++;
      }else{
        assert.ok(owner.bench[crispinReply.targetIndex].energies.cards
          .includes(crispinReply.chosen),
          'Crispin native response must attach the exact Grass physical card');
        ownerRank13CrispinPending.delete(crispinReply.ownerId);
        audit.rank13CrispinNativeBenchAttachmentsAccepted++;
      }
      return result;
    }
    const compressorReply=this===nativeStore?
      typedEarlyCompressorReplies.get(action):undefined;
    if(compressorReply){
      const owner=this.state.players[compressorReply.seat];
      assert.equal(owner?.id,compressorReply.ownerId);
      const donors=compressorReply.chosen;
      const beforeDeckSize=owner.deck.cards.length;
      assert.ok(donors.every(card=>owner.deck.cards.includes(card)),
        'Compressor donor objects must be in the owner deck before dispatch');
      const result=beforeDispatch.value.apply(this,[action,...args]);
      const after=this.state.players[compressorReply.seat];
      assert.ok(donors.every(card=>
        !after.deck.cards.includes(card)&&after.discard.cards.includes(card)),
        'Native Compressor failed to physically move selected Dragons');
      assert.equal(after.deck.cards.length,beforeDeckSize-donors.length,
        'Compressor owner-deck physical count differs from selected donor count');
      ownerEarlyCompressorPending.delete(compressorReply.ownerId);
      audit.earlyRegidragoCompressorPromptsAccepted++;
      audit.earlyRegidragoCompressorDonorsMoved+=donors.length;
      return result;
    }
    const rank7Reply=this===nativeStore?
      typedRank7BridgeReplies.get(action):undefined;
    if(rank7Reply){
      const token=ownerRank7BridgePending.get(rank7Reply.ownerId);
      assert.ok(token&&token.seat===rank7Reply.seat,
        'rank7 Faba/Nest prompt token must be source-owned');
      const result=beforeDispatch.value.apply(this,[action,...args]);
      audit.rank7FabaJetBridgePromptsAccepted++;
      const waiting=this.state.prompts?.find(p=>p.result===undefined);
      if(rank7Reply.kind==='faba-select-tool'){
        assert.equal(waiting?.type,'Choose pokemon');
        token.promptId=waiting.id;
        token.stage='pokemon';
      }else if(rank7Reply.kind==='faba-target-hooded-vileplume'){
        const opponent=this.state.players[1-rank7Reply.seat];
        assert.ok(opponent.lostzone.cards.some(c=>
          c.fullName.startsWith('Stealthy Hood ')),
          'Faba must place actual opposing Hood in own Lost Zone');
        ownerRank7BridgePending.delete(rank7Reply.ownerId);
      }else if(rank7Reply.kind==='nest-select-actual-owner-deck-basic'){
        const owner=this.state.players[rank7Reply.seat];
        assert.ok(owner.bench.some(slot=>
          slot.getPokemonCard()?.fullName===rank7Reply.printing),
          'Authenticated Nest Ball must physically Bench selected source Basic');
        ownerRank7BridgePending.delete(rank7Reply.ownerId);
      }else throw new Error('Unexpected rank7 owner prompt '+rank7Reply.kind);
      return result;
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
        'VS Seeker native owner prompt failed to recover requested Supporter');
      assert.equal(afterDiscard,beforeDiscard-1,
        'VS Seeker native owner prompt did not remove requested Supporter');
      ownerSeekerPending.delete(seekerReply.ownerId);
      if(seekerReply.printing.startsWith("Professor's Research "))
        audit.seekerResearchPromptsAccepted++;
      else if(seekerReply.printing==='Crispin SCR')
        audit.seekerCrispinPromptsAccepted++;
      else if(seekerReply.printing==='Faba LOT')
        audit.jetPostSeekerFabaPromptsAccepted++;
      else if(require('./agent2-held-guzma-mobility-frontier.cjs')
        .isGuzma(seekerReply.printing))
        audit.seekerGuzmaPromptsAccepted++;
      else audit.seekerLilliePromptsAccepted++;
      return result;
    }
    const choice=this===nativeStore?typedDecisions.get(action):undefined;
    if(!choice){
      const fallback=this===nativeStore?
        nativeTrainerFallbackActions.get(action):undefined;
      if(!fallback)return beforeDispatch.value.apply(this,[action,...args]);
      try{
        const result=beforeDispatch.value.apply(this,[action,...args]);
        fallback.nativeDispatch='native-accepted';
        audit.nativeOwnerTrainerFallback.acceptedNativeTrainerRoots++;
        return result;
      }catch(error){
        fallback.nativeDispatch='native-rejected';
        fallback.nativeError=String(error?.message||error).slice(0,240);
        audit.nativeOwnerTrainerFallback.rejectedNativeTrainerRoots++;
        throw error;
      }
    }
    const before=publicDispatchState(this);
    const ownerBefore=before===null?null:
      rootPhysicalSnapshot(this.state,choice.seat,choice.intent);
    try{
      let result;
      const selectedHistory=copycatHistoryByAction.get(action);
      if(selectedHistory){
        assert.ok(action instanceof AttackAction&&action.name==='Copycat',
          'Selected prior-turn history may only be dispatched through Copycat');
        const opponent=this.state.players.find(player=>
          player.id!==selectedHistory.copycatPlayerId);
        assert.ok(opponent&&selectedHistory.selected.playerId===opponent.id);
        const history=this.state.playerLastAttack;
        assert.ok(history&&history[opponent.id],
          'Copycat requires the native prior-attack record to restore after dispatch');
        const prior=history[opponent.id];
        history[opponent.id]={attack:selectedHistory.selected.attack,
          sourceCard:selectedHistory.selected.sourceCard};
        try{
          result=beforeDispatch.value.apply(this,[action,...args]);
        }finally{
          history[opponent.id]=prior;
          copycatHistoryByAction.delete(action);
        }
        audit.copycatHistoryRoot.historyOverrides++;
      }else{
        result=beforeDispatch.value.apply(this,[action,...args]);
      }
      if(choice.kind==='play-faba-jet-hood'||choice.kind==='play-nest-after-jet'){
        const owner=this.state.players[choice.seat];
        const pending=this.state.prompts?.find(p=>p.result===undefined);
        const expected=choice.kind==='play-faba-jet-hood'?
          'Select':'Choose cards';
        assert.ok(owner&&pending&&pending.playerId===owner.id&&
          pending.type===expected,
          'Accepted rank7 Faba/Nest root must expose a real owner prompt');
        if(choice.kind==='play-nest-after-jet')
          assert.equal(pending.cards,owner.deck,
            'Nest Ball must grant actual owner-deck search entitlement');
        assert.ok(!ownerRank7BridgePending.has(owner.id),
          'Do not overlap protected Faba/Nest owner prompt chains');
        ownerRank7BridgePending.set(owner.id,{
          seat:choice.seat,promptId:pending.id,
          kind:choice.kind==='play-faba-jet-hood'?'faba':'nest',
          stage:choice.kind==='play-faba-jet-hood'?'choice':'search'});
      }
      if(choice.kind==='play-arven-for-hood'){
        const owner=this.state.players[choice.seat];
        const pending=this.state.prompts?.find(p=>p.result===undefined);
        if(owner&&pending&&
           pending.constructor?.name==='ChooseCardsPrompt'&&
           pending.playerId===owner.id&&
           pending.cards===owner.deck){
          assert.ok(!ownerArvenPending.has(owner.id));
          ownerArvenPending.set(owner.id,{
            seat:choice.seat,promptId:pending.id});
        }
      }
      if(choice.kind==='play-eri-reveal'){
        const owner=this.state.players[choice.seat];
        const rival=this.state.players[1-choice.seat];
        const pending=this.state.prompts?.find(p=>p.result===undefined);
        const {SuperType,TrainerType}=deps.eriCardTypes??
          require('../../vendor/twinleaf/ptcg-server/output/game/store/card/card-types');
        assert.ok(owner&&rival&&pending&&
          require('./agent50-eri-revealed-item-prompt.cjs')
            .observeEriRevealedItems(this.state,choice.seat,pending,
              SuperType,TrainerType)!==null,
          'Native Eri root failed to create authenticated opponent-hand reveal');
        assert.ok(!ownerEriPending.has(owner.id));
        ownerEriPending.set(owner.id,{seat:choice.seat,
          promptId:pending.id,globalTurn:choice.globalTurn});
      }
      if(choice.kind==='play-regidrago-crispin'){
        const owner=this.state.players[choice.seat];
        const pending=this.state.prompts?.find(p=>p.result===undefined);
        assert.ok(owner&&pending&&
          pending.constructor?.name==='ChooseCardsPrompt'&&
          pending.playerId===owner.id&&pending.cards===owner.deck&&
          owner.supporter.cards.some(card=>card.fullName==='Crispin SCR'),
          'Real Crispin play must open an authentic owner-deck prompt');
        assert.ok(!ownerRank13CrispinPending.has(owner.id));
        ownerRank13CrispinPending.set(owner.id,{
          seat:choice.seat,stage:'search',promptId:pending.id
        });
      }
      if(choice.kind==='play-regidrago-battle-compressor'){
        const owner=this.state.players[choice.seat];
        const pending=this.state.prompts?.find(p=>p.result===undefined);
        assert.ok(owner&&pending&&
          pending.constructor?.name==='ChooseCardsPrompt'&&
          pending.playerId===owner.id&&
          pending.message==='CHOOSE_CARD_TO_DISCARD'&&
          pending.cards===owner.deck&&
          owner.supporter.cards.some(card=>
            card.fullName==='Battle Compressor PHF'),
          'Native early Compressor did not expose its authenticated owner-deck prompt');
        assert.ok(!ownerEarlyCompressorPending.has(owner.id));
        ownerEarlyCompressorPending.set(owner.id,{
          seat:choice.seat,promptId:pending.id});
      }
      if(choice.kind==='play-seeker-get-faba'||
         choice.kind==='play-seeker-get-crispin'||
         choice.kind==='play-seeker-get-guzma'||
         choice.kind==='play-seeker-get-lillie'||
         choice.kind==='play-seeker-get-research'){
        const owner=this.state.players[choice.seat];
        const pending=this.state.prompts?.find(p=>p.result===undefined);
        assert.ok(owner&&pending&&
          pending.constructor?.name==='ChooseCardsPrompt'&&
          pending.playerId===owner.id&&
          pending.cards===owner.discard,
          'Native VS Seeker root did not create its authenticated own-discard prompt');
        assert.ok(!ownerSeekerPending.has(owner.id));
        ownerSeekerPending.set(owner.id,{seat:choice.seat,
          promptId:pending.id,
          target:choice.intent.target,globalTurn:choice.globalTurn});
      }
      const after=publicDispatchState(this);
      const ownerAfter=ownerBefore===null||after===null?null:
        rootPhysicalSnapshot(this.state,choice.seat,choice.intent);
      // Underworld Door opens a native AttachEnergyPrompt. The root dispatch
      // alone cannot certify attachment, two draws or once-per-VMAX usage;
      // preserve acceptance as pending/unconfirmed until a separate
      // physical post-prompt witness exists.
      const physical=ownerAfter===null?null:
        ['use-underworld-door','play-faba-jet-hood',
          'play-nest-after-jet'].includes(choice.kind)?
          // Faba and Nest root actions are pending authentic owner prompts.
          // Their physical payoff is checked when those prompts settle.
          'no-confirmed-public-effect':
          rootPhysicalWitness(choice.intent,ownerBefore,ownerAfter,
            engineGamePhase());
      const waiting=(this.state.prompts??[])
        .filter(p=>p.result===undefined);
      const farewellPending=choice.kind==='use-farewell-letter'&&
        waiting.some(p=>p.type==='WaitPrompt');
      const genesectPending=choice.kind==='use-genesect-fusion-draw'&&
        physical==='no-confirmed-public-effect'&&
        waiting.some(p=>p.constructor?.name==='WaitPrompt');
      const deferredPending=farewellPending||genesectPending;
      if(choice.kind==='use-genesect-fusion-draw'&&
          audit.genesectFusionReceipts.length<64){
        const receipt={seat:choice.seat,globalTurn:choice.globalTurn,
          before:{hand:ownerBefore.handCount,deck:ownerBefore.deckCount},
          immediatelyAfter:{hand:ownerAfter.handCount,deck:ownerAfter.deckCount},
          status:genesectPending?'awaiting-native-prompt':
            physical==='confirmed-public-effect'?'confirmed-immediately':
            'no-confirmed-draw',
          promptResolutions:0};
        audit.genesectFusionReceipts.push(receipt);
        if(genesectPending){
          assert.ok(!pendingGenesectBySeat.has(choice.seat));
          pendingGenesectBySeat.set(choice.seat,{
            intent:choice.intent,before:ownerBefore,receipt
          });
        }
      }
      if(physical==='confirmed-public-effect'){
        audit.nativePhysicalConfirmed++;
        audit.nativePhysicalConfirmedByIntent[choice.kind]=
          (audit.nativePhysicalConfirmedByIntent[choice.kind]??0)+1;
      }
      if(physical==='no-confirmed-public-effect'&&!deferredPending){
        audit.nativePhysicalUnconfirmed++;
        audit.nativePhysicalUnconfirmedByIntent[choice.kind]=
          (audit.nativePhysicalUnconfirmedByIntent[choice.kind]??0)+1;
      }
      if(deferredPending)audit.nativePhysicalPending++;
      if(physical==='attack-needs-declaration')audit.nativeAttackNeedsDeclaration++;
      const witnessed=before!==null&&after!==null;
      const publicZonesChanged=witnessed&&
        before.publicZonesSha256!==after.publicZonesSha256;
      const turnOrPhaseChanged=witnessed&&
        (before.turn!==after.turn||
          before.activePlayer!==after.activePlayer||
          before.phase!==after.phase);
      if(choice.kind==='use-farewell-letter'&&
         audit.farewellLetterReceipts.length<64){
        const sample=s=>({
          bench:s?.farewellBenchPrinting??null,
          discarded:s?.farewellDiscardCount??null,
          deck:s?.deckCount??null,hand:s?.handCount??null,
          prizes:s?.farewellPrizeCounts??null
        });
        const waiting=(this.state.prompts??[])
          .filter(prompt=>prompt.result===undefined);
        const receipt={
          seat:choice.seat,globalTurn:choice.globalTurn,
          before:sample(ownerBefore),after:sample(ownerAfter),
          pendingPromptTypes:waiting.slice(0,5)
            .map(prompt=>prompt.constructor?.name??'UnknownPrompt'),
          physical,publicZonesChanged,turnOrPhaseChanged,
          deferredStatus:'no-prompt',deferredPromptActions:0
        };
        audit.farewellLetterReceipts.push(receipt);
        if(physical==='confirmed-public-effect')
          receipt.deferredStatus='confirmed-immediately';
        else if(waiting.some(prompt=>prompt.constructor?.name==='WaitPrompt')){
          assert.ok(!pendingFarewellBySeat.has(choice.seat),
            'Farewell Letter prompt overlaps an unresolved owner Ability');
          pendingFarewellBySeat.set(choice.seat,{
            intent:choice.intent,before:ownerBefore,receipt
          });
          receipt.deferredStatus='awaiting-prompt';
        }
      }
      audit.acceptedActorRoots++;
      if(choice.intent.sourceAbility==='Almighty Evolution'&&audit.dittoStage1){
        const d=audit.dittoStage1;
        d.accepted++;
        if(physical==='confirmed-public-effect')d.physicallyConfirmed++;
        d.records.push({seat:choice.seat,globalTurn:choice.globalTurn,
          printing:choice.intent.printing,slot:choice.intent.slot,
          index:choice.intent.index,physical});
      }
      if(choice.kind==='use-genesect-fusion-draw'){
        genesectDrawUsedTurnBySeat.set(choice.seat,choice.globalTurn);
        audit.genesectFusionNativeAccepted++;
      }
      if(choice.intent.source==='rank13-dragon-donor')
        audit.regidragoDonorQuickBallNativeAccepted++;
      if(audit.losslessNativeRootJoinOptIn){
        const bound=actorNativeActionReceipt(action);
        audit.nativeRootJoinReceipts.push({
          seat:choice.seat,globalTurn:choice.globalTurn,
          policyDecisionOrdinal:choice.policyDecisionOrdinal,
          nativeStoreActionOrdinal:bound?.nativeStoreActionOrdinal??null,
          kind:choice.kind,accepted:true,
          nativePhysicalEffect:deferredPending?'pending-animation-prompt':physical,
          publicTransitionWitnessed:witnessed,publicZonesChanged,
          turnOrPhaseChanged
        });
      }
      if(witnessed)audit.publicTransitionWitnesses++;
      if(publicZonesChanged||turnOrPhaseChanged)audit.publicTransitionChanges++;
      if(audit.nativeRootAcceptances.length<64)
        audit.nativeRootAcceptances.push({...choice,accepted:true,
          publicTransitionWitnessed:witnessed,
          publicZonesChanged,turnOrPhaseChanged,
          nativePhysicalEffect:deferredPending?'pending-animation-prompt':physical,
          before,after});
      return result;
    }catch(error){
      audit.rejectedActorRoots++;
      if(choice.intent.sourceAbility==='Almighty Evolution'&&audit.dittoStage1)
        audit.dittoStage1.rejected++;
      if(choice.intent.source==='rank13-dragon-donor')
        audit.regidragoDonorQuickBallNativeRejected++;
      if(audit.losslessNativeRootJoinOptIn){
        const bound=actorNativeActionReceipt(action);
        audit.nativeRootJoinReceipts.push({
          seat:choice.seat,globalTurn:choice.globalTurn,
          policyDecisionOrdinal:choice.policyDecisionOrdinal,
          nativeStoreActionOrdinal:bound?.nativeStoreActionOrdinal??null,
          kind:choice.kind,accepted:false,
          errorDigest:createHash('sha256').update(String(error))
            .digest('hex')
        });
      }
      if(audit.nativeRootAcceptances.length<64)
        audit.nativeRootAcceptances.push({...choice,accepted:false,error:String(error)});
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{...original,value:wrapped});
  Object.defineProperty(Store.prototype,'dispatch',{...beforeDispatch,value:dispatchObserved});
  try{return {result:run(),audit};}
  catch(error){
    // The normal returned root audit is unavailable when the native decoder
    // throws. Preserve only actor-owned aggregate counters, never hands.
    if(error&&typeof error==='object'&&audit.nativeOwnerTrainerFallback){
      const fallback=audit.nativeOwnerTrainerFallback;
      error.actorNativeTrainerFallbackAbortAudit={
        schema:'actor-native-trainer-fallback-abort-v1',
        rootInstalled:true,
        attemptedUnsupportedPasses:fallback.attemptedUnsupportedPasses,
        selectedNativeTrainerRoots:fallback.selectedNativeTrainerRoots,
        acceptedNativeTrainerRoots:fallback.acceptedNativeTrainerRoots,
        rejectedNativeTrainerRoots:fallback.rejectedNativeTrainerRoots,
        declinedByReason:{...fallback.declinedByReason},
        ...(deps.ownerFallbackDiagnosticView===true?{
          firstUnsupportedOwnerRoot:fallback.firstUnsupportedOwnerRoot
        }:{})
      };
    }
    throw error;
  }
  finally{
    for(const tracker of copycatHistoryTrackers)tracker.restore();
    assert.strictEqual(Store.prototype.dispatch,dispatchObserved);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,wrapped);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}
module.exports={VERSION,buildActorCardCatalog,chooseActorRootIntent,
  invokeActorRootIntentProvider,
  actorSpecialEnergyEnabled,publicDispatchState,withActorOnlyRootPolicy,
  actorNativeActionReceipt,bindActorNativeStoreOrdinal};
