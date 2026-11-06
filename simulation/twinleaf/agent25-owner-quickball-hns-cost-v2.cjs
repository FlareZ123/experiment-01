'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {visibleHnsDiscardCount}=require('./agent25-dhelmise-compressor-donors.cjs');

const VERSION='agent25-owner-only-quickball-hns-cost-v2-staged';
const DONORS=Object.freeze(['Banette M5','Shuppet M5','Sinistcha M5']);
const QUICK_BALL=new Set(['Quick Ball SSH','Quick Ball FST']);
const COMPRESSOR='Battle Compressor PHF';
const DHELMISE='Dhelmise M5';

/**
 * Pure owner-information-only chooser. Order is a declared deterministic
 * heuristic: single-stage donor Banette, then Basic Shuppet, then Sinistcha.
 * This is neither a complete search policy nor a paper-legal turn oracle.
 * @param {{eligible:boolean,offered:string[],ownHand:string[],
 *   heldCompressor:boolean,hasDhelmise:boolean,visibleDiscard:number}} input
 * @returns {string|null} Selected owner's physically offered printing.
 */
function chooseHnsQuickBallCost(input){
  if(input.eligible!==true||input.heldCompressor!==true||
     input.hasDhelmise!==true||input.visibleDiscard>=4||
     input.visibleDiscard<0) return null;
  if(!Array.isArray(input.offered)||!Array.isArray(input.ownHand))
    return null;
  for(const name of DONORS){
    if(input.offered.includes(name)&&input.ownHand.includes(name))
      return name;
  }
  return null;
}

/**
 * Positive classifier requiring actual owner-held Quick Ball hand payment.
 * This function sees no opponent hand, future cards or own undealt deck.
 * @param {object} state Native State; current player identities matter
 * @param {0|1} seat Candidate's physical seat
 * @returns {{prompt:object,card:object,owner:object,ownDiscardCount:number}|null}
 */
function ownerBallDonorOpportunity(state,seat){
  assert.ok(seat===0||seat===1);
  const owner=state?.players?.[seat];
  if(!owner||state.activePlayer!==seat)return null;
  const prompt=state.prompts?.find(p=>p.result===undefined);
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
      prompt.playerId!==owner.id||
      prompt.message!=='CHOOSE_CARD_TO_DISCARD'||
      owner.supporter?.cards?.filter(c=>QUICK_BALL.has(c.fullName)).length!==1||
      prompt.options?.min!==1||prompt.options?.max!==1||
      prompt.options?.allowCancel!==false)return null;
  const offered=prompt.cards?.cards;
  if(!Array.isArray(offered)||!offered.length||
      offered.some(card=>!owner.hand.cards.includes(card)))return null;
  const heldCompressor=owner.hand.cards.some(c=>c.fullName===COMPRESSOR);
  const hasDhelmise=[owner.active,...owner.bench]
    .some(slot=>slot.getPokemonCard()?.fullName===DHELMISE)||
    owner.hand.cards.some(c=>c.fullName===DHELMISE);
  const visibleDiscard=visibleHnsDiscardCount(owner);
  const name=chooseHnsQuickBallCost({
    eligible:true,offered:offered.map(c=>c.fullName),
    ownHand:owner.hand.cards.map(c=>c.fullName),
    heldCompressor,hasDhelmise,visibleDiscard
  });
  if(!name)return null;
  const card=offered.find(c=>c.fullName===name);
  if(!card||prompt.validate([card],state)!==true)return null;
  return {prompt,card,owner,ownDiscardCount:visibleDiscard};
}

/**
 * Reversible actual SimpleTacticsAi prompt choice, scoped to one original
 * physical candidate. Does not compel a Quick Ball root. Tracks only genuine
 * Store acceptance and whether the same physical card entered owner discard.
 * @template T
 * @param {0|1} seat Physical candidate seat
 * @param {()=>T} execute Synchronous pinned real Store match
 * @param {{SimpleTacticsAi?:Function,Store?:Function,ResolvePromptAction?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerHnsQuickBallCost(seat,execute,deps={}){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(base,name));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??load('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const oldDecoder=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldDecoder?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  let realStore=null;
  const pending=new WeakMap();
  const audit={version:VERSION,seat,eligible:0,selected:0,accepted:0,
    physicallyMoved:0,errored:0,invalidated:0,nonliveIgnored:0,
    decisions:[],policyDoesNotReadOpponentPrivateCards:true,
    compelsQuickBallRoot:false,competitiveQualifiedGames:0};
  function select(state){
    if(state!==realStore?.state){
      audit.nonliveIgnored++;
      return oldDecoder.value.call(this,state);
    }
    if(this.client?.id!==state.players?.[seat]?.id)
      return oldDecoder.value.call(this,state);
    const hit=ownerBallDonorOpportunity(state,seat);
    if(!hit)return oldDecoder.value.call(this,state);
    audit.eligible++;
    const action=new ResolvePromptAction(hit.prompt.id,[hit.card]);
    const record={
      seat,turn:state.turn,promptId:hit.prompt.id,
      printing:hit.card.fullName,cardId:hit.card.id,
      visibleDiscardBefore:hit.ownDiscardCount
    };
    pending.set(action,{record,physical:hit.card,ownerId:hit.owner.id});
    audit.selected++;
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!realStore)
      realStore=this;
    const chosen=this===realStore?pending.get(action):null;
    if(!chosen)return oldDispatch.value.call(this,action,...args);
    try{
      const output=oldDispatch.value.call(this,action,...args);
      audit.accepted++;
      const player=this.state.players.find(p=>p.id===chosen.ownerId);
      const moved=player?.discard.cards.includes(chosen.physical)===true;
      if(moved)audit.physicallyMoved++;
      else audit.invalidated++;
      if(audit.decisions.length<64)audit.decisions.push({
        ...chosen.record,storeAccepted:true,physicalMovedToDiscard:moved
      });
      return output;
    }catch(error){
      audit.errored++;
      if(audit.decisions.length<64)audit.decisions.push({
        ...chosen.record,storeAccepted:false,
        error:String(error?.message??error)
      });
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...oldDecoder,value:select});
  Object.defineProperty(Store.prototype,'dispatch',
    {...oldDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,select);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldDecoder);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
  }
}

module.exports={VERSION,DONORS,chooseHnsQuickBallCost,
  ownerBallDonorOpportunity,withOwnerHnsQuickBallCost};
