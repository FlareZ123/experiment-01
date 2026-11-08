'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent2-treasure-owner-prompt-native-v1';
const TREASURE='Mysterious Treasure FLI';
const CRISPIN='Crispin SCR';
const MUSCLE_BAND='Muscle Band XY';
const REGIDRAGO_VSTAR='Regidrago VSTAR SIT';
const OUTPUT=path.resolve(__dirname,'../../../vendor/twinleaf/ptcg-server/output');

/**
 * Make an owner-only, source-stamped native Treasure prompt choice.
 * Root policy is separate: this function only answers a prompt that the real
 * Store actually created. It reads owner hand or a deck explicitly exposed by
 * the printed Item effect, and does not read the opponent's concealed cards.
 * @param {object} state Actual pinned state, used only for native validation.
 * @param {object} prompt Actual ChooseCardsPrompt issued to the actor.
 * @param {object} owner Authenticated acting player.
 * @param {'crispin'|'muscle-band'} paymentChoice Registered payment branch.
 * @returns {{kind:string,selected:object[]}|null} Choice or delegation.
 */
function chooseOwnerTreasurePrompt(state,prompt,owner,paymentChoice){
  if(!prompt||prompt.playerId!==owner.id||
     prompt.sourceCard?.fullName!==TREASURE||
     prompt.constructor?.name!=='ChooseCardsPrompt')return null;
  const cards=prompt.cards?.cards;
  if(!Array.isArray(cards))return null;
  if(prompt.cards===owner.hand){
    if(prompt.options?.min!==1||prompt.options?.max!==1)return null;
    const printing=paymentChoice==='muscle-band'?MUSCLE_BAND:CRISPIN;
    const selected=cards.find(card=>card.fullName===printing);
    if(!selected||selected===prompt.sourceCard)return null;
    const answer=[selected];
    if(prompt.validate(answer,state)!==true)return null;
    return {kind:'printed-one-card-payment',selected:answer};
  }
  if(prompt.cards===owner.deck){
    const preferences=[REGIDRAGO_VSTAR,'Regidrago V SIT',
      'Noivern ex PAL','Dragapult ex TWM','Dialga-GX UPR'];
    for(const printing of preferences){
      const card=cards.find(item=>item.fullName===printing);
      if(card&&prompt.validate([card],state)===true)
        return {kind:'owner-deck-search',selected:[card]};
    }
    if(prompt.validate([],state)===true)
      return {kind:'owner-deck-search-empty',selected:[]};
  }
  return null;
}

/**
 * Install only for one synchronous native experimental run. All uncovered
 * prompts delegate to the pre-existing fail-closed actor/quarantine chain.
 * @template T
 * @param {()=>T} run Native research runner.
 * @param {{paymentChoice?:'crispin'|'muscle-band',
 *   engine?:(relative:string)=>object}} [deps] Native injectables.
 * @returns {{result:T,audit:object}} Source-stamped real prompt proposals.
 */
function withOwnerTreasurePrompts(run,deps={}){
  assert.equal(typeof run,'function');
  const paymentChoice=deps.paymentChoice??'crispin';
  assert.ok(paymentChoice==='crispin'||paymentChoice==='muscle-band');
  const engine=deps.engine??(relative=>require(path.join(OUTPUT,relative)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const previous=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  const events=[];
  const observedOwnerChoicePrompts=[];
  const intercepted=function ownerTreasureOnly(state){
    const clientId=this.client?.id;
    const owner=state.players?.find(player=>player.id===clientId);
    const prompt=state.prompts?.find(item=>
      item.playerId===clientId&&item.result===undefined);
    if(owner&&prompt?.constructor?.name==='ChooseCardsPrompt'&&
       state.turn===1&&prompt.message==='CHOOSE_CARD_TO_DISCARD'){
      observedOwnerChoicePrompts.push({
        seat:state.players.indexOf(owner),turn:state.turn,
        promptId:prompt.id,sourcePrinting:prompt.sourceCard?.fullName??null,
        sourceCardType:prompt.sourceCard?.constructor?.name??null,
        sourceCardExists:prompt.sourceCard!=null,
        ownTemporaryItemPrintings:owner.supporter?.cards?.map(
          card=>card.fullName)??[],
        isExactOwnerHandZone:prompt.cards===owner.hand,
        ownerHandPrintings:owner.hand.cards.map(card=>card.fullName),
        nativeMin:prompt.options?.min??null,
        nativeMax:prompt.options?.max??null
      });
    }
    if(owner&&prompt?.sourceCard?.fullName===TREASURE){
      const choice=chooseOwnerTreasurePrompt(
        state,prompt,owner,paymentChoice);
      if(choice){
        events.push({
          seat:state.players.indexOf(owner),
          turn:state.turn,phase:state.phase,
          promptId:prompt.id,kind:choice.kind,
          sourcePrinting:TREASURE,
          physicalSelections:choice.selected.map(card=>({
            printing:card.fullName,id:card.id
          })),
          ownerHandPrompt:prompt.cards===owner.hand,
          ownerDeckPrompt:prompt.cards===owner.deck,
          nativeValidatorAccepted:true,
          ownerOnly:true,paperGameQualified:false
        });
        return new ResolvePromptAction(prompt.id,choice.selected);
      }
    }
    return previous.value.call(this,state);
  };
  Object.defineProperty(SimpleTacticsAi.prototype,
    'decodeNextAction',{...previous,value:intercepted});
  try{
    const result=run();
    return {result,audit:{
      version:VERSION,paymentChoice,proposals:events.length,events,
      observedOwnerChoicePrompts,
      printedItemSourceConfirmed:events.length>0,
      physicalStorePaymentNotYetCertified:true,
      paperGameQualified:false,competitiveQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      intercepted);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',previous);
  }
}
module.exports={VERSION,TREASURE,chooseOwnerTreasurePrompt,
  withOwnerTreasurePrompts};
