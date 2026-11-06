'use strict';
const assert=require('node:assert/strict');
const VERSION='agent42-two-psychic-any-target-custody-v2';
const SOURCE='Shadow Rider Calyrex VMAX CRE';
const PSY='Psychic Energy ';

function capture(state,action){
  if(action?.constructor?.name!=='RetreatAction'||state?.turn<=1)return null;
  const seat=state.players?.findIndex(p=>p.id===action.clientId);
  if((seat!==0&&seat!==1)||state.activePlayer!==seat)return null;
  const owner=state.players[seat],source=owner.active;
  const target=owner.bench?.[action.benchIndex];
  const sourcePokemon=source?.getPokemonCard?.();
  const targetPokemon=target?.getPokemonCard?.();
  const payment=source?.energies?.cards,targetEnergies=target?.energies?.cards;
  const targetTools=target?.tools?.cards,sourceTools=source?.tools?.cards;
  if(sourcePokemon?.fullName!==SOURCE||!targetPokemon||
     source===target||sourcePokemon===targetPokemon||
     !Array.isArray(payment)||payment.length!==2||
     payment.some(c=>!c.fullName?.startsWith(PSY))||payment[0]===payment[1]||
     !Array.isArray(targetEnergies)||targetEnergies.length===0||
     !Array.isArray(targetTools)||!Array.isArray(sourceTools)||
     sourceTools.length!==0||owner.retreatedTurn===state.turn||
     !Array.isArray(owner.discard?.cards)||
     state.prompts?.some(p=>p.result===undefined))return null;
  return {seat,turn:state.turn,benchIndex:action.benchIndex,source,
    sourcePokemon,target,targetPokemon,payment:[...payment],
    targetEnergies:[...targetEnergies],targetTools:[...targetTools],
    discard:[...owner.discard.cards]};
}

function settle(before,state){
  const owner=state?.players?.[before.seat];
  if(!owner||state.prompts?.some(p=>p.result===undefined))
    return {status:'UNSETTLED_OR_MISSING_OWNER'};
  const newDiscard=owner.discard.cards.filter(c=>!before.discard.includes(c));
  const exactPayment=before.payment.every(c=>owner.discard.cards.includes(c))&&
    newDiscard.length===2&&newDiscard.every(c=>before.payment.includes(c));
  const slots=[owner.active,...(owner.bench??[])];
  const absent=before.payment.every(c=>slots.every(s=>
    !s?.energies?.cards?.includes(c)&&!s?.cards?.includes(c)));
  const promoted=owner.active===before.target&&
    owner.bench?.[before.benchIndex]===before.source&&
    owner.active.getPokemonCard()===before.targetPokemon&&
    before.source.getPokemonCard()===before.sourcePokemon;
  const energies=owner.active?.energies?.cards??[];
  const tools=owner.active?.tools?.cards??[];
  const energySame=energies.length===before.targetEnergies.length&&
    before.targetEnergies.every(c=>energies.includes(c));
  const toolsSame=tools.length===before.targetTools.length&&
    before.targetTools.every(c=>tools.includes(c));
  const paid=exactPayment&&absent&&promoted&&energySame&&toolsSame&&
    owner.retreatedTurn===before.turn&&before.source.energies.cards.length===0;
  return {status:paid?'EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT':
      'PAYMENT_OR_PROMOTION_UNVERIFIED',
    turn:before.turn,sourceSeat:before.seat,benchIndex:before.benchIndex,
    sourcePrinting:before.sourcePokemon.fullName,
    targetPrinting:before.targetPokemon.fullName,
    targetEnergyCount:before.targetEnergies.length,
    targetEnergyPrintings:before.targetEnergies.map(c=>c.fullName),
    exactPhysicalPayment:exactPayment,exactPhysicalPromotion:promoted,
    paidCardsAbsentFromBoard:absent,targetEnergyUnchanged:energySame,
    targetToolsUnchanged:toolsSame,
    physicalPaymentObjectCustodyConfirmed:paid,paperWholeGameQualified:false};
}

function withTwoPsychicRetreatCustody(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(
    require('node:path').resolve(__dirname,
      '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const desc=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof desc?.value,'function');
  const pending=new WeakMap(),receipts=[],errors=[];
  let attempts=0;
  function check(store){
    const before=pending.get(store);
    if(!before||store.state?.prompts?.some(p=>p.result===undefined))return;
    receipts.push(settle(before,store.state));pending.delete(store);
  }
  function witness(action,...args){
    const before=capture(this.state,action);
    if(before){pending.set(this,before);attempts++;}
    try{const result=desc.value.apply(this,[action,...args]);check(this);return result;}
    catch(error){if(before||pending.has(this)){
      errors.push(String(error?.message??error));pending.delete(this);}throw error;}
  }
  Object.defineProperty(Store.prototype,'dispatch',{...desc,value:witness});
  try{
    const result=execute();
    const exactPhysicalPaidRetreats=receipts.filter(x=>
      x.status==='EXACT_TWO_PHYSICAL_PSYCHIC_PAID_RETREAT').length;
    return {result,audit:{schema:VERSION,observerOnly:true,attempts,
      receipts,errors,exactPhysicalPaidRetreats,
      pendingAtEnd:attempts-receipts.length-errors.length,
      competitiveQualifiedGames:0}};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,witness);
    Object.defineProperty(Store.prototype,'dispatch',desc);
  }
}
module.exports={VERSION,captureTwoPsychicRetreat:capture,
  settleTwoPsychicRetreat:settle,withTwoPsychicRetreatCustody};
