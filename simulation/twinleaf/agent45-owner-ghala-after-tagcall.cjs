'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent45-owner-ghala-after-actual-tagcall-v1';
const TAG='Tag Call CEC',HALA='Guzma & Hala CEC';

const STADIUMS=[
  'Thunder Mountain Prism Star LOT',
  'Wondrous Labyrinth Prism Star TEU',
  'Chaotic Swell CEC'
];
const SPECIAL_ENERGY=[
  'Double Colorless Energy SUM',
  'Double Colorless Energy FCO',
  'Speed Lightning Energy RCL',
  'Double Dragon Energy ROS',
  'Prism Energy NVI'
];
const TOOLS=[
  'Handheld Fan TWM','Stealthy Hood UNB','Float Stone BKT',
  'Float Stone PLF','Air Balloon SSH'
];

/**
 * A heuristic cost ordering only, not a proof of disposable-card value.
 * Every selected physical card comes from the actor's hand.
 * @param {object} card Genuine owner hand card.
 * @param {string[]} knownOwnerList Owner's registered printed 60.
 * @param {number} turn Global native turn.
 * @returns {number}
 */
function discardPenalty(card,knownOwnerList,turn){
  const printing=card.fullName??'';
  const copies=knownOwnerList.filter(x=>x===printing).length;
  if(printing===TAG)return 0;
  if(printing==='Battle VIP Pass FST'&&turn>2)return 0;
  if(printing==='Trainers\' Mail ROS')return 6;
  if(printing==='Battle VIP Pass FST')return 9;
  if(printing==='Guzma & Hala CEC')return 25;
  if(/Prism Star|ACE SPEC|Computer Search|Secret Box/i.test(printing))
    return 1000;
  if(/Double Colorless Energy|Thunder Mountain|Double Dragon Energy/i.test(printing))
    return 250;
  if(copies>=3)return 16;
  if(copies===2)return 28;
  return 60;
}

/**
 * Select at most 2 owner's hand cards with bounded opportunity cost. This
 * is an explicit development heuristic, never an automatic claim of
 * strategic dominance or universally high discard-capable index.
 * @param {object[]} cards Prompt's genuine physical owner hand cards.
 * @param {string[]} knownOwnerList Owner's printed 60.
 * @param {number} globalTurn Native turn.
 * @returns {object[]}
 */
function selectTwoDiscardables(cards,knownOwnerList,globalTurn){
  return cards
    .map((card,i)=>({card,i,score:discardPenalty(card,knownOwnerList,
      globalTurn)}))
    .filter(x=>x.score<=40)
    .sort((a,b)=>a.score-b.score||a.i-b.i)
    .slice(0,2)
    .map(x=>x.card);
}

/**
 * Only read the owner's deck after a native own-deck prompt has opened.
 * Prefer Stadium, Special Energy, then Tool from the registered printings;
 * the native prompt's validator decides which particular category
 * combination is allowed and supports partial searches.
 *
 * @param {object} prompt Genuine native own deck ChooseCardsPrompt.
 * @param {object} state Native state, for prompt.validate only.
 * @param {0|1} mode 1 = paid search, 0 = Stadium-only.
 */
function selectAuthorizedHalaSearch(prompt,state,mode){
  const available=prompt.cards.cards;
  const find=names=>names.map(name=>available.find(card=>
    card.fullName===name)).find(Boolean)??null;
  const picks=[
    find(STADIUMS),
    ...(mode===1?[find(SPECIAL_ENERGY),find(TOOLS)]:[])
  ].filter(Boolean);
  let chosen=null;
  for(let count=picks.length;count>=0&&chosen===null;count--){
    for(let mask=0;mask<(1<<picks.length);mask++){
      const cards=picks.filter((_,i)=>Boolean(mask&(1<<i)));
      if(cards.length!==count)continue;
      if(prompt.validate(cards,state)){
        chosen=cards;
        break;
      }
    }
  }
  return chosen;
}

/**
 * Native, source-independent follow-up after a real Tag Call from hand
 * genuinely fetched G&H from this player's deck. Unlike a free-form
 * hypergraph path, each transition must originate from a Store-dispatched
 * card and authentic new owner prompt.
 *
 * This wrapper is intended INSIDE the existing Agent6 Tag Call selector.
 * The outer selector chooses whether to use actual Tag Call. Here we only
 * attempt subsequent Supporter use when a fresh real Tag Call actually
 * added G&H to the owner's hand. The chosen search and discards are
 * developmental tactics and do not make a match competitive-qualified.
 *
 * @template T
 * @param {string[][]} registered Own printed sixty for physical seats 0/1.
 * @param {()=>T} execute Synchronous native match.
 * @param {object} [deps] Pinned native injection for tests.
 * @returns {{result:T,audit:object}}
 */
function withNativeHalaAfterActualTagCall(registered,execute,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(Array.isArray(registered)&&registered.length===2&&
    registered.every(cards=>Array.isArray(cards)&&cards.length===60&&
      cards.every(printing=>typeof printing==='string')));
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const native=file=>require(path.join(output,file));
  const Ai=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const Phase=deps.GamePhase??native('game/store/state/state').GamePhase;
  const play=deps.playActions??native('game/store/actions/play-card-action');
  const Resolve=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const beforeBot=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const beforeStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeBot?.value,'function');
  assert.equal(typeof beforeStore?.value,'function');
  let live=null;
  const byOwner=new Map(),issued=new WeakMap();
  const audit={
    version:VERSION,physicalStores:0,
    printedTagCallRootsAccepted:0,
    tagCallGuzmaHalaSearchAccepted:0,
    actualGHPhysicalHandGains:0,
    eligibleGHFollowupRoots:0,
    proposedGHSupporterRoots:0,
    nativeGHSupporterRootsAccepted:0,
    modeChoiceAccepted:{free:0,paid:0},
    physicalTwoCardPayments:0,
    otherPaymentAccepted:0,
    ownerDeckSearchAccepted:0,
    physicalRetrievedCards:0,
    sourceIndependentBothSeats:true,
    rejectedNativeProposals:0,
    nativeSourceActionErrors:[],
    boundedEvents:[],paperPlayableLineProven:false,
    competitiveGamesQualified:0
  };
  const log=row=>{
    if(audit.boundedEvents.length<24)audit.boundedEvents.push(row);
  };
  const ownerById=id=>live?.state?.players?.find(p=>p.id===id);
  function noticePayment(token){
    if(!token?.payment||token.payment.proven)return;
    const owner=ownerById(token.id);
    const cards=token.payment.cards;
    if(!owner)return;
    const confirmed=cards.every(c=>
      !owner.hand.cards.includes(c)&&
      (owner.discard.cards.includes(c)||owner.lostzone.cards.includes(c)));
    if(confirmed){
      token.payment.proven=true;
      audit.physicalTwoCardPayments++;
      log({kind:'two-card-physical-payment',seat:token.seat,
        globalTurn:token.turn});
    }
  }

  function dispatch(action,...rest){
    const name=action?.constructor?.name;
    if(name==='AddPlayerAction'&&this!==live){
      live=this;byOwner.clear();audit.physicalStores++;
    }
    const state=this.state;
    const actual=this===live;
    const seat=actual&&name==='PlayCardAction'?
      state.players.findIndex(p=>p.id===action.id):-1;
    const owner=seat>=0?state.players[seat]:null;
    const played=owner?.hand?.cards?.[action.handIndex]??null;
    const isTag=played?.fullName===TAG;
    const ghRoot=issued.get(action)?.kind==='gh-root'?
      issued.get(action):null;
    const pending=actual&&name==='ResolvePromptAction'?
      state.prompts?.find(p=>p.id===action.id&&p.result===undefined):null;
    const token=pending?byOwner.get(pending.playerId):null;
    const resolution=issued.get(action)??null;
    const beforeTagPromptIds=isTag?
      new Set((state.prompts??[]).map(p=>p.id)):null;
    const beforeTagHandCount=isTag?
      owner.hand.cards.filter(c=>c.fullName===HALA).length:0;
    const beforeResolutionHand=token?
      ownerById(token.id)?.hand.cards.length:0;
    let result;
    try{
      result=beforeStore.value.call(this,action,...rest);
    }catch(error){
      if(ghRoot||resolution?.kind?.startsWith('gh-')){
        audit.rejectedNativeProposals++;
        audit.nativeSourceActionErrors.push({
          kind:resolution?.kind??'gh-root',
          seat:resolution?.seat??ghRoot?.seat,
          message:String(error?.message??error).slice(0,300)
        });
      }
      throw error;
    }
    if(!actual)return result;
    if(isTag){
      const created=(this.state.prompts??[]).find(p=>
        !beforeTagPromptIds.has(p.id)&&
        p.result===undefined&&p.playerId===owner.id&&
        p.cards===owner.deck&&p.message==='CHOOSE_CARD_TO_HAND'&&
        p.constructor?.name==='ChooseCardsPrompt');
      audit.printedTagCallRootsAccepted++;
      if(created){
        byOwner.set(owner.id,{
          id:owner.id,seat,turn:this.state.turn,
          stage:'tag-search',tagPromptId:created.id,
          preGHHandCount:beforeTagHandCount
        });
        log({kind:'source-tag-call-root',seat,globalTurn:this.state.turn});
      }
    }
    if(pending&&token&&token.stage==='tag-search'&&
       pending.id===token.tagPromptId&&
       pending.cards===ownerById(token.id)?.deck&&
       Array.isArray(action.result)&&action.result.some(c=>
         c?.fullName===HALA)){
      audit.tagCallGuzmaHalaSearchAccepted++;
      const current=ownerById(token.id);
      if(current.hand.cards.filter(c=>c.fullName===HALA).length>
        token.preGHHandCount){
        audit.actualGHPhysicalHandGains++;
        token.stage='ready';
        log({kind:'tag-call-gh-into-hand',seat:token.seat,
          globalTurn:token.turn});
      }
    }
    if(ghRoot){
      audit.nativeGHSupporterRootsAccepted++;
      const current=ownerById(ghRoot.id);
      const newPrompt=(this.state.prompts??[]).find(p=>
        p.playerId===ghRoot.id&&p.result===undefined&&
        p.constructor?.name==='SelectOptionPrompt');
      const currentToken=byOwner.get(ghRoot.id);
      if(currentToken&&newPrompt){
        currentToken.stage='mode';
        currentToken.modePromptId=newPrompt.id;
      }else if(currentToken){
        currentToken.stage='failure';
      }
      log({kind:'actual-gh-supporter-root',seat:ghRoot.seat,
        globalTurn:this.state.turn,modePromptOpened:Boolean(newPrompt)});
    }
    if(resolution?.kind==='gh-mode'&&token){
      const current=ownerById(token.id);
      token.mode=resolution.mode;
      if(resolution.mode===1){
        const promptNow=this.state.prompts?.find(p=>
          p.result===undefined&&p.playerId===token.id&&
          p.message==='CHOOSE_CARD_TO_DISCARD'&&
          p.constructor?.name==='ChooseCardsPrompt');
        token.stage=promptNow?'payment':'failure';
        token.paymentPromptId=promptNow?.id??null;
        audit.modeChoiceAccepted.paid++;
      }else{
        const promptNow=this.state.prompts?.find(p=>
          p.result===undefined&&p.playerId===token.id&&
          p.cards===current?.deck&&
          p.message==='CHOOSE_CARD_TO_HAND');
        token.stage=promptNow?'search':'failure';
        token.searchPromptId=promptNow?.id??null;
        audit.modeChoiceAccepted.free++;
      }
    }
    if(resolution?.kind==='gh-payment'&&token){
      token.payment={cards:resolution.cards,proven:false};
      audit.otherPaymentAccepted++;
      const current=ownerById(token.id);
      const now=this.state.prompts?.find(p=>
        p.result===undefined&&p.playerId===token.id&&
        p.cards===current?.deck&&
        p.message==='CHOOSE_CARD_TO_HAND');
      token.stage=now?'search':'failure';
      token.searchPromptId=now?.id??null;
    }
    if(resolution?.kind==='gh-search'&&token){
      const current=ownerById(token.id);
      const moved=resolution.cards.filter(card=>
        current?.hand?.cards?.includes(card)&&
        !current.deck.cards.includes(card)).length;
      audit.ownerDeckSearchAccepted++;
      audit.physicalRetrievedCards+=moved;
      token.stage='done';
      log({kind:'gh-owner-deck-search',seat:token.seat,
        globalTurn:this.state.turn,selected:resolution.cards.length,
        physicalMoved:moved});
    }
    if(token)noticePayment(token);
    if(ghRoot)noticePayment(byOwner.get(ghRoot.id));
    return result;
  }

  function decode(state){
    if(state!==live?.state)return beforeBot.value.call(this,state);
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    if(seat<0)return beforeBot.value.call(this,state);
    const owner=state.players[seat];
    const token=byOwner.get(owner.id);
    if(!token||token.seat!==seat)
      return beforeBot.value.call(this,state);
    noticePayment(token);
    const pending=state.prompts?.find(p=>p.result===undefined);
    const ownPrompt=pending?.playerId===owner.id?pending:null;
    const answer=(kind,promptId,value,extras={})=>{
      const act=new Resolve(promptId,value);
      issued.set(act,{kind,id:owner.id,seat,...extras});
      return act;
    };

    if(token.stage==='mode'&&ownPrompt?.id===token.modePromptId&&
       ownPrompt.constructor?.name==='SelectOptionPrompt'){
      const eligible=selectTwoDiscardables(owner.hand.cards,
        registered[seat],state.turn);
      const usePaid=eligible.length===2&&
        ownPrompt.validate(1,state);
      const mode=usePaid?1:0;
      assert.ok(ownPrompt.validate(mode,state));
      return answer('gh-mode',ownPrompt.id,mode,{mode});
    }
    if(token.stage==='payment'&&
       ownPrompt?.id===token.paymentPromptId&&
       ownPrompt.message==='CHOOSE_CARD_TO_DISCARD'&&
       ownPrompt.cards===owner.hand){
      const chosen=selectTwoDiscardables(ownPrompt.cards.cards,
        registered[seat],state.turn);
      assert.equal(chosen.length,2,
        'G&H paid mode was selected without two preserved owner discardables');
      assert.ok(ownPrompt.validate(chosen,state));
      return answer('gh-payment',ownPrompt.id,chosen,{
        cards:[...chosen]
      });
    }
    if(token.stage==='search'&&
       ownPrompt?.id===token.searchPromptId&&
       ownPrompt.message==='CHOOSE_CARD_TO_HAND'&&
       ownPrompt.cards===owner.deck){
      const cards=selectAuthorizedHalaSearch(ownPrompt,state,token.mode);
      assert.ok(cards!==null,'G&H native owner-deck prompt invalidated every partial search');
      return answer('gh-search',ownPrompt.id,cards,{
        cards:[...cards]
      });
    }

    if(token.stage==='ready'&&
       !pending&&state.activePlayer===seat&&
       state.phase===Phase.PLAYER_TURN&&state.turn>=2&&
       owner.supporterTurn!==state.turn){
      const handIndex=owner.hand.cards.findIndex(c=>c.fullName===HALA);
      if(handIndex>=0){
        audit.eligibleGHFollowupRoots++;
        const action=new play.PlayCardAction(owner.id,handIndex,{
          player:play.PlayerType.ANY,
          slot:play.SlotType.BOARD,index:0
        });
        issued.set(action,{
          kind:'gh-root',id:owner.id,seat,turn:state.turn
        });
        token.stage='root-sent';
        audit.proposedGHSupporterRoots++;
        return action;
      }
    }
    return beforeBot.value.call(this,state);
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...beforeStore,value:dispatch
  });
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...beforeBot,value:decode
  });
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent45NativeGuzmaHalaAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',beforeBot);
    Object.defineProperty(Store.prototype,'dispatch',beforeStore);
  }
}

module.exports={
  VERSION,TAG,HALA,STADIUMS,SPECIAL_ENERGY,TOOLS,
  discardPenalty,selectTwoDiscardables,selectAuthorizedHalaSearch,
  withNativeHalaAfterActualTagCall
};
