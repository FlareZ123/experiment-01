'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {TOOLS,freeBenchIndex}=
  require('./rank11-direct-opportunity.cjs');

const VERSION='agent39-rank16-quickball-to-direct-shake-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
const PRINTED_QUICK_BALLS=new Set(['Quick Ball FST','Quick Ball SSH']);
const PROTECTED_IN_HAND=new Set(['Trubbish','Secret Box']);
const PAYMENT_ORDER=[
  'Quick Ball','Boost Shake','Trainers’ Mail',"Trainers' Mail",
  'VS Seeker','Dark Patch','Ultra Ball','Battle Compressor',
  'Temple of Sinnoh','Garbodor','Darkness Energy','Carmine',
  'Plumeria','Marnie','Guzma',"Lillie's Determination"
];

/**
 * Exact source-owner first-turn K0 Quick Ball bridge, selected only if the
 * direct held Shake+Trubbish/VIP line has no current resource target.
 * No unobserved own deck card, Prize, opponent hand/deck or native future
 * result is consulted. Cost choice is a heuristic rather than proven DCI.
 * The K1 Trubbish search and subsequent K1 Garbodor search can fail.
 * @param {object} state Native public clock and actor's own visible fields.
 * @param {object} player Source-owner physical hand and public board.
 * @param {0|1} seat Source player's physical seat.
 * @param {number} turnPhase Native PLAYER_TURN enum.
 * @returns {{quickIndex:number,discard:object,tool:string}|null}
 */
function quickToShakeK0Offer(state,player,seat,turnPhase){
  assert.ok(seat===0||seat===1);
  if(![1,2].includes(state.turn)||state.activePlayer!==seat||
     state.phase!==turnPhase||player.cannotPlayItemCards||
     player.cannotPlayToolCards)return null;
  const hand=player.hand.cards;
  const names=hand.map(card=>card.name);
  const quickIndex=hand.findIndex(card=>
    PRINTED_QUICK_BALLS.has(card.fullName));
  const shakeIndex=names.indexOf('Boost Shake');
  const tool=TOOLS.find(name=>names.includes(name))??null;
  const toolIndex=names.indexOf(tool);
  if(quickIndex<0||shakeIndex<0||toolIndex<0||tool===null||
     names.includes('Battle VIP Pass')||names.includes('Trubbish')||
     names.filter(name=>name==='Garbodor').length>=3 ||
     player.active.getPokemonCard()?.name==='Trubbish' ||
     player.bench.some(slot=>slot.getPokemonCard()?.name==='Trubbish')||
     freeBenchIndex(player)<0)return null;
  const protectedIndices=new Set([quickIndex,shakeIndex,toolIndex]);
  const unused=hand.map((card,index)=>({card,index}))
    .filter(entry=>!protectedIndices.has(entry.index)&&
      !PROTECTED_IN_HAND.has(entry.card.name));
  if(!unused.length)return null;
  // Cost at the real native payment prompt will use this exact physical
  // original owner-hand card. Duplicate/alternate-connector costs are
  // preferred, but this is a strategic heuristic, not guaranteed harmless.
  const score=({card,index})=>{
    const duplicates=hand.filter(other=>other.name===card.name).length;
    const printedPriority=PAYMENT_ORDER.indexOf(card.name);
    const bucket=duplicates>1?0:1;
    const rank=printedPriority<0?PAYMENT_ORDER.length:printedPriority;
    return [bucket,rank,index];
  };
  unused.sort((a,b)=>{
    const x=score(a),y=score(b);
    return x[0]-y[0]||x[1]-y[1]||x[2]-y[2];
  });
  return {quickIndex,discard:unused[0].card,tool};
}

/**
 * Reversible source-only Quick Ball bridge. The caller is expected to wrap
 * this inside the existing rank11-direct-boostshake hook. After a genuine
 * native optional own-deck Trubbish search and physical Bench play, the
 * original direct policy takes over Tool -> Shake -> Garbodor K1 targeting.
 *
 * Printed Quick Ball one-card cost is paid through a native mandatory
 * ChooseCardsPrompt validated against the actual owner hand. Aborted
 * affordability or K1 missing-target cases remain negative observations.
 * No speculative Store clone or opponent private information is inspected.
 * @template T
 * @param {0|1} seat Real source player physical seat.
 * @param {()=>T} execute Synchronous real Store game.
 * @returns {{result:T,audit:object}}
 */
function withOriginalRank16QuickToShake(seat,execute){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof execute,'function');
  const load=segment=>require(path.join(OUTPUT,segment));
  const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {ResolvePromptAction}=
    load('game/store/actions/resolve-prompt-action');
  const {GamePhase}=load('game/store/state/state');
  const prior=SimpleTacticsAi.prototype.decodeNextAction;
  const ownerId=seat===0?101:202;
  const board={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
  const audit={version:VERSION,sourceSeat:seat,
    attempted:null,completed:false,aborted:null,
    actions:[],ownerK1TrubbishSearchAvailable:null,
    originalSourceGameCompetitiveQualified:false};
  let flow=null;
  /** @param {object} state @param {string} step @param {object} action */
  const select=(state,step,action)=>{
    audit.actions.push({turn:state.turn,step,action:action.constructor.name});
    return action;
  };
  SimpleTacticsAi.prototype.decodeNextAction=function quickBridge(state){
    const player=state.players.find(side=>side.id===this.client?.id);
    if(player?.id!==ownerId||state.activePlayer!==seat)
      return prior.call(this,state);
    const pending=state.prompts.find(prompt=>prompt.result===undefined);
    if(!flow&&pending===undefined){
      const offer=quickToShakeK0Offer(state,player,seat,
        GamePhase.PLAYER_TURN);
      if(offer){
        flow={turn:state.turn,stage:'discard',...offer};
        audit.attempted={turn:state.turn,tool:offer.tool,
          paidPhysicalCardPrinting:offer.discard.fullName,
          ownerK0QuickIndex:offer.quickIndex};
        return select(state,'quick-ball',new PlayCardAction(
          player.id,offer.quickIndex,board));
      }
    }
    if(!flow||flow.stage==='complete'||flow.stage==='aborted')
      return prior.call(this,state);
    if(flow.stage==='discard'&&
       pending?.constructor?.name==='ChooseCardsPrompt'&&
       pending.playerId===player.id&&
       pending.message==='CHOOSE_CARD_TO_DISCARD'){
      const choice=[flow.discard];
      if(!pending.cards?.cards?.includes(flow.discard)||
         !player.hand.cards.includes(flow.discard)||
         pending.validate(choice,state)!==true){
        audit.aborted={turn:state.turn,stage:flow.stage,
          reason:'NATIVE_QUICK_BALL_PRINTED_PAYMENT_REJECTED'};
        flow.stage='aborted';
        return prior.call(this,state);
      }
      flow.stage='search';
      return select(state,'native-quick-ball-discard',
        new ResolvePromptAction(pending.id,choice));
    }
    if(flow.stage==='search'&&
       pending?.constructor?.name==='ChooseCardsPrompt'&&
       pending.playerId===player.id&&
       pending.cards===player.deck&&
       pending.message==='CHOOSE_CARD_TO_HAND'){
      const target=pending.cards.cards.find(card=>card.name==='Trubbish');
      const valid=target?pending.validate([target],state)===true:false;
      audit.ownerK1TrubbishSearchAvailable=valid;
      if(!valid){
        audit.aborted={turn:state.turn,stage:flow.stage,
          reason:'REAL_OWNER_K1_TRUBBISH_UNAVAILABLE'};
        flow.stage='aborted';
        return prior.call(this,state);
      }
      flow.stage='bench';
      return select(state,'native-owner-deck-trubbish-search',
        new ResolvePromptAction(pending.id,[target]));
    }
    if(flow.stage==='bench'&&!pending){
      const index=freeBenchIndex(player);
      const cardIndex=player.hand.cards.findIndex(card=>
        card.name==='Trubbish');
      if(index<0||cardIndex<0){
        audit.aborted={turn:state.turn,stage:flow.stage,
          reason:'FOUND_TRUBBISH_BENCH_WINDOW_LOST'};
        flow.stage='aborted';
        return prior.call(this,state);
      }
      flow.stage='complete';
      audit.completed=true;
      return select(state,'bench-searched-trubbish',new PlayCardAction(
        player.id,cardIndex,
        {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index}));
    }
    return prior.call(this,state);
  };
  try{return {result:execute(),audit};}
  finally{SimpleTacticsAi.prototype.decodeNextAction=prior;}
}
module.exports={VERSION,quickToShakeK0Offer,withOriginalRank16QuickToShake};
