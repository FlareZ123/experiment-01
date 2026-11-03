'use strict';

const path = require('node:path');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Source-only, opt-in final line selector. Requires actual public opponent
 * sole Active with exactly one Prize and the source's own first turn. Reads
 * only own hand/discard, physical attached cards and public board.
 *
 * This does not acquire the cards from a random seven or prove tournament
 * opponent competence. It proposes real engine actions at observed roots.
 *
 * @template T
 * @param {0|1} seat
 * @param {()=>T} execute
 * @returns {{result:T,policyAudit:object}}
 */
function withRank26ConditionalFinisher(seat,execute) {
  if (![0,1].includes(seat) || typeof execute!=='function')
    throw new TypeError('Require original rank26 source seat and synchronous call');
  const engine=name=>require(path.join(OUTPUT,name));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {GamePhase}=engine('game/store/state/state');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {UseAbilityAction,AttackAction}=
    engine('game/store/actions/game-actions');
  const {ResolvePromptAction}=
    engine('game/store/actions/resolve-prompt-action');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const sourceId=seat===0?101:202;
  const bench=index=>({player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,index});
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const events=[];
  let nativeCologneSelected=false;
  SimpleTacticsAi.prototype.decodeNextAction=function rank26Finisher(state){
    const own=state.players[seat],opp=state.players[1-seat];
    const activeOpponent=opp?.active.getPokemonCard();
    const eligible=own?.id===sourceId && this.client?.id===sourceId &&
      state.turn===1 && state.activePlayer===seat &&
      opp?.prizes.filter(p=>p.cards.length>0).length===1 &&
      activeOpponent?.name==='Iron Thorns ex' &&
      !opp.bench.some(slot=>slot.getPokemonCard());
    if(!eligible) return original.call(this,state);
    const meloIndex=own.bench.findIndex(slot=>
      slot.getPokemonCard()?.name==='Meloetta ex');
    const kokoIndex=own.bench.findIndex(slot=>
      slot.getPokemonCard()?.name==='Tapu Koko Prism Star');
    const pending=state.prompts.find(p=>p.result===undefined);
    let action=null,kind='';
    if(pending) {
      if(pending.playerId!==sourceId)return original.call(this,state);
      if(pending.constructor.name==='AttachEnergyPrompt' && meloIndex>=0) {
        const lightning=own.discard.cards.find(c=>c.name==='Lightning Energy');
        const transfer=lightning?[{card:lightning,to:bench(meloIndex)}]:[];
        if(transfer.length===1&&pending.validate(transfer,state)) {
          action=new ResolvePromptAction(pending.id,transfer);
          kind='one-lightning-koko-prompt';
        }
      }
      if(pending.constructor.name==='ChoosePokemonPrompt' && meloIndex>=0 &&
         own.active.getPokemonCard()?.name!=='Meloetta ex' &&
         pending.validate([own.bench[meloIndex]],state)){
        action=new ResolvePromptAction(pending.id,[own.bench[meloIndex]]);
        kind='promote-meloetta';
      }
    } else if(state.phase===GamePhase.PLAYER_TURN) {
      // Existing Cologne policy is earlier in the fallback chain and should
      // consume the physically held Cologne before Koko activation.
      const held=name=>own.hand.cards.findIndex(c=>c.name===name);
      const sourceActive=own.active.getPokemonCard()?.name;
      const readyLightnings=own.discard.cards.filter(c=>
        c.name==='Lightning Energy').length;
      if(meloIndex>=0&&kokoIndex>=0&&readyLightnings>0) {
        if(held('Canceling Cologne')>=0) {
          const selected=original.call(this,state);
          if(selected?.constructor.name==='PlayCardAction' &&
            own.hand.cards[selected.handIndex]?.name==='Canceling Cologne'){
            nativeCologneSelected=true;
          }
          return selected;
        }
        // Only select Koko after this same owner-visible policy session
        // selected a genuine original Cologne action accepted by the Store.
        // Never infer suppression from a Cologne merely in the discard pile.
        if(!nativeCologneSelected)return original.call(this,state);
        action=new UseAbilityAction(sourceId,
          'Dance of the Ancients',bench(kokoIndex));
        kind='use-koko-one-lightning';
      } else if(meloIndex>=0&&kokoIndex<0) {
        const hasDce=own.bench[meloIndex].energies.cards.some(c=>
          c.name==='Double Colorless Energy');
        const hasTm=own.bench[meloIndex].tools.some(c=>
          c.name==='Technical Machine: Crisis Punch');
        if(!hasDce&&held('Double Colorless Energy')>=0) {
          action=new PlayCardAction(sourceId,held('Double Colorless Energy'),
            bench(meloIndex));
          kind='attach-original-dce';
        } else if(!hasTm&&held('Technical Machine: Crisis Punch')>=0) {
          action=new PlayCardAction(sourceId,
            held('Technical Machine: Crisis Punch'),bench(meloIndex));
          kind='attach-original-tool';
        } else if(hasDce&&hasTm&&sourceActive!=='Meloetta ex'&&
          held('Escape Rope')>=0) {
          action=new PlayCardAction(sourceId,held('Escape Rope'),board);
          kind='escape-rope-promote';
        }
      }
      if(sourceActive==='Meloetta ex' &&
        own.active.tools.some(c=>c.name==='Technical Machine: Crisis Punch')&&
        own.active.energies.cards.some(c=>c.name==='Double Colorless Energy')&&
        own.active.energies.cards.some(c=>c.name==='Lightning Energy')) {
        action=new AttackAction(sourceId,'Crisis Punch');
        kind='firstturn-crisis-punch';
      }
    }
    if(!action)return original.call(this,state);
    events.push({kind,action:action.constructor.name,
      sourceSeat:seat,globalTurn:state.turn,
      opponentPrizesRemaining:1,
      source:'own hand/discard/attachment and public board'});
    return action;
  };
  try {
    return {result:execute(),policyAudit:{
      version:'agent47-rank26-conditional-single-lightning-finisher-v1',
      sourceSeat:seat,actions:events,competitiveGameQualified:false
    }};
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}
module.exports={withRank26ConditionalFinisher};
