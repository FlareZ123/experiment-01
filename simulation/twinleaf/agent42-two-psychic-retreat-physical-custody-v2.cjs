'use strict';
const assert=require('node:assert/strict');
const VERSION='agent42-root-store-two-psychic-custody-v3';
const SOURCE='Shadow Rider Calyrex VMAX CRE';
const PSY='Psychic Energy ';
function capture(state,action){
  if(action?.constructor?.name!=='RetreatAction'||state?.turn<=1)return null;
  const seat=state.players?.findIndex(p=>p.id===action.clientId);
  if((seat!==0&&seat!==1)||state.activePlayer!==seat)return null;
  const owner=state.players[seat],source=owner.active,target=owner.bench?.[action.benchIndex];
  const sp=source?.getPokemonCard?.(),tp=target?.getPokemonCard?.();
  const payment=source?.energies?.cards,te=target?.energies?.cards;
  const tt=target?.tools?.cards,st=source?.tools?.cards;
  if(sp?.fullName!==SOURCE||!tp||source===target||sp===tp||
    !Array.isArray(payment)||payment.length!==2||
    payment.some(c=>!c.fullName?.startsWith(PSY))||payment[0]===payment[1]||
    !Array.isArray(te)||te.length===0||!Array.isArray(tt)||
    !Array.isArray(st)||st.length!==0||owner.retreatedTurn===state.turn||
    !Array.isArray(owner.discard?.cards)||
    state.prompts?.some(p=>p.result===undefined))return null;
  return {seat,turn:state.turn,benchIndex:action.benchIndex,source,sp,
    target,tp,payment:[...payment],te:[...te],tt:[...tt],
    discard:[...owner.discard.cards]};
}
function settle(b,state){
  const o=state?.players?.[b.seat];
  if(!o||state.prompts?.some(p=>p.result===undefined))
    return {status:'UNSETTLED_OR_MISSING_OWNER'};
  const nd=o.discard.cards.filter(c=>!b.discard.includes(c));
  const exact=b.payment.every(c=>o.discard.cards.includes(c))&&
    nd.length===2&&nd.every(c=>b.payment.includes(c));
  const slots=[o.active,...(o.bench??[])];
  const absent=b.payment.every(c=>slots.every(s=>
    !s?.energies?.cards?.includes(c)&&!s?.cards?.includes(c)));
  const promoted=o.active===b.target&&o.bench?.[b.benchIndex]===b.source&&
    o.active.getPokemonCard()===b.tp&&b.source.getPokemonCard()===b.sp;
  const e=o.active?.energies?.cards??[],t=o.active?.tools?.cards??[];
  const energySame=e.length===b.te.length&&b.te.every(c=>e.includes(c));
  const toolsSame=t.length===b.tt.length&&b.tt.every(c=>t.includes(c));
  const physical=exact&&absent&&promoted&&energySame&&toolsSame&&
    o.retreatedTurn===b.turn&&b.source.energies.cards.length===0;
  const rooted=b.rootStoreRegistered===true&&
    Number.isSafeInteger(b.rootActionOrdinal)&&
    b.rootActionSeat===b.seat&&b.rootActionTurn===b.turn;
  const confirmed=physical&&rooted;
  return {status:confirmed?'EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT':
    physical?'PHYSICAL_PAYMENT_UNROOTED':'PAYMENT_OR_PROMOTION_UNVERIFIED',
    turn:b.turn,sourceSeat:b.seat,benchIndex:b.benchIndex,
    rootStoreRegistered:b.rootStoreRegistered===true,
    rootActionOrdinal:b.rootActionOrdinal??null,
    rootActionSeat:b.rootActionSeat??null,rootActionTurn:b.rootActionTurn??null,
    sourcePrinting:b.sp.fullName,targetPrinting:b.tp.fullName,
    targetEnergyCount:b.te.length,targetEnergyPrintings:b.te.map(c=>c.fullName),
    exactPhysicalPayment:exact,exactPhysicalPromotion:promoted,
    paidCardsAbsentFromBoard:absent,targetEnergyUnchanged:energySame,
    targetToolsUnchanged:toolsSame,physicalPaymentEvidence:physical,
    physicalPaymentObjectCustodyConfirmed:confirmed,paperWholeGameQualified:false};
}
function withTwoPsychicRetreatCustody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(require('node:path').resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const desc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof desc?.value,'function');
  const real=new WeakSet(),pending=new WeakMap(),done=new WeakMap();
  const receipts=[],errors=[];let attempts=0,stores=0,rootCallbacks=0;
  const callbacks={
    onRootStoreCreated(store){real.add(store);stores++;},
    onRootActionDispatched(store,action,ordinal,seat,turn){
      if(!real.has(store)||!Number.isSafeInteger(ordinal))return;
      rootCallbacks++;
      const b=pending.get(store);
      if(b&&b.action===action)Object.assign(b,{
        rootActionOrdinal:ordinal,rootActionSeat:seat,rootActionTurn:turn
      });
      const r=done.get(action);
      if(r){
        Object.assign(r,{rootActionOrdinal:ordinal,rootActionSeat:seat,
          rootActionTurn:turn});
        const rooted=r.rootStoreRegistered&&r.sourceSeat===seat&&r.turn===turn;
        r.physicalPaymentObjectCustodyConfirmed=
          r.physicalPaymentEvidence===true&&rooted;
        r.status=r.physicalPaymentObjectCustodyConfirmed?
          'EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT':
          r.physicalPaymentEvidence?'PHYSICAL_PAYMENT_UNROOTED':
            'PAYMENT_OR_PROMOTION_UNVERIFIED';
      }
    }
  };
  function check(store){
    const b=pending.get(store);
    if(!b||store.state?.prompts?.some(p=>p.result===undefined))return;
    const r=settle(b,store.state);receipts.push(r);done.set(b.action,r);
    pending.delete(store);
  }
  function witness(action,...args){
    if(!real.has(this))return desc.value.apply(this,[action,...args]);
    const b=capture(this.state,action);
    if(b){Object.assign(b,{action,rootStoreRegistered:true,
      rootActionOrdinal:null,rootActionSeat:null,rootActionTurn:null});
      pending.set(this,b);attempts++;}
    try{const result=desc.value.apply(this,[action,...args]);check(this);return result;}
    catch(error){
      if(b||pending.has(this)){errors.push({turn:this.state?.turn??null,
        reason:String(error?.message??error)});pending.delete(this);}
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...desc,value:witness});
  try{
    const result=execute(callbacks);
    const exact=receipts.filter(x=>
      x.status==='EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT').length;
    const unrooted=receipts.filter(x=>x.physicalPaymentEvidence===true&&
      x.physicalPaymentObjectCustodyConfirmed!==true).length;
    return {result,audit:{schema:VERSION,observerOnly:true,rootBoundStoreOnly:true,
      attempts,rootStoreRegistrations:stores,rootActionCallbacks:rootCallbacks,
      receipts,errors,exactPhysicalPaidRetreats:exact,
      unrootedPhysicalPaymentObservations:unrooted,
      pendingAtEnd:attempts-receipts.length-errors.length,
      competitiveQualifiedGames:0}};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,witness);
    Object.defineProperty(Store.prototype,'dispatch',desc);
  }
}
module.exports={VERSION,captureTwoPsychicRetreat:capture,
  settleTwoPsychicRetreat:settle,withTwoPsychicRetreatCustody};
