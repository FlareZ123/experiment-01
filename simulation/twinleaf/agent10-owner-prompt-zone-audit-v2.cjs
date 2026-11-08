'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {promptZoneMatches:defaultPromptZoneMatches}=
  require('./agent36-issue25-public-prompt-zone-audit-v6.cjs');

const VERSION='agent10-owner-prompt-zone-audit-v2';

/** @param {object|null|undefined} enumeration @param {unknown} value */
function enumName(enumeration,value){
  if(typeof value==='string')return value;
  if(!enumeration||typeof enumeration!=='object')return null;
  for(const [name,candidate] of Object.entries(enumeration)){
    if(!/^\\d+$/.test(name)&&candidate===value)return name;
  }
  return null;
}

/** @param {unknown} value */
function snapshotSourceOrigin(value){
  if(!value||typeof value!=='object')return null;
  const snapshot={};
  if(typeof value.sourcePrinting==='string')
    snapshot.sourcePrinting=value.sourcePrinting;
  if(typeof value.sourceAbility==='string')
    snapshot.sourceAbility=value.sourceAbility;
  if(typeof value.promptIdAfterStore==='string'||
    Number.isSafeInteger(value.promptIdAfterStore))
    snapshot.promptIdAfterStore=String(value.promptIdAfterStore);
  if(Number.isSafeInteger(value.sourceSeat))
    snapshot.sourceSeat=value.sourceSeat;
  return Object.keys(snapshot).length?Object.freeze(snapshot):null;
}

/** @param {unknown} left @param {unknown} right */
function samePlayerId(left,right){
  return left!=null&&right!=null&&String(left)===String(right);
}

/**
 * Capture safe source-zone classification for CHOOSE_CARD_TO_DISCARD prompts.
 * The v6 classifier is used only for reference comparisons; offeredPrintings
 * are deliberately omitted so hidden card identities never enter this audit.
 *
 * @template T
 * @param {()=>T} run
 * @param {{Store?:Function,ChooseCardsPrompt?:Function,GameMessage?:object,
 *   SuperType?:object,promptZoneMatches?:Function,
 *   getSourceOriginForPrompt?:(prompt:object)=>object|null,maxEvents?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerPromptZoneAudit(run,deps={}){
  assert.equal(typeof run,'function');
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  /** @param {string} name @returns {any} */
  const native=name=>require(path.join(output,name));
  const Store=deps.Store??native('game/store/store').Store;
  const ChooseCardsPrompt=deps.ChooseCardsPrompt??
    native('game/store/prompts/choose-cards-prompt').ChooseCardsPrompt;
  const GameMessage=deps.GameMessage??native('game/game-message').GameMessage;
  const SuperType=deps.SuperType??native('game/store/card/card-types').SuperType;
  const promptZoneMatches=deps.promptZoneMatches??defaultPromptZoneMatches;
  const getSourceOriginForPrompt=deps.getSourceOriginForPrompt??(()=>null);
  const maxEvents=deps.maxEvents??64;
  assert.ok(Store?.prototype,'Twinleaf Store prototype is required');
  assert.equal(typeof promptZoneMatches,'function');
  assert.equal(typeof getSourceOriginForPrompt,'function');
  assert.ok(GameMessage?.CHOOSE_CARD_TO_DISCARD!==undefined);
  assert.ok(Number.isInteger(maxEvents)&&maxEvents>0&&maxEvents<=2048);

  const oldPrompt=Object.getOwnPropertyDescriptor(Store.prototype,'prompt');
  assert.equal(typeof oldPrompt?.value,'function');
  const storeOrdinals=new WeakMap();
  const promptOrdinals=new WeakMap();
  let nextStoreOrdinal=0;
  const audit={
    version:VERSION,
    promptCount:0,
    events:[],
    eventsTruncated:false
  };

  /** @param {object} store */
  function storeOrdinal(store){
    let value=storeOrdinals.get(store);
    if(value===undefined){
      value=++nextStoreOrdinal;
      storeOrdinals.set(store,value);
    }
    return value;
  }

  function observedPrompt(...args){
    const state=args[0];
    const promptArgument=args[1];
    const prompts=Array.isArray(promptArgument)?promptArgument:[promptArgument];
    const before=prompts.map(prompt=>({
      id:prompt?.id??null,
      player:prompt?.player??null,
      playerId:prompt?.playerId??null
    }));
    const result=oldPrompt.value.apply(this,args);
    const players=Array.isArray(state?.players)?state.players:[];

    for(let index=0;index<prompts.length;index++){
      const prompt=prompts[index];
      if(!prompt)continue;
      const isChooseCards=(typeof ChooseCardsPrompt==='function'&&
        prompt instanceof ChooseCardsPrompt)||
        prompt?.constructor?.name==='ChooseCardsPrompt';
      if(!isChooseCards||prompt.message!==GameMessage.CHOOSE_CARD_TO_DISCARD)
        continue;
      if(audit.events.length>=maxEvents){
        audit.eventsTruncated=true;
        break;
      }

      const prior=before[index];
      const promptPlayerSeat=players.findIndex(player=>
        player===prior.player||
        samePlayerId(player?.id,prior.player?.id)||
        samePlayerId(player?.id,prior.playerId)
      );
      const controllerSeat=players.findIndex(player=>
        samePlayerId(player?.id,prompt?.playerId)
      );
      const perspectiveSeat=players.findIndex(player=>
        samePlayerId(player?.id,prompt?.perspectivePlayerId)
      );
      const promptOrdinal=(promptOrdinals.get(this)??0)+1;
      promptOrdinals.set(this,promptOrdinal);
      let zone=null;
      let zoneAuditError=null;
      if(promptPlayerSeat>=0){
        try{
          zone=promptZoneMatches(state,prompt,SuperType,promptPlayerSeat);
        }catch(error){
          zoneAuditError={
            name:error?.name??null,
            code:error?.code??null
          };
        }
      }else{
        zoneAuditError={name:'PromptPlayerSeatUnresolved',code:null};
      }
      const options=prompt?.options&&typeof prompt.options==='object'
        ?prompt.options:{};
      const sourceOrigin=snapshotSourceOrigin(getSourceOriginForPrompt(prompt));
      const zoneMatches=Array.isArray(zone?.matches)
        ?zone.matches.map(match=>({
          zone:match.zone??null,
          match:match.match??null,
          visibility:match.visibility??null,
          eligibleSubzone:match.eligibleSubzone??null,
          subzoneReferenceMatch:match.subzoneReferenceMatch??null,
          eligibleCount:match.visibility==='public'?(match.eligibleCount??null):null
        })):[];
      const publicZoneCount=zoneMatches.length>0&&
        zoneMatches.every(match=>match.visibility==='public')
        ?zone?.offeredCount??null:null;
      audit.events.push({
        index:audit.events.length,
        storeOrdinal:storeOrdinal(this),
        promptOrdinal,
        promptGroupLength:prompts.length,
        promptIndexInGroup:index,
        promptId:prompt?.id==null?null:String(prompt.id),
        promptIdBeforeStore:prior.id==null?null:String(prior.id),
        turn:Number.isFinite(state?.turn)?state.turn:null,
        phase:state?.phase??null,
        activePlayerSeat:Number.isInteger(state?.activePlayer)
          ?state.activePlayer:null,
        promptPlayerSeat:promptPlayerSeat>=0?promptPlayerSeat:null,
        controllerSeat:controllerSeat>=0?controllerSeat:null,
        perspectiveSeat:perspectiveSeat>=0?perspectiveSeat:null,
        promptType:prompt?.constructor?.name??null,
        message:enumName(GameMessage,prompt.message),
        min:options.min??prompt.min??null,
        max:options.max??prompt.max??null,
        allowCancel:options.allowCancel??prompt.allowCancel??null,
        isSecret:options.isSecret??prompt.isSecret??null,
        selectableCount:publicZoneCount,
        promptCardsClass:prompt.cards?.constructor?.name??null,
        eligibleSubzone:zone?.eligibleSubzone??null,
        filterSuperType:zone?.filterSuperType??null,
        filterMatchesEnergySubzone:zone?.filterMatchesEnergySubzone??null,
        zoneMatches,
        zoneAuditError,
        sourceOrigin,
        stateMatchesLiveStore:Boolean(state&&state===this.state),
        promptSourceMetadataPresent:prompt.sourceCard!=null
      });
      audit.promptCount++;
    }
    return result;
  }

  Object.defineProperty(Store.prototype,'prompt',{...oldPrompt,value:observedPrompt});
  try{
    const result=run();
    assert.ok(!result||typeof result.then!=='function',
      'Owner prompt zone audit requires a synchronous callback');
    return {result,audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent10OwnerPromptZoneAudit=audit;
    throw error;
  }finally{
    assert.equal(Store.prototype.prompt,observedPrompt);
    Object.defineProperty(Store.prototype,'prompt',oldPrompt);
  }
}

module.exports={VERSION,withOwnerPromptZoneAudit};
