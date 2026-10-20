'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine=name=>require(path.join(root,name));

/**
 * Attempt a Perfection activation on a DETACHED copy of the real Store
 * after the owning policy already chose Pass. Follow only the animation
 * prompts required to expose the engine's printed attack-choice prompt.
 * The enumerated card sources are public in play/discard, but this observer
 * is never an information-set-safe live decision policy.
 *
 * @param {object} state Genuine pinned Store state before Pass.
 * @param {number} playerId Player who selected the Pass.
 * @returns {object}
 */
function detachedPerfectionAttempt(state,playerId){
  const {deepClone}=engine('utils');
  const {Store}=engine('game/store/store');
  const {UseAbilityAction}=engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {PlayerType,SlotType}=engine('game/store/actions/play-card-action');
  const store=new Store({onStateChange(){}});
  store.state=deepClone(state);
  const previousRandom=Math.random;
  Math.random=()=>0.5;
  try{
    store.dispatch(new UseAbilityAction(playerId,'Perfection',{
      player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0
    }));
    let prompt=store.state.prompts.find(x=>x.result===undefined);
    for(let step=0;step<12&&prompt?.constructor.name==='WaitPrompt';step++){
      store.dispatch(new ResolvePromptAction(prompt.id,true));
      prompt=store.state.prompts.find(x=>x.result===undefined);
    }
    if(prompt?.constructor.name!=='ChooseAttackPrompt'){
      return {activationAccepted:true,choicePromptObserved:false,
        pendingPromptType:prompt?.constructor.name??null,
        validAttackSources:[],validAttackNames:[]};
    }
    const valid=[];
    for(const card of prompt.cards){
      for(const attack of card.attacks??[]){
        if(prompt.validate(attack)===true){
          valid.push({source:card.name,attack:attack.name});
        }
      }
    }
    return {activationAccepted:true,choicePromptObserved:true,
      pendingPromptType:prompt.constructor.name,
      validAttackSources:valid,
      validAttackNames:[...new Set(valid.map(x=>x.attack))]};
  }catch(error){
    return {activationAccepted:false,choicePromptObserved:false,
      pendingPromptType:null,validAttackSources:[],validAttackNames:[],
      rejection:String(error?.message??error)};
  }finally{
    Math.random=previousRandom;
  }
}

/**
 * Mirror the pinned Mewtwo & Mew-GX UNM Perfection card-source predicate:
 * EX/GX tags on the Bench and GX/EX from discard except Mewtwo itself.
 * CardTag.POKEMON_EX='EX', CardTag.POKEMON_GX='GX' in pinned card-types.ts.
 * These are potential source Pokémon, not energy-affordable attacks, and
 * collecting them happens only after the live policy has chosen Pass.
 *
 * @param {object} owner The already-acting player's state.
 * @returns {object} Owner/public-zone eligible source inventory.
 */
function summarizePerfectionSourceEligibility(owner){
  const isGXorEX=card=>card && Array.isArray(card.attacks) &&
    typeof card.hasTag==='function' &&
    (card.hasTag('GX') || card.hasTag('EX'));
  const describe=card=>({
    name:card.name,printing:card.fullName,
    attackNames:card.attacks.map(attack=>attack.name)
  });
  const bench=(owner.bench??[]).map(slot=>slot.getPokemonCard())
    .filter(isGXorEX).map(describe);
  const discard=(owner.discard?.cards??[])
    .filter(card=>isGXorEX(card)&&card.name!=='Mewtwo & Mew-GX')
    .map(describe);
  return {
    bench,discard,sourcePokemonCount:bench.length+discard.length,
    hasSourcePokemon:bench.length+discard.length>0,
    costAndAbilityStatusAssessed:false,
    sourceRules:'Pinned UNM Perfection GX/EX tags; excludes discard Mewtwo & Mew-GX'
  };
}

/**
 * Run after an already-chosen Pass, only for Mewtwo & Mew-GX occupying
 * the passing player's Active Spot. If no suitable active Pokemon is
 * present, return null without ever cloning the hidden game state.
 *
 * @param {object} state Pinned Store state.
 * @param {number} playerId Acting owner player ID.
 * @param {(state:object,playerId:number)=>object} [attempt] Test seam.
 * @returns {object|null}
 */
function probePostPassPerfection(state,playerId,attempt=detachedPerfectionAttempt){
  assert.equal(typeof attempt,'function');
  if(state.prompts.some(x=>x.result===undefined))return null;
  const owner=state.players.find(player=>player.id===playerId);
  if(owner?.active.getPokemonCard()?.name!=='Mewtwo & Mew-GX')return null;
  const candidate=(card)=>({name:card.name,printing:card.fullName,
    attacks:(card.attacks??[]).map(attack=>attack.name)});
  // Public own discard and Bench can distinguish absent copied payloads.
  const publicCopySourceInventory={
    discard:(owner.discard?.cards??[]).filter(card=>
      Array.isArray(card.attacks) && card.attacks.length>0).map(candidate),
    bench:(owner.bench??[]).map(slot=>slot.getPokemonCard())
      .filter(card=>card && Array.isArray(card.attacks)&&card.attacks.length>0)
      .map(candidate)
  };
  const sourceEligibility=summarizePerfectionSourceEligibility(owner);
  const trial=attempt(state,playerId);
  return {
    evidenceType:'post-choice-cloned-perfection-attack-menu-v1',
    sourceEligibility,
    playerId,activePokemon:owner.active.getPokemonCard().name,
    publicCopySourceInventory,
    ...trial,
    scope:'Detached pinned Store after an actual Pass; Ability activation and copied attack prompt acceptance only, without competitive or printed-paper rule certification.'
  };
}
module.exports={probePostPassPerfection,detachedPerfectionAttempt,
  summarizePerfectionSourceEligibility};
