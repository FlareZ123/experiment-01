'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent7-canonical-actor-five-component-v2';
const OWNER_SEARCH_VERSION = 'agent41-canonical-actor-six-component-v3-owner-single-search';
const SPARSE_OWNER_SEARCH_VERSION =
  'agent22-canonical-actor-six-component-v4-sparse-owner-search';
const HAND_DISCARD_VERSION = 'agent47-canonical-hand-discard-v6';
const GENERIC_FALLBACK_VERSION =
  'agent7-canonical-actor-attributed-generic-fallback-v5';
const POKEMON_PROMPT_VERSION = 'agent8-canonical-actor-choose-pokemon-v7';

/**
 * Install one ordered actor-observation-only root/prompt decision chain around
 * the unchanged canonical bilateral development executable. The last-installed
 * handler sees decisions first. Copied-attack, SelectOption and Select prompts take
 * precedence over Fog Crystal's Item/search channel, which precedes the
 * generic Basic/Energy/printed-attack root choice.
 *
 * Fallbacks remain observable and unqualified. A source-specific scripted
 * pressure wrapper inside the canonical executor is also not evidence of
 * an independent competent opposing policy.
 *
 * @template T
 * @param {()=>T} execute Synchronous genuine pinned-Store workload.
 * @param {{root?:Function,fog?:Function,select?:Function,option?:Function,attack?:Function,ownerSearch?:Function,pokemon?:Function,guzma?:Function}} [adapters]
 *   Test injection only. Real components have their own pinned-Store tests.
 * @param {{ownerSingleSearch?:boolean,genericFallbackAttribution?:boolean,
 *   actorChoosePokemon?:boolean,guzmaOwnerPromptContinuation?:boolean,
 *   ownerVipAfterPass?:boolean,ownerPlumeriaAfterPass?:boolean,
 *   ownerPlumeriaOpportunity?:boolean,
 *   ownerDonorSetup?:{seat:0|1,setup?:object},
 *   rank9CompressorMaxGlobalTurn?:number}} [options]
 * Default preserves v2.
 * @returns {{result:T,audit:object}}
 */
function withCanonicalActorOnlyPolicy(execute, adapters = {}, options = {}) {
  assert.equal(typeof execute, 'function');
  assert.ok(options.guzmaNominalGust!==true||
    options.guzmaOwnerPromptContinuation===true,
    'Nominal opponent gust requires the owner Guzma continuation');
  const ownerSingleSearch = options.ownerSingleSearch===true;
  const genericFallbackAttribution = options.genericFallbackAttribution===true;
  const actorChoosePokemon = options.actorChoosePokemon===true;
  const sparseOwnerSearch=ownerSingleSearch&&
    adapters.ownerSearch===undefined&&
    process.env.AGENT22_SPARSE_OWNER_BUNDLE_DEV==='true';
  const ownerSearch = ownerSingleSearch?(adapters.ownerSearch??
    (sparseOwnerSearch?
      require('../twinleaf/agent22-sparse-owner-search-adapter.cjs')
        .withSparseActorOwnerSearch:
      require('../twinleaf/agent41-actor-owner-single-search.cjs')
        .withActorOwnerSingleSearch)):null;
  const defaultRoot=require('../twinleaf/agent34-actor-only-root-policy.cjs')
    .withActorOnlyRootPolicy;
  const root=adapters.root??(
    options.nativeOwnerTrainerFallback===true||
    options.ownerElectrodeBombCensus===true?
      work=>defaultRoot(work,{
        ...(options.nativeOwnerTrainerFallback===true?
          {nativeOwnerTrainerFallback:true}:{}),
        ...(options.ownerElectrodeBombCensus===true?
          {rank17ElectrodeBombCensus:true}:{})
      }):defaultRoot);
  const fog = adapters.fog ??
    require('../twinleaf/agent9-fog-actor-prompt.cjs')
      .withActorFogCrystalPrompt;
  const select = adapters.select ??
    require('../twinleaf/agent8-actor-only-select-prompt.cjs')
      .withActorOnlySelectPrompt;
  const option = adapters.option ??
    require('../twinleaf/agent13-actor-only-select-option.cjs')
      .withActorOnlySelectOption;
  const attack = adapters.attack ??
    require('../twinleaf/agent13-actor-only-choose-attack.cjs')
      .withActorOnlyChooseAttack;
  const pokemon = actorChoosePokemon ?
    (adapters.pokemon ??
      require('../twinleaf/agent8-actor-only-choose-pokemon.cjs')
        .withActorOnlyChoosePokemon) : null;
  const genericFallback = genericFallbackAttribution ?
    (adapters.genericFallback ??
      require('../twinleaf/agent7-native-generic-fallback-attribution.cjs')
        .withNativeGenericFallbackAttribution) : null;
  for (const component of [root, fog, select, option, attack,
    ...(ownerSingleSearch?[ownerSearch]:[]),
    ...(genericFallbackAttribution?[genericFallback]:[]),
    ...(actorChoosePokemon?[pokemon]:[])]) {
    assert.equal(typeof component, 'function');
  }

  const handDiscard = options.actorHandDiscard===true ?
    (adapters.handDiscard ??
      require('../twinleaf/agent47-actor-hand-discard.cjs')
        .withActorHandDiscard) : null;
  let handDiscardAudit = null;
  let pokemonAudit = null;
  let guzmaPromptAudit = null;
  let ownerDonorAudit = null;
  let ownerSupporterOpportunityAudit = null;
  let ownerTrainerFrontierAudit = null;
  let ownerShuffleSupporterAudit = null;
  let ownerHammerAfterPassAudit = null;
  let ownerRank9CompressorAudit = null;
  let ownerVipAfterPassAudit = null;
  let ownerVipBeforeAttackAudit = null;
  let ownerPlumeriaOpportunityAudit = null;
  let ownerPlumeriaAfterPassAudit = null;
  let ownerNativeFlarePromptAudit = null;
  const vipAfterPassOptIn=options.ownerVipAfterPass===true||
    process.env.AGENT9_BATTLE_VIP_AFTER_PASS_DEV==='true';
  const shuffleSupporterOptIn=options.ownerShuffleSupporterRoot===true||
    process.env.AGENT2_SHUFFLE_SUPPORTER_DEV==='true';
  // The last-installed handler must see root Pass AND all three Plumeria
  // prompts before lower-priority prompt handlers can consume them.
  const plumeriaAfterPassOptIn=options.ownerPlumeriaAfterPass===true;
  // Reuse the existing generic owner-hand Trainer frontier on BOTH seats.
  // It is read-only and installed closest to the actual native decision.
  const runWithTrainerFrontier=()=>{
    if(options.ownerGenericTrainerFrontier!==true)return execute();
    const adapter=adapters.trainerFrontier??
      require('../twinleaf/agent29-bilateral-owner-trainer-frontier.cjs')
        .withBilateralOwnerTrainerFrontier;
    const observed=adapter(execute,{
      ...(options.ownerTrainerRegisteredSixties?{
        ownRegisteredSixties:options.ownerTrainerRegisteredSixties
      }:{}),
      ...(options.ownerPaperNecessity===true?{
        ownerPaperNecessity:true
      }:{}),
      ...(options.ownerTrainerPublicPrizeScreen===true?{
        ownerPublicPrizeScreen:true
      }:{})
    });
    assert.ok(observed?.audit,'Generic Trainer frontier must expose audit');
    ownerTrainerFrontierAudit=observed.audit;
    return observed.result;
  };
  const runWithNativeFlarePrompt=()=>{
    if(options.sameRootNativeFreeFlareChoice!==true)return runWithTrainerFrontier();
    const bridge=require('../twinleaf/agent41-same-root-native-flare-prompt.cjs')
      .withNativeActorFlarePrompt;
    const selected=bridge(runWithTrainerFrontier);
    ownerNativeFlarePromptAudit=selected.audit;
    return selected.result;
  };
  const runWithPlumeriaAfterPass=()=>{
    if(!plumeriaAfterPassOptIn)return runWithNativeFlarePrompt();
    const adapter=adapters.plumeriaAfterPass??
      require('../twinleaf/agent4-plumeria-after-pass.cjs')
        .withOwnerPlumeriaAfterPass;
    const selected=adapter(runWithNativeFlarePrompt,{adoptActorSelectedPlumeria:
      options.sameRootNativePlumeriaChoice===true});
    ownerPlumeriaAfterPassAudit=selected.audit;
    return selected.result;
  };
  const runWithShuffleSupporter=()=>{
    if(!shuffleSupporterOptIn)return runWithPlumeriaAfterPass();
    const selected=require('../twinleaf/agent2-actor-only-shuffle-supporter-after-pass.cjs')
      .withActorOnlyShuffleSupporterAfterPass(runWithPlumeriaAfterPass);
    ownerShuffleSupporterAudit=selected.audit;
    return selected.result;
  };
  const hammerAfterPassOptIn=options.ownerHammerAfterPass===true||
    process.env.AGENT29_HAMMER_AFTER_PASS_DEV==='true';
  const runWithHammer=()=>{
    if(!hammerAfterPassOptIn)return runWithShuffleSupporter();
    const selected=require('../twinleaf/agent29-actor-hammer-after-pass.cjs')
      .withOwnerHammerAfterPass(runWithShuffleSupporter);
    ownerHammerAfterPassAudit=selected.audit;
    return selected.result;
  };
  // Default-off original rank9 after-Pass Item proposal. This is nested
  // inside the actor root, so the latter's terminal Pass cannot mask it.
  // The owner-deck Energy decision occurs only at the actual source prompt.
  const runWithRank9Compressor=()=>{
    if(options.rank9CompressorOwnerSeat===undefined)
      return runWithHammer();
    assert.ok([0,1].includes(options.rank9CompressorOwnerSeat));
    const selected=require('../twinleaf/agent29-rank9-compressor-owner-bridge.cjs')
      .withRank9CompressorAfterPass(runWithHammer,
        options.rank9CompressorOwnerSeat,
        {maxGlobalTurn:options.rank9CompressorMaxGlobalTurn??12});
    ownerRank9CompressorAudit=selected.audit;
    return selected.result;
  };
  const plumeriaOpportunityOptIn=options.ownerPlumeriaOpportunity===true||
    process.env.AGENT4_PLUMERIA_OPPORTUNITY_DEV==='true';
  const runWithPlumeriaOpportunity=()=>{
    if(!plumeriaOpportunityOptIn)return runWithRank9Compressor();
    const observer=adapters.plumeriaOpportunity??
      require('../twinleaf/agent4-plumeria-opportunity.cjs')
        .withPlumeriaOwnerOpportunity;
    const observed=observer(runWithRank9Compressor);
    ownerPlumeriaOpportunityAudit=observed.audit;
    return observed.result;
  };
  const supporterOpportunityOptIn=options.ownerSupporterOpportunity===true||
    process.env.AGENT7_OWNER_SUPPORTER_AUDIT_DEV==='true';
  // Installed after all decision adapters, so real owner-root observation
  // precedes the very first policy proposal, with all choices unchanged.
  const runWithOwnerSupporterAudit=()=>{
    if(!supporterOpportunityOptIn)return runWithPlumeriaOpportunity();
    const observer=adapters.supporterOpportunity??
      require('../twinleaf/agent7-owner-supporter-opportunity.cjs')
        .withOwnerSupporterOpportunity;
    // Experimental native card.canPlay(null) probe is independently gated:
    // no-target legality is only a diagnostic, never a paper legal proof.
    const observed=observer(runWithPlumeriaOpportunity,{nativeCanPlay:
      options.ownerSupporterNativeCanPlay===true||
      process.env.AGENT7_NATIVE_SUPPORTER_CANPLAY_DEV==='true'});
    ownerSupporterOpportunityAudit=observed.audit;
    return observed.result;
  };
  const runOwnerDonor=()=>{
    if(!options.ownerDonorSetup)return runWithOwnerSupporterAudit();
    const selected=require('../twinleaf/agent32-canonical-owner-donor-root.cjs')
      .withCanonicalOwnerDonorRoot(runWithOwnerSupporterAudit,options.ownerDonorSetup);
    ownerDonorAudit=selected.audit;
    return selected.result;
  };
  const runActor = () => {
    if(!handDiscard)return runOwnerDonor();
    const selected=handDiscard(runOwnerDonor);
    assert.ok(selected.audit && typeof selected.audit==='object',
      'Actor hand-discard adapter must expose an audit');
    handDiscardAudit=selected.audit;
    return selected.result;
  };
  const runGuzma = () => {
    if(options.guzmaOwnerPromptContinuation!==true)return runActor();
    const bridge=adapters.guzma??
      require('../twinleaf/agent43-guzma-prompt-continuation.cjs')
        .withGuzmaOwnerPromptContinuation;
    const selected=bridge(runActor,
      {nominalGust:options.guzmaNominalGust===true,
        forcedGuzmaNominalKo:options.guzmaForcedNominalKo===true,
        rank9SpecialFundedGuzma:options.rank9SpecialFundedGuzma===true});
    assert.ok(selected.audit && typeof selected.audit==='object',
      'Owner Guzma continuation must report a native audit');
    guzmaPromptAudit=selected.audit;
    return selected.result;
  };
  // The owner-recipient bridge installs inside generic ChoosePokemon, so
  // native Guzma root acceptance can be carried into the own-Bench prompt.
  const runPokemon = () => {
    if(!pokemon)return runGuzma();
    const selected=pokemon(runGuzma);
    assert.ok(selected.audit && typeof selected.audit==='object',
      'Actor ChoosePokemon requires an executed adapter audit');
    pokemonAudit=selected.audit;
    return selected.result;
  };
  const runAttack=()=>{
    const opts={};
    if(options.preferMewGenesectTechnoBlast===true)
      opts.preferMewGenesectTechnoBlast=true;
    if(options.preferMewMaxMiracleOverSelfCopy===true)
      opts.preferMewMaxMiracleOverSelfCopy=true;
    return Object.keys(opts).length>0?attack(runPokemon,opts):attack(runPokemon);
  };
  const runFog = () => fog(() => select(() => option(runAttack)),
    options.nativeAorItemLock===true?{nativeAorItemLock:true}:undefined);
  // Fog's already-owned deck search is the higher-priority actor handler.
  const runVip = () => {
    const runRemaining=()=>ownerSingleSearch?ownerSearch(runFog):runFog();
    if(!vipAfterPassOptIn)return runRemaining();
    const adapter=adapters.vipAfterPass??
      require('../twinleaf/agent9-battle-vip-owner-after-pass.cjs')
        .withActorBattleVipAfterPass;
    const observed=adapter(runRemaining);
    ownerVipAfterPassAudit=observed.audit;
    return observed;
  };
  // Root remains the terminal fallback decoder. Plumeria is nested deepest
  // so its callback is invoked first on Pass and on owner-controlled prompts.
  const runRoot = () => root(() => {
    if(options.ownerVipBeforeAttack!==true)return runVip();
    const selected=require('../twinleaf/agent10-battle-vip-before-attack.cjs')
      .withActorVipBeforeAttack(runVip,{
        preferMegaAbsolRecipient:options.ownerVipMegaAbsolTarget===true
      });
    ownerVipBeforeAttackAudit=selected.audit;
    return selected.result;
  });
  // The opt-in source-stamped typed owner prompt is installed outside the
  // root chooser. Root may delegate a later AttachEnergyPrompt to this
  // handler after its actual Store-confirmed Underworld Door root.
  let ownerUnderworldPromptAudit=null;
  const runRootWithUnderworldPrompt=()=>{
    if(options.ownerUnderworldPromptContinuation!==true)return runRoot();
    const selected=require('../twinleaf/agent34-actor-typed-energy-prompt.cjs')
      .withActorUnderworldPromptContinuation(runRoot,{
        publicAttackGapRecipient:options.ownerUnderworldAttackGapRecipient===true
      });
    assert.ok(selected?.audit&&typeof selected.audit==='object');
    ownerUnderworldPromptAudit=selected.audit;
    return selected.result;
  };
  const genericWrapped = genericFallbackAttribution?
    genericFallback(runRootWithUnderworldPrompt):null;
  const rooted = genericFallbackAttribution?
    genericWrapped.result:runRootWithUnderworldPrompt();
  const genericFallbackAudit = genericFallbackAttribution?genericWrapped.audit:null;
  if(options.ownerUnderworldPromptContinuation===true)
    assert.ok(ownerUnderworldPromptAudit,
      'Enabled owner Underworld Energy prompt adapter did not execute');
  if(actorChoosePokemon)assert.ok(pokemonAudit,
    'Actor ChoosePokemon option requires an executed adapter');
  if(options.guzmaOwnerPromptContinuation===true)assert.ok(guzmaPromptAudit,
    'Enabled owner Guzma continuation must report native evidence');
  assert.ok(options.rank9SpecialFundedGuzma!==true||
    options.guzmaOwnerPromptContinuation===true,
    'Rank9 Special-funded Guzma root requires native both-target bridge');
  assert.ok(options.guzmaForcedNominalKo!==true||
    options.guzmaOwnerPromptContinuation===true,
    'Forced Guzma root must share its native prompt continuation');
  if(handDiscard)assert.ok(handDiscardAudit,
    'Actor hand-discard option requires an executed adapter');
  if(options.ownerDonorSetup)assert.ok(ownerDonorAudit,
    'Enabled owner donor root must return its actual canonical audit');
  if(supporterOpportunityOptIn)assert.ok(ownerSupporterOpportunityAudit,
    'Enabled owner Supporter audit must have observed the live executor');
  if(options.ownerGenericTrainerFrontier===true)assert.ok(ownerTrainerFrontierAudit,
    'Enabled generic Trainer frontier must return a two-seat audit');
  if(hammerAfterPassOptIn)assert.ok(ownerHammerAfterPassAudit,
    'Enabled owner Hammer requires genuine native audit');
  if(plumeriaOpportunityOptIn)assert.ok(ownerPlumeriaOpportunityAudit,
    'Enabled Plumeria observer must have executed');
  if(plumeriaAfterPassOptIn)assert.ok(ownerPlumeriaAfterPassAudit,
    'Enabled Plumeria after-Pass adapter must have executed');
  if(options.sameRootNativeFreeFlareChoice===true)
    assert.ok(ownerNativeFlarePromptAudit,
      'Native Team Flare contender requires physically tracked prompt adapter');
  if(shuffleSupporterOptIn)assert.ok(ownerShuffleSupporterAudit,
    'Enabled actor-only shuffle Supporter must expose native audit');
  if(vipAfterPassOptIn)assert.ok(ownerVipAfterPassAudit,
    'Enabled actor-only Battle VIP Pass must expose native audit');
  if(options.ownerVipBeforeAttack===true)assert.ok(ownerVipBeforeAttackAudit,
    'Enabled attack-contended native VIP must expose owned-root audit');
  assert.ok(options.ownerVipMegaAbsolTarget!==true||options.ownerVipBeforeAttack===true,
    'Mega Absol choice requires first-turn native VIP Item opportunity');
  const vipOrSearch = rooted.result;
  const searchOrFog = vipAfterPassOptIn?vipOrSearch.result:vipOrSearch;
  const fogged = ownerSingleSearch?searchOrFog.result:searchOrFog;
  const ownerSearchAudit = ownerSingleSearch?searchOrFog.audit:null;
  const selected = fogged.result;
  const optioned = selected.result;
  const attacked = optioned.result;
  const rootAudit = rooted.audit;
  const fogAudit = fogged.audit;
  const selectAudit = selected.audit;
  const optionAudit = optioned.audit;
  const attackAudit = attacked.audit;
  for (const audit of [rootAudit, fogAudit, selectAudit, optionAudit,
    attackAudit,...(ownerSingleSearch?[ownerSearchAudit]:[]),
    ...(genericFallbackAttribution?[genericFallbackAudit]:[]),
    ...(actorChoosePokemon?[pokemonAudit]:[])]) {
    assert.ok(audit && typeof audit === 'object',
      'Each actor-only adapter must return its own audit');
  }

  const finalGenericPromptFallbacks =
    rootAudit.unsupportedPromptFallbacks ?? null;
  const audit = {
    version: (handDiscard?HAND_DISCARD_VERSION:
      genericFallbackAttribution?GENERIC_FALLBACK_VERSION:
      sparseOwnerSearch?SPARSE_OWNER_SEARCH_VERSION:
      ownerSingleSearch?OWNER_SEARCH_VERSION:VERSION)+
      (actorChoosePokemon?'+'+POKEMON_PROMPT_VERSION:'')+
      (vipAfterPassOptIn?'+'+require('../twinleaf/agent9-battle-vip-owner-after-pass.cjs').VERSION:'')+
      (ownerVipBeforeAttackAudit?'+'+ownerVipBeforeAttackAudit.version:'')+
      (plumeriaOpportunityOptIn?'+agent4-plumeria-owner-opportunity-v1':'')+
      (options.ownerGenericTrainerFrontier===true?
        '+agent29-bilateral-generic-trainer-frontier-transport-v1':'')+
      (ownerUnderworldPromptAudit?'+'+ownerUnderworldPromptAudit.version:'')+
      (plumeriaAfterPassOptIn?'+'+ownerPlumeriaAfterPassAudit.version:'')+
      (ownerNativeFlarePromptAudit?'+'+ownerNativeFlarePromptAudit.version:'')+
      (hammerAfterPassOptIn?'+agent29-hammer-after-pass-v1':'')+
      (options.guzmaOwnerPromptContinuation===true?'+'+
        require('../twinleaf/agent43-guzma-prompt-continuation.cjs').VERSION:'')+
      (options.nativeAorItemLock===true?
        '+agent8-effective-aor-item-veto-optin-v1':'')+
      (options.guzmaNominalGust===true?'+'+
        require('../twinleaf/agent43-guzma-nominal-gust-frontier.cjs').VERSION:''),
    sparseOwnerSearchOptIn:sparseOwnerSearch,
    actorHandDiscardOptIn:Boolean(handDiscard),
    ownerSupporterOpportunityOptIn:supporterOpportunityOptIn,
    ownerGenericTrainerFrontierOptIn:options.ownerGenericTrainerFrontier===true,
    ...(options.ownerElectrodeBombCensus===true?{
      ownerElectrodeBombCensusOptIn:true,
      ownerElectrodeBombCensusAudit:rootAudit.rank17ElectrodeBombCensus
    }:{}),
    ...(options.nativeOwnerTrainerFallback===true?{
      nativeOwnerTrainerFallbackOptIn:true,
      nativeOwnerTrainerFallbackAudit:rootAudit.nativeOwnerTrainerFallback
    }:{}),
    ownerUnderworldPromptContinuationOptIn:
      options.ownerUnderworldPromptContinuation===true,
    ownerUnderworldAttackGapRecipientOptIn:
      options.ownerUnderworldAttackGapRecipient===true,
    ownerUnderworldPromptAudit,
    ownerPlumeriaOpportunityOptIn:plumeriaOpportunityOptIn,
    ownerPlumeriaAfterPassOptIn:plumeriaAfterPassOptIn,
    ownerNativeFlarePromptOptIn:options.sameRootNativeFreeFlareChoice===true,
    ownerHammerAfterPassOptIn:hammerAfterPassOptIn,
    ownerShuffleSupporterRootOptIn:shuffleSupporterOptIn,
    ownerVipAfterPassOptIn:vipAfterPassOptIn,
    ownerVipBeforeAttackOptIn:options.ownerVipBeforeAttack===true,
    ownerVipMegaAbsolTargetOptIn:options.ownerVipMegaAbsolTarget===true,
    nativeAorItemLockOptIn:options.nativeAorItemLock===true,
    actorChoosePokemonOptIn:actorChoosePokemon,
    guzmaOwnerPromptContinuationOptIn:options.guzmaOwnerPromptContinuation===true,
    guzmaNominalGustOptIn:options.guzmaNominalGust===true,
    guzmaForcedNominalKoOptIn:options.guzmaForcedNominalKo===true,
    rank9SpecialFundedGuzmaOptIn:options.rank9SpecialFundedGuzma===true,
    genericFallbackAttributionOptIn:genericFallbackAttribution,
    selectedHandlerPriority: [
      ...(ownerVipBeforeAttackAudit?['OwnerAttackContendedVipFirstTurn']:[]),
      ...(options.guzmaOwnerPromptContinuation===true?['GuzmaOwnBenchPrompt']:[]),
      ...(actorChoosePokemon?['ChoosePokemonPrompt']:[]),
      ...(ownerUnderworldPromptAudit?['SourceStampedTypedEnergyPrompt']:[]),
      'ChooseAttackPrompt', 'SelectOptionPrompt', 'SelectPrompt',
      'FogCrystalRootAndOwnerDeckSearch',
      ...(ownerSingleSearch?['ActorOwnerSingleSearchPrompt']:[]),
      ...(handDiscard?['ActorHandDiscardPrompt']:[]),
      ...(plumeriaAfterPassOptIn?['PlumeriaAfterRootPass']:[]),
      ...(ownerNativeFlarePromptAudit?['NativeActorTeamFlareEnergyPrompt']:[]),
      'ActorOnlyRoot'
    ],
    componentVersions: {
      root: rootAudit.version ?? null,
      ...(ownerUnderworldPromptAudit?{
        underworldEnergyPrompt:ownerUnderworldPromptAudit.version}:{}),
      ...(vipAfterPassOptIn?{vipAfterPass:ownerVipAfterPassAudit.version??null}:{}),
      ...(ownerVipBeforeAttackAudit?{vipBeforeAttack:ownerVipBeforeAttackAudit.version??null}:{}),
      ...(plumeriaAfterPassOptIn?{
        plumeriaAfterPass:ownerPlumeriaAfterPassAudit.version??null}:{}),
      ...(ownerNativeFlarePromptAudit?{
        nativeActorFlarePrompt:ownerNativeFlarePromptAudit.version??null}:{}),
      ...(hammerAfterPassOptIn?{hammerAfterPass:ownerHammerAfterPassAudit.version??null}:{}),
      ...(genericFallbackAttribution?{
        genericFallback:genericFallbackAudit.version??null}:{}),
      fog: fogAudit.version ?? null,
      ...(ownerSingleSearch?{ownerSearch:ownerSearchAudit.version??null}:{}),
      select: selectAudit.version ?? null,
      selectOption: optionAudit.version ?? null,
      chooseAttack: attackAudit.version ?? null,
      ...(actorChoosePokemon?{choosePokemon:pokemonAudit.version??null}:{}),
      ...(guzmaPromptAudit?{guzmaOwnBench:guzmaPromptAudit.version??null}:{}),
      ...(handDiscard?{handDiscard:handDiscardAudit.version??null}:{}),
      ...(ownerDonorAudit?{ownerDonor:ownerDonorAudit.version??null}:{})
    },
    nativeDecisionCounts: {
      actorRootsSelected: rootAudit.selectedRootDecisions ?? null,
      actorRootsAccepted: rootAudit.acceptedActorRoots ?? null,
      actorRootsRejected: rootAudit.rejectedActorRoots ?? null,
      actorRootPublicTransitionChanges:
        rootAudit.publicTransitionChanges ?? null,
      actorRootsPhysicallyConfirmed:
        rootAudit.nativePhysicalConfirmed ?? null,
      fogRootAccepted: fogAudit.fogItemRootNativeAccepted ?? null,
      fogOwnerPromptAccepted: fogAudit.fogPromptNativeAccepted ?? null,
      ...(ownerSingleSearch?{
        ownerSearchAccepted:ownerSearchAudit.accepted??null,
        ownerSearchSettled:ownerSearchAudit.nativePromptPostconditionsConfirmed??null,
        ownerSearchUnverified:ownerSearchAudit.nativePromptPostconditionsUnverified??null
      }:{}),
      ...(handDiscard?{
        handDiscardAccepted:handDiscardAudit.accepted??null,
        handDiscardBySeat:handDiscardAudit.bySeat??null,
        handDiscardSettled:handDiscardAudit.nativePromptPostconditionsConfirmed??null
      }:{}),
      selectAccepted: selectAudit.accepted ?? null,
      selectOptionAccepted: optionAudit.acceptedPromptActions ?? null,
      chooseAttackAccepted: attackAudit.accepted ?? null,
      ...(actorChoosePokemon?{
        choosePokemonAccepted:pokemonAudit.accepted??null,
        choosePokemonSettled:pokemonAudit.postconditionsConfirmed??null,
        choosePokemonBySeat:pokemonAudit.bySeat??null
      }:{}),
      ...(guzmaPromptAudit?{
        guzmaRootsAccepted:guzmaPromptAudit.acceptedGuzmaRoots??null,
        guzmaOwnTargetAccepted:guzmaPromptAudit.ownTargetAcceptances??null,
        guzmaOwnTargetConfirmed:guzmaPromptAudit.ownTargetPhysicalConfirmations??null,
        guzmaOwnTargetMismatched:guzmaPromptAudit.ownTargetPhysicalMismatches??null,
        guzmaBySeat:guzmaPromptAudit.bySeat??null
      }:{}),
      lastChanceGenericPromptFallbacks: finalGenericPromptFallbacks,
      ...(supporterOpportunityOptIn?{
        ownerSupporterOpportunitiesBySeat:ownerSupporterOpportunityAudit.bySeat
      }:{}),
      ...(plumeriaOpportunityOptIn?{
        plumeriaNativePlayableFirstOwnerTurns:
          ownerPlumeriaOpportunityAudit.firstTurnNativePlayable,
        plumeriaAcceptedPassWithPlayable:
          ownerPlumeriaOpportunityAudit.acceptedPassWithPlayable,
        plumeriaNativeRootAccepted:
          ownerPlumeriaOpportunityAudit.acceptedPlumeria,
        plumeriaSettledEnergyDiscards:
          ownerPlumeriaOpportunityAudit.settledEnergyDiscards
      }:{}),
      ...(ownerNativeFlarePromptAudit?{
        nativeTeamFlareRootsAccepted:ownerNativeFlarePromptAudit.nativeRootAccepted,
        nativeTeamFlareEnergySettled:
          ownerNativeFlarePromptAudit.physicallySettledActiveEnergy,
        nativeTeamFlareBySeat:ownerNativeFlarePromptAudit.bySeat
      }:{}),
      ...(plumeriaAfterPassOptIn?{
        plumeriaAfterPassProposed:ownerPlumeriaAfterPassAudit.proposedPlumeria,
        plumeriaAfterPassAccepted:ownerPlumeriaAfterPassAudit.acceptedPlumeria,
        plumeriaAfterPassSettled:ownerPlumeriaAfterPassAudit.settledEnergyDiscards,
        plumeriaAfterPassBySeat:ownerPlumeriaAfterPassAudit.bySeat
      }:{}),
      ...(ownerVipBeforeAttackAudit?{
        vipBeforeAttackAccepted:ownerVipBeforeAttackAudit.acceptedItems,
        vipBeforeAttackBenchConfirmed:ownerVipBeforeAttackAudit.physicallyConfirmedBenchSearches,
        vipBeforeAttackBySeat:ownerVipBeforeAttackAudit.bySeat
      }:{}),
      ...(vipAfterPassOptIn?{
        vipItemAccepted:ownerVipAfterPassAudit.acceptedItems,
        vipSearchAccepted:ownerVipAfterPassAudit.acceptedSearches,
        vipBenchConfirmed:ownerVipAfterPassAudit.nativeBenchConfirmed,
        vipBySeat:ownerVipAfterPassAudit.bySeat
      }:{}),
      ...(hammerAfterPassOptIn?{
        hammerAcceptedRoots:ownerHammerAfterPassAudit.acceptedHammerRoots,
        hammerEnergyDiscards:ownerHammerAfterPassAudit.acceptedEnergyDiscards,
        hammerBySeat:ownerHammerAfterPassAudit.bySeat
      }:{}),
      ...(shuffleSupporterOptIn?{
        shuffleSupporterAcceptedRoots:ownerShuffleSupporterAudit.acceptedRoots,
        shuffleSupporterAcceptedByFamily:ownerShuffleSupporterAudit.acceptedByFamily,
        shuffleSupporterRejectedRoots:ownerShuffleSupporterAudit.rejectedRoots
      }:{}),
      ...(ownerDonorAudit?{
        ownerDonorEligible:ownerDonorAudit.eligibleRoots,
        ownerDonorChosen:ownerDonorAudit.chosenRoots,
        ownerDonorAccepted:ownerDonorAudit.dispatchAccepted,
        ownerDonorRejected:ownerDonorAudit.dispatchRejected,
        ownerDonorTurns:ownerDonorAudit.chosenTurns
      }:{}),
      ...(genericFallbackAttribution?{
        nativeGenericDecoderCalls:genericFallbackAudit.liveGenericDecodes??null,
        nativeGenericDecoderBySeat:genericFallbackAudit.bySeat??null,
        nativeGenericPromptBySeat:genericFallbackAudit.byOwnerPromptType??null,
        nativeDistinctOwnerPromptObjects:genericFallbackAudit.distinctOwnerPromptObjects??null,
        nativeDistinctOwnerPromptBySeat:genericFallbackAudit.distinctOwnerPromptBySeat??null,
        nativeDistinctOwnerPromptTypesBySeat:genericFallbackAudit.distinctOwnerPromptType??null
      }:{})
    },
    ownerDonorAudit,
    guzmaPromptAudit,
    ownerSupporterOpportunityAudit,
    ownerTrainerFrontierAudit,
    ownerPlumeriaOpportunityAudit,
    ownerPlumeriaAfterPassAudit,
    ownerNativeFlarePromptAudit,
    ownerHammerAfterPassAudit,
    ownerVipBeforeAttackAudit,
    // Every upstream interceptor also counts events it delegates downstream.
    // These counters overlap and cannot be added into a decision denominator.
    overlappingDelegationObservations: {
      chooseAttack: attackAudit.nativeFallbacks ?? null,
      ...(actorChoosePokemon?{choosePokemon:pokemonAudit.unsupportedNativeFallbacks??null}:{}),
      ...(guzmaPromptAudit?{guzmaOwnPrompt:guzmaPromptAudit.nonLiveFallbacks??null}:{}),
      selectOption: optionAudit.unsupportedPromptDelegations ?? null,
      select: selectAudit.unsupportedPromptFallbacks ?? null,
      fog: fogAudit.unsupportedPrompts ?? null,
      ...(ownerSingleSearch?{ownerSearch:ownerSearchAudit.nativeFallbacks??null}:{}),
      lastChanceRoot: finalGenericPromptFallbacks,
      ...(handDiscard?{handDiscard:handDiscardAudit.nativeFallbacks??null}:{}),
      warning: 'Nested delegation counters overlap. The root is the final fallback.'
    },
    detailedComponentAudits: {
      root: rootAudit,
      ...(supporterOpportunityOptIn?{
        ownerSupporterOpportunity:ownerSupporterOpportunityAudit
      }:{}),
      ...(ownerTrainerFrontierAudit?{
        ownerGenericTrainerFrontier:ownerTrainerFrontierAudit
      }:{}),
      ...(plumeriaOpportunityOptIn?{
        ownerPlumeriaOpportunity:ownerPlumeriaOpportunityAudit
      }:{}),
      ...(plumeriaAfterPassOptIn?{
        ownerPlumeriaAfterPass:ownerPlumeriaAfterPassAudit
      }:{}),
      ...(ownerNativeFlarePromptAudit?{
        ownerNativeFlarePrompt:ownerNativeFlarePromptAudit
      }:{}),
      ...(ownerRank9CompressorAudit?{
        ownerRank9Compressor:ownerRank9CompressorAudit
      }:{}),
      ...(hammerAfterPassOptIn?{
        ownerHammerAfterPass:ownerHammerAfterPassAudit
      }:{}),
      ...(shuffleSupporterOptIn?{
        ownerShuffleSupporter:ownerShuffleSupporterAudit
      }:{}),
      ...(vipAfterPassOptIn?{
        ownerVipAfterPass:ownerVipAfterPassAudit
      }:{}),
      ...(ownerVipBeforeAttackAudit?{
        ownerVipBeforeAttack:ownerVipBeforeAttackAudit
      }:{}),
      ...(genericFallbackAttribution?{genericFallback:genericFallbackAudit}:{}),
      fog: fogAudit,
      ...(ownerSingleSearch?{ownerSearch:ownerSearchAudit}:{}),
      select: selectAudit,
      selectOption: optionAudit,
      chooseAttack: attackAudit,
      ...(actorChoosePokemon?{choosePokemon:pokemonAudit}:{}),
      ...(guzmaPromptAudit?{guzmaOwnBench:guzmaPromptAudit}:{}),
      ...(handDiscard?{handDiscard:handDiscardAudit}:{})
    },
    qualification: {
      fullyActorOnly: false,
      sourcePolicyCompetenceEstablished: false,
      candidatePolicyCompetenceEstablished: false,
      paperClockQualified: false,
      competitiveGames: 0,
      caveat: 'Accepted roots and prompts are development witnesses. Remaining generic fallback, source-specific intervention, limited root decision space and unmodeled clock prohibit competitive inference.'
    }
  };
  return {result: attacked.result, audit};
}

module.exports = {VERSION, OWNER_SEARCH_VERSION,SPARSE_OWNER_SEARCH_VERSION,
  HAND_DISCARD_VERSION,
  GENERIC_FALLBACK_VERSION,POKEMON_PROMPT_VERSION,
  withCanonicalActorOnlyPolicy};
