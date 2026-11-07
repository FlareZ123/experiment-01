'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent30-stunfisk-snap-trap-prompt-marker-v2';
const SOURCE_PRINTING='Galarian Stunfisk SSH';
const SOURCE_ABILITY='Snap Trap';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/** @param {any} card @returns {string|null} */
function publicPrinting(card){
  return typeof card?.fullName==='string'?card.fullName:
    typeof card?.name==='string'?card.name:null;
}

/** @param {any} state @param {any} pokemon */
function findPokemonOwner(state,pokemon){
  if(!pokemon||!Array.isArray(state?.players))return null;
  return state.players.find(player=>
    player?.active===pokemon||(player?.bench??[]).includes(pokemon)
  )??null;
}

/**
 * Read-only Snap Trap source marker. It stamps only the exact mandatory
 * Energy-discard prompt created inside Galarian Stunfisk.reduceEffect.
 *
 * @template T
 * @param {(getOriginForPrompt:(prompt:any)=>object|null)=>T} run Synchronous native experiment callback.
 * @param {{engine?:(relative:string)=>object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withStunfiskSnapTrapPromptMarker(run,deps={}){
  assert.equal(typeof run,'function');
  const engine=deps.engine??(relative=>require(path.join(OUTPUT,relative)));
  const {GalarianStunfisk}=engine(
    'sets/09-sword-and-shield/set-sword-and-shield/galarian-stunfisk');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {GameMessage}=engine('game/game-message');
  const {SuperType}=engine('game/store/card/card-types');

  assert.equal(typeof GalarianStunfisk,'function');
  assert.equal(typeof SimpleTacticsAi,'function');
  assert.equal(typeof ChooseCardsPrompt,'function');
  assert.ok(GameMessage?.CHOOSE_CARD_TO_DISCARD!==undefined);
  assert.ok(SuperType?.ENERGY!==undefined);

  const reducerDescriptor=Object.getOwnPropertyDescriptor(
    GalarianStunfisk.prototype,'reduceEffect');
  const aiDescriptor=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof reducerDescriptor?.value,'function');
  assert.equal(typeof aiDescriptor?.value,'function');
  assert.equal(reducerDescriptor.configurable,true);
  assert.equal(aiDescriptor.configurable,true);

  const origins=new WeakMap();
  const getOriginForPrompt=prompt=>origins.get(prompt)??null;
  const audit={
    version:VERSION,
    printedSourceInvocations:0,
    exactSourcePromptsStamped:[],
    blockedPromptOriginEvents:[],
    hiddenCardIdentitiesInspected:false,
    publicAttachedEnergyIdentitiesInspected:true,
    rawStateDecoderExecutedByMarker:false,
    decisionActionsIssuedByMarker:0,
    competitiveGamesQualified:0
  };

  function sourcePromptMarker(store,state,effect){
    const original=reducerDescriptor.value;
    const target=effect?.target;
    const attacker=effect?.source;
    const targetOwner=findPokemonOwner(state,target);
    const attackerOwner=findPokemonOwner(state,attacker);
    const possibleSnapTrap=
      Number.isFinite(effect?.damage)&&effect.damage>0&&
      target?.cards?.includes(this)===true&&
      targetOwner?.active===target&&
      attackerOwner?.active===attacker&&
      targetOwner!==attackerOwner&&
      effect.player===attackerOwner;
    if(!possibleSnapTrap)return original.call(this,store,state,effect);

    const sourceCard=this;
    const adapter=new Proxy(store,{
      get(targetStore,property){
        if(property==='prompt')return (nextState,prompt,callback)=>{
          const promptIdBeforeStore=prompt?.id??null;
          let proof=null;
          const eligibleEnergies=Array.isArray(attacker?.energies?.cards)
            ?attacker.energies.cards.filter(card=>
              card?.superType===SuperType.ENERGY)
            :[];
          const exactPrompt=
            (prompt instanceof ChooseCardsPrompt||
             prompt?.constructor?.name==='ChooseCardsPrompt')&&
            prompt.message===GameMessage.CHOOSE_CARD_TO_DISCARD&&
            prompt.playerId===targetOwner.id&&
            prompt.cards===attacker&&
            prompt.cards?.energies===attacker.energies&&
            prompt.filter?.superType===SuperType.ENERGY&&
            Object.keys(prompt.filter??{}).length===1&&
            prompt.options?.min===1&&
            prompt.options?.max===1&&
            prompt.options?.allowCancel===false&&
            prompt.options?.isSecret!==true&&
            sourceCard.fullName===SOURCE_PRINTING&&
            sourceCard.powers?.[0]?.name===SOURCE_ABILITY&&
            eligibleEnergies.length>0;
          if(exactPrompt){
            audit.printedSourceInvocations++;
            proof={
              sourcePrinting:publicPrinting(sourceCard),
              sourceAbility:sourceCard.powers[0].name,
              sourceSeat:state.players.indexOf(targetOwner),
              sourceZone:'owner-active-pokemon-list',
              attackerPrinting:publicPrinting(attacker.getPokemonCard?.()),
              attackerSeat:state.players.indexOf(attackerOwner),
              attackerZone:'opponent-active-pokemon-list',
              turn:Number.isFinite(state.turn)?state.turn:null,
              promptType:prompt.constructor?.name??'ChooseCardsPrompt',
              promptMessage:'CHOOSE_CARD_TO_DISCARD',
              filterKeys:Object.keys(prompt.filter??{}).sort(),
              sourceCardPublic:true,
              promptOwnerSeat:state.players.indexOf(targetOwner),
              promptCardsIsAttackingPokemonList:prompt.cards===attacker,
              promptEnergyListIsAttackingEnergySublist:
                prompt.cards.energies===attacker.energies,
              promptCardsClass:prompt.cards?.constructor?.name??null,
              eligibleSubzone:'attacker-active-energies',
              eligibleEnergyCount:eligibleEnergies.length,
              eligibleEnergyPrintings:eligibleEnergies.map(publicPrinting),
              min:prompt.options.min,max:prompt.options.max,
              allowCancel:prompt.options.allowCancel,
              isSecret:prompt.options.isSecret??false,
              promptSourceCardMetadataPresent:prompt.sourceCard!=null,
              moveSourceCard:SOURCE_PRINTING,
              moveSourceEffect:SOURCE_ABILITY
            };
            origins.set(prompt,proof);
            audit.exactSourcePromptsStamped.push(proof);
          }
          let result;
          try{
            result=targetStore.prompt(nextState,prompt,callback);
          }finally{
            if(proof){
              const promptIdAfterStore=prompt?.id??null;
              const unassigned=value=>value==null||value===0||value==='0';
              proof.promptIdBeforeStore=promptIdBeforeStore;
              proof.promptIdAfterStore=promptIdAfterStore;
              proof.promptIdAssignedByStore=
                unassigned(promptIdBeforeStore)&&!unassigned(promptIdAfterStore);
              proof.pendingNativePromptId=unassigned(promptIdAfterStore)
                ?null:String(promptIdAfterStore);
            }
          }
          return result;
        };
        const value=Reflect.get(targetStore,property,targetStore);
        return typeof value==='function'?value.bind(targetStore):value;
      }
    });
    return original.call(this,adapter,state,effect);
  }

  function readOnlyBlockedPromptOrigin(state){
    const id=this.client?.id;
    const pending=state?.prompts?.find(prompt=>
      prompt.playerId===id&&prompt.result===undefined);
    const origin=pending?origins.get(pending):null;
    if(origin){
      const promptId=String(pending.id);
      if(!audit.blockedPromptOriginEvents.some(event=>
        event.pendingNativePromptId===promptId)){
        audit.blockedPromptOriginEvents.push({
          ...origin,
          actualPromptTurn:Number.isFinite(state?.turn)?state.turn:null,
          actualActorSeat:state?.players?.findIndex(player=>player?.id===id)??-1,
          pendingNativePromptId:promptId
        });
      }
    }
    return aiDescriptor.value.call(this,state);
  }

  Object.defineProperty(GalarianStunfisk.prototype,'reduceEffect',{
    ...reducerDescriptor,value:sourcePromptMarker
  });
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...aiDescriptor,value:readOnlyBlockedPromptOrigin
  });
  try{
    const result=run(getOriginForPrompt);
    return {result,audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.stunfiskSnapTrapPromptMarkerAudit=audit;
    throw error;
  }finally{
    assert.strictEqual(GalarianStunfisk.prototype.reduceEffect,
      sourcePromptMarker);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      readOnlyBlockedPromptOrigin);
    Object.defineProperty(GalarianStunfisk.prototype,'reduceEffect',
      reducerDescriptor);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      aiDescriptor);
  }
}

module.exports={
  VERSION,SOURCE_PRINTING,SOURCE_ABILITY,publicPrinting,
  findPokemonOwner,withStunfiskSnapTrapPromptMarker
};
