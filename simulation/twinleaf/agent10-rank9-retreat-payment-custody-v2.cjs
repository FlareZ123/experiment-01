'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const VERSION = 'agent10-native-retreat-automatic-and-prompt-card-custody-v2';

/**
 * Read-only native witness of physical owner Energy objects. Covers both
 * automatic single-Energy retreat fees and explicit ChooseEnergyPrompt fees.
 *
 * @template T
 * @param {() => T} execute
 * @param {{Store?: Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withRank9RetreatPaymentCustody(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const original=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const pending=new WeakMap();
  const receipts=[],errors=[];
  function makeReceipt(pre,post,route) {
    const electrodeStillBenched=post.bench.includes(pre.electrode);
    const retained=pre.energy.filter(c=>pre.electrode.energies.cards.includes(c));
    const discarded=pre.energy.filter(c=>post.discard.cards.includes(c));
    const newlyDiscarded=post.discard.cards.filter(c=>!pre.discard.includes(c));
    const missing=pre.energy.filter(c=>!retained.includes(c)&&!discarded.includes(c));
    const paidPrism=discarded.length===1&&
      discarded[0].fullName==='Prism Energy ASC';
    const correctTransfer=paidPrism&&newlyDiscarded.length===1&&
      newlyDiscarded[0]===discarded[0]&&missing.length===0&&
      retained.length===pre.energy.length-1;
    return {
      turn:pre.turn,ownerSeat:1,route,
      before:pre.energy.map(c=>c.fullName),
      retained:retained.map(c=>c.fullName),
      discarded:discarded.map(c=>c.fullName),
      newlyDiscarded:newlyDiscarded.map(c=>c.fullName),
      missing:missing.map(c=>c.fullName),
      sameCardReference:newlyDiscarded.length===1&&
        discarded.length===1&&newlyDiscarded[0]===discarded[0],
      electrodeStillBenched,
      megaAbsolIsActive:post.active.getPokemonCard?.()?.fullName===
        'Mega Absol ex M1L',
      identityReceipt:correctTransfer&&electrodeStillBenched&&
        post.active.getPokemonCard?.()?.fullName==='Mega Absol ex M1L',
      competitiveGameQualified:false
    };
  }
  function dispatch(action,...args) {
    const state=this.state,owner=state?.players?.[1];
    const kind=action?.constructor?.name;
    const sourceTurn=state?.activePlayer===1&&
      (state.turn===32||state.turn===42);
    const retreat=sourceTurn&&kind==='RetreatAction'&&
      owner?.active?.getPokemonCard?.()?.fullName==='Electrode-GX CES'&&
      Number.isSafeInteger(action.benchIndex)&&
      owner.bench?.[action.benchIndex]?.getPokemonCard?.()?.fullName===
        'Mega Absol ex M1L';
    const prompt=sourceTurn&&kind==='ResolvePromptAction'&&
      state.prompts?.some(p=>p.result===undefined&&
        p.constructor.name==='ChooseEnergyPrompt'&&p.playerId===owner.id);
    const before=retreat?{
      turn:state.turn,
      electrode:owner.active,
      energy:[...owner.active.energies.cards],
      discard:[...owner.discard.cards]
    }:null;
    const waiting=prompt?pending.get(this):null;
    try{
      const result=original.value.call(this,action,...args);
      if(before){
        const now=this.state.players[1];
        const stillPrompting=this.state.prompts.some(p=>p.result===undefined&&
          p.constructor.name==='ChooseEnergyPrompt'&&p.playerId===now.id);
        if(stillPrompting)pending.set(this,before);
        else receipts.push(makeReceipt(before,now,'automatic'));
      }
      if(waiting){
        pending.delete(this);
        receipts.push(makeReceipt(waiting,this.state.players[1],'selected-prompt'));
      }
      return result;
    }catch(error){
      if(before||waiting)errors.push({turn:state?.turn??null,kind,
        message:String(error?.message??error)});
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...original,value:dispatch});
  try{
    const result=execute();
    return {result,audit:{
      version:VERSION,receipts,errors,
      exactPhysicalPaymentCount:receipts.filter(r=>r.identityReceipt).length,
      actualSourceRootOnly:true,changesNativeDecisions:false,
      competitiveQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}
module.exports={VERSION,withRank9RetreatPaymentCustody};
